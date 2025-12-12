import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/tauri';
import { onUpdaterEvent } from '@tauri-apps/api/updater';

/**
 * Update manager composable for handling application and library updates
 * Provides unified state management and methods for update operations
 */
export function useUpdateManager() {
  // State management
  const updateState = ref({
    // Tauri app update state
    tauriUpdateAvailable: false,
    tauriUpdateInfo: null,
    
    // Library update state
    checkingUpdates: false,
    downloadingUpdate: false,
    installingUpdate: false,
    
    // Progress tracking
    downloadProgress: {
      filesize: 0,
      transfered: 0,
      transfer_rate: 0,
      percentage: 0
    },
    
    // Status messages
    currentOperation: '',
    lastError: null
  });

  // Computed properties
  const hasUpdateAvailable = computed(() => updateState.value.tauriUpdateAvailable);
  const isUpdating = computed(() => 
    updateState.value.checkingUpdates || 
    updateState.value.downloadingUpdate || 
    updateState.value.installingUpdate
  );
  const updateVersion = computed(() => updateState.value.tauriUpdateInfo?.version || '');

  /**
   * Reset download progress
   */
  const resetDownloadProgress = () => {
    updateState.value.downloadProgress = {
      filesize: 0,
      transfered: 0,
      transfer_rate: 0,
      percentage: 0
    };
  };

  /**
   * Update download progress
   * @param {Object} progress - Progress data from backend
   */
  const updateDownloadProgress = (progress) => {
    updateState.value.downloadProgress = { ...progress };
  };

  /**
   * Set Tauri update availability
   * @param {Object} updateInfo - Update information from backend
   */
  const setTauriUpdateInfo = (updateInfo) => {
    if (updateInfo && updateInfo.should_update) {
      updateState.value.tauriUpdateAvailable = true;
      updateState.value.tauriUpdateInfo = updateInfo;
    } else {
      updateState.value.tauriUpdateAvailable = false;
      updateState.value.tauriUpdateInfo = null;
    }
  };

  /**
   * Clear update availability state
   */
  const clearUpdateState = () => {
    updateState.value.tauriUpdateAvailable = false;
    updateState.value.tauriUpdateInfo = null;
    updateState.value.lastError = null;
  };

  /**
   * Check for updates (both app and libraries)
   * @param {Object} options - Check options
   * @param {boolean} options.silent - Whether to check silently without UI
   * @param {boolean} options.checkTauriUpdate - Whether to check Tauri app updates
   * @param {boolean} options.checkLibraries - Whether to check library updates
   * @returns {Promise<Object>} - Check result
   */
  const checkForUpdates = async (options = {}) => {
    const {
      silent = false,
      checkTauriUpdate = true,
      checkLibraries = true
    } = options;

    // Reset state when user manually triggers check
    if (!silent && checkTauriUpdate) {
      clearUpdateState();
    }

    updateState.value.checkingUpdates = true;
    updateState.value.currentOperation = 'Checking for updates...';
    updateState.value.lastError = null;

    try {
      const result = await invoke('initialize_app', {
        options: {
          check_updates: checkLibraries,
          silent,
          check_libs_url: '',
          check_tauri_update: checkTauriUpdate
        }
      });

      console.log('Update check result:', result);

      // Handle Tauri update
      if (checkTauriUpdate && result.tauri_update) {
        setTauriUpdateInfo(result.tauri_update);
      }

      return result;
    } catch (error) {
      console.error('Failed to check updates:', error);
      updateState.value.lastError = error.message || 'Update check failed';
      throw error;
    } finally {
      updateState.value.checkingUpdates = false;
      updateState.value.currentOperation = '';
    }
  };

  /**
   * Install Tauri app update (Windows only)
   * @returns {Promise<void>}
   */
  const installTauriUpdate = async () => {
    updateState.value.downloadingUpdate = true;
    updateState.value.currentOperation = 'Downloading update...';
    resetDownloadProgress();

    try {
      // Listen for download progress
      await onUpdaterEvent(({ error, status }) => {
        console.log('Updater event:', status, error);
        
        if (status === 'PENDING') {
          updateState.value.currentOperation = 'Downloading update...';
        } else if (status === 'DONE') {
          updateState.value.downloadingUpdate = false;
          updateState.value.installingUpdate = true;
          updateState.value.currentOperation = 'Installing update...';
          resetDownloadProgress();
        } else if (status === 'ERROR') {
          console.error('Update error:', error);
          updateState.value.lastError = error || 'Update failed';
          updateState.value.downloadingUpdate = false;
          updateState.value.installingUpdate = false;
        }
      });

      // Trigger installation
      await invoke('install_and_relaunch_update');
    } catch (error) {
      console.error('Failed to install update:', error);
      updateState.value.lastError = error.message || 'Installation failed';
      updateState.value.downloadingUpdate = false;
      updateState.value.installingUpdate = false;
      throw error;
    }
  };

  return {
    // State
    updateState,
    
    // Computed
    hasUpdateAvailable,
    isUpdating,
    updateVersion,
    
    // Methods
    checkForUpdates,
    installTauriUpdate,
    setTauriUpdateInfo,
    clearUpdateState,
    updateDownloadProgress,
    resetDownloadProgress
  };
}
