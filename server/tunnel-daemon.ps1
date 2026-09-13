# Tunnel daemon for localhost.run with automatic reconnect and tunnel.json sync
$tunnelFile = Join-Path $PSScriptRoot "data\tunnel.json"

while ($true) {
    Write-Host "Starting SSH tunnel to localhost.run..."
    try {
        $process = Start-Process -FilePath "ssh" -ArgumentList "-T", "-o", "StrictHostKeyChecking=no", "-o", "ServerAliveInterval=20", "-R", "80:localhost:5173", "nokey@localhost.run" -RedirectStandardOutput "$PSScriptRoot\tunnel.log" -RedirectStandardError "$PSScriptRoot\tunnel-err.log" -PassThru -NoNewWindow
        
        # Monitor log for URL
        $urlFound = $false
        for ($i = 0; $i -lt 30; $i++) {
            Start-Sleep -Seconds 1
            if (Test-Path "$PSScriptRoot\tunnel.log") {
                $content = Get-Content "$PSScriptRoot\tunnel.log" -Raw
                if ($content -match '(https://[a-zA-Z0-9.-]+\.lhr\.life)') {
                    $url = $matches[1]
                    Write-Host "Found public URL: $url"
                    @{ url = $url; updatedAt = (Get-Date).ToString("o") } | ConvertTo-Json | Set-Content $tunnelFile -Force
                    $scratchTunnel = "C:\Users\Ranen\.gemini\antigravity\scratch\clothing-fit-intelligence\server\data\tunnel.json"
                    if (Test-Path (Split-Path $scratchTunnel)) {
                        @{ url = $url; updatedAt = (Get-Date).ToString("o") } | ConvertTo-Json | Set-Content $scratchTunnel -Force
                    }
                    try {
                        Invoke-RestMethod -Uri "http://localhost:5001/api/tunnel-info" -Method POST -Body (@{ url = $url } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 2 | Out-Null
                    } catch {}
                    $urlFound = $true
                    break
                }
            }
            if ($process.HasExited) { break }
        }
        
        if ($process -and -not $process.HasExited) {
            Write-Host "Tunnel process is active. Waiting for exit..."
            $process.WaitForExit()
        }
    } catch {
        Write-Host "Error in tunnel: $_"
    }
    Write-Host "Tunnel disconnected. Reconnecting in 3 seconds..."
    Start-Sleep -Seconds 3
}
