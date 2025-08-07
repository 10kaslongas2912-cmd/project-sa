import React from 'react';
import { Heart } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Paws & Hearts
              </h1>
              <p className="text-gray-600 text-sm">Dog Sponsorship Program</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;