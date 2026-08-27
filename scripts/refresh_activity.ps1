param(
    [string]$GitHubUser = "Chenxxxxxx06",
    [string]$ActivityGistId = "41447c85e5c65340d896376b11aa9161"
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$exporter = Join-Path $PSScriptRoot "export_activity.py"
$sourceOutput = Join-Path $projectRoot "assets\data\activity.json"
$buildFallbackOutput = Join-Path $projectRoot "_data\activity.json"
$previewOutput = Join-Path $projectRoot "_site\assets\data\activity.json"
$logDirectory = Join-Path $env:LOCALAPPDATA "ChenXiHomepage"
$logPath = Join-Path $logDirectory "activity-refresh.log"
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null

function Write-ActivityLog {
    param([string]$Message)
    $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz"), $Message
    Add-Content -LiteralPath $logPath -Value $line -Encoding UTF8
    Write-Output $line
}

try {
    Write-ActivityLog "START root=$projectRoot"
    $python = (Get-Command python.exe -ErrorAction Stop).Source
    $gh = (Get-Command gh.exe -ErrorAction Stop).Source

    $exportArguments = @(
        $exporter,
        "--github-user", $GitHubUser,
        "--output", $sourceOutput,
        "--output", $buildFallbackOutput,
        "--output", $previewOutput
    )
    $exportOutput = & $python @exportArguments 2>&1
    $exportExitCode = $LASTEXITCODE
    $exportOutput | ForEach-Object { Write-ActivityLog "EXPORT $_" }
    if ($exportExitCode -ne 0) {
        throw "Activity exporter exited with code $exportExitCode"
    }

    $gistOutput = & $gh gist edit $ActivityGistId --filename "activity.json" $sourceOutput 2>&1
    $gistExitCode = $LASTEXITCODE
    $gistOutput | ForEach-Object { Write-ActivityLog "GIST $_" }
    if ($gistExitCode -ne 0) {
        throw "Public activity Gist update failed with code $gistExitCode"
    }

    $payload = Get-Content -LiteralPath $sourceOutput -Raw | ConvertFrom-Json
    Write-ActivityLog (
        "SUCCESS generated_at={0} github={1} tokens={2} requests={3}" -f
        $payload.generated_at,
        $payload.github.total_contributions,
        $payload.ai.period_tokens,
        $payload.ai.period_requests
    )
}
catch {
    Write-ActivityLog "FAILED $($_.Exception.Message)"
    throw
}
