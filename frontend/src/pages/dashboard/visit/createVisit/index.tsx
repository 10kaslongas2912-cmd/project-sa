import React, { useState } from "react";
import { Form, Input, Button, Card, Avatar, Typography, Space, message } from "antd";
import { CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import "./style.css";
import type { DogInterface } from "../../../../interfaces/Dog";
import { ageText } from "../../../../utils/date";
import { useDogs } from "../../../../hooks/useDogs";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { visitAPI } from "../../../../services/apis";

const disabledPastDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf("day");
};

const { Title, Text } = Typography;

interface VisitFormData {
    visitName: string;
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
}

const DogVisitForm: React.FC = () => {
    const [form] = Form.useForm();
    const { dogs, loading, error } = useDogs();
    console.log("Dogs from useDogs hook:", dogs);
    const [selectedDogs, setSelectedDogs] = useState<DogInterface[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const handleSubmit = async (values: VisitFormData) => {
        // ตรวจสอบว่าเลือกน้องหมาแล้วหรือยัง
        if (selectedDogs.length === 0) {
            message.error({
                content: "กรุณาเลือกน้องหมาอย่างน้อย 1 ตัว",
                duration: 4
            });
            return;
        }

        try {
            setSubmitting(true);

            // เตรียมข้อมูลส่ง API
            const visitData = {
                visit_name: values.visitName.trim(),
                start_at: values.startDate.toDate(),
                end_at: values.endDate.toDate(),
                dog_ids: selectedDogs.map(dog => dog.ID),
            };

            console.log("Sending visit data:", visitData);

            // เรียก API สร้างการเยี่ยมชม
            const response = await visitAPI.createVisit(visitData);
            console.log("API Response:", response);

            // ตรวจสอบสถานะการตอบกลับ
            if (response && (response.status === 200 || response.status === 201)) {

                // รีเซ็ตฟอร์มหลังสำเร็จ
                form.resetFields();
                setSelectedDogs([]);
                setSearchTerm("");

                message.success({
                    content: "สร้างการเยี่ยมชมเรียบร้อยแล้ว",
                    duration: 4
                });
            } else {
                throw new Error(`API returned status: ${response?.status || 'unknown'}`);
            }

        } catch (error: any) {
            console.error("Error creating visit:", error);

            // แสดงข้อความผิดพลาดที่เจาะจงมากขึ้น
            let errorMessage = "เกิดข้อผิดพลาดในการสร้างการเยี่ยมชม";

            if (error?.response?.status === 400) {
                errorMessage = "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
            } else if (error?.response?.status === 401) {
                errorMessage = "ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่";
            } else if (error?.response?.status === 500) {
                errorMessage = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง";
            } else if (error?.message?.includes('Network')) {
                errorMessage = "ปัญหาการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต";
            }

            message.error({
                content: errorMessage,
                duration: 6
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDogSelect = (dogId: number) => {
        const dog = dogs.find(d => d.ID === dogId);
        if (!dog) return;

        setSelectedDogs(prevSelected => {
            if (prevSelected.some(d => d.ID === dog.ID)) {
                // ถ้าเลือกแล้ว ให้ยกเลิกการเลือก
                return prevSelected.filter(d => d.ID !== dog.ID);
            } else {
                // ถ้ายังไม่เลือก ให้เพิ่มเข้าไป
                return [...prevSelected, dog];
            }
        });
    };

    const renderDogCard = (dog: DogInterface) => (
        <Card
            key={dog.ID}
            className={`dog-card ${selectedDogs.some(d => d.ID === dog.ID) ? "selected" : ""}`}
            onClick={() => handleDogSelect(dog.ID)}
            hoverable
        >
            <div className="dog-info">
                <Avatar
                    src={dog.photo_url}
                    size={100}
                    className="dog-avatar"
                    alt={`รูปภาพของ ${dog.name}`}
                />
                <div className="dog-details">
                    <Title level={5} style={{ margin: 0 }}>{dog.name}</Title>
                    <Text type="secondary">
                        {dog.animal_sex?.name} • {ageText(dog.date_of_birth)} • {dog.breed?.name}
                    </Text>
                </div>
            </div>
        </Card>
    );

    // แสดงหน้า error หากโหลดข้อมูลไม่ได้
    if (error) {
        return (
            <div className="dog-visit-form-container">
                <Card className="error-card">
                    <Text type="danger">เกิดข้อผิดพลาดในการโหลดข้อมูลน้องหมา: {error}</Text>
                    <Button
                        type="primary"
                        onClick={() => window.location.reload()}
                        style={{ marginTop: 16 }}
                    >
                        โหลดใหม่
                    </Button>
                </Card>
            </div>
        );
    }
    console.log("All Dogs:", dogs);

    // กรองหมาตามคำค้นหา
    const filteredDogs = Array.isArray(dogs)
  ? dogs.filter(dog =>
      (dog.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dog.breed?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  : [];

  console.log("Filtered Dogs:", filteredDogs);


    return (
  <div className="dog-visit-form-container" style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
    {/* การ์ด 1: ฟอร์มสร้างการเยี่ยมชม */}
    <Card className="visit-form-card" style={{ flex: 1, minWidth: 300 }}>
      <div className="form-header">
        
        <Title level={1}>สร้างการเยี่ยมชมน้องหมา</Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="visit-form"
      >
        {/* ฟอร์มและส่วนเลือกน้องหมา */}
        <Form.Item label="ค้นหาน้องหมา">
          <Input
            placeholder="พิมพ์ชื่อหรือสายพันธุ์เพื่อค้นหา..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            allowClear
          />
        </Form.Item>

        <Form.Item
          label={
            <Space>
              <span>เลือกน้องหมาที่ต้องการเยี่ยมชม</span>
              <Text type="secondary">({selectedDogs.length} ตัว)</Text>
              {selectedDogs.length === 0 && <Text type="danger">*</Text>}
            </Space>
          }
          validateStatus={selectedDogs.length === 0 ? "error" : ""}
          
        >
          <div className="dogs-grid-container">
            {loading ? (
              <div className="loading-container">
                <Text>กำลังโหลดข้อมูลน้องหมา...</Text>
              </div>
            ) : filteredDogs.length === 0 ? (
              <div className="no-dogs-container">
                <Text type="secondary">
                  {searchTerm ? `ไม่พบน้องหมาที่ตรงกับ "${searchTerm}"` : "ไม่พบข้อมูลน้องหมา"}
                </Text>
              </div>
            ) : (
              <div className="dogs-grid">
                {filteredDogs.map(renderDogCard)}
              </div>
            )}
          </div>
        </Form.Item>

        <Form.Item
          name="visitName"
          label="ชื่อการเยี่ยมชม"
          rules={[{ required: true, message: "กรุณากรอกชื่อการเยี่ยมชม" }]}
        >
          <Input placeholder="เช่น การเยี่ยมชมประจำสัปดาห์..." />
        </Form.Item>

        <Form.Item label="ช่วงเวลาเยี่ยมชม" required>
          <Space size="middle">
            <Form.Item
              name="startDate"
              rules={[{ required: true, message: "กรุณาเลือกวันเริ่มต้น" }]}
              noStyle
            >
              <DatePicker
                placeholder="วันเริ่มต้น"
                format="YYYY-MM-DD"
                disabledDate={disabledPastDate}
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              dependencies={["startDate"]}
              rules={[
                { required: true, message: "กรุณาเลือกวันสิ้นสุด" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("startDate");
                    if (!value || !startDate) return Promise.resolve();
                    if (value.isSame(startDate, "day") || value.isAfter(startDate, "day")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น"));
                  }
                })
              ]}
              noStyle
            >
              <DatePicker
                placeholder="วันสิ้นสุด"
                format="YYYY-MM-DD"
                disabledDate={(current) => {
                  const startDate = form.getFieldValue("startDate");
                  if (!startDate) return disabledPastDate(current);
                  return current && current < startDate.startOf("day");
                }}
              />
            </Form.Item>
          </Space>
        </Form.Item>

        <Form.Item className="form-actions">
          <Space size="large">
            <Button
              className="btn-action"
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<CalendarOutlined />}
              size="large"
              disabled={selectedDogs.length === 0}
            >
              {submitting ? "กำลังสร้าง..." : "สร้างการเยี่ยมชม"}
            </Button>
            
          </Space>
        </Form.Item>
      </Form>
    </Card>

    {/* การ์ด 2: รายละเอียดน้องหมาที่เลือก */}
    <Card className="selected-dogs-card" style={{ flex: 1,marginTop: 24 }}>
      {selectedDogs.length > 0 ? (
        <>
          <Title level={4} className="selected-dogs-title">
            <Space>
              <CheckCircleOutlined style={{ color: "#52c41a" }} />
              น้องหมาที่เลือก ({selectedDogs.length} ตัว)
            </Space>
          </Title>
          <div className="selected-dogs-grid">
            {selectedDogs.map((dog) => (
              <Card key={dog.ID} className="selected-dog-card">
                <div className="selected-dog-info">
                  <Avatar src={dog.photo_url} size={50} className="selected-dog-avatar" />
                  <div className="selected-dog-details">
                    <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                      {dog.name}
                    </Title>
                    <Space direction="vertical" size={2}>
                      <Text type="secondary">เพศ: {dog.animal_sex?.name}</Text>
                      <Text type="secondary">อายุ: {ageText(dog.date_of_birth)}</Text>
                      <Text type="secondary">สายพันธุ์: {dog.breed?.name}</Text>
                    </Space>
                  </div>
                </div>
                {dog.character && (
                  <Text type="secondary" className="dog-character">
                    นิสัย: {dog.character}
                  </Text>
                )}
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">เลือกน้องหมาเพื่อดูรายละเอียด</Text>
        </div>
      )}
    </Card>
  </div>
);
};

export default DogVisitForm;