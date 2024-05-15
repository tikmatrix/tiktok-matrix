<template>
  <div class="w-full">
    <Pagination :items="accounts" :searchKeys="['email', 'username', 'device', 'device_index']" @refresh="get_accounts">
      <template v-slot:buttons>
        <MyButton @click="add_account" label="add" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('email') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('fans') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(account, index) in slotProps.items" :key="index">
                <td>{{ account.id }}</td>
                <td>{{ account.email }}</td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${account.username}`" target="_blank">{{
                    account.username }}</a>
                </td>
                <td>{{ account.fans }}</td>

                <td>
                  <a class="cursor-pointer underline text-blue-500"
                    @click="show_device(account.device_index, account.device)">{{ account.device_index }} - {{
                      account.device }}</a>
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
        <Edit :account="currentAccount" @update="updateAccount" v-if="currentAccount"/>
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
  </div>
</template>
<script>
import MyButton from '../Button.vue'
import Edit from './Edit.vue'
import Add from './Add.vue'
import Pagination from '../Pagination.vue'
import { inject } from 'vue'
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
    }
  },
  methods: {
    show_device(index, serial) {
      let mydevice = this.devices.find(d => d.serial === serial)
      mydevice.index = index - 1
      this.$emitter.emit('openDevice', mydevice)
    },

    get_accounts() {
      this.currentAccount = null
      this.$service
        .get_accounts()
        .then(res => {
          this.accounts = res.data
          this.accounts.forEach(account => {
            let device_index = this.devices.findIndex(device => device.serial === account.device)
            account.device_index = device_index + 1
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
          username: account.username
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
    },
    updateAccount(account) {
      this.$service
        .update_account({
          id: account.id,
          email: account.email,
          pwd: account.pwd,
          fans: account.fans,
          device: account.device,
          username: account.username
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
