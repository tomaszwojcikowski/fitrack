// Statistics Calculator for workout data
// Provides various metrics and analytics

export class StatsCalculator {
    constructor(workoutHistory) {
        this.workoutHistory = workoutHistory || [];
    }

    // Get total number of workouts
    getTotalWorkouts() {
        return this.workoutHistory.length;
    }

    // Calculate current workout streak
    getCurrentStreak() {
        if (this.workoutHistory.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Sort workouts by date (most recent first)
        const sortedWorkouts = [...this.workoutHistory].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        // Get unique workout dates
        const uniqueDates = [...new Set(sortedWorkouts.map(w => w.date))];

        let currentDate = new Date(today);
        
        // Check if there's a workout today or yesterday to start the streak
        const lastWorkoutDate = new Date(uniqueDates[0] + 'T00:00:00');
        const daysDiff = Math.floor((today - lastWorkoutDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) return 0; // Streak broken

        for (const dateStr of uniqueDates) {
            const workoutDate = new Date(dateStr + 'T00:00:00');
            const diffDays = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 0 || diffDays === 1) {
                streak++;
                currentDate = workoutDate;
            } else {
                break;
            }
        }

        return streak;
    }

    // Calculate best streak
    getBestStreak() {
        if (this.workoutHistory.length === 0) return 0;

        const uniqueDates = [...new Set(this.workoutHistory.map(w => w.date))].sort();
        let bestStreak = 1;
        let currentStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1] + 'T00:00:00');
            const currDate = new Date(uniqueDates[i] + 'T00:00:00');
            const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                currentStreak++;
                bestStreak = Math.max(bestStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }

        return bestStreak;
    }

    // Get average workout duration
    getAverageWorkoutDuration() {
        if (this.workoutHistory.length === 0) return 0;

        const workoutsWithDuration = this.workoutHistory.filter(w => w.duration);
        if (workoutsWithDuration.length === 0) return 0;

        const totalDuration = workoutsWithDuration.reduce((sum, w) => sum + w.duration, 0);
        return Math.round(totalDuration / workoutsWithDuration.length);
    }

    // Get total volume lifted (all time)
    getTotalVolume() {
        let totalVolume = 0;

        this.workoutHistory.forEach(workout => {
            workout.exercises.forEach(exercise => {
                exercise.sets.forEach(set => {
                    if (set.weight && set.reps) {
                        totalVolume += set.weight * set.reps;
                    }
                });
            });
        });

        return Math.round(totalVolume);
    }

    // Get most trained muscle groups
    getMostTrainedMuscleGroups(limit = 3) {
        const muscleGroupCount = {};

        this.workoutHistory.forEach(workout => {
            workout.exercises.forEach(exercise => {
                // Extract muscle group from exercise category or name
                const category = exercise.category || this.extractMuscleGroup(exercise.name);
                
                if (category) {
                    muscleGroupCount[category] = (muscleGroupCount[category] || 0) + 1;
                }
            });
        });

        // Convert to array and sort by count
        return Object.entries(muscleGroupCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([muscle, count]) => ({ muscle, count }));
    }

    // Get workouts this week
    getWorkoutsThisWeek() {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start on Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        return this.workoutHistory.filter(workout => {
            const workoutDate = new Date(workout.date + 'T00:00:00');
            return workoutDate >= startOfWeek;
        }).length;
    }

    // Get workouts this month
    getWorkoutsThisMonth() {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        return this.workoutHistory.filter(workout => {
            const workoutDate = new Date(workout.date + 'T00:00:00');
            return workoutDate >= startOfMonth;
        }).length;
    }

    // Get workouts last month
    getWorkoutsLastMonth() {
        const today = new Date();
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

        return this.workoutHistory.filter(workout => {
            const workoutDate = new Date(workout.date + 'T00:00:00');
            return workoutDate >= startOfLastMonth && workoutDate <= endOfLastMonth;
        }).length;
    }

    // Get weekly activity for heatmap (7 days)
    getWeeklyActivity(weekOffset = 0) {
        const today = new Date();
        const targetWeekStart = new Date(today);
        targetWeekStart.setDate(today.getDate() - today.getDay() + (weekOffset * 7)); // Start on Sunday
        targetWeekStart.setHours(0, 0, 0, 0);

        const weekData = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(targetWeekStart);
            date.setDate(targetWeekStart.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const workoutsOnDay = this.workoutHistory.filter(w => w.date === dateStr);
            
            weekData.push({
                date: dateStr,
                dayOfWeek: i,
                dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
                workoutCount: workoutsOnDay.length,
                workouts: workoutsOnDay,
                isToday: dateStr === today.toISOString().split('T')[0]
            });
        }

        return weekData;
    }

    // Get monthly calendar data
    getMonthlyCalendar(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay(); // 0 = Sunday
        const daysInMonth = lastDay.getDate();

        const calendar = [];
        let week = [];

        // Fill in days before month starts
        for (let i = 0; i < startDay; i++) {
            week.push({ date: null, workoutCount: 0 });
        }

        // Fill in days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const workoutsOnDay = this.workoutHistory.filter(w => w.date === dateStr);
            
            week.push({
                date: dateStr,
                day,
                workoutCount: workoutsOnDay.length,
                workouts: workoutsOnDay,
                isToday: dateStr === new Date().toISOString().split('T')[0]
            });

            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
        }

        // Fill in remaining days
        while (week.length > 0 && week.length < 7) {
            week.push({ date: null, workoutCount: 0 });
        }
        
        if (week.length > 0) {
            calendar.push(week);
        }

        return calendar;
    }

    // Get progress data for specific exercise (for charts)
    getExerciseProgress(exerciseName, limit = 20) {
        const progressData = [];

        // Find all instances of this exercise in history
        this.workoutHistory.forEach(workout => {
            workout.exercises.forEach(exercise => {
                if (exercise.name.toLowerCase() === exerciseName.toLowerCase()) {
                    exercise.sets.forEach(set => {
                        if (set.weight && set.reps) {
                            progressData.push({
                                date: workout.date,
                                weight: set.weight,
                                reps: set.reps,
                                volume: set.weight * set.reps
                            });
                        }
                    });
                }
            });
        });

        // Sort by date
        progressData.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Return last N entries
        return progressData.slice(-limit);
    }

    // Get list of exercises for chart dropdown
    getExercisesWithProgress() {
        const exercises = new Set();

        this.workoutHistory.forEach(workout => {
            workout.exercises.forEach(exercise => {
                const hasSetsWithWeight = exercise.sets.some(set => set.weight && set.reps);
                if (hasSetsWithWeight) {
                    exercises.add(exercise.name);
                }
            });
        });

        return Array.from(exercises).sort();
    }

    // Extract muscle group from exercise name (fallback)
    extractMuscleGroup(exerciseName) {
        const name = exerciseName.toLowerCase();
        
        if (name.includes('squat') || name.includes('leg')) return 'Legs';
        if (name.includes('bench') || name.includes('chest') || name.includes('push up')) return 'Chest';
        if (name.includes('deadlift') || name.includes('back') || name.includes('row') || name.includes('pull')) return 'Back';
        if (name.includes('shoulder') || name.includes('press') && !name.includes('bench')) return 'Shoulders';
        if (name.includes('bicep') || name.includes('curl')) return 'Arms';
        if (name.includes('tricep') || name.includes('dip')) return 'Arms';
        if (name.includes('core') || name.includes('plank') || name.includes('crunch')) return 'Core';
        
        return 'Other';
    }

    // Format duration in minutes:seconds
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}
