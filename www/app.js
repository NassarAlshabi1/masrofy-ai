(() => {
  let spent = 4250;
  const limit = 8000;
  const input = document.querySelector('input[type="text"]');
  const sendBtn = document.querySelector('button[aria-label="إرسال"]');
  const ringCircle = document.querySelectorAll('svg circle')[1];
  const pctLabel = ringCircle?.closest('.relative')?.querySelector('.text-headline-md');
  const remLabel = document.querySelector('.text-currency-stat');
  const spentLabel = Array.from(document.querySelectorAll('span')).find((s) =>
    s.textContent.includes('4,250')
  );
  const txSection = Array.from(document.querySelectorAll('section')).find((s) =>
    s.textContent.includes('آخر العمليات')
  );
  const txList = txSection ? txSection.querySelector('div:last-child') : null;

  function updateBudgetUI() {
    const rem = Math.max(0, limit - spent);
    const pct = Math.min(100, Math.round((spent / limit) * 100));
    if (remLabel) remLabel.textContent = rem.toLocaleString('en-US');
    if (spentLabel) spentLabel.textContent = spent.toLocaleString('en-US') + ' ج.م';
    if (pctLabel) pctLabel.textContent = pct + '%';
    if (ringCircle) {
      ringCircle.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      ringCircle.style.strokeDashoffset = String(251.2 * (1 - pct / 100));
    }
  }

  function addSmartEntry(raw) {
    const text = (raw || '').trim();
    if (!text) return;
    const numMatch = text.match(/(\d+)/);
    if (numMatch) {
      const amount = parseInt(numMatch[1], 10);
      const title = text.replace(numMatch[0], '').replace(/جنيه|ج\.م/g, '').trim() || 'مصروف يومي';
      let cat = '🍽️ مقاهي ومطاعم';
      let icon = 'restaurant';
      if (/أوبر|مواصلات|بنزين/.test(text)) {
        cat = '🚗 تنقل ومواصلات';
        icon = 'directions_car';
      } else if (/نت|فاتورة|اشتراك/.test(text)) {
        cat = '💻 تقنية واشتراكات';
        icon = 'wifi';
      }
      spent += amount;
      updateBudgetUI();
      if (txList) {
        const card = document.createElement('div');
        card.className =
          'p-3.5 rounded-xl bg-surface-container/90 border border-primary/40 backdrop-blur-md flex items-center justify-between transition-all';
        card.innerHTML = `<div class="flex items-center gap-3"><div class="w-11 h-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0"><span class="material-symbols-outlined text-2xl">${icon}</span></div><div class="flex flex-col"><div class="flex items-center gap-2"><span class="text-body-md font-semibold text-on-surface">${title}</span><span class="text-[10px] text-primary bg-primary/15 px-1.5 py-0.5 rounded">✨ مصنفة بالـ AI الآن</span></div><div class="flex items-center gap-2 mt-0.5 text-label-sm text-on-surface-variant"><span>${cat}</span><span>•</span><span>الآن</span></div></div></div><div class="flex flex-col items-end"><span class="text-body-lg font-bold text-error" dir="ltr">−${amount} ج.م</span><span class="text-[10px] text-on-surface-variant">محفظة ذكية</span></div>`;
        txList.prepend(card);
      }
    }
    if (input) input.value = '';
  }

  sendBtn?.addEventListener('click', () => addSmartEntry(input?.value));
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addSmartEntry(input.value);
  });
  document.querySelectorAll('button[aria-label="اكتمال المهمة"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('bg-primary');
      btn.classList.toggle('border-primary');
    });
  });
})();
