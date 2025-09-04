import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Modal, Spin } from 'antd';
import type { HealthRecord } from '../../../../interfaces/HealthRecord';
import type { DogInterface } from '../../../../interfaces/Dog';
import { healthRecordAPI, dogAPI } from '../../../../services/apis';
import { Card, Typography, Row, Col, Button, Space } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import "./style.css";

const { Title, Text } = Typography;
const { confirm } = Modal;

const DetailPage: React.FC = () => {
  const { dogId } = useParams<{ dogId: string }>();
  const navigate = useNavigate();
  const [selectedDog, setSelectedDog] = useState<DogInterface | null>(null);
  const [dogHealthRecords, setDogHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  useEffect(() => {
    if (dogId && !isNaN(parseInt(dogId))) {
      fetchDogAndHealthRecords();
    } else {
      message.error('รหัสสุนัขไม่ถูกต้อง');
      navigate('/health-record/search');
    }
  }, [dogId]);

  const fetchDogAndHealthRecords = async () => {
    if (!dogId) return;
    
    setLoading(true);
    try {
      const dogIdNum = parseInt(dogId);
      
      // Fetch both dog details and health records concurrently
      const [dogDetails, records] = await Promise.all([
        dogAPI.getById(dogIdNum),
        healthRecordAPI.getHealthRecordsByDogId(dogId)
      ]);

      setSelectedDog(dogDetails.data);
      setDogHealthRecords(records.data || []);
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลสุนัขหรือประวัติสุขภาพได้');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewHealthRecordDetail = (record: HealthRecord) => {
    if (record.MedID) {
      navigate(`/health-record/record/${record.MedID}`);
    } else {
      message.error('ไม่สามารถเปิดรายละเอียดประวัติสุขภาพได้');
    }
  };

  const handleAddHealthRecord = () => {
    navigate(`/health-record/dog/${dogId}/add`);
  };

  const handleDeleteHealthRecord = (medId: number) => {
    confirm({
      title: 'ยืนยันการลบ',
      icon: <ExclamationCircleOutlined />,
      content: 'คุณแน่ใจหรือไม่ที่จะลบบันทึกสุขภาพนี้? การลบไม่สามารถย้อนกลับได้',
      okText: 'ลบ',
      okType: 'danger',
      cancelText: 'ยกเลิก',
      onOk: () => performDelete(medId),
    });
  };

  const performDelete = async (medId: number) => {
    setDeleteLoading(medId);
    try {
      await healthRecordAPI.deleteHealthRecord(medId);
      message.success('ลบบันทึกสุขภาพเรียบร้อยแล้ว');
      
      // Refresh health records after successful deletion
      if (dogId) {
        const records = await healthRecordAPI.getHealthRecordsByDogId(dogId);
        setDogHealthRecords(records.data || []);
      }
    } catch (error) {
      message.error('ไม่สามารถลบบันทึกสุขภาพได้');
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBack = () => {
    navigate('/health-record/search');
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('th-TH');
    } catch {
      return dateString;
    }
  };

  const truncateText = (text: string | null | undefined, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>กำลังโหลดข้อมูล...</Text>
        </div>
      </div>
    );
  }

  if (!selectedDog) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text type="secondary">ไม่พบข้อมูลสุนัข</Text>
        <div style={{ marginTop: '16px' }}>
          <Button onClick={handleBack}>กลับไปค้นหา</Button>
        </div>
      </div>
    );
  }

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
          รายละเอียดสุขภาพ - {selectedDog.name}
        </Title>
        <div className="title-underline"></div>
      </div>

      <Card className="health-detail-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={selectedDog.photo_url}
            alt={selectedDog.name}
            style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-dog-image.jpg'; // fallback image
            }}
          />
        </div>

        <Title level={3} style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          color: '#ff6600', 
          fontSize: '29px',
          fontFamily: 'Anakotmai-Bold'
        }}>
          ประวัติบันทึกสุขภาพ
        </Title>

        {dogHealthRecords.length === 0 ? (
          <div className="no-records">
            <Text style={{ fontFamily: 'Anakotmai-Bold' }}>
              ไม่พบข้อมูลประวัติสุขภาพสำหรับสุนัขตัวนี้
            </Text>
          </div>
        ) : (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {dogHealthRecords.map((record) => (
              <Card
                key={record.MedID}
                className="health-record-item"
                hoverable
              >
                <Row gutter={[16, 8]} align="middle">
                  <Col span={18}>
                    <div className="record-info">
                      <Text strong style={{ fontFamily: 'Anakotmai-Bold' }}>วันที่บันทึก:</Text> 
                      <Text style={{ fontFamily: 'Anakotmai-Bold' }}> {formatDate(record.recordDate)}</Text><br />
                      
                      <Text strong style={{ fontFamily: 'Anakotmai-Bold' }}>อาการที่พบ:</Text> 
                      <Text style={{ fontFamily: 'Anakotmai-Bold' }}> {truncateText(record.symptoms)}</Text><br />
                      
                      <Text strong style={{ fontFamily: 'Anakotmai-Bold' }}>การฉีดวัคซีน:</Text> 
                      <Text style={{ fontFamily: 'Anakotmai-Bold' }}> {record.vaccination === 'YES' ? 'ฉีดแล้ว' : 'ยังไม่ฉีด'}</Text><br />
                      
                      {record.nextAppointment && (
                        <>
                          <Text strong style={{ fontFamily: 'Anakotmai-Bold' }}>นัดหมายครั้งต่อไป:</Text> 
                          <Text style={{ fontFamily: 'Anakotmai-Bold' }}> {formatDate(record.nextAppointment)}</Text>
                        </>
                      )}
                    </div>
                  </Col>
                  <Col span={6} style={{ textAlign: 'right' }}>
                    <Space>
                      <Button 
                        type="primary" 
                        onClick={() => handleViewHealthRecordDetail(record)}
                        style={{ fontFamily: 'Anakotmai-Bold' }}
                      >
                        ดูรายละเอียดเพิ่มเติม
                      </Button>
                      <Button 
                        danger 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleDeleteHealthRecord(record.MedID)}
                        loading={deleteLoading === record.MedID}
                        style={{ fontFamily: 'Anakotmai-Bold' }}
                      >
                        ลบ
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ))}
          </Space>
        )}

        <Space style={{ marginTop: '30px', width: '100%', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            size="large" 
            onClick={handleAddHealthRecord}
            style={{ fontFamily: 'Anakotmai-Bold' }}
          >
            เพิ่มบันทึกสุขภาพ
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default DetailPage;