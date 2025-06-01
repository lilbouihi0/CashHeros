/**
 * Auto-scaling Configuration
 * 
 * This module provides configuration for auto-scaling in production environments.
 * It supports both horizontal scaling (multiple instances) and vertical scaling (resource allocation).
 */

const os = require('os');
const cluster = require('cluster');

// Configuration
const config = {
  // Enable auto-scaling
  enabled: process.env.AUTO_SCALING_ENABLED === 'true',
  
  // Cluster configuration
  cluster: {
    // Enable cluster mode (horizontal scaling)
    enabled: process.env.CLUSTER_ENABLED === 'true',
    
    // Number of worker processes
    // If set to 'auto', will use number of CPU cores
    workers: process.env.CLUSTER_WORKERS === 'auto' 
      ? os.cpus().length 
      : (parseInt(process.env.CLUSTER_WORKERS) || 1),
    
    // Maximum number of workers
    maxWorkers: parseInt(process.env.CLUSTER_MAX_WORKERS) || 8,
    
    // Minimum number of workers
    minWorkers: parseInt(process.env.CLUSTER_MIN_WORKERS) || 1
  },
  
  // Load balancing configuration
  loadBalancing: {
    // Strategy for distributing connections
    // Options: 'round-robin', 'least-connections'
    strategy: process.env.LOAD_BALANCING_STRATEGY || 'round-robin'
  },
  
  // Health check configuration
  healthCheck: {
    // Interval for health checks in milliseconds
    interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    
    // Timeout for health checks in milliseconds
    timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    
    // Path for health check endpoint
    path: process.env.HEALTH_CHECK_PATH || '/api/health'
  },
  
  // Resource limits
  resources: {
    // Memory limit in MB
    // If process exceeds this limit, it will be restarted
    memoryLimit: parseInt(process.env.MEMORY_LIMIT) || 1024,
    
    // CPU usage threshold (percentage)
    // If process exceeds this threshold, scaling may occur
    cpuThreshold: parseInt(process.env.CPU_THRESHOLD) || 80
  }
};

/**
 * Initialize auto-scaling
 * @returns {Object} Cluster manager
 */
const initializeScaling = () => {
  if (!config.enabled) {
    console.log('Auto-scaling is disabled');
    return null;
  }
  
  console.log('Initializing auto-scaling...');
  
  // If cluster mode is enabled and this is the master process
  if (config.cluster.enabled && cluster.isMaster) {
    console.log(`Master process ${process.pid} is running`);
    
    // Calculate number of workers
    const numWorkers = Math.min(
      Math.max(config.cluster.minWorkers, config.cluster.workers),
      config.cluster.maxWorkers
    );
    
    console.log(`Starting ${numWorkers} worker processes...`);
    
    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork();
    }
    
    // Handle worker exit
    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died (${signal || code}). Restarting...`);
      cluster.fork();
    });
    
    // Set up periodic health checks
    setInterval(() => {
      Object.values(cluster.workers).forEach(worker => {
        worker.send('health-check');
      });
    }, config.healthCheck.interval);
    
    return cluster;
  }
  
  // If this is a worker process or cluster mode is disabled
  if (cluster.isWorker || !config.cluster.enabled) {
    console.log(`Worker ${process.pid} started`);
    
    // Set memory limit
    if (config.resources.memoryLimit) {
      const memoryLimitBytes = config.resources.memoryLimit * 1024 * 1024;
      process.setMaxListeners(memoryLimitBytes);
    }
    
    // Handle health check messages from master
    if (cluster.isWorker) {
      process.on('message', (msg) => {
        if (msg === 'health-check') {
          // Perform health check
          const memoryUsage = process.memoryUsage();
          const healthStatus = {
            pid: process.pid,
            memory: {
              rss: memoryUsage.rss,
              heapTotal: memoryUsage.heapTotal,
              heapUsed: memoryUsage.heapUsed,
              external: memoryUsage.external
            },
            uptime: process.uptime()
          };
          
          // Send health status back to master
          process.send({ type: 'health-status', data: healthStatus });
        }
      });
    }
  }
  
  return null;
};

/**
 * Get scaling configuration
 * @returns {Object} Scaling configuration
 */
const getScalingConfig = () => {
  return { ...config };
};

/**
 * Update scaling configuration
 * @param {Object} newConfig - New configuration
 * @returns {Object} Updated configuration
 */
const updateScalingConfig = (newConfig) => {
  Object.assign(config, newConfig);
  return { ...config };
};

/**
 * Get system resource usage
 * @returns {Object} Resource usage statistics
 */
const getResourceUsage = () => {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = process.memoryUsage();
  
  return {
    system: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: cpus.length,
      totalMemory: totalMem,
      freeMemory: freeMem,
      memoryUsage: (totalMem - freeMem) / totalMem * 100,
      uptime: os.uptime()
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        usage: memoryUsage.heapUsed / memoryUsage.heapTotal * 100
      }
    },
    workers: cluster.isMaster ? Object.keys(cluster.workers).length : 'N/A'
  };
};

module.exports = {
  initializeScaling,
  getScalingConfig,
  updateScalingConfig,
  getResourceUsage,
  config
};