param(
    [int]$IntervalHours = 6,
    [string]$GitHubUser = "Chenxxxxxx06"
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$exporter = Join-Path $PSScriptRoot "export_activity.py"
$sourceOutput = Join-Path $projectRoot "assets\data\activity.json"
$buildFallbackOutput = Join-Path $projectRoot "_data\activity.json"
$previewOutput = Join-Path $projectRoot "_site\assets\data\activity.json"
$activityGistId = "41447c85e5c65340d896376b11aa9161"

while ($true) {
    try {
        & python $exporter --github-user $GitHubUser --output $sourceOutput --output $buildFallbackOutput --output $previewOutput
        if ($LASTEXITCODE -ne 0) { throw "Activity exporter exited with code $LASTEXITCODE" }
        & gh gist edit $activityGistId --filename "activity.json" $sourceOutput
        if ($LASTEXITCODE -ne 0) { throw "Public activity Gist update failed with code $LASTEXITCODE" }
    }
    catch {
        Write-Warning "Activity refresh failed: $($_.Exception.Message)"
    }

    Start-Sleep -Seconds ($IntervalHours * 60 * 60)
}
