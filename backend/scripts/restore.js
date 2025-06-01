/**
 * Database Restore Script
 * 
 * This script restores the MongoDB database from a backup.
 * 
 * Usage:
 * - Restore from local: node scripts/restore.js --file=backup-2023-01-01_00-00-00.gz
 * - Restore from S3: node scripts/restore.js --s3 --file=backup-2023-01-01_00-00-00.gz
 */

require('dotenv').config({ path: '../.env' });
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const readline = require('readline');

// Configuration
const config = {
  // MongoDB connection string
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/cashheros',
  
  // Local backup directory
  backupDir: path.join(__dirname, '../backups'),
  
  // AWS S3 configuration
  aws: {
    enabled: process.env.AWS_BACKUP_ENABLED === 'true',
    bucket: process.env.AWS_BACKUP_BUCKET,
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};

/**
 * Parse command line arguments
 * @returns {Object} Parsed arguments
 */
const parseArgs = () => {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg === '--s3') {
      args.s3 = true;
    } else if (arg.startsWith('--file=')) {
      args.file = arg.split('=')[1];
    }
  });
  return args;
};

/**
 * List available backups
 * @param {boolean} fromS3 - Whether to list backups from S3
 * @returns {Promise<Array>} List of available backups
 */
const listBackups = async (fromS3 = false) => {
  if (fromS3) {
    if (!config.aws.enabled) {
      console.error('AWS backup is not enabled in configuration');
      process.exit(1);
    }
    
    // Configure AWS SDK
    AWS.config.update({
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    });
    
    const s3 = new AWS.S3();
    
    const params = {
      Bucket: config.aws.bucket,
      Prefix: 'mongodb-backups/'
    };
    
    try {
      const data = await s3.listObjectsV2(params).promise();
      return data.Contents.map(obj => ({
        name: obj.Key.replace('mongodb-backups/', ''),
        date: obj.LastModified,
        size: obj.Size,
        path: obj.Key
      })).sort((a, b) => b.date - a.date);
    } catch (error) {
      console.error(`S3 list error: ${error.message}`);
      process.exit(1);
    }
  } else {
    // List local backups
    if (!fs.existsSync(config.backupDir)) {
      console.error(`Backup directory does not exist: ${config.backupDir}`);
      process.exit(1);
    }
    
    const files = fs.readdirSync(config.backupDir);
    return files
      .filter(file => file.startsWith('backup-') && file.endsWith('.gz'))
      .map(file => {
        const filePath = path.join(config.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          date: stats.mtime,
          size: stats.size,
          path: filePath
        };
      })
      .sort((a, b) => b.date - a.date);
  }
};

/**
 * Download backup from S3
 * @param {string} key - S3 object key
 * @returns {Promise<string>} Path to downloaded file
 */
const downloadFromS3 = async (key) => {
  console.log(`Downloading backup from S3: ${key}`);
  
  // Configure AWS SDK
  AWS.config.update({
    region: config.aws.region,
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  });
  
  const s3 = new AWS.S3();
  const fileName = key.split('/').pop();
  const filePath = path.join(config.backupDir, fileName);
  
  // Ensure backup directory exists
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }
  
  // Create write stream
  const fileStream = fs.createWriteStream(filePath);
  
  // Download from S3
  const params = {
    Bucket: config.aws.bucket,
    Key: key
  };
  
  return new Promise((resolve, reject) => {
    s3.getObject(params)
      .createReadStream()
      .pipe(fileStream)
      .on('error', (error) => {
        console.error(`S3 download error: ${error.message}`);
        reject(error);
      })
      .on('close', () => {
        console.log(`Backup downloaded to ${filePath}`);
        resolve(filePath);
      });
  });
};

/**
 * Prompt user for confirmation
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} User confirmation
 */
const confirmAction = async (message) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`${message} (y/N): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
};

/**
 * Restore database from backup
 * @param {string} backupPath - Path to backup file
 * @returns {Promise<void>}
 */
const restoreDatabase = async (backupPath) => {
  return new Promise((resolve, reject) => {
    console.log(`Restoring database from ${backupPath}...`);
    
    // Create mongorestore command
    const cmd = `mongorestore --uri="${config.mongoUri}" --gzip --archive="${backupPath}" --drop`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Restore error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.log(`Restore stderr: ${stderr}`);
      }
      
      console.log(`Database restored successfully from ${backupPath}`);
      resolve();
    });
  });
};

/**
 * Main restore function
 */
const runRestore = async () => {
  try {
    const args = parseArgs();
    const fromS3 = args.s3 === true;
    
    console.log(`Starting database restore process from ${fromS3 ? 'S3' : 'local'} backup...`);
    
    // If file is specified, use it
    if (args.file) {
      let backupPath;
      
      if (fromS3) {
        backupPath = await downloadFromS3(`mongodb-backups/${args.file}`);
      } else {
        backupPath = path.join(config.backupDir, args.file);
        
        if (!fs.existsSync(backupPath)) {
          console.error(`Backup file not found: ${backupPath}`);
          process.exit(1);
        }
      }
      
      const confirmed = await confirmAction(
        `WARNING: This will replace all data in the database with the backup. Continue?`
      );
      
      if (!confirmed) {
        console.log('Restore cancelled');
        process.exit(0);
      }
      
      await restoreDatabase(backupPath);
    } else {
      // List available backups and let user choose
      const backups = await listBackups(fromS3);
      
      if (backups.length === 0) {
        console.error(`No backups found ${fromS3 ? 'in S3' : 'locally'}`);
        process.exit(1);
      }
      
      console.log('\nAvailable backups:');
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.name} (${new Date(backup.date).toLocaleString()}, ${(backup.size / 1024 / 1024).toFixed(2)} MB)`);
      });
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('\nEnter the number of the backup to restore: ', (answer) => {
          rl.close();
          resolve(answer);
        });
      });
      
      const index = parseInt(answer) - 1;
      
      if (isNaN(index) || index < 0 || index >= backups.length) {
        console.error('Invalid selection');
        process.exit(1);
      }
      
      const selectedBackup = backups[index];
      let backupPath;
      
      if (fromS3) {
        backupPath = await downloadFromS3(selectedBackup.path);
      } else {
        backupPath = selectedBackup.path;
      }
      
      const confirmed = await confirmAction(
        `WARNING: This will replace all data in the database with the backup from ${new Date(selectedBackup.date).toLocaleString()}. Continue?`
      );
      
      if (!confirmed) {
        console.log('Restore cancelled');
        process.exit(0);
      }
      
      await restoreDatabase(backupPath);
    }
    
    console.log('Restore process completed successfully');
  } catch (error) {
    console.error('Restore process failed:', error);
    process.exit(1);
  }
};

// Run restore if script is executed directly
if (require.main === module) {
  runRestore();
}

module.exports = {
  runRestore
};