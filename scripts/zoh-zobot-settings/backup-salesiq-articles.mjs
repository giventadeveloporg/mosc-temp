#!/usr/bin/env node
/**
 * Back up every SalesIQ article (full detail, including content) to a JSON file.
 * Read-only: never modifies SalesIQ. Run before any bulk delete.
 *
 * Writes: documentation/zoh_zobot_settings/backups/salesiq-articles-backup-<timestamp>.json
 *
 * Usage:
 *   npm run zobot:backup-articles
 *   npm run zobot:backup-articles -- --output F:/backups/articles.json
 *   npm run zobot:backup-articles -- --env-file F:/project_workspace/event-site-manager/.env.local
 */

import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadZohoEnv, getSalesIqConfig } from './load-zoho-env.mjs';
import { listAllArticles, salesIqFetch, sleep } from './zoho-salesiq-api.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_DIR = path.join(REPO_ROOT, 'documentation/zoh_zobot_settings/backups');

function parseArgs(argv) {
  const out = { envFile: null, output: null, delayMs: 150 };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--env-file' && argv[i + 1]) out.envFile = argv[++i];
    else if (arg === '--output' && argv[i + 1]) out.output = argv[++i];
    else if (arg === '--delay-ms' && argv[i + 1]) out.delayMs = Number.parseInt(argv[++i], 10);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  const envPath = loadZohoEnv({ envFile: args.envFile });
  const { screenName } = getSalesIqConfig();
  if (envPath) console.log(`Loaded env from: ${envPath}`);
  console.log(`Portal screen name: ${screenName}\n`);

  console.log('Fetching article list…');
  const summaries = await listAllArticles(screenName);
  console.log(`Found ${summaries.length} article(s). Fetching full detail…`);

  const articles = [];
  let detailFailures = 0;
  for (const [i, summary] of summaries.entries()) {
    const { response, body } = await salesIqFetch(`/api/v2/${screenName}/articles/${summary.id}`);
    if (response.ok && body?.data) {
      articles.push(body.data);
    } else {
      detailFailures += 1;
      console.warn(`  Detail failed for [${summary.id}] (${response.status}); keeping list summary`);
      articles.push({ ...summary, _backupDetailError: response.status });
    }
    if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${summaries.length}`);
    if (args.delayMs > 0) await sleep(args.delayMs);
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = args.output
    ? path.resolve(args.output)
    : path.join(DEFAULT_DIR, `salesiq-articles-backup-${stamp}.json`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    JSON.stringify({ screenName, exportedAt: new Date().toISOString(), count: articles.length, articles }, null, 2),
    'utf8',
  );

  console.log(`\nSaved ${articles.length} article(s) to ${outputPath}`);
  if (detailFailures > 0) {
    console.log(`${detailFailures} article(s) saved from list data only (detail fetch failed).`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
