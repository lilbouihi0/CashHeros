/**
 * Database Backup Script
 * 
 * This script creates backups of the MongoDB database.
 * It can be run manually or scheduled using a cron job.
 * 
 * Usage:
 * - Manual: node scripts/backup.js
 * - Cron: 0 0 * * * node /path/to/scripts/backup.js
 */

require('dotenv').config({ path: '../.env' });
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const moment = require('moment');

// Configuration
const config = {
  // MongoDB connection string
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/cashheros',
  
  // Local backup directory
  backupDir: path.join(__dirname, '../backups'),
  
  // Backup retention (days)
  localRetention: 7,
  
  // AWS S3 configuration for remote storage
  aws: {
    enabled: process.env.AWS_BACKUP_ENABLED === 'true',
    bucket: process.env.AWS_BACKUP_BUCKET,
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    retention: 90 // days
  }
};

/**
 * Create backup directory if it doesn't exist
 */
const ensureBackupDir = () => {
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
    console.log(`Created backup directory: ${config.backupDir}`);
  }
};

/**
 * Create a database backup using mongodump
 * @returns {Promise<string>} Path to the backup file
 */
const createBackup = () => {
  return new Promise((resolve, reject) => {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const backupPath = path.join(config.backupDir, `backup-${timestamp}`);
    const archivePath = `${backupPath}.gz`;
    
    console.log(`Creating backup at ${archivePath}...`);
    
    // Extract database name from connection string
    const dbName = config.mongoUri.split('/').pop().split('?')[0];
    
    // Create mongodump command
    const cmd = `mongodump --uri="${config.mongoUri}" --archive="${archivePath}" --gzip`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Backup error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.log(`Backup stderr: ${stderr}`);
      }
      
      console.log(`Backup created successfully at ${archivePath}`);
      resolve(archivePath);
    });
  });
};

/**
 * Upload backup to AWS S3
 * @param {string} backupPath - Path to the backup file
 * @returns {Promise<Object>} S3 upload result
 */
const uploadToS3 = (backupPath) => {
  return new Promise((resolve, reject) => {
    if (!config.aws.enabled) {
      console.log('AWS backup disabled, skipping upload');
      return resolve(null);
    }
    
    console.log(`Uploading backup to S3 bucket: ${config.aws.bucket}...`);
    
    // Configure AWS SDK
    AWS.config.update({
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    });
    
    const s3 = new AWS.S3();
    const fileName = path.basename(backupPath);
    
    // Read backup file
    const fileContent = fs.readFileSync(backupPath);
    
    // Set up S3 upload parameters
    const params = {
      Bucket: config.aws.bucket,
      Key: `mongodb-backups/${fileName}`,
      Body: fileContent
    };
    
    // Upload to S3
    s3.upload(params, (err, data) => {
      if (err) {
        console.error(`S3 upload error: ${err.message}`);
        return reject(err);
      }
      
      console.log(`Backup uploaded successfully to ${data.Location}`);
      resolve(data);
    });
  });
};

/**
 * Delete old backups based on retention policy
 * @returns {Promise<void>}
 */
const cleanupOldBackups = async () => {
  // Clean up local backups
  const files = fs.readdirSync(config.backupDir);
  const now = moment();
  
  console.log(`Checking for old backups to clean up...`);
  
  // Clean up local files
  files.forEach(file => {
    if (file.startsWith('backup-') && file.endsWith('.gz')) {
      const filePath = path.join(config.backupDir, file);
      const stats = fs.statSync(filePath);
      const fileDate = moment(stats.mtime);
      const daysOld = now.diff(fileDate, 'days');
      
      if (daysOld > config.localRetention) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old backup: ${file} (${daysOld} days old)`);
      }
    }
  });
  
  // Clean up S3 backups
  if (config.aws.enabled) {
    const s3 = new AWS.S3();
    
    const params = {
      Bucket: config.aws.bucket,
      Prefix: 'mongodb-backups/'
    };
    
    try {
      const data = await s3.listObjectsV2(params).promise();
      
      for (const object of data.Contents) {
        const fileDate = moment(object.LastModified);
        const daysOld = now.diff(fileDate, 'days');
        
        if (daysOld > config.aws.retention) {
          await s3.deleteObject({
            Bucket: config.aws.bucket,
            Key: object.Key
          }).promise();
          
          console.log(`Deleted old S3 backup: ${object.Key} (${daysOld} days old)`);
        }
      }
    } catch (error) {
      console.error(`S3 cleanup error: ${error.message}`);
    }
  }
};

/**
 * Main backup function
 */
const runBackup = async () => {
  try {
    console.log('Starting database backup process...');
    
    // Ensure backup directory exists
    ensureBackupDir();
    
    // Create backup
    const backupPath = await createBackup();
    
    // Upload to S3 if enabled
    if (config.aws.enabled) {
      await uploadToS3(backupPath);
    }
    
    // Clean up old backups
    await cleanupOldBackups();
    
    console.log('Backup process completed successfully');
  } catch (error) {
    console.error('Backup process failed:', error);
    process.exit(1);
  }
};

// Run backup if script is executed directly
if (require.main === module) {
  runBackup();
}

module.exports = {
  runBackup
};