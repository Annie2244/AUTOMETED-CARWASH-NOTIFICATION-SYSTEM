const pagesByRole = { admin: 'admin.html', attendant: 'attendant.html', customer: 'customer.html' };
const userStorageKey = 'carwash-users';

function getUsers() {
  return JSON.parse(localStorage.getItem(userStorageKey) || '[]');
}

function showToast(message, type = 'success') {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = message;
  toast.className = `toast toast-${type} toast-visible`;
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove('toast-visible'), 3200);
}

function getLinkLabel(link) {
  const textNode = Array.from(link.childNodes).find(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
  );
  return textNode ? textNode.textContent.trim() : link.textContent.trim();
}

function setActiveLink(clickedLink, updateTitle = false) {
  const links = Array.from(document.querySelectorAll('.sidebar-list-item a')).filter(
    (link) => link.dataset.action !== 'logout'
  );
  if (!links.length) return;

  const currentFile = window.location.pathname.split('/').pop();
  let activeLink = clickedLink;
  if (!activeLink) {
    activeLink = links.find((link) => link.getAttribute('href') === currentFile);
  }
  if (!activeLink) activeLink = links[0];

  links.forEach((link) => link.classList.remove('active'));
  activeLink.classList.add('active');

  if (updateTitle) {
    const mainTitle = document.querySelector('.main-title h2');
    if (mainTitle) mainTitle.textContent = getLinkLabel(activeLink).toUpperCase();
  }
}

function openSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.add('sidebar-open');
  document.querySelector('.sidebar-backdrop')?.classList.add('sidebar-backdrop-visible');
  document.querySelector('.menu-icon')?.setAttribute('aria-expanded', 'true');
  document.querySelector('.menu-icon')?.focus?.();
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  sidebar.classList.remove('sidebar-open');
  document.querySelector('.sidebar-backdrop')?.classList.remove('sidebar-backdrop-visible');
  document.querySelector('.menu-icon')?.setAttribute('aria-expanded', 'false');
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;
  if (sidebar.classList.contains('sidebar-open')) closeSidebar();
  else openSidebar();
}

function addDashboardBackground() {
  if (!document.body.classList.contains('dashboard-page')) return;
  const video = document.createElement('video');
  video.className = 'dashboard-background-video';
  video.autoplay = true;
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute('aria-hidden', 'true');
  video.innerHTML = '<source src="../../backgroundvideo.mp4" type="video/mp4">';
  const overlay = document.createElement('div');
  overlay.className = 'dashboard-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.prepend(overlay);
  document.body.prepend(video);
}

function initialiseDashboard() {
  if (!document.body.classList.contains('dashboard-page')) return;
  addDashboardBackground();
  const sidebarBackdrop = document.createElement('button');
  sidebarBackdrop.type = 'button';
  sidebarBackdrop.className = 'sidebar-backdrop';
  sidebarBackdrop.setAttribute('aria-label', 'Close navigation menu');
  sidebarBackdrop.addEventListener('click', () => {
    closeSidebar();
  });
  document.body.append(sidebarBackdrop);
  const sidebarList = document.querySelector('.sidebar-list');
  if (sidebarList && !sidebarList.querySelector('[data-action="logout"]')) {
    const logoutItem = document.createElement('li');
    logoutItem.className = 'sidebar-list-item sidebar-logout';
    logoutItem.innerHTML = '<a href="index.html" data-action="logout"><span class="material-icons-outlined">logout</span> Logout</a>';
    sidebarList.append(logoutItem);
  }
  document.querySelector('.menu-icon')?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleSidebar();
  });
  document.querySelector('.close-sidebar')?.addEventListener('click', closeSidebar);
  document.querySelectorAll('.sidebar-list-item a').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (link.dataset.action === 'logout') {
        event.preventDefault();
        localStorage.removeItem('carwash-current-user');
        window.location.href = 'index.html';
        return;
      }
      // Page links (e.g. customer-bookings.html) navigate normally; hash links scroll on the same page
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) {
        closeSidebar();
        return;
      }
      event.preventDefault();
      const target = document.getElementById(href.slice(1));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      window.location.hash = href;
      setActiveLink(link, true);
      closeSidebar();
      showToast(`${getLinkLabel(link)} selected.`);
    });
  });
  document.querySelectorAll('.product-button').forEach((button) => {
    button.addEventListener('click', () => showToast('This action is ready to connect to your backend.'));
  });
  document.querySelectorAll('.text-button').forEach((button) => {
    button.addEventListener('click', () => showToast(`${button.textContent.trim()} selected.`));
  });
  document.querySelectorAll('.notification-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      showToast('Notification sent to the selected customer.');
    });
  });
  const bookingForm = document.querySelector('.booking-form');
  const availabilityButton = document.getElementById('availability-button');
  const availabilityMessage = document.querySelector('.availability-message');
  const serviceSelect = bookingForm?.querySelector('[name="service"]');
  const summary = document.getElementById('booking-summary');

  function updateBookingSummary() {
    if (!serviceSelect || !summary) return;
    const [service, amount] = serviceSelect.value.split('|');
    summary.textContent = `${service} · KSh ${amount}`;
  }

  serviceSelect?.addEventListener('change', updateBookingSummary);
  availabilityButton?.addEventListener('click', () => {
    if (!bookingForm.reportValidity()) return;
    availabilityMessage.textContent = 'This time slot is available. You can proceed to payment.';
  });
  document.querySelectorAll('.payment-option').forEach((option) => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach((item) => item.classList.remove('active'));
      option.classList.add('active');
      option.querySelector('input').checked = true;
    });
  });
  bookingForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!bookingForm.reportValidity()) return;
    updateBookingSummary();
    showToast('Booking created successfully. Payment is recorded for this demo.');
  });
  updateBookingSummary();
  setActiveLink();
  const hashTarget = document.getElementById(window.location.hash.slice(1));
  if (hashTarget) hashTarget.scrollIntoView({ behavior: 'smooth' });
  window.addEventListener('hashchange', () => {
    setActiveLink();
    const target = document.getElementById(window.location.hash.slice(1));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
  // Remove potential UI-locking by ensuring sidebar-backdrop never blocks clicks permanently
  // (Intentionally no global click handlers here; sidebar handled only by menu button + backdrop.)

  document.querySelectorAll('.header-right .material-icons-outlined').forEach((icon) => {
    icon.setAttribute('tabindex', '0');
    icon.setAttribute('role', 'button');
    icon.setAttribute('aria-label', `${icon.textContent.trim()} panel`);
    const action = () => showToast(`${icon.textContent.trim()} panel opened.`);
    icon.addEventListener('click', action);
    icon.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') action();
    });
  });
}

function initialiseRegistration() {
  const form = document.querySelector('#register-form form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const name = formData.get('name').trim();
    const email = formData.get('email').trim().toLowerCase();
    const password = formData.get('password');
    const role = formData.get('role');
    const users = getUsers();
    if (users.some((user) => user.email === email)) {
      showToast('An account with this email already exists.', 'error');
      return;
    }
    users.push({ name, email, password, role });
    localStorage.setItem(userStorageKey, JSON.stringify(users));
    localStorage.setItem('carwash-current-user', JSON.stringify({ name, email, role }));
    window.location.href = pagesByRole[role];
  });
}

function initialiseLogin() {
  const form = document.querySelector('#login-form form');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email').trim().toLowerCase();
    const password = formData.get('password');
    const user = getUsers().find((entry) => entry.email === email && entry.password === password);
    if (!user) {
      showToast('Incorrect email or password. Register an account first.', 'error');
      return;
    }
    localStorage.setItem('carwash-current-user', JSON.stringify({ name: user.name, email: user.email, role: user.role }));
    window.location.href = pagesByRole[user.role];
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initialiseDashboard();
  initialiseRegistration();
  initialiseLogin();
});
