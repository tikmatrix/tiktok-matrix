<template>
  <div class="w-full">


    <Pagination :items="filteredMaterials" @refresh="get_materials">
      <template v-slot:buttons>
        <!-- <div class="badge badge-success">{{ $t('unused') }}</div>
        <div class="badge badge-error">{{ $t('used') }}</div> -->
        <MyButton @click="selectMaterials" label="add" icon="fa fa-add" />
        <MyButton @click="delete_all" label="clearAll" icon="fa fa-trash" />
        <div class="flex items-center ml-2">
          <select class="select select-bordered w-48" v-model="selectedTagId" @change="filterByTagId">
            <option value="">{{ $t('allTags') }}</option>
            <option v-for="tag in tags" :key="tag.id" :value="tag.id">
              {{ tag.name }} ({{ getTagCount(tag.id) }})
            </option>
          </select>
          <div v-if="selectedTag" class="badge badge-primary py-3 px-4">
            {{ selectedTag.name }}
            <button class="btn btn-md btn-ghost ml-1" @click="clearTagFilter"><i class="fa fa-times"></i></button>
          </div>
        </div>
        <button class="btn ml-2 btn-primary" @click="showTagManager">{{ $t('manageTags') }}</button>
        <!-- 显示已使用和未使用的数量 -->
        <div class="badge badge-success ml-2">
          {{ $t('unused') }}: {{materials.filter(m => m.used == '0').length}}
        </div>
        <div class="badge badge-error ml-2">
          {{ $t('used') }}: {{materials.filter(m => m.used == '1').length}}
        </div>
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-md">
            <thead>
              <tr>
                <th>{{ $t('number') }}</th>
                <th>{{ $t('preview') }}</th>
                <th>{{ $t('contentType') }}</th>
                <th>{{ $t('tags') }}</th>
                <th>{{ $t('sort') }}</th>
                <th>{{ $t('caption') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('group') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(material, index) in slotProps.items" :key="index">
                <td>{{ ((slotProps.currentPage - 1) * slotProps.pageSize) + index + 1 }}</td>
                <td @click="show_material(material)">
                  <div class="indicator">
                    <div class="indicator-item badge badge-success" v-if="material.used == '0'">{{ $t('unused') }}</div>
                    <div class="indicator-item badge badge-error" v-else @click="show_material(material)">{{ $t('used')
                    }}</div>
                    <div class="cursor-pointer border rounded items-center text-center flex align-middle">
                      <template v-if="material.name.endsWith('.mp4') || material.name.endsWith('.webm')">
                        <video :src="material.preview" class="w-12 h-18 max-w-none flex-1"></video>
                      </template>
                      <template v-else>
                        <img :src="material.preview" class="w-12 h-18 max-w-none flex-1" />
                      </template>
                    </div>
                  </div>

                </td>
                <td>
                  <span v-if="material.content_type == 0">{{ $t('video') }}</span>
                  <span v-else-if="material.content_type == 1">{{ $t('image') }}</span>
                  <span v-else>{{ $t('unknown') }}</span>
                </td>
                <td>
                  <div class="flex flex-wrap gap-1 max-w-md">
                    <div v-for="tag in material.tags" :key="tag.id" class="badge badge-primary badge-outline gap-1">
                      {{ tag.name }}
                      <button @click="removeTagFromMaterialDirect(material.id, tag.id)"
                        class="btn btn-md btn-circle btn-ghost">×</button>
                    </div>
                    <div class="dropdown dropdown-hover">
                      <label tabindex="0" class="btn btn-md btn-circle btn-outline">+</label>
                      <div tabindex="0" class="dropdown-content z-[1] card card-compact shadow bg-base-100 p-2">
                        <div class="card-body p-2 ring-info ring-1 rounded-md shadow-md">
                          <!-- 已存在的标签列表 -->
                          <div v-if="tags.length > 0">
                            <div class="flex flex-wrap gap-1">
                              <div v-for="tag in availableTagsForMaterial(material)" :key="tag.id"
                                class="badge badge-md badge-outline cursor-pointer hover:bg-primary hover:text-primary-content ring-primary ring-1"
                                @click="addTagToMaterialDirect(material.id, tag.id)">
                                {{ tag.name }}
                              </div>
                            </div>
                          </div>
                          <!-- 请先添加标签 -->
                          <div v-else>
                            <div class="text-md text-warning mb-1">{{ $t('noTags') }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <input type="number" v-model="material.no" @change="update_material(material)"
                    class="input input-bordered w-16" />
                </td>
                <td>
                  <span @click="showEditTitle(material)" class="text-md cursor-pointer" v-if="material.title">{{
                    material.title.substring(0, 10) + (material.title.length >
                      10 ? '...' : '')
                    + (material.title.length > 20 ? '...' : '') }}</span>
                  <span @click="showEditTitle(material)" class="text-md text-warning cursor-pointer" v-else>{{
                    $t('unset') }}</span>
                </td>
                <td>
                  <span @click="showEditUsername(material)" class="text-md cursor-pointer" v-if="material.username">{{
                    material.username }}</span>
                  <span class="text-md text-warning cursor-pointer" @click="showEditUsername(material)" v-else>{{
                    $t('unset') }}</span>
                </td>
                <td>
                  <span class="text-md cursor-pointer" v-if="material.group_id">{{ get_group_name(material.group_id)
                  }}</span>
                  <span class="text-md text-warning cursor-pointer" v-else>{{ $t('unset') }}</span>
                </td>
                <td>
                  <button class="bg-error hover:bg-red-700 text-primary-content btn btn-md"
                    @click="delete_material(material)">
                    {{ $t('delete') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>

    <dialog ref="detail_modal" class="modal" @close="stopVideo">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-md btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <div class="m-4 flex max-h-60">
          <template v-if="currentMaterial.name.endsWith('.mp4') || currentMaterial.name.endsWith('.webm')">
            <video ref="video" :src="currentMaterial.preview" class="rounded-lg" controls></video>
          </template>
          <template v-else>
            <img :src="currentMaterial.preview" class="rounded-lg" />
          </template>
        </div>
      </div>
    </dialog>

  </div>
  <!-- upload progress dialog -->
  <dialog ref="upload_dialog" class="modal">
    <div class="modal-box">
      <form method="dialog">
      </form>
      <h3 class="font-bold text-lg">Uploading...</h3>
      <div class="py-4">
        <progress class="progress progress-success w-full"></progress>
      </div>
    </div>
  </dialog>

  <dialog ref="edit_title_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('caption') }}</h3>
      <label class="input input-bordered flex items-center gap-2 my-4">
        <input type="text" class="grow" placeholder="" v-model="currentMaterial.title"
          @keyup.enter="update_material(currentMaterial)" />
      </label>
      <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
        <div class="flex flex-1"></div>
        <button class="btn btn-primary" @click="update_material(currentMaterial)">{{ $t('save') }}</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <dialog ref="edit_username_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('username') }}</h3>

      <label class="input">
        @
        <input type="text" class="grow" placeholder="" v-model="currentMaterial.username"
          @keyup.enter="update_material(currentMaterial)" />

      </label>
      <ul class="menu bg-base-200 rounded-box w-56" v-if="usernameLikes(currentMaterial.username)">
        <li v-for="account in usernameLikes(currentMaterial.username)" :key="account.id">
          <a @click="currentMaterial.username = account.username.replace('@', '')">{{ account.username }}</a>
        </li>
      </ul>
      <div class="flex items-center flex-row gap-2 max-w-full w-full mt-2">
        <div class="flex flex-1"></div>
        <button class="btn btn-primary" @click="update_material(currentMaterial)">{{ $t('save') }}</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <!-- 标签管理对话框 -->
  <dialog ref="tag_manager_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t('manageTags') }}</h3>
      <div class="py-4">
        <div class="flex items-center gap-2 mb-4">
          <input type="text" class="input input-bordered flex-1" v-model="newTagName" :placeholder="$t('newTagName')"
            @keyup.enter="addTag" />
          <button class="btn btn-primary" @click="addTag">{{ $t('add') }}</button>
        </div>
        <div class="overflow-x-auto">
          <table class="table table-md">
            <thead>
              <tr>
                <th>ID</th>
                <th>{{ $t('name') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tag in tags" :key="tag.id">
                <td>{{ tag.id }}</td>
                <td>
                  <input type="text" class="input input-bordered input-md" v-model="tag.name" />
                </td>
                <td class="flex gap-2">
                  <button class="btn btn-primary btn-md" @click="updateTag(tag)">{{ $t('save') }}</button>
                  <button class="btn btn-error btn-md" @click="deleteTag(tag)">{{ $t('delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <!-- 清空所有素材确认对话框 -->
  <dialog ref="clear_all_confirm_dialog" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg text-warning">
        <i class="fa fa-exclamation-triangle mr-2"></i>{{ $t('warning') }}
      </h3>
      <div class="py-4">
        <p class="text-lg mb-2">{{ $t('clearAllMaterialsConfirm') }}</p>
        <p class="text-md text-base-content/70">{{ $t('operationCannotBeUndone') }}</p>
      </div>
      <div class="modal-action">
        <form method="dialog">
          <button class="btn btn-ghost mr-2">{{ $t('cancel') }}</button>
        </form>
        <button class="btn btn-error" @click="confirmClearAll">
          <i class="fa fa-trash mr-1"></i>{{ $t('confirm') }}
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>


</template>
<script>
import MyButton from '../Button.vue'
import Pagination from '../Pagination.vue'
import { open } from '@tauri-apps/api/dialog';
import { appDataDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import * as groupWsService from '@/service/groupWebSocketService';
import * as materialWsService from '@/service/materialWebSocketService';
import * as accountWsService from '@/service/accountWebSocketService';

export default {
  name: 'app',
  components: {
    MyButton,
    Pagination
  },
  props: {
    group: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      materials: [],
      currentMaterial: {
        name: '',
        title: '',
        username: '',
        tags: []
      },
      upload_progress: 10,
      max_upload_progress: 100,
      // 新增数据
      tags: [],
      newTagName: '',
      selectedTag: null,
      currentMaterialId: null,
      currentMaterialTags: [],
      newTagInputs: {},
      selectedTagId: '',
      accounts: [],
      groups: [],
    }
  },
  computed: {

    filteredMaterials() {
      if (!this.selectedTag) {
        return this.materials;
      }
      return this.materials.filter(material =>
        material.tags && material.tags.some(tag => tag.id === this.selectedTag.id)
      );
    },
    availableTags() {
      if (!this.currentMaterialTags) return this.tags;
      // 返回尚未添加到当前素材的标签
      return this.tags.filter(tag =>
        !this.currentMaterialTags.some(currentTag => currentTag.id === tag.id)
      );
    }
  },
  methods: {
    usernameLikes(keyword) {
      return this.accounts.filter(account => account.username.includes(keyword)).slice(0, 10)
    },
    // 停止视频播放
    stopVideo() {
      if (this.$refs.video && this.currentMaterial.name.endsWith('.mp4') || this.currentMaterial.name.endsWith('.webm')) {
        this.$refs.video.pause();
        this.$refs.video.currentTime = 0;
      }
    },
    // 获取所有标签
    async getTags() {
      try {
        const res = await this.$service.get_tags();
        this.tags = res.data || [];
      } catch (err) {
        console.error('获取标签失败', err);
      }
    },

    // 添加新标签
    async addTag() {
      if (!this.newTagName.trim()) return;

      try {
        await this.$service.add_tag({
          id: 0,
          create_time: new Date().toISOString(),
          name: this.newTagName.trim()
        });
        this.newTagName = '';
        await this.getTags();
      } catch (err) {
        console.error('添加标签失败', err);
      }
    },

    // 更新标签
    async updateTag(tag) {
      try {
        await this.$service.update_tag({
          id: tag.id,
          name: tag.name
        });
        await this.getTags();
      } catch (err) {
        console.error('更新标签失败', err);
      }
    },

    // 删除标签
    async deleteTag(tag) {

      try {
        await this.$service.delete_tag({
          id: tag.id
        });
        await this.getTags();

        // 如果删除的是当前选中的标签，清除筛选
        if (this.selectedTag && this.selectedTag.id === tag.id) {
          this.clearTagFilter();
        }
      } catch (err) {
        console.error('删除标签失败', err);
      }
    },

    // 显示标签管理对话框
    showTagManager() {
      this.$refs.tag_manager_dialog.showModal();
    },

    // 关闭标签管理对话框
    closeTagManager() {
      this.$refs.tag_manager_dialog.close();
    },

    // 清除标签筛选
    clearTagFilter() {
      this.selectedTag = null;
      this.selectedTagId = '';
    },

    // 根据标签筛选素材
    filterByTag(tag) {
      this.selectedTag = tag;
      this.selectedTagId = tag.id;
    },




    // 给素材添加标签
    async addTagToMaterial(tagId) {
      try {
        await this.$service.add_tag_to_material({
          material_id: this.currentMaterialId,
          tag_id: tagId
        });

        // 刷新当前素材的标签列表
        const res = await this.$service.get_material_tags({
          material_id: this.currentMaterialId
        });
        this.currentMaterialTags = res.data || [];
      } catch (err) {
        console.error('添加标签到素材失败', err);
      }
    },

    // 从素材中移除标签
    async removeTagFromMaterial(tagId) {
      try {
        await this.$service.remove_tag_from_material({
          material_id: this.currentMaterialId,
          tag_id: tagId
        });

        // 刷新当前素材的标签列表
        const res = await this.$service.get_material_tags({
          material_id: this.currentMaterialId
        });
        this.currentMaterialTags = res.data || [];
      } catch (err) {
        console.error('从素材中移除标签失败', err);
      }
    },

    showEditTitle(material) {
      this.currentMaterial = material
      this.$refs.edit_title_dialog.showModal()
    },

    showEditUsername(material) {
      this.currentMaterial = material
      this.$refs.edit_username_dialog.showModal()
    },

    async selectMaterials() {
      const content_type = this.group.content_type;
      let filters = [];
      if (content_type == 0) {
        filters = [ // 视频
          { name: 'Video Files', extensions: ['mp4'] },
        ]
      } else if (content_type == 1) {
        filters = [ // 图片
          { name: 'Image Files', extensions: ['jpg', 'png'] },
        ]
      }
      const filePath = await open({
        multiple: true, // 是否允许多选文件
        directory: false, // 是否选择目录
        filters: filters
      });
      if (filePath.length > 0) {
        this.$refs.upload_dialog.showModal()
        this.$service
          .upload_videos({
            files: filePath,
            group_id: this.group.id
          })
          .then(() => {
            this.get_materials()
            this.$refs.upload_dialog.close()
          })

      }
    },
    delete_all() {
      // 显示确认对话框
      this.$refs.clear_all_confirm_dialog.showModal()
    },
    confirmClearAll() {
      // 关闭确认对话框
      this.$refs.clear_all_confirm_dialog.close()
      // 执行清空操作
      materialWsService
        .ws_delete_all_materials({
          group_id: this.group.id
        })
        .then(() => {
          this.$emiter('NOTIFY', {
            type: 'success',
            message: `${this.$t('deleted')}`,
            timeout: 2000
          });
          this.get_materials()
        })
    },
    async get_materials() {
      try {
        // 获取所有素材列表
        const all_materials = await materialWsService.ws_get_materials({
          group_id: this.group.id
        });
        // 获取带标签的素材列表
        const tags_materials = await this.$service.list_all_materials_with_tags();
        this.materials = all_materials.data
        this.materials = this.materials.map(item => {
          const tag = tags_materials.data.find(tag => tag.material.id === item.id);
          if (tag) {
            item.tags = tag.tags;
          } else {
            item.tags = [];
          }
          return item;
        });

        // 处理素材路径
        let work_path = await appDataDir();

        for (let i = 0; i < this.materials.length; i++) {
          const filePath = await join(work_path, "upload", this.materials[i].name);
          const assetUrl = convertFileSrc(filePath);
          this.materials[i].preview = assetUrl;
        }
      } catch (err) {
        console.error('获取素材列表失败', err);
      }
    },
    show_material(material) {
      this.currentMaterial = material
      this.$refs.detail_modal.showModal()
    },
    delete_material(material) {
      materialWsService
        .ws_delete_material({
          id: material.id
        })
        .then(() => {
          this.get_materials()
        })
        .catch(err => {
          console.log(err)
        })
    },
    update_material(material) {
      materialWsService
        .ws_update_material({
          id: material.id,
          no: material.no,
          name: material.name,
          title: material.title,
          username: material.username,
          used: material.used,
          content_type: material.content_type,
          group_id: material.group_id,
          md5: material.md5
        })
        .then(() => {
          this.get_materials()
        })
        .catch(err => {
          console.error('更新素材失败', err);
        });
    },

    availableTagsForMaterial(material) {
      return this.tags.filter(tag =>
        !material.tags.some(mtag => mtag.id === tag.id)
      );
    },
    addTagToMaterialDirect(materialId, tagId) {
      this.$service
        .add_tag_to_material({
          material_id: materialId,
          tag_id: tagId
        })
        .then(() => {
          this.get_materials();
        })
        .catch(err => {
          console.error('添加标签到素材失败', err);
        });
    },
    removeTagFromMaterialDirect(materialId, tagId) {
      this.$service
        .remove_tag_from_material({
          material_id: materialId,
          tag_id: tagId
        })
        .then(() => {
          this.get_materials();
        })
        .catch(err => {
          console.error('从素材中移除标签失败', err);
        });
    },

    filterByTagId() {
      this.selectedTag = this.tags.find(tag => tag.id === this.selectedTagId);
    },
    getTagCount(tagId) {
      return this.materials.filter(material =>
        material.tags && material.tags.some(tag => tag.id === tagId)
      ).length;
    },
    async get_accounts() {
      try {
        const res = await accountWsService.ws_get_accounts()
        this.accounts = res.data
      } catch (error) {
        console.error('Failed to get accounts:', error)
      }
    },
    async get_groups() {
      try {
        const res = await groupWsService.ws_get_groups()
        this.groups = res.data
      } catch (error) {
        console.error('Failed to get groups:', error)
      }
    },
    get_group_name(group_id) {
      const group = this.groups.find(group => group.id === group_id);
      return group ? group.name : '';
    }
  },
  async mounted() {
    await this.getTags();
    await this.get_materials();
    await this.get_accounts();
    await this.get_groups();
  }
}
</script>
