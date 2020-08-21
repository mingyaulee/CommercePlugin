param(
    [string]$scriptPath = "",
	[parameter(ValueFromRemainingArguments = $true)]
	[string[]]$Passthrough
)
$dateTime = Get-Date -Format "HHmmssfff"
$outputPath = "$PSScriptRoot\temp\$dateTime.txt"
New-Item -ItemType File -Force -Path $outputPath | Out-Null

Start-Process powershell.exe -Wait -Verb RunAs -WindowStyle Hidden -ArgumentList "-Command", ("& '$scriptPath' " + $Passthrough + " *> $outputPath")

Get-Content $outputPath | ForEach-Object {
    Write-Output $_
}
Remove-Item $outputPath