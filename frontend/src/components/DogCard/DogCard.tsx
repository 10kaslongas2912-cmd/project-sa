import React from 'react';

interface DogCardProps {
  dogName: string;
  dogAge: string;
  dogSize: string;
  imageSrc: string;
  imageAlt: string;
}

const DogCard: React.FC<DogCardProps> = ({ dogName, dogAge, dogSize, imageSrc, imageAlt }) => {
  return (
    <div className="w-[318px] h-[554px] rounded-3xl p-4 bg-white shadow-lg flex flex-col items-center justify-between">
      {/* กรอบรูปข้างใน */}
      <div className="w-[279px] h-[282px] rounded-3xl overflow-hidden shadow-md bg-gray-200">
        <img src={imageSrc} alt={imageAlt} className="w-full h-full object-cover" />
      </div>

      {/* รายละเอียดของสุนัข */}
      <div className="text-center mt-4">
        <h3 className="text-2xl font-bold">{dogName}</h3>
        <p className="text-gray-600 mt-2">
          อายุ {dogAge} | {dogSize}
        </p>
      </div>

      {/* ปุ่ม */}
      <button className="mt-4 px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors duration-200">
        อุปถัมภ์น้อง
      </button>
    </div>
  );
};

export default DogCard;