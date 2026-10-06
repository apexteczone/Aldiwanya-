import Router from "express";

import authentication, {
  allowTo,
} from "../../middlewares/authMiddleware.js";

import asyncHandler from "../../utils/errorHandling/asyncHandler.js";

import validation from "../../middlewares/validation.middleware.js";

import * as planServices from "./Plan.service.js";

import {
  planIdSchema,
  createPlanSchema,
  updatePlanSchema,
} from "./Plan.validation.js";

const router = Router();




router.get(
  "/getActivePlans",
  asyncHandler(planServices.getActivePlans)
);


router.use(authentication());

router.use(allowTo(["Admin"]));

router.get(
  "/getAllPlans",
  asyncHandler(
    planServices.getAllPlans
  )
);

router.post(
  "/CreatePlan",
  validation(createPlanSchema),
  asyncHandler(
    planServices.createPlan
  )
);

router.patch(
  "/:id/update",
  validation(
    planIdSchema,
    "params"
  ),
  validation(
    updatePlanSchema
  ),
  asyncHandler(
    planServices.updatePlan
  )
);

router.patch(
  "/:id/enable",
  validation(
    planIdSchema,
    "params"
  ),
  asyncHandler(
    planServices.enablePlan
  )
);

router.patch(
  "/:id/disable",
  validation(
    planIdSchema,
    "params"
  ),
  asyncHandler(
    planServices.disablePlan
  )
);

export default router;