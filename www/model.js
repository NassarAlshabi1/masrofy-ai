/* Small, testable offline data model. Amounts are whole integers only: no fractions, no currency symbols. */
(function (root) {
  function parseExpense(raw) {
    const text = String(raw).trim().replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/٫/g, '.').replace(/٬/g, ',').replace(/[−–—]/g, '-');
    const matches = [...text.matchAll(/-?\d[\d,.]*/g)];
    if (matches.length !== 1) throw Error('اكتب مبلغًا واحدًا فقط، مثل: قهوة 65');
    const token = matches[0][0];
    if (matches[0].index > 0 && text[matches[0].index - 1] === '.') throw Error('الكسور غير مدعومة. اكتب مبلغًا صحيحًا بلا فواصل عشرية، مثل: 65');
    if (token.includes('.')) throw Error('الكسور غير مدعومة. اكتب مبلغًا صحيحًا بلا فواصل عشرية، مثل: 65');
    if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)$/.test(token)) throw Error('المبلغ غير صحيح. استخدم رقمًا موجبًا صحيحًا بدون كسور.');
    const amount = Number(token.replace(/,/g, ''));
    if (!Number.isSafeInteger(amount) || amount <= 0 || amount > 100000000) throw Error('أدخل مبلغًا موجبًا لا يتجاوز 100 مليون.');
    const title = text.replace(token, '').replace(/جنيه|ج\.م|ر\.س|د\.إ|﷼|ريال|درهم|دولار|usd|\$/gi, '').replace(/\s+/g, ' ').trim();
    if (!title || /مهمة|مقابلة|الساعة|موعد/.test(title)) throw Error('هذا الحقل للمصروفات فقط. اكتب وصف المصروف والمبلغ.');
    return {title: title.slice(0, 200), amount, category: /فاتورة|اشتراك|إنترنت/.test(title) ? 'فواتير' : 'مشتريات'};
  }
  function valid(state) {
    return state && state.version === 2 && Array.isArray(state.expenses) && state.expenses.length <= 10000 && state.expenses.every(x => typeof x.title === 'string' && x.title.length <= 200 && Number.isSafeInteger(x.amount) && x.amount > 0 && x.amount <= 100000000 && ['فواتير','مشتريات'].includes(x.category)) && Array.isArray(state.tasks) && state.tasks.length === 2 && state.tasks.every(x => typeof x === 'boolean');
  }
  /* Upgrades old v1 data (amounts kept as piastres) to v2 whole amounts. */
  function migrate(parsed) {
    if (parsed && parsed.version === 1 && Array.isArray(parsed.expenses)) {
      const expenses = parsed.expenses
        .filter(x => x && typeof x.title === 'string' && Number.isSafeInteger(x.cents) && x.cents > 0)
        .map(x => ({title: x.title.slice(0, 200), amount: Math.round(x.cents / 100), category: ['فواتير','مشتريات'].includes(x.category) ? x.category : 'مشتريات'}))
        .filter(x => x.amount > 0 && x.amount <= 100000000)
        .slice(0, 10000);
      const tasks = Array.isArray(parsed.tasks) && parsed.tasks.length === 2 && parsed.tasks.every(x => typeof x === 'boolean') ? parsed.tasks : [false, false];
      return {version: 2, expenses, tasks};
    }
    return parsed;
  }
  const api = {parseExpense, valid, migrate, initial: () => ({version:2, expenses:[], tasks:[false,false]})};
  if (typeof module !== 'undefined') module.exports = api;
  root.Masrofy = api;
})(typeof window === 'undefined' ? globalThis : window);
