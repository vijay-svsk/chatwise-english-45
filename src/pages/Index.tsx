
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Mic, MessageSquare, BarChart, Award } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Mic,
      title: 'Real-time speech analysis',
      description: 'Practice your pronunciation with instant feedback and guidance for improvement.'
    },
    {
      icon: MessageSquare,
      title: 'AI conversation partner',
      description: 'Have natural conversations with our AI assistant to build confidence and fluency.'
    },
    {
      icon: BarChart,
      title: 'Personalized progress tracking',
      description: 'Monitor your improvement over time with detailed analytics and insights.'
    },
    {
      icon: Award,
      title: 'Adaptive learning path',
      description: 'Customized lessons and exercises based on your proficiency level and goals.'
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl text-white font-display font-bold">E</div>
          <span className="font-display text-xl font-semibold text-foreground">Echo</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">How it works</a>
          <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">Testimonials</a>
        </nav>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate('/login')}>Log in</Button>
          <Button onClick={() => navigate('/register')} className="button-shine">Sign up</Button>
        </div>
      </header>
      
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center animate-slide-up">
          <div className="inline-block px-3 py-1 mb-6 bg-primary/10 text-primary rounded-full text-sm font-medium">
            AI-Powered Language Learning
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-6 max-w-4xl leading-tight">
            Master English with the help of artificial intelligence
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            Echo uses advanced AI to provide personalized English learning experiences. 
            Practice speaking, improve your pronunciation, and track your progress all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')}
              className="h-14 px-8 text-lg font-medium button-shine"
            >
              Get Started for Free
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/login')}
              className="h-14 px-8 text-lg font-medium"
            >
              Try the Demo
            </Button>
          </div>
        </div>
        
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none h-20 bottom-0 top-auto"></div>
          <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in shadow-glass-hover">
            <img 
              src="https://storage.googleapis.com/aithentic-mock-content/dashboard-mockup-dark.jpg" 
              alt="Echo Dashboard" 
              className="w-full h-auto rounded-xl"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="features" className="py-24 px-6 md:px-12 lg:px-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Features designed for effective learning</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with proven language learning methodologies to help you achieve fluency faster.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
            {features.map((feature, index) => (
              <div key={index} className="glass-panel p-8">
                <div className="w-12 h-12 flex items-center justify-center bg-primary/10 text-primary rounded-xl mb-6">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">How Echo works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple three-step process to improve your English skills with AI assistance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            {[
              {
                step: '01',
                title: 'Practice Speaking',
                description: 'Record your voice as you practice speaking English on various topics.'
              },
              {
                step: '02',
                title: 'Get AI Feedback',
                description: 'Receive instant analysis on your pronunciation, grammar, and vocabulary.'
              },
              {
                step: '03',
                title: 'Track Progress',
                description: 'Monitor your improvement over time with detailed performance metrics.'
              }
            ].map((item, index) => (
              <div key={index} className="glass-panel p-8 relative overflow-hidden">
                <div className="absolute -top-4 -left-4 text-7xl font-display font-bold text-primary/10">
                  {item.step}
                </div>
                <div className="relative">
                  <h3 className="text-xl font-display font-medium mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-24 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-primary/5 to-secondary/20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-display font-semibold mb-6">
            Ready to improve your English?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already enhancing their English skills with Echo's AI-powered platform.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/register')}
            className="h-14 px-8 text-lg font-medium button-shine"
          >
            Start Learning Now
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <div className="w-10 h-10 flex items-center justify-center bg-primary rounded-xl text-white font-display font-bold">E</div>
              <span className="font-display text-xl font-semibold text-foreground">Echo</span>
            </div>
            
            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-6 md:mb-0">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it works</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </nav>
            
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Echo. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
