(() => {
  const form = document.getElementById('service-plan');
  if (!form) return;
  const status = document.getElementById('plan-status');
  const preview = document.getElementById('plan-preview');
  const checkboxes = [...form.querySelectorAll('input[name="services"]')];
  let started = false;
  const track = (event, extra = {}) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, source_page: '/services/', device_type: window.innerWidth <= 640 ? 'mobile' : 'desktop', ...extra });
  };
  const selected = () => checkboxes.filter(input => input.checked).map(input => input.value);
  const updateSummary = () => {
    const data = new FormData(form);
    const lines = [
      `${data.get('site_type') || 'Site type to confirm'} in ${data.get('city') || 'city to confirm'}`,
      `Services: ${selected().join(', ') || 'To discuss'}`,
      `Personnel: ${data.get('personnel') || 'To confirm'} · Shift: ${data.get('shift') || 'To confirm'}`,
      `Equipment: ${data.get('equipment') || 'To discuss'}`,
      `Start date: ${data.get('start_date') || 'To confirm'}`
    ];
    for (const [key, label] of [['site_location','Site location'],['name','Name'],['phone','Mobile'],['organisation','Organisation'],['requirement','Requirement']]) {
      const value = String(data.get(key) || '').trim();
      if (value) lines.push(`${label}: ${value}`);
    }
    const summary = lines.join('\n');
    preview.textContent = summary;
    document.getElementById('enquiry-summary').value = summary;
    return summary;
  };
  const validate = () => {
    const phone = form.elements.phone;
    const digits = phone.value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '').replace(/^0(?=\d{10}$)/, '');
    phone.setCustomValidity(/^[6-9]\d{9}$/.test(digits) ? '' : 'Enter a valid 10-digit Indian mobile number, optionally with +91.');
    if (!form.reportValidity()) return false;
    if (!selected().length) {
      status.textContent = 'Please select at least one service. कृपया कम से कम एक सेवा चुनें।';
      checkboxes[0].closest('details').open = true;
      checkboxes[0].focus();
      return false;
    }
    return true;
  };
  form.addEventListener('focusin', () => {
    if (!started) { track('site_assessment_start', { page_section: 'solution-builder' }); started = true; }
  });
  form.addEventListener('input', () => {
    form.elements.phone.setCustomValidity('');
    status.textContent = '';
    updateSummary();
  });
  form.addEventListener('change', event => {
    updateSummary();
    if (event.target.name === 'city') track('city_selected', { selected_city: event.target.value });
    if (event.target.name === 'services') track('service_selected', { service_category: event.target.dataset.category, service_name: event.target.value, selected: event.target.checked });
  });
  document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => {
    const input = checkboxes.find(box => box.value === link.dataset.service);
    if (input) { input.checked = true; input.closest('details').open = true; }
    updateSummary();
    track('service_card_open', { service_category: link.dataset.category, service_name: link.dataset.service, page_section: link.dataset.category });
    track('service_selected', { service_category: link.dataset.category, service_name: link.dataset.service, selected: true });
  }));
  document.querySelectorAll('[data-category-preset]').forEach(link => link.addEventListener('click', () => {
    const input = checkboxes.find(box => box.dataset.category === link.dataset.categoryPreset);
    if (input) { input.checked = true; input.closest('details').open = true; updateSummary(); }
  }));
  document.querySelectorAll('.svc-dimension').forEach(link => link.addEventListener('click', () => track('services_category_click', { service_category: link.dataset.category, page_section: 'navigator' })));
  const navigator = document.querySelector('.svc-dimensions');
  const dimensions = [...navigator.children];
  const dots = [...document.querySelectorAll('[data-dimension-index]')];
  dots.forEach((button, index) => button.addEventListener('click', () => navigator.scrollTo({ left: dimensions[index].offsetLeft - dimensions[0].offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })));
  navigator.addEventListener('scroll', () => {
    const index = dimensions.reduce((best, card, i) => Math.abs(card.offsetLeft - dimensions[0].offsetLeft - navigator.scrollLeft) < Math.abs(dimensions[best].offsetLeft - dimensions[0].offsetLeft - navigator.scrollLeft) ? i : best, 0);
    dots.forEach((button,i) => button.setAttribute('aria-pressed', String(index === i)));
  }, { passive: true });
  document.querySelectorAll('a[href^="tel:"]').forEach(link => link.addEventListener('click', () => track('call_click', { page_section: link.closest('section')?.id || 'page' })));
  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => link.addEventListener('click', () => track('whatsapp_click', { page_section: link.closest('section')?.id || 'page' })));
  document.getElementById('plan-whatsapp').addEventListener('click', () => {
    if (!validate()) return;
    const message = `Hello Captain A1, I would like a site assessment.\n\n${updateSummary()}`;
    track('service_plan_complete', { page_section: 'solution-builder', channel: 'whatsapp' });
    track('whatsapp_click', { page_section: 'solution-builder' });
    window.open(`https://wa.me/918003091425?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (form.elements.botcheck.checked || !validate()) return;
    updateSummary();
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    submit.textContent = 'Sending…';
    status.textContent = 'Sending your assessment request…';
    const data = new FormData(form);
    data.delete('botcheck');
    data.set('services', selected().join(', '));
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error('Submission not confirmed');
      status.textContent = 'Thank you. Your request has been sent. Our team will contact you to discuss your site. आपकी पूछताछ भेज दी गई है।';
      track('site_assessment_submit', { page_section: 'solution-builder', selected_city: form.elements.city.value });
      track('service_plan_complete', { page_section: 'solution-builder', channel: 'form' });
      form.reset();
      updateSummary();
      started = false;
    } catch {
      status.textContent = 'We could not confirm delivery. Your details are still here. Please try again or continue on WhatsApp. भेजने की पुष्टि नहीं हुई। कृपया पुनः प्रयास करें।';
    } finally {
      clearTimeout(timeout);
      submit.disabled = false;
      submit.textContent = 'Send assessment request ↗';
    }
  });
  const today = new Date();
  form.elements.start_date.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0,10);
  updateSummary();
})();
