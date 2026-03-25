
'use client';

import { useState, useRef, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, User, ShieldAlert, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatPanelProps {
  userId: string;
  complaintId: string;
  currentUserRole: "user" | "hod" | "mentor" | "safety";
}

/**
 * PRACTICAL MOCK HISTORY
 * Only provided for the 4 specific demonstrate cases requested.
 */
const MOCK_HISTORY: Record<string, any[]> = {
  "GLO-9901": [
    { id: "h1", text: "Has the local precinct been notified regarding the slurs used during the incident?", senderRole: "safety", senderId: "mock-safety", isQuery: true, createdAt: new Date(Date.now() - 3600000 * 5) },
    { id: "h2", text: "Yes, the safety officer arrived 10 minutes ago. Taking anonymous statements from the witnesses now.", senderRole: "user", senderId: "mock-user", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 4.5) },
    { id: "h3", text: "Understood. The Safety Cell will provide legal support if needed. Identity remains secured.", senderRole: "safety", senderId: "mock-safety", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 4) }
  ],
  "GLO-9904": [
    { id: "h1", text: "Can you provide the description of the vehicle that was following you?", senderRole: "safety", senderId: "mock-safety", isQuery: true, createdAt: new Date(Date.now() - 3600000 * 1.5) },
    { id: "h2", text: "It was a black sedan with tinted windows. No license plate on the front. I noticed it twice this week.", senderRole: "user", senderId: "mock-user", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 1.2) },
    { id: "h3", text: "Retrieving CCTV logs for the Main Gate from 8 PM to 10 PM. Patrols near the girls' hostel have been doubled.", senderRole: "safety", senderId: "mock-safety", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 1) }
  ],
  "GLO-9905": [
    { id: "h1", text: "Was the recording device visible or hidden? Mentors need this for the facility audit.", senderRole: "mentor", senderId: "mock-mentor", isQuery: true, createdAt: new Date(Date.now() - 3600000 * 0.4) },
    { id: "h2", text: "It was a phone placed on the high shelf near the lockers. I secured it and it's with the gym attendant now.", senderRole: "user", senderId: "mock-user", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 0.3) },
    { id: "h3", text: "Emergency Protocol Active: Facility locked down for evidence collection. All gym staff under audit.", senderRole: "safety", senderId: "mock-safety", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 0.2) }
  ],
  "GLO-9908": [
    { id: "h1", text: "The HOD is reviewing the internal project marks. Was this project evaluated by a TA or the Professor?", senderRole: "hod", senderId: "mock-hod", isQuery: true, createdAt: new Date(Date.now() - 3600000 * 40) },
    { id: "h2", text: "It was the Senior TA for Section B. He made several remarks about girls 'getting the theory right but failing the implementation'.", senderRole: "user", senderId: "mock-user", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 38) },
    { id: "h3", text: "A secondary review of Section B marks is underway. If bias is confirmed, the TA will be removed from evaluation duties.", senderRole: "hod", senderId: "mock-hod", isQuery: false, createdAt: new Date(Date.now() - 3600000 * 36) }
  ]
};

export function ChatPanel({ userId, complaintId, currentUserRole }: ChatPanelProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !userId || !complaintId || isUserLoading || !user) return null;
    return query(
      collection(firestore, "users", userId, "complaints", complaintId, "messages"),
      orderBy("createdAt", "asc")
    );
  }, [firestore, userId, complaintId, isUserLoading, user]);

  const { data: realMessages, isLoading, error } = useCollection(messagesQuery);

  // Combine mock history with real messages
  const messages = useMemo(() => {
    const history = MOCK_HISTORY[complaintId] || [];
    const real = realMessages || [];
    return [...history, ...real];
  }, [realMessages, complaintId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (isQuery = false) => {
    if (!inputText.trim() || !user || !firestore) return;

    const messageData = {
      text: inputText.trim(),
      senderRole: currentUserRole,
      senderId: user.uid,
      createdAt: serverTimestamp(),
      isQuery: isQuery
    };

    setInputText("");
    
    try {
      await addDoc(
        collection(firestore, "users", userId, "complaints", complaintId, "messages"),
        messageData
      );
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden border">
      <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-sm">Secure Audit Log: {complaintId}</h3>
        </div>
        {currentUserRole !== 'user' && (
          <Badge variant="outline" className="text-[10px] font-black uppercase bg-white">
            Official Channel
          </Badge>
        )}
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
              <Clock className="h-6 w-6 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest">Securing Connection...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2 text-center px-6">
              <ShieldAlert className="h-8 w-8" />
              <p className="text-xs font-bold uppercase">Permission Denied</p>
              <p className="text-[10px] opacity-70">Authority synchronization failed. Please wait.</p>
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.uid || (msg.senderRole === currentUserRole && msg.senderId.startsWith('mock'));
              return (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm shadow-sm",
                    isMe ? "bg-primary text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none",
                    msg.isQuery && !isMe && "bg-yellow-50 border border-yellow-200 text-slate-900"
                  )}>
                    {msg.isQuery && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] font-black uppercase text-amber-600">
                        <AlertTriangle className="h-3 w-3" />
                        Authority Query
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 px-1">
                    <span className="text-[9px] font-black uppercase text-slate-400">
                      {isMe ? "You" : msg.senderRole}
                    </span>
                    <span className="text-[9px] text-slate-300">•</span>
                    <span className="text-[9px] text-slate-300">
                      {msg.createdAt instanceof Timestamp 
                        ? format(msg.createdAt.toDate(), "HH:mm") 
                        : msg.createdAt instanceof Date 
                          ? format(msg.createdAt, "HH:mm")
                          : "Sending..."}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-slate-400 italic text-xs">
              No communications recorded for this log.
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 bg-slate-50 border-t space-y-3">
        <div className="flex gap-2">
          <Input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="rounded-xl border-slate-200 focus:border-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(false)}
          />
          <Button 
            size="icon" 
            className="rounded-xl shrink-0 h-10 w-10"
            onClick={() => handleSendMessage(false)}
            disabled={!inputText.trim() || isUserLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {currentUserRole !== 'user' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full rounded-xl border-dashed border-amber-300 text-amber-700 hover:bg-amber-50 h-9 gap-2 text-[11px] font-bold"
            onClick={() => handleSendMessage(true)}
            disabled={!inputText.trim() || isUserLoading}
          >
            <ShieldAlert className="h-3 w-3" />
            Send as Official Query
          </Button>
        )}
      </div>
    </div>
  );
}
