import Joi from "joi";
import PlatformSettings from "../../DB/models/PlatformSettings.js";

function url(hosts) {
  return Joi.string()
    .trim()
    .max(2048)
    .allow("")
    .custom((value, helpers) => {
      if (!value) return value;
      try {
        const parsed = new URL(value);
        if (
          parsed.protocol !== "https:" ||
          parsed.username ||
          parsed.password ||
          parsed.port ||
          !parsed.hostname.includes(".")
        )
          return helpers.error("any.invalid");
        const host = parsed.hostname.replace(/^www\./, "");
        if (hosts && !hosts.includes(host)) return helpers.error("any.invalid");
        return parsed.href;
      } catch {
        return helpers.error("any.invalid");
      }
    })
    .messages({ "any.invalid": "أدخل رابط HTTPS صالحًا للموقع المحدد." });
}
const optionalText = (max) => Joi.string().trim().max(max).allow("").required();
export const settingsSchema = Joi.object({
  revision: Joi.number().integer().min(0).required(),
  general: Joi.object({
    platformName: Joi.string().trim().min(2).max(100).required(),
    shortDescription: optionalText(300),
    description: optionalText(3000),
    websiteUrl: url().required(),
    contactEmail: Joi.string()
      .trim()
      .email({ tlds: { allow: false } })
      .max(254)
      .allow("")
      .required(),
    phoneCountryCode: Joi.string()
      .valid("+20", "+965", "+966", "+971", "+974", "+973", "+968", "+962")
      .required(),
    phoneNumber: Joi.string()
      .trim()
      .pattern(/^[0-9]{5,12}$/)
      .allow("")
      .required()
      .messages({
        "string.pattern.base":
          "رقم الهاتف يجب أن يحتوي على 5 إلى 12 رقمًا فقط.",
      }),
    address: optionalText(300),
  }),
  socialLinks: Joi.object({
    facebook: url(["facebook.com", "m.facebook.com", "fb.com"]).required(),
    instagram: url(["instagram.com"]).required(),
    youtube: url(["youtube.com", "m.youtube.com", "youtu.be"]).required(),
    x: url(["x.com", "twitter.com"]).required(),
    linkedin: url(["linkedin.com"]).required(),
  }),
}).xor("general", "socialLinks");

const dto = (row) => ({
  general: row.general,
  socialLinks: row.socialLinks,
  revision: row.revision,
});
export async function getSettings(req, res) {
  const row = await PlatformSettings.findById("platform").lean();
  res
    .set("Cache-Control", "private, no-store")
    .json({
      success: true,
      data: dto(row || new PlatformSettings().toObject()),
    });
}
export async function saveSettings(req, res) {
  const { revision, ...section } = req.body;
  let row;
  try {
    row = await PlatformSettings.findOneAndUpdate(
      { _id: "platform", revision },
      { $set: section, $inc: { revision: 1 } },
      {
        upsert: revision === 0,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
  }
  if (!row)
    throw new Error(
      "تم تعديل الإعدادات من جلسة أخرى. أعد تحميل البيانات قبل الحفظ.",
      { cause: 409 },
    );
  res
    .set("Cache-Control", "private, no-store")
    .json({ success: true, data: dto(row.toObject()) });
}
