$ErrorActionPreference = 'Stop'
$env:RAILWAY_CALLER = 'skill:use-railway@1.3.6'
$env:RAILWAY_AGENT_SESSION = 'skinstinct-hosting-setup'
$projectId = '6a94610d-2e1c-4aed-b0d9-764b4efa1575'
$serviceId = '9299dc12-f714-44cd-8260-87a853f9f518'
$configuration = @{
    services = @{
        $serviceId = @{
            build = @{ builder = 'DOCKERFILE'; dockerfilePath = 'Dockerfile' }
            deploy = @{
                healthcheckPath = '/api/health'
                healthcheckTimeout = 120
                restartPolicyType = 'ON_FAILURE'
                restartPolicyMaxRetries = 5
            }
        }
    }
}
# This configures the existing GitHub-backed service. It never uploads local code.
$configuration | ConvertTo-Json -Depth 6 -Compress | railway environment edit --project $projectId --environment production --message 'Configure SKINSTINCT Docker runtime' --json
if ($LASTEXITCODE -ne 0) { throw 'Hosting configuration failed.' }
