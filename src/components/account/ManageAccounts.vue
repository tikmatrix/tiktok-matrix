<template>
  <div class="w-full">
    <Pagination :items="accounts" :searchKeys="['email', 'username', 'device', 'device_index']" @refresh="get_accounts">
      <template v-slot:buttons>
        <MyButton @click="add_account" label="add" icon="fa fa-add" />
        <MyButton @click="import_accounts" label="import" icon="fa fa-download" />
        <MyButton @click="export_accounts" label="export" icon="fa fa-upload" />
        <MyButton @click="delete_all" label="clearAll" icon="fa fa-trash" />
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
                <th>{{ $t('loginStatus') }}</th>
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
                  <span v-if="account.status == 0" class="text text-success">{{ $t('enable') }}</span>
                  <span v-else class="text text-error">{{ $t('disable') }}</span>
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

    <!-- import progress dialog -->
    <dialog ref="import_dialog" class="modal">
      <div class="modal-box">
        <form method="dialog">
        </form>
        <h3 class="font-bold text-lg">Importing...</h3>
        <div class="py-4">
          <progress class="progress progress-success w-full"></progress>
        </div>
      </div>
    </dialog>
  </div>
</template>
<script>
import MyButton from '../Button.vue'
import Edit from './Edit.vue'
import Pagination from '../Pagination.vue'
import { ask } from '@tauri-apps/api/dialog';
import { writeBinaryFile, BaseDirectory, createDir, exists } from '@tauri-apps/api/fs';
import { invoke } from "@tauri-apps/api/tauri";
import * as XLSX from 'xlsx'
import { open } from '@tauri-apps/api/dialog'
import { readBinaryFile } from '@tauri-apps/api/fs';

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
    async delete_all() {
      const yes = await ask(this.$t('deleteAllConfirm'), this.$t('confirm'));
      if (yes) {
        await this.$service.delete_all_accounts()
        this.get_accounts()
      }
    },
    async import_accounts() {
      const filePath = await open({
        multiple: false, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: [{ name: 'Excel', extensions: ['xlsx'] }]
      });
      if (filePath) {
        console.log(`importing ${filePath}`);
        this.$refs.import_dialog.showModal()
        try {
          // 读取文件内容
          const fileContent = await readBinaryFile(filePath);
          // 解析 Excel 文件为工作簿
          const workbook = XLSX.read(fileContent, { type: 'array' });
          // 获取第一个工作表的名称
          const sheetName = workbook.SheetNames[0];
          // 获取工作表
          const sheet = workbook.Sheets[sheetName];
          // 转换为 JSON，默认以第一行作为键
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          // 输出结果
          console.log(JSON.stringify(jsonData));
          for (let account of jsonData) {
            account.fans = 0
            if (account.id) {
              await this.$service.update_account(account)
            } else {
              await this.$service.add_account(account)
            }
          }
        } catch (error) {
          console.error(`Error importing file: ${error}`);
          await message(error, { title: 'Import Error', type: 'error' });
        } finally {
          this.$refs.import_dialog.close()
          this.get_accounts()
        }
      }
    },

    async export_accounts() {
      try {
        // 准备 Excel 数据
        const excelData = this.accounts.map(account => ({
          id: account.id,
          email: account.email,
          pwd: account.pwd,
          username: account.username,
          device: account.device,
          device_index: account.device_index || 'offline',
          logined: account.logined,
          status: account.status
        }));

        // 创建工作簿和工作表
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, "accounts");

        // 生成 Excel 文件 - 使用 ArrayBuffer
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        // 转换为 Uint8Array
        const buf = new Uint8Array(wbout);

        // 指定文件路径
        const filePath = 'download/accounts.xlsx';

        // 使用 writeBinaryFile 写入二进制数据
        await writeBinaryFile(
          filePath,
          buf,
          { dir: BaseDirectory.AppData }
        );


        // 打开下载目录
        await invoke("open_dir", {
          name: "download"
        });
      } catch (error) {
        await message(error, { title: 'Export Error', type: 'error' });
      }
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
        status: 0,
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
