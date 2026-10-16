param([string]$Url)
$ErrorActionPreference = 'Stop'
$privateDirectory = Join-Path $env:USERPROFILE '.codex\projects\skinstinct'
$credentialPath = Join-Path $privateDirectory 'admin.clixml'
if (-not $Url) {
    $urlPath = Join-Path $privateDirectory 'site-url.txt'
    if (Test-Path -LiteralPath $urlPath) { $Url = (Get-Content -LiteralPath $urlPath -Raw).Trim() }
    else { $Url = 'http://localhost:3000' }
}
if (-not (Test-Path -LiteralPath $credentialPath)) { throw 'Initial admin access has not been provisioned on this Windows account.' }
# Run only when the owner wants to sign in. The password never appears in output.
$credential = Import-Clixml -LiteralPath $credentialPath
Set-Clipboard -Value $credential.GetNetworkCredential().Password
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path -LiteralPath $chrome)) { $chrome = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' }
Start-Process -FilePath $chrome -ArgumentList ($Url.TrimEnd('/') + '/admin') -WindowStyle Hidden
$credential = $null
Write-Output 'The admin page is open in Chrome. Paste the initial password from the clipboard. After changing the password, use your password manager.'
