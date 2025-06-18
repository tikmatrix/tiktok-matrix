<template>
  <dialog ref="follow_record" class="modal">
    <div class="modal-box max-w-full w-auto max-h-[90vh] overflow-y-auto">
      <Pagination :items="follow_records" :searchKeys="['follower']" :searchTermPlaceholder="$t('follower')"
        :showRefBtn="false" @refresh="get_follow_record" :pageSize="8">
        <template v-slot:buttons>
        </template>
        <template v-slot:default="slotProps">
          <div class="overflow-x-auto">
            <table class="table table-md">
              <thead>
                <tr>
                  <th>{{ $t('number') }}</th>
                  <th>{{ $t('follower') }}</th>
                  <th>{{ $t('followee') }}</th>
                  <th>{{ $t('status') }}</th>
                  <th>{{ $t('follow_time') }}</th>
                  <th>{{ $t('unfollow_time') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in slotProps.items">
                  <td>{{ ((slotProps.currentPage - 1) * slotProps.pageSize) + index + 1 }}</td>
                  <td>
                    <span class="badge badge-ghost badge-md">{{ item.follower }}</span>
                  </td>
                  <td>
                    <span class="badge badge-ghost badge-md">{{ item.followee }}</span>
                  </td>
                  <td>
                    <span class="badge badge-ghost badge-md">{{ item.status == 0 ? $t('followed') :
                      $t('unfollowed') }}</span>
                  </td>
                  <td>
                    <span class="badge badge-ghost badge-md">{{ item.follow_time || '-' }}</span>
                  </td>
                  <td>
                    <span class="badge badge-ghost badge-md">{{ item.unfollow_time || '-' }}</span>
                  </td>



                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </Pagination>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script>
import Pagination from '../Pagination.vue'
export default {
  data() {
    return {
      plan: null,
      follow_records: [],
    }
  },
  components: {
    Pagination
  },
  methods: {
    show(plan) {
      console.log(plan);
      this.plan = plan
      this.get_follow_record();
      this.$refs.follow_record.showModal();
    },
    close() {
      this.$refs.follow_record.close();
    },
    get_follow_record() {
      this.$service.get_follow_record({
        username: this.plan.username
      })
        .then(res => {
          console.log(res.data);
          this.follow_records = res.data;
        })
        .catch(err => {
          console.error(err);
        });
    }

  },
  mounted() {
  }
}
</script>
