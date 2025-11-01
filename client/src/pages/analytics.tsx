import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Hash, Calendar, Smile, Meh, Frown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Analytics } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics"],
  });

  const sentimentData = analytics
    ? [
        { name: "Positive", value: analytics.positivePosts, color: "#10b981" },
        { name: "Neutral", value: analytics.neutralPosts, color: "#3b82f6" },
        { name: "Negative", value: analytics.negativePosts, color: "#ef4444" },
      ]
    : [];

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
    <div className="min-h-screen bg-background p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-chart-2 to-chart-4 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            Analytics Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your content performance and optimize your posting strategy
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <div className="grid md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="border-2">
                  <CardContent className="p-6">
                    <Skeleton className="h-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="border-2">
                  <CardContent className="p-6">
                    <Skeleton className="h-80" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : analytics ? (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div variants={item}>
                <Card className="border-2 hover-elevate transition-all" data-testid="metric-total-posts">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-chart-1 to-chart-3 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Posts</p>
                    <p className="text-3xl font-bold">{analytics.totalPosts}</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="border-2 hover-elevate transition-all" data-testid="metric-positive-rate">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <Smile className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Positive Rate</p>
                    <p className="text-3xl font-bold">
                      {analytics.totalPosts
                        ? Math.round((analytics.positivePosts / analytics.totalPosts) * 100)
                        : 0}
                      %
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="border-2 hover-elevate transition-all" data-testid="metric-top-hashtag">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-chart-3 to-chart-5 rounded-xl flex items-center justify-center">
                        <Hash className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Top Hashtag</p>
                    <p className="text-2xl font-bold truncate">
                      #{analytics.topHashtags[0]?.tag || "N/A"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="border-2 hover-elevate transition-all" data-testid="metric-avg-sentiment">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-chart-2 to-chart-4 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Avg Sentiment</p>
                    <p className="text-3xl font-bold">
                      {analytics.totalPosts > 0 ? "Positive" : "N/A"}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div variants={item}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Posts Per Week</CardTitle>
                    <CardDescription>Your posting frequency over the last 8 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.postsPerWeek}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="week" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Sentiment Distribution</CardTitle>
                    <CardDescription>Breakdown of post sentiments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div variants={item}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Best Posting Times</CardTitle>
                    <CardDescription>Hours when you schedule posts most frequently</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.postingTimes}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="hour" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={item}>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Top Hashtags</CardTitle>
                    <CardDescription>Most frequently used hashtags</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.topHashtags.slice(0, 10)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" className="text-xs" />
                        <YAxis dataKey="tag" type="category" className="text-xs" width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No data yet</h3>
              <p className="text-muted-foreground">
                Create some posts to see your analytics
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}
