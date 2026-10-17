const currencies = {
  KWD: 3,
  BHD: 3,
  OMR: 3,
  JOD: 3,
  EGP: 2,
  SAR: 2,
  AED: 2,
  QAR: 2,
  USD: 2,
  EUR: 2,
};
export const myFatoorahOrigins = [
  "https://apitest.myfatoorah.com",
  "https://api.myfatoorah.com",
  "https://api-sa.myfatoorah.com",
  "https://api-ae.myfatoorah.com",
];
export const currencyDigits = (currency) => currencies[currency];
export const minorAmount = (value, currency) => {
  const n = Number(value),
    digits = currencyDigits(currency);
  if (digits === undefined || !Number.isFinite(n)) return NaN;
  const scaled = n * 10 ** digits,
    rounded = Math.round(scaled);
  return Number.isSafeInteger(rounded) && Math.abs(scaled - rounded) < 0.00001
    ? rounded
    : NaN;
};
function publicHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      url.pathname === "/" &&
      !["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname)
      ? url.origin
      : null;
  } catch {
    return null;
  }
}
export function paymentConfig(env = process.env) {
  const currency = (env.MYFATOORAH_BASE_CURRENCY || "KWD").toUpperCase();
  const frontendOrigin = publicHttps(env.PAYMENT_FRONTEND_URL);
  const apiOrigin = publicHttps(env.PAYMENT_PUBLIC_API_URL);
  return {
    enabled:
      env.PAYMENTS_ENABLED === "true" &&
      paymentConfigurationIssues(env).length === 0,
    configured: Boolean(env.MYFATOORAH_API_KEY),
    currency,
    frontendOrigin,
    apiOrigin,
    webhookSecret: env.MYFATOORAH_WEBHOOK_SECRET,
    sandbox:
      (env.MYFATOORAH_BASE_URL || "https://apitest.myfatoorah.com") ===
      "https://apitest.myfatoorah.com",
  };
}
// Names only: safe for a CLI report without leaking credentials or configured URLs.
export function paymentConfigurationIssues(env = process.env) {
  const issues = [];
  if (!env.MYFATOORAH_API_KEY?.trim()) issues.push("MYFATOORAH_API_KEY");
  if (!env.MYFATOORAH_WEBHOOK_SECRET?.trim())
    issues.push("MYFATOORAH_WEBHOOK_SECRET");
  const baseUrl = env.MYFATOORAH_BASE_URL || myFatoorahOrigins[0];
  if (!myFatoorahOrigins.includes(baseUrl)) issues.push("MYFATOORAH_BASE_URL");
  const currency = (env.MYFATOORAH_BASE_CURRENCY || "KWD").toUpperCase();
  if (
    currencyDigits(currency) === undefined ||
    (baseUrl === myFatoorahOrigins[0] && currency !== "KWD")
  )
    issues.push("MYFATOORAH_BASE_CURRENCY");
  const frontend = publicHttps(env.PAYMENT_FRONTEND_URL),
    api = publicHttps(env.PAYMENT_PUBLIC_API_URL);
  if (
    !frontend ||
    (frontend + "/payment/return?orderId=" + "0".repeat(24)).length > 254
  )
    issues.push("PAYMENT_FRONTEND_URL");
  if (!api || (api + "/api/v1/payments/webhook").length > 254)
    issues.push("PAYMENT_PUBLIC_API_URL");
  return issues;
}
export function safeReturnPath(value) {
  // Only lesson/course routes can be a post-payment destination.
  return typeof value === "string" &&
    /^\/(?:lessons|courses)\/[a-f\d]{24}(?:\?lesson=[a-f\d]{24})?$/i.test(value)
    ? value
    : "/dashboard";
}
export function safePaymentUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      (url.hostname === "myfatoorah.com" ||
        url.hostname.endsWith(".myfatoorah.com"))
      ? url.href
      : null;
  } catch {
    return null;
  }
}
