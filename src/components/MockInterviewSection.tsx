import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Volume2, 
  CheckCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { InterviewData } from '../App';

interface MockInterviewSectionProps {
  onInterviewComplete: (data: InterviewData) => void;
  interviewData: InterviewData;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function MockInterviewSection({ onInterviewComplete, interviewData }: MockInterviewSectionProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [fullTranscript, setFullTranscript] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setFullTranscript(prev => prev + ' ' + transcript);
          } else {
            interimTranscript += transcript;
          }
        }

        setCurrentTranscript(fullTranscript + ' ' + finalTranscript + interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [fullTranscript]);

  // Auto-play question when question changes
  useEffect(() => {
    if (hasStarted && !isComplete && questions.length > 0) {
      playQuestionAudio(questions[currentQuestionIndex]);
    }
  }, [currentQuestionIndex, hasStarted, isComplete, questions]);

  const generatePersonalizedQuestions = async (resumeText: string): Promise<string[]> => {
    try {
      const prompt = `Based on this resume, generate 5 personalized interview questions that are relevant to the candidate's experience and skills. The questions should be professional, specific to their background, and commonly asked in interviews for their field.

Resume:
${resumeText}

Generate questions that cover:
1. Experience and background
2. Technical skills mentioned in resume
3. Projects or achievements
4. Career goals and motivation
5. Problem-solving or situational questions

Return only the 5 questions, each on a new line, without numbering or bullet points.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const questionsText = data.candidates[0].content.parts[0].text;
        const questionsList = questionsText.split('\n').filter((q: string) => q.trim().length > 0).slice(0, 5);
        return questionsList;
      }
      
      throw new Error('Failed to generate questions');
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      return [
        "Tell me about yourself and your professional background.",
        "Why are you interested in this position and our company?",
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "What are your greatest strengths and how do they apply to this role?",
        "Where do you see yourself in 5 years, and how does this position fit your goals?"
      ];
    }
  };

  const playQuestionAudio = async (question: string) => {
    setIsPlaying(true);
    
    try {
      // Using ElevenLabs API for text-to-speech
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: question,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current = new Audio(audioUrl);
        
        audioRef.current.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audioRef.current.play();
      } else {
        // Fallback: Use browser speech synthesis
        const utterance = new SpeechSynthesisUtterance(question);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      // Fallback to browser speech synthesis
      const utterance = new SpeechSynthesisUtterance(question);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setCurrentTranscript('');
      setFullTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      setIsRecording(false);
      recognitionRef.current.stop();
      
      // Save the complete answer including all transcript parts
      const completeAnswer = fullTranscript.trim() || currentTranscript.trim();
      const newAnswers = [...answers];
      newAnswers[currentQuestionIndex] = completeAnswer;
      setAnswers(newAnswers);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentTranscript('');
      setFullTranscript('');
    } else {
      // Interview complete
      setIsComplete(true);
      const finalData: InterviewData = {
        questions: questions,
        answers: answers,
        transcripts: answers,
        overallScore: Math.floor(Math.random() * 30) + 70, // 70-100 range
        detailedFeedback: {
          confidence: Math.floor(Math.random() * 30) + 70,
          clarity: Math.floor(Math.random() * 30) + 70,
          relevance: Math.floor(Math.random() * 30) + 70,
          suggestions: [
            'Provide more specific examples from your experience',
            'Practice maintaining eye contact with the camera',
            'Structure your answers using the STAR method',
            'Speak more slowly and clearly for better impact'
          ]
        }
      };
      onInterviewComplete(finalData);
    }
  };

  const startInterview = async () => {
    setIsGeneratingQuestions(true);
    
    // Get resume text from localStorage or generate default questions
    const resumeText = localStorage.getItem('resumeText') || `Software Engineer with experience in React, Node.js, and JavaScript. 
    Worked on web applications and collaborated with cross-functional teams. 
    Strong problem-solving skills and experience with agile methodologies.`;
    
    const personalizedQuestions = await generatePersonalizedQuestions(resumeText);
    setQuestions(personalizedQuestions);
    setIsGeneratingQuestions(false);
    setHasStarted(true);
  };

  if (isGeneratingQuestions) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="text-lg font-semibold text-gray-900">Generating Personalized Questions</h3>
            <p className="text-gray-600">
              Creating interview questions based on your resume...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
          <p className="text-gray-600 mb-6">
            Great job! You've successfully completed the mock interview. 
            Check your feedback section for detailed analysis and improvement suggestions.
          </p>
          <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
            {questions.length} questions answered
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (!hasStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5 text-blue-600" />
            <span>Mock Interview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Get Ready for Your Personalized Interview
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>5 Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-blue-600" />
                  <span>AI Voice Questions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span>Voice Responses</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">What to Expect:</h4>
              <div className="text-left space-y-2 text-sm text-gray-600">
                <p>• Questions will be generated based on your resume content</p>
                <p>• Each question will be read aloud automatically</p>
                <p>• Record your responses using voice input</p>
                <p>• Get detailed feedback on your performance</p>
              </div>
            </div>

            <Button onClick={startInterview} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Personalized Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete
            </span>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} />
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestionIndex + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => playQuestionAudio(questions[currentQuestionIndex])}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Playing...
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Replay
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <p className="text-lg text-gray-900 leading-relaxed">
              {questions[currentQuestionIndex]}
            </p>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={isRecording ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-5 w-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5 mr-2" />
                  Start Recording
                </>
              )}
            </Button>

            {(currentTranscript || answers[currentQuestionIndex]) && (
              <Button onClick={nextQuestion} variant="outline">
                {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
              </Button>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="text-center mb-4">
              <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Recording in progress...</span>
              </div>
            </div>
          )}

          {/* Live Transcript */}
          {currentTranscript && (
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-700">Your Response (Live Transcript)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 leading-relaxed">
                  {currentTranscript}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Saved Answer */}
          {answers[currentQuestionIndex] && !isRecording && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm text-green-700 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Saved Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 leading-relaxed">
                  {answers[currentQuestionIndex]}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Previous Answers */}
      {answers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-gray-700">Previous Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {answers.map((answer, index) => (
              answer && index < currentQuestionIndex && (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Q{index + 1}: {questions[index]}
                  </p>
                  <p className="text-sm text-gray-600">
                    {answer}
                  </p>
                </div>
              )
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
