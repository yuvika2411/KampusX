"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-page text-ink">
      {/* Top Sticky Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Hero Section with Dashboard Mockup */}
        <Hero />

        {/* Features Section: Issue Reporting, Community Voting, Progress Tracking, Transparent Resolution */}
        <Features />

        {/* How It Works: 3 Steps */}
        <HowItWorks />

        {/* Real Campus Impact & Response Metrics */}
        <Stats />

        {/* Voices from Campus / Testimonials */}
        <Testimonials />

        {/* FAQ Accordion */}
        <Faq />

        {/* Final Call to Action */}
        <CtaSection />
      </main>

      {/* Professional University Footer */}
      <Footer />

    </div>
  );
}
