const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const missing = requiredEnvVars.filter((name) => !process.env[name]);

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

console.log("Firebase build configuration is present.");
