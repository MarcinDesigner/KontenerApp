#!/bin/zsh

# Zmień katalog roboczy na katalog z projektem
cd /Users/marcin/Downloads/aplikacje/KontenerApp || exit

# Sprawdź status
echo "📦 Sprawdzam zmiany..."
git status

# Dodaj wszystkie zmiany
echo "➕ Dodaję zmiany..."
git add .

# Stwórz commit z aktualnym czasem
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
git commit -m "🔄 Auto commit – $TIMESTAMP"

# Wypchnij zmiany
echo "🚀 Wysyłam zmiany na GitHuba..."
git push

echo "✅ Gotowe!"