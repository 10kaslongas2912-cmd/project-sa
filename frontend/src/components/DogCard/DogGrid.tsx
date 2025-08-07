import React from 'react';
import DogCard from './DogCard';
import { type Dog } from '../../interfaces/Dog';

const dogs: Dog[] = [
  {
    id: 1,
    name: 'Luna',
    photo: 'https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600',
    gender: 'Female',
    size: 'Medium',
    age: '3 years',
    personality: 'Gentle, loyal, and loves cuddles. Great with children and other pets.',
    careInstructions: 'Needs daily walks, regular grooming, and lots of love. Prefers a quiet home environment.'
  },
  {
    id: 2,
    name: 'Max',
    photo: 'https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?auto=compress&cs=tinysrgb&w=600',
    gender: 'Male',
    size: 'Large',
    age: '5 years',
    personality: 'Energetic, playful, and incredibly smart. Loves outdoor adventures.',
    careInstructions: 'Requires plenty of exercise, mental stimulation, and a secure yard to play in.'
  },
  {
    id: 3,
    name: 'Bella',
    photo: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=600',
    gender: 'Female',
    size: 'Small',
    age: '2 years',
    personality: 'Sweet, affectionate, and always ready for snuggles. Perfect lap dog.',
    careInstructions: 'Enjoys short walks, indoor play, and consistent feeding schedule. Sensitive to cold weather.'
  },
  {
    id: 4,
    name: 'Charlie',
    photo: 'https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=600',
    gender: 'Male',
    size: 'Medium',
    age: '4 years',
    personality: 'Friendly, outgoing, and loves meeting new people. Great social butterfly.',
    careInstructions: 'Thrives on social interaction, regular exercise, and training sessions. Loves puzzle toys.'
  },
  {
    id: 5,
    name: 'Daisy',
    photo: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=600',
    gender: 'Female',
    size: 'Large',
    age: '6 years',
    personality: 'Calm, wise, and protective. A gentle giant with a heart of gold.',
    careInstructions: 'Needs moderate exercise, joint supplements, and a comfortable sleeping area. Excellent guard dog.'
  },
  {
    id: 6,
    name: 'Rocky',
    photo: 'https://images.pexels.com/photos/1629781/pexels-photo-1629781.jpeg?auto=compress&cs=tinysrgb&w=600',
    gender: 'Male',
    size: 'Small',
    age: '1 year',
    personality: 'Curious, brave, and full of puppy energy. Always ready for an adventure.',
    careInstructions: 'Requires puppy training, socialization, and plenty of safe chew toys. High energy needs.'
  }
];

const DogGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {dogs.map((dog) => (
        <DogCard key={dog.id} dog={dog} />
      ))}
    </div>
  );
};

export default DogGrid;