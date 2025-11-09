// Gist Sync Service for FiTrack
// Handles syncing fitness data to/from GitHub Gist

export class GistSyncService {
    constructor(accessToken) {
        this.accessToken = accessToken;
        this.gistId = localStorage.getItem('fitrack_gist_id') || null;
        this.gistFileName = 'fitrack-data.json';
        this.gistDescription = 'FiTrack - Fitness Progress Data (Private)';
        this.apiBase = 'https://api.github.com';
    }

    /**
     * Get API headers for GitHub requests
     */
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json'
        };
    }

    /**
     * Initialize Gist structure
     */
    createInitialData() {
        return {
            version: '1.0',
            workouts: [],
            exercises: [],
            progress: [],
            settings: {},
            createdAt: new Date().toISOString(),
            lastSync: new Date().toISOString()
        };
    }

    /**
     * Find existing FiTrack Gist or return null
     */
    async findExistingGist() {
        try {
            const response = await fetch(`${this.apiBase}/gists`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch gists: ${response.status}`);
            }

            const gists = await response.json();
            
            // Look for our FiTrack gist by description
            const fitrackGist = gists.find(gist => 
                gist.description === this.gistDescription &&
                gist.files[this.gistFileName]
            );

            return fitrackGist || null;
        } catch (error) {
            console.error('Error finding existing gist:', error);
            throw new Error('Failed to search for existing data. Please check your connection.');
        }
    }

    /**
     * Create a new Gist with initial data
     */
    async createGist(data) {
        try {
            const response = await fetch(`${this.apiBase}/gists`, {
                method: 'POST',
                headers: this.getHeaders(),
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
            this.gistId = gist.id;
            localStorage.setItem('fitrack_gist_id', gist.id);
            
            return gist;
        } catch (error) {
            console.error('Error creating gist:', error);
            throw new Error('Failed to create cloud storage. Please try again.');
        }
    }

    /**
     * Initialize sync - find or create Gist
     */
    async initialize() {
        // Try to use stored Gist ID first
        if (this.gistId) {
            try {
                const data = await this.pullData();
                if (data) {
                    return { success: true, gistId: this.gistId, data };
                }
            } catch (error) {
                console.warn('Stored Gist ID invalid, searching for existing gist');
                this.gistId = null;
                localStorage.removeItem('fitrack_gist_id');
            }
        }

        // Search for existing Gist
        const existingGist = await this.findExistingGist();
        
        if (existingGist) {
            this.gistId = existingGist.id;
            localStorage.setItem('fitrack_gist_id', existingGist.id);
            
            // Parse existing data
            const content = existingGist.files[this.gistFileName].content;
            const data = JSON.parse(content);
            
            return { success: true, gistId: this.gistId, data, existing: true };
        }

        // No existing Gist, create a new one
        const initialData = this.createInitialData();
        await this.createGist(initialData);
        
        return { success: true, gistId: this.gistId, data: initialData, created: true };
    }

    /**
     * Pull data from Gist
     */
    async pullData() {
        if (!this.gistId) {
            throw new Error('No Gist ID available. Please initialize first.');
        }

        try {
            const response = await fetch(`${this.apiBase}/gists/${this.gistId}`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Gist not found');
                }
                throw new Error(`Failed to fetch gist: ${response.status}`);
            }

            const gist = await response.json();
            const fileContent = gist.files[this.gistFileName]?.content;
            
            if (!fileContent) {
                throw new Error('FiTrack data file not found in Gist');
            }

            return JSON.parse(fileContent);
        } catch (error) {
            console.error('Error pulling data:', error);
            throw new Error('Failed to download data from cloud. Please try again.');
        }
    }

    /**
     * Push data to Gist
     */
    async pushData(data) {
        if (!this.gistId) {
            throw new Error('No Gist ID available. Please initialize first.');
        }

        // Update lastSync timestamp
        data.lastSync = new Date().toISOString();

        try {
            const response = await fetch(`${this.apiBase}/gists/${this.gistId}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
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
            throw new Error('Failed to upload data to cloud. Please try again.');
        }
    }

    /**
     * Sync local data with cloud data using last-write-wins strategy
     */
    async sync(localData) {
        try {
            // Ensure Gist is initialized
            if (!this.gistId) {
                const initResult = await this.initialize();
                if (initResult.created) {
                    // New Gist created, push local data
                    await this.pushData(localData);
                    return {
                        success: true,
                        action: 'uploaded',
                        message: 'Local data uploaded to cloud'
                    };
                }
            }

            // Pull remote data
            const remoteData = await this.pullData();

            // Compare timestamps
            const localTimestamp = localData.lastSync ? new Date(localData.lastSync) : new Date(0);
            const remoteTimestamp = remoteData.lastSync ? new Date(remoteData.lastSync) : new Date(0);

            if (remoteTimestamp > localTimestamp) {
                // Remote is newer, use remote data
                return {
                    success: true,
                    action: 'downloaded',
                    message: 'Cloud data is newer',
                    data: remoteData
                };
            } else if (localTimestamp > remoteTimestamp) {
                // Local is newer, push local data
                await this.pushData(localData);
                return {
                    success: true,
                    action: 'uploaded',
                    message: 'Local data uploaded to cloud'
                };
            } else {
                // Same timestamp, no sync needed (but push anyway to be safe)
                await this.pushData(localData);
                return {
                    success: true,
                    action: 'synced',
                    message: 'Data already in sync'
                };
            }
        } catch (error) {
            console.error('Sync error:', error);
            throw error;
        }
    }

    /**
     * Validate Gist data structure
     */
    validateData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }

        const requiredFields = ['version', 'workouts', 'exercises', 'progress', 'settings'];
        return requiredFields.every(field => field in data);
    }

    /**
     * Clear stored Gist ID (for disconnection)
     */
    clearGistId() {
        this.gistId = null;
        localStorage.removeItem('fitrack_gist_id');
    }
}
