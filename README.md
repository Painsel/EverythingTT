# EverythingTT

Welcome to **EverythingTT**, the infinite platform for Economy, Video Sharing, and Journalism.

## 🚀 Overview

EverythingTT is a modular web application hosted on GitHub Pages, designed with "Infinite Uptime" and maintainability in mind. It integrates with **Territorial.io** for its economy system (Gold) and uses a custom "JSON as Database" architecture backed by GitHub Repositories.

### Modules

1.  **Economy (`/eco`)**:
    *   **Casino**: Play games and bet Gold.
    *   **Marketplace**: Buy/Sell items.
    *   **Inventory**: Manage assets.
    *   **Trading**: Real-time trading system.
2.  **Tube (`/tube`)**:
    *   YouTube clone for videos and shorts.
    *   **Studio**: Manage channels and uploads.
    *   **Music**: Music streaming section.
3.  **News (`/news`)**:
    *   Journalism platform.
    *   Create and publish articles with a rich editor.

## 🛠 Architecture

*   **Frontend**: Static HTML/CSS/JS hosted on GitHub Pages.
*   **Backend**: Node.js server (`server/server.js`) acting as an API Gateway.
    *   Can be hosted on Vercel, Heroku, or a VPS.
    *   Handles Territorial.io API requests (CORS proxy).
    *   Manages "Database" operations.
*   **Database**: A separate GitHub Repository (`EverythingTT-DB`) storing JSON files.
    *   Structure: `/users`, `/articles`, `/videos`, `/economy`.
    *   Accessed via GitHub API by the Backend.
*   **Media**: Supabase Storage for large files (Videos, Images, Audio).

## 📦 Setup Instructions

### 1. Frontend Deployment
Simply push this repository to GitHub and enable **GitHub Pages** in the repository settings.

### 2. Backend Setup
1.  Navigate to the `server/` directory.
2.  Install dependencies: `npm install express cors node-fetch @octokit/rest`
3.  Set environment variables:
    *   `GITHUB_PAT`: A Personal Access Token with repo access.
    *   `GITHUB_REPO_OWNER`: Your GitHub username.
    *   `GITHUB_REPO_NAME`: The name of your database repository.
4.  Run the server: `node server.js`

### 3. Database Repository
Create a new private repository named `EverythingTT-DB` and initialize it with folders: `users`, `articles`, `videos`.

## 🤝 Contributing
Modular design allows easy addition of new features. Each module is self-contained in its directory.

## 📄 License
MIT License.
