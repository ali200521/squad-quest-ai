import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Trophy, Users, BookOpen, Zap, LogOut, Target, 
  Award, TrendingUp, Code2, Sparkles 
} from "lucide-react";

interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  total_xp: number;
  current_level: number;
}

interface SkillArea {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skillAreas, setSkillAreas] = useState<SkillArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
  };

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        navigate("/onboarding");
        return;
      }

      setProfile(profileData);

      const { data: areasData } = await supabase
        .from("skill_areas")
        .select("*")
        .order("name");

      setSkillAreas(areasData || []);
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { data: achievements } = useQuery({
    queryKey: ["achievements", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { count } = await supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  const { data: challengesCount } = useQuery({
    queryKey: ["challengesCount", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return 0;
      const { count } = await supabase
        .from("challenge_submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", profile.id);
      return count || 0;
    },
    enabled: !!profile?.id,
  });

  const { data: userSkillLevels } = useQuery({
    queryKey: ["userSkillLevels", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from("user_skill_levels")
        .select("skill_area_id, level")
        .eq("user_id", profile.id);
      return data || [];
    },
    enabled: !!profile?.id,
  });

  const { data: activeSquads } = useQuery({
    queryKey: ["activeSquads", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data } = await supabase
        .from("squad_members")
        .select(`
          squads (
            id,
            name,
            status,
            challenge_id,
            challenges (
              title,
              difficulty_level
            )
          )
        `)
        .eq("user_id", profile.id);
      return data?.map(d => d.squads).filter(s => s.status === "active" || s.status === "ready") || [];
    },
    enabled: !!profile?.id,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, display_name, total_xp, current_level")
        .order("total_xp", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-glow-pulse">
          <Code2 className="w-16 h-16 text-primary" />
        </div>
      </div>
    );
  }

  const xpToNextLevel = profile ? (profile.current_level * 1000) : 1000;
  const xpProgress = profile ? (profile.total_xp % 1000) : 0;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="text-3xl font-bold text-primary">{profile?.current_level}</p>
                </div>
                <Trophy className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total XP</p>
                  <p className="text-3xl font-bold text-secondary">{profile?.total_xp}</p>
                </div>
                <Zap className="w-10 h-10 text-secondary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-accent/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quizzes Taken</p>
                  <p className="text-3xl font-bold text-accent">{achievements || 0}</p>
                </div>
                <Award className="w-10 h-10 text-accent opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Challenges</p>
                  <p className="text-3xl font-bold text-primary">{challengesCount || 0}</p>
                </div>
                <Target className="w-10 h-10 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Level Progress
            </CardTitle>
            <CardDescription>
              {xpToNextLevel - xpProgress} XP to Level {(profile?.current_level || 1) + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(xpProgress / xpToNextLevel) * 100} className="h-3" />
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="areas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="areas">Skill Areas</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="areas" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Choose Your Path</h2>
              <Button variant="outline" onClick={() => navigate("/onboarding")}>
                <Sparkles className="w-4 h-4" />
                Take Assessment
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillAreas.map((area) => {
                const userLevel = userSkillLevels?.find(s => s.skill_area_id === area.id);
                return (
                  <Card 
                    key={area.id} 
                    className="cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1"
                    onClick={() => navigate(`/learn/${area.id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{area.icon}</div>
                        <div>
                          <CardTitle className="text-lg">{area.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            Level {userLevel?.level || 1}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{area.description}</p>
                      <Button variant="hero" className="w-full mt-4" onClick={(e) => {
                        e.stopPropagation();
                        navigate('/quizzes');
                      }}>
                        <BookOpen className="w-4 h-4" />
                        Start Learning
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Active Challenges</h2>
              <Button variant="challenge" onClick={() => navigate('/challenges')}>
                <Users className="w-4 h-4" />
                Find Squad
              </Button>
            </div>
            {activeSquads && activeSquads.length > 0 ? (
              <div className="grid gap-4">
                {activeSquads.map((squad: any) => (
                  <Card 
                    key={squad.id}
                    className="shadow-lg cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => navigate(`/challenge/${squad.challenge_id}/squad/${squad.id}`)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{squad.challenges?.title}</h3>
                          <p className="text-sm text-muted-foreground">{squad.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={squad.status === "active" ? "default" : "secondary"}>
                            {squad.status}
                          </Badge>
                          <Badge variant="outline">
                            Level {squad.challenges?.difficulty_level || 1}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Challenges</h3>
                    <p className="text-muted-foreground mb-6">
                      Join a challenge to test your skills with others
                    </p>
                    <Button variant="challenge" onClick={() => navigate("/challenges")}>
                      Browse Challenges
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <h2 className="text-2xl font-bold">Top Performers</h2>
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {leaderboard.map((user: any, index: number) => (
                      <div 
                        key={user.username}
                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <Avatar>
                          <AvatarFallback>
                            {(user.display_name || user.username)?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{user.display_name || user.username}</p>
                          <p className="text-sm text-muted-foreground">Level {user.current_level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{user.total_xp} XP</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
                    <p className="text-muted-foreground">
                      Complete challenges to see your ranking
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </>
  );
};

export default Dashboard;
