import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Save, Trash2, Edit, BookOpen } from "lucide-react";
import { z } from "zod";

const itemSchema = z.object({
  type: z.enum(["mcq", "short_answer", "code"]),
  prompt: z.string().min(10, "Prompt must be at least 10 characters").max(1000),
  options: z.array(z.string()).optional(),
  answer: z.string().min(1, "Answer is required").max(500),
  explanation: z.string().max(1000).optional(),
  hints: z.array(z.string().max(200)).optional(),
  tags: z.array(z.string().max(50)).min(1, "At least one tag is required"),
  difficulty: z.number().min(1).max(5),
  bloom_level: z.string().max(50).optional(),
});

interface Item {
  id: string;
  type: string;
  prompt: string;
  options: any;
  answer: any;
  explanation: string;
  hints: string[];
  tags: string[];
  difficulty: number;
  bloom_level: string;
}

export default function InstructorConsole() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [isInstructor, setIsInstructor] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [type, setType] = useState<"mcq" | "short_answer" | "code">("mcq");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [hints, setHints] = useState<string[]>([""]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [difficulty, setDifficulty] = useState("3");
  const [bloomLevel, setBloomLevel] = useState("");

  useEffect(() => {
    checkInstructorAccess();
    loadItems();
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
  };

  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error("Failed to load items");
    }
  };

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleAddHint = () => {
    setHints([...hints, ""]);
  };

  const handleHintChange = (index: number, value: string) => {
    const newHints = [...hints];
    newHints[index] = value;
    setHints(newHints);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const filteredOptions = type === "mcq" ? options.filter(o => o.trim()) : null;
      const filteredHints = hints.filter(h => h.trim());

      // Validate with zod
      const validated = itemSchema.parse({
        type,
        prompt: prompt.trim(),
        options: filteredOptions || undefined,
        answer: answer.trim(),
        explanation: explanation.trim() || undefined,
        hints: filteredHints.length > 0 ? filteredHints : undefined,
        tags,
        difficulty: parseInt(difficulty),
        bloom_level: bloomLevel.trim() || undefined,
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("items").insert({
        type: validated.type,
        prompt: validated.prompt,
        options: validated.options,
        answer: validated.answer,
        explanation: validated.explanation,
        hints: validated.hints,
        tags: validated.tags,
        difficulty: validated.difficulty,
        bloom_level: validated.bloom_level,
        created_by: user?.id,
      });

      if (error) throw error;

      toast.success("Question created successfully!");
      resetForm();
      loadItems();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to create question");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPrompt("");
    setOptions(["", "", "", ""]);
    setAnswer("");
    setExplanation("");
    setHints([""]);
    setTags([]);
    setDifficulty("3");
    setBloomLevel("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase.from("items").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Question deleted");
      loadItems();
    } catch (error: any) {
      toast.error("Failed to delete question");
    }
  };

  if (!isInstructor) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <BookOpen className="h-10 w-10 text-primary" />
            Instructor Console
          </h1>
          <p className="text-muted-foreground">Create and manage quiz questions</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="create">Create Question</TabsTrigger>
            <TabsTrigger value="manage">Manage Questions</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Create New Question</CardTitle>
                <CardDescription>Add a new question to the quiz bank</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Question Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Question Type</Label>
                    <Select value={type} onValueChange={(value: any) => setType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="short_answer">Short Answer</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Question Prompt *</Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Enter the question..."
                      rows={4}
                      required
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {prompt.length}/1000 characters
                    </p>
                  </div>

                  {/* Options (MCQ only) */}
                  {type === "mcq" && (
                    <div className="space-y-2">
                      <Label>Answer Options *</Label>
                      {options.map((option, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            required={index < 2}
                          />
                          {options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOption(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}

                  {/* Answer */}
                  <div className="space-y-2">
                    <Label htmlFor="answer">
                      Correct Answer * {type === "mcq" && "(Enter the option text exactly)"}
                    </Label>
                    <Input
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Enter correct answer..."
                      required
                      maxLength={500}
                    />
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label htmlFor="explanation">Explanation</Label>
                    <Textarea
                      id="explanation"
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      placeholder="Explain why this is the correct answer..."
                      rows={3}
                      maxLength={1000}
                    />
                  </div>

                  {/* Hints */}
                  <div className="space-y-2">
                    <Label>Hints (Optional)</Label>
                    {hints.map((hint, index) => (
                      <Input
                        key={index}
                        value={hint}
                        onChange={(e) => handleHintChange(index, e.target.value)}
                        placeholder={`Hint ${index + 1}`}
                        maxLength={200}
                      />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={handleAddHint}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Hint
                    </Button>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label>Tags * (e.g., algebra, programming, biology)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag..."
                        maxLength={50}
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} variant="secondary">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="cursor-pointer">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level (1-5) *</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Easy</SelectItem>
                        <SelectItem value="2">2 - Easy</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - Hard</SelectItem>
                        <SelectItem value="5">5 - Very Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Bloom's Level */}
                  <div className="space-y-2">
                    <Label htmlFor="bloomLevel">Bloom's Taxonomy Level</Label>
                    <Select value={bloomLevel} onValueChange={setBloomLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remember">Remember</SelectItem>
                        <SelectItem value="understand">Understand</SelectItem>
                        <SelectItem value="apply">Apply</SelectItem>
                        <SelectItem value="analyze">Analyze</SelectItem>
                        <SelectItem value="evaluate">Evaluate</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? "Creating..." : "Create Question"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Clear Form
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle>Question Bank ({items.length})</CardTitle>
                <CardDescription>View and manage all quiz questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No questions yet. Create your first question!
                    </p>
                  ) : (
                    items.map((item) => (
                      <Card key={item.id} className="border-2">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className="capitalize">
                                  {item.type.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline">
                                  Difficulty: {item.difficulty}/5
                                </Badge>
                                {item.bloom_level && (
                                  <Badge variant="outline" className="capitalize">
                                    {item.bloom_level}
                                  </Badge>
                                )}
                              </div>
                              <CardTitle className="text-lg">{item.prompt}</CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {item.tags?.map((tag) => (
                                <Badge key={tag} variant="secondary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {item.explanation && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Explanation:</strong> {item.explanation}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
