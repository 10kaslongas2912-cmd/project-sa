import React, { useState } from "react";
import { Row, Col, Form, Input, Button, Card, Avatar, Typography, Space, message } from "antd";
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

    const handleClearForm = () => {
        form.resetFields();
        setSelectedDogs([]);
        setSearchTerm("");
        message.info({
            content: "ล้างข้อมูลเรียบร้อยแล้ว",
            duration: 2
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
                    size={50}
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

    // กรองหมาตามคำค้นหา
    const filteredDogs = dogs.filter(dog =>
        dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dog.breed?.name && dog.breed.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="dog-visit-form-container">
            <Card className="visit-form-card">
                <div className="form-header">
                    
                    <Title level={2} >สร้างการเยี่ยมชมน้องหมา</Title>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="visit-form"
                >
                    <Row gutter={32}>
                        <Col xs={24} lg={14}>
                            {/* Search Box */}
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
                                help={selectedDogs.length === 0 ? "กรุณาเลือกน้องหมาอย่างน้อย 1 ตัว" : ""}
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
                                rules={[
                                    { required: true, message: "กรุณากรอกชื่อการเยี่ยมชม" },
                                    { min: 1, message: "ชื่อการเยี่ยมชมต้องมีอย่างน้อย 1 ตัวอักษร" },
                                    { max: 100, message: "ชื่อการเยี่ยมชมต้องไม่เกิน 100 ตัวอักษร" },
                                    {
                                        validator: (_, value) => {
                                            if (value && value.trim().length === 0) {
                                                return Promise.reject(new Error("ชื่อการเยี่ยมชมไม่สามารถเป็นช่องว่างได้"));
                                            }
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <Input
                                    placeholder="เช่น การเยี่ยมชมประจำสัปดาห์, เล่นกับน้องหมา, ฯลฯ"
                                    className="visit-name-input"
                                    maxLength={100}
                                    showCount
                                />
                            </Form.Item>

                            {/* ช่วงเวลาเยี่ยมชม */}
                            <Form.Item
                                label="ช่วงเวลาเยี่ยมชม"
                                required
                            >
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
                                        dependencies={['startDate']}
                                        rules={[
                                            { required: true, message: "กรุณาเลือกวันสิ้นสุด" },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    const startDate = getFieldValue("startDate");
                                                    if (!value || !startDate) {
                                                        return Promise.resolve();
                                                    }
                                                    if (value.isSame(startDate, "day") || value.isAfter(startDate, "day")) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error("วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น"));
                                                },
                                            }),
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
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitting}
                                        icon={<CalendarOutlined />}
                                        size="large"
                                        className="submit-button"
                                        disabled={selectedDogs.length === 0}
                                    >
                                        {submitting ? "กำลังสร้าง..." : "สร้างการเยี่ยมชม"}
                                    </Button>
                                    <Button
                                        onClick={handleClearForm}
                                        size="large"
                                        disabled={submitting}
                                    >
                                        ล้างข้อมูล
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={10}>
                            {selectedDogs.length > 0 && (
                                <div className="selected-dogs-section">
                                    <Title level={4} className="selected-dogs-title">
                                        <Space>
                                            <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                            น้องหมาที่เลือก ({selectedDogs.length} ตัว)
                                        </Space>
                                    </Title>
                                    <div className="selected-dogs-grid">
                                        {selectedDogs.map(dog => (
                                            <Card key={dog.ID} className="selected-dog-card">
                                                <div className="selected-dog-info">
                                                    <Avatar
                                                        src={dog.photo_url}
                                                        size={50}
                                                        className="selected-dog-avatar"
                                                        alt={`รูปภาพของ ${dog.name}`}
                                                    />
                                                    <div className="selected-dog-details">
                                                        <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                                                            {dog.name}
                                                        </Title>
                                                        <Space direction="vertical" size={2}>
                                                            <Text type="secondary" className="dog-detail-text">
                                                                เพศ: {dog.animal_sex?.name}
                                                            </Text>
                                                            <Text type="secondary" className="dog-detail-text">
                                                                อายุ: {ageText(dog.date_of_birth)}
                                                            </Text>
                                                            <Text type="secondary" className="dog-detail-text">
                                                                สายพันธุ์: {dog.breed?.name}
                                                            </Text>
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
                                </div>
                            )}

                            {selectedDogs.length === 0 && (
                                <Card className="no-selection-card" style={{ textAlign: 'center', marginTop: 24 }}>
                                    <Text type="secondary">
                                        เลือกน้องหมาเพื่อดูรายละเอียด
                                    </Text>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default DogVisitForm;