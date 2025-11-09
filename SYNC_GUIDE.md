# FiTrack Cloud Sync Guide

## Overview

FiTrack now uses a simplified, reliable GitHub sync method that requires no complex OAuth flow or CORS proxies. Your workout data is automatically synced to a private GitHub Gist.

## Features

- ✅ **Simple Setup** - Just paste your GitHub token once
- ✅ **Auto-Sync** - Syncs every 5 minutes automatically
- ✅ **No CORS Proxy** - Direct GitHub API calls (no ad blocker issues!)
- ✅ **Workout Sync** - Automatically syncs after completing workouts
- ✅ **Private Storage** - Data stored in private GitHub Gists
- ✅ **Cross-Device** - Access your data from any device

## Setup Instructions

### Step 1: Create a GitHub Personal Access Token

1. Go to [GitHub Token Settings](https://github.com/settings/tokens/new?scopes=gist&description=FiTrack)
2. The page will be pre-filled with:
   - **Note**: FiTrack
   - **Scope**: `gist` (only this scope is needed)
3. Scroll down and click **"Generate token"**
4. **IMPORTANT**: Copy the token immediately - you won't be able to see it again!

### Step 2: Connect FiTrack

1. Open FiTrack and navigate to **Settings** (gear icon)
2. Find the **Cloud Sync** section
3. Paste your GitHub token into the text field
4. Click **"Connect"**

That's it! FiTrack will:
- Verify your token
- Create a private Gist for your data (or find an existing one)
- Perform an initial sync
- Start automatic background sync every 5 minutes

## How It Works

### Initial Sync

When you first connect:
1. FiTrack searches for an existing "FiTrack - Fitness Progress Data (Private)" Gist
2. If found, it downloads your existing data
3. If not found, it creates a new private Gist with your local data

### Automatic Sync

After connecting, FiTrack automatically syncs:
- **Every 5 minutes** - Background sync checks for changes
- **After workouts** - When you finish a workout, it syncs immediately
- **Manual sync** - Click "Sync Now" button anytime

### Sync Strategy

FiTrack uses a "last-write-wins" strategy:
- Compares timestamps between local and cloud data
- Always keeps the most recent version
- Updates are seamless and automatic

## Data Structure

Your data is stored in a private GitHub Gist as JSON:

```json
{
  "version": "1.0",
  "workouts": [
    {
      "date": "2024-01-15",
      "exercises": [...]
    }
  ],
  "exercises": [],
  "progress": [],
  "settings": {
    "activeProgram": null
  },
  "createdAt": "2024-01-15T10:00:00.000Z",
  "lastSync": "2024-01-15T10:30:00.000Z"
}
```

## Security & Privacy

### Token Security
- Tokens are stored locally in your browser's localStorage
- Tokens are never sent to any server except GitHub's API
- Use tokens with **only** the `gist` scope (minimal permissions)

### Data Privacy
- All Gists are created as **private** by default
- Only you can access your fitness data
- Data is never shared or transmitted to third parties
- Direct API communication with GitHub (no intermediaries)

### Token Management
- You can revoke tokens anytime at [GitHub Settings](https://github.com/settings/tokens)
- Disconnecting FiTrack removes the token from localStorage
- Your cloud data remains in GitHub until you delete the Gist

## Troubleshooting

### "Invalid token" Error
- Make sure you copied the entire token (starts with `ghp_`)
- Verify the token has the `gist` scope
- Check if the token hasn't been revoked

### Sync Fails
- Check your internet connection
- Verify GitHub is accessible
- Try disconnecting and reconnecting
- Check if you've hit GitHub API rate limits (5000 requests/hour)

### "Gist not found" Error
- The Gist may have been deleted
- Click "Disconnect" and reconnect to create a new Gist

### Can't See Connected State
- Make sure you're in the Settings view
- The token input should disappear and show "Connected to GitHub"
- If not, try refreshing the page

## Managing Your Data

### View Your Gist
1. Go to [GitHub Gists](https://gist.github.com/)
2. Look for "FiTrack - Fitness Progress Data (Private)"
3. Click to view (but don't edit manually - FiTrack manages this)

### Backup Your Data
Your data is automatically backed up to GitHub, but you can also:
1. Go to your FiTrack Gist on GitHub
2. Click "Download ZIP" to download a local copy
3. Or copy the JSON content manually

### Delete Your Data
1. Disconnect from GitHub in FiTrack Settings
2. Go to [GitHub Gists](https://gist.github.com/)
3. Find your FiTrack Gist
4. Click "Delete this Gist"

## Comparison: Old vs New Sync

| Feature | Old (Device Flow OAuth) | New (PAT) |
|---------|------------------------|-----------|
| Setup Complexity | 3 steps with code entry | 1 step: paste token |
| CORS Proxy | Required (unreliable) | Not needed |
| Ad Blocker Issues | Common | None |
| Auto-Sync | Manual only | Every 5 minutes |
| Token Security | Same | Same |
| Reliability | Low | High |

## FAQ

### Q: Is my token safe?
A: Your token is stored only in your browser's localStorage and is never transmitted except to GitHub's official API. Use tokens with minimal scope (`gist` only).

### Q: Can I use the same token on multiple devices?
A: Yes! Create one token and use it on all your devices. They'll all sync to the same Gist.

### Q: What if I lose my token?
A: You can create a new token anytime and reconnect. Your cloud data remains safe in the existing Gist.

### Q: Does this work offline?
A: FiTrack works fully offline. Sync only happens when you have an internet connection. Changes made offline will sync once you're back online.

### Q: How much storage do I get?
A: GitHub Gists have no practical size limit for text data. Your workout history would need to be enormous to hit any limits.

### Q: Can I share my workout data?
A: The Gist is private by default, but you can change it to public in GitHub if you want to share. However, this isn't recommended for privacy.

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify your token has the correct scope
3. Try disconnecting and reconnecting
4. Check the browser console for error messages

## Technical Details

For developers interested in how it works:

- **Service**: `services/simpleSyncService.js`
- **GitHub API**: Direct REST API calls using fetch()
- **Authentication**: Bearer token in Authorization header
- **Endpoints Used**:
  - `GET /gists` - Find existing Gists
  - `POST /gists` - Create new Gist
  - `GET /gists/:id` - Read Gist data
  - `PATCH /gists/:id` - Update Gist data
  - `GET /user` - Token verification

No dependencies, no OAuth flow, no CORS proxy - just simple, reliable API calls.
