#!/bin/bash

echo "🚀 Building Tasko application..."

# Sprawdź czy pnpm jest zainstalowany
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm nie jest zainstalowany. Zainstaluj pnpm: npm install -g pnpm"
    exit 1
fi

# Wyczyść poprzedni build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Zainstaluj zależności
echo "📦 Installing dependencies..."
pnpm install

# Zbuduj aplikację
echo "🔨 Building application..."
pnpm build

# Sprawdź czy build się udał
if [ -d "dist" ]; then
    echo "✅ Build successful! Files in dist/ directory:"
    ls -la dist/
    
    echo ""
    echo "🌐 To test locally, run: pnpm preview"
    echo "📁 To deploy, upload contents of dist/ to your hosting provider"
else
    echo "❌ Build failed!"
    exit 1
fi 