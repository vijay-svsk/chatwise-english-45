
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import { CommunityPost } from '@/types/database';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Heart, Send, Users, Bell } from 'lucide-react';

const CommunityPage = () => {
  const [newPostContent, setNewPostContent] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = "1"; // In a real app, get this from auth context
  
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts'],
    queryFn: () => db.getCommunityPosts(),
  });
  
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => db.getUserById(userId),
  });
  
  const createPostMutation = useMutation({
    mutationFn: (content: string) => {
      if (!user) throw new Error('User not logged in');
      
      return db.createCommunityPost({
        userId: user.id,
        userName: user.name,
        userLevel: user.level,
        content,
        likes: 0,
        comments: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
      setNewPostContent('');
      toast({
        title: "Post Created",
        description: "Your post has been shared with the community",
      });
    },
  });
  
  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Empty Post",
        description: "Please write something before posting",
        variant: "destructive",
      });
      return;
    }
    
    createPostMutation.mutate(newPostContent);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 px-6 pb-8 ml-64">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Community</h1>
                <p className="text-muted-foreground">Connect with other language learners</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Find Friends
                </Button>
              </div>
            </div>
            
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar />
                  <div>
                    <p className="font-medium">{user?.name || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">Level {user?.level || 1}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <Textarea
                  placeholder="Share your language learning experience..."
                  className="resize-none"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                  {createPostMutation.isPending ? 'Posting...' : 'Post to Community'}
                </Button>
              </CardFooter>
            </Card>
            
            <div className="space-y-6">
              {postsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted"></div>
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-3 w-12 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar />
                          <div>
                            <p className="font-medium">{post.userName}</p>
                            <p className="text-xs text-muted-foreground">Level {post.userLevel} • {formatDate(post.date)}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm">{post.content}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-3">
                      <div className="flex items-center gap-6 text-muted-foreground text-sm">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                          <MessageSquare className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No posts yet</h3>
                  <p className="text-muted-foreground">Be the first to post in the community</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityPage;
