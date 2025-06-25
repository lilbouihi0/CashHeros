/**
 * Database Monitoring System
 * 
 * This module provides functionality for monitoring database performance and health.
 */

const mongoose = require('mongoose');
const os = require('os');
const { EventEmitter } = require('events');

// Create event emitter for monitoring events
const monitoringEvents = new EventEmitter();

// Store monitoring data
const monitoringData = {
  queries: {
    count: 0,
    slow: [],
    errors: []
  },
  connections: {
    current: 0,
    total: 0,
    errors: 0
  },
  memory: {
    usage: 0,
    limit: 0
  },
  cpu: {
    usage: 0
  },
  collections: {},
  lastUpdated: Date.now()
};

// Configuration
const config = {
  slowQueryThreshold: 100, // ms
  queryLogSize: 100, // number of slow queries to keep
  errorLogSize: 100, // number of errors to keep
  updateInterval: 60000, // 1 minute
  enabled: process.env.DB_MONITORING_ENABLED === 'true'
};

/**
 * Initialize database monitoring
 */
const initMonitoring = () => {
  if (!config.enabled) {
    console.log('Database monitoring is disabled');
    return;
  }
  
  console.log('Initializing database monitoring...');
  
  // Monitor mongoose queries
  mongoose.set('debug', (collectionName, methodName, ...methodArgs) => {
    // Increment query count
    monitoringData.queries.count++;
    
    // Track collection stats
    if (!monitoringData.collections[collectionName]) {
      monitoringData.collections[collectionName] = {
        queries: 0,
        slow: 0,
        errors: 0
      };
    }
    
    monitoringData.collections[collectionName].queries++;
    
    // Emit query event
    monitoringEvents.emit('query', {
      collection: collectionName,
      method: methodName,
      args: methodArgs,
      timestamp: Date.now()
    });
  });
  
  // Monitor mongoose connection events
  mongoose.connection.on('connected', () => {
    monitoringData.connections.current++;
    monitoringData.connections.total++;
    monitoringEvents.emit('connection', { type: 'connected' });
  });
  
  mongoose.connection.on('disconnected', () => {
    monitoringData.connections.current--;
    monitoringEvents.emit('connection', { type: 'disconnected' });
  });
  
  mongoose.connection.on('error', (err) => {
    monitoringData.connections.errors++;
    monitoringEvents.emit('error', { type: 'connection', error: err });
  });
  
  // Set up query time tracking
  const originalExec = mongoose.Query.prototype.exec;
  
  mongoose.Query.prototype.exec = function(...args) {
    const startTime = Date.now();
    const collection = this.mongooseCollection.name;
    
    return originalExec.apply(this, args)
      .then((result) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Check if this is a slow query
        if (duration > config.slowQueryThreshold) {
          const queryInfo = {
            collection,
            query: this.getQuery(),
            options: this.getOptions(),
            duration,
            timestamp: endTime
          };
          
          // Add to slow queries list
          monitoringData.queries.slow.unshift(queryInfo);
          
          // Trim list if needed
          if (monitoringData.queries.slow.length > config.queryLogSize) {
            monitoringData.queries.slow.pop();
          }
          
          // Update collection stats
          monitoringData.collections[collection].slow++;
          
          // Emit slow query event
          monitoringEvents.emit('slowQuery', queryInfo);
        }
        
        return result;
      })
      .catch((err) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const errorInfo = {
          collection,
          query: this.getQuery(),
          options: this.getOptions(),
          duration,
          error: err.message,
          stack: err.stack,
          timestamp: endTime
        };
        
        // Add to errors list
        monitoringData.queries.errors.unshift(errorInfo);
        
        // Trim list if needed
        if (monitoringData.queries.errors.length > config.errorLogSize) {
          monitoringData.queries.errors.pop();
        }
        
        // Update collection stats
        monitoringData.collections[collection].errors++;
        
        // Emit query error event
        monitoringEvents.emit('queryError', errorInfo);
        
        throw err;
      });
  };
  
  // Start periodic updates
  setInterval(updateMonitoringData, config.updateInterval);
  
  console.log('Database monitoring initialized');
};

/**
 * Update monitoring data
 */
const updateMonitoringData = async () => {
  try {
    // Update memory usage
    const memoryUsage = process.memoryUsage();
    monitoringData.memory = {
      usage: memoryUsage.heapUsed,
      limit: memoryUsage.heapTotal,
      external: memoryUsage.external,
      rss: memoryUsage.rss
    };
    
    // Update CPU usage
    const cpus = os.cpus();
    const cpuUsage = process.cpuUsage();
    monitoringData.cpu = {
      usage: cpuUsage.user + cpuUsage.system,
      cores: cpus.length
    };
    
    // Update database stats if connected
    if (mongoose.connection.readyState === 1) {
      try {
        const dbStats = await mongoose.connection.db.stats();
        monitoringData.database = {
          name: dbStats.db,
          collections: dbStats.collections,
          views: dbStats.views,
          objects: dbStats.objects,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize
        };
        
        // Get collection stats
        const collections = await mongoose.connection.db.listCollections().toArray();
        
        for (const collection of collections) {
          const collStats = await mongoose.connection.db.collection(collection.name).stats();
          
          if (!monitoringData.collections[collection.name]) {
            monitoringData.collections[collection.name] = {
              queries: 0,
              slow: 0,
              errors: 0
            };
          }
          
          monitoringData.collections[collection.name].stats = {
            count: collStats.count,
            size: collStats.size,
            avgObjSize: collStats.avgObjSize,
            storageSize: collStats.storageSize,
            indexes: collStats.nindexes,
            indexSize: collStats.totalIndexSize
          };
        }
      } catch (error) {
        console.error('Error getting database stats:', error);
      }
    }
    
    // Update timestamp
    monitoringData.lastUpdated = Date.now();
    
    // Emit update event
    monitoringEvents.emit('update', monitoringData);
  } catch (error) {
    console.error('Error updating monitoring data:', error);
  }
};

/**
 * Get monitoring data
 * @returns {Object} Monitoring data
 */
const getMonitoringData = () => {
  return {
    ...monitoringData,
    config,
    mongoose: {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    }
  };
};

/**
 * Reset monitoring data
 */
const resetMonitoringData = () => {
  monitoringData.queries = {
    count: 0,
    slow: [],
    errors: []
  };
  
  monitoringData.connections = {
    current: mongoose.connection.readyState === 1 ? 1 : 0,
    total: 0,
    errors: 0
  };
  
  monitoringData.collections = {};
  monitoringData.lastUpdated = Date.now();
  
  // Emit reset event
  monitoringEvents.emit('reset');
  
  console.log('Monitoring data reset');
};

/**
 * Update monitoring configuration
 * @param {Object} newConfig - New configuration
 * @returns {Object} Updated configuration
 */
const updateConfig = (newConfig) => {
  Object.assign(config, newConfig);
  return config;
};

module.exports = {
  initMonitoring,
  getMonitoringData,
  resetMonitoringData,
  updateConfig,
  monitoringEvents,
  config
};