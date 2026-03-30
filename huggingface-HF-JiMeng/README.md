---
title: Jimeng Free API
emoji: 🎨
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# Jimeng Free API on Hugging Face

这个目录用于把 `jimeng-free-api-all` 直接部署到 Hugging Face Docker Spaces，方式不是源码构建，而是直接拉取现成镜像：

```bash
docker pull wwwzhouhui569/jimeng-free-api-all:latest
```

## 方案说明

- 基础镜像：`wwwzhouhui569/jimeng-free-api-all:latest`
- HF Spaces 对外端口：`7860`
- 项目实际读取端口环境变量：`SERVER_PORT`
- 兼容方式：通过 `CMD` 把 HF 注入的 `PORT` 转成项目使用的 `SERVER_PORT`

当前目录中的 `Dockerfile` 只有一层包装，不重新安装依赖，也不重新构建源码，部署速度比源码构建更快。

## 为什么这样能跑

原项目默认配置端口是 `8000`，但代码里也支持通过环境变量覆盖：

- `src/lib/environment.ts`：读取 `SERVER_PORT`
- `configs/dev/service.yml`：默认端口是 `8000`
- `Dockerfile`：镜像内已经包含 `dist`、`node_modules` 和 Playwright Chromium

所以 HF Spaces 只需要：

1. 使用 Docker SDK
2. 构建本目录中的包装镜像
3. 在启动时把 `PORT` 映射为 `SERVER_PORT`

## 部署步骤

### 方案一：GitHub 自动推送到 HF Space

适合你当前的目标：代码先推到 GitHub，再由 GitHub Actions 自动同步到 Hugging Face Space，最后由 HF 基于本目录的 `Dockerfile` 构建。

1. 在 Hugging Face 新建一个 `Docker` 类型的 Space。
2. 在 GitHub 仓库中添加以下 Secrets：
   - `HF_TOKEN`：你的 Hugging Face Access Token，至少需要对目标 Space 有写权限
   - `HF_SPACE_REPO`：你的 Space 仓库名，格式为 `username/space_name`
3. 将本仓库推送到你的 GitHub 仓库，例如：`https://github.com/Viciy2023/jimeng-free-api-all.git`
4. 推送 `main` 分支后，GitHub Actions 会自动把 `huggingface-HF-JiMeng` 目录同步到 HF Space。
5. HF Space 收到更新后会自动开始构建。
6. 构建完成后访问：`https://<你的-space>.hf.space/ping`

对应工作流文件：

```text
.github/workflows/deploy-hf-space.yml
```

### 方案二：手动上传到 HF Space

1. 在 Hugging Face 新建一个 `Docker` 类型的 Space。
2. 把本目录中的文件上传到 Space 根目录。
3. 等待构建完成。
4. 构建完成后访问：`https://<你的-space>.hf.space/ping`

## 建议的 Space Secrets / Variables

这个项目主要通过请求头里的 `Authorization: Bearer <sessionid>` 使用，不强依赖固定环境变量。

如果你希望在 HF 中补充基础运行参数，可按需设置：

- `SERVER_HOST=0.0.0.0`
- `TZ=Asia/Shanghai`

注意：不要把真实 `sessionid` 直接写进公开仓库文件。

## GitHub Secrets 说明

GitHub Actions 自动部署需要这两个 Secrets：

- `HF_TOKEN`
- `HF_SPACE_REPO`

示例：

```text
HF_SPACE_REPO=your-hf-username/your-space-name
```

`HF_TOKEN` 建议在 Hugging Face 的 Settings -> Access Tokens 中创建，并授予可写 Space 的权限。

## 验证接口

健康检查：

```bash
curl https://<你的-space>.hf.space/ping
```

文生图示例：

```bash
curl -X POST "https://<你的-space>.hf.space/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_sessionid" \
  -d '{
    "model": "jimeng-4.5",
    "prompt": "美丽的日落风景，湖边的小屋",
    "ratio": "16:9",
    "resolution": "2k"
  }'
```

## 已知风险

- 上游镜像标签使用 `latest`，后续上游更新可能改变行为。
- 项目包含 Playwright/Chromium，HF Space 构建时间会比纯 Node 服务更长。
- Seedance 相关能力依赖浏览器代理，HF 环境下是否长期稳定取决于运行资源和上游反爬策略。

## 回滚方式

如果新版本镜像有问题，最稳妥的回滚方式是把 `Dockerfile` 中的基础镜像从：

```dockerfile
FROM wwwzhouhui569/jimeng-free-api-all:latest
```

改成你验证过的固定版本标签，例如：

```dockerfile
FROM wwwzhouhui569/jimeng-free-api-all:v0.8.8
```

前提是 Docker Hub 上存在该标签。
