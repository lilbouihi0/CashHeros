/**
 * Database Migration Runner
 * 
 * This script runs database migrations to update the database schema.
 * Usage: node scripts/run-migrations.js [--revert]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const { runMigrations, revertLastMigration, getMigrationFiles, getAppliedMigrations } = require('../migrations');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldRevert = args.includes('--revert');
const shouldList = args.includes('--list');
const shouldCreate = args.includes('--create');

/**
 * List all migrations and their status
 */
const listMigrations = async () => {
  try {
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    
    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations();
    const appliedMigrationNames = appliedMigrations.map(m => m.name);
    
    console.log('\nMigration Status:');
    console.log('=================');
    
    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    migrationFiles.forEach(file => {
      const isApplied = appliedMigrationNames.includes(file);
      const status = isApplied ? 'APPLIED' : 'PENDING';
      const appliedMigration = appliedMigrations.find(m => m.name === file);
      const appliedDate = appliedMigration ? new Date(appliedMigration.appliedAt).toLocaleString() : '';
      
      console.log(`[${status}] ${file}${appliedDate ? ` (applied: ${appliedDate})` : ''}`);
    });
    
    console.log('\nTotal migrations:', migrationFiles.length);
    console.log('Applied:', appliedMigrationNames.length);
    console.log('Pending:', migrationFiles.length - appliedMigrationNames.length);
    console.log('=================\n');
  } catch (error) {
    console.error('Error listing migrations:', error);
    process.exit(1);
  }
};

/**
 * Create a new migration file
 */
const createMigration = async () => {
  try {
    const nameIndex = args.indexOf('--create') + 1;
    if (nameIndex >= args.length) {
      console.error('Error: Migration name is required.');
      console.log('Usage: node scripts/run-migrations.js --create <migration-name>');
      process.exit(1);
    }
    
    const migrationName = args[nameIndex];
    const { createMigration } = require('../migrations');
    const filePath = createMigration(migrationName);
    
    console.log(`Migration file created: ${filePath}`);
    console.log('Edit this file to implement your migration logic.');
  } catch (error) {
    console.error('Error creating migration:', error);
    process.exit(1);
  }
};

/**
 * Run migrations
 */
const runMigrationsHandler = async () => {
  try {
    console.log('Running database migrations...');
    
    // Connect to the database
    await connectDatabase();
    
    if (shouldList) {
      await listMigrations();
    } else if (shouldCreate) {
      await createMigration();
    } else if (shouldRevert) {
      // Revert the last migration
      const revertedMigration = await revertLastMigration();
      
      if (revertedMigration) {
        console.log(`Successfully reverted migration: ${revertedMigration}`);
      } else {
        console.log('No migrations to revert.');
      }
    } else {
      // Run pending migrations
      const appliedMigrations = await runMigrations();
      
      if (appliedMigrations.length > 0) {
        console.log(`Successfully applied ${appliedMigrations.length} migrations:`);
        appliedMigrations.forEach(migration => console.log(`- ${migration}`));
      } else {
        console.log('No pending migrations to apply.');
      }
    }
    
    // Disconnect from the database
    await mongoose.disconnect();
    console.log('Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    
    // Disconnect from the database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Database connection closed.');
    }
    
    process.exit(1);
  }
};

// Run the script
runMigrationsHandler();