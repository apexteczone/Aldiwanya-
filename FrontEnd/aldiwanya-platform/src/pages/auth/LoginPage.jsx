

export default function LoginPage() {
  return (
    <>
    <div className="bg-navy-900 text-white rounded-2xl p-8">
  <h2 className="text-3xl font-bold text-white">
    تسجيل الدخول
  </h2>

  <p className="text-slate-200 mt-2">
    مرحباً بعودتك مجدداً في الديوانية
  </p>

  <input
    type="email"
    placeholder="أدخل بريدك الإلكتروني"
    className="
      w-full mt-6 p-3
      rounded-lg
      bg-transparent
      border border-border-dark
      text-white
      placeholder:text-slate-300
      focus:border-blue-500
      focus:outline-none
    "
  />

  <button
    className="
      w-full mt-5 py-3
      rounded-lg
      bg-gradient-to-r from-blue-500 to-blue-700
      hover:from-blue-600 hover:to-blue-700
      text-white font-semibold
      transition-all
    "
  >
    تسجيل الدخول
  </button>
</div>
</>
  )
}
