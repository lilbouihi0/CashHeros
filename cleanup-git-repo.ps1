# Script to clean up Git repository from large node_modules files
# This script should be run from the root of the repository

Write-Host "Cleaning up Git repository..."

# Remove node_modules from Git tracking
Write-Host "Removing node_modules from Git tracking..."
git rm -r --cached node_modules

# Add all changes
Write-Host "Adding all changes..."
git add .

# Commit the changes
Write-Host "Committing changes..."
git commit -m "Clean up repository: remove node_modules from tracking and update .gitignore"

Write-Host "Cleanup complete!"
Write-Host "You can now push to GitHub without the large file errors."