import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  TrendingUp,
  Award,
  Target,
  Brain,
  Clock,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { toast } from "sonner";

interface LearnerProfile {
  mastery_by_tag: Record<string, number> | null;
  total_attempts: number;
  correct_attempts: number;
  current_streak: number;
  longest_streak: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  mode: string;
  tags: string[];
  created_at: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/auth");
      return;
    }

    await Promise.all([loadLearnerProfile(), loadQuizzes(), loadUserRoles()]);
    setLoading(false);
  };

  const loadLearnerProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setProfile(data as LearnerProfile);
    } catch (error: any) {
      toast.error("Failed to load learning profile");
    }
  };

  const loadQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error: any) {
      toast.error("Failed to load quizzes");
    }
  };

  const loadUserRoles = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserRoles(data?.map((r) => r.role) || []);
    } catch (error: any) {
      console.error("Failed to load user roles");
    }
  };

  const getAccuracyPercentage = () => {
    if (!profile || profile.total_attempts === 0) return 0;
    return Math.round((profile.correct_attempts / profile.total_attempts) * 100);
  };

  const isInstructor = userRoles.includes("instructor") || userRoles.includes("admin");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isInstructor ? "Instructor Dashboard" : "Learning Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {isInstructor
              ? "Manage quizzes and track student progress"
              : "Track your progress and continue learning"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Attempts
              </CardTitle>
              <Target className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {profile?.total_attempts || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Questions answered
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-success shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accuracy
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {getAccuracyPercentage()}%
              </div>
              <Progress value={getAccuracyPercentage()} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-accent shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Current Streak
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {profile?.current_streak || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Consecutive correct answers
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-warning shadow-soft hover:shadow-medium transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Streak
              </CardTitle>
              <Award className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {profile?.longest_streak || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Personal record
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mastery by Topic */}
        {profile?.mastery_by_tag && Object.keys(profile.mastery_by_tag).length > 0 && (
          <Card className="mb-8 shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Mastery by Topic
              </CardTitle>
              <CardDescription>Your proficiency across different subjects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(profile.mastery_by_tag).map(([tag, mastery]) => (
                  <div key={tag} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{tag}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(Number(mastery) * 100)}%
                      </span>
                    </div>
                    <Progress value={Number(mastery) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Quizzes */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {isInstructor ? "Recent Quizzes" : "Available Quizzes"}
            </CardTitle>
            <CardDescription>
              {isInstructor
                ? "Manage and view your created quizzes"
                : "Start a quiz to test your knowledge"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No quizzes available yet</p>
                {isInstructor && (
                  <Button className="mt-4" variant="outline">
                    Create First Quiz
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz) => (
                  <Card
                    key={quiz.id}
                    className="hover:shadow-medium transition-all cursor-pointer border-2 border-border hover:border-primary"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {quiz.mode}
                        </Badge>
                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {quiz.description || "No description provided"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {quiz.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Button className="w-full" size="sm">
                        {isInstructor ? "Manage" : "Start Quiz"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
