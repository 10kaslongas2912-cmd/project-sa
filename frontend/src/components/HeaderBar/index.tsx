import React from "react";
import { Badge, Avatar, Dropdown, type MenuProps, Modal } from "antd";
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import logo from "../../assets/logo.png";         // โลโก้ของคุณ
import profileImg from "../../assets/react.svg"; // รูปโปรไฟล์ (ถ้าไม่มี ลบ prop src ออกได้)
import "./style.css";

const HeaderBar: React.FC = () => {
  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      Modal.confirm({
        title: "ออกจากระบบ?",
        content: "คุณต้องการออกจากระบบตอนนี้หรือไม่",
        okText: "Logout",
        okButtonProps: { danger: true, icon: <LogoutOutlined /> },
        cancelText: "Cancel",
        onOk: () => {
          // TODO: ใส่ logic logout ของคุณ เช่น clear token / redirect
          console.log("Logged out");
        },
      });
    } else if (key === "profile") {
      // TODO: ไปหน้าโปรไฟล์
      console.log("go to profile");
    } else if (key === "settings") {
      // TODO: ไปหน้าตั้งค่า
      console.log("go to settings");
    }
  };

  const menuItems: MenuProps["items"] = [
    { key: "profile", icon: <ProfileOutlined />, label: "My Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Settings" },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: <span style={{ color: "#ff4d4f" }}>Logout</span>,
    },
  ];

  return (
    <header className="header">
      <div className="header-left">
        <img src={logo} className="logo" alt="logo" />
      </div>

      <div className="header-right">
        <Badge dot offset={[-2, 2]}>
          <BellOutlined className="icon-btn" />
        </Badge>

        <Dropdown
          menu={{ items: menuItems, onClick: onMenuClick }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button className="profile-btn" aria-label="Open profile menu">
            <Avatar
              size={36}
              src={profileImg}                 // ถ้าไม่มีรูป ลบบรรทัดนี้ได้
              icon={<UserOutlined />}          // fallback icon
            />
            <div className="profile-meta">
              <span className="name">SA EXAMPLE </span>
              <span className="role">Staff</span>
            </div>
          </button>
        </Dropdown>
      </div>
    </header>
  );
};

export default HeaderBar;
