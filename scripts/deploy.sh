#!/bin/bash

echo "🚀 Tasko Deployment Script"
echo "=========================="

# Sprawdź czy jesteśmy w głównym katalogu projektu
if [ ! -f "package.json" ]; then
    echo "❌ Nie jesteś w głównym katalogu projektu Tasko"
    exit 1
fi

# Opcje deploymentu
echo "Wybierz platformę deploymentu:"
echo "1) Netlify (ręczny upload)"
echo "2) Vercel (CLI)"
echo "3) Firebase Hosting"
echo "4) GitHub Pages (push to main)"
echo "5) Tylko build (bez deploymentu)"

read -p "Wybierz opcję (1-5): " choice

case $choice in
    1)
        echo "📦 Building for Netlify..."
        pnpm build
        echo "✅ Build completed!"
        echo "📁 Upload contents of 'dist/' folder to Netlify"
        echo "🔗 Or drag & drop 'dist/' folder to Netlify dashboard"
        ;;
    2)
        echo "📦 Building for Vercel..."
        pnpm build
        echo "🚀 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo "❌ Vercel CLI not installed. Install with: npm i -g vercel"
            echo "📁 Or upload 'dist/' folder to Vercel dashboard"
        fi
        ;;
    3)
        echo "📦 Building for Firebase..."
        pnpm build
        echo "🚀 Deploying to Firebase..."
        if command -v firebase &> /dev/null; then
            firebase deploy
        else
            echo "❌ Firebase CLI not installed. Install with: npm i -g firebase-tools"
            echo "📁 Or upload 'dist/' folder to Firebase console"
        fi
        ;;
    4)
        echo "🚀 Pushing to GitHub for automatic deployment..."
        git add .
        git commit -m "Deploy to GitHub Pages"
        git push origin main
        echo "✅ Push completed! Check GitHub Actions for deployment status"
        ;;
    5)
        echo "📦 Building only..."
        pnpm build
        echo "✅ Build completed! Files in 'dist/' directory"
        ;;
    *)
        echo "❌ Nieprawidłowa opcja"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!" 