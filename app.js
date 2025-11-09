// FiTrack Application
import { EXERCISES } from './exercises.js';
import { WORKOUT_PROGRAMS } from './programs.js';
import { GitHubDeviceAuth } from './services/githubDeviceAuth.js';
import { GistSyncService } from './services/gistSyncService.js';
import { SyncModal } from './components/syncModal.js';

class FiTrackApp {
    constructor() {
        this.currentWorkout = [];
        this.workoutHistory = [];
        this.restTimerInterval = null;
        this.restTimerSeconds = 0;
        this.timerSound = document.getElementById('timerSound');
        this.confirmCallback = null;
        this.saveTimeout = null;
        this.activeProgram = null; // { programId, currentWeek, currentDay, startedAt }
        this.programs = WORKOUT_PROGRAMS;
        this.githubAuth = new GitHubDeviceAuth();
        this.syncModal = new SyncModal();
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setTodayDate();
        this.handleInitialView();
        this.updateUI();
        this.showWelcomeTooltip();
    }

    handleInitialView() {
        // Handle URL hash on page load
        const hash = window.location.hash.slice(1); // Remove the '#'
        
        // Navigate based on hash
        if (hash === 'history') {
            this.showHistory();
        } else if (hash === 'programs') {
            this.showPrograms();
        } else if (hash === 'settings') {
            this.showSettings();
        } else {
            // Default to workout view
            this.showWorkout();
            
            // Check if we should show welcome section or load program workout
            if (this.activeProgram) {
                // There's an active program - automatically load current day
                const currentDayKey = `w${this.activeProgram.currentWeek}d${this.activeProgram.currentDay}`;
                const today = new Date().toISOString().split('T')[0];
                const lastWorkoutDate = this.workoutHistory.length > 0 ? this.workoutHistory[0].date : null;
                
                // If no current workout, load the program workout automatically
                if (this.currentWorkout.length === 0) {
                    // Check if current day is completed and it's a new day
                    if (this.activeProgram.completedDays && 
                        this.activeProgram.completedDays.includes(currentDayKey) && 
                        lastWorkoutDate && lastWorkoutDate !== today) {
                        // Move to next day automatically
                        this.navigateToNextUncompletedDay();
                    } else {
                        // Load current day workout automatically
                        this.loadProgramWorkout();
                    }
                }
            } else if (this.currentWorkout.length === 0) {
                // No active program and no current workout - show welcome
                this.showWelcomeSection();
            }
        }
    }

    showWelcomeSection() {
        const welcomeSection = document.getElementById('welcomeSection');
        const exerciseSelection = document.querySelector('.exercise-selection');
        const currentExercises = document.getElementById('currentExercises');
        
        if (!welcomeSection) return; // Guard for tests
        
        welcomeSection.classList.remove('hidden');
        if (exerciseSelection) exerciseSelection.classList.add('hidden');
        if (currentExercises) currentExercises.classList.add('hidden');
        
        const welcomeTitle = document.getElementById('welcomeTitle');
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        if (welcomeTitle) welcomeTitle.textContent = 'Welcome to FiTrack!';
        if (welcomeMessage) welcomeMessage.textContent = 'Choose how you\'d like to start your fitness journey:';
    }

    showWelcomeWithProgram(isNextDay) {
        const welcomeSection = document.getElementById('welcomeSection');
        const exerciseSelection = document.querySelector('.exercise-selection');
        const currentExercises = document.getElementById('currentExercises');
        const program = this.getProgramById(this.activeProgram.programId);
        
        if (!program || !welcomeSection) return; // Guard for tests
        
        welcomeSection.classList.remove('hidden');
        if (exerciseSelection) exerciseSelection.classList.add('hidden');
        if (currentExercises) currentExercises.classList.add('hidden');
        
        const week = program.weeks.find(w => w.week === this.activeProgram.currentWeek);
        const day = week?.days.find(d => d.day === this.activeProgram.currentDay);
        
        if (isNextDay) {
            // Suggest moving to next day
            let nextWeek = this.activeProgram.currentWeek;
            let nextDay = this.activeProgram.currentDay + 1;
            
            if (nextDay > week.days.length) {
                nextWeek++;
                nextDay = 1;
            }
            
            const nextWeekData = program.weeks.find(w => w.week === nextWeek);
            const nextDayData = nextWeekData?.days.find(d => d.day === nextDay);
            
            const welcomeTitle = document.getElementById('welcomeTitle');
            const welcomeMessage = document.getElementById('welcomeMessage');
            const startBtn = document.getElementById('startProgramFromWelcome');
            
            if (welcomeTitle) welcomeTitle.textContent = '🎉 Day Completed!';
            if (welcomeMessage) {
                welcomeMessage.textContent = nextDayData 
                    ? `Great job! Ready for your next workout: ${nextDayData.name}?`
                    : 'Congratulations! You\'ve completed this week. Continue to the next?';
            }
            
            // Update button text
            if (startBtn) {
                startBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                    Continue to Next Day
                `;
                startBtn.onclick = () => {
                    this.navigateProgram(1);
                    this.hideWelcomeSection();
                };
            }
        } else {
            // Show current day workout
            const welcomeTitle = document.getElementById('welcomeTitle');
            const welcomeMessage = document.getElementById('welcomeMessage');
            const startBtn = document.getElementById('startProgramFromWelcome');
            
            if (welcomeTitle) welcomeTitle.textContent = `${program.name}`;
            if (welcomeMessage) {
                welcomeMessage.textContent = day 
                    ? `Week ${this.activeProgram.currentWeek}, Day ${this.activeProgram.currentDay}: ${day.name}`
                    : 'Ready to continue your program?';
            }
            
            // Update button text
            if (startBtn) {
                startBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="5 12 9 16 19 6"></polyline>
                    </svg>
                    Start Today's Workout
                `;
                startBtn.onclick = () => {
                    this.loadProgramWorkout();
                    this.hideWelcomeSection();
                };
            }
        }
        
        // Update secondary button
        const customBtn = document.getElementById('startCustomWorkout');
        if (customBtn) {
            customBtn.textContent = 'View All Programs';
            customBtn.onclick = () => {
                this.showPrograms();
            };
        }
    }

    hideWelcomeSection() {
        const welcomeSection = document.getElementById('welcomeSection');
        const exerciseSelection = document.querySelector('.exercise-selection');
        const currentExercises = document.getElementById('currentExercises');
        
        if (!welcomeSection) return; // Guard for tests
        
        welcomeSection.classList.add('hidden');
        
        if (this.activeProgram) {
            if (exerciseSelection) exerciseSelection.classList.add('hidden');
        } else {
            if (exerciseSelection) exerciseSelection.classList.remove('hidden');
        }
        
        if (currentExercises) currentExercises.classList.remove('hidden');
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
                this.activeProgram = data.activeProgram || null;
            } catch (e) {
                console.error('Error loading data:', e);
            }
        }
    }

    saveData() {
        const data = {
            history: this.workoutHistory,
            activeProgram: this.activeProgram
        };
        localStorage.setItem('fitrack_data', JSON.stringify(data));
    }

    // Event Listeners
    setupEventListeners() {
        // Exercise search
        const searchInput = document.getElementById('exerciseSearch');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        searchInput.addEventListener('focus', () => {
            // Show suggestions when focused
            if (searchInput.value === '') {
                this.showSuggestedExercises();
            }
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            this.clearSearch();
        });

        // Welcome section buttons (check if elements exist for testing)
        const startProgramBtn = document.getElementById('startProgramFromWelcome');
        const startCustomBtn = document.getElementById('startCustomWorkout');
        
        if (startProgramBtn) {
            startProgramBtn.addEventListener('click', () => {
                if (!this.activeProgram) {
                    this.showPrograms();
                }
            });
        }

        if (startCustomBtn) {
            startCustomBtn.addEventListener('click', () => {
                this.hideWelcomeSection();
            });
        }

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

        // Programs
        document.getElementById('programsBtn').addEventListener('click', () => {
            this.showPrograms();
        });

        document.getElementById('backToWorkoutFromPrograms').addEventListener('click', () => {
            this.showWorkout();
        });

        // Settings
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }

        const backToWorkoutFromSettings = document.getElementById('backToWorkoutFromSettings');
        if (backToWorkoutFromSettings) {
            backToWorkoutFromSettings.addEventListener('click', () => {
                this.showWorkout();
            });
        }

        // Current workout button
        const currentWorkoutBtn = document.getElementById('currentWorkoutBtn');
        if (currentWorkoutBtn) {
            currentWorkoutBtn.addEventListener('click', () => {
                this.showWorkout();
            });
        }

        // Sync buttons
        const syncBtn = document.getElementById('sync-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                this.handleSyncClick();
            });
        }
        
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                this.handleDisconnectClick();
            });
        }
        
        // Update sync UI on init
        this.updateSyncUI();

        // Click outside to close exercise list
        document.addEventListener('click', (e) => {
            const searchBox = document.querySelector('.search-box');
            const exerciseList = document.getElementById('exerciseList');
            if (!searchBox.contains(e.target) && !exerciseList.contains(e.target)) {
                exerciseList.classList.add('hidden');
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            const settingsView = document.getElementById('settingsView');
            
            if (hash === 'history') {
                document.getElementById('workoutView').classList.remove('active');
                document.getElementById('programsView').classList.remove('active');
                if (settingsView) settingsView.classList.remove('active');
                document.getElementById('historyView').classList.add('active');
                this.renderHistory();
            } else if (hash === 'programs') {
                document.getElementById('workoutView').classList.remove('active');
                document.getElementById('historyView').classList.remove('active');
                if (settingsView) settingsView.classList.remove('active');
                document.getElementById('programsView').classList.add('active');
                this.renderPrograms();
            } else if (hash === 'settings' && settingsView) {
                document.getElementById('workoutView').classList.remove('active');
                document.getElementById('historyView').classList.remove('active');
                document.getElementById('programsView').classList.remove('active');
                settingsView.classList.add('active');
            } else {
                document.getElementById('historyView').classList.remove('active');
                document.getElementById('programsView').classList.remove('active');
                if (settingsView) settingsView.classList.remove('active');
                document.getElementById('workoutView').classList.add('active');
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
        this.updateProgramIndicator();
        this.updateCurrentWorkoutButton();
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

    updateCurrentWorkoutButton() {
        const currentWorkoutBtn = document.getElementById('currentWorkoutBtn');
        const workoutView = document.getElementById('workoutView');
        
        if (!currentWorkoutBtn) return;
        
        // Show button if there's a current workout and we're not on the workout view
        if (this.currentWorkout.length > 0 && !workoutView.classList.contains('active')) {
            currentWorkoutBtn.classList.remove('hidden');
        } else {
            currentWorkoutBtn.classList.add('hidden');
        }
    }

    updateProgramIndicator() {
        const programIndicator = document.getElementById('programIndicator');
        const exerciseSelection = document.querySelector('.exercise-selection');

        if (this.activeProgram) {
            const program = this.getProgramById(this.activeProgram.programId);
            if (program) {
                const week = program.weeks.find(w => w.week === this.activeProgram.currentWeek);
                const day = week?.days.find(d => d.day === this.activeProgram.currentDay);
                
                // Calculate progress percentage
                const totalDays = program.weeks.reduce((sum, w) => sum + w.days.length, 0);
                const completedDays = this.activeProgram.completedDays ? this.activeProgram.completedDays.length : 0;
                const progressPercent = Math.round((completedDays / totalDays) * 100);

                programIndicator.innerHTML = `
                    <div class="program-indicator-content">
                        <div class="program-name-row">
                            <div class="program-name">${program.name}</div>
                            <div class="program-progress-badge" title="${completedDays}/${totalDays} days completed">
                                ${progressPercent}%
                            </div>
                        </div>
                        <div class="program-progress">
                            <button id="selectDayBtn" class="btn-text" title="Select day">
                                Week ${this.activeProgram.currentWeek}/${program.duration} • Day ${this.activeProgram.currentDay}/${week?.days.length || 0}
                                ${day ? ` • ${day.name}` : ''}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <button id="quitProgramBtn" class="btn-text" title="Quit program">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                `;
                programIndicator.classList.remove('hidden');
                exerciseSelection.classList.add('hidden');

                // Re-attach event listeners
                document.getElementById('quitProgramBtn').addEventListener('click', () => {
                    this.quitProgram();
                });
                document.getElementById('selectDayBtn').addEventListener('click', () => {
                    this.showDaySelector();
                });
            }
        } else {
            programIndicator.classList.add('hidden');
            exerciseSelection.classList.remove('hidden');
        }
    }

    // Exercise Search
    handleSearch(query) {
        const exerciseList = document.getElementById('exerciseList');
        
        if (query.length === 0) {
            // Show popular/suggested exercises when search is empty
            this.showSuggestedExercises();
            return;
        }

        const filtered = EXERCISES.filter(ex => 
            ex.name.toLowerCase().includes(query.toLowerCase()) ||
            ex.category.toLowerCase().includes(query.toLowerCase()) ||
            ex.equipment.toLowerCase().includes(query.toLowerCase())
        );

        if (filtered.length === 0) {
            exerciseList.innerHTML = '<div class="no-results">No exercises found. Try a different search term.</div>';
            exerciseList.classList.remove('hidden');
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

    showSuggestedExercises() {
        const exerciseList = document.getElementById('exerciseList');
        
        // Get recently used exercises from history
        const recentExercises = this.getRecentlyUsedExercises();
        
        // Popular exercises if no history
        const popularExercises = [
            'Bench Press', 'Squat', 'Deadlift', 'Pull-ups', 'Overhead Press',
            'Barbell Row', 'Dumbbell Curl', 'Tricep Pushdown', 'Leg Press', 'Lat Pulldown'
        ];

        let html = '';
        
        if (recentExercises.length > 0) {
            html += '<div class="exercise-section-header">Recently Used</div>';
            recentExercises.slice(0, 5).forEach(exName => {
                const ex = EXERCISES.find(e => e.name === exName);
                if (ex) {
                    html += `
                        <div class="exercise-item" data-exercise='${JSON.stringify(ex)}'>
                            <strong>${ex.name}</strong>
                            <small>${ex.category} • ${ex.equipment}</small>
                        </div>
                    `;
                }
            });
        }
        
        html += '<div class="exercise-section-header">Popular Exercises</div>';
        popularExercises.forEach(exName => {
            const ex = EXERCISES.find(e => e.name === exName);
            if (ex && !recentExercises.includes(exName)) {
                html += `
                    <div class="exercise-item" data-exercise='${JSON.stringify(ex)}'>
                        <strong>${ex.name}</strong>
                        <small>${ex.category} • ${ex.equipment}</small>
                    </div>
                `;
            }
        });

        exerciseList.innerHTML = html;
        exerciseList.classList.remove('hidden');

        // Add click handlers
        exerciseList.querySelectorAll('.exercise-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const exercise = JSON.parse(e.currentTarget.getAttribute('data-exercise'));
                this.addExercise(exercise);
            });
        });
    }

    getRecentlyUsedExercises() {
        const recentExercises = [];
        const seen = new Set();
        
        // Get exercises from recent workouts
        for (let i = 0; i < Math.min(5, this.workoutHistory.length); i++) {
            const workout = this.workoutHistory[i];
            workout.exercises.forEach(ex => {
                if (!seen.has(ex.name) && recentExercises.length < 5) {
                    recentExercises.push(ex.name);
                    seen.add(ex.name);
                }
            });
        }
        
        return recentExercises;
    }

    clearSearch() {
        document.getElementById('exerciseSearch').value = '';
        document.getElementById('exerciseList').innerHTML = '';
        document.getElementById('exerciseList').classList.add('hidden');
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
        if (!exercise) return; // Guard against invalid index
        
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

    swapSet(exerciseIndex, setIndex1, setIndex2) {
        const exercise = this.currentWorkout[exerciseIndex];
        if (!exercise || setIndex1 < 0 || setIndex2 < 0 || 
            setIndex1 >= exercise.sets.length || setIndex2 >= exercise.sets.length) {
            return;
        }
        
        // Swap the sets
        const temp = exercise.sets[setIndex1];
        exercise.sets[setIndex1] = exercise.sets[setIndex2];
        exercise.sets[setIndex2] = temp;
        
        this.updateUI();
    }

    async deleteSet(exerciseIndex, setIndex) {
        const exercise = this.currentWorkout[exerciseIndex];
        if (!exercise || setIndex < 0 || setIndex >= exercise.sets.length) {
            return;
        }
        
        // Only confirm if the set has data
        const set = exercise.sets[setIndex];
        const hasData = set.reps || set.weight || set.time;
        
        if (hasData) {
            const confirmed = await this.showConfirm(
                'Are you sure you want to delete this set?',
                'Delete Set'
            );
            
            if (!confirmed) return;
        }
        
        exercise.sets.splice(setIndex, 1);
        
        // If no sets left, keep at least one empty set
        if (exercise.sets.length === 0) {
            exercise.sets.push(this.createEmptySet(false));
        }
        
        this.updateUI();
    }

    // Rendering
    renderCurrentExercises() {
        const container = document.getElementById('currentExercises');
        
        if (this.currentWorkout.length === 0) {
            container.innerHTML = '<p class="empty-state">No exercises added yet. Search and select exercises below to start your workout.</p>';
            return;
        }

        container.innerHTML = this.currentWorkout.map((exercise, exIndex) => `
            <div class="exercise-card" draggable="true" data-exercise-index="${exIndex}">
                <div class="exercise-header">
                    <button class="drag-handle" aria-label="Drag to reorder exercise">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                    <div class="exercise-title">
                        <h3 class="exercise-name-clickable" onclick="app.showExerciseHistory('${exercise.name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}')" title="View history for ${exercise.name}">${exercise.name}</h3>
                        <small>${exercise.category} • ${exercise.equipment}</small>
                    </div>
                    <div class="exercise-actions">
                        <button class="btn-icon" onclick="app.swapExercise(${exIndex})" title="Swap exercise" aria-label="Swap ${exercise.name} with another exercise">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="17 1 21 5 17 9"></polyline>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                <polyline points="7 23 3 19 7 15"></polyline>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                            </svg>
                        </button>
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
                        <div class="set-row-wrapper" data-exercise-index="${exIndex}" data-set-index="${setIndex}">
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
                                        placeholder="0:30 or 30s"
                                        pattern="([0-9]{1,2}:[0-5][0-9]|[0-9]{1,3}s?)"
                                        aria-label="Time in minutes:seconds or seconds"
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
                            <div class="set-actions">
                                <button class="set-complete ${set.completed ? 'completed' : ''}" 
                                    onclick="app.toggleSetComplete(${exIndex}, ${setIndex})"
                                    title="${set.completed ? 'Mark incomplete' : 'Mark complete'}"
                                    aria-label="${set.completed ? 'Mark set incomplete' : 'Mark set complete'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </button>
                                <button class="set-delete-btn" 
                                    onclick="app.deleteSet(${exIndex}, ${setIndex})"
                                    title="Delete set"
                                    aria-label="Delete set ${setIndex + 1}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
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

        // Setup drag and drop for exercises
        this.setupExerciseDragAndDrop();

        // Save workout automatically
        this.saveCurrentWorkout();
    }

    setupExerciseDragAndDrop() {
        const exerciseCards = document.querySelectorAll('.exercise-card');
        let draggedElement = null;
        let draggedIndex = null;

        exerciseCards.forEach((card, index) => {
            // Drag start
            card.addEventListener('dragstart', (e) => {
                draggedElement = card;
                draggedIndex = parseInt(card.getAttribute('data-exercise-index'));
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.innerHTML);
            });

            // Drag end
            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
                // Remove all drag-over classes
                exerciseCards.forEach(c => c.classList.remove('drag-over'));
            });

            // Drag over
            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                if (draggedElement !== card) {
                    card.classList.add('drag-over');
                }
            });

            // Drag leave
            card.addEventListener('dragleave', (e) => {
                card.classList.remove('drag-over');
            });

            // Drop
            card.addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                card.classList.remove('drag-over');
                
                if (draggedElement !== card) {
                    const dropIndex = parseInt(card.getAttribute('data-exercise-index'));
                    this.moveExercise(draggedIndex, dropIndex);
                }
            });
        });
    }



    moveExercise(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        // Remove from old position
        const [movedExercise] = this.currentWorkout.splice(fromIndex, 1);
        // Insert at new position
        this.currentWorkout.splice(toIndex, 0, movedExercise);
        
        // Re-render with smooth animation
        this.updateUI();
        this.showToast('Exercise reordered', 'success');
    }

    swapExercise(exerciseIndex) {
        const currentExercise = this.currentWorkout[exerciseIndex];
        
        // Create and show swap dialog
        const dialog = document.createElement('div');
        dialog.className = 'swap-exercise-dialog';
        dialog.innerHTML = `
            <div class="swap-dialog-content">
                <div class="swap-dialog-header">
                    <h3>Swap Exercise: ${currentExercise.name}</h3>
                    <button class="close-btn" aria-label="Close">&times;</button>
                </div>
                <div class="swap-dialog-body">
                    <div class="search-box">
                        <input type="text" id="swapExerciseSearch" placeholder="Search for replacement exercise..." autocomplete="off">
                        <button class="clear-btn" id="swapClearSearch" aria-label="Clear search">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div id="swapExerciseList" class="swap-exercise-list"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Focus search input
        const searchInput = dialog.querySelector('#swapExerciseSearch');
        setTimeout(() => searchInput.focus(), 100);
        
        // Close handlers
        const closeDialog = () => {
            dialog.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(dialog), 300);
        };
        
        dialog.querySelector('.close-btn').addEventListener('click', closeDialog);
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) closeDialog();
        });
        
        // Clear search
        dialog.querySelector('#swapClearSearch').addEventListener('click', () => {
            searchInput.value = '';
            searchInput.focus();
            showSwapExercises('');
        });
        
        // Search functionality
        const showSwapExercises = (query) => {
            const listEl = dialog.querySelector('#swapExerciseList');
            
            let filtered = EXERCISES;
            if (query.length > 0) {
                filtered = EXERCISES.filter(ex => 
                    ex.name.toLowerCase().includes(query.toLowerCase()) ||
                    ex.category.toLowerCase().includes(query.toLowerCase()) ||
                    ex.equipment.toLowerCase().includes(query.toLowerCase())
                );
            }
            
            // Filter out the current exercise
            filtered = filtered.filter(ex => ex.name !== currentExercise.name);
            
            if (filtered.length === 0) {
                listEl.innerHTML = '<div class="no-results">No exercises found.</div>';
                return;
            }
            
            listEl.innerHTML = filtered.slice(0, 20).map(ex => `
                <div class="exercise-item" data-exercise='${JSON.stringify(ex)}'>
                    <strong>${ex.name}</strong>
                    <small>${ex.category} • ${ex.equipment}</small>
                </div>
            `).join('');
            
            // Add click handlers
            listEl.querySelectorAll('.exercise-item').forEach(item => {
                item.addEventListener('click', () => {
                    const newExercise = JSON.parse(item.getAttribute('data-exercise'));
                    this.performExerciseSwap(exerciseIndex, newExercise);
                    closeDialog();
                });
            });
        };
        
        searchInput.addEventListener('input', (e) => {
            showSwapExercises(e.target.value);
        });
        
        // Show initial list
        showSwapExercises('');
        
        // Animate in
        setTimeout(() => dialog.classList.add('show'), 10);
    }

    performExerciseSwap(exerciseIndex, newExercise) {
        const oldExercise = this.currentWorkout[exerciseIndex];
        
        // Preserve sets structure but clear values
        const preservedSets = oldExercise.sets.map(set => ({
            ...set,
            // Keep completed status but suggest re-evaluation
            completed: false
        }));
        
        // Replace exercise
        this.currentWorkout[exerciseIndex] = {
            ...newExercise,
            sets: preservedSets
        };
        
        this.updateUI();
        this.showToast(`Swapped ${oldExercise.name} with ${newExercise.name}`, 'success');
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

        // Mark current program day as completed if in a program
        if (this.activeProgram) {
            const currentDayKey = `w${this.activeProgram.currentWeek}d${this.activeProgram.currentDay}`;
            if (!this.activeProgram.completedDays.includes(currentDayKey)) {
                this.activeProgram.completedDays.push(currentDayKey);
                this.saveData();
            }
        }

        // Ask if user wants to clear the workout
        const shouldClear = await this.showConfirm(
            'Workout saved to history! Would you like to start a new workout?',
            'Workout Complete'
        );
        
        if (shouldClear) {
            this.currentWorkout = [];
            this.updateUI();
            
            // Show appropriate welcome section
            if (this.activeProgram) {
                this.showWelcomeWithProgram(true);
            } else {
                this.showWelcomeSection();
            }
            
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
            const playPromise = this.timerSound.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Silent fail if sound doesn't play
                    console.log('Timer sound could not play');
                });
            }
        } catch (e) {
            // Silent fail if sound doesn't play
            console.log('Timer sound could not play');
        }
    }

    // Navigation
    showHistory() {
        document.getElementById('workoutView').classList.remove('active');
        document.getElementById('programsView').classList.remove('active');
        const settingsView = document.getElementById('settingsView');
        if (settingsView) settingsView.classList.remove('active');
        document.getElementById('historyView').classList.add('active');
        window.location.hash = 'history';
        this.renderHistory();
        this.updateCurrentWorkoutButton();
    }

    showWorkout() {
        document.getElementById('historyView').classList.remove('active');
        document.getElementById('programsView').classList.remove('active');
        const settingsView = document.getElementById('settingsView');
        if (settingsView) settingsView.classList.remove('active');
        document.getElementById('workoutView').classList.add('active');
        window.location.hash = 'workout';
        this.updateCurrentWorkoutButton();
    }

    showSettings() {
        const settingsView = document.getElementById('settingsView');
        if (!settingsView) return;
        
        document.getElementById('workoutView').classList.remove('active');
        document.getElementById('historyView').classList.remove('active');
        document.getElementById('programsView').classList.remove('active');
        settingsView.classList.add('active');
        window.location.hash = 'settings';
        this.updateCurrentWorkoutButton();
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

    // Program Management
    showPrograms() {
        document.getElementById('workoutView').classList.remove('active');
        document.getElementById('historyView').classList.remove('active');
        const settingsView = document.getElementById('settingsView');
        if (settingsView) settingsView.classList.remove('active');
        document.getElementById('programsView').classList.add('active');
        window.location.hash = 'programs';
        this.renderPrograms();
        this.updateCurrentWorkoutButton();
    }

    renderPrograms() {
        const container = document.getElementById('programsContent');
        
        container.innerHTML = this.programs.map(program => {
            // Check if this is the active program
            const isActive = this.activeProgram && this.activeProgram.programId === program.id;
            
            // Build blocks info for advanced programs
            let blocksInfo = '';
            if (program.blocks && program.blocks.length > 0) {
                blocksInfo = `
                    <div class="program-blocks">
                        <strong>${program.blocks.length} Training Blocks:</strong>
                        ${program.blocks.map(block => `
                            <div class="block-item">
                                <span class="block-name">Block ${block.blockNumber}: ${block.name}</span>
                                <span class="block-weeks">(Weeks ${block.weeks[0]}-${block.weeks[block.weeks.length - 1]})</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            // Add author/philosophy info if available
            let extraInfo = '';
            if (program.philosophy) {
                extraInfo = `<p class="program-philosophy"><em>${program.philosophy}</em></p>`;
            }
            if (program.targetAudience) {
                extraInfo += `<p class="program-audience"><strong>Target:</strong> ${program.targetAudience}</p>`;
            }

            return `
                <div class="program-card ${isActive ? 'program-card-active' : ''}">
                    ${isActive ? '<div class="program-active-badge">Active Program</div>' : ''}
                    <div class="program-header">
                        <h3>${program.name}</h3>
                        <span class="program-badge program-badge-${program.difficulty.toLowerCase()}">${program.difficulty}</span>
                    </div>
                    <p class="program-description">${program.description}</p>
                    ${extraInfo}
                    <div class="program-meta">
                        <span><strong>${program.duration}</strong> weeks</span>
                        <span><strong>${program.daysPerWeek}</strong> days/week</span>
                        <span><strong>${program.goal}</strong></span>
                    </div>
                    ${blocksInfo}
                    <div class="program-actions">
                        ${program.blocks && program.blocks.length > 0 ? 
                            `<button class="btn btn-outline view-details-btn" data-program-id="${program.id}">View Details</button>` : ''}
                        <button class="btn btn-primary start-program-btn" data-program-id="${program.id}">
                            Start Program
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners
        container.querySelectorAll('.start-program-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const programId = e.target.getAttribute('data-program-id');
                this.startProgram(programId);
            });
        });

        container.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const programId = e.target.getAttribute('data-program-id');
                this.showProgramDetails(programId);
            });
        });
    }

    showProgramDetails(programId) {
        const program = this.getProgramById(programId);
        if (!program) return;

        // Create a modal/overlay to show program details
        const modal = document.createElement('div');
        modal.className = 'program-details-modal';
        modal.innerHTML = `
            <div class="program-details-content">
                <div class="program-details-header">
                    <h2>${program.name}</h2>
                    <button class="close-btn" aria-label="Close details">&times;</button>
                </div>
                <div class="program-details-body">
                    <p class="program-description">${program.description}</p>
                    
                    ${program.philosophy ? `
                        <div class="details-section">
                            <h3>Philosophy</h3>
                            <p>${program.philosophy}</p>
                        </div>
                    ` : ''}

                    ${program.blocks && program.blocks.length > 0 ? `
                        <div class="details-section">
                            <h3>Training Blocks</h3>
                            ${program.blocks.map(block => `
                                <div class="block-details">
                                    <h4>Block ${block.blockNumber}: ${block.name} (Weeks ${block.weeks[0]}-${block.weeks[block.weeks.length - 1]})</h4>
                                    <p><strong>Goals:</strong> ${block.goals}</p>
                                    <div class="block-skills">
                                        <div><strong>Skill A:</strong> ${block.skillA.name} - ${block.skillA.description}</div>
                                        <div><strong>Skill B:</strong> ${block.skillB.name} - ${block.skillB.description}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    <div class="details-section">
                        <h3>Program Overview</h3>
                        <ul>
                            <li><strong>Duration:</strong> ${program.duration} weeks</li>
                            <li><strong>Frequency:</strong> ${program.daysPerWeek} days per week</li>
                            <li><strong>Difficulty:</strong> ${program.difficulty}</li>
                            <li><strong>Goal:</strong> ${program.goal}</li>
                            ${program.targetAudience ? `<li><strong>Target Audience:</strong> ${program.targetAudience}</li>` : ''}
                        </ul>
                    </div>
                </div>
                <div class="program-details-footer">
                    <button class="btn btn-secondary close-details-btn">Close</button>
                    <button class="btn btn-primary start-program-from-details-btn" data-program-id="${program.id}">Start Program</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners for modal
        const closeModal = () => {
            modal.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.close-btn').addEventListener('click', closeModal);
        modal.querySelector('.close-details-btn').addEventListener('click', closeModal);
        modal.querySelector('.start-program-from-details-btn').addEventListener('click', () => {
            const programId = modal.querySelector('.start-program-from-details-btn').getAttribute('data-program-id');
            closeModal();
            this.startProgram(programId);
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Animate in
        setTimeout(() => modal.classList.add('show'), 10);
    }

    async startProgram(programId) {
        const program = this.programs.find(p => p.id === programId);
        if (!program) return;

        // If there's already an active program, confirm before switching
        if (this.activeProgram) {
            const confirmed = await this.showConfirm(
                `You are currently on "${this.getProgramById(this.activeProgram.programId)?.name}". Starting a new program will replace your current progress. Continue?`,
                'Switch Programs'
            );
            if (!confirmed) return;
        }

        // If there's a current workout, ask about clearing it
        if (this.currentWorkout.length > 0) {
            const confirmed = await this.showConfirm(
                'Starting a program will replace your current workout. Continue?',
                'Start Program'
            );
            if (!confirmed) return;
        }

        this.activeProgram = {
            programId: programId,
            currentWeek: 1,
            currentDay: 1,
            startedAt: new Date().toISOString(),
            completedDays: []
        };

        this.loadProgramWorkout();
        this.saveData();
        this.showWorkout();
        this.showToast(`Started program: ${program.name}`, 'success');
    }

    loadProgramWorkout() {
        if (!this.activeProgram) return;

        const program = this.getProgramById(this.activeProgram.programId);
        if (!program) return;

        const week = program.weeks.find(w => w.week === this.activeProgram.currentWeek);
        if (!week) return;

        const day = week.days.find(d => d.day === this.activeProgram.currentDay);
        if (!day) return;

        // Store phase information for advanced programs
        this.currentDayPhases = day.phases || null;
        this.currentDayWorkoutType = day.workoutType || null;

        // Handle both old format (day.exercises) and new format (day.phases with exerciseGroups)
        let exercisesToLoad = [];
        
        if (day.exercises) {
            // Old format: simple exercises array
            exercisesToLoad = day.exercises;
        } else if (day.phases) {
            // New format: phases with exercise groups
            day.phases.forEach(phase => {
                if (phase.exerciseGroups) {
                    phase.exerciseGroups.forEach(group => {
                        if (group.exercises) {
                            group.exercises.forEach(exercise => {
                                exercisesToLoad.push({
                                    ...exercise,
                                    groupLabel: group.label,
                                    groupType: group.type,
                                    phase: phase.phase
                                });
                            });
                        }
                    });
                }
            });
        }

        // Clear current workout and load program workout
        this.currentWorkout = exercisesToLoad.map(exercise => {
            // Find exercise in database
            const dbExercise = EXERCISES.find(ex => 
                ex.name.toLowerCase() === exercise.name.toLowerCase()
            );

            // Create sets based on program prescription
            const sets = [];
            const numSets = exercise.sets || 1;
            for (let i = 0; i < numSets; i++) {
                // Parse time value to remove 's' suffix if present (e.g., "30s" -> "30")
                let timeValue = exercise.time || '';
                if (timeValue && typeof timeValue === 'string' && timeValue.endsWith('s')) {
                    timeValue = timeValue.slice(0, -1);
                }
                
                const set = {
                    reps: exercise.reps ? exercise.reps.toString() : '',
                    weight: exercise.weight || '',
                    time: timeValue,
                    useTime: !!exercise.time,
                    completed: false,
                    prescribedReps: exercise.reps,
                    prescribedRestSeconds: exercise.restSeconds,
                    prescribedWeight: exercise.weight
                };
                sets.push(set);
            }

            return {
                name: exercise.name,
                category: dbExercise?.category || 'Custom',
                equipment: dbExercise?.equipment || 'Other',
                sets: sets,
                notes: exercise.notes,
                restSeconds: exercise.restSeconds,
                groupLabel: exercise.groupLabel,
                groupType: exercise.groupType,
                phase: exercise.phase,
                scheme: exercise.scheme  // For special set schemes like EMOM, Ladder, etc.
            };
        });

        this.updateUI();
    }

    getProgramById(programId) {
        return this.programs.find(p => p.id === programId);
    }

    navigateProgram(direction) {
        if (!this.activeProgram) return;

        const program = this.getProgramById(this.activeProgram.programId);
        if (!program) return;

        const currentWeek = program.weeks.find(w => w.week === this.activeProgram.currentWeek);
        if (!currentWeek) return;

        let newDay = this.activeProgram.currentDay + direction;
        let newWeek = this.activeProgram.currentWeek;

        // Check boundaries
        if (newDay < 1) {
            // Go to previous week
            if (newWeek > 1) {
                newWeek--;
                const prevWeek = program.weeks.find(w => w.week === newWeek);
                if (prevWeek) {
                    newDay = prevWeek.days.length;
                } else {
                    this.showToast('Previous week not found in program data', 'error');
                    return;
                }
            } else {
                this.showToast('Already at first day of program', 'info');
                return;
            }
        } else if (newDay > currentWeek.days.length) {
            // Go to next week
            if (newWeek < program.duration) {
                newWeek++;
                newDay = 1;
            } else {
                this.showToast('Congratulations! You\'ve completed the program!', 'success');
                return;
            }
        }

        // Mark current day as completed
        if (direction > 0) {
            const dayKey = `w${this.activeProgram.currentWeek}d${this.activeProgram.currentDay}`;
            if (!this.activeProgram.completedDays.includes(dayKey)) {
                this.activeProgram.completedDays.push(dayKey);
            }
            // Save current workout before moving on
            if (this.currentWorkout.length > 0) {
                this.saveCurrentWorkout();
            }
        }

        this.activeProgram.currentWeek = newWeek;
        this.activeProgram.currentDay = newDay;
        this.loadProgramWorkout();
        this.saveData();
    }

    async quitProgram() {
        if (!this.activeProgram) return;

        const confirmed = await this.showConfirm(
            'Are you sure you want to quit the current program? Your progress will be lost.',
            'Quit Program'
        );

        if (confirmed) {
            this.activeProgram = null;
            this.currentWorkout = [];
            this.saveData();
            this.updateUI();
            this.showToast('Program quit. You can start a new program anytime!', 'info');
        }
    }

    closeProgramModal() {
        // This will be used for future program details modal
        const modal = document.getElementById('programModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showDaySelector() {
        if (!this.activeProgram) return;

        const program = this.getProgramById(this.activeProgram.programId);
        if (!program) return;

        const modal = document.getElementById('daySelectorModal');
        const body = document.getElementById('daySelectorBody');
        
        if (!modal || !body) return;

        // Build day selector grid
        let html = '<div class="day-selector-grid">';
        
        program.weeks.forEach(week => {
            html += `<div class="week-section">
                <h4>Week ${week.week}</h4>
                <div class="day-buttons">`;
            
            week.days.forEach(day => {
                const dayKey = `w${week.week}d${day.day}`;
                const isCompleted = this.activeProgram.completedDays && this.activeProgram.completedDays.includes(dayKey);
                const isCurrent = week.week === this.activeProgram.currentWeek && day.day === this.activeProgram.currentDay;
                const classes = `day-btn ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
                
                html += `
                    <button class="${classes}" data-week="${week.week}" data-day="${day.day}">
                        <div class="day-number">Day ${day.day}</div>
                        <div class="day-name">${day.name}</div>
                        ${isCompleted ? '<span class="check-mark">✓</span>' : ''}
                        ${isCurrent ? '<span class="current-mark">▶</span>' : ''}
                    </button>
                `;
            });
            
            html += '</div></div>';
        });
        
        html += '</div>';
        body.innerHTML = html;

        // Add event listeners to day buttons
        body.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const week = parseInt(btn.getAttribute('data-week'));
                const day = parseInt(btn.getAttribute('data-day'));
                this.selectProgramDay(week, day);
                this.closeDaySelector();
            });
        });

        modal.classList.remove('hidden');

        // Add close handler
        const cancelBtn = document.getElementById('daySelectorCancel');
        if (cancelBtn) {
            cancelBtn.onclick = () => this.closeDaySelector();
        }

        // Close on backdrop click
        modal.onclick = (e) => {
            if (e.target === modal) {
                this.closeDaySelector();
            }
        };
    }

    closeDaySelector() {
        const modal = document.getElementById('daySelectorModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    selectProgramDay(week, day) {
        if (!this.activeProgram) return;

        // Update current day
        this.activeProgram.currentWeek = week;
        this.activeProgram.currentDay = day;
        
        // Load the workout for this day
        this.loadProgramWorkout();
        this.saveData();
    }

    navigateToNextUncompletedDay() {
        if (!this.activeProgram) return;

        const program = this.getProgramById(this.activeProgram.programId);
        if (!program) return;

        // Find the next uncompleted day
        for (let weekNum = this.activeProgram.currentWeek; weekNum <= program.duration; weekNum++) {
            const week = program.weeks.find(w => w.week === weekNum);
            if (!week) continue;

            const startDay = (weekNum === this.activeProgram.currentWeek) ? this.activeProgram.currentDay : 1;
            
            for (let dayNum = startDay; dayNum <= week.days.length; dayNum++) {
                const dayKey = `w${weekNum}d${dayNum}`;
                if (!this.activeProgram.completedDays || !this.activeProgram.completedDays.includes(dayKey)) {
                    // Found an uncompleted day
                    this.activeProgram.currentWeek = weekNum;
                    this.activeProgram.currentDay = dayNum;
                    this.loadProgramWorkout();
                    this.saveData();
                    return;
                }
            }
        }

        // If all days are completed, show congratulations
        this.showToast('🎉 Congratulations! You\'ve completed the entire program!', 'success');
    }

    showExerciseHistory(exerciseName) {
        // Get all history for this exercise
        const exerciseHistory = [];
        
        this.workoutHistory.forEach(workout => {
            const exercise = workout.exercises.find(ex => ex.name === exerciseName);
            if (exercise && exercise.sets && exercise.sets.length > 0) {
                exerciseHistory.push({
                    date: workout.date,
                    sets: exercise.sets
                });
            }
        });

        if (exerciseHistory.length === 0) {
            this.showToast(`No history found for ${exerciseName}`, 'info');
            return;
        }

        // Create modal to show history
        const modal = document.createElement('div');
        modal.className = 'exercise-history-modal';
        modal.innerHTML = `
            <div class="exercise-history-content">
                <div class="exercise-history-header">
                    <h2>📊 ${exerciseName}</h2>
                    <button class="close-btn" aria-label="Close">&times;</button>
                </div>
                <div class="exercise-history-body">
                    <div class="exercise-history-stats">
                        <div class="stat-card">
                            <div class="stat-value">${exerciseHistory.length}</div>
                            <div class="stat-label">Workouts</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${exerciseHistory.reduce((sum, h) => sum + h.sets.length, 0)}</div>
                            <div class="stat-label">Total Sets</div>
                        </div>
                    </div>
                    <div class="exercise-history-list">
                        ${exerciseHistory.map(history => {
                            const date = new Date(history.date + 'T00:00:00');
                            const dateStr = date.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                            });
                            
                            return `
                                <div class="history-entry">
                                    <div class="history-entry-date">${dateStr}</div>
                                    <div class="history-entry-sets">
                                        ${history.sets.map((set, idx) => `
                                            <div class="history-entry-set">
                                                <span class="set-num">Set ${idx + 1}:</span>
                                                ${set.weight ? `<span class="set-weight">${set.weight} kg</span>` : ''}
                                                ${set.reps ? `<span class="set-reps">× ${set.reps} reps</span>` : ''}
                                                ${set.time ? `<span class="set-time">${set.time}</span>` : ''}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                <div class="exercise-history-footer">
                    <button class="btn btn-primary close-history-btn">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close handlers
        const closeModal = () => {
            modal.classList.add('fade-out');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.close-btn').addEventListener('click', closeModal);
        modal.querySelector('.close-history-btn').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Animate in
        setTimeout(() => modal.classList.add('show'), 10);
    }

    // Cloud Sync Methods
    async handleSyncClick() {
        const token = localStorage.getItem('github_token');
        
        if (token) {
            // Already authenticated, perform sync
            await this.performSync(token);
        } else {
            // Need to authenticate first
            await this.authenticateWithGitHub();
        }
    }

    async authenticateWithGitHub() {
        try {
            this.showNotification('Starting authentication...', 'info');
            
            const { userCode, verificationUri, pollPromise } = await this.githubAuth.authenticate();
            
            // Show modal with authentication instructions
            const token = await this.syncModal.show(userCode, verificationUri, pollPromise);
            
            // Authentication successful
            this.showNotification('✅ Connected to GitHub successfully!', 'success');
            this.updateSyncUI();
            
            // Perform initial sync
            await this.performSync(token);
        } catch (error) {
            console.error('Authentication error:', error);
            if (error.message !== 'Authentication cancelled by user') {
                this.showNotification('❌ ' + error.message, 'error');
            }
        }
    }

    async performSync(token) {
        try {
            this.showNotification('🔄 Syncing data...', 'info');
            
            // Create sync service
            const syncService = new GistSyncService(token);
            
            // Prepare local data
            const localData = this.getLocalDataForSync();
            
            // Perform sync
            const result = await syncService.sync(localData);
            
            if (result.action === 'downloaded') {
                // Remote data is newer, apply it
                this.applyRemoteData(result.data);
                this.showNotification('✅ Downloaded latest data from cloud', 'success');
            } else if (result.action === 'uploaded') {
                this.showNotification('✅ Uploaded local data to cloud', 'success');
            } else {
                this.showNotification('✅ Data synced successfully', 'success');
            }
        } catch (error) {
            console.error('Sync error:', error);
            
            // Check if token is invalid
            if (error.message.includes('401') || error.message.includes('403')) {
                localStorage.removeItem('github_token');
                this.updateSyncUI();
                this.showNotification('❌ Session expired. Please reconnect.', 'error');
            } else {
                this.showNotification('❌ ' + error.message, 'error');
            }
        }
    }

    async handleDisconnectClick() {
        const confirmed = await this.showConfirm(
            'Are you sure you want to disconnect from GitHub? Your data will remain in the cloud, but you won\'t be able to sync until you reconnect.',
            'Disconnect from GitHub'
        );
        
        if (confirmed) {
            // Clear tokens and Gist ID
            localStorage.removeItem('github_token');
            localStorage.removeItem('fitrack_gist_id');
            
            this.updateSyncUI();
            this.showNotification('Disconnected from GitHub', 'info');
        }
    }

    updateSyncUI() {
        const syncBtn = document.getElementById('sync-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        
        if (!syncBtn || !disconnectBtn) return;
        
        const token = localStorage.getItem('github_token');
        
        if (token) {
            // Connected state
            syncBtn.innerHTML = '🔄 Sync Now';
            syncBtn.style.display = 'inline-flex';
            disconnectBtn.style.display = 'inline-flex';
        } else {
            // Disconnected state
            syncBtn.innerHTML = '🔗 Connect GitHub';
            syncBtn.style.display = 'inline-flex';
            disconnectBtn.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        const statusEl = document.getElementById('sync-status');
        if (!statusEl) return;
        
        statusEl.textContent = message;
        statusEl.className = `sync-status ${type} show`;
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success' || type === 'info') {
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 5000);
        }
    }

    getLocalDataForSync() {
        return {
            version: '1.0',
            workouts: this.workoutHistory,
            exercises: this.currentWorkout,
            progress: [],
            settings: {
                activeProgram: this.activeProgram
            },
            createdAt: new Date().toISOString(),
            lastSync: new Date().toISOString()
        };
    }

    applyRemoteData(remoteData) {
        if (!remoteData || !this.validateRemoteData(remoteData)) {
            throw new Error('Invalid remote data structure');
        }
        
        // Apply remote data to local state
        this.workoutHistory = remoteData.workouts || [];
        this.currentWorkout = remoteData.exercises || [];
        this.activeProgram = remoteData.settings?.activeProgram || null;
        
        // Save to localStorage
        this.saveData();
        
        // Update UI
        this.updateUI();
        this.renderHistory();
    }

    validateRemoteData(data) {
        return data && 
               typeof data === 'object' &&
               'version' in data &&
               Array.isArray(data.workouts);
    }
}

// Initialize app
let app;
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new FiTrackApp();
        // Make app accessible globally for inline event handlers
        window.app = app;
    });
}

// Export for testing
export { FiTrackApp };
