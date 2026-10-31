require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '/')));

let db;

// Initialize SQLite Database
async function initDb() {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS complaints (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT,
            description TEXT NOT NULL,
            severity TEXT NOT NULL,
            roadType TEXT NOT NULL,
            lat REAL,
            lng REAL,
            address TEXT,
            imageData TEXT,
            status TEXT DEFAULT 'pending',
            submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS status_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id TEXT,
            status TEXT NOT NULL,
            note TEXT,
            date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
        );
    `);

    // Insert demo data if empty
    const count = await db.get('SELECT COUNT(*) as count FROM complaints');
    if (count.count === 0) {
        const demos = [
            {
                id: 'MH-2026-7821', name: 'Pravin Kumar', phone: '9820011223', email: 'pravin.pwd@gmail.com',
                description: 'Large asphalt crater and roadway breakdown near Shivaji Chowk junction causing hazardous traffic swerving.',
                severity: 'critical', roadType: 'national-highway', lat: 19.0178, lng: 72.8478, address: 'Shivaji Chowk, Dadar, Mumbai, Maharashtra',
                status: 'in-progress'
            },
            {
                id: 'MH-2026-6542', name: 'Pravin Kumar', phone: '9820011223', email: 'pravin.pwd@gmail.com',
                description: 'Depression near storm drain grating along Western Express Highway flyover ramp.',
                severity: 'high', roadType: 'national-highway', lat: 19.0664, lng: 72.8682, address: 'BKC Junction, Western Express Highway, Mumbai, Maharashtra',
                status: 'under-review'
            },
            {
                id: 'MH-2026-4190', name: 'Pravin Kumar', phone: '9820011223', email: 'pravin.pwd@gmail.com',
                description: 'Multiple pothole clusters along Andheri-Kurla Road near Chakala Metro pillar 42.',
                severity: 'medium', roadType: 'municipal-road', lat: 19.1136, lng: 72.8697, address: 'Andheri-Kurla Road, Chakala, Andheri East, Mumbai, Maharashtra',
                status: 'resolved'
            },
            {
                id: 'MH-2026-3318', name: 'Maharashtra Citizen', phone: '9876543210', email: 'citizen.mh@gmail.com',
                description: 'Edge raveling and deep rain crater approaching Vashi toll plaza connector.',
                severity: 'high', roadType: 'state-highway', lat: 19.0771, lng: 72.9986, address: 'Palm Beach Road Connector, Vashi, Navi Mumbai, Maharashtra',
                status: 'pending'
            },
            {
                id: 'MH-2026-9204', name: 'Pravin Kumar', phone: '9820011223', email: 'pravin.pwd@gmail.com',
                description: 'Sub-grade breakdown and dangerous pavement depression near Hinjawadi Phase 1 approach.',
                severity: 'critical', roadType: 'municipal-road', lat: 18.5913, lng: 73.7389, address: 'Hinjawadi IT Park, Pune-Mumbai Corridor, Maharashtra',
                status: 'in-progress'
            }
        ];
        for (const d of demos) {
            await db.run('INSERT INTO complaints (id, name, phone, email, description, severity, roadType, lat, lng, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [d.id, d.name, d.phone, d.email, d.description, d.severity, d.roadType, d.lat, d.lng, d.address, d.status]);
            await db.run('INSERT INTO status_history (complaint_id, status, note) VALUES (?, ?, ?)',
                [d.id, d.status, 'Record active in PWD registry.']);
        }
    }
}

// Helper to generate IDs
function generateComplaintId() {
    const prefix = 'MH-RD';
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
}

// API Endpoints

// 1. Get all complaints
app.get('/api/complaints', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM complaints ORDER BY submittedAt DESC');
        
        // Fetch status history for each complaint
        for (let i = 0; i < rows.length; i++) {
            const history = await db.all('SELECT * FROM status_history WHERE complaint_id = ? ORDER BY date ASC', [rows[i].id]);
            rows[i].statusHistory = history;
            // Parse location back to object format expected by frontend
            rows[i].location = {
                lat: rows[i].lat,
                lng: rows[i].lng,
                address: rows[i].address
            };
        }
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// 2. Add a complaint
app.post('/api/complaints', async (req, res) => {
    const { name, phone, email, description, severity, roadType, location, imageData } = req.body;
    const id = generateComplaintId();
    
    try {
        await db.run(
            `INSERT INTO complaints (id, name, phone, email, description, severity, roadType, lat, lng, address, imageData) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, phone, email, description, severity, roadType, location.lat, location.lng, location.address, imageData]
        );
        
        await db.run(
            `INSERT INTO status_history (complaint_id, status, note) VALUES (?, 'pending', 'Complaint registered successfully')`,
            [id]
        );
        
        const newRow = await db.get('SELECT * FROM complaints WHERE id = ?', [id]);
        res.status(201).json(newRow);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add complaint' });
    }
});

// 3. Get complaint by ID
app.get('/api/complaints/:id', async (req, res) => {
    try {
        const row = await db.get('SELECT * FROM complaints WHERE id = ?', [req.params.id]);
        if (!row) return res.status(404).json({ error: 'Not found' });
        
        const history = await db.all('SELECT * FROM status_history WHERE complaint_id = ? ORDER BY date ASC', [row.id]);
        row.statusHistory = history;
        row.location = { lat: row.lat, lng: row.lng, address: row.address };
        
        res.json(row);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 4. Update status
app.put('/api/complaints/:id/status', async (req, res) => {
    const { status, note } = req.body;
    const { id } = req.params;
    
    try {
        await db.run("UPDATE complaints SET status = ?, updatedAt = datetime('now') WHERE id = ?", [status, id]);
        await db.run(
            'INSERT INTO status_history (complaint_id, status, note) VALUES (?, ?, ?)',
            [id, status, note || `Status updated to ${status}`]
        );
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// 5. Get Stats
app.get('/api/stats', async (req, res) => {
    try {
        const total = await db.get('SELECT COUNT(*) as count FROM complaints');
        const pending = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "pending"');
        const inProgress = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "in-progress"');
        const resolved = await db.get('SELECT COUNT(*) as count FROM complaints WHERE status = "resolved"');
        const critical = await db.get('SELECT COUNT(*) as count FROM complaints WHERE severity = "critical"');
        
        res.json({
            total: total.count,
            pending: pending.count,
            inProgress: inProgress.count,
            resolved: resolved.count,
            critical: critical.count
        });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Start server only after database is fully initialized
(async () => {
    try {
        await initDb();
        console.log('Database initialized successfully.');
        const PORT = process.env.PORT || 5500;
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    }
})();
