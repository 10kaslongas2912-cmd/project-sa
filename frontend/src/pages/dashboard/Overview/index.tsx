import React, { useEffect, useState } from "react";
import { Card, Typography, Row, Col, List, Tag, Spin, message } from "antd";
import { 
  HomeOutlined, 
  HeartOutlined, 
  DollarOutlined, 
  GiftOutlined,
  MedicineBoxOutlined,
  TeamOutlined
} from "@ant-design/icons";
import type { DashboardStats, RecentUpdate } from "../../../interfaces/Dashboard";
import { api } from "../../../services/apis";
import "./style.css";

const OverviewPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await api.dashboardAPI.getStats();
      setStats(statsResponse.data);

      // Fetch recent updates
      const updatesResponse = await api.dashboardAPI.getRecentUpdates();
      setRecentUpdates(updatesResponse.data);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error("ไม่สามารถโหลดข้อมูล Dashboard ได้");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('th-TH').format(num);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTagColor = (tag: string): string => {
    switch (tag.toLowerCase()) {
      case 'health': return 'green';
      case 'adoption': return 'blue';
      case 'cage': return 'orange';
      case 'sponsorship': return 'purple';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="overview-loading">
        <Spin size="large" />
        <Typography.Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
          กำลังโหลดข้อมูล...
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="overview">
      <Typography.Title level={2} className="ov-title">
        ภาพรวมของสถานรับเลี้ยงสุนัข
      </Typography.Title>
      <Typography.Paragraph className="ov-sub">
        สรุปสถิติและข้อมูลสำคัญของสถานรับเลี้ยงสุนัข
      </Typography.Paragraph>

      {/* สถิติหลัก */}
      <section className="ov-stats">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card shelter">
              <div className="stat-icon">
                <HomeOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats ? formatNumber(stats.dogs_in_shelter) : '0'}
                </div>
                <div className="stat-label">สุนัขในสถานรับเลี้ยง</div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card adopted">
              <div className="stat-icon">
                <HeartOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats ? formatNumber(stats.dogs_adopted) : '0'}
                </div>
                <div className="stat-label">สุนัขที่ถูกรับเลี้ยง</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card money">
              <div className="stat-icon">
                <DollarOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats ? formatCurrency(stats.total_money_donated) : '฿0'}
                </div>
                <div className="stat-label">เงินบริจาคทั้งหมด</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card items">
              <div className="stat-icon">
                <GiftOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats ? formatNumber(stats.total_items_donated) : '0'}
                </div>
                <div className="stat-label">สิ่งของที่ได้รับบริจาค</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* สถิติเพิ่มเติม */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card vaccination">
              <div className="stat-icon">
                <MedicineBoxOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats ? formatNumber(stats.vaccinations_given) : '0'}
                </div>
                <div className="stat-label">วัคซีนที่ฉีดแล้ว</div>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card sponsored">
              <div className="stat-icon">
                <TeamOutlined />
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats ? formatNumber(stats.dogs_sponsored) : '0'}
                </div>
                <div className="stat-label">สุนัขที่ถูกอุปถัมภ์</div>
              </div>
            </Card>
          </Col>
        </Row>
      </section>

      {/* อัปเดตล่าสุด */}
      <section className="ov-recent">
        <Card title="อัปเดตล่าสุด" className="recent-updates-card">
          {recentUpdates.length > 0 ? (
            <List
              dataSource={recentUpdates}
              renderItem={(update) => (
                <List.Item className="recent-update-item">
                  <List.Item.Meta
                    title={<strong>{update.dog_name}</strong>}
                    description={
                      <div>
                        <div className="update-note">{update.note}</div>
                        <div className="update-time">
                          {new Date(update.updated_at).toLocaleString('th-TH')}
                        </div>
                      </div>
                    }
                  />
                  <Tag color={getTagColor(update.tag)} className="update-tag">
                    {update.tag}
                  </Tag>
                </List.Item>
              )}
            />
          ) : (
            <div className="no-updates">
              <Typography.Text type="secondary">
                ยังไม่มีการอัปเดตล่าสุด
              </Typography.Text>
            </div>
          )}
        </Card>
      </section>
    </div>
  );
};

export default OverviewPage;