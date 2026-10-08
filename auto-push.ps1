# CampusBite Auto Commit and Push Watcher
# Run: .\auto-push.ps1

$repoPath = "c:\Users\DIVYA\Favorites"
$branch   = "main"
$interval = 30

Write-Host "CampusBite Auto-Push Watcher started" -ForegroundColor Green
Write-Host "Watching: $repoPath" -ForegroundColor Cyan
Write-Host "Check interval: every $interval seconds" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop."

Set-Location $repoPath

while ($true) {
    $status = git status --porcelain 2>&1

    if ($status) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timestamp] Changes detected - committing and pushing..." -ForegroundColor Yellow

        git add -A 2>&1 | Out-Null

        $commitMsg = "auto: save changes at $timestamp"
        git commit -m $commitMsg 2>&1 | Out-Null

        $pushResult = git push origin $branch 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "[$timestamp] Pushed to GitHub successfully!" -ForegroundColor Green
        } else {
            Write-Host "[$timestamp] Push failed: $pushResult" -ForegroundColor Red
        }
    } else {
        $timestamp = Get-Date -Format "HH:mm:ss"
        Write-Host "[$timestamp] No changes" -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds $interval
}
