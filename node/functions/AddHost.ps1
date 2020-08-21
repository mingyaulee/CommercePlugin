param(
    [string]$hostName = "",
    [string]$mapIpFromHostName = ""
)

# variables
$hostFilePath = "C:\\Windows\\System32\\drivers\\etc\\hosts"
$replaced = $false

# get IP address from the other host name
$hostIp = ([System.Net.Dns]::GetHostAddresses($mapIpFromHostName) | Select-Object -first 1).IPAddressToString
if ($hostIp -ne "")
{
	# read from host file
	$hosts = Get-Content $hostFilePath
	
	# replace existing IP mapping
	$hosts = $hosts | Foreach {
		if ($_.ToLower().EndsWith($hostName.ToLower())) 
		{
			$replaced = $true
			$hostIp + "`t" + $hostName
		}
		else
		{
			$_
		}
	}
	
	# or add new IP mapping
	if (!$replaced) {
		$hosts += $hostIp + "`t" + $hostName
	}
	
	# save host file
	$hosts | Out-File $hostFilePath -enc ascii
	
	Write-Output "ok"
	Write-Output "$hostName"
	Write-Output "$hostIp"
}
else
{
	Write-Error "Failed to get IP address for host name $mapIpFromHostName"
}