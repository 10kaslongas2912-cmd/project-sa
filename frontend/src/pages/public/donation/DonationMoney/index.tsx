import React, { useEffect } from "react";
import './style.css';
import { useNavigate } from "react-router-dom";
import { Select, Form, Input, message, Button } from "antd";
import { Segmented } from 'antd';
import paw_heart from '../../../../assets/paw-heart.png';

import { GetPaymentMethods } from "../../../../services/https";
import type { PaymentMethodInterface } from "../../../../interfaces/PaymentMethod";

interface DonationMoneyFormProps {
  onSubmit?: (formData: object) => void;
}

// Helper to get initial state from sessionStorage
const getInitialDonationMoneyData = () => {
  try {
    const storedData = sessionStorage.getItem('donationMoneyFormData');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return {};
  } catch (error) {
    console.error("Error parsing stored donation money data:", error);
    return {};
  }
};

const DonationMoneyForm: React.FC<DonationMoneyFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const initialData = getInitialDonationMoneyData();
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethodInterface[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [createAccount, setCreateAccount] = React.useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  useEffect(() => {
    // Check for login token
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    const res = await GetPaymentMethods();
    if (res.status === 200) {
      setPaymentMethods(res.data);
    } else {
      messageApi.open({
        type: "error",
        content: res.data?.error || "ไม่พบข้อมูลวิธีการชำระเงิน",
      });

      setTimeout(() => {
        navigate("/donation/payment/banktransfer");
      }, 2000);
    }
  };

  const handleSubmit = (values: any) => {
    console.log('Form values on submit:', values); // Debug form values

    const type = values.donationFrequency;

    // ตรวจสอบว่าเลือกสร้างบัญชีหรือไม่ (สำหรับรายครั้ง และยังไม่ล็อคอิน)
    if (type === 'รายครั้ง' && !isLoggedIn && createAccount === null) {
      messageApi.open({
        type: "error",
        content: "กรุณาเลือกการสร้างบัญชีบริจาค",
      });
      return;
    }

    // ตรวจสอบ paymentMethod สำหรับรายครั้ง
    if (type === 'รายครั้ง' && !values.paymentMethod) {
      messageApi.open({
        type: "error",
        content: "กรุณาเลือกวิธีการชำระเงิน",
      });
      return;
    }

    let finalData: any = {
      donationFrequency: type,
      amount: type === 'รายเดือน' ? Number(values.monthlyAmount) : Number(values.oneTimeAmount),
      createAccount: createAccount,
    };

    if (type === 'รายเดือน') {
      finalData = {
        ...finalData,
        months: values.months || null,
        billingDate: Number(values.billingDate),
      };
    } else {
      finalData = {
        ...finalData,
        paymentMethod: values.paymentMethod,
      };
    }

    console.log('Final data before navigation:', finalData);

    // Call onSubmit callback if provided
    if (onSubmit) onSubmit(finalData);

    // Navigate based on donation type and payment method
    if (!isLoggedIn && createAccount === 3) { // 3 is the value for 'want to create account'
      sessionStorage.setItem('returnTo', '/donation/money');
      navigate('/signup');
    } else {
      navigateToNextPage(type, values.paymentMethod);
    }
  };

  const navigateToNextPage = (donationType: string, paymentMethodId: number) => {
    console.log('Navigation Debug:', { donationType, paymentMethodId, typeof: typeof paymentMethodId });

    if (donationType === 'รายเดือน') {
      // สำหรับรายเดือนไปหน้าบัตรเครดิตเสมอ
      navigate('/donation/payment/creditcard');
    } else {
      // สำหรับรายครั้ง ตรวจสอบวิธีการชำระเงิน
      console.log('Payment method comparison:', paymentMethodId, paymentMethodId === 1, paymentMethodId === 2);

      if (paymentMethodId === 1) { // บัตรเครดิต
        console.log('Navigating to credit card payment');
        navigate('/donation/payment/creditcard');
      } else if (paymentMethodId === 2) { // โอนผ่านธนาคาร
        console.log('Navigating to scan bank');
        navigate('/donation/payment/banktransfer');
      } else {
        // วิธีอื่นๆ
        console.log('Navigating to donation confirmation, payment method:', paymentMethodId);
        navigate('/donation/thankyou');
      }
    }
  };

  const handlePresetMonthlyAmount = (amount: number) => {
    form.setFieldsValue({ monthlyAmount: amount.toString() });
  };

  const handlePresetOneTimeAmount = (amount: number) => {
    form.setFieldsValue({ oneTimeAmount: amount.toString() });
  };

  const validateMinAmount = (_: any, value: string) => {
    if (value && Number(value) < 300) {
      return Promise.reject(new Error('จำนวนเงินขั้นต่ำคือ 300 บาท'));
    }
    return Promise.resolve();
  };

  const donationType = Form.useWatch('donationFrequency', form);
  const monthlyAmount = Form.useWatch('monthlyAmount', form);
  const months = Form.useWatch('months', form);
  const billingDate = Form.useWatch('billingDate', form);
  const paymentMethod = Form.useWatch('paymentMethod', form);

  // Debug payment method changes
  React.useEffect(() => {
    console.log('Payment method changed:', paymentMethod, typeof paymentMethod);
  }, [paymentMethod]);

  return (
    <>
      {contextHolder}
      <div className="form-page-container">
        <div className="form-card">
          <button onClick={() => {
            sessionStorage.removeItem('donationMoneyFormData');
            navigate('/donation/information');
          }} className="back-link">
            &lt; ย้อนกลับ
          </button>

          <h1 className="form-title">ร่วมบริจาคเงิน</h1>

          <Form
            form={form}
            onFinish={handleSubmit}
            initialValues={{
              ...initialData,
              donationFrequency: initialData.donationFrequency || 'รายเดือน',
            }}
            onValuesChange={(_, allValues) => {
              sessionStorage.setItem('donationMoneyFormData', JSON.stringify(allValues));
            }}
          >
            <Form.Item name="donationFrequency">
              <Segmented
                className="custom-large-segmented"
                options={[
                  {
                    label: 'รายเดือน',
                    value: 'รายเดือน',
                    icon: <img src={paw_heart} alt="paw heart" />,
                  },
                  {
                    label: <span className="once-label">รายครั้ง</span>,
                    value: 'รายครั้ง',
                    icon: <img src={paw_heart} alt="" style={{ visibility: 'hidden' }} />,
                  },
                ]}
                size="large"
                onChange={(value) => form.setFieldValue('donationFrequency', value)}
              />
            </Form.Item>

            {donationType === 'รายเดือน' ? (
              <div className="amount-input-row">
                <Button onClick={() => handlePresetMonthlyAmount(500)}>500 บาท</Button>
                <Button onClick={() => handlePresetMonthlyAmount(1000)}>1,000 บาท</Button>
                <Button onClick={() => handlePresetMonthlyAmount(2000)}>2,000 บาท</Button>
                <Form.Item
                  name="monthlyAmount"
                  rules={[
                    { required: true, message: 'กรุณากรอกจำนวนเงินรายเดือน!' },
                    { validator: validateMinAmount },
                  ]}
                  className="amount-input-item"
                >
                  <Input
                    type="number"
                    placeholder="หรือระบุจำนวนเงิน"
                    className="form-input1"
                  />
                </Form.Item>
              </div>
            ) : (
              <div className="amount-input-row">
                <Button onClick={() => handlePresetOneTimeAmount(100)}>100 บาท</Button>
                <Button onClick={() => handlePresetOneTimeAmount(300)}>300 บาท</Button>
                <Button onClick={() => handlePresetOneTimeAmount(500)}>500 บาท</Button>
                <Form.Item
                  name="oneTimeAmount"
                  rules={[{ required: true, message: 'กรุณากรอกจำนวนเงิน!' }]}
                  className="amount-input-item"
                >
                  <Input
                    type="number"
                    placeholder="หรือระบุจำนวนเงิน"
                    className="form-input1"
                  />
                </Form.Item>
              </div>
            )}

            <div className="form-row">
              {donationType === 'รายเดือน' ? (
                <>
                  <Form.Item
                    name="months"
                    label={<div style={{ textAlign: "center", fontFamily: "Anakotmai", fontSize: "1.4em", width: "100%", marginLeft: "30px", marginTop: "55px", maxWidth: "175px" }}>จำนวนเดือนที่จะบริจาค:</div>}
                    colon={false}
                    required={false}
                    rules={[{ required: true, message: 'กรุณาเลือกจำนวนเดือน!' }]}
                    className="form-row-item"
                  >
                    <Select
                      placeholder="เลือกจำนวนเดือน"
                      className="form-input2"
                      options={[
                        { label: '3 เดือน', value: 3 },
                        { label: '6 เดือน', value: 6 },
                        { label: '12 เดือน', value: 12 },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item
                    name="billingDate"
                    label={<div style={{ textAlign: "center", fontFamily: "Anakotmai", fontSize: "1.4em", width: "100%", marginLeft: "40px", marginTop: "55px" }}>วันที่ตัดบัตร:</div>}
                    colon={false}
                    required={false}
                    rules={[
                      { required: true, message: 'กรุณาเลือกวันที่ตัดบัตร!' },
                    ]}
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
                    rules={[{ required: true, message: 'กรุณาเลือกวิธีการชำระเงิน!' }]}
                    className="form-row-item-full"
                  >
                    <Select
                      placeholder="เลือกวิธีการชำระเงิน"
                      className="form-input3"
                      onChange={(value) => {
                        console.log('Payment method selected:', value, typeof value);
                        form.setFieldValue('paymentMethod', value);
                      }}
                    >
                      {paymentMethods.map((method) => (
                        <Select.Option key={method.payment_id} value={method.payment_id}>
                          {method.name}
                        </Select.Option>
                      ))}
                    </Select>

                    {/* Account creation options - Show only if not logged in */}
                    {!isLoggedIn && (
                      <div className="account-options-container">
                        <p className="jk">สร้างบัญชีบริจาค</p>
                        <Button
                          onClick={() => setCreateAccount(3)}
                          className={`account-option-button ${createAccount === 3 ? 'selected' : ''}`}
                        >
                          ฉันต้องการสร้างบัญชีบริจาค
                        </Button>
                        <Button
                          onClick={() => setCreateAccount(4)}
                          className={`account-option-button ${createAccount === 4 ? 'selected' : ''}`}
                        >
                          ฉันไม่ต้องการสร้างบัญชีบริจาค
                        </Button>
                      </div>
                    )}
                  </Form.Item>
                </>
              )}
            </div>

            {donationType === 'รายเดือน' && (
              <>
                <div style={{ textAlign: 'left', marginTop: '30px', fontSize: '1.5em', color: '#333', fontFamily: 'Anakotmai', marginLeft: '30px' }}>
                  <p>ยอดเงินที่บริจาคแต่ละเดือน: {monthlyAmount && <span style={{ fontWeight: 'bold', color: '#FF6600', fontFamily: 'Anakotmai' }}>{Number(monthlyAmount)} บาท</span>}</p>
                  <p>เป็นจำนวน: {months && <span style={{ fontWeight: 'bold', color: '#FF6600', fontFamily: 'Anakotmai' }}>{months} เดือน</span>}</p>
                  <p>รวมยอดบริจาคทั้งสิ้น: {monthlyAmount && months && Number(monthlyAmount) >= 300 && <span style={{ fontWeight: 'bold', color: '#FF6600', fontFamily: 'Anakotmai' }}>{Number(monthlyAmount) * months} บาท</span>}</p>
                  <p>ตัดบัตรทุกวันที่: {billingDate && <span style={{ fontWeight: 'bold', color: '#FF6600', fontFamily: 'Anakotmai' }}>{billingDate} ของทุกเดือน</span>}</p>
                </div>
                <p className="form-declaration">ระบบจะสร้างบัญชีบริจาคให้อัตโนมัติเพื่อให้คุณสามารถแก้ไขและปรับปรุงข้อมูลการบริจาคแบบรายเดือนของคุณได้</p>
              </>
            )}

            {/* ปุ่มต่อไป - ใช้ htmlType="submit" เพื่อ trigger onFinish */}
            <Form.Item>
              <button
                type="submit"
                className="submit-button"
                style={{
                  marginTop: donationType === 'รายเดือน' ? '20px' : '0px',
                  width: '100%',
                  maxWidth: donationType === 'รายครั้ง' ? '1000px' : 'auto',
                  marginLeft: donationType === 'รายครั้ง' ? '20px' : '0'
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