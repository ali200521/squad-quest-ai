import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Code2, Users, Trophy, Zap, Target, BookOpen, 
  ArrowRight, Sparkles, Award
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-sm" />
        
        <div className="relative z-10 container mx-auto px-4 py-20 text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Level Up Your Coding Skills</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              CodeBattle Arena
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Learn, compete, and conquer through squad-based coding challenges. 
            AI-powered matchmaking brings you the perfect team for epic battles.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              <Trophy className="w-5 h-5" />
              View Leaderboard
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12">
            <div className="space-y-2">
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Learners</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-secondary">50K+</div>
              <div className="text-sm text-muted-foreground">Challenges Completed</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-accent">95%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete learning platform designed for competitive coders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border-primary/20">
              <CardContent className="pt-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mx-auto shadow-glow">
                  <BookOpen className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-center">Learn</h3>
                <p className="text-muted-foreground text-center">
                  Master skills through interactive classes and AI-generated quizzes tailored to your level
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border-secondary/20">
              <CardContent className="pt-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-challenge flex items-center justify-center mx-auto shadow-challenge">
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-center">Team Up</h3>
                <p className="text-muted-foreground text-center">
                  AI matches you with squad members of similar skill levels for balanced competition
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-all hover:-translate-y-2 border-accent/20">
              <CardContent className="pt-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-achievement flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-center">Compete</h3>
                <p className="text-muted-foreground text-center">
                  Battle other squads in timed challenges. Quality and speed determine the winner
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl font-bold">Master Multiple Domains</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose your path and become an expert
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {[
              { icon: "💻", name: "Frontend" },
              { icon: "⚙️", name: "Backend" },
              { icon: "🚀", name: "Full Stack" },
              { icon: "📱", name: "Mobile" },
              { icon: "☁️", name: "DevOps" },
              { icon: "📊", name: "Data Science" },
            ].map((skill) => (
              <Card key={skill.name} className="text-center hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1">
                <CardContent className="pt-6 pb-6">
                  <div className="text-4xl mb-2">{skill.icon}</div>
                  <div className="font-semibold text-sm">{skill.name}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary-glow rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Join thousands of developers leveling up their skills through competitive learning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-6"
            >
              <Zap className="w-5 h-5" />
              Sign Up Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CodeBattle Arena. Level up your coding skills.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
