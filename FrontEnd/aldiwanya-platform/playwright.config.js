import { defineConfig } from "@playwright/test";
import process from "node:process";
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  fullyParallel: false,
  timeout: 45000,
  use: {
    baseURL: "http://127.0.0.1:5099",
    browserName: "chromium",
    acceptDownloads: true,
    ...(process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {}),
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: "list",
  globalSetup: "./e2e/setup.js",
});
