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
      Boolean(
        env.MYFATOORAH_API_KEY &&
        env.MYFATOORAH_WEBHOOK_SECRET &&
        frontendOrigin &&
        apiOrigin &&
        currencyDigits(currency) !== undefined,
      ),
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
