<template>
  <div class="w-full">
    <Pagination :items="post_comments" :searchKeys="['name']" @refresh="get_post_comments">
      <template v-slot:buttons>
        <MyButton onclick="add_post_comment_dialog.showModal()" label="add" icon="fa fa-add" />
        <MyButton onclick="confirm_modal.showModal()" label="clearAll" />
      </template>
      <template v-slot:default="slotProps">
        <div class="overflow-x-auto">
          <table class="table table-sm">
            <thead>
              ``
              <tr>
                <th>{{ $t('id') }}</th>
                <th>{{ $t('postUrl') }}</th>
                <th>{{ $t('topicCount') }}</th>
                <th>{{ $t('commentCount') }}</th>
                <th>{{ $t('accountCount') }}</th>
                <th>{{ $t('actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(post_comment, index) in slotProps.items" :key="index">
                <td>{{ post_comment.id }}</td>
                <td>{{ post_comment.post_url }}</td>
                <td>{{ post_comment.topic_count }}</td>
                <td>
                  <span class="text-success">{{ post_comment.success_comment_count }}</span>
                  /
                  <span class="text-error">{{ post_comment.fail_comment_count }}</span>
                  /
                  {{ post_comment.comment_count }}
                </td>
                <td>{{ post_comment.account_count }}</td>
                <td>
                  <div class="space-x-4">
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      @click="add_topic(post_comment)">
                      {{ $t('addTopic') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </Pagination>
    <!-- Open the modal using ID.showModal() method -->
    <dialog id="add_post_comment_dialog" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Add Post Comments!</h3>
        <label class="input input-bordered flex items-center gap-2 my-4">
          Post Url
          <input type="text" class="grow" placeholder="https://www.tiktok.com/@ferchugimenez/video/"
            v-model="new_post_url" />
        </label>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="add_post_comment">Save</button>
          </form>
        </div>
      </div>
    </dialog>
    <dialog id="confirm_modal" class="modal">
      <div class="modal-box">
        <form method="dialog">
          <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
        </form>
        <h3 class="font-bold text-lg">Confirm Clear All?</h3>
        <div class="modal-action">
          <form method="dialog">
            <button class="btn btn-primary" @click="delete_all">Confirm</button>
          </form>
        </div>
      </div>
    </dialog>
    <Modal :show="showMoal" @close="showMoal = false">
      <Add :post_comment="current_post_comment || default_post_comment" @add="add_post_comment_topic" />
    </Modal>
  </div>
</template>
<script>
import Modal from '../Modal.vue'
import MyButton from '../Button.vue'
import Add from './Add.vue'
import Pagination from '../Pagination.vue'

export default {
  name: 'app',
  components: {
    Modal,
    MyButton,
    Add,
    Pagination
  },
  data() {
    return {
      new_post_url: '',
      post_comments: [],
      current_post_comment: null,
      showMoal: false,
      default_post_comment: {}
    }
  },
  methods: {
    delete_all() {
      this.$service
        .delete_all_post_comments()
        .then(() => {
          this.get_post_comments()
        })
        .catch(err => {
          console.log(err)
        })
    },
    get_post_comments() {
      this.showMoal = false
      this.current_post_comment = null
      this.$service
        .get_post_comments()
        .then(res => {
          this.post_comments = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    add_post_comment() {
      this.$service
        .add_post_comment({
          post_url: this.new_post_url
        })
        .then(() => {
          this.get_post_comments()
        })
        .catch(err => {
          console.log(err)
        })
    },

    add_topic(post_comment) {
      this.showMoal = true
      this.current_post_comment = post_comment
    },
    add_post_comment_topic(post_comment_topic) {
      this.$service
        .add_post_comment_topic(post_comment_topic)
        .then(() => {
          this.get_post_comments()
        })
        .catch(err => {
          console.log(err)
        })
    }
  },
  mounted() {
    this.get_post_comments()
  }
}
</script>
