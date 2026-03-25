
"use client"

import { useState } from "react"
import { PhoneCall, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function EmergencyButton() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleActivation = () => {
    setOpen(false)
    toast({
      title: "Emergency Support Activated",
      description: "Local authorities and emergency contacts have been notified of your location.",
      variant: "destructive",
    })
  }

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          size="lg"
          onClick={() => setOpen(true)}
          className="rounded-full h-16 w-16 md:h-20 md:w-20 shadow-2xl bg-destructive hover:bg-destructive/90 transition-all duration-300 hover:scale-110 active:scale-95 group"
        >
          <Bell className="h-8 w-8 md:h-10 md:w-10 animate-pulse group-hover:animate-none" />
          <span className="sr-only">Emergency Support</span>
        </Button>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <PhoneCall className="h-5 w-5" />
              Activate Emergency Protocol?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will immediately notify emergency services and your designated safety contacts with your current GPS coordinates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleActivation}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirm Activation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
