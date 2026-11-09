const events = [
  { id: 'web', date: '21 ноября', city: 'Москва', format: 'Очно', title: 'Веб без границ', description: 'Интерфейсы, доступность и инженерные решения для современного веба.', color: 'lavender', mark: '✳︎', end: '2026-11-21T18:00:00+03:00' },
  { id: 'data', date: '5 декабря', city: 'Казань', format: 'Гибрид', title: 'Данные в продукте', description: 'Как команды превращают исследования и метрики в продуктовые решения.', color: 'mint', mark: '◉', end: '2026-12-05T18:00:00+03:00' },
  { id: 'design', date: '10 октября', city: 'Онлайн', format: 'Онлайн', title: 'Дизайн в деталях', description: 'Дизайн-системы, прототипы и проверка пользовательских сценариев.', color: 'peach', mark: '✺', end: '2026-10-10T18:00:00+03:00' },
];
const statusNames = { new: 'Новая', assigned: 'Назначено', completed: 'Завершено' };
const nextStatus = { new: 'assigned', assigned: 'completed' };
const payments = { card: 'Банковская карта', invoice: 'Счёт для организации' };
const demo = { name: 'Александра Волкова', login: 'demo', email: 'demo@example.org', phone: '+7 900 123-45-67' };
const pages = new Set(['catalog', 'login', 'register', 'apply', 'applications', 'admin', 'profile', 'review']);
const main = document.querySelector('main');
const seed = [
  { id: 'a1', event: 'design', owner: 'demo', name: demo.name, status: 'completed', payment: 'card' },
  { id: 'a2', event: 'data', owner: 'other', name: 'Даниил Орлов', status: 'assigned', payment: 'invoice' },
  { id: 'a3', event: 'web', owner: 'other', name: 'Ирина Соколова', status: 'new', payment: 'card' },
];

function loadApplications() {
  try { return JSON.parse(localStorage.getItem('conferences-applications-v1')) ?? seed; }
  catch { return seed; }
}

let applications = loadApplications();
let user = demo;
let notice = '';
let filters = { status: '', event: '' };

function saveApplications() {
  try { localStorage.setItem('conferences-applications-v1', JSON.stringify(applications)); }
  catch { /* The demo remains usable without browser storage. */ }
}

function escapeHTML(value) {
  const characters = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, character => characters[character]);
}

function heading(label, title, description) {
  return `<header class="page-heading"><span class="eyebrow">${label}</span><h1>${title}</h1><p class="lede">${description}</p></header>`;
}

function eventOptions(selected = '') {
  return events.map(event => `<option value="${event.id}" ${event.id === selected ? 'selected' : ''}>${event.title}</option>`).join('');
}

function canReview(application) {
  const event = events.find(item => item.id === application.event);
  return application.owner === user.login && application.status === 'completed' &&
    Date.now() >= Date.parse(event.end) && !application.review;
}

function catalog() {
  return `<section class="hero"><span class="eyebrow">Афиша профессиональных событий</span>
    <h1>Люди и идеи, которые встречаются</h1>
    <p>Конференции по вебу, дизайну и данным. Выберите событие и отслеживайте заявку в личном кабинете.</p>
    <a class="button" href="#applications">Посмотреть мои заявки</a></section>
    <section aria-labelledby="events-title"><div class="section-heading"><h2 id="events-title">Программа событий</h2><span class="muted">3 события</span></div>
    <div class="grid">${events.map(event => {
      const past = Date.now() >= Date.parse(event.end);
      return `<article class="card"><div class="card-banner ${event.color}"><div><span class="eyebrow">${event.format}</span><b>${event.date}</b></div><i aria-hidden="true">${event.mark}</i></div>
        <div class="card-body"><span class="eyebrow muted">${event.city}</span><h3>${event.title}</h3><p>${event.description}</p>
        ${past ? '<span class="badge completed">Событие прошло</span>' : `<a class="button secondary" href="#apply/${event.id}">Подать заявку</a>`}</div></article>`;
    }).join('')}</div></section>`;
}

function formPage(label, title, description, id, fields, submit, aside) {
  return `${heading(label, title, description)}<div class="form-layout">
    <form class="panel" data-form="${id}"><p class="error" role="alert"></p>${fields}<button class="button" type="submit">${submit}</button></form>
    <aside class="panel form-aside">${aside}</aside></div>`;
}

function login() {
  return formPage('Аккаунт', 'Вход', 'Войдите, чтобы открыть личный кабинет.', 'login',
    `<label>Логин<input name="login" required autocomplete="username"></label>
    <label>Пароль<input name="password" type="password" required autocomplete="current-password"></label>`, 'Войти',
    '<h2>Демо-вход</h2><p>Логин <strong>demo</strong>, пароль <strong>demo2026</strong>.</p><a href="#register">Создать учебный профиль</a>');
}

function register() {
  return formPage('Аккаунт', 'Регистрация', 'Создайте учебный профиль участника.', 'register',
    `<label>Имя и фамилия<input name="name" required maxlength="80" autocomplete="name"></label>
    <label>Логин<input name="login" required pattern="[a-zA-Z0-9_]{3,24}" autocomplete="username" aria-describedby="login-hint"><small id="login-hint">3–24 латинские буквы, цифры или подчёркивания</small></label>
    <label>Электронная почта<input name="email" type="email" required maxlength="120" autocomplete="email"></label>
    <label>Телефон<input name="phone" type="tel" required pattern="[+]7[ ][0-9]{3}[ ][0-9]{3}-[0-9]{2}-[0-9]{2}" autocomplete="tel" placeholder="+7 900 123-45-67" aria-describedby="phone-hint"><small id="phone-hint">Формат +7 900 123-45-67</small></label>
    <label>Пароль<input name="password" type="password" required minlength="8" maxlength="128" autocomplete="new-password"><small>От 8 символов. Используйте вымышленные данные.</small></label>`,
    'Создать профиль', '<h2>Уже есть профиль?</h2><p>В учебной версии профиль действует до обновления страницы.</p><a href="#login">Перейти ко входу</a>');
}

function apply(eventId) {
  const openEvents = events.filter(event => Date.now() < Date.parse(event.end));
  if (!openEvents.length) return `${heading('Участие', 'Новая заявка', 'Сейчас нет мероприятий с открытой подачей.')}<a class="button" href="#catalog">В афишу</a>`;
  const options = openEvents.map(event => `<option value="${event.id}" ${event.id === eventId ? 'selected' : ''}>${event.title}</option>`).join('');
  return formPage('Участие', 'Новая заявка', 'Выберите конференцию и способ оплаты.', 'apply',
    `<label>Конференция<select name="event" required><option value="">Выберите мероприятие</option>${options}</select></label>
    <label>Способ оплаты<select name="payment" required><option value="">Выберите способ оплаты</option><option value="card">Банковская карта</option><option value="invoice">Счёт для организации</option></select></label>
    <label>Комментарий<textarea name="note" maxlength="400" placeholder="Например, вопрос организатору"></textarea></label>`,
    'Отправить заявку', '<h2>Что дальше</h2><p>Заявка появится в списке со статусом «Новая». Оплата в учебном интерфейсе не проводится.</p>');
}

function row(application, admin = false) {
  const event = events.find(item => item.id === application.event);
  const action = admin && nextStatus[application.status]
    ? `<button class="button quiet" type="button" data-next="${application.id}">${application.status === 'new' ? 'Назначить' : 'Завершить'}</button>`
    : !admin && canReview(application) ? `<a class="button secondary" href="#review/${application.id}">Оставить отзыв</a>` : '';
  return `<article class="panel list-row"><div><span class="eyebrow muted">${event.date} · ${event.city}</span>
    <h3>${event.title}</h3><p class="muted">${admin ? escapeHTML(application.name) + ' · ' : ''}${payments[application.payment]}</p>
    ${application.review ? `<p>Отзыв: ${application.review.rating} из 5 · ${escapeHTML(application.review.body)}</p>` : ''}</div>
    <div class="inline"><span class="badge ${application.status}">${statusNames[application.status]}</span>${action}</div></article>`;
}

function myApplications() {
  const list = applications.filter(application => application.owner === user.login);
  return `${heading('Участие', 'Мои заявки', 'Следите за статусом участия и оставляйте отзывы после конференций.')}
    <div class="stack">${list.length ? list.map(application => row(application)).join('') : '<div class="panel"><p>У вас пока нет заявок.</p><a class="button" href="#catalog">Выбрать конференцию</a></div>'}</div>`;
}

function adminRows() {
  const list = applications.filter(application =>
    (!filters.status || application.status === filters.status) && (!filters.event || application.event === filters.event));
  return list.length ? list.map(application => row(application, true)).join('') : '<p class="panel">По этим фильтрам ничего не найдено. Измените параметры поиска.</p>';
}

function admin() {
  const statuses = Object.entries(statusNames).map(([key, name]) => `<option value="${key}" ${key === filters.status ? 'selected' : ''}>${name}</option>`).join('');
  return `${heading('Организатор · Демо', 'Панель администратора', 'Фильтруйте заявки по мероприятию и статусу.')}
    <div class="panel filters"><label>Статус<select data-filter="status"><option value="">Все статусы</option>${statuses}</select></label>
    <label>Конференция<select data-filter="event"><option value="">Все конференции</option>${eventOptions(filters.event)}</select></label></div>
    <div class="stack" id="admin-results" aria-live="polite">${adminRows()}</div>`;
}

function profile() {
  const count = applications.filter(application => application.owner === user.login).length;
  return `${heading('Аккаунт', 'Личный кабинет', 'Контактные данные учебного профиля.')}
    <div class="form-layout"><section class="panel profile"><h2>${escapeHTML(user.name)}</h2><dl><dt>Логин</dt><dd>${escapeHTML(user.login)}</dd>
    <dt>Электронная почта</dt><dd>${escapeHTML(user.email)}</dd><dt>Телефон</dt><dd>${escapeHTML(user.phone)}</dd></dl></section>
    <aside class="panel form-aside"><h2>Заявки</h2><p>Всего заявок: ${count}</p><a class="button secondary" href="#applications">Мои заявки</a></aside></div>`;
}

function review(id) {
  const application = applications.find(item => item.id === id);
  if (!application || !canReview(application)) return `${heading('Участие', 'Отзыв недоступен', 'Отзыв можно оставить один раз после завершения конференции.')}<a class="button" href="#applications">К моим заявкам</a>`;
  return formPage('Участие', 'Отзыв о конференции', 'Оцените мероприятие и поделитесь впечатлениями.', 'review',
    `<label>Оценка<select name="rating" required><option value="">Выберите оценку</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>
    <label>Отзыв<textarea name="body" required maxlength="400"></textarea></label>`, 'Сохранить отзыв',
    `<h2>${events.find(event => event.id === application.event).title}</h2><p>Отзыв будет виден в карточке вашей заявки.</p>`);
}

const views = { catalog, login, register, apply, applications: myApplications, admin, profile, review };

function currentRoute() {
  const [name, id] = location.hash.slice(1).split('/');
  return { name: pages.has(name) ? name : 'catalog', id };
}

function render(moveFocus = false) {
  const { name, id } = currentRoute();
  main.innerHTML = `<div class="view">${notice ? `<div class="notice" role="status">${notice}</div>` : ''}${views[name](id)}</div>`;
  notice = '';
  document.querySelectorAll('nav a').forEach(link => {
    if (link.hash === '#' + name) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.querySelector('.nav-more').open = false;
  if (moveFocus) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

function navigate(name, message) {
  notice = message;
  if (location.hash === '#' + name) render(true);
  else location.hash = name;
}

main.addEventListener('submit', event => {
  const form = event.target;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const error = message => { form.querySelector('.error').textContent = message; };
  switch (form.dataset.form) {
    case 'login':
      if (data.login !== 'demo' || data.password !== 'demo2026') return error('Проверьте логин и пароль.');
      user = demo;
      return navigate('profile', 'Выполнен вход в демо-профиль.');
    case 'register':
      if (!data.name.trim()) return error('Введите имя и фамилию.');
      if (['demo', 'other', user.login].includes(data.login.toLowerCase()) || data.email.toLowerCase() === demo.email) return error('Этот логин или email уже используется.');
      user = { name: data.name.trim(), login: data.login.toLowerCase(), email: data.email, phone: data.phone };
      return navigate('profile', 'Учебный профиль создан.');
    case 'apply': {
      const conference = events.find(item => item.id === data.event);
      if (!conference || Date.now() >= Date.parse(conference.end) || !Object.hasOwn(payments, data.payment)) return error('Выберите доступную конференцию и способ оплаты.');
      if (applications.some(item => item.owner === user.login && item.event === data.event)) return error('На эту конференцию уже есть заявка.');
      applications = [{ id: 'a-' + Date.now(), event: data.event, owner: user.login, name: user.name, status: 'new', payment: data.payment, note: data.note.trim() }, ...applications];
      saveApplications();
      return navigate('applications', 'Заявка отправлена.');
    }
    case 'review': {
      const application = applications.find(item => item.id === currentRoute().id);
      const rating = Number(data.rating);
      if (!application || !canReview(application) || !Number.isInteger(rating) || rating < 1 || rating > 5 || !data.body.trim()) return error('Укажите оценку от 1 до 5 и текст отзыва.');
      application.review = { rating, body: data.body.trim() };
      saveApplications();
      return navigate('applications', 'Отзыв сохранён.');
    }
  }
});

main.addEventListener('change', event => {
  const filter = event.target.dataset.filter;
  if (!filter) return;
  filters[filter] = event.target.value;
  document.querySelector('#admin-results').innerHTML = adminRows();
});

main.addEventListener('click', event => {
  const button = event.target.closest('[data-next]');
  if (!button) return;
  const application = applications.find(item => item.id === button.dataset.next);
  if (!application || !nextStatus[application.status]) return;
  application.status = nextStatus[application.status];
  saveApplications();
  navigate('admin', 'Статус заявки изменён.');
});

document.querySelector('.skip-link').addEventListener('click', event => {
  event.preventDefault();
  main.focus();
});

window.addEventListener('hashchange', () => render(true));
render();
