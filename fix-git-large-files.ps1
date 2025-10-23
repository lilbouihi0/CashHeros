# Comprehensive script to fix Git large files issue

Write-Host "=== CashHeros Git Repository Cleanup ==="
Write-Host ""

# 1. Create backup
Write-Host "1. Creating backup branch..."
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
git branch "backup-$timestamp"
Write-Host "   Backup created: backup-$timestamp"

# 2. Update .gitignore
Write-Host "2. Updating .gitignore..."
@'
# Dependencies
node_modules
node_modules/

# Production
/build
/dist
/.cache
.cache
**/.cache

# Environment files
.env*
!.env.example

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Logs
*.log

# Database
*.sqlite
*.sqlite3

# Firebase
.firebase/
firebase-debug.log*

# Temporary files
tmp/
temp/

# OS generated files
Thumbs.db

# Additional patterns to ensure node_modules is ignored
**/node_modules/**
**/node_modules
/node_modules/**
node_modules/**
!node_modules/

# Ignore specific large directories that might cause issues
**/.cache/**
.cache/**
**/default-development/**
default-development/
**/default-development

# Ignore build artifacts
*.pack
*.bundle
*.min.js
*.min.css

# Ignore large webpack files
**/.cache/default-development/*.pack
.cache/default-development/*.pack
node_modules/.cache/**/*.pack
**/node_modules/.cache/**/*.pack

# Ignore all pack files (these are the problematic large files)
*.pack
'@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# 3. Remove large files from index
Write-Host "3. Removing large files from Git index..."
git rm -r --cached node_modules
git rm -r --cached .cache

# 4. Add all changes
Write-Host "4. Adding all changes..."
git add .

# 5. Commit changes
Write-Host "5. Committing changes..."
git commit -m "Fix: Remove large files and update .gitignore

- Remove node_modules and .cache from Git tracking
- Update .gitignore to properly exclude large files
- Fix GitHub push errors related to large files (>100MB)"

Write-Host ""
Write-Host "=== Cleanup Complete ==="
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Run: git push --force-with-lease resurrection master"
Write-Host "2. Inform your team about the forced push"
Write-Host ""
Write-Host "Note: The large files are still in your local node_modules directory."
Write-Host "      Run 'npm install' or 'yarn install' to restore dependencies if needed."