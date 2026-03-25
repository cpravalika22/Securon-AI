
/**
 * @fileOverview User activity page with session-based clearing, translation, and Chat.
 */

"use client"

import { useState, useMemo, useEffect } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase, useAuth } from "@/firebase"
import { collection, query, orderBy, doc, where, onSnapshot } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { Shield, ChevronLeft, Clock, AlertCircle, Building, Hash, Tag, UserMinus, FileText, Lock, EyeOff, AlertTriangle, ShieldCheck, History, MessageSquareQuote, Send, Star, Info, User, MessageSquare } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { updateDocumentNonBlocking } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { ChatPanel } from "@/components/chat-panel"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

/**
 * A real-time notification badge that monitors a specific complaint for queries from authorities.
 */
function QueryBadge({ userId, complaintId }: { userId: string, complaintId: string }) {
  const firestore = useFirestore();
  const [queryCount, setQueryCount] = useState(0);

  useEffect(() => {
    if (!firestore || !userId || !complaintId) return;
    
    // Listen for messages marked as queries in this specific complaint thread
    const q = query(
      collection(firestore, "users", userId, "complaints", complaintId, "messages"),
      where("isQuery", "==", true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQueryCount(snapshot.size);
    }, (error) => {
      // Silently fail for permissions if the listener is too early
      console.warn("Query notification listener restricted.");
    });

    return () => unsubscribe();
  }, [firestore, userId, complaintId]);

  if (queryCount === 0) return null;

  return (
    <Badge className="bg-amber-500 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse shadow-lg border-none flex items-center gap-1.5">
      <AlertCircle className="h-3 w-3" />
      {queryCount} NEW {queryCount === 1 ? 'QUERY' : 'QUERIES'}
    </Badge>
  );
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()

  const [feedbackReport, setFeedbackReport] = useState<any | null>(null)
  const [activeChatReport, setActiveChatReport] = useState<any | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [demoFeedback, setDemoFeedback] = useState<string | null>(null)

  // Clear session data on refresh to protect identity as requested
  useEffect(() => {
    signOut(auth);
  }, [auth]);

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null
    return query(
      collection(firestore, "users", user.uid, "complaints"),
      orderBy("createdAt", "desc")
    )
  }, [firestore, user])

  const { data: realReports, isLoading: isReportsLoading } = useCollection(reportsQuery)

  const displayReports = useMemo(() => {
    const demoInProgress = {
      id: "DEMO-8842",
      status: "Under Review",
      priority: "high",
      organization: "TECH CAMPUS",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      description: "This is an active follow-up regarding cyber-stalking incidents on the campus network. Authorities are currently auditing access logs to identify the origin of anonymous threats.",
      personDetails: "Anonymous User (Under Audit)",
      assignedRole: "safety",
      tags: ["Cyber", "Stalking", "Privacy"],
      feedback: "",
      isDemo: true,
      userId: user?.uid || "anonymous"
    }

    const demoResolved = {
      id: "DEMO-7721",
      status: "Resolved",
      priority: "medium",
      organization: "COLLEGE DEMO",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      description: "This is a sample resolved harassment report to demonstrate the feedback loop. The case involved inappropriate classroom remarks which were mediated successfully.",
      personDetails: "Faculty Member (Restricted)",
      assignedRole: "mentor",
      tags: ["Classroom", "Mediation"],
      feedback: demoFeedback || "",
      isDemo: true,
      userId: user?.uid || "anonymous"
    }

    const demos = [demoInProgress, demoResolved];

    if (!realReports || realReports.length === 0) return demos;
    return [...demos, ...realReports];
  }, [realReports, demoFeedback, user]);

  const handleFeedbackSubmit = () => {
    if (!feedbackReport || !feedbackText.trim()) return

    if (feedbackReport.isDemo) {
      setDemoFeedback(feedbackText.trim())
      toast({
        title: "Feedback Recorded (Demo)",
        description: "Your feedback on the demo case has been simulated successfully.",
      })
    } else if (user && firestore) {
      const reportRef = doc(firestore, "users", user.uid, "complaints", feedbackReport.id)
      updateDocumentNonBlocking(reportRef, {
        feedback: feedbackText.trim()
      })
      toast({
        title: "Feedback Submitted",
        description: "Thank you. Your feedback helps us improve our safety standards.",
      })
    }

    setFeedbackReport(null)
    setFeedbackText("")
  }

  if (isUserLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-6">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b">
        <div className="container max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-headline font-bold text-primary">{t('activity_title')}</h1>
                <Badge variant="outline" className="text-[10px] gap-1 px-2 py-0 h-5 bg-green-50 text-green-600 border-green-200">
                  <Lock className="h-2.5 w-2.5" />
                  {t('activity_private')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{t('activity_sub')}</p>
            </div>
          </div>
          <div className="bg-primary/10 p-2.5 rounded-2xl">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto py-10 px-6">
        <div className="grid gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 mb-2">
            <EyeOff className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs text-blue-700 leading-relaxed font-bold">
                Privacy Protocol Active
              </p>
              <p className="text-[11px] text-blue-600/80 leading-relaxed">
                Your activity log is cleared automatically on refresh. Below are sample cases showing how resolutions and active audits are tracked.
              </p>
            </div>
          </div>

          {isReportsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />)}
            </div>
          ) : (
            displayReports.map((report) => (
              <Card key={report.id} className={cn(
                "border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white",
                report.isDemo && "border-2 border-dashed border-primary/20"
              )}>
                <CardHeader className="flex flex-row items-start justify-between pb-4">
                  <div className="space-y-3 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn(
                          "rounded-lg px-4 py-1.5 border-none font-black text-[10px] uppercase tracking-wider",
                          report.status === "Resolved" ? "bg-green-100 text-green-700" : 
                          report.status === "Under Review" ? "bg-amber-100 text-amber-700" :
                          "bg-primary/10 text-primary"
                        )}>
                          <History className="h-3 w-3 mr-1.5 inline" />
                          {t('status')}: {report.status}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          "rounded-lg px-3 py-1 uppercase text-[10px] font-bold gap-1",
                          report.priority === "high" ? "border-destructive text-destructive bg-destructive/5" :
                          report.priority === "medium" ? "border-amber-500 text-amber-600 bg-amber-50" :
                          "border-slate-200 text-slate-500 bg-slate-50"
                        )}>
                          <AlertTriangle className="h-3 w-3" />
                          {report.priority.toUpperCase()} {t('priority')}
                        </Badge>
                      </div>
                      
                      {!report.isDemo && report.userId && (
                        <QueryBadge userId={report.userId} complaintId={report.id} />
                      )}
                    </div>
                    
                    <CardTitle className="text-2xl font-headline font-bold pt-1 flex items-center gap-2">
                      <Building className="h-6 w-6 text-primary/40" />
                      {report.organization} Log
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Log Generated: {report.createdAt ? format(new Date(report.createdAt), "PPP p") : "Date unknown"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-2 relative overflow-hidden group">
                      <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Lock className="h-10 w-10 text-primary" />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                        <UserMinus className="h-3.5 w-3.5" />
                        {t('field_involved')}
                      </div>
                      <p className="text-slate-800 text-sm md:text-base font-semibold pr-12">
                        {report.personDetails || "Restricted"}
                      </p>
                    </div>

                    <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <FileText className="h-3.5 w-3.5" />
                        {t('field_log')}
                      </div>
                      <p className="text-slate-600 leading-relaxed italic text-sm md:text-base">
                        "{report.description}"
                      </p>
                    </div>
                  </div>

                  {report.tags && report.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {report.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="bg-white border border-slate-100 text-slate-500 text-[10px] rounded-lg px-3 py-1 font-bold flex items-center gap-1.5 shadow-sm">
                          <Tag className="h-3 w-3 text-primary/40" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <Button 
                      onClick={() => setActiveChatReport(report)}
                      variant="outline" 
                      className="w-full h-12 rounded-2xl gap-2 font-bold text-sm shadow-sm hover:bg-slate-50"
                    >
                      <MessageSquare className="h-4 w-4" />
                      View Discussion
                    </Button>
                    {report.status === "Resolved" && !report.feedback && (
                      <Button 
                        onClick={() => setFeedbackReport(report)}
                        variant="outline" 
                        className="w-full h-12 rounded-2xl border-green-200 text-green-600 hover:bg-green-50 gap-2 font-bold text-sm shadow-sm"
                      >
                        <MessageSquareQuote className="h-4 w-4" />
                        {t('btn_feedback')}
                      </Button>
                    )}
                    {report.feedback && (
                      <div className="md:col-span-2 bg-green-50/50 p-4 rounded-xl border border-green-100 text-xs text-slate-600 italic">
                        Feedback shared: "{report.feedback}"
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Building className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Institution</p>
                        <p className="font-bold text-sm text-slate-700">{report.organization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <ShieldCheck className="h-5 w-5 text-[#5e5e9b]" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Authority Track</p>
                        <p className="capitalize font-bold text-sm text-slate-700">
                          {report.status === "Resolved" ? "Resolution Finalized" : `Assigned to ${report.assignedRole}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border">
                      <Hash className="h-3 w-3" />
                      REF: {report.id}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {!realReports && !isReportsLoading && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground italic">No active session reports found. Real data is cleared on refresh for your safety.</p>
            </div>
          )}
        </div>
      </main>

      {/* Chat Dialog */}
      <Dialog open={!!activeChatReport} onOpenChange={(open) => !open && setActiveChatReport(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {activeChatReport && (
            <div className="flex flex-col h-[70vh]">
              <div className="bg-primary p-6 text-white shrink-0">
                <DialogTitle className="text-xl font-headline font-bold">Secure Discussion</DialogTitle>
                <DialogDescription className="text-primary-foreground/70 text-xs">
                  Protected thread for Log ID: {activeChatReport.id}
                </DialogDescription>
              </div>
              <div className="flex-1 overflow-hidden p-6 bg-slate-50">
                <ChatPanel 
                  userId={activeChatReport.userId} 
                  complaintId={activeChatReport.id} 
                  currentUserRole="user" 
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={!!feedbackReport} onOpenChange={(open) => !open && setFeedbackReport(null)}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {feedbackReport && (
            <>
              <div className="bg-green-600 p-8 text-white relative">
                <div className="absolute top-6 right-6 opacity-20">
                  <MessageSquareQuote className="h-16 w-16" />
                </div>
                <DialogTitle className="text-2xl font-headline font-bold mb-2">{t('feedback_title')}</DialogTitle>
                <DialogDescription className="text-green-100 text-sm">
                  Log ID: <strong>{feedbackReport.id}</strong>
                </DialogDescription>
              </div>
              <div className="p-8 space-y-6 bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    How was the process?
                  </div>
                  <Textarea 
                    placeholder="Tell us about the resolution..." 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="min-h-[120px] rounded-2xl border-2 focus:border-green-600 bg-slate-50"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleFeedbackSubmit}
                    disabled={!feedbackText.trim()}
                    className="h-14 rounded-2xl font-black text-lg bg-green-600 hover:bg-green-700"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Submit Feedback
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setFeedbackReport(null)}
                    className="h-12 rounded-xl text-slate-400"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
