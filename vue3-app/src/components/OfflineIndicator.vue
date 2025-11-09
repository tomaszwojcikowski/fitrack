<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-indicator">
      <span class="offline-icon">📡</span>
      <span class="offline-text">You're offline - Changes will sync when reconnected</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);

function handleOnline() {
  isOnline.value = true;
}

function handleOffline() {
  isOnline.value = false;
}

onMounted(() => {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
});

onUnmounted(() => {
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
});
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #ff9800;
  color: #000;
  padding: 0.75rem 1rem;
  text-align: center;
  z-index: 10000;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.offline-icon {
  font-size: 1.2rem;
}

.offline-text {
  font-size: 0.95rem;
}

.slide-down-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-down-leave-active {
  animation: slideDown 0.3s ease-in reverse;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .offline-text {
    font-size: 0.85rem;
  }
}
</style>
