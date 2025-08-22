import React from "react";
import { Card, Typography, Row, Col, List, Tag } from "antd";
import "./style.css";

const OverviewPage: React.FC = () => {
  return (
    <div className="overview">
      <Typography.Title level={2} className="ov-title">Overview</Typography.Title>
      <Typography.Paragraph className="ov-sub">
        Summary of the shelter status, quick stats, and latest updates.
      </Typography.Paragraph>

      {/* div3: สถิติ/ภาพรวม */}
      <section className="ov-stats">
        <Row gutter={[16,16]}>
          <Col xs={24} sm={12} lg={6}><Card className="stat"><div className="k">128</div><div className="l">Dogs in shelter</div></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="stat"><div className="k">42</div><div className="l">Ready for adoption</div></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="stat"><div className="k">31</div><div className="l">Sponsored</div></Card></Col>
          <Col xs={24} sm={12} lg={6}><Card className="stat"><div className="k">7</div><div className="l">Visits today</div></Card></Col>
        </Row>
      </section>

      {/* div4: อัปเดตล่าสุด */}
      <section className="ov-recent">
        <Card title="Recent Updates">
          <List
            dataSource={[
              { dog:"Lucky",  note:"Vaccination completed",  tag:"Health" },
              { dog:"Milo",   note:"Moved to Cage B2",       tag:"Cage" },
              { dog:"Bella",  note:"New adoption request",   tag:"Adoption" },
              { dog:"Rocky",  note:"Weekly checkup done",    tag:"Health" },
            ]}
            renderItem={(it) => (
              <List.Item>
                <List.Item.Meta
                  title={<b>{it.dog}</b>}
                  description={it.note}
                />
                <Tag>{it.tag}</Tag>
              </List.Item>
            )}
          />
        </Card>
      </section>
    </div>
  );
};

export default OverviewPage;
