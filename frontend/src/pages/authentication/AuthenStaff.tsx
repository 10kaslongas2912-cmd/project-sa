// src/pages/auth/EmployeeLoginPage.tsx
import { useState } from "react";
import { Form, Input, message, Button } from "antd";
import { useNavigate } from "react-router-dom";

import type { LoginStaffRequest } from "../../interfaces/Staff";
import { staffAuthAPI } from "../../services/apis";
import "./AuthenStaffStyle.css";
import logo from "../../assets/logo.png";
import ButtonComponent from "../../components/Button";
import dog from "../../assets/auth/dog.jpg";

const EmployeeLoginPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm<LoginStaffRequest>();
  const [submitting, setSubmitting] = useState(false);

  // ---- FORGOT PASSWORD ----
  const handleForgotPassword = () => {
    messageApi.info("กรุณาติดต่อผู้ดูแลระบบเพื่อขอรีเซ็ตรหัสผ่าน");
  };

  // ---- EMPLOYEE LOGIN ----
  const onFinishEmployeeLogin = async (values: LoginStaffRequest) => {
    try {
      setSubmitting(true);

      // เรียก API เข้าสู่ระบบของพนักงาน
      const res = await staffAuthAPI.logIn(values);
      const payload = res.data; // { token_type, token, staff: {...} }

      messageApi.success("เข้าสู่ระบบสำเร็จ");
    sessionStorage.clear();
      sessionStorage.setItem("isLogin", "true");
      sessionStorage.setItem("userType", "staff"); // ใช้ "staff" ให้ตรงกับ hook/useStaffMe
      sessionStorage.setItem("token_type", payload.token_type);
      sessionStorage.setItem("token", payload.token);

      const staffId =
        payload?.staff?.id ??
        payload?.staff?.ID ??
        payload?.staff?.Id ??
        null;
      if (staffId != null) {
        sessionStorage.setItem("ID", String(staffId));
        navigate("/dashboard", { replace: true });
      }
    } catch (e: any) {
      const err = e?.response?.data?.error ?? "เข้าสู่ระบบไม่สำเร็จ";
      messageApi.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="container employee-container">
        {/* ฟอร์มลงชื่อเข้าใช้สำหรับพนักงาน */}
        <div className="form-container employee-login">
          <div className="logo-box">
            <img src={logo} alt="logo" className="logo-img" />
          </div>

          <Form form={loginForm} onFinish={onFinishEmployeeLogin} layout="vertical">
            <h1>เข้าสู่ระบบพนักงาน</h1>
            <div className="employee-badge">
              <span>สำหรับเจ้าหน้าที่เท่านั้น</span>
            </div>

            <Form.Item
              label="รหัสพนักงาน"
              className="i-form"
              name="username"
              rules={[{ required: true, message: "กรุณากรอกรหัสพนักงาน!" }]}
            >
              <Input placeholder="รหัสพนักงาน" autoComplete="username" />
            </Form.Item>

            <Form.Item
              label="รหัสผ่าน"
              className="i-form"
              name="password"
              rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
            >
              <Input.Password placeholder="รหัสผ่าน" autoComplete="current-password" />
            </Form.Item>

            <div className="forgot-password">
              <Button type="link" className="forgot-link" onClick={handleForgotPassword}>
                ลืมรหัสผ่าน?
              </Button>
            </div>

            <div className="btn">
              <ButtonComponent className="btn-primary" htmlType="submit" disabled={submitting}>
                {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </ButtonComponent>
            </div>

            {/* ปุ่มกลับไปหน้า login ปกติ */}
            <div className="back-to-user-login">
              <div className="divider">
                <span>หรือ</span>
              </div>
              <ButtonComponent
                className="btn-back"
                type="button"
                onClick={() => navigate("../users")}
                disabled={submitting}
              >
                กลับไปหน้าเข้าสู่ระบบลูกค้า
              </ButtonComponent>
            </div>
          </Form>
        </div>

        {/* Background Image */}
        <div className="employee-background">
          <img src={dog} alt="" />
        </div>
      </div>
    </>
  );
};

export default EmployeeLoginPage;
