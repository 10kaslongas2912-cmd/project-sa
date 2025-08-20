import React from 'react';
import { Card, Typography, Row, Col, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { DogInfo, HealthRecord } from '../interface/types';

const { Title, Text } = Typography;

interface DogHealthRecordDetailProps {
  selectedDog: DogInfo;
  healthRecords: HealthRecord[];
  onBack: () => void;
  onViewDetail: (record: HealthRecord) => void;
  onAddRecord: () => void;
  onDeleteRecord: (medId: number) => void; // Added prop for deleting record
}

const DogHealthRecordDetailComponent: React.FC<DogHealthRecordDetailProps> = ({
  selectedDog,
  healthRecords,
  onBack,
  onViewDetail,
  onAddRecord, // Destructure the new prop
}) => {
  return (
    <div className="health-detail-page">
      <div className="form-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
          className="back-button"
        >
          ย้อนกลับ
        </Button>
        <Title level={2} className="page-title">
          รายละเอียดสุขภาพ - {selectedDog?.Name}
        </Title>
      </div>

      <Card className="health-detail-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src={selectedDog.PhotoURL} 
            alt={selectedDog.Name} 
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>

        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px', color: '#ff6600', fontSize: '29px' }}>ประวัติบันทึกสุขภาพ</Title>

        {healthRecords.length === 0 ? (
          <Text>ไม่พบข้อมูลประวัติสุขภาพสำหรับสุนัขตัวนี้</Text>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {healthRecords.map((record) => (
              <Card 
                key={record.MedID} 
                style={{ width: '100%' }}
                hoverable
              >
                <Row gutter={[16, 8]} align="middle">
                  <Col span={18}>
                    <Text strong>วันที่บันทึก:</Text> {record.recordDate}<br/>
                    <Text strong>อาการที่พบ:</Text> {record.symptoms ? record.symptoms.substring(0, 50) + '...' : '-'}<br/>
                    <Text strong>การฉีดวัคซีน:</Text> {record.vaccination === 'YES' ? 'ฉีดแล้ว' : 'ยังไม่ฉีด'}
                  </Col>
                  <Col span={6} style={{ textAlign: 'right' }}>
                    <Space>
                      <Button type="primary" onClick={() => onViewDetail(record)}>ดูรายละเอียดเพิ่มเติม</Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        )}

        <Space style={{ marginTop: '30px', width: '100%', justifyContent: 'center' }}>
          <Button type="primary" onClick={onAddRecord}>เพิ่มบันทึกสุขภาพ</Button> {/* New button */}
        </Space>
      </Card>
    </div>
  );
};

export default DogHealthRecordDetailComponent;
