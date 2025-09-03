import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { message } from 'antd';
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

  useEffect(() => {
    const fetchDogs = async () => {
      if (searchQuery) {
        try {
          const results = await healthRecordAPI.searchDogs(searchQuery);
          setDogSearchResults(results);
        } catch (error) {
          message.error('Failed to search dogs.');
          console.error(error);
        }
      } else {
        setDogSearchResults([]);
      }
    };
    fetchDogs();
  }, [searchQuery]);

  const handleDogSelect = (dog: DogInfo) => {
    navigate(`/health-record/dog/${dog.dog_id}`);
  };

  const handleBack = () => {
    navigate(-1);
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
            onChange={(e) => setSearchQuery(e.target.value)}
            suffix={<SearchOutlined />}
            size="large"
            className="search-input"
            style={{width: '100%',maxWidth: '1200px'}}
          />
        </div>
      </div>

      <div className="search-results">
        {searchQuery && dogSearchResults.length === 0 && (
          <div className="no-results">
            <div className="dog-silhouette" />
            <Text type="secondary">ไม่พบสุนัขที่ค้นหา</Text>
          </div>
        )}

        {dogSearchResults.map((dog) => (
          <Card 
            key={dog.dog_id}
            className="dog-result-card"
            onClick={() => handleDogSelect(dog)}
            hoverable
          >
            <Row gutter={16} align="middle">
              <Col span={6}>
                <div className="dog-image">
                  <img src={dog.PhotoURL} alt={dog.Name} />
                </div>
              </Col>
              <Col span={18}>
                <div className="dog-info">
                  <Title level={4} className="dog-name">{dog.Name}</Title>
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