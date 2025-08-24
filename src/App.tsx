import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ATSSection } from './components/ATSSection';
import { MockInterviewSection } from './components/MockInterviewSection';
import { FeedbackSection } from './components/FeedbackSection';
import { Menu, Brain } from 'lucide-react';
import { Button } from './components/ui/button';

export type Section = 'ats' | 'interview' | 'feedback';

export interface InterviewData {
  questions: string[];
  answers: string[];
  transcripts: string[];
  overallScore?: number;
  detailedFeedback?: {
    confidence: number;
    clarity: number;
    relevance: number;
    suggestions: string[];
  };
}

export interface ATSData {
  score: number;
  missingKeywords: string[];
  improvementTips: string[];
  analyzedAt: Date;
}

function App() {
  const [currentSection, setCurrentSection] = useState<Section>('ats');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData>({
    questions: [],
    answers: [],
    transcripts: []
  });
  const [atsData, setATSData] = useState<ATSData | null>(null);

  // Store resume text in localStorage for cross-component access
  useEffect(() => {
    const handleATSComplete = (data: ATSData) => {
      setATSData(data);
      // Store resume text for interview question generation
      const resumeText = localStorage.getItem('resumeText');
      if (!resumeText) {
        // If no resume text is stored, use a default based on ATS analysis
        const defaultResumeText = `Professional with experience in ${data.missingKeywords.slice(0, 3).join(', ')} and related technologies. 
        Seeking opportunities to leverage skills and contribute to organizational success.`;
        localStorage.setItem('resumeText', defaultResumeText);
      }
    };

    if (atsData) {
      handleATSComplete(atsData);
    }
  }, [atsData]);

  const FloatingElements = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle background shapes */}
      <div className="absolute top-20 right-20 w-32 h-32 bg-blue-100 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute top-40 right-40 w-24 h-24 bg-purple-100 rounded-full opacity-15 animate-bounce"></div>
      <div className="absolute bottom-40 right-32 w-28 h-28 bg-green-100 rounded-full opacity-10 animate-pulse"></div>
      <div className="absolute bottom-20 right-60 w-20 h-20 bg-orange-100 rounded-full opacity-15 animate-bounce"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Floating Background Elements */}
      <FloatingElements />

      {/* Bolt Hackathon Logo */}
      

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-6 w-6 text-black" />
      </div>

      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        interviewCompleted={interviewData.questions.length > 0 && interviewData.answers.length === interviewData.questions.length}
        atsCompleted={atsData !== null}
      />

      {/* Main Content - Now extends to full width */}
      <div className="lg:ml-64 min-h-screen relative z-10">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 p-4 lg:p-8">
            <div className="w-full max-w-none mx-auto">
              {/* Enhanced Header */}
              <div className="mb-8 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-3 shadow-lg">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      CareerCoach AI
                    </h1>
                    <p className="text-lg text-gray-600 mt-1">
                      Advance your career with AI-powered resume analysis and interview preparation
                    </p>
                  </div>
                </div>
                
                {/* Progress Indicator */}
                <div className="flex justify-center lg:justify-start space-x-4 mt-6">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    atsData ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${atsData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium">ATS Analysis</span>
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    interviewData.questions.length > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${interviewData.questions.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium">Mock Interview</span>
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                    (atsData || interviewData.questions.length > 0) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${(atsData || interviewData.questions.length > 0) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm font-medium">Feedback</span>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="w-full">
                {currentSection === 'ats' && (
                  <ATSSection 
                    onATSComplete={setATSData}
                    onStartInterview={() => setCurrentSection('interview')}
                  />
                )}
                
                {currentSection === 'interview' && (
                  <MockInterviewSection
                    onInterviewComplete={(data) => {
                      setInterviewData(data);
                      setCurrentSection('feedback');
                    }}
                    interviewData={interviewData}
                  />
                )}
                
                {currentSection === 'feedback' && (
                  <FeedbackSection
                    interviewData={interviewData}
                    atsData={atsData}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;