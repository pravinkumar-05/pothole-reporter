const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function resetDb() {
    const db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    console.log("Connected. Clearing tables...");
    await db.exec('DELETE FROM status_history');
    await db.exec('DELETE FROM complaints');

    console.log("Seeding demo data...");
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

    console.log("Database refreshed successfully!");
}

resetDb().catch(console.error);
