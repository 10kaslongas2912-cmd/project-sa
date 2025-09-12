// src/pages/account/MySponsorships.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  Typography,
  Tag,
  Table,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
  Button,
  Space,
  Statistic,
  Avatar,
  message,
  Popconfirm,
} from "antd";
import {
  HeartOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  HistoryOutlined,
  WalletOutlined,
  CalendarOutlined,
  UserOutlined,
  CrownOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import type { GetMySponsorshipsResponse, MySponsorshipItem } from "../../../interfaces/Sponsorship";
import { sponsorshipAPI } from "../../../services/apis";
import { useAuthUser } from "../../../hooks/useAuth";
import { publicUrl } from "../../../utils/publicUrl";

const { Title, Text, Paragraph } = Typography;

/* ---------- View model สำหรับตาราง ---------- */
interface SponsorshipRecord {
  ID: number;
  sponsorship_date: string; // CreatedAt
  sponsorship_type: "one-time" | "subscription";
  status: "success" | "active" | "cancelled" | "failed";
  amount: number;
  transaction_ref?: string;
  dog: {
    ID: number;
    name: string;
    photo_url?: string;
  };
  next_billing_date?: string; // จาก BE: subscription.next_payment_at (หากยัง active)
  period_end?: string; // จาก BE: subscription.current_period_end
  subscription_id?: number | null; // ใช้ยิงยกเลิก/กลับมาใช้งาน
  subscription_interval?: string; // 'monthly' | 'quarterly' | 'yearly'
}

/* ---------- Summary (อิง sponsorship_payments ที่สำเร็จ) ---------- */
type Summary = {
  total_one_time: number;        // ยอดชำระจริงแบบ one-time
  total_subscription: number;    // ยอดชำระจริงแบบ subscription
  total_all: number;             // รวมทั้งหมด (2 + 3)
};

/* ---------- Helpers ---------- */
const thDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(amount);

function mapStatusToView(status: string): SponsorshipRecord["status"] {
  switch ((status || "").toLowerCase()) {
    case "completed":
      return "success";
    case "active":
      return "active";
    case "canceled":
    case "cancelled":
      return "cancelled";
    case "pending":
      return "failed";
    default:
      return "success";
  }
}

const withinPeriod = (iso?: string) => !!iso && new Date() < new Date(iso);
const canReactivate = (r: SponsorshipRecord) =>
  r.sponsorship_type === "subscription" && r.status === "cancelled" && withinPeriod(r.period_end);

// แปลง interval -> label/suffix ภาษาไทย
const intervalDict: Record<string, { label: string; suffix: string }> = {
  monthly:   { label: "รายเดือน",   suffix: "/เดือน" },
  quarterly: { label: "รายไตรมาส", suffix: "/ไตรมาส" },
  yearly:    { label: "รายปี",      suffix: "/ปี" },
};
const getIntervalLabel = (i?: string) => (i && intervalDict[i]?.label) || "รายงวด";
const getIntervalSuffix = (i?: string) => (i && intervalDict[i]?.suffix) || "/งวด";

/** Mapper: BE item → View model */
function mapItemToRecord(item: MySponsorshipItem): SponsorshipRecord {
  return {
    ID: item.ID,
    sponsorship_date: item.CreatedAt,
    sponsorship_type: item.plan_type,
    status: mapStatusToView(item.status),
    amount: item.amount,
    transaction_ref: item.last_payment?.transaction_ref ?? undefined,
    dog: {
      ID: item.dog_id,
      name: item.dog_name || `Dog #${item.dog_id}`,
      photo_url: item.photo_url,
    },
    next_billing_date: item.subscription?.next_payment_at ?? undefined,
    period_end: item.subscription?.current_period_end ?? item.subscription?.next_payment_at ?? undefined,
    subscription_id: item.subscription?.ID ?? null,
    subscription_interval: (item.subscription as any)?.interval ?? undefined,
  };
}

const MySponsorships: React.FC = () => {
  const { user, isLoggedIn, loading: authLoading, refresh: refreshAuth } = useAuthUser();
  const [sponsorships, setSponsorships] = useState<SponsorshipRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null); // ใช้ร่วมทั้ง cancel/reactivate

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: GetMySponsorshipsResponse = await sponsorshipAPI.getMySponsorships();
      setSummary((data?.summary as unknown as Summary) ?? null);
      setSponsorships((data?.items || []).map(mapItemToRecord));
    } catch (e) {
      console.error("[MySponsorships] load error:", e);
      setError("ไม่สามารถโหลดประวัติการอุปถัมภ์ได้");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isLoggedIn) load();
  }, [authLoading, isLoggedIn, load]);

  // ใช้ค่าจาก BE ถ้ามีใน response; ไม่มีก็ fallback reload
  const applyServerUpdate = (resp: any, changedId: number) => {
    const item = resp?.item || resp?.data?.item; // รองรับทั้ง axios resp และ payload ตรง
    const newSummary = resp?.summary || resp?.data?.summary;

    if (item) {
      setSponsorships(prev => prev.map(s => (s.ID === changedId ? mapItemToRecord(item) : s)));
    }
    if (newSummary) {
      setSummary(newSummary as Summary);
    }
    if (!item || !newSummary) {
      // ถ้า BE ไม่ส่งกลับครบ ให้ reload เพื่อให้ FE ใช้ค่าจาก BE เสมอ
      load();
    }
  };

  const handleCancelSubscription = async (record: SponsorshipRecord) => {
    try {
      if (record.sponsorship_type !== "subscription") return;
      if (!record.subscription_id) return message.error("ไม่พบรหัสการสมัครสมาชิก");

      setBusyId(record.ID);
      message.loading({ content: "กำลังยกเลิก...", key: "sub", duration: 0 });

      const resp = await sponsorshipAPI.cancelSubscription(record.subscription_id, {
        cancel_at_period_end: true,
        status: "cancelled",
      });

      applyServerUpdate(resp, record.ID);
      message.success({ content: "ยกเลิกแล้ว (ยังใช้งานได้ถึงวันหมดรอบ)", key: "sub" });
    } catch (e) {
      console.error(e);
      message.error({ content: "เกิดข้อผิดพลาดในการยกเลิก", key: "sub" });
    } finally {
      setBusyId(null);
    }
  };

  const handleReactivate = async (record: SponsorshipRecord) => {
    try {
      if (!record.subscription_id) return message.error("ไม่พบรหัสการสมัครสมาชิก");
      if (!canReactivate(record)) return message.warning("เกินรอบเดิมแล้ว ไม่สามารถเปิดใช้งานได้");

      setBusyId(record.ID);
      message.loading({ content: "กำลังเปิดใช้งานอีกครั้ง...", key: "sub", duration: 0 });

      const resp = await sponsorshipAPI.reactivateSubscription(record.subscription_id, {
        status: "active",
        cancel_at_period_end: false,
      });

      applyServerUpdate(resp, record.ID);
      message.success({ content: "กลับมาใช้งานสำเร็จ", key: "sub" });
    } catch (e) {
      console.error(e);
      message.error({ content: "เปิดใช้งานไม่สำเร็จ", key: "sub" });
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Stats (4 คอลัมน์ อิง BE summary) ---------- */
  const stats = useMemo(() => {
    const totalOne = summary?.total_one_time ?? 0;
    const totalSub = summary?.total_subscription ?? 0;
    const totalAll = summary?.total_all ?? totalOne + totalSub; // fallback รวมเอง

    return {
      totalItems: sponsorships.length,
      totalOneTimePaid: totalOne,
      totalSubscriptionPaid: totalSub,
      totalPaidAll: totalAll,
    };
  }, [sponsorships.length, summary]);

  /* ---------- Table columns ---------- */
  const columns = [
    {
      title: "สุนัขที่อุปถัมภ์",
      key: "dog",
      width: "35%",
      render: (record: SponsorshipRecord) => (
        <Space size={12}>
          <Avatar
            size={60}
            src={record.dog.photo_url ? publicUrl(record.dog.photo_url) : undefined}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
          <div>
            <Text strong style={{ fontSize: 16, fontFamily: "Anakotmai" }}>
              {record.dog.name}
            </Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12, fontFamily: "Anakotmai" }}>
                <CalendarOutlined /> {thDate(record.sponsorship_date)}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "ประเภท & จำนวนเงิน",
      key: "details",
      width: "30%",
      render: (record: SponsorshipRecord) => (
        <Space direction="vertical" size={4}>
          {record.sponsorship_type === "subscription" ? (
            <Tag color="blue" icon={<CrownOutlined />} style={{ fontFamily: "Anakotmai" }}>
              {getIntervalLabel(record.subscription_interval)}
            </Tag>
          ) : (
            <Tag color="green" icon={<HeartOutlined />} style={{ fontFamily: "Anakotmai" }}>
              ครั้งเดียว
            </Tag>
          )}
          <Text strong style={{ fontSize: 18, color: "#1890ff", fontFamily: "Anakotmai" }}>
            {formatAmount(record.amount)}
            {record.sponsorship_type === "subscription" && getIntervalSuffix(record.subscription_interval)}
          </Text>
          {record.transaction_ref && (
            <Text code style={{ fontSize: 11 }}>
              {record.transaction_ref}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "สถานะ",
      key: "status",
      width: "25%",
      render: (record: SponsorshipRecord) => {
        const config: Record<
          SponsorshipRecord["status"],
          { color: any; icon: React.ReactNode; text: string }
        > = {
          success: { color: "success", icon: <CheckCircleOutlined />, text: "สำเร็จ" },
          active: { color: "processing", icon: <SyncOutlined spin />, text: "ใช้งานอยู่" },
          cancelled: { color: "default", icon: <CloseCircleOutlined />, text: "ยกเลิก" },
          failed: { color: "error", icon: <CloseCircleOutlined />, text: "ล้มเหลว" },
        };
        const c = config[record.status];

        return (
          <Space direction="vertical" size={4}>
            <Tag color={c.color} icon={c.icon} style={{ fontFamily: "Anakotmai" }}>
              {c.text}
            </Tag>
            {record.sponsorship_type === "subscription" && (
              <>
                {record.status === "active" && record.next_billing_date && (
                  <Text type="secondary" style={{ fontSize: 12, fontFamily: "Anakotmai" }}>
                    ต่ออายุ: {thDate(record.next_billing_date)}
                  </Text>
                )}
                {record.status === "cancelled" && record.period_end && (
                  <Text type="secondary" style={{ fontSize: 12, fontFamily: "Anakotmai" }}>
                    สิทธิ์กลับมาใช้งานได้ถึง: {thDate(record.period_end)}
                  </Text>
                )}
              </>
            )}
          </Space>
        );
      },
    },
    {
      title: "การจัดการ",
      key: "actions",
      width: "15%",
      render: (r: SponsorshipRecord) => {
        if (r.sponsorship_type === "subscription") {
          if (r.status === "active") {
            return (
              <Popconfirm
                title={<span style={{ fontFamily: "Anakotmai" }}>ยืนยันการยกเลิก</span>}
                description={
                  <div style={{ fontFamily: "Anakotmai" }}>
                    คุณแน่ใจหรือไม่ว่าต้องการยกเลิก<br />การอุปถัมภ์{getIntervalLabel(r.subscription_interval).replace('ราย', 'แบบ ')} "{r.dog.name}"?
                  </div>
                }
                onConfirm={() => handleCancelSubscription(r)}
                okText={<span style={{ fontFamily: "Anakotmai" }}>ยืนยัน</span>}
                cancelText={<span style={{ fontFamily: "Anakotmai" }}>ยกเลิก</span>}
              >
                <Button type="primary" danger size="small" loading={busyId === r.ID} icon={<CloseCircleOutlined />}>
                  ยกเลิก
                </Button>
              </Popconfirm>
            );
          }

          if (r.status === "cancelled" && canReactivate(r)) {
            return (
              <Popconfirm
                title={<span style={{ fontFamily: "Anakotmai" }}>ยืนยันการเปิดใช้งานอีกครั้ง</span>}
                description={
                  <div style={{ fontFamily: "Anakotmai" }}>
                    ต้องการกลับมาใช้งานการอุปถัมภ์{getIntervalLabel(r.subscription_interval).replace('ราย', 'แบบ ')}<br />"{r.dog.name}" ภายในรอบเดิมใช่ไหม?
                  </div>
                }
                onConfirm={() => handleReactivate(r)}
                okText={<span style={{ fontFamily: "Anakotmai" }}>ยืนยัน</span>}
                cancelText={<span style={{ fontFamily: "Anakotmai" }}>ยกเลิก</span>}
              >
                <Button type="primary" size="small" loading={busyId === r.ID} icon={<SyncOutlined />}>
                  กลับมาใช้งาน
                </Button>
              </Popconfirm>
            );
          }
        }
        return <Text type="secondary" style={{ fontFamily: "Anakotmai" }}>-</Text>;
      },
    },
  ];

  /* ---------- Guard: ต้อง login ---------- */
  if (authLoading) {
    return (
      <div style={{ fontFamily: "Anakotmai", padding: 24, maxWidth: 1200, margin: "0 auto", minHeight: "100vh", background: "#f5f5f5" }}>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, color: "#666" }}>กำลังตรวจสอบสิทธิ์...</div>
        </div>
      </div>
    );
  }
  if (!isLoggedIn) {
    return (
      <div style={{ fontFamily: "Anakotmai", padding: 24, maxWidth: 1200, margin: "0 auto" }}>
        <Alert
          message="กรุณาเข้าสู่ระบบ"
          description="ต้องเข้าสู่ระบบเพื่อดูประวัติการอุปถัมภ์ของคุณ"
          type="warning"
          showIcon
          action={<Button onClick={refreshAuth}>ลองโหลดใหม่</Button>}
        />
      </div>
    );
  }

  /* ---------- Loading / Error ของข้อมูลหน้า ---------- */
  if (loading) {
    return (
      <div style={{ fontFamily: "Anakotmai", padding: 24, maxWidth: 1200, margin: "0 auto", minHeight: "100vh", background: "#f5f5f5" }}>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, color: "#666" }}>กำลังโหลดประวัติการอุปถัมภ์...</div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ fontFamily: "Anakotmai", padding: 24, maxWidth: 1200, margin: "0 auto", minHeight: "100vh", background: "#f5f5f5" }}>
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={load} icon={<ReloadOutlined />}> {/* ✅ retry ไม่รีเฟรชทั้งหน้า */}
              ลองอีกครั้ง
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Anakotmai", padding: 24, maxWidth: 1200, margin: "0 auto", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Title level={1} style={{ color: "#253C90", marginBottom: 8 }}>
          ประวัติการอุปถัมภ์ของฉัน
        </Title>
        <Paragraph style={{ fontSize: 16, color: "#666", marginBottom: 16 }}>
          รายการการอุปถัมภ์น้องหมาทั้งหมดของ <Text strong>{user?.name ?? "ผู้ใช้"}</Text>
        </Paragraph>
        <div style={{ height: 5, width: "100%", maxWidth: 1200, backgroundColor: "#253C90", borderRadius: 2, margin: "0 auto 20px auto" }} />

        {/* Statistics: 4 คอลัมน์ตามสเปก */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {/* 1) จำนวนการอุปถัมภ์ทั้งหมด */}
          <Col xs={24} sm={6}>
            <Card hoverable style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", border: "1px solid #e9e9e9", background: "#fff" }}>
              <Statistic
                title={<span style={{ color: "#253C90" }}>การอุปถัมภ์ทั้งหมด</span>}
                value={stats.totalItems}
                prefix={<HistoryOutlined />}
                suffix="ครั้ง"
              />
            </Card>
          </Col>

          {/* 2) ยอด one-time สะสม */}
          <Col xs={24} sm={6}>
            <Card hoverable style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", border: "1px solid #e9e9e9", background: "#fff" }}>
              <Statistic
                title={<span style={{ color: "#253C90" }}>ยอดอุปถัมภ์ครั้งเดียว (สะสม)</span>}
                value={stats.totalOneTimePaid}
                prefix={<HeartOutlined />}
                suffix="บาท"
                formatter={(v) => `฿${Number(v).toLocaleString()}`}
              />
            </Card>
          </Col>

          {/* 3) ยอด subscription สะสม */}
          <Col xs={24} sm={6}>
            <Card hoverable style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", border: "1px solid #e9e9e9", background: "#fff" }}>
              <Statistic
                title={<span style={{ color: "#253C90" }}>ยอดอุปถัมภ์รายงวด (สะสม)</span>}
                value={stats.totalSubscriptionPaid}
                prefix={<CrownOutlined />}
                suffix="บาท"
                formatter={(v) => `฿${Number(v).toLocaleString()}`}
              />
            </Card>
          </Col>

          {/* 4) รวมทั้งหมด */}
          <Col xs={24} sm={6}>
            <Card hoverable style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", border: "1px solid #e9e9e9", background: "#fff" }}>
              <Statistic
                title={<span style={{ color: "#253C90" }}>ยอดรวมทั้งหมด</span>}
                value={stats.totalPaidAll}
                prefix={<WalletOutlined />}
                suffix="บาท"
                formatter={(v) => `฿${Number(v).toLocaleString()}`}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Card style={{ borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.08)", border: "1px solid #e9e9e9", background: "#fff" }}>
        {sponsorships.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={3} style={{ color: "#999" }}>ยังไม่มีประวัติการอุปถัมภ์</Title>
                <Paragraph style={{ fontFamily: "Anakotmai" }}>
                  เมื่อคุณอุปถัมภ์น้องหมาแล้ว ประวัติจะแสดงที่นี่
                </Paragraph>
              </div>
            }
          />
        ) : (
          <Table<SponsorshipRecord>
            dataSource={sponsorships}
            columns={columns as any}
            rowKey="ID"
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => (
                <span style={{ fontFamily: "Anakotmai" }}>
                  แสดง {range[0]}-{range[1]} จาก {total} รายการ
                </span>
              ),
            }}
            style={{ fontFamily: "Anakotmai" }}
          />
        )}
      </Card>
    </div>
  );
};

export default MySponsorships;
