$git = "C:\Program Files\Git\cmd\git.exe"
Set-Location "C:\Users\Administrator\Desktop\logistics-workbench"
& $git add -A
& $git commit -m "Switch storage from Feishu Base to PostgreSQL (Neon)" 2>&1 | Out-Null
for ($i = 1; $i -le 12; $i++) {
    Write-Output ("push attempt " + $i)
    & $git push origin main 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Output "PUSH OK"; exit 0 }
    Start-Sleep 12
}
Write-Output "PUSH FAILED"
