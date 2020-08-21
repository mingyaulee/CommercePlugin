Add-Type -AssemblyName System.Windows.Forms
'thisisunsafe'.ToCharArray() | ForEach-Object {[System.Windows.Forms.SendKeys]::SendWait($_)}
Write-Output "ok"