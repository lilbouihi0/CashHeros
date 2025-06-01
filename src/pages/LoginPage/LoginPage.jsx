// src/pages/LoginPage/LoginPage.jsx
import React from 'react';
import LoginFormNew from '../../Components/Login/LoginFormNew';
import styles from './LoginPage.module.css';

export const LoginPage = () => {
  return (
    <div className={styles.loginPage}>
      <LoginFormNew />
    </div>
  );
};

export default LoginPage;
