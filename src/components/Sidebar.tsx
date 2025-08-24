import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { FileText, Mic, BarChart3, X, CheckCircle, Brain, Menu } from 'lucide-react';
import { Section } from '../App';
import { cn } from '../lib/utils';

interface SidebarProps {
  currentSection: Section;
  onSectionChange: (section: Section) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  interviewCompleted: boolean;
  atsCompleted: boolean;
}

export function Sidebar({ 
  currentSection, 
  onSectionChange, 
  isOpen, 
  onClose,
  onOpen,
  interviewCompleted,
  atsCompleted
}: SidebarProps) {
  const sections = [
    {
      id: 'ats' as Section,
      label: 'ATS Score',
      icon: FileText,
      description: 'Upload resume & job description',
      completed: atsCompleted
    },
    {
      id: 'interview' as Section,
      label: 'Mock Interview',
      icon: Mic,
      description: 'Practice with AI interviewer',
      completed: interviewCompleted
    },
    {
      id: 'feedback' as Section,
      label: 'Feedback',
      icon: BarChart3,
      description: 'Review your performance',
      completed: false
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white/95 backdrop-blur-md border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Close button (only on mobile when sidebar is open) */}
        {isOpen && (
          <div className="lg:hidden absolute top-4 right-4" onClick={onClose}>
              <X className="h-6 w-6" />
          </div>
        )}
        
        <div className="p-6">
          {/* Logo */}
          <div className="mb-8 pt-8 lg:pt-0">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-600 rounded-lg p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">CareerCoach AI</h2>
            </div>
            <p className="text-sm text-gray-600 ml-11">AI Career Assistant</p>
          </div>
          
          {/* Navigation */}
          <nav className="space-y-3">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = currentSection === section.id;
              
              return (
                <Card 
                  key={section.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all duration-200 hover:shadow-md",
                    isActive 
                      ? "bg-blue-50 border-blue-200 shadow-md" 
                      : "bg-white/50 hover:bg-white/80"
                  )}
                  onClick={() => {
                    onSectionChange(section.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isActive 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-gray-100 text-gray-600"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={cn(
                          "font-medium",
                          isActive ? "text-blue-900" : "text-gray-900"
                        )}>
                          {section.label}
                        </h3>
                        {section.completed && (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-1",
                        isActive ? "text-blue-600" : "text-gray-500"
                      )}>
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </nav>

          {/* Progress Overview */}
          <Card className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Progress</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Completed</span>
                <span className="text-blue-900 font-medium">
                  {[atsCompleted, interviewCompleted].filter(Boolean).length}/2
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${([atsCompleted, interviewCompleted].filter(Boolean).length / 2) * 100}%` 
                  }}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Hamburger menu (only when sidebar is closed, on mobile) */}
    </>
  );
}
