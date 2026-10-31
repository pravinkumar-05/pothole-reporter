// ============================================================
// DASHBOARD.JS — Dual-Mode Citizen Portal & Admin GIS Center
// ============================================================

let detailMap = null;
let currentCitizenFilter = 'all';
let currentCitizenSearch = '';

function initDashboard() {
    if (typeof isAdminLoggedIn === 'function' && isAdminLoggedIn()) {
        showAdminDashboard();
    } else {
        showCitizenDashboard();
    }

    const urlParams = new URLSearchParams(window.location.search);
    const inspectId = urlParams.get('inspect');
    if (inspectId) {
        setTimeout(() => viewComplaint(inspectId), 350);
    }
}

// Sidebar logout
const dashLogoutBtn = document.getElementById('logoutBtn');
if (dashLogoutBtn) {
    dashLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof adminLogout === 'function') adminLogout();
        if (typeof clearCurrentUser === 'function') clearCurrentUser();
        if (typeof updateNavAuth === 'function') updateNavAuth();
        if (typeof showAuthToast === 'function') showAuthToast('Signed out from Admin Command Center');
        if (typeof navigateTo === 'function') navigateTo('home');
        showCitizenDashboard();
    });
}

function showCitizenDashboard() {
    const citizenView = document.getElementById('citizenDashboardView');
    const adminView = document.getElementById('adminDashboardView');
    const dashEl = document.getElementById('adminDashboard');

    if (citizenView) citizenView.classList.remove('hidden');
    if (adminView) adminView.classList.add('hidden');
    if (dashEl) dashEl.classList.add('hidden');

    renderCitizenDashboard();
    if (window.renderAllIcons && citizenView) {
        window.renderAllIcons(citizenView);
    }
}

function showAdminDashboard() {
    if (typeof isAdminLoggedIn === 'function' && !isAdminLoggedIn()) {
        showCitizenDashboard();
        return;
    }

    const citizenView = document.getElementById('citizenDashboardView');
    const adminView = document.getElementById('adminDashboardView');
    const dashEl = document.getElementById('adminDashboard');

    if (citizenView) citizenView.classList.add('hidden');
    if (adminView) adminView.classList.remove('hidden');
    if (dashEl) dashEl.classList.remove('hidden');

    const roleEl = document.getElementById('dashUserRole');
    if (roleEl) roleEl.textContent = 'PWD Administrator (State Command Center)';

    renderAdminStats();
    renderComplaintsTable();
    renderDashboardFeed();
    renderRegisteredUsers();
    if (window.renderAllIcons && adminView) {
        window.renderAllIcons(adminView);
    }
    if (typeof initDashboardGisMap === 'function') {
        setTimeout(initDashboardGisMap, 250);
    }
}

function exitAdminToCitizenDashboard() {
    showCitizenDashboard();
}

function switchToAdminPortalDirect() {
    openAdminLoginModal();
}

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ---- Admin Login Modal Controls ----
function openAdminLoginModal() {
    if (typeof isAdminLoggedIn === 'function' && isAdminLoggedIn()) {
        showAdminDashboard();
        return;
    }
    if (typeof openAuthModal === 'function') {
        openAuthModal('admin');
    } else if (typeof switchToAdminLogin === 'function') {
        switchToAdminLogin();
    }
}

function closeAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleAdminModalLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const user = document.getElementById('adminModalUser')?.value.trim();
    const pass = document.getElementById('adminModalPass')?.value;

    if (typeof adminLogin === 'function' && adminLogin(user, pass)) {
        closeAdminLoginModal();
        if (typeof showAuthToast === 'function') {
            showAuthToast('Admin authenticated. Loading GIS Command Center...');
        }
        if (typeof navigateTo === 'function') {
            navigateTo('dashboard');
        }
        showAdminDashboard();
    } else {
        alert('Authentication failed: Invalid credentials. Use demo: admin / admin123');
    }
    return false;
}

// ============================================================
// CITIZEN COMPLAINT STATUS PORTAL LOGIC
// ============================================================

function filterCitizenComplaints(status) {
    currentCitizenFilter = status;
    document.querySelectorAll('#citizenFilterPills .c-pill').forEach(btn => {
        if (btn.dataset.status === status) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    renderCitizenDashboardComplaints();
}

function handleCitizenSearch(query) {
    currentCitizenSearch = (query || '').toLowerCase().trim();
    renderCitizenDashboardComplaints();
}

async function renderCitizenDashboard() {
    await renderCitizenDashboardComplaints();
}

async function renderCitizenDashboardComplaints() {
    const container = document.getElementById('citizenComplaintsCards');
    if (!container) return;

    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    const complaints = await getComplaints();

    // Filter complaints for this citizen if logged in
    let citizenComplaints = [];
    if (user) {
        citizenComplaints = complaints.filter(c =>
            (c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
            (c.name && user.name && c.name.toLowerCase().includes(user.name.toLowerCase())) ||
            (c.phone && user.phone && c.phone === user.phone)
        );
        // If user logged in but has no registered complaints, show sample complaints for rich UX
        if (citizenComplaints.length === 0) {
            citizenComplaints = complaints;
        }
    } else {
        citizenComplaints = complaints;
    }

    // Update KPI counters
    const kpiTotal = document.getElementById('citizenKpiTotal');
    const kpiProgress = document.getElementById('citizenKpiProgress');
    const kpiResolved = document.getElementById('citizenKpiResolved');

    const totalCount = citizenComplaints.length;
    const progressCount = citizenComplaints.filter(c => c.status === 'in-progress' || c.status === 'under-review' || c.status === 'pending').length;
    const resolvedCount = citizenComplaints.filter(c => c.status === 'resolved').length;

    if (kpiTotal) kpiTotal.textContent = totalCount;
    if (kpiProgress) kpiProgress.textContent = progressCount;
    if (kpiResolved) kpiResolved.textContent = resolvedCount;

    // Subtitle customization
    const subtitle = document.getElementById('citizenHeaderSubtitle');
    if (subtitle) {
        if (user) {
            subtitle.textContent = `Showing complaints registered by ${user.name || user.email} with live PWD repair lifecycle.`;
        } else {
            subtitle.textContent = `Track real-time inspection, contractor dispatch, and hot-mix asphalt repair progress across Maharashtra road networks.`;
        }
    }

    // Apply Filter & Search
    let filtered = citizenComplaints;
    if (currentCitizenFilter !== 'all') {
        filtered = filtered.filter(c => c.status === currentCitizenFilter);
    }
    if (currentCitizenSearch) {
        filtered = filtered.filter(c =>
            (c.id && c.id.toLowerCase().includes(currentCitizenSearch)) ||
            (c.location?.address && c.location.address.toLowerCase().includes(currentCitizenSearch)) ||
            (c.description && c.description.toLowerCase().includes(currentCitizenSearch)) ||
            (c.name && c.name.toLowerCase().includes(currentCitizenSearch))
        );
    }

    if (filtered.length === 0) {
        const isSearchOrFilter = currentCitizenFilter !== 'all' || Boolean(currentCitizenSearch);
        const title = isSearchOrFilter 
            ? ((typeof t === 'function') ? t('no_complaints_match') : 'No complaints match this filter') 
            : ((typeof t === 'function') ? t('no_complaints_citizen') : 'No complaints registered yet');
        const sub = isSearchOrFilter 
            ? ((typeof t === 'function') ? t('no_complaints_match_sub') : 'Try clearing your search query or switching filter tabs.') 
            : ((typeof t === 'function') ? t('no_complaints_citizen_sub') : 'You haven\'t filed any pothole reports yet. Report road damage in your area to begin tracking live repairs!');
        const btnText = (typeof t === 'function') ? t('btn_register_pothole') : '+ Register New Pothole';
        container.innerHTML = `
            <div style="text-align:center;padding:48px 20px;background:var(--bg-card);border:1px solid var(--glass-border);border-radius:var(--radius-xl);">
                <i data-lucide="${isSearchOrFilter ? 'clipboard-x' : 'inbox'}" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
                <h4 style="font-size:1.1rem;color:var(--text-primary);margin-bottom:6px;">${title}</h4>
                <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:18px;">${sub}</p>
                <button type="button" class="btn-citizen-report" onclick="navigateTo('report')">
                    <i data-lucide="camera"></i>
                    <span>${btnText}</span>
                </button>
            </div>
        `;
        if (window.renderAllIcons) window.renderAllIcons(container);
        return;
    }

    container.innerHTML = filtered.map(c => {
        const status = c.status || 'pending';
        const roadKey = 'road_' + (c.roadType || 'state-highway').replace(/-/g, '_');
        const roadType = (typeof t === 'function' && t(roadKey)) ? t(roadKey) : (c.roadType || 'State Highway').replace(/-/g, ' ');

        let step1 = 'done';
        let step2 = (status === 'pending') ? 'current' : 'done';
        let step3 = (status === 'in-progress') ? 'current' : (status === 'resolved' ? 'done' : '');
        let step4 = (status === 'resolved') ? 'done' : '';

        let note = c.statusNote;
        if (!note) {
            if (status === 'resolved') note = (typeof t === 'function' && t('status_note_resolved')) ? t('status_note_resolved') : 'Hot-mix asphalt patch completed and verified by PWD Junior Engineer.';
            else if (status === 'in-progress') note = (typeof t === 'function' && t('status_note_in_progress')) ? t('status_note_in_progress') : 'Contractor road roller and hot asphalt repair team active on site.';
            else if (status === 'under-review') note = (typeof t === 'function' && t('status_note_under_review')) ? t('status_note_under_review') : 'Complaint assigned to municipal road division for structural inspection.';
            else note = (typeof t === 'function' && t('status_note_pending')) ? t('status_note_pending') : 'Complaint logged in PWD grievance queue. Geo-coordinates verified.';
        }

        const stage1Text = (typeof t === 'function') ? t('stage_filed') : '01 Filed';
        const stage2Text = (typeof t === 'function') ? t('stage_inspected') : '02 Inspected';
        const stage3Text = (typeof t === 'function') ? t('stage_in_repair') : '03 In Repair';
        const stage4Text = (typeof t === 'function') ? t('stage_resolved') : '04 Resolved';
        const pwdUpdateText = (typeof t === 'function') ? t('pwd_update') : 'PWD Update:';
        const filedByText = (typeof t === 'function') ? t('filed_by') : 'Filed by';
        const viewProofText = (typeof t === 'function') ? t('btn_view_map_proof') : 'View Live Map & Proof →';

        return `
            <div class="citizen-card-item">
                <div class="c-card-top-row">
                    <span class="c-card-id-badge">#${c.id}</span>
                    <div class="c-card-tags">
                        <span class="c-card-road-tag">${roadType}</span>
                        <span class="complaint-status status-${status}">${formatStatus(status)}</span>
                    </div>
                </div>

                <div class="c-card-location">
                    <i data-lucide="map-pin"></i>
                    <span>${c.location?.address || 'Maharashtra State Road'}</span>
                </div>

                <!-- 4-Stage Repair Lifecycle Stepper -->
                <div class="c-stepper-wrapper">
                    <div class="c-stepper-track">
                        <div class="c-stepper-node ${step1}">
                            <div class="c-node-circle"><i data-lucide="${step1 === 'done' ? 'check' : 'clipboard'}"></i></div>
                            <span class="c-node-label">${stage1Text}</span>
                        </div>
                        <div class="c-stepper-node ${step2}">
                            <div class="c-node-circle"><i data-lucide="${step2 === 'done' ? 'check' : 'search'}"></i></div>
                            <span class="c-node-label">${stage2Text}</span>
                        </div>
                        <div class="c-stepper-node ${step3}">
                            <div class="c-node-circle"><i data-lucide="${step3 === 'done' ? 'check' : 'wrench'}"></i></div>
                            <span class="c-node-label">${stage3Text}</span>
                        </div>
                        <div class="c-stepper-node ${step4}">
                            <div class="c-node-circle"><i data-lucide="${step4 === 'done' ? 'check' : 'flag'}"></i></div>
                            <span class="c-node-label">${stage4Text}</span>
                        </div>
                    </div>
                </div>

                <!-- PWD Field Inspection Note -->
                <div class="c-card-note-box">
                    <strong>${pwdUpdateText}</strong> ${note}
                </div>

                <!-- Card Bottom Row -->
                <div class="c-card-bottom-row">
                    <span class="c-card-date">
                        ${filedByText} <strong>${c.name || 'Citizen'}</strong> • ${formatDate(c.submittedAt)}
                    </span>
                    <button type="button" class="btn-c-details" onclick="viewComplaint('${c.id}')">
                        <i data-lucide="map"></i>
                        <span>${viewProofText}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    if (window.renderAllIcons) {
        window.renderAllIcons(container);
    }
}

// ---- Admin Stats (KPIs & Resolution Rate) ----
async function renderAdminStats() {
    let complaints = [];
    try {
        complaints = await getComplaints();
    } catch(e) {
        complaints = [];
    }

    // Dynamic metrics calculated purely from live database
    const totalReceived = complaints.length;
    const totalWorksDone = complaints.filter(c => c.status === 'resolved').length;
    const totalInProgress = complaints.filter(c => c.status === 'in-progress' || c.status === 'under-review').length;

    const resolutionRate = totalReceived > 0 
        ? Math.round((totalWorksDone / totalReceived) * 1000) / 10 
        : 0;

    // 1. Total Received Complaints
    const elReceived = document.getElementById('dashKpiTotalReceived') || document.getElementById('dashKpiTotal');
    if (elReceived) elReceived.textContent = totalReceived.toLocaleString();

    // 2. Total Works Done Complaints
    const elWorksDone = document.getElementById('dashKpiWorksDone') || document.getElementById('dashKpiResolved');
    if (elWorksDone) elWorksDone.textContent = totalWorksDone.toLocaleString();

    // 3. Work In Progress Complaints
    const elInProgress = document.getElementById('dashKpiInProgress') || document.getElementById('dashKpiProgress');
    if (elInProgress) elInProgress.textContent = totalInProgress.toLocaleString();

    // 4. Resolution Rate / Completion Rate
    const elRate = document.getElementById('dashKpiResolutionRate');
    if (elRate) elRate.textContent = `${resolutionRate}%`;

    // 5. Update Circular Gauge & Radial Meter
    const gaugePct = document.getElementById('dashGaugePct');
    const gaugeCircle = document.getElementById('dashGaugeCircle');
    if (gaugePct) gaugePct.textContent = `${resolutionRate}%`;
    if (gaugeCircle) {
        // Circumference 2 * PI * 38 ≈ 238.7
        const offset = Math.max(0, 238.7 * (1 - (resolutionRate / 100)));
        gaugeCircle.style.strokeDashoffset = offset;
    }
}

// ---- Dashboard Recent Complaints Feed ----
async function renderDashboardFeed() {
    const feedContainer = document.getElementById('dashRecentFeed');
    if (!feedContainer) return;
    try {
        const complaints = await getComplaints();
        if (complaints && complaints.length > 0) {
            feedContainer.innerHTML = complaints.slice(0, 6).map(c => `
                <div class="feed-item" onclick="viewComplaint('${c.id}')" style="cursor:pointer;" title="Click to inspect all details of complaint ${c.id}">
                    <div class="feed-icon-wrap ${c.status === 'resolved' ? 'icon-green' : c.status === 'in-progress' ? 'icon-orange' : 'icon-red'}">
                        <i data-lucide="${c.status === 'resolved' ? 'check-circle' : c.status === 'in-progress' ? 'hammer' : 'alert-triangle'}"></i>
                    </div>
                    <div class="feed-content">
                        <div class="feed-title-row">
                            <span class="feed-id">${c.id}</span>
                            <span class="complaint-status status-${c.status}">${formatStatus(c.status)}</span>
                        </div>
                        <div style="font-size:0.83rem;font-weight:700;color:var(--text-primary);margin-top:2px;">
                            ${escapeHtml(c.name)} • <span style="font-weight:500;color:var(--text-muted);">${(c.roadType || 'Road').replace(/-/g, ' ')}</span>
                        </div>
                        <span class="feed-loc">📍 ${escapeHtml(c.location?.address || 'Maharashtra Road')}</span>
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">
                            <span class="feed-time">📅 ${formatDate(c.submittedAt)}</span>
                            <span style="font-size:0.75rem;color:var(--blue-accent);font-weight:700;">Inspect →</span>
                        </div>
                    </div>
                </div>
            `).join('');
            if (typeof renderAllIcons === 'function') {
                renderAllIcons(feedContainer);
            }
        } else {
            feedContainer.innerHTML = `
                <div style="text-align:center;padding:50px 16px;color:var(--text-muted);">
                    <div style="font-size:2.5rem;margin-bottom:12px;">📭</div>
                    <strong style="display:block;color:var(--text-primary);font-size:0.95rem;margin-bottom:4px;">No complaints registered yet</strong>
                    <span style="font-size:0.82rem;">New citizen road reports will stream into this live feed automatically.</span>
                </div>
            `;
        }
    } catch (e) {
        console.warn('Feed render err:', e);
    }
}

// ---- Registered Users Directory Controller ----
let currentUsersSearchQuery = '';

function filterRegisteredUsersTable(query) {
    currentUsersSearchQuery = (query || '').toLowerCase().trim();
    renderRegisteredUsers();
}

async function renderRegisteredUsers() {
    const tbody = document.getElementById('registeredUsersTableBody');
    if (!tbody) return;

    const allUsers = (typeof getUsersDB === 'function') ? getUsersDB() : [];
    let complaints = [];
    try {
        complaints = await getComplaints();
    } catch(e) {
        complaints = [];
    }

    let filteredUsers = allUsers;
    if (currentUsersSearchQuery) {
        filteredUsers = allUsers.filter(u => 
            (u.name && u.name.toLowerCase().includes(currentUsersSearchQuery)) ||
            (u.email && u.email.toLowerCase().includes(currentUsersSearchQuery)) ||
            (u.phone && u.phone.includes(currentUsersSearchQuery)) ||
            (u.district && u.district.toLowerCase().includes(currentUsersSearchQuery))
        );
    }

    const countBadge = document.getElementById('registeredUsersCountBadge');
    if (countBadge) {
        countBadge.textContent = `${allUsers.length} Citizens Registered`;
    }

    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:28px;color:var(--text-muted);">No registered citizens match your search.</td></tr>';
        return;
    }

    tbody.innerHTML = filteredUsers.map(u => {
        const userReports = complaints.filter(c => 
            (c.email && u.email && c.email.toLowerCase() === u.email.toLowerCase()) ||
            (c.name && u.name && c.name.toLowerCase() === u.name.toLowerCase()) ||
            (c.phone && u.phone && c.phone === u.phone)
        );
        const reportCount = userReports.length;
        const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
        const joinedDate = u.registeredAt ? formatDate(u.registeredAt) : 'Recent';
        const role = u.role || 'Citizen Reporter';

        return `
            <tr class="clickable-complaint-row" onclick="filterComplaintsByUser('${escapeHtml(u.email || u.name)}')" title="Click to inspect complaints filed by ${escapeHtml(u.name)}">
                <td>
                    <div class="user-cell-profile">
                        <div class="u-cell-avatar">${initials}</div>
                        <div>
                            <strong class="u-cell-name">${escapeHtml(u.name || 'Citizen')}</strong>
                            <span class="u-cell-district">📍 ${escapeHtml(u.district || 'Maharashtra')}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="u-cell-contact">
                        <span>📧 ${escapeHtml(u.email || 'N/A')}</span>
                        <small>📞 ${escapeHtml(u.phone || 'N/A')}</small>
                    </div>
                </td>
                <td>
                    <span class="user-role-badge ${u.role && u.role.includes('Official') ? 'role-official' : 'role-citizen'}">${escapeHtml(role)}</span>
                </td>
                <td class="u-cell-date">${joinedDate}</td>
                <td>
                    <span class="user-reports-badge ${reportCount > 0 ? 'has-reports' : 'no-reports'}">
                        ${reportCount} ${(typeof t === 'function' && t('reports_suffix')) ? t('reports_suffix') : (reportCount === 1 ? 'Report' : 'Reports')}
                    </span>
                </td>
                <td>
                    <span class="user-status-pill status-active"><span class="active-dot"></span> ${(typeof t === 'function' && t('status_active')) ? t('status_active') : 'Active'}</span>
                </td>
                <td>
                    <button type="button" class="btn-filter-user-reports" onclick="event.stopPropagation(); filterComplaintsByUser('${escapeHtml(u.email || u.name)}')">
                        ${(typeof t === 'function' && t('btn_inspect_reports')) ? t('btn_inspect_reports') : 'Inspect Reports'} (${reportCount})
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filterComplaintsByUser(query) {
    const searchInput = document.getElementById('filterSearch');
    if (searchInput) {
        searchInput.value = query;
        renderComplaintsTable();
        const clearBtn = document.getElementById('btnClearComplaintsFilter');
        if (clearBtn) clearBtn.classList.remove('hidden');
        scrollToSection('complaintsTableSection');
    }
}

function clearComplaintsFilter() {
    const searchInput = document.getElementById('filterSearch');
    const statusSelect = document.getElementById('filterStatus');
    const sevSelect = document.getElementById('filterSeverity');
    if (searchInput) searchInput.value = '';
    if (statusSelect) statusSelect.value = '';
    if (sevSelect) sevSelect.value = '';
    const clearBtn = document.getElementById('btnClearComplaintsFilter');
    if (clearBtn) clearBtn.classList.add('hidden');
    renderComplaintsTable();
}

// Global Dashboard Search
const dashGlobal = document.getElementById('dashGlobalSearch');
if (dashGlobal) {
    dashGlobal.addEventListener('input', (e) => {
        const searchInput = document.getElementById('filterSearch');
        if (searchInput) {
            searchInput.value = e.target.value;
            renderComplaintsTable();
        }
    });
}

// Sidebar Navigation Tabs
document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const tab = link.dataset.tab;
        if (tab === 'complaints') {
            const tableSec = document.getElementById('complaintsTableSection');
            if (tableSec) tableSec.scrollIntoView({ behavior: 'smooth' });
        } else if (tab === 'users') {
            const usersSec = document.getElementById('registeredUsersSection');
            if (usersSec) usersSec.scrollIntoView({ behavior: 'smooth' });
        } else if (tab === 'map') {
            const mapSec = document.querySelector('.live-map-card');
            if (mapSec) mapSec.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

// ---- Complaints Table (Clickable Rows & Inspection) ----
async function renderComplaintsTable() {
    let complaints = await getComplaints();
    const statusFilter = document.getElementById('filterStatus')?.value || '';
    const severityFilter = document.getElementById('filterSeverity')?.value || '';
    const searchFilter = (document.getElementById('filterSearch')?.value || '').toLowerCase();

    const clearBtn = document.getElementById('btnClearComplaintsFilter');
    if (clearBtn) {
        if (statusFilter || severityFilter || searchFilter) {
            clearBtn.classList.remove('hidden');
        } else {
            clearBtn.classList.add('hidden');
        }
    }

    if (statusFilter) complaints = complaints.filter(c => c.status === statusFilter);
    if (severityFilter) complaints = complaints.filter(c => c.severity === severityFilter);
    if (searchFilter) {
        complaints = complaints.filter(c =>
            (c.id && c.id.toLowerCase().includes(searchFilter)) ||
            (c.name && c.name.toLowerCase().includes(searchFilter)) ||
            (c.email && c.email.toLowerCase().includes(searchFilter)) ||
            (c.location && c.location.address && c.location.address.toLowerCase().includes(searchFilter))
        );
    }

    const tbody = document.getElementById('complaintsBody');
    if (!tbody) return;

    if (complaints.length === 0) {
        const isFiltered = Boolean(statusFilter || severityFilter || searchFilter);
        const emptyTitle = isFiltered 
            ? ((typeof t === 'function' && t('no_complaints_filter')) ? t('no_complaints_filter') : 'No complaints match the selected filters.') 
            : ((typeof t === 'function' && t('no_complaints_table')) ? t('no_complaints_table') : 'No complaints registered yet');
        const emptySub = isFiltered 
            ? ((typeof t === 'function' && t('no_complaints_filter_sub')) ? t('no_complaints_filter_sub') : 'Try clearing or modifying the active filter criteria.') 
            : ((typeof t === 'function' && t('no_complaints_table_sub')) ? t('no_complaints_table_sub') : 'New complaints submitted by citizens will appear here automatically.');
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:48px 16px;color:var(--text-muted);"><div style="font-size:2rem;margin-bottom:8px;">📭</div><strong style="display:block;color:var(--text-primary);margin-bottom:4px;">${emptyTitle}</strong><span>${emptySub}</span></td></tr>`;
        return;
    }

    tbody.innerHTML = complaints.map(c => `
        <tr class="clickable-complaint-row" onclick="viewComplaint('${c.id}')" title="Click to inspect all information of complaint ${c.id}">
            <td><span style="color:var(--saffron);font-family:monospace;font-weight:700;font-size:0.83rem;">${c.id}</span></td>
            <td>
                <div>
                    <strong style="color:var(--text-primary);display:block;">${escapeHtml(c.name)}</strong>
                    <small style="color:var(--text-muted);">${escapeHtml(c.phone || c.email || '')}</small>
                </div>
            </td>
            <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(c.location?.address || 'N/A')}">
                📍 ${escapeHtml(c.location?.address || 'Maharashtra')}
            </td>
            <td><span class="severity-badge severity-${c.severity}">${(typeof t === 'function' && t('sev_' + c.severity)) ? t('sev_' + c.severity) : c.severity}</span></td>
            <td><span class="complaint-status status-${c.status}">${formatStatus(c.status)}</span></td>
            <td>${formatDate(c.submittedAt)}</td>
            <td>
                <button type="button" class="btn-inspect-action" onclick="event.stopPropagation(); viewComplaint('${c.id}')">
                    <span>${(typeof t === 'function' && t('btn_inspect')) ? t('btn_inspect') : 'Inspect'}</span>
                </button>
            </td>
        </tr>
    `).join('');
}

// Filters
document.getElementById('filterStatus')?.addEventListener('change', renderComplaintsTable);
document.getElementById('filterSeverity')?.addEventListener('change', renderComplaintsTable);
document.getElementById('filterSearch')?.addEventListener('input', renderComplaintsTable);

// ---- View / Inspect Complaint Modal (Comprehensive All Info View) ----
async function viewComplaint(id) {
    const c = await getComplaintById(id);
    if (!c) return;

    document.getElementById('modalTitle').textContent = `Inspection & Telemetry — ${c.id}`;
    document.getElementById('modalBody').innerHTML = `
        <div style="margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <div class="inspect-header-pill">
                <i data-lucide="shield-check" style="width:14px;height:14px;"></i>
                <span>Official PWD Citizen Report Record</span>
            </div>
            <span class="complaint-status status-${c.status}" style="font-size:0.82rem;padding:4px 12px;">${formatStatus(c.status)}</span>
        </div>

        ${c.imageData ? `
            <div style="position:relative;margin-bottom:18px;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--glass-border);background:#000;">
                <img src="${c.imageData}" alt="Complaint Photographic Evidence" class="detail-image" style="width:100%;max-height:280px;object-fit:cover;display:block;">
                <div style="position:absolute;bottom:8px;left:8px;background:rgba(0,0,0,0.75);color:#fff;padding:4px 10px;border-radius:4px;font-size:0.72rem;font-family:monospace;">
                    📸 Citizen Photo Evidence • Verified Timestamp
                </div>
            </div>
        ` : ''}

        <div class="detail-grid">
            <div class="detail-item">
                <label>Citizen Reporter</label>
                <p><strong>${escapeHtml(c.name)}</strong></p>
            </div>
            <div class="detail-item">
                <label>Contact Phone</label>
                <p><a href="tel:${escapeHtml(c.phone)}" style="color:var(--blue-accent);text-decoration:none;font-weight:600;">📞 ${escapeHtml(c.phone || 'N/A')}</a></p>
            </div>
            <div class="detail-item">
                <label>Email Address</label>
                <p><a href="mailto:${escapeHtml(c.email)}" style="color:var(--blue-accent);text-decoration:none;">📧 ${escapeHtml(c.email || 'N/A')}</a></p>
            </div>
            <div class="detail-item">
                <label>Severity Level</label>
                <p><span class="severity-badge severity-${c.severity}">${c.severity.toUpperCase()}</span></p>
            </div>
            <div class="detail-item">
                <label>Road Classification</label>
                <p>🛣️ ${(c.roadType || 'Municipal Road').replace(/-/g, ' ')}</p>
            </div>
            <div class="detail-item">
                <label>Report Date & Time</label>
                <p>📅 ${formatDate(c.submittedAt)}</p>
            </div>
        </div>

        <div class="detail-item" style="margin-bottom:14px;margin-top:10px;">
            <label>Physical Address & District</label>
            <p style="font-size:0.92rem;font-weight:600;">📍 ${escapeHtml(c.location?.address || 'Maharashtra')}</p>
            ${c.location?.lat ? `
                <small style="color:var(--text-muted);font-family:monospace;margin-top:2px;display:block;">
                    GPS Coordinates: ${c.location.lat.toFixed(5)}° N, ${c.location.lng.toFixed(5)}° E
                </small>
            ` : ''}
        </div>

        <div class="detail-item" style="margin-bottom:16px;">
            <label>Citizen Damage Description</label>
            <p style="background:var(--bg-surface-elevated);padding:10px 14px;border-radius:var(--radius-md);border:1px solid var(--glass-border);font-size:0.88rem;line-height:1.5;">
                "${escapeHtml(c.description || 'No additional notes provided.')}"
            </p>
        </div>

        ${c.location?.lat ? `<div class="detail-map" id="modalMap" style="height:190px;border-radius:var(--radius-md);margin-bottom:16px;"></div>` : ''}

        <!-- Official PWD Status Management & Crew Dispatch -->
        <div class="inspect-action-card">
            <h4 style="font-size:0.88rem;font-weight:800;color:var(--text-primary);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
                <i data-lucide="shield-check" style="width:16px;height:16px;color:var(--saffron);"></i>
                Official PWD Status Update & Crew Dispatch
            </h4>
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div>
                        <label style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;display:block;">Change Status</label>
                        <select id="newStatus" style="width:100%;padding:9px;border-radius:var(--radius-md);background:var(--input-bg);border:1px solid var(--input-border);color:var(--input-text);font-weight:600;">
                            <option value="pending" ${c.status==='pending'?'selected':''}>Pending Inspection</option>
                            <option value="under-review" ${c.status==='under-review'?'selected':''}>Under Review by Ward Engineer</option>
                            <option value="in-progress" ${c.status==='in-progress'?'selected':''}>Work In Progress (Crew Dispatched)</option>
                            <option value="resolved" ${c.status==='resolved'?'selected':''}>Works Done / Resolved (Repaired)</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px;display:block;">Officer Action Note / Remark</label>
                        <input type="text" id="statusNote" value="${escapeHtml(c.statusNote || '')}" placeholder="e.g. Hot-mix compactor crew dispatched..." style="width:100%;padding:9px;border-radius:var(--radius-md);background:var(--input-bg);border:1px solid var(--input-border);color:var(--input-text);">
                    </div>
                </div>
                <button type="button" class="btn-admin-save-status" onclick="updateStatus('${c.id}')">
                    <i data-lucide="check"></i>
                    <span>Save Status & Dispatch Action</span>
                </button>
            </div>
        </div>
    `;

    document.getElementById('complaintModal').classList.add('show');
    if (typeof renderAllIcons === 'function') {
        renderAllIcons(document.getElementById('complaintModal'));
    }

    // Init Leaflet modal mini map
    if (c.location?.lat) {
        setTimeout(() => {
            if (detailMap) { detailMap.remove(); detailMap = null; }
            const mapEl = document.getElementById('modalMap');
            if (!mapEl) return;
            detailMap = L.map('modalMap').setView([c.location.lat, c.location.lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(detailMap);
            L.marker([c.location.lat, c.location.lng]).addTo(detailMap)
                .bindPopup(`<strong>${c.id}</strong><br>${escapeHtml(c.location?.address || 'Pothole Location')}`)
                .openPopup();
        }, 200);
    }
}

async function updateStatus(id) {
    const newStatus = document.getElementById('newStatus')?.value;
    const note = document.getElementById('statusNote')?.value.trim();
    if (!newStatus) return;

    await updateComplaintStatus(id, newStatus, note);
    document.getElementById('complaintModal')?.classList.remove('show');
    if (typeof showAuthToast === 'function') {
        showAuthToast(`Complaint ${id} status updated to "${formatStatus(newStatus)}"`);
    }
    renderAdminStats();
    renderComplaintsTable();
    renderDashboardFeed();
    renderRegisteredUsers();
}

// Close modal
document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('complaintModal').classList.remove('show');
});
document.getElementById('complaintModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) document.getElementById('complaintModal').classList.remove('show');
});

window.addEventListener('languageChanged', () => {
    const adminDash = document.getElementById('adminDashboard');
    if (adminDash && !adminDash.classList.contains('hidden')) {
        renderAdminStats();
        renderComplaintsTable();
        renderDashboardFeed();
        renderRegisteredUsers();
    } else {
        renderCitizenDashboard();
    }
});

// ============================================================
// USER ACTIVITIES & REGISTERED COMPLAINTS CONTROLLER
// ============================================================
let currentActivityTab = 'my';

function switchDashboardActivityTab(tab) {
    currentActivityTab = tab;
    const tabMy = document.getElementById('tabMyActivities');
    const tabAll = document.getElementById('tabAllActivities');
    const badge = document.getElementById('dashUserActivityBadge');
    if (tab === 'my') {
        tabMy?.classList.add('active');
        tabAll?.classList.remove('active');
        if (badge) badge.textContent = 'My Reports';
    } else {
        tabMy?.classList.remove('active');
        tabAll?.classList.add('active');
        if (badge) badge.textContent = 'Statewide Feed';
    }
    renderUserActivities(tab);
}

async function renderUserActivities(filterMode = currentActivityTab) {
    const listEl = document.getElementById('userActivitiesList');
    if (!listEl) return;

    const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    const complaints = await getComplaints();

    // Update Profile summary strip in dashboard
    const actAvatar = document.getElementById('actUserAvatar');
    const actName = document.getElementById('actUserName');
    const actMeta = document.getElementById('actUserMeta');

    const displayName = user ? (user.name || user.email.split('@')[0]) : 'Citizen User';
    const userInitial = displayName.charAt(0).toUpperCase();

    if (actAvatar) actAvatar.textContent = userInitial;
    if (actName) actName.textContent = user ? `${displayName} (Citizen)` : 'Maharashtra Citizen';

    // Update Topbar chip role
    const dashRole = document.getElementById('dashUserRole');
    const dashAvatar = document.getElementById('dashUserAvatar');
    if (dashRole) dashRole.textContent = user ? `${displayName} (Citizen)` : 'Citizen Dashboard';
    if (dashAvatar && user) dashAvatar.textContent = userInitial;

    // Filter complaints registered by this user
    let userComplaints = [];
    if (filterMode === 'my') {
        if (user) {
            userComplaints = complaints.filter(c => 
                (c.email && user.email && c.email.toLowerCase() === user.email.toLowerCase()) ||
                (c.name && user.name && c.name.toLowerCase().includes(user.name.toLowerCase())) ||
                (c.phone && user.phone && c.phone === user.phone)
            );
        }
        // If user hasn't registered complaints yet, show seed demonstration complaints
        if (userComplaints.length === 0) {
            userComplaints = complaints.slice(0, 3);
        }
    } else {
        userComplaints = complaints;
    }

    if (actMeta) {
        const activeCount = userComplaints.filter(c => c.status !== 'resolved').length;
        actMeta.textContent = `${userComplaints.length} Registered Complaints • ${activeCount} Live Status`;
    }

    if (userComplaints.length === 0) {
        listEl.innerHTML = `
            <div class="empty-user-activities">
                <i data-lucide="clipboard"></i>
                <p>No complaints registered yet by this user.</p>
                <button class="btn-primary" onclick="navigateTo('report')" style="padding:8px 18px;font-size:0.85rem;">+ Register First Pothole</button>
            </div>
        `;
    } else {
        listEl.innerHTML = userComplaints.map(c => {
            const statusCls = c.status || 'open';
            const iconName = statusCls === 'resolved' ? 'check-circle' : statusCls === 'in-progress' ? 'activity' : 'alert-triangle';

            const step1Cls = 'completed';
            const step2Cls = (statusCls !== 'pending') ? 'completed' : 'active';
            const step3Cls = (statusCls === 'in-progress') ? 'active' : (statusCls === 'resolved') ? 'completed' : '';
            const step4Cls = (statusCls === 'resolved') ? 'completed' : '';

            return `
                <div class="user-act-item" onclick="viewComplaint('${c.id}')" title="Click to view telemetry & updates">
                    <div class="act-left-meta">
                        <div class="act-status-icon ${statusCls}">
                            <i data-lucide="${iconName}"></i>
                        </div>
                        <div class="act-details-col">
                            <div class="act-id-row">
                                <span class="act-id">${c.id}</span>
                                <span class="act-status-pill status-${statusCls}">${formatStatus(c.status)}</span>
                            </div>

                            <!-- 4-Stage Repair Stepper Track -->
                            <div class="act-progress-track">
                                <div class="act-progress-step ${step1Cls}" title="Step 1: Complaint Registered"></div>
                                <div class="act-progress-step ${step2Cls}" title="Step 2: PWD Review & Inspection"></div>
                                <div class="act-progress-step ${step3Cls}" title="Step 3: Road Repair Crew Active"></div>
                                <div class="act-progress-step ${step4Cls}" title="Step 4: Hot-mix Asphalt Verified"></div>
                            </div>
                            <div class="act-step-label-row">
                                <span>01 Filed</span>
                                <span>02 Inspected</span>
                                <span>03 In Repair</span>
                                <span>04 Resolved</span>
                            </div>

                            <span class="act-location">
                                <i data-lucide="map-pin" style="width:12px;height:12px;flex-shrink:0;"></i>
                                <span>${c.location?.address || c.description || 'Maharashtra Road'}</span>
                            </span>
                            <span class="act-time">${formatDate(c.submittedAt)} ${c.statusNote ? `• <em>${c.statusNote}</em>` : ''}</span>
                        </div>
                    </div>
                    <div class="act-right-action">
                        <button type="button" class="btn-view-act">Status & Map →</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    if (window.renderAllIcons) {
        window.renderAllIcons(listEl);
    }
}
