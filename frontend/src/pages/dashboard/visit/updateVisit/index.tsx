import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Avatar, Typography, Space, message, Modal, Table, Tag, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import "./style.css";
import type { DogInterface } from "../../../../interfaces/Dog";
import { ageText } from "../../../../utils/date";
import { useDogs } from "../../../../hooks/useDogs_jia";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { visitAPI } from "../../../../services/apis";

const disabledPastDate = (current: dayjs.Dayjs) => {
    return current && current < dayjs().startOf("day");
};

const { Title, Text } = Typography;

interface VisitInterface {
    ID: number;
    visit_name: string;
    start_at: string;
    end_at: string;
    dogs: DogInterface[];
    created_at: string;
    status: 'upcoming' | 'ongoing' | 'completed';
}

interface VisitFormData {
    visitName: string;
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
}

const DogVisitManagement: React.FC = () => {
    const [form] = Form.useForm();
    const { dogs, loading: dogsLoading, error: dogsError } = useDogs();
    const [visits, setVisits] = useState<VisitInterface[]>([]);
    const [selectedDogs, setSelectedDogs] = useState<DogInterface[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchVisitTerm, setSearchVisitTerm] = useState<string>("");
    const [editingVisit, setEditingVisit] = useState<VisitInterface | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [viewingVisit, setViewingVisit] = useState<VisitInterface | null>(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);

    // โหลดข้อมูลการเยี่ยมชมทั้งหมด
    useEffect(() => {
        fetchVisits();
    }, []);

    const fetchVisits = async () => {
    try {
        setLoading(true);
        const response = await visitAPI.getAllVisits();
        console.log("API Response:", response);
        
        // ตรวจสอบโครงสร้างข้อมูลที่ได้รับ
        let visitsData = [];
        
        // ถ้า response เป็น array โดยตรง
        if (Array.isArray(response)) {
            visitsData = response;
        }
        // ถ้า response.data เป็น array
        else if (response?.data && Array.isArray(response.data)) {
            visitsData = response.data;
        }
        // ถ้า response.data.data เป็น array
        else if (response?.data?.data && Array.isArray(response.data.data)) {
            visitsData = response.data.data;
        }
        
        if (visitsData.length > 0) {
            const visitsWithStatus = visitsData.map((visit: any) => ({
                ...visit,
                status: getVisitStatus(visit.start_at, visit.end_at),
            }));
            setVisits(visitsWithStatus);
            console.log("Processed visits:", visitsWithStatus);
        } else {
            console.log("No visits data found");
            setVisits([]);
        }
    } catch (error) {
        console.error("Error fetching visits:", error);
        message.error("ไม่สามารถโหลดข้อมูลการเยี่ยมชมได้");
        setVisits([]);
    } finally {
        setLoading(false);
    }
};

    const getVisitStatus = (startDate: string, endDate: string) => {
        const now = dayjs();
        const start = dayjs(startDate);
        const end = dayjs(endDate);

        if (now.isBefore(start)) return 'upcoming';
        if (now.isAfter(end)) return 'completed';
        return 'ongoing';
    };

    const handleEdit = (visit: VisitInterface) => {
        setEditingVisit(visit);
        setSelectedDogs(visit.dogs || []);
        form.setFieldsValue({
            visitName: visit.visit_name,
            startDate: dayjs(visit.start_at),
            endDate: dayjs(visit.end_at)
        });
        setIsModalVisible(true);
    };

    const handleView = (visit: VisitInterface) => {
        setViewingVisit(visit);
        setIsViewModalVisible(true);
    };

    // แก้ไขฟังก์ชัน handleUpdate
const handleUpdate = async (values: VisitFormData) => {
    if (!editingVisit) return;

    if (selectedDogs.length === 0) {
        message.error({
            content: "กรุณาเลือกน้องหมาอย่างน้อย 1 ตัว",
            duration: 4
        });
        return;
    }

    try {
        setSubmitting(true);

        const visitData = {
            visit_name: values.visitName.trim(),
            start_at: values.startDate.toDate(),
            end_at: values.endDate.toDate(),
            dog_ids: selectedDogs.map(dog => dog.ID),
        };

        const response = await visitAPI.updateVisit(editingVisit.ID, visitData);
        console.log("Update response:", response);

        // ปรับการตรวจสอบ response ให้ยืดหยุ่นขึ้น
        const isSuccess = response && (
            response.status === 200 || 
            response.status === 201 ||
            (response.data && response.data.message) ||
            response.message ||
            (!response.error && !response.data?.error)
        );

        if (isSuccess) {
            message.success({
                content: "อัพเดทการเยี่ยมชมเรียบร้อยแล้ว",
                duration: 4
            });

            setIsModalVisible(false);
            setEditingVisit(null);
            form.resetFields();
            setSelectedDogs([]);
            fetchVisits(); // รีเฟรชข้อมูล
        } else {
            const errorMessage = response?.data?.error || response?.error || "เกิดข้อผิดพลาดในการอัพเดท";
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error("Error updating visit:", error);

        let errorMessage = "เกิดข้อผิดพลาดในการอัพเดทการเยี่ยมชม";

        // ตรวจสอบ HTTP status codes
        const status = error?.response?.status || error?.status;
        
        if (status === 400) {
            errorMessage = error?.response?.data?.error || "ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
        } else if (status === 401) {
            errorMessage = "ไม่มีสิทธิ์เข้าถึง กรุณาเข้าสู่ระบบใหม่";
        } else if (status === 404) {
            errorMessage = "ไม่พบข้อมูลการเยี่ยมชมที่ต้องการแก้ไข";
        } else if (status === 500) {
            errorMessage = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง";
        } else if (error?.message) {
            errorMessage = error.message;
        }

        message.error({
            content: errorMessage,
            duration: 6
        });
    } finally {
        setSubmitting(false);
    }
};

// แก้ไขฟังก์ชัน handleDelete
const handleDelete = async (visitId: number) => {
    try {
        setLoading(true);
        const response = await visitAPI.deleteVisit(visitId);
        console.log("Delete response:", response);

        // ปรับการตรวจสอบ response ให้ยืดหยุ่นขึ้น
        const isSuccess = response && (
            response.status === 200 || 
            response.status === 204 ||
            (response.data && response.data.message) ||
            response.message ||
            (!response.error && !response.data?.error)
        );

        if (isSuccess) {
            message.success({
                content: "ลบการเยี่ยมชมเรียบร้อยแล้ว",
                duration: 4
            });
            fetchVisits(); // รีเฟรชข้อมูล
        } else {
            const errorMessage = response?.data?.error || response?.error || "เกิดข้อผิดพลาดในการลบ";
            throw new Error(errorMessage);
        }
    } catch (error: any) {
        console.error("Error deleting visit:", error);

        let errorMessage = "เกิดข้อผิดพลาดในการลบการเยี่ยมชม";

        // ตรวจสอบ HTTP status codes
        const status = error?.response?.status || error?.status;
        
        if (status === 404) {
            errorMessage = "ไม่พบข้อมูลการเยี่ยมชมที่ต้องการลบ";
        } else if (status === 403) {
            errorMessage = "ไม่มีสิทธิ์ลบการเยี่ยมชมนี้";
        } else if (status === 500) {
            errorMessage = "เซิร์ฟเวอร์มีปัญหา กรุณาลองใหม่ในภายหลัง";
        } else if (error?.message) {
            errorMessage = error.message;
        }

        message.error({
            content: errorMessage,
            duration: 6
        });
    } finally {
        setLoading(false);
    }
};

    const handleDogSelect = (dogId: number) => {
        const dog = dogs.find(d => d.ID === dogId);
        if (!dog) return;

        setSelectedDogs(prevSelected => {
            if (prevSelected.some(d => d.ID === dog.ID)) {
                return prevSelected.filter(d => d.ID !== dog.ID);
            } else {
                return [...prevSelected, dog];
            }
        });
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setEditingVisit(null);
        form.resetFields();
        setSelectedDogs([]);
        setSearchTerm("");
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'blue';
            case 'ongoing': return 'green';
            case 'completed': return 'default';
            default: return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'upcoming': return 'กำลังจะมาถึง';
            case 'ongoing': return 'กำลังดำเนินการ';
            case 'completed': return 'เสร็จสิ้นแล้ว';
            default: return 'ไม่ทราบสถานะ';
        }
    };

    const columns = [
        {
            title: 'ชื่อการเยี่ยมชม',
            dataIndex: 'visit_name',
            key: 'visit_name',
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'วันที่เริ่มต้น',
            dataIndex: 'start_at',
            key: 'start_at',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY ')
        },
        {
            title: 'วันที่สิ้นสุด',
            dataIndex: 'end_at',
            key: 'end_at',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY ')
        },
        {
            title: 'จำนวนน้องหมา',
            dataIndex: 'dogs',
            key: 'dogs_count',
            render: (dogs: DogInterface[]) => (
                <Tag color="orange">{dogs?.length || 0} ตัว</Tag>
            )
        },
        {
            title: 'สถานะ',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'การดำเนินการ',
            key: 'actions',
            render: (_: any, record: VisitInterface) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        title="ดูรายละเอียด"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="แก้ไข"
                        disabled={record.status === 'completed'}
                    />
                    <Popconfirm
                        title="ยืนยันการลบ"
                        description="คุณแน่ใจหรือไม่ที่จะลบการเยี่ยมชมนี้?"
                        onConfirm={() => handleDelete(record.ID)}
                        okText="ยืนยัน"
                        cancelText="ยกเลิก"
                        okType="danger"
                    >
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            title="ลบ"
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    // กรองหมาตามคำค้นหา
    const filteredDogs = Array.isArray(dogs)
  ? dogs.filter(dog =>
      dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dog.breed?.name && dog.breed.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  : [];

    const filteredVisits = visits.filter(visit =>
    visit.visit_name.toLowerCase().includes(searchVisitTerm.toLowerCase())
);

    if (dogsError) {
        return (
            <div className="dog-visit-form-container">
                <Card className="error-card">
                    <Text type="danger">เกิดข้อผิดพลาดในการโหลดข้อมูลน้องหมา: {dogsError}</Text>
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

    return (
        <div className="dog-visit-form-container">
            {/* การ์ดหลัก: รายการการเยี่ยมชม */}
            <Card className="visit-form-card">
                <div className="form-header">
                    <Title level={2}>จัดการการเยี่ยมชมน้องหมา</Title>
                </div>
                    {/* เพิ่ม Input ค้นหาชื่อการเยี่ยมชม */}
            <Form.Item label="ค้นหาชื่อการเยี่ยมชม">
        <Input
            placeholder="พิมพ์ชื่อการเยี่ยมชม..."
            value={searchVisitTerm}
            onChange={e => setSearchVisitTerm(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
        />
    </Form.Item>


                <Table
                    columns={columns}
                    dataSource={filteredVisits}
                    loading={loading}
                    rowKey="ID"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} จาก ${total} รายการ`,
                    }}
                    locale={{
                        emptyText: "ไม่พบข้อมูลการเยี่ยมชม"
                    }}
                />
            </Card>

            {/* Modal แก้ไขการเยี่ยมชม */}
            <Modal
                title={`แก้ไขการเยี่ยมชม: ${editingVisit?.visit_name}`}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={1200}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdate}
                    className="visit-form"
                >
                    <Form.Item label="ค้นหาน้องหมา">
                        <Input
                            placeholder="พิมพ์ชื่อหรือสายพันธุ์เพื่อค้นหา..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            allowClear
                            prefix={<SearchOutlined />}
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
                            {dogsLoading ? (
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
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                icon={<EditOutlined />}
                                size="large"
                                disabled={selectedDogs.length === 0}
                            >
                                {submitting ? "กำลังอัพเดท..." : "อัพเดทการเยี่ยมชม"}
                            </Button>
                            <Button onClick={handleModalClose} size="large" disabled={submitting}>
                                ยกเลิก
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Modal ดูรายละเอียด */}
            <Modal
                title={`รายละเอียดการเยี่ยมชม: ${viewingVisit?.visit_name}`}
                open={isViewModalVisible}
                onCancel={() => setIsViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsViewModalVisible(false)}>
                        ปิด
                    </Button>
                ]}
                width={800}
            >
                {viewingVisit && (
                    <div>
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <Card size="small">
                                <Space direction="vertical">
                                    <Text><strong>ชื่อการเยี่ยมชม:</strong> {viewingVisit.visit_name}</Text>
                                    <Text><strong>วันที่เริ่มต้น:</strong> {dayjs(viewingVisit.start_at).format('DD/MM/YYYY')}</Text>
                                    <Text><strong>วันที่สิ้นสุด:</strong> {dayjs(viewingVisit.end_at).format('DD/MM/YYYY')}</Text>
                                    <Text><strong>สถานะ:</strong> <Tag color={getStatusColor(viewingVisit.status)}>{getStatusText(viewingVisit.status)}</Tag></Text>
                                </Space>
                            </Card>

                            <Card title={`น้องหมาที่เข้าร่วม (${viewingVisit.dogs?.length || 0} ตัว)`} size="small">
                                <div className="selected-dogs-grid">
                                    {viewingVisit.dogs?.map((dog) => (
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
                            </Card>
                        </Space>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DogVisitManagement;