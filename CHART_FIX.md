# Chart.js and React-ChartJS-2 Fix

This document explains how to fix the Chart.js and React-ChartJS-2 dependency issues in the CashHeros project.

## Issue

The project is encountering errors with the Chart.js and React-ChartJS-2 dependencies:

```
ERROR in ./src/pages/AdminDashboard/components/AnalyticsDashboard.jsx 10:0-147
Module not found: Error: Can't resolve 'chart.js' in 'C:\Users\yb106\OneDrive\Desktop\New folder (9)\Coupon_website\CashHeros\src\pages\AdminDashboard\components'
ERROR in ./src/pages/AdminDashboard/components/AnalyticsDashboard.jsx 11:0-49
Module not found: Error: Can't resolve 'react-chartjs-2' in 'C:\Users\yb106\OneDrive\Desktop\New folder (9)\Coupon_website\CashHeros\src\pages\AdminDashboard\components'
```

## Solution

The dependencies are already listed in the package.json file but might not be properly installed. Follow these steps to fix the issue:

### Option 1: Run the reinstall script

1. Run the `reinstall-chart-deps.bat` script in the project root directory:
   ```
   cd C:\Users\yb106\OneDrive\Desktop\New folder (9)\Coupon_website\CashHeros
   reinstall-chart-deps.bat
   ```

### Option 2: Manually reinstall the dependencies

1. Open a command prompt in the project root directory:
   ```
   cd C:\Users\yb106\OneDrive\Desktop\New folder (9)\Coupon_website\CashHeros
   ```

2. Uninstall the current chart.js and react-chartjs-2 packages:
   ```
   npm uninstall chart.js react-chartjs-2
   ```

3. Reinstall the packages with specific versions:
   ```
   npm install chart.js@4.4.1 react-chartjs-2@5.2.0
   ```

### Option 3: Clean npm cache and reinstall all dependencies

If the above options don't work, try cleaning the npm cache and reinstalling all dependencies:

1. Open a command prompt in the project root directory:
   ```
   cd C:\Users\yb106\OneDrive\Desktop\New folder (9)\Coupon_website\CashHeros
   ```

2. Clean the npm cache:
   ```
   npm cache clean --force
   ```

3. Delete the node_modules folder and package-lock.json:
   ```
   rmdir /s /q node_modules
   del package-lock.json
   ```

4. Reinstall all dependencies:
   ```
   npm install
   ```

## Code Changes

The following code changes have been made to fix the chart references:

1. Added useRef hooks for the charts:
   ```javascript
   // Create refs for charts
   const userChartRef = useRef(null);
   const couponChartRef = useRef(null);
   const cashbackChartRef = useRef(null);
   ```

2. Updated the chart components to use the refs:
   ```javascript
   <Line 
     ref={userChartRef}
     data={getUserChartData(userActivity)} 
     options={userChartOptions} 
     height={300}
   />
   ```

3. Modified the chart data creation to use state instead of relying on refs:
   ```javascript
   if (response.data.data) {
     const chartData = createUserGrowthChart(response.data.data);
     setUserChartData(chartData);
   }
   ```

After making these changes and reinstalling the dependencies, the charts should work correctly.