import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Lightbulb, 
  CheckCircle,
  AlertCircle,
  BarChart3,
  MessageSquare,
  FileText,
  Download
} from 'lucide-react';
import { InterviewData, ATSData } from '../App';

interface FeedbackSectionProps {
  interviewData: InterviewData;
  atsData: ATSData | null;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export function FeedbackSection({ interviewData, atsData }: FeedbackSectionProps) {
  const [personalizedFeedback, setPersonalizedFeedback] = useState<string[]>([]);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);

  const hasInterviewData = interviewData.questions.length > 0;
  const hasATSData = atsData !== null;

  useEffect(() => {
    if (hasInterviewData || hasATSData) {
      generatePersonalizedFeedback();
    }
  }, [interviewData, atsData]);

  const generatePersonalizedFeedback = async () => {
    if (!hasInterviewData && !hasATSData) return;

    setIsGeneratingFeedback(true);

    try {
      const resumeText = localStorage.getItem('resumeText') || 'No resume data available';
      
      let prompt = `Analyze the following data and provide personalized career feedback:

Resume Content:
${resumeText}

`;

      if (hasATSData) {
        prompt += `ATS Analysis Results:
- Score: ${atsData!.score}%
- Missing Keywords: ${atsData!.missingKeywords.join(', ')}
- Improvement Tips: ${atsData!.improvementTips.join('; ')}

`;
      }

      if (hasInterviewData) {
        prompt += `Interview Performance:
Questions and Answers:
`;
        interviewData.questions.forEach((question, index) => {
          prompt += `Q${index + 1}: ${question}
A${index + 1}: ${interviewData.answers[index] || 'No answer provided'}

`;
        });
      }

      prompt += `Based on this information, provide:
1. 3-5 specific, actionable feedback points
2. Analysis of strengths and areas for improvement
3. Recommendations for career advancement

Focus on:
- Resume-specific improvements
- Interview performance analysis
- Technical skills alignment
- Communication effectiveness
- Career development suggestions

Respond in JSON format with:
{
  "feedback": ["feedback point 1", "feedback point 2", ...],
  "strengths": ["strength 1", "strength 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...]
}`;

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
        const analysisText = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          setPersonalizedFeedback(analysis.feedback || []);
          setDetailedAnalysis(analysis);
        }
      }
    } catch (error) {
      console.error('Error generating personalized feedback:', error);
      // Fallback feedback
      const fallbackFeedback = [];
      
      if (hasATSData && atsData!.score < 70) {
        fallbackFeedback.push(`Your resume scored ${atsData!.score}% - focus on adding these missing keywords: ${atsData!.missingKeywords.slice(0, 3).join(', ')}`);
      }
      
      if (hasInterviewData) {
        fallbackFeedback.push('Practice providing more detailed examples in your interview responses');
        fallbackFeedback.push('Work on structuring your answers using the STAR method (Situation, Task, Action, Result)');
      }
      
      fallbackFeedback.push('Continue developing your technical skills and stay updated with industry trends');
      setPersonalizedFeedback(fallbackFeedback);
    }

    setIsGeneratingFeedback(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const downloadReport = () => {
    const reportData = {
      atsAnalysis: atsData,
      interviewResults: interviewData,
      personalizedFeedback,
      detailedAnalysis,
      generatedAt: new Date().toISOString(),
      summary: {
        overallRecommendation: personalizedFeedback.length > 0 
          ? "Focus on the specific areas highlighted in your personalized feedback"
          : "Great job! Continue practicing to maintain your strong performance",
        nextSteps: personalizedFeedback.length > 0 
          ? personalizedFeedback.slice(0, 3)
          : [
              "Continue practicing mock interviews",
              "Stay updated with industry trends",
              "Apply to positions confidently"
            ]
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'careercoach-personalized-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!hasInterviewData && !hasATSData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Feedback Available</h2>
          <p className="text-gray-600 mb-6">
            Complete the ATS analysis and mock interview to receive detailed feedback and insights.
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="outline" className="text-sm">
              <FileText className="h-3 w-3 mr-1" />
              ATS Analysis Pending
            </Badge>
            <Badge variant="outline" className="text-sm">
              <MessageSquare className="h-3 w-3 mr-1" />
              Interview Pending
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Feedback</h1>
          <p className="text-gray-600 mt-1">
            AI-powered analysis of your resume and interview performance
          </p>
        </div>
        <Button onClick={downloadReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Personalized Feedback Section */}
      {isGeneratingFeedback ? (
        <Card className="border-purple-200">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <h3 className="text-lg font-semibold text-gray-900">Generating Personalized Feedback</h3>
              <p className="text-gray-600">
                Analyzing your resume and interview responses...
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        personalizedFeedback.length > 0 && (
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>AI-Powered Personalized Feedback</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizedFeedback.map((feedback, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                    <Lightbulb className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{feedback}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Detailed Analysis */}
      {detailedAnalysis && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          {detailedAnalysis.strengths && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Your Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {detailedAnalysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Areas for Improvement */}
          {detailedAnalysis.improvements && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {detailedAnalysis.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Overall Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* ATS Score Summary */}
        {hasATSData && (
          <Card className={`${getScoreBackground(atsData!.score)}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>ATS Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(atsData!.score)} mb-2`}>
                  {atsData!.score}%
                </div>
                <Progress value={atsData!.score} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">Resume Match Score</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Key Issues:</p>
                <div className="flex flex-wrap gap-1">
                  {atsData!.missingKeywords.slice(0, 3).map((keyword, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                  {atsData!.missingKeywords.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{atsData!.missingKeywords.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Interview Score Summary */}
        {hasInterviewData && interviewData.overallScore && (
          <Card className={`${getScoreBackground(interviewData.overallScore)}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>Interview Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(interviewData.overallScore)} mb-2`}>
                  {interviewData.overallScore}%
                </div>
                <Progress value={interviewData.overallScore} className="w-full" />
                <p className="text-sm text-gray-600 mt-2">Overall Interview Score</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                {interviewData.detailedFeedback && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{interviewData.detailedFeedback.confidence}%</p>
                      <p className="text-xs text-gray-600">Confidence</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{interviewData.detailedFeedback.clarity}%</p>
                      <p className="text-xs text-gray-600">Clarity</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{interviewData.detailedFeedback.relevance}%</p>
                      <p className="text-xs text-gray-600">Relevance</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Question-by-Question Review */}
      {hasInterviewData && interviewData.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span>Interview Questions Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {interviewData.questions.map((question, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-6 space-y-3">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Question {index + 1}
                  </h4>
                  <p className="text-gray-700 mb-3">{question}</p>
                </div>
                
                {interviewData.answers[index] && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">Your Response:</p>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {interviewData.answers[index]}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-700">Response recorded</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Career Recommendations */}
      {detailedAnalysis?.recommendations && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Career Development Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {detailedAnalysis.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}