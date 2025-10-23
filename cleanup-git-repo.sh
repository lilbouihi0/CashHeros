#!/bin/bash

# Script to clean up Git repository from large node_modules files
# This script should be run from the root of the repository

echo "Cleaning up Git repository..."

# Remove node_modules from Git tracking
echo "Removing node_modules from Git tracking..."
git rm -r --cached node_modules

# Add all changes
echo "Adding all changes..."
git add .

# Commit the changes
echo "Committing changes..."
git commit -m "Clean up repository: remove node_modules from tracking and update .gitignore"

echo "Cleanup complete!"
echo "You can now push to GitHub without the large file errors."