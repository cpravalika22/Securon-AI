
"use client"

import { useState, useMemo, useEffect } from "react"
import { Shield, Clock, CheckCircle2, Building2, FileText, ChevronDown, Plus, LayoutDashboard, Star, Settings, Bell, LogOut, ArrowUpRight, Loader2, Timer, Search, BrainCircuit, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pie, PieChart, Cell, ResponsiveContainer, Label } from "recharts"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/firebase"
import { ChatPanel } from "@/components/chat-panel"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

// Helper for live countdown
function getTimeRemaining(createdAt: string) {
  const deadline = new Date(createdAt).getTime() + (48 * 60 * 60 * 1000);
  const now = new Date().getTime();
  const diff = deadline - now;

  if (diff <= 0) return { label: "Overdue", color: "red", expired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const color = hours < 12 ? "orange" : "green";
  return { label: `${hours}h ${minutes}m ${seconds}s left`, color, expired: false };
}

const INITIAL_MOCK_DATA = [
  {
    id: "CMP-4401",
    description: "General verbal dispute reported in the library regarding seating priority. Anonymous report.",
    status: "Submitted",
    assignedRole: "mentor",
    organization: "SYSTEM",
    priority: "low",
    riskLevel: "Low",
    category: "Other",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: "user5",
    tags: ["Verbal", "Library"]
  },
  {
    id: "CMP-4402",
    description: "Targeted exclusion and bullying from student project groups reported by a freshman student.",
    status: "Under Review",
    assignedRole: "mentor",
    organization: "SYSTEM",
    priority: "medium",
    riskLevel: "Medium",
    category: "Bullying",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    userId: "user6",
    tags: ["Social", "Bullying"]
  },
  {
    id: "CMP-4403",
    description: "Resolved: Dispute over gender-neutral restroom access in the main auditorium. Management issued new signage.",
    status: "Resolved",
    assignedRole: "mentor",
    organization: "SYSTEM",
    priority: "low",
    riskLevel: "Low",
    category: "Other",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    userId: "user30",
    tags: ["Facilities", "Resolved"]
  },
  {
    id: "CMP-4404",
    description: "Inappropriate remarks regarding gender identity during a freshman orientation session.",
    status: "Submitted",
    assignedRole: "mentor",
    organization: "SYSTEM",
    priority: "medium",
    riskLevel: "Medium",
    category: "Harassment",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    userId: "user31",
    tags: ["Orientation", "Identity"]
  }
];

export default function MentorDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  
  const [session, setSession] = useState<{ role: string; organization: string; name: string } | null>(null)
  const [selectedCase, setSelectedCase] = useState<any | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [complaints, setComplaints] = useState<any[]>(INITIAL_MOCK_DATA)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sessionData = localStorage.getItem("mockSession")
    if (sessionData) {
      const parsed = JSON.parse(sessionData)
      if (parsed.role !== "mentor") {
        router.push(`/dashboard/${parsed.role}`)
      } else {
        setSession(parsed)
        setComplaints(INITIAL_MOCK_DATA.map(c => ({ ...c, organization: parsed.organization })))
        setTimeout(() => setIsDataLoading(false), 800)
      }
    } else if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [router, user, isUserLoading])

  const stats = useMemo(() => {
    const relevant = complaints.filter(c => c.assignedRole === "mentor")
    return {
      pending: relevant.filter(c => c.status === "Submitted").length,
      inProgress: relevant.filter(c => c.status === "Under Review").length,
      resolved: relevant.filter(c => c.status === "Resolved").length,
      total: relevant.length
    }
  }, [complaints])

  const chartData = useMemo(() => [
    { name: "Pending", value: stats.pending, fill: "#ff7c7c" },
    { name: "In Progress", value: stats.inProgress, fill: "#5e5e9b" },
    { name: "Resolved", value: stats.resolved, fill: "#95b8a2" },
  ], [stats])

  const handleEscalate = (report: any) => {
    setComplaints(prev => prev.map(c => 
      c.id === report.id 
        ? { ...c, assignedRole: "hod", riskLevel: "High", status: "Under Review" } 
        : c
    ))
    toast({
      title: "Escalation Successful",
      description: `Case ${report.id} has been escalated to the Head of Department.`,
    })
    setSelectedCase(null)
  }

  const handleResolve = (report: any) => {
    setComplaints(prev => prev.map(c => 
      c.id === report.id 
        ? { ...c, status: "Resolved" } 
        : c
    ))
    toast({
      title: "Case Resolved",
      description: `Incident ${report.id} has been marked as resolved.`,
    })
    setSelectedCase(null)
  }

  if (isUserLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Establishing Secure Authority...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      {/* Sidebar */}
      <aside className="w-72 dashboard-sidebar text-white flex flex-col p-8 space-y-10">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">SECURON</span>
        </div>

        <div className="flex flex-col items-center py-6 space-y-3">
          <Avatar className="h-20 w-20 ring-4 ring-white/10">
            <AvatarImage src={`https://picsum.photos/seed/${session.name}/200`} />
            <AvatarFallback>{session.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="font-bold text-lg">{session.name}</h3>
            <p className="text-xs text-white/50 uppercase tracking-widest">{session.role} Assistant</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="#" className="flex items-center gap-4 px-4 py-3 bg-white/10 rounded-2xl transition-all">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <Star className="h-5 w-5" />
            <span className="font-medium">Pinned</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto space-y-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline font-bold">Overview</h1>
            <Badge className="bg-[#5e5e9b] text-white border-none px-3 py-1 rounded-full text-[10px] font-black">
              {stats.total} ASSIGNED
            </Badge>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search assigned cases..." className="pl-11 h-12 w-64 rounded-2xl bg-white border-none shadow-sm" />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm h-12 w-12 text-slate-400">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm h-12 w-12 text-slate-400" asChild>
                <Link href="/"><LogOut className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <h2 className="text-5xl font-headline font-black leading-tight">
            Manage incident <br /> folders
          </h2>
          <p className="text-slate-400 text-lg">
            Guiding resolution and safety protocols <br /> for {session.organization} reports.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <Card className="lg:col-span-4 border-none shadow-xl rounded-[3rem] p-10 bg-white">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Case Status</h3>
              <div className="h-8 w-8 text-slate-300">
                <Plus className="h-5 w-5" />
              </div>
            </div>
            <div className="aspect-square relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} cornerRadius={10} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-slate-800 text-4xl font-black"
                              >
                                {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-8 border-none shadow-xl rounded-[3rem] p-10 bg-white">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Recent Assignments</h3>
              <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-6">
              {isDataLoading ? (
                 <div className="py-20 text-center text-slate-400 italic flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    Securely retrieving assignments...
                 </div>
              ) : complaints.filter(c => c.assignedRole === "mentor").length === 0 ? (
                <div className="py-20 text-center text-slate-400 italic">No assignments found.</div>
              ) : (
                complaints.filter(c => c.assignedRole === "mentor").map((item) => {
                  const timer = getTimeRemaining(item.createdAt);
                  return (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-3xl transition-colors group cursor-pointer"
                      onClick={() => setSelectedCase(item)}
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "p-4 rounded-[1.5rem] text-white shadow-lg",
                          item.riskLevel === 'Medium' ? 'bg-yellow-500' : 
                          item.status === 'Resolved' ? 'bg-[#95b8a2]' : 'bg-green-500'
                        )}>
                          <FileText className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-lg group-hover:text-slate-900 transition-colors">
                            {item.description.length > 35 ? item.description.substring(0, 35) + "..." : item.description}
                          </h4>
                          <div className="flex items-center gap-3">
                            <Badge className={cn(
                              "text-[9px] font-bold border-none px-2 py-0.5",
                              item.riskLevel === 'Medium' ? "bg-yellow-500 text-black" : "bg-green-500 text-white"
                            )}>
                              {item.riskLevel} Risk
                            </Badge>

                            {item.status !== "Resolved" && (
                              <Badge variant="outline" className={cn(
                                "rounded-full px-2 py-0 text-[9px] font-bold border-2 transition-all duration-300",
                                timer.color === "red" ? "border-red-200 text-red-600 bg-red-50 animate-pulse" :
                                timer.color === "orange" ? "border-orange-200 text-orange-600 bg-orange-50" :
                                "border-green-200 text-green-600 bg-green-50"
                              )}>
                                <Timer className="h-3 w-3 mr-1" />
                                {timer.label}
                              </Badge>
                            )}
                            {item.status === "Resolved" && (
                              <Badge className="bg-[#95b8a2] text-white text-[9px] font-bold border-none">
                                Resolved
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <p className="text-sm font-bold text-slate-800">{item.createdAt ? format(new Date(item.createdAt), "MMM d") : "Unknown"}</p>
                        <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[10px] font-black uppercase border-slate-200">
                          {item.id}
                        </Badge>
                        {item.status !== "Resolved" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 px-2 text-[9px] font-black uppercase text-primary hover:bg-primary/5 rounded-xl border border-primary/10 mt-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCase(item);
                              setIsChatOpen(true);
                            }}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Ask query
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Case Details Dialog */}
        <Dialog open={!!selectedCase} onOpenChange={(open) => {
          if (!open) {
            setSelectedCase(null);
            setIsChatOpen(false);
          }
        }}>
          <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
            {selectedCase && (
              <div className="flex flex-col h-[90vh]">
                <div className="bg-[#5e5e9b] p-8 text-white relative shrink-0">
                  <div className="absolute top-8 right-8 opacity-20">
                    <BrainCircuit className="h-20 w-20" />
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-white/20 text-white border-none mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      AI Analysis: {selectedCase.category}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="bg-white/10 text-white rounded-full h-8 px-4 font-bold text-xs"
                      onClick={() => setIsChatOpen(!isChatOpen)}
                    >
                      <MessageSquare className="h-3 w-3 mr-2" />
                      {isChatOpen ? "View Report" : "Ask query"}
                    </Button>
                  </div>
                  <DialogTitle className="text-3xl font-headline font-bold">
                    Incident {selectedCase.id}
                  </DialogTitle>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                  {isChatOpen ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                      <ChatPanel 
                        userId={selectedCase.userId} 
                        complaintId={selectedCase.id} 
                        currentUserRole="mentor" 
                      />
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</p>
                          <Badge className={cn(
                            "rounded-lg px-3 py-1 font-bold",
                            selectedCase.riskLevel === 'Medium' ? "bg-yellow-500" : "bg-green-500"
                          )}>
                            {selectedCase.riskLevel}
                          </Badge>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                          <Badge className="bg-[#5e5e9b]/10 text-[#5e5e9b] border-none px-3 py-1 rounded-lg font-bold uppercase">
                            {selectedCase.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <FileText className="h-5 w-5 text-primary" />
                          Reported Incident Description
                        </div>
                        <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 italic text-slate-600 leading-relaxed">
                          "{selectedCase.description}"
                        </div>
                      </div>

                      <div className="pt-6 border-t flex flex-col gap-3">
                        <div className="flex gap-3">
                          <Button 
                            className="flex-1 h-14 rounded-2xl font-bold bg-[#95b8a2] hover:bg-[#84a791] text-white"
                            onClick={() => handleResolve(selectedCase)}
                            disabled={selectedCase.status === 'Resolved'}
                          >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Resolve Incident
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 h-14 rounded-2xl font-bold border-2 border-[#ff7c7c] text-[#ff7c7c] hover:bg-red-50"
                            onClick={() => handleEscalate(selectedCase)}
                            disabled={selectedCase.status === 'Resolved'}
                          >
                            <ArrowUpRight className="mr-2 h-5 w-5" />
                            Escalate to HOD
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
