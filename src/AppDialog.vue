<template>
  <dialog ref="page_dialog" class="modal">
    <div class="modal-box max-w-full w-auto max-h-[90vh] overflow-y-auto">
      <ManageAccounts :devices="devices" v-if="selectedItem.name === 'accounts' && $refs.page_dialog.open" />
      <TikTokSettings :settings="settings" v-if="selectedItem.name === 'tiktokSettings' && $refs.page_dialog.open" />
      <TrainSettings v-if="selectedItem.name === 'accountWarmup' && $refs.page_dialog.open"
        :group="selectedItem.group" />
      <PublishSettings v-if="selectedItem.name === 'post' && $refs.page_dialog.open" :group="selectedItem.group" />
      <ManageMaterials :group="selectedItem.group" v-if="selectedItem.name === 'materials' && $refs.page_dialog.open" />
      <ManageTasks :devices="devices" v-if="selectedItem.name === 'tasks' && $refs.page_dialog.open" />
      <BeforeRunScriptDialog :selecedDevices="selecedDevices" :devices="devices" :script="selectedItem.script"
        :settings="settings" v-if="selectedItem.name === 'beforeRunScriptDialog' && $refs.page_dialog.open" />

    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>


</template>

<script>
import ManageAccounts from './components/account/ManageAccounts.vue'
import TikTokSettings from './components/TikTokSettings.vue'
import TrainSettings from './components/groups/TrainSettings.vue'
import PublishSettings from './components/groups/PublishSettings.vue'
import ManageMaterials from './components/material/ManageMaterials.vue'
import ManageTasks from './components/tasks/ManageTasks.vue'
import BeforeRunScriptDialog from './components/dialogs/BeforeRunScriptDialog.vue'
export default {
  name: 'appDialog',
  props: {
    devices: {
      type: Array,
      required: true
    },
    settings: {
      type: Object,
      required: true
    },
    selecedDevices: {
      type: Array,
      required: true
    }
  },
  components: {
    ManageAccounts,
    TikTokSettings,
    TrainSettings,
    PublishSettings,
    ManageMaterials,
    ManageTasks,
    BeforeRunScriptDialog,
  },
  data() {
    return {
      selectedItem: {},
    }
  },
  methods: {
    menu_selected(item) {
      this.selectedItem = item
      this.$refs.page_dialog.showModal()
      this.$refs.page_dialog.addEventListener('close', () => {
        this.selectedItem = {}
      })
    },



  },
  async mounted() {
    // 监听关闭页面对话框事件
    await this.$listen('closeDialog', (e) => {
      this.$refs.page_dialog.close();
    });

    // 监听菜单选择事件
    await this.$listen('showDialog', (e) => {
      this.menu_selected(e.payload);
    });
  }
}
</script>
