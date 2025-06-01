/**
 * MongoDB Atlas Setup Script
 * 
 * This script provides functions to set up and configure MongoDB Atlas
 * for different environments.
 */

const { MongoClient } = require('mongodb');
const axios = require('axios');
require('dotenv').config();

// Atlas API Configuration
const ATLAS_API_BASE_URL = 'https://cloud.mongodb.com/api/atlas/v1.0';
const ATLAS_API_PUBLIC_KEY = process.env.ATLAS_API_PUBLIC_KEY;
const ATLAS_API_PRIVATE_KEY = process.env.ATLAS_API_PRIVATE_KEY;
const ATLAS_PROJECT_ID = process.env.ATLAS_PROJECT_ID;

// Environment Configuration
const environments = {
  development: {
    clusterName: 'CashHeros-Dev',
    instanceSize: 'M0',
    backupEnabled: false,
    ipWhitelist: ['0.0.0.0/0'], // Allow all IPs for development
  },
  staging: {
    clusterName: 'CashHeros-Staging',
    instanceSize: 'M10',
    backupEnabled: true,
    ipWhitelist: [], // Add specific IPs for staging
  },
  production: {
    clusterName: 'CashHeros-Prod',
    instanceSize: 'M30',
    backupEnabled: true,
    ipWhitelist: [], // Add specific IPs for production
  },
};

/**
 * Create a new MongoDB Atlas cluster
 * @param {string} environment - The environment to create the cluster for
 */
async function createCluster(environment) {
  if (!environments[environment]) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  const config = environments[environment];
  
  try {
    const response = await axios({
      method: 'post',
      url: `${ATLAS_API_BASE_URL}/groups/${ATLAS_PROJECT_ID}/clusters`,
      auth: {
        username: ATLAS_API_PUBLIC_KEY,
        password: ATLAS_API_PRIVATE_KEY,
      },
      data: {
        name: config.clusterName,
        providerSettings: {
          providerName: 'AWS',
          instanceSizeName: config.instanceSize,
          regionName: 'US_EAST_1',
        },
        backupEnabled: config.backupEnabled,
      },
    });

    console.log(`Cluster ${config.clusterName} created successfully`);
    return response.data;
  } catch (error) {
    console.error('Error creating cluster:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Configure IP whitelist for a cluster
 * @param {string} environment - The environment to configure
 * @param {Array<string>} additionalIps - Additional IPs to whitelist
 */
async function configureIpWhitelist(environment, additionalIps = []) {
  if (!environments[environment]) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  const config = environments[environment];
  const ipAddresses = [...config.ipWhitelist, ...additionalIps];
  
  try {
    for (const ip of ipAddresses) {
      await axios({
        method: 'post',
        url: `${ATLAS_API_BASE_URL}/groups/${ATLAS_PROJECT_ID}/whitelist`,
        auth: {
          username: ATLAS_API_PUBLIC_KEY,
          password: ATLAS_API_PRIVATE_KEY,
        },
        data: {
          ipAddress: ip,
          comment: `Added for ${environment} environment`,
        },
      });
      console.log(`IP ${ip} whitelisted successfully`);
    }
  } catch (error) {
    console.error('Error configuring IP whitelist:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Create a database user for the cluster
 * @param {string} environment - The environment to create the user for
 * @param {string} username - The username for the database user
 * @param {string} password - The password for the database user
 */
async function createDatabaseUser(environment, username, password) {
  if (!environments[environment]) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  try {
    await axios({
      method: 'post',
      url: `${ATLAS_API_BASE_URL}/groups/${ATLAS_PROJECT_ID}/databaseUsers`,
      auth: {
        username: ATLAS_API_PUBLIC_KEY,
        password: ATLAS_API_PRIVATE_KEY,
      },
      data: {
        databaseName: 'admin',
        username,
        password,
        roles: [
          {
            roleName: 'readWrite',
            databaseName: 'cashheros',
          },
        ],
      },
    });
    console.log(`Database user ${username} created successfully`);
  } catch (error) {
    console.error('Error creating database user:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get the connection string for a cluster
 * @param {string} environment - The environment to get the connection string for
 */
async function getConnectionString(environment) {
  if (!environments[environment]) {
    throw new Error(`Invalid environment: ${environment}`);
  }

  const config = environments[environment];
  
  try {
    const response = await axios({
      method: 'get',
      url: `${ATLAS_API_BASE_URL}/groups/${ATLAS_PROJECT_ID}/clusters/${config.clusterName}`,
      auth: {
        username: ATLAS_API_PUBLIC_KEY,
        password: ATLAS_API_PRIVATE_KEY,
      },
    });
    
    const connectionString = response.data.connectionStrings.standardSrv;
    console.log(`Connection string for ${config.clusterName}: ${connectionString}`);
    return connectionString;
  } catch (error) {
    console.error('Error getting connection string:', error.response?.data || error.message);
    throw error;
  }
}

// Export functions for use in other scripts
module.exports = {
  createCluster,
  configureIpWhitelist,
  createDatabaseUser,
  getConnectionString,
};

// If script is run directly, execute the setup for the specified environment
if (require.main === module) {
  const environment = process.argv[2];
  const username = process.argv[3];
  const password = process.argv[4];
  
  if (!environment || !username || !password) {
    console.error('Usage: node mongodb-atlas-setup.js [environment] [username] [password]');
    process.exit(1);
  }
  
  (async () => {
    try {
      await createCluster(environment);
      await configureIpWhitelist(environment);
      await createDatabaseUser(environment, username, password);
      await getConnectionString(environment);
      console.log('MongoDB Atlas setup completed successfully!');
    } catch (error) {
      console.error('MongoDB Atlas setup failed:', error);
      process.exit(1);
    }
  })();
}