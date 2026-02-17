# WebSocket (Laravel Reverb) – توجيه الواجهة

لتشغيل الإشعارات الفورية (WebSocket) عبر **Laravel Reverb**:

1. **تشغيل Reverb** من جانب الـ Backend (مثلاً):
   ```bash
   php artisan reverb:start
   ```
   المنفذ يُعرّف في `config/reverb.php` أو `.env` (مثلاً 8081).

2. **تجنب تعارض المنفذ:** يجب أن يعمل Reverb على **منفذ مختلف** عن منفذ تطبيق Vue. مثلاً:
   - تطبيق Vue على `localhost:8080` → شغّل Reverb على منفذ آخر (مثلاً **8081**).
   - وإلا ستظهر في الكونسول: `WebSocket connection to 'ws://...:8080/ws' failed` لأن 8080 يخدم الواجهة وليس Reverb.

3. **توجيه الواجهة** عبر متغيرات البيئة في `.env`:
   ```env
   VUE_APP_PUSHER_KEY=your-app-key
   VUE_APP_PUSHER_WS_HOST=localhost
   VUE_APP_PUSHER_WS_PORT=8081
   VUE_APP_PUSHER_AUTH_ENDPOINT=/api/broadcasting/auth
   ```
   - استخدم نفس الـ host والمنفذ الذي يعمل عليه Reverb (انظر النقطة 2).
   - إذا كان Reverb على جهاز آخر: ضع عنوان الجهاز في `VUE_APP_PUSHER_WS_HOST` والمنفذ في `VUE_APP_PUSHER_WS_PORT`.

4. **بدون إعداد:** إذا لم تُعيَّن `VUE_APP_PUSHER_KEY` (أو بقي المفتاح الافتراضي)، الواجهة **لا تُنشئ** اتصال WebSocket، فلا تظهر أخطاء الاتصال في الكونسول.

5. **استخدام TLS (wss)** في الإنتاج إن لزم:
   ```env
   VUE_APP_PUSHER_WS_HOST=your-domain.com
   VUE_APP_PUSHER_WSS_PORT=443
   VUE_APP_PUSHER_FORCE_TLS=true
   ```

عند تعيين `VUE_APP_PUSHER_WS_HOST` و `VUE_APP_PUSHER_KEY` بمفتاح صحيح، الواجهة تستخدمها للاتصال بـ Reverb.
