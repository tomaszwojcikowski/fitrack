import { ref, onMounted } from 'vue';

export function usePWA() {
  const isInstalled = ref(false);
  const isOnline = ref(navigator.onLine);
  const deferredPrompt = ref<any>(null);

  onMounted(() => {
    // Check if app is installed
    isInstalled.value = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt.value = e;
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      isInstalled.value = true;
      console.log('PWA: App installed');
    });

    // Listen for online/offline
    window.addEventListener('online', () => {
      isOnline.value = true;
      console.log('PWA: Back online');
    });

    window.addEventListener('offline', () => {
      isOnline.value = false;
      console.log('PWA: Offline mode');
    });
  });

  async function promptInstall() {
    if (!deferredPrompt.value) {
      return false;
    }

    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    
    if (outcome === 'accepted') {
      deferredPrompt.value = null;
      return true;
    }
    
    return false;
  }

  return {
    isInstalled,
    isOnline,
    canInstall: ref(!!deferredPrompt.value),
    promptInstall,
  };
}
