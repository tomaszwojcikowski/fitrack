// Data persistence layer for FiTrack
export class StorageManager {
    constructor() {
        this.storageKey = 'fitrack_data';
    }

    loadData() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Error loading data:', e);
                return null;
            }
        }
        return null;
    }

    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    }

    clearData() {
        localStorage.removeItem(this.storageKey);
    }

    hasSeenWelcome() {
        return localStorage.getItem('fitrack_welcome_seen') === 'true';
    }

    markWelcomeSeen() {
        localStorage.setItem('fitrack_welcome_seen', 'true');
    }
}
