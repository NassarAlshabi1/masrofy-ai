(() => {
  const key = 'masrofy-example-v1';
  const $ = selector => document.querySelector(selector);
  const input = $('input[type="text"]');
  const status = $('#entry-status');
  let state = Masrofy.initial();
  let storageReady = true;
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!Masrofy.valid(parsed)) throw Error('invalid data');
      state = parsed;
    }
  } catch (_) { storageReady = false; }
  function message(text) { status.textContent = text; }
  function save(next) {
    if (!storageReady) { message('تعذر قراءة البيانات المحفوظة. لن نستبدلها؛ جرّب إعادة فتح التطبيق أو راجع إعدادات التخزين.'); return false; }
    try { localStorage.setItem(key, JSON.stringify(next)); state = next; return true; }
    catch (_) { message('تعذر الحفظ. لم يتم تسجيل التغيير؛ تحقق من المساحة أو إعدادات التخزين.'); return false; }
  }
  let filter = 'الكل';
  const fmt = n => (n / 100).toLocaleString('ar-EG', {maximumFractionDigits:2});
  function render() {
    const total = state.expenses.reduce((sum, x) => sum + x.cents, 0);
    const budget = 800000;
    const pct = Math.round(total / budget * 100);
    $('#spent').textContent = fmt(total) + ' ج.م';
    $('.text-currency-stat').textContent = fmt(budget - total);
    $('#budget-percent').textContent = pct + '%';
    $('#budget-ring').style.strokeDashoffset = String(251.2 * (1 - Math.min(100, pct) / 100));
    $('#remaining-note').textContent = total > budget ? 'تجاوزت الميزانية بـ ' + fmt(total - budget) + ' ج.م' : 'متبقي ' + Math.round((budget-total)/budget*100) + '%';
    const list = $('#transactions');
    list.replaceChildren();
    const items = state.expenses.filter(x => filter === 'الكل' || x.category === filter);
    if (!items.length) { const p = document.createElement('p'); p.textContent = 'لا توجد عمليات هنا بعد.'; list.append(p); }
    items.slice().reverse().forEach(x => {
      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-xl bg-surface-container border border-outline-variant flex items-center justify-between gap-3';
      const title = document.createElement('span'); title.textContent = x.title;
      const amount = document.createElement('span'); amount.textContent = fmt(x.cents) + ' ج.م'; amount.className = 'text-primary whitespace-nowrap';
      card.append(title, amount); list.append(card);
    });
    document.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    document.querySelectorAll('button[aria-label="اكتمال المهمة"]').forEach((b, i) => { b.classList.toggle('bg-primary', state.tasks[i]); b.setAttribute('aria-pressed', String(state.tasks[i])); });
    $('#task-heading').textContent = 'مهام تجريبية (' + state.tasks.filter(x=>!x).length + ' متبقية)';
  }
  function add() {
    try {
      const expense = Masrofy.parseExpense(input.value);
      if (state.expenses.length >= 10000) throw Error('وصلت لحد العمليات في هذا المثال.');
      if (save({...state, expenses:[...state.expenses, expense]})) { render(); input.value = ''; message('تم حفظ المصروف على هذا الجهاز.'); }
    } catch (error) { message(error.message); }
  }
  $('button[aria-label="إرسال"]').addEventListener('click', add);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) add(); });
  document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();}));
  document.querySelectorAll('button[aria-label="اكتمال المهمة"]').forEach((b,i)=>b.addEventListener('click',()=>{const tasks=state.tasks.slice();tasks[i]=!tasks[i];if(save({...state,tasks}))render();}));
  document.querySelectorAll('button').forEach(b => {
    const label = b.getAttribute('aria-label');
    if (label === 'إضافة ذكية') b.addEventListener('click', () => input.focus());
    else if (label === 'الرئيسية') b.addEventListener('click', () => window.scrollTo({top:0}));
    else if (label === 'المهام') b.addEventListener('click', () => $('#task-heading').scrollIntoView());
    else if (!b.dataset.filter && !['إرسال','اكتمال المهمة'].includes(label)) {
      b.disabled = true; b.title = 'واجهة توضيحية غير مفعّلة في هذا المثال'; b.classList.add('opacity-50');
    }
  });
  render();
  message(storageReady ? 'مثال تعليمي: بيانات محلية على هذا الجهاز، بلا سحابة أو نموذج AI. الميزانية التجريبية 8000 جنيه.' : 'تعذر قراءة التخزين. لن يتم استبدال بياناتك الحالية.');
})();
