// Personal Record (PR) Detection System
// Detects and tracks various types of PRs

export class PRDetector {
    constructor() {
        this.prRecords = this.loadPRs();
    }

    loadPRs() {
        try {
            const stored = localStorage.getItem('fitrack_prs');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error loading PRs:', e);
            return {};
        }
    }

    savePRs() {
        try {
            localStorage.setItem('fitrack_prs', JSON.stringify(this.prRecords));
        } catch (e) {
            console.error('Error saving PRs:', e);
        }
    }

    // Check if a set is a PR and update records
    checkAndUpdatePR(exerciseName, set, date) {
        const prs = [];
        const exerciseKey = this.normalizeExerciseName(exerciseName);
        
        if (!this.prRecords[exerciseKey]) {
            this.prRecords[exerciseKey] = {
                name: exerciseName,
                records: []
            };
        }

        const records = this.prRecords[exerciseKey].records;

        // Check different PR types
        if (set.weight && set.reps) {
            // 1. Max weight for rep count
            const repsPR = this.checkMaxWeightForReps(records, set.reps, set.weight, date);
            if (repsPR) {
                prs.push({ type: 'max_weight_reps', ...repsPR });
            }

            // 2. Max reps for weight
            const weightPR = this.checkMaxRepsForWeight(records, set.weight, set.reps, date);
            if (weightPR) {
                prs.push({ type: 'max_reps_weight', ...weightPR });
            }

            // 3. Total volume (weight × reps)
            const volumePR = this.checkMaxVolume(records, set.weight * set.reps, date, set);
            if (volumePR) {
                prs.push({ type: 'max_volume', ...volumePR });
            }

            // 4. One rep max estimate (Brzycki formula)
            const orm = this.calculateOneRepMax(set.weight, set.reps);
            const ormPR = this.checkMaxOneRepMax(records, orm, date, set);
            if (ormPR) {
                prs.push({ type: 'max_1rm', ...ormPR });
            }
        }

        // 5. Fastest time (for timed exercises)
        if (set.time) {
            const timePR = this.checkFastestTime(records, set.time, date, set);
            if (timePR) {
                prs.push({ type: 'fastest_time', ...timePR });
            }
        }

        // Update records if any PRs were set
        if (prs.length > 0) {
            this.updateRecords(exerciseKey, prs, set, date);
            this.savePRs();
        }

        return prs;
    }

    checkMaxWeightForReps(records, reps, weight, date) {
        const existing = records.find(r => r.type === 'max_weight_reps' && r.reps === reps);
        
        if (!existing || weight > existing.weight) {
            return {
                reps,
                weight,
                previousWeight: existing ? existing.weight : null,
                date
            };
        }
        
        return null;
    }

    checkMaxRepsForWeight(records, weight, reps, date) {
        const existing = records.find(r => r.type === 'max_reps_weight' && r.weight === weight);
        
        if (!existing || reps > existing.reps) {
            return {
                weight,
                reps,
                previousReps: existing ? existing.reps : null,
                date
            };
        }
        
        return null;
    }

    checkMaxVolume(records, volume, date, set) {
        const existing = records.find(r => r.type === 'max_volume');
        
        if (!existing || volume > existing.volume) {
            return {
                volume,
                weight: set.weight,
                reps: set.reps,
                previousVolume: existing ? existing.volume : null,
                date
            };
        }
        
        return null;
    }

    checkMaxOneRepMax(records, orm, date, set) {
        const existing = records.find(r => r.type === 'max_1rm');
        
        if (!existing || orm > existing.orm) {
            return {
                orm,
                weight: set.weight,
                reps: set.reps,
                previousOrm: existing ? existing.orm : null,
                date
            };
        }
        
        return null;
    }

    checkFastestTime(records, time, date, set) {
        const seconds = this.timeToSeconds(time);
        const existing = records.find(r => r.type === 'fastest_time');
        
        if (!existing || seconds < this.timeToSeconds(existing.time)) {
            return {
                time,
                previousTime: existing ? existing.time : null,
                date
            };
        }
        
        return null;
    }

    updateRecords(exerciseKey, prs, set, date) {
        prs.forEach(pr => {
            const existingIndex = this.prRecords[exerciseKey].records.findIndex(
                r => r.type === pr.type && 
                (pr.reps === undefined || r.reps === pr.reps) &&
                (pr.weight === undefined || r.weight === pr.weight)
            );

            const record = { ...pr, set, achievedAt: date };

            if (existingIndex >= 0) {
                this.prRecords[exerciseKey].records[existingIndex] = record;
            } else {
                this.prRecords[exerciseKey].records.push(record);
            }
        });
    }

    // Calculate estimated one rep max using Brzycki formula
    calculateOneRepMax(weight, reps) {
        if (reps === 1) return weight;
        return Math.round(weight * (36 / (37 - reps)) * 10) / 10;
    }

    // Convert time string (MM:SS) to seconds
    timeToSeconds(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        return parseInt(timeStr);
    }

    // Normalize exercise name for consistent key storage
    normalizeExerciseName(name) {
        return name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    }

    // Get all PRs for an exercise
    getExercisePRs(exerciseName) {
        const key = this.normalizeExerciseName(exerciseName);
        return this.prRecords[key] || { name: exerciseName, records: [] };
    }

    // Get all PRs across all exercises
    getAllPRs() {
        return Object.values(this.prRecords);
    }

    // Get recent PRs (within last N days)
    getRecentPRs(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const recentPRs = [];
        
        Object.values(this.prRecords).forEach(exercise => {
            exercise.records.forEach(record => {
                const recordDate = new Date(record.date);
                if (recordDate >= cutoffDate) {
                    recentPRs.push({
                        exercise: exercise.name,
                        ...record
                    });
                }
            });
        });

        // Sort by date (most recent first)
        return recentPRs.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Format PR for display
    formatPR(pr) {
        switch (pr.type) {
            case 'max_weight_reps':
                return `${pr.weight} kg × ${pr.reps} reps`;
            case 'max_reps_weight':
                return `${pr.reps} reps @ ${pr.weight} kg`;
            case 'max_volume':
                return `${pr.volume} kg total (${pr.weight} kg × ${pr.reps})`;
            case 'max_1rm':
                return `${pr.orm} kg (estimated 1RM)`;
            case 'fastest_time':
                return `${pr.time}`;
            default:
                return 'Personal Record';
        }
    }

    // Get PR description
    getPRDescription(pr) {
        switch (pr.type) {
            case 'max_weight_reps':
                return `Heaviest weight for ${pr.reps} reps`;
            case 'max_reps_weight':
                return `Most reps at ${pr.weight} kg`;
            case 'max_volume':
                return 'Highest total volume';
            case 'max_1rm':
                return 'Highest estimated 1RM';
            case 'fastest_time':
                return 'Fastest time';
            default:
                return 'Personal Record';
        }
    }
}

// Create singleton instance
export const prDetector = new PRDetector();
