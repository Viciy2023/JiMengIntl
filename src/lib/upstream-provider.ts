import environment from "@/lib/environment.ts";

export type UpstreamProviderName = "jimeng-cn" | "dreamina-intl";

export interface UpstreamProviderConfig {
  name: UpstreamProviderName;
  modelName: string;
  assistantId: number;
  pageBaseUrl: string;
  webApiBaseUrl: string;
  commerceApiBaseUrl: string;
  baseUrl: string;
  origin: string;
  referer: string;
  imageReferer: string;
  generateImageReferer: string;
  generateVideoReferer: string;
  cookieDomain: string;
  region: string;
  lan: string;
  loc: string;
  acceptLanguage: string;
  storeRegionKey: string;
  storeRegionValue: string;
  storeRegionSrcKey: string;
  storeRegionSrcValue: string;
  browserEntryUrl: string;
  browserScriptWhitelistDomains: string[];
  browserLocale: string;
  userInfoPath: string;
  userInfoMethod: "GET" | "POST";
  userInfoParams?: Record<string, any>;
  userInfoFallbackPaths?: Array<{ path: string; method: "GET" | "POST"; params?: Record<string, any> }>;
  creditPath?: string;
  creditMethod?: "GET" | "POST";
  creditFallbackPaths?: Array<{ path: string; method: "GET" | "POST"; params?: Record<string, any> }>;
  imageGeneratePath: string;
  videoGeneratePath: string;
  imageAwsRegion: string;
  vodAwsRegion: string;
  extraCookies: Record<string, string>;
}

function envOrDefault(key: string, fallback: string) {
  return environment.envVars[key] || fallback;
}

const providers: Record<UpstreamProviderName, UpstreamProviderConfig> = {
  "jimeng-cn": {
    name: "jimeng-cn",
    modelName: "jimeng",
    assistantId: 513695,
    pageBaseUrl: "https://jimeng.jianying.com",
    webApiBaseUrl: "https://jimeng.jianying.com",
    commerceApiBaseUrl: "https://jimeng.jianying.com",
    baseUrl: "https://jimeng.jianying.com",
    origin: "https://jimeng.jianying.com",
    referer: "https://jimeng.jianying.com",
    imageReferer: "https://jimeng.jianying.com/ai-tool/image/generate",
    generateImageReferer: "https://jimeng.jianying.com/ai-tool/generate",
    generateVideoReferer: "https://jimeng.jianying.com/ai-tool/video/generate",
    cookieDomain: ".jianying.com",
    region: "cn",
    lan: "zh-Hans",
    loc: "cn",
    acceptLanguage: "zh-CN,zh;q=0.9",
    storeRegionKey: "store-region",
    storeRegionValue: "cn-gd",
    storeRegionSrcKey: "store-region-src",
    storeRegionSrcValue: "uid",
    browserEntryUrl: "https://jimeng.jianying.com",
    browserScriptWhitelistDomains: ["vlabstatic.com", "bytescm.com", "jianying.com", "byteimg.com"],
    browserLocale: "zh-CN",
    userInfoPath: "/passport/account/info/v2",
    userInfoMethod: "POST",
    userInfoParams: {
      account_sdk_source: "web",
    },
    userInfoFallbackPaths: [],
    creditPath: "/commerce/v1/benefits/user_credit",
    creditMethod: "POST",
    creditFallbackPaths: [],
    imageGeneratePath: "/mweb/v1/aigc_draft/generate",
    videoGeneratePath: "/mweb/v1/aigc_draft/generate",
    imageAwsRegion: "cn-north-1",
    vodAwsRegion: "cn-north-1",
    extraCookies: {},
  },
  "dreamina-intl": {
    name: "dreamina-intl",
    modelName: "dreamina",
    assistantId: 513641,
    pageBaseUrl: envOrDefault("DREAMINA_PAGE_BASE_URL", "https://dreamina.capcut.com"),
    webApiBaseUrl: envOrDefault("DREAMINA_WEB_API_BASE_URL", "https://edit-api-sg.capcut.com"),
    mwebApiBaseUrl: envOrDefault("DREAMINA_MWEB_API_BASE_URL", "https://mweb-api-sg.capcut.com"),
    commerceApiBaseUrl: envOrDefault("DREAMINA_COMMERCE_API_BASE_URL", "https://commerce-api-sg.capcut.com"),
    baseUrl: "https://dreamina.capcut.com",
    origin: "https://dreamina.capcut.com",
    referer: "https://dreamina.capcut.com",
    imageReferer: "https://dreamina.capcut.com",
    generateImageReferer: "https://dreamina.capcut.com",
    generateVideoReferer: "https://dreamina.capcut.com",
    cookieDomain: ".capcut.com",
    region: envOrDefault("DREAMINA_REGION", "HK"),
    lan: envOrDefault("DREAMINA_LAN", "en"),
    loc: envOrDefault("DREAMINA_LOC", "HK"),
    acceptLanguage: envOrDefault("DREAMINA_ACCEPT_LANGUAGE", "en-US"),
    storeRegionKey: "store-country-code",
    storeRegionValue: envOrDefault("DREAMINA_STORE_COUNTRY_CODE", "hk"),
    storeRegionSrcKey: "store-country-code-src",
    storeRegionSrcValue: "uid",
    browserEntryUrl: "https://dreamina.capcut.com",
    browserScriptWhitelistDomains: ["capcut.com", "byteimg.com", "bytescm.com", "bytedance.com", "ibytedtos.com"],
    browserLocale: "zh-Hant-TW",
    userInfoPath: envOrDefault("DREAMINA_USER_INFO_PATH", "/passport/web/account/info/"),
    userInfoMethod: (envOrDefault("DREAMINA_USER_INFO_METHOD", "GET") as "GET" | "POST"),
    userInfoFallbackPaths: [
      { path: "/passport/web/account/info/", method: "POST" },
      { path: "/passport/account/info/v2", method: "GET" },
      { path: "/passport/account/info/v2/", method: "POST", params: { account_sdk_source: "web" } },
      { path: "/user/web/user_info", method: "GET" },
      { path: "/lv/v1/user/user_info", method: "GET" },
      { path: "/lv/v1/user/web/user_info", method: "GET" },
    ],
    creditPath: envOrDefault("DREAMINA_CREDIT_PATH", "/commerce/v1/benefits/user_credit"),
    creditMethod: (envOrDefault("DREAMINA_CREDIT_METHOD", "POST") as "GET" | "POST"),
    creditFallbackPaths: [
      { path: "/commerce/v1/benefits/user_benefits", method: "POST" },
      { path: "/commerce/v1/benefits/user_benefits", method: "GET" },
      { path: "/lv/v1/benefits/user_credit", method: "POST" },
      { path: "/lv/v1/user/web/user_credit", method: "POST" },
      { path: "/commerce/v1/benefits/user_credit", method: "POST" },
      { path: "/commerce/v1/benefits/user_credit", method: "GET" },
    ],
    imageGeneratePath: envOrDefault("DREAMINA_IMAGE_GENERATE_PATH", "/mweb/v1/aigc_draft/generate"),
    videoGeneratePath: envOrDefault("DREAMINA_VIDEO_GENERATE_PATH", "/mweb/v1/aigc_draft/generate"),
    imageAwsRegion: envOrDefault("DREAMINA_IMAGE_AWS_REGION", "cn-north-1"),
    vodAwsRegion: envOrDefault("DREAMINA_VOD_AWS_REGION", "cn-north-1"),
    extraCookies: {},
  },
};

export function getUpstreamProvider(): UpstreamProviderConfig {
  const provider = (environment.envVars.UPSTREAM_PROVIDER || "dreamina-intl") as UpstreamProviderName;
  return providers[provider] || providers["dreamina-intl"];
}

export default getUpstreamProvider();
