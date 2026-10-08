import Subscription from '../../DB/models/Subscription.js';
export async function hasSubscription(userId) {
 return Boolean(await Subscription.exists({userId,startsAt:{$lte:new Date()},endsAt:{$gt:new Date()}}));
}
export async function getSubscriptions(userId) {
 return Subscription.find({userId}).populate('planId').sort({startsAt:-1}).lean();
}

