<template>
  <div class="w-full">
    <Pagination :items="accounts" :searchKeys="['email', 'username', 'device', 'device_index']" @refresh="get_accounts">
      <template v-slot:buttons>
        <MyButton @click="add_account" label="add" icon="fa fa-add" />
        <MyButton @click="$refs.batch_add_dialog.showModal()" label="batchAdd" icon="fa fa-add" />
        <MyButton @click="export_accounts" label="export" icon="fa fa-upload" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('email') }}</th>
                <th>{{ $t('username') }}</th>
                <!-- <th>{{ $t('fans') }}</th> -->
                <th>{{ $t('device') }}</th>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(account, _index) in slotProps.items">
                <td>{{ account.id }}</td>
                <td>{{ account.email }}</td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${account.username}`" target="_blank">{{
                    account.username }}</a>
                </td>
                <!-- <td>{{ account.fans }}</td> -->

                <td>
                  <a class="cursor-pointer underline text-blue-500" v-if="account.device_index"
                    @click="show_device(account.device_index, account.device)">{{ account.device_index }}
                  </a>
                  <span v-else class="text text-red-500">{{ $t('offline') }}</span>
                </td>
                <td>
                  <span v-if="account.logined == 1" class="text text-green-500">{{ $t('logined') }}</span>
                  <span v-else class="text text-red-500">{{ $t('unlogined') }}</span>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="editAccount(account)">{{ $t('edit') }}</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      @click="deleteAccount(account)">
                      {{ $t('delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>
    <dialog ref="edit_dialog" class="modal">
      <div class="modal-box">
        <Edit :account="currentAccount" @update="updateAccount" v-if="currentAccount" />
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
    <dialog ref="add_dialog" class="modal">
      <div class="modal-box">
        <Add @add="addAccount" />
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
    <dialog ref="batch_add_dialog" class="modal">
      <div class="modal-box">
        <div class="flex flex-col items-center gap-2 mb-2 w-full">
          <textarea class="textarea textarea-success w-full h-32" :placeholder="$t('batchAddTips')" autocomplete="off"
            v-model="batchAccounts">

      </textarea>
          <div class="mt-4 w-full flex justify-end align-middle text-center items-center">
            <MyButton class="btn-primary" @click="batchAdd" label="save" />
          </div>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>
<script>
import MyButton from '../Button.vue'
import Edit from './Edit.vue'
import Add from './Add.vue'
import Pagination from '../Pagination.vue'
import { inject } from 'vue'
import { ask } from '@tauri-apps/api/dialog';
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { invoke } from "@tauri-apps/api/tauri";
export default {
  name: 'app',
  components: {
    MyButton,
    Edit,
    Add,
    Pagination,
  },
  setup() {
    const devices = inject('devices')
    return { devices: devices.list }
  },
  data() {
    return {
      accounts: [],
      currentAccount: {},
      batchAccounts: '',
    }
  },
  methods: {
    async export_accounts() {
      const yes = await ask(this.$t('exportConfirm'), this.$t('confirm'))
      if (!yes) {
        return
      }
      let content = this.accounts.map(account => {
        account.device_index = this.devices.find(device => device.serial === account.device)?.index
        return `${account.email}##${account.pwd}##${account.username}##${account.device_index}`
      }).join('\n')
      await writeTextFile('download/accounts.txt', content, { dir: BaseDirectory.AppData });
      invoke("open_dir", {
        name: "download"
      });
    },
    async batchAdd() {
      if (this.batchAccounts.length === 0) {
        return
      }
      //check format
      let accounts = this.batchAccounts.split('\n').map(line => {
        line = line.trim()
        if (line.length === 0) {
          return
        }
        if (!line.includes('##')) {
          return
        }
        //must contains 3 ##
        if (line.split('##').length !== 4) {
          return
        }

        let [email, pwd, username, device] = line.split('##').map(v => v.trim())
        let serial = this.devices.find(d => d.index === parseInt(device))?.serial
        if (!serial) {
          return
        }
        return {
          email,
          pwd,
          fans: 0,
          serial,
          username
        }
      })

      accounts = accounts.filter(account => account)
      if (accounts.length === 0) {
        alert('No valid accounts found')
        return
      }
      const yes = await ask(`${this.$t('batchAddConfirm', { count: accounts.length })}`, this.$t('confirm'))
      if (!yes) {
        return
      }
      for (let account of accounts) {
        await this.$service
          .add_account({
            email: account.email,
            pwd: account.pwd,
            fans: account.fans,
            device: account.serial,
            username: account.username,
            logined: 0
          })
      }
      this.$refs.batch_add_dialog.close()

      this.get_accounts()
    },
    show_device(serial) {
      let mydevice = this.devices.find(d => d.serial === serial)
      this.$emitter.emit('openDevice', mydevice)
    },

    get_accounts() {
      this.currentAccount = null
      this.$service
        .get_accounts()
        .then(res => {
          this.accounts = res.data
          this.accounts.forEach(account => {
            account.device_index = this.devices.find(device => device.serial === account.device)?.index
          })
        })
        .catch(err => {
          console.log(err)
        })
    },
    add_account() {
      this.$refs.add_dialog.showModal()
    },
    addAccount(account) {
      this.$service
        .add_account({
          email: account.email,
          pwd: account.pwd,
          fans: account.fans,
          device: account.device,
          username: account.username,
          logined: account.logined
        })
        .then(() => {
          this.showAddAccount = false
          this.get_accounts()
          this.$refs.add_dialog.close()
        })
        .catch(err => {
          console.log(err)
        })
    },
    editAccount(account) {
      this.currentAccount = account
      console.log(this.currentAccount)
      this.$refs.edit_dialog.showModal()
      this.$refs.edit_dialog.addEventListener('close', () => {
        this.currentAccount = null
      })
    },
    updateAccount(account) {
      this.$service
        .update_account({
          id: account.id,
          email: account.email,
          pwd: account.pwd,
          fans: account.fans,
          device: account.device,
          username: account.username,
          logined: account.logined
        })
        .then(() => {
          this.get_accounts()
          this.$refs.edit_dialog.close()
        })
        .catch(err => {
          console.log(err)
        })
    },
    deleteAccount(account) {
      this.$service
        .delete_account({
          id: account.id
        })
        .then(() => {
          this.get_accounts()
        })
        .catch(err => {
          console.log(err)
        })
    },

  },
  mounted() {
    this.get_accounts()
  }
}
</script>
