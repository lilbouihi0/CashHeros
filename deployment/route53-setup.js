/**
 * AWS Route 53 Domain Configuration Script
 * 
 * This script sets up DNS records in AWS Route 53 for the CashHeros domains.
 */

const AWS = require('aws-sdk');
require('dotenv').config();

// AWS Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const route53 = new AWS.Route53();

/**
 * Create or update a Route 53 record set
 * @param {string} hostedZoneId - The ID of the hosted zone
 * @param {string} domain - The domain name
 * @param {string} type - The record type (A, CNAME, etc.)
 * @param {Array<string>} values - The values for the record
 * @param {number} ttl - The TTL for the record in seconds
 */
async function createOrUpdateRecord(hostedZoneId, domain, type, values, ttl = 300) {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: domain,
            Type: type,
            TTL: ttl,
            ResourceRecords: values.map(value => ({ Value: value }))
          }
        }
      ],
      Comment: `Update ${type} record for ${domain}`
    },
    HostedZoneId: hostedZoneId
  };

  try {
    const data = await route53.changeResourceRecordSets(params).promise();
    console.log(`Successfully updated ${type} record for ${domain}`);
    return data;
  } catch (error) {
    console.error(`Error updating ${type} record for ${domain}:`, error);
    throw error;
  }
}

/**
 * Create or update a Route 53 alias record
 * @param {string} hostedZoneId - The ID of the hosted zone
 * @param {string} domain - The domain name
 * @param {string} targetDomain - The target domain name
 * @param {string} targetHostedZoneId - The hosted zone ID of the target
 */
async function createOrUpdateAliasRecord(hostedZoneId, domain, targetDomain, targetHostedZoneId) {
  const params = {
    ChangeBatch: {
      Changes: [
        {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: domain,
            Type: 'A',
            AliasTarget: {
              DNSName: targetDomain,
              HostedZoneId: targetHostedZoneId,
              EvaluateTargetHealth: true
            }
          }
        }
      ],
      Comment: `Update alias record for ${domain}`
    },
    HostedZoneId: hostedZoneId
  };

  try {
    const data = await route53.changeResourceRecordSets(params).promise();
    console.log(`Successfully updated alias record for ${domain}`);
    return data;
  } catch (error) {
    console.error(`Error updating alias record for ${domain}:`, error);
    throw error;
  }
}

/**
 * Set up DNS records for CashHeros domains
 * @param {string} environment - The environment to set up DNS for
 * @param {string} hostedZoneId - The ID of the hosted zone
 * @param {string} cloudfrontDomain - The CloudFront distribution domain
 * @param {string} cloudfrontHostedZoneId - The CloudFront hosted zone ID
 * @param {string} loadBalancerDomain - The load balancer domain for the API
 * @param {string} loadBalancerHostedZoneId - The load balancer hosted zone ID
 */
async function setupDnsRecords(
  environment,
  hostedZoneId,
  cloudfrontDomain,
  cloudfrontHostedZoneId,
  loadBalancerDomain,
  loadBalancerHostedZoneId
) {
  const baseDomain = 'cashheros.com';
  let frontendDomain, apiDomain;

  if (environment === 'production') {
    frontendDomain = baseDomain;
    apiDomain = `api.${baseDomain}`;
  } else {
    frontendDomain = `${environment}.${baseDomain}`;
    apiDomain = `api-${environment}.${baseDomain}`;
  }

  try {
    // Set up frontend domain (pointing to CloudFront)
    await createOrUpdateAliasRecord(
      hostedZoneId,
      frontendDomain,
      cloudfrontDomain,
      cloudfrontHostedZoneId
    );

    // Set up www subdomain
    await createOrUpdateAliasRecord(
      hostedZoneId,
      `www.${frontendDomain}`,
      cloudfrontDomain,
      cloudfrontHostedZoneId
    );

    // Set up API domain (pointing to load balancer)
    await createOrUpdateAliasRecord(
      hostedZoneId,
      apiDomain,
      loadBalancerDomain,
      loadBalancerHostedZoneId
    );

    // Set up MX records for email
    await createOrUpdateRecord(
      hostedZoneId,
      baseDomain,
      'MX',
      [
        '10 mail.cashheros.com',
        '20 mailbackup.cashheros.com'
      ],
      3600
    );

    // Set up TXT records for SPF, DKIM, etc.
    await createOrUpdateRecord(
      hostedZoneId,
      baseDomain,
      'TXT',
      [
        '"v=spf1 include:_spf.google.com ~all"',
        '"google-site-verification=your-verification-code"'
      ],
      3600
    );

    console.log(`DNS setup for ${environment} environment completed successfully!`);
  } catch (error) {
    console.error(`DNS setup for ${environment} environment failed:`, error);
    throw error;
  }
}

// If script is run directly, execute the setup for the specified environment
if (require.main === module) {
  const environment = process.argv[2];
  const hostedZoneId = process.argv[3];
  const cloudfrontDomain = process.argv[4];
  const cloudfrontHostedZoneId = process.argv[5];
  const loadBalancerDomain = process.argv[6];
  const loadBalancerHostedZoneId = process.argv[7];
  
  if (!environment || !hostedZoneId || !cloudfrontDomain || !cloudfrontHostedZoneId || !loadBalancerDomain || !loadBalancerHostedZoneId) {
    console.error('Usage: node route53-setup.js [environment] [hostedZoneId] [cloudfrontDomain] [cloudfrontHostedZoneId] [loadBalancerDomain] [loadBalancerHostedZoneId]');
    process.exit(1);
  }
  
  setupDnsRecords(
    environment,
    hostedZoneId,
    cloudfrontDomain,
    cloudfrontHostedZoneId,
    loadBalancerDomain,
    loadBalancerHostedZoneId
  ).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}