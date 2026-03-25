
"use client"

import { useState, useMemo, useEffect } from "react"
import { Shield, Building2, Search, Bell, LogOut, Plus, LayoutDashboard, Activity, Settings, FileText, ChevronDown, ShieldAlert, CheckCircle2, TrendingUp, AlertTriangle, Users, BarChart3, Users2, Award, BarChart as BarChartIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ResponsiveContainer, Bar, BarChart, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { MOCK_COMPLAINTS, MockComplaint } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function SafetyDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [session, setSession] = useState<{ role: string; organization: string; name: string } | null>(null)
  const [localComplaints, setLocalComplaints] = useState<MockComplaint[]>(MOCK_COMPLAINTS)
  const [selectedCase, setSelectedCase] = useState<MockComplaint | null>(null)
  const [isAuditOpen, setIsAuditOpen] = useState(false)

  useEffect(() => {
    const mockSession = localStorage.getItem("mockSession")
    if (mockSession) {
      const parsed = JSON.parse(mockSession)
      if (parsed.role !== "safety") {
        router.push(`/dashboard/${parsed.role}`)
      } else {
        setSession(parsed)
      }
    } else {
      router.push("/")
    }
  }, [router])
  
  const filteredCases = useMemo(() => {
    if (!session) return []
    return localComplaints.filter(c => 
      c.organization.toLowerCase().includes(session.organization.toLowerCase())
    )
  }, [session, localComplaints])

  const stats = useMemo(() => {
    return {
      pending: filteredCases.filter(c => c.status === "pending").length,
      inProgress: filteredCases.filter(c => c.status === "in-progress").length,
      resolved: filteredCases.filter(c => c.status === "resolved").length,
      highPriority: filteredCases.filter(c => c.severity === "high").length,
    }
  }, [filteredCases])

  // Category Pulse Data for BarChart (New Visualization)
  const categoryPulseData = useMemo(() => {
    const categories = Array.from(new Set(filteredCases.map(c => c.category)));
    return categories.map(cat => ({
      name: cat,
      count: filteredCases.filter(c => c.category === cat).length,
      fill: cat === 'Harassment' ? '#5e5e9b' : cat === 'Security' ? '#ff7c7c' : cat === 'Academic' ? '#95b8a2' : '#4c525e'
    })).sort((a, b) => b.count - a.count);
  }, [filteredCases])

  const AUTHORITY_AUDIT = [
    { role: "Mentors", count: 12, resolved: 86, efficiency: "94%", icon: Users2, color: "bg-blue-100 text-blue-600" },
    { role: "HODs", count: 4, resolved: 42, efficiency: "88%", icon: Building2, color: "bg-indigo-100 text-indigo-600" },
    { role: "Safety Cell", count: 3, resolved: 18, efficiency: "96%", icon: Shield, color: "bg-slate-100 text-slate-800" },
  ]

  const handleResolve = (id: string) => {
    setLocalComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'resolved' as any } : c))
    toast({
      title: "Global Resolution Issued",
      description: `Case ${id} has been resolved by the Global Safety Cell.`,
    })
    setSelectedCase(null)
  }

  if (!session) return null

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
            <p className="text-xs text-white/50 uppercase tracking-widest">Global Safety Lead</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <Link href="#" className="flex items-center gap-4 px-4 py-3 bg-white/10 rounded-2xl transition-all">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Command</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <Activity className="h-5 w-5" />
            <span className="font-medium">Live Feed</span>
          </Link>
          <Link href="#" className="flex items-center gap-4 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Config</span>
          </Link>
        </nav>

        <Card className="bg-white/5 border-white/10 p-6 rounded-[2rem] text-center space-y-4 shadow-none">
          <p className="text-xs text-white/60">Global Monitoring</p>
          <div className="flex justify-center">
            <div className="bg-white/10 p-3 rounded-full border border-dashed border-white/20">
              <Plus className="h-6 w-6" />
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10 w-full rounded-xl text-xs">Security Audit</Button>
        </Card>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto space-y-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-headline font-bold">Safety Hub</h1>
            <Badge className="bg-slate-800 text-white border-none px-3 py-1 rounded-full text-[10px] font-black uppercase">
              {session.organization} Command
            </Badge>
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
              <Button className="h-12 px-6 rounded-2xl bg-[#5e5e9b] hover:bg-[#4d4d8a] text-white font-bold border-none shadow-md">
                Global Report
              </Button>
            </div>
          </div>
        </header>

        {/* Global Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-600 mb-2">
              <FileText className="h-6 w-6" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Reports</p>
            <h2 className="text-4xl font-headline font-black">{filteredCases.length}</h2>
          </Card>
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-3 rounded-2xl bg-red-100 text-red-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Critical High</p>
            <h2 className="text-4xl font-headline font-black text-red-600">{stats.highPriority}</h2>
          </Card>
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 mb-2">
              <TrendingUp className="h-6 w-6" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Ongoing Audit</p>
            <h2 className="text-4xl font-headline font-black text-indigo-600">{stats.inProgress}</h2>
          </Card>
          <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white flex flex-col items-center justify-center space-y-2 text-center">
            <div className="p-3 rounded-2xl bg-green-100 text-green-600 mb-2">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Finalized</p>
            <h2 className="text-4xl font-headline font-black text-green-600">{stats.resolved}</h2>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Organizational Incident Pulse - Bar Chart (New Visualization) */}
          <Card className="lg:col-span-6 border-none shadow-xl rounded-[3rem] p-10 bg-white">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Organizational Pulse</h3>
                <p className="text-sm text-slate-400">Total complaints per category</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-[#5e5e9b]">
                <BarChartIcon className="h-6 w-6" />
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPulseData} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 10, 10, 0]} 
                    barSize={32}
                  >
                    {categoryPulseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Action Required Quick Stream */}
          <Card className="lg:col-span-6 border-none shadow-xl rounded-[3rem] p-10 bg-white">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold">Priority Monitor</h3>
                <p className="text-sm text-slate-400">Live incidents requiring cell oversight</p>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-4">
              {filteredCases.filter(c => c.status !== 'resolved').length === 0 ? (
                <div className="py-20 text-center text-slate-400 italic">No pending actions required.</div>
              ) : (
                filteredCases.filter(c => c.status !== 'resolved').slice(0, 4).map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-white hover:shadow-lg rounded-3xl transition-all group cursor-pointer"
                    onClick={() => setSelectedCase(item)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-2xl text-white shadow-md",
                        item.severity === 'high' ? 'status-badge-red' : 'card-purple'
                      )}>
                        <Activity className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-black text-base">{item.title}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Identity Secured</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-black border-slate-200">
                      {item.id}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Global Incident Stream (Full Table View) */}
        <Card className="border-none shadow-xl rounded-[3rem] p-10 bg-white">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-2xl font-bold">Action Required Stream</h3>
              <p className="text-sm text-slate-400">High-priority escalations awaiting safety cell override</p>
            </div>
            <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCases.filter(c => c.status !== 'resolved').length === 0 ? (
              <div className="col-span-2 py-20 text-center text-slate-400 italic">No pending actions required.</div>
            ) : (
              filteredCases.filter(c => c.status !== 'resolved').slice(0, 6).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white hover:shadow-lg rounded-[2.5rem] transition-all group cursor-pointer border border-transparent hover:border-slate-100"
                  onClick={() => setSelectedCase(item)}
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "p-4 rounded-[1.5rem] text-white shadow-lg",
                      item.severity === 'high' ? 'status-badge-red' : 'card-purple'
                    )}>
                      <Activity className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black text-lg group-hover:text-slate-900 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={`https://picsum.photos/seed/${item.id}/20`} />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Identity Verified</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-black text-slate-800">{format(new Date(item.date), "MMM d")}</p>
                    <Badge variant="outline" className="rounded-lg px-2 py-0.5 text-[9px] font-black uppercase border-slate-200">
                      {item.id}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Case Details Dialog */}
        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
          <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
            {selectedCase && (
              <>
                <div className="bg-slate-800 p-10 text-white relative">
                  <div className="absolute top-10 right-10 opacity-20">
                    <ShieldAlert className="h-24 w-24" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Global Override Protocol
                  </Badge>
                  <DialogTitle className="text-3xl font-headline font-bold mb-2">
                    {selectedCase.title}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-white/80 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {format(new Date(selectedCase.date), "PPP p")}
                    </div>
                    <div className="flex items-center gap-1.5 uppercase tracking-tighter text-xs">
                      REF: {selectedCase.id}
                    </div>
                  </div>
                </div>
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity Index</p>
                      <Badge variant="outline" className="rounded-lg px-3 py-1 font-bold bg-white text-slate-800 border-slate-800">
                        {selectedCase.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Safety Cell Status</p>
                      <Badge className="bg-slate-800/10 text-slate-800 border-none px-3 py-1 rounded-lg font-bold uppercase">
                        {selectedCase.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Activity className="h-5 w-5 text-slate-800" />
                      Verified Incident Stream Data
                    </div>
                    <div className="bg-slate-50/80 p-6 rounded-3xl border border-slate-100 italic text-slate-600 leading-relaxed">
                      "{selectedCase.description}"
                    </div>
                  </div>

                  <div className="pt-6 border-t flex flex-col gap-3">
                    <Button 
                      className="w-full h-14 rounded-2xl font-bold bg-[#95b8a2] hover:bg-[#84a791] text-white"
                      onClick={() => handleResolve(selectedCase.id)}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Finalize Global Resolution
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 rounded-xl text-slate-400 hover:text-slate-600"
                      onClick={() => setSelectedCase(null)}
                    >
                      Continue Monitoring
                    </Button>
                  </div>
                </div>
              </>
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
