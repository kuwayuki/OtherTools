@echo off
setlocal enabledelayedexpansion

:: get start time in seconds
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set /a "start=(1%dt:~8,2%-100)*3600 + (1%dt:~10,2%-100)*60 + 1%dt:~12,2%-100"

:loop

python moveZahyou.py
timeout /t 180

:: get current time in seconds
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set /a "now=(1%dt:~8,2%-100)*3600 + (1%dt:~10,2%-100)*60 + 1%dt:~12,2%-100"

:: check if 60 minutes has passed
set /a "elapsed=now-start"
if !elapsed! gtr 3600 exit /b

goto loop