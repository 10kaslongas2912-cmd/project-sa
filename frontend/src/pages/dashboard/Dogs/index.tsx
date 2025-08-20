// src/pages/dashboard/dogs/index.tsx (ส่วนที่เพิ่ม/ปรับ)
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button, Input, Space, Table, Typography, Avatar, Tooltip,
  Popconfirm, Drawer, Form, Select, DatePicker, Upload, message, InputNumber, Modal
} from "antd";
import { PlusOutlined, FilterOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

type Dog = {
  id: number;
  name: string;
  breed: string;
  ageYears: number;
  color: string;
  avatar?: string;
};

const seed: Dog[] = [
  { id: 1, name: "Buddy",   breed: "Golden Retriever",  ageYears: 5, color: "Golden" },
  { id: 2, name: "Luna",    breed: "Labrador",          ageYears: 3, color: "Black" },
  { id: 3, name: "Max",     breed: "German Shepherd",   ageYears: 7, color: "Brown" },
  { id: 4, name: "Bella",   breed: "Bulldog",           ageYears: 4, color: "White" },
  { id: 5, name: "Charlie", breed: "Poodle",            ageYears: 2, color: "Cream" },
  { id: 6, name: "Rocky",   breed: "Beagle",            ageYears: 6, color: "Tan" },
  { id: 7, name: "Daisy",   breed: "Yorkshire Terrier", ageYears: 1, color: "Brown" },
  { id: 8, name: "Cooper",  breed: "Shiba Inu",         ageYears: 4, color: "Red" },
  { id: 9, name: "Milo",    breed: "Corgi",             ageYears: 5, color: "Fawn" },
  { id:10, name: "Coco",    breed: "Pomeranian",        ageYears: 2, color: "White" },
  { id:11, name: "Nala",    breed: "Husky",             ageYears: 3, color: "Grey" },
  { id:12, name: "Bailey",  breed: "Mixed",             ageYears: 6, color: "Brown" },
];

const DogsPage: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Dog[]>(seed);

  // ---------- Drawer state (desktop only) ----------
  const [addOpen, setAddOpen] = useState(false);
  const [form] = Form.useForm();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      d =>
        d.name.toLowerCase().includes(q) ||
        d.breed.toLowerCase().includes(q) ||
        d.color.toLowerCase().includes(q) ||
        String(d.id).includes(q)
    );
  }, [data, query]);

  const handleCreate = async () => {
    const v = await form.validateFields();
    const nextId = (data.reduce((m, d) => Math.max(m, d.id), 0) || 0) + 1;
    const newDog: Dog = {
      id: nextId,
      name: v.name,
      breed: v.breed,
      ageYears: v.ageYears,
      color: v.color ?? "",
      avatar: v.avatar?.[0]?.originFileObj ? URL.createObjectURL(v.avatar[0].originFileObj) : undefined,
    };
    setData(prev => [newDog, ...prev]);
    message.success("Dog created");
    form.resetFields();
    setAddOpen(false);

    // ไปหน้าเต็มถ้าต้องการกรอกต่อ (ตัวเลือก)
    // navigate(`/dashboard/dogs/${nextId}/edit`);
  };

  const handleCancel = () => {
    if (form.isFieldsTouched()) {
      Modal.confirm({
        title: "Discard changes?",
        okText: "Discard",
        onOk: () => { form.resetFields(); setAddOpen(false); }
      });
    } else {
      setAddOpen(false);
    }
  };

  const columns: ColumnsType<Dog> = [
    {
      title: "Name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (_, rec) => (
        <Space>
          <Avatar size={36} src={rec.avatar}>{rec.name[0]}</Avatar>
          <div>
            <div style={{ fontWeight: 600 }}>{rec.name}</div>
            <div style={{ fontSize: 12, color: "#858b94", lineHeight: 1 }}>ID: {rec.id}</div>
          </div>
        </Space>
      ),
    },
    { title: "Breed", dataIndex: "breed", sorter: (a, b) => a.breed.localeCompare(b.breed) },
    { title: "Age", dataIndex: "ageYears", width: 120, sorter: (a, b) => a.ageYears - b.ageYears, render: n => `${n} year${n>1?"s":""}` },
    { title: "Color", dataIndex: "color", width: 140, sorter: (a, b) => a.color.localeCompare(b.color) },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: "right",
      render: (_, rec) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => navigate(`${rec.id}/edit`)} />
          </Tooltip>
          <Popconfirm
            title="Delete dog"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => setData(prev => prev.filter(d => d.id !== rec.id))}
          >
            <Tooltip title="Delete"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="dogs-page">
      <Typography.Title level={2} className="page-title">Dog Management</Typography.Title>
      <Typography.Paragraph className="page-sub">
        Manage your dog records with comprehensive tools for adding, editing, and organizing your pets' information.
      </Typography.Paragraph>

      <div className="toolbar">
        <Input
          allowClear
          placeholder="Search dogs by name, breed, or color..."
          className="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="toolbar-right">
          <span className="total">{filtered.length} dogs total</span>
          <Button icon={<FilterOutlined />}>Filters</Button>
          <Button type="primary" icon={<PlusOutlined />} className="add-btn" onClick={() => setAddOpen(true)}>
            Add New Dog
          </Button>
        </div>
      </div>

      <div className="table-wrap">
        <Table rowKey="id" columns={columns} dataSource={filtered} pagination={{ pageSize: 10, showSizeChanger: false }} />
      </div>

 
      <Drawer
        title="Add New Dog"
        open={addOpen}
        onClose={handleCancel}
        width={640}            
        maskClosable={false}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Required" }]}>
            <Input placeholder="Buddy" />
          </Form.Item>
          <Form.Item name="breed" label="Breed" rules={[{ required: true }]}>
            <Input placeholder="Golden Retriever" />
          </Form.Item>
          <Form.Item name="ageYears" label="Age (years)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="sex" label="Sex" rules={[{ required: true }]}>
            <Select options={[{value:"male",label:"Male"},{value:"female",label:"Female"}]} />
          </Form.Item>
          <Form.Item name="color" label="Color">
            <Input placeholder="Brown" />
          </Form.Item>
          <Form.Item name="cage" label="Cage">
            <Input placeholder="B2" />
          </Form.Item>
          <Form.Item name="intakeDate" label="Intake Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="avatar" label="Photo" valuePropName="fileList" getValueFromEvent={(e)=>e?.fileList}>
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" onClick={handleCreate}>Save</Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

export default DogsPage;
