$git = "C:\Program Files\Git\cmd\git.exe"
Set-Location "C:\Users\Administrator\Desktop\logistics-workbench"
Remove-Item "tmp-check.ps1","tmp-sync.ps1","tmp-sync-bg.ps1" -Force -ErrorAction SilentlyContinue
& $git add -A
& $git commit -m "Remove hardcoded base token fallback" 2>&1 | Out-Null
$ok = $false
for ($i = 1; $i -le 10; $i++) {
    Write-Output ("push attempt " + $i)
    & $git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $ok = $true; break }
    Start-Sleep 10
}
if ($ok) { Write-Output "PUSH OK" } else { Write-Output "PUSH FAILED" }
