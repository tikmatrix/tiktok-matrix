<template>
  <div class="flex flex-col items-start h-screen w-screen overflow-hidden">
    <TitleBar />
    <div class="flex flex-row items-start bg-base-300 h-screen w-screen overflow-hidden mt-12">
      <Sidebar :devices="devices" :settings="settings" :groups="groups" :selecedDevices="selecedDevices" v-if="showSidebar" />
      <ManageDevices :devices="devices" :settings="settings" />
    </div>
    <AppDialog :devices="devices" :settings="settings" :selecedDevices="selecedDevices" />
    <Notifications />
  </div>
</template>

<script>
import TitleBar from './components/TitleBar.vue'
import Sidebar from './components/Sidebar.vue'
import AppDialog from './AppDialog.vue'
import ManageDevices from './components/device/ManageDevices.vue'
import Notifications from './components/Notifications.vue';
import { readTextFile, BaseDirectory } from '@tauri-apps/api/fs'

export default {
  name: 'app',
  components: {
    TitleBar,
    Sidebar,
    AppDialog,
    ManageDevices,
    Notifications
  },
  data() {
    return {
      devices: [],
      settings: {},
      groups: [],
      showSidebar: true,
      ws: null,
      running_devices: [],
      selecedDevices: [],
      listeners: [],
    }
  },
 
  methods: {
    async get_settings() {
      this.$service.get_settings().then(async res => {
        this.settings = res.data
        await this.$emiter('NOTIFY', {
          type: 'success',
          message: this.$t('settingsUpdated'),
          timeout: 2000
        });
      })
    },
   
    async get_groups() {
      this.$service.get_groups().then(async res => {
          this.groups = res.data
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: this.$t('groupsUpdated'),
            timeout: 2000
          });
        })
    },
    async getRunningTasks() {
      this.$service.get_running_tasks().then(res => {
        let running_tasks = res.data
        let running_serials = running_tasks.map(task => task.serial)
        this.devices.forEach(device => {
          device.task_status = running_serials.includes(device.real_serial) ? 1 : 0
        })
      })
    },
    async connectAgent() {
      const wsPort = await readTextFile('wssport.txt', { dir: BaseDirectory.AppData });
      if (wsPort === '0') {
        return;
      }
      const wsUrl = `ws://127.0.0.1:${wsPort}`
      console.log(wsUrl)
      this.ws = new WebSocket(wsUrl)
      this.ws.onopen = async () => {
        console.log('ws open')
      }
      this.ws.onmessage = async (e) => {
        // console.log(e.data)
        const json = JSON.parse(e.data)
        if (json.action === 'reload_devices') {
          let data = json.data
          if (data) {
            this.getDevices()
          }
        } else if (json.action === 'reload_license') {
          await this.$emiter('LICENSE', { reload: true })
        } else if (json.action === 'task_status') {
          let serial = json.serial
          let status = json.status
          if (status === 1) {
            this.running_devices.push(serial)
          } else {
            let index = this.running_devices.indexOf(serial)
            if (index > -1) {
              this.running_devices.splice(index, 1)
            }
          }
          this.devices.forEach(device => {
            if (device.real_serial === serial) {
              device.task_status = status
            }
          })
          await this.$emiter('reload_tasks', {})
        }else if (json.action === 'agent_status') {
          let serial = json.serial
          let status = json.status
          this.devices.forEach(device => {
            if (device.real_serial === serial) {
              if(status === -1){
                device.task_status = -1
              }else if(status === 0&&device.task_status !== 1){
                //task is not running
                device.task_status = 0
              }else{
                //task is running,do nothing
                console.log('task is running,do nothing')
              }
            }
          })
          // await this.$emiter('reload_tasks', {})
        }else if (json.action === 'heartbeat') {
          await this.$emiter('heartbeat', {})
        }
      }
      this.ws.onclose = async () => {
        console.log('ws close')
      }
      this.ws.onerror = async (e) => {
        console.log(e)
      }
    },
    async getDevices() {
      this.$service.get_devices().then(res => {
        const newDevices = res.data;
        const currentDevices = this.devices;
        
        // 找出需要删除的设备
        const devicesToRemove = currentDevices.filter(current => 
          !newDevices.some(newDevice => newDevice.real_serial === current.real_serial)
        );
        
        // 找出需要添加或更新的设备
        const devicesToAddOrUpdate = newDevices.filter(newDevice => {
          const existingDevice = currentDevices.find(current => 
            current.real_serial === newDevice.real_serial
          );
          return !existingDevice || JSON.stringify(existingDevice) !== JSON.stringify(newDevice);
        });

        // 删除不存在的设备
        devicesToRemove.forEach(device => {
          const index = currentDevices.findIndex(d => d.real_serial === device.real_serial);
          if (index !== -1) {
            currentDevices.splice(index, 1);
          }
        });

        // 添加或更新设备
        devicesToAddOrUpdate.forEach(newDevice => {
          const existingIndex = currentDevices.findIndex(d => d.real_serial === newDevice.real_serial);
          if (existingIndex === -1) {
            // 新设备
            newDevice.sort = Number(localStorage.getItem(`sort_${newDevice.real_serial}`) || '0');
            currentDevices.push(newDevice);
          } else {
            // 更新现有设备
            Object.assign(currentDevices[existingIndex], newDevice);
          }
        });
        console.log(currentDevices)
        // 创建新的排序后的数组
        const sortedDevices = [...currentDevices].sort((a, b) => {
          return a.sort - b.sort || a.group_id - b.group_id || a.serial.localeCompare(b.serial);
        });
        console.log(sortedDevices)
        // 使用Vue的响应式方法更新数组
        this.devices.splice(0, this.devices.length, ...sortedDevices);

        // 更新key
        this.devices.forEach((device, index) => {
          device.key = index + 1;
        });
      });
    },

    disableMenu() {
      // 开发环境不禁止右键菜单
      const isDev = import.meta.env.DEV;
      if (isDev) {
        console.log("current is dev environment")
        return;
      }
      // 禁用右键菜单
      document.addEventListener('contextmenu', event => event.preventDefault());
    },
    

  },
  async mounted() {
    // 禁止右键菜单
    this.disableMenu();
    
    // 监听代理启动事件
    this.listeners.push(await this.$listen('agent_started', async (e) => {
      await this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('agentStarted'),
        timeout: 2000
      });
      await this.get_settings()
      await this.get_groups()
      await this.getDevices();
      await this.connectAgent();
      await this.getRunningTasks();
      await this.$emiter('reload_tasks', {})
    }));
    this.listeners.push(await this.$listen('reload_devices', async (e) => {
      await this.getDevices();
    }));
    // 监听重新加载运行任务事件
    this.listeners.push(await this.$listen('reload_running_tasks', async (e) => {
      await this.getRunningTasks();
    }));

    // 监听侧边栏变化事件
    this.listeners.push(await this.$listen('sidebarChange', (e) => {
      this.showSidebar = e.payload;
    }));
   
    
    this.listeners.push(await this.$listen('selecedDevices', (e) => {
      this.selecedDevices = e.payload;
    }))
    this.listeners.push(await this.$listen('reload_group', async (e) => {
      await this.get_groups()
    }))
    //reload_settings
    this.listeners.push(await this.$listen('reload_settings', async (e) => {
      await this.get_settings()
    }))
  },
  unmounted() {
    this.listeners.forEach(listener => {
      if (listener) {
        listener()
      }
    })
    this.listeners = []
  }
}
</script>
