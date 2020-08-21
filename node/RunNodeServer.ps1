$Command = "while (`$LastExitCode -eq 0) { node --inspect $PSScriptRoot\NodeServer.js }; Write-Host `$LastExitCode; exit;"
$Bytes = [System.Text.Encoding]::Unicode.GetBytes($Command)
$EncodedText =[Convert]::ToBase64String($Bytes)
$processCount = (Get-CimInstance Win32_process -Filter "name = 'powershell.exe'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($EncodedText) } | Measure).Count
if ($processCount -eq 0)
{
	Start-Process PowerShell.exe "-NoExit -WindowStyle hidden -EncodedCommand $EncodedText"
}
else
{
	exit
}