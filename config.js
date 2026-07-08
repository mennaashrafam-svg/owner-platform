// مصدر واحد لرابط الـ Backend، بيتحمل قبل أي كود تاني يحتاجه (صفحات auth العادية + app.bundle.js).
// أي تغيير في دومين السيرفر مستقبلاً محتاج تعديل هنا بس.
window.OWNER_PLATFORM_API_BASE_URL = "https://my-server-production-0e71.up.railway.app";

// App ID بتاع تطبيق Meta "Smart INV" — مش سر، بيستخدمه الـ Facebook JavaScript SDK.
window.OWNER_PLATFORM_META_APP_ID = "1311739350941433";

// Configuration ID بتاع WhatsApp Embedded Signup، بيتولد من Meta Dashboard تحت
// Facebook Login for Business > Configurations. لسه ناقص — لازم يتحط هنا بعد
// ما تتعمل الخطوة دي على Meta (شوف MIGRATIONS.md أو اسألي Claude لو نسيتي التفاصيل).
window.OWNER_PLATFORM_WHATSAPP_SIGNUP_CONFIG_ID = "";
