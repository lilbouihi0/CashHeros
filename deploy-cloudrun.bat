@echo off
echo Deploying to Google Cloud Run...
echo.

REM Deploy with environment variables from file
gcloud run deploy cashheros-api ^
  --source ./functions ^
  --platform managed ^
  --region us-central1 ^
  --allow-unauthenticated ^
  --env-vars-file ./functions/.env.yaml ^
  --port 8080 ^
  --memory 1Gi ^
  --cpu 1 ^
  --max-instances 10

if %errorlevel% neq 0 (
    echo Deployment failed
    pause
    exit /b 1
)

echo.
echo Deployment successful!
echo Your API is now available at the Cloud Run URL
echo.
pause