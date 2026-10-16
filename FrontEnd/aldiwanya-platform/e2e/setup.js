import { fork } from "node:child_process";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
// IPC shutdown works on Windows and lets the server remove only its disposable DB.
export default async function setup() {
  const child = fork(
    fileURLToPath(
      new URL("../../../BackEnd/test/e2e-server.js", import.meta.url),
    ),
    [],
    {
      cwd: fileURLToPath(new URL("../../../BackEnd/", import.meta.url)),
      windowsHide: true,
      env: {
        ...process.env,
        NODE_ENV: "test",
        PORT: "5099",
        DB_URI:
          "mongodb://127.0.0.1:27028/aldiwanya_e2e_" +
          randomBytes(8).toString("hex"),
        JWT_SECRET: randomBytes(48).toString("hex"),
        SALT: "4",
        FRONTEND_URL: "http://127.0.0.1:5099",
        SERVE_FRONTEND: "true",
        UPLOAD_DIR: "uploads-e2e",
        ADMIN_EMAIL: "admin@example.com",
        ADMIN_PASSWORD: "AldiwanyaLocal!2026",
        ADMIN_PHONE: "+96550000009",
      },
      stdio: ["ignore", "inherit", "inherit", "ipc"],
    },
  );
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.send("stop");
      reject(new Error("Test server startup timed out"));
    }, 30000);
    child.once("message", (message) => {
      if (message === "ready") {
        clearTimeout(timer);
        resolve();
      }
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(new Error("Test server exited: " + code));
    });
  });
  return () =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Test server cleanup timed out")),
        15000,
      );
      child.once("exit", (code) => {
        clearTimeout(timer);
        code === 0 ? resolve() : reject(new Error("Test cleanup failed"));
      });
      child.send("stop");
    });
}
