import mongoose from "mongoose";
import PlanModel from "../../DB/models/Plan.js";

const checkId = (id, name) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${name}`, {
      cause: 422,
    });
  }
};



// GET ACTIVE PLANS
export const getActivePlans = async (
  req,
  res,
  next
) => {
  try {
    const plans = await PlanModel.find({
      active: true,
    }).sort({
      durationMonths: 1,
    });

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    return next(error);
  }
};


// GET ALL PLANS
export const getAllPlans = async (
  req,
  res,
  next
) => {
  try {
    const plans = await PlanModel.find().sort({
      durationMonths: 1,
    });

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    return next(error);
  }
};


// CREATE PLAN
export const createPlan = async (
  req,
  res,
  next
) => {
  try {
    const existingPlan =
      await PlanModel.findOne({
        durationMonths:
          req.body.durationMonths,
      });

    if (existingPlan) {
      return next(
        new Error(
          "A plan with this duration already exists",
          { cause: 409 }
        )
      );
    }

    const plan =
      await PlanModel.create({
        ...req.body,
        currency:
          req.body.currency.toUpperCase(),
      });

    return res.status(201).json({
      success: true,
      message:
        "Plan created successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};


// UPDATE PLAN
export const updatePlan = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "plan ID");

    const plan =
      await PlanModel.findById(id);

    if (!plan) {
      return next(
        new Error("Plan not found", {
          cause: 404,
        })
      );
    }

    Object.assign(plan, req.body);

    if (req.body.currency) {
      plan.currency =
        req.body.currency.toUpperCase();
    }

    await plan.save();

    return res.status(200).json({
      success: true,
      message:
        "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};


// ENABLE PLAN
export const enablePlan = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "plan ID");

    const plan =
      await PlanModel.findByIdAndUpdate(
        id,
        { active: true },
        { returnDocument: 'after' }
      );

    if (!plan) {
      return next(
        new Error("Plan not found", {
          cause: 404,
        })
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Plan enabled successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};


// DISABLE PLAN
export const disablePlan = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    checkId(id, "plan ID");

    const plan =
      await PlanModel.findByIdAndUpdate(
        id,
        { active: false },
        { returnDocument: 'after' }
      );

    if (!plan) {
      return next(
        new Error("Plan not found", {
          cause: 404,
        })
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Plan disabled successfully",
      data: plan,
    });
  } catch (error) {
    return next(error);
  }
};


