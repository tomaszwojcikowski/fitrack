// FiTrack Application
class FiTrackApp {
    constructor() {
        this.currentWorkout = [];
        this.workoutHistory = [];
        this.restTimerInterval = null;
        this.restTimerSeconds = 0;
        this.timerSound = document.getElementById('timerSound');
        this.confirmCallback = null;
        this.saveTimeout = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setTodayDate();
        this.updateUI();
        this.showWelcomeTooltip();
    }

    showWelcomeTooltip() {
        // Only show welcome tip if this is first time user
        const hasSeenWelcome = localStorage.getItem('fitrack_welcome_seen');
        if (!hasSeenWelcome && this.currentWorkout.length === 0) {
            setTimeout(() => {
                this.showToast('👋 Welcome to FiTrack! Start by searching for an exercise above.', 'info');
                localStorage.setItem('fitrack_welcome_seen', 'true');
            }, 500);
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" aria-label="Close notification">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Close button handler
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Auto remove after 4 seconds
        setTimeout(() => {
            this.removeToast(toast);
        }, 4000);
    }

    removeToast(toast) {
        toast.style.animation = 'toastSlideOut 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    // Confirmation Dialog
    showConfirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const dialog = document.getElementById('confirmDialog');
            const titleEl = document.getElementById('confirmTitle');
            const messageEl = document.getElementById('confirmMessage');
            const okBtn = document.getElementById('confirmOk');
            const cancelBtn = document.getElementById('confirmCancel');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            dialog.classList.remove('hidden');
            
            const handleOk = () => {
                dialog.classList.add('hidden');
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                resolve(true);
            };
            
            const handleCancel = () => {
                dialog.classList.add('hidden');
                okBtn.removeEventListener('click', handleOk);
                cancelBtn.removeEventListener('click', handleCancel);
                resolve(false);
            };
            
            okBtn.addEventListener('click', handleOk);
            cancelBtn.addEventListener('click', handleCancel);
            
            // Close on escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    handleCancel();
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    }

    // Auto-save indicator
    showSaveIndicator() {
        let indicator = document.querySelector('.save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'save-indicator';
            indicator.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span>Saving...</span>
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.classList.add('show');
        
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        
        this.saveTimeout = setTimeout(() => {
            indicator.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Saved</span>
            `;
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 1000);
        }, 500);
    }

    // Data Management
    loadData() {
        const saved = localStorage.getItem('fitrack_data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.workoutHistory = data.history || [];
            } catch (e) {
                console.error('Error loading data:', e);
            }
        }
    }

    saveData() {
        const data = {
            history: this.workoutHistory
        };
        localStorage.setItem('fitrack_data', JSON.stringify(data));
    }

    // Event Listeners
    setupEventListeners() {
        // Exercise search
        document.getElementById('exerciseSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('addExerciseBtn').addEventListener('click', () => {
            this.showAddExercisePrompt();
        });

        // Navigation
        document.getElementById('historyBtn').addEventListener('click', () => {
            this.showHistory();
        });

        document.getElementById('backToWorkout').addEventListener('click', () => {
            this.showWorkout();
        });

        // Quick rest button
        document.getElementById('quickRestBtn').addEventListener('click', () => {
            this.startRestTimer(90); // Default 90 seconds
        });

        // Timer controls
        document.getElementById('timerStop').addEventListener('click', () => {
            this.stopRestTimer();
        });

        document.getElementById('timerAddTime').addEventListener('click', () => {
            this.addRestTime(30);
        });

        // Workout date
        document.getElementById('workoutDate').addEventListener('change', (e) => {
            // Date changed, could trigger save
        });

        // Finish workout button
        document.getElementById('finishWorkoutBtn').addEventListener('click', () => {
            this.finishWorkout();
        });

        // Click outside to close exercise list
        document.addEventListener('click', (e) => {
            const searchBox = document.querySelector('.search-box');
            const exerciseList = document.getElementById('exerciseList');
            if (!searchBox.contains(e.target) && !exerciseList.contains(e.target)) {
                exerciseList.classList.add('hidden');
            }
        });
    }

    // UI Updates
    setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('workoutDate').value = today;
    }

    updateUI() {
        this.renderCurrentExercises();
        this.updateQuickRestButton();
    }

    updateQuickRestButton() {
        const quickRestBtn = document.getElementById('quickRestBtn');
        const finishWorkoutContainer = document.getElementById('finishWorkoutContainer');
        
        if (this.currentWorkout.length > 0) {
            quickRestBtn.classList.remove('hidden');
            finishWorkoutContainer.classList.remove('hidden');
        } else {
            quickRestBtn.classList.add('hidden');
            finishWorkoutContainer.classList.add('hidden');
        }
    }

    // Exercise Search
    handleSearch(query) {
        const exerciseList = document.getElementById('exerciseList');
        
        if (query.length === 0) {
            exerciseList.classList.add('hidden');
            exerciseList.innerHTML = '';
            return;
        }

        const filtered = EXERCISES.filter(ex => 
            ex.name.toLowerCase().includes(query.toLowerCase()) ||
            ex.category.toLowerCase().includes(query.toLowerCase()) ||
            ex.equipment.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            exerciseList.classList.add('hidden');
            return;
        }

        exerciseList.innerHTML = filtered.slice(0, 20).map(ex => `
            <div class="exercise-item" data-exercise='${JSON.stringify(ex)}'>
                <strong>${ex.name}</strong>
                <small>${ex.category} • ${ex.equipment}</small>
            </div>
        `).join('');

        exerciseList.classList.remove('hidden');

        // Add click handlers
        exerciseList.querySelectorAll('.exercise-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const exercise = JSON.parse(e.currentTarget.getAttribute('data-exercise'));
                this.addExercise(exercise);
            });
        });
    }

    clearSearch() {
        document.getElementById('exerciseSearch').value = '';
        document.getElementById('exerciseList').innerHTML = '';
        document.getElementById('exerciseList').classList.add('hidden');
    }

    showAddExercisePrompt() {
        const exerciseName = prompt('Enter exercise name:');
        if (!exerciseName || exerciseName.trim() === '') return;

        // Check if exercise already exists in database
        const existingExercise = EXERCISES.find(ex => 
            ex.name.toLowerCase() === exerciseName.trim().toLowerCase()
        );

        if (existingExercise) {
            this.addExercise(existingExercise);
        } else {
            // Add custom exercise
            const category = prompt('Enter category (e.g., Chest, Back, Legs):', 'Custom');
            const equipment = prompt('Enter equipment (e.g., Barbell, Dumbbell, Bodyweight):', 'Other');
            
            const customExercise = {
                name: exerciseName.trim(),
                category: category || 'Custom',
                equipment: equipment || 'Other'
            };
            
            this.addExercise(customExercise);
        }
    }

    // Exercise Management
    addExercise(exercise) {
        const existingIndex = this.currentWorkout.findIndex(e => e.name === exercise.name);
        
        if (existingIndex === -1) {
            this.currentWorkout.push({
                ...exercise,
                sets: [this.createEmptySet()]
            });
            this.showToast(`${exercise.name} added to workout`, 'success');
        } else {
            this.showToast(`${exercise.name} is already in your workout`, 'info');
        }

        this.clearSearch();
        this.updateUI();
    }

    createEmptySet(useTime = false) {
        return {
            reps: '',
            weight: '',
            time: '',
            useTime: useTime, // Track whether this set uses time or reps
            completed: false
        };
    }

    async removeExercise(index) {
        const exercise = this.currentWorkout[index];
        const confirmed = await this.showConfirm(
            `Are you sure you want to remove "${exercise.name}" from your workout?`,
            'Remove Exercise'
        );
        
        if (confirmed) {
            this.currentWorkout.splice(index, 1);
            this.showToast(`${exercise.name} removed from workout`, 'success');
            this.updateUI();
        }
    }

    addSet(exerciseIndex) {
        const exercise = this.currentWorkout[exerciseIndex];
        // Use the same useTime setting as the last set
        const useTime = exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].useTime : false;
        exercise.sets.push(this.createEmptySet(useTime));
        this.updateUI();
    }

    toggleSetInputType(exerciseIndex, setIndex) {
        const set = this.currentWorkout[exerciseIndex].sets[setIndex];
        set.useTime = !set.useTime;
        this.updateUI();
    }

    updateSet(exerciseIndex, setIndex, field, value) {
        this.currentWorkout[exerciseIndex].sets[setIndex][field] = value;
    }

    toggleSetComplete(exerciseIndex, setIndex) {
        const set = this.currentWorkout[exerciseIndex].sets[setIndex];
        set.completed = !set.completed;
        
        // If completing a set, start rest timer
        if (set.completed) {
            this.startRestTimer(90); // Default 90 seconds rest
        }
        
        this.updateUI();
    }

    // Rendering
    renderCurrentExercises() {
        const container = document.getElementById('currentExercises');
        
        if (this.currentWorkout.length === 0) {
            container.innerHTML = '<p class="empty-state">No exercises added yet. Search and select exercises above to start your workout.</p>';
            return;
        }

        container.innerHTML = this.currentWorkout.map((exercise, exIndex) => `
            <div class="exercise-card">
                <div class="exercise-header">
                    <div class="exercise-title">
                        <h3>${exercise.name}</h3>
                        <small>${exercise.category} • ${exercise.equipment}</small>
                    </div>
                    <div class="exercise-actions">
                        <button class="btn-icon" onclick="app.removeExercise(${exIndex})" title="Remove exercise" aria-label="Remove ${exercise.name} from workout">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="sets-list">
                    ${exercise.sets.map((set, setIndex) => `
                        <div class="set-row">
                            <div class="set-number">${setIndex + 1}</div>
                            <div class="set-input">
                                <label>Weight (kg)</label>
                                <input type="number" 
                                    value="${set.weight}" 
                                    placeholder="0"
                                    step="0.5"
                                    min="0"
                                    max="999"
                                    inputmode="decimal"
                                    aria-label="Weight in kilograms"
                                    onchange="app.updateSet(${exIndex}, ${setIndex}, 'weight', this.value)">
                            </div>
                            <div class="set-input">
                                <label>
                                    ${set.useTime ? 'Time' : 'Reps'}
                                    <button class="toggle-type-btn" onclick="app.toggleSetInputType(${exIndex}, ${setIndex})" title="Toggle between reps and time" aria-label="Switch to ${set.useTime ? 'reps' : 'time'} tracking">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                            <polyline points="17 1 21 5 17 9"></polyline>
                                            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                            <polyline points="7 23 3 19 7 15"></polyline>
                                            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                        </svg>
                                    </button>
                                </label>
                                ${set.useTime ? 
                                    `<input type="text" 
                                        value="${set.time}" 
                                        placeholder="0:00"
                                        pattern="[0-9]{1,2}:[0-5][0-9]"
                                        aria-label="Time in minutes and seconds"
                                        onchange="app.updateSet(${exIndex}, ${setIndex}, 'time', this.value)">` :
                                    `<input type="number" 
                                        value="${set.reps}" 
                                        placeholder="0"
                                        min="0"
                                        max="999"
                                        inputmode="numeric"
                                        aria-label="Number of repetitions"
                                        onchange="app.updateSet(${exIndex}, ${setIndex}, 'reps', this.value)">`
                                }
                            </div>
                            <button class="set-complete ${set.completed ? 'completed' : ''}" 
                                onclick="app.toggleSetComplete(${exIndex}, ${setIndex})"
                                title="${set.completed ? 'Mark incomplete' : 'Mark complete'}"
                                aria-label="${set.completed ? 'Mark set incomplete' : 'Mark set complete'}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-set-btn" onclick="app.addSet(${exIndex})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Add Set
                </button>
            </div>
        `).join('');

        // Save workout automatically
        this.saveCurrentWorkout();
    }

    saveCurrentWorkout() {
        if (this.currentWorkout.length === 0) return;

        const workoutDate = document.getElementById('workoutDate').value;
        
        // Check if workout for this date already exists
        const existingIndex = this.workoutHistory.findIndex(w => w.date === workoutDate);
        
        const workoutData = {
            date: workoutDate,
            exercises: this.currentWorkout.map(ex => ({
                name: ex.name,
                category: ex.category,
                equipment: ex.equipment,
                sets: ex.sets.filter(s => s.reps || s.weight || s.time) // Only save non-empty sets
            }))
        };

        if (existingIndex >= 0) {
            this.workoutHistory[existingIndex] = workoutData;
        } else {
            this.workoutHistory.unshift(workoutData);
        }

        this.saveData();
        this.showSaveIndicator();
    }

    async finishWorkout() {
        if (this.currentWorkout.length === 0) {
            this.showToast('No exercises to save!', 'warning');
            return;
        }

        // Save the current workout
        this.saveCurrentWorkout();

        // Ask if user wants to clear the workout
        const shouldClear = await this.showConfirm(
            'Workout saved to history! Would you like to start a new workout?',
            'Workout Complete'
        );
        
        if (shouldClear) {
            this.currentWorkout = [];
            this.updateUI();
            this.showToast('Workout cleared. Ready for your next session!', 'success');
        } else {
            this.showToast('Workout saved! You can continue editing.', 'success');
        }
    }

    // Rest Timer
    startRestTimer(seconds) {
        this.restTimerSeconds = seconds;
        const restTimer = document.getElementById('restTimer');
        restTimer.classList.remove('hidden');
        
        this.updateTimerDisplay();
        
        if (this.restTimerInterval) {
            clearInterval(this.restTimerInterval);
        }
        
        this.restTimerInterval = setInterval(() => {
            this.restTimerSeconds--;
            
            if (this.restTimerSeconds <= 0) {
                this.stopRestTimer();
                this.playTimerSound();
            } else {
                this.updateTimerDisplay();
            }
        }, 1000);
    }

    stopRestTimer() {
        if (this.restTimerInterval) {
            clearInterval(this.restTimerInterval);
            this.restTimerInterval = null;
        }
        document.getElementById('restTimer').classList.add('hidden');
    }

    addRestTime(seconds) {
        this.restTimerSeconds += seconds;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.restTimerSeconds / 60);
        const seconds = this.restTimerSeconds % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = display;
        
        // Update progress circle
        const totalSeconds = 90; // Default timer length for calculation
        const progress = this.restTimerSeconds / totalSeconds;
        const circumference = 2 * Math.PI * 45; // radius is 45
        const offset = circumference * (1 - progress);
        
        document.querySelector('.timer-progress').style.strokeDashoffset = offset;
    }

    playTimerSound() {
        try {
            this.timerSound.play();
        } catch (e) {
            // Silent fail if sound doesn't play
            console.log('Timer sound could not play');
        }
    }

    // Navigation
    showHistory() {
        document.getElementById('workoutView').classList.remove('active');
        document.getElementById('historyView').classList.add('active');
        this.renderHistory();
    }

    showWorkout() {
        document.getElementById('historyView').classList.remove('active');
        document.getElementById('workoutView').classList.add('active');
    }

    renderHistory() {
        const container = document.getElementById('historyContent');
        
        if (this.workoutHistory.length === 0) {
            container.innerHTML = '<p class="empty-state">No workout history yet.</p>';
            return;
        }

        container.innerHTML = this.workoutHistory.map(workout => {
            const date = new Date(workout.date + 'T00:00:00');
            const dateStr = date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });

            return `
                <div class="history-card">
                    <div class="history-date">${dateStr}</div>
                    ${workout.exercises.map(ex => `
                        <div class="history-exercise">
                            <div class="history-exercise-name">${ex.name}</div>
                            <div class="history-sets">
                                ${ex.sets.map((set, index) => `
                                    <div class="history-set">
                                        Set ${index + 1}: 
                                        ${set.reps ? `${set.reps} reps` : ''}
                                        ${set.weight ? ` × ${set.weight} kg` : ''}
                                        ${set.time ? ` • ${set.time}` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new FiTrackApp();
});
