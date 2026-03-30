---
title: JiMeng Intl API
emoji: 🎨
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# JiMeng Intl API on Hugging Face

这个目录用于把 `jimeng-free-api-intl` 以**源码构建**方式部署到 Hugging Face Docker Spaces。

当前国际版已经包含大量 Dreamina 专属改动，因此**不再适合继续拉取官方现成镜像**，而是应该由 HF 直接基于你的国际版源码构建镜像。

## 方案说明

- 构建方式：HF 基于当前目录源码构建镜像
- HF Spaces 对外端口：`7860`
- 项目实际读取端口环境变量：`SERVER_PORT`
- 兼容方式：通过 `CMD` 把 HF 注入的 `PORT` 转成项目使用的 `SERVER_PORT`
- 国际版上游：`dreamina.capcut.com` / `mweb-api-sg.capcut.com` / `commerce-api-sg.capcut.com`
- 调用方式：OpenAI 兼容，调用端只需要 `BASE_URL + API_KEY`

当前目录中的 `Dockerfile` 只有一层包装，不重新安装依赖，也不重新构建源码，部署速度比源码构建更快。

## 为什么这样能跑

项目默认配置端口是 `8000`，但代码里也支持通过环境变量覆盖：

- `src/lib/environment.ts`：读取 `SERVER_PORT`
- `configs/dev/service.yml`：默认端口是 `8000`
- `huggingface-HF-JiMeng/Dockerfile`：会在 HF 上直接构建国际版源码并安装 Playwright Chromium

所以 HF Spaces 只需要：

1. 使用 Docker SDK
2. 构建本目录中的源码镜像
3. 在启动时把 `PORT` 映射为 `SERVER_PORT`

## 部署步骤

### 方案一：GitHub 自动推送到 HF Space

适合你当前的目标：代码先推到 GitHub，再由 GitHub Actions 自动同步到 Hugging Face Space，最后由 HF 基于本目录的 `Dockerfile` 构建。

1. 在 Hugging Face 新建一个 `Docker` 类型的 Space。
2. 在 GitHub 仓库中添加以下 Secrets：
   - `HF_TOKEN`：你的 Hugging Face Access Token，至少需要对目标 Space 有写权限
   - `HF_SPACE_REPO`：你的 Space 仓库名，格式为 `username/space_name`
3. 将本仓库推送到你的 GitHub 仓库：`https://github.com/Viciy2023/JiMengIntl.git`
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

国际版建议通过完整 Cookie Header 注入账号，并使用固定 API Key 对外提供服务。

### HF Secrets（敏感信息）

- `DREAMINA_API_KEY`
中文注释：对外提供给调用方的统一 API Key，例如 `sk-51205420185fadfaf`

- `DREAMINA_COOKIE_HEADER`
中文注释：单账号完整国际版 Cookie Header

- `DREAMINA_COOKIE_HEADERS`
中文注释：多账号完整国际版 Cookie Header 数组，推荐使用这个字段做随机轮询

### HF Variables（普通运行配置）

- `UPSTREAM_PROVIDER=dreamina-intl`
中文注释：强制使用国际版 Dreamina 上游

- `SERVER_HOST=0.0.0.0`
中文注释：让容器监听外部地址

- `TZ=Asia/Shanghai`
中文注释：服务日志时区

- `DREAMINA_PAGE_BASE_URL=https://dreamina.capcut.com`
中文注释：Dreamina 页面域名

- `DREAMINA_MWEB_API_BASE_URL=https://mweb-api-sg.capcut.com`
中文注释：Dreamina 图片/视频生成与历史查询域名

- `DREAMINA_COMMERCE_API_BASE_URL=https://commerce-api-sg.capcut.com`
中文注释：Dreamina 积分/权益域名

- `DREAMINA_REGION=HK`
中文注释：当前抓包验证可用的区域代码

- `DREAMINA_LAN=en`
中文注释：接口头中的语言标识

- `DREAMINA_LOC=HK`
中文注释：接口头中的位置标识

- `DREAMINA_ACCEPT_LANGUAGE=en-US`
中文注释：接口头中的 Accept-Language

注意：不要把真实 Cookie Header 或 sessionid 直接写进公开仓库文件。

## GitHub Secrets 说明

GitHub Actions 自动部署需要这两个 Secrets：

- `HF_TOKEN`
- `HF_SPACE_REPO`

示例：

```text
HF_SPACE_REPO=DanielleNguyen/JiMengIntl
```

`HF_TOKEN` 建议在 Hugging Face 的 Settings -> Access Tokens 中创建，并授予可写 Space 的权限。

## 调用方式

部署成功后，调用方只需要：

```text
BASE_URL=https://<your-intl-space>.hf.space/v1
API_KEY=sk-51205420185fadfaf
```

服务端会在每次请求时随机选择一条完整国际版 Cookie Header 使用。

## 验证接口

健康检查：

```bash
curl https://<你的-space>.hf.space/ping
```

国际版文生图示例：

```bash
curl -X POST "https://<你的-space>.hf.space/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-51205420185fadfaf" \
  -d '{
    "model": "jimeng-4.6",
    "prompt": "a beautiful sunset by a lake house",
    "ratio": "16:9",
    "resolution": "2k"
  }'
```

国际版文生视频示例：

```bash
curl -X POST "https://<your-intl-space>.hf.space/v1/videos/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-51205420185fadfaf" \
  -d '{
    "model": "dreamina_ic_generate_video_model_vgfm_3.0_fast",
    "prompt": "a cat dancing",
    "ratio": "16:9",
    "resolution": "720p",
    "duration": 5
  }'
```

## 已知风险

- 上游镜像标签使用 `latest`，后续上游更新可能改变行为。
- 项目包含 Playwright/Chromium，HF Space 构建时间会比纯 Node 服务更长。
- 国际版视频/Seedance 仍依赖浏览器代理和前端签名链，HF 环境稳定性取决于运行资源和上游反爬策略。
- 源码构建时间会比拉现成镜像更长，但这是国际版保持最新逻辑的必要代价。

## 回滚方式

如果国际版新改动有问题，最稳妥的回滚方式是：

1. 回滚 GitHub 仓库 `JiMengIntl` 中的源码提交
2. 重新 push 到 `main`
3. GitHub Actions 会再次同步到 HF Space 并触发重建
