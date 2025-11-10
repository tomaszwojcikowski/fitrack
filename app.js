// FiTrack Application
import { EXERCISES } from './exercises.js';
import { WORKOUT_PROGRAMS } from './programs.js';
import { SimpleSyncService } from './services/simpleSyncService.js';
import { renderExerciseCard } from './components/exerciseCard.js';
import { renderModalExerciseItem } from './components/exercisePickerModal.js';
import { Dashboard } from './components/dashboard.js';
import { StatsCalculator } from './src/statsCalculator.js';
import { prDetector } from './src/prDetection.js';
import { DataExporter } from './src/dataExport.js';

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
        this.syncService = new SimpleSyncService();
        
        // Phase 2 features
        this.favoriteExercises = [];
        this.recentExercises = [];
        this.collapsedExercises = new Set();
        this.autoStartRestTimer = false;
        this.workoutStartTime = null;
        this.workoutDurationInterval = null;
        this.lastWeightSuggestions = {};
        
        // Phase 3 features
        this.dashboard = new Dashboard(this);
        this.currentCalendarMonth = new Date().getMonth();
        this.currentCalendarYear = new Date().getFullYear();
        this.historyViewMode = 'list'; // 'list' or 'calendar'
        this.historyFilters = {
            search: '',
            dateRange: 'all'
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setTodayDate();
        this.handleInitialView();
        this.updateUI();
        this.showWelcomeTooltip();
        
        // Start auto-sync if connected
        if (this.syncService.isConnected()) {
            this.startAutoSync();
        }
    }

    handleInitialView() {
        // Handle URL hash on page load
        const hash = window.location.hash.slice(1); // Remove the '#'
        
        // Navigate based on hash
        if (hash === 'dashboard') {
            this.showDashboard();
        } else if (hash === 'history') {
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
                this.currentWorkout = data.currentWorkout || [];
            } catch (e) {
                console.error('Error loading data:', e);
            }
        }
        
        // Load Phase 2 preferences
        try {
            const favorites = localStorage.getItem('fitrack_favorites');
            this.favoriteExercises = favorites ? JSON.parse(favorites) : [];
            
            const recent = localStorage.getItem('fitrack_recent');
            this.recentExercises = recent ? JSON.parse(recent) : [];
            
            const autoStart = localStorage.getItem('fitrack_autoStartTimer');
            this.autoStartRestTimer = autoStart === 'true';
            
            const suggestions = localStorage.getItem('fitrack_weightSuggestions');
            this.lastWeightSuggestions = suggestions ? JSON.parse(suggestions) : {};
        } catch (e) {
            console.error('Error loading preferences:', e);
        }
    }

    saveData() {
        const data = {
            history: this.workoutHistory,
            activeProgram: this.activeProgram,
            currentWorkout: this.currentWorkout
        };
        localStorage.setItem('fitrack_data', JSON.stringify(data));
        
        // Save Phase 2 preferences
        try {
            localStorage.setItem('fitrack_favorites', JSON.stringify(this.favoriteExercises));
            localStorage.setItem('fitrack_recent', JSON.stringify(this.recentExercises));
            localStorage.setItem('fitrack_weightSuggestions', JSON.stringify(this.lastWeightSuggestions));
        } catch (e) {
            console.error('Error saving preferences:', e);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Bottom Navigation
        const navHomeBtn = document.getElementById('navHomeBtn');
        if (navHomeBtn) {
            navHomeBtn.addEventListener('click', () => this.showWorkout());
        }
        
        const navHistoryBtn = document.getElementById('navHistoryBtn');
        if (navHistoryBtn) {
            navHistoryBtn.addEventListener('click', () => this.showHistory());
        }
        
        const navTemplatesBtn = document.getElementById('navTemplatesBtn');
        if (navTemplatesBtn) {
            navTemplatesBtn.addEventListener('click', () => this.showPrograms());
        }
        
        const navProgressBtn = document.getElementById('navProgressBtn');
        if (navProgressBtn) {
            navProgressBtn.addEventListener('click', () => this.showDashboard());
        }
        
        // Old Navigation (kept for compatibility)
        const dashboardBtn = document.getElementById('dashboardBtn');
        if (dashboardBtn) {
            dashboardBtn.addEventListener('click', () => this.showDashboard());
        }
        
        const backToWorkoutFromDashboard = document.getElementById('backToWorkoutFromDashboard');
        if (backToWorkoutFromDashboard) {
            backToWorkoutFromDashboard.addEventListener('click', () => this.showWorkout());
        }
        
        // Dashboard interactions
        const prevWeek = document.getElementById('prevWeek');
        if (prevWeek) {
            prevWeek.addEventListener('click', () => {
                this.dashboard.navigateToPrevWeek();
            });
        }
        
        const nextWeek = document.getElementById('nextWeek');
        if (nextWeek) {
            nextWeek.addEventListener('click', () => {
                this.dashboard.navigateToNextWeek();
            });
        }
        
        const exerciseChartSelect = document.getElementById('exerciseChartSelect');
        if (exerciseChartSelect) {
            exerciseChartSelect.addEventListener('change', (e) => {
                this.dashboard.handleExerciseSelection(e.target.value);
            });
        }
        
        const startWorkoutFromDash = document.getElementById('startWorkoutFromDash');
        if (startWorkoutFromDash) {
            startWorkoutFromDash.addEventListener('click', () => this.showWorkout());
        }
        
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => this.showExportModal());
        }
        
        const viewAllPRs = document.getElementById('viewAllPRs');
        if (viewAllPRs) {
            viewAllPRs.addEventListener('click', () => this.showAllPRsModal());
        }
        
        // Export modal handlers
        this.setupExportModal();
        
        // PR celebration modal handlers
        this.setupPRCelebrationModal();
        
        // All PRs modal handlers
        this.setupAllPRsModal();
        
        // History view mode toggle
        const listViewBtn = document.getElementById('listViewBtn');
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => this.switchHistoryView('list'));
        }
        
        const calendarViewBtn = document.getElementById('calendarViewBtn');
        if (calendarViewBtn) {
            calendarViewBtn.addEventListener('click', () => this.switchHistoryView('calendar'));
        }
        
        // History filters
        const historySearch = document.getElementById('historySearch');
        if (historySearch) {
            historySearch.addEventListener('input', (e) => {
                this.historyFilters.search = e.target.value;
                this.renderHistoryWithFilters();
                document.getElementById('clearHistorySearch').classList.toggle('hidden', !e.target.value);
            });
        }
        
        const clearHistorySearch = document.getElementById('clearHistorySearch');
        if (clearHistorySearch) {
            clearHistorySearch.addEventListener('click', () => {
                document.getElementById('historySearch').value = '';
                this.historyFilters.search = '';
                this.renderHistoryWithFilters();
                clearHistorySearch.classList.add('hidden');
            });
        }
        
        const dateRangeFilter = document.getElementById('dateRangeFilter');
        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', (e) => {
                this.historyFilters.dateRange = e.target.value;
                this.renderHistoryWithFilters();
            });
        }
        
        // Calendar navigation
        const prevMonth = document.getElementById('prevMonth');
        if (prevMonth) {
            prevMonth.addEventListener('click', () => this.navigateToPrevMonth());
        }
        
        const nextMonth = document.getElementById('nextMonth');
        if (nextMonth) {
            nextMonth.addEventListener('click', () => this.navigateToNextMonth());
        }
        
        // Exercise search
        const searchInput = document.getElementById('exerciseSearch');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        searchInput.addEventListener('focus', () => {
            // Show suggestions when focused or open modal
            this.openExercisePickerModal();
        });

        const clearSearchElem = document.getElementById('clearSearch');
        if (clearSearchElem) clearSearchElem.addEventListener('click', () => {
            this.clearSearch();
        });

        // Exercise Picker Modal
        const modalOverlay = document.querySelector('#exercisePickerModal .modal-overlay');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.closeExercisePickerModal();
            });
        }

        const closePickerBtn = document.getElementById('closeExercisePicker');
        if (closePickerBtn) {
            closePickerBtn.addEventListener('click', () => {
                this.closeExercisePickerModal();
            });
        }

        const modalSearch = document.getElementById('modalExerciseSearch');
        if (modalSearch) {
            modalSearch.addEventListener('input', (e) => {
                this.renderExercisePickerContent(e.target.value);
                const clearBtn = document.getElementById('modalClearSearch');
                if (clearBtn) {
                    clearBtn.classList.toggle('hidden', !e.target.value);
                }
            });
        }

        const modalClearBtn = document.getElementById('modalClearSearch');
        if (modalClearBtn) {
            modalClearBtn.addEventListener('click', () => {
                if (modalSearch) {
                    modalSearch.value = '';
                    this.renderExercisePickerContent('');
                    modalClearBtn.classList.add('hidden');
                }
            });
        }

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
        
        // Home screen new buttons
        const startEmptyWorkoutBtn = document.getElementById('startEmptyWorkout');
        if (startEmptyWorkoutBtn) {
            startEmptyWorkoutBtn.addEventListener('click', () => {
                // Just hide the home screen sections to show the workout interface
                const homeScreenSections = document.getElementById('homeScreenSections');
                const exerciseSelection = document.querySelector('.exercise-selection');
                const currentExercises = document.getElementById('currentExercises');
                
                if (homeScreenSections) homeScreenSections.classList.add('hidden');
                if (exerciseSelection) exerciseSelection.classList.remove('hidden');
                if (currentExercises) currentExercises.classList.remove('hidden');
            });
        }
        
        const startProgramDayBtn = document.getElementById('startProgramDay');
        if (startProgramDayBtn) {
            startProgramDayBtn.addEventListener('click', () => {
                this.loadProgramWorkout();
            });
        }

        // Navigation (old buttons - kept for compatibility)
        const historyBtn = document.getElementById('historyBtn');
        if (historyBtn) {
            historyBtn.addEventListener('click', () => {
                this.showHistory();
            });
        }

        const backToWorkoutBtn = document.getElementById('backToWorkout');
        if (backToWorkoutBtn) {
            backToWorkoutBtn.addEventListener('click', () => {
                this.showWorkout();
            });
        }

        // Quick rest button
        const quickRestBtnElem = document.getElementById('quickRestBtn');
        if (quickRestBtnElem) quickRestBtnElem.addEventListener('click', () => {
            this.startRestTimer(90); // Default 90 seconds
        });

        // Compact timer - click to expand
        const compactTimer = document.getElementById('compactTimer');
        if (compactTimer) {
            compactTimer.addEventListener('click', () => {
                this.expandRestTimer();
            });
        }

        // Full rest timer overlay - click to collapse
        const restTimer = document.getElementById('restTimer');
        if (restTimer) {
            restTimer.addEventListener('click', (e) => {
                // Only collapse if clicking the overlay, not the content
                if (e.target === restTimer) {
                    this.collapseRestTimer();
                }
            });
        }

        // Timer controls
        const timerStopElem = document.getElementById('timerStop');
        if (timerStopElem) timerStopElem.addEventListener('click', () => {
            this.stopRestTimer();
        });

        // Timer quick action buttons
        const timerAdd15 = document.getElementById('timerAdd15');
        const timerAdd30 = document.getElementById('timerAdd30');
        const timerSkip = document.getElementById('timerSkip');
        
        if (timerAdd15) {
            timerAdd15.addEventListener('click', () => {
                this.addRestTime(15);
            });
        }
        
        if (timerAdd30) {
            timerAdd30.addEventListener('click', () => {
                this.addRestTime(30);
            });
        }
        
        if (timerSkip) {
            timerSkip.addEventListener('click', () => {
                this.stopRestTimer();
            });
        }

        // FAB (Floating Action Button) - Open modal instead
        const addExerciseFab = document.getElementById('addExerciseFab');
        if (addExerciseFab) {
            addExerciseFab.addEventListener('click', () => {
                this.openExercisePickerModal();
            });
        }

        // Auto-start timer toggle
        const autoStartToggle = document.getElementById('autoStartTimer');
        if (autoStartToggle) {
            autoStartToggle.checked = this.autoStartRestTimer;
            autoStartToggle.addEventListener('change', (e) => {
                this.toggleAutoStartTimer(e.target.checked);
            });
        }

        // Workout date
        const workoutDateElem = document.getElementById('workoutDate');
        if (workoutDateElem) workoutDateElem.addEventListener('change', (e) => {
            // Date changed, could trigger save
        });

        // Finish workout button
        const finishWorkoutBtnElem = document.getElementById('finishWorkoutBtn');
        if (finishWorkoutBtnElem) finishWorkoutBtnElem.addEventListener('click', () => {
            this.finishWorkout();
        });

        // Programs
        const programsBtnElem = document.getElementById('programsBtn');
        if (programsBtnElem) programsBtnElem.addEventListener('click', () => {
            this.showPrograms();
        });

        const backToWorkoutFromProgramsElem = document.getElementById('backToWorkoutFromPrograms');
        if (backToWorkoutFromProgramsElem) backToWorkoutFromProgramsElem.addEventListener('click', () => {
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
        const tokenInput = document.getElementById('github-token-input');
        const saveTokenBtn = document.getElementById('save-token-btn');
        
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                this.handleManualSync();
            });
        }
        
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => {
                this.handleDisconnect();
            });
        }
        
        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => {
                this.handleSaveToken();
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
        this.updateFAB();
        this.updateHomeScreen();
    }
    
    updateHomeScreen() {
        const homeScreenSections = document.getElementById('homeScreenSections');
        const welcomeSection = document.getElementById('welcomeSection');
        const continueProgramSection = document.getElementById('continueProgramSection');
        const recentHistorySection = document.getElementById('recentHistorySection');
        const exerciseSelection = document.querySelector('.exercise-selection');
        const currentExercises = document.getElementById('currentExercises');
        
        if (!homeScreenSections) return; // Guard for tests
        
        // Show home screen sections only when there's no current workout
        if (this.currentWorkout.length === 0) {
            homeScreenSections.classList.remove('hidden');
            if (welcomeSection) welcomeSection.classList.add('hidden');
            if (exerciseSelection) exerciseSelection.classList.add('hidden');
            if (currentExercises) currentExercises.classList.add('hidden');
            
            // Show Continue Program section if there's an active program
            if (this.activeProgram && continueProgramSection) {
                continueProgramSection.classList.remove('hidden');
                const program = this.getProgramById(this.activeProgram.programId);
                if (program) {
                    const week = program.weeks.find(w => w.week === this.activeProgram.currentWeek);
                    const day = week?.days.find(d => d.day === this.activeProgram.currentDay);
                    
                    document.getElementById('activeProgramName').textContent = program.name;
                    document.getElementById('activeProgramNext').textContent = day ? `Next: ${day.name}` : 'Continue Program';
                    
                    const startBtn = document.getElementById('startProgramDay');
                    startBtn.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Start "${day ? day.name : 'Workout'}"
                    `;
                }
            } else if (continueProgramSection) {
                continueProgramSection.classList.add('hidden');
            }
            
            // Show Recent History section if there are workouts
            if (this.workoutHistory.length > 0 && recentHistorySection) {
                recentHistorySection.classList.remove('hidden');
                this.renderRecentHistory();
            } else if (recentHistorySection) {
                recentHistorySection.classList.add('hidden');
            }
        } else {
            // Hide home screen sections when workout is in progress
            homeScreenSections.classList.add('hidden');
            if (exerciseSelection) exerciseSelection.classList.add('hidden');
            if (currentExercises) currentExercises.classList.remove('hidden');
        }
    }
    
    renderRecentHistory() {
        const recentHistoryList = document.getElementById('recentHistoryList');
        if (!recentHistoryList) return;
        
        // Show only the 3 most recent workouts
        const recentWorkouts = this.workoutHistory.slice(0, 3);
        
        if (recentWorkouts.length === 0) {
            recentHistoryList.innerHTML = '<p class="empty-state">No workout history yet.</p>';
            return;
        }
        
        recentHistoryList.innerHTML = recentWorkouts.map(workout => {
            const date = new Date(workout.date);
            const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            // Calculate duration
            const duration = workout.duration ? this.formatDuration(workout.duration) : 'N/A';
            
            // Get exercise count
            const exerciseCount = workout.exercises ? workout.exercises.length : 0;
            
            // Get first exercise preview
            let preview = '';
            if (workout.exercises && workout.exercises.length > 0) {
                const firstEx = workout.exercises[0];
                const setCount = firstEx.sets ? firstEx.sets.filter(s => s.completed).length : 0;
                const weight = firstEx.sets && firstEx.sets.length > 0 ? firstEx.sets[0].weight : 0;
                preview = `${firstEx.name}: ${setCount} sets${weight ? `, ${weight}kg` : ''}`;
            }
            
            return `
                <div class="recent-workout-card" data-workout-date="${workout.date}">
                    <div class="recent-workout-header">
                        <div class="recent-workout-name">${workout.name || 'Workout'}</div>
                        <div class="recent-workout-date">${formattedDate}</div>
                    </div>
                    <div class="recent-workout-meta">${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}, ${duration}</div>
                    ${preview ? `<div class="recent-workout-preview">${preview}</div>` : ''}
                </div>
            `;
        }).join('');
        
        // Add click handlers to recent workout cards
        recentHistoryList.querySelectorAll('.recent-workout-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showHistory();
            });
        });
    }
    
    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes} min`;
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
    
    updateFAB() {
        const fab = document.getElementById('addExerciseFab');
        const workoutView = document.getElementById('workoutView');
        
        if (!fab) return;
        
        // Show FAB only on workout view when there are exercises (to add more)
        if (workoutView.classList.contains('active') && this.currentWorkout.length > 0) {
            fab.classList.remove('hidden');
        } else {
            fab.classList.add('hidden');
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
            // Start workout duration timer if this is the first exercise
            if (this.currentWorkout.length === 0) {
                this.startWorkoutDurationTimer();
            }
            
            this.currentWorkout.push({
                ...exercise,
                sets: [this.createEmptySet()]
            });
            this.showToast(`${exercise.name} added to workout`, 'success');
            
            // Add to recent exercises
            this.addToRecentExercises(exercise.name);
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
        const exercise = this.currentWorkout[exerciseIndex];
        exercise.sets[setIndex][field] = value;
        
        // Automatically apply weight and reps to all remaining incomplete sets
        if ((field === 'weight' || field === 'reps') && value) {
            for (let i = setIndex + 1; i < exercise.sets.length; i++) {
                if (!exercise.sets[i].completed) {
                    exercise.sets[i][field] = value;
                }
            }
            // Update UI to reflect the changes
            this.updateUI();
        }
        
        this.saveData();
    }

    toggleSetComplete(exerciseIndex, setIndex) {
        const exercise = this.currentWorkout[exerciseIndex];
        const set = exercise.sets[setIndex];
        set.completed = !set.completed;
        
        // If completing a set, handle auto-start timer and celebration
        if (set.completed) {
            // Auto-start rest timer if enabled
            if (this.autoStartRestTimer && !this.restTimerInterval) {
                this.startRestTimer(90); // Default 90 seconds rest
                this.showToast('Rest timer started automatically', 'info');
            } else if (!this.autoStartRestTimer) {
                // Old behavior - always start timer
                this.startRestTimer(90);
            }
            
            // Add celebration animation to the exercise card
            const exerciseCards = document.querySelectorAll('.exercise-card');
            if (exerciseCards[exerciseIndex]) {
                exerciseCards[exerciseIndex].classList.add('celebrate');
                setTimeout(() => {
                    exerciseCards[exerciseIndex].classList.remove('celebrate');
                }, 600);
            }
            
            // Check if all exercise sets are completed - auto-collapse
            const allSetsCompleted = exercise.sets.every(s => s.completed);
            if (allSetsCompleted) {
                setTimeout(() => {
                    this.toggleExerciseCollapse(exerciseIndex);
                }, 1500);
            }
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

        container.innerHTML = this.currentWorkout
            .map((exercise, exIndex) => renderExerciseCard(exercise, exIndex))
            .join('');

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
        
        // Check for PRs (only when finishing workout, not on auto-save)
        const isNewWorkout = existingIndex < 0;

        if (existingIndex >= 0) {
            this.workoutHistory[existingIndex] = workoutData;
        } else {
            this.workoutHistory.unshift(workoutData);
        }

        this.saveData();
        this.showSaveIndicator();
        
        return { workoutData, isNewWorkout };
    }

    async finishWorkout() {
        if (this.currentWorkout.length === 0) {
            this.showToast('No exercises to save!', 'warning');
            return;
        }

        // Stop duration timer and get total duration
        const totalDuration = this.stopWorkoutDurationTimer();

        // Save the current workout and check for PRs
        const saveResult = this.saveCurrentWorkout();
        
        // Check for PRs when finishing workout
        let prs = [];
        if (saveResult && saveResult.workoutData) {
            prs = this.checkForPRs(saveResult.workoutData);
        }

        // Mark current program day as completed if in a program
        if (this.activeProgram) {
            const currentDayKey = `w${this.activeProgram.currentWeek}d${this.activeProgram.currentDay}`;
            if (!this.activeProgram.completedDays.includes(currentDayKey)) {
                this.activeProgram.completedDays.push(currentDayKey);
                this.saveData();
            }
        }

        // Ask if user wants to clear the workout
        const minutes = Math.floor(totalDuration / 60);
        const durationText = minutes > 0 ? ` (${minutes} min)` : '';
        const prText = prs.length > 0 ? ` 🏆 ${prs.length} PR${prs.length > 1 ? 's' : ''}!` : '';
        const shouldClear = await this.showConfirm(
            `Workout saved to history!${durationText}${prText} Would you like to start a new workout?`,
            'Workout Complete'
        );
        
        // Show PR celebration if any PRs were achieved
        if (prs.length > 0) {
            setTimeout(() => {
                this.showPRCelebration(prs);
            }, 300);
        }
        
        if (shouldClear) {
            this.currentWorkout = [];
            this.collapsedExercises.clear();
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
        
        // Auto-sync if connected
        if (this.syncService.isConnected()) {
            this.performSync().catch(err => {
                console.error('Auto-sync after workout failed:', err);
            });
        }
    }

    // Rest Timer
    startRestTimer(seconds) {
        this.restTimerSeconds = seconds;
        this.restTimerTotalSeconds = seconds; // Store initial value for progress calculation
        
        // Show compact timer, not full screen
        const compactTimer = document.getElementById('compactTimer');
        if (compactTimer) {
            compactTimer.classList.remove('hidden');
        }
        
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
        const compactTimer = document.getElementById('compactTimer');
        const restTimer = document.getElementById('restTimer');
        if (compactTimer) compactTimer.classList.add('hidden');
        if (restTimer) restTimer.classList.add('hidden');
    }

    expandRestTimer() {
        // Show full screen timer
        const restTimer = document.getElementById('restTimer');
        const compactTimer = document.getElementById('compactTimer');
        if (restTimer) restTimer.classList.remove('hidden');
        // Keep compact timer hidden while full screen is shown
        if (compactTimer) compactTimer.classList.add('hidden');
    }

    collapseRestTimer() {
        // Hide full screen timer and show compact timer
        const restTimer = document.getElementById('restTimer');
        const compactTimer = document.getElementById('compactTimer');
        if (restTimer) restTimer.classList.add('hidden');
        if (this.restTimerInterval && compactTimer) {
            compactTimer.classList.remove('hidden');
        }
    }

    addRestTime(seconds) {
        this.restTimerSeconds += seconds;
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.restTimerSeconds / 60);
        const seconds = this.restTimerSeconds % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const compactDisplay = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds}s`;
        
        // Update full timer display
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = display;
        }
        
        // Update compact timer display
        const compactTimerDisplay = document.getElementById('compactTimerDisplay');
        if (compactTimerDisplay) {
            compactTimerDisplay.textContent = compactDisplay;
        }
        
        // Update progress circles
        const totalSeconds = this.restTimerTotalSeconds || 90; // Use initial timer value for accurate progress
        const progress = this.restTimerSeconds / totalSeconds;
        
        // Update full timer progress circle
        const circumference = 2 * Math.PI * 45; // radius is 45
        const offset = circumference * (1 - progress);
        
        const progressElement = document.querySelector('.timer-progress');
        if (progressElement) {
            progressElement.style.strokeDashoffset = offset;
            
            // Color transitions based on remaining time
            progressElement.classList.remove('warning', 'danger');
            if (this.restTimerSeconds <= 10) {
                progressElement.classList.add('danger');
            } else if (this.restTimerSeconds <= 30) {
                progressElement.classList.add('warning');
            }
        }
        
        // Update compact timer progress circle
        const compactCircumference = 2 * Math.PI * 16; // radius is 16
        const compactOffset = compactCircumference * (1 - progress);
        
        const compactProgressElement = document.querySelector('.compact-timer-progress');
        if (compactProgressElement) {
            compactProgressElement.style.strokeDasharray = compactCircumference;
            compactProgressElement.style.strokeDashoffset = compactOffset;
            
            // Color transitions based on remaining time
            compactProgressElement.classList.remove('warning', 'danger');
            if (this.restTimerSeconds <= 10) {
                compactProgressElement.classList.add('danger');
            } else if (this.restTimerSeconds <= 30) {
                compactProgressElement.classList.add('warning');
            }
        }
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
    updateBottomNav(activeView) {
        // Update bottom navigation active state
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.view === activeView) {
                item.classList.add('active');
            }
        });
        
        // Update header title based on active view
        const headerTitle = document.getElementById('headerTitle');
        if (headerTitle) {
            switch(activeView) {
                case 'workout':
                    headerTitle.textContent = 'FiTrack';
                    break;
                case 'history':
                    headerTitle.textContent = 'History';
                    break;
                case 'programs':
                    headerTitle.textContent = 'Templates';
                    break;
                case 'dashboard':
                    headerTitle.textContent = 'Progress';
                    break;
                case 'settings':
                    headerTitle.textContent = 'Settings';
                    break;
                default:
                    headerTitle.textContent = 'FiTrack';
            }
        }
    }

    showHistory() {
        document.getElementById('workoutView').classList.remove('active');
        document.getElementById('programsView').classList.remove('active');
        const settingsView = document.getElementById('settingsView');
        if (settingsView) settingsView.classList.remove('active');
        const dashboardView = document.getElementById('dashboardView');
        if (dashboardView) dashboardView.classList.remove('active');
        document.getElementById('historyView').classList.add('active');
        window.location.hash = 'history';
        
        // Update bottom nav
        this.updateBottomNav('history');
        
        // Use new enhanced history rendering
        if (this.historyViewMode === 'calendar') {
            this.renderCalendarView();
        } else {
            this.renderHistoryWithFilters();
        }
        
        this.updateCurrentWorkoutButton();
    }

    showWorkout() {
        document.getElementById('historyView').classList.remove('active');
        document.getElementById('programsView').classList.remove('active');
        const settingsView = document.getElementById('settingsView');
        if (settingsView) settingsView.classList.remove('active');
        document.getElementById('workoutView').classList.add('active');
        window.location.hash = 'workout';
        
        // Update bottom nav
        this.updateBottomNav('workout');
        
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
        
        // Update bottom nav
        this.updateBottomNav('settings');
        
        this.updateCurrentWorkoutButton();
        
        // Update sync UI when showing settings
        this.updateSyncUI();
    }

    // Legacy renderHistory - now uses renderHistoryWithFilters
    renderHistory() {
        // Check if new elements exist, otherwise use old rendering for compatibility
        const newContainer = document.getElementById('historyListView');
        if (newContainer) {
            this.renderHistoryWithFilters();
            return;
        }
        
        // Fallback to old rendering for tests
        const container = document.getElementById('historyContent');
        if (!container) return;
        
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
        
        // Update bottom nav
        this.updateBottomNav('programs');
        
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
    async handleSaveToken() {
        const tokenInput = document.getElementById('github-token-input');
        const token = tokenInput?.value?.trim();
        
        if (!token) {
            this.showNotification('❌ Please enter a valid token', 'error');
            return;
        }

        try {
            this.showNotification('🔄 Verifying token...', 'info');
            
            // Verify token
            const isValid = await this.syncService.verifyToken(token);
            if (!isValid) {
                this.showNotification('❌ Invalid token. Please check and try again.', 'error');
                return;
            }

            // Save token
            this.syncService.setToken(token);
            
            // Clear input for security
            if (tokenInput) tokenInput.value = '';
            
            // Update UI
            this.updateSyncUI();
            
            // Perform initial sync
            await this.performSync();
            
            // Start auto-sync
            this.startAutoSync();
            
            this.showNotification('✅ Connected successfully! Auto-sync enabled.', 'success');
        } catch (error) {
            console.error('Token save error:', error);
            this.showNotification('❌ ' + error.message, 'error');
        }
    }

    async handleManualSync() {
        await this.performSync();
    }

    async performSync() {
        try {
            this.showNotification('🔄 Syncing...', 'info');
            
            const localData = this.getLocalDataForSync();
            const result = await this.syncService.sync(localData);
            
            if (result.action === 'downloaded' && result.data) {
                this.applyRemoteData(result.data);
                this.showNotification('✅ ' + result.message, 'success');
            } else {
                this.showNotification('✅ ' + result.message, 'success');
            }
        } catch (error) {
            console.error('Sync error:', error);
            
            if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Invalid token')) {
                this.syncService.disconnect();
                this.updateSyncUI();
                this.showNotification('❌ Token expired or invalid. Please reconnect.', 'error');
            } else {
                this.showNotification('❌ Sync failed: ' + error.message, 'error');
            }
        }
    }

    async handleDisconnect() {
        const confirmed = await this.showConfirm(
            'Disconnect from GitHub? Your cloud data will remain, but auto-sync will stop.',
            'Disconnect'
        );
        
        if (confirmed) {
            this.syncService.disconnect();
            this.updateSyncUI();
            this.showNotification('Disconnected from GitHub', 'info');
        }
    }

    startAutoSync() {
        this.syncService.startAutoSync(
            () => this.getLocalDataForSync(),
            (data) => this.applyRemoteData(data),
            (result) => {
                // Silent background sync - only log
                console.log('Background sync:', result.message);
            }
        );
    }

    updateSyncUI() {
        const syncBtn = document.getElementById('sync-btn');
        const disconnectBtn = document.getElementById('disconnect-btn');
        const tokenSection = document.getElementById('token-section');
        const connectedSection = document.getElementById('connected-section');
        
        if (!syncBtn || !disconnectBtn) return;
        
        const isConnected = this.syncService.isConnected();
        
        if (isConnected) {
            // Connected state
            if (tokenSection) tokenSection.style.display = 'none';
            if (connectedSection) connectedSection.style.display = 'block';
            syncBtn.style.display = 'inline-flex';
            disconnectBtn.style.display = 'inline-flex';
        } else {
            // Disconnected state
            if (tokenSection) tokenSection.style.display = 'block';
            if (connectedSection) connectedSection.style.display = 'none';
            syncBtn.style.display = 'none';
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

    // Phase 2: Exercise Picker Modal
    openExercisePickerModal() {
        const modal = document.getElementById('exercisePickerModal');
        if (!modal) return;
        
        modal.classList.remove('hidden');
        this.renderExercisePickerContent();
        
        // Focus search input
        const searchInput = document.getElementById('modalExerciseSearch');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }

    closeExercisePickerModal() {
        const modal = document.getElementById('exercisePickerModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    renderExercisePickerContent(searchTerm = '') {
        const favoriteSection = document.getElementById('favoriteExercises');
        const recentSection = document.getElementById('recentExercises');
        const allSection = document.getElementById('allExercises');
        const noResults = document.getElementById('noResults');
        
        if (!favoriteSection || !recentSection || !allSection || !noResults) return;
        
        let filteredExercises = EXERCISES;
        
        // Filter exercises by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredExercises = EXERCISES.filter(ex => 
                ex.name.toLowerCase().includes(term) ||
                ex.category.toLowerCase().includes(term) ||
                ex.equipment.toLowerCase().includes(term)
            );
        }
        
        // Show/hide sections based on search and data
        if (searchTerm) {
            favoriteSection.classList.add('hidden');
            recentSection.classList.add('hidden');
        } else {
            // Show favorites if exists
            if (this.favoriteExercises.length > 0) {
                favoriteSection.classList.remove('hidden');
                const favoritesList = document.getElementById('favoriteExercisesList');
                const favoriteItems = this.favoriteExercises
                    .map(name => EXERCISES.find(ex => ex.name === name))
                    .filter(ex => ex)
                    .map(ex => renderModalExerciseItem(ex, true));
                favoritesList.innerHTML = favoriteItems.join('');
            } else {
                favoriteSection.classList.add('hidden');
            }
            
            // Show recent if exists
            if (this.recentExercises.length > 0) {
                recentSection.classList.remove('hidden');
                const recentList = document.getElementById('recentExercisesList');
                const recentItems = this.recentExercises
                    .slice(0, 5) // Show last 5
                    .map(name => EXERCISES.find(ex => ex.name === name))
                    .filter(ex => ex)
                    .map(ex => renderModalExerciseItem(ex, this.favoriteExercises.includes(ex.name)));
                recentList.innerHTML = recentItems.join('');
            } else {
                recentSection.classList.add('hidden');
            }
        }
        
        // Render filtered exercises
        if (filteredExercises.length > 0) {
            allSection.classList.remove('hidden');
            noResults.classList.add('hidden');
            const allList = document.getElementById('allExercisesList');
            const allItems = filteredExercises.map(ex => 
                renderModalExerciseItem(ex, this.favoriteExercises.includes(ex.name), searchTerm)
            );
            allList.innerHTML = allItems.join('');
        } else {
            allSection.classList.add('hidden');
            noResults.classList.remove('hidden');
        }
    }

    selectExerciseFromModal(exerciseName) {
        const exercise = EXERCISES.find(ex => ex.name === exerciseName);
        if (exercise) {
            this.addExercise(exercise);
            this.addToRecentExercises(exerciseName);
            this.closeExercisePickerModal();
        }
    }

    toggleFavoriteExercise(exerciseName) {
        const index = this.favoriteExercises.indexOf(exerciseName);
        if (index > -1) {
            this.favoriteExercises.splice(index, 1);
            this.showToast('Removed from favorites', 'info');
        } else {
            this.favoriteExercises.push(exerciseName);
            this.showToast('Added to favorites', 'success');
        }
        this.saveData();
        this.renderExercisePickerContent(document.getElementById('modalExerciseSearch')?.value || '');
    }

    addToRecentExercises(exerciseName) {
        // Remove if already exists
        this.recentExercises = this.recentExercises.filter(name => name !== exerciseName);
        // Add to beginning
        this.recentExercises.unshift(exerciseName);
        // Keep only last 10
        this.recentExercises = this.recentExercises.slice(0, 10);
        this.saveData();
    }

    // Phase 2: Collapsible Exercise Cards
    toggleExerciseCollapse(exIndex) {
        const card = document.querySelector(`[data-exercise-index="${exIndex}"]`);
        if (!card) return;
        
        card.classList.toggle('collapsed');
        
        // Remember state
        if (card.classList.contains('collapsed')) {
            this.collapsedExercises.add(exIndex);
        } else {
            this.collapsedExercises.delete(exIndex);
        }
    }

    // Phase 2: Auto-start Rest Timer
    toggleAutoStartTimer(enabled) {
        this.autoStartRestTimer = enabled;
        localStorage.setItem('fitrack_autoStartTimer', enabled.toString());
        this.showToast(
            enabled ? 'Auto-start rest timer enabled' : 'Auto-start rest timer disabled',
            'info'
        );
    }

    // Phase 2: Workout Duration Timer
    startWorkoutDurationTimer() {
        if (!this.workoutStartTime) {
            this.workoutStartTime = Date.now();
        }
        
        const durationEl = document.getElementById('workoutDuration');
        if (durationEl) {
            durationEl.classList.remove('hidden');
            durationEl.classList.add('active');
        }
        
        // Clear any existing interval
        if (this.workoutDurationInterval) {
            clearInterval(this.workoutDurationInterval);
        }
        
        // Update every second
        this.workoutDurationInterval = setInterval(() => {
            this.updateWorkoutDuration();
        }, 1000);
        
        this.updateWorkoutDuration();
    }

    updateWorkoutDuration() {
        if (!this.workoutStartTime) return;
        
        const elapsed = Math.floor((Date.now() - this.workoutStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        
        const timeEl = document.getElementById('durationTime');
        if (timeEl) {
            if (hours > 0) {
                timeEl.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    stopWorkoutDurationTimer() {
        if (this.workoutDurationInterval) {
            clearInterval(this.workoutDurationInterval);
            this.workoutDurationInterval = null;
        }
        
        const durationEl = document.getElementById('workoutDuration');
        if (durationEl) {
            durationEl.classList.add('hidden');
            durationEl.classList.remove('active');
        }
        
        const duration = this.workoutStartTime ? Math.floor((Date.now() - this.workoutStartTime) / 1000) : 0;
        this.workoutStartTime = null;
        
        return duration;
    }

    // Phase 2: Smart Weight Suggestions
    showSmartSuggestion(exerciseName, setIndex) {
        const exercise = this.currentWorkout.find(ex => ex.name === exerciseName);
        if (!exercise || setIndex >= exercise.sets.length) return;
        
        // Get last workout data for this exercise
        const lastWorkout = this.getLastWorkoutForExercise(exerciseName);
        if (!lastWorkout || !lastWorkout.sets || lastWorkout.sets.length === 0) return;
        
        const lastSet = lastWorkout.sets[Math.min(setIndex, lastWorkout.sets.length - 1)];
        if (!lastSet || !lastSet.weight) return;
        
        // Calculate suggestion
        const lastWeight = parseFloat(lastSet.weight);
        const allCompleted = lastWorkout.sets.every(s => s.completed);
        const suggestedWeight = allCompleted ? (lastWeight * 1.025).toFixed(1) : lastWeight;
        
        // Show suggestion banner
        this.displayWeightSuggestion(exerciseName, setIndex, lastWeight, suggestedWeight);
    }

    displayWeightSuggestion(exerciseName, setIndex, lastWeight, suggestedWeight) {
        const exerciseCard = document.querySelector(`[data-exercise-index]`);
        if (!exerciseCard) return;
        
        // Check if suggestion already exists
        const existingSuggestion = exerciseCard.querySelector('.smart-suggestion');
        if (existingSuggestion) return;
        
        const suggestionHtml = `
            <div class="smart-suggestion" data-exercise="${exerciseName}" data-set="${setIndex}">
                <svg class="suggestion-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <div class="suggestion-content">
                    <div class="suggestion-title">💡 Smart Suggestion</div>
                    <div class="suggestion-text">Last time: ${lastWeight} kg, try ${suggestedWeight} kg today</div>
                </div>
                <div class="suggestion-actions">
                    <button class="suggestion-btn" onclick="app.applySuggestion('${exerciseName}', ${setIndex}, ${suggestedWeight})">Apply</button>
                    <button class="suggestion-btn secondary" onclick="app.dismissSuggestion('${exerciseName}')">Dismiss</button>
                </div>
            </div>
        `;
        
        exerciseCard.insertAdjacentHTML('afterbegin', suggestionHtml);
    }

    applySuggestion(exerciseName, setIndex, weight) {
        const exIndex = this.currentWorkout.findIndex(ex => ex.name === exerciseName);
        if (exIndex === -1) return;
        
        this.updateSet(exIndex, setIndex, 'weight', weight);
        this.dismissSuggestion(exerciseName);
        this.showToast('Suggestion applied!', 'success');
    }

    dismissSuggestion(exerciseName) {
        const suggestion = document.querySelector(`.smart-suggestion[data-exercise="${exerciseName}"]`);
        if (suggestion) {
            suggestion.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => suggestion.remove(), 300);
        }
    }

    getLastWorkoutForExercise(exerciseName) {
        for (const workout of this.workoutHistory) {
            const exercise = workout.exercises?.find(ex => ex.name === exerciseName);
            if (exercise) return exercise;
        }
        return null;
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

    // ===== Phase 3: Dashboard & Visualization Methods =====
    
    showDashboard() {
        const dashboardView = document.getElementById('dashboardView');
        if (!dashboardView) return; // Guard for tests
        
        // Hide all views
        document.getElementById('workoutView').classList.remove('active');
        document.getElementById('historyView').classList.remove('active');
        document.getElementById('programsView').classList.remove('active');
        const settingsView = document.getElementById('settingsView');
        if (settingsView) settingsView.classList.remove('active');
        
        // Show dashboard
        dashboardView.classList.add('active');
        window.location.hash = 'dashboard';
        
        // Update bottom nav
        this.updateBottomNav('dashboard');
        
        // Render dashboard content
        this.dashboard.render();
        this.updateCurrentWorkoutButton();
    }

    setupExportModal() {
        const modal = document.getElementById('exportModal');
        if (!modal) return; // Guard for tests
        
        const closeBtn = document.getElementById('closeExportModal');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        
        const exportJSON = document.getElementById('exportJSON');
        if (exportJSON) {
            exportJSON.addEventListener('click', () => {
                const exporter = new DataExporter(this.workoutHistory, this.activeProgram);
                exporter.exportJSON();
                this.showToast('Data exported as JSON', 'success');
                closeModal();
            });
        }
        
        const exportCSV = document.getElementById('exportCSV');
        if (exportCSV) {
            exportCSV.addEventListener('click', () => {
                const exporter = new DataExporter(this.workoutHistory, this.activeProgram);
                exporter.exportCSV();
                this.showToast('Data exported as CSV', 'success');
                closeModal();
            });
        }
    }

    showExportModal() {
        document.getElementById('exportModal').classList.remove('hidden');
    }

    setupPRCelebrationModal() {
        const modal = document.getElementById('prCelebrationModal');
        if (!modal) return; // Guard for tests
        
        const closeBtn = document.getElementById('closePRCelebration');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
    }

    showPRCelebration(prs) {
        const modal = document.getElementById('prCelebrationModal');
        const list = document.getElementById('prCelebrationList');
        
        list.innerHTML = prs.map(pr => `
            <div class="pr-celebration-item">
                <div class="pr-celebration-exercise">${pr.exercise || 'Exercise'}</div>
                <div class="pr-celebration-detail">${prDetector.formatPR(pr)}</div>
                <div class="pr-description">${prDetector.getPRDescription(pr)}</div>
            </div>
        `).join('');
        
        modal.classList.remove('hidden');
    }

    setupAllPRsModal() {
        const modal = document.getElementById('allPRsModal');
        if (!modal) return; // Guard for tests
        
        const closeBtn = document.getElementById('closeAllPRsModal');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        
        const prSearch = document.getElementById('prSearch');
        if (prSearch) {
            prSearch.addEventListener('input', (e) => {
                this.renderAllPRsList(e.target.value);
            });
        }
    }

    showAllPRsModal() {
        document.getElementById('allPRsModal').classList.remove('hidden');
        this.renderAllPRsList('');
    }

    renderAllPRsList(searchTerm = '') {
        const list = document.getElementById('allPRsList');
        const allPRs = prDetector.getAllPRs();
        
        const filtered = searchTerm 
            ? allPRs.filter(ex => ex.name.toLowerCase().includes(searchTerm.toLowerCase()))
            : allPRs;
        
        if (filtered.length === 0) {
            list.innerHTML = '<p class="empty-state">No PRs found</p>';
            return;
        }
        
        list.innerHTML = filtered.map(exercise => `
            <div class="all-prs-exercise">
                <div class="all-prs-exercise-name">${exercise.name}</div>
                <div class="all-prs-records">
                    ${exercise.records.map(record => {
                        const date = new Date(record.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                        });
                        return `
                            <div class="all-prs-record">
                                <div>
                                    <div class="all-prs-record-type">${prDetector.getPRDescription(record)}</div>
                                    <div class="all-prs-record-value">${prDetector.formatPR(record)}</div>
                                </div>
                                <div class="all-prs-record-date">${date}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `).join('');
    }

    // Check for PRs when finishing workout
    checkForPRs(workout) {
        const allPRs = [];
        
        workout.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                const prs = prDetector.checkAndUpdatePR(exercise.name, set, workout.date);
                if (prs.length > 0) {
                    prs.forEach(pr => {
                        allPRs.push({
                            exercise: exercise.name,
                            ...pr
                        });
                    });
                }
            });
        });
        
        return allPRs;
    }

    // Enhanced history view
    switchHistoryView(mode) {
        this.historyViewMode = mode;
        
        const listViewBtn = document.getElementById('listViewBtn');
        const calendarViewBtn = document.getElementById('calendarViewBtn');
        const listView = document.getElementById('historyListView');
        const calendarView = document.getElementById('historyCalendarView');
        
        if (mode === 'list') {
            listViewBtn.classList.add('active');
            calendarViewBtn.classList.remove('active');
            listView.classList.remove('hidden');
            calendarView.classList.add('hidden');
            this.renderHistoryWithFilters();
        } else {
            listViewBtn.classList.remove('active');
            calendarViewBtn.classList.add('active');
            listView.classList.add('hidden');
            calendarView.classList.remove('hidden');
            this.renderCalendarView();
        }
    }

    renderHistoryWithFilters() {
        const container = document.getElementById('historyListView');
        if (!container) return; // Guard for tests
        
        let filtered = [...this.workoutHistory];
        
        // Apply search filter
        if (this.historyFilters.search) {
            const searchLower = this.historyFilters.search.toLowerCase();
            filtered = filtered.filter(workout => 
                workout.exercises.some(ex => 
                    ex.name.toLowerCase().includes(searchLower)
                )
            );
        }
        
        // Apply date range filter
        if (this.historyFilters.dateRange !== 'all') {
            const days = parseInt(this.historyFilters.dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            filtered = filtered.filter(workout => {
                const workoutDate = new Date(workout.date + 'T00:00:00');
                return workoutDate >= cutoffDate;
            });
        }
        
        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">No workouts match your filters</p>';
            return;
        }
        
        container.innerHTML = filtered.map(workout => {
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

    renderCalendarView() {
        const stats = new StatsCalculator(this.workoutHistory);
        const calendar = stats.getMonthlyCalendar(this.currentCalendarYear, this.currentCalendarMonth);
        const grid = document.getElementById('calendarGrid');
        
        // Update month label
        const monthLabel = document.getElementById('monthLabel');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        monthLabel.textContent = `${monthNames[this.currentCalendarMonth]} ${this.currentCalendarYear}`;
        
        // Day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const headerRow = dayHeaders.map(day => 
            `<div class="calendar-day-header">${day}</div>`
        ).join('');
        
        // Calendar days
        const daysHTML = calendar.flatMap(week => 
            week.map(day => {
                if (!day.date) {
                    return '<div class="calendar-day empty"></div>';
                }
                
                return `
                    <div class="calendar-day ${day.workoutCount > 0 ? 'has-workout' : ''} ${day.isToday ? 'today' : ''}"
                         data-date="${day.date}">
                        <div class="calendar-day-number">${day.day}</div>
                        ${day.workoutCount > 0 ? `<div class="calendar-workout-badge">${day.workoutCount}</div>` : ''}
                    </div>
                `;
            })
        ).join('');
        
        grid.innerHTML = headerRow + daysHTML;
        
        // Add click handlers
        grid.querySelectorAll('.calendar-day[data-date]').forEach(dayEl => {
            dayEl.addEventListener('click', () => {
                const date = dayEl.getAttribute('data-date');
                this.showWorkoutDetailModal(date);
            });
        });
    }

    navigateToPrevMonth() {
        this.currentCalendarMonth--;
        if (this.currentCalendarMonth < 0) {
            this.currentCalendarMonth = 11;
            this.currentCalendarYear--;
        }
        this.renderCalendarView();
    }

    navigateToNextMonth() {
        this.currentCalendarMonth++;
        if (this.currentCalendarMonth > 11) {
            this.currentCalendarMonth = 0;
            this.currentCalendarYear++;
        }
        this.renderCalendarView();
    }

    showWorkoutDetailModal(date) {
        const workouts = this.workoutHistory.filter(w => w.date === date);
        
        if (workouts.length === 0) return;
        
        const modal = document.getElementById('workoutDetailModal');
        const body = document.getElementById('workoutDetailBody');
        const title = document.getElementById('workoutDetailTitle');
        
        const dateObj = new Date(date + 'T00:00:00');
        const dateStr = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        title.textContent = dateStr;
        
        body.innerHTML = workouts.map(workout => `
            ${workout.exercises.map(ex => `
                <div class="workout-detail-exercise">
                    <div class="workout-detail-exercise-name">${ex.name}</div>
                    <div class="workout-detail-sets">
                        ${ex.sets.map((set, index) => `
                            <div class="workout-detail-set">
                                Set ${index + 1}: 
                                ${set.reps ? `${set.reps} reps` : ''}
                                ${set.weight ? ` × ${set.weight} kg` : ''}
                                ${set.time ? ` • ${set.time}` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        `).join('');
        
        modal.classList.remove('hidden');
        
        // Setup close handler
        const closeBtn = document.getElementById('closeWorkoutDetail');
        const overlay = modal.querySelector('.modal-overlay');
        
        const closeModal = () => {
            modal.classList.add('hidden');
        };
        
        if (closeBtn) {
            closeBtn.removeEventListener('click', closeModal);
            closeBtn.addEventListener('click', closeModal);
        }
        
        if (overlay) {
            overlay.removeEventListener('click', closeModal);
            overlay.addEventListener('click', closeModal);
        }
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
