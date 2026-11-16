/**
 * api.js - Centralized HTTP client with automatic mock fallback & localStorage sync
 */
const API = (function () {
  const BASE_URL = '/api';
  const STORAGE_KEY = 'trusted_cares_appointments';

  // Initial seed data for pending review
  const initialPendingRequests = [
    {
      id: '101',
      reference: 'APT-2026-M821',
      patientName: 'Maria Sarafat',
      phone: '+233 24 555 0192',
      email: 'maria.sarafat@example.com',
      department: 'General Medicine',
      doctorId: '1',
      doctorName: 'Dr. Marttin Deo',
      symptoms: 'Patient reports 4 days of cold with severe chest congestion and intermittent high fever.',
      preferredTime: '19 Oct 2026 at 09:30 AM',
      urgency: 'HIGH',
      status: 'PENDING_REVIEW',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    {
      id: '102',
      reference: 'APT-2026-J404',
      patientName: 'Jhon Deo',
      phone: '+233 50 123 4567',
      email: 'jhon.deo@example.com',
      department: 'Endocrinology',
      doctorId: '2',
      doctorName: 'Dr. Sarah Koomson',
      symptoms: 'Excessive night sweating, dizziness after carbohydrate-rich meals, persistent thirst.',
      preferredTime: '19 Oct 2026 at 11:00 AM',
      urgency: 'MEDIUM',
      status: 'PENDING_REVIEW',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
    }
  ];

  function getStoredAppointments() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[API] Could not parse localStorage appointments:', e);
    }
    // Seed initial mock requests if empty
    saveStoredAppointments(initialPendingRequests);
    return initialPendingRequests;
  }

  function saveStoredAppointments(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[API] Could not save to localStorage:', e);
    }
  }

  const mockDatabase = {
    summary: {
      totalPatients: '2,480+',
      todayPatients: '068',
      todayAppointments: '085',
      dateLabel: '18 Oct 2026',
      newPatientsPct: 28,
      oldPatientsPct: 22,
      totalPatientsPct: 50,
      ratings: { excellent: 85, great: 65, good: 40, average: 25 }
    },
    todaySchedule: [
      {
        id: 'apt-01',
        patientName: 'M.J. Mical',
        diagnosis: 'Health Checkup',
        time: 'On Going',
        status: 'ONGOING',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
      },
      {
        id: 'apt-02',
        patientName: 'Sanath Deo',
        diagnosis: 'Health Checkup',
        time: '12:30 PM',
        status: 'CONFIRMED',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
      },
      {
        id: 'apt-03',
        patientName: 'Loeara Phanj',
        diagnosis: 'Report Review',
        time: '01:00 PM',
        status: 'CONFIRMED',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
      },
      {
        id: 'apt-04',
        patientName: 'Komola Haris',
        diagnosis: 'Common Cold',
        time: '01:30 PM',
        status: 'CONFIRMED',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
      }
    ]
  };

  async function request(endpoint, options = {}) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (err) {
      return resolveMock(endpoint, options);
    }
  }

  function resolveMock(endpoint, options) {
    if (endpoint === '/admin/dashboard/summary') {
      const list = getStoredAppointments();
      const pendingCount = list.filter(i => i.status === 'PENDING_REVIEW').length;
      return Promise.resolve({
        ...mockDatabase.summary,
        pendingReviewCount: pendingCount
      });
    }

    if (endpoint === '/admin/appointments/today') {
      return Promise.resolve(mockDatabase.todaySchedule);
    }

    if (endpoint === '/admin/appointments?status=PENDING_REVIEW') {
      const list = getStoredAppointments();
      const pending = list.filter(item => item.status === 'PENDING_REVIEW');
      return Promise.resolve(pending);
    }

    if (endpoint.includes('/triage')) {
      const match = endpoint.match(/\/appointments\/([^/]+)\/triage/);
      if (match && options.body) {
        const id = String(match[1]);
        const payload = JSON.parse(options.body);
        const list = getStoredAppointments();
        const updated = list.map(item => {
          if (String(item.id) === id) {
            return { ...item, ...payload, status: 'CONFIRMED' };
          }
          return item;
        });
        saveStoredAppointments(updated);
      }
      return Promise.resolve({ success: true, timestamp: new Date().toISOString() });
    }

    if (endpoint.includes('/status')) {
      const match = endpoint.match(/\/appointments\/([^/]+)\/status/);
      if (match && options.body) {
        const id = String(match[1]);
        const { status, reason } = JSON.parse(options.body);
        const list = getStoredAppointments();
        const updated = list.map(item => {
          if (String(item.id) === id) {
            return { ...item, status, statusReason: reason, updatedAt: new Date().toISOString() };
          }
          return item;
        });
        saveStoredAppointments(updated);
      }
      return Promise.resolve({ success: true });
    }

    return Promise.resolve({ success: true });
  }

  return {
    getDashboardSummary: () => request('/admin/dashboard/summary'),
    getTodaySchedule: () => request('/admin/appointments/today'),
    getPendingRequests: () => request('/admin/appointments?status=PENDING_REVIEW'),
    triageAppointment: (id, payload) =>
      request(`/admin/appointments/${id}/triage`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    updateStatus: (id, status, reason = '') =>
      request(`/admin/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reason })
      })
  };
})();