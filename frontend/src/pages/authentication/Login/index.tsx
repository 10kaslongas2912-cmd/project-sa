import { Button, Form, Input, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { SignIn } from "../../../services/https/index.tsx";
import type { SignInInterface } from "../../../interfaces/SignIn";
import logo from "../../../assets/logo.png";
import './style.css';

function SignInPages() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messageApi, contextHolder] = message.useMessage();
  const onFinish = async (values: SignInInterface) => {
    const res = await SignIn(values);

    if (res.status == 200) {
      messageApi.success("Sign-in successful");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("page", "dashboard");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);

      const params = new URLSearchParams(location.search);
      const returnTo = params.get('returnTo');
      sessionStorage.removeItem('returnTo'); // Clean up

      setTimeout(() => {
        if (returnTo) {
          navigate(returnTo);
        } else {
          navigate("/");
        }
      }, 2000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="login-page-container">
        <div className="login-card">
          <div className="login-logo">
            <img src={logo} alt="logo" />
          </div>
          <h2 className="login-title">ลงชื่อเข้าใช้</h2>
          <Form
            name="basic"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="ชื่อผู้ใช้"
              name="username"
              rules={[
                { required: true, message: "กรุณากรอกชื่อผู้ใช้!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="รหัสผ่าน"
              name="password"
              rules={[
                { required: true, message: "กรุณากรอกรหัสผ่าน!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                เข้าสู่ระบบ
              </Button>
              <a onClick={() => navigate("/signup")} className="signup-link">สมัครสมาชิก</a>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
}

export default SignInPages;