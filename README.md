# Real-Time Voice Translator Frontend

This project is a real‑time voice translator built with React and Vite. The frontend captures raw PCM audio from the user's microphone using an AudioWorklet and sends the audio data live over a secure WebSocket connection to a backend server for transcription and translation.

## Features

- **Live Transcription & Translation:**  
  Captures raw audio from the user's microphone in real time, sends the audio to the server, and displays live transcriptions and translations.

- **AudioWorklet-Based Audio Capture:**  
  Uses the Web Audio API’s AudioWorklet for low‑latency, real‑time processing of audio. The custom worklet converts incoming Float32 samples to 16‑bit PCM, which is sent to the server.

- **WebSocket Communication:**  
  The frontend establishes a secure WebSocket connection (via an ngrok URL) to the backend. Commands (like `start_listening`, `stop_listening`, etc.) and raw audio data are exchanged over this connection.

- **Modern React UI:**  
  The application is built with React and styled using Tailwind CSS for a clean, responsive design.

## Project Structure



Project Root
├── .bolt/
│   ├── config.json
│   └── prompt
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── ControlButton.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── StatusIndicator.tsx
│   │   ├── TranscriptBox.tsx
│   │   ├── TranslatorScreen.tsx
│   │   └── WelcomeScreen.tsx
│   ├── data/
│   │   └── languages.ts
│   ├── index.css
│   ├── main.tsx
│   ├── services/
│   │   ├── pcm-processor.js
│   │   └── translationService.ts
│   ├── types.ts
│   └── vite-env.d.ts
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts





- **src/services/pcm-processor.js:**  
  Contains an AudioWorkletProcessor (`PCMProcessor`) that converts incoming Float32 audio samples to 16‑bit PCM and posts the data (as an ArrayBuffer) to the main thread.

- **src/services/translationService.ts:**  
  Handles the WebSocket connection to the backend server. It loads the AudioWorklet module using Vite’s `?url` import, captures raw audio from the microphone via an AudioContext, and sends the PCM data over the WebSocket.

## How It Works

### Audio Capture with AudioWorklet

1. **Microphone Access:**  
   When the user starts listening, the frontend requests access to the microphone using `navigator.mediaDevices.getUserMedia({ audio: true })`.

2. **Audio Context & Worklet:**  
   An `AudioContext` is created with a sample rate of 16 kHz (matching the server’s transcription requirements). The microphone stream is routed to a `MediaStreamAudioSourceNode`.

3. **Loading the Worklet Module:**  
   The AudioWorklet module is imported via Vite using the `?url` query:
   ```ts
   import pcmProcessorUrl from './pcm-processor.js?url';



## Getting Started

### Prerequisites
* Node.js (>= 14.x)
* npm or yarn

### Installation
1. **Clone the Repository:**
```
git clone <repository-url>
cd <repository-directory>
```

2. **Install Dependencies:**
```
npm install # or yarn install
```

## Running the Development Server

Start the Vite development server:
```
npm run dev # or yarn dev
```

The app will be available at http://localhost:5173.

## Building for Production

Build the production bundle:
```
npm run build # or yarn build
```

The production files will be output to the `dist` folder.

## Backend Connection

The frontend connects to the server via a secure WebSocket (configured in `translationService.ts` using an ngrok URL(check on ngrok for local use). Ensure that the backend server is running and accessible at this URL. The server handles incoming raw PCM audio for transcription and translation.

## Troubleshooting

* **AudioWorklet Module Loading:** If you encounter errors loading the AudioWorklet module, verify the import path. With Vite, the line:
```
import pcmProcessorUrl from './pcm-processor.js?url';
```
ensures that the file is served as an asset. Check the browser's network tab to confirm that the file is loading correctly.

* **Microphone Permissions:** Make sure your browser has permission to access the microphone.
* **WebSocket Connection:** Verify that the WebSocket URL is correct and that the backend server is running.

## Future Work

### AI Recommendation System(same ffrom the server repository)
- Implement an intelligent system that analyzes conversation transcripts to provide contextual medical recommendations
- Develop machine learning models trained on medical dialogue datasets to identify patient needs
- Create a knowledge base of standard medical protocols and procedures
- Build a recommendation engine that suggests appropriate responses to healthcare providers based on:
  - Patient symptoms described in conversation
  - Best practices for specific conditions
  - Cultural considerations based on patient background

### Voice-to-Voice Agent
- Develop an autonomous conversational agent that can facilitate medical discussions without manual intervention
- Implement conversation state tracking to understand context and conversation flow
- Create natural language understanding components specifically trained on medical terminology
- Build speaker recognition to differentiate between healthcare provider and patient voices
- Develop automatic language detection to eliminate the need for manual language selection

### Enhanced Medical Translation
- Expand specialized medical terminology coverage across all supported languages
- Develop domain-specific translation models for specialized fields (cardiology, neurology, pediatrics, etc.)
- Implement medical abbreviation and acronym handling
- Add support for regional medical dialects and expressions

## Security Considerations

- Data encryption in transit
- Secure authentication system
- HIPAA-compliant data handling


## Acknowledgments

* Built with Vite, React, and the Web Audio API.
* Special thanks to AssemblyAI, ElevenLabs, and OpenAI for their APIs.
