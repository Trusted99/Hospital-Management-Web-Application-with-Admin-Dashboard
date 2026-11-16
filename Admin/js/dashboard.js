/**
 * dashboard.js - Main Dashboard Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initialize Action listeners
  AppointmentActions.init();

  // 2. Fetch and render data
  await loadDashboardMetrics();
  await loadTodaySchedule();
  await loadPendingQueue();

  // 3. Bind Search and Calendar features
  initSearch();
  initCalendarHighlight();
});

/**
 * Loads overview metrics into stat cards and the donut chart
 */
async function loadDashboardMetrics() {
  const summary = await API.getDashboardSummary();
  if (!summary) return;

  const totalPatientsEl = document.getElementById('statTotalPatients');
  const todayPatientsEl = document.getElementById('statTodayPatients');
  const todayApptEl = document.getElementById('statTodayAppointments');
  const todayDateLabel = document.getElementById('todayDateLabel');
  const todayApptLabel = document.getElementById('todayApptLabel');

  if (totalPatientsEl) totalPatientsEl.textContent = summary.totalPatients;
  if (todayPatientsEl) todayPatientsEl.textContent = summary.todayPatients;
  if (todayApptEl) todayApptEl.textContent = summary.todayAppointments;
  if (todayDateLabel) todayDateLabel.textContent = summary.dateLabel;
  if (todayApptLabel) todayApptLabel.textContent = summary.dateLabel;
}

/**
 * Populates "Today's Appointments" queue
 */
async function loadTodaySchedule() {
  const schedule = await API.getTodaySchedule();
  const container = document.getElementById('todayMiniList');
  if (!container || !schedule) return;

  container.innerHTML = '';

  schedule.forEach((item) => {
    const isOngoing = item.time.toLowerCase().includes('going') || item.status === 'ONGOING';
    const badgeClass = isOngoing ? 'time-badge ongoing' : 'time-badge';

    const itemEl = document.createElement('div');
    itemEl.className = 'appointment-mini-item';
    itemEl.innerHTML = `
      <div class="patient-snippet">
        <img src="${item.avatar}" class="avatar-sm" alt="${item.patientName}">
        <div class="patient-name-diag">
          <h4>${escapeHtml(item.patientName)}</h4>
          <p>${escapeHtml(item.diagnosis)}</p>
        </div>
      </div>
      <span class="${badgeClass}">${item.time}</span>
    `;
    container.appendChild(itemEl);
  });
}

/**
 * Populates the Human-In-The-Loop review queue
 */
async function loadPendingQueue() {
  const requests = await API.getPendingRequests();
  const container = document.getElementById('hitlRequestList');
  if (!container || !requests) return;

  container.innerHTML = '';

  requests.forEach((req) => {
    const urgencyClass =
      req.urgency === 'HIGH' ? 'urgency-high' : req.urgency === 'MEDIUM' ? 'urgency-medium' : 'urgency-low';

    const row = document.createElement('div');
    row.className = 'request-item';
    row.id = `req-row-${req.id}`;
    row.innerHTML = `
      <div class="patient-snippet">
        <img src="${req.avatar}" class="avatar-sm" alt="${req.patientName}">
        <div class="patient-name-diag">
          <h4>${escapeHtml(req.patientName)}</h4>
          <p><span class="urgency-dot ${urgencyClass}"></span>${escapeHtml(req.symptoms)}</p>
        </div>
      </div>
      <div class="hitl-actions">
        <button class="action-btn-mini btn-review" title="Triage & Assign Request" data-id="${req.id}">🔍</button>
        <button class="action-btn-mini btn-approve" title="Quick Approve" data-action="approve" data-id="${req.id}">✓</button>
        <button class="action-btn-mini btn-decline" title="Decline" data-action="decline" data-id="${req.id}">✕</button>
      </div>
    `;

    // Event Delegation / Binding
    row.querySelector('.btn-review').addEventListener('click', () => {
      AppointmentActions.openTriage(req);
    });

    row.querySelector('.btn-approve').addEventListener('click', () => {
      AppointmentActions.quickDecide(req.id, 'CONFIRMED');
    });

    row.querySelector('.btn-decline').addEventListener('click', () => {
      AppointmentActions.quickDecide(req.id, 'DECLINED');
    });

    container.appendChild(row);
  });
}

/**
 * Live search filter for queues and patient tables
 */
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll('.request-item, .appointment-mini-item');

    rows.forEach((row) => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? '' : 'none';
    });
  });
}

/**
 * Interactive calendar day selector
 */
function initCalendarHighlight() {
  const calendarCells = document.querySelectorAll('.calendar-table td:not(.muted-date)');
  calendarCells.forEach((cell) => {
    cell.style.cursor = 'pointer';
    cell.addEventListener('click', () => {
      calendarCells.forEach((c) => c.classList.remove('active-date'));
      cell.classList.add('active-date');
      console.log(`[Calendar] Filter appointments for Day: ${cell.textContent.trim()}`);
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}