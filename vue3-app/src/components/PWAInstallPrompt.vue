<template>
  <Transition name="slide-up">
    <div v-if="showPrompt" class="pwa-install-prompt">
      <div class="prompt-content">
        <div class="prompt-icon">📱</div>
        <div class="prompt-text">
          <h3>Install FiTrack</h3>
          <p>Install the app for a better experience with offline support!</p>
        </div>
        <div class="prompt-actions">
          <button class="btn-dismiss" @click="dismiss">
            Maybe Later
          </button>
          <button class="btn-install" @click="install">
            Install
          </button>
        </div>
      </div>
      <button class="btn-close" @click="dismiss" aria-label="Close">×</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showPrompt = ref(false);
const deferredPrompt = ref<any>(null);

onMounted(() => {
  // Check if already dismissed
  const dismissed = localStorage.getItem('fitrack-pwa-dismissed');
  if (dismissed) return;

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
    
    // Show prompt after a short delay
    setTimeout(() => {
      showPrompt.value = true;
    }, 3000);
  });

  // Check if already installed
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return; // Already installed
  }
});

function install() {
  if (!deferredPrompt.value) return;

  deferredPrompt.value.prompt();
  deferredPrompt.value.userChoice.then((choiceResult: any) => {
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    deferredPrompt.value = null;
    showPrompt.value = false;
  });
}

function dismiss() {
  showPrompt.value = false;
  localStorage.setItem('fitrack-pwa-dismissed', 'true');
}
</script>

<style scoped>
.pwa-install-prompt {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  max-width: 500px;
  width: calc(100% - 2rem);
  background: var(--card-bg);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  padding: 1rem;
}

.prompt-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.prompt-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.prompt-text {
  flex: 1;
}

.prompt-text h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.prompt-text p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.prompt-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.btn-dismiss,
.btn-install {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
}

.btn-dismiss {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.btn-dismiss:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.btn-install {
  background: var(--primary-color);
  color: white;
}

.btn-install:hover {
  background: var(--primary-hover);
}

.btn-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 0;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

/* Animations */
.slide-up-enter-active {
  animation: slideUp 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slideUp 0.3s ease-in reverse;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .pwa-install-prompt {
    bottom: 0.5rem;
    width: calc(100% - 1rem);
  }

  .prompt-content {
    flex-direction: column;
    text-align: center;
  }

  .prompt-actions {
    width: 100%;
  }

  .btn-dismiss,
  .btn-install {
    flex: 1;
  }
}
</style>
