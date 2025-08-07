import React, { useState } from 'react';
import { Heart, User, Ruler, Calendar, Sparkles, ClipboardList } from 'lucide-react';
import type { Dog }  from '../../interfaces/Dog';

interface DogCardProps {
  dog: Dog;
}

const DogCard: React.FC<DogCardProps> = ({ dog }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getSizeColor = (size: string) => {
    switch (size.toLowerCase()) {
      case 'small':
        return 'bg-green-100 text-green-800'; 
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'large':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGenderColor = (gender: string) => {
    return gender.toLowerCase() === 'female' 
      ? 'bg-pink-100 text-pink-800' 
      : 'bg-cyan-100 text-cyan-800';
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 overflow-hidden ${
        isHovered ? 'scale-105' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dog Photo */}
      <div className="relative h-64 overflow-hidden">
        <div className={`absolute inset-0 bg-gray-200 animate-pulse ${isImageLoaded ? 'hidden' : ''}`} />
        <img
          src={dog.photo}
          alt={`${dog.name} - adorable dog looking for sponsorship`}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-110' : ''
          } ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
        />
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Name and Basic Info */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">{dog.name}</h3>
          <div className="flex justify-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getGenderColor(dog.gender)}`}>
              <User className="w-3 h-3 mr-1" />
              {dog.gender}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getSizeColor(dog.size)}`}>
              <Ruler className="w-3 h-3 mr-1" />
              {dog.size}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              <Calendar className="w-3 h-3 mr-1" />
              {dog.age}
            </span>
          </div>
        </div>

        {/* Personality */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-gray-700">Personality</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{dog.personality}</p>
        </div>

        {/* Care Instructions */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-gray-700">Care Instructions</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{dog.careInstructions}</p>
        </div>

        {/* Sponsor Button */}
        <div className="pt-4">
          <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-orange-200 shadow-lg">
            <div className="flex items-center justify-center space-x-2">
              <Heart className="w-5 h-5" fill="currentColor" />
              <span>Sponsor {dog.name}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DogCard;