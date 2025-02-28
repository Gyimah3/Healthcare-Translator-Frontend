import React from 'react';
import { Mic, Globe, Play, Shield, Clock, Stethoscope } from 'lucide-react';
import FeatureCard from './FeatureCard';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Voice-Pal</h1>
          <img 
            src="https://naomedical.com/wp-content/uploads/2024/11/Nao-Medical-Logo-3.svg" 
            alt="Nao Medical Logo" 
            className="h-10 md:h-12"
          />
        </div>

        <div className="glassmorphic-hero mb-16 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-30 shadow-xl">
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
              Care when you need it, right in your neighborhood.
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              At Nao Medical we believe that everyone should have access to excellent healthcare. 
              Our AI-powered Voice Translator helps break language barriers, providing real-time 
              translation for better communication between patients and healthcare providers.
            </p>
            <button 
              onClick={onStart}
              className="neumorphic-button bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-[5px_5px_10px_rgba(0,0,0,0.2)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.2)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              Start Translating
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <FeatureCard 
            icon={Mic}
            title="Voice-to-Text"
            description="Click on the Microphone to Speak in your language and our AI-powered system will transcribe your speech with high accuracy, even for medical terminology."
          />
          <FeatureCard 
            icon={Globe}
            title="Real-Time Translation"
            description="Get instant translations into multiple languages, instant play button will appear, helping patients and providers communicate effectively."
          />
          <FeatureCard 
            icon={Play}
            title="Audio Playback"
            description="Stop the Microphone and Listen to the translated text with natural-sounding speech to ensure proper pronunciation and understanding."
          />
        </div>

        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Nao Medical Benefits</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard 
            icon={Clock}
            title="Same-Day Appointments"
            description="Book appointments for the same day and get the care you need without waiting."
          />
          <FeatureCard 
            icon={Stethoscope}
            title="Board-Certified Providers"
            description="Our healthcare team consists of board-certified doctors and medical providers."
          />
          <FeatureCard 
            icon={Shield}
            title="Privacy & Security"
            description="Your health information is protected with industry-standard security measures."
          />
        </div>

        <div className="text-center">
          <button 
            onClick={onStart}
            className="neumorphic-button bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-[5px_5px_10px_rgba(0,0,0,0.2)] hover:shadow-[3px_3px_6px_rgba(0,0,0,0.2)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2)] transition-all duration-300"
          >
            Start Translating
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;