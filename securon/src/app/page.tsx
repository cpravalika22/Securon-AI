/**
 * @fileOverview Main landing page for SECURON, updated with "Safe" color theme and translation support.
 */

'use client';

import { Shield, FileText } from "lucide-react"
import { ReportModal } from "@/components/report-modal"
import { EmergencyButton } from "@/components/emergency-button"
import { Chatbot } from "@/components/chatbot"
import { AuthButton } from "@/components/auth-button"
import { LanguageToggle } from "@/components/language-toggle"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/30">
      {/* Header */}
      <header className="w-full py-6 px-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-headline font-bold tracking-tight text-primary">{t('brand')}</span>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <Button variant="ghost" size="sm" asChild className="rounded-full gap-2 hidden sm:flex">
            <Link href="/reports">
              <FileText className="h-4 w-4" />
              {t('nav_activity')}
            </Link>
          </Button>
          <AuthButton />
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Calming Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse duration-[10s]" />
        <div className="absolute top-[15%] right-[5%] w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] -z-10" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-sky-100 rounded-full blur-[90px] -z-10" />
        
        <div className="max-w-4xl space-y-12 py-20">
          <div className="space-y-6 fade-in">
            <blockquote className="text-4xl md:text-6xl font-headline italic leading-tight text-foreground whitespace-pre-line">
              {t('hero_quote')}
            </blockquote>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-body">
              {t('hero_sub')}
            </p>
          </div>

          <div className="fade-in" style={{ animationDelay: '0.2s' }}>
            <ReportModal />
          </div>
        </div>
      </main>

      {/* Floating Elements */}
      <EmergencyButton />
      <Chatbot />
    </div>
  );
}
