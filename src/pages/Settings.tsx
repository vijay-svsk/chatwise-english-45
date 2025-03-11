import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import { geminiService } from '@/services/geminiService';
import { audioService } from '@/services/audioService';
import { UserSettings } from '@/types/database';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Bell, User, Shield, HelpCircle, Moon, Volume2, Brush, RefreshCcw, CheckCircle2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "1"; // In a real app, get this from auth context
  
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => db.getUserById(userId),
  });
  
  const { data: settings } = useQuery({
    queryKey: ['settings', userId],
    queryFn: () => db.getUserSettings(userId),
  });
  
  const [formValues, setFormValues] = useState<UserSettings>({
    dailyGoal: 15,
    notificationsEnabled: true,
    theme: 'light',
    difficulty: 'beginner'
  });
  
  const [apiKey, setApiKey] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [testAudioPlaying, setTestAudioPlaying] = useState(false);
  const [accountForm, setAccountForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [resetProgress, setResetProgress] = useState(false);
  
  useEffect(() => {
    if (settings) {
      setFormValues(settings);
    }
    
    if (user) {
      setAccountForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [settings, user]);
  
  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: UserSettings) => db.updateUserSettings(userId, newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', userId] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved",
      });
    },
  });
  
  const updateAccountMutation = useMutation({
    mutationFn: (userData: { name: string; email: string }) => {
      if (!user) throw new Error('User not found');
      return db.updateUser({
        ...user,
        name: userData.name,
        email: userData.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      toast({
        title: "Account Updated",
        description: "Your account information has been updated",
      });
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    },
  });
  
  const resetProgressMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');
      
      // Reset user points and level
      await db.updateUser({
        ...user,
        points: 0,
        level: 1
      });
      
      // In a real app, you would also reset sessions, achievements, etc.
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      
      toast({
        title: "Progress Reset",
        description: "Your learning progress has been reset",
      });
      
      setResetProgress(false);
    },
  });
  
  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(formValues);
  };
  
  const handleInputChange = (field: keyof UserSettings, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAccountFormChange = (field: string, value: string) => {
    setAccountForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleUpdateAccount = () => {
    // Validate password if changing password
    if (accountForm.newPassword) {
      if (accountForm.newPassword !== accountForm.confirmPassword) {
        toast({
          title: "Password Error",
          description: "New passwords do not match",
          variant: "destructive"
        });
        return;
      }
      
      if (accountForm.newPassword.length < 6) {
        toast({
          title: "Password Error",
          description: "Password must be at least 6 characters",
          variant: "destructive"
        });
        return;
      }
      
      // In a real app, you would verify the current password here
    }
    
    updateAccountMutation.mutate({
      name: accountForm.name,
      email: accountForm.email
    });
  };
  
  const handleSaveAPIKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    
    geminiService.setApiKey(apiKey);
    
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved",
    });
  };
  
  const handleTestAudio = async () => {
    try {
      setTestAudioPlaying(true);
      await audioService.speak("This is a test of the audio system. Your audio is working correctly.");
    } catch (error) {
      toast({
        title: "Audio Error",
        description: "Unable to play audio. Please check your browser settings.",
        variant: "destructive"
      });
    } finally {
      setTestAudioPlaying(false);
    }
  };
  
  const handleResetProgress = () => {
    if (!resetProgress) {
      setResetProgress(true);
      return;
    }
    
    resetProgressMutation.mutate();
  };
  
  const handleDeleteAccount = () => {
    toast({
      title: "Not Implemented",
      description: "Account deletion is not implemented in this demo",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 px-6 pb-8 ml-64">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>
            
            <Tabs defaultValue="preferences" className="space-y-6">
              <TabsList className="grid grid-cols-5 h-auto">
                <TabsTrigger value="preferences" className="py-2">
                  <Bell className="h-4 w-4 mr-2" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="account" className="py-2">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="privacy" className="py-2">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="api" className="py-2">
                  <Brush className="h-4 w-4 mr-2" />
                  AI Settings
                </TabsTrigger>
                <TabsTrigger value="help" className="py-2">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Preferences</CardTitle>
                    <CardDescription>
                      Customize how you want to learn and practice
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="daily-goal">Daily Practice Goal (minutes)</Label>
                        <div className="flex items-center gap-4 mt-1.5">
                          <Input 
                            id="daily-goal" 
                            type="number" 
                            min="5" 
                            max="120" 
                            value={formValues.dailyGoal} 
                            onChange={(e) => handleInputChange('dailyGoal', parseInt(e.target.value))}
                          />
                          <span className="text-sm text-muted-foreground">minutes/day</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <select 
                          id="difficulty"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                          value={formValues.difficulty}
                          onChange={(e) => handleInputChange('difficulty', e.target.value as any)}
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-4 border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Application Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="notifications">Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive reminders about your daily practice goals
                          </p>
                        </div>
                        <Switch 
                          id="notifications" 
                          checked={formValues.notificationsEnabled}
                          onCheckedChange={(checked) => handleInputChange('notificationsEnabled', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="theme">Dark Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Switch between light and dark theme
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Moon className="h-4 w-4 text-muted-foreground" />
                          <Switch 
                            id="theme" 
                            checked={formValues.theme === 'dark'}
                            onCheckedChange={(checked) => handleInputChange('theme', checked ? 'dark' : 'light')}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="audio">Audio Feedback</Label>
                          <p className="text-sm text-muted-foreground">
                            Enable audio feedback during practice sessions
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                          <Switch 
                            id="audio" 
                            checked={audioEnabled}
                            onCheckedChange={setAudioEnabled}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={handleTestAudio}
                          disabled={!audioEnabled || testAudioPlaying}
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          {testAudioPlaying ? 'Playing...' : 'Test Audio'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleSaveSettings}
                      disabled={updateSettingsMutation.isPending}
                    >
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your account details and password
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={accountForm.name} 
                        onChange={(e) => handleAccountFormChange('name', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={accountForm.email}
                        onChange={(e) => handleAccountFormChange('email', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        type="password"
                        value={accountForm.currentPassword}
                        onChange={(e) => handleAccountFormChange('currentPassword', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password"
                        value={accountForm.newPassword}
                        onChange={(e) => handleAccountFormChange('newPassword', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password"
                        value={accountForm.confirmPassword}
                        onChange={(e) => handleAccountFormChange('confirmPassword', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Reset Progress</h3>
                          <p className="text-sm text-muted-foreground">
                            Clear all your learning progress and start over
                          </p>
                        </div>
                        <Button 
                          variant={resetProgress ? "destructive" : "outline"} 
                          onClick={handleResetProgress}
                          disabled={resetProgressMutation.isPending}
                        >
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          {resetProgress ? 'Confirm Reset' : 'Reset Progress'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                    <Button 
                      onClick={handleUpdateAccount}
                      disabled={updateAccountMutation.isPending}
                    >
                      {updateAccountMutation.isPending ? 'Updating...' : 'Update Account'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-destructive hover:text-destructive"
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                    <CardDescription>
                      Manage your data and privacy preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Community Profile</Label>
                        <p className="text-sm text-muted-foreground">
                          Show your progress and achievements to other users
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Learning Data Collection</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow us to analyze your learning patterns to improve our app
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates and promotional emails
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={() => {
                      toast({
                        title: "Privacy Settings Saved",
                        description: "Your privacy preferences have been updated"
                      });
                    }}>
                      Save Privacy Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Integration Settings</CardTitle>
                    <CardDescription>
                      Connect to AI services for enhanced learning
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">Gemini API Key</Label>
                      <Input 
                        id="api-key" 
                        type="password" 
                        placeholder="Enter your Gemini API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Your API key is stored securely and only used to process your learning data
                      </p>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="text-lg font-medium">AI Feedback Options</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Detailed Grammar Analysis</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive detailed grammar explanations with your corrections
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Pronunciation Feedback</Label>
                          <p className="text-sm text-muted-foreground">
                            Get detailed feedback on your pronunciation
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Writing Style Suggestions</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive suggestions to improve your writing style
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleSaveAPIKey}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Save API Settings
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="help">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>
                      Get assistance with using the app
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">Frequently Asked Questions</h3>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-muted rounded-md">
                          <h4 className="font-medium">How do I track my progress?</h4>
                          <p className="text-muted-foreground mt-1">
                            Visit the Progress page to view detailed statistics about your learning journey.
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                          <h4 className="font-medium">How do I earn points and level up?</h4>
                          <p className="text-muted-foreground mt-1">
                            Complete practice sessions and lessons to earn points. Every 100 points will advance you to the next level.
                          </p>
                        </div>
                        <div className="p-3 bg-muted rounded-md">
                          <h4 className="font-medium">How does voice login work?</h4>
                          <p className="text-muted-foreground mt-1">
                            Our system records a voice signature during registration that is used to identify you when you log in.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-2">Contact Support</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        If you can't find the answer to your question, our support team is ready to help.
                      </p>
                      <Button onClick={() => {
                        toast({
                          title: "Support Request Sent",
                          description: "Our team will contact you shortly"
                        });
                      }}>
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
