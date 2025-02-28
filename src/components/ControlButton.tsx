import React from 'react';
import { Mic, RefreshCw } from 'lucide-react';

interface ControlButtonProps {
  type: 'mic' | 'reset';
  onClick: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  type, 
  onClick, 
  isActive = false,
  isDisabled = false 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'mic':
        return <Mic className={`w-6 h-6 ${isActive ? 'text-red-500' : 'text-blue-600'}`} />;
      case 'reset':
        return <RefreshCw className="w-6 h-6 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        neumorphic-button
        flex items-center justify-center
        w-14 h-14 rounded-full
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isActive 
          ? 'bg-[#f0f4f8] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-3px_-3px_7px_rgba(255,255,255,0.7)]' 
          : 'bg-[#f0f4f8] shadow-[5px_5px_10px_rgba(0,0,0,0.1),_-5px_-5px_10px_rgba(255,255,255,0.8)]'}
        hover:shadow-[3px_3px_6px_rgba(0,0,0,0.1),_-3px_-3px_6px_rgba(255,255,255,0.7)]
        active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-3px_-3px_7px_rgba(255,255,255,0.7)]
        transition-all duration-300
      `}
    >
      {getIcon()}
    </button>
  );
};

export default ControlButton;