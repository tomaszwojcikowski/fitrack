// Simple Sync Service for FiTrack
// Uses GitHub Personal Access Token (PAT) for direct API access
// No OAuth flow, no CORS proxy needed - much simpler and more reliable

export class SimpleSyncService {
    constructor() {
        this.apiBase = 'https://api.github.com';
        this.gistFileName = 'fitrack-data.json';
        this.gistDescription = 'FiTrack - Fitness Progress Data (Private)';
        this.syncInterval = null;
        this.lastSyncedData = null;
    }

    /**
     * Get stored GitHub token
     */
    getToken() {
        return localStorage.getItem('fitrack_github_token');
    }

    /**
     * Store GitHub token
     */
    setToken(token) {
        if (token && token.trim()) {
            localStorage.setItem('fitrack_github_token', token.trim());
            return true;
        }
        return false;
    }

    /**
     * Clear stored token and stop auto-sync
     */
    disconnect() {
        localStorage.removeItem('fitrack_github_token');
        localStorage.removeItem('fitrack_gist_id');
        this.stopAutoSync();
        this.lastSyncedData = null;
    }

    /**
     * Get Gist ID
     */
    getGistId() {
        return localStorage.getItem('fitrack_gist_id');
    }

    /**
     * Set Gist ID
     */
    setGistId(gistId) {
        localStorage.setItem('fitrack_gist_id', gistId);
    }

    /**
     * Check if token is valid by making a test API call
     */
    async verifyToken(token) {
        try {
            const response = await fetch(`${this.apiBase}/user`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github+json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    /**
     * Get API headers
     */
    getHeaders(token) {
        return {
            'Authorization': `token ${token || this.getToken()}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Find existing FiTrack Gist
     */
    async findGist(token) {
        try {
            const response = await fetch(`${this.apiBase}/gists`, {
                headers: this.getHeaders(token)
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch gists: ${response.status}`);
            }

            const gists = await response.json();
            const fitrackGist = gists.find(gist => 
                gist.description === this.gistDescription &&
                gist.files[this.gistFileName]
            );

            return fitrackGist;
        } catch (error) {
            console.error('Error finding gist:', error);
            throw error;
        }
    }

    /**
     * Create new Gist with data
     */
    async createGist(data, token) {
        try {
            const response = await fetch(`${this.apiBase}/gists`, {
                method: 'POST',
                headers: this.getHeaders(token),
                body: JSON.stringify({
                    description: this.gistDescription,
                    public: false,
                    files: {
                        [this.gistFileName]: {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to create gist: ${response.status}`);
            }

            const gist = await response.json();
            this.setGistId(gist.id);
            return gist;
        } catch (error) {
            console.error('Error creating gist:', error);
            throw error;
        }
    }

    /**
     * Get data from Gist
     */
    async pullData(token) {
        const gistId = this.getGistId();
        if (!gistId) {
            throw new Error('No Gist ID found');
        }

        try {
            const response = await fetch(`${this.apiBase}/gists/${gistId}`, {
                headers: this.getHeaders(token)
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Gist was deleted, clear ID
                    localStorage.removeItem('fitrack_gist_id');
                    throw new Error('Gist not found');
                }
                throw new Error(`Failed to fetch gist: ${response.status}`);
            }

            const gist = await response.json();
            const content = gist.files[this.gistFileName]?.content;
            
            if (!content) {
                throw new Error('Data file not found in Gist');
            }

            return JSON.parse(content);
        } catch (error) {
            console.error('Error pulling data:', error);
            throw error;
        }
    }

    /**
     * Update Gist with new data
     */
    async pushData(data, token) {
        const gistId = this.getGistId();
        if (!gistId) {
            throw new Error('No Gist ID found');
        }

        // Update lastSync timestamp
        data.lastSync = new Date().toISOString();

        try {
            const response = await fetch(`${this.apiBase}/gists/${gistId}`, {
                method: 'PATCH',
                headers: this.getHeaders(token),
                body: JSON.stringify({
                    files: {
                        [this.gistFileName]: {
                            content: JSON.stringify(data, null, 2)
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to update gist: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error pushing data:', error);
            throw error;
        }
    }

    /**
     * Initialize sync - find or create Gist
     */
    async initialize(localData, token) {
        token = token || this.getToken();
        if (!token) {
            throw new Error('No token provided');
        }

        // Verify token works
        const isValid = await this.verifyToken(token);
        if (!isValid) {
            throw new Error('Invalid token');
        }

        // Check if we have a stored Gist ID
        let gistId = this.getGistId();
        if (gistId) {
            try {
                // Try to fetch it
                await this.pullData(token);
                return { action: 'found', gistId };
            } catch (error) {
                // Gist doesn't exist, will search for it
                console.warn('Stored Gist ID invalid:', error.message);
            }
        }

        // Search for existing Gist
        const existingGist = await this.findGist(token);
        if (existingGist) {
            this.setGistId(existingGist.id);
            return { action: 'found', gistId: existingGist.id };
        }

        // Create new Gist
        const gist = await this.createGist(localData, token);
        return { action: 'created', gistId: gist.id };
    }

    /**
     * Sync data with cloud (last-write-wins)
     */
    async sync(localData, token) {
        token = token || this.getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        try {
            // Initialize if needed
            const initResult = await this.initialize(localData, token);
            
            if (initResult.action === 'created') {
                // Just created, data is already uploaded
                this.lastSyncedData = JSON.stringify(localData);
                return { action: 'uploaded', message: 'Initial upload complete' };
            }

            // Pull remote data
            const remoteData = await this.pullData(token);
            
            // Compare timestamps
            const localTime = new Date(localData.lastSync || 0).getTime();
            const remoteTime = new Date(remoteData.lastSync || 0).getTime();

            if (remoteTime > localTime) {
                // Remote is newer
                this.lastSyncedData = JSON.stringify(remoteData);
                return { action: 'downloaded', data: remoteData, message: 'Downloaded newer data from cloud' };
            } else if (localTime > remoteTime || JSON.stringify(localData) !== this.lastSyncedData) {
                // Local is newer or has changes
                await this.pushData(localData, token);
                this.lastSyncedData = JSON.stringify(localData);
                return { action: 'uploaded', message: 'Uploaded local data to cloud' };
            } else {
                // Already in sync
                return { action: 'synced', message: 'Already in sync' };
            }
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    }

    /**
     * Start automatic background sync
     * Syncs every 5 minutes if there are changes
     */
    startAutoSync(getDataCallback, applyDataCallback, onSyncCallback) {
        // Clear any existing interval
        this.stopAutoSync();

        // Sync every 5 minutes
        this.syncInterval = setInterval(async () => {
            try {
                const token = this.getToken();
                if (!token) return;

                const localData = getDataCallback();
                const result = await this.sync(localData, token);
                
                if (result.action === 'downloaded' && result.data) {
                    // Apply remote data
                    applyDataCallback(result.data);
                }

                if (onSyncCallback) {
                    onSyncCallback(result);
                }
            } catch (error) {
                console.error('Auto-sync error:', error);
                // Don't show notification for background sync errors
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    /**
     * Stop automatic sync
     */
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return !!this.getToken();
    }
}
