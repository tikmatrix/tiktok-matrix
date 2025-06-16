<template>
  <div class="w-full">
    <Pagination :items="plans" :searchKeys="['username']" :showRefBtn="false" @refresh="get_plans" :pageSize="8">
      <template v-slot:buttons>
        <MyButton @click="$refs.edit_dialog.show()" label="add" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-md">
            <thead>
              <tr>
                <th>{{ $t('number') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('targetUsernamesPath') }}</th>
                <th>{{ $t('startTime') }}</th>
                <th>{{ $t('followCount') }}</th>
                <th>{{ $t('unfollowCount') }}</th>
                <th>{{ $t('unfollowDelay') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(plan, index) in slotProps.items">
                <td>{{ ((slotProps.currentPage - 1) * slotProps.pageSize) + index + 1 }}</td>
                <td>
                  <span class="badge badge-ghost badge-md">{{ plan.username }}</span>
                </td>
                <td>
                  <span class="badge badge-ghost badge-md">{{ plan.target_username_path }}</span>
                </td>
                <td>
                  <span class="badge badge-ghost badge-md">{{ plan.start_time }}</span>
                </td>
                <td>
                  <span class="badge badge-ghost badge-md">{{ plan.follow_count || '-' }}</span>
                </td>
                <td>
                  <span class="badge badge-ghost badge-md">{{ plan.unfollow_count || '-' }}</span>
                </td>
                <td>
                  <span class="badge badge-ghost badge-md">{{ plan.unfollow_delay || '-' }}</span>
                </td>


                <td>
                  <div class="space-x-4">
                    <button class="btn btn-md btn-primary" @click="$refs.edit_dialog.show(plan)">{{ $t('edit')
                    }}</button>
                    <button class="btn btn-md btn-error" @click="deletePlan(plan)">
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
    <Edit ref="edit_dialog" @update="updatePlan" @add="addPlan" />


  </div>
</template>
<script>
import MyButton from '../Button.vue'
import Edit from './Edit.vue'
import Pagination from '../Pagination.vue'

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
      plans: [],
    }
  },
  watch: {

  },
  computed: {

  },
  methods: {


    async get_plans() {
      this.$service
        .get_plans()
        .then(res => {
          this.plans = res.data
        })
    },
    async addPlan(plan) {
      this.$service
        .add_plan(plan)
        .then(() => {
          this.$refs.edit_dialog.close();
          this.get_plans()
        })
    },
    async updatePlan(plan) {
      this.$service
        .update_plan(plan)
        .then(() => {
          this.$refs.edit_dialog.close();
          this.get_plans()
        })
    },
    async deletePlan(plan) {
      this.$service
        .delete_plan({
          id: plan.id
        })
        .then(() => {
          this.get_plans()
        })
    },
  },
  async mounted() {
    this.get_plans()
  }
}
</script>
