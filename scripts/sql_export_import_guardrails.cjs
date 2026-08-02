#!/usr/bin/env node
/**
 * SQL export/import guardrails for mosc-temp.
 *
 * Phases:
 *   backup        Rotate timestamped copies of export/ordered/renumbered/PROD + canonical schema (keep N)
 *   post-export   Validate export.sql after pg_dump
 *   post-prepare  Validate ordered + renumbered (+ PROD if present) after reorder/PROD steps
 *   pre-import    Validate SQL files + schema CREATE TABLE vs INSERT columns before schema/data apply
 *   update-manifest  Refresh trackedTables + critical mins from a validated export.sql
 *
 * Exit 0 = OK, 1 = FAIL (batch must stop), 2 = OK with warnings only (still exit 0 unless --strict-warnings)
 *
 * Usage:
 *   node scripts/sql_export_import_guardrails.cjs backup [--sqls-dir PATH] [--keep 5]
 *   node scripts/sql_export_import_guardrails.cjs post-export [--sqls-dir PATH]
 *   node scripts/sql_export_import_guardrails.cjs post-prepare [--sqls-dir PATH]
 *   node scripts/sql_export_import_guardrails.cjs pre-import [--sqls-dir PATH] [--import-file PATH]
 *   node scripts/sql_export_import_guardrails.cjs update-manifest [--sqls-dir PATH]
 */

const fs = require('fs');
const path = require('path');

const INSERT_RE = /INSERT\s+INTO\s+public\.([a-zA-Z0-9_]+)\s*\(([^)]*)\)/gi;
const CONFLICT_RE = /^(<<<<<<<|=======|>>>>>>>)/m;

function parseArgs(argv) {
  const out = { cmd: null, sqlsDir: null, keep: null, importFile: null, strictWarnings: false };
  const args = argv.slice(2);
  if (!args.length) return out;
  out.cmd = args[0];
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--sqls-dir' && args[i + 1]) {
      out.sqlsDir = args[++i];
    } else if (a.startsWith('--sqls-dir=')) {
      out.sqlsDir = a.slice('--sqls-dir='.length);
    } else if (a === '--keep' && args[i + 1]) {
      out.keep = Number(args[++i]);
    } else if (a.startsWith('--keep=')) {
      out.keep = Number(a.slice('--keep='.length));
    } else if (a === '--import-file' && args[i + 1]) {
      out.importFile = args[++i];
    } else if (a.startsWith('--import-file=')) {
      out.importFile = a.slice('--import-file='.length);
    } else if (a === '--strict-warnings') {
      out.strictWarnings = true;
    }
  }
  return out;
}

function resolveSqlsDir(cliDir) {
  if (cliDir) return path.resolve(cliDir);
  // scripts/ -> mosc-temp/code_html_template/SQLS
  return path.resolve(__dirname, '..', 'code_html_template', 'SQLS');
}

function loadManifest(sqlsDir) {
  const manifestPath = path.join(sqlsDir, 'guardrails', 'sql_export_import_guardrails.manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest not found: ${manifestPath}`);
  }
  return { manifest: JSON.parse(fs.readFileSync(manifestPath, 'utf8')), manifestPath };
}

function absFromSqls(sqlsDir, relativePath) {
  return path.join(sqlsDir, ...relativePath.split(/[/\\]/));
}

function analyzeSqlFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return { exists: false, path: filePath };
  }
  const stat = fs.statSync(filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const counts = Object.create(null);
  const columnsByTable = Object.create(null);
  let m;
  INSERT_RE.lastIndex = 0;
  while ((m = INSERT_RE.exec(text)) !== null) {
    const table = m[1].toLowerCase();
    counts[table] = (counts[table] || 0) + 1;
    if (!columnsByTable[table]) {
      columnsByTable[table] = m[2]
        .split(',')
        .map((c) => c.trim().replace(/^"|"$/g, '').toLowerCase())
        .filter(Boolean);
    }
  }
  const tables = Object.keys(counts);
  const totalInserts = tables.reduce((s, t) => s + counts[t], 0);
  return {
    exists: true,
    path: filePath,
    bytes: stat.size,
    counts,
    columnsByTable,
    tables,
    totalInserts,
    distinctTables: tables.length,
    hasConflictMarkers: CONFLICT_RE.test(text),
  };
}

function parseSchemaCreateColumns(schemaPath) {
  if (!fs.existsSync(schemaPath)) return {};
  const text = fs.readFileSync(schemaPath, 'utf8');
  const byTable = Object.create(null);
  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?public\.([a-zA-Z0-9_]+)\s*\(([\s\S]*?)\);/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const table = m[1].toLowerCase();
    const body = m[2];
    const cols = [];
    for (const line of body.split('\n')) {
      const trimmed = line.trim().replace(/,$/, '');
      if (!trimmed || /^CONSTRAINT\b/i.test(trimmed) || /^CHECK\b/i.test(trimmed) || /^PRIMARY\b/i.test(trimmed) || /^UNIQUE\b/i.test(trimmed) || /^FOREIGN\b/i.test(trimmed) || /^REFERENCES\b/i.test(trimmed)) {
        continue;
      }
      // Support quoted identifiers: "location" varchar(...)
      const colMatch = trimmed.match(/^"?([a-zA-Z0-9_]+)"?\s+/i);
      if (colMatch) cols.push(colMatch[1].toLowerCase());
    }
    byTable[table] = cols;
  }
  return byTable;
}

function pushIssue(issues, level, message) {
  issues.push({ level, message });
  const tag = level === 'FAIL' ? 'FAIL' : level === 'WARN' ? 'WARN' : 'OK';
  console.log(` [GUARDRAIL ${tag}] ${message}`);
}

function validateFileAgainstSpec(label, analysis, spec, issues) {
  if (!analysis.exists) {
    pushIssue(issues, 'FAIL', `${label}: file missing (${analysis.path})`);
    return;
  }
  if (analysis.hasConflictMarkers) {
    pushIssue(issues, 'FAIL', `${label}: unresolved git conflict markers found`);
  }
  if (spec.minBytes != null && analysis.bytes < spec.minBytes) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: size ${analysis.bytes} bytes < min ${spec.minBytes} (possible truncated/corrupt dump)`
    );
  }
  if (spec.minTotalInserts != null && analysis.totalInserts < spec.minTotalInserts) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: total INSERTs ${analysis.totalInserts} < min ${spec.minTotalInserts}`
    );
  }
  if (spec.minDistinctTables != null && analysis.distinctTables < spec.minDistinctTables) {
    pushIssue(
      issues,
      'FAIL',
      `${label}: distinct tables ${analysis.distinctTables} < min ${spec.minDistinctTables}`
    );
  }
  console.log(
    ` [GUARDRAIL OK] ${label}: ${analysis.bytes} bytes, ${analysis.totalInserts} INSERTs, ${analysis.distinctTables} tables`
  );
}

function validateCriticalAndTracked(label, analysis, manifest, issues) {
  if (!analysis.exists) return;
  const critical = manifest.criticalTables || {};
  for (const [table, minCount] of Object.entries(critical)) {
    if (table.startsWith('_')) continue;
    const count = analysis.counts[table] || 0;
    if (count < minCount) {
      pushIssue(
        issues,
        'FAIL',
        `${label}: critical table "${table}" has ${count} INSERT(s), required >= ${minCount}`
      );
    }
  }

  const tracked = manifest.trackedTables || [];
  const present = new Set(analysis.tables);
  const missingTracked = tracked.filter((t) => !present.has(t));
  if (missingTracked.length) {
    const level = manifest.failOnMissingTrackedTables ? 'FAIL' : 'WARN';
    pushIssue(
      issues,
      level,
      `${label}: ${missingTracked.length} tracked table(s) have zero INSERTs: ${missingTracked.slice(0, 12).join(', ')}${missingTracked.length > 12 ? ', ...' : ''}`
    );
  }

  const known = new Set([...tracked, ...Object.keys(critical).filter((k) => !k.startsWith('_'))]);
  const unknown = analysis.tables.filter((t) => !known.has(t));
  if (unknown.length) {
    const level = manifest.failOnUnknownTables ? 'FAIL' : 'WARN';
    pushIssue(
      issues,
      level,
      `${label}: ${unknown.length} new/untracked table(s): ${unknown.join(', ')} — run update-manifest after confirming export is good`
    );
  }
}

function resolveSchemaSyncTables(manifest, sqlAnalysis) {
  const raw = manifest.schemaColumnSyncTables;
  if (!raw || raw.length === 0 || raw.includes('*') || raw.includes('all')) {
    return [...(sqlAnalysis.tables || [])].sort();
  }
  return raw;
}

function validateSchemaColumnSync(sqlAnalysis, schemaCols, tables, issues, schemaLabel) {
  if (!sqlAnalysis.exists) return;
  const label = schemaLabel || 'Event_Site_Manager_Latest_Schema.sql';
  let checked = 0;
  for (const table of tables) {
    const insertCols = sqlAnalysis.columnsByTable[table];
    if (!insertCols || !insertCols.length) {
      pushIssue(issues, 'WARN', `schema sync: no INSERT sample for "${table}"`);
      continue;
    }
    const createCols = schemaCols[table];
    if (!createCols || !createCols.length) {
      pushIssue(
        issues,
        'FAIL',
        `schema sync: table "${table}" has INSERTs but no CREATE TABLE in ${label} — update canonical schema`
      );
      continue;
    }
    const createSet = new Set(createCols);
    const missing = insertCols.filter((c) => !createSet.has(c));
    if (missing.length) {
      pushIssue(
        issues,
        'FAIL',
        `schema sync: "${table}" INSERT columns missing from ${label}: ${missing.join(', ')}`
      );
    } else {
      checked += 1;
    }
  }
  console.log(` [GUARDRAIL OK] schema sync: ${checked}/${tables.length} table(s) INSERT cols ⊆ CREATE TABLE`);
}

function summarizeAndExit(issues, strictWarnings) {
  const fails = issues.filter((i) => i.level === 'FAIL');
  const warns = issues.filter((i) => i.level === 'WARN');
  console.log('');
  console.log(` Guardrail summary: ${fails.length} FAIL, ${warns.length} WARN`);
  if (fails.length) {
    console.log(' Guardrails FAILED — fix export/schema/manifest before continuing import.');
    process.exit(1);
  }
  if (strictWarnings && warns.length) {
    console.log(' Guardrails failed due to --strict-warnings.');
    process.exit(1);
  }
  console.log(' Guardrails PASSED.');
  process.exit(0);
}

function backupFiles(sqlsDir, keep) {
  const { manifest } = loadManifest(sqlsDir);
  const keepN = keep || manifest.backupKeep || 5;
  const backupRoot = path.join(sqlsDir, 'guardrails', 'backups');
  fs.mkdirSync(backupRoot, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  // Include canonical schema so Event_Site_Manager_Latest_Schema.sql also keeps last N stamped copies
  const keys = ['export.sql', 'ordered.sql', 'renumbered.sql', 'ordered_PROD.sql', 'schema.sql'];
  const copied = [];
  for (const key of keys) {
    const rel = manifest.files[key]?.relativePath;
    if (!rel) continue;
    const src = absFromSqls(sqlsDir, rel);
    if (!fs.existsSync(src)) {
      console.log(` [GUARDRAIL OK] backup skip (missing): ${rel}`);
      continue;
    }
    const base = path.basename(rel);
    const dest = path.join(backupRoot, `${stamp}__${base}`);
    fs.copyFileSync(src, dest);
    // Touch dest mtime so prune-by-mtime keeps the newest stamp even when copy preserves source mtime
    const now = new Date();
    fs.utimesSync(dest, now, now);
    copied.push(dest);
    console.log(` [GUARDRAIL OK] backed up -> ${path.relative(sqlsDir, dest)}`);
  }
  if (copied.length === 0) {
    throw new Error(
      `backup copied 0 files under ${backupRoot} — check SQLS paths in manifest (expected export/ordered/renumbered/PROD/schema)`
    );
  }

  // Auto-delete older than keepN per logical file basename
  const byBase = Object.create(null);
  for (const name of fs.readdirSync(backupRoot)) {
    const full = path.join(backupRoot, name);
    if (!fs.statSync(full).isFile()) continue;
    const m = name.match(/^\d{4}-\d{2}-\d{2}T.+?__(.+)$/);
    if (!m) continue;
    const base = m[1];
    if (!byBase[base]) byBase[base] = [];
    byBase[base].push({ name, full, mtime: fs.statSync(full).mtimeMs });
  }
  for (const [base, list] of Object.entries(byBase)) {
    list.sort((a, b) => b.mtime - a.mtime);
    const drop = list.slice(keepN);
    for (const d of drop) {
      fs.unlinkSync(d.full);
      console.log(` [GUARDRAIL OK] pruned old backup: ${d.name}`);
    }
    console.log(` [GUARDRAIL OK] retaining ${Math.min(list.length, keepN)} backup(s) for ${base}`);
  }
  return copied;
}

function cmdPostExport(sqlsDir, strictWarnings) {
  const { manifest } = loadManifest(sqlsDir);
  const issues = [];
  const exportPath = absFromSqls(sqlsDir, manifest.files['export.sql'].relativePath);
  const analysis = analyzeSqlFile(exportPath);
  validateFileAgainstSpec('export.sql', analysis, manifest.files['export.sql'], issues);
  validateCriticalAndTracked('export.sql', analysis, manifest, issues);
  summarizeAndExit(issues, strictWarnings);
}

function cmdPostPrepare(sqlsDir, strictWarnings) {
  const { manifest } = loadManifest(sqlsDir);
  const issues = [];
  for (const key of ['ordered.sql', 'renumbered.sql', 'ordered_PROD.sql']) {
    const spec = manifest.files[key];
    const analysis = analyzeSqlFile(absFromSqls(sqlsDir, spec.relativePath));
    // PROD may be absent mid-pipeline; only fail if missing when validating after step 3
    if (key === 'ordered_PROD.sql' && !analysis.exists) {
      pushIssue(issues, 'WARN', 'ordered_PROD.sql not present yet (OK mid-pipeline)');
      continue;
    }
    validateFileAgainstSpec(key, analysis, spec, issues);
    validateCriticalAndTracked(key, analysis, manifest, issues);
  }
  summarizeAndExit(issues, strictWarnings);
}

function cmdPreImport(sqlsDir, importFile, strictWarnings) {
  const { manifest } = loadManifest(sqlsDir);
  const issues = [];

  const schemaPath = absFromSqls(sqlsDir, manifest.files['schema.sql'].relativePath);
  const schemaSpec = manifest.files['schema.sql'];
  if (!fs.existsSync(schemaPath)) {
    pushIssue(issues, 'FAIL', `schema file missing: ${schemaPath}`);
  } else {
    const bytes = fs.statSync(schemaPath).size;
    if (bytes < (schemaSpec.minBytes || 0)) {
      pushIssue(issues, 'FAIL', `schema file too small: ${bytes} < ${schemaSpec.minBytes}`);
    } else {
      console.log(` [GUARDRAIL OK] schema.sql: ${bytes} bytes (${schemaPath})`);
    }
  }

  // Always validate export + ordered baselines when present
  const exportAnalysis = analyzeSqlFile(absFromSqls(sqlsDir, manifest.files['export.sql'].relativePath));
  for (const key of ['export.sql', 'ordered.sql']) {
    const spec = manifest.files[key];
    const analysis = key === 'export.sql' ? exportAnalysis : analyzeSqlFile(absFromSqls(sqlsDir, spec.relativePath));
    validateFileAgainstSpec(key, analysis, spec, issues);
    validateCriticalAndTracked(key, analysis, manifest, issues);
  }

  let importAnalysis = null;
  if (importFile) {
    const resolvedImport = path.resolve(importFile);
    importAnalysis = analyzeSqlFile(resolvedImport);
    const base = path.basename(resolvedImport).toLowerCase();
    const isFullDump =
      base === 'export.sql' ||
      base.includes('corrected_event_media_inserts.ordered') ||
      base.includes('corrected_event_media_inserts.renumbered') ||
      base.includes('ordered_prod');
    validateFileAgainstSpec(`import-file(${path.basename(resolvedImport)})`, importAnalysis, {
      minBytes: isFullDump ? 1000000 : 1000,
      minTotalInserts: isFullDump ? 1000 : 1,
      minDistinctTables: isFullDump ? 20 : 1,
    }, issues);
    // Tenant/MOSC partial dumps: do not enforce full critical table set on the import file itself
    if (isFullDump) {
      validateCriticalAndTracked(`import-file(${path.basename(resolvedImport)})`, importAnalysis, manifest, issues);
    } else {
      console.log(
        ` [GUARDRAIL OK] import-file is a partial/custom dump (${path.basename(resolvedImport)}); critical-table mins applied to export/ordered only`
      );
    }
  } else {
    // Prefer renumbered for local, else ordered
    const ren = analyzeSqlFile(absFromSqls(sqlsDir, manifest.files['renumbered.sql'].relativePath));
    const ord = analyzeSqlFile(absFromSqls(sqlsDir, manifest.files['ordered.sql'].relativePath));
    importAnalysis = ren.exists ? ren : ord;
    const key = ren.exists ? 'renumbered.sql' : 'ordered.sql';
    validateFileAgainstSpec(key, importAnalysis, manifest.files[key], issues);
    validateCriticalAndTracked(key, importAnalysis, manifest, issues);
  }

  const schemaCols = parseSchemaCreateColumns(schemaPath);
  const syncSource = exportAnalysis.exists ? exportAnalysis : importAnalysis;
  const syncTables = resolveSchemaSyncTables(manifest, syncSource);
  const schemaRel = manifest.files['schema.sql']?.relativePath || 'Current_Sqls/Event_Site_Manager_Latest_Schema.sql';
  validateSchemaColumnSync(syncSource, schemaCols, syncTables, issues, path.basename(schemaRel));

  summarizeAndExit(issues, strictWarnings);
}

function cmdUpdateManifest(sqlsDir) {
  const { manifest, manifestPath } = loadManifest(sqlsDir);
  const exportPath = absFromSqls(sqlsDir, manifest.files['export.sql'].relativePath);
  const analysis = analyzeSqlFile(exportPath);
  if (!analysis.exists) throw new Error(`export.sql not found: ${exportPath}`);
  if (analysis.hasConflictMarkers) throw new Error('export.sql has conflict markers — resolve before update-manifest');

  const sortedTables = [...analysis.tables].sort();
  manifest.trackedTables = sortedTables;
  manifest.updatedAt = new Date().toISOString().slice(0, 10);

  // Refresh critical mins to current counts (floor) for known critical keys only
  for (const table of Object.keys(manifest.criticalTables || {})) {
    if (table.startsWith('_')) continue;
    const count = analysis.counts[table] || 0;
    if (count > 0) {
      manifest.criticalTables[table] = count;
    }
  }

  // Nudge file floors to ~70% of current size/inserts
  const floor = (n, ratio = 0.7) => Math.max(1, Math.floor(n * ratio));
  manifest.files['export.sql'].minBytes = floor(analysis.bytes);
  manifest.files['export.sql'].minTotalInserts = floor(analysis.totalInserts);
  manifest.files['export.sql'].minDistinctTables = Math.max(20, floor(analysis.distinctTables, 0.85));

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(` [GUARDRAIL OK] updated manifest: ${manifestPath}`);
  console.log(` [GUARDRAIL OK] trackedTables=${sortedTables.length}, critical mins refreshed from export.sql`);
  process.exit(0);
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.cmd || ['-h', '--help', 'help'].includes(args.cmd)) {
    console.log(`Usage:
  node scripts/sql_export_import_guardrails.cjs backup [--sqls-dir PATH] [--keep 5]
  node scripts/sql_export_import_guardrails.cjs post-export [--sqls-dir PATH]
  node scripts/sql_export_import_guardrails.cjs post-prepare [--sqls-dir PATH]
  node scripts/sql_export_import_guardrails.cjs pre-import [--sqls-dir PATH] [--import-file PATH]
  node scripts/sql_export_import_guardrails.cjs update-manifest [--sqls-dir PATH]`);
    process.exit(args.cmd ? 0 : 1);
  }

  const sqlsDir = resolveSqlsDir(args.sqlsDir);
  if (!fs.existsSync(sqlsDir)) {
    console.error(`SQLS dir not found: ${sqlsDir}`);
    process.exit(1);
  }

  try {
    switch (args.cmd) {
      case 'backup':
        backupFiles(sqlsDir, args.keep);
        console.log(' Guardrails backup complete.');
        process.exit(0);
        break;
      case 'post-export':
        cmdPostExport(sqlsDir, args.strictWarnings);
        break;
      case 'post-prepare':
        cmdPostPrepare(sqlsDir, args.strictWarnings);
        break;
      case 'pre-import':
        cmdPreImport(sqlsDir, args.importFile, args.strictWarnings);
        break;
      case 'update-manifest':
        cmdUpdateManifest(sqlsDir);
        break;
      default:
        console.error(`Unknown command: ${args.cmd}`);
        process.exit(1);
    }
  } catch (err) {
    console.error(` [GUARDRAIL FAIL] ${err.message || err}`);
    process.exit(1);
  }
}

main();
