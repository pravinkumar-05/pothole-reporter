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

    console.log("Database cleared successfully (0 complaints)!");
}

resetDb().catch(console.error);
