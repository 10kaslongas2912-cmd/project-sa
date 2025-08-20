// src/pages/RecordHealt/searchpage/SearchPageComponent.tsx

import React from 'react';
import './style.css';
import { 
  Input, 
  Button, 
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import { SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import type { DogInfo } from '../interface/types';

const { Title, Text } = Typography;

// Mock data for display purposes inside the card

interface SearchPageProps {
  searchQuery: string;
  searchResults: DogInfo[];
  onSearchChange: (query: string) => void;
  onDogSelect: (dog: DogInfo) => void;
  onBack: () => void;
}

const SearchPageComponent: React.FC<SearchPageProps> = ({
  searchQuery,
  searchResults,
  onSearchChange,
  onDogSelect,
  onBack
}) => {
  return (
    <div className="search-page">
      <div className="search-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={onBack}
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
            onChange={(e) => onSearchChange(e.target.value)}
            suffix={<SearchOutlined />}
            size="large"
            className="search-input"
            style={{width: '100%',maxWidth: '1200px'}}
          />
        </div>
      </div>

      <div className="search-results">
        {searchQuery && searchResults.length === 0 && (
          <div className="no-results">
            <div className="dog-silhouette" />
            <Text type="secondary">ไม่พบสุนัขที่ค้นหา</Text>
          </div>
        )}

        {searchResults.map((dog) => (
          <Card 
            key={dog.dog_id}
            className="dog-result-card"
            onClick={() => onDogSelect(dog)}
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

export default SearchPageComponent;