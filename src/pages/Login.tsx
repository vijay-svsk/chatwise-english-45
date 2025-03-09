import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import VoiceLogin from '@/components/VoiceLogin';
import { db } from '@/services/databaseService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Please fill all fields",
        description: "Email and password are required",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would call your authentication API
      // For demo purposes, we'll simulate a successful login after a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if this user exists in our database
      const users = await db.getUsers();
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        // Existing user - update last login
        existingUser.lastLogin = new Date().toISOString();
        await db.updateUser(existingUser);
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        
        navigate('/dashboard');
      } else {
        // Create a new user
        const newUser = await db.createUser({
          name: email.split('@')[0], // Basic name from email
          email,
          points: 0,
          level: 1,
          lastLogin: new Date().toISOString()
        });
        
        toast({
          title: "Account created",
          description: "Welcome to Echo! Your account has been created.",
        });
        
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVoiceLoginSuccess = (userId: string) => {
    toast({
      title: "Voice login successful",
      description: "Welcome back!",
    });
    
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-primary rounded-2xl text-white font-display text-2xl font-bold mb-4">E</div>
          <h1 className="text-3xl font-display font-semibold mb-2">Welcome to Echo</h1>
          <p className="text-muted-foreground">Your AI-powered English learning assistant</p>
        </div>
        
        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="email">Email Login</TabsTrigger>
            <TabsTrigger value="voice">Voice Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <Card className="glass-panel">
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle className="text-xl font-display">Log in to your account</CardTitle>
                  <CardDescription>Enter your email and password to continue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer">Remember me for 30 days</Label>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full h-12 button-shine" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Log in"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary hover:underline">
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="voice">
            <VoiceLogin onLoginSuccess={handleVoiceLoginSuccess} />
            <p className="text-center text-sm text-muted-foreground mt-4">
              First time here?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up with email
              </Link>
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
