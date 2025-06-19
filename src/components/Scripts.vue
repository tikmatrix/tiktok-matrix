<template>
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'register' } })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />
        {{ $t('register') }}
    </button> -->
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'login' } })">
        <font-awesome-icon icon="fa-solid fa-right-to-bracket" class="h-3 w-3" />
        {{ $t('login') }}
    </button> -->
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'profile' } })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3" />
        {{ $t('fillProfile') }}
    </button> -->
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'matchAccount' } })">
        <font-awesome-icon icon="fa-solid fa-user-check" class="h-3 w-3" />
        {{ $t('matchAccount') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'switchAccount' } })">
        <font-awesome-icon icon="fa-solid fa-right-left" class="h-3 w-3" />
        {{ $t('switchAccount') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'accountWarmup' } })">
        <font-awesome-icon icon="robot" class="h-3 w-3 text-success" />
        {{ $t('accountWarmup') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'post' } })">
        <font-awesome-icon icon="paper-plane" class="h-3 w-3 text-success" />
        {{ $t('post') }}
    </button>
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'deletePost' } })">
        <font-awesome-icon icon="fa-solid fa-trash" class="h-3 w-3 text-error" />
        {{ $t('deletePost') }}
    </button> -->

    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'boostUsers' } })">
        <font-awesome-icon icon="fa fa-user-plus" class="h-3 w-3 text-success" />
        {{ $t('boostUsers') }}
    </button> -->
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'boostPosts' } })">
        <font-awesome-icon icon="fa-solid fa-thumbs-up" class="h-3 w-3 text-success" />
        {{ $t('boostPosts') }}
    </button> -->
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'boostLives' } })">
        <font-awesome-icon icon="fa-solid fa-video" class="h-3 w-3 text-success" />
        {{ $t('boostLives') }}
    </button> -->
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'massDM' } })">
        <font-awesome-icon icon="fa-solid fa-message" class="h-3 w-3" />
        {{ $t('massDM') }}
    </button> -->
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'massComment' } })">
        <font-awesome-icon icon="fa-solid fa-comment" class="h-3 w-3" />
        {{ $t('massComment') }}
    </button> -->
    <!-- <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'scrapeFollowers' } })">
        <font-awesome-icon icon="fas fa-spider" class="h-3 w-3 mr-1" />
        {{ $t('scrapeFollowers') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'followBack' } })">
        <font-awesome-icon icon="fa-solid fa-user-plus" class="h-3 w-3 mr-1" />
        {{ $t('followBack') }}
    </button>
    <button class="btn btn-md btn-primary  ml-1 mb-1"
        @click="$emiter('showDialog', { name: 'beforeRunScriptDialog', script: { name: 'unFollowAll' } })">
        <font-awesome-icon icon="fa-solid fa-user-minus" class="h-3 w-3 mr-1" />
        {{ $t('unFollowAll') }}
    </button>-->





</template>
<script>

export default {
    name: 'Scripts',
    props: ['settings'],
    data() {
        return {
        }
    },
    methods: {

    }
}
</script>