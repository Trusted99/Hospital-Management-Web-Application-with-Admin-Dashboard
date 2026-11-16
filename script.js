/**
 * Trusted Cares Hospital Management System
 * Universal Interactive Engine, Department Routing & About Us Dynamics
 */

// DOCTORS_DATA is loaded globally from doctorsData.js (plain script tag before this file).
// Fallback: empty array if the file hasn't loaded yet (should not happen in normal flow).
var DOCTORS_DATA = window.DOCTORS_DATA || [];

document.addEventListener('DOMContentLoaded', () => {
  initGlassHoverEffects();
  initMetricCounterAnimations();
  initSplitHeaderScroll();
  initActionHandlers();
  initAboutUsPageInteractions();
  initAppointmentFormListener();

  // Expose modal handlers globally for inline HTML attributes (onclick)
  window.openDeptModal = openDeptModal;
  window.closeDeptModal = closeDeptModal;
  window.initiateDoctorBooking = initiateDoctorBooking;
  window.closeAppointmentModal = closeAppointmentModal;
});

/* ==========================================================================
   1. SPECULAR REFLECTION & DYNAMIC 3D TILT ON GLASS PANELS
   ========================================================================== */
function initGlassHoverEffects() {
  const glassCards = document.querySelectorAll(
    '.glass-panel, .mini-widget, .metric-widget, .dept-card, .glass-pill-capsule'
  );

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  glassCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -2.5;
      const rotateY = ((x - centerX) / centerX) * 2.5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.16) 0%, rgba(227, 229, 231, 0.07) 80%)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.background = '';
      card.style.transition = 'transform 0.4s ease, background 0.4s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
}

/* ==========================================================================
   2. LIVE METRICS ANIMATION & SIMULATION
   ========================================================================== */
function initMetricCounterAnimations() {
  const counterElements = [
    { selector: '.metric-number', target: 12, suffix: ' <span class="metric-unit">mins</span>' },
    { selector: '.mini-widget:nth-child(1) .mini-stat', target: 13, suffix: ' <span class="sub-unit">Specialized</span>' },
    { selector: '.mini-widget:nth-child(2) .mini-stat', target: DOCTORS_DATA.length || 29, suffix: ' <span class="sub-unit">Active</span>' }
  ];

  counterElements.forEach(({ selector, target, suffix }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    let current = 0;
    const stepTime = Math.max(10, Math.floor(1200 / target));

    const timer = setInterval(() => {
      current++;
      el.innerHTML = `${current}${suffix}`;
      if (current >= target) {
        clearInterval(timer);
      }
    }, stepTime);
  });

  // Emergency flow variation every 45s
  setInterval(() => {
    const waitTimeElement = document.querySelector('.metric-number');
    if (!waitTimeElement) return;
    const randomWait = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    waitTimeElement.innerHTML = `${randomWait} <span class="metric-unit">mins</span>`;
  }, 45000);
}

/* ==========================================================================
   3. DETACHED SPLIT HEADER SCROLL RESPONSIVENESS
   ========================================================================== */
function initSplitHeaderScroll() {
  const capsules = document.querySelectorAll('.glass-pill-capsule');
  if (!capsules.length) return;

  const isAboutPage = document.body.classList.contains('about-page');

  window.addEventListener('scroll', () => {
    if (isAboutPage) {
      capsules.forEach((capsule) => {
        capsule.style.background = window.scrollY > 20 ? 'rgba(15, 23, 42, 0.95)' : '#121316';
        capsule.style.boxShadow = window.scrollY > 20 
          ? '0 12px 32px rgba(0, 0, 0, 0.25)' 
          : '0 8px 20px rgba(0, 0, 0, 0.15)';
      });
      return;
    }

    if (window.scrollY > 10) {
      capsules.forEach((capsule) => {
        capsule.style.background = 'rgba(18, 22, 28, 0.88)';
        capsule.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.6)';
        capsule.style.borderColor = 'rgba(255, 255, 255, 0.3)';
      });
    } else {
      capsules.forEach((capsule) => {
        capsule.style.background = 'rgba(227, 229, 231, 0.08)';
        capsule.style.boxShadow = '';
        capsule.style.borderColor = 'rgba(255, 255, 255, 0.22)';
      });
    }
  });

  window.dispatchEvent(new Event('scroll'));
}

/* ==========================================================================
   4. NAVIGATION & HOMEPAGE BUTTON ACTIONS
   ========================================================================== */
function initActionHandlers() {
  const bookBtn = document.querySelector('.btn-primary-action');
  if (bookBtn && !document.getElementById('appointmentForm')) {
    bookBtn.addEventListener('click', () => {
      window.location.href = 'Departments.html';
    });
  }

  const deptBtn = document.querySelector('.btn-secondary-action');
  if (deptBtn && !document.getElementById('appointmentForm')) {
    deptBtn.addEventListener('click', () => {
      window.location.href = 'Departments.html';
    });
  }
}

/* ==========================================================================
   5. ABOUT US PAGE DYNAMICS
   ========================================================================== */
function initAboutUsPageInteractions() {
  const headerOffset = 90;
  const internalAnchorLinks = document.querySelectorAll('a[href^="#"]');

  internalAnchorLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  const tornCards = document.querySelectorAll('.torn-paper-wrapper');
  if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    tornCards.forEach((wrapper) => {
      const card = wrapper.querySelector('.torn-paper-card');
      const img = wrapper.querySelector('.torn-image');

      wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const tiltX = (y / rect.height) * -6;
        const tiltY = (x / rect.width) * 6;

        if (card) {
          card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        }
        if (img) {
          img.style.transform = `scale(1.08) translate3d(${x * 0.04}px, ${y * 0.04}px, 0)`;
        }
      });

      wrapper.addEventListener('mouseleave', () => {
        if (card) {
          card.style.transform = '';
          card.style.transition = 'transform 0.5s ease';
        }
        if (img) {
          img.style.transform = '';
          img.style.transition = 'transform 0.5s ease';
        }
      });

      wrapper.addEventListener('mouseenter', () => {
        if (card) card.style.transition = 'none';
        if (img) img.style.transition = 'none';
      });
    });
  }

  const quickNavLinks = document.querySelectorAll('.quick-nav-links a');
  const observedSections = document.querySelectorAll(
    '#facilities-overview, #facilities, #services, #care-philosophy, #contact'
  );

  if ('IntersectionObserver' in window && quickNavLinks.length && observedSections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            quickNavLinks.forEach((a) => {
              if (a.getAttribute('href') === `#${id}`) {
                a.style.backgroundColor = 'var(--primary-teal)';
                a.style.color = '#ffffff';
              } else {
                a.style.backgroundColor = '';
                a.style.color = '';
              }
            });
          }
        });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    observedSections.forEach((section) => observer.observe(section));
  }
}

/* ==========================================================================
   6. DEPARTMENTS & RESIDENT DATA
   ========================================================================== */
const departmentsData = {
  "emergency": {
    name: "Accident & Emergency (A&E)",
    desc: "24-hour critical care center equipped with dedicated resuscitation bays, cardiac monitoring, and direct trauma theater pathways.",
    subUnits: ["Trauma Resuscitation", "Acute Medical Triage", "Poison & Overdose Control", "Disaster Rapid Response"]
  },
  "cardiology": {
    name: "Cardiology Center",
    desc: "Advanced cardiac care, coronary catheterization interventions, arrhythmia ablation, and heart failure maintenance.",
    subUnits: ["Interventional Suite", "Echocardiography Lab", "Electrophysiology Unit", "Cardiac Rehabilitation"]
  },
  "internal-medicine": {
    name: "Internal Medicine",
    desc: "Specialized physician care covering complex non-surgical adult conditions across respiratory, metabolic, and systemic medicine.",
    subUnits: ["Cardiology", "Nephrology & Dialysis", "Respiratory Clinics", "Preventative Medicine"]
  },
  "general-surgery": {
    name: "General Surgery",
    desc: "Providing scheduled minimally invasive procedures, emergency laparoscopic surgery, and complex specialty reconstructions.",
    subUnits: ["Laparoscopic Suite", "Colorectal Surgery", "Urology & Lithotripsy", "Trauma Theater"]
  },
  "paediatrics": {
    name: "Paediatrics & Child Health",
    desc: "Complete child healthcare covering routine infant immunizations, neonatal intensive therapy, and pediatric emergencies.",
    subUnits: ["Neonatal ICU (NICU)", "Paediatric Critical Care", "Child Neurodevelopment", "Child Nutrition"]
  },
  "obgyn": {
    name: "Obstetrics & Gynaecology",
    desc: "Compassionate maternal care, comprehensive antenatal tracking, low-stress birthing suites, and specialized reproductive medicine.",
    subUnits: ["Antenatal & Postnatal Clinics", "High-Risk Birthing Suites", "Reproductive Endocrinology (PCOS/IVF)", "Gynaecological Surgery"]
  },
  "orthopaedics": {
    name: "Orthopaedics & Musculoskeletal Care",
    desc: "Complete surgical joint restoration, fracture recovery trauma, spine disorders, and sports injury rehabilitation.",
    subUnits: ["Joint Replacement (Arthroplasty)", "Spine Center", "Sports Medicine & Rehabilitation", "Trauma & Fracture Unit"]
  },
  "dermatology": {
    name: "Dermatology & Skin Center",
    desc: "Comprehensive therapeutic and aesthetic skin clinics treating chronic eczema, pigmentary conditions, and skin allergies.",
    subUnits: ["Clinical Dermatology", "Dermatosurgery", "Allergy Patch Testing", "Aesthetic Laser Therapy"]
  },
  "ophthalmology": {
    name: "Ophthalmology (Eye Clinic)",
    desc: "Precision eye examinations, microsurgical cataract extractions, laser therapies, and full optometrist vision diagnostics.",
    subUnits: ["Phacoemulsification Cataract Center", "Medical Retina Suite", "Glaucoma Screening", "Refractive Diagnostics"]
  },
  "ent": {
    name: "Ear, Nose & Throat (ENT)",
    desc: "Diagnosis and surgical resolution of hearing disorders, chronic sinus pathologies, vocal cord conditions, and head & neck trauma.",
    subUnits: ["Audiology & Hearing Lab", "Sinus & Endoscopic Surgery", "Vestibular Balance Lab", "Pediatric ENT"]
  },
  "neurology": {
    name: "Neurology & Brain Health",
    desc: "Specialized diagnostics and rehabilitation for acute stroke, neuromuscular disorders, seizure prevention, and sleep neurology.",
    subUnits: ["Stroke Recovery Unit", "Clinical Neurophysiology (EEG/EMG)", "Epilepsy Clinic", "Headache & Migraine Center"]
  },
  "psychiatry": {
    name: "Psychiatry & Mental Health",
    desc: "Compassionate, confidential care addressing anxiety, depression, mood disorders, substance rehabilitation, and psychological trauma.",
    subUnits: ["Adult Community Psychiatry", "Addiction & Detoxification", "Neuropsychiatry", "Cognitive Behavioral Therapy"]
  },
  "radiology": {
    name: "Radiology & Diagnostic Imaging",
    desc: "24/7 high-resolution digital imaging ensuring fast and precise clinical diagnostics for both emergency and scheduled cases.",
    subUnits: ["Multi-Slice CT Imaging", "Multiparametric MRI", "Women's Mammography & Ultrasound", "Emergency Trauma Radiography"]
  },
  "dental": {
    name: "Dental & Oral Health",
    desc: "Advanced oral maxillofacial surgery, aesthetic root restoration, orthodontics braces, and preventative periodontic oral hygiene.",
    subUnits: ["Cosmetic Dentistry", "Maxillofacial Surgery", "Orthodontics & Braces", "Paediatric Dental Care"]
  },
  "laboratory": {
    name: "Laboratory & Pathology",
    desc: "ISO-certified hematology, clinical biochemistry, automated microbiology culture, histology, and blood transfusion banking.",
    subUnits: ["Molecular PCR", "Blood Bank & Crossmatch", "Microbiology", "Histopathology"]
  },
  "oncology": {
    name: "Oncology & Infusion Centre",
    desc: "Tumour board conferences, outpatient chemotherapy infusion, targeted immunotherapy, and holistic palliative supportive care.",
    subUnits: ["Medical Oncology", "Infusion Suites", "Palliative Support", "Tumour Board MDT"]
  },
  "family-medicine": {
    name: "Family Medicine & Primary Care",
    desc: "First-line health evaluation, chronic illness maintenance (hypertension, diabetes), preventative screenings, and whole-family healthcare.",
    subUnits: ["Routine Medical Exams", "Chronic Disease Clinic", "Elderly Care", "Occupational & Travel Health"]
  }
};

/**
 * Maps department keys from DOCTORS_DATA to departmentsData keys
 */
function getDoctorsForDepartment(deptKey) {
  const departmentIdMap = {
    'emergency': ['emergency-medicine'],
    'cardiology': ['cardiology'],
    'internal-medicine': ['general-medicine'],
    'general-surgery': ['surgery'],
    'paediatrics': ['paediatrics'],
    'obgyn': ['obstetrics-gynaecology'],
    'orthopaedics': ['orthopaedics'],
    'dermatology': ['dermatology'],
    'ophthalmology': ['ophthalmology'],
    'ent': ['ent'],
    'neurology': ['neurology'],
    'psychiatry': ['psychiatry'],
    'radiology': ['radiology'],
    'dental': ['dental'],
    'laboratory': ['laboratory'],
    'oncology': ['oncology'],
    'family-medicine': ['family-medicine']
  };

  const matchingIds = departmentIdMap[deptKey] || [deptKey];
  return DOCTORS_DATA.filter((doc) => matchingIds.includes(doc.departmentId) && doc.isActive);
}

/* ==========================================================================
   7. DEPARTMENT ROSTER MODAL CONTROLLERS
   ========================================================================== */
function openDeptModal(deptId) {
  const data = departmentsData[deptId];
  if (!data) return;

  const modalName = document.getElementById('modalDeptName');
  const modalDesc = document.getElementById('modalDeptDesc');
  const subUnitsContainer = document.getElementById('modalSubUnitsList');
  const docContainer = document.getElementById('modalDoctorsList');
  const modal = document.getElementById('deptRosterModal');

  if (!modal || !modalName || !modalDesc || !subUnitsContainer || !docContainer) return;

  modalName.textContent = data.name;
  modalDesc.textContent = data.desc;

  // Render Sub-Units
  subUnitsContainer.innerHTML = '';
  data.subUnits.forEach((unit) => {
    const span = document.createElement('span');
    span.className = 'sub-unit-tag';
    span.textContent = unit;
    subUnitsContainer.appendChild(span);
  });

  // Render Doctors from DOCTORS_DATA
  const docs = getDoctorsForDepartment(deptId);
  docContainer.innerHTML = '';

  if (docs.length === 0) {
    docContainer.innerHTML = '<p class="no-docs-message" style="color: #94a3b8; font-size: 0.95rem;">No resident consultants currently listed for this unit.</p>';
  } else {
    docs.forEach((doc) => {
      const card = document.createElement('div');
      card.className = 'doctor-item-card';

      // Fallback initial if image fails or is missing
      const avatarContent = doc.image
        ? `<img src="${doc.image}" alt="${doc.name}" class="doc-avatar-img" onerror="this.onerror=null;this.parentElement.innerHTML='${doc.name.replace('Dr. ', '').charAt(0)}';" />`
        : `<div class="doc-avatar">${doc.name.replace('Dr. ', '').charAt(0)}</div>`;

      card.innerHTML = `
        <div class="doc-info-wrapper">
          <div class="doc-info-top">
            <div class="doc-avatar-container">${avatarContent}</div>
            <div>
              <div class="doc-name">${doc.name}</div>
              <div class="doc-title">${doc.title}</div>
              <div class="doc-specialty" style="font-size: 0.85rem; color: #0d9488; margin-top: 2px;">
                ${doc.specialty} &bull; ${doc.yearsExperience} yrs exp
              </div>
            </div>
          </div>
          <div class="doc-bio" style="font-size: 0.85rem; color: #cbd5e1; margin: 8px 0;">
            ${doc.shortBio}
          </div>
          <div class="doc-meta" style="font-size: 0.8rem; color: #94a3b8;">
            <span><strong>Languages:</strong> ${doc.languages.join(', ')}</span>
          </div>
        </div>
        <button class="btn-book-doctor" onclick="initiateDoctorBooking('${data.name.replace(/'/g, "\\'")}', '${doc.name.replace(/'/g, "\\'")}')">
          Book with Doctor &rarr;
        </button>
      `;
      docContainer.appendChild(card);
    });
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeDeptModal() {
  const modal = document.getElementById('deptRosterModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   8. CONTEXT-LOCKED APPOINTMENT MODAL & ROUTING
   ========================================================================== */
function initiateDoctorBooking(deptName, doctorName) {
  closeDeptModal();

  const lockDept = document.getElementById('lockDeptName');
  const lockDoc = document.getElementById('lockDoctorName');
  const hiddenDept = document.getElementById('hiddenDeptInput');
  const hiddenDoc = document.getElementById('hiddenDoctorInput');
  const dateInput = document.getElementById('consultDate');
  const apptModal = document.getElementById('appointmentModal');

  if (!apptModal) return;

  if (lockDept) lockDept.textContent = deptName;
  if (lockDoc) lockDoc.textContent = doctorName;
  if (hiddenDept) hiddenDept.value = deptName;
  if (hiddenDoc) hiddenDoc.value = doctorName;

  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }

  apptModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAppointmentModal() {
  const apptModal = document.getElementById('appointmentModal');
  if (apptModal) {
    apptModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function initAppointmentFormListener() {
  const form = document.getElementById('appointmentForm');
  if (form) {
    form.addEventListener('submit', handleAppointmentSubmit);
  }
}

function handleAppointmentSubmit(e) {
  e.preventDefault();

  const dept = document.getElementById('hiddenDeptInput')?.value || 'General Medicine';
  const doctor = document.getElementById('hiddenDoctorInput')?.value || 'First Available Specialist';
  const date = document.getElementById('consultDate')?.value;
  const time = document.getElementById('consultTime')?.value;
  const patientName = document.getElementById('patientName')?.value?.trim();
  const patientPhone = document.getElementById('patientPhone')?.value?.trim();
  const notes = document.getElementById('consultNotes')?.value?.trim() || 'No specific symptoms entered';

  if (!date || !time) {
    alert('Please select both a date and a time slot for your consultation.');
    return;
  }

  const generatedRef = 'APT-2026-N' + Math.floor(100 + Math.random() * 900);
  const newAppointment = {
    id: 'apt-' + Date.now(),
    reference: generatedRef,
    patientName: patientName || 'Walk-in Patient',
    phone: patientPhone || 'N/A',
    email: '',
    department: dept,
    doctorName: doctor,
    symptoms: notes,
    preferredTime: `${date} at ${time}`,
    urgency: 'MEDIUM',
    status: 'PENDING_REVIEW',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  };

  // Sync to localStorage for Admin Dashboard HITL Triage Queue
  try {
    const STORAGE_KEY = 'trusted_cares_appointments';
    let stored = [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      stored = JSON.parse(raw);
    }
    if (!Array.isArray(stored) || stored.length === 0) {
      stored = [
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
    }
    stored.unshift(newAppointment);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (err) {
    console.warn('[Storage] Could not persist appointment:', err);
  }

  console.log('Consultation Booked:', newAppointment);

  // Success Confirmation Feedback
  alert(`✓ Booking Submitted!\n\nReference: ${generatedRef}\nDoctor: ${doctor}\nDepartment: ${dept}\nDate & Time: ${date} at ${time}\n\nYour request has been routed to our clinical triage team for priority assignment.`);

  const form = document.getElementById('appointmentForm');
  if (form) form.reset();

  closeAppointmentModal();
}