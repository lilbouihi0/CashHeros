import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { 
  FaFileExport, FaCalendarAlt, FaChartBar, FaTable, 
  FaDownload, FaEnvelope, FaFileAlt, FaFileExcel, FaFilePdf,
  FaUsers, FaTag, FaMoneyBillWave
} from 'react-icons/fa';
import styles from '../AdminDashboard.module.css';

const ReportingTools = () => {
  const { accessToken } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [reportType, setReportType] = useState('users');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [format, setFormat] = useState('csv');
  const [includeFields, setIncludeFields] = useState({
    users: {
      email: true,
      name: true,
      joinDate: true,
      lastLogin: true,
      verified: true,
      role: true
    },
    coupons: {
      code: true,
      title: true,
      store: true,
      discount: true,
      expiryDate: true,
      usageCount: true,
      isActive: true
    },
    cashbacks: {
      store: true,
      percent: true,
      category: true,
      popularity: true,
      featured: true
    },
    transactions: {
      user: true,
      amount: true,
      date: true,
      type: true,
      status: true
    }
  });
  const [emailReport, setEmailReport] = useState({
    enabled: false,
    recipients: '',
    schedule: 'once',
    frequency: 'weekly'
  });

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormatChange = (e) => {
    setFormat(e.target.value);
  };

  const handleFieldToggle = (category, field) => {
    setIncludeFields(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: !prev[category][field]
      }
    }));
  };

  const handleEmailReportChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailReport(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Prepare the fields to include
      const fields = Object.entries(includeFields[reportType])
        .filter(([_, included]) => included)
        .map(([field]) => field);
      
      // Make API request to generate report
      const response = await axios.post(
        'http://localhost:5000/api/admin/reports/generate',
        {
          reportType,
          dateRange,
          format,
          fields,
          emailReport: emailReport.enabled ? {
            recipients: emailReport.recipients.split(',').map(email => email.trim()),
            schedule: emailReport.schedule,
            frequency: emailReport.frequency
          } : null
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: emailReport.enabled ? 'json' : 'blob' // If emailing, we want JSON response; otherwise, blob for download
        }
      );
      
      if (emailReport.enabled) {
        // If emailing the report, show success message
        setSuccess('Report has been scheduled for delivery to the specified email addresses.');
      } else {
        // If downloading the report, create a download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        
        // Set the filename based on report type and format
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `${reportType}-report-${date}.${format}`);
        
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        setSuccess('Report generated successfully!');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderFieldsSelection = () => {
    const fields = {
      users: [
        { id: 'email', label: 'Email' },
        { id: 'name', label: 'Name' },
        { id: 'joinDate', label: 'Join Date' },
        { id: 'lastLogin', label: 'Last Login' },
        { id: 'verified', label: 'Verified Status' },
        { id: 'role', label: 'Role' }
      ],
      coupons: [
        { id: 'code', label: 'Code' },
        { id: 'title', label: 'Title' },
        { id: 'store', label: 'Store' },
        { id: 'discount', label: 'Discount' },
        { id: 'expiryDate', label: 'Expiry Date' },
        { id: 'usageCount', label: 'Usage Count' },
        { id: 'isActive', label: 'Active Status' }
      ],
      cashbacks: [
        { id: 'store', label: 'Store' },
        { id: 'percent', label: 'Percentage' },
        { id: 'category', label: 'Category' },
        { id: 'popularity', label: 'Popularity' },
        { id: 'featured', label: 'Featured Status' }
      ],
      transactions: [
        { id: 'user', label: 'User' },
        { id: 'amount', label: 'Amount' },
        { id: 'date', label: 'Date' },
        { id: 'type', label: 'Type' },
        { id: 'status', label: 'Status' }
      ]
    };

    return (
      <div className={styles.fieldsSelection}>
        <h3>Select Fields to Include</h3>
        <div className={styles.checkboxGrid}>
          {fields[reportType].map(field => (
            <label key={field.id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeFields[reportType][field.id]}
                onChange={() => handleFieldToggle(reportType, field.id)}
              />
              {field.label}
            </label>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className={styles.cardHeader}>
        <h1>Reporting Tools</h1>
      </div>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Generate Reports</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGroup}>
            <label htmlFor="reportType">Report Type</label>
            <select
              id="reportType"
              value={reportType}
              onChange={handleReportTypeChange}
              className={styles.formControl}
            >
              <option value="users">Users Report</option>
              <option value="coupons">Coupons Report</option>
              <option value="cashbacks">Cashbacks Report</option>
              <option value="transactions">Transactions Report</option>
            </select>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateRangeChange}
                className={styles.formControl}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateRangeChange}
                className={styles.formControl}
                min={dateRange.startDate}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="format">Export Format</label>
            <div className={styles.formatOptions}>
              <label className={`${styles.formatOption} ${format === 'csv' ? styles.active : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={handleFormatChange}
                  className={styles.formatRadio}
                />
                <FaFileExcel className={styles.formatIcon} />
                <span>CSV</span>
              </label>
              
              <label className={`${styles.formatOption} ${format === 'excel' ? styles.active : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={handleFormatChange}
                  className={styles.formatRadio}
                />
                <FaFileExcel className={styles.formatIcon} />
                <span>Excel</span>
              </label>
              
              <label className={`${styles.formatOption} ${format === 'pdf' ? styles.active : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={handleFormatChange}
                  className={styles.formatRadio}
                />
                <FaFilePdf className={styles.formatIcon} />
                <span>PDF</span>
              </label>
              
              <label className={`${styles.formatOption} ${format === 'json' ? styles.active : ''}`}>
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === 'json'}
                  onChange={handleFormatChange}
                  className={styles.formatRadio}
                />
                <FaFileAlt className={styles.formatIcon} />
                <span>JSON</span>
              </label>
            </div>
          </div>
          
          {renderFieldsSelection()}
          
          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="enabled"
                checked={emailReport.enabled}
                onChange={handleEmailReportChange}
              />
              Email Report
            </label>
          </div>
          
          {emailReport.enabled && (
            <div className={styles.emailOptions}>
              <div className={styles.formGroup}>
                <label htmlFor="recipients">Email Recipients</label>
                <input
                  type="text"
                  id="recipients"
                  name="recipients"
                  value={emailReport.recipients}
                  onChange={handleEmailReportChange}
                  className={styles.formControl}
                  placeholder="email@example.com, another@example.com"
                  required={emailReport.enabled}
                />
                <small className={styles.helpText}>Separate multiple email addresses with commas</small>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="schedule">Schedule</label>
                  <select
                    id="schedule"
                    name="schedule"
                    value={emailReport.schedule}
                    onChange={handleEmailReportChange}
                    className={styles.formControl}
                  >
                    <option value="once">One-time</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
                
                {emailReport.schedule === 'recurring' && (
                  <div className={styles.formGroup}>
                    <label htmlFor="frequency">Frequency</label>
                    <select
                      id="frequency"
                      name="frequency"
                      value={emailReport.frequency}
                      onChange={handleEmailReportChange}
                      className={styles.formControl}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className={styles.formActions}>
            <button 
              onClick={generateReport} 
              className={styles.button}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.buttonLoader}></div>
                  Generating...
                </>
              ) : (
                <>
                  {emailReport.enabled ? <FaEnvelope /> : <FaDownload />}
                  {emailReport.enabled ? 'Send Report' : 'Generate & Download'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Scheduled Reports</h2>
        </div>
        <div className={styles.cardBody}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Frequency</th>
                <th>Recipients</th>
                <th>Last Sent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* This would be populated with real data in a production environment */}
              <tr>
                <td>Monthly User Report</td>
                <td>Users</td>
                <td>Monthly</td>
                <td>admin@example.com</td>
                <td>2023-04-01</td>
                <td>
                  <div className={styles.tableActions}>
                    <button className={`${styles.button} ${styles.buttonSecondary}`}>
                      Edit
                    </button>
                    <button className={`${styles.button} ${styles.buttonDanger}`}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Weekly Coupon Performance</td>
                <td>Coupons</td>
                <td>Weekly</td>
                <td>marketing@example.com</td>
                <td>2023-04-15</td>
                <td>
                  <div className={styles.tableActions}>
                    <button className={`${styles.button} ${styles.buttonSecondary}`}>
                      Edit
                    </button>
                    <button className={`${styles.button} ${styles.buttonDanger}`}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>Report Templates</h2>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.templateGrid}>
            <div className={styles.templateCard}>
              <div className={styles.templateIcon}>
                <FaUsers />
              </div>
              <h3>User Activity Report</h3>
              <p>Detailed report of user registrations, logins, and engagement metrics.</p>
              <button className={styles.button}>Use Template</button>
            </div>
            
            <div className={styles.templateCard}>
              <div className={styles.templateIcon}>
                <FaTag />
              </div>
              <h3>Coupon Performance</h3>
              <p>Analysis of coupon usage, redemption rates, and popular categories.</p>
              <button className={styles.button}>Use Template</button>
            </div>
            
            <div className={styles.templateCard}>
              <div className={styles.templateIcon}>
                <FaMoneyBillWave />
              </div>
              <h3>Cashback Summary</h3>
              <p>Overview of cashback offers, user earnings, and store performance.</p>
              <button className={styles.button}>Use Template</button>
            </div>
            
            <div className={styles.templateCard}>
              <div className={styles.templateIcon}>
                <FaChartBar />
              </div>
              <h3>Monthly Analytics</h3>
              <p>Comprehensive monthly report with key performance indicators.</p>
              <button className={styles.button}>Use Template</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingTools;