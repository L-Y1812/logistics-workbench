$git = "C:\Program Files\Git\cmd\git.exe"
Set-Location "C:\Users\Administrator\Desktop\logistics-workbench"
& $git init -b main 2>&1
& $git config user.email "996020184@qq.com"
& $git config user.name "logistics-deploy"
& $git add -A 2>&1 | Out-Null
& $git commit -m "Initial commit: logistics workbench ready for Render deploy" 2>&1
Write-Output "---- commit done ----"
& $git log --oneline -1
