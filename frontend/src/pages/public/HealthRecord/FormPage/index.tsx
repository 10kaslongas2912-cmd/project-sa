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
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { HealthRecord } from '../../../../interfaces/HealthRecord';
import { healthRecordAPI } from '../../../../services/apis';

const { Title } = Typography;
const { TextArea } = Input;

const FormPage: React.FC = () => {
  const { dogId, recordId } = useParams<{ dogId: string; recordId?: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!dogId || isNaN(parseInt(dogId))) {
      message.error('รหัสสุนัขไม่ถูกต้อง');
      navigate('/health-record/search');
      return;
    }

    if (recordId && !isNaN(parseInt(recordId))) {
      setIsEditMode(true);
      fetchRecordForEdit();
    } else {
      // Initialize form for new record
      form.resetFields();
      form.setFieldsValue({
        recordDate: dayjs(),
        vaccination: undefined,
      });
    }
  }, [recordId, dogId, form]);

  const fetchRecordForEdit = async () => {
    if (!recordId) return;

    setLoading(true);
    try {
      const record = await healthRecordAPI.getHealthRecordById(parseInt(recordId));
      form.setFieldsValue({
        ...record,
        recordDate: record.recordDate ? dayjs(record.recordDate) : dayjs(),
        nextAppointment: record.nextAppointment ? dayjs(record.nextAppointment) : null,
        vaccination: record.vaccination || undefined,
      });
    } catch (error) {
      message.error('ไม่สามารถโหลดข้อมูลประวัติสุขภาพสำหรับแก้ไขได้');
      console.error('Fetch record error:', error);
      navigate(`/health-record/dog/${dogId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!dogId) return;

    // Validate required fields
    if (!values.weight || !values.temperature || !values.symptoms || !values.vaccination) {
      message.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setSubmitLoading(true);

    const healthRecord: Omit<HealthRecord, 'MedID' | 'dogName'> = {
      dogId: parseInt(dogId),
      weight: parseFloat(values.weight),
      temperature: parseFloat(values.temperature),
      symptoms: values.symptoms?.trim(),
      diagnosis: values.diagnosis?.trim() || null,
      treatment: values.treatment?.trim() || null,
      medication: values.medication?.trim() || null,
      vaccination: values.vaccination,
      notes: values.notes?.trim() || null,
      recordDate: values.recordDate ? values.recordDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      nextAppointment: values.nextAppointment ? values.nextAppointment.format('YYYY-MM-DD') : null,
    };

    try {
      if (isEditMode && recordId) {
        await healthRecordAPI.updateHealthRecord(parseInt(recordId), { 
          ...healthRecord, 
          MedID: parseInt(recordId), 
          dogName: '' 
        });
        message.success('อัปเดตข้อมูลสุขภาพเรียบร้อยแล้ว');
      } else {
        await healthRecordAPI.createHealthRecord({ 
          ...healthRecord, 
          MedID: 0, 
          dogName: '' 
        });
        message.success('บันทึกข้อมูลสุขภาพเรียบร้อยแล้ว');
      }
      navigate(`/health-record/dog/${dogId}`);
    } catch (error) {
      message.error(
        isEditMode 
          ? 'ไม่สามารถอัปเดตข้อมูลสุขภาพได้' 
          : 'ไม่สามารถบันทึกข้อมูลสุขภาพได้'
      );
      console.error('Submit error:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/health-record/dog/${dogId}`);
  };

  const validateTemperature = (_: any, value: number) => {
    if (value && (value < 35 || value > 45)) {
      return Promise.reject(new Error('อุณหภูมิควรอยู่ระหว่าง 35-45 องศาเซลเซียส'));
    }
    return Promise.resolve();
  };

  const validateWeight = (_: any, value: number) => {
    if (value && value <= 0) {
      return Promise.reject(new Error('น้ำหนักต้องมากกว่า 0 กิโลกรัม'));
    }
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Typography.Text>กำลังโหลดข้อมูล...</Typography.Text>
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
        
        <Title level={2} className="page-title">
          {isEditMode ? 'แก้ไขบันทึกสุขภาพ' : 'บันทึกสุขภาพสุนัข'} - รหัสสุนัข: {dogId}
        </Title>
      </div>

      <Card className="health-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          scrollToFirstError
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="weight"
                label="น้ำหนัก (กก.)"
                rules={[
                  { required: true, message: 'กรุณากรอกน้ำหนัก' },
                  { validator: validateWeight }
                ]}
              >
                <InputNumber 
                  placeholder="12.5" 
                  min={0} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="temperature"
                label="อุณหภูมิ (°C)"
                rules={[
                  { required: true, message: 'กรุณากรอกอุณหภูมิ' },
                  { validator: validateTemperature }
                ]}
              >
                <InputNumber 
                  placeholder="38.2" 
                  min={35} 
                  max={45} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="recordDate"
                label="วันที่บันทึก"
                rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  placeholder="เลือกวันที่"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="อาการที่พบ"
            rules={[
              { required: true, message: 'กรุณากรอกอาการที่พบ' },
              { min: 10, message: 'อาการที่พบควรมีอย่างน้อย 10 ตัวอักษร' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="อธิบายอาการที่พบในสุนัข..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="การวินิจฉัย"
            rules={[
              { min: 5, message: 'การวินิจฉัยควรมีอย่างน้อย 5 ตัวอักษร' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="ผลการวินิจฉัยโรค..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="การรักษา"
            rules={[
              { min: 5, message: 'การรักษาควรมีอย่างน้อย 5 ตัวอักษร' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="วิธีการรักษาที่ให้..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="medication"
                label="ยาที่ให้"
              >
                <Input 
                  placeholder="ชื่อยาและขนาด" 
                  maxLength={200}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="nextAppointment"
                label="นัดหมายครั้งต่อไป"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY"
                  placeholder="เลือกวันที่นัดหมาย"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="vaccination"
                label="การฉีดวัคซีน"
                rules={[{ required: true, message: 'กรุณาเลือกสถานะการฉีดวัคซีน' }]}
              >
                <Select placeholder="เลือกสถานะ">
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
              showCount
              maxLength={300}
            />
          </Form.Item>

          <Form.Item className="submit-section">
            <Space>
              <Button onClick={handleBack} disabled={submitLoading}>
                ยกเลิก
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={submitLoading}
              >
                {isEditMode ? 'อัปเดต' : 'บันทึก'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FormPage;