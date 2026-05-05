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
        console.log('Seeding demo data...');
        const id1 = 'MH-RD-DEMO01';
        const id2 = 'MH-RD-DEMO02';
        
        await db.run(`INSERT INTO complaints (id, name, phone, email, description, severity, roadType, lat, lng, address, status, submittedAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [id1, 'Rajesh Patil', '9876543210', 'rajesh.p@email.com', 'Large pothole on main road near Shivaji Chowk.', 'critical', 'national-highway', 19.0760, 72.8777, 'Shivaji Chowk, Mumbai, Maharashtra', 'in-progress', '2026-03-25 08:30:00', '2026-03-28 14:00:00']);
        
        await db.run(`INSERT INTO complaints (id, name, phone, email, description, severity, roadType, lat, lng, address, status, submittedAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [id2, 'Priya Sharma', '9123456789', 'priya.s@email.com', 'Multiple potholes from Pune Station to Swargate.', 'high', 'state-highway', 18.5204, 73.8567, 'Pune Station Road, Pune, Maharashtra', 'pending', '2026-03-30 11:45:00', '2026-03-30 11:45:00']);

        await db.run(`INSERT INTO status_history (complaint_id, status, note, date) VALUES (?, ?, ?, ?)`, [id1, 'pending', 'Complaint registered', '2026-03-25 08:30:00']);
        await db.run(`INSERT INTO status_history (complaint_id, status, note, date) VALUES (?, ?, ?, ?)`, [id1, 'under-review', 'Reviewed by PWD', '2026-03-26 10:15:00']);
        await db.run(`INSERT INTO status_history (complaint_id, status, note, date) VALUES (?, ?, ?, ?)`, [id1, 'in-progress', 'Repair crew dispatched', '2026-03-28 14:00:00']);
        await db.run(`INSERT INTO status_history (complaint_id, status, note, date) VALUES (?, ?, ?, ?)`, [id2, 'pending', 'Complaint registered', '2026-03-30 11:45:00']);
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
