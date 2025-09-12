// src/pages/userDashboard/HitorySponsorship/index.tsx
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
  Alert,
  Modal,
  message,
  Descriptions,
  Popconfirm,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  CalendarOutlined,
  HeartOutlined,
  CrownOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  BellOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import "./style.css";

// ===== ใช้ interface ที่รับค่าดิบจาก BE =====
import type { SponsorshipListResponse } from "../../../interfaces/SponsorshipStaff";
import { sponsorshipAPI } from "../../../services/apis";

const { Title, Text } = Typography;
const { Option } = Select;

/* ---------- View model สำหรับตาราง (map จาก BE) ---------- */
interface SponsorInterface {
  ID: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sponsor_type: "user" | "guest";
}

interface DogInterface {
  ID: number;
  name: string;
  photo_url: string;
  breed: string;
  age: number;
  description: string;
}

interface NotificationPreference {
  receive_notifications: boolean;
  notification_method?: "SMS" | "Line" | "Email";
  notification_frequency?: "weekly" | "biweekly" | "monthly" | "quarterly";
}

interface SponsorshipInterface {
  ID: number;
  sponsor: SponsorInterface;
  dog: DogInterface;
  sponsorship_date: string; // from BE.CreatedAt
  sponsorship_type: "one-time" | "subscription";
  frequency?: "monthly" | "quarterly" | "yearly";
  amount: number;
  status: "paid" | "active" | "cancelled" | "expired";
  transaction_ref: string;
  payment_status: "success" | "pending" | "failed";
  description?: string;
  next_payment_date?: string;
  created_at: string;
  notification_preferences: NotificationPreference;
}

type SponsorshipType = "all" | "one-time" | "subscription";
type SortOrder = "latest" | "oldest";

interface StatusConfig {
  text: string;
  color: "success" | "error" | "warning" | "processing" | "default";
}

interface TypeConfig {
  text: string;
  color: string;
  icon: React.ReactNode;
}

/* ---------- Maps/Config ---------- */
const STATUS_MAP: Record<string, StatusConfig> = {
  paid: { text: "ชำระแล้ว", color: "success" },
  active: { text: "ใช้งานอยู่", color: "processing" },
  cancelled: { text: "ยกเลิก", color: "error" },
  expired: { text: "หมดอายุ", color: "warning" },
};

const TYPE_MAP: Record<string, TypeConfig> = {
  "one-time": { text: "รายครั้ง", color: "#253C90", icon: <HeartOutlined /> },
  subscription: { text: "ต่อเนื่อง", color: "#ff6600", icon: <CrownOutlined /> },
};

const PAYMENT_STATUS_MAP: Record<string, StatusConfig> = {
  success: { text: "สำเร็จ", color: "success" },
  pending: { text: "รอดำเนินการ", color: "warning" },
  failed: { text: "ล้มเหลว", color: "error" },
};

const FREQUENCY_MAP: Record<string, string> = {
  monthly: "รายเดือน",
  quarterly: "รายไตรมาส",
  yearly: "รายปี",
};

const NOTIFICATION_METHOD_MAP: Record<string, string> = {
  SMS: "SMS",
  Line: "Line",
  Email: "อีเมล",
};

const NOTIFICATION_FREQUENCY_MAP: Record<string, string> = {
  weekly: "รายสัปดาห์",
  biweekly: "ราย 2 สัปดาห์",
  monthly: "รายเดือน",
  quarterly: "รายไตรมาส",
};

/* ---------- Helpers: mapping จาก BE → View ---------- */

// map สถานะ sponsorship → สถานะที่ตารางใช้
function mapSponsorshipStatusToView(
  status: string,
  planType: "one-time" | "subscription"
): SponsorshipInterface["status"] {
  const s = (status || "").toLowerCase();
  if (s === "active") return "active";
  if (s === "canceled" || s === "cancelled") return "cancelled";
  if (s === "expired") return "expired";
  if (s === "completed" || s === "complete") return "paid";
  return planType === "one-time" ? "paid" : "active";
}

// map สถานะ payment
function mapPaymentStatusToView(status?: string): "success" | "pending" | "failed" {
  const s = (status || "").toUpperCase();
  if (s === "SUCCEEDED") return "success";
  if (s === "FAILED") return "failed";
  return "pending";
}

// ช่องทางแจ้งเตือน
function mapChannelToMethod(ch?: string): NotificationPreference["notification_method"] {
  switch ((ch || "").toLowerCase()) {
    case "sms":
      return "SMS";
    case "line":
      return "Line";
    case "email":
      return "Email";
    default:
      return undefined;
  }
}

// mapper: AdminList item -> view model
function mapAdminItemToView(
  item: SponsorshipListResponse["items"][number]
): SponsorshipInterface {
  const lastPayment =
    item.sponsorship_payments && item.sponsorship_payments.length > 0
      ? item.sponsorship_payments[0]
      : undefined;

  const plan = item.plan_type as "one-time" | "subscription";

  return {
    ID: item.ID,
    sponsorship_date: (item.CreatedAt as unknown as string) || "",
    sponsorship_type: plan,
    amount: item.amount,
    status: mapSponsorshipStatusToView(item.status, plan),
    transaction_ref: lastPayment?.transaction_ref || "",
    payment_status: mapPaymentStatusToView(lastPayment?.status),
    description: item.note || undefined,
    created_at: (item.CreatedAt as unknown as string) || "",

    // subscription
    frequency: (item.subscription?.interval as any) || undefined,
    next_payment_date: (item.subscription?.next_payment_at as unknown as string) || undefined,

    // sponsor
    sponsor: {
      ID: item.sponsor.ID,
      first_name: item.sponsor.first_name || "",
      last_name: item.sponsor.last_name || "",
      email: item.sponsor.email || "",
      phone: item.sponsor.phone || "",
      sponsor_type: item.sponsor.kind === "user" ? "user" : "guest",
    },

    // dog (รองรับกรณี BE ส่ง image_url แทน photo_url)
    dog: {
      ID: item.dog.ID,
      name: item.dog.name || "-",
      photo_url: item.dog.photo_url || (item.dog as any).image_url || "",
      breed: "",
      age: 0,
      description: "",
    },

    // แจ้งเตือน
    notification_preferences: {
      receive_notifications: Boolean(item.enabled),
      notification_method: mapChannelToMethod(item.channel || undefined),
      notification_frequency: (item.frequency as any) || undefined,
    },
  };
}

/* ========================= Component ========================= */
const SponsorshipHistory: React.FC = () => {
  const [allSponsorships, setAllSponsorships] = useState<SponsorshipInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SponsorshipType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("latest");
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [filteredData, setFilteredData] = useState<SponsorshipInterface[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedSponsorship, setSelectedSponsorship] =
    useState<SponsorshipInterface | null>(null);

  // Fetch data (REAL API)
  useEffect(() => {
    const fetchSponsorships = async () => {
      try {
        setLoading(true);
        setError(null);

        const raw: SponsorshipListResponse = await sponsorshipAPI.getAll();
        const items = (raw?.items ?? []).map(mapAdminItemToView);

        setAllSponsorships(items);
      } catch (err) {
        console.error("Failed to fetch sponsorships:", err);
        setError("ไม่สามารถโหลดข้อมูลการอุปถัมภ์ได้");
      } finally {
        setLoading(false);
      }
    };
    fetchSponsorships();
  }, []);

  // Filter + Sort
  useEffect(() => {
    let filtered = [...allSponsorships];

    if (activeTab !== "all") {
      filtered = filtered.filter((r) => r.sponsorship_type === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((r) => {
        const fullName = `${r.sponsor?.first_name || ""} ${r.sponsor?.last_name || ""}`.toLowerCase();
        const dogName = r.dog?.name?.toLowerCase() || "";
        const id = r.ID?.toString() || "";
        return fullName.includes(q) || dogName.includes(q) || id.includes(q);
      });
    }

    filtered.sort((a, b) => {
      const aT = new Date(a.sponsorship_date || 0).getTime();
      const bT = new Date(b.sponsorship_date || 0).getTime();
      return sortOrder === "latest" ? bT - aT : aT - bT;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortOrder, allSponsorships]);

  // Actions
  const handleView = (record: SponsorshipInterface) => {
    setSelectedSponsorship(record);
    setViewModalVisible(true);
  };

  const handleDelete = async (record: SponsorshipInterface) => {
  try {
    setLoading(true);

    // เรียก DELETE /sponsorships/:id (staff id ฝังมาจาก middleware ฝั่ง BE)
    await sponsorshipAPI.remove(record.ID);

    // ลบออกจาก state
    setAllSponsorships(prev => prev.filter(i => i.ID !== record.ID));
    message.success("ลบการอุปถัมภ์เรียบร้อยแล้ว");
  } catch (e: any) {
    console.error("delete sponsorship failed:", e);
    message.error(e?.response?.data?.error || "ไม่สามารถลบการอุปถัมภ์ได้");
  } finally {
    setLoading(false);
  }
};


  // Utils
  const getSponsorFullName = (s: SponsorInterface) =>
    `${s?.first_name || ""} ${s?.last_name || ""}`.trim();

  const formatDate = (d: string | Date | undefined) => {
    if (!d) return "ไม่ระบุวันที่";
    const date = new Date(d);
    return isNaN(date.getTime())
      ? "วันที่ไม่ถูกต้อง"
      : date.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" });
  };

  const getStatusBadge = (status: string | undefined) => {
    const info =
      STATUS_MAP[(status || "").toLowerCase()] ||
      ({ text: status || "ไม่ระบุสถานะ", color: "default" } as StatusConfig);
    return <Badge status={info.color} text={info.text} />;
  };

  const getTypeTag = (type: string | undefined, frequency?: string) => {
    const info = TYPE_MAP[(type || "").toLowerCase()];
    if (!info) return <Tag>{type || "ไม่ระบุ"}</Tag>;
    const text =
      type === "subscription" && frequency
        ? `${info.text} (${FREQUENCY_MAP[frequency] || frequency})`
        : info.text;
    return (
      <Tag color={info.color} icon={info.icon} className="type-tag">
        {text}
      </Tag>
    );
  };

  const getPaymentStatusBadge = (status: string | undefined) => {
    const info =
      PAYMENT_STATUS_MAP[(status || "").toLowerCase()] ||
      ({ text: status || "ไม่ระบุสถานะ", color: "default" } as StatusConfig);
    return <Badge status={info.color} text={info.text} />;
  };

  const getNotificationBell = (pref: NotificationPreference) => (
    <BellOutlined
      className={`notification-bell-icon ${pref.receive_notifications ? "active" : "inactive"}`}
    />
  );

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setSelectedRecords((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const getTabCount = (type: SponsorshipType) =>
    type === "all"
      ? allSponsorships.length
      : allSponsorships.filter((r) => r.sponsorship_type === type).length;

  // Columns
  const columns: ColumnsType<SponsorshipInterface> = [
    {
      title: "",
      dataIndex: "checkbox",
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRecords.includes(record.ID)}
          onChange={(e) => handleCheckboxChange(record.ID, e.target.checked)}
        />
      ),
    },
    {
      title: "รหัส",
      dataIndex: "ID",
      key: "ID",
      width: 100,
      render: (id: number) => (
        <Text copyable={{ text: id.toString() }} className="copy-text">
          ID: {id}
        </Text>
      ),
    },
    {
      title: "สุนัข",
      key: "dog",
      width: 120,
      render: (_, record) => (
        <div className="dog-avatar-container">
          <Avatar size={50} src={record.dog?.photo_url} icon={<UserOutlined />} />
          <div className="dog-name">{record.dog?.name}</div>
        </div>
      ),
    },
    {
      title: "ชื่อผู้อุปถัมภ์",
      key: "sponsorName",
      render: (_, record) => <Text strong>{getSponsorFullName(record.sponsor)}</Text>,
    },
    {
      title: "วันที่อุปถัมภ์",
      dataIndex: "sponsorship_date",
      key: "date",
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text>{formatDate(date)}</Text>
        </Space>
      ),
    },
    {
      title: "ประเภท",
      dataIndex: "sponsorship_type",
      key: "type",
      render: (type, record) => getTypeTag(type, record.frequency),
    },
    {
      title: "จำนวนเงิน",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong className="amount-text">{amount?.toLocaleString()} บาท</Text>
      ),
    },
    {
      title: "การรับข่าวสาร",
      key: "notifications",
      width: 120,
      align: "center",
      render: (_, record) => <div className="notification-bell">{getNotificationBell(record.notification_preferences)}</div>,
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      key: "status",
      render: getStatusBadge,
    },
    {
      title: "การดำเนินการ",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "view",
                label: (
                  <Space className="action-menu-item">
                    <EyeOutlined />
                    ดูรายละเอียด
                  </Space>
                ),
                onClick: () => handleView(record),
              },
              { type: "divider" as const },
              {
                key: "delete",
                label: (
                  <Popconfirm
                    title="ยืนยันการลบ"
                    description="คุณต้องการลบการอุปถัมภ์นี้หรือไม่?"
                    okText="ลบ"
                    cancelText="ยกเลิก"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => handleDelete(record)}
                  >
                    <Space className="action-menu-item danger">
                      <DeleteOutlined />
                      ลบ
                    </Space>
                  </Popconfirm>
                ),
                danger: true,
              },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" className="action-button" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleTabChange = (tab: SponsorshipType) => setActiveTab(tab);

  if (error) return <Alert message="Error" description={error} type="error" showIcon />;

  return (
    <div className="sponsorship-container">
      <div className="header-section">
        <Title level={2} className="main-title">
          ประวัติการอุปถัมภ์สุนัข
        </Title>
        <div className="title-divider" />

        <div className="search-container">
          <div className="search-wrapper">
            <Input
              placeholder="ค้นหาด้วยชื่อผู้อุปถัมภ์, ชื่อสุนัข, รหัส"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<SearchOutlined />}
              size="large"
              className="search-input"
            />
          </div>
        </div>
      </div>

      <Card className="main-card">
        <div className="tab-container">
          <div className="tab-header">
            <div className="tab-buttons">
              <button
                className={`tab-button ${activeTab === "all" ? "active" : "inactive"}`}
                onClick={() => handleTabChange("all")}
              >
                <CalendarOutlined className="tab-icon" />
                <span>ประวัติอุปถัมภ์ทั้งหมด</span>
                <span className={`tab-count ${activeTab === "all" ? "active" : "inactive"}`}>
                  {getTabCount("all")}
                </span>
              </button>

              <button
                className={`tab-button ${activeTab === "one-time" ? "active" : "inactive"}`}
                onClick={() => handleTabChange("one-time")}
              >
                <HeartOutlined className="tab-icon" />
                <span>อุปถัมภ์รายครั้ง</span>
                <span className={`tab-count ${activeTab === "one-time" ? "active" : "inactive"}`}>
                  {getTabCount("one-time")}
                </span>
              </button>

              <button
                className={`tab-button ${activeTab === "subscription" ? "active" : "inactive"}`}
                onClick={() => handleTabChange("subscription")}
              >
                <CrownOutlined className="tab-icon" />
                <span>อุปถัมภ์ต่อเนื่อง</span>
                <span
                  className={`tab-count ${activeTab === "subscription" ? "active" : "inactive"}`}
                >
                  {getTabCount("subscription")}
                </span>
              </button>
            </div>

            <div className="controls-section">
              <Select value={sortOrder} onChange={setSortOrder} className="sort-select" size="middle">
                <Option value="latest">ล่าสุด</Option>
                <Option value="oldest">เก่าสุด</Option>
              </Select>
            </div>
          </div>
        </div>

        <div className="table-content">
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
                showTotal: (total, range) => `${range[0]}-${range[1]} จาก ${total} รายการ`,
                className: "pagination-style",
              }}
              scroll={{ x: 1200 }}
              className="data-table"
            />
          </Spin>
        </div>
      </Card>

      <Modal
        title={<div className="modal-title">รายละเอียดการอุปถัมภ์</div>}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[<Button key="close" onClick={() => setViewModalVisible(false)}>ปิด</Button>]}
        width={800}
      >
        {selectedSponsorship && (
          <div>
            <Descriptions title={<div className="descriptions-title">รายละเอียดผู้อุปถัมภ์</div>} bordered column={2}>
              <Descriptions.Item label="ชื่อ-นามสกุล">{getSponsorFullName(selectedSponsorship.sponsor)}</Descriptions.Item>
              <Descriptions.Item label="อีเมล">{selectedSponsorship.sponsor?.email || "ไม่ระบุ"}</Descriptions.Item>
              <Descriptions.Item label="เบอร์โทรศัพท์">{selectedSponsorship.sponsor?.phone || "ไม่ระบุ"}</Descriptions.Item>
              <Descriptions.Item label="ประเภทผู้อุปถัมภ์">{selectedSponsorship.sponsor?.sponsor_type === "user" ? "สมาชิก" : "ผู้อุปถัมภ์ทั่วไป"}</Descriptions.Item>
            </Descriptions>

            <Descriptions title={<div className="descriptions-title">รายละเอียดสุนัขที่ถูกอุปถัมภ์</div>} bordered column={2} className="descriptions-spacing">
              <Descriptions.Item label="รูปสุนัข" span={2}>
                <div className="modal-dog-image">
                  <Avatar size={120} src={selectedSponsorship.dog?.photo_url} icon={<UserOutlined />} />
                  <div className="modal-dog-name">{selectedSponsorship.dog?.name}</div>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="ชื่อ">{selectedSponsorship.dog?.name || "ไม่ระบุ"}</Descriptions.Item>
              <Descriptions.Item label="พันธุ์">{selectedSponsorship.dog?.breed || "ไม่ระบุ"}</Descriptions.Item>
              <Descriptions.Item label="อายุ">{selectedSponsorship.dog?.age ? `${selectedSponsorship.dog.age} ปี` : "ไม่ระบุ"}</Descriptions.Item>
              <Descriptions.Item label="คำอธิบาย" span={2}>{selectedSponsorship.dog?.description || "ไม่มีคำอธิบาย"}</Descriptions.Item>
            </Descriptions>

            <Descriptions title={<div className="descriptions-title">รายละเอียดการอุปถัมภ์</div>} bordered column={2} className="descriptions-spacing">
              <Descriptions.Item label="รหัสการอุปถัมภ์">{selectedSponsorship.ID}</Descriptions.Item>
              <Descriptions.Item label="วันที่อุปถัมภ์">{formatDate(selectedSponsorship.sponsorship_date)}</Descriptions.Item>
              <Descriptions.Item label="ประเภทการอุปถัมภ์">{getTypeTag(selectedSponsorship.sponsorship_type, selectedSponsorship.frequency)}</Descriptions.Item>
              {selectedSponsorship.sponsorship_type === "subscription" && selectedSponsorship.frequency && (
                <Descriptions.Item label="ความถี่"><Tag color="#108ee9">{FREQUENCY_MAP[selectedSponsorship.frequency] || selectedSponsorship.frequency}</Tag></Descriptions.Item>
              )}
              <Descriptions.Item label="สถานะ">{getStatusBadge(selectedSponsorship.status)}</Descriptions.Item>
              <Descriptions.Item label="จำนวนเงิน">{selectedSponsorship.amount?.toLocaleString()} บาท</Descriptions.Item>
              <Descriptions.Item label="หมายเลขอ้างอิง">{selectedSponsorship.transaction_ref || "ไม่มี"}</Descriptions.Item>
              <Descriptions.Item label="สถานะการชำระเงิน">{getPaymentStatusBadge(selectedSponsorship.payment_status)}</Descriptions.Item>
              {selectedSponsorship.next_payment_date && (
                <Descriptions.Item label="วันที่ชำระครั้งถัดไป">{formatDate(selectedSponsorship.next_payment_date)}</Descriptions.Item>
              )}
              <Descriptions.Item label="คำอธิบาย" span={2}>{selectedSponsorship.description || "ไม่มีคำอธิบาย"}</Descriptions.Item>
            </Descriptions>

            <Descriptions title={<div className="descriptions-title">การรับข่าวสาร</div>} bordered column={2} className="descriptions-spacing">
              <Descriptions.Item label="รับข่าวสารของสุนัขที่อุปถัมภ์">
                <div className="notification-display">
                  {getNotificationBell(selectedSponsorship.notification_preferences)}
                  <span>{selectedSponsorship.notification_preferences.receive_notifications ? "ใช่" : "ไม่"}</span>
                </div>
              </Descriptions.Item>
              {selectedSponsorship.notification_preferences.receive_notifications && (
                <>
                  <Descriptions.Item label="ช่องทางการส่งข้อมูล">
                    <Tag color="#2db7f5">
                      {NOTIFICATION_METHOD_MAP[selectedSponsorship.notification_preferences.notification_method || ""] || "ไม่ระบุ"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="ความถี่การรับข่าวสาร" span={2}>
                    <Tag color="#87d068">
                      {NOTIFICATION_FREQUENCY_MAP[selectedSponsorship.notification_preferences.notification_frequency || ""] || "ไม่ระบุ"}
                    </Tag>
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SponsorshipHistory;
