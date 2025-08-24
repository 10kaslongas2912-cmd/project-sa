import React from 'react';
import './style.css';
import NavigationBar from '../../../../components/NavigationBar';

const VolunteerApprovalPage = () => {
  return (
    <>
        <NavigationBar />
        <div className="volunteer-approval-page-container">
        <h1>Volunteer Approval</h1>
        <p>Your volunteer application has been approved.</p>
        </div>
    </>
  );
};

export default VolunteerApprovalPage;
