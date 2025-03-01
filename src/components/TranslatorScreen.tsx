// import React, { useState, useEffect, useRef } from 'react';
// import { ArrowLeft } from 'lucide-react';
// import LanguageSelector from './LanguageSelector';
// import TranscriptBox from './TranscriptBox';
// import ControlButton from './ControlButton';
// import StatusIndicator from './StatusIndicator';
// import { TranscriptData } from '../types';
// import translationService from '../services/translationService';

// interface TranslatorScreenProps {
//   onBack: () => void;
// }

// const TranslatorScreen: React.FC<TranslatorScreenProps> = ({ onBack }) => {
//   const [sourceLanguage, setSourceLanguage] = useState('en-US');
//   const [targetLanguage, setTargetLanguage] = useState('es-ES');
//   const [isListening, setIsListening] = useState(false);
//   const [isConnected, setIsConnected] = useState(false);
//   const [statusMessage, setStatusMessage] = useState('Connecting...');
//   const [originalTranscript, setOriginalTranscript] = useState<TranscriptData>({ text: '', isLoading: false });
//   const [translatedTranscript, setTranslatedTranscript] = useState<TranscriptData>({ text: '', isLoading: false });
//   const [isPlaying, setIsPlaying] = useState(false);
  
//   const audioRef = useRef<HTMLAudioElement | null>(null);
  
//   // Initialize connection to translation service
//   useEffect(() => {
//     // Set up callbacks for the translation service
//     translationService.setCallbacks({
//       onStatusChange: (message, connected) => {
//         setStatusMessage(message);
//         setIsConnected(connected);
//       },
      
//       onTranscriptUpdate: (text, isFinal) => {
//         if (isFinal) {
//           setOriginalTranscript(prev => ({
//             text: prev.text + (prev.text ? '\n' : '') + text,
//             isLoading: false
//           }));
//         } else {
//           // For interim results, we could show them differently if needed
//           setOriginalTranscript(prev => ({
//             ...prev,
//             isLoading: true
//           }));
//         }
//       },
      
//       onTranslationUpdate: (text, fullTranslation) => {
//         setTranslatedTranscript(prev => ({
//           text: fullTranslation,
//           isLoading: false
//         }));
//       },
      
//       onListeningStateChange: (listening) => {
//         setIsListening(listening);
//         if (listening) {
//           setOriginalTranscript(prev => ({ ...prev, isLoading: true }));
//         } else {
//           setOriginalTranscript(prev => ({ ...prev, isLoading: false }));
//         }
//       },
      
//       onAudioReceived: (audioData) => {
//         try {
//           // Convert base64 to blob
//           const byteCharacters = atob(audioData);
//           const byteNumbers = new Array(byteCharacters.length);
//           for (let i = 0; i < byteCharacters.length; i++) {
//             byteNumbers[i] = byteCharacters.charCodeAt(i);
//           }
//           const byteArray = new Uint8Array(byteNumbers);
//           const blob = new Blob([byteArray], { type: 'audio/mpeg' });
//           const blobUrl = URL.createObjectURL(blob);
          
//           // Create or update audio element
//           if (!audioRef.current) {
//             audioRef.current = new Audio();
//           }
          
//           audioRef.current.src = blobUrl;
//           audioRef.current.onplay = () => setIsPlaying(true);
//           audioRef.current.onended = () => setIsPlaying(false);
//           audioRef.current.onerror = () => {
//             console.error("Audio playback error");
//             setIsPlaying(false);
//           };
          
//           audioRef.current.play().catch(error => {
//             console.error("Error playing audio:", error);
//             setIsPlaying(false);
//           });
//         } catch (err) {
//           console.error("Error processing audio data:", err);
//         }
//       },
      
//       onAudioCompleted: () => {
//         setIsPlaying(false);
//       }
//     });
    
//     // Connect to the translation service
//     translationService.connect();
    
//     // Update languages
//     translationService.updateLanguages(sourceLanguage, targetLanguage);
    
//     // Clean up on unmount
//     return () => {
//       translationService.disconnect();
//       if (audioRef.current) {
//         audioRef.current.pause();
//         audioRef.current = null;
//       }
//     };
//   }, []);
  
//   // Update languages when they change
//   useEffect(() => {
//     translationService.updateLanguages(sourceLanguage, targetLanguage);
//   }, [sourceLanguage, targetLanguage]);
  
//   const toggleListening = () => {
//     if (isListening) {
//       translationService.stopListening();
//     } else {
//       translationService.startListening();
//     }
//   };
  
//   const handleReset = () => {
//     if (isListening) {
//       translationService.stopListening();
//     }
    
//     if (isPlaying && audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     }
    
//     setOriginalTranscript({ text: '', isLoading: false });
//     setTranslatedTranscript({ text: '', isLoading: false });
//     setStatusMessage('Reset complete. Ready to start.');
//   };
  
//   const handlePlayTranslation = () => {
//     if (!translatedTranscript.text) return;
    
//     if (isPlaying && audioRef.current) {
//       audioRef.current.pause();
//       setIsPlaying(false);
//       return;
//     }
    
//     translationService.speakTranslation();
//   };
  
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <button 
//             onClick={onBack}
//             className="neumorphic-button flex items-center px-4 py-2 rounded-xl bg-[#f0f4f8] shadow-[3px_3px_6px_rgba(0,0,0,0.1),_-3px_-3px_6px_rgba(255,255,255,0.7)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),_-2px_-2px_4px_rgba(255,255,255,0.7)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-3px_-3px_7px_rgba(255,255,255,0.7)] transition-all duration-300"
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             Back to Welcome Screen
//           </button>
          
//           <img 
//             src="https://naomedical.com/wp-content/uploads/2024/11/Nao-Medical-Logo-3.svg" 
//             alt="Nao Medical Logo" 
//             className="h-10"
//           />
//         </div>
        
//         <div className="glassmorphic-container bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 shadow-lg mb-8">
//           <h1 className="text-2xl font-bold mb-2 text-gray-800">Voice Translator</h1>
//           <p className="text-gray-600 mb-6">Speak in one language, translate to another with AI-powered accuracy</p>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//             <LanguageSelector 
//               label="Source Language"
//               value={sourceLanguage}
//               onChange={setSourceLanguage}
//             />
            
//             <LanguageSelector 
//               label="Target Language"
//               value={targetLanguage}
//               onChange={setTargetLanguage}
//             />
//           </div>
          
//           <div className="flex justify-center space-x-6 mb-2">
//             <ControlButton 
//               type="mic"
//               onClick={toggleListening}
//               isActive={isListening}
//               isDisabled={!isConnected}
//             />
            
//             <ControlButton 
//               type="reset"
//               onClick={handleReset}
//               isDisabled={!originalTranscript.text && !translatedTranscript.text}
//             />
//           </div>
          
//           <StatusIndicator 
//             isConnected={isConnected}
//             message={statusMessage}
//           />
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <TranscriptBox 
//             icon="mic"
//             title="Original Transcript"
//             data={originalTranscript}
//           />
          
//           <TranscriptBox 
//             icon="globe"
//             title="Translation"
//             data={translatedTranscript}
//             isPlayable={!!translatedTranscript.text}
//             onPlayClick={handlePlayTranslation}
//             isPlaying={isPlaying}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TranslatorScreen;

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import TranscriptBox from './TranscriptBox';
import ControlButton from './ControlButton';
import StatusIndicator from './StatusIndicator';
import { TranscriptData } from '../types';
import translationService from '../services/translationService';

interface TranslatorScreenProps {
  onBack: () => void;
}

const TranslatorScreen: React.FC<TranslatorScreenProps> = ({ onBack }) => {
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [isListening, setIsListening] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [originalTranscript, setOriginalTranscript] = useState<TranscriptData>({ final: '', interim: '' });
  const [translatedTranscript, setTranslatedTranscript] = useState<TranscriptData>({ final: '', interim: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Set up callbacks for the translation service
    translationService.setCallbacks({
      onStatusChange: (message, connected) => {
        setStatusMessage(message);
        setIsConnected(connected);
      },
      
      onTranscriptUpdate: (text, isFinal) => {
        if (isFinal) {
          // Append the final transcript and clear interim text
          setOriginalTranscript(prev => ({
            final: prev.final + (prev.final ? "\n" : "") + text,
            interim: ""
          }));
        } else {
          // For interim results, update the interim field so it displays live
          setOriginalTranscript(prev => ({
            ...prev,
            interim: text
          }));
        }
      },
      
      onTranslationUpdate: (text, fullTranslation) => {
        setTranslatedTranscript({
          final: fullTranslation,
          interim: ""
        });
      },
      
      onListeningStateChange: (listening) => {
        setIsListening(listening);
      },
      
      onAudioReceived: (audioData) => {
        try {
          const byteCharacters = atob(audioData);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'audio/mpeg' });
          const blobUrl = URL.createObjectURL(blob);
          
          if (!audioRef.current) {
            audioRef.current = new Audio();
          }
          
          audioRef.current.src = blobUrl;
          audioRef.current.onplay = () => setIsPlaying(true);
          audioRef.current.onended = () => setIsPlaying(false);
          audioRef.current.onerror = () => {
            console.error("Audio playback error");
            setIsPlaying(false);
          };
          
          audioRef.current.play().catch(error => {
            console.error("Error playing audio:", error);
            setIsPlaying(false);
          });
        } catch (err) {
          console.error("Error processing audio data:", err);
        }
      },
      
      onAudioCompleted: () => {
        setIsPlaying(false);
      }
    });
    
    translationService.connect();
    translationService.updateLanguages(sourceLanguage, targetLanguage);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    translationService.updateLanguages(sourceLanguage, targetLanguage);
  }, [sourceLanguage, targetLanguage]);
  
  const toggleListening = () => {
    if (isListening) {
      translationService.stopListening();
    } else {
      translationService.startListening();
    }
  };
  
  const handleReset = () => {
    if (isListening) {
      translationService.stopListening();
    }
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    setOriginalTranscript({ final: '', interim: '' });
    setTranslatedTranscript({ final: '', interim: '' });
    setStatusMessage('Reset complete. Ready to start.');
  };
  
  const handlePlayTranslation = () => {
    if (!translatedTranscript.final) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

  // 1) Create a function that resets your local state, stops listening, etc.
  const handleSoftRefresh = () => {
    // Stop listening if active
    if (isListening) {
      translationService.stopListening();
    }
    
    // Pause audio if playing
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    // Reset transcript data and status
    setOriginalTranscript({ final: '', interim: '' });
    setTranslatedTranscript({ final: '', interim: '' });
    setStatusMessage('Soft refresh complete. Ready to start.');
  };

  // 2) Add a button to trigger the soft refresh
  <button 
    onClick={handleSoftRefresh}
    className="neumorphic-button flex items-center px-4 py-2 rounded-xl"
  >
    Soft Refresh
  </button>

    
    translationService.speakTranslation();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="neumorphic-button flex items-center px-4 py-2 rounded-xl bg-[#f0f4f8] shadow-[3px_3px_6px_rgba(0,0,0,0.1),_-3px_-3px_6px_rgba(255,255,255,0.7)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.1),_-2px_-2px_4px_rgba(255,255,255,0.7)] active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),_inset_-3px_-3px_7px_rgba(255,255,255,0.7)] transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <img 
            src="https://naomedical.com/wp-content/uploads/2024/11/Nao-Medical-Logo-3.svg" 
            alt="Nao Medical Logo" 
            className="h-10"
          />
        </div>
        
        <div className="glassmorphic-container bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-2xl p-6 border border-white border-opacity-20 shadow-lg mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-800">Voice Translator</h1>
          <p className="text-gray-600 mb-6">Speak in one language, translate to another with AI-powered accuracy...Note❗ Because of the Price in API, we currently support ONLY English as default Source Language</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <LanguageSelector 
              label="Source Language(English Default)"
              value={sourceLanguage}
              onChange={setSourceLanguage}
            />
            
            <LanguageSelector 
              label="Target Language"
              value={targetLanguage}
              onChange={setTargetLanguage}
            />
          </div>
          
          <div className="flex justify-center space-x-6 mb-2">
            <ControlButton 
              type="mic"
              onClick={toggleListening}
              isActive={isListening}
              isDisabled={!isConnected}
            />
            
            <ControlButton 
              type="reset"
              onClick={handleReset}
              isDisabled={!originalTranscript.final && !translatedTranscript.final}
            />
          </div>
          
          <StatusIndicator 
            isConnected={isConnected}
            message={statusMessage}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TranscriptBox 
            icon="mic"
            title="Original Transcript"
            data={originalTranscript}
          />
          
          <TranscriptBox 
            icon="globe"
            title="Translation"
            data={translatedTranscript}
            isPlayable={!!translatedTranscript.final}
            onPlayClick={handlePlayTranslation}
            isPlaying={isPlaying}
          />
        </div>
      </div>
    </div>
  );
};

export default TranslatorScreen;
