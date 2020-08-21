#Requires -RunAsAdministrator

$chromeExtensionId = "chnhhjcobpeplpjfjhgmlednfhcheinp"
$userGroupPolicyPath = "$env:windir\System32\GroupPolicy\User"
$logonScriptsPath = "$userGroupPolicyPath\Scripts\"
$runNodeServerScriptPath = "$PSScriptRoot\node\RunNodeServer.ps1"
$ErrorActionPreference = "Stop"

# Create Logon Scripts

	# Folders and files to create
	# Scripts
	#  |- Logon
	#  |- Logoff
	#  |- psscripts.ini
	#  |- scripts.ini
	
	if (!(Test-Path $logonScriptsPath))
	{
		New-Item -Path $logonScriptsPath -ItemType "directory" -Force
		Write-Host "$logonScriptsPath folder created" -ForegroundColor green
	}

	if (!(Test-Path $($logonScriptsPath + "Logon")))
	{
		New-Item -Path $logonScriptsPath -Name "Logon" -ItemType "directory" -Force
		Write-Host "$logonScriptsPath\Logon folder created" -ForegroundColor green
	}

	if (!(Test-Path $($logonScriptsPath + "Logoff")))
	{
		New-Item -Path $logonScriptsPath -Name "Logoff" -ItemType "directory" -Force
		Write-Host "$logonScriptsPath\Logoff folder created" -ForegroundColor green
	}

	if (!(Test-Path $($logonScriptsPath + "psscripts.ini")))
	{
		New-Item -Path $logonScriptsPath -Name "psscripts.ini" -ItemType "file" -Force
		Write-Host "$logonScriptsPath\psscripts.ini file created" -ForegroundColor green
	}

	if (!(Test-Path $($logonScriptsPath + "scripts.ini")))
	{
		New-Item -Path $logonScriptsPath -Name "scripts.ini" -ItemType "file" -Force
		Write-Host "$logonScriptsPath\scripts.ini file created" -ForegroundColor green
	}

	# Update psscripts.ini
	#   [Logon]
	#   0CmdLine=$runNodeServerScriptPath
	#   0Parameters=
	
	$hosts = Get-Content $($logonScriptsPath + "psscripts.ini")
	$logonScripts = @()
	$otherLines = @()
	$currentType = "Other"
	$currentIndex = -1
	$addedLogonScript = $false
	$saveLogonScript = $true

	$hosts | ForEach-Object {
		if ($_ -match "^\[Logon\]")
		{
			$currentType = "Logon"
			$logonScripts += $_
		}
		elseif ($_ -match "^\[" -or $_ -eq "")
		{
			if (!$addedLogonScript -and $currentType -eq "Logon")
			{
				$addedLogonScript = $true
				$currentIndex += 1
				$logonScripts += [string]$currentIndex + "CmdLine=$runNodeServerScriptPath"
				$logonScripts += [string]$currentIndex + "Parameters="
			}
			$currentType = "Other"
			$otherLines += $_
		}
		else
		{
			if ($currentType -eq "Logon")
			{
				$logonScripts += $_
				if ($_.IndexOf("Parameters") -ne -1)
				{
					$currentIndex = [int]$_.Substring(0, $_.IndexOf("Parameters"))
				}
				elseif ($_.EndsWith("CmdLine=$runNodeServerScriptPath"))
				{
					# Logon script already exists
					$addedLogonScript = $true
					$saveLogonScript = $false
				}
			}
			elseif ($currentType -eq "Other")
			{
				$otherLines += $_
			}
		}
	}

	if (!$addedLogonScript)
	{
		if ($currentType -ne "Logon")
		{
			$logonScripts += "[Logon]"
		}
		
		$addedLogonScript = $true
		$currentIndex += 1
		$logonScripts += [string]$currentIndex + "CmdLine=$runNodeServerScriptPath"
		$logonScripts += [string]$currentIndex + "Parameters="
	}

	if ($saveLogonScript)
	{
		Set-Content -Path $($logonScriptsPath + "psscripts.ini") -Value $($otherLines + $logonScripts)
		Write-Host "Logon scripts updated" -ForegroundColor green
	}
	else
	{
		Write-Host "Logon scripts already contains command $runNodeServerScriptPath" -ForegroundColor yellow
	}


# Check and install PowerShell Module

	if ((Get-PSRepository | Where-Object { $_.SourceLocation -eq "https://www.powershellgallery.com/api/v2/" } | Measure).Count -eq 0)
	{
		Register-PSRepository -Name PowerShellGalleryV2 -SourceLocation "https://www.powershellgallery.com/api/v2/" -InstallationPolicy Trusted
	}

	Install-Module -Name PolicyFileEditor


# Copy Chrome group policy

	if (!(Test-Path "C:\Windows\PolicyDefinitions\chrome.admx"))
	{
		Copy-Item -Path "$PSScriptRoot\installation\admx\chrome.admx" -Destination "C:\Windows\PolicyDefinitions"
		Write-Host "Chrome.admx copied to PolicyDefinitions" -ForegroundColor green
	}
	else
	{
		Write-Host "Chrome.admx already exists in PolicyDefinitions" -ForegroundColor yellow
	}

	Get-ChildItem -Path "C:\Windows\PolicyDefinitions" -Name -Directory | ForEach-Object {
		if (Test-Path "$PSScriptRoot\installation\admx\$_\chrome.adml")
		{
			if (!(Test-Path "C:\Windows\PolicyDefinitions\$_\chrome.adml"))
			{
				Copy-Item -Path "$PSScriptRoot\installation\admx\$_\chrome.adml" -Destination "C:\Windows\PolicyDefinitions\$_"
				Write-Host "Chrome.adml copied for language $_" -ForegroundColor green
			}
			else
			{
				Write-Host "Chrome.adml already exists for language $_" -ForegroundColor yellow
			}
		}
	}


# Set Chrome local group policy

	$policyRegistryFilePath = "$userGroupPolicyPath\registry.pol"
	$chromePolicyWhitelistPath = "Software\Policies\Google\Chrome\ExtensionInstallWhitelist"
	$extensionAlreadyWhitelisted = $false
	$whitelistIndex = 0
	$existingPolicies = Get-PolicyFileEntry -Path $policyRegistryFilePath -All | Where-Object { $_.Key -eq $chromePolicyWhitelistPath }
	$existingPolicies | ForEach-Object {
		$whitelistIndex = [math]::max($whitelistIndex , [int]$_.ValueName)
		if ($_.Data -eq $chromeExtensionId)
		{
			$extensionAlreadyWhitelisted = $true
		}
	}
	
	if (!$extensionAlreadyWhitelisted)
	{
		$whitelistIndex += 1
		Set-PolicyFileEntry -Path $policyRegistryFilePath -Key $chromePolicyWhitelistPath -ValueName $whitelistIndex -Data $chromeExtensionId -Type "String"
		Write-Host "Policy registry file updated" -ForegroundColor green
	}
	else
	{
		Write-Host "Policy registry file already contains extension ID" -ForegroundColor yellow
	}


# Set Chrome Extension Group Policy Registry

	$ChromeExtensionRegistryPath = "HKCU:\Software\Policies\Google\Chrome\ExtensionInstallWhitelist"
	if (!(Test-Path $ChromeExtensionRegistryPath))
	{
		$createNewKeyResult = New-Item -Path "HKCU:\Software\Policies\Google\Chrome" -Name "ExtensionInstallWhitelist"
		Write-Host "ExtensionInstallWhitelist registry key created" -ForegroundColor green
	}
	else
	{
		Write-Host "ExtensionInstallWhitelist registry key already exists" -ForegroundColor yellow
	}
	
	# $addedLogonScriptRegistryKey = $false
	# $registryKeyIndex = 0
	# Get-Item $ChromeExtensionRegistryPath | Select-Object -ExpandProperty property | ForEach-Object {
		# $propertyValue = $(Get-ItemProperty -Path $ChromeExtensionRegistryPath -Name $_).$_
		# if ($propertyValue -eq $chromeExtensionId)
		# {
			# $addedLogonScriptRegistryKey = $true
		# }
		# else
		# {
			# $registryKeyIndex = [int]$_
		# }
	# }
	
	if (!$extensionAlreadyWhitelisted)
	{
		Set-ItemProperty -Path $ChromeExtensionRegistryPath -Name "$whitelistIndex" -Value $chromeExtensionId
		Write-Host "Extension ID added to ExtensionInstallWhitelist registry property" -ForegroundColor green
	}
	else
	{
		Write-Host "Extension ID already exists in ExtensionInstallWhitelist registry property" -ForegroundColor yellow
	}

# Install and link modules

	cd .\node

	Write-Host "Checking installation of node-windows module" -ForegroundColor green
	$installNodeWindows = npm list -g node-windows -or npm install -g node-windows
	$linkNodeWindows = npm link node-windows

	if ($linkNodeWindows)
	{
		Write-Host "Linked node-windows module" -ForegroundColor green
	}
	else
	{
		Write-Host "Unable to link node-windows module" -ForegroundColor red
	}

	.\RunNodeServer.ps1

	cd ..

Write-Host "Installation completed" -ForegroundColor green
Write-Host "One last step!" -ForegroundColor green
Write-Host "Open chrome://extensions/ in Chrome and drag the extension installer from webextension/webextension.crx to the Chrome extensions page to install it" -ForegroundColor green