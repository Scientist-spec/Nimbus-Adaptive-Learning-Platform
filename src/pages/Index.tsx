import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Award,
  BookOpen,
  Zap,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import heroImage from "@/assets/hero-learning.jpg";

export default function Index() {
  const features = [
    {
      icon: <Brain className="h-8 w-8 text-primary" />,
      title: "Adaptive Learning",
      description: "AI-powered system that adapts to your learning pace and style for optimal knowledge retention.",
    },
    {
      icon: <Target className="h-8 w-8 text-accent" />,
      title: "Personalized Pathways",
      description: "Dynamic quiz assembly based on your mastery level and learning goals.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-success" />,
      title: "Real-time Feedback",
      description: "Immediate feedback on answers with detailed explanations and hints.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-warning" />,
      title: "Progress Analytics",
      description: "Comprehensive tracking of your learning journey with detailed insights.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Instructor Tools",
      description: "Powerful console for educators to create content and track student progress.",
    },
    {
      icon: <Award className="h-8 w-8 text-accent" />,
      title: "Mastery Tracking",
      description: "Track your proficiency across different topics and celebrate achievements.",
    },
  ];

  const benefits = [
    "Multiple assessment modes: diagnostic, formative, and summative",
    "Spaced repetition algorithm for better retention",
    "Difficulty scaling based on performance",
    "Rich question bank with tags and categorization",
    "Bloom's taxonomy integration",
    "Comprehensive analytics dashboard",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background -z-10" />
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Powered by AI</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Adaptive Learning
                </span>
                <br />
                <span className="text-foreground">That Evolves With You</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Experience personalized education powered by advanced algorithms. Nimbus adapts to your
                unique learning style, helping you master concepts faster and retain knowledge longer.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-gradient-to-r from-primary to-primary/80 hover:shadow-strong transition-all"
                  asChild
                >
                  <Link to="/auth">Start Learning Free</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-2"
                  asChild
                >
                  <Link to="/auth">View Demo</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">Free forever</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl -z-10" />
              <img
                src={heroImage}
                alt="Students learning with adaptive technology"
                className="rounded-3xl shadow-strong w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and features designed to accelerate your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-2 border-border hover:border-primary hover:shadow-medium transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="mb-4 transform group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Why Choose <span className="text-primary">Nimbus</span>?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our platform combines cutting-edge educational psychology with modern technology
                to deliver an unparalleled learning experience.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                    <p className="text-foreground">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-8 shadow-strong border-2">
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg">
                  <BookOpen className="h-12 w-12 text-primary" />
                  <div>
                    <p className="font-semibold text-lg">10,000+</p>
                    <p className="text-sm text-muted-foreground">Quiz Questions</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg">
                  <Users className="h-12 w-12 text-accent" />
                  <div>
                    <p className="font-semibold text-lg">50,000+</p>
                    <p className="text-sm text-muted-foreground">Active Learners</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-success/5 rounded-lg">
                  <Award className="h-12 w-12 text-success" />
                  <div>
                    <p className="font-semibold text-lg">95%</p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are achieving their goals with personalized,
            adaptive education.
          </p>
          <Button
            size="lg"
            className="text-lg px-12 py-6 h-auto bg-gradient-to-r from-primary via-primary to-accent hover:shadow-strong transition-all"
            asChild
          >
            <Link to="/auth">Get Started Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Nimbus</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Nimbus. Adaptive Learning Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
