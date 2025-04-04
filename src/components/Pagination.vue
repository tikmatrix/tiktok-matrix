<template>
  <div class="bg-base-200">
    <div class="w-full flex items-center p-4 fixed bg-base-200 z-10 shadow-md">
      <span class="font-bold p-2 text-md">{{ $t('total') }}: {{ filteredItems.length }}</span>

      <div class="join ring-1" v-if="pageCount > 1">
        <button class="join-item btn btn-md" @click="prevPage" :disabled="currentPage === 1">{{
          $t('previous') }}</button>
        <button class="join-item btn btn-disabled btn-md">{{ currentPage }} / {{ pageCount }}</button>
        <button class="join-item btn btn-md" @click="nextPage" :disabled="currentPage === pageCount">{{ $t('next')
        }}</button>
      </div>


      <div class="relative ml-2" v-if="searchKeys">
        <font-awesome-icon :icon="['fas', 'search']" class="absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input type="search" v-model="searchTerm" :placeholder="$t('enterTips')"
          class="input input-bordered w-full max-w-xs pl-8 input-md ring-1" />
      </div>
      <template v-if="uniqueGroupNames.length > 0">
        <select v-model="searchGroup" class="select select-bordered max-w-xs ml-2 select-md">
          <option value="">{{ $t('allGroups') }}</option>
          <option v-for="item in uniqueGroupNames" :key="item.group_name" :value="item.group_name">
            {{ item.group_name }}
          </option>
        </select>
      </template>
      <MyButton icon="fa fa-refresh" @click="$emit('refresh')" label="refresh" v-if="showRefBtn" />
      <slot name="buttons"></slot>
    </div>
    <div class="pt-20">
      <slot :items="paginatedItems"></slot>
    </div>


  </div>
</template>

<script>
import MyButton from './Button.vue'

export default {
  components: {
    MyButton
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    showRefBtn: {
      type: Boolean,
      default: true
    },
    searchKeys: {
      type: Array,
      required: false
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      currentPage: 1,
      searchTerm: '',
      searchGroup: '',
    }
  },
  computed: {
    uniqueGroupNames() {
      return this.items
        .reduce((unique, item) => {
          if (item.group_name && !unique.some(obj => obj.group_name === item.group_name)) {
            unique.push(item)
          }
          return unique
        }, [])
        .sort((a, b) => (a.group_name ? a.group_name.localeCompare(b.group_name) : 0))
    },
    filteredItems() {
      if (this.searchTerm) {
        return this.items.filter(
          item =>
            this.searchKeys.some(key => (item[key] ? String(item[key]) === this.searchTerm : false)) &&
            (!this.searchGroup || item.group_name === this.searchGroup)
        )
      } else {
        return this.items.filter(item => !this.searchGroup || item.group_name === this.searchGroup)
      }
    },
    pageCount() {
      return Math.ceil(this.filteredItems.length / this.pageSize)
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredItems.slice(start, end)
    }
  },
  methods: {
    nextPage() {
      if (this.currentPage < this.pageCount) {
        this.currentPage++
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    }
  },
  mounted() {
  }
}
</script>
