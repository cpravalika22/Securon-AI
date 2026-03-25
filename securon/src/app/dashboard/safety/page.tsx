
"use client"

import { useState, useMemo, useEffect } from "react"
import { Shield, Search, Bell, LogOut, Plus, LayoutDashboard, Activity, Settings, FileText, ChevronDown, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, Award, Loader2, Timer, Clock, PieChart as PieChartIcon, MessageSquare, History, Brain, BarChart3, LineChart as LineChartIcon, Users2, Building2, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pie, PieChart, Cell, ResponsiveContainer, Label, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend } from "recharts"
import { format, subDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/firebase"
import { ChatPanel } from "@/components/chat-panel"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Helper for live countdown
function getTimeRemaining(createdAt: string) {
  const deadline = new Date(createdAt).getTime() + (48 * 60 * 60 * 1000); // 48 hours SLA
  const now = new Date().getTime();
  const diff = deadline - now;

  if (diff <= 0) return { label: "Overdue", color: "red", expired: true };

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const color = hours < 12 ? "orange" : "green";
  return { label: `${hours}h ${minutes}m ${seconds}s left`, color, expired: false };
}

const EMERGENCY_KEYWORDS = ["assault", "recording", "harassment", "catcalling", "wing", "hostel", "forced", "humiliating", "slurs", "doxxing", "lesbian", "gay", "trans", "lgbtq"];

/**
 * RESTRICTED DISCUSSION IDS:
 * Only these 4 specific IDs will have "View Discussion" access to demonstrate practical chats.
 */
const DISCUSSION_HISTORY_IDS = ["GLO-9901", "GLO-9904", "GLO-9905", "GLO-9908"];

const INITIAL_MOCK_DATA = [
  {
    id: "GLO-9901",
    description: "Serious physical assault incident involving gender-based slurs. Immediate police coordination requested.",
    status: "Under Review",
    assignedRole: "safety",
    organization: "SYSTEM",
    priority: "high",
    riskLevel: "Critical",
    category: "Threat",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    userId: "user8",
    tags: ["Physical", "Police"],
    anomalyScore: 12,
    isSuspicious: false
  },
  {
    id: "GLO-9904",
    description: "Persistent stalking of a female student after library hours. Subject followed reporter to their vehicle.",
    status: "Submitted",
    assignedRole: "safety",
    priority: "high",
    riskLevel: "High",
    category: "Harassment",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: "user11",
    tags: ["Physical", "Stalking", "Library"],
    anomalyScore: 45,
    isSuspicious: false
  },
  {
    id: "GLO-9905",
    description: "Emergency: Unauthorized recording reported in common changing areas of the girls' gymnasium.",
    status: "Submitted",
    assignedRole: "safety",
    priority: "high",
    riskLevel: "Critical",
    category: "Privacy",
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    userId: "user12",
    tags: ["Cyber", "Emergency", "Privacy"],
    anomalyScore: 82,
    isSuspicious: true,
    anomalyType: "Frequency"
  },
  {
    id: "GLO-9906",
    description: "Targeted cyber-bullying and doxxing in a private college Discord server. Mentors are reviewing logs.",
    status: "Under Review",
    assignedRole: "mentor",
    priority: "medium",
    riskLevel: "High",
    category: "Harassment",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    userId: "user13",
    tags: ["Cyber", "Digital", "Bullying"],
    anomalyScore: 30,
    isSuspicious: false
  },
  {
    id: "GLO-9907",
    description: "Physical intimidation: Student cornered in an empty laboratory by a senior group during late-night study.",
    status: "Under Review",
    assignedRole: "safety",
    priority: "high",
    riskLevel: "Critical",
    category: "Abuse",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    userId: "user14",
    tags: ["Physical", "Night-shift"],
    anomalyScore: 15,
    isSuspicious: false
  },
  {
    id: "GLO-9908",
    description: "Discriminatory grading suspicion: Female students reporting lower grades compared to male peers for identical project work.",
    status: "Submitted",
    assignedRole: "hod",
    priority: "medium",
    riskLevel: "Medium",
    category: "Other",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    userId: "user15",
    tags: ["Verbal", "Academic", "Bias"],
    anomalyScore: 55,
    isSuspicious: false
  },
  {
    id: "GLO-9909",
    description: "Exclusion from Technical Fest: Core committee explicitly denying LGBTQ+ students leadership roles.",
    status: "Submitted",
    assignedRole: "hod",
    priority: "medium",
    riskLevel: "High",
    category: "Other",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    userId: "user16",
    tags: ["Verbal", "Social", "Exclusion"],
    anomalyScore: 10,
    isSuspicious: false
  },
  {
    id: "GLO-9910",
    description: "Vandalism of gender-neutral facility signs in the main auditorium. Security footage requested.",
    status: "Under Review",
    assignedRole: "safety",
    priority: "high",
    riskLevel: "High",
    category: "Threat",
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    userId: "user17",
    tags: ["Physical", "Facilities", "Vandalism"],
    anomalyScore: 20,
    isSuspicious: false
  },
  {
    id: "GLO-9911",
    description: "Harassment by lab assistant: Persistent unwanted proximity and suggestive comments during chemistry practicals.",
    status: "Under Review",
    assignedRole: "mentor",
    priority: "high",
    riskLevel: "High",
    category: "Harassment",
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    userId: "user18",
    tags: ["Physical", "Staff", "Harassment"],
    anomalyScore: 40,
    isSuspicious: false
  },
  {
    id: "GLO-9912",
    description: "Inappropriate remarks by faculty during a large lecture regarding 'gender suitability' for engineering.",
    status: "Submitted",
    assignedRole: "hod",
    priority: "medium",
    riskLevel: "Medium",
    category: "Other",
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    userId: "user19",
    tags: ["Verbal", "Faculty", "Bias"],
    anomalyScore: 5,
    isSuspicious: false
  },
  {
    id: "GLO-9918",
    description: "Suspicious activity: Identity of a past anonymous reporter was leaked in a department group chat.",
    status: "Under Review",
    assignedRole: "safety",
    priority: "high",
    riskLevel: "Critical",
    category: "Privacy",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    userId: "user25",
    tags: ["Cyber", "Privacy", "Leak"],
    anomalyScore: 91,
    isSuspicious: true,
    anomalyType: "Duplicate"
  },
  {
    id: "GLO-9920",
    description: "Resolved: Dispute over gender-inclusive housing preference in the South Wing hostel.",
    status: "Resolved",
    assignedRole: "safety",
    priority: "low",
    riskLevel: "Low",
    category: "Other",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    userId: "user26",
    tags: ["Verbal", "Resolved", "Housing"],
    anomalyScore: 0,
    isSuspicious: false
  },
  {
    id: "GLO-9921",
    description: "Resolved: Misgendering incident in the admin office handled via sensitivity training for staff.",
    status: "Resolved",
    assignedRole: "mentor",
    priority: "low",
    riskLevel: "Low",
    category: "Harassment",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    userId: "user27",
    tags: ["Verbal", "Admin", "Resolved"],
    anomalyScore: 0,
    isSuspicious: false
  },
  {
    id: "GLO-9922",
    description: "Resolved: Online harassment from an anonymous account on the college confession page was traced and blocked.",
    status: "Resolved",
    assignedRole: "safety",
    priority: "medium",
    riskLevel: "Medium",
    category: "Privacy",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    userId: "user28",
    tags: ["Cyber", "Online", "Resolved"],
    anomalyScore: 0,
    isSuspicious: false
  }
];

export default function SafetyDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, isUserLoading } = useUser()
  
  const [session, setSession] = useState<{ role: string; organization: string; name: string } | null>(null)
  const [selectedCase, setSelectedCase] = useState<any | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isAuditOpen, setIsAuditOpen] = useState(false)
  const [complaints, setComplaints] = useState<any[]>(INITIAL_MOCK_DATA)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [activeView, setActiveView] = useState<'command' | 'live-feed' | 'anomalies'>('command')
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const sessionData = localStorage.getItem("mockSession")
    if (sessionData) {
      const parsed = JSON.parse(sessionData)
      if (parsed.role !== "safety") {
        router.push(`/dashboard/${parsed.role}`)
      } else {
        setSession(parsed)
        setTimeout(() => setIsDataLoading(false), 800)
      }
    } else if (!isUserLoading && !user) {
      router.push("/")
    }
  }, [router, user, isUserLoading])

  const stats = useMemo(() => {
    return {
      pending: complaints.filter(c => c.status === "Submitted").length,
      inProgress: complaints.filter(c => c.status === "Under Review").length,
      resolved: complaints.filter(c => c.status === "Resolved").length,
      critical: complaints.filter(c => c.riskLevel === "Critical").length,
      anomalies: complaints.filter(c => c.isSuspicious).length,
      total: complaints.length
    }
  }, [complaints])

  const chartData = useMemo(() => [
    { name: "Pending", value: stats.pending, fill: "#ff7c7c" },
    { name: "In Progress", value: stats.inProgress, fill: "#5e5e9b" },
    { name: "Resolved", value: stats.resolved, fill: "#95b8a2" },
  ], [stats])

  const typeData = useMemo(() => {
    const verbal = complaints.filter(c => c.tags.some(t => t === 'Verbal')).length;
    const physical = complaints.filter(c => c.tags.some(t => t === 'Physical')).length;
    const cyber = complaints.filter(c => c.tags.some(t => t === 'Cyber' || t === 'Digital' || t === 'Online')).length;
    
    return [
      { name: 'Physical', count: physical, fill: '#ff7c7c' },
      { name: 'Verbal', count: verbal, fill: '#f59e0b' },
      { name: 'Cyber', count: cyber, fill: '#5e5e9b' },
    ];
  }, [complaints]);

  const lineData = useMemo(() => {
    const days = timeRange === 'week' ? 7 : 30;
    const data = [];
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        name: format(date, days === 7 ? "EEE" : "MMM d"),
        cs: Math.floor(Math.random() * 5),
        mech: Math.floor(Math.random() * 3),
        admin: Math.floor(Math.random() * 2),
      });
    }
    return data;
  }, [timeRange]);

  const importantFeed = useMemo(() => {
    return complaints.filter(c => {
      if (c.status === 'Resolved') return false;
      const isHighRisk = c.riskLevel === 'Critical' || c.riskLevel === 'High';
      const timer = getTimeRemaining(c.createdAt);
      const isOverdue = timer.expired;
      const isEmergency = EMERGENCY_KEYWORDS.some(word => c.description.toLowerCase().includes(word));
      return isHighRisk || isOverdue || isEmergency;
    });
  }, [complaints, tick]);

  const anomalyFeed = useMemo(() => {
    return complaints.filter(c => c.isSuspicious);
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    if (riskFilter === 'all') return complaints;
    return complaints.filter(c => c.riskLevel === riskFilter);
  }, [complaints, riskFilter]);

  const handleResolve = (report: any) => {
    setComplaints(prev => prev.map(c => 
      c.id === report.id ? { ...c, status: "Resolved" } : c
    ))
    toast({
      title: "Global Resolution Issued",
      description: `Case ${report.id} has been resolved by the Global Safety Cell.`,
    })
    setSelectedCase(null)
  }

  const AUTHORITY_AUDIT = [
    { role: "Mentors", count: 12, resolved: 86, efficiency: "94%", icon: Users2, color: "bg-blue-100 text-blue-600" },
    { role: "HODs", count: 4, resolved: 42, efficiency: "88%", icon: Building2, color: "bg-indigo-100 text-indigo-600" },
    { role: "Safety Cell", count: 3, resolved: 18, efficiency: "96%", icon: Shield, color: "bg-slate-100 text-slate-800" },
  ]

  if (isUserLoading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Global Safety Stream...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
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
            <p className="text-xs text-white/50 uppercase tracking-widest">Global Safety Lead</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('command')}
            className={cn(
              "w-full justify-start gap-4 px-4 py-6 rounded-2xl transition-all",
              activeView === 'command' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Command</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('live-feed')}
            className={cn(
              "w-full justify-start gap-4 px-4 py-6 rounded-2xl transition-all relative",
              activeView === 'live-feed' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Activity className="h-5 w-5" />
            <span className="font-medium">Live Feed</span>
            {importantFeed.length > 0 && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView('anomalies')}
            className={cn(
              "w-full justify-start gap-4 px-4 py-6 rounded-2xl transition-all relative",
              activeView === 'anomalies' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <Brain className="h-5 w-5" />
            <span className="font-medium">Anomalies</span>
            {stats.anomalies > 0 && (
              <Badge className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-500 text-white text-[10px] rounded-full px-1.5 min-w-[20px] h-5 flex items-center justify-center">
                {stats.anomalies}
              </Badge>
            )}
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto space-y-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline font-bold">
              {activeView === 'command' ? 'Safety Hub' : activeView === 'live-feed' ? 'Important Live Feed' : 'Behavioral Anomaly Monitor'}
            </h1>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Filter global stream..." className="pl-11 h-12 w-64 rounded-2xl bg-white border-none shadow-sm" />
            </div>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => setIsAuditOpen(true)}
                className="h-12 px-6 rounded-2xl bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold shadow-sm flex items-center gap-2"
              >
                <Award className="h-5 w-5 text-indigo-500" />
                Authority Audit
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm h-12 w-12 text-slate-400">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm h-12 w-12 text-slate-400" asChild>
                <Link href="/"><LogOut className="h-5 w-5" /></Link>
              </Button>
            </div>
          </div>
        </header>

        {activeView === 'command' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4 space-y-6">
                <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white flex flex-col items-center justify-center space-y-1 text-center">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-600 mb-1">
                    <FileText className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reports</p>
                  <h2 className="text-4xl font-headline font-black">{stats.total}</h2>
                </Card>
                <Card className="p-8 rounded-[2rem] border-none shadow-sm bg-white flex flex-col items-center justify-center space-y-1 text-center">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-600 mb-1">
                    <Brain className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Behavioral Alerts</p>
                  <h2 className="text-4xl font-headline font-black text-amber-600">{stats.anomalies}</h2>
                </Card>
              </div>

              <Card className="lg:col-span-4 border-none shadow-xl rounded-[3rem] p-10 bg-white">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Global Status</h3>
                  <div className="h-8 w-8 text-slate-300">
                    <PieChartIcon className="h-5 w-5" />
                  </div>
                </div>
                <div className="aspect-square relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} cornerRadius={10} />)}
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-slate-800 text-3xl font-black">
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

              <Card className="lg:col-span-4 border-none shadow-xl rounded-[3rem] p-10 bg-white">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold">Incident Types</h3>
                  <div className="h-8 w-8 text-slate-300">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
                <div className="aspect-square relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                      />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="count" 
                        radius={[6, 6, 0, 0]} 
                        barSize={30}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Department Trend Line Chart */}
            <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <LineChartIcon className="h-5 w-5" />
                    </div>
                    <h3 className="text-2xl font-bold">Departmental Trends</h3>
                  </div>
                  <p className="text-sm text-slate-400">Activity monitoring across primary institutional sectors</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <Select value={timeRange} onValueChange={(val: any) => setTimeRange(val)}>
                    <SelectTrigger className="w-[160px] h-10 border-none bg-white shadow-sm rounded-xl font-bold text-xs">
                      <SelectValue placeholder="Select Range" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="week" className="rounded-lg font-medium">Last 7 Days</SelectItem>
                      <SelectItem value="month" className="rounded-lg font-medium">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cs" 
                      name="Computer Science"
                      stroke="#5e5e9b" 
                      strokeWidth={4} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mech" 
                      name="Mechanical"
                      stroke="#ff7c7c" 
                      strokeWidth={4} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="admin" 
                      name="Admin"
                      stroke="#f59e0b" 
                      strokeWidth={4} 
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold">Global Oversight Monitor</h3>
                  <p className="text-sm text-slate-400">Monitoring gender-diversity reports across all departments.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 px-3 text-slate-400">
                    <Filter className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
                  </div>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-[180px] h-10 border-none bg-white shadow-sm rounded-xl font-bold text-xs">
                      <SelectValue placeholder="Risk Level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl">
                      <SelectItem value="all" className="rounded-lg font-medium">All Risk Levels</SelectItem>
                      <SelectItem value="Critical" className="rounded-lg font-medium text-red-600">Critical Risk</SelectItem>
                      <SelectItem value="High" className="rounded-lg font-medium text-orange-600">High Risk</SelectItem>
                      <SelectItem value="Medium" className="rounded-lg font-medium text-amber-600">Moderate Risk</SelectItem>
                      <SelectItem value="Low" className="rounded-lg font-medium text-green-600">Low Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredComplaints.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-400 italic">
                    No incidents match the selected risk filter.
                  </div>
                ) : (
                  filteredComplaints.map((item) => {
                    const timer = getTimeRemaining(item.createdAt);
                    return (
                      <div 
                        key={item.id} 
                        className="flex flex-col justify-between p-6 bg-slate-50/50 hover:bg-white hover:shadow-lg rounded-[2.5rem] transition-all group cursor-pointer border border-transparent hover:border-slate-100"
                        onClick={() => setSelectedCase(item)}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge className={cn(
                              "text-[9px] font-bold border-none px-2 py-0.5",
                              item.riskLevel === 'Critical' ? "bg-red-500 text-white" : 
                              item.riskLevel === 'High' ? "bg-orange-500 text-white" : "bg-yellow-500 text-black"
                            )}>
                              {item.riskLevel} Risk
                            </Badge>
                            <div className="flex gap-1">
                              {item.isSuspicious && (
                                <Badge className="bg-amber-500 text-white text-[9px] border-none px-2 py-0.5">
                                  <Brain className="h-2.5 w-2.5 mr-1" /> Flag
                                </Badge>
                              )}
                              {DISCUSSION_HISTORY_IDS.includes(item.id) && (
                                <Badge variant="outline" className="border-primary text-primary text-[9px] border px-2 py-0.5">
                                  <MessageSquare className="h-2.5 w-2.5 mr-1" /> Discuss
                                </Badge>
                              )}
                            </div>
                          </div>
                          <h4 className="font-black text-lg line-clamp-2 leading-tight">{item.description}</h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[8px] uppercase font-bold text-slate-400">Role: {item.assignedRole}</Badge>
                            {item.status === 'Resolved' && <Badge className="bg-green-100 text-green-700 text-[8px] font-bold border-none px-2 py-0">Resolved</Badge>}
                            
                            {item.status !== 'Resolved' && (
                              <Badge variant="outline" className={cn(
                                "rounded-full px-2 py-0 text-[8px] font-bold border-2",
                                timer.color === "red" ? "border-red-200 text-red-600 bg-red-50" : "border-slate-200 text-slate-500"
                              )}>
                                {timer.label}
                              </Badge>
                            )}

                            {DISCUSSION_HISTORY_IDS.includes(item.id) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 px-2 text-[8px] font-black uppercase text-primary hover:bg-primary/5 rounded-lg border border-primary/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedCase(item);
                                  setIsChatOpen(true);
                                }}
                              >
                                <MessageSquare className="h-2.5 w-2.5 mr-1" />
                                View Discussion
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="pt-6 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                          <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                            {format(new Date(item.createdAt), "MMM d, HH:mm")}
                          </div>
                          <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-black border-slate-200">
                            {item.id}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </>
        ) : activeView === 'live-feed' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {importantFeed.map((item) => (
              <Card 
                key={item.id} 
                onClick={() => setSelectedCase(item)}
                className="border-none shadow-xl rounded-[2.5rem] p-8 hover:shadow-2xl transition-all cursor-pointer bg-white border-l-8 border-l-red-500"
              >
                <div className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-2">
                      <Badge className="bg-red-600 text-white font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-widest">
                        🔴 Critical Alert
                      </Badge>
                    </div>
                    {item.isSuspicious && (
                      <Badge className="bg-amber-500 text-white text-[10px] font-black rounded-full px-3 py-1">
                        AI FLAG: {item.anomalyType}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-xl font-bold leading-tight">{item.description}</h4>
                  <div className="pt-6 border-t flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://picsum.photos/seed/${item.id}/40`} />
                        <AvatarFallback>?</AvatarFallback>
                      </Avatar>
                      <span className="text-[10px] font-black uppercase text-slate-500">Identity Secured</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary font-black uppercase text-[10px]">
                      View Log
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-4">
              <div className="p-3 rounded-2xl text-amber-600">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900">Behavioral Intelligence Active</h3>
                <p className="text-sm text-amber-700">Displaying reports that trigger AI flags for frequency bursts or text similarity.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {anomalyFeed.map((item) => (
                <Card 
                  key={item.id} 
                  onClick={() => setSelectedCase(item)}
                  className="border-none shadow-xl rounded-[2.5rem] p-8 hover:shadow-2xl transition-all cursor-pointer bg-white border-l-8 border-l-amber-500"
                >
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] px-3 py-1 rounded-full uppercase">
                        {item.anomalyType} Detection
                      </Badge>
                      <div className="text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Suspicion Score</p>
                        <p className="text-lg font-black text-amber-600">{item.anomalyScore}%</p>
                      </div>
                    </div>
                    <p className="text-slate-600 italic">"{item.description}"</p>
                    <div className="pt-6 border-t flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-black border-slate-200">
                        USER: {item.userId.substring(0, 8)}
                      </Badge>
                      <Button className="h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs">
                        Audit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Dialog open={!!selectedCase} onOpenChange={(open) => {
          if (!open) {
            setSelectedCase(null);
            setIsChatOpen(false);
          }
        }}>
          <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
            {selectedCase && (
              <div className="flex flex-col h-[90vh]">
                <div className={cn(
                  "p-8 text-white relative shrink-0",
                  selectedCase.isSuspicious ? 'bg-amber-600' : 
                  selectedCase.riskLevel === 'Critical' ? 'bg-red-600' : 'bg-slate-800'
                )}>
                  <div className="absolute top-8 right-8 opacity-20">
                    {selectedCase.isSuspicious ? <Brain className="h-20 w-20" /> : <ShieldAlert className="h-20 w-20" />}
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="bg-white/20 text-white border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {selectedCase.isSuspicious ? `Anomaly Alert: ${selectedCase.anomalyType}` : `Safety Lead: ${selectedCase.riskLevel}`}
                    </Badge>
                    {DISCUSSION_HISTORY_IDS.includes(selectedCase.id) && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="bg-white/10 text-white rounded-full h-8 px-4 font-bold text-xs"
                        onClick={() => setIsChatOpen(!isChatOpen)}
                      >
                        <MessageSquare className="h-3 w-3 mr-2" />
                        {isChatOpen ? "View Report" : "Audit Discussion"}
                      </Button>
                    )}
                  </div>
                  <DialogTitle className="text-3xl font-headline font-bold mb-2">Case {selectedCase.id}</DialogTitle>
                </div>
                
                <div className="flex-1 overflow-y-auto p-8">
                  {isChatOpen ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                      <ChatPanel 
                        userId={selectedCase.userId} 
                        complaintId={selectedCase.id} 
                        currentUserRole="safety" 
                      />
                    </div>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Index</p>
                          <Badge className={cn("rounded-lg px-3 py-1 font-bold", selectedCase.riskLevel === 'Critical' ? "bg-red-500" : "bg-orange-500")}>
                            {selectedCase.riskLevel}
                          </Badge>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Track</p>
                          <Badge variant="outline" className="rounded-lg px-3 py-1 font-bold uppercase border-slate-800 text-slate-800">
                            {selectedCase.assignedRole}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                          <FileText className="h-5 w-5 text-slate-800" />
                          Incident Log Testimony
                        </div>
                        <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 italic text-slate-600 leading-relaxed">
                          "{selectedCase.description}"
                        </div>
                      </div>

                      {selectedCase.isSuspicious && (
                        <Alert className="bg-amber-50 border-amber-200 rounded-3xl">
                          <Brain className="h-4 w-4 text-amber-600" />
                          <AlertTitle className="text-amber-800 font-bold">Behavioral Warning</AlertTitle>
                          <AlertDescription className="text-amber-700 text-xs">
                            Pattern Detection: {selectedCase.anomalyType}. Automated suspicion score: {selectedCase.anomalyScore}%.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="pt-6 border-t">
                        <Button 
                          className="w-full h-14 rounded-2xl font-black bg-[#95b8a2] hover:bg-[#84a791] text-white"
                          onClick={() => handleResolve(selectedCase)}
                          disabled={selectedCase.status === 'Resolved'}
                        >
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          {selectedCase.status === 'Resolved' ? 'Resolution Finalized' : 'Issue Global Resolution'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Authority Audit Dialog */}
        <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
          <DialogContent className="sm:max-w-[700px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
            <div className="bg-indigo-600 p-10 text-white relative">
              <div className="absolute top-10 right-10 opacity-20">
                <Shield className="h-24 w-24" />
              </div>
              <Badge className="bg-white/20 text-white border-none mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Organization Analytics
              </Badge>
              <DialogTitle className="text-3xl font-headline font-bold mb-2">
                Authority Resolution Audit
              </DialogTitle>
              <p className="text-indigo-100 text-sm">Performance metrics for authorized responders at {session.organization}.</p>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AUTHORITY_AUDIT.map((item) => (
                  <div key={item.role} className="p-6 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-2 rounded-xl", item.color)}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <Badge className="bg-white text-slate-600 border border-slate-200 font-black text-[10px]">{item.efficiency}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.role}</p>
                      <h4 className="text-2xl font-black text-slate-800">{item.count}</h4>
                    </div>
                    <div className="pt-2 border-t border-slate-200/60">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Resolved Cases</p>
                      <p className="text-base font-black text-slate-700">{item.resolved}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-white shadow-sm">
                  <TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-indigo-900 mb-1">Overall System Performance</h4>
                  <p className="text-sm text-indigo-700 leading-relaxed">
                    Resolution efficiency is up by 12% this month. The Safety Cell has successfully audited {stats.resolved} total incidents across all organizational tiers.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <Button 
                  onClick={() => setIsAuditOpen(false)}
                  className="w-full h-14 rounded-2xl font-black bg-slate-800 hover:bg-slate-900 text-white"
                >
                  Close Audit Feed
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
