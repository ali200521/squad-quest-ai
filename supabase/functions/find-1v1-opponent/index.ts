import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    console.log('Finding 1v1 opponent for:', { userId, challengeId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Add user to queue (or update if already exists)
    const { error: queueError } = await supabase
      .from('match_queue')
      .upsert({
        user_id: userId,
        challenge_id: challengeId,
        status: 'waiting',
        created_at: new Date().toISOString()
      });

    if (queueError) {
      console.error('Error adding to queue:', queueError);
      throw queueError;
    }

    // Look for another waiting user
    const { data: waitingUsers, error: searchError } = await supabase
      .from('match_queue')
      .select('user_id')
      .eq('challenge_id', challengeId)
      .eq('status', 'waiting')
      .neq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1);

    if (searchError) {
      console.error('Error searching for opponents:', searchError);
      throw searchError;
    }

    if (waitingUsers && waitingUsers.length > 0) {
      const opponentId = waitingUsers[0].user_id;
      console.log('Opponent found:', opponentId);

      // Create 1v1 match
      const { data: matchData, error: matchError } = await supabase.functions.invoke('create-1v1-match', {
        body: {
          challengeId,
          user1Id: userId,
          user2Id: opponentId
        }
      });

      if (matchError) {
        console.error('Error creating 1v1 match:', matchError);
        throw matchError;
      }

      console.log('Match created:', matchData);

      // Update both users' queue status to matched
      const { error: updateError } = await supabase
        .from('match_queue')
        .update({ status: 'matched' })
        .in('user_id', [userId, opponentId])
        .eq('challenge_id', challengeId);

      if (updateError) {
        console.error('Error updating queue status:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          status: 'matched',
          squadId: matchData.squad1Id,
          opponentSquadId: matchData.squad2Id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // No opponent found yet
    console.log('No opponent found, user in queue');
    return new Response(
      JSON.stringify({ 
        status: 'waiting',
        message: 'Searching for opponent...'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in find-1v1-opponent function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to find opponent' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
