# Script to verify the Git fix

Write-Host "=== Verifying Git Repository Fix ==="
Write-Host ""

# Check current status
Write-Host "1. Current Git status:"
git status

Write-Host ""
Write-Host "2. Checking for large files in index:"
git ls-files | ForEach-Object { 
    if (Test-Path $_ -PathType Leaf) {
        $size = (Get-Item $_).Length
        if ($size -gt 100MB) {
            Write-Host "   LARGE FILE: $_ ($([math]::Round($size/1MB, 2)) MB)"
        }
    }
}

Write-Host ""
Write-Host "3. Checking .gitignore:"
Get-Content .gitignore | Select-String "node_modules|cache|pack"

Write-Host ""
Write-Host "4. Repository statistics:"
git count-objects -v

Write-Host ""
Write-Host "=== Verification Complete ==="
Write-Host ""
Write-Host "If no large files are listed above, the fix was successful."
Write-Host "You can now safely push to GitHub without large file errors."