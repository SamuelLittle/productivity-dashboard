# Productivity Dashboard

A personal productivity dashboard web app that syncs data with your GitHub repository. Built as a single-page application for GitHub Pages.

## Features

- **Project Management**: Create and manage multiple projects with tasks and subtasks
- **Daily To-Do Lists**: Pull tasks from projects or create standalone daily tasks
- **Task Scheduling**: Schedule tasks for today, tomorrow, next week, or custom dates
- **Task Completion**: Mark tasks complete with optional notes and links
- **Progress Tracking**: Add progress updates to projects
- **Archive**: Archive completed projects while keeping them accessible
- **Monthly Reports**: Export completed work as Markdown, JSON, or plain text
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **GitHub Sync**: Data stored in your GitHub repository via the GitHub API

## Setup Instructions

### 1. Fork or Clone This Repository

```bash
git clone https://github.com/YOUR_USERNAME/productivity-dashboard.git
cd productivity-dashboard
```

### 2. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Productivity Dashboard")
4. Select the `repo` scope (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token** - you won't be able to see it again!

### 3. Configure the Application

Edit `app.js` and update the `CONFIG` object at the top:

```javascript
const CONFIG = {
    clientId: 'YOUR_GITHUB_CLIENT_ID', // Not needed for PAT auth
    owner: 'YOUR_GITHUB_USERNAME',     // Your GitHub username
    repo: 'productivity-dashboard',     // This repository name
    branch: 'main',
    dataFile: 'data.json',
    authProxy: null
};
```

### 4. Enable GitHub Pages

1. Go to your repository Settings
2. Navigate to "Pages" in the sidebar
3. Under "Source", select "Deploy from a branch"
4. Select the `main` branch and `/ (root)` folder
5. Click "Save"
6. Wait a few minutes for the site to deploy

Your dashboard will be available at: `https://YOUR_USERNAME.github.io/productivity-dashboard/`

### 5. First Login

1. Visit your GitHub Pages URL
2. Click "Sign in with GitHub"
3. Enter your Personal Access Token when prompted
4. The token is stored locally in your browser

## File Structure

```
productivity-dashboard/
├── index.html      # Main HTML structure
├── styles.css      # All styling (responsive)
├── app.js          # Application logic and GitHub API
├── data.json       # Your productivity data (synced with GitHub)
└── README.md       # This file
```

## Data Structure

The `data.json` file contains:

```json
{
  "projects": [
    {
      "id": "unique_id",
      "name": "Project Name",
      "description": "Project description",
      "color": "#3b82f6",
      "archived": false,
      "tasks": [
        {
          "id": "task_id",
          "title": "Task title",
          "description": "Task description",
          "priority": "high|medium|low",
          "scheduledDate": "2025-01-20",
          "completed": false,
          "subtasks": [...]
        }
      ],
      "progressUpdates": [
        {
          "id": "update_id",
          "text": "Progress update text",
          "date": "2025-01-19T12:00:00.000Z"
        }
      ]
    }
  ],
  "dailyLists": {
    "2025-01-19": [
      {
        "id": "daily_task_id",
        "title": "Daily task",
        "priority": "medium",
        "completed": false
      }
    ]
  },
  "completedTasks": [...],
  "lastUpdated": "2025-01-19T12:00:00.000Z"
}
```

## Keyboard Shortcuts

- `Ctrl + N` - Create new task
- `Escape` - Close any open modal

## Security Notes

- Your Personal Access Token is stored in your browser's localStorage
- The token only has access to repositories you authorize
- Data is stored in your own GitHub repository
- No data is sent to third-party servers

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Customization

### Colors

Edit the CSS custom properties in `styles.css`:

```css
:root {
    --color-primary: #3b82f6;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-danger: #ef4444;
    /* ... */
}
```

### Project Colors

Add more color options in the project modal in `index.html`:

```html
<label class="color-option">
    <input type="radio" name="project-color" value="#YOUR_COLOR">
    <span class="color-swatch" style="background: #YOUR_COLOR"></span>
</label>
```

## Troubleshooting

### Data not syncing

1. Check that your Personal Access Token has the `repo` scope
2. Verify the `owner` and `repo` values in `CONFIG`
3. Ensure the `data.json` file exists in the repository

### 404 on GitHub Pages

1. Wait a few minutes after enabling GitHub Pages
2. Clear your browser cache
3. Check the repository is public (or you have GitHub Pro for private Pages)

### Token errors

1. Generate a new Personal Access Token
2. Make sure to copy the full token
3. Clear localStorage and re-enter the token

## Contributing

Feel free to fork this project and customize it for your needs!

## License

MIT License - feel free to use this for personal or commercial projects.
