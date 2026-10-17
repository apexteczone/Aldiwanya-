import crypto from "node:crypto";
import mongoose from "mongoose";
import Payment from "../../DB/models/Payment.js";
import PaymentEvent from "../../DB/models/paymentEvent.js";
import PaymentLock from "../../DB/models/PaymentLock.js";
import Subscription from "../../DB/models/Subscription.js";
import Plan from "../../DB/models/Plan.js";
import {notifyPayment} from '../User/notification.service.js';
import { createMyFatoorahClient } from "./myfatoorah.client.js";
import {
  paymentConfig,
  currencyDigits,
  minorAmount,
  safePaymentUrl,
  safeReturnPath,
} from "./payment.config.js";

export async function verifyPaymentIndexes() {
  for (const [model, fields] of [
    [Payment, ["idempotency_key", "open_user_id", "provider_reference"]],
    [Subscription, ["paymentOrderId"]],
    [PaymentEvent, ["provider_event_id"]],
  ]) {
    let indexes = [];
    try {
      indexes = await model.collection.indexes();
    } catch (error) {
      if (error.code !== 26) throw error;
    }
    for (const field of fields) {
      if (
        !indexes.some(
          (index) =>
            index.unique === true &&
            !index.partialFilterExpression &&
            Object.keys(index.key).length === 1 &&
            index.key[field] === 1,
        )
      ) {
        throw new Error(
          "Required payment index is missing. Review the database and run npm run db:indexes before enabling payments.",
        );
      }
    }
  }
}

export const publicOrder = (order) => ({
  id: order._id,
  status: order.status,
  amountMinor: order.amount_minor,
  currency: order.currency,
  planId: order.plan_id,
  durationMonths: order.duration_snapshot,
  returnTo: order.return_to,
  checkoutUrl:
    order.status === "pending" ? safePaymentUrl(order.checkout_url) : null,
  lastAttempt: order.last_attempt || null,
});
export function addCalendarMonths(date, months) {
  const result = new Date(date),
    day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
  ).getUTCDate();
  result.setUTCDate(Math.min(day, last));
  return result;
}
export function signaturePayload(data) {
  return [
    "Invoice.Id",
    "Invoice.Status",
    "Transaction.Status",
    "Transaction.PaymentId",
    "Invoice.ExternalIdentifier",
  ]
    .map((path) => {
      const [a, b] = path.split(".");
      return path + "=" + (data?.[a]?.[b] ?? "");
    })
    .join(",");
}
export function validWebhookSignature(data, signature, secret) {
  if (
    !secret ||
    typeof signature !== "string" ||
    !/^[A-Za-z0-9+/]{43}=$/.test(signature)
  )
    return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(signaturePayload(data), "utf8")
    .digest();
  const actual = Buffer.from(signature, "base64");
  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(actual, expected)
  );
}
async function acquireSettlementLock(order, recovered = false) {
  try {
    await PaymentLock.create({ _id: order.user_id, paymentId: order._id });
  } catch (error) {
    if (error.code !== 11000) throw error;
    const lock = await PaymentLock.findById(order.user_id);
    if (String(lock?.paymentId) === String(order._id)) return;
    // Recover a crash between the final payment update and lock release.
    if (
      !recovered &&
      lock &&
      (await Payment.exists({ _id: lock.paymentId, status: "succeeded" }))
    ) {
      await PaymentLock.deleteOne({
        _id: order.user_id,
        paymentId: lock.paymentId,
      });
      return acquireSettlementLock(order, true);
    }
    throw new Error("Subscription settlement is busy. Retry shortly.", {
      cause: 503,
    });
  }
}
async function settle(order) {
  await acquireSettlementLock(order);
  try {
    let subscription = await Subscription.findOne({
      paymentOrderId: order._id,
    });
    if (!subscription) {
      const previous = await Subscription.findOne({
        userId: order.user_id,
      }).sort({ endsAt: -1 });
      const startsAt = new Date(
        Math.max(Date.now(), previous?.endsAt?.getTime() || 0),
      );
      const endsAt = addCalendarMonths(startsAt, order.duration_snapshot);
      try {
        subscription = await Subscription.findOneAndUpdate(
          { paymentOrderId: order._id },
          {
            $setOnInsert: {
              userId: order.user_id,
              planId: order.plan_id,
              paymentOrderId: order._id,
              startsAt,
              endsAt,
            },
          },
          { upsert: true, returnDocument: "after", runValidators: true },
        );
      } catch (error) {
        if (error.code !== 11000) throw error;
        subscription = await Subscription.findOne({
          paymentOrderId: order._id,
        });
      }
    }
    await Payment.updateOne(
      { _id: order._id },
      {
        $set: { status: "succeeded", paid_at: order.paid_at || new Date() },
        $unset: { open_user_id: 1 },
      },
    );
    return subscription;
  } finally {
    await PaymentLock.deleteOne({ _id: order.user_id, paymentId: order._id });
  }
}
function checkInvoice(order, invoice) {
  const display = String(invoice.InvoiceDisplayValue || "")
    .trim()
    .match(/^([\d,.]+)\s+([A-Za-z.]+)$/);
  const aliases = {
    KD: "KWD",
    "K.D.": "KWD",
    SR: "SAR",
    QR: "QAR",
    BD: "BHD",
    RO: "OMR",
    JD: "JOD",
  };
  const displayCurrency =
    display && (aliases[display[2].toUpperCase()] || display[2].toUpperCase());
  if (
    String(invoice.CustomerReference) !== String(order._id) ||
    (order.provider_reference &&
      String(invoice.InvoiceId) !== order.provider_reference) ||
    !/^\d+$/.test(String(invoice.InvoiceId)) ||
    minorAmount(invoice.InvoiceValue, order.currency) !== order.amount_minor ||
    !display ||
    displayCurrency !== order.currency ||
    minorAmount(display[1].replaceAll(",", ""), order.currency) !==
      order.amount_minor ||
    String(invoice.CustomerEmail || "").toLowerCase() !== order.customer_email
  ) {
    throw new Error("تعذر مطابقة بيانات الفاتورة مع الطلب. تواصل مع الدعم.", {
      cause: 409,
    });
  }
}
export function createPaymentService({
  client = createMyFatoorahClient(),
  config = paymentConfig(),
} = {}) {
  async function availablePlan(planId) {
    if (!mongoose.isValidObjectId(planId))
      throw new Error("Invalid plan", { cause: 422 });
    const plan = await Plan.findOne({ _id: planId, active: true });
    if (!plan) throw new Error("الخطة غير متاحة.", { cause: 404 });
    if (
      plan.currency !== config.currency ||
      !Number.isSafeInteger(plan.amountMinor) ||
      plan.amountMinor < 1
    )
      throw new Error("عملة الخطة لا تطابق عملة حساب بوابة الدفع.", {
        cause: 422,
      });
    return plan;
  }
  function requireCheckout() {
    if (!config.enabled)
      throw Object.assign(
        new Error("الدفع غير متاح حاليًا. يمكنك متابعة المحتوى المجاني.", {
          cause: 503,
        }),
        { publicCode: "PAYMENTS_NOT_ENABLED" },
      );
  }
  async function methods(planId) {
    requireCheckout();
    const plan = await availablePlan(planId);
    const result = await client.initiatePayment({
      amount: plan.amountMinor / 10 ** currencyDigits(plan.currency),
      currency: plan.currency,
    });
    if (!Array.isArray(result?.PaymentMethods))
      throw new Error("Invalid payment methods response", { cause: 502 });
    return result.PaymentMethods.filter(
      (m) =>
        m &&
        Number.isInteger(m.PaymentMethodId) &&
        m.PaymentMethodId > 0 &&
        m.IsDirectPayment === false,
    ).map((m) => ({
      id: m.PaymentMethodId,
      name: m.PaymentMethodAr || m.PaymentMethodEn,
      image: safePaymentUrl(m.ImageUrl),
    }));
  }
  async function checkout(
    user,
    { planId, paymentMethodId, idempotencyKey, returnTo },
  ) {
    requireCheckout();
    function reuse(order) {
      if (
        String(order.plan_id) !== String(planId) ||
        order.payment_method_id !== paymentMethodId
      )
        throw Object.assign(
          new Error(
            "لديك طلب دفع سابق بخطة أو وسيلة دفع مختلفة. تحقق من حالته قبل إنشاء طلب جديد.",
            { cause: 409 },
          ),
          { publicCode: "OPEN_PAYMENT_EXISTS" },
        );
      return publicOrder(order);
    }
    const key = String(user._id) + ":" + idempotencyKey;
    const existing = await Payment.findOne({ idempotency_key: key });
    if (existing) {
      if (
        String(existing.plan_id) !== planId ||
        existing.payment_method_id !== paymentMethodId
      )
        throw new Error("مفتاح الطلب مستخدم لبيانات مختلفة.", { cause: 409 });
      return publicOrder(existing);
    }
    const open = await Payment.findOne({ open_user_id: user._id });
    if (open) return reuse(open);
    const plan = await availablePlan(planId);
    if (!(await methods(planId)).some((m) => m.id === paymentMethodId))
      throw new Error("اختر وسيلة دفع متاحة.", { cause: 422 });
    let order;
    try {
      order = await Payment.create({
        user_id: user._id,
        plan_id: plan._id,
        price_snapshot: plan.amountMinor / 10 ** currencyDigits(plan.currency),
        amount_minor: plan.amountMinor,
        duration_snapshot: plan.durationMonths,
        currency: plan.currency,
        provider: "myfatoorah",
        customer_email: user.email,
        idempotency_key: key,
        open_user_id: user._id,
        payment_method_id: paymentMethodId,
        return_to: safeReturnPath(returnTo),
        status: "created",
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      const concurrent = await Payment.findOne({
        $or: [{ idempotency_key: key }, { open_user_id: user._id }],
      });
      if (!concurrent) throw error;
      return reuse(concurrent);
    }
    // Persist before calling the provider. An ambiguous timeout must never cause a second invoice.
    const callbackUrl =
      config.frontendOrigin + "/payment/return?orderId=" + order._id;
    try {
      const result = await client.executePayment({
        amount: order.price_snapshot,
        paymentMethodId,
        customerName: user.fullName.slice(0, 50),
        customerEmail: user.email,
        reference: String(order._id),
        callbackUrl,
        currency: order.currency,
        webhookUrl: config.apiOrigin + "/api/v1/payments/webhook",
      });
      const url = safePaymentUrl(result.PaymentURL);
      if (!url || !/^\d+$/.test(String(result.InvoiceId)))
        throw new Error("Invalid checkout response", { cause: 502 });
      await Payment.updateOne(
        { _id: order._id, status: "created" },
        {
          $set: {
            provider_reference: String(result.InvoiceId),
            checkout_url: url,
            status: "pending",
          },
        },
      );
    } catch (error) {
      if (error.code === "PAYMENT_REQUEST_REJECTED") {
        await Payment.updateOne(
          { _id: order._id, status: "created" },
          {
            $set: { status: "failed", last_attempt: "failed" },
            $unset: { open_user_id: 1 },
          },
        );
      } else {
        // A provider invoice might already exist. Reconciliation uses CustomerReference.
        await Payment.updateOne(
          { _id: order._id, status: "created" },
          { $set: { last_attempt: "unknown" } },
        );
      }
    }
    return publicOrder(await Payment.findById(order._id));
  }
  async function reconcile(order, { paymentId, invoice } = {}) {
    if (order.status === "succeeded") {
      await notifyPayment(order);
      await PaymentLock.deleteOne({ _id: order.user_id, paymentId: order._id });
      return publicOrder(order);
    }
    // A definitively rejected ExecutePayment has no invoice to query. A later
    // signed provider event can still be reconciled if it includes verified data.
    if (
      order.status === "failed" &&
      !order.provider_reference &&
      !paymentId &&
      !invoice
    )
      return publicOrder(order);
    if (!config.configured)
      throw new Error("Payment provider is not configured", { cause: 503 });
    const data =
      invoice ||
      (await client.getPaymentStatus(
        paymentId || order.provider_reference || String(order._id),
        paymentId
          ? "PaymentId"
          : order.provider_reference
            ? "InvoiceId"
            : "CustomerReference",
      ));
    if (
      !data ||
      !["Pending", "Paid", "Canceled"].includes(data.InvoiceStatus) ||
      !Array.isArray(data.InvoiceTransactions) ||
      data.InvoiceTransactions.some((t) => !t || typeof t !== "object")
    )
      throw new Error("Invalid provider invoice response", { cause: 502 });
    checkInvoice(order, data);
    const transactions = data.InvoiceTransactions || [];
    if (
      paymentId &&
      !transactions.some((t) => String(t.PaymentId) === paymentId)
    )
      throw new Error("Payment does not belong to this invoice", {
        cause: 409,
      });
    await Payment.updateOne(
      { _id: order._id },
      { $set: { provider_reference: String(data.InvoiceId) } },
    );
    if (data.InvoiceStatus === "Paid") {
      if (
        !transactions.some((t) =>
          ["succss", "success"].includes(
            String(t.TransactionStatus).toLowerCase(),
          ),
        )
      )
        throw new Error("Payment is not settled yet", { cause: 409 });
      await settle(order);
      await notifyPayment(order);
    } else if (data.InvoiceStatus === "Canceled") {
      await Payment.updateOne(
        { _id: order._id, status: { $ne: "succeeded" } },
        { $set: { status: "canceled" }, $unset: { open_user_id: 1 } },
      );
    } else {
      await Payment.updateOne(
        { _id: order._id, status: { $nin: ["succeeded", "canceled"] } },
        {
          $set: {
            status: "pending",
            last_attempt: transactions.some((t) =>
              ["Failed", "Canceled"].includes(t.TransactionStatus),
            )
              ? "failed"
              : "pending",
          },
        },
      );
    }
    return publicOrder(await Payment.findById(order._id));
  }
  async function orderFor(user, id) {
    if (!mongoose.isValidObjectId(id))
      throw new Error("Order not found", { cause: 404 });
    const order = await Payment.findOne({ _id: id, user_id: user._id });
    if (!order) throw new Error("Order not found", { cause: 404 });
    return order;
  }
  async function openOrderFor(user) {
    const order = await Payment.findOne({ open_user_id: user._id });
    return order ? publicOrder(order) : null;
  }
  async function webhook(body, signature) {
    if (
      body?.Event?.Code !== 1 ||
      !validWebhookSignature(body.Data, signature, config.webhookSecret)
    )
      throw new Error("Invalid webhook signature", { cause: 401 });
    const data = body.Data,
      paymentId = data.Transaction?.PaymentId;
    if (typeof paymentId !== "string" || paymentId.length > 128)
      throw new Error("Invalid webhook payment", { cause: 422 });
    // De-duplicate signed fields, not the unsigned event reference.
    const eventId = crypto
      .createHash("sha256")
      .update(signaturePayload(data))
      .digest("hex");
    let event;
    try {
      event = await PaymentEvent.findOneAndUpdate(
        { provider_event_id: eventId },
        {
          $setOnInsert: {
            provider: "myfatoorah",
            verification_status: "valid",
            received_at: new Date(),
          },
        },
        { upsert: true, returnDocument: "after" },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
      event = await PaymentEvent.findOne({ provider_event_id: eventId });
    }
    if (
      event.processing_status === "processed" ||
      event.processing_status === "ignored"
    )
      return;
    try {
      const invoice = await client.getPaymentStatus(paymentId);
      if (String(invoice.InvoiceId) !== String(data.Invoice.Id))
        throw new Error("Invoice mismatch", { cause: 409 });
      const order = mongoose.isValidObjectId(invoice.CustomerReference)
        ? await Payment.findById(invoice.CustomerReference)
        : null;
      if (!order) {
        await PaymentEvent.updateOne(
          { _id: event._id },
          { $set: { processing_status: "ignored", processed_at: new Date() } },
        );
        return;
      }
      const result = await reconcile(order, { paymentId, invoice });
      if (!["succeeded", "canceled"].includes(result.status))
        throw new Error("Payment verification is pending", { cause: 503 });
      await PaymentEvent.updateOne(
        { _id: event._id },
        {
          $set: {
            payment_order_id: order._id,
            processing_status: "processed",
            processed_at: new Date(),
          },
          $unset: { verification_error: 1 },
        },
      );
    } catch (error) {
      await PaymentEvent.updateOne(
        { _id: event._id },
        {
          $set: {
            processing_status: "failed",
            verification_error: "Provider verification or settlement failed",
          },
        },
      );
      throw error;
    }
  }
  return {
    config,
    methods,
    checkout,
    orderFor,
    openOrderFor,
    reconcile,
    webhook,
  };
}
