import { defineConfig } from "@playwright/test";
import { config } from "dotenv";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
config({ path: root + ".env" });
const env = {
  ...process.env,
  DB_URL:
    "jdbc:mysql://127.0.0.1:3308/dienmay_test?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
  PORT: "8082",
  API_PROXY_TARGET: "http://127.0.0.1:8082",
  SEED_STAFF_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
};
export default defineConfig({
  testDir: "./test",
  timeout: 120000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5174",
    channel: "msedge",
    headless: true,
    actionTimeout: 15000,
    viewport: { width: 1366, height: 900 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node scripts/start-be.cjs",
      cwd: root,
      env,
      url: "http://127.0.0.1:8082/api/v1/auth/me",
      timeout: 60000,
    },
    {
      command:
        "node ../node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort",
      cwd: root + "FE",
      env,
      url: "http://127.0.0.1:5174",
      timeout: 60000,
    },
  ],
});
