<template>
  <div class="w-full">
    <Pagination :items="accounts" :searchKeys="['email', 'username', 'device', 'device_index', 'platform']"
      @refresh="get_accounts">
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
                <th>{{ $t('platform') }}</th>
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
                <td>{{ account.platform }}</td>
                <td>{{ account.email }}</td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${account.username}`" target="_blank"
                    v-if="account.platform === 'tiktok'">{{
                      account.username }}</a>
                  <a class="link link-primary" :href="`https://www.instagram.com/${account.username}`" target="_blank"
                    v-if="account.platform === 'instagram'">{{ account.username }}</a>
                </td>
                <!-- <td>{{ account.fans }}</td> -->

                <td>
                  <a class="cursor-pointer underline text-primary" v-if="account.device_index"
                    @click="show_device(account.device)">{{ account.device_index }}
                  </a>
                  <span v-else class="text text-error">{{ $t('offline') }}</span>
                </td>
                <td>
                  <span v-if="account.logined == 1" class="text text-success">{{ $t('logined') }}</span>
                  <span v-else class="text text-error">{{ $t('unlogined') }}</span>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="btn btn-sm btn-primary" @click="editAccount(account)">{{ $t('edit') }}</button>
                    <button class="btn btn-sm btn-error" @click="deleteAccount(account)">
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
        <Edit :account="currentAccount" :devices="devices" @update="updateAccount" @add="addAccount"
          v-if="currentAccount" />
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
import Pagination from '../Pagination.vue'
import { ask } from '@tauri-apps/api/dialog';
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { invoke } from "@tauri-apps/api/tauri";
export default {
  name: 'app',
  components: {
    MyButton,
    Edit,
    Pagination,
  },
  props: {
    devices: {
      type: Array,
      required: true
    }
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
        account.device_index = this.devices.find(device => device.serial === account.device || device.real_serial === account.device)?.key
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
        if (line.split('##').length !== 5) {
          return
        }

        let [platform, email, pwd, username, device] = line.split('##').map(v => v.trim())
        let serial = this.devices.find(d => d.key === parseInt(device))?.real_serial
        if (!serial) {
          return
        }
        return {
          email,
          pwd,
          fans: 0,
          serial,
          username,
          platform
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
            logined: 0,
            platform: account.platform
          })
      }
      this.$refs.batch_add_dialog.close()

      this.get_accounts()
    },
    async show_device(serial) {
      let mydevice = this.devices.find(d => d.serial === serial || d.real_serial === serial)
      await this.$emiter('openDevice', mydevice)
    },

    async get_accounts() {
      this.currentAccount = null
      this.$service
        .get_accounts()
        .then(res => {
          this.accounts = res.data
          this.accounts.forEach(account => {
            account.device_index = this.devices.find(device => device.serial === account.device || device.real_serial === account.device)?.key
          })
        })
    },
    async add_account() {
      this.currentAccount = {
        email: '',
        pwd: '',
        username: '',
        fans: 0,
        device: '',
        logined: 0,
        platform: 'tiktok',
      }
      this.$refs.edit_dialog.showModal()
    },
    async addAccount(account) {
      this.$service
        .add_account(account)
        .then(() => {
          this.get_accounts()
          this.$refs.edit_dialog.close()
        })
    },
    async editAccount(account) {
      this.currentAccount = account
      console.log(this.currentAccount)
      this.$refs.edit_dialog.showModal()
      this.$refs.edit_dialog.addEventListener('close', () => {
        this.currentAccount = null
      })
    },
    async updateAccount(account) {
      this.$service
        .update_account(account)
        .then(() => {
          this.get_accounts()
          this.$refs.edit_dialog.close()
        })
    },
    async deleteAccount(account) {
      this.$service
        .delete_account({
          id: account.id
        })
        .then(() => {
          this.get_accounts()
        })
    },

  },
  async mounted() {
    this.get_accounts()
  }
}
</script>
