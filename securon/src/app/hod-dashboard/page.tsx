"use client"

import { useState, useMemo, useEffect } from "react"
import { ShieldAlert, Clock, CheckCircle2, Gavel, Building2, RefreshCw, Scale, AlertCircle, FileText, PieChart as PieChartIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { MOCK_COMPLAINTS, MockComplaint, Status } from "@/lib/mock-data"

export default function HODDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [session, setSession] = useState<{ role: string; organization: string } | null>(null)
  const [selectedCase, setSelectedCase] = useState<MockComplaint | null>(null)
  const [localComplaints, setLocalComplaints] = useState<MockComplaint[]>(MOCK_COMPLAINTS)

  useEffect(() => {
    const mockSession = localStorage.getItem("mockSession")
    if (mockSession) {
      const parsed = JSON.parse(mockSession)
      if (parsed.role !== "hod") {
        router.push(`/${parsed.role}-dashboard`)
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
      c.severity === "high" && 
      c.organization === session.organization
    )
  }, [session, localComplaints])

  const stats = useMemo(() => {
    return {
      pending: filteredCases.filter(c => c.status === "pending").length,
      inProgress: filteredCases.filter(c => c.status === "in-progress").length,
      resolved: filteredCases.filter(c => c.status === "resolved").length,
    }
  }, [filteredCases])

  const chartData = useMemo(() => [
    { name: "Pending", value: stats.pending, color: "hsl(var(--destructive))" },
    { name: "In Progress", value: stats.inProgress, color: "#f59e0b" },
    { name: "Resolved", value: stats.resolved, color: "#10b981" },
  ], [stats])

  const chartConfig = {
    pending: { label: "Pending", color: "hsl(var(--destructive))" },
    inProgress: { label: "In Progress", color: "#f59e0b" },
    resolved: { label: "Resolved", color: "#10b981" },
  }

  const handleUpdateStatus = (id: string, newStatus: Status) => {
    setLocalComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    toast({
      title: "HOD Authority Applied",
      description: `Case ${id} status updated to ${newStatus}.`,
    })
    setSelectedCase(null)
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-30 bg-zinc-900 border-b border-zinc-800 text-white">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-destructive p-2.5 rounded-2xl shadow-lg shadow-destructive/20">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold">HOD Command Center</h1>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> {session.organization} | Critical Oversight
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-full text-zinc-400 hover:text-white">
            <Link href="/">Exit Portal</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto py-10 px-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-400">Urgent Pending</CardDescription>
                <CardTitle className="text-4xl font-headline font-bold text-destructive">{stats.pending}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-destructive font-black animate-pulse">
                  <AlertCircle className="h-3.5 w-3.5" /> ACTION REQUIRED
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-400">Formal Review</CardDescription>
                <CardTitle className="text-4xl font-headline font-bold text-amber-600">{stats.inProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                  <Scale className="h-3.5 w-3.5" /> Disciplinary Process
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-400">Resolved</CardDescription>
                <CardTitle className="text-4xl font-headline font-bold text-green-600">{stats.resolved}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verdict Issued
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden lg:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-destructive" />
                Case Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-32">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={5}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
          <CardHeader className="border-b bg-zinc-900 p-8 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-headline font-bold flex items-center gap-2">
                  <Gavel className="h-6 w-6 text-destructive" />
                  High-Priority Incident Queue
                </CardTitle>
                <CardDescription className="text-zinc-400">Formal disciplinary oversight for critical safety violations at {session.organization}.</CardDescription>
              </div>
              <Badge className="bg-destructive/20 text-destructive-foreground border-destructive/30 px-6 py-2 rounded-2xl font-black text-xs">
                {filteredCases.length} CRITICAL CASES
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[120px] font-bold text-slate-500 pl-8">Case Ref</TableHead>
                  <TableHead className="font-bold text-slate-500">Subject</TableHead>
                  <TableHead className="font-bold text-slate-500">Severity</TableHead>
                  <TableHead className="font-bold text-slate-500">Status</TableHead>
                  <TableHead className="hidden md:table-cell font-bold text-slate-500 pr-8">Reported</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400 italic">
                      No high-priority incidents recorded for your department.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((incident) => (
                    <TableRow key={incident.id} className="hover:bg-slate-50/30 transition-colors">
                      <TableCell className="pl-8">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-mono text-xs font-black text-destructive underline"
                          onClick={() => setSelectedCase(incident)}
                        >
                          {incident.id}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{incident.title}</span>
                          <span className="text-xs text-slate-500 line-clamp-1 italic">"{incident.description}"</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase bg-destructive text-white border-none animate-pulse">
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "rounded-full px-3 py-1 font-bold text-[10px] border-2",
                          incident.status === "pending" ? "border-destructive/20 text-destructive bg-destructive/5" :
                          incident.status === "in-progress" ? "border-amber-200 text-amber-700 bg-amber-50" :
                          "border-green-200 text-green-700 bg-green-50"
                        )}>
                          {incident.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-slate-400 pr-8">
                        {format(new Date(incident.date), "PPP")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
          <DialogContent className="sm:max-w-[650px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-slate-50">
            {selectedCase && (
              <>
                <div className="bg-zinc-900 p-10 text-white relative border-b-8 border-destructive">
                  <div className="absolute top-10 right-10 opacity-10">
                    <Gavel className="h-32 w-32" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className="bg-destructive text-white border-none px-4 py-1 rounded-full text-[10px] font-black animate-pulse">
                      HIGH PRIORITY PROTOCOL
                    </Badge>
                  </div>
                  <DialogTitle className="text-4xl font-headline font-bold mb-4 tracking-tight">
                    {selectedCase.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-6 text-zinc-400 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-destructive" />
                      FILED: {format(new Date(selectedCase.date), "PPP p")}
                    </div>
                    <div className="flex items-center gap-2 uppercase font-black">
                      Ref ID: {selectedCase.id}
                    </div>
                  </div>
                </div>
                
                <div className="p-10 space-y-10">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-[2rem] shadow-sm border space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Triage</p>
                      <div className="flex items-center gap-3">
                        <Scale className="h-5 w-5 text-destructive" />
                        <span className="font-bold text-lg text-slate-800 uppercase">{selectedCase.severity} Severity</span>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-[2rem] shadow-sm border space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Lifecycle</p>
                      <div className="flex items-center gap-3">
                        <RefreshCw className="h-5 w-5 text-amber-500" />
                        <span className="font-bold text-lg text-slate-800 uppercase">{selectedCase.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-md border-l-8 border-destructive space-y-4">
                    <div className="flex items-center gap-2 text-sm font-black text-destructive uppercase tracking-tighter">
                      <FileText className="h-5 w-5" />
                      Actual Victim Testimony
                    </div>
                    <p className="text-slate-700 italic text-xl leading-relaxed font-medium">
                      "{selectedCase.description}"
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button 
                      className="flex-1 h-16 rounded-[1.5rem] font-black text-lg bg-destructive hover:bg-destructive/90"
                      disabled={selectedCase.status === 'in-progress' || selectedCase.status === 'resolved'}
                      onClick={() => handleUpdateStatus(selectedCase.id, "in-progress")}
                    >
                      {selectedCase.status === 'in-progress' ? 'Action Authorized' : 'Authorize Disciplinary Action'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-16 rounded-[1.5rem] font-black text-lg border-2 border-slate-200 hover:bg-white"
                      disabled={selectedCase.status === 'resolved'}
                      onClick={() => handleUpdateStatus(selectedCase.id, "resolved")}
                    >
                      {selectedCase.status === 'resolved' ? 'Case Archived' : 'Archive & Close Case'}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
