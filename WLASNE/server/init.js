#!/usr/bin/env node

/**
 * Database Initialization Script
 * Helps with initial setup and testing of the application
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
});

async function initializeDatabase() {
    const connection = await pool.getConnection();

    try {
        console.log('Creating database...');
        await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        console.log('Database created');

        console.log('Using database...');
        await connection.execute(`USE ${process.env.DB_NAME}`);

        console.log('Reading schema file...');
        const schemaPath = path.join(__dirname, 'database', 'schema-new.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Creating tables...');
        await connection.execute(schema);
        console.log('Tables created successfully');

        console.log('Database initialization completed!');
        console.log(`Database: ${process.env.DB_NAME}`);
        console.log(`Host: ${process.env.DB_HOST}`);
        console.log(`User: ${process.env.DB_USER}`);

    } catch (error) {
        console.error('Error during initialization:', error.message);
        process.exit(1);
    } finally {
        connection.release();
        pool.end();
    }
}

// Check if database exists
async function checkDatabase() {
    const connection = await pool.getConnection();

    try {
        await connection.execute(`USE ${process.env.DB_NAME}`);
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`Database ${process.env.DB_NAME} exists with ${tables.length} tables:`);
        
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  - ${tableName}`);
        });
    } catch (error) {
        if (error.code === 'ER_BAD_DB_ERROR') {
            console.log(`Database ${process.env.DB_NAME} does not exist. Run init to create it.`);
        } else {
            throw error;
        }
    } finally {
        connection.release();
        pool.end();
    }
}

// Command handling
const command = process.argv[2];

switch (command) {
    case 'init':
        initializeDatabase();
        break;
    case 'check':
        checkDatabase();
        break;
    default:
        console.log('Usage: node init.js [command]');
        console.log('Commands:');
        console.log('  init   - Initialize database with schema');
        console.log('  check  - Check if database exists and show tables');
        process.exit(0);
}
