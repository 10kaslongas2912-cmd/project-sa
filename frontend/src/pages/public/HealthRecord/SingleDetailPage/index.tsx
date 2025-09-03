import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message } from 'antd';
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
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { HealthRecord } from '../../../../interfaces/HealthRecord';
import { healthRecordAPI } from '../../../../services/apis';

const { Title } = Typography;
const { TextArea } = Input;

const SingleDetailPage: React.FC = () => {
  const { recordId } = useParams<{ recordId: string }>();
  const navigate = useNavigate();
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);

  useEffect(() => {
    if (recordId) {
      const fetchRecord = async () => {
        try {
          const record = await healthRecordAPI.getHealthRecordById(parseInt(recordId));
          setHealthRecord(record);
        } catch (error) {
          message.error('Failed to fetch health record.');
          console.error(error);
        }
      };
      fetchRecord();
    }
  }, [recordId]);

  const handleBack = () => {
    if (healthRecord) {
      navigate(`/health-record/dog/${healthRecord.dogId}`);
    } else {
      navigate(-1);
    }
  };

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
        
        <Title level={2} className="page-title">
          รายละเอียดบันทึกสุขภาพ
        </Title>
      </div>

      <Card className="health-form-card">
        <Form
          layout="vertical"
          initialValues={healthRecord || undefined}
        >
          <Row gutter={16}>
            <Col span={6}>
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
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
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
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recordDate"
                label="วันที่บันทึก"
              >
                <DatePicker style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="อาการที่พบ"
          >
            <TextArea 
              rows={3} 
              placeholder="อธิบายอาการที่พบในสุนัข..."
              readOnly
            />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="การวินิจฉัย"
          >
            <TextArea 
              rows={3} 
              placeholder="ผลการวินิจฉัยโรค..."
              readOnly
            />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="การรักษา"
          >
            <TextArea 
              rows={3} 
              placeholder="วิธีการรักษาที่ให้..."
              readOnly
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medication"
                label="ยาที่ให้"
              >
                <Input placeholder="ชื่อยาและขนาด" readOnly />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextAppointment"
                label="นัดหมายครั้งต่อไป"
              >
                <DatePicker style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="vaccination"
                label="การฉีดวัคซีน"
              >
                <Select placeholder="เลือกสถานะ" disabled>
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
              rows={2} 
              placeholder="บันทึกเพิ่มเติม..."
              readOnly
            />
          </Form.Item>

          <Form.Item className="submit-section">
            <Space>
              <Button onClick={handleBack}>ย้อนกลับ</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SingleDetailPage;