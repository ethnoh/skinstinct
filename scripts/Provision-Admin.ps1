param([switch]$ConfigureRailway, [switch]$StartPreview)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$privateDirectory = Join-Path $env:USERPROFILE '.codex\projects\skinstinct'
$credentialPath = Join-Path $privateDirectory 'admin.clixml'
New-Item -ItemType Directory -Force -Path $privateDirectory | Out-Null
if (-not (Test-Path -LiteralPath $credentialPath)) {
    $random = New-Object byte[] 24
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($random)
    $initialPassword = [Convert]::ToBase64String($random).Replace('+', 'a').Replace('/', 'b').TrimEnd('=')
    $credential = [PSCredential]::new('admin', (ConvertTo-SecureString $initialPassword -AsPlainText -Force))
    $credential | Export-Clixml -LiteralPath $credentialPath
    $initialPassword = $null
}
$credential = Import-Clixml -LiteralPath $credentialPath
$passwordHash = $credential.GetNetworkCredential().Password | node (Join-Path $PSScriptRoot 'hash-password.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Could not prepare the password hash.' }
if ($ConfigureRailway) {
    $env:RAILWAY_CALLER = 'skill:use-railway@1.3.6'
    $env:RAILWAY_AGENT_SESSION = 'skinstinct-20261017'
    $passwordHash | railway variable set ADMIN_PASSWORD_HASH --stdin --skip-deploys --service 9299dc12-f714-44cd-8260-87a853f9f518 --project 6a94610d-2e1c-4aed-b0d9-764b4efa1575 --environment production 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Could not configure admin authentication in the SKINSTINCT service.' }
    Write-Output 'Admin password hash configured. No password was printed.'
}
if ($StartPreview) {
    $env:ADMIN_PASSWORD_HASH = $passwordHash
    $env:HOSTNAME = '127.0.0.1'
    $env:PORT = '3000'
    Set-Location -LiteralPath $projectRoot
    node (Join-Path $projectRoot '.next\standalone\server.js')
}
$passwordHash = $null
$credential = $null
if (-not $StartPreview -and -not $ConfigureRailway) { Write-Output 'Initial admin access is stored with Windows user encryption.' }
