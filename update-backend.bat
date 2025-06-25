@echo off
echo Updating Google Cloud Run backend environment variables...

gcloud run services update cashheros-api ^
  --set-env-vars NODE_ENV=production ^
  --set-env-vars CORS_ORIGIN=https://casheros.com,https://www.casheros.com,https://cashheros.com,https://www.cashheros.com ^
  --set-env-vars FRONTEND_URL=https://casheros.com ^
  --region us-central1

echo Backend environment variables updated!
echo Please test your API now.
pause