<template>
    <!-- 顶部说明 -->
    <div class="alert alert-info mb-4 shadow-lg">
        <div>
            <font-awesome-icon icon="fa-solid fa-rocket" class="h-6 w-6 mr-2" />
            <span>{{ $t('superBoostWarning') }}</span>
        </div>
    </div>

    <!-- 流程导航：横向 Tab -->
    <div class="bg-base-100 border border-base-300 rounded-2xl shadow-sm mb-6">
        <div class="px-4 py-3 overflow-x-auto">
            <div class="tabs tabs-lifted tabs-lg min-w-max">
                <button v-for="(tab, index) in availableTabs" :key="tab.key" type="button"
                    class="tab flex items-center gap-3 whitespace-nowrap transition" :class="[
                        tab.key === activeTab ? 'tab-active text-primary' : 'opacity-70 hover:opacity-100',
                        'px-4'
                    ]" @click="setActiveTab(tab.key)">
                    <span class="badge badge-sm"
                        :class="tab.key === activeTab ? 'badge-primary' : 'badge-ghost text-base-content/70'">
                        {{ index + 1 }}
                    </span>
                    <font-awesome-icon :icon="tab.icon" class="text-base" />
                    <span class="font-semibold">{{ tab.label }}</span>
                </button>
            </div>
        </div>
    </div>

    <!-- 模块1：输入用户数据源 -->
    <div v-show="activeTab === 'data_source'" class="card bg-base-100 border border-base-300 mb-4">
        <div class="card-body p-4">
            <h3 class="card-title text-lg mb-4 text-primary">
                <font-awesome-icon icon="fa-solid fa-database" class="mr-2" />
                {{ $t('dataSourceLabel') }}
            </h3>

            <!-- 数据源类型选择 -->
            <div class="form-control mb-4 flex items-center gap-4">
                <div class="grid md:grid-cols-2 gap-3">
                    <label class="cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-base-200"
                        :class="{ 'bg-primary/5 border-primary': isUsernameSource }">
                        <input type="radio" class="radio radio-primary mt-1" value="usernames" v-model="dataSourceType">
                        <div>
                            <span class="font-semibold">{{ $t('dataSourceUsernames') }}</span>
                            <p class="text-md text-gray-500 mt-1">{{ $t('dataSourceUsernamesDesc') }}</p>
                        </div>
                    </label>
                    <label class="cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-base-200"
                        :class="{ 'bg-info/5 border-info': isPostLinkSource }">
                        <input type="radio" class="radio radio-info mt-1" value="post_links" v-model="dataSourceType">
                        <div>
                            <span class="font-semibold">{{ $t('dataSourcePostLinks') }}</span>
                            <p class="text-md text-gray-500 mt-1">{{ $t('dataSourcePostLinksDesc') }}</p>
                        </div>
                    </label>
                </div>
            </div>
            <div class="space-y-6">
                <div class="grid gap-4 md:grid-cols-2">
                    <div class="border border-base-200 rounded-lg p-4 bg-base-50">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-semibold text-md flex items-center gap-2">
                                <font-awesome-icon icon="fa-solid fa-chart-column" />
                                {{ $t('datasetStatsTitle') }}
                            </h4>
                            <span class="badge badge-outline" v-if="activeDatasetConfig.id">
                                {{ $t('datasetId') }}: {{ activeDatasetConfig.id }}
                            </span>
                        </div>
                        <div v-if="activeDatasetLoading" class="flex items-center gap-2 text-md text-base-content/70">
                            <span class="loading loading-spinner loading-sm"></span>
                            <span>{{ $t('datasetLoading') }}</span>
                        </div>
                        <div v-else-if="activeDatasetStats" class="grid grid-cols-2 gap-3 text-md">
                            <div>
                                <div class="text-sm text-base-content/60">{{ $t('datasetTotal') }}</div>
                                <div class="font-semibold text-lg">{{ activeDatasetStats.total }}</div>
                            </div>
                            <div>
                                <div class="text-sm text-base-content/60">{{ $t('datasetConsumed') }}</div>
                                <div class="font-semibold text-lg">{{ activeDatasetStats.consumed }}</div>
                            </div>
                            <div>
                                <div class="text-sm text-base-content/60">{{ $t('datasetRemaining') }}</div>
                                <div class="font-semibold text-lg">{{ activeDatasetStats.remaining }}</div>
                            </div>
                            <div>
                                <div class="text-sm text-base-content/60">{{ $t('datasetLastUpdated') }}</div>
                                <div class="font-semibold text-lg">
                                    {{ activeDatasetStats.updated_at ? formatLocalTime(activeDatasetStats.updated_at) :
                                        '-' }}
                                </div>
                            </div>
                        </div>
                        <div v-else class="alert alert-info py-3">
                            <font-awesome-icon icon="fa-solid fa-circle-info" class="mr-2" />
                            <span>{{ $t('datasetNotConfigured') }}</span>
                        </div>
                    </div>

                    <div class="border border-base-200 rounded-lg p-4 bg-base-50">
                        <h4 class="font-semibold text-md mb-3 flex items-center gap-2">
                            <font-awesome-icon icon="fa-solid fa-diagram-project" />
                            {{ $t('datasetStrategyTitle') }}
                        </h4>
                        <div class="flex flex-wrap gap-4">
                            <label class="cursor-pointer flex items-start gap-2 p-3 rounded-lg border border-base-300"
                                :class="{ 'border-primary bg-primary/10': dataSourceStrategy === 'shared_pool' }">
                                <input type="radio" class="radio radio-primary mt-1" value="shared_pool"
                                    :checked="dataSourceStrategy === 'shared_pool'"
                                    @change="changeActiveDatasetStrategy('shared_pool')">
                                <div>
                                    <div class="font-semibold">{{ $t('datasetSharedPool') }}</div>
                                    <p class="text-sm text-base-content/70">{{ $t('datasetSharedPoolDesc') }}</p>
                                </div>
                            </label>
                            <label class="cursor-pointer flex items-start gap-2 p-3 rounded-lg border border-base-300"
                                :class="{ 'border-secondary bg-secondary/10': dataSourceStrategy === 'consume_once' }">
                                <input type="radio" class="radio radio-secondary mt-1" value="consume_once"
                                    :checked="dataSourceStrategy === 'consume_once'"
                                    @change="changeActiveDatasetStrategy('consume_once')">
                                <div>
                                    <div class="font-semibold">{{ $t('datasetConsumeOnce') }}</div>
                                    <p class="text-sm text-base-content/70">{{ $t('datasetConsumeOnceDesc') }}</p>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <!-- 左侧：导入面板 -->
                    <div>
                        <div class="form-control">
                            <label class="font-bold text-md mb-2 flex items-center gap-2">
                                <font-awesome-icon icon="fa-solid fa-file-import" />
                                <span>{{ $t('datasetImportLabel') }}</span>
                            </label>
                            <textarea class="textarea textarea-bordered textarea-md h-48 lg:h-64"
                                v-model="activeDatasetInput" :placeholder="$t('datasetImportPlaceholder')"></textarea>
                            <div class="flex flex-wrap items-center gap-3 mt-3">
                                <button class="btn btn-info btn-sm" @click="selectDatasetFile">
                                    <font-awesome-icon icon="fa-solid fa-file-arrow-up" class="mr-1" />
                                    {{ $t('selectDatasetFile') }}
                                </button>
                                <button class="btn btn-primary btn-sm" :disabled="activeDatasetImporting"
                                    @click="handleDatasetImport('append')">
                                    <span v-if="activeDatasetImporting"
                                        class="loading loading-spinner loading-sm mr-2"></span>
                                    {{ $t('appendImport') }}
                                </button>
                                <button class="btn btn-secondary btn-sm" :disabled="activeDatasetImporting"
                                    @click="handleDatasetImport('replace')">
                                    <span v-if="activeDatasetImporting"
                                        class="loading loading-spinner loading-sm mr-2"></span>
                                    {{ $t('replaceImport') }}
                                </button>
                                <button class="btn btn-outline btn-error btn-sm"
                                    :disabled="!activeDatasetConfig.id || activeDatasetLoading"
                                    @click="clearActiveDataset">
                                    {{ $t('clearDataset') }}
                                </button>
                            </div>
                            <p class="text-sm text-base-content/70 mt-2">{{ $t('datasetImportHint') }}</p>
                        </div>

                        <!-- summary moved below the import+preview grid to align widths -->
                    </div>

                    <!-- 右侧：预览列表（限定高度，可滚动） -->
                    <div>
                        <div class="border border-base-200 rounded-lg overflow-hidden">
                            <div class="px-4 py-2 bg-base-200 flex items-center justify-between">
                                <span class="font-semibold text-md flex items-center gap-2">
                                    <font-awesome-icon icon="fa-solid fa-list" />
                                    {{ $t('datasetPreviewTitle') }}
                                </span>
                                <span class="text-sm text-base-content/70" v-if="datasetPreviewSummaryText">
                                    {{ datasetPreviewSummaryText }}
                                </span>
                            </div>
                            <div v-if="activeDatasetEntries.length" class="overflow-x-auto">
                                <div class="max-h-64 overflow-y-auto">
                                    <table class="table table-zebra table-sm w-full">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>{{ $t('datasetValue') }}</th>
                                                <th>{{ $t('datasetStatus') }}</th>
                                                <th>{{ $t('datasetUpdatedAt') }}</th>
                                                <th>{{ $t('datasetHasError') }}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(entry, idx) in activeDatasetEntries" :key="entry.id">
                                                <td>{{ formatDatasetRowIndex(idx) }}</td>
                                                <td class="break-all">{{ entry.value }}</td>
                                                <td>
                                                    <span v-if="entry.consumed" class="badge badge-sm badge-success">
                                                        {{ $t('datasetConsumedFlag') }}
                                                    </span>
                                                    <span v-else class="badge badge-sm badge-outline">
                                                        {{ $t('datasetAvailableFlag') }}
                                                    </span>
                                                </td>
                                                <td class="text-sm text-base-content/70">
                                                    {{ formatLocalTime(entry.updated_at) }}
                                                </td>
                                                <td :title="entry.last_error || ''">
                                                    <span v-if="entry.last_error" class="badge badge-sm badge-error">
                                                        {{ $t('datasetHasErrorYes') }}
                                                    </span>
                                                    <span v-else class="badge badge-sm badge-success">
                                                        {{ $t('datasetHasErrorNo') }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div class="border-t border-base-200 px-4 py-3 flex flex-wrap items-center gap-3 justify-between"
                                    v-if="activeDatasetPagination.total">
                                    <div class="text-sm text-base-content/70" v-if="datasetPreviewRangeText">
                                        {{ datasetPreviewRangeText }}
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <label class="text-sm font-medium" for="dataset-page-size">
                                            {{ $t('datasetPageSizeLabel') }}
                                        </label>
                                        <select id="dataset-page-size" class="select select-bordered select-sm"
                                            :value="activeDatasetPagination.pageSize" @change="onDatasetPageSizeChange">
                                            <option v-for="size in datasetPageSizeOptions" :key="size" :value="size">
                                                {{ size }}
                                            </option>
                                        </select>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <button class="btn btn-sm"
                                            @click="changeActiveDatasetPage(activeDatasetPagination.currentPage - 1)"
                                            :disabled="activeDatasetPagination.currentPage <= 1">
                                            {{ $t('previous') }}
                                        </button>
                                        <span class="text-sm">
                                            {{ activeDatasetPagination.currentPage }} / {{ activeDatasetPageCount }}
                                        </span>
                                        <button class="btn btn-sm"
                                            @click="changeActiveDatasetPage(activeDatasetPagination.currentPage + 1)"
                                            :disabled="activeDatasetPagination.currentPage >= activeDatasetPageCount">
                                            {{ $t('next') }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="p-4 text-sm text-base-content/70">
                                {{ $t('datasetPreviewEmpty') }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 导入结果：放在导入面板与预览下方，宽度与两列一致 -->
                <div v-if="activeDatasetSummary" class="alert alert-info mt-3 w-full">
                    <font-awesome-icon icon="fa-solid fa-clipboard-check" class="mr-2" />
                    <div>
                        <div class="flex gap-2 text-sm mt-2">
                            <div class="font-semibold">{{ $t('datasetImportSummary') }}:</div>
                            <div>{{ $t('datasetInserted', { count: activeDatasetSummary.inserted }) }}</div>
                            <div>{{ $t('datasetDuplicates', { count: activeDatasetSummary.duplicates }) }}</div>
                            <div>{{ $t('datasetSkipped', { count: activeDatasetSummary.skipped_empty }) }}</div>
                            <div>{{ $t('datasetRemoved', { count: activeDatasetSummary.removed }) }}</div>
                            <div>{{ $t('datasetTruncated', { count: activeDatasetSummary.truncated }) }}</div>
                        </div>
                    </div>
                </div>
                <!-- 
                <div v-if="isUsernameSource" class="space-y-4">
                    <div class="form-control flex items-center gap-4">
                        <label class="font-bold text-md">
                            <span>{{ $t('maxUsersToProcess') }}</span>
                        </label>
                        <div class="flex flex-wrap items-center gap-3">
                            <input type="number" class="input input-bordered input-md w-28" min="0"
                                v-model.number="maxUsersToProcess" />
                        </div>
                        <div class="alert alert-info py-2 px-3 mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="stroke-current shrink-0 w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-md">{{ $t('maxUsersToProcessHelp') }}</span>
                        </div>
                    </div>

                </div> -->

                <!-- <div v-else class="space-y-4">
                    <div class="form-control flex items-center gap-4">
                        <label class="font-bold text-md">
                            <span>{{ $t('maxPostsToProcess') }}</span>
                        </label>
                        <div class="flex flex-wrap items-center gap-3">
                            <input type="number" class="input input-bordered input-md w-28" min="0"
                                v-model.number="maxPostsToProcess" />
                        </div>
                        <div class="alert alert-info py-2 px-3 mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="stroke-current shrink-0 w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-md">{{ $t('maxPostsToProcessHelp') }}</span>
                        </div>
                    </div>
                </div> -->
            </div>
        </div>
    </div>

    <!-- 模块2：用户相关操作 -->
    <template v-if="isUsernameSource">
        <div v-show="activeTab === 'user_actions'" class="card bg-base-100 border border-base-300 mb-4">
            <div class="card-body p-4">
                <h3 class="card-title text-lg mb-4 text-primary">
                    <font-awesome-icon icon="fa-solid fa-users" class="mr-2" />
                    {{ $t('userRelatedActions') }}
                </h3>

                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

                    <!-- 进入用户主页方式（全宽） -->
                    <div class="col-span-1 lg:col-span-2 xl:col-span-3">
                        <div class="form-control flex items-center gap-4">
                            <label class="font-bold text-md">
                                <span>{{ $t('userProfileAccessMethod') }}</span>
                            </label>
                            <div class="flex flex-wrap gap-4">
                                <label class="cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="accessMethod" class="radio radio-primary" value="search"
                                        v-model="accessMethod" />
                                    <span>{{ $t('searchUser') }}</span>
                                </label>
                                <label class="cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="accessMethod" class="radio radio-primary" value="direct"
                                        v-model="accessMethod" />
                                    <span>{{ $t('directOpenProfile') }}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- 关注操作配置 -->
                    <div :class="[
                        'border border-base-200 rounded-lg p-3 transition-all',
                        features.followUsers ? 'bg-success/10 border-success shadow' : 'bg-base-50'
                    ]">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <font-awesome-icon icon="fa-solid fa-user-plus" class="text-success" />
                                <span class="font-semibold">{{ $t('followUsersAction') }}</span>
                            </div>
                            <input type="checkbox" class="toggle toggle-success toggle-md"
                                v-model="features.followUsers" />
                        </div>
                    </div>

                    <!-- 取消关注配置 -->
                    <div :class="[
                        'border border-base-200 rounded-lg p-3 transition-all',
                        features.unfollowUsers ? 'bg-error/10 border-error shadow' : 'bg-base-50'
                    ]">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <font-awesome-icon icon="fa-solid fa-user-minus" class="text-error" />
                                <span class="font-semibold">{{ $t('unfollowUsersAction') }}</span>
                            </div>
                            <input type="checkbox" class="toggle toggle-error toggle-md"
                                v-model="features.unfollowUsers" />
                        </div>
                    </div>

                    <!-- 私信操作配置 -->
                    <div :class="[
                        'border border-base-200 rounded-lg p-3 transition-all space-y-3',
                        features.sendDM ? 'bg-info/10 border-info shadow' : 'bg-base-50'
                    ]">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <font-awesome-icon icon="fa-solid fa-envelope" class="text-info" />
                                <span class="font-semibold">{{ $t('sendDMAction') }}</span>
                            </div>
                            <input type="checkbox" class="toggle toggle-info toggle-md" v-model="features.sendDM" />
                        </div>

                        <div v-if="features.sendDM" class="form-control">
                            <label class="label py-1">
                                <span class="label-text text-md">{{ $t('messageContents') }}</span>
                            </label>
                            <textarea class="textarea textarea-md textarea-bordered h-16"
                                v-model="dmSettings.message_contents"
                                :placeholder="$t('messageContentsTips')"></textarea>

                            <label class="cursor-pointer flex items-center gap-2 mt-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-accent"
                                    v-model="dmSettings.insert_emoji" />
                                <span class="text-md">{{ $t('insertEmoji') }}</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </template>

    <!-- 模块3：帖子相关操作 -->
    <div v-show="activeTab === 'post_actions'" class="card bg-base-100 border border-base-300 mb-4">
        <div class="card-body p-4">
            <h3 class="card-title text-lg mb-4 text-primary">
                <font-awesome-icon icon="fa-solid fa-photo-film" class="mr-2" />
                {{ $t('postRelatedActions') }}
            </h3>

            <!-- 帖子处理设置 -->
            <div class="mb-4 p-3 bg-base-50 rounded-lg border border-base-200">
                <div class="space-y-3 flex flex-row flex-wrap gap-4">
                    <div class="flex items-center gap-4" v-if="isUsernameSource">
                        <span class="text-md font-bold">{{ $t('maxPostsToProcess') }}:</span>
                        <input type="number" class="input input-md input-bordered w-20"
                            v-model.number="postSettings.max_posts_count" min="1" max="50" />
                        <span class="text-md">{{ $t('posts') }}</span>
                        <div class="alert alert-info py-2 px-3 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="stroke-current shrink-0 w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-md">{{ $t('maxPostsPerUser') }}</span>
                        </div>
                    </div>



                    <div class="flex items-center gap-3">
                        <span class="text-md font-bold min-w-[100px]">{{ $t('repeatTimes') }}:</span>
                        <input type="number" class="input input-md input-bordered w-20"
                            v-model.number="postSettings.repeat_times" min="1" max="20" />
                        <span class="text-md">{{ $t('times') }}</span>
                        <div class="alert alert-info py-2 px-3 mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                class="stroke-current shrink-0 w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span class="text-md">{{ helpRepeatTimes() }}</span>
                        </div>
                    </div>


                </div>
                <!-- 观看时长 -->
                <div class="flex w-full items-center gap-2 mt-8 mb-8">
                    <label class="font-bold mr-4">{{ $t('viewDuration') }}:</label>
                    <VueSlider v-model="postSettings.view_durations" :width="500" :min="0" :max="300"
                        :marks="{ 0: '0', 60: '60', 120: '120', 180: '180', 240: '240', 300: '300' + ' ' + $t('second') }" />


                </div>
                <div class="alert alert-info py-2 px-3 mt-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        class="stroke-current shrink-0 w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-md">{{ $t('viewDurationTips') }}</span>
                </div>
            </div>
            <div class="divider my-2"></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <!-- 帖子互动操作 -->
                <div class="border border-base-200 rounded-lg p-4 bg-base-50">
                    <div class="flex items-center mb-4">
                        <input type="checkbox" class="checkbox checkbox-primary mr-3" v-model="features.boostPosts" />
                        <font-awesome-icon icon="fa-solid fa-heart" class="text-error mr-2" />
                        <span class="font-semibold text-lg">{{ $t('postInteractionAction') }}</span>
                    </div>

                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_like" />
                                <span class="text-md">{{ $t('like') }}</span>
                            </label>
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_favorite" />
                                <span class="text-md">{{ $t('favorite') }}</span>
                            </label>
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_repost" />
                                <span class="text-md">{{ $t('repost') }}</span>
                            </label>
                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-primary"
                                    v-model="postSettings.enable_share" />
                                <span class="text-md">{{ $t('share') }}</span>
                            </label>
                        </div>




                    </div>
                </div>

                <!-- 评论操作 -->
                <div class="border border-base-200 rounded-lg p-4 bg-base-50">
                    <div class="flex items-center mb-4">
                        <input type="checkbox" class="checkbox checkbox-primary mr-3" v-model="features.massComment" />
                        <font-awesome-icon icon="fa-solid fa-comment" class="text-warning mr-2" />
                        <span class="font-semibold text-lg">{{ $t('commentAction') }}</span>
                    </div>

                    <div class="space-y-3">
                        <div class="flex flex-row items-center gap-2 mb-3">
                            <label class="font-bold text-md">{{ $t('generateByChatGPT') }}:</label>
                            <input type="checkbox" class="toggle toggle-accent toggle-md"
                                v-model="commentSettings.generate_by_chatgpt" />
                        </div>

                        <div v-if="commentSettings.generate_by_chatgpt" class="space-y-3">
                            <fieldset class="fieldset bg-base-200 border-base-300 rounded-box border p-3">
                                <legend class="fieldset-legend text-md">{{ $t('chatgptSettings') }}</legend>

                                <div class="grid grid-cols-1 gap-2">
                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('url') }}</span>
                                        </label>
                                        <input type="text" class="input input-md w-full"
                                            placeholder="https://api.openai.com/v1/chat/completions"
                                            v-model="commentSettings.chatgpt_settings.url" />
                                    </div>

                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('apiKey') }}</span>
                                        </label>
                                        <input type="password" class="input input-md w-full" placeholder="sk-********"
                                            v-model="commentSettings.chatgpt_settings.api_key" />
                                    </div>

                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('model') }}</span>
                                        </label>
                                        <input type="text" class="input input-md" placeholder="gpt-3.5-turbo"
                                            v-model="commentSettings.chatgpt_settings.model" />
                                    </div>

                                    <div>
                                        <label class="label py-1">
                                            <span class="label-text text-md">{{ $t('systemPrompt') }}</span>
                                        </label>
                                        <textarea class="textarea textarea-md h-12"
                                            :placeholder="$t('systemPromptTips')"
                                            v-model="commentSettings.chatgpt_settings.system_prompt"></textarea>
                                    </div>
                                </div>
                            </fieldset>

                            <div class="flex items-center gap-2">
                                <button class="btn btn-md btn-primary" @click="testChatGPT">{{ $t('testChatGPT')
                                }}</button>
                                <span :class="testResultStyle" class="text-md">{{ testResult }}</span>
                            </div>
                        </div>

                        <div v-else class="space-y-3">
                            <div class="form-control">
                                <label class="label py-1">
                                    <span class="label-text text-md">{{ $t('comments') }}</span>
                                </label>
                                <textarea class="textarea textarea-md textarea-bordered h-16"
                                    v-model="commentSettings.comment_content"
                                    :placeholder="$t('commentContentTips')"></textarea>
                            </div>

                            <div class="flex gap-4">
                                <label class="cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="commentOrder" value="random"
                                        class="radio radio-md radio-primary" v-model="commentSettings.comment_order" />
                                    <span class="text-md">{{ $t('random') }}</span>
                                </label>
                                <label class="cursor-pointer flex items-center gap-2">
                                    <input type="radio" name="commentOrder" value="sequential"
                                        class="radio radio-md radio-primary" v-model="commentSettings.comment_order" />
                                    <span class="text-md">{{ $t('sequential') }}</span>
                                </label>
                            </div>

                            <label class="cursor-pointer flex items-center gap-2">
                                <input type="checkbox" class="checkbox checkbox-md checkbox-accent"
                                    v-model="commentSettings.insert_emoji" />
                                <span class="text-md">{{ $t('insertEmoji') }}</span>
                            </label>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- 模块4：任务间隔设置 -->
    <div v-show="activeTab === 'task_interval'" class="card bg-base-100 border border-base-300">
        <div class="card-body p-4 space-y-4">
            <h3 class="card-title text-lg text-primary">
                <font-awesome-icon icon="fa-solid fa-clock" class="mr-2" />
                {{ $t('taskInterval') }}
            </h3>
            <p class="text-sm text-base-content/70">
                {{ $t('taskIntervalTip') }}
            </p>
            <div class="flex flex-col gap-4">
                <VueSlider v-model="task_interval" :width="500" :min="0" :max="10" :marks="{
                    0: '0',
                    5: '5',
                    10: '10' + ' ' + $t('minute')
                }" />
                <div class="text-sm text-base-content/70">
                    {{ $t('taskInterval') }}: {{ task_interval[0] }} - {{ task_interval[1] }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { open } from '@tauri-apps/api/dialog';
import { readTextFile } from '@tauri-apps/api/fs';
import { superBoostSettings } from '@/utils/settingsManager';
import VueSlider from "vue-3-slider-component";

const DATASET_KEYS = ['usernames', 'post_links'];
const DEFAULT_DATASET_PAGE_SIZE = 50;
const DATASET_PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

const createDefaultPaginationState = () => ({
    currentPage: 1,
    pageSize: DEFAULT_DATASET_PAGE_SIZE,
    total: 0
});

const createInitialPaginationState = () =>
    DATASET_KEYS.reduce((acc, key) => {
        acc[key] = createDefaultPaginationState();
        return acc;
    }, {});

const DEFAULT_DATASET_CONFIG = () => ({
    usernames: { id: 0, strategy: 'shared_pool' },
    post_links: { id: 0, strategy: 'shared_pool' }
});

function cloneDefaultDatasetConfig() {
    return JSON.parse(JSON.stringify(DEFAULT_DATASET_CONFIG()));
}

export default {
    name: 'SuperBoostDialog',
    components: {
        VueSlider
    },
    mixins: [
        superBoostSettings.createVueMixin(
            {
                dataSourceType: 'usernames',
                dataSourceStrategy: 'shared_pool',
                datasetId: 0,
                datasetConfig: cloneDefaultDatasetConfig(),
                accessMethod: 'search',
                maxUsersToProcess: 0,
                maxPostsToProcess: 0,
                features: {
                    followUsers: false,
                    unfollowUsers: false,
                    sendDM: false,
                    boostPosts: false,
                    massComment: false
                },
                followSettings: {
                    boost_type: 'follow'
                },
                dmSettings: {
                    message_contents: '',
                    insert_emoji: false
                },
                postSettings: {
                    max_posts_count: 1,
                    enable_like: false,
                    enable_favorite: false,
                    enable_repost: false,
                    enable_share: false,
                    repeat_times: 1,
                    view_durations: [5, 30]
                },
                commentSettings: {
                    comment_content: '',
                    insert_emoji: false,
                    comment_order: 'random',
                    generate_by_chatgpt: false,
                    chatgpt_settings: {
                        url: 'https://api.openai.com/v1/chat/completions',
                        api_key: '',
                        model: 'gpt-3.5-turbo',
                        system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                    }
                },
                task_interval: [0, 0]
            },
            [
                'dataSourceType',
                'dataSourceStrategy',
                'datasetId',
                'datasetConfig',
                'accessMethod',
                'features',
                'maxUsersToProcess',
                'maxPostsToProcess',
                'followSettings',
                'dmSettings',
                'postSettings',
                'commentSettings',
                'task_interval'
            ]
        )
    ],
    data() {
        return {
            dataSourceType: 'usernames',
            dataSourceStrategy: 'shared_pool',
            datasetId: 0,
            datasetConfig: cloneDefaultDatasetConfig(),
            datasetStats: {
                usernames: null,
                post_links: null
            },
            datasetEntries: {
                usernames: [],
                post_links: []
            },
            datasetInputs: {
                usernames: '',
                post_links: ''
            },
            datasetSummaries: {
                usernames: null,
                post_links: null
            },
            datasetLoading: {
                usernames: false,
                post_links: false
            },
            datasetImporting: {
                usernames: false,
                post_links: false
            },
            datasetPagination: createInitialPaginationState(),
            datasetPageSizeOptions: DATASET_PAGE_SIZE_OPTIONS,
            testResult: '',
            testResultStyle: 'text-gray-500',
            features: {
                followUsers: false,
                unfollowUsers: false,
                sendDM: false,
                boostPosts: false,
                massComment: false
            },
            followSettings: {
                boost_type: 'follow'
            },
            dmSettings: {
                message_contents: '',
                insert_emoji: false
            },
            postSettings: {
                max_posts_count: 1,
                enable_like: false,
                enable_favorite: false,
                enable_repost: false,
                enable_share: false,
                repeat_times: 1,
                view_durations: [5, 30]
            },
            commentSettings: {
                comment_content: '',
                insert_emoji: false,
                comment_order: 'random',
                generate_by_chatgpt: false,
                chatgpt_settings: {
                    url: 'https://api.openai.com/v1/chat/completions',
                    api_key: '',
                    model: 'gpt-3.5-turbo',
                    system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                }
            },
            maxUsersToProcess: 0,
            maxPostsToProcess: 0,
            accessMethod: 'search',
            task_interval: [0, 0],
            activeTab: 'data_source'
        };
    },
    async mounted() {
        await this.ensureSettingsLoaded();
        this.ensureDatasetConfig();

        this.maxUsersToProcess = this.normalizeNonNegativeInt(this.maxUsersToProcess);
        this.maxPostsToProcess = this.normalizeNonNegativeInt(this.maxPostsToProcess);

        if (this.dataSourceType === 'post_links') {
            this.features.followUsers = false;
            this.features.unfollowUsers = false;
            this.features.sendDM = false;
        }

        if (typeof this.features.unfollowUsers === 'undefined') {
            this.features.unfollowUsers = false;
        }

        await this.validateComplexSettingsStructure();
        await this.initializeDatasets();
        this.ensureActiveTab();
    },
    computed: {
        isUsernameSource() {
            return this.dataSourceType === 'usernames';
        },
        isPostLinkSource() {
            return this.dataSourceType === 'post_links';
        },
        availableTabs() {
            const tabs = [
                {
                    key: 'data_source',
                    label: this.$t('dataSourceLabel'),
                    icon: 'fa-solid fa-database'
                }
            ];
            if (this.isUsernameSource) {
                tabs.push({
                    key: 'user_actions',
                    label: this.$t('userRelatedActions'),
                    icon: 'fa-solid fa-users'
                });
            }
            tabs.push({
                key: 'post_actions',
                label: this.$t('postRelatedActions'),
                icon: 'fa-solid fa-photo-film'
            });
            tabs.push({
                key: 'task_interval',
                label: this.$t('taskInterval'),
                icon: 'fa-solid fa-clock'
            });
            return tabs;
        },
        activeDatasetKey() {
            return this.isUsernameSource ? 'usernames' : 'post_links';
        },
        activeDatasetConfig() {
            return this.datasetConfig[this.activeDatasetKey] || { id: 0, strategy: 'shared_pool' };
        },
        activeDatasetStats() {
            return this.datasetStats[this.activeDatasetKey];
        },
        activeDatasetEntries() {
            return this.datasetEntries[this.activeDatasetKey] || [];
        },
        activeDatasetInput: {
            get() {
                return this.datasetInputs[this.activeDatasetKey] || '';
            },
            set(value) {
                this.datasetInputs[this.activeDatasetKey] = value;
            }
        },
        activeDatasetSummary() {
            return this.datasetSummaries[this.activeDatasetKey];
        },
        activeDatasetImporting() {
            return this.datasetImporting[this.activeDatasetKey];
        },
        activeDatasetLoading() {
            return this.datasetLoading[this.activeDatasetKey];
        },
        activeDatasetPagination() {
            return this.datasetPagination[this.activeDatasetKey] || createDefaultPaginationState();
        },
        activeDatasetPageCount() {
            const { total, pageSize } = this.activeDatasetPagination;
            if (!total || !pageSize) {
                return 1;
            }
            return Math.max(1, Math.ceil(total / pageSize));
        },
        activeDatasetPageRange() {
            const { total, pageSize, currentPage } = this.activeDatasetPagination;
            if (!total || !pageSize) {
                return { start: 0, end: 0 };
            }
            const start = (currentPage - 1) * pageSize + 1;
            const end = Math.min(currentPage * pageSize, total);
            return { start, end };
        },
        datasetPreviewSummaryText() {
            const { total, currentPage } = this.activeDatasetPagination;
            if (!total) {
                return '';
            }
            return this.$t('datasetPreviewHint', {
                page: currentPage,
                pages: this.activeDatasetPageCount,
                total
            });
        },
        datasetPreviewRangeText() {
            const { total } = this.activeDatasetPagination;
            if (!total) {
                return '';
            }
            const { start, end } = this.activeDatasetPageRange;
            return this.$t('datasetPreviewRange', { start, end, total });
        },

    },
    watch: {
        dataSourceType(newValue) {
            if (newValue === 'post_links') {
                if (this.features.followUsers) this.features.followUsers = false;
                if (this.features.unfollowUsers) this.features.unfollowUsers = false;
                if (this.features.sendDM) this.features.sendDM = false;
            }
            this.syncActiveDatasetState();
            this.ensureActiveTab();
        },
        availableTabs() {
            this.ensureActiveTab();
        }
    },
    methods: {
        setActiveTab(key) {
            if (this.activeTab === key) {
                return;
            }
            const target = this.availableTabs.find((tab) => tab.key === key);
            if (target) {
                this.activeTab = key;
            }
        },
        ensureActiveTab() {
            const current = this.availableTabs.find((tab) => tab.key === this.activeTab);
            if (!current && this.availableTabs.length) {
                this.activeTab = this.availableTabs[0].key;
            }
        },
        getDatasetPagination(key) {
            if (!this.datasetPagination[key]) {
                this.datasetPagination = {
                    ...this.datasetPagination,
                    [key]: createDefaultPaginationState()
                };
            }
            return this.datasetPagination[key];
        },
        updateDatasetPagination(key, updates = {}) {
            const current = this.getDatasetPagination(key);
            this.datasetPagination = {
                ...this.datasetPagination,
                [key]: {
                    ...current,
                    ...updates
                }
            };
        },
        async changeActiveDatasetPage(page) {
            const key = this.activeDatasetKey;
            const pagination = this.getDatasetPagination(key);
            const totalPages = pagination.total && pagination.pageSize
                ? Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
                : 1;
            const targetPage = Math.min(Math.max(1, page), totalPages);
            if (targetPage === pagination.currentPage) {
                return;
            }
            await this.refreshDataset(key, { page: targetPage, pageSize: pagination.pageSize });
        },
        async changeActiveDatasetPageSize(size) {
            const pageSize = Number(size);
            if (!Number.isFinite(pageSize) || pageSize <= 0) {
                return;
            }
            const key = this.activeDatasetKey;
            const pagination = this.getDatasetPagination(key);
            if (pagination.pageSize === pageSize) {
                return;
            }
            await this.refreshDataset(key, { page: 1, pageSize });
        },
        onDatasetPageSizeChange(event) {
            this.changeActiveDatasetPageSize(event.target.value);
        },
        ensureDatasetConfig() {
            if (!this.datasetConfig || typeof this.datasetConfig !== 'object') {
                this.datasetConfig = cloneDefaultDatasetConfig();
            }
            DATASET_KEYS.forEach((key) => {
                const current = this.datasetConfig[key];
                if (!current || typeof current !== 'object') {
                    this.datasetConfig[key] = { id: 0, strategy: 'shared_pool' };
                    return;
                }
                if (typeof current.id === 'string') {
                    current.id = Number(current.id) || 0;
                }
                if (!['shared_pool', 'consume_once'].includes(current.strategy)) {
                    current.strategy = 'shared_pool';
                }
            });
        },
        normalizeStrategy(strategy) {
            return ['shared_pool', 'consume_once'].includes(strategy) ? strategy : 'shared_pool';
        },
        getDatasetKeyConfig(key) {
            return this.datasetConfig[key] || { id: 0, strategy: 'shared_pool' };
        },
        setDatasetConfig(key, updates) {
            const current = { ...this.getDatasetKeyConfig(key) };
            if (updates.id !== undefined) {
                current.id = Number(updates.id) || 0;
            }
            if (updates.strategy !== undefined) {
                current.strategy = this.normalizeStrategy(updates.strategy);
            }
            this.datasetConfig[key] = current;
            if (this.activeDatasetKey === key) {
                this.datasetId = current.id || 0;
                this.dataSourceStrategy = current.strategy;
            }
        },
        syncActiveDatasetState() {
            this.ensureDatasetConfig();
            const config = this.getDatasetKeyConfig(this.activeDatasetKey);
            this.datasetId = Number(config.id) || 0;
            this.dataSourceStrategy = this.normalizeStrategy(config.strategy);
        },
        async initializeDatasets() {
            this.syncActiveDatasetState();
            await Promise.all(
                DATASET_KEYS.map((key) => this.refreshDataset(key, { silent: true }))
            );
        },
        async refreshDataset(key, { silent = false, page, pageSize } = {}) {
            const config = this.getDatasetKeyConfig(key);
            if (!config.id) {
                this.datasetStats[key] = null;
                this.datasetEntries[key] = [];
                this.updateDatasetPagination(key, { total: 0, currentPage: 1 });
                return;
            }

            const pagination = this.getDatasetPagination(key);
            const effectivePageSize = Number(pageSize) > 0 ? Number(pageSize) : pagination.pageSize || DEFAULT_DATASET_PAGE_SIZE;
            const requestedPage = Number(page) > 0 ? Number(page) : pagination.currentPage || 1;
            const offset = (requestedPage - 1) * effectivePageSize;

            if (!silent) {
                this.datasetLoading[key] = true;
            }
            try {
                const response = await this.$service.get_super_boost_dataset({
                    dataset_id: config.id,
                    limit: effectivePageSize,
                    offset
                });
                if (response.code === 0) {
                    const { stats, entries } = response.data;
                    const entriesList = Array.isArray(entries) ? entries : [];
                    const total = stats && typeof stats.total === 'number' ? stats.total : pagination.total;

                    if (entriesList.length === 0 && total > 0 && requestedPage > 1) {
                        const lastPage = Math.max(1, Math.ceil(total / effectivePageSize));
                        if (lastPage !== requestedPage) {
                            await this.refreshDataset(key, { silent, page: lastPage, pageSize: effectivePageSize });
                            return;
                        }
                    }

                    this.applyDatasetDetail(key, stats, entriesList, {
                        page: requestedPage,
                        pageSize: effectivePageSize,
                        total: typeof total === 'number' ? total : entriesList.length
                    });
                } else {
                    throw new Error(response.error || response.data || 'Unknown error');
                }
            } catch (error) {
                console.error('Failed to load dataset', error);
                this.notify('error', this.$t('datasetLoadFailed'));
            } finally {
                if (!silent) {
                    this.datasetLoading[key] = false;
                }
            }
        },
        applyDatasetDetail(key, stats, entries = [], pagination = {}) {
            if (!stats) {
                return;
            }
            const normalizedStrategy = this.normalizeStrategy(stats.strategy);
            this.setDatasetConfig(key, {
                id: stats.id,
                strategy: normalizedStrategy
            });
            this.datasetStats[key] = {
                ...stats,
                strategy: normalizedStrategy
            };
            this.datasetEntries[key] = entries;
            const currentPagination = this.getDatasetPagination(key);
            const pageSize = Number(pagination.pageSize) > 0 ? Number(pagination.pageSize) : currentPagination.pageSize;
            const total = typeof pagination.total === 'number'
                ? pagination.total
                : (typeof stats.total === 'number' ? stats.total : currentPagination.total);
            const requestedPage = Number(pagination.page) > 0 ? Number(pagination.page) : currentPagination.currentPage;
            const pageCount = pageSize > 0 && total > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
            const currentPage = Math.min(Math.max(1, requestedPage || 1), pageCount);
            this.updateDatasetPagination(key, {
                pageSize,
                total,
                currentPage
            });
            if (this.activeDatasetKey === key) {
                this.datasetId = Number(stats.id) || 0;
                this.dataSourceStrategy = normalizedStrategy;
            }
        },
        async handleDatasetImport(mode) {
            const key = this.activeDatasetKey;
            const config = this.getDatasetKeyConfig(key);
            const raw = (this.activeDatasetInput || '').trim();
            if (!raw) {
                this.notify('warning', this.$t('datasetImportEmpty'));
                return;
            }

            this.datasetImporting[key] = true;
            try {
                const response = await this.$service.import_super_boost_dataset({
                    dataset_id: config.id > 0 ? config.id : null,
                    data_type: key,
                    strategy: this.dataSourceStrategy,
                    raw_text: raw,
                    mode
                });
                if (response.code === 0) {
                    const { dataset, summary } = response.data;
                    const currentPagination = this.getDatasetPagination(key);
                    this.applyDatasetDetail(key, dataset.stats, dataset.entries || [], {
                        page: 1,
                        pageSize: currentPagination.pageSize,
                        total: dataset?.stats?.total
                    });
                    this.datasetSummaries[key] = summary;
                    this.datasetInputs[key] = '';
                    await this.saveComponentSettings();
                    this.notify('success', this.$t('datasetImportSuccess'));
                } else {
                    throw new Error(response.error || response.data || 'Unknown error');
                }
            } catch (error) {
                console.error('Failed to import dataset', error);
                this.notify('error', `${this.$t('datasetImportFailed')}: ${error.message || error}`);
            } finally {
                this.datasetImporting[key] = false;
            }
        },
        async selectDatasetFile() {
            const filePath = await open({
                multiple: false,
                directory: false,
                filters: [{ name: 'Text Files', extensions: ['txt', 'csv'] }]
            });
            if (!filePath) return;
            try {
                const content = await readTextFile(filePath);
                this.activeDatasetInput = content;
                this.notify('success', this.$t('datasetFileLoaded'));
            } catch (error) {
                console.error('Failed to load dataset file', error);
                this.notify('error', this.$t('datasetFileLoadFailed'));
            }
        },
        async clearActiveDataset() {
            const key = this.activeDatasetKey;
            const config = this.getDatasetKeyConfig(key);
            if (!config.id) {
                this.datasetStats[key] = null;
                this.datasetEntries[key] = [];
                this.datasetSummaries[key] = null;
                this.updateDatasetPagination(key, { total: 0, currentPage: 1 });
                return;
            }
            this.datasetLoading[key] = true;
            try {
                const response = await this.$service.clear_super_boost_dataset({ dataset_id: config.id });
                if (response.code === 0) {
                    const { stats, entries } = response.data;
                    const currentPagination = this.getDatasetPagination(key);
                    this.applyDatasetDetail(key, stats, entries || [], {
                        page: 1,
                        pageSize: currentPagination.pageSize,
                        total: stats?.total
                    });
                    this.datasetSummaries[key] = null;
                    await this.saveComponentSettings();
                    this.notify('success', this.$t('datasetCleared'));
                } else {
                    throw new Error(response.error || response.data || 'Unknown error');
                }
            } catch (error) {
                console.error('Failed to clear dataset', error);
                this.notify('error', `${this.$t('datasetClearFailed')}: ${error.message || error}`);
            } finally {
                this.datasetLoading[key] = false;
            }
        },
        async changeActiveDatasetStrategy(strategy) {
            const normalized = this.normalizeStrategy(strategy);
            if (this.dataSourceStrategy === normalized) {
                return;
            }

            const key = this.activeDatasetKey;
            const previous = this.dataSourceStrategy;
            this.dataSourceStrategy = normalized;
            this.setDatasetConfig(key, { strategy: normalized });

            if (this.datasetId > 0) {
                try {
                    const response = await this.$service.update_super_boost_dataset({
                        dataset_id: this.datasetId,
                        strategy: normalized
                    });
                    if (response.code === 0) {
                        const { stats, entries } = response.data;
                        const currentPagination = this.getDatasetPagination(key);
                        this.applyDatasetDetail(key, stats, entries || [], {
                            page: currentPagination.currentPage,
                            pageSize: currentPagination.pageSize,
                            total: stats?.total
                        });
                        await this.saveComponentSettings();
                        this.notify('success', this.$t('datasetStrategyUpdateSuccess'));
                    } else {
                        throw new Error(response.error || response.data || 'Unknown error');
                    }
                } catch (error) {
                    console.error('Failed to update dataset strategy', error);
                    this.dataSourceStrategy = previous;
                    this.setDatasetConfig(key, { strategy: previous });
                    this.notify('error', `${this.$t('datasetStrategyUpdateFailed')}: ${error.message || error}`);
                }
            } else {
                await this.saveComponentSettings();
            }
        },
        formatLocalTime(value) {
            if (!value) return '-';
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) {
                return value;
            }
            return new Intl.DateTimeFormat(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(date);
        },
        formatDatasetRowIndex(idx) {
            const { start } = this.activeDatasetPageRange;
            if (!start) {
                return idx + 1;
            }
            return start + idx;
        },
        helpRepeatTimes() {
            return this.isPostLinkSource ? this.$t('repeatTimesHelpPostLinks') : this.$t('repeatTimesHelp');
        },
        normalizeNonNegativeInt(value) {
            const parsed = Number(value);
            if (!Number.isFinite(parsed) || parsed < 0) {
                return 0;
            }
            return Math.floor(parsed);
        },
        async validateComplexSettingsStructure() {
            let needsReset = false;

            if (typeof this.postSettings === 'string' || !this.postSettings) {
                needsReset = true;
            } else {
                if (typeof this.postSettings.enable_share === 'undefined') {
                    this.postSettings.enable_share = false;
                }
                if (!this.postSettings.repeat_times || this.postSettings.repeat_times < 1) {
                    this.postSettings.repeat_times = 1;
                }
            }

            if (typeof this.commentSettings === 'string' || !this.commentSettings) {
                needsReset = true;
            } else if (!this.commentSettings.chatgpt_settings) {
                this.commentSettings.chatgpt_settings = {
                    url: 'https://api.openai.com/v1/chat/completions',
                    api_key: '',
                    model: 'gpt-3.5-turbo',
                    system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                };
            }

            if (needsReset) {
                console.warn('检测到设置异常，尝试修复...');
                await this.resetSettingsFile();
                console.log('设置已重置并重新加载');
            }
        },
        async resetSettingsFile() {
            try {
                const defaultSettings = {
                    dataSourceType: 'usernames',
                    dataSourceStrategy: 'shared_pool',
                    datasetId: 0,
                    datasetConfig: cloneDefaultDatasetConfig(),
                    accessMethod: 'search',
                    maxUsersToProcess: 0,
                    maxPostsToProcess: 0,
                    features: {
                        followUsers: false,
                        unfollowUsers: false,
                        sendDM: false,
                        boostPosts: false,
                        massComment: false
                    },
                    followSettings: {
                        boost_type: 'follow'
                    },
                    dmSettings: {
                        message_contents: '',
                        insert_emoji: false
                    },
                    postSettings: {
                        max_posts_count: 1,
                        enable_like: false,
                        enable_favorite: false,
                        enable_repost: false,
                        enable_share: false,
                        repeat_times: 1,
                        view_durations: [5, 30]
                    },
                    commentSettings: {
                        comment_content: '',
                        insert_emoji: false,
                        comment_order: 'random',
                        generate_by_chatgpt: false,
                        chatgpt_settings: {
                            url: 'https://api.openai.com/v1/chat/completions',
                            api_key: '',
                            model: 'gpt-3.5-turbo',
                            system_prompt: 'Generate a casual, relevant comment for this TikTok post. Keep it under 50 characters, use emojis, and make it sound natural and engaging.'
                        }
                    },
                    task_interval: [0, 0]
                };

                await superBoostSettings.resetSettings(defaultSettings);
                await this.loadComponentSettings();
                this.datasetInputs = {
                    usernames: '',
                    post_links: ''
                };
                this.datasetSummaries = {
                    usernames: null,
                    post_links: null
                };
                this.datasetStats = {
                    usernames: null,
                    post_links: null
                };
                this.datasetEntries = {
                    usernames: [],
                    post_links: []
                };
                this.datasetPagination = createInitialPaginationState();
                this.ensureDatasetConfig();
                await this.initializeDatasets();
                return true;
            } catch (error) {
                console.error('重置设置文件失败:', error);
                return false;
            }
        },
        async testChatGPT() {
            try {
                this.testResult = 'Testing...';
                this.testResultStyle = 'text-warning';
                const response = await this.$service.chatgpt_completion({
                    url: this.commentSettings.chatgpt_settings.url,
                    api_key: this.commentSettings.chatgpt_settings.api_key,
                    model: this.commentSettings.chatgpt_settings.model,
                    system_prompt: this.commentSettings.chatgpt_settings.system_prompt,
                    post_caption: 'This is a test post caption for TikTok.',
                });
                if (response.code == 0) {
                    this.testResult = response.data;
                    this.testResultStyle = 'text-success';
                } else {
                    this.testResult = response.data;
                    this.testResultStyle = 'text-error';
                }
            } catch (error) {
                this.testResult = 'Error: ' + error.message;
                this.testResultStyle = 'text-error';
            }
        },
        validateSettings() {
            const errors = [];


            if (!this.activeDatasetConfig.id) {
                errors.push(this.$t('selectDatasetRequired'));
            }

            this.maxUsersToProcess = this.normalizeNonNegativeInt(this.maxUsersToProcess);
            this.maxPostsToProcess = this.normalizeNonNegativeInt(this.maxPostsToProcess);

            if (this.features.sendDM && !this.dmSettings.message_contents.trim()) {
                errors.push(this.$t('enterMessageContent'));
            }

            if (this.features.boostPosts && (!Number.isInteger(this.postSettings.repeat_times) || this.postSettings.repeat_times < 1)) {
                this.postSettings.repeat_times = 1;
            }

            if (this.features.massComment && !this.commentSettings.generate_by_chatgpt && !this.commentSettings.comment_content.trim()) {
                errors.push(this.$t('enterCommentContent'));
            }

            return errors;
        },
        async runScript(enable_multi_account = false, rotate_proxy = false) {
            const errors = this.validateSettings();
            if (errors.length > 0) {
                alert(errors.join('\n'));
                return;
            }

            await this.saveComponentSettings();

            await this.$emiter('run_now_by_account', {
                name: 'super_boost_v3',
                args: {
                    enable_multi_account: enable_multi_account,
                    rotate_proxy: rotate_proxy,
                    min_interval: Number(this.task_interval[0]),
                    max_interval: Number(this.task_interval[1]),
                }
            });
        },
        notify(type, message, timeout = 2000) {
            if (this.$emiter) {
                this.$emiter('NOTIFY', { type, message, timeout });
            } else {
                const logger = type === 'error' ? console.error : console.log;
                logger(message);
            }
        }
    }
}
</script>

<style scoped>
/* 移除Tailwind @apply指令，使用标准CSS */
</style>
