import "dotenv/config";
import { paymentConfig, paymentConfigurationIssues } from "./payment.config.js";

// Offline configuration check: no provider calls, database writes or secret values.
const config = paymentConfig();
const issues = paymentConfigurationIssues();
console.log(
  JSON.stringify(
    {
      provider: "myfatoorah",
      sandbox: config.sandbox,
      currency: config.currency,
      checkoutEnabled: config.enabled,
      configurationReady: issues.length === 0,
      missingOrInvalidVariables: issues,
      nextStep: issues.length
        ? "Complete the listed variables in BackEnd/.env."
        : "Verify database indexes and run a sandbox payment with public HTTPS callbacks before going live.",
    },
    null,
    2,
  ),
);
if (issues.length) process.exitCode = 1;
