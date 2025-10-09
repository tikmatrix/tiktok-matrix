<template>
  <div class="w-full">
    <Pagination :items="filteredAccounts" :searchKeys="['email', 'username', 'device', 'device_index', 'tags']"
      :searchTermPlaceholder="$t('searchAccountPlaceholder')" :showRefBtn="false" @refresh="get_accounts" :pageSize="8">
      <template v-slot:buttons>
        <MyButton @click="add_account" label="add" icon="fa fa-add" />
        <MyButton @click="import_accounts" label="import" icon="fa fa-download" />
        <MyButton @click="export_accounts" label="export" icon="fa fa-upload" />
        <MyButton @click="openAnalytics" label="dataAnalytics" icon="fa fa-chart-line" class="ml-2" />

        <!-- 标签筛选下拉列表 -->
        <select class="select ml-2 w-32" v-model="selectedTag">
          <option selected value="">{{ $t('allTags') }}</option>
          <option v-for="tag in allUniqueTags" :key="tag" :value="tag">
            {{ tag }} ({{ tagCounts[tag] || 0 }})
          </option>
        </select>
        <!-- 批量操作 -->
        <select class="select ml-2 w-48" v-model="batchAction">
          <option selected value="">{{ $t('batchAction') }}</option>
          <option value="disable">{{ $t('disable') }}</option>
          <option value="enable">{{ $t('enable') }}</option>
          <option value="delete">{{ $t('delete') }}</option>
        </select>

        <!-- 清空标签按钮 -->
        <MyButton @click="clearAllTags" label="clearAllTags" icon="fa fa-trash" class="ml-2" />

      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-md">
            <thead>
              <tr>
                <th>{{ $t('number') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('packagename') }}</th>
                <th>{{ $t('device') }}</th>
                <th>{{ $t('loginStatus') }}</th>
                <th>{{ $t('status') }}</th>
                <th>{{ $t('tags') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(account, index) in slotProps.items">
                <td>{{ ((slotProps.currentPage - 1) * slotProps.pageSize) + index + 1 }}</td>
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/${account.username}`" target="_blank">
                    {{ account.username }}
                  </a>
                </td>
                <td>
                  <span v-if="account.packagename" class="badge badge-outline">
                    {{ account.packagename }}
                  </span>
                  <span v-else class="text-gray-400">{{ $t('default') }}</span>
                </td>
                <td>
                  <a class="cursor-pointer underline text-primary" v-if="account.device_index"
                    @click="show_device(account.device)">{{
                      account.device_index }}
                  </a>
                  <span v-else class="text text-error">{{ $t('offline') }}</span>
                </td>
                <td>
                  <span v-if="account.logined == 1" class="text text-success">{{ $t('logined') }}</span>
                  <span v-else class="text text-error">{{ $t('unlogined') }}</span>
                </td>
                <td>
                  <span v-if="account.status == 0" class="badge badge-success cursor-pointer"
                    @click="toggleStatus(account)">{{
                      $t('enabled') }}</span>
                  <span v-else class="badge badge-error cursor-pointer" @click="toggleStatus(account)">{{ $t('disabled')
                  }}</span>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <div v-for="tag in accountTags[account.id] || []" :key="tag"
                      class="badge badge-primary badge-outline gap-1">
                      {{ tag }}
                      <button @click="removeTag(account.id, tag)" class="btn btn-xs btn-circle btn-ghost">×</button>
                    </div>
                    <div class="dropdown dropdown-hover">
                      <label tabindex="0" class="btn btn-xs btn-circle btn-outline">+</label>
                      <div tabindex="0" class="dropdown-content z-[1] card card-compact shadow bg-base-100 p-2">
                        <div class="card-body p-2">
                          <!-- 已存在的标签列表 -->
                          <div class="mb-2" v-if="allUniqueTags.length > 0">
                            <div class="text-xs font-semibold mb-1">{{ $t('existingTags') }}</div>
                            <div class="flex flex-wrap gap-1">
                              <div v-for="tag in allUniqueTags" :key="tag"
                                class="badge badge-sm badge-outline cursor-pointer hover:bg-primary hover:text-primary-content"
                                @click="selectExistingTag(account.id, tag)">
                                {{ tag }}
                              </div>
                            </div>
                          </div>
                          <!-- 添加新标签 -->
                          <div>
                            <div class="text-xs font-semibold mb-1">{{ $t('newTag') }}</div>
                            <div class="join">
                              <input v-model="newTagInput[account.id]" class="input input-bordered input-sm join-item"
                                :placeholder="$t('enterNewTag')" @keyup.enter="addTag(account.id)" />
                              <button class="btn btn-sm btn-primary join-item" @click="addTag(account.id)">
                                {{ $t('add') }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="space-x-4">
                    <button class="btn btn-md btn-primary" @click="editAccount(account)">{{ $t('edit') }}</button>
                    <button class="btn btn-md btn-error" @click="deleteAccount(account)">
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
import { writeBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
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
      accountTags: {},
      newTagInput: {},
      selectedTag: '',
      batchAction: ''
    }
  },
  watch: {
    batchAction(newVal) {
      if (newVal) {
        switch (newVal) {
          case 'disable':
            this.batchDisable()
            break
          case 'enable':
            this.batchEnable()
            break
          case 'delete':
            this.batchDelete()
            break
          default:
            break
        }
      }
    }
  },
  computed: {
    // 获取所有已存在的标签（去重）
    allUniqueTags() {
      const tagsSet = new Set();

      // 收集所有账户的标签
      Object.values(this.accountTags).forEach(tags => {
        tags.forEach(tag => tagsSet.add(tag));
      });

      return Array.from(tagsSet).sort();
    },

    // 计算每个标签出现的账户数量
    tagCounts() {
      const counts = {};

      // 初始化所有标签的计数为0
      this.allUniqueTags.forEach(tag => {
        counts[tag] = 0;
      });

      // 计算每个标签的出现次数
      Object.entries(this.accountTags).forEach(([accountId, tags]) => {
        tags.forEach(tag => {
          if (counts[tag] !== undefined) {
            counts[tag]++;
          } else {
            counts[tag] = 1;
          }
        });
      });

      return counts;
    },

    // 根据已选标签筛选账户
    filteredAccounts() {
      if (!this.selectedTag) {
        return this.accounts;
      }

      return this.accounts.filter(account => {
        const accountTags = this.accountTags[account.id] || [];
        return accountTags.includes(this.selectedTag);
      });
    }
  },
  methods: {
    openAnalytics() {
      this.$emiter('showDialog', { name: 'accountAnalytics' });
    },
    batchDisable() {
      const promises = this.filteredAccounts.map(account => {
        return this.$service.update_account({
          ...account,
          status: 1
        }).then(async () => {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${this.$t('disabled')} ${account.username}`,
            timeout: 1000
          })
        })
      })

      Promise.all(promises).then(() => {
        this.batchAction = ''
        this.get_accounts()
      })
    },
    batchEnable() {
      const promises = this.filteredAccounts.map(account => {
        return this.$service.update_account({
          ...account,
          status: 0
        }).then(async () => {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${this.$t('enabled')} ${account.username}`,
            timeout: 1000
          })
        })
      })

      Promise.all(promises).then(() => {
        this.batchAction = ''
        this.get_accounts()
      })
    },
    batchDelete() {
      const promises = this.filteredAccounts.map(account => {
        return this.$service.delete_account({
          id: account.id
        }).then(async () => {
          await this.$emiter('NOTIFY', {
            type: 'success',
            message: `${this.$t('deleted')} ${account.username}`,
            timeout: 1000
          })
        })
      })

      Promise.all(promises).then(() => {
        this.batchAction = ''
        this.get_accounts()
      })
    },
    // 根据标签筛选账户
    filterByTag(tag) {
      this.selectedTag = tag;
    },

    // 清除标签筛选
    clearTagFilter() {
      this.selectedTag = '';
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
        const excelData = this.accounts.map(account => {
          return {
            id: account.id,
            email: account.email,
            pwd: account.pwd,
            username: account.username,
            packagename: account.packagename || '',
            device: account.device,
            device_index: account.device_index || 'offline',
            logined: account.logined,
            status: account.status
          }
        });

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

    // 加载标签数据
    loadAccountTags() {
      try {
        const savedTags = localStorage.getItem('accountTags')
        if (savedTags) {
          this.accountTags = JSON.parse(savedTags)
        }
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    },

    // 保存标签数据
    saveAccountTags() {
      try {
        localStorage.setItem('accountTags', JSON.stringify(this.accountTags))
      } catch (error) {
        console.error('Error saving tags:', error)
      }
    },

    // 添加新标签
    addTag(accountId) {
      if (!this.newTagInput[accountId] || this.newTagInput[accountId].trim() === '') return

      if (!this.accountTags[accountId]) {
        this.accountTags[accountId] = []
      }

      const tag = this.newTagInput[accountId].trim()
      if (!this.accountTags[accountId].includes(tag)) {
        this.accountTags[accountId].push(tag)
        this.saveAccountTags()
      }

      this.newTagInput[accountId] = ''
    },

    // 选择已有标签
    selectExistingTag(accountId, tag) {
      if (!this.accountTags[accountId]) {
        this.accountTags[accountId] = []
      }

      if (!this.accountTags[accountId].includes(tag)) {
        this.accountTags[accountId].push(tag)
        this.saveAccountTags()
      }
    },

    // 移除标签
    removeTag(accountId, tag) {
      if (this.accountTags[accountId]) {
        const index = this.accountTags[accountId].indexOf(tag)
        if (index > -1) {
          this.accountTags[accountId].splice(index, 1)
          this.saveAccountTags()
        }
      }
    },

    async get_accounts() {
      this.currentAccount = null
      this.$service
        .get_accounts()
        .then(res => {
          this.accounts = res.data
          this.accounts.forEach(account => {
            account.device_index = this.devices.find(device => device.serial === account.device || device.real_serial === account.device)?.key
            // 添加tags字段用于搜索
            account.tags = (this.accountTags[account.id] || []).join(' ')
          })
          //sort by device_index asc
          this.accounts.sort((a, b) => a.device_index - b.device_index)
        })
    },
    async add_account() {
      this.currentAccount = {
        email: '',
        pwd: '',
        username: '',
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
    async toggleStatus(account) {
      const updatedAccount = {
        ...account,
        status: account.status === 0 ? 1 : 0
      };
      await this.$service.update_account(updatedAccount);
      this.get_accounts();
    },
    // 清空所有标签
    clearAllTags() {
      this.accountTags = {}
      this.saveAccountTags()
      this.$emiter('NOTIFY', {
        type: 'success',
        message: this.$t('allTagsCleared'),
        timeout: 2000
      })
      this.get_accounts()
    }
  },
  async mounted() {
    this.loadAccountTags()
    this.get_accounts()
  }
}
</script>
