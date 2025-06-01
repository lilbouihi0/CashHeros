#!/bin/bash
# Monitoring and Alerting Setup Script

set -e

# Configuration
DEPLOY_ENV=$1
AWS_REGION=$2
PROJECT_NAME="cashheros"

if [ -z "$DEPLOY_ENV" ] || [ -z "$AWS_REGION" ]; then
  echo "Usage: ./monitoring-setup.sh [environment] [aws-region]"
  echo "Example: ./monitoring-setup.sh production us-east-1"
  exit 1
fi

echo "Setting up monitoring for $PROJECT_NAME in $DEPLOY_ENV environment..."

# Create CloudWatch Log Groups
echo "Creating CloudWatch Log Groups..."
aws logs create-log-group --log-group-name "/$PROJECT_NAME/$DEPLOY_ENV/backend" --region $AWS_REGION
aws logs create-log-group --log-group-name "/$PROJECT_NAME/$DEPLOY_ENV/frontend" --region $AWS_REGION
aws logs put-retention-policy --log-group-name "/$PROJECT_NAME/$DEPLOY_ENV/backend" --retention-in-days 30 --region $AWS_REGION
aws logs put-retention-policy --log-group-name "/$PROJECT_NAME/$DEPLOY_ENV/frontend" --retention-in-days 30 --region $AWS_REGION

# Create CloudWatch Alarms
echo "Creating CloudWatch Alarms..."

# CPU Utilization Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "$PROJECT_NAME-$DEPLOY_ENV-high-cpu" \
  --alarm-description "Alarm when CPU exceeds 80% for 5 minutes" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions "Name=AutoScalingGroupName,Value=$PROJECT_NAME-$DEPLOY_ENV-asg" \
  --evaluation-periods 2 \
  --alarm-actions "arn:aws:sns:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):$PROJECT_NAME-$DEPLOY_ENV-alerts" \
  --region $AWS_REGION

# Memory Utilization Alarm (requires CloudWatch agent)
aws cloudwatch put-metric-alarm \
  --alarm-name "$PROJECT_NAME-$DEPLOY_ENV-high-memory" \
  --alarm-description "Alarm when memory exceeds 80% for 5 minutes" \
  --metric-name mem_used_percent \
  --namespace CWAgent \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --dimensions "Name=AutoScalingGroupName,Value=$PROJECT_NAME-$DEPLOY_ENV-asg" \
  --evaluation-periods 2 \
  --alarm-actions "arn:aws:sns:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):$PROJECT_NAME-$DEPLOY_ENV-alerts" \
  --region $AWS_REGION

# API Error Rate Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "$PROJECT_NAME-$DEPLOY_ENV-api-error-rate" \
  --alarm-description "Alarm when API error rate exceeds 5% for 5 minutes" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions "Name=ApiName,Value=$PROJECT_NAME-$DEPLOY_ENV-api" \
  --evaluation-periods 2 \
  --alarm-actions "arn:aws:sns:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):$PROJECT_NAME-$DEPLOY_ENV-alerts" \
  --region $AWS_REGION

# API Latency Alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "$PROJECT_NAME-$DEPLOY_ENV-api-latency" \
  --alarm-description "Alarm when API latency exceeds 1000ms for 5 minutes" \
  --metric-name Latency \
  --namespace AWS/ApiGateway \
  --statistic Average \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions "Name=ApiName,Value=$PROJECT_NAME-$DEPLOY_ENV-api" \
  --evaluation-periods 2 \
  --alarm-actions "arn:aws:sns:$AWS_REGION:$(aws sts get-caller-identity --query Account --output text):$PROJECT_NAME-$DEPLOY_ENV-alerts" \
  --region $AWS_REGION

# Set up CloudWatch Dashboard
echo "Creating CloudWatch Dashboard..."
cat > dashboard.json << EOF
{
  "widgets": [
    {
      "type": "metric",
      "x": 0,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/EC2", "CPUUtilization", "AutoScalingGroupName", "$PROJECT_NAME-$DEPLOY_ENV-asg", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "$AWS_REGION",
        "title": "CPU Utilization",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 0,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "CWAgent", "mem_used_percent", "AutoScalingGroupName", "$PROJECT_NAME-$DEPLOY_ENV-asg", { "stat": "Average" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "$AWS_REGION",
        "title": "Memory Utilization",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApiGateway", "Count", "ApiName", "$PROJECT_NAME-$DEPLOY_ENV-api", { "stat": "Sum" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "$AWS_REGION",
        "title": "API Request Count",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 6,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApiGateway", "Latency", "ApiName", "$PROJECT_NAME-$DEPLOY_ENV-api", { "stat": "Average" } ],
          [ "AWS/ApiGateway", "Latency", "ApiName", "$PROJECT_NAME-$DEPLOY_ENV-api", { "stat": "p90" } ],
          [ "AWS/ApiGateway", "Latency", "ApiName", "$PROJECT_NAME-$DEPLOY_ENV-api", { "stat": "p99" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "$AWS_REGION",
        "title": "API Latency",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 0,
      "y": 12,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/ApiGateway", "4XXError", "ApiName", "$PROJECT_NAME-$DEPLOY_ENV-api", { "stat": "Sum" } ],
          [ "AWS/ApiGateway", "5XXError", "ApiName", "$PROJECT_NAME-$DEPLOY_ENV-api", { "stat": "Sum" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "$AWS_REGION",
        "title": "API Errors",
        "period": 300
      }
    },
    {
      "type": "metric",
      "x": 12,
      "y": 12,
      "width": 12,
      "height": 6,
      "properties": {
        "metrics": [
          [ "AWS/CloudFront", "Requests", "DistributionId", "$PROJECT_NAME-$DEPLOY_ENV-cf", { "stat": "Sum" } ]
        ],
        "view": "timeSeries",
        "stacked": false,
        "region": "$AWS_REGION",
        "title": "CloudFront Requests",
        "period": 300
      }
    }
  ]
}
EOF

aws cloudwatch put-dashboard \
  --dashboard-name "$PROJECT_NAME-$DEPLOY_ENV" \
  --dashboard-body file://dashboard.json \
  --region $AWS_REGION

# Clean up
rm dashboard.json

# Set up SNS Topic for Alerts
echo "Setting up SNS Topic for Alerts..."
aws sns create-topic \
  --name "$PROJECT_NAME-$DEPLOY_ENV-alerts" \
  --region $AWS_REGION

# Set up CloudWatch Agent Configuration
echo "Creating CloudWatch Agent Configuration..."
cat > cloudwatch-agent-config.json << EOF
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "root"
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "cpu": {
        "resources": [
          "*"
        ],
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "totalcpu": true,
        "metrics_collection_interval": 60
      },
      "disk": {
        "resources": [
          "/"
        ],
        "measurement": [
          "used_percent",
          "inodes_free"
        ],
        "metrics_collection_interval": 60
      },
      "diskio": {
        "resources": [
          "*"
        ],
        "measurement": [
          "io_time"
        ],
        "metrics_collection_interval": 60
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          "swap_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    },
    "append_dimensions": {
      "AutoScalingGroupName": "\${aws:AutoScalingGroupName}",
      "InstanceId": "\${aws:InstanceId}",
      "InstanceType": "\${aws:InstanceType}"
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/www/cashheros-backend-$DEPLOY_ENV/current/logs/error.log",
            "log_group_name": "/$PROJECT_NAME/$DEPLOY_ENV/backend",
            "log_stream_name": "{instance_id}/error",
            "retention_in_days": 30
          },
          {
            "file_path": "/var/www/cashheros-backend-$DEPLOY_ENV/current/logs/combined.log",
            "log_group_name": "/$PROJECT_NAME/$DEPLOY_ENV/backend",
            "log_stream_name": "{instance_id}/combined",
            "retention_in_days": 30
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/$PROJECT_NAME/$DEPLOY_ENV/nginx",
            "log_stream_name": "{instance_id}/access",
            "retention_in_days": 30
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/$PROJECT_NAME/$DEPLOY_ENV/nginx",
            "log_stream_name": "{instance_id}/error",
            "retention_in_days": 30
          }
        ]
      }
    }
  }
}
EOF

echo "CloudWatch Agent configuration created at cloudwatch-agent-config.json"
echo "Upload this file to your EC2 instances and install the CloudWatch agent"

echo "Monitoring setup for $PROJECT_NAME in $DEPLOY_ENV environment completed successfully!"