import UserModel from "../../DB/models/User.js";

export const getMyProfile = async (userId) => {
  const user = await UserModel.findById(userId)
    .select(
      "fullName email phoneNumber role gradePreference createdAt"
    )
    .lean();

  if (!user) {
    throw new Error("User not found", {
      cause: 404,
    });
  }

  return user;
};

export const updateMyProfile = async (
  userId,
  updates
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      $set: updates,
    },
    {
      returnDocument: 'after',
      runValidators: true,
    }
  )
    .select(
      "fullName email phoneNumber role gradePreference createdAt"
    )
    .lean();

  if (!user) {
    throw new Error("User not found", {
      cause: 404,
    });
  }

  return user;
};