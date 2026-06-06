@echo off
setlocal
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%%datetime:~4,2%%datetime:~6,2%_%datetime:~8,2%%datetime:~10,2%%datetime:~12,2%
if not exist "backups" mkdir "backups"
copy "data\app.db" "backups\app_%timestamp%.db"
echo Backup completed: backups\app_%timestamp%.db
