import React, { useState, useEffect } from "react";
import { 
  Input, 
  Card,
  Typography,
  Table,
  Space,
  Select,
  Badge,
  Button,
  Dropdown,
  Checkbox,
  Tag,
  Spin,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  MoreOutlined,
  CalendarOutlined,
  DollarOutlined,
  GiftOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { donationAPI } from "../../../services/apis";
import type {
    DonorInterface,
    DonationInterface,
    MoneyDonationInterface,
    ItemDonationInterface,
    ItemInterface,
    UnitInterface
} from "../../../interfaces/Donation";
import "./style.css";

const { Title, Text } = Typography;
const { Option } = Select;

// Extended interfaces สำหรับ API response
interface ApiDonationResponse extends DonationInterface {
  donor: DonorInterface;
  item_donations: Array<ItemDonationInterface & {
    item: ItemInterface;
    unit: UnitInterface;
  }>;
  money_donations: MoneyDonationInterface[];
}

type DonationType = 'all' | 'money' | 'item';
type SortOrder = 'latest' | 'oldest';

interface StatusConfig {
  text: string;
  color: 'success' | 'error' | 'warning' | 'processing' | 'default';
}

interface TypeConfig {
  text: string;
  color: string;
  icon: React.ReactNode;
}

const DonationHistory: React.FC = () => {
  const [allDonations, setAllDonations] = useState<ApiDonationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DonationType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest');
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [filteredData, setFilteredData] = useState<ApiDonationResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Constants
  const STATUS_MAP: Record<string, StatusConfig> = {
    complete: { text: 'สำเร็จ', color: 'success' },
    cancelled: { text: 'ยกเลิก', color: 'error' },
    cancel: { text: 'ยกเลิก', color: 'error' },
    pending: { text: 'รอดำเนินการ', color: 'warning' },
    active: { text: 'ใช้งานอยู่', color: 'processing' },
    success: { text: 'สำเร็จ', color: 'success' },
  };

  const TYPE_MAP: Record<string, TypeConfig> = {
    money: { text: 'เงิน', color: 'blue', icon: <DollarOutlined /> },
    item: { text: 'สิ่งของ', color: 'green', icon: <GiftOutlined /> },
  };

  // Fetch data from API
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await donationAPI.getAll();
        setAllDonations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch donations:", err);
        setError("ไม่สามารถโหลดข้อมูลการบริจาคได้");
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  // Filter and sort data
  useEffect(() => {
    let filtered = [...allDonations];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(record => record.donation_type === activeTab);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record => {
        const fullName = `${record.donor?.first_name || ''} ${record.donor?.last_name || ''}`.toLowerCase();
        const id = record.ID?.toString() || '';
        return fullName.includes(query) || id.includes(query);
      });
    }

    // Sort data
    filtered.sort((a, b) => {
      const dateA = new Date(a.donation_date || 0).getTime();
      const dateB = new Date(b.donation_date || 0).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortOrder, allDonations]);

  // Utility functions
  const getDonorFullName = (donor: DonorInterface): string => {
    return `${donor?.first_name || ''} ${donor?.last_name || ''}`.trim();
  };

  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return 'ไม่ระบุวันที่';
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? 'วันที่ไม่ถูกต้อง'
      : date.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string | undefined) => {
    const statusInfo = STATUS_MAP[status?.toLowerCase() || ''] || 
      { text: status || 'ไม่ระบุสถานะ', color: 'default' as const };
    return <Badge color={statusInfo.color} text={statusInfo.text} />;
  };

  const getTypeTag = (type: string | undefined) => {
    const typeInfo = TYPE_MAP[type?.toLowerCase() || ''];
    
    if (!typeInfo) {
      return <Tag>{type || 'ไม่ระบุ'}</Tag>;
    }

    return (
      <Tag color={typeInfo.color} icon={typeInfo.icon}>
        {typeInfo.text}
      </Tag>
    );
  };



  const handleCheckboxChange = (recordId: number, checked: boolean) => {
    setSelectedRecords(prev => 
      checked 
        ? [...prev, recordId]
        : prev.filter(id => id !== recordId)
    );
  };

  const getTabCount = (type: DonationType): number => {
    if (type === 'all') return allDonations.length;
    return allDonations.filter(r => r.donation_type === type).length;
  };

  // Table columns
  const columns: ColumnsType<ApiDonationResponse> = [
    {
      title: '',
      dataIndex: 'checkbox',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRecords.includes(record.ID!)}
          onChange={(e) => handleCheckboxChange(record.ID!, e.target.checked)}
        />
      )
    },
    {
      title: 'รหัสการบริจาค',
      dataIndex: 'ID',
      key: 'ID',
      render: (id: number) => (
        <Text copyable={{ text: id.toString() }}>
          ID: {id}
        </Text>
      )
    },
    {
      title: 'ชื่อผู้บริจาค',
      key: 'donorName',
      render: (_, record) => <Text strong>{getDonorFullName(record.donor)}</Text>
    },
    {
      title: 'วันที่',
      dataIndex: 'donation_date',
      key: 'date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text>{formatDate(date)}</Text>
        </Space>
      )
    },
    {
      title: 'ประเภท',
      dataIndex: 'donation_type',
      key: 'type',
      render: getTypeTag
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: getStatusBadge
    },
    {
      title: 'การดำเนินการ',
      key: 'action',
      render: () => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', label: 'ดูรายละเอียด' },
              { key: 'edit', label: 'แก้ไข' },
              { key: 'delete', label: 'ลบ', danger: true }
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" style={{ marginLeft: '30px' }} icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  // Event handlers
  const handleTabChange = (tab: DonationType) => {
    setActiveTab(tab);
  };

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <div className="donation-history-page">
      <div className="page-header">
        <Title level={2} className="page-title" style={{ fontFamily: 'Anakotmai', color: '#ff6600' , fontSize: '50px',marginTop: '-20px'}}>
          ประวัติการบริจาค
        </Title>
        <div className="title-underline"></div>
        
        <div className="page-controls">
          <div className="search-section">
            <Input
              placeholder="ค้นหาด้วยชื่อผู้บริจาค, รหัส"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              className="search-input"
              style={{ width: '2500px', maxWidth: '100%',marginLeft: '2px' }}
            />
          </div>
        </div>
      </div>

      <Card className="donation-history-card">
        <div className="tab-section">
          <div className="tab-header">
            <div className="custom-tabs">
              <button
                className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => handleTabChange('all')}
              >
                <CalendarOutlined />
                <span>ประวัติทั้งหมด</span>
                <span className="tab-count">{getTabCount('all')}</span>
              </button>
              
              <button
                className={`tab-button ${activeTab === 'money' ? 'active' : ''}`}
                onClick={() => handleTabChange('money')}
              >
                <DollarOutlined />
                <span>บริจาคเงิน</span>
                <span className="tab-count">{getTabCount('money')}</span>
              </button>
              
              <button
                className={`tab-button ${activeTab === 'item' ? 'active' : ''}`}
                onClick={() => handleTabChange('item')}
              >
                <GiftOutlined />
                <span>บริจาคสิ่งของ</span>
                <span className="tab-count">{getTabCount('item')}</span>
              </button>
            </div>
            
            <div className="tab-controls">
              <Select
                value={sortOrder}
                onChange={setSortOrder}
                style={{ width: 120 }}
                size="middle"
              >
                <Option value="latest">ล่าสุด</Option>
                <Option value="oldest">เก่าสุด</Option>
              </Select>
            </div>
          </div>
        </div>

        <div className="table-section">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="ID"
              pagination={{
                current: currentPage,
                onChange: setCurrentPage,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} จาก ${total} รายการ`,
                className: 'custom-pagination'
              }}
              className="donation-table"
              scroll={{ x: 1200 }}
            />
          </Spin>
        </div>
      </Card>
    </div>
  );
};

export default DonationHistory;