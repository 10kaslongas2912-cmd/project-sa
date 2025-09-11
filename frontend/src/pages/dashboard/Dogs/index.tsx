// src/pages/dashboard/Dogs.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Button,
  Modal,
  Upload,
  Card,
  Row,
  Col,
  Space,
  Typography,
  Tag,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SearchOutlined,
  CameraOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import dayjs from "dayjs";
import { useDogs } from "../../../hooks/useDogs";
import { usePersonalities } from "../../../hooks/usePersonalities";
import { useBreeds } from "../../../hooks/useBreeds";
import { useAnimalSexes } from "../../../hooks/useAnimalSexes";
import { useAnimalSizes } from "../../../hooks/useAnimalSizes";
import type { PersonalityInterface } from "../../../interfaces/Personality";
import type { DogInterface } from "../../../interfaces/Dog";
import { ageText } from "../../../utils/date";
import { dogAPI, fileAPI } from "../../../services/apis";
import { publicUrl } from "../../../utils/publicUrl";
import "./style.css";

const { Title, Text } = Typography;
const { Option } = Select;

type FormData = {
  photo_url?: string;
  name: string;
  date_of_birth?: dayjs.Dayjs;
  breed_id?: number;
  animal_sex_id?: number;
  animal_size_id?: number;
  personality_ids?: number[];
};

const DogManagementSystem: React.FC = () => {
  const [form] = Form.useForm<FormData>();

  // ดึงข้อมูลหลัก
  const {
    dogs: apiDogs,
    loading: loadingDogs,
    error: errorDogs,
    refetch,
  } = useDogs();
  const {
    personalities: allPersonalities,
    loading: loadingP,
    error: errorP,
  } = usePersonalities();
  const { breeds, loading: loadingBreeds, error: errorBreeds } = useBreeds();
  const { sexes, loading: loadingSexes, error: errorSexes } = useAnimalSexes();
  const { sizes, loading: loadingSizes, error: errorSizes } = useAnimalSizes();

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<DogInterface | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // แปลงข้อมูลสำหรับแสดงผล
  const viewDogs = useMemo(() => {
    const list = Array.isArray(apiDogs) ? apiDogs : [];
    return list.map((d) => ({
      id: d.ID,
      name: d.name,
      photo_url: d.photo_url || "",
      breed_name: d.breed?.name || "ไม่ระบุ",
      sex_name: d.animal_sex?.name || "-",
      size_name: d.animal_size?.name || "-",
      date_of_birth: d.date_of_birth || "",
      personality_names: (d.dog_personalities || [])
        .map((dp) => dp?.personality?.name)
        .filter(Boolean) as string[],
    }));
  }, [apiDogs]);

  // ฟิลเตอร์ชื่อ/พันธุ์
  const filteredDogs = useMemo(() => {
    if (!searchTerm.trim()) return viewDogs;
    const q = searchTerm.toLowerCase();
    return viewDogs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.breed_name.toLowerCase().includes(q)
    );
  }, [viewDogs, searchTerm]);

  // Upload handlers
  const uploadProps: UploadProps = {
    accept: "image/*",
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("สามารถอัปโหลดไฟล์รูปภาพเท่านั้น!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
        return Upload.LIST_IGNORE;
      }
      return true; // ผ่าน validation, ให้ไปทำ customRequest ต่อ
    },
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      try {
        const { url } = await fileAPI.uploadDogImage(file as File);
        // ตั้งค่าในฟอร์มให้ไปกับ payload create/update
        form.setFieldValue("photo_url", url);
        // อัปเดตรายการไฟล์ใน UI
        setFileList([
          {
            uid: String(Date.now()),
            name: (file as File).name,
            status: "done",
            url,
          },
        ]);
        onSuccess && onSuccess({}, {} as any);
        message.success("อัปโหลดรูปสำเร็จ");
      } catch (err: any) {
        onError && onError(err);
        message.error(err?.response?.data?.error || "อัปโหลดรูปไม่สำเร็จ");
      }
    },
    onRemove: () => {
      form.setFieldValue("photo_url", "");
      setFileList([]);
    },
    fileList,
    listType: "picture-card",
    maxCount: 1,
  };

  // Form handlers
  const resetForm = () => {
    form.resetFields();
    setEditingDog(null);
    setFileList([]);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleEditDog = (dog: DogInterface) => {
    setEditingDog(dog);

    // ตั้งค่าข้อมูลในฟอร์ม
    const formValues: FormData = {
      name: dog.name || "",
      date_of_birth: dog.date_of_birth ? dayjs(dog.date_of_birth) : undefined,
      breed_id: dog.breed_id || undefined,
      animal_sex_id: dog.animal_sex_id || undefined,
      animal_size_id: dog.animal_size_id || undefined,
      personality_ids: (dog.dog_personalities || [])
        .map((dp) => dp?.personality?.ID)
        .filter(Boolean) as number[],
      photo_url: dog.photo_url || "",
    };

    form.setFieldsValue(formValues);

    // ตั้งค่ารูปภาพ
    if (dog.photo_url) {
      setFileList([
        {
          uid: "-1",
          name: "image.jpg",
          status: "done",
          url: dog.photo_url,
        },
      ]);
    }

    setIsFormOpen(true);
  };

  // CRUD Operations
const buildCreatePayload = (values: FormData) => {
  return {
    name: values.name.trim(),
    animal_sex_id: values.animal_sex_id || undefined,
    animal_size_id: values.animal_size_id || undefined,
    breed_id: values.breed_id || undefined,
    date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
    is_adopted: false,
    photo_url: values.photo_url || "",
    character: "",
    personality_ids: values.personality_ids || [],
  };
};


  const buildUpdatePayload = (original: DogInterface, values: FormData) => {
    const patch: any = {};

    if (values.name.trim() !== (original.name || "")) {
      patch.name = values.name.trim();
    }

    if (values.animal_sex_id !== original.animal_sex_id) {
      patch.animal_sex_id = values.animal_sex_id || null;
    }

    if (values.animal_size_id !== original.animal_size_id) {
      patch.animal_size_id = values.animal_size_id || null;
    }

    if (values.breed_id !== original.breed_id) {
      patch.breed_id = values.breed_id || null;
    }

    const newDateStr = values.date_of_birth
      ? values.date_of_birth.format("YYYY-MM-DD")
      : "";
    if (newDateStr !== (original.date_of_birth || "")) {
      patch.date_of_birth = newDateStr || "";
    }

    if ((values.photo_url || "") !== (original.photo_url || "")) {
      patch.photo_url = values.photo_url || "";
    }

    // Compare personalities
    const originalIds = new Set(
      (original.dog_personalities || [])
        .map((dp) => dp?.personality?.ID)
        .filter(Boolean)
    );
    const newIds = new Set(values.personality_ids || []);

    if (
      originalIds.size !== newIds.size ||
      [...originalIds].some((id) => !newIds.has(id))
    ) {
      patch.personality_ids = values.personality_ids || [];
    }

    return patch;
  };

  const handleSubmit = async (values: FormData) => {
    try {
      setSubmitting(true);

      if (editingDog) {
        const patch = buildUpdatePayload(editingDog, values);
        if (Object.keys(patch).length === 0) {
          message.info("ไม่มีข้อมูลที่เปลี่ยนแปลง");
          return;
        }
        await dogAPI.update(editingDog.ID, patch);
        message.success("บันทึกการเปลี่ยนแปลงสำเร็จ");
      } else {
        const payload = buildCreatePayload(values);
        await dogAPI.create(payload);
        message.success("เพิ่มสุนัขสำเร็จ");
      }

      await refetch();
      setIsFormOpen(false);
      resetForm();
    } catch (e: any) {
      message.error(e?.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDog = async (id: number) => {
    try {
      setSubmitting(true);
      await dogAPI.delete(id);
      message.success("ลบสำเร็จ");
      await refetch();
    } catch (e: any) {
      message.error(e?.message || "ลบไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dms-container">
      {/* Header */}
      <div className="dms-header">
        <Title level={1} className="dms-title" style={{ margin: 0 }}>
          จัดการข้อมูลสุนัข
        </Title>
        <Space size="middle">
          <Input
            placeholder="ค้นหาสุนัข..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: 250 }}
            size="large"
          />
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={openCreateForm}
            disabled={submitting}
          >
            เพิ่มสุนัขใหม่
          </Button>
        </Space>
      </div>

      {/* Content */}
      {loadingDogs ? (
        <div className="dms-empty">
          <div className="dms-empty-icon">⏳</div>
          <Title level={3} type="secondary">
            กำลังโหลดข้อมูลน้องหมา...
          </Title>
          <Text type="secondary">ดึงข้อมูลจากฐานข้อมูล</Text>
        </div>
      ) : errorDogs ? (
        <div className="dms-empty">
          <div className="dms-empty-icon">⚠️</div>
          <Title level={3} type="danger">
            {errorDogs}
          </Title>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {filteredDogs.length === 0 ? (
            <Col span={24}>
              <div className="dms-empty">
                <div className="dms-empty-icon">🐕</div>
                <Title level={3} type="secondary">
                  ยังไม่มีข้อมูลสุนัข
                </Title>
                <Text type="secondary">
                  เพิ่มข้อมูลจากฝั่งแอดมิน หรือเช็ค API
                </Text>
              </div>
            </Col>
          ) : (
            filteredDogs.map((dog) => (
              <Col key={dog.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  cover={
                    <div
                      style={{
                        height: 220,
                        overflow: "hidden",
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {dog.photo_url ? (
                        <img
                          src={publicUrl(dog.photo_url)}
                          alt={dog.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", color: "#bfbfbf" }}>
                          <CameraOutlined
                            style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                          />
                          <div>ไม่มีรูปภาพ</div>
                        </div>
                      )}
                    </div>
                  }
                  actions={[
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => {
                        const originalDog = apiDogs?.find(
                          (d) => d.ID === dog.id
                        );
                        if (originalDog) handleEditDog(originalDog);
                      }}
                      disabled={submitting}
                    >
                      แก้ไข
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title="คุณต้องการลบข้อมูลสุนัขนี้ใช่หรือไม่?"
                      onConfirm={() => handleDeleteDog(dog.id)}
                      okText="ยืนยัน"
                      cancelText="ยกเลิก"
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={submitting}
                      >
                        ลบ
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <Title
                        level={4}
                        style={{ margin: 0, marginBottom: "1rem" }}
                      >
                        {dog.name}
                      </Title>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%" }}
                      >
                        <div>
                          <Text strong>สายพันธุ์:</Text> {dog.breed_name}
                        </div>
                        <div>
                          <Text strong>เพศ:</Text> {dog.sex_name}
                        </div>
                        <div>
                          <Text strong>ขนาด:</Text> {dog.size_name}
                        </div>
                        <div>
                          <Text strong>อายุ:</Text> {ageText(dog.date_of_birth)}
                        </div>
                        <div>
                          <Text strong>วันเกิด:</Text> {dog.date_of_birth}
                        </div>
                        {dog.personality_names.length > 0 && (
                          <div>
                            <Text strong>บุคลิก:</Text>
                            <div style={{ marginTop: "0.5rem" }}>
                              {dog.personality_names.map((name, idx) => (
                                <Tag
                                  key={idx}
                                  color="blue"
                                  style={{ margin: "2px" }}
                                >
                                  {name}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Form Modal */}
      <Modal
        title={editingDog ? "แก้ไขข้อมูลสุนัข" : "เพิ่มสุนัขใหม่"}
        open={isFormOpen}
        onCancel={() => {
          setIsFormOpen(false);
          resetForm();
        }}
        footer={null}
        width={900}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={submitting}
        >
          <Row gutter={24}>
            {/* Upload Column */}
            <Col xs={24} md={8}>
              <Form.Item label="รูปภาพ" name="photo_url">
                <Upload {...uploadProps}>
                  {fileList.length === 0 && (
                    <div style={{ textAlign: "center" }}>
                      <UploadOutlined
                        style={{ fontSize: "2rem", marginBottom: "0.5rem" }}
                      />
                      <div>คลิกเพื่อเพิ่มรูปภาพ</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            {/* Form Fields Column */}
            <Col xs={24} md={16}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="ชื่อ"
                    name="name"
                    rules={[{ required: true, message: "กรุณากรอกชื่อสุนัข" }]}
                  >
                    <Input placeholder="ชื่อสุนัข" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="วันเกิด" name="date_of_birth">
                    <DatePicker
                      placeholder="เลือกวันเกิด"
                      style={{ width: "100%" }}
                      size="large"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Form.Item label="สายพันธุ์" name="breed_id">
                    <Select
                      placeholder="เลือกสายพันธุ์"
                      size="large"
                      loading={loadingBreeds}
                      allowClear
                    >
                      {(breeds ?? []).map((breed) => (
                        <Option key={breed.ID} value={breed.ID}>
                          {breed.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="เพศ" name="animal_sex_id">
                    <Select
                      placeholder="เลือกเพศ"
                      size="large"
                      loading={loadingSexes}
                      allowClear
                    >
                      {(sexes ?? []).map((sex) => (
                        <Option key={sex.ID} value={sex.ID}>
                          {sex.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="ขนาด" name="animal_size_id">
                    <Select
                      placeholder="เลือกขนาด"
                      size="large"
                      loading={loadingSizes}
                      allowClear
                    >
                      {(sizes ?? []).map((size) => (
                        <Option key={size.ID} value={size.ID}>
                          {size.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="ลักษณะนิสัย" name="personality_ids">
                <Checkbox.Group style={{ width: "100%" }}>
                  <Row gutter={[8, 8]}>
                    {(allPersonalities ?? []).map(
                      (personality: PersonalityInterface) => (
                        <Col key={personality.ID} xs={24} sm={12} md={8}>
                          <Checkbox value={personality.ID}>
                            {personality.name}
                          </Checkbox>
                        </Col>
                      )
                    )}
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Row>

          {/* Form Actions */}
          <Row
            justify="end"
            style={{
              marginTop: "2rem",
              paddingTop: "1rem",
              borderTop: "1px solid #f0f0f0",
            }}
          >
            <Space>
              <Button
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                disabled={submitting}
                size="large"
              >
                ยกเลิก
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
                icon={<HeartOutlined />}
              >
                {editingDog ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มสุนัข"}
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default DogManagementSystem;
