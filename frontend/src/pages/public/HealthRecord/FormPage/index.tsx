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

const FormPage: React.FC = () => {
  const { dogId, recordId } = useParams<{ dogId: string; recordId?: string }>();
  const navigate = useNavigate();

  const [form] = Form.useForm();

  useEffect(() => {
    if (recordId) {
      // Fetch initial values for editing
      const fetchRecord = async () => {
        try {
          const record = await healthRecordAPI.getHealthRecordById(parseInt(recordId));
          form.setFieldsValue({
            ...record,
            recordDate: record.recordDate ? dayjs(record.recordDate) : undefined,
            nextAppointment: record.nextAppointment ? dayjs(record.nextAppointment) : undefined,
            vaccination: record.vaccination || undefined,
          });
        } catch (error) {
          message.error('Failed to fetch health record for editing.');
          console.error(error);
        }
      };
      fetchRecord();
    } else {
      form.resetFields();
      form.setFieldsValue({
        recordDate: dayjs(),
      });
    }
  }, [recordId, form]);

  const handleSubmit = async (values: any) => {
    if (!dogId) return;

    const healthRecord: Omit<HealthRecord, 'MedID' | 'dogName'> = {
      dogId: parseInt(dogId),
      weight: values.weight,
      temperature: values.temperature,
      symptoms: values.symptoms,
      diagnosis: values.diagnosis,
      treatment: values.treatment,
      medication: values.medication,
      vaccination: values.vaccination,
      notes: values.notes,
      recordDate: values.recordDate,
      nextAppointment: values.nextAppointment,
    };

    try {
      if (recordId) {
        await healthRecordAPI.updateHealthRecord(parseInt(recordId), { ...healthRecord, MedID: parseInt(recordId), dogName: '' });
        message.success('อัปเดตข้อมูลสุขภาพเรียบร้อยแล้ว');
      } else {
        await healthRecordAPI.createHealthRecord({ ...healthRecord, MedID: 0, dogName: '' });
        message.success('บันทึกข้อมูลสุขภาพเรียบร้อยแล้ว');
      }
      navigate(`/health-record/dog/${dogId}`);
    } catch (error) {
      message.error('Failed to save health record.');
      console.error(error);
    }
  };

  const handleBack = () => {
    navigate(`/health-record/dog/${dogId}`);
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
          {recordId ? 'แก้ไขบันทึกสุขภาพ' : 'บันทึกสุขภาพสุนัข'} - {dogId}
        </Title>
      </div>

      <Card className="health-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="weight"
                label="น้ำหนัก (กก.)"
                rules={[{ required: true, message: 'กรุณากรอกน้ำหนัก' }]}
              >
                <InputNumber 
                  placeholder="12.5" 
                  min={0} 
                  step={0.1} 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="temperature"
                label="อุณหภูมิ (°C)"
                rules={[{ required: true, message: 'กรุณากรอกอุณหภูมิ' }]}
              >
                <InputNumber 
                  placeholder="38.2" 
                  min={35} 
                  max={45} 
                  step={0.1} 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recordDate"
                label="วันที่บันทึก"
                rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="อาการที่พบ"
            rules={[{ required: true, message: 'กรุณากรอกอาการที่พบ' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="อธิบายอาการที่พบในสุนัข..."
            />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="การวินิจฉัย"
          >
            <TextArea 
              rows={3} 
              placeholder="ผลการวินิจฉัยโรค..."
            />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="การรักษา"
          >
            <TextArea 
              rows={3} 
              placeholder="วิธีการรักษาที่ให้..."
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medication"
                label="ยาที่ให้"
              >
                <Input placeholder="ชื่อยาและขนาด" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextAppointment"
                label="นัดหมายครั้งต่อไป"
              >
                <DatePicker style={{ width: '100%' }} />
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
            />
          </Form.Item>

          <Form.Item className="submit-section">
            <Space>
              <Button onClick={handleBack}>ยกเลิก</Button>
              <Button type="primary" htmlType="submit" size="large">บันทึก</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default FormPage;