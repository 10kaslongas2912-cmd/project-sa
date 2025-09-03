import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message, Spin } from 'antd';
import { 
  Input, 
  Button, 
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { DogInfo } from '../../../../interfaces/HealthRecord';
import { healthRecordAPI } from '../../../../services/apis';
import "./style.css";

const { Title, Text } = Typography;

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dogSearchResults, setDogSearchResults] = useState<DogInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchDogs = async () => {
        if (searchQuery.trim()) {
          setLoading(true);
          setHasSearched(true);
          try {
            const results = await healthRecordAPI.searchDogs(searchQuery.trim());
            setDogSearchResults(results || []);
          } catch (error) {
            message.error('เกิดข้อผิดพลาดในการค้นหาสุนัข');
            console.error('Search error:', error);
            setDogSearchResults([]);
          } finally {
            setLoading(false);
          }
        } else {
          setDogSearchResults([]);
          setHasSearched(false);
          setLoading(false);
        }
      };
      fetchDogs();
    }, 300); // 300ms delay for debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDogSelect = (dog: DogInfo) => {
    if (dog.dog_id) {
      navigate(`/health-record/dog/${dog.dog_id}`);
    } else {
      message.error('ไม่สามารถเปิดข้อมูลสุนัขได้');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          className="back-button"
        >
          ย้อนกลับ
        </Button>
        
        <Title level={2} className="page-title">
          บันทึกสุขภาพสุนัข
        </Title>
        <div className="title-underline"></div>
        
        <div className="search-container">
          <Input
            placeholder="ค้นหาด้วยชื่อหรือรหัสสุนัข"
            value={searchQuery}
            onChange={handleSearchChange}
            suffix={loading ? <Spin size="small" /> : <SearchOutlined />}
            size="large"
            className="search-input"
            style={{width: '100%', maxWidth: '1200px'}}
          />
        </div>
      </div>

      <div className="search-results">
        {loading && searchQuery && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">กำลังค้นหา...</Text>
            </div>
          </div>
        )}

        {!loading && hasSearched && dogSearchResults.length === 0 && searchQuery.trim() && (
          <div className="no-results">
            <div className="dog-silhouette" />
            <Text type="secondary" style={{ fontFamily: 'Anakotmai-Bold' }}>
              ไม่พบสุนัขที่ค้นหา
            </Text>
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                ลองเปลี่ยนคำค้นหาหรือตรวจสอบการสะกดอีกครั้ง
              </Text>
            </div>
          </div>
        )}

        {!loading && dogSearchResults.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <Text type="secondary">
              พบ {dogSearchResults.length} ผลลัพธ์
            </Text>
          </div>
        )}

        {!loading && dogSearchResults.map((dog) => (
          <Card 
            key={dog.dog_id}
            className="dog-result-card"
            onClick={() => handleDogSelect(dog)}
            hoverable
            style={{ marginBottom: '12px' }}
          >
            <Row gutter={16} align="middle">
              <Col span={6}>
                <div className="dog-image">
                  <img 
                    src={dog.PhotoURL} 
                    alt={dog.Name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-dog-image.jpg'; // fallback image
                    }}
                  />
                </div>
              </Col>
              <Col span={18}>
                <div className="dog-info">
                  <Title level={4} className="dog-name">{dog.Name}</Title>
                  <Text type="secondary">ID: {dog.dog_id}</Text>
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;