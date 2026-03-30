import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const OUTPUT_DIR = path.resolve("capture-output");
const TARGET_URL = "https://dreamina.capcut.com/ai-tool/generate";

const MATCH_PATTERNS = [
  /passport\/web\/account\/info/i,
  /passport\/account\/info/i,
  /benefit/i,
  /credit/i,
  /generate/i,
  /generate_video/i,
  /batch_generate_video/i,
  /aigc_draft/i,
  /history/i,
  /upload/i,
];

function shouldCapture(url) {
  return MATCH_PATTERNS.some((pattern) => pattern.test(url));
}

function safeName(input) {
  return input.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 120);
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

function findExistingBrowserPath() {
  const candidates = [
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].filter(Boolean);

  return candidates.find((candidate) => fsSync.existsSync(candidate));
}

async function main() {
  await ensureDir(OUTPUT_DIR);

  const executablePath = findExistingBrowserPath();

  const browser = await chromium.launch({
    headless: false,
    ...(executablePath ? { executablePath } : { channel: "chromium" }),
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    locale: "en-US",
  });

  const page = await context.newPage();

  let counter = 0;

  page.on("request", async (request) => {
    const url = request.url();
    if (!shouldCapture(url)) return;

    const id = String(++counter).padStart(3, "0");
    const reqFile = path.join(OUTPUT_DIR, `${id}-${safeName(new URL(url).pathname)}-request.json`);
    await writeJson(reqFile, {
      type: "request",
      url,
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
      timestamp: new Date().toISOString(),
    });
    console.log(`[capture][request] ${request.method()} ${url}`);
  });

  page.on("response", async (response) => {
    const url = response.url();
    if (!shouldCapture(url)) return;

    const id = String(counter).padStart(3, "0");
    const headers = response.headers();
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch (err) {
      bodyText = `[unreadable body] ${String(err)}`;
    }

    const resFile = path.join(OUTPUT_DIR, `${id}-${safeName(new URL(url).pathname)}-response.json`);
    await writeJson(resFile, {
      type: "response",
      url,
      status: response.status(),
      statusText: response.statusText(),
      headers,
      bodyText,
      timestamp: new Date().toISOString(),
    });
    console.log(`[capture][response] ${response.status()} ${url}`);
  });

  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

  console.log("\nDreamina 抓包浏览器已打开。\n");
  console.log("接下来请手动操作：");
  console.log("1. 登录 Dreamina");
  console.log("2. 访问图片生成页并生成一次图片");
  console.log("3. 访问视频生成页并生成一次视频");
  console.log("4. 完成后回到终端按 Enter 结束抓包\n");

  await new Promise((resolve) => {
    process.stdin.resume();
    process.stdin.once("data", () => resolve());
  });

  await context.close();
  await browser.close();

  console.log(`抓包结束，结果已保存到: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
