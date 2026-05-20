import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from "react-native";
import { Colors } from "../constants/colors";

type Lang = "en" | "rw";

interface TipLevel {
  level: string;
  color: string;
  icon: string;
  title: { en: string; rw: string };
  tips: { en: string[]; rw: string[] };
}

const TIP_DATA: TipLevel[] = [
  {
    level: "LOW",
    color: Colors.low,
    icon: "✅",
    title: {
      en: "Low Risk — Normal Conditions",
      rw: "Ingorane Nkeya — Imiterere Isanzure",
    },
    tips: {
      en: [
        "No immediate flood risk. Continue normal daily activities.",
        "Stay informed by checking regular weather updates.",
        "Know your nearest evacuation route and safe gathering point.",
        "Keep emergency contacts saved in your phone.",
        "Store important documents in a waterproof bag.",
      ],
      rw: [
        "Nta mpungenge y'inzuzi ihutaza. Komeza imirimo ya buri munsi.",
        "Guma ukurikirana amakuru y'ikirere buri gihe.",
        "Menya inzira yo guhunga no hantu heza hafi yawe.",
        "Fata nimero z'acil d'urgence mu telefoni yawe.",
        "Bika impapuro z'ingenzi mu mukoba udashobora kujya mu mazi.",
      ],
    },
  },
  {
    level: "MODERATE",
    color: Colors.moderate,
    icon: "⚠️",
    title: {
      en: "Moderate Risk — Stay Alert",
      rw: "Ingorane Hagati — Guma Witeguye",
    },
    tips: {
      en: [
        "Monitor weather and river level updates closely.",
        "Avoid building or camping near rivers and low-lying areas.",
        "Keep children away from streams and drainage channels.",
        "Prepare an emergency kit: water, food, torch, first aid.",
        "Check that drains around your home are not blocked.",
        "Know which community members may need help evacuating.",
      ],
      rw: [
        "Kurikirana amakuru y'ikirere n'imiterere y'inzuzi buri kanya.",
        "Irinda kubaka cyangwa gusiga ihema hafi y'inzuzi no mu bibaya.",
        "Komeza abana kure y'imigezi n'imyoboro y'amazi.",
        "Tegura akanzu k'acil d'urgence: amazi, ibiryo, itara, imiti.",
        "Reba ko imyoboro hafi y'inzu yawe idafunye.",
        "Menya abaturanyi bakeneye inkunga mu gihe cyo guhunga.",
      ],
    },
  },
  {
    level: "HIGH",
    color: Colors.high,
    icon: "🔴",
    title: {
      en: "High Risk — Prepare to Evacuate",
      rw: "Ingorane Ikomeye — Witegure Guhunga",
    },
    tips: {
      en: [
        "Move valuables and important items to upper floors immediately.",
        "Stay indoors unless authorities say it is safe to go out.",
        "Do not cross flooded roads or bridges — even in a vehicle.",
        "Follow instructions from local government and MINEMA.",
        "Be ready to leave your home within minutes if ordered.",
        "Turn off electricity if you see water entering your home.",
        "Call 112 (emergency) if you or others are in danger.",
      ],
      rw: [
        "Twara ibintu by'agaciro ku birenge byo hejuru vuba.",
        "Buguma mu rugo keretse ubuyobozi bwemeje ko birinda.",
        "Ntibara inzira cyangwa ibiraro bifubye amazi — n'imodoka.",
        "Kurikira amabwiriza ya leta y'Akarere na MINEMA.",
        "Witegure gusohoka mu rugo mu minota mike nimbwira.",
        "Tima amashanyarazi nubona amazi yinjira mu rugo rwawe.",
        "Hamagara 112 (acil d'urgence) niba uri mu kaga.",
      ],
    },
  },
  {
    level: "CRITICAL",
    color: Colors.critical,
    icon: "🚨",
    title: {
      en: "Critical Risk — Evacuate Immediately",
      rw: "Ingorane Ikomeye Cyane — Hunga Nonaha",
    },
    tips: {
      en: [
        "EVACUATE NOW. Do not wait for floodwater to reach you.",
        "Go to the designated safe area or higher ground immediately.",
        "Do not return home until authorities confirm it is safe.",
        "Do not enter floodwater on foot — 15 cm can knock you over.",
        "Help elderly, disabled, and young children evacuate first.",
        "Call 112 if you are trapped and cannot evacuate.",
        "After evacuation, do not use electrical items near water.",
        "Drink only clean water — floods contaminate water sources.",
      ],
      rw: [
        "HUNGA NONAHA. Ntugomba gutinda kugeza amazi agera.",
        "Jya vuba ahantu hagizwe heza cyangwa ahantu harengeye.",
        "Ntagaruke mu rugo kugeza ubuyobozi bwemeza ko birinda.",
        "Ntibara amazi y'umwuzure n'amaguru — cm 15 irashobora kukusunika.",
        "Fasha abakuze, abimukanye, n'abana bato guhunga mbere.",
        "Hamagara 112 niba warafunganye kandi udashobora guhunga.",
        "Nyuma yo guhunga, ntukoreshe ibikoresho by'amashanyarazi hafi y'amazi.",
        "Nywa amazi asukuye gusa — inzuzi zandura imyuzure y'amazi.",
      ],
    },
  },
];

export default function SafetyTipsScreen() {
  const [lang, setLang] = useState<Lang>("en");

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      {/* Language toggle */}
      <View style={s.langRow}>
        <Text style={s.langLabel}>Language / Ururimi:</Text>
        <View style={s.langToggle}>
          <TouchableOpacity
            style={[s.langBtn, lang === "en" && s.langBtnActive]}
            onPress={() => setLang("en")}
          >
            <Text style={[s.langBtnText, lang === "en" && s.langBtnTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.langBtn, lang === "rw" && s.langBtnActive]}
            onPress={() => setLang("rw")}
          >
            <Text style={[s.langBtnText, lang === "rw" && s.langBtnTextActive]}>Ikinyarwanda</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Intro */}
      <View style={s.intro}>
        <Text style={s.introTitle}>
          {lang === "en" ? "Flood Safety Guide" : "Amabwiriza yo Kubaho Mu Gihe cy'Inzuzi"}
        </Text>
        <Text style={s.introSub}>
          {lang === "en"
            ? "Know what to do at each flood risk level for the Sebeya River Basin, Rubavu District."
            : "Menya ibigomba gukorwa ku rugero rw'inzuzi mu Ruganda rwa Sebeya, Akarere ka Rubavu."}
        </Text>
      </View>

      {/* Risk level cards */}
      {TIP_DATA.map((level) => (
        <LevelCard key={level.level} data={level} lang={lang} />
      ))}

      <Text style={s.footer}>
        {lang === "en"
          ? "Emergency: Call 112 · MINEMA: +250 788 311 199"
          : "Acil d'urgence: Hamagara 112 · MINEMA: +250 788 311 199"}
      </Text>
    </ScrollView>
  );
}

function LevelCard({ data, lang }: { data: TipLevel; lang: Lang }) {
  const [expanded, setExpanded] = useState(data.level === "CRITICAL");

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(v => !v)}
      style={[lc.card, { borderLeftColor: data.color }]}
    >
      <View style={lc.header}>
        <View style={[lc.badge, { backgroundColor: data.color }]}>
          <Text style={lc.badgeText}>{data.level}</Text>
        </View>
        <Text style={lc.icon}>{data.icon}</Text>
        <Text style={lc.title} numberOfLines={2}>{data.title[lang]}</Text>
        <Text style={lc.chevron}>{expanded ? "▲" : "▼"}</Text>
      </View>

      {expanded && (
        <View style={lc.body}>
          {data.tips[lang].map((tip, i) => (
            <View key={i} style={lc.tipRow}>
              <Text style={[lc.bullet, { color: data.color }]}>•</Text>
              <Text style={lc.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 16, paddingBottom: 40 },

  langRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  langLabel: { fontSize: 13, color: Colors.n600, fontWeight: "600" },
  langToggle: { flexDirection: "row", backgroundColor: Colors.n100, borderRadius: 8, padding: 3 },
  langBtn:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6 },
  langBtnActive: { backgroundColor: Colors.primary },
  langBtnText:     { fontSize: 13, fontWeight: "600", color: Colors.n500 },
  langBtnTextActive: { color: "#fff" },

  intro:      { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  introTitle: { fontSize: 17, fontWeight: "700", color: Colors.n900, marginBottom: 6 },
  introSub:   { fontSize: 13, color: Colors.n500, lineHeight: 20 },

  footer: { textAlign: "center", fontSize: 12, color: Colors.n500, marginTop: 12, fontWeight: "600" },
});

const lc = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 12, marginBottom: 12,
    borderLeftWidth: 4, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  header: {
    flexDirection: "row", alignItems: "center", padding: 14, gap: 10,
  },
  badge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  icon:      { fontSize: 18 },
  title:     { flex: 1, fontSize: 13, fontWeight: "700", color: Colors.n900 },
  chevron:   { fontSize: 11, color: Colors.n400 },

  body:    { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 4 },
  tipRow:  { flexDirection: "row", gap: 8, marginBottom: 8 },
  bullet:  { fontSize: 16, lineHeight: 20, fontWeight: "800" },
  tipText: { flex: 1, fontSize: 13, color: Colors.n700, lineHeight: 20 },
});
