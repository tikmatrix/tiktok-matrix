<template>
  <div class="w-full">
    <Pagination :items="proxy_data.proxies" :searchKeys="['name']" @refresh="get_proxys">
      <template v-slot:buttons>
        <My-Button onclick="add_proxys_dialog.showModal()" label="add" icon="fa fa-add" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              ``
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('server') }}</th>
                <th>{{ $t('port') }}</th>
                <th>{{ $t('username') }}</th>
                <th>{{ $t('password') }}</th>
                <th>{{ $t('delay') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in slotProps.items" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.server }}</td>
                <td>{{ item.port }}</td>
                <td>
                  {{ item.username }}
                </td>
                <td>{{ item.password }}</td>
                <td>{{ item.delay }}</td>
                <td>
                  <div class="space-x-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="test_speed(item)">{{ $t('test') }}</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>
    <!-- Open the modal using ID.showModal() method -->
    <dialog id="add_proxys_dialog" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Add new Proxies!</h3>

        <div class="flex flex-row items-center gap-2 mb-2 w-full">
          <textarea class="textarea textarea-success w-full max-w-xs" placeholder="paste proxies here..."
            autocomplete="off" v-model="new_urls"> </textarea>
        </div>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="add_proxys">Save</button>
          </form>
        </div>
      </div>
    </dialog>
  </div>
</template>
<script>
import MyButton from '../Button.vue'
import Pagination from '../Pagination.vue'

export default {
  name: 'app',
  components: {
    MyButton,
    Pagination
  },
  data() {
    return {
      new_urls: '',
      proxy_data: {
        proxies: []
      }
    }
  },
  methods: {
    get_proxys() {
      this.$service
        .get_proxys()
        .then(res => {
          this.proxy_data = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    add_proxys() {
      this.$service
        .add_proxys({
          urls: this.new_urls
        })
        .then(() => {
          this.get_proxys()
        })
        .catch(err => {
          console.log(err)
        })
    },
    test_speed(item) {
      this.$service
        .test_speed({
          name: item.name
        })
        .then(res => {
          item.delay = res.data.delay
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_proxys()
  }
}
</script>
