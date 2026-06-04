#!/bin/bash
echo "Initializing git repository..."
git init

echo "Adding files..."
git add .

echo "Committing files..."
git commit -m "Initialize project and fix nested button hydration error"

echo "Setting main branch..."
git branch -M main

echo "Linking remote origin..."
git remote add origin https://github.com/Yaris1723/Velon-cost-estimator.git 2>/dev/null || git remote set-url origin https://github.com/Yaris1723/Velon-cost-estimator.git

echo "Pushing to GitHub..."
git push -u origin main
