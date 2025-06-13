const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase(pool) {
  try {
    // Read the SQL file
    const sqlFile = await fs.readFile(path.join(__dirname, '../database.sql'), 'utf8');
    
    // Split the SQL file into individual statements
    const statements = sqlFile
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement + ';');

    // Execute each statement
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('Successfully executed SQL statement');
      } catch (error) {
        // Skip errors for duplicate tables/entries
        if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
          console.log('Table or entry already exists, skipping...');
          continue;
        }
        throw error;
      }
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = initializeDatabase; 