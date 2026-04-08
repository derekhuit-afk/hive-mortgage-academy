"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Modules from "@/components/Modules";
import AICoach from "@/components/AICoach";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main style={{ background: "var(--obsidian)" }}>
      <Nav />
      <Hero />
      <Stats />
      <Modules />
      <AICoach />
      <Pricing />
      <Footer />
    </main>
  );
}
