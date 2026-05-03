import { existsSync, readFileSync } from "node:fs";

for (const envFile of [".env.local", ".env"]) {
  if (!existsSync(envFile)) continue;

  const lines = readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const [key, ...valueParts] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missing = requiredEnvVars.filter((name) => !process.env[name]);
const placeholderValues = new Set([
  "your_api_key",
  "your_sender_id",
  "your_app_id",
]);
const placeholders = requiredEnvVars.filter((name) =>
  placeholderValues.has(process.env[name])
);

if (missing.length > 0) {
  console.error("Missing required Firebase build variables:");
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  console.error(
    "Set these in .env.local for local builds, GitHub Actions secrets, or Jenkins credentials."
  );
  process.exit(1);
}

if (placeholders.length > 0) {
  console.error("Replace placeholder Firebase build variables before building:");
  for (const name of placeholders) {
    console.error(`- ${name}`);
  }
  process.exit(1);
}

console.log("Firebase build configuration is present.");
