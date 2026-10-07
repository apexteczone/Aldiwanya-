import * as userServices from "./user.service.js";

export const getMyProfile = async (
  req,
  res
) => {
  const user = await userServices.getMyProfile(
    req.user._id
  );

  return res.status(200).json({
    success: true,
    data: {
      user,
      subscription: {
        status: "none",
        expiresAt: null,
      },
    },
  });
};

export const updateMyProfile = async (
  req,
  res
) => {
  const user =
    await userServices.updateMyProfile(
      req.user._id,
      req.body
    );

  return res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};