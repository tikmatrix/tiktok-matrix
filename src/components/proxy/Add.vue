<template>
  <div class="bg-base-100 flex flex-col items-start p-4">
    <div class="flex flex-row items-center gap-2 mb-2 w-full">
      <textarea class="textarea textarea-success w-full max-w-xs" placeholder="input formated comments" autocomplete="off" v-model="post_comment_topic.content">
      </textarea>
      <label class="input input-bordered flex items-center gap-2">
        <span class="text-primary">AccountCount: </span>
        <input type="number" class="grow" placeholder="account count" v-model="post_comment_topic.account_count" readonly />
      </label>
      <!-- gen comments btn -->
      <MyButton class="btn-primary" @click="genComments" label="parse" />
      <MyButton class="btn-primary" @click="add" label="save" :disabled="error_msg !== ''" />
    </div>
    <div class="divider">comments</div>
    <div class="text-error">{{ error_msg }}</div>
    <!-- comments -->
    <div class="w-full items-center gap-2 mb-2">
      <div class="chat chat-start" v-for="comment in post_comment_topic.comments" :key="comment.no">
        <div class="chat-image avatar">
          <div class="w-14 h-14 rounded-full border-2 border-green-500 text-center bg-blue-400">
            <img src="/tx.png" alt="avatar" class="rounded-full" />
          </div>
        </div>
        <div class="chat-header">
          #{{ comment.no }}:
          <span class="text-primary"> {{ comment.username }} {{ comment.parent_no ? 'Reply#' + comment.parent_no : 'Comment' }}</span>
        </div>
        <div class="chat-bubble">{{ comment.content }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import MyButton from '../Button.vue'
export default {
  props: {
    post_comment: {
      type: Object,
      required: true
    }
  },

  components: {
    MyButton
  },
  data() {
    return {
      error_msg: 'parse comments first',
      post_comment_topic: {
        post_comment_id: 0,
        content: '',
        account_count: 0,
        comments: [],
        accounts: []
      }
    }
  },
  emits: ['add'],
  methods: {
    add() {
      this.$emit('add', this.post_comment_topic)
    },
    get_accounts() {
      this.$service
        .get_accounts()
        .then(res => {
          this.accounts = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    genComments() {
      //filter empty lines
      this.post_comment_topic.content = this.post_comment_topic.content.split('\n').filter(Boolean).join('\n')
      //filter blank lines
      this.post_comment_topic.content = this.post_comment_topic.content.replace(/^\s*[\r\n]/gm, '')
      //split by line and add to comments
      this.account_count = 0
      var usernames = []

      this.post_comment_topic.content.split('\n').map((comment, index) => {
        //fileter head and tail space
        comment = comment.replace(/^\s+|\s+$/g, '')
        var no = index + 1
        var parent_no = 0
        var username = comment.split(':')[0].split(' ')[0]
        if (!usernames.includes(username)) {
          usernames.push(username)
        }
        if (comment.includes('(replying to')) {
          var replying_to_username = comment.split('replying to ')[1].split(')')[0]
          console.log('replying_to_username:', replying_to_username)
          //find parent_no
          var parent_comment = this.post_comment_topic.comments.find(comment => comment.username === replying_to_username)
          if (parent_comment) {
            parent_no = parent_comment.no
          }
        }
        //remove head and tail
        var content = comment
          .split(':')[1]
          .replace(/^\s+|\s+$/g, '')
          .replace(/^"|"$/g, '')
        this.post_comment_topic.comments.push({
          no: no,
          content: content,
          username: username,
          parent_no: parent_no,
          status: 0
        })
      })
      this.post_comment_topic.account_count = usernames.length
      if (this.accounts.length < usernames.length) {
        this.error_msg = 'account not enough'
        return
      }
      this.error_msg = ''
      //copy accounts
      var temp_accounts = this.accounts.slice()
      var random_account_map = {}
      var account = {}
      this.post_comment_topic.comments.forEach(comment => {
        if (random_account_map[comment.username]) {
          // console.log('random_account_map[comment.username]:', random_account_map[comment.username])
          account = random_account_map[comment.username]
          comment.username = account.username
          comment.account_id = account.id
        } else {
          //random pop account
          // console.log('random pop account, temp_accounts.length:', temp_accounts.length, 'temp_accounts:', temp_accounts)
          account = temp_accounts.splice(Math.floor(Math.random() * temp_accounts.length), 1)[0]
          // console.log('random pop account, account:', account)
          random_account_map[comment.username] = account
          comment.username = account.username
          comment.account_id = account.id
          // console.log('random pop account, comment:', comment)
        }
      })
    }
  },
  mounted() {
    this.post_comment_topic.post_comment_id = this.post_comment.id
    this.get_accounts()
  }
}
</script>
<!-- 

User1: "It's high time McDonald's workers got a raise. They've been underpaid for too long. #FairWagesNow"

User2 (replying to User1): "Absolutely agree! It's about respecting the hard work they put in every day."
User9: "Chipotle claims to be healthy, but have you seen the calorie count on some of their meals? #NotSoHealthy"

User10 (replying to User9): "It's all about portion control and choosing the right options. Chipotle offers plenty of healthy choices."
User3: "A raise for McDonald's workers? Only if you're ready for your meal prices to skyrocket. That's just economics."

User4 (replying to User3): "People deserve a living wage, even if it means paying a bit more for a burger."
User11: "Compared to other fast-food joints, Chipotle is a breath of fresh air. They use fresh ingredients and offer transparency about their sourcing."

User12 (replying to User11): "Fresh doesn't automatically mean healthy. The sodium levels in some dishes are through the roof."
User5: "Raising wages is more complicated than it seems. It could lead to job cuts if McDonald's decides to automate more roles."

User6 (replying to User5): "We can't fear progress. We need to find ways to support workers through change."
User13: "At least Chipotle gives you the option to eat healthier. It's more than what can be said for most fast-food chains."

User14 (replying to User13): "True, but labeling it as 'healthy' can be misleading. It's healthier, which doesn't mean it's healthy."
User7: "Why focus only on McDonald's? All fast-food chains should ensure their workers are fairly compensated."

User8 (replying to User7): "Starting with one company can create a ripple effect. McDonald's can lead the way."
User15: "People get caught up in the 'healthy' label. Chipotle is better than many, but you still need to make smart choices."

User16 (replying to User15): "Exactly! No restaurant will be healthy if you're choosing the highest calorie options with extra cheese and sour cream."

 -->
