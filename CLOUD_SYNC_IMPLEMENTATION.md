# Cloud Sync Feature Implementation

## Overview

This document describes the implementation of the cloud sync feature for FiTrack, which allows users to securely sync their fitness data with GitHub Gists using Device Flow OAuth authentication.

## Architecture

### Core Components

1. **GitHubDeviceAuth Service** (`services/githubDeviceAuth.js`)
   - Handles GitHub Device Flow OAuth authentication
   - Uses public CLI client ID: `Iv1.b507a08c87ecfe98`
   - No backend required - pure client-side implementation
   - Requests only `gist` scope for minimal permissions

2. **GistSyncService** (`services/gistSyncService.js`)
   - Manages data synchronization with GitHub Gist
   - Creates/finds private Gist named "FiTrack - Fitness Progress Data (Private)"
   - Implements last-write-wins sync strategy
   - Validates data structure before applying changes

3. **SyncModal Component** (`components/syncModal.js`)
   - User-friendly authentication modal
   - Three-step authentication process
   - Device code display with copy-to-clipboard
   - Animated waiting indicator
   - Error handling and feedback

## Data Structure

### Gist File Format

The Gist contains a single file `fitrack-data.json` with the following structure:

```json
{
  "version": "1.0",
  "workouts": [
    {
      "date": "2024-01-15",
      "exercises": [
        {
          "name": "Bench Press",
          "category": "Chest",
          "equipment": "Barbell",
          "sets": [
            {
              "reps": "10",
              "weight": "100",
              "time": "",
              "useTime": false,
              "completed": true
            }
          ]
        }
      ]
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

### Local Storage

The implementation uses localStorage for:
- `github_token`: OAuth access token
- `fitrack_gist_id`: ID of the user's FiTrack Gist
- `fitrack_data`: Existing local workout data (unchanged)

## Authentication Flow

### Step 1: Device Code Request
```javascript
const { userCode, verificationUri, pollPromise } = await githubAuth.authenticate();
```

The service requests a device code from GitHub:
- Endpoint: `https://github.com/login/device/code`
- Method: POST
- Body: `{ client_id, scope: 'gist' }`

### Step 2: User Authorization
User is presented with:
1. Verification URL (https://github.com/login/device)
2. Device code (e.g., "ABCD-1234")
3. Instructions to authorize

### Step 3: Token Polling
Service polls GitHub for access token:
- Endpoint: `https://github.com/login/oauth/access_token`
- Handles states: authorization_pending, slow_down, expired_token, access_denied
- Auto-adjusts polling interval on slow_down
- Timeout after expiration period

### Step 4: Token Storage
Upon successful authentication:
- Token stored in `localStorage` as `github_token`
- Modal closes automatically
- UI updates to show "Sync Now" button

## Sync Strategy

### Last-Write-Wins Algorithm

```javascript
async sync(localData) {
  const remoteData = await this.pullData();
  
  const localTimestamp = new Date(localData.lastSync);
  const remoteTimestamp = new Date(remoteData.lastSync);
  
  if (remoteTimestamp > localTimestamp) {
    // Download remote data
    return { action: 'downloaded', data: remoteData };
  } else if (localTimestamp > remoteTimestamp) {
    // Upload local data
    await this.pushData(localData);
    return { action: 'uploaded' };
  } else {
    // Already in sync
    return { action: 'synced' };
  }
}
```

### First-Time Sync

On first sync:
1. Service searches for existing FiTrack Gist
2. If found, downloads and compares timestamps
3. If not found, creates new private Gist
4. Uploads local data to new Gist

## Error Handling

### Network Errors
- Catches fetch failures
- Displays user-friendly error messages
- Suggests checking network connection

### Authentication Errors
- Expired tokens: Prompts re-authentication
- Invalid credentials: Clears stored tokens
- Timeout: Allows retry with new device code

### Sync Errors
- Invalid data structure: Validates before applying
- API rate limits: Provides informative message
- Conflict detection: Last-write-wins prevents conflicts

## Security Considerations

### Token Storage
- Tokens stored in localStorage (not sessionStorage)
- Users should treat tokens as sensitive credentials
- Disconnect button clears all tokens

### Data Privacy
- Gists are private by default
- Only `gist` scope requested (minimal permissions)
- No third-party services involved
- Data never passes through any backend

### CSRF Protection
- Device Flow provides built-in CSRF protection
- No client secrets required
- Short-lived device codes (15 minutes)

## Testing

### Test Coverage

**22 new tests added** covering:

1. **GitHubDeviceAuth** (11 tests)
   - Initialization and configuration
   - Device code request success/failure
   - Token verification
   - Error handling

2. **GistSyncService** (11 tests)
   - Service initialization
   - Header generation
   - Data structure validation
   - Gist search and creation
   - Push/pull operations
   - Error scenarios

### Running Tests

```bash
npm test
```

All 111 tests pass (89 existing + 22 new).

## User Interface

### Sync Section (History View)

Located in the History view, provides:
- Current connection status
- "Connect GitHub" button (when disconnected)
- "Sync Now" button (when connected)
- "Disconnect" button (when connected)
- Status messages for sync operations

### Authentication Modal

Features:
- Clean, modern design matching app theme
- Mobile-responsive layout
- Three-step numbered instructions
- Large, monospace device code display
- One-click copy button with feedback
- Animated spinner during authentication
- Error display with retry capability

### Status Notifications

Three types of notifications:
- **Success** (green): Sync completed, authentication successful
- **Error** (red): Failures, expired tokens
- **Info** (blue): Status updates, informational messages

## API Usage

### GitHub API Endpoints

1. **Device Code Request**
   ```
   POST https://github.com/login/device/code
   Content-Type: application/json
   
   {
     "client_id": "Iv1.b507a08c87ecfe98",
     "scope": "gist"
   }
   ```

2. **Access Token Request**
   ```
   POST https://github.com/login/oauth/access_token
   Content-Type: application/json
   
   {
     "client_id": "Iv1.b507a08c87ecfe98",
     "device_code": "<device_code>",
     "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
   }
   ```

3. **List Gists**
   ```
   GET https://api.github.com/gists
   Authorization: Bearer <token>
   Accept: application/vnd.github+json
   X-GitHub-Api-Version: 2022-11-28
   ```

4. **Create Gist**
   ```
   POST https://api.github.com/gists
   Authorization: Bearer <token>
   Content-Type: application/json
   
   {
     "description": "FiTrack - Fitness Progress Data (Private)",
     "public": false,
     "files": {
       "fitrack-data.json": {
         "content": "<json_data>"
       }
     }
   }
   ```

5. **Update Gist**
   ```
   PATCH https://api.github.com/gists/<gist_id>
   Authorization: Bearer <token>
   Content-Type: application/json
   
   {
     "files": {
       "fitrack-data.json": {
         "content": "<json_data>"
       }
     }
   }
   ```

## Future Enhancements

Potential improvements for future versions:

1. **Conflict Resolution UI**
   - Show diff when conflicts detected
   - Allow user to choose which version to keep
   - Merge changes manually

2. **Sync History**
   - Display sync log with timestamps
   - Show what changed in each sync
   - Rollback capability

3. **Automatic Sync**
   - Background sync at intervals
   - Sync on workout completion
   - Service worker for offline sync queue

4. **Data Compression**
   - Compress large workout histories
   - Reduce Gist size and API usage

5. **Multi-Device Indicators**
   - Show last synced device
   - Conflict warnings from multiple devices

6. **Export/Import**
   - Export to JSON file
   - Import from other fitness apps
   - Backup to multiple locations

## Troubleshooting

### Common Issues

**"Failed to start authentication"**
- Check internet connection
- Verify GitHub is accessible
- Try again in a few moments

**"Session expired. Please reconnect."**
- Token has expired or been revoked
- Click "Connect GitHub" again
- Complete authentication flow

**"Failed to download data from cloud"**
- Check internet connection
- Verify Gist still exists in GitHub account
- Token may need refreshing

**"Gist not found"**
- Gist may have been deleted
- Click disconnect and reconnect
- Will create new Gist on next sync

### Debug Mode

To enable debug logging in browser console:
```javascript
localStorage.setItem('fitrack_debug', 'true');
```

## Conclusion

The cloud sync feature provides FiTrack users with a secure, private, and reliable way to backup and sync their fitness data across devices using GitHub's infrastructure. The implementation is pure client-side, requires no backend, and respects user privacy while providing a seamless experience.
