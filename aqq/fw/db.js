const knex = require('knex');
const dbConfig = require('../config');

const db = knex({
  client: 'mysql2',
  connection: {
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  },
  pool: { min: 0, max: 7 }
});

const mysql = require('mysql2/promise');

// Verbindung zur Datenbank herstellen
async function connectDB() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error('Error connecting to database:', error);
    }
}

async function executeStatement(statement, params = []) {
    let conn = await connectDB();
    const [results, fields] = await conn.execute(statement, params);
    await conn.end();
    return results;
}

module.exports = {
    connectDB: connectDB,
    executeStatement: executeStatement,
    knex: db
};