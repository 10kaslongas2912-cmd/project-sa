import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from 'antd';
import type { HealthRecord, DogInfo } from '../../../../interfaces/HealthRecord';
import { healthRecordAPI, dogAPI } from '../../../../services/apis';
import { Card, Typography, Row, Col, Button, Space } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const DetailPage: React.FC = () => {
  const { dogId } = useParams<{ dogId: string }>();
  const navigate = useNavigate();
  const [selectedDog, setSelectedDog] = useState<DogInfo | null>(null);
  const [dogHealthRecords, setDogHealthRecords] = useState<HealthRecord[]>([]);

  useEffect(() => {
    if (dogId) {
      const fetchDogAndHealthRecords = async () => {
        try {
          // Fetch dog details
          const dogDetails = await dogAPI.getById(parseInt(dogId));
          setSelectedDog(dogDetails);

          // Fetch health records
          const records = await healthRecordAPI.getHealthRecordsByDogId(dogId);
          setDogHealthRecords(records);
        } catch (error) {
          message.error('Failed to fetch dog details or health records.');
          console.error(error);
        }
      };
      fetchDogAndHealthRecords();
    }
  }, [dogId]);

  const handleViewHealthRecordDetail = (record: HealthRecord) => {
    navigate(`/health-record/record/${record.MedID}`);
  };

  const handleAddHealthRecord = () => {
    navigate(`/health-record/dog/${dogId}/add`);
  };

  const handleDeleteHealthRecord = async (medId: number) => {
    try {
      await healthRecordAPI.deleteHealthRecord(medId);
      message.success('ลบบันทึกสุขภาพเรียบร้อยแล้ว');
      // Refresh health records after successful deletion
      if (dogId) {
        const records = await healthRecordAPI.getHealthRecordsByDogId(dogId);
        setDogHealthRecords(records);
      }
    } catch (error) {
      message.error('Failed to delete health record.');
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate('/health-record/search');
  };

  return (
    <div className="health-detail-page">
      <div className="form-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
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
            src={selectedDog?.PhotoURL}
            alt={selectedDog?.Name}
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
          />
        </div>

        <Title level={3} style={{ textAlign: 'center', marginBottom: '20px', color: '#ff6600', fontSize: '29px' }}>ประวัติบันทึกสุขภาพ</Title>

        {dogHealthRecords.length === 0 ? (
          <Text>ไม่พบข้อมูลประวัติสุขภาพสำหรับสุนัขตัวนี้</Text>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {dogHealthRecords.map((record) => (
              <Card
                key={record.MedID}
                style={{ width: '100%' }}
                hoverable
              >
                <Row gutter={[16, 8]} align="middle">
                  <Col span={18}>
                    <Text strong>วันที่บันทึก:</Text> {record.recordDate}<br />
                    <Text strong>อาการที่พบ:</Text> {record.symptoms ? record.symptoms.substring(0, 50) + '...' : '-'}<br />
                    <Text strong>การฉีดวัคซีน:</Text> {record.vaccination === 'YES' ? 'ฉีดแล้ว' : 'ยังไม่ฉีด'}
                  </Col>
                  <Col span={6} style={{ textAlign: 'right' }}>
                    <Space>
                      <Button type="primary" onClick={() => handleViewHealthRecordDetail(record)}>ดูรายละเอียดเพิ่มเติม</Button>
                      <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteHealthRecord(record.MedID)} />
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        )}

        <Space style={{ marginTop: '30px', width: '100%', justifyContent: 'center' }}>
          <Button type="primary" onClick={handleAddHealthRecord}>เพิ่มบันทึกสุขภาพ</Button> {/* New button */}
        </Space>
      </Card>
    </div>
  );
};

export default DetailPage;