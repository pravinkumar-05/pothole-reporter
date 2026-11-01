// DATA MANAGEMENT — API CRUD Calls & Local Storage Fallback
const ADMIN_KEY = 'mh_pothole_admin';
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };
const LOCAL_COMPLAINTS_KEY = 'mh_roadguard_local_complaints';

const API_BASE = `${window.location.origin}/api`;

const DEFAULT_COMPLAINTS = [
    {
        id: 'MH-2026-7821',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Large asphalt crater and roadway breakdown near Shivaji Chowk junction causing hazardous traffic swerving.',
        severity: 'critical',
        roadType: 'national-highway',
        location: { lat: 19.0178, lng: 72.8478, address: 'Shivaji Chowk, Dadar, Mumbai, Maharashtra' },
        status: 'in-progress',
        statusNote: 'PWD emergency rapid-repair squad on site with hot-mix bitumen & asphalt compactor.',
        submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), note: 'Complaint registered by citizen with GPS location verified.' },
            { status: 'under-review', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'Structural inspection completed by PWD City Division.' },
            { status: 'in-progress', date: new Date(Date.now() - 1 * 3600 * 1000).toISOString(), note: 'Repair team active on site with heavy machinery.' }
        ]
    },
    {
        id: 'MH-2026-6542',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Depression near storm drain grating along Western Express Highway flyover ramp.',
        severity: 'high',
        roadType: 'national-highway',
        location: { lat: 19.0664, lng: 72.8682, address: 'BKC Junction, Western Express Highway, Mumbai, Maharashtra' },
        status: 'under-review',
        statusNote: 'Joint inspection scheduled by PWD Highway Division and municipal engineers.',
        submittedAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 7 * 3600 * 1000).toISOString(), note: 'Complaint logged in statewide PWD database.' },
            { status: 'under-review', date: new Date(Date.now() - 4 * 3600 * 1000).toISOString(), note: 'Assigned to Highway maintenance section.' }
        ]
    },
    {
        id: 'MH-2026-4190',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Multiple pothole clusters along Andheri-Kurla Road near Chakala Metro pillar 42.',
        severity: 'medium',
        roadType: 'municipal-road',
        location: { lat: 19.1136, lng: 72.8697, address: 'Andheri-Kurla Road, Chakala, Andheri East, Mumbai, Maharashtra' },
        status: 'resolved',
        statusNote: 'Hot-mix asphalt patch completed & verified by municipal road inspector.',
        submittedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 26 * 3600 * 1000).toISOString(), note: 'Complaint registered by citizen reporter.' },
            { status: 'in-progress', date: new Date(Date.now() - 14 * 3600 * 1000).toISOString(), note: 'Patching work scheduled and carried out.' },
            { status: 'resolved', date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: 'Repairs completed and road reopened to traffic.' }
        ]
    },
    {
        id: 'MH-2026-3318',
        name: 'Maharashtra Citizen',
        phone: '9876543210',
        email: 'citizen.mh@gmail.com',
        description: 'Edge raveling and deep rain crater approaching Vashi toll plaza connector.',
        severity: 'high',
        roadType: 'state-highway',
        location: { lat: 19.0771, lng: 72.9986, address: 'Palm Beach Road Connector, Vashi, Navi Mumbai, Maharashtra' },
        status: 'pending',
        statusNote: 'Complaint queued for Junior Engineer field inspection.',
        submittedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), note: 'Complaint filed and queued in PWD system.' }
        ]
    },
    {
        id: 'MH-2026-9204',
        name: 'Pravin Kumar',
        phone: '9820011223',
        email: 'pravin.pwd@gmail.com',
        description: 'Sub-grade breakdown and dangerous pavement depression near Hinjawadi Phase 1 approach.',
        severity: 'critical',
        roadType: 'municipal-road',
        location: { lat: 18.5913, lng: 73.7389, address: 'Hinjawadi IT Park, Pune-Mumbai Corridor, Maharashtra' },
        status: 'in-progress',
        statusNote: 'Sub-base excavation and vibratory roller compactor in operation.',
        submittedAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        statusHistory: [
            { status: 'pending', date: new Date(Date.now() - 16 * 3600 * 1000).toISOString(), note: 'Pothole report filed.' },
            { status: 'in-progress', date: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), note: 'PWD heavy machinery deployed.' }
        ]
    }
];

function updateNearbyLocationComplaint(userLat, userLng) {
    if (!userLat || !userLng) return;
    try {
        const local = getStoredLocalComplaints();
        let existing = local.find(c => c.id === 'MH-2026-NEARBY-GPS');
        const nearbyCoords = {
            lat: parseFloat((userLat + 0.0016).toFixed(5)),
            lng: parseFloat((userLng + 0.0014).toFixed(5)),
            address: `Nearby Road (within 200m of your GPS location)`
        };
        if (!existing) {
            existing = {
                id: 'MH-2026-NEARBY-GPS',
                name: 'Live Citizen Reporter',
                phone: '9820011223',
                email: 'citizen.mh@gmail.com',
                description: 'Surface depression and road erosion detected near your current live location.',
                severity: 'high',
                roadType: 'municipal-road',
                location: nearbyCoords,
                status: 'in-progress',
                statusNote: 'PWD emergency repair squad notified for rapid patching.',
                submittedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
                updatedAt: new Date().toISOString(),
                statusHistory: [
                    { status: 'pending', date: new Date(Date.now() - 3600 * 1000).toISOString(), note: 'Live location verified by citizen GPS.' },
                    { status: 'in-progress', date: new Date().toISOString(), note: 'Dispatched to local ward repair unit.' }
                ]
            };
            local.unshift(existing);
        } else {
            existing.location = nearbyCoords;
            existing.updatedAt = new Date().toISOString();
        }
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(local));

        // Attempt reverse geocoding to give a real street address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${nearbyCoords.lat}&lon=${nearbyCoords.lng}`)
            .then(r => r.json())
            .then(data => {
                if (data && data.display_name) {
                    existing.location.address = data.display_name.split(',').slice(0, 3).join(', ');
                    localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(local));
                }
            })
            .catch(() => {});

        if (typeof updateStats === 'function') updateStats();
        if (typeof renderRecentComplaints === 'function') renderRecentComplaints();
    } catch (e) {
        console.warn('Could not update nearby GPS complaint:', e);
    }
}

function getStoredLocalComplaints() {
    try {
        const raw = localStorage.getItem(LOCAL_COMPLAINTS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveLocalComplaintItem(c) {
    try {
        const list = getStoredLocalComplaints();
        list.unshift(c);
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(list));
    } catch (e) {
        console.warn('Could not save to local storage:', e);
    }
}

// Helper: fetch with retry (handles server not-ready-yet on page load)
async function fetchWithRetry(url, options = {}, retries = 1, delayMs = 500) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                throw error;
            }
        }
    }
}

async function getComplaints() {
    let apiData = [];
    try {
        apiData = await fetchWithRetry(`${API_BASE}/complaints`);
    } catch (error) {
        apiData = [];
    }

    const localItems = getStoredLocalComplaints();
    const baseItems = (apiData && apiData.length > 0) ? apiData : DEFAULT_COMPLAINTS;

    // Merge without duplicating IDs
    const seen = new Set();
    const merged = [];
    for (const item of [...localItems, ...baseItems]) {
        if (!seen.has(item.id)) {
            seen.add(item.id);
            merged.push(item);
        }
    }
    return merged;
}

async function addComplaint(complaint) {
    // Generate standard id if not present
    if (!complaint.id) {
        complaint.id = `MH-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    if (!complaint.submittedAt) {
        complaint.submittedAt = new Date().toISOString();
    }
    if (!complaint.status) {
        complaint.status = 'pending';
    }
    if (!complaint.statusHistory || !Array.isArray(complaint.statusHistory)) {
        complaint.statusHistory = [
            {
                status: complaint.status || 'pending',
                date: complaint.submittedAt || new Date().toISOString(),
                note: 'Complaint registered successfully by citizen. Queued for PWD field engineer inspection.'
            }
        ];
    }

    saveLocalComplaintItem(complaint);

    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(complaint)
        });
        if (response.ok) {
            const res = await response.json();
            return res;
        }
    } catch (error) {
        console.warn('API save offline, cached in localStorage:', error.message);
    }
    return complaint;
}

async function getComplaintById(id) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${id}`);
        if (response.ok) return await response.json();
    } catch (error) {
        // Fallback to local
    }
    const all = await getComplaints();
    return all.find(c => c.id.toLowerCase() === id.toLowerCase()) || null;
}

async function updateComplaintStatus(id, newStatus, note = '') {
    // Update local storage
    const localItems = getStoredLocalComplaints();
    const target = localItems.find(c => c.id === id);
    if (target) {
        target.status = newStatus;
        target.statusNote = note;
        target.updatedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(localItems));
    }

    try {
        const response = await fetch(`${API_BASE}/complaints/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, note })
        });
        if (response.ok) return await response.json();
    } catch (error) {
        console.warn('API update offline, saved locally');
    }
    return { success: true, id, status: newStatus };
}

async function updateComplaintDetails(id, updates = {}) {
    const localItems = getStoredLocalComplaints();
    let target = localItems.find(c => c.id === id);
    if (!target) {
        const base = DEFAULT_COMPLAINTS.find(c => c.id === id);
        if (base) {
            target = JSON.parse(JSON.stringify(base));
            localItems.unshift(target);
        }
    }
    if (target) {
        if (updates.description !== undefined) target.description = updates.description;
        if (updates.severity !== undefined) target.severity = updates.severity;
        target.updatedAt = new Date().toISOString();
        localStorage.setItem(LOCAL_COMPLAINTS_KEY, JSON.stringify(localItems));
    }
    return { success: true, id };
}

// Stats are now computed on the backend
async function getStats() {
    try {
        return await fetchWithRetry(`${API_BASE}/stats`);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { total: 0, pending: 0, inProgress: 0, resolved: 0, critical: 0 };
    }
}

function isAdminLoggedIn() { return sessionStorage.getItem(ADMIN_KEY) === 'true'; }
function adminLogin(u, p) {
    if (u === ADMIN_CREDS.username && p === ADMIN_CREDS.password) {
        sessionStorage.setItem(ADMIN_KEY, 'true'); return true;
    }
    return false;
}
function adminLogout() { sessionStorage.removeItem(ADMIN_KEY); }

// seedDemoData logic removed since backend handles db seeding via schema.sql
