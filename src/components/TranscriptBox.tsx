

import React from 'react';
import { Mic, Globe, Play, Square } from 'lucide-react';
import { TranscriptData } from '../types';

interface TranscriptBoxProps {
  icon: 'mic' | 'globe';
  title: string;
  data: TranscriptData;
  isPlayable?: boolean;
  onPlayClick?: () => void;
  isPlaying?: boolean;
}

const TranscriptBox: React.FC<TranscriptBoxProps> = ({ 
  icon, 
  title, 
  data, 
  isPlayable = false,
  onPlayClick,
  isPlaying = false
}) => {
  // Combine final and interim transcripts for live display
  const displayedText = data.final + (data.interim ? ("\n" + data.interim) : "");
  
  return (
    <div className="neumorphic-card relative h-64 rounded-2xl bg-[#f0f4f8] p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.1),_-5px_-5px_15px_rgba(255,255,255,0.8)]">
      <div className="flex items-center mb-4">
        <div className="neumorphic-icon flex items-center justify-center w-10 h-10 rounded-full bg-[#f0f4f8] shadow-[3px_3px_6px_rgba(0,0,0,0.1),_-3px_-3px_6px_rgba(255,255,255,0.7)]">
          {icon === 'mic' ? (
            <Mic className="w-5 h-5 text-blue-600" />
          ) : (
            <Globe className="w-5 h-5 text-blue-600" />
          )}
        </div>
        <h3 className="ml-3 text-lg font-semibold text-gray-700">{title}</h3>
        
        {isPlayable && (
          <div className="ml-auto">
            <button 
              onClick={onPlayClick}
              className="neumorphic-button flex items-center justify-center w-10 h-10 rounded-full bg-[#f0f4f8] shadow-[3px_3px_6px_rgba(0,0,0,0.1),_-3px_-3px_6px_rgba(255,255,255,0.7)] hover:shadow-[2px_2px_5px_rgba(0,0,0,0.1),_-2px_-2px_5px_rgba(255,255,255,0.7)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-3px_-3px_7px_rgba(255,255,255,0.7)] transition-all duration-300"
            >
              {isPlaying ? (
                <Square className="w-4 h-4 text-red-500" />
              ) : (
                <Play className="w-4 h-4 text-green-600 ml-0.5" />
              )}
            </button>
          </div>
        )}
      </div>
      
      <div className="h-[calc(100%-2.5rem)] overflow-y-auto">
        {displayedText ? (
          <p className="text-gray-600 whitespace-pre-wrap">{displayedText}</p>
        ) : (
          <p className="text-gray-400 italic text-center mt-12">No transcript available</p>
        )}
      </div>
    </div>
  );
};

export default TranscriptBox;
