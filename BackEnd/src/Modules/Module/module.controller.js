import Router from "express";

import authentication, {
  allowTo,
} from "../../middlewares/authMiddleware.js";

import asyncHandler from "../../utils/errorHandling/asyncHandler.js";

import validation from "../../middlewares/validation.middleware.js";

import * as moduleServices from "./module.service.js";

import {
  moduleIdSchema,
  createModuleSchema,
  updateModuleSchema,
  reorderModulesSchema,
} from "./module.validation.js";

const router = Router();

router.use(authentication());

router.use(allowTo(["Admin"]));

router.get(
  "/modules",
  asyncHandler(moduleServices.getModules)
);


router.get(
  "/modules/:id",
  validation(moduleIdSchema, "params"),
  asyncHandler(moduleServices.getModuleById)
);

router.post(
  "/modules/CreateModule",
  validation(createModuleSchema),
  asyncHandler(moduleServices.createModule)
);


router.patch(
  "/modules/:id/update",
  validation(moduleIdSchema, "params"),
  validation(updateModuleSchema),
  asyncHandler(moduleServices.updateModule)
);


router.delete(
  "/modules/:id/delete",
  validation(moduleIdSchema, "params"),
  asyncHandler(moduleServices.deleteModule)
);


router.patch(
  "/modules/:id/publish",
  validation(moduleIdSchema, "params"),
  asyncHandler(moduleServices.publishModule)
);


router.patch(
  "/modules/:id/hide",
  validation(moduleIdSchema, "params"),
  asyncHandler(moduleServices.hideModule)
);


router.put(
  "/modules/order",
  validation(reorderModulesSchema),
  asyncHandler(moduleServices.reorderModules)
);

export default router;