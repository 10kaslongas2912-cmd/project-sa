import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin } from 'antd';
import { 
  Form, 
  Input, 
  Button, 
  DatePicker, 
  InputNumber,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Select,
  Descriptions,
} from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { HealthRecord } from '../../../../interfaces/HealthRecord';
import { healthRecordAPI } from '../../../../services/apis';

const { Title, Text } = Typography;
const { TextArea } = Input;

const SingleDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recordId && !isNaN(parseInt(recordId))) {
      fetchRecord();
    } else {
      message.error('รหัสประวัติสุขภาพไม่ถูกต้อง');
      navigate(-1);
    }
  }, [recordId]);

  const fetchRecord = async () => {
    if (!recordId) return;

    setLoading(true);
    try {
      const record = await healthRecordAPI.getHealthRecordById(parseInt(recordId));
      setHealthRecord(record);
      
      // Set form values after data fetch
      form.setFieldsValue({
        ...record,
        recordDate: record.recordDate ? dayjs(record.recordDate) : null,
        nextAppointment: record.nextAppointment ? dayjs(record.nextAppointment) : null,
        vaccination: record.vaccination || undefined,
      });
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลประวัติสุขภาพได้');
      console.error('Fetch record error:', error);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (healthRecord && healthRecord.dog_id) {
      navigate(`/health-record/dog/${healthRecord.dog_id}`);
    } else {
      navigate(-1);
    }
  };

  const handleEdit = () => {
    if (healthRecord && healthRecord.dog_id && healthRecord.ID) {
      navigate(`/health-record/dog/${healthRecord.dog_id}/edit/${healthRecord.ID}`);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    try {
      return dayjs(dateString).format('DD/MM/YYYY');
    } catch {
      return dateString;
    }
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

  if (!healthRecord) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Text type="secondary">ไม่พบข้อมูลประวัติสุขภาพ</Text>
        <div style={{ marginTop: '16px' }}>
          <Button onClick={handleBack}>ย้อนกลับ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="health-form-page">
      <div className="form-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          className="back-button"
        >
          ย้อนกลับ
        </Button>

        <Title level={2} className="page-title" style={{ fontFamily: 'Anakotmai',marginTop: '70px',marginLeft: '30px',color: '#ff6600' }}>
          รายละเอียดบันทึกสุขภาพ
        </Title>
      </div>

      <Card className="health-form-card">
        {/* Summary Information */}
        <div style={{ marginBottom: '24px' }}>
          <Descriptions title="ข้อมูลทั่วไป" bordered column={2}>
            <Descriptions.Item label="รหัสประวัติ">{healthRecord.ID}</Descriptions.Item>
            <Descriptions.Item label="รหัสสุนัข">{healthRecord.dog_id}</Descriptions.Item>
            <Descriptions.Item label="วันที่บันทึก">{formatDate(healthRecord.date_record)}</Descriptions.Item>
            <Descriptions.Item label="การฉีดวัคซีน">
              <span style={{ 
                color: healthRecord.vaccination === 'YES' ? '#52c41a' : '#ff4d4f',
                fontWeight: 'bold'
              }}>
                {healthRecord.vaccination === 'YES' ? 'ฉีดแล้ว' : 'ยังไม่ฉีด'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="น้ำหนัก">{healthRecord.weight} กก.</Descriptions.Item>
            <Descriptions.Item label="อุณหภูมิ">{healthRecord.temperature} °C</Descriptions.Item>
          </Descriptions>
        </div>

        {/* Detailed Form View */}
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="weight"
                label="น้ำหนัก (กก.)"
              >
                <InputNumber 
                  placeholder="12.5" 
                  min={0} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  readOnly
                  bordered={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="temperature"
                label="อุณหภูมิ (°C)"
              >
                <InputNumber 
                  placeholder="38.2" 
                  min={35} 
                  max={45} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  readOnly
                  bordered={false}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="recordDate"
                label="วันที่บันทึก"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  disabled 
                  format="DD/MM/YYYY"
                  bordered={false}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="อาการที่พบ"
          >
            <TextArea 
              rows={4} 
              placeholder="ไม่มีข้อมูล"
              readOnly
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="การวินิจฉัย"
          >
            <TextArea 
              rows={4} 
              placeholder="ไม่มีข้อมูล"
              readOnly
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="การรักษา"
          >
            <TextArea 
              rows={4} 
              placeholder="ไม่มีข้อมูล"
              readOnly
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={24}>
              <Form.Item
                name="medication"
                label="ยาที่ให้"
              >
                <Input 
                  placeholder="ไม่มีข้อมูล" 
                  readOnly 
                  bordered={false}
                  style={{ backgroundColor: '#fafafa' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="vaccination"
                label="การฉีดวัคซีน"
              >
                <Select 
                  placeholder="ไม่มีข้อมูล" 
                  disabled
                  bordered={false}
                  style={{ backgroundColor: '#fafafa' }}
                >
                  <Select.Option value="YES">ฉีดแล้ว</Select.Option>
                  <Select.Option value="NO">ยังไม่ฉีด</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="หมายเหตุเพิ่มเติม"
          >
            <TextArea 
              rows={3} 
              placeholder="ไม่มีหมายเหตุเพิ่มเติม"
              readOnly
              bordered={false}
              style={{ backgroundColor: '#fafafa' }}
            />
          </Form.Item>

          <Form.Item className="submit-section">
            <Space size="large">
              <Button onClick={handleBack} size="large">
                ย้อนกลับ
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={handleEdit}
                size="large"
              >
                แก้ไขข้อมูล
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SingleDetailPage;