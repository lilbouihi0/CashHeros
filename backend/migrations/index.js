/**
 * Database Migration System
 * 
 * This module provides a framework for running database migrations.
 * Migrations are used to make changes to the database schema or data
 * in a controlled and reversible way.
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Define Migration model
const migrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const Migration = mongoose.model('Migration', migrationSchema);

/**
 * Get all migration files
 * @returns {Array} List of migration files
 */
const getMigrationFiles = () => {
  const migrationsDir = path.join(__dirname);
  return fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^\d{14}-.*\.js$/)) // Format: YYYYMMDDHHmmSS-name.js
    .sort();
};

/**
 * Get applied migrations from database
 * @returns {Promise<Array>} List of applied migrations
 */
const getAppliedMigrations = async () => {
  return await Migration.find().sort({ name: 1 });
};

/**
 * Apply a migration
 * @param {string} migrationName - Name of the migration file
 * @returns {Promise<void>}
 */
const applyMigration = async (migrationName) => {
  const migration = require(path.join(__dirname, migrationName));
  
  console.log(`Applying migration: ${migrationName}`);
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Run the migration
    await migration.up(session);
    
    // Record the migration
    await Migration.create([{ name: migrationName }], { session });
    
    // Commit the transaction
    await session.commitTransaction();
    console.log(`Migration applied: ${migrationName}`);
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    console.error(`Migration failed: ${migrationName}`, error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Revert a migration
 * @param {string} migrationName - Name of the migration file
 * @returns {Promise<void>}
 */
const revertMigration = async (migrationName) => {
  const migration = require(path.join(__dirname, migrationName));
  
  if (!migration.down) {
    throw new Error(`Migration ${migrationName} does not support rollback`);
  }
  
  console.log(`Reverting migration: ${migrationName}`);
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Run the down migration
    await migration.down(session);
    
    // Remove the migration record
    await Migration.deleteOne({ name: migrationName }, { session });
    
    // Commit the transaction
    await session.commitTransaction();
    console.log(`Migration reverted: ${migrationName}`);
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    console.error(`Migration revert failed: ${migrationName}`, error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Run pending migrations
 * @returns {Promise<Array>} List of applied migrations
 */
const runMigrations = async () => {
  const migrationFiles = getMigrationFiles();
  const appliedMigrations = await getAppliedMigrations();
  const appliedMigrationNames = appliedMigrations.map(m => m.name);
  
  const pendingMigrations = migrationFiles.filter(file => !appliedMigrationNames.includes(file));
  
  if (pendingMigrations.length === 0) {
    console.log('No pending migrations');
    return [];
  }
  
  console.log(`Found ${pendingMigrations.length} pending migrations`);
  
  const appliedMigrationsList = [];
  
  for (const migrationName of pendingMigrations) {
    try {
      await applyMigration(migrationName);
      appliedMigrationsList.push(migrationName);
    } catch (error) {
      console.error(`Migration failed: ${migrationName}`, error);
      break;
    }
  }
  
  return appliedMigrationsList;
};

/**
 * Revert the last applied migration
 * @returns {Promise<string|null>} Name of the reverted migration or null
 */
const revertLastMigration = async () => {
  const appliedMigrations = await getAppliedMigrations();
  
  if (appliedMigrations.length === 0) {
    console.log('No migrations to revert');
    return null;
  }
  
  const lastMigration = appliedMigrations[appliedMigrations.length - 1];
  
  try {
    await revertMigration(lastMigration.name);
    return lastMigration.name;
  } catch (error) {
    console.error(`Failed to revert migration: ${lastMigration.name}`, error);
    throw error;
  }
};

/**
 * Create a new migration file
 * @param {string} name - Migration name
 * @returns {string} Path to the created migration file
 */
const createMigration = (name) => {
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').substring(0, 14);
  const fileName = `${timestamp}-${name}.js`;
  const filePath = path.join(__dirname, fileName);
  
  const template = `/**
 * Migration: ${name}
 * Created at: ${new Date().toISOString()}
 */

/**
 * Apply the migration
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 */
exports.up = async (session) => {
  // TODO: Implement migration logic
  // Example:
  // await mongoose.model('User').updateMany({}, { $set: { newField: 'defaultValue' } }, { session });
};

/**
 * Revert the migration
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 */
exports.down = async (session) => {
  // TODO: Implement rollback logic
  // Example:
  // await mongoose.model('User').updateMany({}, { $unset: { newField: '' } }, { session });
};
`;
  
  fs.writeFileSync(filePath, template);
  console.log(`Created migration file: ${fileName}`);
  
  return filePath;
};

module.exports = {
  runMigrations,
  revertLastMigration,
  createMigration,
  getMigrationFiles,
  getAppliedMigrations
};