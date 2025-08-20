import {
  Button,
  Form,
  Input,
  message,
  DatePicker,
  Select,
} from "antd";

import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import { GetGender, CreateUser, SignIn } from "../../../services/https/index.tsx";

import type { UsersInterface } from "../../../interfaces/IUser";

import logo from "../../../assets/logo.png";
import type { GenderInterface } from "../../../interfaces/Gender";
import './style.css';

function SignUpPages() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [gender, setGender] = useState<GenderInterface[]>([]);
  const [form] = Form.useForm(); // Add this line

  const onGetGender = async () => {
    const res = await GetGender();
    if (res.status == 200) {
      setGender(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลเพศ",
      });
      setTimeout(() => {
        navigate("/customer");
      }, 2000);
    }
  };

  const onFinish = async (values: UsersInterface) => {
    console.log("Attempting to create user...");
    const createUserRes = await CreateUser(values);

    if (createUserRes.status == 201) {
      console.log("User creation successful.", createUserRes);
      messageApi.success("สมัครสมาชิกสำเร็จ");

      const returnTo = sessionStorage.getItem('returnTo');
      console.log("returnTo value:", returnTo);

      // Check if the registration is part of a donation flow
      if (returnTo) {
        console.log("Registration is part of a donation flow. Attempting auto-login...");
        messageApi.loading("กำลังเข้าสู่ระบบอัตโนมัติ...", 1.5);

        // A short delay to ensure the new user is processed on the backend
        console.log("Waiting for 500ms before auto-login...");
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("Finished waiting. Proceeding with auto-login.");

        const signInValues: SignInInterface = {
            username: values.username,
            password: values.password,
        };
        console.log("Attempting sign-in with values:", signInValues);
        const signInRes = await SignIn(signInValues);
        console.log("Sign-in response:", signInRes);

        if (signInRes.status == 200) {
            console.log("Auto-login successful. Navigating to thank-you page.");
            messageApi.success("เข้าสู่ระบบสำเร็จ");
            localStorage.setItem("isLogin", "true");
            localStorage.setItem("page", "dashboard");
            localStorage.setItem("token_type", signInRes.data.token_type);
            localStorage.setItem("token", signInRes.data.token);
            localStorage.setItem("id", signInRes.data.id);

            // Clean up session storage
            sessionStorage.removeItem('donationInfoFormData');
            sessionStorage.removeItem('returnTo');

            // Navigate to the thank you page to complete the flow
            setTimeout(() => {
                navigate("/thank-you");
            }, 1500);

        } else {
            console.log("Auto-login failed. Navigating to login page.");
            // Handle failed auto-login
            messageApi.error("การเข้าสู่ระบบอัตโนมัติล้มเหลว กรุณาเข้าสู่ระบบด้วยตนเอง");
            setTimeout(() => {
                navigate(`/login?returnTo=${returnTo}`);
            }, 2000);
        }
      } else {
        console.log("Standard registration flow. Navigating to login page.");
        // Standard registration flow
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } else {
      console.log("User creation failed.", createUserRes);
      messageApi.open({
        type: "error",
        content: createUserRes.data.error,
      });
    }
  };

  useEffect(() => {
    onGetGender();
    // Pre-fill form with data from session storage
    const donationInfo = sessionStorage.getItem('donationInfoFormData');
    if (donationInfo) {
      const { firstName, lastName, email, phone } = JSON.parse(donationInfo);
      form.setFieldsValue({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone_number: phone,
      });
    }
  }, []);

  return (
    <>
      {contextHolder}
      <div className="register-page-container">
        <div className="register-card">
          <div className="register-logo">
            <img src={logo} alt="logo" />
          </div>
          <h1 className="register-title">สมัครสมาชิก</h1>
          <h2 className="register-subtitle">กรุณากรอกข้อมูลเพื่อสมัครสมาชิก</h2>
          <Form
            form={form} // Add this line
            name="basic"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="ชื่อจริง"
              name="first_name"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกชื่อ !",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="นามสกุล"
              name="last_name"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกนามสกุล !",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="วันเกิด"
              name="birthday"
              rules={[
                {
                  required: true,
                  message: "กรุณาเลือกวันเกิด !",
                },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="เบอร์โทรศัพท์"
              name="phone_number"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกเบอร์โทรศัพท์ !",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="อีเมล"
              name="email"
              rules={[
                {
                  type: "email",
                  message: "รูปแบบอีเมลไม่ถูกต้อง !",
                },
                {
                  required: true,
                  message: "กรุณากรอกอีเมล !",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="ชื่อผู้ใช้"
              name="username"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกชื่อผู้ใช้ !",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="รหัสผ่าน"
              name="password"
              rules={[
                {
                  required: true,
                  message: "กรุณากรอกรหัสผ่าน !",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              label="เพศ"
              name="gender_id"
              rules={[
                {
                  required: true,
                  message: "กรุณาเลือกเพศ !",
                },
              ]}
            >
              <Select
                defaultValue=""
                style={{ width: "100%" }}
              >
                {gender?.map((item) => (
                  <Select.Option value={item?.ID}>
                    {item?.gender}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="register-form-button"
              >
                สมัครสมาชิก
              </Button>
              <a onClick={() => navigate("/login")} className="signin-link">เข้าสู่ระบบ</a>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
}

export default SignUpPages;