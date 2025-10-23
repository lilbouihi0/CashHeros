# Script to clean up Git history from large files using Git's built-in tools

Write-Host "Creating backup of the repository..."
# Create a backup branch
git branch backup-$(Get-Date -Format "yyyyMMdd-HHmmss")

Write-Host "Filtering large files from Git history..."

# Get the list of large files
$largeFiles = git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | % { if ($_ -match '^blob') { $parts = $_.Split(' ', 4); if ([int]$parts[2] -gt 10000000) { Write-Output "$($parts[3])" } } }

Write-Host "Found $($largeFiles.Count) large files to remove:"
$largeFiles | ForEach-Object { Write-Host "  $_" }

# Create a file with the paths to remove
$largeFiles | Out-File -FilePath "large-files-to-remove.txt" -Encoding UTF8

Write-Host "Removing large files from Git history..."
# Use git filter-branch to remove the large files
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch $(Get-Content 'large-files-to-remove.txt' | ForEach-Object { '$_' })" --prune-empty --tag-name-filter cat -- --all

Write-Host "Cleaning up..."
# Clean up the repository
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object { git update-ref -d $_ }
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Remove the temporary file
Remove-Item "large-files-to-remove.txt" -Force

Write-Host "Cleanup complete!"
Write-Host "You can now push to GitHub without the large file errors."
Write-Host "Remember to run 'git push --force-with-lease resurrection master' to update the remote repository."