// src/components/Payment/PromptPayModal.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button, message, Statistic, Typography } from "antd";
import { QRCodeCanvas } from "qrcode.react";


const { Countdown } = Statistic;
const { Text } = Typography;

type Props = {
  open: boolean;
  onClose: () => void;

  // สำหรับบันทึกลงฐานข้อมูล/แสดงผล
  dogId: number;
  dogName: string;
  amount: number;

  // ค่าเวลาหมดอายุ (วินาที)
  expiresInSec?: number;

  // เรียกตอน "ชำระเงินสำเร็จ" (จำลอง)
  onPaid: () => Promise<void>;
};

export default function PromptPayModal({
  open,
  onClose,
  dogId,
  dogName,
  amount,
  expiresInSec = 300, // 5 นาที
  onPaid,
}: Props) {
  const [imgUrl, setImgUrl] = useState<string>("");
  const [deadline, setDeadline] = useState<number>(Date.now() + expiresInSec * 1000);
  const containerRef = useRef<HTMLDivElement>(null);

  // payload สำหรับ QR (ในโปรดักชัน แนะนำให้ BE generate EMV-QR มาให้)
  const payload = useMemo(
    () =>
      JSON.stringify({
        type: "promptpay",
        dog_id: dogId,
        amount,
        purpose: "sponsorship",
      }),
    [dogId, amount]
  );

  useEffect(() => {
    if (!open) return;
    // reset countdown ทุกครั้งที่เปิด
    setDeadline(Date.now() + expiresInSec * 1000);

    // แปลง canvas → dataURL (ไว้ดาวน์โหลด QR)
    const t = setTimeout(() => {
      const canvas = containerRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
      if (canvas) setImgUrl(canvas.toDataURL("image/png"));
    }, 50);
    return () => clearTimeout(t);
  }, [open, expiresInSec, payload]);

  const handleDownloadQR = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `sponsor_qr_${dogName}.png`;
    a.click();
  };

  const handlePaid = async () => {
    try {
      await onPaid(); // ให้หน้า Payment ยิง API บันทึก DB
      message.success("ชำระเงินสำเร็จ ขอบคุณมากครับ/ค่ะ");
    } catch (e: any) {
      message.error(e?.message || "บันทึกข้อมูลไม่สำเร็จ");
      return;
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      maskClosable={false}
      centered
      title={`สแกนชำระเงินสำหรับน้อง ${dogName}`}
      footer={[
        <Button key="dl" onClick={handleDownloadQR}>บันทึก QR</Button>,
        <Button key="ok" type="primary" onClick={handlePaid}>ฉันชำระเงินแล้ว</Button>,
        <Button key="cancel" onClick={onClose}>ยกเลิก</Button>,
      ]}
    >
      <div style={{ textAlign: "center" }}>
        <div ref={containerRef} style={{ display: "inline-block", padding: 12, background: "#fff" }}>
          <QRCodeCanvas value={payload} size={220} includeMargin />
        </div>
        <div style={{ marginTop: 12 }}>
          <div>ยอดชำระ: <b>฿{amount.toLocaleString()}</b></div>
          <Text type="secondary">กรุณาชำระภายในเวลา</Text>
          <div style={{ marginTop: 8 }}>
            <Countdown value={deadline} onFinish={() => message.warning("หมดเวลาชำระ กรุณาสร้าง QR ใหม่")} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
