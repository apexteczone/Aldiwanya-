import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import Joi from "joi";
import authentication from "../../middlewares/authMiddleware.js";
import validation from "../../middlewares/validation.middleware.js";
import { createPaymentService, publicOrder } from "./payment.service.js";
export function createPaymentRouter(options) {
  const router = Router(),
    service = createPaymentService(options);
  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  router.get("/capabilities", (req, res) =>
    res.json({
      success: true,
      data: {
        provider: "myfatoorah",
        checkoutEnabled: service.config.enabled,
        sandbox: service.config.sandbox,
        currency: service.config.currency,
      },
    }),
  );
  router.post(
    "/webhook",
    rateLimit({
      windowMs: 60000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
    async (req, res) => {
      await service.webhook(req.body, req.get("myfatoorah-signature"));
      res.json({ success: true });
    },
  );
  router.use(authentication());
  router.use(
    rateLimit({
      windowMs: 60000,
      limit: 30,
      standardHeaders: "draft-8",
      legacyHeaders: false,
    }),
  );
  router.get(
    "/methods",
    validation(
      Joi.object({ planId: Joi.string().hex().length(24).required() }),
      "query",
    ),
    async (req, res) =>
      res.json({
        success: true,
        data: await service.methods(req.query.planId),
      }),
  );
  router.post(
    "/checkout",
    validation(
      Joi.object({
        planId: Joi.string().hex().length(24).required(),
        paymentMethodId: Joi.number().integer().positive().required(),
        idempotencyKey: Joi.string()
          .pattern(/^[a-zA-Z0-9_-]{16,100}$/)
          .required(),
        returnTo: Joi.string().max(200).allow(""),
      }),
    ),
    async (req, res) =>
      res
        .status(201)
        .json({
          success: true,
          data: await service.checkout(req.user, req.body),
        }),
  );
  const id = validation(
    Joi.object({ id: Joi.string().hex().length(24).required() }),
    "params",
  );
  router.get("/orders/open", async (req, res) =>
    res.json({ success: true, data: await service.openOrderFor(req.user) }),
  );
  router.get("/orders/:id", id, async (req, res) =>
    res.json({
      success: true,
      data: publicOrder(await service.orderFor(req.user, req.params.id)),
    }),
  );
  router.post(
    "/orders/:id/verify",
    id,
    validation(
      Joi.object({ paymentId: Joi.string().pattern(/^[\w-]{1,128}$/) }),
    ),
    async (req, res) =>
      res.json({
        success: true,
        data: await service.reconcile(
          await service.orderFor(req.user, req.params.id),
          req.body,
        ),
      }),
  );
  return router;
}
export default createPaymentRouter;
