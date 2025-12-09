# API TESTING COMMAND EXAMPLE

## Post Video Task

```shell
curl -X POST http://localhost:50809/api/v1/task \
  -H "Content-Type: application/json" \
  -d '{
    "serials": ["16091FDD40050N"],
    "script_name": "post",
    "script_config": {
      "content_type": 0,
      "captions": "看看我的新视频！#热门 #推荐",
      "material_list": [
        "C:/Videos/video1.mp4"
      ],
      "upload_wait_time": 60
    }
  }'
```

## Follow User Task

```shell
curl -X POST http://localhost:50809/api/v1/task \
  -H "Content-Type: application/json" \
  -d '{
    "serials": ["16091FDD40050N"],
    "script_name": "follow",
    "script_config": {
      "target_users": ["@tikmatrix001"],
      "access_method": "direct"
    }
  }'
```

## Unfollow User Task

```shell
curl -X POST http://localhost:50809/api/v1/task \
  -H "Content-Type: application/json" \
  -d '{
    "serials": ["16091FDD40050N"],
    "script_name": "unfollow",
    "script_config": {
      "target_users": ["@tikmatrix001"],
      "access_method": "direct"
    }
  }'
```
