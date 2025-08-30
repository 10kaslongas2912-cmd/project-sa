import React from 'react';
import './style.css';
import NavigationBar from '../../../../components/NavigationBar';

const VolunteerWaitForApprove = () => {
  return (
    <>  
    <NavigationBar />
    <div className="volunteer-wait-for-approve-container">
      <h1>Waiting for Approval</h1>
      <p>Your volunteer application is currently under review.</p>
    </div>
    </>
    
  );
};

export default VolunteerWaitForApprove;
