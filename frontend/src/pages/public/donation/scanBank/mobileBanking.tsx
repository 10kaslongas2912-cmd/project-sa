import React, { useState, useEffect } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { useAuthUser } from "../../../../hooks/useAuth";
import { donationAPI } from "../../../../services/apis";
import type {
  MoneyDonationInterface,
  CreateDonationRequest,
  DonorInterface,
} from "../../../../interfaces/Donation";

// ใช้ Base64 placeholder แทนการ import ไฟล์
const qr_code =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y5ZjlmOSIgc3Ryb2tlPSIjZGRkIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSIxNTAiIHk9IjE1MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iMC4zZW0iPkdSIENvZGU8L3RleHQ+Cjwvc3ZnPgo=";

// ---------- helpers ----------
const normalizeDonorFromStorage = (raw: any): DonorInterface => {
  // รองรับหลายชื่อคีย์ แล้ว normalize เป็นรูปแบบที่ BE ต้องการ (firstname/lastname/phone/email)
  const firstName = raw?.firstName ?? raw?.firstname ?? raw?.first_name ?? "";
  const lastName = raw?.lastName ?? raw?.lastname ?? raw?.last_name ?? "";
  const phone = raw?.phone ?? raw?.phone_number ?? raw?.phonenumber ?? "";
  const email = raw?.email ?? "";
  return {
    firstname: firstName,
    lastname: lastName,
    phone,
    email,
  };
};

// const toYMD = (d: Date) => new Date(d).toISOString().split("T")[0];

const toYMD = (d: Date | string | number) => {
  const dt = new Date(d);
  // ถ้า invalid date ให้คืน string เดิม (กันข้อมูลดีๆ ที่เป็น 'YYYY-MM-DD' อยู่แล้ว)
  return isNaN(dt.getTime()) ? String(d) : dt.toISOString().split("T")[0];
};
// แปลง donor ที่เก็บใน sessionStorage ให้เป็นรูปแบบ DonorInterface (snake/camel แบบไหนมาก็ normalize)

const MobileBankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { user, isLoggedIn } = useAuthUser();
  const uid =
    typeof (user as any)?.ID === "number"
      ? (user as any).ID
      : typeof (user as any)?.id === "number"
      ? (user as any).id
      : undefined;

  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const [paymentNumber, setPaymentNumber] = useState("");

  const generatePaymentNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const day = now.getDate().toString().padStart(2, "0");
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `PAY-${year}${month}${day}-${randomNum}`;
  };

  useEffect(() => {
    const existingPaymentNumber = sessionStorage.getItem("transactionNumber");
    if (existingPaymentNumber) {
      setPaymentNumber(existingPaymentNumber);
    } else {
      const newPaymentNumber = generatePaymentNumber();
      setPaymentNumber(newPaymentNumber);
      sessionStorage.setItem("transactionNumber", newPaymentNumber);
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleFinish = async () => {
    const moneyDetailsString = sessionStorage.getItem("moneyDonationData");
    const transactionNumber = sessionStorage.getItem("transactionNumber");
    const donorInfoString = sessionStorage.getItem("donationInfoFormData");

    if (!moneyDetailsString) {
      messageApi.open({
        type: "error",
        content: "ข้อมูลการบริจาคไม่สมบูรณ์ กรุณาเริ่มต้นใหม่",
      });
      navigate("/donation/money");
      return;
    }

    try {
      // 1) money_detail พร้อมส่ง
      let money_detail: MoneyDonationInterface = JSON.parse(moneyDetailsString);

      if (money_detail.amount != null)
        money_detail.amount = Number(money_detail.amount);
      if (money_detail.payment_method_id != null) {
        money_detail.payment_method_id = Number(money_detail.payment_method_id);
      }

      // แปลง next_payment_date ถ้าหลุดมาเป็น Date/number
      if (money_detail.next_payment_date != null) {
        const npd = money_detail.next_payment_date as any;
        if (typeof npd === "object" || typeof npd === "number") {
          money_detail.next_payment_date = toYMD(npd);
        }
        // ถ้าเป็น string แล้ว ปล่อยผ่าน (สมมติเป็น YYYY-MM-DD)
      }

      // ใส่สถานะ + ref
      money_detail = {
        ...money_detail,
        status: "complete",
        transaction_ref: transactionNumber || `PAY-${Date.now()}`,
      };

      // การ์ดกัน payment_method_id หาย
      if (!money_detail.payment_method_id) {
        messageApi.open({
          type: "error",
          content: "ไม่พบช่องทางการชำระเงิน กรุณาลองใหม่",
        });
        return;
      }

      // 2) payload ตามสเปคใหม่
      const payload: CreateDonationRequest = (() => {
        if (isLoggedIn && Number.isFinite(Number(uid))) {
          return {
            donor_type: "user",
            user_id: Number(uid),
            money_detail,
          };
        }
        // guest
        if (!donorInfoString) {
          messageApi.open({
            type: "error",
            content: "กรุณากรอกข้อมูลผู้บริจาคก่อนดำเนินการต่อ",
          });
          navigate("/donation/information");
          throw new Error("missing donor info");
        }
        const donor = normalizeDonorFromStorage(JSON.parse(donorInfoString));
        return {
          donor_type: "guest",
          donor,
          money_detail,
        };
      })();

      // 3) ยิง API
      const result = await donationAPI.create(payload);
      const status = (result as any)?.status ?? 200;
      const data = (result as any)?.data ?? result;

      if (status === 200) {
        messageApi.open({
          type: "success",
          content: "การบริจาคสำเร็จ ขอบคุณ!",
        });
        sessionStorage.removeItem("donationInfoFormData");
        sessionStorage.removeItem("moneyDonationData");
        sessionStorage.removeItem("donationMoneyFormData");
        sessionStorage.removeItem("donationType");
        sessionStorage.removeItem("transactionNumber");
        navigate("/donation/thankyou");
      } else {
        messageApi.open({
          type: "error",
          content: data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
        });
      }
    } catch (err) {
      if ((err as Error)?.message !== "missing donor info") {
        console.error("Error processing donation:", err);
        messageApi.open({
          type: "error",
          content: "เกิดข้อผิดพลาดในการประมวลผลข้อมูล",
        });
      }
    }
  };

  const handleGoBack = () => {
    const confirmed = window.confirm(
      "การย้อนกลับจะยกเลิกการชำระเงินนี้ คุณต้องการดำเนินการต่อหรือไม่?"
    );
    if (confirmed) {
      sessionStorage.removeItem("transactionNumber");
      navigate("/donation/money");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSaveQrCode = () => {
    /* ... */
  };
  const handleRefreshQrCode = () => {
    /* ... */
  };

  return (
    <>
      {contextHolder}
      <div className="form-page-container">
        <div className="form-card">
          <button onClick={handleGoBack} className="back-link">
            &lt; ย้อนกลับ
          </button>
          <h1 className="form-title">สแกนจ่ายด้วยแอปธนาคาร</h1>
          <h2 className="form-subtitle">หมายเลขการชำระเงิน: {paymentNumber}</h2>

          {isExpired ? (
            <div className="expired-section">
              <p className="timer-expired">QR Code หมดอายุแล้ว</p>
              <button onClick={handleRefreshQrCode} className="refresh-button">
                สร้าง QR Code ใหม่
              </button>
            </div>
          ) : (
            <>
              <p className="timer">เวลาที่เหลือ: {formatTime(timeLeft)}</p>
              <div className="qr-code-container">
                <img
                  src={qr_code}
                  className="qr-code-image"
                  alt="QR Code สำหรับชำระเงิน"
                />
              </div>
            </>
          )}

          <div className="button-group">
            {!isExpired && (
              <button onClick={handleSaveQrCode} className="save-qr-button">
                บันทึก QR Code
              </button>
            )}
            <button
              onClick={handleFinish}
              className="submit-button"
              disabled={isExpired}
            >
              ยืนยันการบริจาค
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileBankingPage;
