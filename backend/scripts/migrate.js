#!/usr/bin/env node

/**
 * Database Migration CLI
 * 
 * This script provides a command-line interface for running database migrations.
 * 
 * Usage:
 * - Run all pending migrations: node scripts/migrate.js up
 * - Revert the last migration: node scripts/migrate.js down
 * - Create a new migration: node scripts/migrate.js create <name>
 * - List migrations: node scripts/migrate.js list
 * - Show migration status: node scripts/migrate.js status
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const migrations = require('../migrations');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

/**
 * Connect to the database
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * Disconnect from the database
 */
const disconnectDatabase = async () => {
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
};

/**
 * Run all pending migrations
 */
const runMigrations = async () => {
  try {
    await connectDatabase();
    const applied = await migrations.runMigrations();
    
    if (applied.length > 0) {
      console.log(`Applied ${applied.length} migrations:`);
      applied.forEach(migration => console.log(`- ${migration}`));
    }
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

/**
 * Revert the last migration
 */
const revertMigration = async () => {
  try {
    await connectDatabase();
    const reverted = await migrations.revertLastMigration();
    
    if (reverted) {
      console.log(`Reverted migration: ${reverted}`);
    }
  } catch (error) {
    console.error('Migration revert error:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

/**
 * Create a new migration
 * @param {string} name - Migration name
 */
const createMigration = async (name) => {
  if (!name) {
    console.error('Migration name is required');
    console.log('Usage: node scripts/migrate.js create <name>');
    process.exit(1);
  }
  
  try {
    const filePath = migrations.createMigration(name);
    console.log(`Created migration file: ${path.basename(filePath)}`);
  } catch (error) {
    console.error('Error creating migration:', error);
    process.exit(1);
  }
};

/**
 * List all migrations
 */
const listMigrations = async () => {
  try {
    await connectDatabase();
    
    const files = migrations.getMigrationFiles();
    const applied = await migrations.getAppliedMigrations();
    const appliedNames = applied.map(m => m.name);
    
    console.log('Migrations:');
    
    if (files.length === 0) {
      console.log('No migrations found');
    } else {
      files.forEach(file => {
        const status = appliedNames.includes(file) ? 'Applied' : 'Pending';
        const appliedAt = appliedNames.includes(file) 
          ? `(${new Date(applied.find(m => m.name === file).appliedAt).toLocaleString()})`
          : '';
        
        console.log(`- ${file}: ${status} ${appliedAt}`);
      });
    }
  } catch (error) {
    console.error('Error listing migrations:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

/**
 * Show migration status
 */
const showStatus = async () => {
  try {
    await connectDatabase();
    
    const files = migrations.getMigrationFiles();
    const applied = await migrations.getAppliedMigrations();
    const appliedNames = applied.map(m => m.name);
    
    const pending = files.filter(file => !appliedNames.includes(file));
    
    console.log('Migration Status:');
    console.log(`- Total migrations: ${files.length}`);
    console.log(`- Applied migrations: ${applied.length}`);
    console.log(`- Pending migrations: ${pending.length}`);
    
    if (pending.length > 0) {
      console.log('\nPending migrations:');
      pending.forEach(file => console.log(`- ${file}`));
    }
    
    if (applied.length > 0) {
      console.log('\nLast applied migration:');
      const lastApplied = applied[applied.length - 1];
      console.log(`- ${lastApplied.name} (${new Date(lastApplied.appliedAt).toLocaleString()})`);
    }
  } catch (error) {
    console.error('Error showing migration status:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
};

/**
 * Show help message
 */
const showHelp = () => {
  console.log(`
Database Migration CLI

Usage:
  node scripts/migrate.js <command> [options]

Commands:
  up                Run all pending migrations
  down              Revert the last applied migration
  create <name>     Create a new migration
  list              List all migrations
  status            Show migration status
  help              Show this help message

Examples:
  node scripts/migrate.js up
  node scripts/migrate.js down
  node scripts/migrate.js create add-user-fields
  node scripts/migrate.js list
  node scripts/migrate.js status
  `);
};

// Execute the appropriate command
(async () => {
  switch (command) {
    case 'up':
      await runMigrations();
      break;
    case 'down':
      await revertMigration();
      break;
    case 'create':
      await createMigration(param);
      break;
    case 'list':
      await listMigrations();
      break;
    case 'status':
      await showStatus();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
})();