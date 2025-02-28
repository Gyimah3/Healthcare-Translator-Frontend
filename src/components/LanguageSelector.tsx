import React from 'react';
import { Language } from '../types';
import { languages } from '../data/languages';

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, label }) => {
  const selectedLanguage = languages.find(lang => lang.code === value) || languages[0];

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-gray-600 font-medium text-sm">{label}</label>
      <div className="relative">
        <div className="neumorphic-select flex items-center px-4 py-2 rounded-xl bg-[#f0f4f8] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),_inset_-3px_-3px_7px_rgba(255,255,255,0.6)]">
          <span className="mr-2 text-xl">{selectedLanguage.flag}</span>
          <select 
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="appearance-none bg-transparent w-full focus:outline-none text-gray-700"
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name} ({language.nativeName})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;