// src/pages/auth/AuthPage.tsx
import { useState, useEffect } from "react";
import { Button, Form, Input, message, DatePicker, Select } from "antd";
import { useNavigate } from "react-router-dom";

import type { CreateUserRequest,LoginUserRequest, UpdateUserRequest } from "../../interfaces/User"; // แยกเป็น Request ชัดเจน
import type { GenderInterface } from "../../interfaces/Gender";

import { api } from "../../services/api"; // <- ใช้รวม API ที่ไฟล์เดียว
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
      const data = await api.authAPI.logIn(values);
      // data รูปแบบ { data: { token, token_type, user } }
      const payload = data?.data;
      messageApi.success("เข้าสู่ระบบสำเร็จ");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("token_type", payload.token_type);
      localStorage.setItem("token", payload.token);
      if (payload.user?.id) localStorage.setItem("id", String(payload.user.id));

      const returnTo = sessionStorage.getItem("returnTo");
      if (returnTo) {
        sessionStorage.removeItem("returnTo");
        navigate(returnTo);
      } else {
        navigate("/");
      }
    } catch (e: any) {
      const err = e?.response?.data?.error ?? "เข้าสู่ระบบไม่สำเร็จ";
      messageApi.error(err);
    }
  };

  // ---- LOAD GENDERS ----
  const onGetGender = async () => {
    try {
      const res = await api.genderAPI.getAll(); // { data: [...] }
      const list = Array.isArray(res?.data) ? res.data : [];
      // รองรับคีย์หลายแบบ: {id,name} หรือ {ID,gender}
      const normalized: GenderInterface[] = list.map((g: any) => ({
        id: g.id ?? g.ID,
        name: g.name ?? g.gender,
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
      username: values.username ?? values.email, // ถ้าไม่มีช่อง username ใช้อีเมลแทน
      password: values.password,
      firstname: values.first_name,
      lastname: values.last_name,
      date_of_birth: values.birthday?.format?.("YYYY-MM-DD") ?? values.birthday, // DatePicker (dayjs)
      email: values.email,
      phone: values.phone_number,
      gender_id: values.gender_id,
    };
    // เช็คstatus response เผื่อเอาตามจารย์
    // const res = await api.auth.signUp(payload); // ได้ทั้ง AxiosResponse
    // if (res?.status === 201 || res?.status === 200) {
    //   messageApi.success("สมัครสมาชิกสำเร็จ");
    //   handleToggleForm(true);
    // } else {
    //   messageApi.error(res?.data?.error ?? "สมัครสมาชิกไม่สำเร็จ");
    // }
    try {
      const res = await api.authAPI.signUp(payload); // { data: user }
      messageApi.success("สมัครสมาชิกสำเร็จ");
      // กลับไปหน้า Login
      handleToggleForm(true);
    } catch (e: any) {
      const err = e?.response?.data?.error ?? "สมัครสมาชิกไม่สำเร็จ";
      messageApi.error(err);
    }
  };

  useEffect(() => {
    onGetGender();
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
                    {genders.map((item) => (
                      <Select.Option value={item.id} key={item.id}>
                        {item.gender}
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
