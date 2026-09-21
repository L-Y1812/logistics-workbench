$dst = "C:\Users\Administrator\Desktop\GitInstaller.exe"
$urls = @(
    "https://github.com/git-for-windows/git/releases/download/v2.46.0.windows.1/Git-2.46.0-64-bit.exe",
    "https://registry.npmmirror.com/-/binary/git-for-windows/v2.46.0.windows.1/Git-2.46.0-64-bit.exe"
)
$ok = $false
foreach ($url in $urls) {
    Write-Output "trying: $url"
    try {
        & curl.exe -L -o $dst --connect-timeout 15 --max-time 120 $url 2>&1 | Out-Null
        if (Test-Path $dst) {
            $size = (Get-Item $dst).Length
            if ($size -gt 1000000) {
                Write-Output "downloaded OK ($size bytes)"
                $ok = $true
                break
            }
        }
    } catch { Write-Output "failed: $_" }
}
if (-not $ok) {
    Write-Output "ALL DOWNLOADS FAILED"
    exit 1
}
Write-Output "installing..."
Start-Process -FilePath $dst -ArgumentList "/VERYSILENT","/NORESTART" -Wait -NoNewWindow
Start-Sleep 3
$gitExe = "C:\Program Files\Git\cmd\git.exe"
if (Test-Path $gitExe) {
    Write-Output ("SUCCESS: " + (& $gitExe --version))
} else {
    Write-Output "git.exe not found after install"
}
