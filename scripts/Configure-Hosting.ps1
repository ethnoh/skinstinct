$ErrorActionPreference = 'Stop'
$env:RAILWAY_CALLER = 'skill:use-railway@1.3.6'
$env:RAILWAY_AGENT_SESSION = 'skinstinct-hosting-setup'
$projectId = 'bace3102-d5f0-4bb0-a72d-38ee6a070049'
$environmentId = '1062f9b4-38b9-4eed-b339-04db576dace4'
$serviceId = '9a68a02e-dffe-4551-92f0-bed675859609'
$state = railway status --project $projectId --environment $environmentId --json | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $state.id -ne $projectId) { throw 'Owner Railway project verification failed.' }
$configuration = @{
    services = @{
        $serviceId = @{
            build = @{ builder = 'DOCKERFILE'; dockerfilePath = 'Dockerfile' }
            deploy = @{
                startCommand = 'node server.js'
                requiredMountPath = '/data'
                healthcheckPath = '/api/health'
                healthcheckTimeout = 120
                restartPolicyType = 'ON_FAILURE'
                restartPolicyMaxRetries = 5
                numReplicas = 1
            }
        }
    }
}
# This configures the existing GitHub-backed service. It never uploads local code.
$configuration | ConvertTo-Json -Depth 6 -Compress | railway environment edit --project $projectId --environment $environmentId --message 'Configure SKINSTINCT Docker runtime' --json
if ($LASTEXITCODE -ne 0) { throw 'Hosting configuration failed.' }
