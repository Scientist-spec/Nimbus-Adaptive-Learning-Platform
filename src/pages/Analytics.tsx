import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, Users, Target, Award, Brain } from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  totalAttempts: number;
  totalStudents: number;
  averageAccuracy: number;
  performanceByTag: { tag: string; accuracy: number; attempts: number }[];
  difficultyDistribution: { difficulty: number; count: number }[];
  recentActivity: { date: string; attempts: number; accuracy: number }[];
  topPerformers: { name: string; accuracy: number; attempts: number }[];
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const navigate = useNavigate();

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))"];

  useEffect(() => {
    checkInstructorAccess();
  }, []);

  const checkInstructorAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasAccess = roles?.some(r => r.role === "instructor" || r.role === "admin");
    if (!hasAccess) {
      toast.error("Access denied. Instructor privileges required.");
      navigate("/dashboard");
      return;
    }
    
    setIsInstructor(true);
    loadAnalytics();
  };

  const loadAnalytics = async () => {
    try {
      // Fetch all attempts
      const { data: attempts, error: attemptsError } = await supabase
        .from("attempts")
        .select(`
          *,
          item:items(tags, difficulty),
          user:profiles(full_name)
        `);

      if (attemptsError) throw attemptsError;

      // Fetch learner profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("learner_profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Calculate analytics
      const totalAttempts = attempts?.length || 0;
      const totalStudents = profiles?.length || 0;
      const correctAttempts = attempts?.filter(a => a.correct).length || 0;
      const averageAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

      // Performance by tag
      const tagMap = new Map<string, { correct: number; total: number }>();
      attempts?.forEach((attempt: any) => {
        attempt.item?.tags?.forEach((tag: string) => {
          const current = tagMap.get(tag) || { correct: 0, total: 0 };
          tagMap.set(tag, {
            correct: current.correct + (attempt.correct ? 1 : 0),
            total: current.total + 1,
          });
        });
      });

      const performanceByTag = Array.from(tagMap.entries())
        .map(([tag, data]) => ({
          tag,
          accuracy: Math.round((data.correct / data.total) * 100),
          attempts: data.total,
        }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 10);

      // Difficulty distribution
      const difficultyMap = new Map<number, number>();
      attempts?.forEach((attempt: any) => {
        const diff = attempt.item?.difficulty || 3;
        difficultyMap.set(diff, (difficultyMap.get(diff) || 0) + 1);
      });

      const difficultyDistribution = Array.from(difficultyMap.entries())
        .map(([difficulty, count]) => ({ difficulty, count }))
        .sort((a, b) => a.difficulty - b.difficulty);

      // Recent activity (last 7 days)
      const today = new Date();
      const recentActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        
        const dayAttempts = attempts?.filter((a: any) => 
          a.created_at.startsWith(dateStr)
        ) || [];
        
        const dayCorrect = dayAttempts.filter((a: any) => a.correct).length;
        
        recentActivity.push({
          date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          attempts: dayAttempts.length,
          accuracy: dayAttempts.length > 0 ? Math.round((dayCorrect / dayAttempts.length) * 100) : 0,
        });
      }

      // Top performers
      const userStats = new Map<string, { correct: number; total: number; name: string }>();
      attempts?.forEach((attempt: any) => {
        const userId = attempt.user_id;
        const name = attempt.user?.full_name || "Unknown User";
        const current = userStats.get(userId) || { correct: 0, total: 0, name };
        userStats.set(userId, {
          correct: current.correct + (attempt.correct ? 1 : 0),
          total: current.total + 1,
          name,
        });
      });

      const topPerformers = Array.from(userStats.values())
        .map(data => ({
          name: data.name,
          accuracy: Math.round((data.correct / data.total) * 100),
          attempts: data.total,
        }))
        .sort((a, b) => b.accuracy - a.accuracy)
        .slice(0, 10);

      setAnalytics({
        totalAttempts,
        totalStudents,
        averageAccuracy: Math.round(averageAccuracy),
        performanceByTag,
        difficultyDistribution,
        recentActivity,
        topPerformers,
      });
    } catch (error: any) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (!isInstructor || loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BarChart3 className="h-10 w-10 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Comprehensive insights into student performance</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Attempts
              </CardTitle>
              <Target className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.totalAttempts}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Students
              </CardTitle>
              <Users className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Accuracy
              </CardTitle>
              <Award className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.averageAccuracy}%</div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Topics Covered
              </CardTitle>
              <Brain className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics?.performanceByTag.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance by Tag */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Performance by Topic</CardTitle>
                <CardDescription>Average accuracy across different subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.performanceByTag}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tag" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="hsl(var(--primary))" name="Accuracy %" />
                    <Bar dataKey="attempts" fill="hsl(var(--accent))" name="Attempts" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Question Difficulty Distribution</CardTitle>
                <CardDescription>Distribution of attempts by difficulty level</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.difficultyDistribution}
                      dataKey="count"
                      nameKey="difficulty"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `Level ${entry.difficulty}`}
                    >
                      {analytics?.difficultyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
                <CardDescription>Daily attempts and accuracy trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics?.recentActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="attempts"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Attempts"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      name="Accuracy %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Students with highest accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics?.topPerformers.map((student, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <span className="font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.attempts} attempts
                          </p>
                        </div>
                      </div>
                      <Badge variant={student.accuracy >= 80 ? "default" : "secondary"} className="text-lg">
                        {student.accuracy}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
