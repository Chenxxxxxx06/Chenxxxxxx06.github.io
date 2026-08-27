param(
    [string]$TaskName = "ChenXiHomepageActivityRefresh",
    [int]$IntervalHours = 6,
    [switch]$RunNow
)

$ErrorActionPreference = "Stop"

if ($IntervalHours -lt 1) {
    throw "IntervalHours must be at least 1."
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$refreshScript = Join-Path $PSScriptRoot "refresh_activity.ps1"
if (-not (Test-Path -LiteralPath $refreshScript)) {
    throw "Refresh script not found: $refreshScript"
}

$escapedScript = $refreshScript.Replace('"', '`"')
$arguments = "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$escapedScript`""
$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument $arguments `
    -WorkingDirectory $projectRoot

$trigger = New-ScheduledTaskTrigger `
    -Once `
    -At (Get-Date).AddHours($IntervalHours) `
    -RepetitionInterval (New-TimeSpan -Hours $IntervalHours)

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

$principal = New-ScheduledTaskPrincipal `
    -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Refresh the public six-month GitHub and local AI-token activity snapshot every $IntervalHours hours." `
    -Force | Out-Null

$registered = Get-ScheduledTask -TaskName $TaskName
$taskInfo = Get-ScheduledTaskInfo -TaskName $TaskName
Write-Output "Registered $TaskName"
Write-Output "Script: $refreshScript"
Write-Output "Working directory: $projectRoot"
Write-Output "Interval: $IntervalHours hours"
Write-Output "Next run: $($taskInfo.NextRunTime.ToString('yyyy-MM-dd HH:mm:ss'))"

if ($RunNow) {
    Start-ScheduledTask -TaskName $TaskName
    Write-Output "Started $TaskName"
}
