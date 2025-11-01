import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Code2, CheckCircle2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string; level: number }[];
  skillAreaId?: string;
}

const questions: Question[] = [
  {
    id: "experience",
    question: "How would you describe your coding experience?",
    options: [
      { value: "beginner", label: "Beginner - Just starting out", level: 1 },
      { value: "intermediate", label: "Intermediate - Can build basic apps", level: 2 },
      { value: "advanced", label: "Advanced - Comfortable with complex projects", level: 3 },
      { value: "expert", label: "Expert - Professional developer", level: 4 },
    ],
  },
  {
    id: "frontend_skill",
    question: "Rate your Frontend Development skills",
    options: [
      { value: "none", label: "No experience", level: 1 },
      { value: "learning", label: "Learning the basics", level: 1 },
      { value: "comfortable", label: "Comfortable with HTML/CSS/JS", level: 2 },
      { value: "proficient", label: "Proficient with frameworks (React/Vue)", level: 3 },
    ],
  },
  {
    id: "backend_skill",
    question: "Rate your Backend Development skills",
    options: [
      { value: "none", label: "No experience", level: 1 },
      { value: "learning", label: "Learning the basics", level: 1 },
      { value: "comfortable", label: "Can build simple APIs", level: 2 },
      { value: "proficient", label: "Proficient with databases & architecture", level: 3 },
    ],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (!answers[currentQuestion.id]) {
      toast.error("Please select an answer");
      return;
    }
    
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get skill areas
      const { data: skillAreas } = await supabase
        .from("skill_areas")
        .select("*");

      if (!skillAreas) throw new Error("Failed to fetch skill areas");

      // Calculate levels based on answers
      const frontendArea = skillAreas.find(a => a.name === "Frontend Development");
      const backendArea = skillAreas.find(a => a.name === "Backend Development");

      const frontendAnswer = questions[1].options.find(
        opt => opt.value === answers.frontend_skill
      );
      const backendAnswer = questions[2].options.find(
        opt => opt.value === answers.backend_skill
      );

      // Insert user skill levels
      const skillLevelsData = [];
      
      if (frontendArea && frontendAnswer) {
        skillLevelsData.push({
          user_id: user.id,
          skill_area_id: frontendArea.id,
          level: frontendAnswer.level,
          assessment_completed: true,
        });
      }

      if (backendArea && backendAnswer) {
        skillLevelsData.push({
          user_id: user.id,
          skill_area_id: backendArea.id,
          level: backendAnswer.level,
          assessment_completed: true,
        });
      }

      if (skillLevelsData.length > 0) {
        const { error } = await supabase
          .from("user_skill_levels")
          .upsert(skillLevelsData, { onConflict: "user_id,skill_area_id" });

        if (error) throw error;
      }

      toast.success("Assessment complete! Welcome to CodeBattle Arena");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Failed to save assessment");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Skill Assessment</h1>
          </div>
          <p className="text-muted-foreground">
            Help us understand your skills to match you with the right challenges
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Question {currentStep + 1} of {questions.length}</span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="shadow-xl animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">{currentQuestion.question}</CardTitle>
            <CardDescription>Select the option that best describes you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={answers[currentQuestion.id]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQuestion.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    answers[currentQuestion.id] === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer font-medium"
                  >
                    {option.label}
                  </Label>
                  {answers[currentQuestion.id] === option.value && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
            </RadioGroup>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <Button
                variant="hero"
                onClick={handleNext}
                disabled={!answers[currentQuestion.id] || isSubmitting}
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : currentStep === questions.length - 1 ? (
                  <>
                    Complete
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip option */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
