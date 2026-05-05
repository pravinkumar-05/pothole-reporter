// ============================================================
// APP.JS — Navigation, Routing, Stats, Hero Map
// ============================================================

let heroMap = null;

// ---- Navigation ----
function navigateTo(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + pageName);
    if (target) { target.classList.remove('hidden'); }

    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-links a[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Page-specific init
    if (pageName === 'home') { updateStats(); renderRecentComplaints(); }
    if (pageName === 'report') { initReportPage(); }
    if (pageName === 'dashboard') { initDashboard(); }
}

// ---- Event Delegation for all [data-page] clicks ----
document.addEventListener('click', (e) => {
    const pageLink = e.target.closest('[data-page]');
    if (pageLink) {
        e.preventDefault();
        navigateTo(pageLink.dataset.page);
    }
});

// ---- Hamburger ----
document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
});

// ---- Navbar Scroll Effect ----
window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ---- Update Stats ----
async function updateStats() {
    const stats = await getStats();
    animateNumber('statTotal', stats.total);
    animateNumber('statPending', stats.pending);
    animateNumber('statProgress', stats.inProgress);
    animateNumber('statResolved', stats.resolved);
    animateNumber('heroTotal', stats.total);
    animateNumber('heroResolved', stats.resolved);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
    }, 40);
}

// ---- Render Recent Complaints ----
async function renderRecentComplaints() {
    const container = document.getElementById('recentComplaints');
    // Show loading state
    container.innerHTML = '<div style="text-align:center;padding:40px;grid-column:1/-1;"><div class="loading-spinner"></div><p style="color:var(--gray-500);margin-top:16px;">Loading complaints...</p></div>';
    
    try {
        const allComplaints = await getComplaints();
        const complaints = allComplaints.slice(0, 6);
        if (complaints.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:60px 20px;grid-column:1/-1;">
                    <div style="font-size:3rem;margin-bottom:16px;">📭</div>
                    <p style="color:var(--gray-400);font-size:1.1rem;font-weight:600;margin-bottom:8px;">No complaints yet</p>
                    <p style="color:var(--gray-500);font-size:0.9rem;">Be the first to report a pothole! Click "Report a Pothole" to get started.</p>
                </div>`;
            return;
        }
        container.innerHTML = complaints.map(c => `
            <div class="complaint-card" onclick="showComplaintDetail('${c.id}')" style="cursor:pointer;">
                ${c.imageData ? `<img src="${c.imageData}" alt="Pothole" class="complaint-thumb">` : ''}
                <div class="complaint-header">
                    <span class="complaint-id">${c.id}</span>
                    <span class="complaint-status status-${c.status}">${formatStatus(c.status)}</span>
                </div>
                <p class="complaint-desc">${c.description}</p>
                <div class="complaint-meta">
                    <span class="severity-badge severity-${c.severity}">${c.severity}</span>
                    <span>📍 ${c.location?.address || 'Unknown'}</span>
                </div>
                <div class="complaint-meta" style="margin-top:8px;">
                    <span>👤 ${c.name}</span>
                    <span>📅 ${formatDate(c.submittedAt)}</span>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to render complaints:', error);
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;grid-column:1/-1;">
                <div style="font-size:3rem;margin-bottom:16px;">⚠️</div>
                <p style="color:var(--gray-400);font-size:1.1rem;font-weight:600;margin-bottom:8px;">Unable to load complaints</p>
                <p style="color:var(--gray-500);font-size:0.9rem;margin-bottom:16px;">Please make sure the server is running and try again.</p>
                <button class="btn-secondary" onclick="renderRecentComplaints()" style="padding:10px 24px;">🔄 Retry</button>
            </div>`;
    }
}

function formatStatus(status) {
    if (typeof t === 'function') return t('status_' + status.replace('-', '_'));
    const map = { 'pending': 'Pending', 'under-review': 'Under Review', 'in-progress': 'In Progress', 'resolved': 'Resolved' };
    return map[status] || status;
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---- Show Complaint Detail (from homepage cards) ----
async function showComplaintDetail(id) {
    const c = await getComplaintById(id);
    if (!c) return;

    document.getElementById('modalTitle').textContent = `Complaint: ${c.id}`;
    document.getElementById('modalBody').innerHTML = `
        ${c.imageData ? `<img src="${c.imageData}" alt="Complaint Image" class="detail-image">` : ''}
        <div class="detail-grid">
            <div class="detail-item"><label>Complainant</label><p>${c.name}</p></div>
            <div class="detail-item"><label>Phone</label><p>${c.phone}</p></div>
            <div class="detail-item"><label>Severity</label><p><span class="severity-badge severity-${c.severity}">${c.severity}</span></p></div>
            <div class="detail-item"><label>Status</label><p><span class="complaint-status status-${c.status}">${formatStatus(c.status)}</span></p></div>
            <div class="detail-item"><label>Road Type</label><p>${(c.roadType || '').replace(/-/g, ' ')}</p></div>
            <div class="detail-item"><label>Submitted</label><p>${formatDate(c.submittedAt)}</p></div>
        </div>
        <div class="detail-item" style="margin-bottom:16px;"><label>Location</label><p>📍 ${c.location?.address || 'N/A'}</p></div>
        <div class="detail-item" style="margin-bottom:16px;"><label>Description</label><p>${c.description}</p></div>
        ${c.location?.lat ? `<div class="detail-map" id="modalMap"></div>` : ''}
        ${c.statusHistory && c.statusHistory.length > 0 ? `
            <div style="margin-top:16px;">
                <label style="font-size:0.75rem;color:var(--gray-500);text-transform:uppercase;letter-spacing:0.5px;">Status Timeline</label>
                <div class="timeline" style="margin-top:12px;">
                    ${c.statusHistory.map((h, i) => `
                        <div class="timeline-item ${i === c.statusHistory.length - 1 ? 'current' : ''}">
                            <div class="timeline-status" style="color:var(--saffron)">${formatStatus(h.status)}</div>
                            <div class="timeline-note">${h.note || ''}</div>
                            <div class="timeline-date">${formatDate(h.date)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;

    document.getElementById('complaintModal').classList.add('show');

    // Init modal map if location exists
    if (c.location?.lat) {
        setTimeout(() => {
            const mapEl = document.getElementById('modalMap');
            if (!mapEl) return;
            const modalMap = L.map('modalMap').setView([c.location.lat, c.location.lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(modalMap);
            L.marker([c.location.lat, c.location.lng]).addTo(modalMap);
        }, 200);
    }
}

// ---- Hero Map ----
async function initHeroMap() {
    if (heroMap) return;
    heroMap = L.map('heroMap', { zoomControl: false, attributionControl: false }).setView([19.7515, 75.7139], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(heroMap);

    // Add complaint markers
    const complaints = await getComplaints();
    complaints.forEach(c => {
        if (c.location?.lat && c.location?.lng) {
            const color = c.status === 'resolved' ? '#10B981' : c.status === 'in-progress' ? '#A78BFA' : '#FF6B00';
            const marker = L.circleMarker([c.location.lat, c.location.lng], {
                radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.8
            }).addTo(heroMap);
            marker.bindPopup(`<b>${c.id}</b><br>${c.location.address}<br><i>${formatStatus(c.status)}</i>`);
        }
    });
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderRecentComplaints();
    setTimeout(initHeroMap, 300);
});

window.addEventListener('languageChanged', () => {
    updateStats();
    renderRecentComplaints();
    if (heroMap) {
        reportMap = null; // force map reload? Actually it's okay to leave map popup as is for now
    }
});
