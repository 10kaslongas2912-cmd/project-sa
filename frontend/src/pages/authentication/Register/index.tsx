import {
  Button,
  Form,
  Input,
  message,
  DatePicker,
  Select,
} from "antd";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GetGender, CreateUser } from "../../../services/https";
import type { UsersInterface } from "../../../interfaces/IUser";
import logo from "../../../assets/logo.png";
import type { GenderInterface } from "../../../interfaces/Gender";
import './style.css';


function SignUpPages() {

  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [gender, setGender] = useState<GenderInterface[]>([]);

  const onGetGender = async () => {

    const res = await GetGender();
    if (res.status == 200) {
      setGender(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: "ไม่พบข้อมูลเพศ",
      });
    }
  };

  const onFinish = async (values: UsersInterface) => {
    const res = await CreateUser(values);
    if (res.status == 201) {
      messageApi.open({
        type: "success",
        content: res.data.message,
      });
      setTimeout(function () {
        navigate("auth/login");
      }, 2000);
    } else {
      messageApi.open({
        type: "error",
        content: res.data.error,
      });
    }
  };

  useEffect(() => {
    onGetGender();
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
              <p className="signin-link">
                  <Link to = "../Login">เข้าสู่ระบบ</Link>
              </p>

            </Form.Item>

          </Form>

        </div>

      </div>

    </>

  );

}



export default SignUpPages;