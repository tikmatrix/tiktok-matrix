<template>
  <div class="bg-base-200">
    <div class="w-full flex items-center p-4 bg-base-200 z-10 shadow-md" v-if="showTopControls">
      <span class="font-bold p-2 text-md whitespace-nowrap">{{ $t('total') }} {{ filteredItems.length }}</span>

      <div class="relative ml-2" v-if="searchKeys">
        <label class="input">
          <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </g>
          </svg>
          <input type="search" class="grow" v-model="searchTerm" :placeholder="searchTermPlaceholder" />
        </label>

      </div>
      <MyButton icon="fa fa-refresh" @click="$emit('refresh')" label="refresh" v-if="showRefBtn" />
      <slot name="buttons"></slot>
    </div>
    <div>
      <slot :items="paginatedItems" :currentPage="currentPage" :pageSize="pageSizeValue"></slot>
    </div>

    <!-- 底部分页控件 -->
    <div class="flex items-center justify-between p-4 mt-4" v-if="showBottomControls">
      <div class="flex items-center">
        <span class="mr-4 whitespace-nowrap">{{ $t('total') }} {{ filteredItems.length }}</span>
        <div class="dropdown dropdown-top">
          <label tabindex="0" class="btn min-h-8 h-10 px-4 min-w-[120px] flex justify-between items-center">
            {{ pageSize }}/{{ $t('page') }}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </label>
          <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
            <li v-for="size in [10, 20, 30, 50, 100]" :key="size">
              <a @click="changePageSize(size)">{{ size }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="flex items-center">
        <button class="btn btn-md btn-ghost" @click="goToPage(1)" :disabled="currentPage === 1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m11 17-5-5 5-5" />
            <path d="m18 17-5-5 5-5" />
          </svg>
        </button>
        <button class="btn btn-md btn-ghost" @click="prevPage" :disabled="currentPage === 1">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <template v-for="page in visiblePageNumbers" :key="page">
          <button v-if="page !== '...'" class="btn btn-md mx-1"
            :class="{ 'btn-primary': currentPage === page, 'btn-ghost': currentPage !== page }" @click="goToPage(page)">
            {{ page }}
          </button>
          <span v-else class="mx-2">...</span>
        </template>

        <button class="btn btn-md btn-ghost" @click="nextPage" :disabled="currentPage === pageCount">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
        <button class="btn btn-md btn-ghost" @click="goToPage(pageCount)" :disabled="currentPage === pageCount">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m13 17 5-5-5-5" />
            <path d="m6 17 5-5-5-5" />
          </svg>
        </button>

        <div class="flex items-center ml-4">
          <span class="mr-2">{{ $t('goTo') }}</span>
          <input type="number" v-model="gotoPage" @keyup.enter="handleGotoPage" min="1" :max="pageCount"
            class="input input-bordered input-md w-16 px-2" />
        </div>
      </div>
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
    },
    showTopControls: {
      type: Boolean,
      default: true
    },
    showBottomControls: {
      type: Boolean,
      default: true
    },
    searchTermPlaceholder: {
      type: String,
      default: 'Enter tips'
    }
  },
  data() {
    return {
      currentPage: 1,
      searchTerm: '',
      searchGroup: '',
      gotoPage: 1,
      pageSizeValue: this.pageSize
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
      return Math.ceil(this.filteredItems.length / this.pageSizeValue)
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.pageSizeValue
      const end = start + this.pageSizeValue
      return this.filteredItems.slice(start, end)
    },
    visiblePageNumbers() {
      const pages = []
      const totalPages = this.pageCount
      const current = this.currentPage

      // 始终显示第一页
      pages.push(1)

      // 计算显示哪些页码
      if (totalPages <= 7) {
        // 如果总页数少于7，则全部显示
        for (let i = 2; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 复杂逻辑，确保当前页附近的页码可见
        if (current <= 3) {
          // 当前页靠近开始
          pages.push(2, 3, 4, 5, '...', totalPages)
        } else if (current >= totalPages - 2) {
          // 当前页靠近结束
          pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
        } else {
          // 当前页在中间
          pages.push('...', current - 1, current, current + 1, '...', totalPages)
        }
      }

      return pages
    }
  },
  methods: {
    nextPage() {
      if (this.currentPage < this.pageCount) {
        this.currentPage++
        this.gotoPage = this.currentPage
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.gotoPage = this.currentPage
      }
    },
    goToPage(page) {
      if (page >= 1 && page <= this.pageCount) {
        this.currentPage = page
        this.gotoPage = page
      }
    },
    handleGotoPage() {
      const page = parseInt(this.gotoPage)
      if (!isNaN(page) && page >= 1 && page <= this.pageCount) {
        this.currentPage = page
      } else {
        // 如果输入无效，重置为当前页
        this.gotoPage = this.currentPage
      }
    },
    changePageSize(size) {
      this.pageSizeValue = size
      // 页码可能需要调整，确保不会超出新的总页数
      if (this.currentPage > this.pageCount) {
        this.currentPage = this.pageCount || 1
      }
      this.gotoPage = this.currentPage
    }
  },
  watch: {
    pageSize: {
      immediate: true,
      handler(newValue) {
        this.pageSizeValue = newValue
      }
    }
  },
  mounted() {
    this.gotoPage = this.currentPage
  }
}
</script>
