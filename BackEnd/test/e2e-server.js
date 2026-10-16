// Only the Playwright harness starts this server. It is never imported by server.js.
import "dotenv/config";
import assert from "node:assert/strict";
import express from "express";
import mongoose from "mongoose";
import bootstrap from "../src/app.js";
import { seedAdmin } from "../src/DB/seed.js";
assert.equal(process.env.NODE_ENV, "test");
assert.match(
  process.env.DB_URI,
  /^mongodb:\/\/127\.0\.0\.1:27028\/aldiwanya_e2e_[a-f0-9]{16}$/,
);
const config = {
  enabled: false,
  configured: true,
  sandbox: true,
  currency: "KWD",
  frontendOrigin: "https://local-test.example",
  apiOrigin: "https://local-test.example",
  webhookSecret: "test-harness-only",
};
const invoices = new Map();
let invoiceNumber = 200000;
const client = {
  initiatePayment: async () => ({
    PaymentMethods: [
      {
        PaymentMethodId: 2,
        PaymentMethodAr: "بطاقة تجريبية",
        IsDirectPayment: false,
      },
    ],
  }),
  executePayment: async (args) => {
    const id = ++invoiceNumber;
    invoices.set(String(id), {
      InvoiceId: id,
      InvoiceStatus: "Pending",
      CustomerReference: args.reference,
      InvoiceValue: args.amount,
      InvoiceDisplayValue: args.amount.toFixed(3) + " KD",
      CustomerEmail: args.customerEmail,
      InvoiceTransactions: [],
    });
    return {
      InvoiceId: id,
      PaymentURL: "https://demo.myfatoorah.com/e2e/" + id,
    };
  },
  getPaymentStatus: async (key, type = "PaymentId") => {
    const invoice = [...invoices.values()].find((i) =>
      type === "InvoiceId"
        ? String(i.InvoiceId) === String(key)
        : type === "CustomerReference"
          ? i.CustomerReference === key
          : i.InvoiceTransactions.some((t) => t.PaymentId === key),
    );
    if (!invoice) throw new Error("Test invoice not found", { cause: 404 });
    return structuredClone(invoice);
  },
};
const app = express();
app.post("/__test/payments/enable", (req, res) => {
  config.enabled = true;
  res.json({ ok: true });
});
app.post("/__test/payments/:invoice/paid", (req, res) => {
  const invoice = invoices.get(req.params.invoice);
  if (!invoice) return res.sendStatus(404);
  invoice.InvoiceStatus = "Paid";
  invoice.InvoiceTransactions = [
    { PaymentId: "e2e-" + invoice.InvoiceId, TransactionStatus: "Succss" },
  ];
  res.json({
    returnUrl:
      "/payment/return?orderId=" +
      invoice.CustomerReference +
      "&paymentId=e2e-" +
      invoice.InvoiceId,
  });
});
await bootstrap(app, express, { paymentOptions: { client, config } });
await seedAdmin();
const server = app.listen(Number(process.env.PORT), "127.0.0.1");
server.once("listening", () => process.send?.("ready"));
async function stop() {
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  assert.match(mongoose.connection.name, /^aldiwanya_e2e_[a-f0-9]{16}$/);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  process.exit(0);
}
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
process.on("message", (message) => {
  if (message === "stop") void stop();
});
