// DATA MANAGEMENT — API CRUD Calls
const ADMIN_KEY = 'mh_pothole_admin';
const ADMIN_CREDS = { username: 'admin', password: 'admin123' };

const API_BASE = `${window.location.origin}/api`;

// Helper: fetch with retry (handles server not-ready-yet on page load)
async function fetchWithRetry(url, options = {}, retries = 3, delayMs = 1000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.warn(`Fetch attempt ${attempt}/${retries} failed for ${url}:`, error.message);
            if (attempt < retries) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } else {
                throw error;
            }
        }
    }
}

async function getComplaints() {
    try {
        return await fetchWithRetry(`${API_BASE}/complaints`);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        return [];
    }
}

async function addComplaint(complaint) {
    try {
        const response = await fetch(`${API_BASE}/complaints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(complaint)
        });
        if (!response.ok) throw new Error('Failed to add');
        return await response.json();
    } catch (error) {
        console.error('Error adding complaint:', error);
        return null;
    }
}

async function getComplaintById(id) {
    try {
        const response = await fetch(`${API_BASE}/complaints/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching complaint by ID:', error);
        return null;
    }
}

async function updateComplaintStatus(id, newStatus, note = '') {
    try {
        const response = await fetch(`${API_BASE}/complaints/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus, note })
        });
        if (!response.ok) throw new Error('Failed to update status');
        return await response.json();
    } catch (error) {
        console.error('Error updating status:', error);
        return null;
    }
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
