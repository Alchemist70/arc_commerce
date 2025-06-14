const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase(pool) {
  try {
    // Read the SQL file
    const sqlFile = await fs.readFile(path.join(__dirname, '../database.sql'), 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sqlFile
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    // Execute each statement
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('Successfully executed SQL statement');
      } catch (error) {
        // Log and continue on error (e.g., table already exists)
        console.error('Error executing statement:', error.message);
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = initializeDatabase; 