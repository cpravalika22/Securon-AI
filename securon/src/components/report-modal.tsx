
/**
 * @fileOverview Multi-step reporting modal with translation and AI Behavioral Anomaly Detection.
 */

"use client"

import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Shield, Loader2, CheckCircle2, Building, FileText, ChevronRight, Hash, ArrowLeft, BrainCircuit, Lock, UserMinus, Mail, KeyRound, Link as LinkIcon, User, Briefcase, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useAuth } from "@/firebase"
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { useLanguage } from "@/components/language-provider"
import { analyzeComplaint } from "@/lib/risk-analyzer"
import { analyzeBehavioralAnomaly } from "@/ai/flows/analyze-behavioral-anomaly"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  email: z.string().email("Please enter a valid authorized email."),
  otp: z.string().length(6, "OTP must be 6 digits.").optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  personDetails: z.string().min(2, "Please provide person details."),
  evidence: z.string().optional(),
})

type Step = "role" | "identity" | "otp" | "details" | "success"

function getOrgFromEmail(email: string): string {
  if (!email || !email.includes('@')) return "General Public";
  const domain = email.split('@')[1];
  const domainPart = domain.split('.')[0];
  return domainPart.toUpperCase();
}

export function ReportModal() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<Step>("role")
  const [userRole, setUserRole] = useState<"Student" | "Employee" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [complaintId, setComplaintId] = useState<string | null>(null)
  
  const { user } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      otp: "",
      description: "",
      personDetails: "",
      evidence: "",
    },
  })

  const email = form.watch("email")
  const description = form.watch("description")

  const riskAnalysis = useMemo(() => {
    if (!description || description.length < 5) return null;
    return analyzeComplaint(description);
  }, [description]);

  const detectedOrg = useMemo(() => getOrgFromEmail(email), [email]);

  const resetFlow = () => {
    setStep("role")
    setUserRole(null)
    setComplaintId(null)
    form.reset()
  }

  const handleRoleSelect = (role: "Student" | "Employee") => {
    setUserRole(role)
    setStep("identity")
  }

  const handleNext = () => {
    if (step === "identity") {
      if (email && email.includes("@")) {
        setStep("otp")
        toast({
          title: "OTP Sent",
          description: `A 6-digit code was sent to ${email} (Simulation).`,
        })
      }
    } else if (step === "otp") {
      setStep("details")
    }
  }

  const handleBack = () => {
    if (step === "identity") setStep("role")
    else if (step === "otp") setStep("identity")
    else if (step === "details") setStep("otp")
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      let currentUser = user
      if (!currentUser) {
        const cred = await signInAnonymously(auth)
        currentUser = cred.user
      }

      if (!db || !currentUser) throw new Error("Services unavailable")

      // Heuristic Anomaly Data Collection
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const pastReportsQuery = query(
        collection(db, "users", currentUser.uid, "complaints"),
        where("createdAt", ">", last24h.toISOString())
      );
      const pastReportsSnap = await getDocs(pastReportsQuery);
      const pastReports = pastReportsSnap.docs.map(d => d.data().description);

      // AI Analysis with Fallback System
      const risk = analyzeComplaint(values.description);
      const anomaly = await analyzeBehavioralAnomaly({
        description: values.description,
        reportCountLast24h: pastReports.length,
        pastReportSummaries: pastReports.slice(0, 3).map(d => d.substring(0, 50) + "..."),
      });

      const newId = `CMP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      const reportRef = doc(collection(db, "users", currentUser.uid, "complaints"), newId)

      const reportData = {
        id: newId,
        userId: currentUser.uid,
        userEmail: values.email,
        userType: userRole,
        description: values.description,
        riskLevel: risk.riskLevel,
        category: risk.category,
        priority: risk.riskLevel === 'Critical' ? 'high' : risk.riskLevel === 'High' ? 'high' : 'medium',
        status: "Submitted",
        organization: detectedOrg,
        assignedRole: risk.suggestedRole,
        personDetails: values.personDetails,
        evidence: values.evidence || "",
        anomalyScore: anomaly.anomalyScore,
        isSuspicious: anomaly.isSuspicious,
        anomalyType: anomaly.anomalyType,
        anomalySource: anomaly.source,
        createdAt: new Date().toISOString(),
      }

      await setDoc(reportRef, reportData);
      setComplaintId(newId)
      setStep("success")

      if (anomaly.isSuspicious) {
        console.warn(`[Behavioral Alert] Suspicious activity detected (Source: ${anomaly.source}) for user ${currentUser.uid}: ${anomaly.reason}`);
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) setTimeout(resetFlow, 300)
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl bg-primary hover:bg-primary/90 transition-all">
          {t('btn_raise')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[2.5rem]">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
            {step !== "role" && step !== "success" && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="rounded-full h-10 w-10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl font-headline">
                <Shield className="h-6 w-6 text-primary" />
                {step === "success" ? t('success_title') : t('modal_title')}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 mt-1">
                <Lock className="h-3 w-3 text-green-600" />
                <span className="text-green-600 font-bold text-[10px] uppercase tracking-wider">{t('modal_protocol')}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === "role" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold">{t('step_role_q')}</h3>
                    <p className="text-sm text-muted-foreground">{t('step_role_sub')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-32 rounded-3xl flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => handleRoleSelect("Student")}
                    >
                      <User className="h-8 w-8 text-primary" />
                      <span className="font-bold text-lg">{t('role_student')}</span>
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="h-32 rounded-3xl flex flex-col gap-3 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                      onClick={() => handleRoleSelect("Employee")}
                    >
                      <Briefcase className="h-8 w-8 text-primary" />
                      <span className="font-bold text-lg">{t('role_employee')}</span>
                    </Button>
                  </div>
                </div>
              )}

              {step === "identity" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-4">
                        <FormLabel className="text-lg font-bold">
                          {t('step_id_title').replace('{role}', userRole === 'Student' ? t('role_student') : t('role_employee'))}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input 
                              placeholder={`e.g. ${userRole?.toLowerCase()}@college.edu`}
                              className="h-14 pl-12 rounded-2xl border-2 focus:border-primary transition-all text-lg"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">
                          {t('step_id_sub').replace('{role}', userRole === 'Student' ? t('role_student') : t('role_employee'))}
                        </p>
                        <Button 
                          type="button" 
                          className="w-full h-14 rounded-2xl text-lg font-bold" 
                          disabled={!field.value || !field.value.includes('@')}
                          onClick={handleNext}
                        >
                          {t('btn_send_code')}
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === "otp" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem className="space-y-4 text-center">
                        <div className="mx-auto bg-primary/5 p-4 rounded-full w-fit">
                          <KeyRound className="h-10 w-10 text-primary" />
                        </div>
                        <FormLabel className="text-xl font-bold block">{t('step_otp_title')}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="0 0 0 0 0 0" 
                            maxLength={6}
                            className="h-16 text-center text-3xl tracking-[1rem] font-black rounded-2xl border-2 focus:border-primary bg-slate-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <Button 
                          type="button" 
                          className="w-full h-14 rounded-2xl text-lg font-bold mt-4" 
                          disabled={field.value?.length !== 6}
                          onClick={handleNext}
                        >
                          {t('btn_verify')}
                        </Button>
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === "details" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 pb-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigned Organization</p>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Building className="h-4 w-4" />
                      {detectedOrg}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="personDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase">
                          <UserMinus className="h-4 w-4" />
                          {t('field_involved')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Names or roles of individuals involved" 
                            className="h-12 rounded-xl border-2 focus:border-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase">
                          <FileText className="h-4 w-4" />
                          {t('field_log')}
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide a detailed description..." 
                            className="min-h-[120px] rounded-xl border-2 focus:border-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {riskAnalysis && (
                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3 animate-in fade-in zoom-in-95">
                      <BrainCircuit className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">AI Safety Assessment</p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Badge className={cn(
                            "text-[9px] font-bold border-none px-2 py-0.5",
                            riskAnalysis.riskLevel === 'Critical' ? "bg-red-500 text-white" :
                            riskAnalysis.riskLevel === 'High' ? "bg-orange-500 text-white" :
                            riskAnalysis.riskLevel === 'Medium' ? "bg-yellow-500 text-black" :
                            "bg-green-500 text-white"
                          )}>
                            {riskAnalysis.riskLevel} Risk
                          </Badge>
                          <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary px-2 py-0.5">
                            {riskAnalysis.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="evidence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-slate-700 text-xs font-bold uppercase">
                          <LinkIcon className="h-4 w-4" />
                          {t('field_evidence')}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Links to files or a description of evidence" 
                            className="h-12 rounded-xl border-2 focus:border-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-2xl">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-xs font-black uppercase tracking-tighter">Disciplinary Notice</AlertTitle>
                    <AlertDescription className="text-[11px] leading-relaxed">
                      {t('warning_false_allegation')}
                    </AlertDescription>
                  </Alert>

                  <div className="pt-4">
                    <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black shadow-lg" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {t('btn_submitting')}
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="mr-2 h-5 w-5" />
                          {t('btn_submit')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {step === "success" && (
                <div className="space-y-6 text-center animate-in zoom-in-95 py-6">
                  <div className="flex justify-center">
                    <div className="bg-green-100 p-6 rounded-full">
                      <CheckCircle2 className="h-14 w-14 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-headline">{t('success_title')}</h3>
                    <p className="text-muted-foreground text-sm">
                      {t('success_sub').replace('{org}', detectedOrg).replace('{role}', userRole === 'Student' ? t('role_student') : t('role_employee'))}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 space-y-3">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <Hash className="h-4 w-4" />
                      {t('ref_id')}
                    </div>
                    <code className="block text-3xl text-primary font-black tracking-widest bg-white py-4 rounded-2xl border shadow-sm">
                      {complaintId}
                    </code>
                  </div>
                  <Button type="button" variant="outline" className="w-full h-12 rounded-xl font-bold" onClick={() => setIsOpen(false)}>
                    Done
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
