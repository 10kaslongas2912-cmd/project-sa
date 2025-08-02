import React from 'react';
import './LoginRegisterModal.css';

interface LoginRegisterModalProps {
  onClose: () => void;
}

const LoginRegisterModal: React.FC<LoginRegisterModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>เข้าสู่ระบบ / สร้างบัญชี</h2>
        {/* Add your login/register form or content here */}
        <p>นี่คือเนื้อหาสำหรับหน้าเข้าสู่ระบบหรือสร้างบัญชี</p>
        <button className="close-button" onClick={onClose}>X</button>
      </div>
    </div>
  );
};

export default LoginRegisterModal;