import "dotenv/config";
import mongoose from "mongoose";
import Payment from "../../DB/models/Payment.js";
import {
  createPaymentService,
  verifyPaymentIndexes,
} from "./payment.service.js";
// Run periodically on the server. Resolves browser abandonment and interrupted settlement.
try {
  await mongoose.connect(process.env.DB_URI, { autoIndex: false });
  await verifyPaymentIndexes();
  const service = createPaymentService();
  const orders = await Payment.find({
    provider: "myfatoorah",
    status: { $in: ["created", "pending"] },
  })
    .sort({ created_at: 1 })
    .limit(100);
  let completed = 0,
    pending = 0,
    failed = 0;
  for (const order of orders) {
    try {
      const result = await service.reconcile(order);
      if (["succeeded", "canceled"].includes(result.status)) completed++;
      else pending++;
    } catch {
      failed++;
    }
  }
  console.log(
    JSON.stringify({ checked: orders.length, completed, pending, failed }),
  );
  if (failed) process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
