// Rest timer functionality
export class TimerManager {
    constructor() {
        this.restTimerInterval = null;
        this.restTimerSeconds = 0;
        this.timerSound = document.getElementById('timerSound');
    }

    startRestTimer(seconds) {
        this.restTimerSeconds = seconds;
        const restTimer = document.getElementById('restTimer');
        if (restTimer) {
            restTimer.classList.remove('hidden');
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
        const restTimer = document.getElementById('restTimer');
        if (restTimer) {
            restTimer.classList.add('hidden');
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
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = display;
        }
        
        // Update progress circle
        const totalSeconds = 90; // Default timer length for calculation
        const progress = this.restTimerSeconds / totalSeconds;
        const circumference = 2 * Math.PI * 45; // radius is 45
        const offset = circumference * (1 - progress);
        
        const timerProgress = document.querySelector('.timer-progress');
        if (timerProgress) {
            timerProgress.style.strokeDashoffset = offset;
        }
    }

    playTimerSound() {
        try {
            if (this.timerSound) {
                const playPromise = this.timerSound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        // Silent fail if sound doesn't play
                        console.log('Timer sound could not play');
                    });
                }
            }
        } catch (e) {
            // Silent fail if sound doesn't play
            console.log('Timer sound could not play');
        }
    }

    getRestTimerSeconds() {
        return this.restTimerSeconds;
    }
}
