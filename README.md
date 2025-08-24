# CareerCoach AI 

An AI-powered career advancement platform that helps job seekers optimize their resumes and practice interviews with personalized feedback.

## Features

### ATS Resume Analysis
- **Smart Resume Scanning**: Upload PDF, DOC, or DOCX files
- **Keyword Optimization**: AI-powered analysis against job descriptions
- **Compatibility Scoring**: Get detailed ATS compatibility scores (0-100%)
- **Improvement Suggestions**: Personalized tips to enhance your resume

### AI Mock Interviews
- **Personalized Questions**: AI generates questions based on your resume
- **Voice Interaction**: Speech-to-text for natural conversation
- **Real-time Transcription**: Live transcript of your responses
- **Text-to-Speech**: AI interviewer reads questions aloud (optional)

### Comprehensive Feedback
- **Performance Analytics**: Detailed scoring on confidence, clarity, and relevance
- **Personalized Insights**: AI-generated feedback tailored to your responses
- **Progress Tracking**: Visual indicators of completion status
- **Downloadable Reports**: Export your analysis for future reference

### AI & APIs
- **Google Gemini API** for intelligent analysis and question generation
- **ElevenLabs API** for high-quality text-to-speech (optional)
- **Web Speech API** for voice recognition and synthesis

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Google Gemini API key
- ElevenLabs API key (optional, for premium voice synthesis)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/akash0928/CareerCoach-AI.git
   cd CareerCoach-AI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   # Required: Google Gemini API Key
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Optional: ElevenLabs API Key (for premium voice synthesis)
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` to see the application.

### API Keys Setup

### Google Gemini API
1. Visit [Google AI Studio]
2. Create a new API key
3. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

### ElevenLabs API (Optional)
1. Sign up at [ElevenLabs]
2. Get your API key from the dashboard
3. Add it to your `.env` file as `VITE_ELEVENLABS_API_KEY`

**Note**: If you don't provide an ElevenLabs API key, the app will use the browser's built-in speech synthesis as a fallback.
---

**Made with ❤️ for job seekers everywhere. Good luck with your career journey!** 🎯
