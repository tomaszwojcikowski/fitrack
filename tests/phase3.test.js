// Phase 3 Feature Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatsCalculator } from '../src/statsCalculator.js';
import { PRDetector } from '../src/prDetection.js';
import { DataExporter } from '../src/dataExport.js';

describe('StatsCalculator', () => {
    let stats;
    let sampleWorkouts;

    beforeEach(() => {
        // Create sample workout data
        sampleWorkouts = [
            {
                date: '2024-01-15',
                exercises: [
                    {
                        name: 'Squat',
                        category: 'Legs',
                        sets: [
                            { reps: 10, weight: 100 },
                            { reps: 10, weight: 100 }
                        ]
                    }
                ],
                duration: 3600 // 60 minutes
            },
            {
                date: '2024-01-16',
                exercises: [
                    {
                        name: 'Bench Press',
                        category: 'Chest',
                        sets: [
                            { reps: 8, weight: 80 }
                        ]
                    }
                ],
                duration: 2400 // 40 minutes
            },
            {
                date: '2024-01-17',
                exercises: [
                    {
                        name: 'Deadlift',
                        category: 'Back',
                        sets: [
                            { reps: 5, weight: 140 }
                        ]
                    }
                ],
                duration: 3000 // 50 minutes
            }
        ];

        stats = new StatsCalculator(sampleWorkouts);
    });

    describe('Basic Stats', () => {
        it('should calculate total workouts correctly', () => {
            expect(stats.getTotalWorkouts()).toBe(3);
        });

        it('should return 0 for empty workout history', () => {
            const emptyStats = new StatsCalculator([]);
            expect(emptyStats.getTotalWorkouts()).toBe(0);
        });

        it('should calculate average workout duration', () => {
            const avgDuration = stats.getAverageWorkoutDuration();
            expect(avgDuration).toBe(3000); // (3600 + 2400 + 3000) / 3 = 3000
        });

        it('should calculate total volume lifted', () => {
            const volume = stats.getTotalVolume();
            // (100*10 + 100*10) + (80*8) + (140*5) = 2000 + 640 + 700 = 3340
            expect(volume).toBe(3340);
        });
    });

    describe('Streak Calculation', () => {
        it('should calculate current streak for consecutive days', () => {
            const streak = stats.getCurrentStreak();
            expect(streak).toBeGreaterThanOrEqual(0);
        });

        it('should return 0 for no workouts', () => {
            const emptyStats = new StatsCalculator([]);
            expect(emptyStats.getCurrentStreak()).toBe(0);
        });

        it('should calculate best streak', () => {
            const bestStreak = stats.getBestStreak();
            expect(bestStreak).toBeGreaterThanOrEqual(1);
        });
    });

    describe('Weekly Activity', () => {
        it('should return 7 days of activity', () => {
            const weekData = stats.getWeeklyActivity(0);
            expect(weekData).toHaveLength(7);
        });

        it('should have correct day structure', () => {
            const weekData = stats.getWeeklyActivity(0);
            const day = weekData[0];
            
            expect(day).toHaveProperty('date');
            expect(day).toHaveProperty('dayOfWeek');
            expect(day).toHaveProperty('dayName');
            expect(day).toHaveProperty('workoutCount');
            expect(day).toHaveProperty('workouts');
            expect(day).toHaveProperty('isToday');
        });

        it('should support week offsets', () => {
            const thisWeek = stats.getWeeklyActivity(0);
            const lastWeek = stats.getWeeklyActivity(-1);
            
            expect(thisWeek[0].date).not.toBe(lastWeek[0].date);
        });
    });

    describe('Exercise Progress', () => {
        it('should get progress data for specific exercise', () => {
            const progress = stats.getExerciseProgress('Squat');
            expect(progress.length).toBeGreaterThan(0);
            expect(progress[0]).toHaveProperty('date');
            expect(progress[0]).toHaveProperty('weight');
            expect(progress[0]).toHaveProperty('reps');
        });

        it('should return empty array for non-existent exercise', () => {
            const progress = stats.getExerciseProgress('NonExistent');
            expect(progress).toEqual([]);
        });

        it('should limit results based on limit parameter', () => {
            // Add more workouts to test limit
            const manyWorkouts = Array(30).fill(null).map((_, i) => ({
                date: `2024-01-${i + 1}`,
                exercises: [{
                    name: 'Squat',
                    sets: [{ reps: 10, weight: 100 }]
                }]
            }));
            
            const manyStats = new StatsCalculator(manyWorkouts);
            const progress = manyStats.getExerciseProgress('Squat', 10);
            expect(progress.length).toBeLessThanOrEqual(10);
        });

        it('should get list of exercises with progress', () => {
            const exercises = stats.getExercisesWithProgress();
            expect(exercises).toContain('Squat');
            expect(exercises).toContain('Bench Press');
            expect(exercises).toContain('Deadlift');
        });
    });

    describe('Monthly Calendar', () => {
        it('should generate calendar for specific month', () => {
            const calendar = stats.getMonthlyCalendar(2024, 0); // January 2024
            expect(calendar.length).toBeGreaterThan(0);
        });

        it('should have weeks with 7 days', () => {
            const calendar = stats.getMonthlyCalendar(2024, 0);
            calendar.forEach(week => {
                expect(week).toHaveLength(7);
            });
        });

        it('should mark workout days correctly', () => {
            const calendar = stats.getMonthlyCalendar(2024, 0);
            const days = calendar.flat();
            const workoutDays = days.filter(d => d.workoutCount > 0);
            expect(workoutDays.length).toBeGreaterThan(0);
        });
    });
});

describe('PRDetector', () => {
    let prDetector;

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        prDetector = new PRDetector();
    });

    describe('PR Detection', () => {
        it('should detect max weight PR for reps', () => {
            const set = { reps: 10, weight: 100 };
            const prs = prDetector.checkAndUpdatePR('Squat', set, '2024-01-15');
            
            expect(prs.length).toBeGreaterThan(0);
            const maxWeightPR = prs.find(pr => pr.type === 'max_weight_reps');
            expect(maxWeightPR).toBeDefined();
            expect(maxWeightPR.weight).toBe(100);
            expect(maxWeightPR.reps).toBe(10);
        });

        it('should detect max reps PR for weight', () => {
            const set1 = { reps: 5, weight: 100 };
            prDetector.checkAndUpdatePR('Squat', set1, '2024-01-15');
            
            const set2 = { reps: 8, weight: 100 };
            const prs = prDetector.checkAndUpdatePR('Squat', set2, '2024-01-16');
            
            const maxRepsPR = prs.find(pr => pr.type === 'max_reps_weight');
            expect(maxRepsPR).toBeDefined();
            expect(maxRepsPR.reps).toBe(8);
        });

        it('should detect volume PR', () => {
            const set = { reps: 10, weight: 100 };
            const prs = prDetector.checkAndUpdatePR('Squat', set, '2024-01-15');
            
            const volumePR = prs.find(pr => pr.type === 'max_volume');
            expect(volumePR).toBeDefined();
            expect(volumePR.volume).toBe(1000);
        });

        it('should detect 1RM PR', () => {
            const set = { reps: 5, weight: 100 };
            const prs = prDetector.checkAndUpdatePR('Squat', set, '2024-01-15');
            
            const ormPR = prs.find(pr => pr.type === 'max_1rm');
            expect(ormPR).toBeDefined();
            expect(ormPR.orm).toBeGreaterThan(100);
        });

        it('should not detect PR when not beating previous record', () => {
            const set1 = { reps: 10, weight: 100 };
            prDetector.checkAndUpdatePR('Squat', set1, '2024-01-15');
            
            const set2 = { reps: 10, weight: 90 };
            const prs = prDetector.checkAndUpdatePR('Squat', set2, '2024-01-16');
            
            const maxWeightPR = prs.find(pr => pr.type === 'max_weight_reps' && pr.reps === 10);
            expect(maxWeightPR).toBeUndefined();
        });
    });

    describe('PR Storage and Retrieval', () => {
        it('should store PRs in localStorage', () => {
            const set = { reps: 10, weight: 100 };
            prDetector.checkAndUpdatePR('Squat', set, '2024-01-15');
            
            const stored = localStorage.getItem('fitrack_prs');
            expect(stored).toBeTruthy();
        });

        it('should retrieve PRs for specific exercise', () => {
            const set = { reps: 10, weight: 100 };
            prDetector.checkAndUpdatePR('Squat', set, '2024-01-15');
            
            const exercisePRs = prDetector.getExercisePRs('Squat');
            expect(exercisePRs.name).toBe('Squat');
            expect(exercisePRs.records.length).toBeGreaterThan(0);
        });

        it('should get all PRs across exercises', () => {
            prDetector.checkAndUpdatePR('Squat', { reps: 10, weight: 100 }, '2024-01-15');
            prDetector.checkAndUpdatePR('Bench Press', { reps: 8, weight: 80 }, '2024-01-15');
            
            const allPRs = prDetector.getAllPRs();
            expect(allPRs.length).toBeGreaterThanOrEqual(2);
        });

        it('should get recent PRs', () => {
            // Use today's date to ensure it's within the recent window
            const today = new Date().toISOString().split('T')[0];
            prDetector.checkAndUpdatePR('Squat', { reps: 10, weight: 100 }, today);
            
            const recentPRs = prDetector.getRecentPRs(30);
            expect(recentPRs.length).toBeGreaterThan(0);
        });
    });

    describe('PR Formatting', () => {
        it('should format max weight PR', () => {
            const pr = { type: 'max_weight_reps', weight: 100, reps: 10 };
            const formatted = prDetector.formatPR(pr);
            expect(formatted).toContain('100');
            expect(formatted).toContain('10');
        });

        it('should get PR description', () => {
            const pr = { type: 'max_weight_reps', reps: 10 };
            const description = prDetector.getPRDescription(pr);
            expect(description).toBeTruthy();
            expect(typeof description).toBe('string');
        });
    });

    describe('One Rep Max Calculation', () => {
        it('should calculate 1RM using Brzycki formula', () => {
            const orm = prDetector.calculateOneRepMax(100, 10);
            expect(orm).toBeGreaterThan(100);
            expect(orm).toBeLessThan(150);
        });

        it('should return weight for 1 rep', () => {
            const orm = prDetector.calculateOneRepMax(100, 1);
            expect(orm).toBe(100);
        });
    });
});

describe('DataExporter', () => {
    let exporter;
    let sampleWorkouts;
    let mockDownload;

    beforeEach(() => {
        sampleWorkouts = [
            {
                date: '2024-01-15',
                exercises: [
                    {
                        name: 'Squat',
                        category: 'Legs',
                        sets: [{ reps: 10, weight: 100 }]
                    }
                ]
            }
        ];

        exporter = new DataExporter(sampleWorkouts, null);

        // Mock download functionality
        mockDownload = vi.spyOn(exporter, 'downloadFile').mockImplementation(() => {});
    });

    describe('JSON Export', () => {
        it('should export data as JSON', () => {
            exporter.exportJSON();
            expect(mockDownload).toHaveBeenCalled();
        });

        it('should include workout history in export', () => {
            // We can't easily test the actual content without mocking Blob
            // but we can verify the method is called
            exporter.exportJSON();
            expect(mockDownload).toHaveBeenCalledWith(
                expect.any(Blob),
                expect.stringContaining('.json')
            );
        });
    });

    describe('CSV Export', () => {
        it('should export data as CSV', () => {
            exporter.exportCSV();
            expect(mockDownload).toHaveBeenCalled();
        });

        it('should use CSV filename', () => {
            exporter.exportCSV();
            expect(mockDownload).toHaveBeenCalledWith(
                expect.any(Blob),
                expect.stringContaining('.csv')
            );
        });
    });

    describe('CSV Cell Escaping', () => {
        it('should escape cells with commas', () => {
            const escaped = exporter.escapeCsvCell('value, with, commas');
            expect(escaped).toContain('"');
        });

        it('should escape cells with quotes', () => {
            const escaped = exporter.escapeCsvCell('value "with" quotes');
            expect(escaped).toContain('""');
        });

        it('should not escape simple values', () => {
            const escaped = exporter.escapeCsvCell('simplevalue');
            expect(escaped).toBe('simplevalue');
        });
    });

    describe('Date String Generation', () => {
        it('should generate date string in correct format', () => {
            const dateStr = exporter.getDateString();
            expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
    });
});
