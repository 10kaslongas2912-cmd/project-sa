import React, { useEffect } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import { Select, Form, Input, message, Button } from "antd";
import { Segmented } from "antd";
import paw_heart from "../../../../assets/paw-heart.png";

import { paymentMethodAPI } from "../../../../services/apis";
import type { PaymentMethodInterface } from "../../../../interfaces/PaymentMethod";
import type { MoneyDonationInterface } from "../../../../interfaces/Donation";

type FormValues = {
  donationFrequency: "รายเดือน" | "รายครั้ง";
  monthlyAmount?: string | number;
  oneTimeAmount?: string | number;
  months?: number;
  billingDate?: number; // 1-31
  paymentMethod?: number; // id ของวิธีจ่าย (ใช้เฉพาะรายครั้ง)
};

const getInitialDonationMoneyData = (): Partial<FormValues> => {
  try {
    const stored = sessionStorage.getItem("donationMoneyFormData");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// แปลง Date -> 'YYYY-MM-DD'
const toYMD = (d: Date) => d.toISOString().split("T")[0];

const DonationMoneyForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const initialData = getInitialDonationMoneyData();
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethodInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [createAccount, setCreateAccount] = React.useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
    fetchPaymentMethods();
  }, []);

const fetchPaymentMethods = async () => {
  try {
    const res = await paymentMethodAPI.getAll();
    setPaymentMethods(res);
  } catch (err) {
    console.error('fetchPaymentMethods error:', err);
    messageApi.open({
      type: 'error',
      content: 'ไม่พบข้อมูลวิธีการชำระเงิน',
    });
  }
};

  const handleSubmit = async (values: any) => {
    console.log('Form values on submit:', values);

    const type = values.donationFrequency;

    if (type === 'รายครั้ง' && !isLoggedIn && createAccount === null) {
      messageApi.open({
        type: "error",
        content: "กรุณาเลือกการสร้างบัญชีบริจาค",
      });
      return;
    }

    if (type === 'รายครั้ง' && !values.paymentMethod) {
      messageApi.open({
        type: "error",
        content: "กรุณาเลือกวิธีการชำระเงิน",
      });
      return;
    }

    let finalData: MoneyDonationInterface = {
      amount: type === 'รายเดือน' ? Number(values.monthlyAmount) : Number(values.oneTimeAmount),
      payment_method_id: values.paymentMethod,
      payment_type: type === 'รายเดือน' ? 'monthly' : 'one-time',
    };

    if (type === 'รายเดือน') {
      const today = new Date();
      const billingDay = Number(values.billingDate);
      let nextPaymentDate = new Date(today.getFullYear(), today.getMonth(), billingDay);
      if (today.getDate() >= billingDay) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
            // Format nextPaymentDate to YYYY-MM-DD string
      const formattedNextPaymentDate = nextPaymentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"
      finalData = {
        ...finalData,
        next_payment_date: formattedNextPaymentDate,
      };
    }

    console.log('Final data before navigation:', finalData);

    sessionStorage.setItem('moneyDonationData', JSON.stringify(finalData));

    if (!isLoggedIn && createAccount === 3) {
      sessionStorage.setItem('returnTo', '/donation/money');
      navigate('/signup');
    } else {
      navigateToNextPage(type, values.paymentMethod);
    }
  };

  // หาค่า id ของวิธี "บัตรเครดิต" จากรายการ method จริง (กัน hardcode)
  const getCreditCardMethodId = () => {
    const cc = paymentMethods.find((m) =>
      String(m.name).toLowerCase().includes("credit") ||
      String(m.name).toLowerCase().includes("บัตร")
    );
    return cc?.ID; // undefined ถ้าไม่มี
  };

  const validateMinAmount = (_: any, value?: string | number) => {
    const n = Number(value);
    if (value != null && !Number.isNaN(n) && n < 300) {
      return Promise.reject(new Error("จำนวนเงินขั้นต่ำคือ 300 บาท"));
    }
    return Promise.resolve();
  };

  const validateMinOneTimeAmount = (_: any, value?: string | number) => {
    const n = Number(value);
    if (value != null && !Number.isNaN(n) && n < 50) {
      return Promise.reject(new Error("จำนวนเงินขั้นต่ำคือ 50 บาท"));
    }
    return Promise.resolve();
  };

  const donationType = Form.useWatch("donationFrequency", form);
  const monthlyAmount = Form.useWatch("monthlyAmount", form);
  const months = Form.useWatch("months", form);
  const billingDate = Form.useWatch("billingDate", form);

  const computeNextPaymentDate = (day: number) => {
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth(), day);
    if (today.getDate() >= day) target.setMonth(target.getMonth() + 1);
    return toYMD(target);
  };

  const handleSubmit = async (values: FormValues) => {
    const type = values.donationFrequency;

    // เงื่อนไขรายครั้ง: ต้องเลือกวิธีชำระ + ถ้าไม่ล็อกอิน ต้องเลือกว่า "สร้างบัญชี?" ด้วย
    if (type === "รายครั้ง" && !values.paymentMethod) {
      messageApi.open({ type: "error", content: "กรุณาเลือกวิธีการชำระเงิน" });
      return;
    }
    if (type === "รายครั้ง" && !isLoggedIn && createAccount === null) {
      messageApi.open({ type: "error", content: "กรุณาเลือกการสร้างบัญชีบริจาค" });
      return;
    }

    const isMonthly = type === "รายเดือน";

    // เลือกจำนวนเงิน
    const amount = Number(isMonthly ? values.monthlyAmount : values.oneTimeAmount);

    // เลือก payment_method_id:
    // - รายเดือน → ให้เป็นวิธี "บัตรเครดิต" เสมอ (จากรายการจริง)
    // - รายครั้ง → ใช้อันที่เลือกในฟอร์ม
    const creditCardId = getCreditCardMethodId();
    const payment_method_id = isMonthly ? creditCardId : Number(values.paymentMethod);

    if (isMonthly && !payment_method_id) {
      messageApi.open({
        type: "error",
        content: "ไม่พบวิธีชำระเงินสำหรับบัตรเครดิต กรุณาติดต่อผู้ดูแลระบบ",
      });
      return;
    }

    // สำหรับรายเดือน: เก็บ billing_date (วันที่ตัด) และ next_payment_date เป็นสตริงทันที
    const finalData: MoneyDonationInterface = {
      amount,
      payment_method_id: payment_method_id!,
      payment_type: isMonthly ? "monthly" : "one-time",
      ...(isMonthly && values.billingDate
        ? {
            billing_date: String(values.billingDate), // เก็บเป็น '1'..'31'
            next_payment_date: computeNextPaymentDate(values.billingDate),
          }
        : {}),
    };

    // เก็บก้อนที่ "พร้อมใช้" สำหรับหน้าชำระเงินถัดไป
    sessionStorage.setItem("moneyDonationData", JSON.stringify(finalData));

    // เก็บฟอร์มดิบไว้ด้วย (เพื่อกลับมาแก้ได้)
    sessionStorage.setItem("donationMoneyFormData", JSON.stringify(values));

    // นำทางไปหน้าชำระเงิน
    if (isMonthly) {
      navigate("/donation/payment/creditcard");
    } else {
      if (payment_method_id === creditCardId) {
        navigate("/donation/payment/creditcard");
      } else {
        navigate("/donation/payment/banktransfer");
      }
    }
  };

  const handlePresetMonthlyAmount = (amount: number) => {
    form.setFieldsValue({ monthlyAmount: amount.toString() });
  };
  const handlePresetOneTimeAmount = (amount: number) => {
    form.setFieldsValue({ oneTimeAmount: amount.toString() });
  };

  return (
    <>
      {contextHolder}
      <div className="form-page-container">
        <div className="form-card">
          <button
            onClick={() => {
              sessionStorage.removeItem("donationMoneyFormData");
              navigate("/donation/information");
            }}
            className="back-link"
          >
            &lt; ย้อนกลับ
          </button>

          <h1 className="form-title">ร่วมบริจาคเงิน</h1>

          <Form<FormValues>
            form={form}
            onFinish={handleSubmit}
            initialValues={{
              ...initialData,
              donationFrequency: (initialData.donationFrequency as any) || "รายเดือน",
            }}
            onValuesChange={(_, allValues) => {
              sessionStorage.setItem("donationMoneyFormData", JSON.stringify(allValues));
            }}
          >
            <Form.Item name="donationFrequency">
              <Segmented
                className="custom-large-segmented"
                options={[
                  { label: "รายเดือน", value: "รายเดือน", icon: <img src={paw_heart} alt="paw heart" /> },
                  { label: <span className="once-label">รายครั้ง</span>, value: "รายครั้ง", icon: <img src={paw_heart} alt="" style={{ visibility: "hidden" }} /> },
                ]}
                size="large"
                onChange={(value) => form.setFieldValue("donationFrequency", value)}
              />
            </Form.Item>

            {donationType === "รายเดือน" ? (
              <div className="amount-input-row">
                <Button onClick={() => handlePresetMonthlyAmount(500)}>500 บาท</Button>
                <Button onClick={() => handlePresetMonthlyAmount(1000)}>1,000 บาท</Button>
                <Button onClick={() => handlePresetMonthlyAmount(2000)}>2,000 บาท</Button>
                <Form.Item
                  name="monthlyAmount"
                  rules={[{ required: true, message: "กรุณากรอกจำนวนเงินรายเดือน!" }, { validator: validateMinAmount }]}
                  className="amount-input-item"
                >
                  <Input type="number" placeholder="หรือระบุจำนวนเงิน" className="form-input1" />
                </Form.Item>
              </div>
            ) : (
              <div className="amount-input-row">
                <Button onClick={() => handlePresetOneTimeAmount(100)}>100 บาท</Button>
                <Button onClick={() => handlePresetOneTimeAmount(300)}>300 บาท</Button>
                <Button onClick={() => handlePresetOneTimeAmount(500)}>500 บาท</Button>
                <Form.Item
                  name="oneTimeAmount"
                  rules={[{ required: true, message: "กรุณากรอกจำนวนเงิน!" }, { validator: validateMinOneTimeAmount }]}
                  className="amount-input-item"
                >
                  <Input type="number" placeholder="หรือระบุจำนวนเงิน" className="form-input1" />
                </Form.Item>
              </div>
            )}

            <div className="form-row">
              {donationType === "รายเดือน" ? (
                <>
                  <Form.Item
                    name="months"
                    label={
                      <div style={{ textAlign: "center", fontFamily: "Anakotmai", fontSize: "1.4em", width: "100%", marginLeft: "30px", marginTop: "55px", maxWidth: "175px" }}>
                        จำนวนเดือนที่จะบริจาค:
                      </div>
                    }
                    colon={false}
                    rules={[{ required: true, message: "กรุณาเลือกจำนวนเดือน!" }]}
                    className="form-row-item"
                  >
                    <Select
                      placeholder="เลือกจำนวนเดือน"
                      className="form-input2"
                      options={[
                        { label: "3 เดือน", value: 3 },
                        { label: "6 เดือน", value: 6 },
                        { label: "12 เดือน", value: 12 },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="billingDate"
                    label={<div style={{ textAlign: "center", fontFamily: "Anakotmai", fontSize: "1.4em", width: "100%", marginLeft: "40px", marginTop: "55px" }}>วันที่ตัดบัตร:</div>}
                    colon={false}
                    rules={[{ required: true, message: "กรุณาเลือกวันที่ตัดบัตร!" }]}
                    className="form-row-item"
                  >
                    <Select
                      placeholder="เลือกวันที่ตัดบัตร"
                      className="form-input2"
                      options={Array.from({ length: 31 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }))}
                    />
                  </Form.Item>
                </>
              ) : (
                <>
                  <p className="pk">ช่องทางการชำระเงิน</p>
                  <Form.Item
                    name="paymentMethod"
                    rules={[{ required: true, message: "กรุณาเลือกวิธีการชำระเงิน!" }]}
                    className="form-row-item-full"
                  >
                    <Select
                      placeholder="เลือกวิธีการชำระเงิน"
                      className="form-input3"
                      onChange={(value) => form.setFieldValue("paymentMethod", value)}
                    >
                      {paymentMethods.map((method) => (
                        <Select.Option key={method.ID} value={method.ID}>
                          {method.name}
                        </Select.Option>
                      ))}
                    </Select>

                    {!isLoggedIn && (
                      <div className="account-options-container">
                        <p className="jk">สร้างบัญชีบริจาค</p>
                        <Button
                          onClick={() => setCreateAccount(3)}
                          className={`account-option-button ${createAccount === 3 ? "selected" : ""}`}
                        >
                          ฉันต้องการสร้างบัญชีบริจาค
                        </Button>
                        <Button
                          onClick={() => setCreateAccount(4)}
                          className={`account-option-button ${createAccount === 4 ? "selected" : ""}`}
                        >
                          ฉันไม่ต้องการสร้างบัญชีบริจาค
                        </Button>
                      </div>
                    )}
                  </Form.Item>
                </>
              )}
            </div>

            {donationType === "รายเดือน" && (
              <>
                <div style={{ textAlign: "left", marginTop: "30px", fontSize: "1.5em", color: "#333", fontFamily: "Anakotmai", marginLeft: "30px" }}>
                  <p>
                    ยอดเงินที่บริจาคแต่ละเดือน:{" "}
                    {monthlyAmount && <span style={{ fontWeight: "bold", color: "#FF6600", fontFamily: "Anakotmai" }}>{Number(monthlyAmount)} บาท</span>}
                  </p>
                  <p>
                    เป็นจำนวน:{" "}
                    {months && <span style={{ fontWeight: "bold", color: "#FF6600", fontFamily: "Anakotmai" }}>{months} เดือน</span>}
                  </p>
                  <p>
                    รวมยอดบริจาคทั้งสิ้น:{" "}
                    {monthlyAmount && months && Number(monthlyAmount) >= 300 && (
                      <span style={{ fontWeight: "bold", color: "#FF6600", fontFamily: "Anakotmai" }}>{Number(monthlyAmount) * (months || 0)} บาท</span>
                    )}
                  </p>
                  <p>
                    ตัดบัตรทุกวันที่:{" "}
                    {billingDate && <span style={{ fontWeight: "bold", color: "#FF6600", fontFamily: "Anakotmai" }}>{billingDate} ของทุกเดือน</span>}
                  </p>
                </div>
                <p className="form-declaration">
                  ระบบจะสร้างบัญชีบริจาคให้อัตโนมัติเพื่อให้คุณสามารถแก้ไขและปรับปรุงข้อมูลการบริจาคแบบรายเดือนของคุณได้
                </p>
              </>
            )}

            <Form.Item>
              <button
                type="submit"
                className="submit-button"
                style={{
                  marginTop: "20px",
                  width: donationType === "รายครั้ง" ? "90%" : "100%",
                  maxWidth: donationType === "รายครั้ง" ? "1000px" : "auto",
                  marginLeft: donationType === "รายครั้ง" ? "-15px" : "0",
                }}
              >
                ต่อไป
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default DonationMoneyForm;
