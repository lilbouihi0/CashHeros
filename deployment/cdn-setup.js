/**
 * CDN Setup Script for Static Assets
 * 
 * This script sets up an AWS CloudFront distribution for serving static assets.
 */

const AWS = require('aws-sdk');
require('dotenv').config();

// AWS Configuration
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const cloudfront = new AWS.CloudFront();
const s3 = new AWS.S3();

/**
 * Create an S3 bucket for static assets
 * @param {string} bucketName - The name of the bucket to create
 */
async function createS3Bucket(bucketName) {
  try {
    // Check if bucket already exists
    try {
      await s3.headBucket({ Bucket: bucketName }).promise();
      console.log(`Bucket ${bucketName} already exists`);
      return;
    } catch (error) {
      if (error.code !== 'NotFound') {
        throw error;
      }
    }

    // Create bucket
    await s3.createBucket({
      Bucket: bucketName,
      CreateBucketConfiguration: {
        LocationConstraint: AWS.config.region
      }
    }).promise();

    // Enable static website hosting
    await s3.putBucketWebsite({
      Bucket: bucketName,
      WebsiteConfiguration: {
        IndexDocument: {
          Suffix: 'index.html'
        },
        ErrorDocument: {
          Key: 'error.html'
        }
      }
    }).promise();

    // Set bucket policy to allow CloudFront access
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${bucketName}/*`
        }
      ]
    };

    await s3.putBucketPolicy({
      Bucket: bucketName,
      Policy: JSON.stringify(bucketPolicy)
    }).promise();

    console.log(`Bucket ${bucketName} created successfully`);
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error);
    throw error;
  }
}

/**
 * Create a CloudFront origin access identity
 * @param {string} comment - A comment for the identity
 */
async function createOriginAccessIdentity(comment) {
  try {
    const params = {
      CloudFrontOriginAccessIdentityConfig: {
        CallerReference: Date.now().toString(),
        Comment: comment
      }
    };

    const data = await cloudfront.createCloudFrontOriginAccessIdentity(params).promise();
    console.log('Origin access identity created successfully');
    return data.CloudFrontOriginAccessIdentity.Id;
  } catch (error) {
    console.error('Error creating origin access identity:', error);
    throw error;
  }
}

/**
 * Create a CloudFront distribution for static assets
 * @param {string} bucketName - The name of the S3 bucket
 * @param {string} originAccessIdentityId - The ID of the origin access identity
 * @param {string} domainName - The custom domain name for the distribution
 * @param {string} acmCertificateArn - The ARN of the ACM certificate
 */
async function createCloudFrontDistribution(bucketName, originAccessIdentityId, domainName, acmCertificateArn) {
  try {
    const params = {
      DistributionConfig: {
        CallerReference: Date.now().toString(),
        Comment: `Distribution for ${bucketName}`,
        DefaultCacheBehavior: {
          ForwardedValues: {
            Cookies: {
              Forward: 'none'
            },
            QueryString: false
          },
          MinTTL: 0,
          DefaultTTL: 86400,
          MaxTTL: 31536000,
          TargetOriginId: `S3-${bucketName}`,
          ViewerProtocolPolicy: 'redirect-to-https',
          Compress: true
        },
        Origins: {
          Quantity: 1,
          Items: [
            {
              DomainName: `${bucketName}.s3.amazonaws.com`,
              Id: `S3-${bucketName}`,
              S3OriginConfig: {
                OriginAccessIdentity: `origin-access-identity/cloudfront/${originAccessIdentityId}`
              }
            }
          ]
        },
        Enabled: true,
        DefaultRootObject: 'index.html',
        PriceClass: 'PriceClass_100',
        ViewerCertificate: {
          ACMCertificateArn: acmCertificateArn,
          SSLSupportMethod: 'sni-only',
          MinimumProtocolVersion: 'TLSv1.2_2021'
        },
        Aliases: {
          Quantity: domainName ? 1 : 0,
          Items: domainName ? [domainName] : []
        },
        CustomErrorResponses: {
          Quantity: 1,
          Items: [
            {
              ErrorCode: 404,
              ResponsePagePath: '/index.html',
              ResponseCode: '200',
              ErrorCachingMinTTL: 300
            }
          ]
        },
        HttpVersion: 'http2',
        IsIPV6Enabled: true
      }
    };

    const data = await cloudfront.createDistribution(params).promise();
    console.log(`CloudFront distribution created successfully: ${data.Distribution.DomainName}`);
    return {
      distributionId: data.Distribution.Id,
      distributionDomain: data.Distribution.DomainName
    };
  } catch (error) {
    console.error('Error creating CloudFront distribution:', error);
    throw error;
  }
}

/**
 * Set up CDN for static assets
 * @param {string} environment - The environment to set up CDN for
 */
async function setupCdn(environment) {
  try {
    const bucketName = `cashheros-static-${environment}`;
    const domainName = environment === 'production' 
      ? 'static.cashheros.com' 
      : `static-${environment}.cashheros.com`;
    
    // Create S3 bucket
    await createS3Bucket(bucketName);
    
    // Create origin access identity
    const originAccessIdentityId = await createOriginAccessIdentity(`OAI for ${bucketName}`);
    
    // Create CloudFront distribution
    const { distributionId, distributionDomain } = await createCloudFrontDistribution(
      bucketName,
      originAccessIdentityId,
      domainName,
      process.env.ACM_CERTIFICATE_ARN
    );
    
    console.log(`CDN setup for ${environment} environment completed successfully!`);
    console.log(`Bucket: ${bucketName}`);
    console.log(`Distribution ID: ${distributionId}`);
    console.log(`Distribution Domain: ${distributionDomain}`);
    console.log(`Custom Domain: ${domainName}`);
    
    return {
      bucketName,
      distributionId,
      distributionDomain,
      domainName
    };
  } catch (error) {
    console.error(`CDN setup for ${environment} environment failed:`, error);
    throw error;
  }
}

// If script is run directly, execute the setup for the specified environment
if (require.main === module) {
  const environment = process.argv[2];
  
  if (!environment) {
    console.error('Usage: node cdn-setup.js [environment]');
    process.exit(1);
  }
  
  setupCdn(environment).catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
}