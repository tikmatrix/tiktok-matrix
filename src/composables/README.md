# Vue Composables

This directory contains reusable Vue 3 composition API logic.

## Available Composables

### useUpdateManager

Manages application and library update operations.

**Features:**
- Unified state management for update operations
- Support for both Tauri app updates and library updates
- Progress tracking for downloads and installations
- Error handling and recovery

**Usage:**
```javascript
import { useUpdateManager } from '@/composables/useUpdateManager';

export default {
  setup() {
    const updateManager = useUpdateManager();
    return { updateManager };
  },
  methods: {
    async checkForUpdates() {
      await this.updateManager.checkForUpdates({
        silent: false,
        checkTauriUpdate: true,
        checkLibraries: true
      });
    }
  }
}
```

See `/docs/UPDATE_FLOW.md` for detailed documentation.

## Adding New Composables

When creating new composables:

1. Create a new file in this directory: `useFeatureName.js`
2. Export a function that returns reactive state and methods
3. Add documentation in this README
4. Add detailed docs in `/docs` if complex

Example structure:
```javascript
import { ref, computed } from 'vue';

export function useFeatureName() {
  const state = ref({
    // state properties
  });

  const computedValue = computed(() => {
    // computed logic
  });

  const method = () => {
    // method logic
  };

  return {
    state,
    computedValue,
    method
  };
}
```
