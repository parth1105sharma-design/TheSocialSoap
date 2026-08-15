const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const header = $('.site-header');
addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 12), { passive: true });

const menu = $('.menu-toggle');
const nav = $('#site-nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', open);
  document.body.classList.toggle('menu-open', open);
  $('span', menu).textContent = open ? 'Close' : 'Menu';
});
$$('a', nav).forEach((link) => link.addEventListener('click', () => {
  menu?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  if (menu) $('span', menu).textContent = 'Menu';
}));

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
}), { threshold: .13 });
$$('.reveal').forEach((element) => revealObserver.observe(element));

// Desktop dropdowns never retain an open state once the pointer leaves their own container.
if (matchMedia('(min-width: 761px)').matches) {
  $$('details', nav).forEach((dropdown) => {
    dropdown.addEventListener('mouseleave', () => dropdown.removeAttribute('open'));
  });
}

const animateStat = (card) => {
  const value = Number(card.dataset.stat);
  const suffix = card.dataset.suffix || '';
  const output = $('strong', card);
  const duration = 1750;
  const start = performance.now();
  const frame = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    output.textContent = `${Math.round(value * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};

const stats = $$('.metric[data-stat]');
const statsObserver = new IntersectionObserver((entries, observer) => entries.forEach((entry) => {
  if (!entry.isIntersecting) return;
  const cards = $$('[data-stat]', entry.target);
  cards.forEach((card) => { card.classList.add('is-visible'); animateStat(card); });
  observer.unobserve(entry.target);
}), { threshold: .22 });
const metricGrid = $('.metric-grid');
if (metricGrid && stats.length) statsObserver.observe(metricGrid);

const booking = $('.booking');
if (booking) {
  const form = $('.booking-form', booking);
  const success = $('.booking-success', booking);
  const steps = $$('.booking-steps span', booking);
  const setStep = (step) => steps.forEach((item, index) => item.classList.toggle('active', index === step));
  const closeBooking = () => { booking.classList.remove('open'); booking.setAttribute('aria-hidden', 'true'); document.body.classList.remove('booking-open'); };
  const openBooking = () => { booking.classList.add('open'); booking.setAttribute('aria-hidden', 'false'); document.body.classList.add('booking-open'); $('.booking-close', booking).focus(); };
  const resetBooking = () => { form.hidden = false; success.hidden = true; setStep(0); };
  const setError = (input, message) => { const label = input.closest('label'); label.classList.toggle('has-error', Boolean(message)); $('small', label).textContent = message || ''; };
  const valid = () => {
    const name = $('[name="name"]', form), email = $('[name="email"]', form), phone = $('[name="phone"]', form);
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    const digits = phone.value.replace(/\D/g, '').replace(/^91/, '');
    const phoneValid = /^[6-9]\d{9}$/.test(digits);
    setError(name, name.value.trim() ? '' : 'Please enter your name.');
    setError(email, emailValid ? '' : 'Please enter a valid email address.');
    setError(phone, phoneValid ? '' : 'Please enter a valid contact number.');
    return Boolean(name.value.trim() && emailValid && phoneValid);
  };
  $$('[data-booking-open]').forEach((button) => button.addEventListener('click', () => { resetBooking(); openBooking(); }));
  $$('[data-booking-close]').forEach((button) => button.addEventListener('click', closeBooking));
  addEventListener('keydown', (event) => { if (event.key === 'Escape' && booking.classList.contains('open')) closeBooking(); });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!valid()) return;
    const details = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem('thesocialsoap-latest-enquiry', JSON.stringify(details));
    form.hidden = true; success.hidden = false; setStep(1);
    $('.success-summary', booking).textContent = `${details.name} · ${details.email}${details.instagram ? ` · ${details.instagram}` : ''}`;
  });
  $('.done-booking', booking).addEventListener('click', () => { form.reset(); closeBooking(); });
}
