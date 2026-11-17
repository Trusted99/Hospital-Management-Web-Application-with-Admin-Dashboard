/**
 * api.js - Centralized HTTP client with automatic mock fallback & localStorage sync
 */
const API = (function () {
  const BASE_URL = '/api';
  const STORAGE_KEY = 'trusted_cares_appointments';

  // Initial seed data for booked appointments & tracking queue
  const initialPendingRequests = [
    {
      id: '101',
      reference: 'APT-2026-M821',
      patientName: 'Maria Sarafat',
      phone: '+233 24 555 0192',
      email: 'maria.sarafat@example.com',
      gender: 'Female',
      age: 32,
      department: 'General Medicine',
      doctorId: '1',
      doctorName: 'Dr. Marttin Deo',
      symptoms: 'Patient reports 4 days of cold with severe chest congestion and intermittent high fever.',
      preferredDate: '2026-10-19',
      preferredTime: '09:30 AM',
      urgency: 'HIGH',
      status: 'PENDING_REVIEW',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-15T08:30:00Z'
    },
    {
      id: '102',
      reference: 'APT-2026-J404',
      patientName: 'Jhon Deo',
      phone: '+233 50 123 4567',
      email: 'jhon.deo@example.com',
      gender: 'Male',
      age: 45,
      department: 'Endocrinology',
      doctorId: '2',
      doctorName: 'Dr. Sarah Koomson',
      symptoms: 'Excessive night sweating, dizziness after carbohydrate-rich meals, persistent thirst.',
      preferredDate: '2026-10-19',
      preferredTime: '11:00 AM',
      urgency: 'MEDIUM',
      status: 'PENDING_REVIEW',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-15T10:15:00Z'
    },
    {
      id: '103',
      reference: 'APT-2026-S105',
      patientName: 'Sanath Deo',
      phone: '+233 20 888 3311',
      email: 'sanath.deo@example.com',
      gender: 'Male',
      age: 37,
      department: 'Cardiology',
      doctorId: '3',
      doctorName: 'Dr. Edward Cudjoe',
      symptoms: 'Elevated systolic blood pressure (155/95), mild palpitations following light exertion.',
      preferredDate: '2026-10-21',
      preferredTime: '12:30 PM',
      urgency: 'HIGH',
      status: 'CONFIRMED',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-14T14:20:00Z'
    },
    {
      id: '104',
      reference: 'APT-2026-E441',
      patientName: 'Emmanuel Adjei',
      phone: '+233 27 777 9900',
      email: 'emmanuel.adjei@example.com',
      gender: 'Male',
      age: 28,
      department: 'Emergency Care',
      doctorId: '1',
      doctorName: 'Dr. Marttin Deo',
      symptoms: 'Acute abdominal lower right quadrant sharp pain, nausea for 8 hours, rebound tenderness.',
      preferredDate: '2026-10-19',
      preferredTime: 'Immediate Triage',
      urgency: 'EMERGENCY',
      status: 'CONFIRMED',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-18T22:00:00Z'
    },
    {
      id: '105',
      reference: 'APT-2026-K330',
      patientName: 'Komola Haris',
      phone: '+233 55 444 2211',
      email: 'komola.haris@example.com',
      gender: 'Female',
      age: 12,
      department: 'Pediatrics',
      doctorId: '2',
      doctorName: 'Dr. Sarah Koomson',
      symptoms: 'Recurrent seasonal allergies, rhinorrhea, mild ocular pruritus, no fever.',
      preferredDate: '2026-10-21',
      preferredTime: '01:30 PM',
      urgency: 'LOW',
      status: 'CONFIRMED',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-16T11:45:00Z'
    },
    {
      id: '106',
      reference: 'APT-2026-F219',
      patientName: 'Fatima Bello',
      phone: '+233 24 333 7788',
      email: 'fatima.bello@example.com',
      gender: 'Female',
      age: 29,
      department: 'Obstetrics and Gynaecology',
      doctorId: '2',
      doctorName: 'Dr. Sarah Koomson',
      symptoms: 'Routine second-trimester prenatal sonogram follow-up and maternal glucose screening.',
      preferredDate: '2026-10-17',
      preferredTime: '10:00 AM',
      urgency: 'LOW',
      status: 'COMPLETED',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-10T09:00:00Z'
    },
    {
      id: '107',
      reference: 'APT-2026-R772',
      patientName: 'Robert Mensah',
      phone: '+233 20 111 6655',
      email: 'robert.mensah@example.com',
      gender: 'Male',
      age: 52,
      department: 'Orthopedics',
      doctorId: '3',
      doctorName: 'Dr. Edward Cudjoe',
      symptoms: 'Post-operative right knee arthroscopy rehabilitation evaluation, reduced mobility.',
      preferredDate: '2026-10-16',
      preferredTime: '03:00 PM',
      urgency: 'MEDIUM',
      status: 'COMPLETED',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-09T16:30:00Z'
    },
    {
      id: '108',
      reference: 'APT-2026-A583',
      patientName: 'Abena Osei',
      phone: '+233 50 999 4433',
      email: 'abena.osei@example.com',
      gender: 'Female',
      age: 24,
      department: 'Dermatology',
      doctorId: '1',
      doctorName: 'Dr. Marttin Deo',
      symptoms: 'Contact dermatitis on lateral forearm following detergent exposure.',
      preferredDate: '2026-10-18',
      preferredTime: '11:30 AM',
      urgency: 'LOW',
      status: 'CANCELLED',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      createdAt: '2026-10-12T13:10:00Z'
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
    getAllAppointments: () => Promise.resolve(getStoredAppointments()),
    addAppointment: (appt) => {
      const list = getStoredAppointments();
      const newAppt = {
        id: 'apt_' + Date.now(),
        reference: 'APT-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        status: 'PENDING_REVIEW',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString(),
        ...appt
      };
      list.unshift(newAppt);
      saveStoredAppointments(list);
      return Promise.resolve(newAppt);
    },
    updateAppointment: (id, fields) => {
      const list = getStoredAppointments();
      const updated = list.map(item => String(item.id) === String(id) ? { ...item, ...fields, updatedAt: new Date().toISOString() } : item);
      saveStoredAppointments(updated);
      return Promise.resolve({ success: true });
    },
    deleteAppointment: (id) => {
      const list = getStoredAppointments();
      const filtered = list.filter(item => String(item.id) !== String(id));
      saveStoredAppointments(filtered);
      return Promise.resolve({ success: true });
    },
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