<template>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'registerDialog' })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />
        {{ $t('register') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'loginDialog' })">
        <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="h-3 w-3" />
        {{ $t('login') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'profileDialog' })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />
        {{ $t('fillProfile') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('run_task_now', { name: 'match_account', args: {} })">
        <font-awesome-icon icon="fa-solid fa-user-check" class="h-3 w-3" />
        {{ $t('matchAccount') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('menuSelected', { name: 'trainDialog' })">
        <font-awesome-icon icon="robot" class="h-3 w-3 text-success" />
        {{ $t('train') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1"
        @click="$emiter('menuSelected', { name: 'publishDialog' })">
        <font-awesome-icon icon="paper-plane" class="h-3 w-3 text-success" />
        {{ $t('post') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'deletePostDialog' })">
        <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3 text-error" />
        {{ $t('deletePost') }}
    </button>

    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'boostUsersDialog' })">
        <font-awesome-icon icon="fa fa-user-plus" class="h-3 w-3 text-success" />
        {{ $t('boostUsers') }}
    </button>


    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'boostPostsDialog' })">
        <font-awesome-icon icon="fa-solid fa-thumbs-up" class="h-3 w-3 text-success" />
        {{ $t('boostPosts') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'massDMDialog' })">
        <font-awesome-icon icon="fa-solid fa-message" class="h-3 w-3" />
        {{ $t('massDM') }}
    </button>
    <button class="btn btn-sm btn-primary  ml-1 mb-1" @click="$emiter('menuSelected', { name: 'scrapeFollowersDialog' })">
        <font-awesome-icon icon="fas fa-spider" class="h-3 w-3 mr-1" />
        {{ $t('scrapeFollowers') }}
    </button>
    
   
    
    
</template>
<script>

export default {
    name: 'Tools',
    data() {
        return {
        }
    },
    methods: {
        
    }
}
</script>