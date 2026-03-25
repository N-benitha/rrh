import React, { useState, useEffect } from "react";
import type { PageProps } from "../types";

/* ─────────────────────────────────────────
   DESIGN SYSTEM
   White bg · Flood-orange primary · Charcoal text
   Font: DM Sans (body) + Clash Display (headings)
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap');

:root {
  --o50:  #FFF4EE;
  --o100: #FFE4CC;
  --o200: #FFBE8A;
  --o300: #F59040;
  --o400: #E8600A;
  --o500: #C84D00;
  --o600: #A33D00;
  --b900: #0F1923;
  --b800: #1C2B38;
  --b700: #2E4155;
  --b500: #5A7A96;
  --b300: #A8C4D8;
  --b100: #E8F2F8;
  --red:  #DC2626;
  --red-lt: #FEE2E2;
  --grn:  #16A34A;
  --grn-lt: #DCFCE7;
  --yel:  #3B82F6;      // Blue instead of yellow
  --yel-lt: #DBEAFE;     // Light blue
  --white: #FFFFFF;
  --gray50: #F9FAFB;
  --gray100: #F3F4F6;
  --gray200: #E5E7EB;
  --gray400: #9CA3AF;
  --gray600: #4B5563;
  --gray900: #111827;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05);
  --shadow-xl: 0 24px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.06);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}

*, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: 'DM Sans', sans-serif;
  background: var(--white);
  color: var(--gray900);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

h1,h2,h3,h4 {
  font-family: 'Clash Display', 'DM Serif Display', serif;
  font-weight: 600;
}

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--gray100); }
::-webkit-scrollbar-thumb { background: var(--o200); border-radius: 3px; }

/* ── PAGE TRANSITIONS ── */
.page { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
@keyframes fadeUp {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:none; }
}

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
.nav {
  position: fixed; top:0; left:0; right:0; z-index:500;
  height: 68px;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--gray200);
  display: flex; align-items: center;
  padding: 0 48px;
  box-shadow: 0 1px 0 rgba(0,0,0,0.04);
}
.nav-logo {
  display: flex; align-items: center; gap: 10px;
  cursor: pointer; text-decoration: none; flex: 1;
}
.nav-logo-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: linear-gradient(135deg, var(--o400), var(--o300));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 8px rgba(232,96,10,0.3);
  position: relative; overflow: hidden;
}
.nav-logo-icon::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 45%;
  background: rgba(255,255,255,0.15);
  clip-path: ellipse(60% 100% at 50% 100%);
}
.nav-logo-icon svg { width: 20px; height: 20px; fill: white; position: relative; z-index:1; }
.nav-logo-name {
  font-family: 'Clash Display', sans-serif;
  font-size: 17px; font-weight: 600;
  color: var(--b900); letter-spacing: -0.01em;
}
.nav-logo-sub { font-size: 10px; color: var(--o400); font-weight: 500; letter-spacing: 0.04em; display:block; }
.nav-center {
  display: flex; align-items: center; gap: 12px; flex: 1; justify-content: center;
}
.nav-link {
  padding: 7px 14px; border-radius: 8px; font-size: 14px; font-weight: 500;
  color: var(--gray600); cursor: pointer; border: none; background: none;
  font-family: 'DM Sans', sans-serif; transition: all 0.15s;
}
.nav-link:hover { color: var(--o400); background: var(--o50); }
.nav-right { display: flex; align-items: center; gap: 12px; flex: 1; justify-content: flex-end; }
.btn-nav-ghost {
  padding: 8px 18px; border-radius: 8px; font-size: 14px; font-weight: 500;
  color: var(--gray700); cursor: pointer; border: 1.5px solid var(--gray200);
  background: white; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
}
.btn-nav-ghost:hover { border-color: var(--o300); color: var(--o400); }
.btn-nav-primary {
  padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
  color: white; cursor: pointer; border: none;
  background: linear-gradient(135deg, var(--o400), var(--o300));
  font-family: 'DM Sans', sans-serif; transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(232,96,10,0.25);
}
.btn-nav-primary:hover { background: linear-gradient(135deg, var(--o500), var(--o400)); box-shadow: 0 4px 16px rgba(232,96,10,0.35); transform: translateY(-1px); }

/* ════════════════════════════════════════
   ALERT TICKER
════════════════════════════════════════ */
.ticker {
  position: fixed; top: 68px; left:0; right:0; z-index: 490;
  background: linear-gradient(90deg, var(--o400) 0%, var(--o300) 100%);
  height: 34px; overflow: hidden;
  display: flex; align-items: center;
}
.ticker-label {
  padding: 0 16px; background: var(--o600);
  height: 100%; display: flex; align-items: center; gap: 7px;
  font-size: 11px; font-weight: 700; color: white; letter-spacing: 0.1em;
  text-transform: uppercase; white-space: nowrap; flex-shrink: 0;
}
.ticker-dot { width:6px; height:6px; border-radius:50%; background:white; animation: td 1.2s infinite; }
@keyframes td { 0%,100%{opacity:1} 50%{opacity:0.3} }
.ticker-track { flex:1; overflow:hidden; position:relative; }
.ticker-content {
  display: flex; gap: 64px; animation: scroll-left 28s linear infinite;
  white-space: nowrap; align-items: center; height: 34px;
  font-size: 12px; font-weight: 600; color: white; letter-spacing: 0.03em;
}
@keyframes scroll-left { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.ticker-sep { color: rgba(255,255,255,0.5); }

/* ════════════════════════════════════════
   LANDING — HERO
════════════════════════════════════════ */
.hero {
  padding: 172px 48px 0;
  background: white;
  position: relative; overflow: hidden;
  min-height: 100vh;
}

/* Diagonal orange slab */
.hero::before {
  content: '';
  position: absolute; top: 0; right: -5%; width: 52%; bottom: 0;
  background: linear-gradient(170deg, var(--o50) 0%, #FFF0E4 50%, var(--o100) 100%);
  clip-path: polygon(12% 0, 100% 0, 100% 100%, 0% 100%);
  z-index: 0;
}

/* Wave decoration */
.hero::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 120px;
  background: var(--gray50);
  clip-path: ellipse(55% 100% at 50% 100%);
  z-index: 0;
}

.hero-inner {
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
  position: relative; z-index: 2;
}

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--o50); border: 1px solid var(--o200);
  color: var(--o500); padding: 6px 14px; border-radius: 100px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
  margin-bottom: 22px;
}
.eyebrow-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--o400); animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(0.8);opacity:0.6} }

.hero-title {
  font-size: 64px; font-weight: 700; line-height: 1.0;
  color: var(--b900); margin-bottom: 8px; letter-spacing: -0.03em;
}
.hero-title .orange { color: var(--o400); }
.hero-title .underline {
  position: relative; display: inline-block;
}
.hero-title .underline::after {
  content: '';
  position: absolute; bottom: -4px; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, var(--o400), var(--o200));
  border-radius: 2px;
}

.hero-sub {
  font-size: 17px; line-height: 1.7; color: var(--gray600);
  max-width: 480px; margin-bottom: 36px; font-weight: 400;
}

.hero-ctas { display: flex; gap: 12px; margin-bottom: 52px; flex-wrap: wrap; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--o400), var(--o300));
  color: white; font-size: 15px; font-weight: 600;
  border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(232,96,10,0.3);
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.btn-primary:hover { background: linear-gradient(135deg, var(--o500), var(--o400)); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(232,96,10,0.35); }

.btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 28px; border-radius: var(--radius-md);
  background: white; color: var(--b800); font-size: 15px; font-weight: 600;
  border: 1.5px solid var(--gray200); cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.btn-secondary:hover { border-color: var(--o300); color: var(--o500); background: var(--o50); }

.hero-stats {
  display: flex; gap: 0;
  border: 1px solid var(--gray200); border-radius: var(--radius-lg);
  overflow: hidden; background: white;
  box-shadow: var(--shadow-md);
}
.hstat { flex:1; padding: 18px 22px; border-right: 1px solid var(--gray200); }
.hstat:last-child { border-right: none; }
.hstat-num {
  font-family: 'Clash Display', sans-serif;
  font-size: 30px; font-weight: 700; color: var(--o400); line-height: 1; margin-bottom: 4px;
}
.hstat-num.red { color: var(--red); }
.hstat-lbl { font-size: 12px; color: var(--gray400); font-weight: 500; }

/* ── HERO RIGHT: Dashboard Card ── */
.dashboard-card {
  background: white; border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--gray200);
  overflow: hidden; position: relative;
}

.dc-topbar {
  background: linear-gradient(135deg, var(--b900) 0%, var(--b800) 100%);
  padding: 16px 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.dc-title { font-size: 13px; font-weight: 600; color: white; letter-spacing: 0.01em; }
.dc-live {
  display: flex; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.1); border-radius: 100px;
  padding: 4px 10px; font-size: 11px; font-weight: 600; color: white;
}
.dc-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; animation: td 1.2s infinite; }

.dc-map {
  position: relative; height: 190px; overflow: hidden;
  background: linear-gradient(180deg, #E8F4F0 0%, #D4EBE3 50%, #C0E0D5 100%);
}
.dc-map-grid {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(0,150,100,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,150,100,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
/* River path */
.river-path { position: absolute; inset: 0; }

.risk-zone {
  position: absolute; border-radius: 50%;
  animation: zone-pulse 3s ease-in-out infinite;
}
@keyframes zone-pulse { 0%,100%{transform:scale(1);opacity:0.5} 50%{transform:scale(1.1);opacity:0.75} }

.map-pin {
  position: absolute; width: 14px; height: 14px; border-radius: 50%;
  border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  transform: translate(-50%, -50%);
}
.map-pin::after {
  content: ''; position: absolute; inset: -5px; border-radius: 50%;
  animation: pin-ring 2s ease-out infinite;
  border: 1.5px solid;
}
.map-pin.danger { background: var(--red); }
.map-pin.danger::after { border-color: var(--red); }
.map-pin.warn { background: var(--o400); }
.map-pin.warn::after { border-color: var(--o400); }
.map-pin.safe { background: var(--grn); }
.map-pin.safe::after { border-color: var(--grn); animation-duration: 2.5s; }
@keyframes pin-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }

.map-legend {
  position: absolute; bottom: 8px; right: 10px;
  background: rgba(255,255,255,0.92); border-radius: 8px;
  padding: 6px 10px; display: flex; gap: 10px;
  font-size: 10px; font-weight: 600; color: var(--gray600);
  box-shadow: var(--shadow-sm); border: 1px solid var(--gray200);
}

.dc-metrics {
  display: grid; grid-template-columns: repeat(3,1fr);
  border-bottom: 1px solid var(--gray100);
}
.dc-metric { padding: 14px 16px; border-right: 1px solid var(--gray100); }
.dc-metric:last-child { border-right: none; }
.dc-m-lbl { font-size: 10px; color: var(--gray400); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.dc-m-val { font-family: 'Clash Display', sans-serif; font-size: 22px; font-weight: 700; }
.dc-m-val.o { color: var(--o400); }
.dc-m-val.r { color: var(--red); }
.dc-m-val.g { color: var(--grn); }
.dc-m-chg { font-size: 11px; margin-top: 2px; font-weight: 500; }
.chg-up { color: var(--red); }
.chg-ok { color: var(--grn); }

.dc-alerts { padding: 12px 16px; display: flex; flex-direction: column; gap: 7px; }
.dc-alert-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 8px; background: var(--gray50);
  border: 1px solid var(--gray100); font-size: 12px;
}
.dc-alert-row.crit { background: var(--red-lt); border-color: #FECACA; }
.dc-alert-row.warn { background: #DBEAFE; border-color: #BFDBFE; }
.ar-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink:0; }
.ar-name { font-weight: 600; color: var(--gray800); flex: 1; }
.ar-badge {
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;
}
.badge-crit { background: #FEE2E2; color: #B91C1C; }
.badge-warn { background: #DBEAFE; color: #1D4ED8; }
.badge-safe { background: var(--grn-lt); color: #15803D; }

/* ════════════════════════════════════════
   WAVE DIVIDER
════════════════════════════════════════ */
.wave-divider { line-height: 0; }
.wave-divider svg { display: block; width: 100%; }

/* ════════════════════════════════════════
   FEATURES SECTION
════════════════════════════════════════ */
.features-section {
  background: var(--gray50);
  padding: 96px 48px;
}
.sec-inner { max-width: 1280px; margin: 0 auto; }
.sec-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--o50); border: 1px solid var(--o100);
  color: var(--o500); padding: 5px 12px; border-radius: 100px;
  font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
  margin-bottom: 16px;
}
.sec-title { font-size: 44px; font-weight: 700; color: var(--b900); line-height: 1.1; margin-bottom: 14px; letter-spacing: -0.02em; }
.sec-desc { font-size: 16px; color: var(--gray600); line-height: 1.7; max-width: 500px; margin-bottom: 56px; }

.feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
.feat-card {
  background: white; border: 1px solid var(--gray200);
  border-radius: var(--radius-lg); padding: 28px;
  transition: all 0.25s; position: relative; overflow: hidden;
}
.feat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--o400), var(--o200));
  transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
}
.feat-card:hover { border-color: var(--o200); box-shadow: var(--shadow-lg); transform: translateY(-4px); }
.feat-card:hover::before { transform: scaleX(1); }
.feat-icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; margin-bottom: 18px;
}
.feat-title { font-family: 'Clash Display', sans-serif; font-size: 17px; font-weight: 600; color: var(--b900); margin-bottom: 10px; }
.feat-desc { font-size: 14px; color: var(--gray600); line-height: 1.6; }

/* ════════════════════════════════════════
   CTA BAND
════════════════════════════════════════ */
.cta-section {
  padding: 96px 48px;
  background: white;
}
.cta-card {
  max-width: 1280px; margin: 0 auto;
  background: linear-gradient(135deg, var(--b900) 0%, var(--b800) 50%, #1A3550 100%);
  border-radius: var(--radius-xl); padding: 64px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 40px; flex-wrap: wrap; position: relative; overflow: hidden;
}
.cta-card::before {
  content: '';
  position: absolute; right: -60px; top: -60px;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,96,10,0.2) 0%, transparent 70%);
}
.cta-card::after {
  content: '';
  position: absolute; bottom: -40px; left: 30%;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(232,96,10,0.08) 0%, transparent 70%);
}
.cta-title { font-size: 40px; font-weight: 700; color: white; line-height: 1.15; margin-bottom: 10px; letter-spacing: -0.02em; position: relative; z-index:1; }
.cta-sub { font-size: 16px; color: rgba(255,255,255,0.65); position: relative; z-index:1; }
.cta-actions { display: flex; gap: 12px; flex-wrap: wrap; position: relative; z-index:1; }
.btn-cta-primary {
  padding: 15px 32px; background: var(--o400); color: white;
  border: none; border-radius: var(--radius-md); font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 20px rgba(232,96,10,0.4);
}
.btn-cta-primary:hover { background: var(--o300); box-shadow: 0 8px 28px rgba(232,96,10,0.5); transform: translateY(-2px); }
.btn-cta-outline {
  padding: 15px 32px; background: transparent; color: white;
  border: 1.5px solid rgba(255,255,255,0.25); border-radius: var(--radius-md);
  font-size: 15px; font-weight: 600; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.btn-cta-outline:hover { border-color: rgba(255,255,255,0.6); background: rgba(255,255,255,0.06); }

/* ════════════════════════════════════════
   AUTH PAGES
════════════════════════════════════════ */
.auth-shell {
  min-height: 100vh;
  display: grid; grid-template-columns: 500px 1fr;
}

/* Left panel */
.auth-left {
  background: linear-gradient(160deg, var(--b900) 0%, var(--b800) 40%, #1A3550 100%);
  padding: 56px 52px;
  display: flex; flex-direction: column; justify-content: space-between;
  position: relative; overflow: hidden;
}
.auth-left::before {
  content: '';
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 50% 100%, rgba(232,96,10,0.2) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 100% 0%, rgba(232,96,10,0.08) 0%, transparent 50%);
}
/* Wave decoration on auth left */
.auth-wave {
  position: absolute; bottom: 0; left: 0; right: 0;
}
.auth-wave svg { display: block; width: 100%; }

.auth-left-content { position: relative; z-index: 1; }
.auth-left-footer { position: relative; z-index: 1; }

.auth-brand { display: flex; align-items: center; gap: 11px; margin-bottom: 60px; }
.auth-brand-icon {
  width: 42px; height: 42px; border-radius: 11px;
  background: linear-gradient(135deg, var(--o400), var(--o300));
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(232,96,10,0.3);
}
.auth-brand-icon svg { width: 22px; height: 22px; fill: white; }
.auth-brand-name { font-family: 'Clash Display', sans-serif; font-size: 17px; font-weight: 600; color: white; }
.auth-brand-sub { font-size: 10px; color: var(--o300); font-weight: 500; letter-spacing: 0.05em; display: block; }

.auth-left-title { font-size: 40px; font-weight: 700; color: white; line-height: 1.1; margin-bottom: 16px; letter-spacing: -0.02em; }
.auth-left-title .hl { color: var(--o300); }
.auth-left-sub { font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.65; margin-bottom: 48px; max-width: 340px; }

.auth-feats { display: flex; flex-direction: column; gap: 16px; }
.auth-feat { display: flex; align-items: flex-start; gap: 14px; }
.auth-feat-icon {
  width: 34px; height: 34px; border-radius: 9px;
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; flex-shrink: 0; margin-top: 2px;
}
.auth-feat-text { font-size: 14px; line-height: 1.5; }
.auth-feat-text strong { color: white; display: block; font-weight: 600; margin-bottom: 2px; }
.auth-feat-text span { color: rgba(255,255,255,0.55); }

.auth-left-footnote { font-size: 12px; color: rgba(255,255,255,0.3); }

/* Right panel */
.auth-right {
  background: white;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 60px; position: relative;
  min-height: 100vh;
}

.auth-form-box {
  background: white; border-radius: var(--radius-xl);
  padding: 48px 44px;
  width: 100%; max-width: 440px;
  box-shadow: var(--shadow-xl); border: 1px solid var(--gray200);
}

.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--gray500); cursor: pointer;
  margin-bottom: 28px; border: none; background: none;
  font-family: 'DM Sans', sans-serif; transition: color 0.15s;
}
.back-btn:hover { color: var(--o400); }

.form-title { font-size: 28px; font-weight: 700; color: var(--b900); margin-bottom: 6px; letter-spacing: -0.02em; }
.form-sub { font-size: 14px; color: var(--gray500); margin-bottom: 28px; line-height: 1.5; }

.form-field { margin-bottom: 24px; }
.form-label {
  display: block; font-size: 13px; font-weight: 600;
  color: var(--gray700); margin-bottom: 7px; letter-spacing: -0.01em;
}
.input-wrap { position: relative; }
.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; color: var(--gray400); pointer-events: none; }
.form-input {
  width: 100%; padding: 11px 16px;
  background: var(--gray50); color: var(--gray900);
  border: 1.5px solid var(--gray200); border-radius: var(--radius-sm);
  font-size: 14px; outline: none; transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.form-input.has-icon { padding-left: 42px; }
.form-input:focus { border-color: var(--o400); box-shadow: 0 0 0 3px rgba(232,96,10,0.1); background: white; }
.form-input::placeholder { color: var(--gray400); }
select.form-input { cursor: pointer; }

.form-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
.check-group { display: flex; align-items: center; gap: 8px; }
.check-group input { accent-color: var(--o400); width: 15px; height: 15px; }
.check-label { font-size: 13px; color: var(--gray600); }
.link { background: none; border: none; cursor: pointer; color: var(--o400); font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; }
.link:hover { color: var(--o500); text-decoration: underline; }

.submit-btn {
  width: 100%; padding: 13px;
  background: linear-gradient(135deg, var(--o400), var(--o300));
  color: white; border: none; border-radius: var(--radius-md);
  font-size: 15px; font-weight: 700; cursor: pointer;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 4px 16px rgba(232,96,10,0.25);
}
.submit-btn:hover { background: linear-gradient(135deg, var(--o500), var(--o400)); box-shadow: 0 6px 24px rgba(232,96,10,0.35); transform: translateY(-1px); }
.submit-btn:disabled { background: linear-gradient(135deg, var(--o200), var(--o100)); box-shadow: none; cursor: not-allowed; transform: none; color: rgba(255,255,255,0.7); }

.or-divider { display:flex; align-items:center; gap:12px; margin:20px 0; font-size:12px; color:var(--gray400); }
.or-divider::before, .or-divider::after { content:''; flex:1; height:1px; background:var(--gray200); }

.google-btn {
  width: 100%; padding: 11px;
  background: white; color: var(--gray700);
  border: 1.5px solid var(--gray200); border-radius: var(--radius-md);
  font-size: 14px; font-weight: 500; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.google-btn:hover { border-color: var(--o300); background: var(--o50); color: var(--o500); }

.form-footer-row { margin-top: 22px; text-align: center; font-size: 14px; color: var(--gray500); }

/* Alert boxes */
.alert { padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; display: flex; align-items: flex-start; gap: 10px; margin-bottom: 18px; line-height: 1.5; }
.alert-err  { background: #FEF2F2; border: 1px solid #FECACA; color: #B91C1C; }
.alert-ok   { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
.alert-info { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; }

/* ── OTP VERIFY ── */
.otp-group { display: flex; gap: 10px; justify-content: center; margin: 24px 0; }
.otp-box {
  width: 52px; height: 58px; border-radius: var(--radius-md);
  background: var(--gray50); border: 1.5px solid var(--gray200);
  text-align: center; font-size: 24px; font-weight: 700;
  color: var(--o400); outline: none;
  font-family: 'Clash Display', sans-serif;
  transition: all 0.2s; caret-color: var(--o400);
}
.otp-box:focus { border-color: var(--o400); box-shadow: 0 0 0 3px rgba(232,96,10,0.1); background: white; }
.otp-box.filled { background: var(--o50); border-color: var(--o200); }

/* Progress steps */
.steps-row { display: flex; align-items: center; margin-bottom: 6px; }
.s-dot {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; transition: all 0.2s;
  font-family: 'Clash Display', sans-serif;
}
.s-dot.done { background: var(--grn); color: white; }
.s-dot.active { background: var(--o400); color: white; box-shadow: 0 0 0 4px rgba(232,96,10,0.15); }
.s-dot.pending { background: var(--gray100); color: var(--gray400); border: 1.5px solid var(--gray200); }
.s-line { flex:1; height:2px; background: var(--gray200); }
.s-line.done { background: var(--grn); }
.step-labels { display:flex; justify-content:space-between; font-size:11px; color:var(--gray400); font-weight:600; letter-spacing:0.04em; text-transform:uppercase; margin-bottom:24px; }

.verify-icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(135deg, var(--o50), var(--o100));
  border: 1px solid var(--o200);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px; margin: 0 auto 24px;
}

.countdown-text { text-align: center; margin-top: 14px; font-size: 13px; color: var(--gray500); }
.countdown-num { font-weight: 700; color: var(--o400); font-family: 'Clash Display', sans-serif; }

/* ════════════════════════════════════════
   HELP PAGE
════════════════════════════════════════ */
.help-hero {
  padding: 140px 48px 72px;
  background: linear-gradient(180deg, var(--o50) 0%, white 100%);
  text-align: center; border-bottom: 1px solid var(--gray200);
}
.help-title { font-size: 52px; font-weight: 700; color: var(--b900); margin-bottom: 12px; letter-spacing: -0.03em; }
.help-title .hl { color: var(--o400); }
.help-sub { font-size: 17px; color: var(--gray600); max-width: 480px; margin: 0 auto 28px; line-height: 1.6; }

.search-bar { max-width: 540px; margin: 0 auto; position: relative; }
.search-input {
  width: 100%; padding: 15px 20px 15px 50px;
  background: white; border: 1.5px solid var(--gray200);
  border-radius: var(--radius-md); font-size: 15px; outline: none;
  transition: all 0.2s; box-shadow: var(--shadow-md);
  font-family: 'DM Sans', sans-serif; color: var(--gray900);
}
.search-input:focus { border-color: var(--o400); box-shadow: 0 0 0 3px rgba(232,96,10,0.1), var(--shadow-md); }
.search-input::placeholder { color: var(--gray400); }
.search-icon { position: absolute; left: 17px; top: 50%; transform: translateY(-50%); font-size: 18px; color: var(--gray400); }

.help-cats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; max-width: 1100px; margin: 0 auto; padding: 64px 48px 0; }
.help-cat-card {
  background: white; border: 1px solid var(--gray200);
  border-radius: var(--radius-lg); padding: 26px;
  cursor: pointer; transition: all 0.22s;
  display: flex; flex-direction: column; gap: 10px;
}
.help-cat-card:hover { border-color: var(--o300); box-shadow: var(--shadow-md); transform: translateY(-3px); }
.help-cat-icon { font-size: 30px; }
.help-cat-title { font-family: 'Clash Display', sans-serif; font-size: 16px; font-weight: 600; color: var(--b900); }
.help-cat-desc { font-size: 13px; color: var(--gray500); line-height: 1.5; }
.help-cat-arrow { font-size: 16px; color: var(--o400); margin-top: auto; font-weight: 700; }

.faq-wrap { max-width: 780px; margin: 0 auto; padding: 72px 48px 80px; }
.faq-section-title { font-family: 'Clash Display', sans-serif; font-size: 34px; font-weight: 700; color: var(--b900); margin-bottom: 28px; }
.faq-item { border: 1px solid var(--gray200); border-radius: var(--radius-md); margin-bottom: 10px; overflow: hidden; background: white; transition: border-color 0.2s, box-shadow 0.2s; }
.faq-item.open { border-color: var(--o200); box-shadow: 0 0 0 3px rgba(232,96,10,0.06); }
.faq-q { padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; user-select: none; }
.faq-q-text { font-size: 15px; font-weight: 600; color: var(--gray900); }
.faq-chevron { width: 26px; height: 26px; border-radius: 50%; background: var(--gray100); display: flex; align-items: center; justify-content: center; font-size: 14px; color: var(--gray500); transition: all 0.2s; flex-shrink: 0; }
.faq-item.open .faq-chevron { background: var(--o100); color: var(--o500); transform: rotate(180deg); }
.faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; }
.faq-answer.open { max-height: 250px; }
.faq-answer-inner { padding: 0 22px 18px; font-size: 14px; color: var(--gray600); line-height: 1.75; border-top: 1px solid var(--gray100); padding-top: 14px; }

.help-support-card {
  max-width: 780px; margin: 0 auto 80px; padding: 0 48px;
  background: linear-gradient(135deg, var(--o50), var(--o100));
  border: 1px solid var(--o200); border-radius: var(--radius-xl);
  padding: 40px 48px; display: flex; gap: 32px; align-items: center;
  flex-wrap: wrap;
}
.support-card-text h3 { font-family:'Clash Display',sans-serif; font-size:24px; font-weight:700; color:var(--b900); margin-bottom:8px; }
.support-card-text p { font-size:14px; color:var(--gray600); line-height:1.5; }
.support-card-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* ── SPINNER ── */
@keyframes spin { to { transform: rotate(360deg); } }
.spinner { width: 17px; height: 17px; border-radius: 50%; border: 2.5px solid rgba(255,255,255,0.35); border-top-color: white; animation: spin 0.65s linear infinite; }

/* ── RESPONSIVE ── */
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; }
  .auth-shell { grid-template-columns: 1fr; }
  .auth-left { display: none; }
  .feat-grid { grid-template-columns: 1fr 1fr; }
  .help-cats-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  .nav { padding: 0 20px; }
  .nav-center { display: none; }
  .hero { padding: 150px 20px 0; }
  .hero-title { font-size: 44px; }
  .feat-grid { grid-template-columns: 1fr; }
  .help-cats-grid { grid-template-columns: 1fr; }
  .features-section { padding: 60px 20px; }
  .cta-section { padding: 60px 20px; }
  .cta-card { padding: 36px 28px; }
}
`;

/* ── DATA ── */
const FEATURES = [
  { icon:"🌊", bg:"#FFF4EE", border:"#FFE4CC", title:"Real-Time Monitoring",   desc:"Live data from meteorological APIs and simulated IoT sensor streams across Rwanda's major river basins, updated every 15 minutes." },
  { icon:"🤖", bg:"#EFF6FF", border:"#DBEAFE", title:"ML Risk Engine",          desc:"Random Forest and Logistic Regression models classify flood risk as High, Medium, or Low using historical and real-time data." },
  { icon:"🗺️", bg:"#F0FDF4", border:"#DCFCE7", title:"GIS Risk Maps",           desc:"Interactive flood risk visualization overlaid on Rwanda's geography — Nyabarongo, Sebeya, and urban Kigali catchments." },
  { icon:"📡", bg:"#FFF7ED", border:"#FED7AA", title:"IoT Sensor Streams",      desc:"Simulated environmental sensors alongside NASA POWER and OpenWeather APIs for comprehensive environmental coverage." },
  { icon:"🔔", bg:"#FEF2F2", border:"#FECACA", title:"Early Warning Alerts",    desc:"Automated alert dissemination to MINEMA, RWB, and community-level stakeholders before flood conditions intensify." },
  { icon:"📊", bg:"#F5F3FF", border:"#EDE9FE", title:"Analytics Dashboard",     desc:"Track rainfall trends, river levels, and ML prediction performance metrics with exportable reports for agencies." },
];

const FAQS = [
  { q:"What is the Rwanda Resilience Hub?",    a:"RRH is a modular full-stack flood risk prediction platform developed for helping society to take major actions before floods happens. It integrates meteorological data, satellite datasets, and simulated IoT sensor streams with machine learning to provide localized flood risk estimates across Rwanda." },
  { q:"Who can access the platform?",          a:"The platform is designed for disaster management personnel, meteorological experts at Meteo Rwanda and RWB, MINEMA stakeholders, and University of Rwanda researchers. An institutional email is required for registration." },
  { q:"How are flood risk levels determined?", a:"Risk levels — High, Medium, Low — are classified using supervised machine learning models including Random Forest and Logistic Regression, trained on historical and near real-time environmental data: rainfall, river levels, and satellite observations." },
  { q:"How does Gmail email verification work?", a:"After registration, a 6-digit OTP code is sent to your Gmail. Enter the code within 5 minutes to activate your account. You can request a new code if the current one expires." },
  { q:"How often is the flood data updated?",  a:"Environmental data is ingested in near real-time. The ML prediction engine re-classifies risk levels approximately every 15–30 minutes whenever new data arrives from meteorological and sensor sources." },
  { q:"Who do I contact for technical support?", a:"Use the Help Centre search, submit a contact form, or reach out to the University of Rwanda School of ICT development team. Institutional admins can also escalate issues." },
  { q:"What is the Rwanda Resilience Hub?",    a:"RRH is a modular full-stack flood risk prediction platform developed helping society to take major actions before floods happens. It integrates meteorological data, satellite datasets, and simulated IoT sensor streams with machine learning to provide localized flood risk estimates across Rwanda." },
  { q:"Who can access the platform?",          a:"The platform is designed for disaster management personnel, meteorological experts at Meteo Rwanda and RWB, MINEMA stakeholders, and University of Rwanda researchers. An institutional email is required for registration." },
  { q:"How are flood risk levels determined?", a:"Risk levels — High, Medium, Low — are classified using supervised machine learning models including Random Forest and Logistic Regression, trained on historical and near real-time environmental data: rainfall, river levels, and satellite observations." },
  { q:"How does Gmail email verification work?", a:"After registration, a 6-digit OTP code is sent to your Gmail. Enter the code within 5 minutes to activate your account. You can request a new code if the current one expires." },
  { q:"How often is the flood data updated?",  a:"Environmental data is ingested in near real-time. The ML prediction engine re-classifies risk levels approximately every 15–30 minutes whenever new data arrives from meteorological and sensor sources." },
  { q:"Who do I contact for technical support?", a:"Use the Help Centre search, submit a contact form, or reach out to our team. Institutional admins can also escalate issues." },
];

/* ════════════════════════════════════════
   NAVBAR
════════════════════════════════════════ */
function Navbar({ setPage }: PageProps) {
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => setPage("landing")}>
        <div className="nav-logo-icon">
          <svg viewBox="0 0 24 24" fill="white" style={{width:18,height:18}}>
            <path d="M3 14s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3"/>
            <path d="M3 19s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3" opacity=".5"/>
            <path d="M3 9s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3" opacity=".7"/>
          </svg>
        </div>
        <div>
          <div className="nav-logo-name">Rwanda Resilience Hub</div>
          <span className="nav-logo-sub">Flood Intelligence Platform</span>
        </div>
      </div>

      <div className="nav-right">
      <button className="nav-link" onClick={() => setPage("landing")}>Home</button>
        <button className="nav-link" onClick={() => setPage("help")}>Help</button>
        <button className="nav-link" onClick={() => setPage("about")}>About</button>
        <button className="btn-nav-ghost" onClick={() => setPage("login")}>Sign In</button>
        <button className="btn-nav-primary" onClick={() => setPage("register")}>Get Access</button>
      </div>
    </nav>
  );
}

/* ── Ticker ── */
function Ticker() {
  const msgs = ["⚠ Nyabarongo Basin — HIGH FLOOD RISK", "• Rainfall 34% above average (24h)", "• Sebeya River at 3.8m — near flood stage", "• Kigali urban zones: MEDIUM risk", "• ML confidence: 91%", "• Last updated 6 min ago"];
  const all = [...msgs, ...msgs].join("        ");
  return (
    <div className="ticker">
      <div className="ticker-label"><div className="ticker-dot"/>LIVE ALERTS</div>
      <div className="ticker-track">
        <div className="ticker-content">{all}</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════ */
function Landing({ setPage }: PageProps) {
  return (
    <div className="page">
      <Ticker />

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          {/* Left */}
          <div>
            <div className="hero-eyebrow">
              <div className="eyebrow-dot" />
              Live Flood Monitoring — Rwanda
            </div>
            <h1 className="hero-title">
              Predict Floods.<br />
              <span className="orange underline">Protect Lives.</span>
            </h1>
            <p className="hero-sub">
              An integrated platform combining IoT sensors, satellite imagery, and machine learning to deliver real-time flood risk predictions across Rwanda's most vulnerable river basins.
            </p>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={() => setPage("register")}>
                Request Access <span>→</span>
              </button>
              <button className="btn-secondary" onClick={() => setPage("help")}>
                How it Works
              </button>
            </div>
            <div className="hero-stats">
              <div className="hstat">
                <div className="hstat-num red">3</div>
                <div className="hstat-lbl">Active Alerts</div>
              </div>
              <div className="hstat">
                <div className="hstat-num">82mm</div>
                <div className="hstat-lbl">24h Rainfall</div>
              </div>
              <div className="hstat">
                <div className="hstat-num">91%</div>
                <div className="hstat-lbl">ML Accuracy</div>
              </div>
              <div className="hstat">
                <div className="hstat-num">15min</div>
                <div className="hstat-lbl">Update Cycle</div>
              </div>
            </div>
          </div>

          {/* Right: Dashboard preview */}
          <div className="dashboard-card">
            <div className="dc-topbar">
              <span className="dc-title">🗺 Live Risk Map — Rwanda</span>
              <span className="dc-live"><div className="dc-dot"/>LIVE</span>
            </div>
            <div className="dc-map">
              <div className="dc-map-grid"/>
              {/* Flood zones */}
              <div className="risk-zone" style={{width:110,height:65,background:"rgba(220,38,38,0.15)",top:"20%",left:"28%",border:"1.5px solid rgba(220,38,38,0.35)"}}/>
              <div className="risk-zone" style={{width:75,height:48,background:"rgba(220,38,38,0.12)",top:"48%",left:"15%",border:"1px solid rgba(220,38,38,0.3)",animationDelay:"1s"}}/>
              <div className="risk-zone" style={{width:88,height:55,background:"rgba(232,96,10,0.12)",top:"30%",left:"54%",border:"1px solid rgba(232,96,10,0.35)",animationDelay:"0.5s"}}/>
              {/* River SVG */}
              <svg className="river-path" viewBox="0 0 400 190" preserveAspectRatio="none">
                <path d="M0,80 Q80,60 160,90 Q240,120 320,85 Q370,70 400,80" stroke="rgba(59,130,246,0.35)" strokeWidth="3" fill="none" strokeDasharray="6 3"/>
                <path d="M20,130 Q100,110 180,140 Q260,165 340,130" stroke="rgba(59,130,246,0.2)" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
              </svg>
              {/* Pins */}
              <div className="map-pin danger" style={{top:"35%",left:"40%"}}/>
              <div className="map-pin warn"   style={{top:"38%",left:"62%"}}/>
              <div className="map-pin safe"   style={{top:"18%",left:"68%"}}/>
              <div className="map-pin danger" style={{top:"55%",left:"22%"}}/>
              <div className="map-pin safe"   style={{top:"65%",left:"72%"}}/>
              <div className="map-legend">
                <span><span style={{color:"var(--red)"}}>●</span> High</span>
                <span><span style={{color:"var(--o400)"}}>●</span> Med</span>
                <span><span style={{color:"var(--grn)"}}>●</span> Low</span>
              </div>
            </div>
            <div className="dc-metrics">
              {[["Rainfall 24h","82mm","o","↑ +34%","chg-up"],["River Level","3.8m","r","Near flood","chg-up"],["ML Accuracy","91%","g","✓ High","chg-ok"]].map(([l,v,c,ch,cc],i)=>(
                <div className="dc-metric" key={i}>
                  <div className="dc-m-lbl">{l}</div>
                  <div className={`dc-m-val ${c}`}>{v}</div>
                  <div className={`dc-m-chg ${cc}`}>{ch}</div>
                </div>
              ))}
            </div>
            <div className="dc-alerts">
              {[["crit","Nyabarongo Basin","HIGH"],["crit","Sebeya River","HIGH"],["warn","Kigali Urban Zone","MEDIUM"],["","Akagera Downstream","LOW"]].map(([s,n,lb],i)=>(
                <div className={`dc-alert-row${s?" "+s:""}`} key={i}>
                  <div className="ar-dot" style={{background:s==="crit"?"var(--red)":s==="warn"?"var(--o400)":"var(--grn)"}}/>
                  <span className="ar-name">{n}</span>
                  <span className={`ar-badge badge-${s||"safe"}`}>{lb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div style={{position:"relative",zIndex:2,marginTop:60,lineHeight:0}}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{width:"100%",height:80,display:"block"}}>
            <path d="M0,30 C200,70 400,0 600,40 C800,70 1000,10 1200,45 C1320,60 1400,40 1440,35 L1440,80 L0,80Z" fill="var(--gray50)"/>
          </svg>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section">
        <div className="sec-inner">
          <div className="sec-badge">Platform Capabilities</div>
          <h2 className="sec-title">Built for Rwanda's<br/>flood reality</h2>
          <p className="sec-desc">Designed for MINEMA, RWB, and Meteo Rwanda — bridging critical data gaps with a unified, scalable system.</p>
          <div className="feat-grid">
            {FEATURES.map((f,i) => (
              <div className="feat-card" key={i}>
                <div className="feat-icon-wrap" style={{background:f.bg,border:`1px solid ${f.border}`}}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <div>
            <h2 className="cta-title">Ready to protect<br/>communities from floods?</h2>
            <p className="cta-sub">Request institutional access for your team today.</p>
          </div>
          <div className="cta-actions">
            <button className="btn-cta-primary" onClick={() => setPage("register")}>Request Access →</button>
            <button className="btn-cta-outline" onClick={() => setPage("help")}>Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ════════════════════════════════════════
   AUTH SHARED LEFT PANEL
════════════════════════════════════════ */
function AuthLeft({ title, sub, features }: { title: string; sub: string; features: [string, string, string][] }) {
  return (
    <div className="auth-left">
      <div className="auth-left-content">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 14s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M3 19s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".6"/>
            </svg>
          </div>
          <div>
            <div className="auth-brand-name">Rwanda Resilience Hub</div>
            <span className="auth-brand-sub">Flood Intelligence Platform</span>
          </div>
        </div>
        <h2 className="auth-left-title" dangerouslySetInnerHTML={{__html:title}}/>
        <p className="auth-left-sub">{sub}</p>
        <div className="auth-feats">
          {features.map(([icon,title,desc],i) => (
            <div className="auth-feat" key={i}>
              <div className="auth-feat-icon">{icon}</div>
              <div className="auth-feat-text">
                <strong>{title}</strong>
                <span>{desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-left-footer">
        <div className="auth-wave">
          <svg viewBox="0 0 500 60" preserveAspectRatio="none" style={{height:60}}>
            <path d="M0,30 C80,50 160,10 240,35 C320,58 400,20 500,30 L500,60 L0,60Z" fill="rgba(232,96,10,0.15)"/>
            <path d="M0,40 C100,20 200,55 300,35 C380,20 450,45 500,38 L500,60 L0,60Z" fill="rgba(232,96,10,0.08)"/>
          </svg>
        </div>
        <p className="auth-left-footnote">© 2025 University of Rwanda — School of ICT</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   LOGIN
════════════════════════════════════════ */
function Login({ setPage }: PageProps) {
  const [loading,setLoading] = useState(false);
  const [email,setEmail]     = useState("");
  const [pw,setPw]           = useState("");
  const [err,setErr]         = useState("");

  const submit = () => {
    if (!email || !pw) { setErr("Please fill in all fields."); return; }
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); setPage("verify"); }, 1600);
  };

  return (
    <div className="auth-shell page">
      <AuthLeft
        title='Welcome<br/>back <span class="hl">👋</span>'
        sub="Sign in to access real-time flood risk data, alerts, and prediction maps for Rwanda's river basins."
        features={[
          ["🌊","Live flood alerts","Updated every 15 min from sensor streams"],
          ["🤖","ML predictions","91%+ accuracy on flood risk classification"],
          ["🔔","Instant notifications","Alerts for at-risk zones across Rwanda"],
        ]}
      />
      <div className="auth-right">
        <div className="auth-form-box">
          <button className="back-btn" onClick={() => setPage("landing")}>← Back to home</button>
          <h2 className="form-title">Sign In</h2>
          <p className="form-sub">Access the flood monitoring dashboard</p>

          {err && <div className="alert alert-err">⚠ {err}</div>}

          <div className="form-field">
            <label className="form-label">Institutional Email</label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input className="form-input has-icon" type="email" placeholder="you@ur.ac.rw"
                value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input className="form-input has-icon" type="password" placeholder="Enter your password"
                value={pw} onChange={e => setPw(e.target.value)}
                onKeyDown={e => e.key==="Enter" && submit()}/>
            </div>
          </div>

          <div className="form-row">
            <div className="check-group">
              <input type="checkbox" id="rem"/>
              <label className="check-label" htmlFor="rem">Remember me</label>
            </div>
            <button className="link" onClick={() => setPage("forgot")}>Forgot password?</button>
          </div>

          <button className="submit-btn" onClick={submit} disabled={loading}>
            {loading ? <><div className="spinner"/>Signing in…</> : "Sign In →"}
          </button>

          <div className="or-divider">or continue with</div>
          <button className="google-btn">
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-3.59-13.46-8.71l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Sign in with Google (Gmail)
          </button>

          <div className="form-footer-row">
            No account?{" "}
            <button className="link" style={{fontWeight:700}} onClick={() => setPage("register")}>Request Access</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   REGISTER
════════════════════════════════════════ */
function Register({ setPage }: PageProps) {
  const [loading,setLoading] = useState(false);
  const submit = () => { setLoading(true); setTimeout(() => { setLoading(false); setPage("verify"); }, 1600); };

  return (
    <div className="auth-shell page">
      <AuthLeft
        title='Join the<br/><span class="hl">Community</span>'
        sub="Sign up to receive real-time flood alerts for your area. Help protect your family and community with early warnings and safety information."
        features={[
          ["🏠","Location-based alerts","Get warnings specific to your district/area"],
          ["📱","Mobile notifications","Real-time alerts on your phone"],
          ["👥","Community safety","Protect your family and neighbors"],
          ["📊","Risk information","Understand flood risks in your area"],
          ["🚨","Early warnings","Get alerts before flooding occurs"],
          ["🌍","National coverage","Available across all Rwanda provinces"]
        ]}
      />
      <div className="auth-right">
        <div className="auth-form-box">
          <button className="back-btn" onClick={() => setPage("landing")}>← Back to home</button>
          <h2 className="form-title">Create Account</h2>
          <p className="form-sub">Sign up to receive flood alerts for your area</p>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div className="form-field">
              <label className="form-label">First Name</label>
              <input className="form-input" type="text" placeholder="Benitha"/>
            </div>
            <div className="form-field">
              <label className="form-label">Last Name</label>
              <input className="form-input" type="text" placeholder="Ngunga"/>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Email Address</label>
            <div className="input-wrap">
              <span className="input-icon">✉</span>
              <input className="form-input has-icon" type="email" placeholder="your.email@example.com"/>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Your Location</label>
            <select className="form-input" defaultValue="">
              <option value="" disabled>Select your district/area</option>
              <option>Kigali City</option>
              <option>Northern Province</option>
              <option>Southern Province</option>
              <option>Eastern Province</option>
              <option>Western Province</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input className="form-input has-icon" type="password" placeholder="Create a strong password"/>
            </div>
          </div>

          <div className="check-group" style={{marginBottom:20}}>
            <input type="checkbox" id="terms"/>
            <label className="check-label" htmlFor="terms">
              I agree to the <button className="link">Terms of Use</button> and <button className="link">Data Access Policy</button>
            </label>
          </div>

          <button className="submit-btn" onClick={submit} disabled={loading}>
            {loading ? <><div className="spinner"/>Creating account…</> : "Create Account & Verify Email →"}
          </button>

          <div className="form-footer-row">
            Already have access?{" "}
            <button className="link" style={{fontWeight:700}} onClick={() => setPage("login")}>Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   FORGOT PASSWORD
════════════════════════════════════════ */
function Forgot({ setPage }: PageProps) {
  const [step,setStep]       = useState(1);
  const [email,setEmail]     = useState("");
  const [loading,setLoading] = useState(false);

  const send = () => {
    if (!email) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1500);
  };

  return (
    <div className="auth-shell page">
      <AuthLeft
        title='Secure<br/><span class="hl">Recovery</span>'
        sub="We'll send a secure one-time recovery link to your institutional email so you can regain access quickly."
        features={[
          ["🔐","Secure link","One-time password reset link"],
          ["⏱","Fast delivery","Recovery email within 60 seconds"],
          ["🛡","Monitored","All reset activity is logged"],
        ]}
      />
      <div className="auth-right">
        <div className="auth-form-box">
          <button className="back-btn" onClick={() => setPage("login")}>← Back to sign in</button>

          {step === 1 ? (
            <>
              <h2 className="form-title">Reset Password</h2>
              <p className="form-sub">Enter your email and we'll send a recovery link</p>
              <div className="form-field">
                <label className="form-label">Institutional Email</label>
                <div className="input-wrap">
                  <span className="input-icon">✉</span>
                  <input className="form-input has-icon" type="email" placeholder="you@ur.ac.rw"
                    value={email} onChange={e => setEmail(e.target.value)}/>
                </div>
              </div>
              <button className="submit-btn" onClick={send} disabled={loading || !email}>
                {loading ? <><div className="spinner"/>Sending…</> : "Send Recovery Link →"}
              </button>
            </>
          ) : (
            <>
              <div className="verify-icon" style={{fontSize:36}}>📧</div>
              <h2 className="form-title" style={{textAlign:"center"}}>Check Your Inbox</h2>
              <p className="form-sub" style={{textAlign:"center"}}>
                We sent a recovery link to<br/><strong style={{color:"var(--o400)"}}>{email}</strong>
              </p>
              <div className="alert alert-ok">✓ Recovery email sent. The link expires in 30 minutes.</div>
              <div className="alert alert-info">ℹ Check your spam folder if you don't see it within 2 minutes.</div>
              <button className="submit-btn" onClick={() => setPage("login")}>Return to Sign In →</button>
              <div className="form-footer-row" style={{marginTop:16}}>
                Didn't receive it? <button className="link" onClick={() => { setStep(1); setEmail(""); }}>Try again</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   EMAIL VERIFICATION
════════════════════════════════════════ */
function Verify({ setPage }: PageProps) {
  const [code,setCode]       = useState(["","","","","",""]);
  const [secs,setSecs]       = useState(300);
  const [loading,setLoading] = useState(false);
  const [done,setDone]       = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s-1)), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const onDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...code]; next[i] = v.slice(-1); setCode(next);
    if (v && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) document.getElementById(`otp-${i-1}`)?.focus();
  };
  const verify = () => {
    if (code.join("").length < 6) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setDone(true); }, 1500);
  };

  return (
    <div className="auth-shell page">
      <AuthLeft
        title='Verify your<br/><span class="hl">Email</span>'
        sub="Email verification ensures only authorized institutional users access Rwanda's flood risk data. Check your Gmail for the code."
        features={[
          ["✉","Check Gmail","6-digit code sent to your inbox"],
          ["⏱","Valid 5 minutes","Request a new code if yours expires"],
          ["🔒","Secure access","Prevents unauthorized activation"],
        ]}
      />
      <div className="auth-right">
        <div className="auth-form-box">

          {!done ? (
            <>
              <div className="verify-icon">📬</div>
              <h2 className="form-title" style={{textAlign:"center"}}>Enter Verification Code</h2>
              <p className="form-sub" style={{textAlign:"center"}}>
                We sent a 6-digit code to your Gmail account
              </p>

              {/* Progress */}
              <div className="steps-row">
                <div className="s-dot done">✓</div>
                <div className="s-line done"/>
                <div className="s-dot active">2</div>
                <div className="s-line"/>
                <div className="s-dot pending">3</div>
              </div>
              <div className="step-labels">
                <span style={{color:"var(--grn)"}}>Account</span>
                <span style={{color:"var(--o400)"}}>Verify</span>
                <span>Access</span>
              </div>

              <div className="otp-group">
                {code.map((d,i) => (
                  <input key={i} id={`otp-${i}`}
                    className={`otp-box${d?" filled":""}`}
                    maxLength={1} value={d}
                    onChange={e => onDigit(i, e.target.value)}
                    onKeyDown={e => onKey(i, e)}
                    inputMode="numeric"
                  />
                ))}
              </div>

              <button className="submit-btn" onClick={verify} disabled={loading || code.join("").length < 6}>
                {loading ? <><div className="spinner"/>Verifying…</> : "Verify & Access Platform →"}
              </button>

              <div className="countdown-text" style={{marginTop:14}}>
                {secs > 0
                  ? <>Code expires in <span className="countdown-num">{fmt(secs)}</span></>
                  : <>Code expired. <button className="link" onClick={() => setSecs(300)}>Resend code</button></>
                }
              </div>
            </>
          ) : (
            <>
              <div className="verify-icon" style={{fontSize:36,background:"var(--grn-lt)",border:"1px solid #BBF7D0"}}>✅</div>
              <h2 className="form-title" style={{textAlign:"center"}}>Email Verified!</h2>
              <p className="form-sub" style={{textAlign:"center"}}>
                Your account is now active. Welcome to the Rwanda Resilience Hub.
              </p>
              <div className="alert alert-ok">✓ Access granted. You can now view live flood risk data and alerts.</div>
              <button className="submit-btn" style={{marginTop:4}} onClick={() => setPage("landing")}>
                Go to Dashboard →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   HELP PAGE
════════════════════════════════════════ */
function Help({ setPage }: PageProps) {
  const [search,setSearch] = useState("");
  const [open,setOpen]     = useState<number | null>(null);

  const filtered = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="help-hero">
        <div className="sec-badge">Help Centre</div>
        <h1 className="help-title">How can we <span className="hl">help</span> you?</h1>
        <p className="help-sub">Find answers about the Rwanda Resilience Hub, account access, flood data, and alerts.</p>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search documentation, guides, FAQs…"
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
      </div>

      <div className="help-cats-grid">
        {[
          ["🚀","Getting Started","Account setup, first login, and access requests"],
          ["🌊","Flood Data","Understanding risk levels, data sources, and maps"],
          ["🔔","Alerts & Notifications","Configure early warning alerts for your region"],
          ["🤖","ML Predictions","How the model works and interpreting outputs"],
          ["🔐","Account & Security","Password reset, 2FA, and institutional access"],
          ["📞","Contact Support","Reach the UR ICT development team"],
        ].map(([icon,title,desc],i) => (
          <div className="help-cat-card" key={i}>
            <div className="help-cat-icon">{icon}</div>
            <div className="help-cat-title">{title}</div>
            <div className="help-cat-desc">{desc}</div>
            <div className="help-cat-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="faq-wrap">
        <h2 className="faq-section-title">Frequently Asked Questions</h2>
        {filtered.length === 0 && (
          <div className="alert alert-info">No results for "{search}". Try different keywords.</div>
        )}
        {filtered.map((item,i) => (
          <div className={`faq-item${open===i?" open":""}`} key={i}>
            <div className="faq-q" onClick={() => setOpen(open===i ? null : i)}>
              <span className="faq-q-text">{item.q}</span>
              <div className="faq-chevron">▾</div>
            </div>
            <div className={`faq-answer${open===i?" open":""}`}>
              <div className="faq-answer-inner">{item.a}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{maxWidth:780,margin:"0 auto 80px",padding:"0 48px"}}>
        <div style={{background:"linear-gradient(135deg, var(--o50), #FFF4EE)", border:"1px solid var(--o200)", borderRadius:"var(--radius-xl)", padding:"40px 48px", display:"flex", gap:32, alignItems:"center", flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            <h3 style={{fontFamily:"'Clash Display',sans-serif",fontSize:24,fontWeight:700,color:"var(--b900)",marginBottom:8}}>Still need help?</h3>
            <p style={{fontSize:14,color:"var(--gray600)",lineHeight:1.55}}>Contact the University of Rwanda School of ICT development team directly.</p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="btn-primary" onClick={() => setPage("login")}>Sign In for Support</button>
            <button className="btn-secondary">📧 Email Team</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   ABOUT PAGE
════════════════════════════════════════ */
function About({ setPage }: PageProps) {
  return (
    <div className="page">
      <div className="help-hero">
        <div className="sec-badge">About Us</div>
        <h2 className="help-title">Protecting <span className="hl">Rwanda</span> from Floods</h2>
        <p className="help-sub">Community-driven flood intelligence platform developed at the University of Rwanda School of ICT</p>
      </div>

      <div style={{maxWidth: 1100, margin: "0 auto", padding: "64px 48px"}}>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginBottom: 64}}>
          <div>
            <h3 style={{fontFamily: "'Clash Display', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--b900)", marginBottom: 16}}>Our Mission</h3>
            <p style={{fontSize: 16, color: "var(--gray600)", lineHeight: 1.7, marginBottom: 24}}>
              To provide real-time flood risk intelligence to communities across Rwanda, helping families protect themselves and their property from flood disasters through early warnings and actionable information.
            </p>
            <p style={{fontSize: 16, color: "var(--gray600)", lineHeight: 1.7}}>
              We combine cutting-edge technology with local knowledge to create a platform that serves all Rwandans, from urban Kigali to rural communities in the river basins.
            </p>
          </div>
          <div>
            <h3 style={{fontFamily: "'Clash Display', sans-serif", fontSize: 32, fontWeight: 700, color: "var(--b900)", marginBottom: 16}}>Technology</h3>
            <p style={{fontSize: 16, color: "var(--gray600)", lineHeight: 1.7, marginBottom: 24}}>
              Our platform integrates IoT sensors, satellite imagery, and machine learning to predict flood risks with high accuracy. We monitor Rwanda's major river basins including Nyabarongo, Sebeya, and Akagera.
            </p>
            <p style={{fontSize: 16, color: "var(--gray600)", lineHeight: 1.7}}>
              The system updates every 15 minutes, providing communities with timely alerts and safety information when flood risks increase.
            </p>
          </div>
        </div>

        <div style={{textAlign: "center", padding: "48px", background: "linear-gradient(135deg, var(--o50), #FFF4EE)", borderRadius: "var(--radius-xl)", border: "1px solid var(--o200)"}}>
          <h3 style={{fontFamily: "'Clash Display', sans-serif", fontSize: 28, fontWeight: 700, color: "var(--b900)", marginBottom: 16}}>University of Rwanda School of ICT</h3>
          <p style={{fontSize: 16, color: "var(--gray600)", lineHeight: 1.7, marginBottom: 32}}>
            Developed by students and faculty at the School of ICT, this project represents our commitment to using technology for social good and community resilience.
          </p>
          <button className="btn-primary" onClick={() => setPage("register")}>Join Our Community →</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   ROOT
════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState("landing");
  const showNav = ["landing","help","about"].includes(page);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: CSS}}/>
      {showNav && <Navbar setPage={setPage}/>}
      {page === "landing"  && <Landing  setPage={setPage}/>}
      {page === "login"    && <Login    setPage={setPage}/>}
      {page === "register" && <Register setPage={setPage}/>}
      {page === "forgot"   && <Forgot   setPage={setPage}/>}
      {page === "verify"   && <Verify   setPage={setPage}/>}
      {page === "help"     && <Help     setPage={setPage}/>}
      {page === "about"    && <About    setPage={setPage}/>}
    </>
  );
}
