import React from 'react';
import DogCard from './DogCard';

const dogData = [
  { id: 1, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: 'https://via.placeholder.com/279x282' },
  { id: 2, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: 'https://via.placeholder.com/279x282' },
  { id: 3, name: 'น้อง H2K', age: '7 ปี 3 เดือน', size: 'ขนาดกลาง', image: 'https://via.placeholder.com/279x282' },
];

const DogList: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
      <h2 className="text-4xl font-bold mb-10">น้องหมาที่รอคุณอุปถัมภ์</h2>
      <div className="flex flex-wrap gap-10 justify-center">
        {dogData.map((dog) => (
          <DogCard
            key={dog.id}
            dogName={dog.name}
            dogAge={dog.age}
            dogSize={dog.size}
            imageSrc={dog.image}
            imageAlt={`รูปภาพของ ${dog.name}`}
          />
        ))}
      </div>
    </div>
  );
};

export default DogList;