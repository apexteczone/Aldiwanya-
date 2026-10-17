// Server-only adapter: https://docs.myfatoorah.com/docs/execute-payment
import { myFatoorahOrigins } from "./payment.config.js";
export function createMyFatoorahClient({
  baseUrl = process.env.MYFATOORAH_BASE_URL || "https://apitest.myfatoorah.com",
  apiKey = process.env.MYFATOORAH_API_KEY,
  fetchImpl = fetch,
} = {}) {
  if (!myFatoorahOrigins.includes(baseUrl))
    throw new Error("Unsupported MyFatoorah API origin");
  async function call(endpoint, body) {
    if (!apiKey)
      throw new Error("Payment provider is not configured", { cause: 503 });
    let response;
    try {
      response = await fetchImpl(baseUrl + "/v2/" + endpoint, {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
        headers: {
          Authorization: "Bearer " + apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error(
        "تعذر الاتصال ببوابة الدفع. تحقق من حالة الطلب قبل المحاولة مجددًا.",
        { cause: 502 },
      );
    }
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("Invalid provider response", { cause: 502 });
    }
    if (!response.ok || result?.IsSuccess !== true || !result.Data) {
      const error = new Error("Payment provider rejected the request", {
        cause: 502,
      });
      // Only a documented, definitive rejection permits a fresh invoice. Network
      // failures, 5xx and malformed responses remain ambiguous and must be reconciled.
      if (
        endpoint === "ExecutePayment" &&
        [200, 400, 401, 403, 422].includes(response.status) &&
        result?.IsSuccess === false &&
        !result.Data?.InvoiceId
      ) {
        error.code = "PAYMENT_REQUEST_REJECTED";
      }
      throw error;
    }
    return result.Data;
  }
  return {
    initiatePayment: ({ amount, currency = "KWD" }) =>
      call("InitiatePayment", { InvoiceAmount: amount, CurrencyIso: currency }),
    executePayment: ({
      amount,
      paymentMethodId,
      customerName,
      customerEmail,
      reference,
      callbackUrl,
      currency,
      webhookUrl,
    }) =>
      call("ExecutePayment", {
        InvoiceValue: amount,
        PaymentMethodId: paymentMethodId,
        CustomerName: customerName,
        CustomerEmail: customerEmail,
        CustomerReference: reference,
        CustomerIdentifier: reference,
        UserDefinedField: reference,
        CallBackUrl: callbackUrl,
        ErrorUrl: callbackUrl,
        DisplayCurrencyIso: currency,
        Language: "ar",
        WebhookUrl: webhookUrl,
      }),
    getPaymentStatus: (key, keyType = "PaymentId") =>
      call("GetPaymentStatus", { Key: String(key), KeyType: keyType }),
  };
}
