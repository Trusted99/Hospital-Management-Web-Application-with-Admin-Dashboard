/**
 * admin-views.js - View Controller for TrustedCares Hospital Admin Panel
 * Handles seamless switching between:
 * - Dashboard (General Analytics & Human-in-the-Loop Overview)
 * - Appointments (Exclusive Booked Appointments Tracking Table & Triage)
 * - Profile (Authorized Personnel Directory with full CRUD: Create, Read, Update, Delete)
 * - Settings (Onboard New Personnel with Dashboard Access & Security Governance)
 */

(function (window) {
  'use strict';

  let currentView = 'dashboard';
  let appointmentsCache = [];
  let currentApptFilter = 'ALL';
  let staffFilterRole = 'ALL';
  let staffFilterStatus = 'ALL';

  /**
   * Initialize View Router and Event Listeners
   */
  async function init() {
    // 1. Initial view resolution from URL hash or fallback to dashboard
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (['appointments', 'profile', 'settings'].includes(hash)) {
      switchAdminView(hash);
    } else {
      switchAdminView('dashboard');
    }

    // 2. Hash change listener for browser history support
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '').toLowerCase();
      if (['dashboard', 'appointments', 'profile', 'settings'].includes(newHash)) {
        switchAdminView(newHash);
      }
    });

    // 3. Attach global delegated actions
    bindSettingsOnboardingForm();
    bindStaffCrudModals();
  }

  /**
   * Switch the active view
   */
  async function switchAdminView(viewName) {
    currentView = viewName;

    // 1. Update navigation items
    document.querySelectorAll('.nav-list .nav-item').forEach(item => {
      item.classList.remove('active');
      const itemLink = item.querySelector('a');
      const itemText = (itemLink ? itemLink.textContent : '').toLowerCase();
      if (item.getAttribute('data-view') === viewName || itemText.includes(viewName)) {
        item.classList.add('active');
      }
    });

    // 2. Update page title
    const titleEl = document.querySelector('.page-title');
    if (titleEl) {
      if (viewName === 'appointments') {
        titleEl.textContent = 'Booked Appointments Tracker';
      } else if (viewName === 'profile') {
        titleEl.textContent = 'Authorized Personnel Directory';
      } else if (viewName === 'settings') {
        titleEl.textContent = 'Admin Settings & Access Provisioning';
      } else {
        titleEl.textContent = 'Dashboard';
      }
    }

    // 3. Toggle view containers
    const dashboardGrid = document.getElementById('viewDashboard') || document.querySelector('.dashboard-grid');
    const viewAppts = document.getElementById('viewAppointments');
    const viewProf = document.getElementById('viewProfile');
    const viewSett = document.getElementById('viewSettings');

    if (dashboardGrid) dashboardGrid.style.display = viewName === 'dashboard' ? 'flex' : 'none';
    if (viewAppts) viewAppts.classList.toggle('active-view', viewName === 'appointments');
    if (viewProf) viewProf.classList.toggle('active-view', viewName === 'profile');
    if (viewSett) viewSett.classList.toggle('active-view', viewName === 'settings');

    // 4. Load view-specific content
    if (viewName === 'appointments') {
      await loadAppointmentsTrackerView();
    } else if (viewName === 'profile') {
      loadProfileDirectoryView();
    } else if (viewName === 'settings') {
      loadSettingsView();
    }

    // 5. Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =========================================================================
  // VIEW 1: BOOKED APPOINTMENTS TRACKER
  // =========================================================================

  async function loadAppointmentsTrackerView() {
    appointmentsCache = await API.getAllAppointments();
    renderAppointmentsTracker();
    updateAppointmentCountBadges();
  }

  function renderAppointmentsTracker() {
    const tbody = document.getElementById('appointmentsTableBody');
    if (!tbody) return;

    const searchInput = document.getElementById('apptSearchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const urgencySelect = document.getElementById('apptUrgencyFilter');
    const selectedUrgency = urgencySelect ? urgencySelect.value : 'ALL';
    const deptSelect = document.getElementById('apptDeptFilter');
    const selectedDept = deptSelect ? deptSelect.value : 'ALL';

    let filtered = [...appointmentsCache];

    // Filter by Status Tab
    if (currentApptFilter !== 'ALL') {
      filtered = filtered.filter(a => a.status === currentApptFilter);
    }

    // Filter by Urgency
    if (selectedUrgency !== 'ALL') {
      filtered = filtered.filter(a => (a.urgency || '').toUpperCase() === selectedUrgency.toUpperCase());
    }

    // Filter by Department
    if (selectedDept !== 'ALL') {
      filtered = filtered.filter(a => (a.department || '').toLowerCase().includes(selectedDept.toLowerCase()));
    }

    // Search query
    if (query) {
      filtered = filtered.filter(a => {
        const text = `${a.patientName} ${a.reference} ${a.phone} ${a.email} ${a.doctorName} ${a.department} ${a.symptoms}`.toLowerCase();
        return text.includes(query);
      });
    }

    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3>No Booked Appointments Found</h3>
              <p>No appointments match the current filter criteria or search query.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(appt => {
      const tr = document.createElement('tr');

      // Status Pill
      let statusClass = 'status-pending';
      let statusLabel = 'Pending Review';
      if (appt.status === 'CONFIRMED') {
        statusClass = 'status-confirmed';
        statusLabel = 'Confirmed';
      } else if (appt.status === 'COMPLETED') {
        statusClass = 'status-completed';
        statusLabel = 'Completed';
      } else if (appt.status === 'CANCELLED' || appt.status === 'DECLINED') {
        statusClass = 'status-cancelled';
        statusLabel = 'Cancelled';
      }

      // Urgency Badge
      const urg = (appt.urgency || 'LOW').toUpperCase();
      let urgClass = 'urgency-low';
      if (urg === 'EMERGENCY') urgClass = 'urgency-emergency';
      else if (urg === 'HIGH') urgClass = 'urgency-high';
      else if (urg === 'MEDIUM') urgClass = 'urgency-medium';

      const dateStr = appt.preferredDate || appt.confirmedDate || '21 Dec 2026';
      const timeStr = appt.preferredTime || appt.confirmedTime || '10:00 AM';

      tr.innerHTML = `
        <td>
          <span class="ref-tag">${escapeHtml(appt.reference || 'APT-2026')}</span>
          <div style="font-size: 0.72rem; color: var(--text-light); margin-top: 3px;">
            ${escapeHtml(dateStr)} • ${escapeHtml(timeStr)}
          </div>
        </td>
        <td>
          <div class="patient-cell">
            <img src="${appt.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}" alt="${escapeHtml(appt.patientName)}" />
            <div class="patient-cell-info">
              <h4>${escapeHtml(appt.patientName)}</h4>
              <p>${escapeHtml(appt.phone || 'No phone')} • ${escapeHtml(appt.gender || 'Patient')}${appt.age ? `, ${appt.age}y` : ''}</p>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.85rem;">${escapeHtml(appt.department || 'General Medicine')}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; margin-top: 2px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            ${escapeHtml(appt.doctorName || 'Unassigned')}
          </div>
        </td>
        <td>
          <span class="urgency-badge ${urgClass}">${urg}</span>
        </td>
        <td>
          <div style="max-width: 200px; font-size: 0.78rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(appt.symptoms || '')}">
            ${escapeHtml(appt.symptoms || 'General clinical inquiry')}
          </div>
        </td>
        <td>
          <span class="status-pill ${statusClass}">${statusLabel}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="action-icon-btn-sm" title="Triage & Details" onclick="window.AdminViews.openApptModal('${appt.id}')">
              🔍
            </button>
            ${appt.status !== 'CONFIRMED' ? `
              <button class="action-icon-btn-sm btn-approve-sm" title="Confirm Appointment" onclick="window.AdminViews.setApptStatus('${appt.id}', 'CONFIRMED')">
                ✓
              </button>
            ` : ''}
            ${appt.status !== 'COMPLETED' ? `
              <button class="action-icon-btn-sm" title="Mark Completed" onclick="window.AdminViews.setApptStatus('${appt.id}', 'COMPLETED')">
                🏁
              </button>
            ` : ''}
            ${appt.status !== 'CANCELLED' && appt.status !== 'DECLINED' ? `
              <button class="action-icon-btn-sm btn-del" title="Cancel Appointment" onclick="window.AdminViews.setApptStatus('${appt.id}', 'CANCELLED')">
                ✕
              </button>
            ` : ''}
          </div>
        </td>
      `;

      tbody.appendChild(tr);
    });
  }

  function updateAppointmentCountBadges() {
    const list = appointmentsCache;
    const total = list.length;
    const pending = list.filter(a => a.status === 'PENDING_REVIEW').length;
    const confirmed = list.filter(a => a.status === 'CONFIRMED').length;
    const completed = list.filter(a => a.status === 'COMPLETED').length;
    const cancelled = list.filter(a => a.status === 'CANCELLED' || a.status === 'DECLINED').length;

    const setBadge = (id, count) => {
      const el = document.getElementById(id);
      if (el) el.textContent = count;
    };

    setBadge('countAllAppts', total);
    setBadge('countPendingAppts', pending);
    setBadge('countConfirmedAppts', confirmed);
    setBadge('countCompletedAppts', completed);
    setBadge('countCancelledAppts', cancelled);
  }

  // =========================================================================
  // VIEW 2: AUTHORIZED PERSONNEL & PROFILE DIRECTORY (CRUD)
  // =========================================================================

  function loadProfileDirectoryView() {
    renderStaffDirectory();
  }

  function renderStaffDirectory() {
    const container = document.getElementById('staffCardsContainer');
    if (!container) return;

    const directory = Auth.getAllStaff();
    const searchInput = document.getElementById('staffSearchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = [...directory];

    // Filter by Role
    if (staffFilterRole !== 'ALL') {
      filtered = filtered.filter(s => s.roleType === staffFilterRole);
    }

    // Filter by Approval Status
    if (staffFilterStatus !== 'ALL') {
      filtered = filtered.filter(s => s.approvalStatus === staffFilterStatus);
    }

    // Search query
    if (query) {
      filtered = filtered.filter(s => {
        const text = `${s.name} ${s.username} ${s.email} ${s.role} ${s.credentials} ${s.department}`.toLowerCase();
        return text.includes(query);
      });
    }

    container.innerHTML = '';

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3>No Personnel Found</h3>
          <p>No staff profiles match the chosen filter or search term.</p>
        </div>
      `;
      return;
    }

    const currentSession = Auth.getSession();
    const currentUserId = currentSession && currentSession.user ? currentSession.user.id : '';

    filtered.forEach(staff => {
      const card = document.createElement('div');
      card.className = 'staff-profile-card';

      // Role tag
      let roleClass = 'role-admin';
      let roleLabel = 'Hospital Administrator';
      if (staff.roleType === 'super_admin') {
        roleClass = 'role-super_admin';
        roleLabel = 'Super Administrator';
      } else if (staff.roleType === 'doctor') {
        roleClass = 'role-doctor';
        roleLabel = 'Clinical Doctor';
      }

      // Approval tag
      let approvalClass = 'approved';
      let approvalLabel = 'Approved';
      if (staff.approvalStatus === 'pending') {
        approvalClass = 'pending';
        approvalLabel = 'Pending Review';
      } else if (staff.approvalStatus === 'rejected' || staff.isActive === false) {
        approvalClass = 'suspended';
        approvalLabel = 'Suspended';
      }

      const isSelf = staff.id === currentUserId;

      card.innerHTML = `
        <div>
          <div class="staff-card-header">
            <img src="${staff.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" class="staff-card-avatar" alt="${escapeHtml(staff.name)}" />
            <div class="staff-card-meta">
              <div class="staff-card-name" title="${escapeHtml(staff.name)}">
                ${escapeHtml(staff.name)}
                ${isSelf ? '<span style="font-size: 0.65rem; background: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 4px; margin-left: 4px;">YOU</span>' : ''}
              </div>
              <div class="staff-card-username">@${escapeHtml(staff.username)}</div>
              <div class="staff-card-credentials">${escapeHtml(staff.credentials || 'Staff Credentialed')}</div>
            </div>
          </div>

          <div class="staff-badges-row">
            <span class="role-tag ${roleClass}">${roleLabel}</span>
            <span class="approval-tag ${approvalClass}">${approvalLabel}</span>
          </div>

          <div class="staff-card-details">
            <div class="staff-detail-line" title="${escapeHtml(staff.department)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
              <span>${escapeHtml(staff.department || 'Operations')}</span>
            </div>
            <div class="staff-detail-line" title="${escapeHtml(staff.email)}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>${escapeHtml(staff.email)}</span>
            </div>
            <div class="staff-detail-line" style="font-size: 0.72rem; color: #059669;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Dashboard Access: <strong>${staff.roleType === 'doctor' ? 'Clinical Portal' : (staff.approvalStatus === 'approved' ? 'Active Admin' : 'Pending Approval')}</strong></span>
            </div>
          </div>
        </div>

        <div class="staff-card-actions">
          <button class="staff-btn-edit" onclick="window.AdminViews.openEditStaffModal('${staff.id}')" title="Edit Profile Details">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Edit
          </button>
          
          <button class="staff-btn-toggle" onclick="window.AdminViews.toggleStaffStatus('${staff.id}')" title="Toggle Approval Status">
            ${staff.approvalStatus === 'approved' ? 'Pause' : 'Approve'}
          </button>

          ${!isSelf ? `
            <button class="staff-btn-delete" onclick="window.AdminViews.confirmDeleteStaff('${staff.id}', '${escapeHtml(staff.name)}')" title="Revoke & Delete Access">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : `
            <span style="font-size: 0.72rem; color: var(--text-light); padding: 7px;">Current User</span>
          `}
        </div>
      `;

      container.appendChild(card);
    });
  }

  // =========================================================================
  // VIEW 3: SETTINGS & USER ONBOARDING
  // =========================================================================

  function loadSettingsView() {
    const session = Auth.getSession();
    const user = session && session.user ? session.user : null;

    const currName = document.getElementById('settingsCurrentAdminName');
    const currEmail = document.getElementById('settingsCurrentAdminEmail');
    const currRole = document.getElementById('settingsCurrentAdminRole');

    if (currName && user) currName.textContent = user.name;
    if (currEmail && user) currEmail.textContent = user.email;
    if (currRole && user) currRole.textContent = user.role || 'Hospital Administrator';
  }

  function bindSettingsOnboardingForm() {
    const form = document.getElementById('settingsOnboardForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('onboardFullName').value.trim();
      const username = document.getElementById('onboardUsername').value.trim();
      const email = document.getElementById('onboardEmail').value.trim();
      const roleType = document.getElementById('onboardRoleType').value;
      const department = document.getElementById('onboardDepartment').value;
      const credentials = document.getElementById('onboardCredentials').value.trim();
      const password = document.getElementById('onboardPassword').value;
      const approvalStatus = document.getElementById('onboardApprovalStatus').value;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Provisioning Administrator...';
      }

      const result = await Auth.createStaffMember({
        name,
        username,
        email,
        roleType,
        department,
        credentials,
        password,
        approvalStatus
      });

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Provision & Grant Dashboard Access';
      }

      if (!result.success) {
        alert('Could not add personnel: ' + result.error);
        return;
      }

      // Success
      form.reset();
      generateRandomPassword('onboardPassword');
      alert(`Success! ${result.staff.name} has been added as ${result.staff.role}. They can now sign in at the login page.`);
      
      // Refresh directory if visited
      renderStaffDirectory();
    });
  }

  // =========================================================================
  // CRUD MODALS: CREATE & EDIT STAFF
  // =========================================================================

  function bindStaffCrudModals() {
    // Edit Staff Form
    const editForm = document.getElementById('editStaffForm');
    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editStaffId').value;
        const name = document.getElementById('editStaffName').value.trim();
        const username = document.getElementById('editStaffUsername').value.trim();
        const email = document.getElementById('editStaffEmail').value.trim();
        const roleType = document.getElementById('editStaffRoleType').value;
        const department = document.getElementById('editStaffDepartment').value;
        const credentials = document.getElementById('editStaffCredentials').value.trim();
        const approvalStatus = document.getElementById('editStaffApprovalStatus').value;
        const password = document.getElementById('editStaffNewPassword').value;

        const updateData = {
          name,
          username,
          email,
          roleType,
          department,
          credentials,
          approvalStatus
        };

        if (password && password.length >= 6) {
          updateData.password = password;
        }

        const res = await Auth.updateStaffMember(id, updateData);
        if (!res.success) {
          alert('Update error: ' + res.error);
          return;
        }

        closeModal('editStaffModal');
        renderStaffDirectory();
        alert('Staff profile successfully updated!');
      });
    }

    // Modal Create Staff Form (from Profile tab "+ Add" button)
    const modalCreateForm = document.getElementById('modalCreateStaffForm');
    if (modalCreateForm) {
      modalCreateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('mCreateName').value.trim();
        const username = document.getElementById('mCreateUsername').value.trim();
        const email = document.getElementById('mCreateEmail').value.trim();
        const roleType = document.getElementById('mCreateRoleType').value;
        const department = document.getElementById('mCreateDepartment').value;
        const credentials = document.getElementById('mCreateCredentials').value.trim();
        const password = document.getElementById('mCreatePassword').value;
        const approvalStatus = document.getElementById('mCreateApprovalStatus').value;

        const res = await Auth.createStaffMember({
          name,
          username,
          email,
          roleType,
          department,
          credentials,
          password,
          approvalStatus
        });

        if (!res.success) {
          alert('Error creating staff: ' + res.error);
          return;
        }

        modalCreateForm.reset();
        closeModal('createStaffModal');
        renderStaffDirectory();
        alert(`Success! ${res.staff.name} is now authorized to access the hospital systems.`);
      });
    }
  }

  // =========================================================================
  // HELPER ACTIONS & EXPOSED METHODS
  // =========================================================================

  function generateRandomPassword(inputId) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const input = document.getElementById(inputId);
    if (input) input.value = pwd;
    return pwd;
  }

  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  function openEditStaffModal(id) {
    const directory = Auth.getAllStaff();
    const staff = directory.find(s => s.id === id);
    if (!staff) return;

    document.getElementById('editStaffId').value = staff.id;
    document.getElementById('editStaffName').value = staff.name || '';
    document.getElementById('editStaffUsername').value = staff.username || '';
    document.getElementById('editStaffEmail').value = staff.email || '';
    document.getElementById('editStaffRoleType').value = staff.roleType || 'admin';
    document.getElementById('editStaffDepartment').value = staff.department || 'General Medicine';
    document.getElementById('editStaffCredentials').value = staff.credentials || '';
    document.getElementById('editStaffApprovalStatus').value = staff.approvalStatus || 'approved';
    document.getElementById('editStaffNewPassword').value = '';

    openModal('editStaffModal');
  }

  function confirmDeleteStaff(id, name) {
    const currentSession = Auth.getSession();
    if (currentSession && currentSession.user && currentSession.user.id === id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }

    const conf = confirm(`Are you sure you want to revoke access and permanently delete the profile for ${name}?`);
    if (!conf) return;

    const res = Auth.deleteStaffMember(id);
    if (!res.success) {
      alert(res.error);
      return;
    }

    renderStaffDirectory();
    alert(`Access revoked. Profile for ${name} has been removed.`);
  }

  async function toggleStaffStatus(id) {
    const res = await Auth.toggleStaffStatus(id);
    if (!res.success) {
      alert(res.error);
      return;
    }
    renderStaffDirectory();
  }

  async function setApptStatus(id, newStatus) {
    const res = await API.updateStatus(id, newStatus, 'Status updated via Booked Appointments tracker');
    if (res && res.success) {
      await loadAppointmentsTrackerView();
    }
  }

  function openApptModal(id) {
    const appt = appointmentsCache.find(a => String(a.id) === String(id));
    if (!appt) return;

    if (window.AppointmentActions) {
      window.AppointmentActions.openTriage(appt);
    }
  }

  function setApptFilter(status, elem) {
    currentApptFilter = status;
    document.querySelectorAll('#apptFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
    if (elem) elem.classList.add('active');
    renderAppointmentsTracker();
  }

  function setStaffRoleFilter(role, elem) {
    staffFilterRole = role;
    document.querySelectorAll('#staffRoleFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
    if (elem) elem.classList.add('active');
    renderStaffDirectory();
  }

  function setStaffStatusFilter(status, elem) {
    staffFilterStatus = status;
    document.querySelectorAll('#staffStatusFilterPills .filter-pill').forEach(p => p.classList.remove('active'));
    if (elem) elem.classList.add('active');
    renderStaffDirectory();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Expose to window
  window.AdminViews = {
    init,
    switchView: switchAdminView,
    renderAppointments: renderAppointmentsTracker,
    renderStaff: renderStaffDirectory,
    setApptFilter,
    setStaffRoleFilter,
    setStaffStatusFilter,
    setApptStatus,
    openApptModal,
    openEditStaffModal,
    confirmDeleteStaff,
    toggleStaffStatus,
    openModal,
    closeModal,
    generateRandomPassword
  };

  // Run on DOM ready
  document.addEventListener('DOMContentLoaded', init);

})(window);
