import React, { useState, useEffect, useRef } from "react";
import type { Page, PageProps } from "../types";

/* ═══════════════════════════════════════════════════════════
   Rwanda Resilience Hub
   Built by Benitha NGUNGA & Yvette Tuyizere
   University of Rwanda · School of ICT · Capstone 2025
═══════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');
@import url('https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&display=swap');

:root {
  --brand-50:#FFF4EE;  --brand-100:#FFE4CC; --brand-200:#FFBE8A;
  --brand-300:#F59040; --brand-400:#E8600A; --brand-500:#C84D00;
  --navy-900:#0F1923;  --navy-800:#1C2B38;  --navy-700:#2E4155;
  --red:#DC2626;    --red-lt:#FEF2F2;    --red-bd:#FECACA;
  --grn:#16A34A;    --grn-lt:#F0FDF4;    --grn-bd:#BBF7D0;
  --blue:#2563EB;   --blue-lt:#EFF6FF;   --blue-bd:#BFDBFE;
  --white:#FFFFFF;
  --g50:#F9FAFB; --g100:#F3F4F6; --g200:#E5E7EB;
  --g300:#D1D5DB; --g400:#9CA3AF; --g500:#6B7280;
  --g600:#4B5563; --g700:#374151; --g800:#1F2937; --g900:#111827;
  --sh-xs:0 1px 2px rgba(0,0,0,.05);
  --sh-sm:0 1px 3px rgba(0,0,0,.1),0 1px 2px rgba(0,0,0,.06);
  --sh-md:0 4px 6px rgba(0,0,0,.07),0 2px 4px rgba(0,0,0,.06);
  --sh-lg:0 10px 15px rgba(0,0,0,.1),0 4px 6px rgba(0,0,0,.05);
  --sh-xl:0 20px 25px rgba(0,0,0,.1),0 8px 10px rgba(0,0,0,.04);
  --r2:4px; --r4:8px; --r6:10px; --r8:14px; --r10:18px; --r12:24px;
  --fd:'Clash Display','Plus Jakarta Sans',sans-serif;
  --fb:'Plus Jakarta Sans',sans-serif;
}

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:var(--fb);background:#fff;color:var(--g900);-webkit-font-smoothing:antialiased;}
h1,h2,h3,h4{font-family:var(--fd);font-weight:600;letter-spacing:-.02em;}
button{font-family:var(--fb);cursor:pointer;}
input,select,textarea{font-family:var(--fb);}

::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:var(--g100);}
::-webkit-scrollbar-thumb{background:var(--brand-200);border-radius:10px;}

.page{animation:pageIn .35s cubic-bezier(.16,1,.3,1) both;}
@keyframes pageIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}

/* ───────────────────────────────────────
   NAV  — logo left · links center · actions right
─────────────────────────────────────── */
.nav{
  position:fixed;top:0;left:0;right:0;z-index:700;
  height:62px;
  background:rgba(255,255,255,.94);
  backdrop-filter:blur(20px);
  border-bottom:1px solid var(--g200);
  box-shadow:var(--sh-xs);
}
.nav-inner{
  max-width:1280px;margin:0 auto;height:100%;
  display:flex;align-items:center;
  padding:0 36px;gap:0;
}
/* logo — fixed width so center links stay truly centred */
.nav-logo{
  display:flex;align-items:center;gap:9px;cursor:pointer;
  flex:0 0 auto;text-decoration:none;
}
.nav-logo-icon{
  width:34px;height:34px;border-radius:8px;
  background:linear-gradient(135deg,var(--brand-400),var(--brand-300));
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 2px 8px rgba(232,96,10,.25);flex-shrink:0;
}
.nav-logo-icon svg{width:17px;height:17px;}
.nav-logo-text{}
.nav-logo-name{
  font-family:var(--fd);font-size:14px;font-weight:700;
  color:var(--navy-900);line-height:1.15;white-space:nowrap;
}
.nav-logo-tag{
  font-size:9.5px;color:var(--brand-400);font-weight:600;
  letter-spacing:.05em;display:block;white-space:nowrap;
}

/* center links */
.nav-links{
  flex:1;display:flex;align-items:center;justify-content:center;gap:2px;
}
.nav-lnk{
  padding:6px 13px;border-radius:var(--r4);
  font-size:13.5px;font-weight:500;color:var(--g600);
  border:none;background:none;transition:all .15s;white-space:nowrap;
}
.nav-lnk:hover{color:var(--brand-400);background:var(--brand-50);}

/* right actions */
.nav-actions{
  flex:0 0 auto;display:flex;align-items:center;gap:8px;
}
.btn-nav-out{
  padding:7px 15px;border-radius:var(--r4);
  font-size:13.5px;font-weight:500;color:var(--g700);
  border:1.5px solid var(--g200);background:#fff;transition:all .15s;
  white-space:nowrap;
}
.btn-nav-out:hover{border-color:var(--brand-300);color:var(--brand-400);}
.btn-nav-fill{
  padding:7px 17px;border-radius:var(--r4);
  font-size:13.5px;font-weight:600;color:#fff;border:none;
  background:linear-gradient(135deg,var(--brand-400),var(--brand-300));
  box-shadow:0 1px 6px rgba(232,96,10,.22);transition:all .2s;
  white-space:nowrap;
}
.btn-nav-fill:hover{
  background:linear-gradient(135deg,var(--brand-500),var(--brand-400));
  box-shadow:0 3px 12px rgba(232,96,10,.3);transform:translateY(-1px);
}

/* ───────────────────────────────────────
   LIVE TICKER
─────────────────────────────────────── */
.ticker{
  position:fixed;top:62px;left:0;right:0;z-index:690;
  height:30px;overflow:hidden;display:flex;align-items:center;
  background:linear-gradient(90deg,var(--brand-500),var(--brand-400));
}
.ticker-tag{
  padding:0 13px;background:rgba(0,0,0,.18);height:100%;
  display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0;
  font-size:10px;font-weight:700;color:#fff;letter-spacing:.1em;text-transform:uppercase;
}
.ticker-dot{width:5px;height:5px;border-radius:50%;background:#fff;animation:blink 1.2s ease infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.ticker-scroll{flex:1;overflow:hidden;}
.ticker-text{
  display:flex;gap:52px;white-space:nowrap;align-items:center;height:30px;
  font-size:11px;font-weight:600;color:#fff;letter-spacing:.02em;
  animation:tickerRun 30s linear infinite;
}
@keyframes tickerRun{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ───────────────────────────────────────
   HERO SECTION
   Layout: two columns side by side
   Left = copy (45%) · Right = map (55%)
─────────────────────────────────────── */
.hero{
  padding-top:92px;   /* nav 62px + ticker 30px */
  background:#fff;
  min-height:100vh;
  display:flex;flex-direction:column;
}
.hero-body{
  display:grid;
  grid-template-columns:45% 55%;
  flex:1;
  border-bottom:1px solid var(--g200);
}

/* LEFT — all copy content */
.hero-left{
  padding:40px 40px 40px 44px;
  display:flex;flex-direction:column;justify-content:center;
  gap:0;border-right:1px solid var(--g200);
  overflow:auto;
}

.eyebrow{
  display:inline-flex;align-items:center;gap:7px;
  background:var(--brand-50);border:1px solid var(--brand-200);
  color:var(--brand-500);padding:5px 12px;border-radius:100px;
  font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;
  margin-bottom:18px;width:fit-content;
}
.e-pulse{width:6px;height:6px;border-radius:50%;background:var(--brand-400);animation:pulse 2s ease-in-out infinite;}
@keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(.7);opacity:.5}}

.hero-h1{
  font-size:clamp(36px,3.8vw,56px);font-weight:700;
  line-height:1.0;color:var(--navy-900);margin-bottom:6px;
}
.hero-h1 .accent{color:var(--brand-400);}
.hero-h1 .underlined{position:relative;display:inline-block;}
.hero-h1 .underlined::after{
  content:'';position:absolute;bottom:-3px;left:0;right:0;height:4px;
  background:linear-gradient(90deg,var(--brand-400),var(--brand-200));border-radius:2px;
}

.hero-desc{
  font-size:15px;line-height:1.75;color:var(--g500);
  margin:18px 0 24px;max-width:420px;
}

.hero-btns{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:28px;}

.btn-fill{
  display:inline-flex;align-items:center;gap:7px;
  padding:12px 24px;border-radius:var(--r6);
  background:linear-gradient(135deg,var(--brand-400),var(--brand-300));
  color:#fff;font-size:14.5px;font-weight:600;border:none;
  box-shadow:0 4px 16px rgba(232,96,10,.26);transition:all .2s;
}
.btn-fill:hover{
  background:linear-gradient(135deg,var(--brand-500),var(--brand-400));
  transform:translateY(-2px);box-shadow:0 7px 22px rgba(232,96,10,.32);
}
.btn-empty{
  display:inline-flex;align-items:center;gap:7px;
  padding:11px 24px;border-radius:var(--r6);
  background:#fff;color:var(--navy-800);
  font-size:14.5px;font-weight:600;border:1.5px solid var(--g200);transition:all .2s;
}
.btn-empty:hover{border-color:var(--brand-300);color:var(--brand-500);background:var(--brand-50);}

/* Zone list */
.zone-list{
  border:1px solid var(--g200);border-radius:var(--r8);
  overflow:hidden;box-shadow:var(--sh-sm);
}
.zone-list-head{
  padding:9px 14px;border-bottom:1px solid var(--g200);
  display:flex;align-items:center;justify-content:space-between;
  background:var(--g50);
}
.zone-list-label{font-size:10px;font-weight:700;color:var(--g500);letter-spacing:.07em;text-transform:uppercase;}
.zone-live-badge{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:var(--grn);}
.live-dot{width:5px;height:5px;border-radius:50%;background:var(--grn);animation:blink 1.4s infinite;}

.zone-row{
  display:flex;align-items:center;justify-content:space-between;
  padding:9px 14px;cursor:pointer;
  border-bottom:1px solid var(--g100);
  border-left:2px solid transparent;
  transition:all .15s;
}
.zone-row:last-child{border-bottom:none;}
.zone-row:hover,.zone-row.sel{background:var(--g50);border-left-color:var(--brand-400);}
.zone-left{display:flex;align-items:center;gap:8px;}
.zdot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.zname{font-size:12.5px;color:var(--g800);font-weight:500;}

.rbadge{font-size:9px;font-weight:700;padding:2px 8px;border-radius:100px;text-transform:uppercase;letter-spacing:.05em;}
.rb-c{background:#FEE2E2;color:#B91C1C;}
.rb-h{background:#FFEDD5;color:#C2410C;}
.rb-m{background:#FEF9C3;color:#854D0E;}
.rb-l{background:var(--grn-lt);color:#15803D;}

/* RIGHT — map */
.hero-right{position:relative;overflow:hidden;min-height:500px;}
.map-wrap{position:absolute;inset:0;}

/* Map overlays */
.map-top-bar{
  position:absolute;top:0;left:0;right:0;z-index:30;
  background:rgba(15,25,35,.85);backdrop-filter:blur(8px);
  padding:8px 14px;
  display:flex;align-items:center;justify-content:space-between;
}
.map-top-title{font-size:11px;font-weight:700;color:#fff;font-family:var(--fd);letter-spacing:.03em;}
.map-top-live{display:flex;align-items:center;gap:5px;font-size:10px;font-weight:700;color:#4ADE80;}
.map-live-dot{width:5px;height:5px;border-radius:50%;background:#4ADE80;animation:blink 1.2s infinite;}

/* Zone detail card on map */
.zone-card{
  position:absolute;bottom:16px;left:16px;z-index:60;
  background:rgba(255,255,255,.97);backdrop-filter:blur(12px);
  border:1px solid var(--g200);border-radius:var(--r8);
  padding:13px 15px;min-width:230px;max-width:280px;
  box-shadow:var(--sh-xl);animation:cardIn .3s ease;
}
@keyframes cardIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.zc-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:7px;}
.zc-name{font-family:var(--fd);font-size:13px;font-weight:700;color:var(--navy-900);line-height:1.25;}
.zc-desc{font-size:11px;color:var(--g400);line-height:1.55;margin-bottom:9px;}
.zc-metrics{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.zc-m{background:var(--g50);border-radius:5px;padding:6px 8px;}
.zc-m-lbl{font-size:9px;color:var(--g400);font-weight:700;text-transform:uppercase;letter-spacing:.07em;margin-bottom:2px;}
.zc-m-val{font-family:var(--fd);font-size:13px;font-weight:700;}
.zc-time{font-size:9.5px;color:var(--g300);margin-top:7px;}

/* Map legend */
.map-legend{
  position:absolute;top:48px;right:12px;z-index:60;
  background:rgba(255,255,255,.96);backdrop-filter:blur(10px);
  border:1px solid var(--g200);border-radius:var(--r6);
  padding:9px 12px;box-shadow:var(--sh-md);
}
.ml-title{font-size:9px;color:var(--g400);font-weight:700;text-transform:uppercase;letter-spacing:.09em;margin-bottom:6px;}
.ml-row{display:flex;align-items:center;gap:7px;margin-bottom:4px;font-size:11px;color:var(--g500);}
.ml-row:last-child{margin-bottom:0;}
.ml-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

/* Leaflet */
.leaflet-container{background:#0a1628 !important;font-family:var(--fb) !important;}
.leaflet-control-zoom a{background:#0d2238 !important;color:#5ba3c9 !important;border-color:#1a3a55 !important;font-size:16px !important;}
.leaflet-control-zoom a:hover{background:#1a3a55 !important;color:#a8d8f0 !important;}
.leaflet-bar{border:1px solid #1a3a5566 !important;border-radius:6px !important;overflow:hidden;}
.leaflet-control-attribution{display:none !important;}
@keyframes mapPing{0%{transform:scale(1);opacity:.38}70%{transform:scale(2.8);opacity:0}100%{opacity:0}}

/* hero bottom wave */
.hero-wave{line-height:0;}
.hero-wave svg{display:block;width:100%;}

/* ───────────────────────────────────────
   STATS STRIP
─────────────────────────────────────── */
.stats-strip{background:var(--g50);border-bottom:1px solid var(--g200);}
.stats-inner{max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);}
.stat-box{padding:20px 24px;border-right:1px solid var(--g200);}
.stat-box:last-child{border-right:none;}
.stat-num{font-family:var(--fd);font-size:28px;font-weight:700;color:var(--brand-400);line-height:1;margin-bottom:3px;}
.stat-num.red{color:var(--red);}
.stat-lbl{font-size:11px;color:var(--g400);font-weight:500;}

/* ───────────────────────────────────────
   FEATURES
─────────────────────────────────────── */
.sec{padding:80px 40px;}
.sec-gray{background:var(--g50);}
.sec-in{max-width:1280px;margin:0 auto;}
.sec-tag{
  display:inline-flex;align-items:center;gap:5px;
  background:var(--brand-50);border:1px solid var(--brand-100);
  color:var(--brand-500);padding:4px 11px;border-radius:100px;
  font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;margin-bottom:12px;
}
.sec-h2{font-size:clamp(28px,3.5vw,40px);font-weight:700;color:var(--navy-900);line-height:1.12;margin-bottom:10px;}
.sec-desc{font-size:15px;color:var(--g500);line-height:1.7;max-width:460px;margin-bottom:44px;}

.feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.feat-card{
  background:#fff;border:1px solid var(--g200);border-radius:var(--r8);
  padding:22px;position:relative;overflow:hidden;transition:all .22s;
}
.feat-card::before{
  content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--brand-400),var(--brand-200));
  transform:scaleX(0);transform-origin:left;transition:transform .26s;
}
.feat-card:hover{border-color:var(--brand-200);box-shadow:var(--sh-lg);transform:translateY(-3px);}
.feat-card:hover::before{transform:scaleX(1);}
.feat-ico{width:42px;height:42px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:19px;margin-bottom:13px;}
.feat-name{font-family:var(--fd);font-size:15px;font-weight:600;color:var(--navy-900);margin-bottom:6px;}
.feat-text{font-size:13px;color:var(--g500);line-height:1.65;}

/* ───────────────────────────────────────
   CTA BAND
─────────────────────────────────────── */
.cta-wrap{max-width:1280px;margin:0 auto;}
.cta-band{
  background:linear-gradient(135deg,var(--navy-900),var(--navy-800),#1A3550);
  border-radius:var(--r12);padding:52px 56px;
  display:flex;justify-content:space-between;align-items:center;
  gap:32px;flex-wrap:wrap;position:relative;overflow:hidden;
}
.cta-band::before{content:'';position:absolute;right:-44px;top:-44px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(232,96,10,.18),transparent 66%);}
.cta-h2{font-size:clamp(24px,3vw,34px);font-weight:700;color:#fff;line-height:1.2;margin-bottom:7px;position:relative;z-index:1;}
.cta-sub{font-size:14px;color:rgba(255,255,255,.55);position:relative;z-index:1;}
.cta-btns{display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:1;}
.btn-cta-fill{padding:12px 26px;background:var(--brand-400);color:#fff;border:none;border-radius:var(--r6);font-size:14.5px;font-weight:700;box-shadow:0 4px 16px rgba(232,96,10,.35);transition:all .2s;}
.btn-cta-fill:hover{background:var(--brand-300);transform:translateY(-2px);}
.btn-cta-out{padding:11px 26px;background:transparent;color:#fff;border:1.5px solid rgba(255,255,255,.22);border-radius:var(--r6);font-size:14.5px;font-weight:600;transition:all .2s;}
.btn-cta-out:hover{border-color:rgba(255,255,255,.55);background:rgba(255,255,255,.05);}

/* ───────────────────────────────────────
   FOOTER
─────────────────────────────────────── */
.footer{background:var(--g50);border-top:1px solid var(--g200);padding:24px 40px;}
.footer-in{max-width:1280px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;}
.footer-brand{font-family:var(--fd);font-size:13.5px;font-weight:700;color:var(--navy-900);}
.footer-note{font-size:11.5px;color:var(--g400);text-align:center;}
.footer-note span{color:var(--brand-400);font-weight:600;}

/* ───────────────────────────────────────
   AUTH SHELL
─────────────────────────────────────── */
.auth-shell{min-height:100vh;display:grid;grid-template-columns:460px 1fr;}
.auth-left{
  background:linear-gradient(160deg,var(--navy-900),var(--navy-800),#1C3550);
  padding:48px 44px;display:flex;flex-direction:column;justify-content:space-between;
  position:relative;overflow:hidden;
}
.auth-left::before{
  content:'';position:absolute;inset:0;
  background:
    radial-gradient(ellipse 70% 42% at 50% 100%,rgba(232,96,10,.17),transparent 56%),
    radial-gradient(ellipse 52% 32% at 100% 0%,rgba(232,96,10,.06),transparent 46%);
}
.auth-left-wave{position:absolute;bottom:0;left:0;right:0;}
.auth-left-wave svg{display:block;width:100%;}
.auth-left-body{position:relative;z-index:1;}
.auth-left-foot{position:relative;z-index:1;}
.auth-brand{display:flex;align-items:center;gap:9px;margin-bottom:48px;}
.auth-brand-icon{width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,var(--brand-400),var(--brand-300));display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(232,96,10,.26);}
.auth-brand-icon svg{width:19px;height:19px;}
.auth-brand-name{font-family:var(--fd);font-size:15px;font-weight:700;color:#fff;}
.auth-brand-tag{font-size:9.5px;color:var(--brand-300);font-weight:600;letter-spacing:.05em;display:block;}
.auth-left-title{font-size:32px;font-weight:700;color:#fff;line-height:1.1;margin-bottom:13px;}
.auth-left-title .hi{color:var(--brand-300);}
.auth-left-sub{font-size:13.5px;color:rgba(255,255,255,.52);line-height:1.7;margin-bottom:36px;max-width:300px;}
.auth-feats{display:flex;flex-direction:column;gap:12px;}
.auth-feat{display:flex;align-items:flex-start;gap:11px;}
.auth-feat-ico{width:30px;height:30px;border-radius:7px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:1px;}
.auth-feat-body{font-size:12.5px;line-height:1.5;}
.auth-feat-body strong{color:#fff;display:block;font-weight:600;margin-bottom:1px;}
.auth-feat-body span{color:rgba(255,255,255,.46);}
.auth-left-note{font-size:10.5px;color:rgba(255,255,255,.22);}

.auth-right{background:#fff;display:flex;align-items:center;justify-content:center;padding:36px 48px;min-height:100vh;}
.auth-box{width:100%;max-width:400px;}
.auth-back{display:inline-flex;align-items:center;gap:4px;font-size:12.5px;color:var(--g400);border:none;background:none;margin-bottom:22px;padding:0;transition:color .15s;}
.auth-back:hover{color:var(--brand-400);}
.auth-title{font-size:24px;font-weight:700;color:var(--navy-900);margin-bottom:4px;}
.auth-sub{font-size:13px;color:var(--g400);margin-bottom:22px;line-height:1.5;}

/* Form */
.field{margin-bottom:16px;}
.field-lbl{display:block;font-size:12.5px;font-weight:600;color:var(--g700);margin-bottom:5px;}
.field-wrap{position:relative;}
.field-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--g300);pointer-events:none;}
.field-in{width:100%;padding:10px 13px;background:var(--g50);color:var(--g900);border:1.5px solid var(--g200);border-radius:var(--r4);font-size:13.5px;outline:none;transition:all .18s;}
.field-in.ico{padding-left:36px;}
.field-in:focus{border-color:var(--brand-400);box-shadow:0 0 0 3px rgba(232,96,10,.09);background:#fff;}
.field-in::placeholder{color:var(--g300);}
select.field-in{cursor:pointer;}
.form-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.check-row{display:flex;align-items:center;gap:6px;}
.check-row input{accent-color:var(--brand-400);width:14px;height:14px;}
.check-row label{font-size:12.5px;color:var(--g600);}
.tlink{background:none;border:none;color:var(--brand-400);font-size:12.5px;font-weight:600;padding:0;transition:color .15s;}
.tlink:hover{color:var(--brand-500);text-decoration:underline;}
.btn-sub{width:100%;padding:11.5px;border:none;border-radius:var(--r6);background:linear-gradient(135deg,var(--brand-400),var(--brand-300));color:#fff;font-size:14.5px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:7px;box-shadow:0 3px 12px rgba(232,96,10,.2);transition:all .2s;}
.btn-sub:hover{background:linear-gradient(135deg,var(--brand-500),var(--brand-400));transform:translateY(-1px);}
.btn-sub:disabled{background:linear-gradient(135deg,var(--brand-200),var(--brand-100));box-shadow:none;cursor:not-allowed;transform:none;color:rgba(255,255,255,.6);}
.divider{display:flex;align-items:center;gap:9px;margin:14px 0;font-size:11.5px;color:var(--g300);}
.divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--g200);}
.btn-google{width:100%;padding:10px;background:#fff;color:var(--g700);border:1.5px solid var(--g200);border-radius:var(--r6);font-size:13.5px;font-weight:500;display:flex;align-items:center;justify-content:center;gap:8px;transition:all .18s;}
.btn-google:hover{border-color:var(--brand-300);background:var(--brand-50);color:var(--brand-500);}
.form-switch{margin-top:16px;text-align:center;font-size:13px;color:var(--g400);}

/* Alerts */
.msg{padding:10px 13px;border-radius:var(--r4);font-size:12.5px;display:flex;align-items:flex-start;gap:8px;margin-bottom:13px;line-height:1.5;}
.msg-err{background:var(--red-lt);border:1px solid var(--red-bd);color:#B91C1C;}
.msg-ok{background:var(--grn-lt);border:1px solid var(--grn-bd);color:#166534;}
.msg-info{background:var(--blue-lt);border:1px solid var(--blue-bd);color:#1D4ED8;}

/* OTP */
.otp-row{display:flex;gap:8px;justify-content:center;margin:18px 0;}
.otp-cell{width:46px;height:52px;border-radius:var(--r6);background:var(--g50);border:1.5px solid var(--g200);text-align:center;font-size:20px;font-weight:700;color:var(--brand-400);outline:none;transition:all .18s;font-family:var(--fd);}
.otp-cell:focus{border-color:var(--brand-400);box-shadow:0 0 0 3px rgba(232,96,10,.09);background:#fff;}
.otp-cell.filled{background:var(--brand-50);border-color:var(--brand-200);}

/* Step indicator */
.steps{display:flex;align-items:center;margin-bottom:4px;}
.sdot{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;transition:all .2s;font-family:var(--fd);}
.sdot.done{background:var(--grn);color:#fff;}
.sdot.active{background:var(--brand-400);color:#fff;box-shadow:0 0 0 4px rgba(232,96,10,.14);}
.sdot.idle{background:var(--g100);color:var(--g400);border:1.5px solid var(--g200);}
.sline{flex:1;height:2px;background:var(--g200);}
.sline.done{background:var(--grn);}
.step-labels{display:flex;justify-content:space-between;font-size:10px;color:var(--g400);font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin-bottom:18px;}
.verify-icon{width:62px;height:62px;border-radius:16px;background:linear-gradient(135deg,var(--brand-50),var(--brand-100));border:1px solid var(--brand-200);display:flex;align-items:center;justify-content:center;font-size:26px;margin:0 auto 18px;}
.countdown{text-align:center;margin-top:11px;font-size:12.5px;color:var(--g400);}
.countdown strong{color:var(--brand-400);font-family:var(--fd);}

/* ───────────────────────────────────────
   HELP PAGE
─────────────────────────────────────── */
.help-top{padding:110px 40px 56px;background:linear-gradient(180deg,var(--brand-50),#fff);text-align:center;border-bottom:1px solid var(--g200);}
.help-h1{font-size:clamp(32px,4.5vw,48px);font-weight:700;color:var(--navy-900);margin-bottom:9px;}
.help-h1 .hi{color:var(--brand-400);}
.help-sub{font-size:15px;color:var(--g500);max-width:420px;margin:0 auto 20px;line-height:1.65;}
.search-wrap{max-width:480px;margin:0 auto;position:relative;}
.search-in{width:100%;padding:13px 16px 13px 42px;background:#fff;border:1.5px solid var(--g200);border-radius:var(--r6);font-size:14.5px;outline:none;box-shadow:var(--sh-md);transition:all .18s;color:var(--g900);}
.search-in:focus{border-color:var(--brand-400);box-shadow:0 0 0 3px rgba(232,96,10,.09),var(--sh-md);}
.search-in::placeholder{color:var(--g300);}
.search-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:16px;color:var(--g300);}

.cat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;max-width:980px;margin:0 auto;padding:48px 40px 0;}
.cat-card{background:#fff;border:1px solid var(--g200);border-radius:var(--r8);padding:20px;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;gap:7px;}
.cat-card:hover{border-color:var(--brand-300);box-shadow:var(--sh-md);transform:translateY(-2px);}
.cat-ico{font-size:24px;}
.cat-name{font-family:var(--fd);font-size:14px;font-weight:600;color:var(--navy-900);}
.cat-desc{font-size:11.5px;color:var(--g400);line-height:1.5;}
.cat-arrow{font-size:13px;color:var(--brand-400);margin-top:auto;font-weight:700;}

.faq-sec{max-width:700px;margin:0 auto;padding:56px 40px 64px;}
.faq-h2{font-family:var(--fd);font-size:26px;font-weight:700;color:var(--navy-900);margin-bottom:20px;}
.faq-item{border:1px solid var(--g200);border-radius:var(--r6);margin-bottom:7px;overflow:hidden;background:#fff;transition:border-color .18s,box-shadow .18s;}
.faq-item.open{border-color:var(--brand-200);box-shadow:0 0 0 3px rgba(232,96,10,.05);}
.faq-q{padding:14px 18px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;}
.faq-q-text{font-size:13.5px;font-weight:600;color:var(--g900);}
.faq-chev{width:22px;height:22px;border-radius:50%;background:var(--g100);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--g400);transition:all .2s;flex-shrink:0;}
.faq-item.open .faq-chev{background:var(--brand-100);color:var(--brand-500);transform:rotate(180deg);}
.faq-ans{max-height:0;overflow:hidden;transition:max-height .3s ease;}
.faq-ans.open{max-height:220px;}
.faq-ans-body{padding:11px 18px 15px;font-size:13px;color:var(--g500);line-height:1.75;border-top:1px solid var(--g100);}

/* ───────────────────────────────────────
   ABOUT PAGE
─────────────────────────────────────── */
.about-top{padding:110px 40px 56px;background:linear-gradient(180deg,var(--brand-50),#fff);text-align:center;border-bottom:1px solid var(--g200);}
.about-h1{font-size:clamp(32px,4.5vw,48px);font-weight:700;color:var(--navy-900);margin-bottom:9px;}
.about-h1 .hi{color:var(--brand-400);}
.about-sub{font-size:15px;color:var(--g500);max-width:480px;margin:0 auto;line-height:1.65;}
.team-card{display:flex;gap:13px;align-items:flex-start;padding:16px 0;border-bottom:1px solid var(--g200);}
.team-avatar{width:46px;height:46px;border-radius:11px;background:linear-gradient(135deg,var(--brand-100),var(--brand-200));display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;}
.team-name{font-family:var(--fd);font-size:14.5px;font-weight:700;color:var(--navy-900);margin-bottom:2px;}
.team-role{font-size:12px;color:var(--g400);line-height:1.5;}
.team-tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:5px;}
.team-tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:100px;background:var(--brand-50);color:var(--brand-500);border:1px solid var(--brand-100);}
.meta-row{display:flex;justify-content:space-between;align-items:flex-start;padding:11px 0;border-bottom:1px solid var(--g100);}
.meta-k{font-size:10px;color:var(--g400);font-weight:700;letter-spacing:.05em;text-transform:uppercase;flex-shrink:0;padding-right:12px;}
.meta-v{font-size:12.5px;color:var(--g700);text-align:right;}

/* ───────────────────────────────────────
   SHARED UTILITIES
─────────────────────────────────────── */
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{width:15px;height:15px;border-radius:50%;border:2.5px solid rgba(255,255,255,.28);border-top-color:#fff;animation:spin .6s linear infinite;}

@media(max-width:1050px){
  .hero-body{grid-template-columns:1fr;}
  .hero-right{min-height:380px;}
  .auth-shell{grid-template-columns:1fr;}
  .auth-left{display:none;}
  .feat-grid{grid-template-columns:1fr 1fr;}
  .cat-grid{grid-template-columns:1fr 1fr;}
  .stats-inner{grid-template-columns:1fr 1fr;}
}
@media(max-width:680px){
  .nav-inner{padding:0 20px;}
  .nav-links{display:none;}
  .hero-left{padding:28px 20px;}
  .sec,.cta-band{padding:52px 20px;}
  .feat-grid,.cat-grid{grid-template-columns:1fr;}
  .stats-inner{grid-template-columns:1fr 1fr;}
  .auth-right{padding:28px 20px;}
}
`;

/* ── Zone data ──────────────────────────────────────────── */
type RL = "CRITICAL"|"HIGH"|"MODERATE"|"LOW";
interface Zone { id:number;name:string;lat:number;lng:number;level:RL;rainfall:string;river:string;updated:string;desc:string; }

const ZONES:Zone[] = [
  {id:1,name:"Nyabugogo Wetland", lat:-1.9441,lng:30.0619,level:"CRITICAL",rainfall:"142 mm/day",river:"4.8 m",updated:"2 min ago",desc:"Central Kigali wetland. High runoff due to construction and impermeable surfaces."},
  {id:2,name:"Sebeya River Basin",lat:-1.6800,lng:29.3800,level:"HIGH",    rainfall:"98 mm/day", river:"3.2 m",updated:"5 min ago",desc:"Western Rwanda catchment. Previously caused displacement of Rubavu residents."},
  {id:3,name:"Nyabarongo River",  lat:-2.1500,lng:29.9500,level:"MODERATE",rainfall:"61 mm/day", river:"2.1 m",updated:"11 min ago",desc:"Major central Rwanda river basin, approaching moderate flood thresholds."},
  {id:4,name:"Kigali Urban Zone", lat:-1.9706,lng:30.1044,level:"HIGH",    rainfall:"87 mm/day", river:"2.9 m",updated:"3 min ago",desc:"Expanding urban area with reduced natural water infiltration capacity."},
  {id:5,name:"Akagera Wetlands",  lat:-1.8700,lng:30.6500,level:"LOW",     rainfall:"28 mm/day", river:"1.1 m",updated:"18 min ago",desc:"Eastern lowlands — stable. Monitored as a baseline reference zone."},
];

const RISK = {
  CRITICAL:{color:"#DC2626",glow:"rgba(220,38,38,.48)",badge:"rb-c",radius:18000},
  HIGH:    {color:"#EA580C",glow:"rgba(234,88,12,.44)", badge:"rb-h",radius:13000},
  MODERATE:{color:"#CA8A04",glow:"rgba(202,138,4,.44)", badge:"rb-m",radius:8500 },
  LOW:     {color:"#16A34A",glow:"rgba(22,163,74,.4)",  badge:"rb-l",radius:5000 },
};

const FEATURES = [
  {icon:"🌊",bg:"#FFF4EE",bd:"#FFE4CC",name:"Real-Time Monitoring",   text:"Live sensor and API data from NASA POWER, OpenWeather, and simulated IoT streams — refreshed every 15 minutes."},
  {icon:"🤖",bg:"#EFF6FF",bd:"#DBEAFE",name:"ML Risk Classification", text:"Random Forest model trained on historical flood data classifies conditions as Low, Moderate, High, or Critical risk."},
  {icon:"🗺️",bg:"#F0FDF4",bd:"#DCFCE7",name:"Interactive Risk Maps",  text:"Leaflet-powered geospatial maps display flood zones across Nyabarongo, Sebeya, Nyabugogo, and urban Kigali."},
  {icon:"📡",bg:"#FFF7ED",bd:"#FED7AA",name:"IoT Sensor Simulation",  text:"Simulated sensor streams validate real-time data ingestion and demonstrate extensibility for physical deployment."},
  {icon:"🔔",bg:"#FEF2F2",bd:"#FECACA",name:"Automated Alerts",       text:"When risk thresholds are exceeded, the system dispatches alerts to MINEMA, RWB, and registered community members."},
  {icon:"📊",bg:"#F5F3FF",bd:"#EDE9FE",name:"Analytics Dashboard",    text:"Track rainfall trends, river levels, and ML confidence scores — with exportable data for disaster management agencies."},
];

const FAQS = [
  {q:"What is the Rwanda Resilience Hub?",    a:"RRH is a full-stack flood risk prediction platform built by Benitha NGUNGA and Yvette Tuyizere as a capstone project at the University of Rwanda. It combines satellite data, simulated IoT sensor streams, and machine learning to deliver localized flood risk estimates."},
  {q:"Who built this platform?",              a:"RRH was designed and built entirely by Benitha NGUNGA (backend, ML pipeline, data ingestion) and Yvette Tuyizere (frontend, UI/UX, routing, dashboard). Supervised by Mr. Dieudonne Ukurikiyeyesu and Mr. Omar Sinayobye."},
  {q:"Who is the platform for?",              a:"Disaster management personnel, meteorological agencies (Meteo Rwanda, RWB), MINEMA stakeholders, and community members wanting timely flood risk information for their area."},
  {q:"How are flood risk levels calculated?", a:"Risk levels — Low, Moderate, High, Critical — are predicted by a Random Forest model trained on historical rainfall, river level, humidity, and soil moisture data. Predictions update every 15–30 minutes."},
  {q:"How does email verification work?",     a:"After registration a 6-digit code is sent to your email. Enter it within 5 minutes to activate your account. You can request a new code if it expires."},
  {q:"How current is the flood data?",        a:"Environmental data is ingested continuously from external APIs and sensor streams. The ML engine re-classifies risk levels approximately every 15–30 minutes."},
  {q:"How do I contact the team?",            a:"Use the Help Centre search above, or contact Benitha or Yvette directly through the platform contact form."},
];

/* ── Leaflet Map ─────────────────────────────────────────── */
function FloodMap({selected,onSelect}:{selected:Zone|null;onSelect:(z:Zone)=>void}) {
  const ref    = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(()=>{
    if(!ref.current||mapRef.current)return;
    if(!document.querySelector("#lf-css")){
      const l=document.createElement("link");
      l.id="lf-css";l.rel="stylesheet";
      l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }
    const init=()=>{
      const L=(window as any).L;
      if(!L||!ref.current)return;
      const map=L.map(ref.current,{center:[-1.95,30.05],zoom:8,zoomControl:false,attributionControl:false});
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:19}).addTo(map);
      L.control.zoom({position:"bottomright"}).addTo(map);
      ZONES.forEach(z=>{
        const r=RISK[z.level];
        L.circle([z.lat,z.lng],{radius:r.radius,color:r.color,fillColor:r.color,fillOpacity:.1,weight:1.2,opacity:.38}).addTo(map);
        const icon=L.divIcon({className:"",html:`<div style="position:relative;width:34px;height:34px;transform:translate(-50%,-50%)"><div style="position:absolute;inset:0;border-radius:50%;background:${r.color};opacity:.22;animation:mapPing 2.2s ease infinite;"></div><div style="position:absolute;top:50%;left:50%;width:12px;height:12px;transform:translate(-50%,-50%);border-radius:50%;background:${r.color};border:2.5px solid #0a1628;box-shadow:0 0 10px ${r.glow};"></div></div>`,iconSize:[0,0],iconAnchor:[0,0]});
        L.marker([z.lat,z.lng],{icon}).addTo(map).on("click",()=>onSelect(z));
      });
      mapRef.current=map;
    };
    if((window as any).L){init();}
    else{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";s.onload=init;document.head.appendChild(s);}
    return()=>{if(mapRef.current){mapRef.current.remove();mapRef.current=null;}};
  },[]);

  useEffect(()=>{
    if(!selected||!mapRef.current)return;
    mapRef.current.flyTo([selected.lat,selected.lng],10,{duration:1.2});
  },[selected]);

  return <div ref={ref} style={{height:"100%",width:"100%"}}/>;
}

/* ── Navbar ──────────────────────────────────────────────── */
function Navbar({setPage}:PageProps){
  return(
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo" onClick={()=>setPage("landing")}>
          <div className="nav-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 14s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3"/>
              <path d="M3 19s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3" opacity=".5"/>
            </svg>
          </div>
          <div className="nav-logo-text">
            <div className="nav-logo-name">Rwanda Resilience Hub</div>
            <div className="nav-logo-tag">Flood Intelligence Platform</div>
          </div>
        </div>

        <div className="nav-links">
          <button className="nav-lnk" onClick={()=>setPage("landing")}>Home</button>
          <button className="nav-lnk" onClick={()=>setPage("about")}>About</button>
          <button className="nav-lnk" onClick={()=>setPage("help")}>Help</button>
        </div>

        <div className="nav-actions">
          <button className="btn-nav-out"  onClick={()=>setPage("login")}>Sign In</button>
          <button className="btn-nav-fill" onClick={()=>setPage("register")}>Get Access</button>
        </div>
      </div>
    </nav>
  );
}

/* ── Ticker ──────────────────────────────────────────────── */
function Ticker(){
  const msgs=["⚠ Nyabarongo Basin — HIGH FLOOD RISK","•  Rainfall 34% above seasonal average","•  Sebeya River at 3.8 m — approaching flood stage","•  Kigali urban zones — MEDIUM risk","•  Model confidence: 91%","•  Last updated 6 min ago"];
  const txt=[...msgs,...msgs].join("          ");
  return(
    <div className="ticker">
      <div className="ticker-tag"><div className="ticker-dot"/>Live Alerts</div>
      <div className="ticker-scroll"><div className="ticker-text">{txt}</div></div>
    </div>
  );
}

/* ── Auth Panel (left side of auth pages) ────────────────── */
function AuthPanel({title,sub,feats}:{title:string;sub:string;feats:[string,string,string][]}) {
  return(
    <div className="auth-left">
      <div className="auth-left-body">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M3 14s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3"/>
              <path d="M3 19s1.5-3 4-3 4 3 4 3 1.5-3 4-3 4 3 4 3" opacity=".5"/>
            </svg>
          </div>
          <div>
            <div className="auth-brand-name">Rwanda Resilience Hub</div>
            <span className="auth-brand-tag">Flood Intelligence Platform</span>
          </div>
        </div>
        <h2 className="auth-left-title" dangerouslySetInnerHTML={{__html:title}}/>
        <p className="auth-left-sub">{sub}</p>
        <div className="auth-feats">
          {feats.map(([ico,name,desc],i)=>(
            <div className="auth-feat" key={i}>
              <div className="auth-feat-ico">{ico}</div>
              <div className="auth-feat-body"><strong>{name}</strong><span>{desc}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-left-foot">
        <div className="auth-left-wave">
          <svg viewBox="0 0 500 52" preserveAspectRatio="none" style={{height:52}}>
            <path d="M0,26 C80,46 160,6 240,30 C320,52 400,14 500,26 L500,52 L0,52Z" fill="rgba(232,96,10,.12)"/>
            <path d="M0,36 C100,16 200,48 300,30 C380,16 450,40 500,34 L500,52 L0,52Z" fill="rgba(232,96,10,.07)"/>
          </svg>
        </div>
        <p className="auth-left-note">Built by Benitha NGUNGA &amp; Yvette Tuyizere · 2025</p>
      </div>
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────────── */
function Footer(){
  return(
    <footer className="footer">
      <div className="footer-in">
        <div className="footer-brand">Rwanda Resilience Hub</div>
        <div className="footer-note">Built by <span>Benitha NGUNGA</span> &amp; <span>Yvette Tuyizere</span> · University of Rwanda · CSE Capstone 2025</div>
        <div className="footer-note">Supervised by Mr. D. Ukurikiyeyesu &amp; Mr. O. Sinayobye</div>
      </div>
    </footer>
  );
}

/* ── Landing ─────────────────────────────────────────────── */
function Landing({setPage}:PageProps){
  const [sel,setSel]=useState<Zone|null>(ZONES[0]);

  return(
    <div className="page">
      <Ticker/>

      <section className="hero">
        <div className="hero-body">

          {/* LEFT — copy + zone list */}
          <div className="hero-left">
            <div className="eyebrow">
              <div className="e-pulse"/>
              Live Flood Monitoring — Rwanda
            </div>

            <h1 className="hero-h1">
              Predict   Floods.<br/>
              <span className="accent underlined">Protect  Lives.</span>
            </h1>

            <p className="hero-desc">
              An integrated platform combining satellite data, simulated IoT sensors, and
              machine learning to deliver real-time flood risk intelligence across Rwanda's
              most vulnerable river basins.
            </p>

            <div className="hero-btns">
              <button className="btn-fill"  onClick={()=>setPage("register")}>Get Access →</button>
              <button className="btn-empty" onClick={()=>setPage("help")}>How It Works</button>
            </div>

            {/* Clickable zone list — drives map flyTo */}
            <div className="zone-list">
              <div className="zone-list-head">
                <span className="zone-list-label">Monitoring Zones</span>
                <span className="zone-live-badge"><div className="live-dot"/>Live</span>
              </div>
              {ZONES.map(z=>{
                const r=RISK[z.level];
                return(
                  <div key={z.id} className={`zone-row${sel?.id===z.id?" sel":""}`} onClick={()=>setSel(z)}>
                    <div className="zone-left">
                      <div className="zdot" style={{background:r.color,boxShadow:`0 0 6px ${r.glow}`}}/>
                      <span className="zname">{z.name}</span>
                    </div>
                    <span className={`rbadge ${r.badge}`}>{z.level}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT — real Leaflet map */}
          <div className="hero-right">
            <div className="map-wrap">
              {/* top bar */}
              <div className="map-top-bar">
                <span className="map-top-title">🗺 Live Risk Map — Rwanda</span>
                <span className="map-top-live"><div className="map-live-dot"/>LIVE</span>
              </div>

              <FloodMap selected={sel} onSelect={setSel}/>

              {/* Selected zone detail card */}
              {sel&&(
                <div className="zone-card" key={sel.id}>
                  <div className="zc-head">
                    <span className="zc-name">{sel.name}</span>
                    <span className={`rbadge ${RISK[sel.level].badge}`}>{sel.level}</span>
                  </div>
                  <p className="zc-desc">{sel.desc}</p>
                  <div className="zc-metrics">
                    {([["💧 Rainfall",sel.rainfall],["📏 River Level",sel.river]] as [string,string][]).map(([l,v])=>(
                      <div className="zc-m" key={l}>
                        <div className="zc-m-lbl">{l}</div>
                        <div className="zc-m-val" style={{color:RISK[sel.level].color}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="zc-time">Updated {sel.updated}</div>
                </div>
              )}

              {/* Legend */}
              <div className="map-legend">
                <div className="ml-title">Risk Level</div>
                {(["CRITICAL","HIGH","MODERATE","LOW"] as RL[]).map(lvl=>(
                  <div className="ml-row" key={lvl}>
                    <div className="ml-dot" style={{background:RISK[lvl].color}}/>
                    {lvl.charAt(0)+lvl.slice(1).toLowerCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* wave */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{width:"100%",height:56,display:"block"}}>
            <path d="M0,22 C240,52 480,0 720,28 C960,52 1200,6 1440,26 L1440,56 L0,56Z" fill="var(--g50)"/>
          </svg>
        </div>
      </section>

      {/* Stats */}
      <div className="stats-strip">
        <div className="stats-inner">
          {[["5","Zones Monitored",""],["3","Active Alerts","red"],["91%","ML Accuracy",""],["15 min","Update Interval",""]].map(([v,l,c],i)=>(
            <div className="stat-box" key={i}>
              <div className={`stat-num${c?" "+c:""}`}>{v}</div>
              <div className="stat-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="sec sec-gray">
        <div className="sec-in">
          <div className="sec-tag">Platform Capabilities</div>
          <h2 className="sec-h2">Built for Rwanda's flood reality</h2>
          <p className="sec-desc">Designed to complement MINEMA, RWB, and Meteo Rwanda — unifying fragmented data sources into one decision-support platform.</p>
          <div className="feat-grid">
            {FEATURES.map((f,i)=>(
              <div className="feat-card" key={i}>
                <div className="feat-ico" style={{background:f.bg,border:`1px solid ${f.bd}`}}>{f.icon}</div>
                <div className="feat-name">{f.name}</div>
                <div className="feat-text">{f.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sec">
        <div className="cta-wrap">
          <div className="cta-band">
            <div>
              <h2 className="cta-h2">Ready to protect communities from floods?</h2>
              <p className="cta-sub">Get access to real-time flood risk intelligence for Rwanda.</p>
            </div>
            <div className="cta-btns">
              <button className="btn-cta-fill"  onClick={()=>setPage("register")}>Get Access →</button>
              <button className="btn-cta-out"   onClick={()=>setPage("help")}>Learn More</button>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

/* ── Login ───────────────────────────────────────────────── */
function Login({setPage}:PageProps){
  const [loading,setLoading]=useState(false);
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  const submit=()=>{
    if(!email||!pw){setErr("Please fill in all fields.");return;}
    setErr("");setLoading(true);
    setTimeout(()=>{setLoading(false);setPage("verify");},1500);
  };
  return(
    <div className="auth-shell page">
      <AuthPanel
        title='Welcome<br/>back <span class="hi">👋</span>'
        sub="Sign in to access real-time flood risk data, alerts, and prediction maps for Rwanda's river basins."
        feats={[["🌊","Live flood alerts","Updated every 15 min from sensor streams"],["🤖","ML risk prediction","91%+ accuracy on flood risk classification"],["🔔","Instant notifications","Alerts for at-risk zones across Rwanda"]]}
      />
      <div className="auth-right">
        <div className="auth-box">
          <button className="auth-back" onClick={()=>setPage("landing")}>← Back to home</button>
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-sub">Access the RRH flood monitoring platform</p>
          {err&&<div className="msg msg-err">⚠ {err}</div>}
          <div className="field">
            <label className="field-lbl">Email Address</label>
            <div className="field-wrap"><span className="field-ico">✉</span><input className="field-in ico" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
          </div>
          <div className="field">
            <label className="field-lbl">Password</label>
            <div className="field-wrap"><span className="field-ico">🔒</span><input className="field-in ico" type="password" placeholder="Enter your password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          </div>
          <div className="form-row">
            <div className="check-row"><input type="checkbox" id="rem"/><label htmlFor="rem">Remember me</label></div>
            <button className="tlink" onClick={()=>setPage("forgot")}>Forgot password?</button>
          </div>
          <button className="btn-sub" onClick={submit} disabled={loading}>
            {loading?<><div className="spinner"/>Signing in…</>:"Sign In →"}
          </button>
          <div className="divider">or continue with</div>
          <button className="btn-google">
            <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-3.59-13.46-8.71l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continue with Google
          </button>
          <div className="form-switch">No account? <button className="tlink" style={{fontWeight:700}} onClick={()=>setPage("register")}>Get Access</button></div>
        </div>
      </div>
    </div>
  );
}

/* ── Register ─────────────────────────────────────────────── */
function Register({setPage}:PageProps){
  const [loading,setLoading]=useState(false);
  const submit=()=>{setLoading(true);setTimeout(()=>{setLoading(false);setPage("verify");},1500);};
  return(
    <div className="auth-shell page">
      <AuthPanel
        title='Join the<br/><span class="hi">Platform</span>'
        sub="Create an account to receive real-time flood alerts and risk information for your area."
        feats={[["🏠","Location alerts","Warnings specific to your district or area"],["📱","Real-time updates","Flood risk notifications as conditions change"],["🚨","Early warnings","Be notified before flooding reaches your area"],["🌍","Full coverage","All provinces and major river catchments covered"]]}
      />
      <div className="auth-right">
        <div className="auth-box">
          <button className="auth-back" onClick={()=>setPage("landing")}>← Back to home</button>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-sub">Sign up to receive flood alerts for your area</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div className="field"><label className="field-lbl">First Name</label><input className="field-in" type="text" placeholder="First name"/></div>
            <div className="field"><label className="field-lbl">Last Name</label><input className="field-in" type="text" placeholder="Last name"/></div>
          </div>
          <div className="field">
            <label className="field-lbl">Email Address</label>
            <div className="field-wrap"><span className="field-ico">✉</span><input className="field-in ico" type="email" placeholder="your@email.com"/></div>
          </div>
          <div className="field">
            <label className="field-lbl">Your Location</label>
            <select className="field-in" defaultValue="">
              <option value="" disabled>Select your province or district</option>
              <option>Kigali City</option><option>Northern Province</option><option>Southern Province</option><option>Eastern Province</option><option>Western Province</option>
            </select>
          </div>
          <div className="field">
            <label className="field-lbl">Password</label>
            <div className="field-wrap"><span className="field-ico">🔒</span><input className="field-in ico" type="password" placeholder="Create a strong password"/></div>
          </div>
          <div className="check-row" style={{marginBottom:14}}>
            <input type="checkbox" id="terms"/>
            <label htmlFor="terms" style={{fontSize:12.5,color:"var(--g600)"}}>I agree to the <button className="tlink">Terms of Use</button> and <button className="tlink">Privacy Policy</button></label>
          </div>
          <button className="btn-sub" onClick={submit} disabled={loading}>
            {loading?<><div className="spinner"/>Creating account…</>:"Create Account & Verify Email →"}
          </button>
          <div className="form-switch">Already have an account? <button className="tlink" style={{fontWeight:700}} onClick={()=>setPage("login")}>Sign In</button></div>
        </div>
      </div>
    </div>
  );
}

/* ── Forgot Password ─────────────────────────────────────── */
function Forgot({setPage}:PageProps){
  const [step,setStep]=useState(1);
  const [email,setEmail]=useState("");
  const [loading,setLoading]=useState(false);
  const send=()=>{if(!email)return;setLoading(true);setTimeout(()=>{setLoading(false);setStep(2);},1400);};
  return(
    <div className="auth-shell page">
      <AuthPanel
        title='Password<br/><span class="hi">Recovery</span>'
        sub="Enter your email and we'll send you a secure link to reset your password."
        feats={[["🔐","Secure reset link","One-time link valid for 30 minutes"],["⏱","Quick delivery","Email arrives within 60 seconds"],["🛡","Activity logged","All resets are recorded for security"]]}
      />
      <div className="auth-right">
        <div className="auth-box">
          <button className="auth-back" onClick={()=>setPage("login")}>← Back to sign in</button>
          {step===1?(
            <>
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-sub">Enter your email and we'll send a recovery link</p>
              <div className="field">
                <label className="field-lbl">Email Address</label>
                <div className="field-wrap"><span className="field-ico">✉</span><input className="field-in ico" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div>
              </div>
              <button className="btn-sub" onClick={send} disabled={loading||!email}>
                {loading?<><div className="spinner"/>Sending…</>:"Send Recovery Link →"}
              </button>
            </>
          ):(
            <>
              <div className="verify-icon" style={{fontSize:26}}>📧</div>
              <h2 className="auth-title" style={{textAlign:"center"}}>Check Your Inbox</h2>
              <p className="auth-sub" style={{textAlign:"center"}}>We sent a reset link to<br/><strong style={{color:"var(--brand-400)"}}>{email}</strong></p>
              <div className="msg msg-ok">✓ Recovery email sent. Link valid for 30 minutes.</div>
              <div className="msg msg-info">ℹ Check your spam folder if you don't see it.</div>
              <button className="btn-sub" onClick={()=>setPage("login")}>Return to Sign In →</button>
              <div className="form-switch" style={{marginTop:12}}>Didn't receive it? <button className="tlink" onClick={()=>{setStep(1);setEmail("");}}>Try again</button></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Email Verify ─────────────────────────────────────────── */
function Verify({setPage}:PageProps){
  const [code,setCode]=useState(["","","","","",""]);
  const [secs,setSecs]=useState(300);
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);

  useEffect(()=>{
    const t=setInterval(()=>setSecs(s=>Math.max(0,s-1)),1000);
    return()=>clearInterval(t);
  },[]);

  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const onDigit=(i:number,v:string)=>{
    if(!/^\d*$/.test(v))return;
    const n=[...code];n[i]=v.slice(-1);setCode(n);
    if(v&&i<5)document.getElementById(`otp-${i+1}`)?.focus();
  };
  const onKey=(i:number,e:React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key==="Backspace"&&!code[i]&&i>0)document.getElementById(`otp-${i-1}`)?.focus();
  };
  const verify=()=>{
    if(code.join("").length<6)return;
    setLoading(true);setTimeout(()=>{setLoading(false);setDone(true);},1400);
  };

  return(
    <div className="auth-shell page">
      <AuthPanel
        title='Verify your<br/><span class="hi">Email</span>'
        sub="A 6-digit code has been sent to your email. Enter it below to activate your account."
        feats={[["✉","Check your inbox","6-digit code sent to your email"],["⏱","Valid 5 minutes","Request a new code if it expires"],["🔒","Secure verification","Ensures only real users access the platform"]]}
      />
      <div className="auth-right">
        <div className="auth-box">
          {!done?(
            <>
              <div className="verify-icon">📬</div>
              <h2 className="auth-title" style={{textAlign:"center"}}>Enter Verification Code</h2>
              <p className="auth-sub" style={{textAlign:"center"}}>We sent a 6-digit code to your email address</p>
              <div className="steps">
                <div className="sdot done">✓</div><div className="sline done"/>
                <div className="sdot active">2</div><div className="sline"/>
                <div className="sdot idle">3</div>
              </div>
              <div className="step-labels">
                <span style={{color:"var(--grn)"}}>Account</span>
                <span style={{color:"var(--brand-400)"}}>Verify</span>
                <span>Access</span>
              </div>
              <div className="otp-row">
                {code.map((d,i)=>(
                  <input key={i} id={`otp-${i}`} className={`otp-cell${d?" filled":""}`}
                    maxLength={1} value={d}
                    onChange={e=>onDigit(i,e.target.value)}
                    onKeyDown={e=>onKey(i,e)}
                    inputMode="numeric"/>
                ))}
              </div>
              <button className="btn-sub" onClick={verify} disabled={loading||code.join("").length<6}>
                {loading?<><div className="spinner"/>Verifying…</>:"Verify & Access Platform →"}
              </button>
              <div className="countdown" style={{marginTop:11}}>
                {secs>0?<>Code expires in <strong>{fmt(secs)}</strong></>:<>Code expired. <button className="tlink" onClick={()=>setSecs(300)}>Resend code</button></>}
              </div>
            </>
          ):(
            <>
              <div className="verify-icon" style={{fontSize:26,background:"var(--grn-lt)",border:"1px solid var(--grn-bd)"}}>✅</div>
              <h2 className="auth-title" style={{textAlign:"center"}}>Email Verified!</h2>
              <p className="auth-sub" style={{textAlign:"center"}}>Your account is active. Welcome to the Rwanda Resilience Hub.</p>
              <div className="msg msg-ok">✓ You now have access to live flood risk data and alerts.</div>
              <button className="btn-sub" onClick={()=>setPage("landing")}>Go to Dashboard →</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Help ─────────────────────────────────────────────────── */
function Help({setPage}:PageProps){
  const [search,setSearch]=useState("");
  const [open,setOpen]=useState<number|null>(null);
  const filtered=FAQS.filter(f=>f.q.toLowerCase().includes(search.toLowerCase())||f.a.toLowerCase().includes(search.toLowerCase()));
  return(
    <div className="page">
      <div className="help-top">
        <div className="sec-tag">Help Centre</div>
        <h1 className="help-h1">How can we <span className="hi">help</span> you?</h1>
        <p className="help-sub">Find answers about RRH, your account, flood data, and alerts.</p>
        <div className="search-wrap">
          <span className="search-ico">🔍</span>
          <input className="search-in" placeholder="Search questions and topics…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>

      <div className="cat-grid">
        {([["🚀","Getting Started","Account setup, login, and access"],["🌊","Flood Data","Risk levels, data sources, and maps"],["🔔","Alerts","Set up and manage flood alerts"],["🤖","ML Predictions","How the model works and reading output"],["🔐","Account & Security","Password reset and account settings"],["📩","Contact the Team","Reach Benitha or Yvette directly"]] as [string,string,string][]).map(([ico,name,desc],i)=>(
          <div className="cat-card" key={i}>
            <div className="cat-ico">{ico}</div>
            <div className="cat-name">{name}</div>
            <div className="cat-desc">{desc}</div>
            <div className="cat-arrow">→</div>
          </div>
        ))}
      </div>

      <div className="faq-sec">
        <h2 className="faq-h2">Frequently Asked Questions</h2>
        {filtered.length===0&&<div className="msg msg-info">No results for "{search}". Try different keywords.</div>}
        {filtered.map((item,i)=>(
          <div className={`faq-item${open===i?" open":""}`} key={i}>
            <div className="faq-q" onClick={()=>setOpen(open===i?null:i)}>
              <span className="faq-q-text">{item.q}</span>
              <div className="faq-chev">▾</div>
            </div>
            <div className={`faq-ans${open===i?" open":""}`}>
              <div className="faq-ans-body">{item.a}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{maxWidth:700,margin:"0 auto 60px",padding:"0 40px"}}>
        <div style={{background:"linear-gradient(135deg,var(--brand-50),#FFF4EE)",border:"1px solid var(--brand-200)",borderRadius:"var(--r12)",padding:"28px 36px",display:"flex",gap:22,alignItems:"center",flexWrap:"wrap"}}>
          <div style={{flex:1}}>
            <h3 style={{fontFamily:"var(--fd)",fontSize:18,fontWeight:700,color:"var(--navy-900)",marginBottom:4}}>Still need help?</h3>
            <p style={{fontSize:12.5,color:"var(--g500)",lineHeight:1.55}}>Contact Benitha or Yvette — the RRH development team — directly.</p>
          </div>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            <button className="btn-fill" onClick={()=>setPage("login")}>Sign In for Support</button>
            <button className="btn-empty">📩 Email Team</button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

/* ── About ────────────────────────────────────────────────── */
function About({setPage}:PageProps){
  return(
    <div className="page">
      <div className="about-top">
        <div className="sec-tag">About the Project</div>
        <h2 className="about-h1">Built by us, for <span className="hi">Rwanda</span></h2>
        <p className="about-sub">A flood risk intelligence platform designed and built by Benitha NGUNGA and Yvette Tuyizere as a capstone project at the University of Rwanda, School of ICT.</p>
      </div>

      <section className="sec">
        <div className="sec-in" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48}}>
          <div>
            <h3 style={{fontFamily:"var(--fd)",fontSize:26,fontWeight:700,color:"var(--navy-900)",marginBottom:11}}>Our Mission</h3>
            <p style={{fontSize:14.5,color:"var(--g500)",lineHeight:1.78,marginBottom:13}}>To deliver real-time flood risk intelligence to communities across Rwanda — helping people protect themselves through early warnings and clear, actionable information.</p>
            <p style={{fontSize:14.5,color:"var(--g500)",lineHeight:1.78}}>We built RRH to bridge the gap between Rwanda's national flood monitoring institutions and the communities they serve.</p>
            <div style={{marginTop:26}}>
              <h3 style={{fontFamily:"var(--fd)",fontSize:20,fontWeight:700,color:"var(--navy-900)",marginBottom:10}}>Technology Stack</h3>
              {[["Backend","FastAPI · PostgreSQL · SQLAlchemy · Alembic"],["ML Pipeline","scikit-learn · Random Forest · Logistic Regression"],["Data Sources","NASA POWER · OpenWeather · IoT Simulation"],["Frontend","React 19 · TypeScript · Leaflet · Vite"],["Deployment","Render (API + DB) · Vercel (Frontend)"]].map(([k,v],i)=>(
                <div className="meta-row" key={i}><span className="meta-k">{k}</span><span className="meta-v">{v}</span></div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{fontFamily:"var(--fd)",fontSize:26,fontWeight:700,color:"var(--navy-900)",marginBottom:11}}>The Team</h3>
            {[{name:"Benitha NGUNGA",role:"Backend Engineer · ML & Data Pipeline",tags:["FastAPI","PostgreSQL","scikit-learn","Data Ingestion"]},{name:"Yvette Tuyizere",role:"Frontend Engineer · UI/UX · Dashboard",tags:["React 19","TypeScript","Leaflet","Auth Pages"]}].map((m,i)=>(
              <div className="team-card" key={i}>
                <div className="team-avatar">👩🏾‍💻</div>
                <div>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                  <div className="team-tags">{m.tags.map(t=><span className="team-tag" key={t}>{t}</span>)}</div>
                </div>
              </div>
            ))}
            <div style={{marginTop:22}}>
              {[["Supervisors","Mr. Dieudonne Ukurikiyeyesu & Mr. Omar Sinayobye"],["Institution","University of Rwanda · School of ICT"],["Programme","Computer & Software Engineering"],["Type","Capstone Project · 2025"]].map(([k,v],i)=>(
                <div className="meta-row" key={i}><span className="meta-k">{k}</span><span className="meta-v">{v}</span></div>
              ))}
            </div>
            <div style={{marginTop:22}}>
              <button className="btn-fill" onClick={()=>setPage("register")}>Get Platform Access →</button>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
}

/* ── Root ─────────────────────────────────────────────────── */
export default function RRHApp(){
  const [page,setPage]=useState<Page>("landing");
  const showNav=(["landing","help","about"] as Page[]).includes(page);
  return(
    <>
      <style dangerouslySetInnerHTML={{__html:CSS}}/>
      {showNav&&<Navbar setPage={setPage}/>}
      {page==="landing"  &&<Landing  setPage={setPage}/>}
      {page==="login"    &&<Login    setPage={setPage}/>}
      {page==="register" &&<Register setPage={setPage}/>}
      {page==="forgot"   &&<Forgot   setPage={setPage}/>}
      {page==="verify"   &&<Verify   setPage={setPage}/>}
      {page==="help"     &&<Help     setPage={setPage}/>}
      {page==="about"    &&<About    setPage={setPage}/>}
    </>
  );
}
