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

