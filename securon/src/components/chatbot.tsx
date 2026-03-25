
"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, User, Bot, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string
  text: string
  sender: "bot" | "user"
}

type Step = "start" | "category" | "location" | "safety" | "details" | "confirm" | "done"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Hello! Do you want to report a problem?", sender: "bot" }
  ])
  const [step, setStep] = useState<Step>("start")
  const [inputValue, setInputValue] = useState("")
  const [reportData, setReportData] = useState({
    type: "",
    location: "",
    severity: "Medium",
    details: ""
  })
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const addMessage = (text: string, sender: "bot" | "user") => {
    const newMessage: Message = { id: Math.random().toString(36).substring(2, 9), text, sender }
    setMessages((prev) => [...prev, newMessage])
  }

  const handleResponse = (choice: string, value?: string) => {
    addMessage(choice, "user")
    const val = value || choice

    setTimeout(() => {
      if (step === "start") {
        if (val === "Yes") {
          setStep("category")
          addMessage("What happened?", "bot")
        } else {
          addMessage("I understand. Stay safe. I am here if you need me later.", "bot")
        }
      } else if (step === "category") {
        setReportData(prev => ({ ...prev, type: val }))
        setStep("location")
        addMessage("Where did it happen?", "bot")
      } else if (step === "location") {
        setReportData(prev => ({ ...prev, location: val }))
        setStep("safety")
        addMessage("Do you feel unsafe now?", "bot")
      } else if (step === "safety") {
        setReportData(prev => ({ ...prev, severity: val === "Yes" ? "High" : "Medium" }))
        setStep("details")
        addMessage("Do you want to add more details? You can type them or just press Skip.", "bot")
      } else if (step === "confirm") {
        if (val === "Submit") {
          handleSubmit()
        } else {
          setIsOpen(false)
        }
      }
    }, 400)
  }

  const handleSendDetails = (skip = false) => {
    const text = skip ? "No more details" : inputValue
    addMessage(text, "user")
    setReportData(prev => ({ ...prev, details: skip ? "" : inputValue }))
    setInputValue("")
    setStep("confirm")
    setTimeout(() => {
      addMessage("Everything is ready. Submit your complaint?", "bot")
    }, 400)
  }

  const handleSubmit = () => {
    setStep("done")
    addMessage("Your complaint has been submitted safely. Our team is looking into it.", "bot")
    toast({
      title: "Complaint Submitted",
      description: "Your report has been encrypted and sent to our safety team.",
    })
  }

  return (
    <>
      {/* Floating Icon - Bottom Right, stacked above Emergency Button */}
      <div className="fixed bottom-28 md:bottom-32 right-8 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-16 w-16 rounded-full shadow-2xl hover-scale bg-zinc-950 text-destructive border-2 border-zinc-800 hover:bg-zinc-900 transition-all duration-300"
          size="icon"
        >
          <div className="relative">
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-8 w-8 text-destructive" />}
            {!isOpen && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-destructive"></span>
              </span>
            )}
          </div>
          <span className="sr-only">Help Chat</span>
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-48 md:bottom-52 right-8 w-[350px] md:w-[400px] h-[550px] z-50 shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300 border-zinc-800 bg-zinc-950 text-zinc-100 rounded-3xl overflow-hidden">
          <CardHeader className="p-5 bg-zinc-900 border-b border-zinc-800 flex flex-row items-center gap-3">
            <div className="bg-destructive/20 p-2 rounded-xl">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-lg font-headline font-bold text-zinc-100">Simple Assistant</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] opacity-80 uppercase tracking-widest text-zinc-400">Live & Secure</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden p-0 bg-zinc-900/50">
            <ScrollArea className="h-full p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex items-end gap-3", m.sender === "user" ? "flex-row-reverse" : "flex-row")}>
                    <div className={cn(
                      "p-2 rounded-xl shrink-0",
                      m.sender === "user" ? "bg-primary/20" : "bg-zinc-800 border border-zinc-700"
                    )}>
                      {m.sender === "user" ? <User className="h-4 w-4 text-primary" /> : <Bot className="h-4 w-4 text-zinc-400" />}
                    </div>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-5 py-3 text-sm shadow-sm font-medium",
                      m.sender === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-none" 
                        : "bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-bl-none"
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {step === "done" && (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2 text-green-500 animate-in zoom-in-50 duration-500">
                    <CheckCircle2 className="h-12 w-12" />
                    <p className="font-bold">Sent Successfully</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-6 border-t border-zinc-800 bg-zinc-900 flex flex-col gap-4">
            {step === "start" && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button size="lg" variant="default" className="h-14 text-lg font-bold rounded-2xl" onClick={() => handleResponse("Yes")}>Yes</Button>
                <Button size="lg" variant="outline" className="h-14 text-lg font-bold rounded-2xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => handleResponse("No")}>No</Button>
              </div>
            )}

            {step === "category" && (
              <div className="flex flex-col gap-2 w-full">
                <Button variant="outline" className="h-12 justify-start px-6 text-base rounded-2xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => handleResponse("Verbal abuse")}>Verbal abuse</Button>
                <Button variant="outline" className="h-12 justify-start px-6 text-base rounded-2xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => handleResponse("Physical harm")}>Physical harm</Button>
                <Button variant="outline" className="h-12 justify-start px-6 text-base rounded-2xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => handleResponse("Online harassment")}>Online harassment</Button>
              </div>
            )}

            {step === "location" && (
              <div className="grid grid-cols-2 gap-2 w-full">
                {["At Work", "At Home", "Public Place", "Online"].map(loc => (
                  <Button key={loc} variant="outline" className="h-12 text-sm rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => handleResponse(loc)}>{loc}</Button>
                ))}
              </div>
            )}

            {step === "safety" && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button variant="destructive" className="h-14 text-lg font-bold rounded-2xl" onClick={() => handleResponse("Yes")}>Yes</Button>
                <Button variant="outline" className="h-14 text-lg font-bold rounded-2xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => handleResponse("No")}>No</Button>
              </div>
            )}

            {step === "details" && (
              <div className="flex flex-col gap-3 w-full">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type details..." 
                    value={inputValue} 
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-12 rounded-xl bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                  />
                  <Button size="icon" className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90" onClick={() => handleSendDetails(false)}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <Button variant="ghost" className="text-zinc-500 text-xs hover:text-zinc-300" onClick={() => handleSendDetails(true)}>Skip this part</Button>
              </div>
            )}

            {step === "confirm" && (
              <div className="grid grid-cols-2 gap-3 w-full">
                <Button variant="default" className="h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90" onClick={() => handleResponse("Submit")}>Submit</Button>
                <Button variant="outline" className="h-14 text-lg font-bold rounded-2xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => handleResponse("Cancel")}>Cancel</Button>
              </div>
            )}

            {step === "done" && (
              <Button variant="outline" className="w-full h-12 rounded-xl border-zinc-700 hover:bg-zinc-800 text-zinc-300" onClick={() => setIsOpen(false)}>Close Window</Button>
            )}
          </CardFooter>
        </Card>
      )}
    </>
  )
}
