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
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  reporter: "list",
  webServer: {
    command: "node src/DB/seed.js && node server.js",
    cwd: "../../BackEnd",
    url: "http://127.0.0.1:5099/health",
    timeout: 30000,
    reuseExistingServer: false,
    env: {
      ...process.env,
      NODE_ENV: "test",
      PORT: "5099",
      DB_URI: "mongodb://127.0.0.1:27028/aldiwanya_e2e_ci",
      JWT_SECRET: "isolated-ci-test-secret-not-used-outside-this-run-2026",
      SALT: "4",
      FRONTEND_URL: "http://127.0.0.1:5099",
      SERVE_FRONTEND: "true",
      UPLOAD_DIR: "uploads-e2e",
      ADMIN_EMAIL: "admin@example.com",
      ADMIN_PASSWORD: "AldiwanyaLocal!2026",
      ADMIN_PHONE: "+96550000009",
    },
  },
});
