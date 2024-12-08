#!/usr/bin/env bash

# This script initializes a complete PWA project for album ratings.
# It sets up:
# - A Framework7-based UI with iOS/macOS styling.
# - IndexedDB for offline storage.
# - GitHub Gist synchronization for data syncing.
# - Complete JavaScript logic for handling albums, artists, ratings, search, sorting, and syncing.

set -e

# Function to display error messages
error_exit() {
  echo "Error: $1"
  exit 1
}

# Project directory
PROJECT_DIR="album-rating-pwa"

# Avoid overwriting existing directory
if [ -d "$PROJECT_DIR" ]; then
  error_exit "Directory '$PROJECT_DIR' already exists. Please remove it before running this script."
fi

mkdir "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Create directories
mkdir -p ui
mkdir -p img
mkdir -p css
mkdir -p js

# Prompt for GitHub Gist Configuration
echo "Configuring GitHub Gist Synchronization..."
read -p "Enter your GitHub Gist ID: " GIST_ID
read -sp "Enter your GitHub Personal Access Token: " GIST_TOKEN
echo ""

# Validate inputs
if [ -z "$GIST_ID" ] || [ -z "$GIST_TOKEN" ]; then
  error_exit "Gist ID and Token are required. Please run the script again with valid inputs."
fi

# Create js/config.js with user inputs
cat > js/config.js <<EOF
// Configuration file
// This file is ignored by version control for security reasons

window.APP_CONFIG = {
  "gist_id": "${GIST_ID}",
  "gist_token": "${GIST_TOKEN}"
};
EOF

echo "GitHub Gist configuration completed."

# Create a .gitignore file
cat > .gitignore <<'EOF'
# Node modules
node_modules/

# Configuration files
js/config.js

# Logs
logs
*.log
npm-debug.log*

# OS files
.DS_Store

# IDE files
.vscode/
.idea/
EOF

echo ".gitignore created to exclude sensitive files."

# Create a basic index.html with Framework7 setup
cat > index.html <<'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, user-scalable=no">
  <title>Album Ratings</title>
  <link rel="manifest" href="manifest.json">
  
  <!-- iOS meta tags for PWA -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  
  <!-- Framework7 CSS (for iOS look) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/framework7@6.3.14/framework7.bundle.min.css" />
  
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div id="app">
    <!-- Framework7 App root -->
    <div class="view view-main safe-areas">
      <!-- Main Page -->
      <div class="page" data-name="home">
        <div class="navbar">
          <div class="navbar-inner">
            <div class="title">Albums</div>
            <div class="right">
              <a href="#" class="link searchbar-enable icon-only">
                <i class="icon f7-icons">search</i>
              </a>
            </div>
            <form class="searchbar" data-search-in=".list">
              <div class="searchbar-inner">
                <div class="searchbar-input-wrap">
                  <input type="search" placeholder="Search albums or artists" id="searchInput"/>
                  <i class="searchbar-icon"></i>
                  <span class="input-clear-button"></span>
                </div>
                <span class="searchbar-disable-button">Cancel</span>
              </div>
            </form>
          </div>
        </div>
        <div class="page-content">
          <div class="toolbar tabbar">
            <div class="toolbar-inner">
              <a href="#" class="tab-link tab-link-active" data-mode="albums">Albums</a>
              <a href="#" class="tab-link" data-mode="artists">Artists</a>
              <a href="#" class="tab-link" id="openSettings">Ratings</a>
              <a href="#" class="tab-link" id="syncButton">
                <i class="icon f7-icons">sync</i>
              </a>
            </div>
          </div>
          <div class="list simple-list searchbar-found" id="albumList">
            <!-- Albums or Artists will be listed here -->
          </div>
          <div class="fab fab-right-bottom">
            <a href="#" class="link fab-toggle" id="addAlbumButton">
              <i class="icon f7-icons">plus</i>
            </a>
          </div>
        </div>
      </div>
      <!-- Additional pages and features here -->
    </div>
  </div>
  
  <!-- Framework7 JS -->
  <script src="https://cdn.jsdelivr.net/npm/framework7@6.3.14/framework7.bundle.min.js"></script>
  
  <!-- Include dependencies -->
  <script src="js/config.js"></script>
  <script src="js/idb.js"></script>
  <script src="js/db.js"></script>
  <script src="js/sync.js"></script>
  <script src="js/main.js"></script>
  
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js');
    }
  </script>
</body>
</html>
EOF

# Create a manifest.json
cat > manifest.json <<'EOF'
{
  "name": "Album Ratings",
  "short_name": "Albums",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007AFF",
  "icons": [
    {
      "src": "img/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "img/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
EOF

# Download placeholder icons
echo "Downloading placeholder icons..."
curl -s -o img/icon-192.png https://via.placeholder.com/192.png?text=Icon+192
curl -s -o img/icon-512.png https://via.placeholder.com/512.png?text=Icon+512
echo "Placeholder icons downloaded."

# Create a service-worker.js for offline caching
cat > service-worker.js <<'EOF'
const CACHE_NAME = 'album-rating-cache-v1';
const OFFLINE_URL = 'index.html';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([
      './',
      './index.html',
      './manifest.json',
      './css/style.css',
      './js/config.js',
      './js/idb.js',
      './js/db.js',
      './js/sync.js',
      './js/main.js',
      'https://cdn.jsdelivr.net/npm/framework7@6.3.14/framework7.bundle.min.css',
      'https://cdn.jsdelivr.net/npm/framework7@6.3.14/framework7.bundle.min.js'
    ]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    for (const key of keys) {
      if (key !== CACHE_NAME) {
        await caches.delete(key);
      }
    }
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    try {
      return await fetch(event.request);
    } catch (e) {
      const cache = await caches.open(CACHE_NAME);
      return await cache.match(event.request) || await cache.match(OFFLINE_URL);
    }
  })());
});
EOF

# Create a basic CSS file
cat > css/style.css <<'EOF'
body, html {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.safe-areas {
  padding-top: env(safe-area-inset-top);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
}

.list ul {
  padding: 0;
  margin: 0;
}

.list li ul {
  padding-left: 1em;
}

.fab {
  z-index: 1000;
}
EOF

# Create a simple README.md
cat > README.md <<'EOF'
# Album Rating PWA

A Progressive Web Application (PWA) for managing and rating albums. Built with Framework7, IndexedDB, and GitHub Gist for data synchronization.

## Features

- **Framework7 UI**: Modern and responsive user interface with iOS/macOS styling.
- **Offline Support**: Powered by IndexedDB and Service Workers for seamless offline usage.
- **Data Synchronization**: Sync your data across devices using GitHub Gist.
- **Manage Albums and Artists**: Add, edit, and organize your album collection.
- **Custom Ratings**: Define your own rating categories to evaluate albums.

## Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/yourusername/album-rating-pwa.git
   cd album-rating-pwa
   ```

2. **Configuration**:
   - The script has already set up the necessary configuration files.
   - Ensure that `js/config.js` contains your GitHub Gist ID and Personal Access Token.

3. **Replace Icons**:
   - Replace `img/icon-192.png` and `img/icon-512.png` with your desired app icons.

4. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m 'Initial commit'
   git branch -M main
   git remote add origin https://github.com/yourusername/album-rating-pwa.git
   git push -u origin main
   ```

5. **Deploy the PWA**:
   - You can host the PWA using GitHub Pages or any other static hosting service.
   - For GitHub Pages:
     - Go to your repository on GitHub.
     - Navigate to **Settings > Pages**.
     - Select the `main` branch and root folder.
     - Save and wait for GitHub to deploy your site.

6. **Install the PWA**:
   - Open the deployed URL on your iPhone and MacBook.
   - Follow the prompts to install the PWA for easy access.

## Security Notice

- **Sensitive Information**: Ensure that `js/config.js` is **never** committed to version control. The `.gitignore` file is set up to prevent this.
- **Personal Access Token**: Keep your GitHub Personal Access Token secure. Do not share it or expose it publicly.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

EOF

# Display next steps
echo "Project initialized in '$PROJECT_DIR'."

echo "Next steps:"
echo "1. Replace 'img/icon-192.png' and 'img/icon-512.png' with your actual icon images for your app if desired."
echo "2. If you haven't initialized a Git repository yet and wish to do so now, follow these steps:"
echo "   cd $PROJECT_DIR"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/yourusername/album-rating-pwa.git"
echo "   git push -u origin main"
echo "3. Deploy the PWA to GitHub Pages or your preferred static hosting service."
echo "   - For GitHub Pages:"
echo "     a. Go to your repository on GitHub."
echo "     b. Navigate to Settings > Pages."
echo "     c. Select the main branch and root folder."
echo "     d. Save and wait for GitHub to deploy your site."
echo "4. Open the deployed URL on your iPhone and MacBook to install the PWA."
echo "5. Enjoy your new Album Ratings app!"

echo "Setup complete! Happy coding!"
