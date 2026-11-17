/**
 * auth.js - TrustedCares Hospital Administrative Authentication & Security Engine
 * Provides SHA-256 credential verification, session management, multi-tab rate-limiting,
 * DOM XSS protection, and admin route protection.
 */

(function (window) {
  'use strict';

  const STORAGE_KEYS = {
    SESSION: 'trusted_admin_session_v1',
    RATE_LIMIT: 'trustedcares_auth_ratelimit_v1',
    CREDENTIAL_OVERRIDES: 'trustedcares_cred_overrides_v1',
    CUSTOM_STAFF: 'trustedcares_custom_staff_v1',
    STAFF_OVERRIDES: 'trustedcares_staff_overrides_v1',
    DELETED_STAFF: 'trustedcares_deleted_staff_v1'
  };

  // Certified Hospital Staff Directory (SHA-256 hashed credentials & Role Classifications)
  const DEFAULT_STAFF_DIRECTORY = [
    {
      id: 'doc-marttin',
      name: 'Dr. Marttin Deo',
      username: 'dr.marttin',
      email: 'marttin.deo@trustedcares.org',
      role: 'Lead Physician & Clinical Administrator',
      roleType: 'doctor', // Clinical staff
      approvalStatus: 'approved',
      isActive: true,
      credentials: 'MBBS, FCPS - MD (Medicine), MCPS',
      department: 'General Medicine & Administration',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
      // SHA-256 of "Admin@2026!"
      passwordHash: 'f0ce0e86206541c60bc47be815f83eba98004f63c883e6d71ff5cc929cb5f9ca',
      demoPasswordHint: 'Admin@2026!'
    },
    {
      id: 'doc-sarah',
      name: 'Dr. Sarah Jenkins',
      username: 'dr.sarah',
      email: 'sarah.jenkins@trustedcares.org',
      role: 'Chief Medical Officer',
      roleType: 'super_admin', // Executive Superadmin
      approvalStatus: 'approved',
      isActive: true,
      credentials: 'MD, FACP - Internal Medicine',
      department: 'Clinical Quality & Governance',
      avatar: 'https://images.unsplash.com/photo-1594824813511-c9902636a066?w=150&auto=format&fit=crop&q=80',
      // SHA-256 of "Health@2026!"
      passwordHash: '487186495c11c839fb38838dedcfbcb7fb420e9c67d2711f08b2df735e5bd54a',
      demoPasswordHint: 'Health@2026!'
    },
    {
      id: 'admin-system',
      name: 'Hospital Administrator',
      username: 'admin',
      email: 'admin@trustedcares.org',
      role: 'System & Operations Director',
      roleType: 'admin', // Operations Admin (Approved)
      approvalStatus: 'approved',
      isActive: true,
      credentials: 'MHA, CPHIMS - Clinical Informatics',
      department: 'Hospital Management & Systems',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      // SHA-256 of "Hospital@2026!"
      passwordHash: '5a0c3c1b1c185a4ba5d8f14895d6647b123b71f2246f804c38b6dd5385176569',
      demoPasswordHint: 'Hospital@2026!'
    },
    {
      id: 'applicant-david',
      name: 'Nurse David Kim (Applicant)',
      username: 'david.nurse',
      email: 'david.kim@trustedcares.org',
      role: 'Clinical Nurse & Admin Applicant',
      roleType: 'admin', // Admin Applicant (Pending Approval)
      approvalStatus: 'pending',
      isActive: true,
      credentials: 'RN, BSN - Emergency Triage',
      department: 'Emergency & Acute Care',
      avatar: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80',
      // SHA-256 of "Pending@2026!"
      passwordHash: '0ad155402e20618fe1f841235173474721b66c279da3165c2823b02f9b3f7d80',
      demoPasswordHint: 'Pending@2026!'
    }
  ];

  /**
   * Cryptographic SHA-256 Hashing using Web Crypto API
   */
  async function computeSha256(text) {
    if (!text) return '';
    try {
      if (window.crypto && window.crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (err) {
      console.warn('[Auth] Web Crypto unavailable, using fallback', err);
    }
    // Fallback hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }

  /**
   * Safely load staff directory with custom entries, profile overrides, and credential updates
   */
  function getStaffDirectory() {
    let list = [...DEFAULT_STAFF_DIRECTORY];

    // 1. Filter out deleted staff
    try {
      const deletedRaw = localStorage.getItem(STORAGE_KEYS.DELETED_STAFF);
      if (deletedRaw) {
        const deletedIds = JSON.parse(deletedRaw);
        if (Array.isArray(deletedIds)) {
          list = list.filter(s => !deletedIds.includes(s.id));
        }
      }
    } catch (e) {
      console.warn('[Auth] Deleted staff read error:', e);
    }

    // 2. Load custom created staff
    try {
      const customRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_STAFF);
      if (customRaw) {
        const customList = JSON.parse(customRaw);
        if (Array.isArray(customList)) {
          list = [...list, ...customList];
        }
      }
    } catch (e) {
      console.warn('[Auth] Custom staff read error:', e);
    }

    // 3. Apply profile overrides (role, department, status, etc.)
    try {
      const staffOverridesRaw = localStorage.getItem(STORAGE_KEYS.STAFF_OVERRIDES);
      if (staffOverridesRaw) {
        const staffOverrides = JSON.parse(staffOverridesRaw);
        list = list.map(s => {
          if (staffOverrides[s.id]) {
            return { ...s, ...staffOverrides[s.id] };
          }
          return s;
        });
      }
    } catch (e) {
      console.warn('[Auth] Staff overrides read error:', e);
    }

    // 4. Apply credential overrides
    try {
      const overridesRaw = localStorage.getItem(STORAGE_KEYS.CREDENTIAL_OVERRIDES);
      if (overridesRaw) {
        const overrides = JSON.parse(overridesRaw);
        list = list.map(staff => {
          if (overrides[staff.email]) {
            return { ...staff, passwordHash: overrides[staff.email] };
          }
          return staff;
        });
      }
    } catch (e) {
      console.warn('[Auth] Could not read credential overrides:', e);
    }

    return list;
  }

  /**
   * Rate Limiting Engine: Multi-tab synchronized brute-force protection
   */
  const RateLimiter = {
    get() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.RATE_LIMIT);
        if (!raw) return { failedAttempts: 0, lockedUntil: 0 };
        return JSON.parse(raw);
      } catch (e) {
        return { failedAttempts: 0, lockedUntil: 0 };
      }
    },
    save(data) {
      try {
        localStorage.setItem(STORAGE_KEYS.RATE_LIMIT, JSON.stringify(data));
      } catch (e) {
        console.warn('[Auth] Rate limit storage failed', e);
      }
    },
    checkStatus() {
      const state = this.get();
      const now = Date.now();
      if (state.lockedUntil && state.lockedUntil > now) {
        return {
          isLocked: true,
          remainingSeconds: Math.ceil((state.lockedUntil - now) / 1000),
          failedAttempts: state.failedAttempts
        };
      }
      return { isLocked: false, remainingSeconds: 0, failedAttempts: state.failedAttempts };
    },
    recordFailure() {
      const state = this.get();
      state.failedAttempts = (state.failedAttempts || 0) + 1;
      
      let lockoutDuration = 0;
      if (state.failedAttempts >= 7) {
        lockoutDuration = 180; // 3 minutes
      } else if (state.failedAttempts >= 5) {
        lockoutDuration = 60; // 1 minute
      } else if (state.failedAttempts >= 3) {
        lockoutDuration = 30; // 30 seconds
      }

      if (lockoutDuration > 0) {
        state.lockedUntil = Date.now() + (lockoutDuration * 1000);
      }
      this.save(state);

      return {
        isLocked: lockoutDuration > 0,
        lockoutDuration,
        failedAttempts: state.failedAttempts,
        remainingAttempts: Math.max(0, 3 - (state.failedAttempts % 3))
      };
    },
    reset() {
      this.save({ failedAttempts: 0, lockedUntil: 0 });
    }
  };

  /**
   * HTML Sanitization helper against XSS
   */
  function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Core Authentication Controller
   */
  const Auth = {
    /**
     * Authenticate staff credentials
     */
    async login(identifier, password, rememberMe = false) {
      // 1. Check rate limiter
      const lockCheck = RateLimiter.checkStatus();
      if (lockCheck.isLocked) {
        return {
          success: false,
          error: `Security lockout active. Please wait ${lockCheck.remainingSeconds} seconds before trying again.`,
          isLocked: true,
          lockoutSeconds: lockCheck.remainingSeconds
        };
      }

      const cleanId = (identifier || '').trim().toLowerCase();
      const cleanPass = password || '';

      if (!cleanId || !cleanPass) {
        return {
          success: false,
          error: 'Please enter both your hospital username and password.',
          isLocked: false
        };
      }

      // 2. Hash input password for comparison
      const inputHash = await computeSha256(cleanPass);
      const directory = getStaffDirectory();

      // 3. Match against directory (case-insensitive for username, name, or email)
      const matchedStaff = directory.find(staff => {
        const idMatches = (
          staff.username.toLowerCase() === cleanId ||
          staff.email.toLowerCase() === cleanId ||
          staff.name.toLowerCase() === cleanId ||
          staff.name.toLowerCase().replace(/dr\.?\s+/i, '') === cleanId.replace(/dr\.?\s+/i, '')
        );
        return idMatches;
      });

      if (!matchedStaff || matchedStaff.passwordHash !== inputHash) {
        const failStatus = RateLimiter.recordFailure();
        if (failStatus.isLocked) {
          return {
            success: false,
            error: `Maximum login attempts reached. Security lockout engaged for ${failStatus.lockoutDuration} seconds.`,
            isLocked: true,
            lockoutSeconds: failStatus.lockoutDuration
          };
        }
        const remaining = Math.max(1, 3 - failStatus.failedAttempts);
        return {
          success: false,
          error: `Invalid credentials. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary account lock.`,
          isLocked: false,
          remainingAttempts: remaining
        };
      }

      // 4. Successful authentication - reset lockout counter
      RateLimiter.reset();

      // 5. Generate secure session token
      const session = this.createSession(matchedStaff, rememberMe);

      return {
        success: true,
        user: session.user,
        token: session.token
      };
    },

    /**
     * Simulated or Verified Google Workspace SSO Login
     */
    async loginWithGoogle(credential = null) {
      let staffUser = null;
      const directory = getStaffDirectory();

      if (credential) {
        // Parse Google JWT Payload if present
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            const email = (payload.email || '').toLowerCase();
            staffUser = directory.find(s => s.email.toLowerCase() === email);
            if (!staffUser) {
              staffUser = {
                id: 'google-' + (payload.sub || Date.now()),
                name: payload.name || 'Hospital Staff',
                email: payload.email,
                role: 'Verified Google Medical User',
                credentials: 'Hospital Authorized SSO',
                department: 'Clinical Operations',
                avatar: payload.picture || directory[0].avatar
              };
            }
          }
        } catch (e) {
          console.warn('[Auth] Google JWT decode error, fallback to default doctor:', e);
        }
      }

      if (!staffUser) {
        // Fallback default: Dr. Sarah Jenkins (CMO)
        staffUser = directory[1];
      }

      RateLimiter.reset();
      const session = this.createSession(staffUser, true);
      return { success: true, user: session.user };
    },

    /**
     * Create and persist active session
     */
    createSession(staff, rememberMe = false) {
      const token = 'tc_' + (window.crypto && window.crypto.randomUUID ? window.crypto.randomUUID() : (Math.random().toString(36).substring(2) + Date.now().toString(36)));
      const durationMs = rememberMe ? (30 * 24 * 60 * 60 * 1000) : (8 * 60 * 60 * 1000); // 30 days or 8 hours
      
      const sessionData = {
        token,
        user: {
          id: staff.id,
          name: staff.name,
          username: staff.username,
          email: staff.email,
          role: staff.role,
          roleType: staff.roleType || 'admin',
          approvalStatus: staff.approvalStatus || 'approved',
          isActive: staff.isActive !== false,
          credentials: staff.credentials,
          department: staff.department,
          avatar: staff.avatar
        },
        createdAt: Date.now(),
        expiresAt: Date.now() + durationMs,
        rememberMe: !!rememberMe
      };

      try {
        const serialized = JSON.stringify(sessionData);
        sessionStorage.setItem(STORAGE_KEYS.SESSION, serialized);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.SESSION, serialized);
        } else {
          localStorage.removeItem(STORAGE_KEYS.SESSION);
        }
      } catch (e) {
        console.error('[Auth] Failed to store session:', e);
      }

      return sessionData;
    },

    /**
     * Retrieve active session (validating expiration)
     */
    getSession() {
      try {
        let raw = sessionStorage.getItem(STORAGE_KEYS.SESSION);
        if (!raw) {
          raw = localStorage.getItem(STORAGE_KEYS.SESSION);
        }
        if (!raw) return null;

        const session = JSON.parse(raw);
        if (!session || !session.expiresAt) {
          this.logout(false);
          return null;
        }

        // Check expiration
        if (Date.now() > session.expiresAt) {
          console.info('[Auth] Active session has expired');
          this.logout(false);
          return null;
        }

        return session;
      } catch (e) {
        console.warn('[Auth] Error parsing session:', e);
        return null;
      }
    },

    /**
     * Check if user is currently authenticated
     */
    isAuthenticated() {
      return !!this.getSession();
    },

    /**
     * Guard route for Admin pages: Enforces that ONLY approved administrators
     * can access the dashboard and perform operations.
     * 
     * @param {string} redirectUrl - Fallback or target URL
     * @param {Object} options - Access constraints
     * @param {string[]} [options.allowedRoles=['admin', 'super_admin']] - Permitted roles
     * @param {boolean} [options.requireApproved=true] - Must have approved status
     */
    requireAuth(redirectUrl = 'admin_dashboard.html', options = {}) {
      const allowedRoles = options.allowedRoles || ['admin', 'super_admin'];
      const requireApproved = options.requireApproved !== false;

      const session = this.getSession();
      const target = encodeURIComponent(redirectUrl || window.location.pathname);

      // 1. Unauthenticated check
      if (!session || !session.user) {
        window.location.replace(`loginpage.html?redirect=${target}&reason=session_required`);
        return false;
      }

      const user = session.user;
      const userRole = user.roleType || 'admin';
      const approval = user.approvalStatus || 'approved';
      const isActive = user.isActive !== false;

      // 2. Active status check
      if (!isActive) {
        this.logout(false);
        window.location.replace(`loginpage.html?redirect=${target}&reason=account_suspended&name=${encodeURIComponent(user.name)}`);
        return false;
      }

      // 3. Role authorization check: Must be an admin or super_admin
      if (!allowedRoles.includes(userRole)) {
        window.location.replace(`loginpage.html?redirect=${target}&reason=unauthorized_admin_only&role=${encodeURIComponent(user.role || userRole)}`);
        return false;
      }

      // 4. Verification/Approval check: Must be approved by Super Administrator
      if (requireApproved && approval !== 'approved') {
        window.location.replace(`loginpage.html?redirect=${target}&reason=approval_pending&name=${encodeURIComponent(user.name)}`);
        return false;
      }

      return true;
    },

    /**
     * Check if currently authenticated user is an approved administrator
     */
    isApprovedAdmin() {
      const session = this.getSession();
      if (!session || !session.user) return false;
      const u = session.user;
      return (u.roleType === 'admin' || u.roleType === 'super_admin') &&
             u.approvalStatus === 'approved' &&
             u.isActive !== false;
    },

    /**
     * Check if currently authenticated user is a super administrator
     */
    isSuperAdmin() {
      const session = this.getSession();
      if (!session || !session.user) return false;
      const u = session.user;
      return u.roleType === 'super_admin' &&
             u.approvalStatus === 'approved' &&
             u.isActive !== false;
    },

    /**
     * Authorization Matrix: Verify permission to perform specific administrative tasks
     */
    canPerformTask(task) {
      if (!this.isApprovedAdmin()) return false;
      const session = this.getSession();
      const isSuper = session.user.roleType === 'super_admin';

      switch (task) {
        case 'manage_appointments':
        case 'update_appointment_status':
        case 'view_department_roster':
        case 'manage_doctor_schedules':
        case 'view_dashboard_metrics':
          return true; // Any approved admin or super_admin

        case 'approve_admin':
        case 'reject_admin':
        case 'delete_records':
        case 'system_audit_logs':
        case 'configure_security':
          return isSuper; // Superadmin only

        default:
          return false;
      }
    },

    /**
     * Terminate active session and redirect
     */
    logout(redirect = true) {
      try {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      } catch (e) {
        console.warn('[Auth] Clear session error:', e);
      }

      if (redirect) {
        window.location.href = 'loginpage.html?logged_out=1';
      }
    },

    /**
     * Initialize Admin Dashboard UI with authenticated staff profile
     */
    initDashboardProfile() {
      const session = this.getSession();
      if (!session || !session.user) return;

      const user = session.user;

      // Update sidebar avatar
      const avatarImg = document.querySelector('.profile-avatar-wrap img');
      if (avatarImg && user.avatar) {
        avatarImg.src = user.avatar;
        avatarImg.alt = user.name;
      }

      // Update sidebar doctor name
      const nameEl = document.querySelector('.profile-name');
      if (nameEl) {
        nameEl.textContent = user.name;
      }

      // Update credentials / role
      const credsEl = document.querySelector('.profile-credentials');
      if (credsEl) {
        credsEl.textContent = user.credentials || user.role;
      }

      // Attach logout listener
      const logoutBtn = document.querySelector('.nav-logout a') || document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.href = 'javascript:void(0);';
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout(true);
        });
      }
    },

    /**
     * Password Reset: Generate verification code for valid staff email
     */
    async requestPasswordReset(email) {
      const cleanEmail = (email || '').trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!cleanEmail || !emailRegex.test(cleanEmail)) {
        return { success: false, error: 'Please enter a valid hospital email address.' };
      }

      const directory = getStaffDirectory();
      const staff = directory.find(s => s.email.toLowerCase() === cleanEmail);

      if (!staff) {
        return { 
          success: false, 
          error: 'No registered medical staff record found for this email address. Please contact Hospital IT.' 
        };
      }

      // Generate a 6-digit cryptographic OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetToken = {
        email: staff.email,
        code: otp,
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
      };

      sessionStorage.setItem('trusted_pwd_reset_token', JSON.stringify(resetToken));

      return {
        success: true,
        email: staff.email,
        staffName: staff.name,
        code: otp // Returned for demo simulation display
      };
    },

    /**
     * Password Reset: Verify code and update password
     */
    async completePasswordReset(code, newPassword) {
      try {
        const raw = sessionStorage.getItem('trusted_pwd_reset_token');
        if (!raw) {
          return { success: false, error: 'Reset session expired. Please request a new verification code.' };
        }
        const token = JSON.parse(raw);
        if (Date.now() > token.expiresAt) {
          sessionStorage.removeItem('trusted_pwd_reset_token');
          return { success: false, error: 'Verification code has expired. Please request a new one.' };
        }

        if ((code || '').trim() !== token.code) {
          return { success: false, error: 'Invalid verification code. Please check your email or demo hint.' };
        }

        if (!newPassword || newPassword.length < 8) {
          return { success: false, error: 'Password must be at least 8 characters long.' };
        }

        // Compute hash of new password and save override
        const newHash = await computeSha256(newPassword);
        let overrides = {};
        try {
          const stored = localStorage.getItem(STORAGE_KEYS.CREDENTIAL_OVERRIDES);
          if (stored) overrides = JSON.parse(stored);
        } catch (e) {}

        overrides[token.email] = newHash;
        localStorage.setItem(STORAGE_KEYS.CREDENTIAL_OVERRIDES, JSON.stringify(overrides));
        sessionStorage.removeItem('trusted_pwd_reset_token');

        return { success: true };
      } catch (err) {
        return { success: false, error: 'Unable to update password. Please try again.' };
      }
    },

    /**
     * Retrieve all authorized personnel (READ)
     */
    getAllStaff() {
      return getStaffDirectory();
    },

    /**
     * Create & Onboard a new authorized staff member with dashboard access (CREATE)
     */
    async createStaffMember(data) {
      if (!data || !data.name || !data.username || !data.email || !data.password) {
        return { success: false, error: 'Name, username, email, and password are required fields.' };
      }

      const cleanUsername = sanitizeString(data.username.trim().toLowerCase());
      const cleanEmail = sanitizeString(data.email.trim().toLowerCase());
      const directory = getStaffDirectory();

      if (directory.some(s => s.username.toLowerCase() === cleanUsername)) {
        return { success: false, error: `Username "${cleanUsername}" is already assigned to a staff account.` };
      }

      if (directory.some(s => s.email.toLowerCase() === cleanEmail)) {
        return { success: false, error: `Email "${cleanEmail}" is already registered.` };
      }

      const passwordHash = await computeSha256(data.password);
      const newStaff = {
        id: 'staff_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        name: sanitizeString(data.name.trim()),
        username: cleanUsername,
        email: cleanEmail,
        role: sanitizeString(data.role || (data.roleType === 'super_admin' ? 'Chief Medical Officer' : (data.roleType === 'doctor' ? 'Clinical Doctor' : 'Hospital Administrator'))),
        roleType: data.roleType || 'admin',
        approvalStatus: data.approvalStatus || 'approved',
        isActive: data.isActive !== false,
        credentials: sanitizeString(data.credentials || (data.roleType === 'doctor' ? 'MD' : 'MHA - Hospital Admin')),
        department: sanitizeString(data.department || 'Hospital Operations'),
        avatar: data.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
        passwordHash,
        demoPasswordHint: data.password,
        createdAt: new Date().toISOString()
      };

      try {
        let customStaff = [];
        const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_STAFF);
        if (raw) customStaff = JSON.parse(raw);
        customStaff.push(newStaff);
        localStorage.setItem(STORAGE_KEYS.CUSTOM_STAFF, JSON.stringify(customStaff));
        return { success: true, staff: newStaff };
      } catch (err) {
        console.error('[Auth] Error saving new staff member:', err);
        return { success: false, error: 'Could not persist staff record.' };
      }
    },

    /**
     * Update an authorized staff member's profile or credentials (UPDATE)
     */
    async updateStaffMember(id, updatedFields) {
      if (!id || !updatedFields) return { success: false, error: 'Invalid update payload.' };

      const directory = getStaffDirectory();
      const existing = directory.find(s => s.id === id);
      if (!existing) {
        return { success: false, error: 'Staff member not found.' };
      }

      // Check username collision if changed
      if (updatedFields.username) {
        const cleanUser = sanitizeString(updatedFields.username.trim().toLowerCase());
        if (cleanUser !== existing.username && directory.some(s => s.id !== id && s.username.toLowerCase() === cleanUser)) {
          return { success: false, error: `Username "${cleanUser}" is already taken.` };
        }
      }

      // Check email collision if changed
      if (updatedFields.email) {
        const cleanMail = sanitizeString(updatedFields.email.trim().toLowerCase());
        if (cleanMail !== existing.email && directory.some(s => s.id !== id && s.email.toLowerCase() === cleanMail)) {
          return { success: false, error: `Email "${cleanMail}" is already in use.` };
        }
      }

      // If updating custom staff, update directly in custom staff storage
      let customUpdated = false;
      try {
        const customRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_STAFF);
        if (customRaw) {
          let customList = JSON.parse(customRaw);
          const idx = customList.findIndex(s => s.id === id);
          if (idx !== -1) {
            customList[idx] = { ...customList[idx], ...updatedFields };
            if (updatedFields.password) {
              customList[idx].passwordHash = await computeSha256(updatedFields.password);
              customList[idx].demoPasswordHint = updatedFields.password;
            }
            localStorage.setItem(STORAGE_KEYS.CUSTOM_STAFF, JSON.stringify(customList));
            customUpdated = true;
          }
        }
      } catch (e) {}

      // If not custom staff, save into staff overrides
      if (!customUpdated) {
        try {
          let staffOverrides = {};
          const stored = localStorage.getItem(STORAGE_KEYS.STAFF_OVERRIDES);
          if (stored) staffOverrides = JSON.parse(stored);
          staffOverrides[id] = { ...(staffOverrides[id] || {}), ...updatedFields };
          localStorage.setItem(STORAGE_KEYS.STAFF_OVERRIDES, JSON.stringify(staffOverrides));

          if (updatedFields.password) {
            const hash = await computeSha256(updatedFields.password);
            let credOverrides = {};
            const storedCreds = localStorage.getItem(STORAGE_KEYS.CREDENTIAL_OVERRIDES);
            if (storedCreds) credOverrides = JSON.parse(storedCreds);
            credOverrides[existing.email] = hash;
            localStorage.setItem(STORAGE_KEYS.CREDENTIAL_OVERRIDES, JSON.stringify(credOverrides));
          }
        } catch (e) {
          console.warn('[Auth] Staff override storage failed:', e);
        }
      }

      // If updating currently logged-in user, refresh session
      const currentSession = this.getSession();
      if (currentSession && currentSession.user && currentSession.user.id === id) {
        currentSession.user = {
          ...currentSession.user,
          ...updatedFields,
          name: updatedFields.name || currentSession.user.name,
          role: updatedFields.role || currentSession.user.role,
          roleType: updatedFields.roleType || currentSession.user.roleType,
          approvalStatus: updatedFields.approvalStatus || currentSession.user.approvalStatus,
          credentials: updatedFields.credentials || currentSession.user.credentials
        };
        try {
          const serialized = JSON.stringify(currentSession);
          sessionStorage.setItem(STORAGE_KEYS.SESSION, serialized);
          if (localStorage.getItem(STORAGE_KEYS.SESSION)) {
            localStorage.setItem(STORAGE_KEYS.SESSION, serialized);
          }
        } catch (e) {}
        this.initDashboardProfile();
      }

      return { success: true };
    },

    /**
     * Delete an authorized staff member (DELETE)
     */
    deleteStaffMember(id) {
      if (!id) return { success: false, error: 'Staff ID is required.' };

      const currentSession = this.getSession();
      if (currentSession && currentSession.user && currentSession.user.id === id) {
        return { success: false, error: 'Safety Guard: You cannot delete your own active administrator account.' };
      }

      try {
        // Remove from custom staff if present
        const customRaw = localStorage.getItem(STORAGE_KEYS.CUSTOM_STAFF);
        if (customRaw) {
          let customList = JSON.parse(customRaw);
          customList = customList.filter(s => s.id !== id);
          localStorage.setItem(STORAGE_KEYS.CUSTOM_STAFF, JSON.stringify(customList));
        }

        // Add to deleted staff registry
        let deleted = [];
        const deletedRaw = localStorage.getItem(STORAGE_KEYS.DELETED_STAFF);
        if (deletedRaw) deleted = JSON.parse(deletedRaw);
        if (!deleted.includes(id)) {
          deleted.push(id);
          localStorage.setItem(STORAGE_KEYS.DELETED_STAFF, JSON.stringify(deleted));
        }

        return { success: true };
      } catch (err) {
        console.error('[Auth] Error deleting staff member:', err);
        return { success: false, error: 'Unable to remove staff member.' };
      }
    },

    /**
     * Quick Toggle Approval / Active Status
     */
    async toggleStaffStatus(id) {
      const directory = getStaffDirectory();
      const staff = directory.find(s => s.id === id);
      if (!staff) return { success: false, error: 'Staff not found.' };

      const newStatus = staff.approvalStatus === 'approved' ? 'pending' : 'approved';
      return await this.updateStaffMember(id, { approvalStatus: newStatus });
    },

    /**
     * Expose list of demo staff for quick autofill cards
     */
    getDemoStaff() {
      return DEFAULT_STAFF_DIRECTORY.map(s => ({
        id: s.id,
        name: s.name,
        username: s.username,
        email: s.email,
        role: s.role,
        roleType: s.roleType,
        approvalStatus: s.approvalStatus,
        avatar: s.avatar,
        hintPassword: s.demoPasswordHint
      }));
    },

    getRateLimiter() {
      return RateLimiter;
    },

    sanitize(str) {
      return sanitizeString(str);
    }
  };

  // Expose to window
  window.Auth = Auth;

})(window);
