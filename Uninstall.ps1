#Requires -RunAsAdministrator

$logonScriptsPath = "C:\Windows\System32\GroupPolicy\User\Scripts\"
$runNodeServerScriptPath = "$PSScriptRoot\node\RunNodeServer.ps1"
$ErrorActionPreference = "Stop"

# Update Logon Scripts

	# Update psscripts.ini
	#   [Logon]
	#   0CmdLine=$runNodeServerScriptPath - REMOVE
	#   0Parameters=                      - REMOVE

	$hosts = Get-Content $($logonScriptsPath + "psscripts.ini")
	$logonScripts = @()
	$otherLines = @()
	$currentType = "Other"
	$newIndex = -1
	$currentIndex = -1
	$excludeIndex = @()

	$hosts | ForEach-Object {
		if ($_ -match "^\[Logon\]")
		{
			$currentType = "Logon"
			$logonScripts += $_
		}
		elseif ($_ -match "^\[" -or $_ -eq "")
		{
			$currentType = "Other"
			$otherLines += $_
		}
		else
		{
			if ($currentType -eq "Logon")
			{
				if ($_.IndexOf("CmdLine") -ne -1)
				{
					# Set index for lines like 0CmdLine=... 1CmdLine=... 2CmdLine=...
					$currentIndex = [int]$_.Substring(0, $_.IndexOf("CmdLine"))
				}
				
				if ($_.EndsWith($runNodeServerScriptPath))
				{
					# Exclude index for lines like [x]CmdLine=$runNodeServerScriptPath
					$excludeIndex += $currentIndex
				}
				elseif (($_.IndexOf("Parameters") -ne -1) -and $excludeIndex.Contains($currentIndex))
				{
					# Exclude parameters for [x]CmdLine=$runNodeServerScriptPath
				}
				else
				{
					if ($_.IndexOf("CmdLine") -ne -1)
					{
						# Set new index for the command line
						$newIndex += 1
					}
					$logonScripts += $([string]$newIndex + $_.Substring(([string]$currentIndex).Length))
				}
			}
			elseif ($currentType -eq "Other")
			{
				$otherLines += $_
			}
		}
	}

	if ($excludeIndex.Length -ne 0)
	{
		Set-Content -Path $($logonScriptsPath + "psscripts.ini") -Value $($otherLines + $logonScripts)
		Write-Host "Logon scripts updated" -ForegroundColor green
	}
	else
	{
		Write-Host "Logon scripts does not contain command $runNodeServerScriptPath" -ForegroundColor yellow
	}


# Remove modules link

	cd .\node

	$unlinkNodeWindows = npm unlink --no-save node-windows

	if ($unlinkNodeWindows.StartsWith("removed"))
	{
		Write-Host "Unlinked node-windows module" -ForegroundColor green
	}
	else
	{
		Write-Host "Unable to unlink node-windows module" -ForegroundColor red
	}
	
	cd ..

Write-Host "Uninstallation completed" -ForegroundColor green