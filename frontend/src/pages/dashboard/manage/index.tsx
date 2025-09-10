import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  Avatar,
  Card,
  message,
  Popconfirm,
  Divider,
  Typography,
  Tooltip,
  Alert,
  Space,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  SearchOutlined,
  ToolOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { manageAPI, staffAPI, buildingAPI } from '../../../services/apis';
import './style.css';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Types based on entity structure
type TaskType = "ดูแลความสะอาด" | "การบำรุงรักษา" | "การตรวจสอบ" | "การซ่อมแซม" | "อื่นๆ";

interface CreateManageRequest {
  date_task: string;
  type_task: TaskType;
  detail_task?: string;
  staff_id: number;
  building_id: number;
}

interface UpdateManageRequest {
  date_task: string;
  type_task: TaskType;
  detail_task?: string;
  staff_id: number;
  building_id: number;
}

interface Manage {
  ID: number;
  DateTask: string;
  TypeTask: TaskType;
  DetailTask?: string;
  StaffID: number;
  BuildingID: number;
  Staff?: Staff;
  Building?: Building;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Staff {
  ID: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  username: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

interface Building {
  ID: number;
  BuildingName?: string;
  building_name?: string;
  Size?: string;
  size?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

// Helper functions
const getStaffDisplayName = (staff: Staff): string => {
  if (staff.name) return staff.name;
  return `${staff.first_name || ''} ${staff.last_name || ''}`.trim();
};

const getBuildingDisplayName = (building: Building): string => {
  return building.BuildingName || building.building_name || 'Unknown Building';
};

const getSizeDisplayName = (size: string): string => {
  switch (size) {
    case 'small': return 'เล็ก';
    case 'medium': return 'กลาง';  
    case 'large': return 'ใหญ่';
    default: return size;
  }
};

const ManageComponent: React.FC = () => {
  const [manages, setManages] = useState<Manage[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [editingManage, setEditingManage] = useState<Manage | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffSearchText, setStaffSearchText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const taskTypes: TaskType[] = [
    'ดูแลความสะอาด',
    'การบำรุงรักษา', 
    'การตรวจสอบ',
    'การซ่อมแซม',
    'อื่นๆ'
  ];

  const taskTypeColors: Record<TaskType, string> = {
    'ดูแลความสะอาด': 'orange',
    'การบำรุงรักษา': 'orange',
    'การตรวจสอบ': 'orange',
    'การซ่อมแซม': 'orange',
    'อื่นๆ': 'orange'
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchManages(),
      fetchStaffs(),
      fetchBuildings()
    ]);
  };
  const disabledPastDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf("day");
};


  const fetchManages = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching manages...');
      
      const response = await manageAPI.getAll();
      console.log('Manages API response:', response);
      
      // Handle different response structures
      let managesData = [];
      if (Array.isArray(response)) {
        managesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        managesData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        managesData = response.data.data;
      }
      
      console.log('Processed manages data:', managesData);
      setManages(managesData);
      
    } catch (error: any) {
      console.error('Error fetching manages:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Server error';
      setError('ไม่สามารถโหลดข้อมูลการจัดการได้: ' + errorMessage);
      setManages([]);
      message.error('ไม่สามารถโหลดข้อมูลการจัดการได้');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffs = async () => {
    try {
      console.log('Fetching staffs...');
      const response = await staffAPI.getAll();
      console.log('Staffs API response:', response);
      
      // Handle different response structures
      let staffsData = [];
      if (Array.isArray(response)) {
        staffsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        staffsData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        staffsData = response.data.data;
      }
      
      const processedStaffs = staffsData.map((staff: Staff) => ({
        ...staff,
        name: staff.name || getStaffDisplayName(staff),
        position: staff.position || 'พนักงาน',
        department: staff.department || 'ทั่วไป'
      }));
      
      console.log('Processed staffs data:', processedStaffs);
      setStaffs(processedStaffs);
      
    } catch (error: any) {
      console.error('Error fetching staffs:', error);
      message.error('ไม่สามารถโหลดข้อมูลพนักงานได้');
      setStaffs([]);
    }
  };

  const fetchBuildings = async () => {
    try {
      console.log('Fetching buildings...');
      const response = await buildingAPI.getAll();
      console.log('Buildings API response:', response);
      
      // Handle different response structures
      let buildingsData = [];
      if (Array.isArray(response)) {
        buildingsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        buildingsData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        buildingsData = response.data.data;
      }
      
      console.log('Processed buildings data:', buildingsData);
      setBuildings(buildingsData);
      
    } catch (error: any) {
      console.error('Error fetching buildings:', error);
      message.error('ไม่สามารถโหลดข้อมูลอาคารได้');
      setBuildings([]);
    }
  };

  const handleCreate = () => {
    setEditingManage(null);
    setSelectedStaff(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Manage) => {
    setEditingManage(record);
    const staff = record.Staff;
    setSelectedStaff(staff || null);
    
    form.setFieldsValue({
  date_task: dayjs(record.DateTask),
  type_task: record.TypeTask,
  detail_task: record.DetailTask || '',
  building_id: Number(record.BuildingID)
});
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      console.log('Deleting manage with ID:', id);
      
      const response = await manageAPI.remove(id);
      console.log('Delete response:', response);
      
      // Check for successful deletion
      const isSuccess = response && (
        response.status === 200 || 
        response.status === 204 ||
        (response.data && response.data.message) ||
        response.message ||
        (!response.error && !response.data?.error)
      );

      if (isSuccess) {
        message.success('ลบข้อมูลสำเร็จ');
        await fetchManages();
      } else {
        const errorMessage = response?.data?.error || response?.error || "เกิดข้อผิดพลาดในการลบ";
        throw new Error(errorMessage);
      }
      
    } catch (error: any) {
      console.error('Error deleting manage:', error);
      
      let errorMessage = "เกิดข้อผิดพลาดในการลบข้อมูล";
      const status = error?.response?.status || error?.status;
      
      if (status === 404) {
        errorMessage = "ไม่พบข้อมูลที่ต้องการลบ";
      } else if (status === 403) {
        errorMessage = "ไม่มีสิทธิ์ลบข้อมูลนี้";
      } else if (status === 500) {
        errorMessage = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      const values = await form.validateFields();
      
      if (!selectedStaff) {
        message.error('กรุณาเลือกพนักงาน');
        return;
      }

      const staffId = selectedStaff.ID;
      const buildingId = values.building_id;

      if (!staffId || staffId <= 0 || isNaN(Number(staffId))) {
        console.error('Invalid staff ID:', staffId);
        message.error('ข้อมูลพนักงานไม่ถูกต้อง กรุณาเลือกพนักงานใหม่');
        return;
      }

      if (!buildingId || buildingId <= 0 || isNaN(Number(buildingId))) {
        console.error('Invalid building ID:', buildingId);
        message.error('กรุณาเลือกอาคาร');
        return;
      }

      const payload: CreateManageRequest | UpdateManageRequest = {
        date_task: dayjs(values.date_task).format('YYYY-MM-DD'),
        type_task: values.type_task,
        detail_task: values.detail_task || '',
        staff_id: Number(staffId),
        building_id: Number(buildingId)
      };

      if (!payload.date_task || payload.date_task === 'Invalid date') {
        message.error('กรุณาเลือกวันที่ให้ถูกต้อง');
        return;
      }

      if (!payload.type_task || payload.type_task.trim() === '') {
        message.error('กรุณาเลือกประเภทงาน');
        return;
      }

      console.log('=== SUBMITTING PAYLOAD ===');
      console.log('Form values:', values);
      console.log('Final payload:', JSON.stringify(payload, null, 2));

      let response;
      if (editingManage) {
        console.log('Updating manage with ID:', editingManage.ID);
        response = await manageAPI.update(editingManage.ID, payload as UpdateManageRequest);
        
        // Check for successful update
        const isSuccess = response && (
          response.status === 200 || 
          response.status === 201 ||
          (response.data && response.data.message) ||
          response.message ||
          (!response.error && !response.data?.error)
        );

        if (isSuccess) {
          message.success('อัปเดตข้อมูลสำเร็จ');
        } else {
          const errorMessage = response?.data?.error || response?.error || "เกิดข้อผิดพลาดในการอัปเดต";
          throw new Error(errorMessage);
        }
      } else {
        console.log('Creating new manage');
        response = await manageAPI.create(payload as CreateManageRequest);
        
        // Check for successful creation
        const isSuccess = response && (
          response.status === 200 || 
          response.status === 201 ||
          (response.data && response.data.message) ||
          response.message ||
          (!response.error && !response.data?.error)
        );

        if (isSuccess) {
          message.success('สร้างข้อมูลสำเร็จ');
        } else {
          const errorMessage = response?.data?.error || response?.error || "เกิดข้อผิดพลาดในการสร้าง";
          throw new Error(errorMessage);
        }
      }

      console.log('API Response:', response);
      
      setModalVisible(false);
      form.resetFields();
      setSelectedStaff(null);
      await fetchManages();
      
    } catch (error: any) {
      console.error('=== ERROR DETAILS ===');
      console.error('Full error:', error);
      
      let errorMessage = 'เกิดข้อผิดพลาดไม่ทราบสาเหตุ';
      const status = error?.response?.status || error?.status;
      
      if (status === 400) {
        errorMessage = error?.response?.data?.error || "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
      } else if (status === 401) {
        errorMessage = "ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่";
      } else if (status === 404) {
        errorMessage = "ไม่พบข้อมูลที่ต้องการแก้ไข";
      } else if (status === 500) {
        errorMessage = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      message.error('เกิดข้อผิดพลาด: ' + errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  const openStaffModal = () => {
    setStaffModalVisible(true);
  };

  const selectStaff = (staff: Staff) => {
    setSelectedStaff(staff);
    setStaffModalVisible(false);
  };

  const filteredStaffs = staffs.filter(staff => {
    const searchLower = staffSearchText.toLowerCase();
    const displayName = staff.name || getStaffDisplayName(staff);
    return (
      displayName.toLowerCase().includes(searchLower) ||
      (staff.username && staff.username.toLowerCase().includes(searchLower)) ||
      (staff.position && staff.position.toLowerCase().includes(searchLower)) ||
      (staff.department && staff.department.toLowerCase().includes(searchLower)) ||
      (staff.email && staff.email.toLowerCase().includes(searchLower))
    );
  });

  const columns = [
    {
      title: 'วันที่',
      dataIndex: 'DateTask',
      key: 'DateTask',
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          <span>{dayjs(date).format('DD/MM/YYYY')}</span>
        </Space>
      ),
      sorter: (a: Manage, b: Manage) => dayjs(a.DateTask).unix() - dayjs(b.DateTask).unix(),
      width: 130,
    },
    {
      title: 'ประเภทงาน',
      dataIndex: 'TypeTask',
      key: 'TypeTask',
      render: (type: TaskType) => (
        <Tag color={taskTypeColors[type]} icon={<ToolOutlined />}>
          {type}
        </Tag>
      ),
      width: 140,
    },
    {
      title: 'รายละเอียด',
      dataIndex: 'DetailTask',
      key: 'DetailTask',
      render: (detail: string) => (
        <Tooltip title={detail}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {detail || '-'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'พนักงาน',
      key: 'staff',
      render: (_: any, record: Manage) => {
        const staff = record.Staff;
        const displayName = staff ? (staff.name || getStaffDisplayName(staff)) : 'N/A';
        const position = staff?.position || '';
        
        return (
          <Space>
            <Avatar 
              size={32}
              icon={<UserOutlined />}
            />
            <div>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>{position}</div>
            </div>
          </Space>
        );
      },
      width: 180,
    },
    {
      title: 'อาคาร',
      key: 'building',
      render: (_: any, record: Manage) => {
        const building = record.Building;
        const buildingSize = building?.Size || building?.size || '';
        
        return (
          <Space>
            <HomeOutlined />
            <div>
              <div style={{ fontWeight: 500 }}>
                {getBuildingDisplayName(building || { ID: 0, CreatedAt: '', UpdatedAt: '', BuildingName: 'N/A', Size: '' })}
              </div>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                ขนาด: {getSizeDisplayName(buildingSize)}
              </div>
            </div>
          </Space>
        );
      },
      width: 150,
    },
    {
      title: 'การจัดการ',
      key: 'actions',
      render: (_: any, record: Manage) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            loading={loading}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title="คุณแน่ใจหรือไม่?"
            description="การลบข้อมูลนี้ไม่สามารถกู้คืนได้"
            onConfirm={() => handleDelete(record.ID)}
            okText="ลบ"
            cancelText="ยกเลิก"
          >
            <Button
              type="primary"
              size="small"
              icon={<DeleteOutlined />}
              loading={loading}
            >
              ลบ
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={1} style={{ margin: 0, color: '#ff8800' }}>
          ระบบจัดการผู้ดูแล
        </Title>
        <Text type="secondary">
          จัดการและติดตามงานของพนักงานผู้ดูแล
        </Text>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        {error && (
          <Alert
            message="เกิดข้อผิดพลาด"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => setError(null)}
          />
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <Space>
            <Input
              placeholder="ค้นหาข้อมูล..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
            />
            <Select
              placeholder="ประเภทงาน"
              allowClear
              style={{ width: 150 }}
            >
              {taskTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchAllData}
              loading={loading}
            >
              รีเฟรช
            </Button>
          </Space>
          
          <Space>
            <Button
              className='btn-action'
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="large"
              style={{ fontWeight: 'bold' }}
            >
              เพิ่มการจัดการใหม่
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={manages}
          rowKey="ID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
          locale={{
            emptyText: error ? 'เกิดข้อผิดพลาดในการโหลดข้อมูล' : 'ไม่มีข้อมูล'
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Main Form Modal */}
      <Modal
        title={
          <Space>
            <ToolOutlined />
            {editingManage ? 'แก้ไขการจัดการ' : 'เพิ่มการจัดการใหม่'}
          </Space>
        }
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setSelectedStaff(null);
        }}
        width={700}
        okText="บันทึก"
        cancelText="ยกเลิก"
        confirmLoading={submitLoading}
        maskClosable={false}
      >
        <Divider />
        
        <Form
          form={form}
          layout="vertical"
          style={{ paddingTop: 8 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              name="date_task"
              label="วันที่ปฏิบัติงาน"
              rules={[{ required: true, message: 'กรุณาเลือกวันที่' }]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="เลือกวันที่"
                size="large"
                disabledDate={disabledPastDate}
              />
            </Form.Item>
            
            <Form.Item
              name="type_task"
              label="ประเภทงาน"
              rules={[{ required: true, message: 'กรุณาเลือกประเภทงาน' }]}
            >
              <Select placeholder="เลือกประเภทงาน" size="large">
                {taskTypes.map(type => (
                  <Option key={type} value={type}>
                    <Tag color={taskTypeColors[type]} style={{ margin: 0 }}>
                      {type}
                    </Tag>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="building_id"
            label="อาคาร"
            rules={[{ required: true, message: 'กรุณาเลือกอาคาร' }]}
          >
            <Select placeholder="เลือกอาคาร" size="large">
              {buildings.map(building => (
                <Option key={building.ID} value={building.ID}>
                  <Space>
                    <HomeOutlined />
                    {getBuildingDisplayName(building)} 
                    <Text type="secondary">({getSizeDisplayName(building.Size || building.size || '')})</Text>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
          label="พนักงานที่มอบหมาย" 
          rules={[{ required: true }]}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {selectedStaff ? (
                <Card 
                  size="small" 
                  style={{ flex: 1, border: '2px solid #5f97ffff' }}
                  bodyStyle={{ padding: '12px' }}
                >
                  <Space>
                    <Avatar 
                      icon={<UserOutlined />} 
                      style={{ backgroundColor: '#fa9e25ff' }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, color: '#fa9e25ff' }}>
                        {selectedStaff.name || getStaffDisplayName(selectedStaff)}
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {selectedStaff.position || 'พนักงาน'} - {selectedStaff.department || 'ทั่วไป'}
                      </div>
                    </div>
                  </Space>
                </Card>
              ) : (
                <div style={{ 
                  flex: 1, 
                  color: '#8c8c8c', 
                  textAlign: 'center',
                  padding: '20px',
                  border: '1px dashed #d9d9d9',
                  borderRadius: '6px'
                }}>
                  ยังไม่ได้เลือกพนักงาน
                </div>
              )}
              <Button 
                className='btn-action'
                onClick={openStaffModal}
                icon={<UserOutlined />}
                size="large"
              >
                เลือกพนักงาน
              </Button>
            </div>
          </Form.Item>

          <Form.Item
            name="detail_task"
            label="รายละเอียดงาน"
          >
            <TextArea
              rows={4}
              placeholder="ระบุรายละเอียดของงาน..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Staff Selection Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            เลือกพนักงาน
          </Space>
        }
        open={staffModalVisible}
        onCancel={() => {
          setStaffModalVisible(false);
          setStaffSearchText('');
        }}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="ค้นหาพนักงาน..."
            prefix={<SearchOutlined />}
            value={staffSearchText}
            onChange={e => setStaffSearchText(e.target.value)}
            size="large"
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {filteredStaffs.map(staff => {
            const displayName = staff.name || getStaffDisplayName(staff);
            const isSelected = selectedStaff?.ID === staff.ID;
            return (
              <Card
                key={staff.ID}
                hoverable
                onClick={() => selectStaff(staff)}
                style={{
                  border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  backgroundColor: isSelected ? '#f0f8ff' : 'white',
                  cursor: 'pointer'
                }}
                bodyStyle={{ padding: '16px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Avatar 
                      size={40} 
                      icon={<UserOutlined />}
                      style={{ 
                        backgroundColor: isSelected ? '#1890ff' : '#87d068' 
                      }}
                    />
                    <div>
                      <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        color: isSelected ? '#1890ff' : 'inherit'
                      }}>
                        {displayName}
                      </div>
                      <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                        @{staff.username}
                      </div>
                    </div>
                  </Space>
                  
                  <Divider style={{ margin: '8px 0' }} />
                  
                  <div style={{ fontSize: '12px' }}>
                    {staff.position && (
                      <div style={{ marginBottom: '4px' }}>
                        <ToolOutlined /> {staff.position}
                      </div>
                    )}
                    {staff.department && (
                      <div style={{ marginBottom: '4px' }}>
                        <HomeOutlined /> {staff.department}
                      </div>
                    )}
                    {staff.email && (
                      <div style={{ marginBottom: '4px' }}>
                        <MailOutlined /> {staff.email}
                      </div>
                    )}
                    {staff.phone && (
                      <div>
                        <PhoneOutlined /> {staff.phone}
                      </div>
                    )}
                  </div>
                </Space>
              </Card>
            );
          })}
        </div>

        {filteredStaffs.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: 60, 
            color: '#8c8c8c',
            fontSize: '16px'
          }}>
            <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
            <div>ไม่พบพนักงานที่ตรงกับการค้นหา</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageComponent;