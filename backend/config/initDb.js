const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase(pool) {
  try {
    const sqlFile = await fs.readFile(path.join(__dirname, '../models/init-db.sql'), 'utf8');

    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('✅ Successfully executed SQL statement');
      } catch (error) {
        console.error('❌ Error executing statement:\n', statement, '\n', error.message);
      }
    }

    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

module.exports = initializeDatabase;
