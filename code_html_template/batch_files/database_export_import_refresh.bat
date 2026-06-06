@echo off
setlocal EnableDelayedExpansion

REM ============================================================
REM Database export, reorder, schema refresh, import, and sync
REM ============================================================
REM Usage:
REM   database_export_import_refresh.bat WORKSPACE_ROOT [CONTAINER_ID] [/FORCE] [/PROD] [/SKIP-EXPORT]
REM ============================================================

set "CONTAINER_ID="
set "FORCE=0"
set "USE_PROD=0"
set "SKIP_EXPORT=0"
set "FINAL_EXIT=0"
set "RUN_MODE=FULL"

REM Step status: PENDING | OK | FAIL | SKIP
set "S0=--"
set "S1=--"
set "S2=--"
set "S3=--"
set "S4=--"
set "S5=--"
set "S6=--"
set "S7=--"

if "%~1"=="" goto :usage
if /i "%~1"=="/?" goto :usage
if /i "%~1"=="-h" goto :usage
if /i "%~1"=="--help" goto :usage

set "WORKSPACE_ROOT=%~1"

if not "%~2"=="" call :parse_one_arg "%~2"
if not "%~3"=="" call :parse_one_arg "%~3"
if not "%~4"=="" call :parse_one_arg "%~4"
if not "%~5"=="" call :parse_one_arg "%~5"
if not "%~6"=="" call :parse_one_arg "%~6"
goto :args_done

:parse_one_arg
if /i "%~1"=="/FORCE" set "FORCE=1" & goto :eof
if /i "%~1"=="/PROD" set "USE_PROD=1" & goto :eof
if /i "%~1"=="/SKIP-EXPORT" set "SKIP_EXPORT=1" & goto :eof
if not defined CONTAINER_ID (
  set "CONTAINER_ID=%~1"
  goto :eof
)
call :log_warn "Ignoring extra argument: %~1"
goto :eof

:args_done

set "MOSC_TEMP=%WORKSPACE_ROOT%\mosc-temp"
set "SQLS_DIR=%MOSC_TEMP%\code_html_template\SQLS"
set "SCHEMA_FILE=%SQLS_DIR%\Current_Sqls\Latest_Schema_Post__Blob_Claude_12.sql"
set "EXPORT_FILE=%SQLS_DIR%\export.sql"
set "ORDERED_FILE=%SQLS_DIR%\corrected_event_media_inserts.ordered.sql"
set "PROD_FILE=%SQLS_DIR%\corrected_event_media_inserts.ordered_PROD.sql"
set "SYNC_BOOT=%WORKSPACE_ROOT%\malayalees-us-site-boot\src\main\resources\sqls\sync_sequence_after_inserts.sql"
set "SYNC_MOSC=%SQLS_DIR%\Current_Sqls\sync_sequence_after_inserts.sql"

set "DB_USER=event_site_admin"
set "DB_NAME=event_site_manager_db"

call :log_banner "Database Export / Import / Refresh"
echo( Workspace root : %WORKSPACE_ROOT%
echo( SQLS folder    : %SQLS_DIR%
echo(

if not exist "%MOSC_TEMP%" (
  call :log_err "mosc-temp not found: %MOSC_TEMP%"
  goto :fail
)
if not exist "%SQLS_DIR%" (
  call :log_err "SQLS folder not found: %SQLS_DIR%"
  goto :fail
)

where docker >nul 2>&1
if errorlevel 1 (
  call :log_err "docker is not on PATH. Install Docker Desktop and retry."
  goto :fail
)

where node >nul 2>&1
if errorlevel 1 (
  call :log_err "node is not on PATH. Install Node.js and retry."
  goto :fail
)

docker info >nul 2>&1
if errorlevel 1 (
  call :log_err "Docker is not running. Start Docker Desktop and retry."
  goto :fail
)

REM --- STEP 0: Resolve Postgres container ---
call :log_step "0" "Detecting PostgreSQL Docker container"
if not defined CONTAINER_ID goto :detect_container
call :log_info "Using container ID from argument: %CONTAINER_ID%"
goto :verify_container

:detect_container
for /f "tokens=1" %%C in ('docker ps 2^>nul ^| findstr /i postgres') do (
  set "CONTAINER_ID=%%C"
  goto :verify_container
)
set "S0=FAIL"
call :log_err "No running postgres container found."
call :log_info "Run: docker ps ^| findstr postgres"
call :log_info "Then pass the container ID as the second argument."
goto :fail

:verify_container
echo(          Container ID: !CONTAINER_ID!
docker ps --filter "id=!CONTAINER_ID!" --format "table {{.ID}}\t{{.Names}}\t{{.Image}}"
if errorlevel 1 (
  call :log_warn "Could not verify container details; continuing anyway."
)
set "S0=OK"
call :log_ok "Step 0 complete - container resolved"

REM --- STEP 1: pg_dump export ---
call :log_step "1" "Export data-only INSERTs"
if "%SKIP_EXPORT%"=="1" goto :step1_skip
pushd "%SQLS_DIR%"
docker exec -i !CONTAINER_ID! pg_dump -U %DB_USER% -d %DB_NAME% --data-only --column-inserts > "%EXPORT_FILE%"
set "DUMP_ERR=!errorlevel!"
popd
if !DUMP_ERR! neq 0 (
  set "S1=FAIL"
  call :log_err "pg_dump failed with exit code !DUMP_ERR!"
  goto :fail
)
if not exist "%EXPORT_FILE%" (
  set "S1=FAIL"
  call :log_err "export file was not created"
  goto :fail
)
set "S1=OK"
call :log_ok "Step 1 complete - wrote export file"
call :log_info "File: %EXPORT_FILE%"
goto :step2

:step1_skip
if not exist "%EXPORT_FILE%" (
  set "S1=FAIL"
  call :log_err "export file not found: %EXPORT_FILE%"
  goto :fail
)
set "S1=SKIP"
call :log_ok "Step 1 skipped (/SKIP-EXPORT) - using existing export file"
call :log_info "File: %EXPORT_FILE%"

REM --- STEP 2: Reorder ---
:step2
call :log_step "2" "Reorder INSERT statements"
pushd "%SQLS_DIR%"
node reorder_sql_inserts_final.cjs
set "REORDER_ERR=!errorlevel!"
popd
if !REORDER_ERR! neq 0 (
  set "S2=FAIL"
  call :log_err "reorder_sql_inserts_final.cjs failed with exit code !REORDER_ERR!"
  goto :fail
)
if not exist "%ORDERED_FILE%" (
  set "S2=FAIL"
  call :log_err "ordered output file not found"
  goto :fail
)
set "S2=OK"
call :log_ok "Step 2 complete - ordered INSERT file created"
call :log_info "File: %ORDERED_FILE%"

REM --- STEP 3: PROD user ID copy ---
call :log_step "3" "Create PROD SQL copy with user ID replacements"
pushd "%MOSC_TEMP%"
node scripts\replace-user-profile-ids-in-sql.mjs
set "PROD_ERR=!errorlevel!"
popd
if !PROD_ERR! neq 0 (
  set "S3=FAIL"
  call :log_err "replace-user-profile-ids-in-sql.mjs failed with exit code !PROD_ERR!"
  goto :fail
)
if not exist "%PROD_FILE%" (
  set "S3=FAIL"
  call :log_err "PROD output file not found"
  goto :fail
)
set "S3=OK"
call :log_ok "Step 3 complete - PROD copy created"
call :log_info "File: %PROD_FILE%"

REM --- STEP 4: Comment pg_dump lines ---
if "%USE_PROD%"=="1" (
  set "IMPORT_FILE=%PROD_FILE%"
) else (
  set "IMPORT_FILE=%ORDERED_FILE%"
)

call :log_step "4" "Comment pg_dump header lines in import file"
powershell -NoProfile -Command "$path = '%IMPORT_FILE%'; $lines = Get-Content -LiteralPath $path; $out = $lines | ForEach-Object { if ($_ -match '^\s*pg_dump') { $_ -replace 'pg_dump','-- pg_dump' } else { $_ } }; Set-Content -LiteralPath $path -Value $out -Encoding UTF8"
if errorlevel 1 (
  set "S4=FAIL"
  call :log_err "Failed to patch pg_dump lines"
  goto :fail
)
set "S4=OK"
call :log_ok "Step 4 complete - import file patched"
call :log_info "File: !IMPORT_FILE!"

REM --- Confirm destructive steps ---
call :log_banner "WARNING: Steps 5-7 rebuild schema and replace data"
echo( Database : %DB_NAME%
echo( Container: !CONTAINER_ID!
echo(

if "%FORCE%"=="0" (
  set /p "CONFIRM=Type Y or YES to continue with schema rebuild and import: "
  if /i "!CONFIRM!"=="YES" goto :confirm_ok
  if /i "!CONFIRM!"=="Y" goto :confirm_ok
  set "RUN_MODE=PARTIAL"
  set "S5=--"
  set "S6=--"
  set "S7=--"
  call :log_warn "Aborted before schema rebuild (confirmation not accepted)."
  call :log_info "You entered: !CONFIRM! — expected Y or YES. Steps 1-4 outputs were kept."
  call :log_info "Re-run with /FORCE to skip this prompt, or type YES when asked."
  goto :print_summary
)
:confirm_ok

if not exist "%SCHEMA_FILE%" (
  set "S5=FAIL"
  call :log_err "Schema file not found: %SCHEMA_FILE%"
  goto :fail
)

REM --- STEP 5: Schema ---
call :log_step "5" "Apply database schema"
docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=1 < "%SCHEMA_FILE%"
if errorlevel 1 (
  set "S5=FAIL"
  call :log_err "Schema apply failed"
  goto :fail
)
set "S5=OK"
call :log_ok "Step 5 complete - schema applied"
call :log_info "File: %SCHEMA_FILE%"

REM --- STEP 6: Import ---
call :log_step "6" "Import data"
docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=0 < "!IMPORT_FILE!"
if errorlevel 1 (
  set "S6=WARN"
  call :log_warn "Import reported errors - review psql output above"
  call :log_info "Partial imports may need manual cleanup (see DATABASE_EXPORT_IMPORT_GUIDE.html)"
) else (
  set "S6=OK"
  call :log_ok "Step 6 complete - data import finished"
)
call :log_info "File: !IMPORT_FILE!"

REM --- STEP 7: Sequence sync ---
if exist "%SYNC_BOOT%" (
  set "SYNC_FILE=%SYNC_BOOT%"
) else if exist "%SYNC_MOSC%" (
  set "SYNC_FILE=%SYNC_MOSC%"
) else (
  set "S7=FAIL"
  call :log_err "sync_sequence_after_inserts.sql not found"
  call :log_info "Tried: %SYNC_BOOT%"
  call :log_info "Tried: %SYNC_MOSC%"
  goto :fail
)

call :log_step "7" "Sync primary-key sequences"
docker exec -i !CONTAINER_ID! psql -U %DB_USER% -d %DB_NAME% -v ON_ERROR_STOP=1 < "!SYNC_FILE!"
if errorlevel 1 (
  set "S7=FAIL"
  call :log_err "Sequence sync failed"
  goto :fail
)
set "S7=OK"
call :log_ok "Step 7 complete - sequences synchronized"
call :log_info "File: !SYNC_FILE!"

set "RUN_MODE=FULL"
goto :print_summary

:print_summary
echo(
call :log_banner "Run summary"
echo( Mode: !RUN_MODE!
echo(
echo(  Step  Description                              Status
echo(  ---- ---------------------------------------- ------
echo(  0    Resolve Postgres container               !S0!
echo(  1    pg_dump export                           !S1!
echo(  2    Reorder INSERTs                          !S2!
echo(  3    PROD user ID copy                        !S3!
echo(  4    Comment pg_dump lines                    !S4!
echo(  5    Apply schema                             !S5!
echo(  6    Import data                              !S6!
echo(  7    Sync sequences                           !S7!
echo(

if /i "!RUN_MODE!"=="FULL" (
  if /i "!S6!"=="WARN" (
    set "FINAL_EXIT=2"
    call :log_warn "OVERALL: COMPLETED WITH WARNINGS (import had errors)"
  ) else (
    set "FINAL_EXIT=0"
    call :log_ok "OVERALL: SUCCESS - all steps completed"
  )
) else if /i "!RUN_MODE!"=="PARTIAL" (
  set "FINAL_EXIT=0"
  call :log_ok "OVERALL: PARTIAL SUCCESS - export/reorder/PROD files ready"
  call :log_info "Re-run with /FORCE when ready for schema rebuild and import"
) else (
  set "FINAL_EXIT=1"
  call :log_err "OVERALL: FAILED"
)

echo(
echo( Exit code: !FINAL_EXIT!  (0=success, 1=failed, 2=completed with warnings)
echo(
if "!FINAL_EXIT!"=="0" (
  endlocal
  exit /b 0
)
if "!FINAL_EXIT!"=="2" (
  endlocal
  exit /b 2
)
endlocal
exit /b 1

:fail
set "FINAL_EXIT=1"
set "RUN_MODE=FAILED"
goto :print_summary

:usage
echo(
echo( Usage:
echo(   %~nx0 WORKSPACE_ROOT [CONTAINER_ID] [/FORCE] [/PROD] [/SKIP-EXPORT]
echo(
echo(   WORKSPACE_ROOT  Parent folder containing mosc-temp (e.g. F:\project_workspace)
echo(   CONTAINER_ID    Docker Postgres container ID (auto-detected if omitted)
echo(   /FORCE          Skip YES confirmation before schema rebuild
echo(   /PROD           Import corrected_event_media_inserts.ordered_PROD.sql
echo(   /SKIP-EXPORT    Skip pg_dump; reuse existing export.sql
echo(
echo( Example:
echo(   %~nx0 F:\project_workspace
echo(   %~nx0 F:\project_workspace 752786b3431e /FORCE
exit /b 1

REM --- Logging helpers (use echo( to avoid ". was unexpected" with .sql paths) ---
:log_banner
echo(
echo( ============================================================
echo( %~1
echo( ============================================================
goto :eof

:log_step
echo(
echo( [STEP %~1] %~2 ...
goto :eof

:log_ok
echo( [OK] %~1
goto :eof

:log_err
echo( [ERROR] %~1
goto :eof

:log_warn
echo( [WARNING] %~1
goto :eof

:log_info
echo(          %~1
goto :eof
