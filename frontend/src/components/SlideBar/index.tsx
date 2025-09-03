// SlideBar.tsx
import React, { useMemo, useState } from "react";
import { Layout, Menu, Modal } from "antd";
import type { MenuProps, GetProp } from "antd";
import { HomeOutlined, CalendarOutlined, AppstoreOutlined, LogoutOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;
type MenuItem = GetProp<MenuProps, "items">[number];

const items: MenuItem[] = [
  { key: "home", icon: <HomeOutlined />, label: "Overview" },
  { key: "dogs", icon: <CalendarOutlined />, label: "Dogs" },
  {
    key: "adoption",
    icon: <AppstoreOutlined />,
    label: "Adoption",
    children: [
      { key: "adoption:requests", label: "Requests" },
      { key: "adoption:matches",  label: "Matches"  },
    ],
  },
  { type: "divider" },
  { key: "logout", icon: <LogoutOutlined style={{ color:"#ff4d4f" }}/>, label: <span style={{color:"#ff4d4f"}}>Logout</span> },
];

// map เส้นทาง → key ที่ต้องไฮไลต์ (ครอบคลุมเส้นทางย่อย)
const pathToKey = [
  { test: /^\/dashboard(\/)?$/,               key: "home" },
  { test: /^\/dashboard\/dogs(\/|$)/,         key: "dogs" },
  { test: /^\/dashboard\/adoption\/requests/, key: "adoption:requests" },
  { test: /^\/dashboard\/adoption\/matches/,  key: "adoption:matches"  },
  { test: /^\/dashboard\/adoption(\/|$)/,     key: "adoption" }, // fallback parent
];

const rootSubmenuKeys = ["adoption"];

const SlideBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1) คำนวณ key ที่ต้อง selected จาก pathname
  const selectedKey = useMemo(() => {
    const hit = pathToKey.find(({ test }) => test.test(location.pathname));
    return hit?.key ?? "home";
  }, [location.pathname]);

  // 2) เปิด parent submenu อัตโนมัติตาม selectedKey
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const computedOpenKeys = useMemo(() => {
    const parent = selectedKey.split(":")[0];
    return rootSubmenuKeys.includes(parent) ? [parent] : [];
  }, [selectedKey]);

  const onOpenChange: MenuProps["onOpenChange"] = keys => {
    const latest = keys.find(k => !openKeys.includes(k));
    if (latest && rootSubmenuKeys.includes(latest)) setOpenKeys([latest]);
    else setOpenKeys(keys);
  };

  // 3) นำทางเมื่อคลิก
  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      Modal.confirm({
        title: "ออกจากระบบ?",
        okText: "Logout",
        okButtonProps: { danger: true },
        onOk: () => navigate("/login"),
      });
      return;
    }
    // map key → path
    const keyToPath: Record<string, string> = {
      home: "/dashboard",
      dogs: "/dashboard/dogs",
      "adoption": "/dashboard/adoption",
      "adoption:requests": "/dashboard/adoption/requests",
      "adoption:matches":  "/dashboard/adoption/matches",
    };
    const to = keyToPath[key];
    if (to) navigate(to);
  };

  return (
    <Sider width={260} theme="light" style={{ background:"#f7f7f7", borderRight:"1px solid #eee" }}>
      <Menu
        mode="inline"
        theme="light"
        items={items}
        onClick={onClick}
        selectedKeys={[selectedKey]}
        openKeys={computedOpenKeys.length ? computedOpenKeys : openKeys}
        onOpenChange={onOpenChange}
        style={{ height: "100%", borderInlineEnd: "none" }}
      />
    </Sider>
  );
};

export default SlideBar;
