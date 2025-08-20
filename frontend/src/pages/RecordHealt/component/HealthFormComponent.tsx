// src/components/HealthFormComponent.tsx

import React, { useEffect, useState } from 'react';
import './style.css';
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
import type { DogInfo } from '../interface/types';

const { Title } = Typography;
const { TextArea } = Input;

import type { HealthRecord } from '../interface/types';

interface HealthFormProps {
  selectedDog: DogInfo;
  onSubmit: (values: any) => void; // For creating new record
  onBack: () => void;
  initialValues?: HealthRecord;
  onUpdate?: (medId: number, values: HealthRecord) => void; // For updating existing record
  onDelete?: (medId: number) => void; // For deleting existing record
}

const HealthFormComponent: React.FC<HealthFormProps> = ({ selectedDog, onSubmit, onBack, initialValues, onUpdate, onDelete }) => {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(!initialValues); // Start in editing mode if no initial values (new record)

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        recordDate: initialValues.recordDate ? dayjs(initialValues.recordDate) : undefined,
        nextAppointment: initialValues.nextAppointment ? dayjs(initialValues.nextAppointment) : undefined,
        vaccination: initialValues.vaccination || undefined, // Set vaccination initial value
      });
      setIsEditing(false); // If initial values exist, start in view mode
    } else {
      form.resetFields();
      form.setFieldsValue({
        recordDate: dayjs(),
      });
      setIsEditing(true); // If no initial values, start in edit mode
    }
  }, [initialValues, form]);

  const isViewMode = !!initialValues;

  const handleFormSubmit = (values: any) => {
    const formattedValues = {
      ...values,
      recordDate: typeof values.recordDate === 'string' ? values.recordDate : values.recordDate?.format('YYYY-MM-DD'),
      nextAppointment: typeof values.nextAppointment === 'string' ? values.nextAppointment : values.nextAppointment?.format('YYYY-MM-DD'),
    };

    if (isViewMode && initialValues && onUpdate) {
      onUpdate(initialValues.MedID, {
        ...initialValues,
        ...formattedValues,
      });
      setIsEditing(false); // Exit edit mode after update
    } else if (onSubmit) {
      onSubmit(formattedValues);
    }
  };

  const handleDeleteClick = () => {
    if (initialValues && onDelete) {
      onDelete(initialValues.MedID);
    }
  };

  const handleCancelEdit = () => {
    if (initialValues) {
      // Revert to initial values and exit edit mode
      form.setFieldsValue({
        ...initialValues,
        recordDate: initialValues.recordDate ? dayjs(initialValues.recordDate) : undefined,
        nextAppointment: initialValues.nextAppointment ? dayjs(initialValues.nextAppointment) : undefined,
      });
      setIsEditing(false);
    } else {
      // For new record, just go back
      onBack();
    }
  };

  return (
    <div className="health-form-page">
      <div className="form-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={isEditing && isViewMode ? handleCancelEdit : onBack} // Adjust back button behavior
          className="back-button"
        >
          ย้อนกลับ
        </Button>
        
        <Title level={2} className="page-title">
          {isViewMode ? (isEditing ? 'แก้ไขบันทึกสุขภาพ' : 'รายละเอียดบันทึกสุขภาพ') : 'บันทึกสุขภาพสุนัข'} - {selectedDog?.Name}
        </Title>
      </div>

      <Card className="health-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit} // Use the new handler
        >
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="weight"
                label="น้ำหนัก (กก.)"
                rules={[{ required: !isEditing, message: 'กรุณากรอกน้ำหนัก' }]}
              >
                <InputNumber 
                  placeholder="12.5" 
                  min={0} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  readOnly={!isEditing}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="temperature"
                label="อุณหภูมิ (°C)"
                rules={[{ required: !isEditing, message: 'กรุณากรอกอุณหภูมิ' }]}
              >
                <InputNumber 
                  placeholder="38.2" 
                  min={35} 
                  max={45} 
                  step={0.1} 
                  style={{ width: '100%' }}
                  readOnly={!isEditing}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="recordDate"
                label="วันที่บันทึก"
                rules={[{ required: !isEditing, message: 'กรุณาเลือกวันที่' }]}
              >
                <DatePicker style={{ width: '100%' }} disabled={!isEditing} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="symptoms"
            label="อาการที่พบ"
            rules={[{ required: !isEditing, message: 'กรุณากรอกอาการที่พบ' }]}
          >
            <TextArea 
              rows={3} 
              placeholder="อธิบายอาการที่พบในสุนัข..."
              readOnly={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="diagnosis"
            label="การวินิจฉัย"
          >
            <TextArea 
              rows={3} 
              placeholder="ผลการวินิจฉัยโรค..."
              readOnly={!isEditing}
            />
          </Form.Item>

          <Form.Item
            name="treatment"
            label="การรักษา"
          >
            <TextArea 
              rows={3} 
              placeholder="วิธีการรักษาที่ให้..."
              readOnly={!isEditing}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="medication"
                label="ยาที่ให้"
              >
                <Input placeholder="ชื่อยาและขนาด" readOnly={!isEditing} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextAppointment"
                label="นัดหมายครั้งต่อไป"
              >
                <DatePicker style={{ width: '100%' }} disabled={!isEditing} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="vaccination"
                label="การฉีดวัคซีน"
                rules={[{ required: !isEditing, message: 'กรุณาเลือกสถานะการฉีดวัคซีน' }]}
              >
                <Select placeholder="เลือกสถานะ" disabled={!isEditing}>
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
              readOnly={!isEditing}
            />
          </Form.Item>

          {isViewMode && !isEditing && ( // View mode buttons
            <Form.Item className="submit-section">
              <Space>
                <Button type="primary" onClick={() => setIsEditing(true)}>แก้ไข</Button>
                <Button danger onClick={handleDeleteClick}>ลบ</Button>
              </Space>
            </Form.Item>
          )}

          {isEditing && ( // Edit/Create mode buttons
            <Form.Item className="submit-section">
              <Space>
                <Button onClick={handleCancelEdit}>ยกเลิก</Button>
                <Button type="primary" htmlType="submit" size="large">บันทึก</Button>
              </Space>
            </Form.Item>
          )}
        </Form>
      </Card>
    </div>
  );
};

export default HealthFormComponent;