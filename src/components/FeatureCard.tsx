import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="glassmorphic-card bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20 shadow-lg">
      <div className="neumorphic-icon-container w-14 h-14 rounded-full flex items-center justify-center mb-4 bg-[#f0f4f8] shadow-[3px_3px_6px_rgba(0,0,0,0.1),_-3px_-3px_6px_rgba(255,255,255,0.7)]">
        <Icon className="w-7 h-7 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default FeatureCard;