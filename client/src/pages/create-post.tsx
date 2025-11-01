import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Hash, Smile, Meh, Frown, Calendar, Loader2, Send, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AIAnalysis, InsertPost } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function CreatePost() {
  const { currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [customHashtags, setCustomHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");

  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await apiRequest<AIAnalysis>("POST", "/api/analyze", { text });
      return response;
    },
    onSuccess: (data) => {
      setAiAnalysis(data);
      setCustomHashtags(data.suggestedHashtags);
      toast({
        title: "Analysis complete!",
        description: "AI has analyzed your content and generated hashtags.",
      });
    },
    onError: () => {
      toast({
        title: "Analysis failed",
        description: "Could not analyze content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: InsertPost) => {
      return await apiRequest("POST", "/api/posts", post);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({
        title: "Post scheduled!",
        description: "Your post has been saved successfully.",
      });
      setLocation("/posts");
    },
    onError: () => {
      toast({
        title: "Failed to save post",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please enter some content to analyze.",
        variant: "destructive",
      });
      return;
    }
    analyzeMutation.mutate(content);
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !customHashtags.includes(hashtagInput.trim())) {
      setCustomHashtags([...customHashtags, hashtagInput.trim()]);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (tag: string) => {
    setCustomHashtags(customHashtags.filter((t) => t !== tag));
  };

  const handleSavePost = () => {
    if (!content.trim()) {
      toast({
        title: "No content",
        description: "Please enter post content.",
        variant: "destructive",
      });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Missing schedule",
        description: "Please select date and time for posting.",
        variant: "destructive",
      });
      return;
    }

    if (!aiAnalysis) {
      toast({
        title: "Analysis required",
        description: "Please analyze your content first.",
        variant: "destructive",
      });
      return;
    }

    const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).getTime();

    const post: InsertPost = {
      userId: currentUser!.uid,
      content,
      hashtags: customHashtags,
      sentiment: aiAnalysis.sentiment,
      sentimentScore: aiAnalysis.sentimentScore,
      scheduledFor,
      status: "scheduled",
    };

    createPostMutation.mutate(post);
  };

  const getSentimentIcon = () => {
    if (!aiAnalysis) return null;
    switch (aiAnalysis.sentiment) {
      case "positive":
        return <Smile className="w-5 h-5" />;
      case "negative":
        return <Frown className="w-5 h-5" />;
      default:
        return <Meh className="w-5 h-5" />;
    }
  };

  const getSentimentColor = () => {
    if (!aiAnalysis) return "";
    switch (aiAnalysis.sentiment) {
      case "positive":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
      case "negative":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-chart-3 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            AI Post Assistant
          </h1>
          <p className="text-lg text-muted-foreground">
            Create engaging content with AI-powered insights and hashtag suggestions
          </p>
        </div>

        <div className="grid gap-6">
          {/* Content Input */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
              <CardDescription>Write or paste your social media post content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Your Message</Label>
                <Textarea
                  id="content"
                  placeholder="What's on your mind? Share your thoughts, ideas, or updates..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] text-base resize-none"
                  data-testid="input-post-content"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{content.length} characters</span>
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzeMutation.isPending || !content.trim()}
                    className="font-semibold"
                    data-testid="button-analyze"
                  >
                    {analyzeMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze & Generate Hashtags
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          <AnimatePresence>
            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-chart-3/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      AI Analysis Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Sentiment */}
                    <div>
                      <Label className="mb-3 block">Sentiment Analysis</Label>
                      <Badge
                        className={`${getSentimentColor()} px-4 py-2 text-base font-semibold border-2`}
                        data-testid="badge-sentiment"
                      >
                        {getSentimentIcon()}
                        <span className="ml-2 capitalize">{aiAnalysis.sentiment}</span>
                        <span className="ml-2 text-sm">
                          ({Math.round(aiAnalysis.sentimentScore * 100)}% confidence)
                        </span>
                      </Badge>
                    </div>

                    {/* Hashtags */}
                    <div>
                      <Label className="mb-3 block">Suggested Hashtags</Label>
                      <div className="flex flex-wrap gap-2 mb-4" data-testid="container-hashtags">
                        <AnimatePresence>
                          {customHashtags.map((tag, index) => (
                            <motion.div
                              key={tag}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Badge
                                variant="secondary"
                                className="px-3 py-1.5 text-sm font-medium hover-elevate group cursor-pointer"
                                data-testid={`hashtag-${tag}`}
                              >
                                <Hash className="w-3 h-3 mr-1" />
                                {tag}
                                <button
                                  onClick={() => handleRemoveHashtag(tag)}
                                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                  data-testid={`button-remove-${tag}`}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom hashtag..."
                          value={hashtagInput}
                          onChange={(e) => setHashtagInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleAddHashtag()}
                          data-testid="input-custom-hashtag"
                        />
                        <Button onClick={handleAddHashtag} variant="outline" data-testid="button-add-hashtag">
                          Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Schedule */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Post
              </CardTitle>
              <CardDescription>Choose when you want this post to be published</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="h-12"
                    data-testid="input-schedule-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="h-12"
                    data-testid="input-schedule-time"
                  />
                </div>
              </div>

              <Button
                onClick={handleSavePost}
                disabled={createPostMutation.isPending || !aiAnalysis || !scheduledDate || !scheduledTime}
                className="w-full h-12 text-base font-semibold"
                data-testid="button-save-post"
              >
                {createPostMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Schedule Post
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
