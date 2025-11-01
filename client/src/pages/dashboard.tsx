import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Sparkles, Calendar, TrendingUp, Hash, Plus, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Post, Analytics } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const { data: posts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const stats = [
    {
      title: "Total Posts",
      value: analytics?.totalPosts || 0,
      icon: Calendar,
      gradient: "from-chart-1 to-chart-3",
      testId: "stat-total-posts",
    },
    {
      title: "Positive Rate",
      value: analytics?.totalPosts
        ? `${Math.round((analytics.positivePosts / analytics.totalPosts) * 100)}%`
        : "0%",
      icon: TrendingUp,
      gradient: "from-chart-2 to-chart-4",
      testId: "stat-positive-rate",
    },
    {
      title: "Top Hashtag",
      value: analytics?.topHashtags?.[0]?.tag || "N/A",
      icon: Hash,
      gradient: "from-chart-3 to-chart-5",
      testId: "stat-top-hashtag",
    },
    {
      title: "This Week",
      value: analytics?.postsPerWeek?.[analytics.postsPerWeek.length - 1]?.count || 0,
      icon: Zap,
      gradient: "from-chart-5 to-chart-1",
      testId: "stat-this-week",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary/10 via-chart-3/10 to-chart-2/10 border-b">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0yNCA2YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2ek0xMiAyNmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50"></div>
        
        <div className="relative px-6 py-16 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3" data-testid="text-welcome">
              {greeting}, {userProfile?.displayName}! 👋
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Ready to create amazing content with AI-powered insights
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/create">
                <Button size="lg" className="h-12 px-6 font-semibold" data-testid="button-create-post">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Post
                </Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="outline" className="h-12 px-6 font-semibold" data-testid="button-view-analytics">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-6 py-12 md:px-12">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div key={stat.title} variants={item}>
              <Card className="border-2 overflow-hidden hover-elevate transition-all duration-300" data-testid={stat.testId}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                  {analyticsLoading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : (
                    <p className="text-3xl font-bold">{stat.value}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-2xl font-bold">Recent Posts</CardTitle>
              <Link href="/posts">
                <Button variant="outline" size="sm" data-testid="button-view-all-posts">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.slice(0, 5).map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover-elevate transition-all duration-200"
                      data-testid={`post-item-${post.id}`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        post.sentiment === "positive"
                          ? "bg-green-100 dark:bg-green-900/30"
                          : post.sentiment === "negative"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-blue-100 dark:bg-blue-900/30"
                      }`}>
                        <Sparkles className={`w-6 h-6 ${
                          post.sentiment === "positive"
                            ? "text-green-600 dark:text-green-400"
                            : post.sentiment === "negative"
                            ? "text-red-600 dark:text-red-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2 mb-2">{post.content}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="capitalize px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
                            {post.sentiment}
                          </span>
                          <span>•</span>
                          <span>{new Date(post.scheduledFor).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first post to get started!</p>
                  <Link href="/create">
                    <Button data-testid="button-create-first-post">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Post
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
