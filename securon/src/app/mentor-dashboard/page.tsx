"use client"

import { useState, useMemo, useEffect } from "react"
import { Shield, Clock, CheckCircle2, ListTodo, Building2, RefreshCw, FileText, PieChart as PieChartIcon } from "lucide-react"
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

export default function MentorDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [session, setSession] = useState<{ role: string; organization: string } | null>(null)
  const [selectedCase, setSelectedCase] = useState<MockComplaint | null>(null)
  const [localComplaints, setLocalComplaints] = useState<MockComplaint[]>(MOCK_COMPLAINTS)

  useEffect(() => {
    const mockSession = localStorage.getItem("mockSession")
    if (mockSession) {
      const parsed = JSON.parse(mockSession)
      if (parsed.role !== "mentor") {
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
      (c.severity === "low" || c.severity === "medium") && 
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
    { name: "In Progress", value: stats.inProgress, color: "hsl(var(--primary))" },
    { name: "Resolved", value: stats.resolved, color: "#22c55e" },
  ], [stats])

  const chartConfig = {
    pending: { label: "Pending", color: "hsl(var(--destructive))" },
    inProgress: { label: "In Progress", color: "hsl(var(--primary))" },
    resolved: { label: "Resolved", color: "#22c55e" },
  }

  const handleUpdateStatus = (id: string, newStatus: Status) => {
    setLocalComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c))
    toast({
      title: "Status Updated",
      description: `Case ${id} has been moved to ${newStatus}.`,
    })
    setSelectedCase(null)
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50/50">
      <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2.5 rounded-2xl">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-headline font-bold">Mentor Control Panel</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> {session.organization} | Restricted Access
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-full">
            <Link href="/">Exit Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto py-10 px-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-destructive" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-400">Pending Cases</CardDescription>
                <CardTitle className="text-4xl font-headline font-bold text-slate-800">{stats.pending}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-destructive font-medium">
                  <Clock className="h-3.5 w-3.5" /> Awaiting Review
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-400">In Progress</CardDescription>
                <CardTitle className="text-4xl font-headline font-bold text-primary">{stats.inProgress}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-primary font-medium">
                  <RefreshCw className="h-3.5 w-3.5" /> Active Review
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500" />
              <CardHeader className="pb-2">
                <CardDescription className="uppercase tracking-widest text-[10px] font-black text-slate-400">Resolved</CardDescription>
                <CardTitle className="text-4xl font-headline font-bold text-green-600">{stats.resolved}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Case Closed
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden lg:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-primary" />
                Status Distribution
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

        <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
          <CardHeader className="border-b bg-slate-50/50 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-headline font-bold flex items-center gap-2">
                  <ListTodo className="h-6 w-6 text-primary" />
                  Assigned Incident Registry
                </CardTitle>
                <CardDescription>Displaying low and medium priority reports for {session.organization}.</CardDescription>
              </div>
              <Badge className="bg-primary/10 text-primary border-none px-6 py-2 rounded-2xl font-black text-xs">
                {filteredCases.length} ASSIGNMENTS
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
                  <TableHead className="hidden md:table-cell font-bold text-slate-500 pr-8">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-400">
                      No incidents matching your filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((incident) => (
                    <TableRow key={incident.id} className="hover:bg-slate-50/30 transition-colors">
                      <TableCell className="pl-8">
                        <Button 
                          variant="link" 
                          className="p-0 h-auto font-mono text-xs font-bold text-primary underline"
                          onClick={() => setSelectedCase(incident)}
                        >
                          {incident.id}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{incident.title}</span>
                          <span className="text-xs text-slate-400 line-clamp-1">{incident.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn(
                          "rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight",
                          incident.severity === "medium" ? "border-amber-200 text-amber-600 bg-amber-50" : "border-slate-200 text-slate-500 bg-slate-50"
                        )}>
                          {incident.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-full px-3 py-1 font-bold text-[10px] border-none",
                          incident.status === "pending" ? "bg-amber-100 text-amber-700" :
                          incident.status === "in-progress" ? "bg-primary/10 text-primary" :
                          "bg-green-100 text-green-700"
                        )}>
                          {incident.status.replace('-', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-slate-400 pr-8">
                        {format(new Date(incident.date), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
          <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
            {selectedCase && (
              <>
                <div className="bg-primary p-8 text-white relative">
                  <div className="absolute top-6 right-6 opacity-20">
                    <Shield className="h-24 w-24" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 mb-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Confidential Report
                  </Badge>
                  <DialogTitle className="text-3xl font-headline font-bold mb-2">
                    {selectedCase.title}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-primary-foreground/80 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {format(new Date(selectedCase.date), "PPP p")}
                    </div>
                    <div className="flex items-center gap-1.5 uppercase tracking-tighter text-xs">
                      Ref: {selectedCase.id}
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-8 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority Status</p>
                      <Badge variant="outline" className={cn(
                        "rounded-lg px-3 py-1 font-bold",
                        selectedCase.severity === "high" ? "bg-destructive text-white border-none" : "bg-white"
                      )}>
                        {selectedCase.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</p>
                      <Badge className="bg-primary/10 text-primary border-none px-3 py-1 rounded-lg font-bold">
                        {selectedCase.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <FileText className="h-5 w-5 text-primary" />
                      Original Incident Description
                    </div>
                    <div className="bg-slate-50/80 p-6 rounded-3xl border-2 border-slate-50 italic text-slate-600 leading-relaxed text-lg">
                      "{selectedCase.description}"
                    </div>
                  </div>

                  <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="flex-1 h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90"
                      disabled={selectedCase.status === 'in-progress' || selectedCase.status === 'resolved'}
                      onClick={() => handleUpdateStatus(selectedCase.id, "in-progress")}
                    >
                      {selectedCase.status === 'in-progress' ? 'Already in Review' : 'Begin Review Process'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 rounded-2xl font-bold border-green-200 text-green-600 hover:bg-green-50"
                      disabled={selectedCase.status === 'resolved'}
                      onClick={() => handleUpdateStatus(selectedCase.id, "resolved")}
                    >
                      {selectedCase.status === 'resolved' ? 'Case Resolved' : 'Issue Resolution'}
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
