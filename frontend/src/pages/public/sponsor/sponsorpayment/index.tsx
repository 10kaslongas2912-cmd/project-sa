// src/pages/public/sponsor/SponsorPayment/index.tsx
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { CreditCardOutlined, DollarOutlined, SmileOutlined, SolutionOutlined } from "@ant-design/icons";
import { Steps, message } from "antd";
import { CreditCard } from "lucide-react";

import type { PaymentMethodInterface } from "../../../../interfaces/PaymentMethod";
import type { CreateSponsorRequest, CreateSponsorshipRequest, UpdatesSettings } from "../../../../interfaces/Sponsorship";
import { useDog } from "../../../../hooks/useDog";
import { useSponsorship } from "../../../../hooks/sponsorship/useSponsorship";
import { useAuthUser } from "../../../../hooks/useAuth";
import { useSponsorForm } from "../../../../hooks/sponsorship/useSponsorForm";
import SponsorDogCard from "../../../../components/Sponsor/SponsorCard";
import CreditCardForm from "../../../../components/Payment/Creditcard";
import PromptPayModal from "../../../../components/Payment/PromptPayModal";
import { sponsorshipAPI, paymentMethodAPI } from "../../../../services/apis";
import "./style.css";

type LocalMethodCode = "credit" | "qr";

const SponsorPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: {
      sponsor?: { title?: string | null; first_name: string; last_name: string; email: string; phone: string, gender_id: number | null };
      updates?: UpdatesSettings;
    };
  };
  const { id } = useParams();
  const dogId = id ? Number(id) : null;

  const { dog } = useDog(dogId);
  const { planType, amount, frequency } = useSponsorship();

  const { user, isLoggedIn, loading: authLoading, refresh } = useAuthUser();

  // fallback form (กรณีเข้าหน้านี้ตรง ๆ)
  const { state: formState, updatesPreference } = useSponsorForm(dogId);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMethodCode, setSelectedMethodCode] = useState<LocalMethodCode | null>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const canUseQR = planType === "one-time";
  const canUseCredit = true;
  const payable = useMemo(() => amount ?? 0, [amount]);

  // โหลดช่องทางจ่าย
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await paymentMethodAPI.getAll();
        setPaymentMethods(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("fetchPaymentMethods error:", err);
        message.error("ไม่พบข้อมูลวิธีการชำระเงิน");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // map code -> id
  const methodIdByCode = useMemo(() => {
    const findId = (want: LocalMethodCode): number | null => {
      const byCode = paymentMethods.find((m: any) => (m.code ?? "").toLowerCase() === want);
      if (byCode?.ID) return byCode.ID;

      const lc = (s: any) => String(s ?? "").toLowerCase();
      if (want === "credit") {
        const mm = paymentMethods.find((m: any) =>
          ["credit", "credit card", "บัตร", "บัตรเครดิต"].some((kw) => lc(m.name).includes(kw))
        );
        return mm?.ID ?? null;
      }
      if (want === "qr") {
        const mm = paymentMethods.find((m: any) =>
          ["qr", "promptpay", "พร้อมเพย์", "สแกน"].some((kw) => lc(m.name).includes(kw))
        );
        return mm?.ID ?? null;
      }
      return null;
    };

    return {
      credit: findId("credit"),
      qr: findId("qr"),
    } as Record<LocalMethodCode, number | null>;
  }, [paymentMethods]);

  // subscription → บังคับ credit
  useEffect(() => {
    if (planType === "subscription") setSelectedMethodCode("credit");
  }, [planType]);


  const normGenderId = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : Number(v ?? NaN);
  return Number.isFinite(n) && n > 0 ? n : null;
};
  // sponsor_data จากสถานะ login (ไม่มี updates ติดไปแล้ว)
  const sponsorData: CreateSponsorRequest | null = useMemo(() => {
    if (isLoggedIn && user?.ID) {
      return { kind: "user", user_id: user.ID };
    }
    // guest: route state ก่อน, ถ้าไม่มีใช้ของ form hook
    const sponsor = location.state?.sponsor ?? {
      title: formState.title || null,
      first_name: formState.first_name,
      last_name: formState.last_name,
      email: formState.email,
      phone: formState.phone,
      gender_id: formState.gender_id ?? null
    };

    if (![sponsor.first_name, sponsor.last_name, sponsor.email, sponsor.phone].every((v) => String(v ?? "").trim())) {
      return null;
    }

    return {
      kind: "guest",
      title: sponsor.title ?? null,
      first_name: sponsor.first_name,
      last_name: sponsor.last_name,
      email: sponsor.email,
      phone: sponsor.phone,
      gender_id: normGenderId(sponsor.gender_id),
    };
  }, [isLoggedIn, user, location.state, formState]);

  // updates ระดับ sponsorship
  const sponsorshipUpdates: UpdatesSettings | undefined = useMemo(() => {
    const u = location.state?.updates ?? updatesPreference;
    if (!u) return undefined;
    return {
      enabled: !!u.enabled,
      channel: u.enabled ? (u.channel ?? null) : null,
      frequency: u.enabled ? (u.frequency ?? null) : null,
    };
  }, [location.state, updatesPreference]);

  // ถ้า login แล้วแต่ user ยังไม่โหลด → ดึง me
  useEffect(() => {
    if (isLoggedIn && !user && !authLoading) refresh();
  }, [isLoggedIn, user, authLoading, refresh]);

  // -------- Helpers --------
  const buildCreatePayload = (payment_method_id: number, status: "Active" | "Paided"): CreateSponsorshipRequest | null => {
    if (!dogId || !planType || !payable || payable <= 0) return null;
    if (!sponsorData) return null;

    return {
      sponsor_data: sponsorData,
      dog_id: dogId,
      plan_type: planType,
      frequency: planType === "subscription" ? (frequency ?? null) : null,
      amount: payable,
      payment_method_id,
      status,
      update: sponsorshipUpdates, // ⬅️ ใส่ที่ root
    };
  };

  // validate & check BE response helpers
  const isOneTimeOK = (res: any) => !!res && !!res.sponsorship_id && !!res.payment_id;
  const isSubOK = (res: any) => !!res && !!res.sponsorship_id && !!res.subscription_id && !!res.payment_id;

  // -------- Actions --------
  const handleConfirmPayment = async () => {
    if (!dogId) return message.error("ไม่พบรหัสสุนัข");
    if (!payable || payable <= 0) return message.error("จำนวนเงินไม่ถูกต้อง");
    if (!selectedMethodCode) return message.error("กรุณาเลือกวิธีการชำระเงิน");

    const selectedMethodId = methodIdByCode[selectedMethodCode];
    if (!selectedMethodId) return message.error("วิธีการชำระเงินไม่พร้อมใช้งาน กรุณาลองใหม่");

    // QR ใช้ได้เฉพาะ one-time → เปิด modal
    if (selectedMethodCode === "qr" && planType === "one-time") {
      setQrOpen(true);
      return;
    }

    // credit: ยิง API ตามชนิดแผน
    const status = planType === "subscription" ? "Active" : "Paided";
    const payload = buildCreatePayload(selectedMethodId, status);
    if (!payload) {
      return message.error(isLoggedIn ? "ข้อมูลผู้ใช้ไม่พร้อมใช้งาน" : "ข้อมูลฟอร์มไม่ครบ กรุณากลับไปกรอกแบบฟอร์ม");
    }

    const key = "pay";
    try {
      setLoading(true);
      message.loading({ key, content: "กำลังบันทึกการชำระเงิน...", duration: 0 });

      if (planType === "subscription") {
        const res = await sponsorshipAPI.createSubscription(payload);
        if (!isSubOK(res.data)) throw new Error("ข้อมูลตอบกลับไม่ครบ กรุณาลองใหม่");
        message.success({ key, content: "สมัครอุปถัมภ์รายเดือนสำเร็จ 🎉" });
      } else {
        const res = await sponsorshipAPI.createOneTime(payload);
        if (!isOneTimeOK(res.data)) throw new Error("ข้อมูลตอบกลับไม่ครบ กรุณาลองใหม่");
        message.success({ key, content: "ชำระเงินสำเร็จ ขอบคุณสำหรับการอุปถัมภ์ 🐾" });
      }

      navigate("../thank-you");
    } catch (e: any) {
      message.error({ key, content: e?.message || "บันทึกการชำระเงินไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  const handlePaidViaQR = async (): Promise<void> => {
    if (!dogId) { message.error("ไม่พบรหัสสุนัข"); return; }
    if (!payable || payable <= 0) { message.error("จำนวนเงินไม่ถูกต้อง"); return; }

    const qrId = methodIdByCode.qr;
    if (!qrId) { message.error("ไม่พบช่องทาง QR ในระบบ"); return; }

    const payload = buildCreatePayload(qrId, "Paided");
    if (!payload) {
      message.error(isLoggedIn ? "ข้อมูลผู้ใช้ไม่พร้อมใช้งาน" : "ข้อมูลฟอร์มไม่ครบ กรุณากลับไปกรอกแบบฟอร์ม");
      return;
    }

    const key = "pay-qr";
    try {
      setLoading(true);
      message.loading({ key, content: "กำลังยืนยันการชำระเงิน...", duration: 0 });

      const res = await sponsorshipAPI.createOneTime(payload);
      if (!isOneTimeOK(res.data)) throw new Error("ข้อมูลตอบกลับไม่ครบ กรุณาลองใหม่");

      message.success({ key, content: "ชำระเงินสำเร็จ ขอบคุณสำหรับการอุปถัมภ์ 🐶" });
      setQrOpen(false);
      navigate("../thank-you");
    } catch (e: any) {
      message.error({ key, content: e?.message || "บันทึกการชำระเงินไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  const creditDisabled = loading || methodIdByCode.credit == null;
  const qrDisabled = loading || methodIdByCode.qr == null || !canUseQR;

  return (
    <div className="sponsor-container">
      <div className="sponsor-card">
        <SponsorDogCard dog={dog} />

        <div className="sponsor-progress">
          <Steps
            items={[
              { title: "Select Amount", status: "finish",  icon: <DollarOutlined /> },
              { title: "Verification",  status: "finish",  icon: <SolutionOutlined /> },
              { title: "Pay",           status: "process", icon: <CreditCardOutlined /> },
              { title: "Done",          status: "wait",    icon: <SmileOutlined /> },
            ]}
          />
        </div>

        <div className="sponsor-form-content">
          <h3 className="section-title">เลือกวิธีการชำระเงิน</h3>

          <div className="payment-options">
            {canUseCredit && (
              <button
                className={`payment-button ${selectedMethodCode === "credit" ? "selected" : ""}`}
                disabled={creditDisabled}
                onClick={() => setSelectedMethodCode("credit")}
              >
                <CreditCard className="payment-icon" />
                <span>Credit Card</span>
              </button>
            )}

            {canUseQR && (
              <button
                className={`payment-button ${selectedMethodCode === "qr" ? "selected" : ""}`}
                disabled={qrDisabled}
                onClick={() => setSelectedMethodCode("qr")}
              >
                <span className="payment-icon" role="img" aria-label="qr">📱</span>
                <span>สแกน QR Code</span>
              </button>
            )}
          </div>

          {selectedMethodCode === "credit" && (
            <div className="payment-method-details">
              <div className="credit-card-form-container">
                <CreditCardForm />
              </div>
            </div>
          )}

          <div className="payment-summary">
            <h3 className="section-title">จำนวนเงินทั้งหมด</h3>
            <div className="summary-row total">
              <span className="summary-label">Total</span>
              <span className="summary-value">฿{payable.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="sponsor-form-footer">
          <button className="previous-button" onClick={() => navigate(-1)}>ย้อนกลับ</button>
          <button
            className="next-button confirm-button"
            onClick={handleConfirmPayment}
            disabled={loading || (planType === "subscription" && authLoading)}
          >
            ยืนยันการชำระเงิน
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {dogId && dog?.name && (
        <PromptPayModal
          open={qrOpen}
          onClose={() => setQrOpen(false)}
          dogId={dogId}
          dogName={dog.name}
          amount={payable}
          expiresInSec={300}
          onPaid={handlePaidViaQR}
        />
      )}
    </div>
  );
};

export default SponsorPaymentPage;
