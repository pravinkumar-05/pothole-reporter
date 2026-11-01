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

    // Update Mobile Nav
    document.querySelectorAll('.mobile-nav-item').forEach(m => m.classList.remove('active'));
    const activeMobile = document.querySelector(`.mobile-nav-item[data-page="${pageName}"]`);
    if (activeMobile) activeMobile.classList.add('active');

    // Close mobile menu
    document.getElementById('navLinks').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Page-specific init
    if (pageName === 'home') {
        updateStats();
        renderRecentComplaints();
        setTimeout(initHeroMap, 200);
    }
    if (pageName === 'report') { initReportPage(); }
    if (pageName === 'track') {
        if (typeof renderTrackPills === 'function') {
            renderTrackPills();
        }
    }
    if (pageName === 'dashboard') {
        initDashboard();
        setTimeout(initDashboardGisMap, 200);
    }
    if (pageName === 'login') {
        if (window.location.hash.toLowerCase().includes('admin') && typeof switchAuthTab === 'function') {
            setTimeout(() => switchAuthTab('admin'), 60);
        }
    }
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
    let complaints = [];
    try {
        complaints = await getComplaints();
    } catch (e) {
        complaints = [];
    }

    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress' || c.status === 'under-review').length;
    const pending = complaints.filter(c => c.status === 'pending').length;

    animateNumber('statTotal', total);
    animateNumber('statPending', pending);
    animateNumber('statProgress', inProgress);
    animateNumber('statResolved', resolved);
    animateNumber('heroTotal', total);
    animateNumber('heroResolved', resolved);
    animateNumber('heroProgress', inProgress);
    animateNumber('dashKpiTotal', total);
    animateNumber('dashKpiResolved', resolved);
    animateNumber('dashKpiProgress', inProgress);
}

function animateNumber(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    if (target === 0) {
        el.textContent = '0';
        return;
    }
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { 
            current = target; 
            clearInterval(timer); 
        }
        el.textContent = current.toLocaleString();
    }, 35);
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

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

// Maharashtra Cities & Highway Network (matches Design 1 & 2)
const MH_CITIES = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, status: 'pothole', count: 184 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567, status: 'resolved', count: 420 },
    { name: 'Nashik', lat: 19.9975, lng: 73.7898, status: 'pothole', count: 96 },
    { name: 'Aurangabad', lat: 19.8762, lng: 75.3433, status: 'repair', count: 112 },
    { name: 'Kolhapur', lat: 16.7050, lng: 74.2433, status: 'resolved', count: 215 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882, status: 'repair', count: 153 },
    { name: 'Solapur', lat: 17.6599, lng: 75.9064, status: 'pothole', count: 88 },
    { name: 'Amravati', lat: 20.9374, lng: 77.7796, status: 'resolved', count: 140 }
];

let dashGisMap = null;
let userLiveCoords = null;

// ---- User Geolocation & Live Map Tracking ----
function getUserLiveLocation(callback) {
    if (!navigator.geolocation) {
        if (callback) callback(null);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = parseFloat(pos.coords.latitude.toFixed(6));
            const lng = parseFloat(pos.coords.longitude.toFixed(6));
            const accuracy = Math.round(pos.coords.accuracy || 30);
            userLiveCoords = { lat, lng, accuracy };

            try {
                sessionStorage.setItem('rg_live_lat', lat);
                sessionStorage.setItem('rg_live_lng', lng);
                sessionStorage.setItem('rg_live_acc', accuracy);
            } catch (e) {}

            // Update nearby complaint in data.js to be in this user's immediate vicinity
            if (typeof updateNearbyLocationComplaint === 'function') {
                updateNearbyLocationComplaint(lat, lng);
            }

            if (callback) callback(userLiveCoords);
        },
        (err) => {
            console.warn('Geolocation permission not granted or error:', err.message);
            if (callback) callback(null);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function showLocationOnMap(map, coords, popupMessage = null) {
    if (!map || !coords) return;
    const { lat, lng, accuracy } = coords;

    // Remove existing user layers on this map instance
    if (map._userLiveMarker) {
        map.removeLayer(map._userLiveMarker);
    }
    if (map._userLiveCircle) {
        map.removeLayer(map._userLiveCircle);
    }

    // 1. Accuracy radius circle
    map._userLiveCircle = L.circle([lat, lng], {
        radius: Math.max(accuracy, 50),
        color: '#2563EB',
        fillColor: '#3B82F6',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '3, 4'
    }).addTo(map);

    // 2. Custom pulsing live GPS pin
    const pulseIcon = L.divIcon({
        className: 'user-live-location-pin',
        html: `
            <div class="user-gps-pulse-ring"></div>
            <div class="user-gps-center-dot"></div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    map._userLiveMarker = L.marker([lat, lng], {
        icon: pulseIcon,
        zIndexOffset: 1200
    }).addTo(map);

    const defaultMsg = `
        <div style="font-family:Inter,sans-serif;min-width:180px;padding:4px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                <span style="font-size:1rem;">📍</span>
                <strong style="color:#2563EB;font-size:0.9rem;">Your Live Location</strong>
            </div>
            <span id="userLiveAddrPopup" style="font-size:0.78rem;color:var(--text-muted);display:block;margin-bottom:4px;">
                GPS: ${lat.toFixed(5)}° N, ${lng.toFixed(5)}° E
            </span>
            <span style="font-size:0.72rem;font-weight:700;color:#16A34A;background:rgba(22,163,74,0.1);padding:2px 8px;border-radius:12px;">
                🎯 Accurate within ±${accuracy}m
            </span>
        </div>
    `;

    map._userLiveMarker.bindPopup(popupMessage || defaultMsg);

    // Reverse geocode address to populate human-readable name in popup
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(r => r.json())
        .then(data => {
            const addr = data.display_name ? data.display_name.split(',').slice(0, 3).join(', ') : '';
            if (addr) {
                const el = document.getElementById('userLiveAddrPopup');
                if (el) el.innerHTML = `<strong>${addr}</strong><br><small style="color:#64748B;">GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}</small>`;
            }
        })
        .catch(() => {});

    // Fly smoothly to user location with high zoom
    map.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
}

function requestUserLocationAndFocusMap(targetMap = null) {
    getUserLiveLocation((coords) => {
        if (!coords) return;
        if (targetMap) {
            showLocationOnMap(targetMap, coords);
        } else {
            if (heroMap) showLocationOnMap(heroMap, coords);
            if (dashGisMap) showLocationOnMap(dashGisMap, coords);
        }
    });
}

// ---- Hero Map (Maharashtra Road Network) ----
async function initHeroMap() {
    const mapEl = document.getElementById('heroMap');
    if (!mapEl) return;
    if (heroMap) {
        heroMap.invalidateSize();
        return;
    }

    heroMap = L.map('heroMap', { zoomControl: false, attributionControl: false }).setView([19.5, 75.8], 6.6);
    L.control.zoom({ position: 'topright' }).addTo(heroMap);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(heroMap);

    // Key City Nodes
    MH_CITIES.forEach(city => {
        const color = city.status === 'resolved' ? '#10B981' : (city.status === 'repair' ? '#F59E0B' : '#EF4444');
        const marker = L.circleMarker([city.lat, city.lng], {
            radius: 5.5,
            fillColor: color,
            color: '#FFFFFF',
            weight: 1.5,
            fillOpacity: 0.95
        }).addTo(heroMap);

        marker.bindTooltip(`📍 ${city.name}, Maharashtra`, {
            permanent: false,
            direction: 'top',
            className: 'mh-complaint-tooltip',
            offset: [0, -6]
        });

        marker.on('mouseover', function() {
            this.openTooltip();
            this.setStyle({ radius: 7.5, weight: 2.5, fillOpacity: 1 });
        });
        marker.on('mouseout', function() {
            this.closeTooltip();
            this.setStyle({ radius: 5.5, weight: 1.5, fillOpacity: 0.95 });
        });

        marker.bindPopup(`
            <div style="font-size:0.85rem;padding:4px;">
                <strong style="color:${color};font-size:0.95rem;">📍 ${city.name}</strong><br>
                <span>Status: <b>${city.status === 'resolved' ? 'Resolved' : (city.status === 'repair' ? 'Under Repair' : 'Pothole Reported')}</b></span><br>
                <span style="color:#64748B;">Active Reports: ${city.count}</span>
            </div>
        `);
    });

    // Add dynamically loaded complaints
    try {
        const complaints = await getComplaints();
        complaints.forEach(c => {
            if (c.location?.lat && c.location?.lng) {
                const color = c.status === 'resolved' ? '#10B981' : (c.status === 'in-progress' ? '#F59E0B' : (c.status === 'under-review' ? '#3B82F6' : '#EF4444'));
                const locAddress = c.location.address || 'Maharashtra State Road';
                // Reduced dot size as requested (radius: 4)
                const marker = L.circleMarker([c.location.lat, c.location.lng], {
                    radius: 4,
                    fillColor: color,
                    color: '#FFFFFF',
                    weight: 1.5,
                    fillOpacity: 0.95
                }).addTo(heroMap);

                // Display location whenever user moves cursor on the dot
                marker.bindTooltip(`📍 ${locAddress}`, {
                    permanent: false,
                    direction: 'top',
                    className: 'mh-complaint-tooltip',
                    offset: [0, -6]
                });

                marker.on('mouseover', function() {
                    this.openTooltip();
                    this.setStyle({ radius: 6.5, weight: 2.5, fillOpacity: 1 });
                });

                marker.on('mouseout', function() {
                    this.closeTooltip();
                    this.setStyle({ radius: 4, weight: 1.5, fillOpacity: 0.95 });
                });

                marker.bindPopup(`
                    <div style="font-family:Inter,sans-serif;min-width:180px;padding:4px;">
                        <strong style="color:var(--text-primary);font-size:0.88rem;">${c.id}</strong><br>
                        <span style="color:var(--text-muted);font-size:0.8rem;">📍 ${locAddress}</span><br>
                        <span style="font-size:0.75rem;font-weight:700;color:${color};text-transform:uppercase;">${formatStatus(c.status)}</span>
                    </div>
                `);
            }
        });
    } catch (err) {
        console.warn('Complaints load error:', err);
    }

    // Auto-focus user location if user is logged in or coordinates available
    const currentUser = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (userLiveCoords) {
        showLocationOnMap(heroMap, userLiveCoords);
    } else if (currentUser) {
        requestUserLocationAndFocusMap(heroMap);
    }
}

// ---- Dashboard GIS Map ----
async function initDashboardGisMap() {
    const mapEl = document.getElementById('dashGisMap');
    if (!mapEl) return;
    if (dashGisMap) {
        dashGisMap.invalidateSize();
        return;
    }

    dashGisMap = L.map('dashGisMap', { zoomControl: false, attributionControl: false }).setView([19.5, 75.8], 6.6);
    L.control.zoom({ position: 'topright' }).addTo(dashGisMap);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(dashGisMap);

    MH_CITIES.forEach(city => {
        const color = city.status === 'resolved' ? '#10B981' : (city.status === 'repair' ? '#F59E0B' : '#EF4444');
        const marker = L.circleMarker([city.lat, city.lng], {
            radius: 5.5,
            fillColor: color,
            color: '#FFFFFF',
            weight: 1.5,
            fillOpacity: 0.95
        }).addTo(dashGisMap);

        marker.bindTooltip(`📍 ${city.name}, Maharashtra`, {
            permanent: false,
            direction: 'top',
            className: 'mh-complaint-tooltip',
            offset: [0, -6]
        });

        marker.on('mouseover', function() {
            this.openTooltip();
            this.setStyle({ radius: 7.5, weight: 2.5, fillOpacity: 1 });
        });
        marker.on('mouseout', function() {
            this.closeTooltip();
            this.setStyle({ radius: 5.5, weight: 1.5, fillOpacity: 0.95 });
        });
    });

    // Plot real registered complaints on GIS map
    try {
        if (typeof getComplaints === 'function') {
            const complaints = await getComplaints();
            complaints.forEach(c => {
                if (c.location && c.location.lat && c.location.lng) {
                    const color = c.status === 'resolved' ? '#10B981' : (c.status === 'in-progress' ? '#F97316' : (c.status === 'under-review' ? '#3B82F6' : '#EF4444'));
                    const locAddress = c.location.address || 'Maharashtra State Road';
                    // Reduced dot size as requested (radius: 4.5)
                    const marker = L.circleMarker([c.location.lat, c.location.lng], {
                        radius: 4.5,
                        fillColor: color,
                        color: '#FFFFFF',
                        weight: 1.5,
                        fillOpacity: 0.95
                    }).addTo(dashGisMap);

                    // Display location on mouseover
                    marker.bindTooltip(`📍 ${locAddress}`, {
                        permanent: false,
                        direction: 'top',
                        className: 'mh-complaint-tooltip',
                        offset: [0, -6]
                    });

                    marker.on('mouseover', function() {
                        this.openTooltip();
                        this.setStyle({ radius: 7, weight: 2.5, fillOpacity: 1 });
                    });
                    marker.on('mouseout', function() {
                        this.closeTooltip();
                        this.setStyle({ radius: 4.5, weight: 1.5, fillOpacity: 0.95 });
                    });

                    marker.bindPopup(`
                        <div style="font-family:Inter,sans-serif;min-width:180px;color:#0B1B2B;padding:4px;">
                            <div style="font-weight:800;font-size:0.9rem;margin-bottom:4px;">#${c.id}</div>
                            <div style="font-size:0.8rem;color:#475569;margin-bottom:6px;">📍 ${locAddress}</div>
                            <div style="display:flex;align-items:center;justify-content:space-between;">
                                <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:${color}">${c.status}</span>
                                <button onclick="viewComplaint('${c.id}')" style="background:#2563EB;color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:0.75rem;cursor:pointer;font-weight:700;">Inspect</button>
                            </div>
                        </div>
                    `);
                }
            });
        }
    } catch (e) {}

    // Auto-focus user location on GIS map if logged in
    const currentUser = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
    if (userLiveCoords) {
        showLocationOnMap(dashGisMap, userLiveCoords);
    } else if (currentUser) {
        requestUserLocationAndFocusMap(dashGisMap);
    }
}

// ---- Trend Range Switcher ----
function setTrendRange(btn, range) {
    document.querySelectorAll('.trend-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const area = document.getElementById('trendAreaPath');
    const line = document.getElementById('trendLinePath');
    if (!area || !line) return;

    if (range === '7d') {
        area.setAttribute('d', 'M 0,45 Q 30,12 60,35 T 120,20 T 170,38 T 200,15 L 200,60 L 0,60 Z');
        line.setAttribute('d', 'M 0,45 Q 30,12 60,35 T 120,20 T 170,38 T 200,15');
    } else if (range === '30d') {
        area.setAttribute('d', 'M 0,50 Q 40,30 80,18 T 130,42 T 170,25 T 200,10 L 200,60 L 0,60 Z');
        line.setAttribute('d', 'M 0,50 Q 40,30 80,18 T 130,42 T 170,25 T 200,10');
    } else {
        area.setAttribute('d', 'M 0,40 Q 50,45 90,25 T 140,15 T 180,30 T 200,8 L 200,60 L 0,60 Z');
        line.setAttribute('d', 'M 0,40 Q 50,45 90,25 T 140,15 T 180,30 T 200,8');
    }
}

// ---- Theme Management with Segmented Pill & Presets ----
function initTheme() {
    let savedTheme = localStorage.getItem('rg_theme');
    // Ensure default theme is strictly 'light' if not set or invalid
    if (!savedTheme || !['light', 'dark', 'minimalist', 'brutalist'].includes(savedTheme)) {
        savedTheme = 'light';
        try { localStorage.setItem('rg_theme', 'light'); } catch (e) {}
    }
    setAppTheme(savedTheme);
}

function updateLogoForTheme(theme) {
    const isDark = (theme === 'dark');
    const targetSrc = isDark ? 'assets/logo_dark.png' : 'assets/logo.png';
    const logoSelectors = [
        '.nav-logo',
        '.auth-brand-logo',
        '.sidebar-logo',
        '.about-hero-logo',
        '.auth-modal-logo',
        '.footer-logo'
    ];
    document.querySelectorAll(logoSelectors.join(',')).forEach(img => {
        img.src = targetSrc;
    });
}

function setAppTheme(theme) {
    // Validate theme name, fallback to 'light'
    if (!['light', 'dark', 'minimalist', 'brutalist'].includes(theme)) {
        theme = 'light';
    }

    if (document.body) {
        document.body.setAttribute('data-theme', theme);
    }
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rg_theme', theme); } catch (e) {}

    const btnLight = document.getElementById('btnThemeLight');
    const btnDark = document.getElementById('btnThemeDark');
    if (btnLight && btnDark) {
        if (theme === 'light') {
            btnLight.classList.add('active');
            btnDark.classList.remove('active');
        } else if (theme === 'dark') {
            btnDark.classList.add('active');
            btnLight.classList.remove('active');
        } else {
            btnLight.classList.remove('active');
            btnDark.classList.remove('active');
        }
    }

    // Update preset items active state
    document.querySelectorAll('.preset-item').forEach(item => {
        item.classList.toggle('active', item.dataset.preset === theme);
    });

    const menu = document.getElementById('themePresetMenu');
    if (menu) menu.classList.remove('show');

    // Update logo images dynamically for dark / light theme
    updateLogoForTheme(theme);

    if (typeof renderAllIcons === 'function') {
        renderAllIcons();
    }

    if (heroMap) setTimeout(() => heroMap.invalidateSize(), 100);
    if (dashGisMap) setTimeout(() => dashGisMap.invalidateSize(), 100);
}

function toggleTheme() {
    const currentTheme = (document.body && document.body.getAttribute('data-theme')) || localStorage.getItem('rg_theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setAppTheme(newTheme);
}

function toggleThemePresetMenu() {
    const menu = document.getElementById('themePresetMenu');
    if (menu) menu.classList.toggle('show');
}

// Close preset menu on outside click
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.theme-preset-dropdown');
    const menu = document.getElementById('themePresetMenu');
    if (dropdown && menu && !dropdown.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    if (typeof updateNavAuth === 'function') {
        updateNavAuth();
    }

    // Support URL hash routing (#home, #report, #track, #dashboard, #about, #login)
    const rawHash = window.location.hash.replace('#', '').toLowerCase();
    const hash = rawHash.split('?')[0];
    if (hash === 'admin-login') {
        navigateTo('login');
        setTimeout(() => { if (typeof switchAuthTab === 'function') switchAuthTab('admin'); }, 60);
    } else if (hash === 'admin-dashboard') {
        sessionStorage.setItem('mh_pothole_admin', 'true');
        if (typeof updateNavAuth === 'function') updateNavAuth();
        navigateTo('dashboard');
    } else if (hash && ['home', 'report', 'track', 'dashboard', 'about', 'login'].includes(hash)) {
        navigateTo(hash);
    } else {
        updateStats();
        renderRecentComplaints();
        setTimeout(initHeroMap, 300);
    }

    // Auto-detect location if user is already logged in
    if (typeof getCurrentUser === 'function' && getCurrentUser()) {
        setTimeout(() => requestUserLocationAndFocusMap(), 400);
    }
});

window.addEventListener('hashchange', () => {
    const rawHash = window.location.hash.replace('#', '').toLowerCase();
    const hash = rawHash.split('?')[0];
    if (hash === 'admin-login') {
        navigateTo('login');
        setTimeout(() => { if (typeof switchAuthTab === 'function') switchAuthTab('admin'); }, 60);
    } else if (hash === 'admin-dashboard') {
        sessionStorage.setItem('mh_pothole_admin', 'true');
        if (typeof updateNavAuth === 'function') updateNavAuth();
        navigateTo('dashboard');
    } else if (hash && ['home', 'report', 'track', 'dashboard', 'about', 'login'].includes(hash)) {
        navigateTo(hash);
    }
});

// Immediate run
initTheme();

window.addEventListener('languageChanged', () => {
    updateStats();
    renderRecentComplaints();
    if (heroMap) {
        reportMap = null; // force map reload? Actually it's okay to leave map popup as is for now
    }
});
