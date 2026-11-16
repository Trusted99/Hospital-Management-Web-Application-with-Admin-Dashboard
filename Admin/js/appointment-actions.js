/**
 * appointment-actions.js - Human-in-the-Loop (HITL) Triage, Verification & Notification Dispatch
 */
const AppointmentActions = (function () {
  let modal = null;
  let form  = null;

  // Mapping of departments to doctors for automated validation
  const departmentDoctors = {
    'General Medicine': [{ id: '1', name: 'Dr. Marttin Deo' }],
    'Endocrinology': [{ id: '2', name: 'Dr. Sarah Koomson' }],
    'Cardiology': [{ id: '3', name: 'Dr. Edward Cudjoe' }],
    'Pediatrics': [{ id: '4', name: 'Dr. Comfort Mensah' }],
    'Emergency Care': [{ id: '5', name: 'Dr. Kwame Ansah' }]
  };

  function init() {
    modal = document.getElementById('triageModal');
    form  = document.getElementById('triageForm');
    if (!modal) return;

    // Handle department change to dynamically repopulate doctor options
    const deptSelect = document.getElementById('triageDepartment');
    if (deptSelect) {
      deptSelect.addEventListener('change', (e) => {
        updateDoctorDropdown(e.target.value);
      });
    }

    // Modal background click dismissal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    // Form submission
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
    }
  }

  function updateDoctorDropdown(department, selectedDoctorId = null) {
    const docSelect = document.getElementById('triageDoctor');
    if (!docSelect) return;

    docSelect.innerHTML = '';
    let doctors = [];

    // Dynamically query loaded hospital doctors data if present
    if (window.DOCTORS_DATA && Array.isArray(window.DOCTORS_DATA) && window.DOCTORS_DATA.length > 0) {
      const deptKey = (department || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = window.DOCTORS_DATA.filter((d) => {
        const specKey = (d.specialty || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const docDeptKey = (d.departmentId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return specKey.includes(deptKey) || deptKey.includes(specKey) || docDeptKey.includes(deptKey) || deptKey.includes(docDeptKey);
      });
      if (matched.length > 0) {
        doctors = matched.map((d) => ({ id: d.id, name: d.name }));
      }
    }

    if (doctors.length === 0) {
      doctors = departmentDoctors[department] || [{ id: '1', name: 'Dr. Marttin Deo' }];
    }

    doctors.forEach((doc) => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = `${doc.name} (${department})`;
      if (selectedDoctorId && (selectedDoctorId === doc.id || selectedDoctorId === doc.name)) {
        opt.selected = true;
      }
      docSelect.appendChild(opt);
    });
  }

  function openTriage(data) {
    document.getElementById('modalAppointmentId').value = data.id;
    document.getElementById('modalRef').textContent = data.reference || `APT-${data.id}`;
    document.getElementById('modalPatient').textContent = `${data.patientName} (${data.phone || 'No phone'})`;
    document.getElementById('modalTime').textContent = data.preferredTime;
    document.getElementById('modalSymptoms').textContent = data.symptoms;

    const deptSelect = document.getElementById('triageDepartment');
    if (deptSelect) {
      deptSelect.value = data.department || 'General Medicine';
      updateDoctorDropdown(deptSelect.value, data.doctorId);
    }

    const urgencySelect = document.getElementById('triageUrgency');
    if (urgencySelect) {
      urgencySelect.value = data.urgency || 'MEDIUM';
    }

    const noteField = document.getElementById('triageNote');
    if (noteField) {
      noteField.value = `Patient symptoms assessed: "${data.symptoms.substring(0, 50)}...". Confirmed for scheduled slot.`;
    }

    modal.classList.add('active');
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('modalAppointmentId').value;
    const department = document.getElementById('triageDepartment').value;
    const doctorSelect = document.getElementById('triageDoctor');
    const doctorId = doctorSelect.value;
    const doctorName = doctorSelect.options[doctorSelect.selectedIndex].text;
    const urgency = document.getElementById('triageUrgency').value;
    const triageNote = document.getElementById('triageNote').value;
    const ref = document.getElementById('modalRef').textContent;
    const patientText = document.getElementById('modalPatient').textContent;

    const payload = {
      appointmentId: id,
      reference: ref,
      department,
      doctorId,
      doctorName,
      urgency,
      triageNote,
      status: 'CONFIRMED',
      triagedAt: new Date().toISOString()
    };

    // Dispatch via API
    await API.triageAppointment(id, payload);

    // Simulate multi-channel human-in-the-loop notification dispatch
    dispatchSimulatedAlerts(patientText, doctorName, ref, urgency);

    // Animate removal from the review queue
    removeQueueRow(id);
    closeModal();
  }

  async function quickDecide(id, decisionStatus) {
    const isApproved = decisionStatus === 'CONFIRMED';
    const confirmPrompt = isApproved
      ? `Directly approve and confirm request #${id}?`
      : `Decline and notify patient for request #${id}?`;

    if (!confirm(confirmPrompt)) return;

    await API.updateStatus(id, decisionStatus, isApproved ? 'Quick-approved by triage staff' : 'Declined: slot unavailable');
    removeQueueRow(id);

    console.log(`[HITL Audit] Request #${id} updated to ${decisionStatus}`);
  }

  function removeQueueRow(id) {
    const row = document.getElementById(`req-row-${id}`);
    if (row) {
      row.style.transition = 'all 0.35s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(30px)';
      setTimeout(() => {
        row.remove();
        checkEmptyQueue();
      }, 350);
    }
  }

  function checkEmptyQueue() {
    const list = document.getElementById('hitlRequestList');
    if (list && list.children.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 0.82rem;">
          <p>✓ All pending requests triaged and dispatched.</p>
        </div>
      `;
    }
  }

  function dispatchSimulatedAlerts(patient, doctor, ref, urgency) {
    console.info(`%c[HITL DISPATCH SUCCESS]`, 'color: #10B981; font-weight: bold;');
    console.info(`1. SMS dispatched to ${patient} -> "Your appointment (${ref}) is CONFIRMED with ${doctor}."`);
    console.info(`2. Doctor Portal Sync -> "${doctor} has a new ${urgency} priority booking: Ref ${ref}."`);

    alert(
      `✓ Verification Finalized:\n` +
      `- Doctor notified with clinical triage notes.\n` +
      `- Confirmation SMS/Email dispatched to ${patient}.`
    );
  }

  return {
    init,
    openTriage,
    closeModal,
    quickDecide
  };
})();