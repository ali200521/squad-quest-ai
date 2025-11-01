import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, challengeId } = await req.json();

    if (!userId || !challengeId) {
      throw new Error("Missing required parameters: userId and challengeId");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all bot profiles (excluding the real user)
    const { data: botProfiles, error: botsError } = await supabase
      .from("profiles")
      .select("id, username")
      .neq("id", userId)
      .limit(5);

    if (botsError || !botProfiles || botProfiles.length < 5) {
      throw new Error("Not enough bot profiles available");
    }

    // Shuffle and select bots
    const shuffled = botProfiles.sort(() => Math.random() - 0.5);
    const userTeamBots = shuffled.slice(0, 2); // 2 bots for user's team
    const opponentBots = shuffled.slice(2, 5); // 3 bots for opponent team

    console.log("Creating bot squad match:", {
      userId,
      userTeamBots: userTeamBots.map(b => b.username),
      opponentBots: opponentBots.map(b => b.username),
    });

    // Create user's squad (1 user + 2 bots)
    const { data: userSquad, error: squad1Error } = await supabase
      .from("squads")
      .insert({
        challenge_id: challengeId,
        name: `User Squad`,
        status: "active",
        bot_mode: true,
      })
      .select()
      .single();

    if (squad1Error || !userSquad) {
      console.error("Error creating user squad:", squad1Error);
      throw new Error("Failed to create user squad");
    }

    // Create opponent squad (3 bots)
    const { data: opponentSquad, error: squad2Error } = await supabase
      .from("squads")
      .insert({
        challenge_id: challengeId,
        name: `Opponent Squad`,
        status: "active",
        bot_mode: true,
      })
      .select()
      .single();

    if (squad2Error || !opponentSquad) {
      console.error("Error creating opponent squad:", squad2Error);
      throw new Error("Failed to create opponent squad");
    }

    // Link squads as opponents
    const { error: updateError } = await supabase
      .from("squads")
      .update({ opponent_squad_id: opponentSquad.id })
      .eq("id", userSquad.id);

    if (updateError) {
      console.error("Error linking user squad:", updateError);
      throw new Error("Failed to link user squad to opponent");
    }

    const { error: update2Error } = await supabase
      .from("squads")
      .update({ opponent_squad_id: userSquad.id })
      .eq("id", opponentSquad.id);

    if (update2Error) {
      console.error("Error linking opponent squad:", update2Error);
      throw new Error("Failed to link opponent squad to user");
    }

    // Add user to their squad
    const { error: userMemberError } = await supabase
      .from("squad_members")
      .insert({
        squad_id: userSquad.id,
        user_id: userId,
        role: "leader",
      });

    if (userMemberError) {
      console.error("Error adding user to squad:", userMemberError);
      throw new Error("Failed to add user to squad");
    }

    // Add 2 bots to user's squad
    const userTeamInserts = userTeamBots.map(bot => ({
      squad_id: userSquad.id,
      user_id: bot.id,
      role: "member",
    }));

    const { error: userTeamError } = await supabase
      .from("squad_members")
      .insert(userTeamInserts);

    if (userTeamError) {
      console.error("Error adding bots to user squad:", userTeamError);
      throw new Error("Failed to add bots to user squad");
    }

    // Add 3 bots to opponent squad
    const opponentTeamInserts = opponentBots.map(bot => ({
      squad_id: opponentSquad.id,
      user_id: bot.id,
      role: "member",
    }));

    const { error: opponentTeamError } = await supabase
      .from("squad_members")
      .insert(opponentTeamInserts);

    if (opponentTeamError) {
      console.error("Error adding bots to opponent squad:", opponentTeamError);
      throw new Error("Failed to add bots to opponent squad");
    }

    console.log("Bot squad match created successfully:", {
      userSquadId: userSquad.id,
      opponentSquadId: opponentSquad.id,
    });

    return new Response(
      JSON.stringify({
        userSquadId: userSquad.id,
        opponentSquadId: opponentSquad.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-bot-squad-match:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});