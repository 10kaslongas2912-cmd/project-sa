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
  Divider,
} from 'antd';
import { 
  ArrowLeftOutlined, 
  HeartOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { HealthRecord } from '../../../../interfaces/HealthRecord';
import { healthRecordAPI } from '../../../../services/apis';
import "./style.css";

const { Title } = Typography;
const { TextArea } = Input;

const FormPage: React.FC = () => {
  const { dogId, recordId } = useParams<{ dogId: string; recordId?: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasVaccination, setHasVaccination] = useState<string>('NO');

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
        hasVaccination: 'NO',
      });
      setHasVaccination('NO');
    }
  }, [recordId, dogId, form]);

  const fetchRecordForEdit = async () => {
    if (!recordId) return;

    setLoading(true);
    try {
      const record = await healthRecordAPI.getHealthRecordById(parseInt(recordId));
      
      // Check if vaccination data exists
      const hasVacc = record.vaccination === 'YES' ? 'YES' : 'NO';
      setHasVaccination(hasVacc);
      
      form.setFieldsValue({
        ...record,
        recordDate: record.recordDate ? dayjs(record.recordDate) : dayjs(),
        nextAppointment: record.nextAppointment ? dayjs(record.nextAppointment) : null,
        hasVaccination: hasVacc,
        // Add vaccination fields if they exist
        doseNumber: record.doseNumber || undefined,
        lotNumber: record.lotNumber || undefined,
        vaccineNextDueDate: record.vaccineNextDueDate ? dayjs(record.vaccineNextDueDate) : null,
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
    if (!values.weight || !values.temperature || !values.symptoms) {
      message.error('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    // Validate vaccination fields if hasVaccination is YES
    if (values.hasVaccination === 'YES') {
      if (!values.doseNumber || !values.lotNumber || !values.vaccineNextDueDate) {
        message.error('กรุณากรอกข้อมูลวัคซีนให้ครบถ้วน');
        return;
      }
    }

    setSubmitLoading(true);

    const healthRecord: any = {
      dogId: parseInt(dogId),
      staffId: 1, // Assuming staff ID 1 exists for now
      weight: parseFloat(values.weight),
      temperature: parseFloat(values.temperature),
      symptoms: values.symptoms?.trim(),
      diagnosis: values.diagnosis?.trim() || null,
      treatment: values.treatment?.trim() || null,
      medication: values.medication?.trim() || null,
      vaccination: values.hasVaccination,
      notes: values.notes?.trim() || null,
      recordDate: values.recordDate ? values.recordDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    };

    // Add vaccination fields if hasVaccination is YES
    if (values.hasVaccination === 'YES') {
      healthRecord.doseNumber = parseInt(values.doseNumber);
      healthRecord.lotNumber = values.lotNumber.trim();
      healthRecord.vaccineNextDueDate = values.vaccineNextDueDate.format('YYYY-MM-DD');
    }

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

  const handleVaccinationChange = (value: string) => {
    setHasVaccination(value);
    if (value === 'NO') {
      // Clear vaccination fields when NO is selected
      form.setFieldsValue({
        doseNumber: undefined,
        lotNumber: undefined,
        vaccineNextDueDate: null,
      });
    }
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
        
        <Title level={2} className="page-title" style={{ fontFamily: 'Anakotmai-Bold',marginTop: '80px',marginLeft: '30px',color: '#FF6600',fontSize: '2.4em' }}>
          {isEditMode ? 'แก้ไขบันทึกสุขภาพ' : 'บันทึกสุขภาพสุนัข'}
        </Title>
      </div>

      <Card className="health-form-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          scrollToFirstError
        >
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="section-title" style={{ fontFamily: 'Anakotmai-Bold',fontSize: '1.4em' }}>
              <FileTextOutlined /> ข้อมูลพื้นฐาน
            </h3>
            <Row gutter={24}>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="weight"
                  label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>น้ำหนัก (กก.)</div>}
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
                    className="custom-input-number"
                    rootClassName="ank-num"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="temperature"
                  label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>อุณหภูมิ (°C)</div>}
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
                    precision={1}
                    className="custom-input-number"
                    rootClassName="ank-num"
                    style={{ width: '100%', fontFamily: 'Anakotmai-Bold', fontWeight: 700 }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item
                  name="recordDate"
                  label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>วันที่บันทึก</div>}
                  rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
                >
                  <DatePicker 
                    style={{ width: '100%', fontFamily: 'Anakotmai' }} 
                    format="DD/MM/YYYY"
                    placeholder="เลือกวันที่"
                    className="custom-datepicker"
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Medical Information Section */}
          <div className="form-section">
            <h3 className="section-title" style={{ fontFamily: 'Anakotmai-Bold',fontSize: '1.4em' }}>
              <MedicineBoxOutlined /> ข้อมูลการตรวจรักษา
            </h3>
            
            <Form.Item
              name="symptoms"
              label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>อาการที่พบ</div>}
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
                className="custom-textarea"
                style={{ fontFamily: 'Anakotmai' }}
              />
            </Form.Item>

            <Form.Item
              name="diagnosis"
              label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>การวินิจฉัย</div>}
              rules={[
                { min: 5, message: 'การวินิจฉัยควรมีอย่างน้อย 5 ตัวอักษร' }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="ผลการวินิจฉัยโรค..."
                showCount
                maxLength={500}
                className="custom-textarea"
                style={{ fontFamily: 'Anakotmai' }}
              />
            </Form.Item>

            <Form.Item
              name="treatment"
              label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>การรักษา</div>}
              rules={[
                { min: 5, message: 'การรักษาควรมีอย่างน้อย 5 ตัวอักษร' }
              ]}
            >
              <TextArea 
                rows={3} 
                placeholder="วิธีการรักษาที่ให้..."
                showCount
                maxLength={500}
                className="custom-textarea"
                style={{ fontFamily: 'Anakotmai' }}
              />
            </Form.Item>

            <Row gutter={24}>
              <Col xs={24} sm={24}>
                <Form.Item
                  name="medication"
                  label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>ยาที่ให้</div>}
                >
                  <Input 
                    placeholder="ชื่อยาและขนาด" 
                    maxLength={200}
                    className="custom-input"
                    style={{ fontFamily: 'Anakotmai-Bold' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Divider />

          {/* Vaccination Section */}
          <div className="form-section vaccination-section">
            <h3 className="section-title" style={{ fontFamily: 'Anakotmai-Bold',fontSize: '1.4em' }}>
              <SafetyCertificateOutlined /> ข้อมูลการฉีดวัคซีน
            </h3>
            
            <Form.Item
              name="hasVaccination"
              label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>วัคซีน</div>}
              rules={[{ required: true, message: 'กรุณาเลือกสถานะการฉีดวัคซีน' }]}
            >
              <Select 
                placeholder="เลือกสถานะ" 
                onChange={handleVaccinationChange}
                className="custom-select"
                style={{ fontFamily: 'Anakotmai' }}
              >
                <Select.Option value="YES" style={{ fontFamily: "Anakotmai" }}>มีการฉีดวัคซีน</Select.Option>
                <Select.Option value="NO" style={{ fontFamily: "Anakotmai" }}>ไม่มีการฉีดวัคซีน</Select.Option>
              </Select>
            </Form.Item>

            {hasVaccination === 'YES' && (
              <div className="vaccination-fields">
                <Row gutter={24}>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="doseNumber"
                      label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>เข็มที่</div>}
                      rules={[
                        { required: hasVaccination === 'YES', message: 'กรุณาระบุเข็มที่' }
                      ]}
                    >
                      <InputNumber 
                        min={1} 
                        placeholder="1" 
                        style={{ width: '100%' }}
                        className="custom-input-number"
                        rootClassName="ank-num"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="lotNumber"
                      label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>หมายเลขล็อต</div>}
                      rules={[
                        { required: hasVaccination === 'YES', message: 'กรุณาระบุ Lot Number' }
                      ]}
                    >
                      <Input 
                        placeholder="LOT123456" 
                        className="custom-input"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Form.Item
                      name="vaccineNextDueDate"
                      label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>วันนัดหมายครั้งต่อไป</div>}
                      rules={[
                        { required: hasVaccination === 'YES', message: 'กรุณาเลือกวันนัดฉีด' }
                      ]}
                    >
                      <DatePicker 
                        style={{ width: '100%' }} 
                        format="DD/MM/YYYY"
                        placeholder="เลือกวันที่"
                        className="custom-datepicker"
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                        suffixIcon={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            )}
          </div>

          <Divider />

          {/* Notes Section */}
          <div className="form-section">
            <Form.Item
              name="notes"
              label={<div style={{ fontFamily: "Anakotmai", fontSize: "1.2em", width: "100%", marginLeft: "0px", marginTop: "5px" }}>หมายเหตุเพิ่มเติม</div>}
            >
              <TextArea 
                rows={2} 
                placeholder="บันทึกเพิ่มเติม..."
                showCount
                maxLength={300}
                className="custom-textarea"
                style={{ fontFamily: 'Anakotmai' }}
              />
            </Form.Item>
          </div>

          {/* Submit Section */}
          <Form.Item className="submit-section">
            <Space size="middle">
              <Button 
                size="large"
                onClick={handleBack} 
                disabled={submitLoading}
                className="cancel-button"
                style={{ fontFamily: 'Anakotmai-Bold' }}
              >
                ยกเลิก
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                loading={submitLoading}
                className="submit-button"
                icon={isEditMode ? null : <HeartOutlined />}
                style={{ fontFamily: 'Anakotmai-Bold' }}
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