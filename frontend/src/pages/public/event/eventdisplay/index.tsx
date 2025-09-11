import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './style.css'; // Import CSS file

// Import types (adjust import path as needed)
import type { 
  EventInterface,
  PaginationResponse
} from '../../../../interfaces/Event';

// Import API (adjust import path as needed)
import { api } from '../../../../services/apis';

interface EventDisplayProps {
  eventsPerPage?: number;
}

const EventDisplay: React.FC<EventDisplayProps> = ({ eventsPerPage = 4 }) => {
  const [events, setEvents] = useState<EventInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});

  // Base URL สำหรับ API - ปรับตาม backend ของคุณ
  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage]);

  const fetchEvents = async (page: number) => {
    try {
      setLoading(true);
      const response: PaginationResponse<EventInterface> = await api.eventAPI.getAll(page, eventsPerPage);
      setEvents(response.data || []);
      setTotalPages(response.pagination.total_pages);
      setTotalItems(response.pagination.total_items);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return {
      date: date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ฟังก์ชันสำหรับจัดการ URL รูปภาพ
  const getImageUrl = (imageUrl: string | undefined): string => {
    if (!imageUrl) return '';
    
    // ถ้า URL เป็น absolute URL แล้ว
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // ถ้า URL เริ่มต้นด้วย /static
    if (imageUrl.startsWith('/static')) {
      return `${API_BASE_URL}${imageUrl}`;
    }
    
    // ถ้า URL เริ่มต้นด้วย static (ไม่มี /)
    if (imageUrl.startsWith('static')) {
      return `${API_BASE_URL}/${imageUrl}`;
    }
    
    // กรณีอื่นๆ
    return `${API_BASE_URL}/static/uploads/events/${imageUrl}`;
  };

  const handleImageError = (eventId: number, imageUrl: string) => {
    console.error('Failed to load image:', imageUrl);
    setImageErrors(prev => ({ ...prev, [eventId]: true }));
  };

  const handleImageLoad = (eventId: number) => {
    // ลบ error state เมื่อรูปโหลดสำเร็จ
    setImageErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[eventId];
      return newErrors;
    });
  };

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div style={styles.pagination}>
        {pageNumbers.map(number => (
          <button
            key={number}
            style={{
              ...styles.pageButton,
              ...(number === currentPage ? styles.activePageButton : {})
            }}
            onClick={() => goToPage(number)}
          >
            {number}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>กำลังโหลดกิจกรรม...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.eventsContainer}>
        {events.map((event, index) => {
          const startDateTime = formatDateTime(event.start_at);
          const endDateTime = formatDateTime(event.end_at);
          const isEven = index % 2 === 0;
          const imageUrl = getImageUrl(event.image_url);
          const hasImageError = imageErrors[event.ID];

          return (
            <div 
              key={event.ID} 
              style={{
                ...styles.eventSection,
                backgroundColor: isEven ? '#ECECEC' : '#FFFFFF'
              }}
            >
              <div style={styles.eventContent}>
                {/* Event Image */}
                <div style={styles.imageContainer}>
                  {imageUrl && !hasImageError ? (
                    <img 
                      src={imageUrl} 
                      alt={event.name}
                      style={styles.eventImage}
                      onLoad={() => handleImageLoad(event.ID)}
                      onError={() => handleImageError(event.ID, imageUrl)}
                    />
                  ) : (
                    <div style={styles.placeholderImage}>
                      <span style={styles.placeholderText}>
                        {event.image_url ? 'ไม่สามารถโหลดรูปภาพได้' : 'ไม่มีรูปภาพ'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div style={styles.eventDetails}>
                  <h2 style={styles.eventTitle}>{event.name}</h2>
                  
                  <div style={styles.eventDescription}>
                    <p style={styles.detailText}>
                      <strong>รายละเอียดกิจกรรม</strong><br />
                      กิจกรรมจัด ณ วันที่ {startDateTime.date} จนถึงวันที่ {endDateTime.date}
                      <br/>โดยจะเริ่มเวลา {startDateTime.time}น.  ถึงเวลา {endDateTime.time} น.
                      {event.description && (
                        <>
                          <br />
                          <strong>วัตถุประสงค์:</strong> {event.description}
                        </>
                      )}
                      {event.organizer && (
                        <>
                          <br />
                          <strong>ผู้จัดการกิจกรรม:</strong> {event.organizer}
                        </>
                      )}
                      {event.location && (
                        <>
                          <br />
                          <strong>สถานที่:</strong> {event.location}
                        </>
                      )}
                      {event.contact_info && (
                        <>
                          <br />
                          <strong>ติดต่อ:</strong> {event.contact_info}
                        </>
                      )}
                      {event.capacity && (
                        <>
                          <br />
                          <strong>จำนวนที่รับ:</strong> {event.capacity} คน
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && renderPagination()}
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    fontFamily: 'Anakotmai, sans-serif',
    backgroundColor: '#FFFFFF',
    paddingTop: '150px', // Space for navbar
  },
  eventsContainer: {
    width: '100%',
  },
  eventSection: {
    width: '100%',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px 0',
  },
  eventContent: {
    display: 'flex',
    maxWidth: '1200px',
    width: '100%',
    gap: '80px',
    alignItems: 'center',
    padding: '0 120px',
  },
  imageContainer: {
    flex: '0 0 350px',
  },
  eventImage: {
    width: '350px',
    height: '300px',
    objectFit: 'cover' as const,
    borderRadius: '8px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  },
  placeholderImage: {
    width: '350px',
    height: '300px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #ccc',
  },
  placeholderText: {
    color: '#999',
    fontSize: '16px',
    fontWeight: 300,
    textAlign: 'center' as const,
  },
  eventDetails: {
    flex: 1,
    maxWidth: '628px',
  },
  eventTitle: {
    fontSize: '36px',
    fontWeight: 300,
    lineHeight: '55px',
    color: '#253C90',
    margin: '0 0 20px 0',
    fontFamily: 'Anakotmai, sans-serif',
  },
  eventDescription: {
    width: '100%',
  },
  detailText: {
    fontSize: '20px',
    fontWeight: 300,
    lineHeight: '31px',
    color: '#000000',
    margin: 0,
    fontFamily: 'Anakotmai, sans-serif',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    padding: '50px 0',
    marginTop: '50px',
  },
  pageButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#D9D9D9',
    color: '#000000',
    fontSize: '20px',
    fontWeight: 300,
    fontFamily: 'Anakotmai, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePageButton: {
    backgroundColor: '#253C90',
    color: '#FFFFFF',
    transform: 'scale(1.1)',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '100px 20px',
    fontSize: '24px',
    color: '#666',
    fontFamily: 'Anakotmai, sans-serif',
  },
};

export default EventDisplay;