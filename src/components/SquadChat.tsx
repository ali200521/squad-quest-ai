import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SquadChatProps {
  squadId: string;
}

export default function SquadChat({ squadId }: SquadChatProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["squadMessages", squadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("squad_chat_messages")
        .select("*")
        .eq("squad_id", squadId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch profiles separately
      if (!data || data.length === 0) return [];

      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      return data.map(msg => ({
        ...msg,
        profile: profiles?.find(p => p.id === msg.user_id)
      }));
    },
    enabled: !!squadId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      if (!currentUser) throw new Error("Not authenticated");

      const { error } = await supabase.from("squad_chat_messages").insert({
        squad_id: squadId,
        user_id: currentUser.id,
        message: messageText,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["squadMessages", squadId] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel(`squad-chat-${squadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "squad_chat_messages",
          filter: `squad_id=eq.${squadId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["squadMessages", squadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [squadId, queryClient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <Card className="flex flex-col h-[400px] border-primary/20">
      <div className="flex items-center gap-2 p-4 border-b border-border bg-gradient-hero">
        <MessageCircle className="w-5 h-5 text-primary-foreground" />
        <h3 className="font-bold text-primary-foreground">Squad Chat</h3>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages?.map((msg) => {
            const isOwn = msg.user_id === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-3 animate-slide-up ${
                  isOwn ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">
                    {msg.profile?.username?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex flex-col ${
                    isOwn ? "items-end" : "items-start"
                  } max-w-[70%]`}
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {msg.profile?.display_name || msg.profile?.username}
                  </span>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isOwn
                        ? "bg-gradient-hero text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sendMessageMutation.isPending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            size="icon"
            className="bg-gradient-hero"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
