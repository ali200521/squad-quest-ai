import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, Clock, Trophy, Zap, Swords } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Navigation from "@/components/Navigation";
import OneVOneSwipe from "@/components/OneVOneSwipe";

export default function Challenges() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);
  const [swipingChallenge, setSwipingChallenge] = useState<string | null>(null);

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select(`
          *,
          skill_areas(name, icon),
          squads(id, status, squad_members(count))
        `)
        .in("status", ["active", "pending"])
        .order("starts_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: userSkillLevels } = useQuery({
    queryKey: ["userSkillLevels"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_skill_levels")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });

  const handleJoinChallenge = async (challengeId: string, skillAreaId: string) => {
    setJoiningChallenge(challengeId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("match-squad", {
        body: {
          userId: user.id,
          skillAreaId,
          challengeId,
        },
      });

      if (error) throw error;

      toast({
        title: "Matched to squad!",
        description: "Redirecting to challenge room...",
      });

      navigate(`/challenge/${challengeId}/squad/${data.squadId}`);
    } catch (error: any) {
      toast({
        title: "Failed to join challenge",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setJoiningChallenge(null);
    }
  };

  const getTimeUntil = (date: string) => {
    const diff = new Date(date).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const oneVOneChallenges = challenges?.filter(c => c.challenge_type === "1v1") || [];
  const squadChallenges = challenges?.filter(c => c.challenge_type === "squad") || [];

  return (
    <>
      <Navigation />
      {swipingChallenge && (
        <OneVOneSwipe 
          challengeId={swipingChallenge} 
          onClose={() => setSwipingChallenge(null)} 
        />
      )}
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in">
              Battle Arena
            </h1>
            <p className="text-muted-foreground">Choose your combat style and dominate!</p>
          </div>

          <Tabs defaultValue="1v1" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="1v1" className="gap-2">
                <Swords className="w-4 h-4" />
                1v1 Duels
              </TabsTrigger>
              <TabsTrigger value="squad" className="gap-2">
                <Users className="w-4 h-4" />
                Squad Battles
              </TabsTrigger>
            </TabsList>

            <TabsContent value="1v1" className="space-y-6">
              <div className="text-center mb-6 p-6 bg-gradient-challenge rounded-lg shadow-challenge animate-scale-in">
                <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                  1v1 Combat Mode
                </h2>
                <p className="text-primary-foreground/90">
                  Swipe to find your opponent • Match instantly • Battle begins!
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {oneVOneChallenges.map((challenge) => {
                    return (
                      <Card
                        key={challenge.id}
                        className="p-6 border-secondary/30 hover:border-secondary transition-all hover:shadow-challenge bg-gradient-card animate-fade-in group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Swords className="w-5 h-5 text-secondary animate-pulse" />
                              <h3 className="font-bold text-xl">{challenge.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {challenge.description}
                            </p>
                            <Badge variant="secondary" className="bg-gradient-challenge">
                              {challenge.skill_areas?.name}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-secondary" />
                            <span>Level {challenge.difficulty_level || 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            <span>
                              {challenge.time_limit ? `${challenge.time_limit / 60} min` : "Unlimited"}
                            </span>
                          </div>
                          {challenge.starts_at && (
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-secondary animate-glow-pulse" />
                              <span>Starts in: {getTimeUntil(challenge.starts_at)}</span>
                            </div>
                          )}
                        </div>

                        <Button
                          className="w-full bg-gradient-challenge hover:shadow-challenge transition-smooth group-hover:scale-105"
                          onClick={() => setSwipingChallenge(challenge.id)}
                        >
                          <Swords className="w-4 h-4 mr-2" />
                          Find Opponent
                        </Button>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>

            <TabsContent value="squad" className="space-y-6">
              <div className="text-center mb-6 p-6 bg-gradient-hero rounded-lg shadow-glow animate-scale-in">
                <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                  Squad Battle Mode
                </h2>
                <p className="text-primary-foreground/90">
                  Join forces • Auto-matched squads • Epic team battles!
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {squadChallenges.map((challenge) => {

                  return (
                    <Card
                      key={challenge.id}
                      className="p-6 border-primary/30 hover:border-primary transition-all hover:shadow-glow bg-gradient-card animate-fade-in group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-primary animate-pulse" />
                            <h3 className="font-bold text-xl">{challenge.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {challenge.description}
                          </p>
                          <Badge className="bg-gradient-hero">{challenge.skill_areas?.name}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-primary" />
                          <span>Level {challenge.difficulty_level || 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          <span>Squad size: {challenge.max_squad_size || 3}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>
                            {challenge.time_limit ? `${challenge.time_limit / 60} min` : "Unlimited"}
                          </span>
                        </div>
                        {challenge.starts_at && (
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-primary animate-glow-pulse" />
                            <span>Starts in: {getTimeUntil(challenge.starts_at)}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-gradient-hero hover:shadow-glow transition-smooth group-hover:scale-105"
                        onClick={() => handleJoinChallenge(challenge.id, challenge.skill_area_id)}
                        disabled={joiningChallenge === challenge.id}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {joiningChallenge === challenge.id ? "Matching..." : "Join Squad"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
