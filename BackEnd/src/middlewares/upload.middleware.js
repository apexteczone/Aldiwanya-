import multer from "multer";
import path from "path";
import fs from "fs";

// 1. إنشاء المجلدات إن لم تكن موجودة
const pdfDir = "uploads/pdfs";
const imageDir = "uploads/images";

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// 2. إعداد التخزين وتحديد المجلد حسب نوع الملف
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, imageDir);
    } else if (file.mimetype === "application/pdf") {
      cb(null, pdfDir);
    } else {
      cb(null, "uploads");
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// 3. فلتر الصور (تحقق دقيق من الأنواع المسموحة فقط)
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (JPG, PNG, WEBP, SVG) are allowed!"),
      false
    );
  }
};

// 4. فلتر ملفات ה-PDF
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

export const uploadImage = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

export const uploadPdf = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});