import React from "react";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  return (
    <div className={styles.Dashboard}>
      <div className={styles.DashboardLeft}>
        <div className={styles.DashboardHeader}></div>
        <div className={styles.DashboardHeaderTitle}>Smart Resume Screening</div>
        <div className={styles.DashboardHeaderLargeTitle}>Resume Match Score</div>
        <div className={styles.alertInfo}>
          <div>🔔 ​Important Instructions:</div>
          <div className={styles.DashboardInstruction}></div>
          <div>​​📋​ ​Please paste the complete job description in the "Job Description" field before submitting.</div>
          <div>​​📝 ​Only PDF format (.pdf) resumes are accepted.</div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;