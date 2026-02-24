/**
 * Cron Job Script: Calculate Hot Rank for Videos
 * Designed to be run via GitHub Actions.
 * 
 * Logic:
 * 1. Fetch all video JSONs from DB.
 * 2. Calculate rank: (Views * 1 + Likes * 5 + Comments * 10) / Hours_Since_Upload
 * 3. Sort and update a 'trending.json' file.
 */

const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_PAT });
const CONFIG = {
    owner: process.env.GITHUB_REPO_OWNER || 'painsel',
    repo: process.env.GITHUB_REPO_NAME || 'EverythingTT-DB'
};

async function run() {
    try {
        console.log("Fetching videos...");
        // In a real scenario, we'd list files in 'db/tube/videos'
        // For this script, we'll assume we get a list of files (mocking the list logic)
        // const { data: files } = await octokit.repos.getContent({ ...CONFIG, path: 'db/tube/videos' });
        
        // Mock Data for demonstration
        const videos = [
            { id: 'v1', views: 1000, likes: 50, comments: 10, uploadDate: '2026-02-20T10:00:00Z' },
            { id: 'v2', views: 5000, likes: 200, comments: 50, uploadDate: '2026-02-23T10:00:00Z' } // Newer, higher score
        ];

        const ranked = videos.map(v => {
            const hours = Math.max(1, (Date.now() - new Date(v.uploadDate).getTime()) / (36e5));
            const score = (v.views + v.likes * 5 + v.comments * 10) / hours;
            return { ...v, score };
        }).sort((a, b) => b.score - a.score);

        console.log("Top Ranked:", ranked[0].id);

        // Save to trending.json
        // await octokit.repos.createOrUpdateFileContents({
        //     ...CONFIG,
        //     path: 'db/tube/trending.json',
        //     content: Buffer.from(JSON.stringify(ranked)).toString('base64'),
        //     message: 'Update Trending'
        // });

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

run();
