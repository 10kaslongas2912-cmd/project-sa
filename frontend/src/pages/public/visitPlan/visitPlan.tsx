import { useState, useEffect } from 'react'
import bgImage from '../../../assets/visit/asd.jpg'
import { 
  Card, 
  Select, 
  Radio, 
  Button, 
  Typography, 
  Alert, 
  Table, 
  Space, 
  Row, 
  Col,
  Badge,
  Statistic,
  Divider,
  Popconfirm,
  Progress,
  Spin
} from 'antd'
import { 
  CalendarOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  UnorderedListOutlined,
  DeleteOutlined,
  WarningOutlined,
  BarChartOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

interface Visitor {
  ID?: number;
  id?: string;
  date: string;
  count: string;
  dateLabel: string;
  numericCount: number;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
}

// API Base URL - แก้ไขตาม backend URL ของคุณ
const API_BASE_URL = 'http://localhost:8080'

function App() {
  const [value, setValue] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      const label = date.toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const value = date.toISOString().split('T')[0]; 
      options.push({ label, value });
    }

    return options;
  };

  const dateOptions = generateDateOptions();

  // Fetch visitors from API
  const fetchVisitors = async () => {
  try {
    setLoading(true)
    const response = await fetch(`${API_BASE_URL}/visiters`)
    const json = await response.json()

    // ตรวจสอบและ map
    const dataArray = Array.isArray(json.data) ? json.data : []

    const transformedVisitors = dataArray.map((visitor: any) => {
      const dateLabel = dateOptions.find(option => option.value === visitor.VisitDate?.split('T')[0])?.label || visitor.VisitDate
      return {
        id: visitor.ID?.toString(),
        date: visitor.VisitDate?.split('T')[0] || '',
        count: `${visitor.NumberOfVisiter} คน`,
        dateLabel,
        numericCount: visitor.NumberOfVisiter
      }
    })

    setVisitors(transformedVisitors)
  } catch (error) {
    console.error('Error fetching visitors:', error)
    setErrorMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    setTimeout(() => setErrorMessage(''), 5000)
  } finally {
    setLoading(false)
  }
}

  // Load data on component mount
  useEffect(() => {
    fetchVisitors();
  }, []);

  // Create visitor via API
  const createVisitor = async (visitorData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visiters`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(visitorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  };

  // Delete visitor via API
  const deleteVisitor = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/visiters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  };

  // คำนวณจำนวนคนที่จองในวันที่เลือก
  const getBookedCountForDate = (date: string) => {
    return visitors
      .filter(visitor => visitor.date === date)
      .reduce((total, visitor) => total + visitor.numericCount, 0);
  };

  // ตรวจสอบว่าสามารถจองได้หรือไม่
  const canBook = (date: string, newCount: number) => {
    const currentCount = getBookedCountForDate(date);
    return currentCount + newCount <= 100;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !value) return;

    const numericCount = parseInt(value.split(' ')[0]);
    
    // ตรวจสอบว่ามีการจองวันเดิมหรือไม่
    const existingBooking = visitors.find(visitor => visitor.date === selectedDate);
    if (existingBooking) {
      setErrorMessage(`ไม่สามารถจองวันซ้ำได้! คุณได้จองวันที่ ${existingBooking.dateLabel} ไว้แล้ว `);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }
    
    // ตรวจสอบจำนวนคนไม่เกิน 100
    if (!canBook(selectedDate, numericCount)) {
      const currentCount = getBookedCountForDate(selectedDate);
      const remaining = 100 - currentCount;
      setErrorMessage(`การจองไม่สำเร็จ! วันนี้เหลือที่ว่างเพียง ${remaining} คน`);
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    const selectedOption = dateOptions.find(option => option.value === selectedDate);

    const visitorData = {
      VisitDate: new Date(selectedDate).toISOString(),
      NumberOfVisiter: numericCount,
      UserID: 1,        // ตัวอย่าง
      VisitingID: 2     // ตัวอย่าง
    };

    try {
      setSubmitting(true);
      await createVisitor(visitorData);
      
      setSuccessMessage(`จองสำเร็จ! `);
      setSelectedDate('');
      setValue('');
      
      // Refresh data
      await fetchVisitors();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error creating visitor:', error);
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการจอง');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // ฟังก์ชันยกเลิกการจอง
  const handleCancelBooking = async (id: string) => {
    try {
      setLoading(true);
      await deleteVisitor(id);
      
      setSuccessMessage(`ยกเลิกการจองสำเร็จ!`);
      
      // Refresh data
      await fetchVisitors();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Error deleting visitor:', error);
      setErrorMessage(error.message || 'เกิดข้อผิดพลาดในการยกเลิกการจอง');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'วันที่เยี่ยมชม',
      dataIndex: 'dateLabel',
      key: 'dateLabel',
      render: (dateLabel: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{dateLabel}</Text>
        </Space>
      ),
    },
    {
      title: 'จำนวนผู้เยี่ยมชม',
      dataIndex: 'count',
      key: 'count',
      align: 'center' as const,
      render: (count: string) => (
        <Badge count={count} showZero color="orange" />
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      align: 'center' as const,
      render: (text: any, record: Visitor) => (
        <Popconfirm
          title="ยืนยันการยกเลิก"
          onConfirm={() => handleCancelBooking(record.id || record.ID?.toString() || '')}
          okText="ยืนยัน"
          cancelText="ปิด"
        >
          <Button 
            type="primary" 
            danger 
            icon={<DeleteOutlined />}
            loading={loading}
          >
            ยกเลิก
          </Button>
        </Popconfirm>
      ),
    },
  ];

  // คำนวณจำนวนคนที่จองในวันที่เลือก
  const selectedDateBookedCount = selectedDate ? getBookedCountForDate(selectedDate) : 0;
  const remainingSlots = 100 - selectedDateBookedCount;
  const progressPercent = (selectedDateBookedCount / 100) * 100;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: '24px',
      position: 'relative'
    }}>
      
      <Row gutter={[24, 24]}>
        {/* ฟอร์มจอง */}
        <Col xs={24} lg={10}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                <span>แบบฟอร์มจองการเยี่ยมชม</span>
              </Space>
            }
            headStyle={{ backgroundColor: '#ff8c00', color: '#ffffffff' }}
            style={{ 
              marginTop: '20%',
              height: 'fit-content',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* Success Message */}
            {successMessage && (
              <Alert
                message={successMessage}
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                style={{ marginBottom: 16 }}
                closable
                onClose={() => setSuccessMessage('')}
              />
            )}

            {/* Error Message */}
            {errorMessage && (
              <Alert
                message={errorMessage}
                type="error"
                showIcon
                icon={<WarningOutlined />}
                style={{ marginBottom: 16 }}
                closable
                onClose={() => setErrorMessage('')}
              />
            )}

            <Spin spinning={loading}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* เลือกวันที่ */}
                <div style={{ marginBottom: '24px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    เลือกวันที่เยี่ยมชม
                    <Text type="danger"> *</Text>
                  </Text>
                  <Select
                    value={selectedDate}
                    onChange={setSelectedDate}
                    placeholder="กรุณาเลือกวันที่"
                    style={{ width: '100%', height: '40px' }}
                    disabled={submitting}
                  >
                    {dateOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                {/* เลือกจำนวนคน */}
                <div style={{ marginBottom: '24px' }}>
                  <Text strong style={{ display: 'block', marginBottom: 12 }}>
                    <UserOutlined style={{ marginRight: 8 }} />
                    จำนวนผู้เยี่ยมชม
                    <Text type="danger"> *</Text>
                  </Text>
                  <Radio.Group
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    style={{ width: '100%' }}
                    disabled={submitting}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {["1 คน", "2 คน", "3 คน", "4 คน", "5 คน"].map((num) => {
                        const numericValue = parseInt(num.split(' ')[0]);
                        const shouldDisable = selectedDate && !canBook(selectedDate, numericValue);
                        
                        const radioProps: any = {
                          key: num,
                          value: num,
                          style: { 
                            display: 'block', 
                            padding: '8px 0',
                            fontSize: '16px',
                            opacity: shouldDisable ? 0.5 : 1
                          }
                        };

                        if (shouldDisable) {
                          radioProps.disabled = true;
                        }
                        
                        return (
                          <Radio {...radioProps}>
                            {num}
                            {shouldDisable && (
                              <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                (เกินจำนวนที่จองได้)
                              </Text>
                            )}
                          </Radio>
                        );
                      })}
                    </Space>
                  </Radio.Group>
                </div>

                <Divider />

                {/* ปุ่มยืนยัน */}
                <Button  
                  type="primary"
                  loading={submitting}
                  disabled={!selectedDate || !value || (selectedDate && remainingSlots === 0) || visitors.some(v => v.date === selectedDate)}
                  onClick={handleConfirm}
                  icon={<CheckCircleOutlined />}
                  style={{ 
                    width: '100%',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {submitting
                    ? 'กำลังจอง...'
                    : !selectedDate || !value 
                      ? 'กรุณาเลือกข้อมูลให้ครบถ้วน' 
                      : visitors.some(v => v.date === selectedDate)
                        ? 'ไม่สามารถจองวันซ้ำได้'
                      : remainingSlots === 0 
                        ? 'วันนี้เต็มแล้ว' 
                        : 'ยืนยันการจอง'
                  }
                </Button>
              </Space>
            </Spin>
          </Card>
        </Col>

        {/* รายการจอง */}
        <Col xs={24} lg={14}>
          <Card 
            title={
              <Space>
                <UnorderedListOutlined />
                <span>รายการจอง</span>
              </Space>
            }
            headStyle={{ backgroundColor: '#ff8c00', color: '#ffffffff' }}
            style={{
              marginTop: '14.2%',
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Spin spinning={loading}>
              {visitors.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 20px',
                  color: '#999'
                }}>
                  <UnorderedListOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Title level={4} type="secondary">
                    ยังไม่มีรายการจอง
                  </Title>
                  <Text type="secondary">
                    เริ่มจองการเยี่ยมชมได้จากฟอร์มด้านซ้าย
                  </Text>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={visitors.map(visitor => ({ 
                    ...visitor, 
                    key: visitor.id || visitor.ID?.toString() || Math.random().toString()
                  }))}
                  pagination={{ 
                    pageSize: 5, 
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `แสดง ${range[0]}-${range[1]} จาก ${total} รายการ`
                  }}
                  scroll={{ x: 500 }}
                />
              )}
            </Spin>
          </Card>

          {/* สถานะการจองวันที่เลือก - การ์ดแยก */}
          {selectedDate && (
            <Card 
              title={
                <Space>
                  <BarChartOutlined />
                  <span>สถานะการจองวันที่เลือก</span>
                </Space>
              }
              headStyle={{ backgroundColor: '#ff8800', color: '#ffffff' }}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  วันที่: {dateOptions.find(option => option.value === selectedDate)?.label}
                </Text>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="จองแล้ว"
                      value={selectedDateBookedCount}
                      suffix="/ 100 คน"
                      valueStyle={{ 
                        color: selectedDateBookedCount >= 80 ? '#ff4d4f' : '#1890ff',
                        fontSize: '18px' 
                      }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="เหลือ"
                      value={remainingSlots}
                      suffix="คน"
                      valueStyle={{ 
                        color: remainingSlots <= 20 ? '#ff4d4f' : '#52c41a',
                        fontSize: '18px' 
                      }}
                    />
                  </Col>
                </Row>
                <Progress 
                  percent={progressPercent} 
                  strokeColor={{
                    '0%': '#52c41a',
                    '60%': '#faad14',
                    '80%': '#ff4d4f',
                  }}
                  showInfo={false}
                />
                {remainingSlots <= 20 && remainingSlots > 0 && (
                  <Alert
                    message="เหลือที่ว่างไม่มาก!"
                    type="warning"
                    showIcon
                  />
                )}
                {remainingSlots === 0 && (
                  <Alert
                    message="วันนี้เต็มแล้ว!"
                    type="error"
                    showIcon
                  />
                )}
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default App;