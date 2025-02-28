import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import TranslatorScreen from './components/TranslatorScreen';

function App() {
  const [showTranslator, setShowTranslator] = useState(false);

  const handleStart = () => {
    setShowTranslator(true);
  };

  const handleBack = () => {
    setShowTranslator(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {showTranslator ? (
        <TranslatorScreen onBack={handleBack} />
      ) : (
        <WelcomeScreen onStart={handleStart} />
      )}
    </div>
  );
}

export default App;