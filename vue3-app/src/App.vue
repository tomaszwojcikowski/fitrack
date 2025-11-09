<template>
  <div id="app" class="app">
    <!-- Offline Indicator -->
    <OfflineIndicator />
    
    <AppHeader />
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <!-- PWA Install Prompt -->
    <PWAInstallPrompt />
    
    <!-- PWA Update Notification -->
    <Transition name="slide-up">
      <div v-if="showUpdateNotification" class="update-notification">
        <div class="update-content">
          <span>🎉 New version available!</span>
          <button class="btn-update" @click="updateApp">
            Update Now
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRegisterSW } from 'virtual:pwa-register/vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import PWAInstallPrompt from '@/components/PWAInstallPrompt.vue';
import OfflineIndicator from '@/components/OfflineIndicator.vue';

const showUpdateNotification = ref(false);

// Register service worker with auto-update
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    console.log('PWA: Service worker registered');
    
    // Check for updates every hour
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    }
  },
  onRegisterError(error: Error) {
    console.error('PWA: Service worker registration error', error);
  },
  onNeedRefresh() {
    showUpdateNotification.value = true;
  },
});

// Use needRefresh to show update notification
if (needRefresh.value) {
  showUpdateNotification.value = true;
}

function updateApp() {
  showUpdateNotification.value = false;
  updateServiceWorker(true);
}

onMounted(() => {
  console.log('FiTrack Vue 3 initialized');
  
  // Log PWA status
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA: Running in standalone mode');
  }
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.update-notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: var(--card-bg);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  z-index: 9999;
  padding: 1rem 1.5rem;
}

.update-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.update-content span {
  color: var(--text-primary);
  font-weight: 500;
}

.btn-update {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: var(--primary-color);
  color: white;
  white-space: nowrap;
}

.btn-update:hover {
  background: var(--primary-hover);
}

.slide-up-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-up-leave-active {
  animation: slideDown 0.3s ease-in reverse;
}

@keyframes slideDown {
  from {
    transform: translateY(-100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .update-notification {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }

  .update-content {
    flex-direction: column;
    text-align: center;
  }

  .btn-update {
    width: 100%;
  }
}
</style>
