// src/pages/auth/AuthPage.tsx
import { useState, useEffect } from "react";
import { Button, Form, Input, message, DatePicker, Select } from "antd";
import { useNavigate } from "react-router-dom";

import type { CreateUserRequest,LoginUserRequest, UpdateUserRequest } from "../../interfaces/User"; // แยกเป็น Request ชัดเจน
import type { GenderInterface } from "../../interfaces/Gender";

import { authAPI, genderAPI } from "../../services/apis"; // <- ใช้รวม API ที่ไฟล์เดียว
import "./style.css";
import logo from "../../assets/logo.png";

function AuthPage() {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [genders, setGenders] = useState<GenderInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const handleToggleForm = (isLogin: boolean) => {
    setIsLoginActive(isLogin);
    loginForm.resetFields();
    registerForm.resetFields();
  };

  // ---- LOGIN ----
  const onFinishLogin = async (values: LoginUserRequest) => {
    try {
      const res = await authAPI.logIn(values);
      const payload = res.data;

      messageApi.success("เข้าสู่ระบบสำเร็จ");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("token_type", payload.token_type);
      localStorage.setItem("token", payload.token);
      if (payload.user?.ID) localStorage.setItem("ID", String(payload.user.ID));

      // ดึง returnTo จาก sessionStorage ก่อน → ถ้าไม่มีค่อยไปดู localStorage
      let returnTo = sessionStorage.getItem("returnTo") || localStorage.getItem("returnTo");

      if (returnTo) {
        sessionStorage.removeItem("returnTo");
        localStorage.removeItem("returnTo");
        navigate(returnTo, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (e: any) {
      const err = e?.response?.data?.error ?? "เข้าสู่ระบบไม่สำเร็จ";
      messageApi.error(err);
    }
  };

  // ---- LOAD GENDERS ----
  const onGetGender = async () => {
    try {
      const res = await genderAPI.getAll(); 
      const list = Array.isArray(res) ? res : [];

      const normalized: GenderInterface[] = list.map((g: any) => ({
        ID: g.ID,
        code: g.code,
        name: g.name
      }));
      setGenders(normalized);
    } catch (e: any) {
      messageApi.error("ไม่พบข้อมูลเพศ");
    }
  };

  // ---- REGISTER ----
  const onFinishRegister = async (values: any) => {
    // แปลงค่า form -> payload ที่ BE ต้องการ
  const payload: CreateUserRequest = {
    username: values.username, // 
    password: values.password,
    first_name: values.first_name,
    last_name: values.last_name,
    date_of_birth: values.birthday?.format?.("YYYY-MM-DD") ?? values.birthday,
    email: values.email,
    phone: values.phone_number,
    gender_id: values.gender_id,
  };

    try {
      await authAPI.signUp(payload);
      messageApi.success("สมัครสมาชิกสำเร็จ, กำลังเข้าสู่ระบบ...");

      // Automatically log the user in after successful registration
      await onFinishLogin({
        username: payload.username,
        password: payload.password,
      });

    } catch (e: any) {
      const err = e?.response?.data?.error ?? "สมัครสมาชิกไม่สำเร็จ";
      messageApi.error(err);
    }
  };

  useEffect(() => {
    onGetGender();

    const prefillDataString = sessionStorage.getItem('signupPrefillData');
    if (prefillDataString) {
      try {
        const prefillData = JSON.parse(prefillDataString);
        
        registerForm.setFieldsValue({
          first_name: prefillData.first_name,
          last_name: prefillData.last_name,
          email: prefillData.email,
          phone_number: prefillData.phone,
        });

        setIsLoginActive(false);

        sessionStorage.removeItem('signupPrefillData');
      } catch (error) {
        console.error("Error parsing or using prefill data:", error);
      }
    }
  }, []);

  return (
    <>
      {contextHolder}
      <div className={`container ${!isLoginActive ? "active" : ""}`}>
        {/* ฟอร์มลงทะเบียน */}
        <div className="form-container sign-up">
          <Form form={registerForm} onFinish={onFinishRegister} layout="vertical">
            <div className="logo-box">
              <img src={logo} alt="logo" className="logo-img" />
            </div>
            <h1>สร้างบัญชี</h1>

            <div className="name">
              <div className="fn">
                <Form.Item
                  label="ชื่อจริง"
                  name="first_name"
                  rules={[{ required: true, message: "กรุณากรอกชื่อ !" }]}
                >
                  <Input placeholder="ชื่อจริง" />
                </Form.Item>
              </div>
              <div className="ln">
                <Form.Item
                  label="นามสกุล"
                  name="last_name"
                  rules={[{ required: true, message: "กรุณากรอกนามสกุล !" }]}
                >
                  <Input placeholder="นามสกุล" />
                </Form.Item>
              </div>
            </div>

            <div className="tel-birth-gender">
              <div className="gender">
                <Form.Item
                  label="เพศ"
                  className="gen"
                  name="gender_id"
                  rules={[{ required: true, message: "กรุณาเลือกเพศ !" }]}
                >
                  <Select placeholder="เพศ">
                    {genders.map((gender) => (
                      <Select.Option value={gender.ID} key={gender.ID}>
                        {gender.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              <div className="birth">
                <Form.Item
                  label="วัน/เดือน/ปี เกิด"
                  name="birthday"
                  rules={[{ required: true, message: "กรุณาเลือกวันเกิด !" }]}
                >
                  <DatePicker placeholder="วันเกิด" />
                </Form.Item>
              </div>

              <div className="tel">
                <Form.Item
                  label="เบอร์โทรศัพท์"
                  name="phone_number"
                  rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์ !" }]}
                >
                  <Input placeholder="เบอร์โทรศัพท์" />
                </Form.Item>
              </div>
            </div>
            <div className="username">
              <Form.Item
                label="ชื่อผู้ใช้ (Username)"
                name="username"
                rules={[
                  { required: true, message: "กรุณากรอกชื่อผู้ใช้!" },
                  { min: 4, message: "อย่างน้อย 4 ตัวอักษร" },
                  { pattern: /^[a-zA-Z0-9._-]+$/, message: "ใช้ได้เฉพาะ a-z, 0-9, จุด, ขีดกลาง, ขีดล่าง" },
                ]}
                normalize={(v) => (typeof v === "string" ? v.trim() : v)}
                hasFeedback
              >
                <Input placeholder="ชื่อผู้ใช้" autoComplete="username" />
              </Form.Item>
            </div>
            <div className="mail">
              <Form.Item
                label="อีเมล"
                className="email"
                name="email"
                rules={[{ type: "email", required: true, message: "กรุณากรอกอีเมล !" }]}
              >
                <Input placeholder="อีเมล" />
              </Form.Item>
            </div>

            <div className="password">
              <Form.Item
                label="รหัสผ่าน"
                className="i-form"
                name="password"
                rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน !" }]}
              >
                <Input.Password placeholder="รหัสผ่าน" />
              </Form.Item>
            </div>

            <div className="btn">
              <Button className="btn1" htmlType="submit">
                สมัครสมาชิก
              </Button>
              <Button className="btn2" onClick={() => handleToggleForm(true)}>
                ลงชื่อเข้าใช้
              </Button>
            </div>
          </Form>
        </div>

        {/* ฟอร์มลงชื่อเข้าใช้ */}
        <div className="form-container sign-in">
          <div className="logo-box">
            <img src={logo} alt="logo" className="logo-img" />
          </div>

          <Form form={loginForm} onFinish={onFinishLogin} layout="vertical">
            <h1>ลงชื่อเข้าใช้</h1>

            <Form.Item
              label="ชื่อผู้ใช้"
              className="i-form"
              name="username"
              rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}
            >
              <Input placeholder="ชื่อผู้ใช้" />
            </Form.Item>

            <Form.Item
              label="รหัสผ่าน"
              className="i-form"
              name="password"
              rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}
            >
              <Input.Password placeholder="รหัสผ่าน" />
            </Form.Item>

            <a href="#">ลืมรหัสผ่าน?</a>
            <div className="btn">
              <Button className="btn1" htmlType="submit">
                เข้าสู่ระบบ
              </Button>
              <Button className="btn2" onClick={() => handleToggleForm(false)}>
                สมัครสมาชิก
              </Button>
            </div>
          </Form>
        </div>

        {/* สลับฟอร์ม */}
        <div className="toggle-container">
          <div className="toggle"></div>
        </div>
      </div>
    </>
  );
}

export default AuthPage;
