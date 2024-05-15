<template>
  <div class="w-full">
    <Pagination :items="analytics" :searchKeys="['username', 'day_hour', 'device_index']" @refresh="get_analytics">
      <template v-slot:buttons> </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              <tr>
                <!-- <th>{{ $t('id') }}</th> -->
                <th>{{ $t('username') }}</th>
                <th>{{ $t('follower_count') }}</th>
                <th>{{ $t('video_count') }}</th>
                <th>{{ $t('video_play_count') }}</th>
                <th>{{ $t('video_like_count') }}</th>
                <th>{{ $t('video_comment_count') }}</th>
                <th>{{ $t('video_collect_count') }}</th>
                <th>{{ $t('day_hour') }}</th>
                <!-- <th>{{ $t('actions') }}</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in slotProps.items" :key="index">
                <!-- <td>{{ item.id }}</td> -->
                <td>
                  <a class="link link-primary" :href="`https://www.tiktok.com/@${item.username}`" target="_blank">@{{
                    item.username }}</a>
                </td>

                <td>
                  <div class="stat">
                    <!-- <div class="stat-figure text-primary">
                                            <font-awesome-icon :icon="['fas', 'user']" />
                                        </div> -->
                    <div class="stat-value">{{ format_number(item.follower_count) }}</div>
                    <div class="stat-desc">{{ item.follower_count_up }}</div>
                  </div>
                </td>
                <td>
                  <div class="stat">
                    <!-- <div class="stat-figure text-secondary">
                                            <font-awesome-icon :icon="['fas', 'video']" />
                                        </div> -->
                    <div class="stat-value">{{ format_number(item.video_count) }}</div>
                    <div class="stat-desc">{{ item.video_count_up }}</div>
                  </div>
                </td>
                <td>
                  <div class="stat">
                    <div class="stat-figure text-secondary">
                      <font-awesome-icon :icon="['fas', 'eye']" />
                    </div>
                    <div class="stat-value text-secondary">{{ format_number(item.video_play_count) }}</div>
                    <div class="stat-desc text-secondary">{{ item.video_play_count_up }}</div>
                  </div>
                </td>
                <td>
                  <div class="stat">
                    <div class="stat-figure text-primary">
                      <font-awesome-icon :icon="['fas', 'thumbs-up']" />
                    </div>
                    <div class="stat-value text-primary">{{ format_number(item.video_like_count) }}</div>
                    <div class="stat-desc text-primary">{{ item.video_like_count_up }}</div>
                  </div>
                </td>
                <td>
                  <div class="stat">
                    <div class="stat-figure text-secondary">
                      <font-awesome-icon :icon="['fas', 'comment']" />
                    </div>
                    <div class="stat-value text-secondary">{{ format_number(item.video_comment_count) }}</div>
                    <div class="stat-desc text-secondary">{{ item.video_comment_count_up }}</div>
                  </div>
                </td>

                <td>
                  <div class="stat">
                    <div class="stat-figure text-primary">
                      <font-awesome-icon :icon="['fas', 'star']" />
                    </div>
                    <div class="stat-value text-primary">{{ format_number(item.video_collect_count) }}</div>
                    <div class="stat-desc text-primary">{{ item.video_collect_count_up }}</div>
                  </div>
                </td>
                <td>{{ item.day_hour }}</td>
                <!-- <td>
                                    <div class="space-x-4">
                                        <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                            @click="editAnalytics(item)">{{ $t('edit') }}</button>
                                        <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                            @click="deleteAnalytics(item)">{{ $t('delete') }}</button>
                                    </div>
                                </td> -->
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>
  </div>
</template>
<script>
import Pagination from '../Pagination.vue'
export default {
  name: 'app',
  components: {
    Pagination
  },
  data() {
    return {
      analytics: [],
      currentAnalytics: null,
      showAddAnalytics: false
    }
  },
  methods: {
    //format number to n or n.n k or n.n m
    format_number(number) {
      if (number < 1000) {
        return number
      } else if (number < 1000000) {
        return (number / 1000).toFixed(2) + 'k'
      } else if (number < 1000000000) {
        return (number / 1000000).toFixed(2) + 'm'
      }
    },
    get_analytics() {
      this.currentAnalytics = null
      this.$service
        .get_analytics()
        .then(res => {
          this.analytics = res.data
          this.analytics.forEach((item, index) => {
            // 向前搜索具有相同username的元素
            let prevItem = null
            for (let i = index - 1; i >= 0; i--) {
              if (this.analytics[i].username === item.username) {
                prevItem = this.analytics[i]
                break
              }
            }

            if (prevItem) {
              item.follower_count_up = Math.max(0, item.follower_count - prevItem.follower_count)
              item.video_count_up = Math.max(0, item.video_count - prevItem.video_count)
              item.video_collect_count_up = Math.max(0, item.video_collect_count - prevItem.video_collect_count)
              item.video_comment_count_up = Math.max(0, item.video_comment_count - prevItem.video_comment_count)
              item.video_like_count_up = Math.max(0, item.video_like_count - prevItem.video_like_count)
              item.video_play_count_up = Math.max(0, item.video_play_count - prevItem.video_play_count)

              item.follower_count_up = `↗︎ ${this.format_number(item.follower_count_up)} (${((item.follower_count_up / prevItem.follower_count) * 100).toFixed(0)}%)`
              item.video_count_up = `↗︎ ${this.format_number(item.video_count_up)} (${((item.video_count_up / prevItem.video_count) * 100).toFixed(0)}%)`
              item.video_collect_count_up = `↗︎ ${this.format_number(item.video_collect_count_up)} (${((item.video_collect_count_up / prevItem.video_collect_count) * 100).toFixed(0)}%)`
              item.video_comment_count_up = `↗︎ ${this.format_number(item.video_comment_count_up)} (${((item.video_comment_count_up / prevItem.video_comment_count) * 100).toFixed(0)}%)`
              item.video_like_count_up = `↗︎ ${this.format_number(item.video_like_count_up)} (${((item.video_like_count_up / prevItem.video_like_count) * 100).toFixed(0)}%)`
              item.video_play_count_up = `↗︎ ${this.format_number(item.video_play_count_up)} (${((item.video_play_count_up / prevItem.video_play_count) * 100).toFixed(0)}%)`
            } else {
              item.follower_count_up = '↗︎ 0 (0%)'
              item.video_count_up = '↗︎ 0 (0%)'
              item.video_collect_count_up = '↗︎ 0 (0%)'
              item.video_comment_count_up = '↗︎ 0 (0%)'
              item.video_like_count_up = '↗︎ 0 (0%)'
              item.video_play_count_up = '↗︎ 0 (0%)'
            }
          })
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_analytics()
  }
}
</script>
