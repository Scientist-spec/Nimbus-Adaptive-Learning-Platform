import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Trophy,
  Target,
  Clock,
} from "lucide-react";

interface QuizItem {
  id: string;
  type: string;
  prompt: string;
  options: string[] | null;
  answer: string;
  explanation: string;
  hints: string[];
  tags: string[];
  difficulty: number;
}

interface AttemptResult {
  correct: boolean;
  explanation: string;
}

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const tag = searchParams.get("tag");
  const difficulty = searchParams.get("difficulty");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    loadQuizItems();
  };

  const loadQuizItems = async () => {
    try {
      let query = supabase.from("items").select("*");

      if (tag) {
        query = query.contains("tags", [tag]);
      }
      if (difficulty) {
        query = query.eq("difficulty", parseInt(difficulty));
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error("No questions found matching your criteria");
        navigate("/dashboard");
        return;
      }

      // Shuffle items for variety
      const shuffled = data.sort(() => Math.random() - 0.5);
      setItems(shuffled as QuizItem[]);
      setLoading(false);
    } catch (error: any) {
      toast.error("Failed to load quiz");
      navigate("/dashboard");
    }
  };

  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error("Please provide an answer");
      return;
    }

    const timeTaken = Date.now() - startTime;
    const isCorrect = checkAnswer(answer, currentItem.answer, currentItem.type);

    setResult({
      correct: isCorrect,
      explanation: currentItem.explanation || "No explanation available.",
    });
    setShowResult(true);
    setTotalAttempts(totalAttempts + 1);
    if (isCorrect) setScore(score + 1);

    // Save attempt to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("attempts").insert({
        user_id: user?.id,
        item_id: currentItem.id,
        mode: "formative",
        correct: isCorrect,
        score: isCorrect ? 1 : 0,
        time_taken_ms: timeTaken,
        used_hint: usedHint,
        response: { answer: answer.trim() },
      });

      // Update learner profile
      if (user) {
        await updateLearnerProfile(user.id, isCorrect, currentItem.tags);
      }
    } catch (error: any) {
      console.error("Failed to save attempt");
    }
  };

  const updateLearnerProfile = async (userId: string, correct: boolean, tags: string[]) => {
    try {
      const { data: profile } = await supabase
        .from("learner_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profile) {
        const masteryByTag = profile.mastery_by_tag || {};
        
        // Update mastery for each tag
        tags.forEach((tag) => {
          const currentMastery = masteryByTag[tag] || 0;
          masteryByTag[tag] = correct 
            ? Math.min(currentMastery + 0.1, 1) 
            : Math.max(currentMastery - 0.05, 0);
        });

        const newStreak = correct ? profile.current_streak + 1 : 0;

        await supabase
          .from("learner_profiles")
          .update({
            mastery_by_tag: masteryByTag,
            total_attempts: profile.total_attempts + 1,
            correct_attempts: correct ? profile.correct_attempts + 1 : profile.correct_attempts,
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, profile.longest_streak),
          })
          .eq("user_id", userId);
      }
    } catch (error) {
      console.error("Failed to update learner profile");
    }
  };

  const checkAnswer = (userAnswer: string, correctAnswer: string, type: string): boolean => {
    const normalize = (str: string) => str.trim().toLowerCase();
    return normalize(userAnswer) === normalize(correctAnswer);
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setShowResult(false);
      setResult(null);
      setShowHint(false);
      setUsedHint(false);
      setStartTime(Date.now());
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setAnswer("");
    setShowResult(false);
    setResult(null);
    setShowHint(false);
    setUsedHint(false);
    setStartTime(Date.now());
    setScore(0);
    setTotalAttempts(0);
    setQuizCompleted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16 flex items-center justify-center">
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / totalAttempts) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <Card className="max-w-2xl mx-auto shadow-strong">
            <CardHeader className="text-center">
              <Trophy className="h-16 w-16 text-warning mx-auto mb-4" />
              <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
              <CardDescription>Great job completing the quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">
                      {score}/{totalAttempts}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-success/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-muted-foreground">Accuracy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-success">{percentage}%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Performance</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-3" />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleRetry} className="flex-1" variant="outline">
                  Retry Quiz
                </Button>
                <Button onClick={() => navigate("/dashboard")} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  Question {currentIndex + 1} of {items.length}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">{score}</span>
                </div>
                <Badge variant="outline">
                  Difficulty: {currentItem.difficulty}/5
                </Badge>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="shadow-strong mb-6">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentItem.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <CardTitle className="text-2xl">{currentItem.prompt}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Answer Input */}
              {!showResult && (
                <div className="space-y-4">
                  {currentItem.type === "mcq" && currentItem.options ? (
                    <RadioGroup value={answer} onValueChange={setAnswer}>
                      {currentItem.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  ) : currentItem.type === "code" ? (
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write your code here..."
                      rows={8}
                      className="font-mono"
                    />
                  ) : (
                    <Input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer..."
                      className="text-lg"
                    />
                  )}

                  {/* Hints */}
                  {currentItem.hints && currentItem.hints.length > 0 && (
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowHint(!showHint);
                          setUsedHint(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Lightbulb className="h-4 w-4" />
                        {showHint ? "Hide" : "Show"} Hint
                      </Button>
                      {showHint && (
                        <Card className="mt-2 bg-warning/5 border-warning/20">
                          <CardContent className="pt-4">
                            <p className="text-sm">{currentItem.hints[0]}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  <Button onClick={handleSubmitAnswer} className="w-full" size="lg">
                    Submit Answer
                  </Button>
                </div>
              )}

              {/* Result */}
              {showResult && result && (
                <div className="space-y-4">
                  <Card
                    className={`border-2 ${
                      result.correct
                        ? "bg-success/5 border-success"
                        : "bg-destructive/5 border-destructive"
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        {result.correct ? (
                          <>
                            <CheckCircle2 className="h-8 w-8 text-success" />
                            <div>
                              <h3 className="text-xl font-bold text-success">Correct!</h3>
                              <p className="text-sm text-muted-foreground">Great job!</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-8 w-8 text-destructive" />
                            <div>
                              <h3 className="text-xl font-bold text-destructive">Incorrect</h3>
                              <p className="text-sm text-muted-foreground">
                                Correct answer: <strong>{currentItem.answer}</strong>
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {result.explanation && (
                        <div className="p-4 bg-background rounded-lg">
                          <h4 className="font-semibold mb-2">Explanation:</h4>
                          <p className="text-sm text-muted-foreground">{result.explanation}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Button onClick={handleNext} className="w-full" size="lg">
                    {currentIndex < items.length - 1 ? (
                      <>
                        Next Question
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    ) : (
                      "Finish Quiz"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
