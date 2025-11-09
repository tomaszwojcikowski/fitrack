// Dashboard Component
// Handles rendering of dashboard view with stats, charts, and heatmap

import { StatsCalculator } from '../src/statsCalculator.js';
import { createLineChart } from '../src/chartUtils.js';
import { prDetector } from '../src/prDetection.js';

export class Dashboard {
    constructor(app) {
        this.app = app;
        this.currentWeekOffset = 0;
        this.chartRenderer = null;
        this.selectedExercise = null;
    }

    render() {
        this.renderStats();
        this.renderWeeklyHeatmap();
        this.renderExerciseChartSelector();
        this.renderRecentPRs();
    }

    renderStats() {
        const stats = new StatsCalculator(this.app.workoutHistory);

        // Total workouts
        document.getElementById('statTotalWorkouts').textContent = stats.getTotalWorkouts();

        // Current streak
        document.getElementById('statCurrentStreak').textContent = stats.getCurrentStreak();

        // Average duration
        const avgDuration = stats.getAverageWorkoutDuration();
        const mins = Math.floor(avgDuration / 60);
        const secs = avgDuration % 60;
        document.getElementById('statAvgDuration').textContent = 
            `${mins}:${secs.toString().padStart(2, '0')}`;

        // Total volume
        const totalVolume = stats.getTotalVolume();
        const formattedVolume = totalVolume >= 1000 
            ? `${(totalVolume / 1000).toFixed(1)}k` 
            : totalVolume;
        document.getElementById('statTotalVolume').textContent = formattedVolume;
    }

    renderWeeklyHeatmap() {
        const stats = new StatsCalculator(this.app.workoutHistory);
        const weekData = stats.getWeeklyActivity(this.currentWeekOffset);
        const container = document.getElementById('weeklyHeatmap');

        // Update week label
        const weekLabel = document.getElementById('weekLabel');
        if (this.currentWeekOffset === 0) {
            weekLabel.textContent = 'Current Week';
        } else if (this.currentWeekOffset === -1) {
            weekLabel.textContent = 'Last Week';
        } else if (this.currentWeekOffset < 0) {
            weekLabel.textContent = `${Math.abs(this.currentWeekOffset)} Weeks Ago`;
        } else {
            weekLabel.textContent = `${this.currentWeekOffset} Weeks Ahead`;
        }

        container.innerHTML = weekData.map(day => {
            const intensityClass = day.workoutCount > 0 
                ? `intensity-${Math.min(day.workoutCount, 3)}` 
                : '';
            
            return `
                <div class="heatmap-day ${day.workoutCount > 0 ? 'has-workout' : ''} ${intensityClass} ${day.isToday ? 'today' : ''}"
                     data-date="${day.date}">
                    <div class="heatmap-day-name">${day.dayName}</div>
                    <div class="heatmap-day-number">${new Date(day.date + 'T00:00:00').getDate()}</div>
                    ${day.workoutCount > 0 ? `<div class="heatmap-workout-count">${day.workoutCount}</div>` : ''}
                </div>
            `;
        }).join('');

        // Add click handlers
        container.querySelectorAll('.heatmap-day').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const date = dayEl.getAttribute('data-date');
                this.showWorkoutDetails(date);
            });
        });
    }

    renderExerciseChartSelector() {
        const stats = new StatsCalculator(this.app.workoutHistory);
        const exercises = stats.getExercisesWithProgress();
        const select = document.getElementById('exerciseChartSelect');

        select.innerHTML = '<option value="">Select exercise...</option>' +
            exercises.map(ex => `<option value="${ex}">${ex}</option>`).join('');

        // Restore previous selection if exists
        if (this.selectedExercise && exercises.includes(this.selectedExercise)) {
            select.value = this.selectedExercise;
            this.renderProgressChart(this.selectedExercise);
        }
    }

    renderProgressChart(exerciseName) {
        const stats = new StatsCalculator(this.app.workoutHistory);
        const progressData = stats.getExerciseProgress(exerciseName);
        const canvas = document.getElementById('progressChart');
        const emptyState = document.getElementById('chartEmptyState');

        if (!progressData || progressData.length === 0) {
            canvas.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.textContent = 'No progress data available for this exercise';
            return;
        }

        canvas.style.display = 'block';
        emptyState.style.display = 'none';

        // Get PR info for this exercise
        const exercisePRs = prDetector.getExercisePRs(exerciseName);
        const prDates = new Set(exercisePRs.records.map(r => r.date));

        // Format data for chart
        const chartData = progressData.map(point => ({
            x: point.date,
            y: point.weight,
            isPR: prDates.has(point.date),
            reps: point.reps
        }));

        // Create chart
        this.chartRenderer = createLineChart(canvas, chartData, {
            xLabel: 'Date',
            yLabel: 'Weight (kg)',
            showGrid: true,
            showPoints: true
        });

        // Add hover interaction
        this.setupChartInteraction(canvas, chartData);
    }

    setupChartInteraction(canvas, data) {
        const tooltip = document.getElementById('chartTooltip');

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const point = this.chartRenderer.getPointAtPosition(data, x, y);
            
            if (point) {
                const date = new Date(point.data.x).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                tooltip.innerHTML = `
                    <div>${date}</div>
                    <div><strong>${point.data.y} kg</strong> × ${point.data.reps} reps</div>
                    ${point.data.isPR ? '<div style="color: #fbbf24;">🏆 PR</div>' : ''}
                `;
                tooltip.style.left = (e.clientX - rect.left + 10) + 'px';
                tooltip.style.top = (e.clientY - rect.top - 40) + 'px';
                tooltip.classList.remove('hidden');
            } else {
                tooltip.classList.add('hidden');
            }
        });

        canvas.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    }

    renderRecentPRs() {
        const recentPRs = prDetector.getRecentPRs(30);
        const container = document.getElementById('recentPRs');

        if (recentPRs.length === 0) {
            container.innerHTML = '<p class="empty-state">No PRs yet. Keep training!</p>';
            return;
        }

        container.innerHTML = recentPRs.slice(0, 5).map(pr => {
            const date = new Date(pr.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });

            return `
                <div class="pr-item">
                    <div class="pr-icon">🏆</div>
                    <div class="pr-content">
                        <div class="pr-exercise-name">${pr.exercise}</div>
                        <div class="pr-details">${prDetector.formatPR(pr)}</div>
                        <div class="pr-description">${prDetector.getPRDescription(pr)}</div>
                    </div>
                    <div class="pr-date">${date}</div>
                </div>
            `;
        }).join('');
    }

    showWorkoutDetails(date) {
        const workoutsOnDate = this.app.workoutHistory.filter(w => w.date === date);
        
        if (workoutsOnDate.length === 0) {
            this.app.showToast('No workouts on this date', 'info');
            return;
        }

        // Navigate to history and highlight date
        this.app.showHistory();
        // Could add date filtering here
    }

    navigateToPrevWeek() {
        this.currentWeekOffset--;
        this.renderWeeklyHeatmap();
    }

    navigateToNextWeek() {
        this.currentWeekOffset++;
        this.renderWeeklyHeatmap();
    }

    handleExerciseSelection(exerciseName) {
        this.selectedExercise = exerciseName;
        if (exerciseName) {
            this.renderProgressChart(exerciseName);
        } else {
            const canvas = document.getElementById('progressChart');
            const emptyState = document.getElementById('chartEmptyState');
            canvas.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.textContent = 'Select an exercise to view progress';
        }
    }
}
