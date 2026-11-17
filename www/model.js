/* Small, testable offline data model. Amounts are stored as integer piastres. */
(function (root) {
  function parseExpense(raw) {
    const text = String(raw).trim().replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g, '.').replace(/٬/g, ',').replace(/[−–—]/g, '-');
    const matches = [...text.matchAll(/-?\d[\d,.]*/g)];
    if (matches.length !== 1) throw Error('اكتب مبلغًا واحدًا فقط، مثل: قهوة 65.50 جنيه');
    const token = matches[0][0];
    if (matches[0].index > 0 && /[.,]/.test(text[matches[0].index - 1])) throw Error('اكتب الصفر قبل العلامة العشرية، مثل 0.50');
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(token)) throw Error('المبلغ غير صحيح. استخدم رقمًا موجبًا وخانتين عشريتين بحد أقصى.');
    const cents = Math.round(Number(token.replace(/,/g, '')) * 100);
    if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 10000000000) throw Error('أدخل مبلغًا موجبًا لا يتجاوز 100 مليون جنيه.');
    const title = text.replace(token, '').replace(/جنيه|ج\.م/g, '').trim();
    if (!title || /مهمة|مقابلة|الساعة|موعد/.test(title)) throw Error('هذا الحقل للمصروفات فقط. اكتب وصف المصروف والمبلغ.');
    return {title: title.slice(0, 200), cents, category: /فاتورة|اشتراك|إنترنت/.test(title) ? 'فواتير' : 'مشتريات'};
  }
  function valid(state) {
    return state && state.version === 1 && Array.isArray(state.expenses) && state.expenses.length <= 10000 && state.expenses.every(x => typeof x.title === 'string' && x.title.length <= 200 && Number.isSafeInteger(x.cents) && x.cents > 0 && x.cents <= 10000000000 && ['فواتير','مشتريات'].includes(x.category)) && Array.isArray(state.tasks) && state.tasks.length === 2 && state.tasks.every(x => typeof x === 'boolean');
  }
  const api = {parseExpense, valid, initial: () => ({version:1, expenses:[], tasks:[false,false]})};
  if (typeof module !== 'undefined') module.exports = api;
  root.Masrofy = api;
})(typeof window === 'undefined' ? globalThis : window);
