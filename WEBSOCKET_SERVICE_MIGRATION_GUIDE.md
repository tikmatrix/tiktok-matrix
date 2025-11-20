# WebSocket Service Migration Guide

## 概述

我们已经从 `service/index.js` 中移除了所有 WebSocket 服务的封装层。现在组件应该直接导入和使用 WebSocket 服务。

## 迁移原因

1. **减少不必要的封装层**：service 层的封装没有添加额外的业务逻辑，只是简单的转发
2. **提高代码清晰度**：直接导入让代码依赖关系更清晰
3. **更好的类型提示**：直接使用 WebSocket 服务可以获得更好的 IDE 支持

## 迁移方法

### 之前（通过 service 层）

```javascript
import { 
  script, 
  stop_task, 
  get_tags,
  clear_gallery 
} from '@/service'

export default {
  methods: {
    async runScript() {
      await script({ serial: 'xxx', script: 'xxx' })
    },
    async stopTask() {
      await stop_task({ serial: 'xxx' })
    }
  }
}
```

### 之后（直接使用 WebSocket 服务）

```javascript
import { ws_script, ws_stop_task } from '@/service/scriptWebSocketService'
import { ws_get_tags } from '@/service/tagWebSocketService'
import { ws_clear_gallery } from '@/service/deviceControlWebSocketService'

export default {
  methods: {
    async runScript() {
      await ws_script({ serial: 'xxx', script: 'xxx' })
    },
    async stopTask() {
      await ws_stop_task({ serial: 'xxx' })
    }
  }
}
```

## WebSocket 服务模块映射

### scriptWebSocketService

| 旧函数 (service/index.js) | 新函数 (scriptWebSocketService) |
|---------------------------|----------------------------------|
| `script()` | `ws_script()` |
| `stop_task()` | `ws_stop_task()` |
| `super_marketing_run_now()` | `ws_super_marketing_run_now()` |
| `run_now_by_account()` | `ws_run_now_by_account()` |
| `message_now()` | `ws_message_now()` |
| `comment_now()` | `ws_comment_now()` |
| `follow_now()` | `ws_follow_now()` |
| `scrape_now()` | `ws_scrape_now()` |

**导入示例：**

```javascript
import { 
  ws_script, 
  ws_stop_task,
  ws_super_marketing_run_now,
  ws_run_now_by_account,
  ws_message_now,
  ws_comment_now,
  ws_follow_now,
  ws_scrape_now
} from '@/service/scriptWebSocketService'
```

### deviceControlWebSocketService

| 旧函数 (service/index.js) | 新函数 (deviceControlWebSocketService) |
|---------------------------|----------------------------------------|
| `adb_command()` | `ws_adb_command()` |
| `scan_tcp()` | `ws_scan_tcp()` |
| `scan_tcp_details()` | `ws_scan_tcp_details()` |
| `move_to_group()` | `ws_move_to_group()` |
| `set_text()` | `ws_set_text()` |
| `reset_all_index()` | `ws_reset_all_index()` |
| `clear_gallery()` | `ws_clear_gallery()` |
| `read_clipboard()` | `ws_read_clipboard()` |
| `index()` | `ws_get_index()` |
| `open_tiktok()` | `ws_open_tiktok()` |
| `stop_tiktok()` | `ws_stop_tiktok()` |
| `detectCurrentPackage()` | `ws_detect_current_package()` |

**导入示例：**

```javascript
import { 
  ws_adb_command,
  ws_scan_tcp,
  ws_move_to_group,
  ws_clear_gallery,
  ws_read_clipboard,
  ws_get_index,
  ws_open_tiktok,
  ws_stop_tiktok,
  ws_detect_current_package
} from '@/service/deviceControlWebSocketService'
```

### tagWebSocketService

| 旧函数 (service/index.js) | 新函数 (tagWebSocketService) |
|---------------------------|------------------------------|
| `get_tags()` | `ws_get_tags()` |
| `add_tag()` | `ws_add_tag()` |
| `update_tag()` | `ws_update_tag()` |
| `delete_tag()` | `ws_delete_tag()` |
| `get_material_tags()` | `ws_get_material_tags()` |
| `add_tags_to_material()` | `ws_add_tags_to_material()` |
| `add_tag_to_material()` | `ws_add_tag_to_material()` |
| `remove_tag_from_material()` | `ws_remove_tag_from_material()` |
| `clear_material_tags()` | `ws_clear_material_tags()` |
| `get_material_with_tags()` | `ws_get_material_with_tags()` |
| `list_all_materials_with_tags()` | `ws_list_all_materials_with_tags()` |
| `get_materials_by_tag()` | `ws_get_materials_by_tag()` |
| `get_materials_with_tags_by_tag()` | `ws_get_materials_with_tags_by_tag()` |

**导入示例：**

```javascript
import { 
  ws_get_tags,
  ws_add_tag,
  ws_update_tag,
  ws_delete_tag,
  ws_get_material_tags,
  ws_add_tags_to_material,
  ws_remove_tag_from_material
} from '@/service/tagWebSocketService'
```

### utilsWebSocketService

| 旧函数 (service/index.js) | 新函数 (utilsWebSocketService) |
|---------------------------|--------------------------------|
| `upload_videos()` | `ws_upload_videos()` |
| `upload_video()` | `ws_upload_video()` |
| `init()` | `ws_init()` |
| `get_group_config_file()` | `ws_get_group_config_file()` |
| `save_group_config_file()` | `ws_save_group_config_file()` |
| `test_proxy_rotation()` | `ws_test_proxy_rotation()` |
| `get_analytics()` | `ws_get_analytics()` |
| `get_menus()` | `ws_get_menus()` |
| `chatgpt_completion()` | `ws_chatgpt_completion()` |
| `get_follow_record()` | `ws_get_follow_record()` |
| `clear_follow_records()` | `ws_clear_follow_records()` |
| `report_distributor_install()` | `ws_report_distributor_install()` |

**导入示例：**

```javascript
import { 
  ws_upload_videos,
  ws_upload_video,
  ws_init,
  ws_get_group_config_file,
  ws_save_group_config_file,
  ws_test_proxy_rotation,
  ws_get_analytics,
  ws_get_menus,
  ws_chatgpt_completion
} from '@/service/utilsWebSocketService'
```

## HTTP API 服务（保持不变）

以下 HTTP API 函数仍然保留在 `service/index.js` 中，可以继续使用：

- `tiktok_query()`
- `list_super_marketing_datasets()`
- `import_super_marketing_dataset()`
- `get_super_marketing_dataset()`
- `clear_super_marketing_dataset()`
- `update_super_marketing_dataset()`
- `update_super_marketing_dataset_entry()`
- `delete_super_marketing_dataset_entry()`
- `get_stripe_portal_url()`
- `get_stripe_checkout_url()`
- `get_alipay_checkout_url()`
- `get_stripe_price_table_info()`
- `get_plans()`
- `add_plan()`
- `update_plan()`
- `delete_plan()`
- Support 相关的所有函数

这些函数可以继续从 `@/service` 导入使用。

## 批量迁移建议

1. **按模块迁移**：先迁移一个功能模块（如标签管理），确保功能正常后再迁移下一个
2. **使用全局搜索**：使用 IDE 的全局搜索功能找到所有使用旧函数的地方
3. **测试充分**：每次迁移后进行功能测试，确保没有遗漏

## 常见问题

### Q: 为什么函数名要加 `ws_` 前缀？

A: 为了明确表示这是 WebSocket 调用，与 HTTP API 调用区分开来。

### Q: 如果我同时需要 HTTP 和 WebSocket 服务怎么办？

A: 可以同时导入两者：

```javascript
import { get_plans, add_plan } from '@/service'
import { ws_script, ws_stop_task } from '@/service/scriptWebSocketService'
```

### Q: 迁移会影响现有功能吗？

A: 不会。WebSocket 服务的实现没有变化，只是改变了导入方式。

## 迁移进度追踪

可以使用以下命令查找需要迁移的文件：

```bash
# 查找所有从 service/index.js 导入已移除函数的文件
grep -r "from '@/service'" src/ | grep -E "(script|stop_task|get_tags|clear_gallery|upload_video|init|adb_command)"
```

## 注意事项

1. ⚠️ `service/index.js` 中的注释列出了所有被移除的函数及其对应的新函数
2. ⚠️ 确保组件中的错误处理逻辑仍然正常工作
3. ⚠️ WebSocket 连接状态管理需要在组件层面处理

## 示例：完整的组件迁移

### 迁移前

```vue
<script>
import { 
  script, 
  stop_task, 
  clear_gallery,
  get_tags,
  add_tag 
} from '@/service'

export default {
  data() {
    return {
      tags: []
    }
  },
  async mounted() {
    this.tags = await get_tags()
  },
  methods: {
    async runScript(serial) {
      await script({ serial, script: 'test' })
    },
    async stopTask(serial) {
      await stop_task({ serial })
    },
    async clearGallery(serial) {
      await clear_gallery({ serial })
    },
    async createTag(name) {
      await add_tag({ name })
      this.tags = await get_tags()
    }
  }
}
</script>
```

### 迁移后

```vue
<script>
import { ws_script, ws_stop_task } from '@/service/scriptWebSocketService'
import { ws_clear_gallery } from '@/service/deviceControlWebSocketService'
import { ws_get_tags, ws_add_tag } from '@/service/tagWebSocketService'

export default {
  data() {
    return {
      tags: []
    }
  },
  async mounted() {
    this.tags = await ws_get_tags()
  },
  methods: {
    async runScript(serial) {
      await ws_script({ serial, script: 'test' })
    },
    async stopTask(serial) {
      await ws_stop_task({ serial })
    },
    async clearGallery(serial) {
      await ws_clear_gallery({ serial })
    },
    async createTag(name) {
      await ws_add_tag({ name })
      this.tags = await ws_get_tags()
    }
  }
}
</script>
```

## 总结

这次重构的目标是简化代码结构，让依赖关系更清晰。虽然需要更新组件的导入语句，但这是一次性的工作，之后维护会更容易。
