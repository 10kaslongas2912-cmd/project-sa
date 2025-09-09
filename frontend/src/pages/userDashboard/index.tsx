import React, { useState } from 'react';
import { Layout, Menu, Typography, Tabs, Empty, Card } from 'antd';
import {
  HistoryOutlined,
  HeartOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import MyDonations from '../userDashboard/HistoryDonation'; // <- ใช้ไฟล์ที่ทำไว้ก่อนหน้า
import './style.css';

const { Sider, Content, Header } = Layout;
const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

type MenuKey = 'donations' | 'sponsorship' | 'adoption';

const SponsorshipPlaceholder: React.FC = () => (
  <Card className="db-card">
    <Tabs defaultActiveKey="tab1" size="large" style={{ fontFamily: 'Anakotmai' }}>
      <TabPane tab="ภาพรวม" key="tab1" >
        <Empty description="หน้านี้กำลังพัฒนา (ประวัติการอุปถัมภ์)" />
      </TabPane>
      <TabPane tab="รายละเอียด" key="tab2" >
        <Empty description="หน้านี้กำลังพัฒนา (รายละเอียดอุปถัมภ์)" />
      </TabPane>
    </Tabs>
  </Card>
);

const AdoptionPlaceholder: React.FC = () => (
  <Card className="db-card">
    <Tabs defaultActiveKey="tab1" size="large" style={{ fontFamily: 'Anakotmai' }}>
      <TabPane tab="ภาพรวม" key="tab1">
        <Empty description={<span style={{ fontFamily: 'Anakotmai' }}>หน้านี้กำลังพัฒนา (การรับเลี้ยง)</span>} />
      </TabPane>
      <TabPane tab={<span style={{ fontFamily: 'Anakotmai' }}>สถานะคำขอ</span>} key="tab2">
        <Empty description="หน้านี้กำลังพัฒนา (สถานะการรับเลี้ยง)" />
      </TabPane>
    </Tabs>
  </Card>
);

const DonationsDashboard: React.FC = () => {
  const [activeKey, setActiveKey] = useState<MenuKey>('donations');

  const renderContent = () => {
    switch (activeKey) {
      case 'donations':
        return <MyDonations />;
      case 'sponsorship':
        return (
          <>
            <div className="db-page-title">
              <Title level={2} className="db-title" style={{ fontFamily: 'Anakotmai' }}>ประวัติการอุปถัมภ์</Title>
              <Paragraph className="db-sub" style={{ fontFamily: 'Anakotmai' }}>จัดทำเป็นแท็บไว้ก่อน รอพัฒนา</Paragraph>
              <div className="db-underline" />
            </div>
            <SponsorshipPlaceholder />
          </>
        );
      case 'adoption':
        return (
          <>
            <div className="db-page-title">
              <Title level={2} className="db-title" style={{ fontFamily: 'Anakotmai' }}>การรับเลี้ยง</Title>
              <Paragraph className="db-sub" style={{ fontFamily: 'Anakotmai' }}>จัดทำเป็นแท็บไว้ก่อน รอพัฒนา</Paragraph>
              <div className="db-underline" />
            </div>
            <AdoptionPlaceholder />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout className="db-root" style={{ fontFamily: 'Anakotmai' }}>
      <Sider className="db-sider" width={240} breakpoint="lg" collapsedWidth={72}>
        <div className="db-brand">
          <div className="db-logo-dot" /> <span>Donor Center</span>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[activeKey]}
          onClick={(e) => setActiveKey(e.key as MenuKey)}
          className="db-menu"
          items={[
            { key: 'donations', icon: <HistoryOutlined />, label: <span style={{ fontFamily: 'Anakotmai' }}>ประวัติการบริจาค</span> },
            { key: 'sponsorship', icon: <HeartOutlined />, label: <span style={{ fontFamily: 'Anakotmai' }}>ประวัติการอุปถัมภ์</span> },
            { key: 'adoption', icon: <TeamOutlined />, label: <span style={{ fontFamily: 'Anakotmai' }}>การรับเลี้ยง</span> },
          ]}
        />
      </Sider>

      <Layout className="db-main">
        <Header className="db-header">
          <Title level={3} className="db-header-title" style={{ fontFamily: 'Anakotmai' }}>Orders / History</Title>
        </Header>
        <Content className="db-content">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DonationsDashboard;

