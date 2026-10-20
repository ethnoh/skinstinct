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
    $projectId = 'bace3102-d5f0-4bb0-a72d-38ee6a070049'
    $environmentId = '1062f9b4-38b9-4eed-b339-04db576dace4'
    $serviceId = '9a68a02e-dffe-4551-92f0-bed675859609'
    $state = railway status --project $projectId --environment $environmentId --json | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0 -or $state.id -ne $projectId) { throw 'Owner Railway project verification failed.' }
    $passwordHash | railway variable set ADMIN_PASSWORD_HASH --stdin --skip-deploys --service $serviceId --project $projectId --environment $environmentId 2>&1 | Out-Null
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
