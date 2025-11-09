<template>
  <Teleport to="body">
    <Transition name="timer-fade">
      <div v-if="isActive" class="rest-timer-overlay">
        <div class="rest-timer">
          <div class="timer-header">
            <h3>Rest Timer</h3>
            <button class="close-btn" @click="stop" aria-label="Close timer">×</button>
          </div>
          
          <div class="timer-body">
            <svg class="timer-circle" viewBox="0 0 200 200">
              <circle
                class="timer-circle-bg"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke-width="8"
              />
              <circle
                class="timer-circle-progress"
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke-width="8"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset"
                transform="rotate(-90 100 100)"
              />
            </svg>
            
            <div class="timer-display">
              <div class="timer-time">{{ formattedTime }}</div>
              <div class="timer-label">{{ timeRemaining > 0 ? 'remaining' : 'overtime' }}</div>
            </div>
          </div>

          <div class="timer-controls">
            <button class="btn btn-sm btn-secondary" @click="addTime(-15)">-15s</button>
            <button 
              class="btn btn-sm btn-primary" 
              @click="togglePause"
            >
              {{ isPaused ? 'Resume' : 'Pause' }}
            </button>
            <button class="btn btn-sm btn-secondary" @click="addTime(15)">+15s</button>
          </div>

          <button class="btn btn-primary btn-full" @click="skip">
            Skip Rest
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';

const props = defineProps<{
  duration?: number; // in seconds
}>();

const emit = defineEmits<{
  complete: [];
  skip: [];
}>();

const isActive = ref(false);
const isPaused = ref(false);
const timeRemaining = ref(0);
const totalDuration = ref(0);
let interval: NodeJS.Timeout | null = null;

const circumference = 2 * Math.PI * 90;

const dashOffset = computed(() => {
  if (totalDuration.value === 0) return 0;
  const progress = timeRemaining.value / totalDuration.value;
  return circumference * (1 - progress);
});

const formattedTime = computed(() => {
  const absTime = Math.abs(timeRemaining.value);
  const minutes = Math.floor(absTime / 60);
  const seconds = absTime % 60;
  const sign = timeRemaining.value < 0 ? '+' : '';
  return `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`;
});

watch(timeRemaining, (newTime) => {
  if (newTime === 0) {
    playSound();
  }
});

function start(seconds: number = props.duration || 90) {
  timeRemaining.value = seconds;
  totalDuration.value = seconds;
  isActive.value = true;
  isPaused.value = false;
  startInterval();
}

function startInterval() {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (!isPaused.value) {
      timeRemaining.value--;
    }
  }, 1000);
}

function stop() {
  isActive.value = false;
  isPaused.value = false;
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  emit('complete');
}

function skip() {
  stop();
  emit('skip');
}

function togglePause() {
  isPaused.value = !isPaused.value;
}

function addTime(seconds: number) {
  timeRemaining.value += seconds;
}

function playSound() {
  try {
    const audio = new Audio();
    // Simple beep using data URI
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2S67OmdTw0OTqXh8LSHOgobccHu3Z1PFBB';
    audio.play().catch(() => {
      // Ignore errors if audio can't play
      console.log('Timer sound could not play');
    });
  } catch (e) {
    // Silently fail
  }
}

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});

defineExpose({
  start,
  stop,
  skip,
});
</script>

<style scoped>
.rest-timer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.rest-timer {
  background: var(--card-bg, #1e293b);
  border-radius: var(--radius-xl, 1rem);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
}

.timer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.timer-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #f1f5f9);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary, #94a3b8);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--text-primary, #f1f5f9);
}

.timer-body {
  position: relative;
  margin-bottom: 2rem;
}

.timer-circle {
  width: 100%;
  max-width: 200px;
  height: auto;
  margin: 0 auto;
  display: block;
}

.timer-circle-bg {
  stroke: var(--border-color, #334155);
}

.timer-circle-progress {
  stroke: var(--primary-color, #3b82f6);
  transition: stroke-dashoffset 1s linear;
}

.timer-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer-time {
  font-size: 3rem;
  font-weight: 700;
  color: var(--text-primary, #f1f5f9);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.timer-label {
  font-size: 0.875rem;
  color: var(--text-secondary, #94a3b8);
  margin-top: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timer-controls {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.btn-full {
  width: 100%;
}

.timer-fade-enter-active,
.timer-fade-leave-active {
  transition: opacity 0.3s ease;
}

.timer-fade-enter-from,
.timer-fade-leave-to {
  opacity: 0;
}
</style>
