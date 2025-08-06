@echo off
set /a X=%random% %%3+1
powershell -command "Add-Type -AssemblyName System.Windows.Forms; $mouseEvent = [System.Windows.Forms.SystemInformation]; [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($mouseEvent]::MousePosition.X+$X,$mouseEvent]::MousePosition.Y)"
pause