import Joi from 'joi';
import User from '../../DB/models/User.js';
import PasswordResetToken from '../../DB/models/PasswordResetToken.js';
import {compare, hash} from '../../utils/hashing/hashing.js';

export const changeAdminPasswordSchema = Joi.object({
  currentPassword: Joi.string().max(256).required(),
  newPassword: Joi.string().min(12).max(72).pattern(/\S/).custom((value, helpers) =>
    Buffer.byteLength(value) > 72 ? helpers.error('string.max', {limit: 72}) : value).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
});

export async function changeAdminPassword(req, res) {
  const {currentPassword, newPassword} = req.body;
  const user = await User.findOne({_id: req.user._id, role: 'Admin'}).select('+passwordHash');
  if (!user || !compare({plainText: currentPassword, hash: user.passwordHash})) {
    throw new Error('كلمة المرور الحالية غير صحيحة', {cause: 400});
  }
  if (compare({plainText: newPassword, hash: user.passwordHash})) {
    throw new Error('اختر كلمة مرور مختلفة عن الحالية', {cause: 422});
  }
  // Match the authenticated session and old hash to prevent concurrent stale changes.
  const changed = await User.findOneAndUpdate({
    _id: user._id, role: 'Admin', passwordHash: user.passwordHash, tokenVersion: req.user.tokenVersion,
  }, {$set: {passwordHash: hash({plainText: newPassword})}, $inc: {tokenVersion: 1}});
  if (!changed) throw new Error('انتهت الجلسة. سجّل الدخول مجددًا.', {cause: 401});
  await PasswordResetToken.deleteMany({userId: user._id});
  res.json({success: true, message: 'تم تغيير كلمة المرور. سجّل الدخول بالكلمة الجديدة.'});
}
