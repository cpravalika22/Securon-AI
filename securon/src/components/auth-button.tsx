
"use client"

import { useState, useEffect } from "react"
import { useUser, useAuth, useFirestore } from "@/firebase"
import { signOut, signInAnonymously } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { LogIn, LogOut, User, LayoutDashboard, Mail, Shield, Building2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

function getOrgFromEmail(email: string): string {
  if (!email || !email.includes('@')) return "Unknown";
  const domain = email.split('@')[1];
  const domainPart = domain.split('.')[0];
  return domainPart.toUpperCase();
}

export function AuthButton() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const firestore = useFirestore()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loginEmail, setLoginEmail] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [mockSession, setMockSession] = useState<{ role: string; email: string; organization: string; name: string } | null>(null)

  useEffect(() => {
    const session = localStorage.getItem("mockSession")
    if (session) {
      setMockSession(JSON.parse(session))
    }
  }, [])

  const handleSimulatedLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    
    const email = loginEmail.trim().toLowerCase()
    if (!email) {
      toast({ title: "Email Required", variant: "destructive" })
      setIsLoggingIn(false)
      return
    }

    let detectedRole: "mentor" | "hod" | "safety" | "" = ""
    if (email.startsWith("hod")) detectedRole = "hod"
    else if (email.startsWith("mentor")) detectedRole = "mentor"
    else if (email.startsWith("safety")) detectedRole = "safety"
    else {
      toast({ title: "Invalid Prefix", description: "Use hod@, mentor@, or safety@", variant: "destructive" })
      setIsLoggingIn(false)
      return
    }

    const detectedOrg = getOrgFromEmail(email);

    try {
      const cred = await signInAnonymously(auth)

      // Sync profile to Firestore so Security Rules can verify the role
      await setDoc(doc(firestore, "users", cred.user.uid), {
        role: detectedRole,
        organization: detectedOrg,
        email: email,
        name: `Authorized ${detectedRole.toUpperCase()}`,
      });

      const session = {
        role: detectedRole,
        organization: detectedOrg,
        email: email,
        name: `Authorized ${detectedRole.toUpperCase()}`,
      }

      localStorage.setItem("mockSession", JSON.stringify(session))
      setMockSession(session)
      setIsDialogOpen(false)
      
      toast({
        title: "Access Granted",
        description: `Welcome. Authority synchronized for ${detectedOrg}.`,
      })

      router.push(`/dashboard/${detectedRole}`)
    } catch (err: any) {
      toast({ 
        title: "Access Denied", 
        description: err.message || "Could not authenticate session.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    localStorage.removeItem("mockSession")
    setMockSession(null)
    await signOut(auth)
    router.push("/")
    toast({ title: "Session Terminated" })
  }

  if (isUserLoading) return null

  if (!mockSession) {
    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 rounded-full border-primary/20 text-primary h-10 px-6 font-bold">
            <LogIn className="h-4 w-4" />
            Authorized Login
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px] rounded-[2.5rem] p-8">
          <DialogHeader className="space-y-4 text-center">
            <div className="mx-auto bg-primary/10 p-4 rounded-3xl w-fit">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-3xl font-headline">Portal Access</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSimulatedLogin} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-400 pl-1">Authorized Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="e.g. hod@cmr.edu" 
                    className="pl-11 h-14 rounded-2xl border-2"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isLoggingIn} className="w-full h-16 rounded-2xl font-black text-lg">
              {isLoggingIn ? "Syncing Authority..." : "Access Dashboard"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    )
  }

  const activeRole = mockSession.role
  const activeOrg = mockSession.organization

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full border h-10 px-4">
          <div className="bg-primary/10 p-1.5 rounded-full">
            <User className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-black uppercase">
            {activeRole} @ {activeOrg}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-3xl p-2">
        <DropdownMenuLabel className="px-4 py-5">
          <p className="text-sm font-bold truncate">{mockSession.email}</p>
          <p className="text-[10px] font-black text-primary uppercase flex items-center gap-1.5">
            <Building2 className="h-3 w-3" /> {activeOrg}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="rounded-2xl h-12">
          <Link href={`/dashboard/${activeRole}`} className="flex items-center gap-3">
            <LayoutDashboard className="h-4 w-4 text-primary" />
            <span className="font-bold">Open Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="rounded-2xl h-12 text-destructive">
          <LogOut className="h-4 w-4 mr-2" />
          <span className="font-bold">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
