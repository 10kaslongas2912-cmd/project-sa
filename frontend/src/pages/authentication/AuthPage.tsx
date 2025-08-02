// src/pages/auth/AuthPage.tsx

import { useState, useEffect } from 'react';
import { Button, Form, Input, message, DatePicker, Select } from "antd";
import { useNavigate } from 'react-router-dom';
import { SignIn, CreateUser, GetGender } from "../../services/https";
import type { SignInInterface } from "../../interfaces/SignIn";
import type { UsersInterface } from "../../interfaces/IUser";
import type { GenderInterface } from "../../interfaces/Gender";
import './LoginPage.css'; // <-- CSS สำหรับ Animation
import logo from "../../assets/logo.png";
function AuthPage() {
  const [isLoginActive, setIsLoginActive] = useState(true);
  const [gender, setGender] = useState<GenderInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // --- Logic ของ Login เดิม ---
  const onFinishLogin = async (values: SignInInterface) => {
    const res = await SignIn(values);
    if (res.status === 200) {
      messageApi.success("Sign-in successful");
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("id", res.data.id);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  // --- Logic ของ Register เดิม ---
  const onGetGender = async () => {
    const res = await GetGender();
    if (res.status === 200) {
      setGender(res.data);
    } else {
      messageApi.error("ไม่พบข้อมูลเพศ");
    }
  };

  const onFinishRegister = async (values: UsersInterface) => {
    const res = await CreateUser(values);
    if (res.status === 201) {
      messageApi.success(res.data.message);
      setTimeout(() => {
        setIsLoginActive(true); // กลับไปหน้า Login หลังสมัครสมาชิกสำเร็จ
      }, 2000);
    } else {
      messageApi.error(res.data.error);
    }
  };

  useEffect(() => {
    onGetGender();
  }, []);

  return (
    <>
      {contextHolder}
      <div className={`container ${!isLoginActive ? 'active' : ''}`}>
        
        {/* ส่วนฟอร์มลงทะเบียน */}
        <div className="form-container sign-up">
          <Form onFinish={onFinishRegister} layout="vertical">
            <div className="logo-box">
              <img src={logo} alt="logo" className = "logo-img" />
            </div>
            <h1>สร้างบัญชี</h1>
            <div className="name">
              <div className="fn">
                <h4>ชื่อจริง</h4>
                <Form.Item name="first_name" rules={[{ required: true, message: "กรุณากรอกชื่อ !" }]}>
                  <Input placeholder="ชื่อจริง" />
                </Form.Item>
              </div>
              <div className="ln">
                <h4>นามสกุล</h4>
                <Form.Item name="last_name" rules={[{ required: true, message: "กรุณากรอกนามสกุล !" }]}>
                  <Input placeholder="นามสกุล" />
                </Form.Item>
              </div>
            </div>
            <div className="tel-birth-gender">
              <div className="gender">
                <h4>เพศ</h4>
                <Form.Item className='gen'name="gender_id" rules={[{ required: true, message: "กรุณาเลือกเพศ !" }]}>
                  <Select placeholder="เพศ" style={{ width: "100%"}}>
                    {gender?.map((item) => (
                      <Select.Option value={item?.ID} key={item?.ID}>
                        {item?.gender}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="birth">
                <h4>วัน/เดือน/ปี เกิด</h4>
                <Form.Item name="birthday" rules={[{ required: true, message: "กรุณาเลือกวันเกิด !" }]}>
                  <DatePicker style={{ width: "100%" }} placeholder="วันเกิด" />
                </Form.Item>
              </div>
              <div className="tel">
                <h4>เบอร์โทรศัพท์</h4>
                <Form.Item name="phone_number" rules={[{ required: true, message: "กรุณากรอกเบอร์โทรศัพท์ !" }]}>
                  <Input placeholder="เบอร์โทรศัพท์" />
                </Form.Item>
              </div>
            </div>
            <div className="mail">
              <h4>อีเมล</h4>
              <Form.Item className='email'name="email" rules={[{ type: "email", required: true, message: "กรุณากรอกอีเมล !" }]}>
                <Input placeholder="อีเมล" />
              </Form.Item>
            </div>
            <div className="password">
              <h4>รหัสผ่าน</h4>
              <Form.Item className='i-form' name="password" rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน !" }]}>
                <Input.Password placeholder="รหัสผ่าน" />
              </Form.Item>
            </div>
            <div className="btn">
              <Button className='btn1' htmlType="submit">สมัครสมาชิก</Button>
              <Button className='btn2' onClick={() => setIsLoginActive(true)}>
                  ลงชื่อเข้าใช้
              </Button>

            </div>
          </Form>
        </div>

        {/* ส่วนฟอร์มลงชื่อเข้าใช้ */}
        <div className="form-container sign-in">
          <div className="logo-box">
            <img src={logo} alt="logo" className = "logo-img" />
          </div>
          <Form onFinish={onFinishLogin} layout="vertical">
            <h1>ลงชื่อเข้าใช้</h1>
            <Form.Item className = "i-form" name="username" rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้!" }]}>
              <Input placeholder="ชื่อผู้ใช้" />
            </Form.Item>
            <Form.Item className ="i-form" name="password" rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน!" }]}>
              <Input.Password placeholder="รหัสผ่าน" />
            </Form.Item>
            <a href="#">ลืมรหัสผ่าน?</a>
            <div className='btn'>
              <Button className='btn1'htmlType="submit">เข้าสู่ระบบ</Button>
              <Button className='btn2'onClick={() => setIsLoginActive(false)}>
                สมัครสมาชิก
              </Button>
            </div>
          </Form>
        </div>

        {/* ส่วนสำหรับสลับฟอร์ม (ปุ่มที่มี Animation) */}
        <div className="toggle-container">
          <div className="toggle">
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthPage;