// ============================================================
// DASHBOARD.JS — Admin Login, Complaint Management
// ============================================================

let detailMap = null;

function initDashboard() {
    if (isAdminLoggedIn()) {
        showDashboard();
    } else {
        document.getElementById('adminLogin').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
    }
}

// ---- Login ----
document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = document.getElementById('adminUser').value.trim();
    const p = document.getElementById('adminPass').value.trim();
    if (adminLogin(u, p)) {
        document.getElementById('loginError').style.display = 'none';
        showDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    adminLogout();
    document.getElementById('adminLogin').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
});

function showDashboard() {
    document.getElementById('adminLogin').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    renderAdminStats();
    renderComplaintsTable();
}

// ---- Admin Stats ----
async function renderAdminStats() {
    const s = await getStats();
    document.getElementById('adminStatsGrid').innerHTML = `
        <div class="admin-stat"><div class="stat-val" style="color:var(--blue-light)">${s.total}</div><div class="stat-lbl">Total</div></div>
        <div class="admin-stat"><div class="stat-val" style="color:var(--yellow)">${s.pending}</div><div class="stat-lbl">Pending</div></div>
        <div class="admin-stat"><div class="stat-val" style="color:#A78BFA">${s.inProgress}</div><div class="stat-lbl">In Progress</div></div>
        <div class="admin-stat"><div class="stat-val" style="color:var(--green)">${s.resolved}</div><div class="stat-lbl">Resolved</div></div>
    `;
}

// ---- Complaints Table ----
async function renderComplaintsTable() {
    let complaints = await getComplaints();
    const statusFilter = document.getElementById('filterStatus').value;
    const severityFilter = document.getElementById('filterSeverity').value;
    const searchFilter = document.getElementById('filterSearch').value.toLowerCase();

    if (statusFilter) complaints = complaints.filter(c => c.status === statusFilter);
    if (severityFilter) complaints = complaints.filter(c => c.severity === severityFilter);
    if (searchFilter) complaints = complaints.filter(c =>
        c.id.toLowerCase().includes(searchFilter) || c.name.toLowerCase().includes(searchFilter)
    );

    const tbody = document.getElementById('complaintsBody');
    if (complaints.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--gray-500);">No complaints match filters</td></tr>';
        return;
    }

    tbody.innerHTML = complaints.map(c => `
        <tr>
            <td><span style="color:var(--saffron);font-family:monospace;font-weight:600;font-size:0.8rem;">${c.id}</span></td>
            <td>${c.name}</td>
            <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.location?.address || 'N/A'}</td>
            <td><span class="severity-badge severity-${c.severity}">${c.severity}</span></td>
            <td><span class="complaint-status status-${c.status}" style="font-size:0.7rem;">${formatStatus(c.status)}</span></td>
            <td>${formatDate(c.submittedAt)}</td>
            <td><button class="btn-view" onclick="viewComplaint('${c.id}')">View</button></td>
        </tr>
    `).join('');
}

// Filters
document.getElementById('filterStatus').addEventListener('change', renderComplaintsTable);
document.getElementById('filterSeverity').addEventListener('change', renderComplaintsTable);
document.getElementById('filterSearch').addEventListener('input', renderComplaintsTable);

// ---- View Complaint Modal ----
async function viewComplaint(id) {
    const c = await getComplaintById(id);
    if (!c) return;

    document.getElementById('modalTitle').textContent = `Complaint: ${c.id}`;
    document.getElementById('modalBody').innerHTML = `
        ${c.imageData ? `<img src="${c.imageData}" alt="Complaint Image" class="detail-image">` : ''}
        <div class="detail-grid">
            <div class="detail-item"><label>Complainant</label><p>${c.name}</p></div>
            <div class="detail-item"><label>Phone</label><p>${c.phone}</p></div>
            <div class="detail-item"><label>Email</label><p>${c.email || 'N/A'}</p></div>
            <div class="detail-item"><label>Severity</label><p><span class="severity-badge severity-${c.severity}">${c.severity}</span></p></div>
            <div class="detail-item"><label>Road Type</label><p>${(c.roadType || '').replace(/-/g, ' ')}</p></div>
            <div class="detail-item"><label>Submitted</label><p>${formatDate(c.submittedAt)}</p></div>
        </div>
        <div class="detail-item" style="margin-bottom:16px;"><label>Location</label><p>📍 ${c.location?.address || 'N/A'}</p></div>
        <div class="detail-item" style="margin-bottom:16px;"><label>Description</label><p>${c.description}</p></div>
        ${c.location?.lat ? `<div class="detail-map" id="modalMap"></div>` : ''}
        <div class="status-update">
            <div class="form-group" style="flex:1">
                <label>Update Status</label>
                <select id="newStatus">
                    <option value="pending" ${c.status==='pending'?'selected':''}>Pending</option>
                    <option value="under-review" ${c.status==='under-review'?'selected':''}>Under Review</option>
                    <option value="in-progress" ${c.status==='in-progress'?'selected':''}>In Progress</option>
                    <option value="resolved" ${c.status==='resolved'?'selected':''}>Resolved</option>
                </select>
            </div>
            <div class="form-group" style="flex:1">
                <label>Note</label>
                <input type="text" id="statusNote" placeholder="Add a note...">
            </div>
            <button class="btn-update" onclick="updateStatus('${c.id}')">Update</button>
        </div>
    `;

    document.getElementById('complaintModal').classList.add('show');

    // Init modal map
    if (c.location?.lat) {
        setTimeout(() => {
            if (detailMap) { detailMap.remove(); detailMap = null; }
            detailMap = L.map('modalMap').setView([c.location.lat, c.location.lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:18 }).addTo(detailMap);
            L.marker([c.location.lat, c.location.lng]).addTo(detailMap);
        }, 200);
    }
}

async function updateStatus(id) {
    const newStatus = document.getElementById('newStatus').value;
    const note = document.getElementById('statusNote').value.trim();
    await updateComplaintStatus(id, newStatus, note);
    document.getElementById('complaintModal').classList.remove('show');
    renderAdminStats();
    renderComplaintsTable();
}

// Close modal
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('complaintModal').classList.remove('show');
});
document.getElementById('complaintModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('complaintModal').classList.remove('show');
});

window.addEventListener('languageChanged', () => {
    if (!document.getElementById('adminDashboard').classList.contains('hidden')) {
        renderAdminStats();
        renderComplaintsTable();
    }
});
