import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import {
  Users, Camera, ClipboardCheck, UserCircle2, Plus, Trash2, ChevronLeft,
  Printer, X, Check, HeartPulse, UserX, Shirt, Calendar, FolderOpen,
  LayoutGrid, Home, RefreshCw, Archive, StickyNote, ThumbsUp, ThumbsDown, Table2, Sun, Moon, ImagePlus,
  Wrench, Timer, Play, Pause, RotateCcw, Flag, Phone, Upload, GraduationCap, Star, Pencil,
  FileText, Image as ImageIcon, Video, Paperclip, FolderPlus, Download, RotateCw, RotateCcw as RotateCcwIcon, Folder,
  Table, Sigma, ExternalLink, Lock, Globe, Mail, HardDrive, Link2
} from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

// Numéro de version de l'application — à incrémenter à chaque mise à jour livrée.
// Historique détaillé des changements : voir CHANGELOG.md à la racine du projet.
const APP_VERSION = "1.1.0";

// ---------- Stockage local persistant (IndexedDB) ----------
const DB_NOM = "eps-pro-db";
const DB_MAGASIN = "kv";

function ouvrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NOM, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(DB_MAGASIN)) {
        req.result.createObjectStore(DB_MAGASIN);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbLire(cle) {
  try {
    const db = await ouvrirDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_MAGASIN, "readonly");
      const req = tx.objectStore(DB_MAGASIN).get(cle);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return undefined;
  }
}

async function idbEcrire(cle, valeur) {
  try {
    const db = await ouvrirDB();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_MAGASIN, "readwrite");
      tx.objectStore(DB_MAGASIN).put(valeur, cle);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    // Stockage indisponible (mode privé strict, etc.) : on continue sans bloquer l'appli.
  }
}

// ---------- Synchronisation en ligne (Firebase / Firestore) ----------
const firebaseConfig = {
  apiKey: "AIzaSyAh2sS6lbXv1S_70fGqkTQXt8qjS-xl8hc",
  authDomain: "eps-pro-1460c.firebaseapp.com",
  projectId: "eps-pro-1460c",
  storageBucket: "eps-pro-1460c.firebasestorage.app",
  messagingSenderId: "651231276995",
  appId: "1:651231276995:web:9a0a4bee757ffe4d6a1776",
};
let firestoreDb = null;
try {
  const firebaseApp = initializeApp(firebaseConfig);
  firestoreDb = getFirestore(firebaseApp);
} catch (e) {
  firestoreDb = null;
}

async function cloudLire(codeProf, cle) {
  if (!firestoreDb || !codeProf) return null;
  try {
    const ref = doc(firestoreDb, "profs", codeProf, "data", cle);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    return null;
  }
}

async function cloudEcrire(codeProf, cle, valeur, maj) {
  if (!firestoreDb || !codeProf) return;
  try {
    const ref = doc(firestoreDb, "profs", codeProf, "data", cle);
    await setDoc(ref, { valeur, maj });
  } catch (e) {
    // Pas de réseau ou règles Firestore non prêtes : on reste en local, sans bloquer l'appli.
  }
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowISO = () => new Date().toISOString();
const fmtDateHeure = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR") + " · " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

// ---------- Données de démonstration ----------
const seedClasses = () => {
  const eleves1 = [
    { id: uid(), nom: "Bernard", prenom: "Lina", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
    { id: uid(), nom: "Costa", prenom: "Enzo", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
    { id: uid(), nom: "Diallo", prenom: "Awa", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
    { id: uid(), nom: "Faucher", prenom: "Tom", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
    { id: uid(), nom: "Gomez", prenom: "Inès", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
  ];
  const eleves2 = [
    { id: uid(), nom: "Girard", prenom: "Naël", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
    { id: uid(), nom: "Henry", prenom: "Chloé", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
    { id: uid(), nom: "Idir", prenom: "Sami", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
    { id: uid(), nom: "Julien", prenom: "Maud", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: null, dispenses: [] },
  ];
  return [
  {
    id: uid(),
    nom: "2nde 4",
    eleves: eleves1,
    cycles: [{ id: uid(), activite: "Course de durée", dateDebut: "2026-09-01", seances: [] }],
    profPrincipal: "Mme Roussel", profPrincipalPhoto: null, cpe: "M. Nasri", delegues: [eleves1[0].id, eleves1[2].id], chronos: [], blocNotes: [], type: "classe", sousClasses: [],
  },
  {
    id: uid(),
    nom: "1ère 2",
    eleves: eleves2,
    cycles: [{ id: uid(), activite: "Musculation", dateDebut: "2026-09-01", seances: [] }],
    profPrincipal: "", profPrincipalPhoto: null, cpe: "", delegues: [eleves2[1].id], chronos: [], blocNotes: [], type: "classe", sousClasses: [],
  },
];
};

const STATUTS = {
  present: { label: "Présent", short: "P", color: "var(--st-present-c)", bg: "var(--st-present-bg)", border: "var(--st-present-bd)", Icon: Check },
  sans_tenue: { label: "Sans tenue", short: "ST", color: "var(--st-tenue-c)", bg: "var(--st-tenue-bg)", border: "var(--st-tenue-bd)", Icon: Shirt },
  dispense: { label: "Dispensé", short: "D", color: "var(--st-dispense-c)", bg: "var(--st-dispense-bg)", border: "var(--st-dispense-bd)", Icon: HeartPulse },
  absent: { label: "Absent", short: "A", color: "var(--st-absent-c)", bg: "var(--st-absent-bg)", border: "var(--st-absent-bd)", Icon: UserX },
};

const INK = "var(--ink)";
const PAPER = "var(--paper)";
const LINE = "var(--line)";
const PRIMARY = "var(--primary)";
const PRIMARY_SOFT = "var(--primary-soft)";
const ACCENT = "var(--accent)";
const ACCENT_SOFT = "var(--accent-soft)";
const CARD = "var(--card)";

const THEME_CSS = `
  :root, [data-theme="clair"] {
    --paper: #F5F8F3;
    --card: #FFFFFF;
    --ink: #172420;
    --line: #DEE4D8;
    --primary: #0E8F6B;
    --primary-soft: #E1F5EC;
    --accent: #FF6A3D;
    --accent-soft: #FFE7DC;
    --st-present-c: #1F8F5B; --st-present-bg: #E4F6EC; --st-present-bd: #BFE6D2;
    --st-tenue-c: #C2650A; --st-tenue-bg: #FDEEDB; --st-tenue-bd: #F2CDA0;
    --st-dispense-c: #2E6FD1; --st-dispense-bg: #E6EFFC; --st-dispense-bd: #C0D6F5;
    --st-absent-c: #D1362B; --st-absent-bg: #FCEAE8; --st-absent-bd: #F3C2BC;
    --muted: #6B6656;
    --muted-soft: #8A8578;
    --faint: #D8D4C8;
    --gold: #8A6F1E;
    --tile-appel: linear-gradient(135deg, #FF6A3D, #0E8F6B);
    --tile-classes: linear-gradient(135deg, #4C6FFF, #8A4DFF);
    --tile-trombi: linear-gradient(135deg, #FF4FA3, #FF8F6B);
    --tile-documents: linear-gradient(135deg, #FFC145, #16C79A);
    --tile-minuteur: linear-gradient(135deg, #16C79A, #2E6FD1);
    --tile-chrono: linear-gradient(135deg, #8A4DFF, #FF4FA3);
    --tile-blocnote: linear-gradient(135deg, #16C79A, #FFC145);
    --tile-liens: linear-gradient(135deg, #2E6FD1, #16C79A);
  }
    --paper: #101713;
    --card: #1A2420;
    --ink: #EEF3EC;
    --line: #2A3630;
    --primary: #3CE0A4;
    --primary-soft: #163B2C;
    --accent: #FF9466;
    --accent-soft: #3C2416;
    --st-present-c: #4ADE80; --st-present-bg: #163425; --st-present-bd: #1F4A34;
    --st-tenue-c: #FFB35C; --st-tenue-bg: #3A2712; --st-tenue-bd: #5C3B16;
    --st-dispense-c: #7FB0FF; --st-dispense-bg: #17273D; --st-dispense-bd: #234368;
    --st-absent-c: #FF7A70; --st-absent-bg: #3A1613; --st-absent-bd: #5C231E;
    --muted: #A9B0A4;
    --muted-soft: #8B9388;
    --faint: #3A453E;
    --gold: #E0BE5A;
    --tile-appel: linear-gradient(135deg, #FF9466, #3CE0A4);
    --tile-classes: linear-gradient(135deg, #6E8CFF, #A97CFF);
    --tile-trombi: linear-gradient(135deg, #FF7CC0, #FFAE8C);
    --tile-documents: linear-gradient(135deg, #FFD873, #3EE6BD);
    --tile-minuteur: linear-gradient(135deg, #3EE6BD, #7FB0FF);
    --tile-chrono: linear-gradient(135deg, #A97CFF, #FF7CC0);
    --tile-blocnote: linear-gradient(135deg, #3EE6BD, #FFD873);
    --tile-liens: linear-gradient(135deg, #7FB0FF, #3EE6BD);
  }
`;

function initials(prenom, nom) {
  return `${(prenom || "?")[0] || ""}${(nom || "?")[0] || ""}`.toUpperCase();
}

function normaliser(s) {
  return (s || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

function dispenseDuJour(eleve, dateStr) {
  return (eleve.dispenses || []).find((d) => dateStr >= d.dateDebut && dateStr <= d.dateFin) || null;
}

function convertirAbsencesEnDispense(classe, eleveId, dateDebut, dateFin) {
  return {
    ...classe,
    cycles: classe.cycles.map((cy) => ({
      ...cy,
      seances: cy.seances.map((s) => {
        if (s.date >= dateDebut && s.date <= dateFin && s.appels[eleveId] === "absent") {
          return { ...s, appels: { ...s.appels, [eleveId]: "dispense" } };
        }
        return s;
      }),
    })),
  };
}

function estDispense(eleve, dateStr) {
  return !!dispenseDuJour(eleve, dateStr);
}

function Avatar({ eleve, size = 40 }) {
  return eleve.photo ? (
    <img
      src={eleve.photo}
      alt={`${eleve.prenom} ${eleve.nom}`}
      style={{ width: size, height: size, borderRadius: 10, objectFit: "cover", border: `1px solid ${LINE}` }}
    />
  ) : (
    <div
      style={{
        width: size, height: size, borderRadius: 10, background: PRIMARY_SOFT, color: PRIMARY,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.36, border: `1px solid ${LINE}`,
      }}
    >
      {initials(eleve.prenom, eleve.nom)}
    </div>
  );
}

function TopBar({ title, onBack, theme, onToggleTheme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: `1px solid ${LINE}`, background: CARD, position: "sticky", top: 0, zIndex: 10 }}>
      {onBack && (
        <button onClick={onBack} style={{ border: "none", background: "none", cursor: "pointer", color: PRIMARY, display: "flex" }}>
          <ChevronLeft size={22} />
        </button>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 7, flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, letterSpacing: 0.3, color: INK, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {title}
        </div>
        <div style={{ fontSize: 10.5, fontStyle: "italic", color: "var(--muted-soft)", whiteSpace: "nowrap", flexShrink: 0 }}>
          by C. Guilhem
        </div>
        <div style={{ fontSize: 9, color: "var(--faint)", whiteSpace: "nowrap", flexShrink: 0 }}>
          v{APP_VERSION}
        </div>
      </div>
      <button onClick={onToggleTheme} title="Changer de luminosité" style={{ border: `1px solid ${LINE}`, background: "none", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: ACCENT }}>
        {theme === "sombre" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}

function NavButton({ active, onClick, Icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
        padding: "8px 0 6px", background: "none", border: "none", cursor: "pointer",
        color: active ? PRIMARY : "var(--muted-soft)",
      }}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, letterSpacing: 0.2 }}>{label}</span>
      <div style={{ width: 18, height: 2.5, borderRadius: 2, background: active ? PRIMARY : "transparent", marginTop: 1 }} />
    </button>
  );
}

// ---------- Écran : Accueil ----------
const PALETTE_CLASSES = [
  { bg: "#E9F5EE", bd: "#8FD9B4", tx: "#1F8F5B" },
  { bg: "#EAF0FF", bd: "#9DB8FF", tx: "#3355D8" },
  { bg: "#FFF0E6", bd: "#FFC199", tx: "#C2650A" },
  { bg: "#FDEBF3", bd: "#F5A8CE", tx: "#C23D80" },
  { bg: "#F0EBFF", bd: "#C3AFFF", tx: "#6B3FD1" },
  { bg: "#FFF9E0", bd: "#F2DE8C", tx: "#9A7B0A" },
  { bg: "#E6FAF7", bd: "#93E5DA", tx: "#0E8F80" },
  { bg: "#FFEAEA", bd: "#F5A8A2", tx: "#C23A32" },
];

function Accueil({ classes, edt, setEdt, etablissement, onOpenEdt }) {
  const totalEleves = classes.reduce((s, c) => s + c.eleves.length, 0);
  const aujourdhui = new Date();
  const jourAujourdhui = JOUR_JS_VERS_CLE[aujourdhui.getDay()];
  const nomClasse = (id) => classes.find((c) => c.id === id)?.nom || "?";
  const couleurClasse = (id) => {
    const idx = classes.findIndex((c) => c.id === id);
    return idx === -1 ? { bg: "#EDEDED", bd: "#CFCFCF", tx: "#6B6656" } : PALETTE_CLASSES[idx % PALETTE_CLASSES.length];
  };

  const [weekOffset, setWeekOffset] = useState(0);
  const lundiAuj = lundiDeLaSemaine(aujourdhui);
  const lundiAffiche = new Date(lundiAuj);
  lundiAffiche.setDate(lundiAffiche.getDate() + weekOffset * 7);
  const referencePourSemaine = weekOffset === 0 ? aujourdhui : lundiAffiche;
  const datesSemaine = JOURS.map((_, i) => {
    const d = new Date(lundiAffiche);
    d.setDate(d.getDate() + i);
    return d;
  });
  const isoSemaine = datesSemaine.map((d) => d.toISOString().slice(0, 10));

  const sauterADate = (dateStr) => {
    if (!dateStr) return;
    const lundiCible = lundiDeLaSemaine(new Date(dateStr + "T00:00:00"));
    const diffJours = Math.round((lundiCible - lundiAuj) / 86400000);
    setWeekOffset(Math.round(diffJours / 7));
  };

  const semaineAuto = calculerSemaineAuto(edt, referencePourSemaine);
  const modeSemaine = edt?.semaineActuelle || "AUTO";
  const semaine = modeSemaine === "AUTO" ? (semaineAuto || "A") : modeSemaine;
  const creneaux = (edt?.creneaux || []).filter((c) => !c.semaine || c.semaine === semaine);
  const heuresUniques = [...new Set(creneaux.map((c) => c.heureDebut))].sort((a, b) => heureEnMinutes(a) - heureEnMinutes(b));
  const vacancesEnCours = weekOffset === 0 ? estDansVacances(edt, aujourdhui) : null;
  const ferieAujourdhui = weekOffset === 0 ? estJourFerie(edt, aujourdhui) : null;

  return (
    <div style={{ padding: 18 }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 26, color: INK, lineHeight: 1.1 }}>
          Bonjour Christophe
        </div>
        <div style={{ color: "var(--muted)", fontSize: 13.5, marginTop: 4 }}>
          {classes.length} classes · {totalEleves} élèves suivis
        </div>
      </div>

      {(etablissement?.nom || etablissement?.anneeScolaire) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "var(--muted-soft)" }}>
          <GraduationCap size={14} color={PRIMARY} />
          {etablissement?.nom && <span style={{ fontWeight: 600, color: INK }}>{etablissement.nom}</span>}
          {etablissement?.anneeScolaire && <span>· Année {etablissement.anneeScolaire}</span>}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.6 }}>
          Emploi du temps — Semaine
        </div>
        <button onClick={onOpenEdt} style={{ border: "none", background: "none", color: PRIMARY, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Gérer →</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <button onClick={() => setWeekOffset((o) => o - 1)} style={{ border: `1px solid ${LINE}`, background: CARD, borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: PRIMARY }}>
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => setWeekOffset(0)} style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 700, color: weekOffset === 0 ? PRIMARY : INK, background: weekOffset === 0 ? PRIMARY_SOFT : CARD, border: `1px solid ${LINE}`, borderRadius: 9, padding: "7px 4px", cursor: "pointer" }}>
          {weekOffset === 0 ? "Cette semaine" : `Semaine du ${datesSemaine[0].toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} au ${datesSemaine[5].toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}`}
        </button>
        <button onClick={() => setWeekOffset((o) => o + 1)} style={{ border: `1px solid ${LINE}`, background: CARD, borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: PRIMARY, transform: "rotate(180deg)" }}>
          <ChevronLeft size={16} />
        </button>
      </div>
      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 11.5, color: "var(--muted-soft)" }}>
        Aller à une date :
        <input type="date" onChange={(e) => sauterADate(e.target.value)} style={{ border: `1px solid ${LINE}`, borderRadius: 8, padding: "5px 7px", fontSize: 12, background: CARD, color: INK }} />
      </label>

      {(vacancesEnCours || ferieAujourdhui) && (
        <div style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT}`, borderRadius: 10, padding: "9px 12px", marginBottom: 10, fontSize: 12, color: ACCENT, fontWeight: 600 }}>
          {vacancesEnCours ? `En vacances : ${vacancesEnCours.nom}` : `Jour férié : ${ferieAujourdhui.nom}`}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {["AUTO", "A", "B"].map((s) => (
          <button
            key={s}
            onClick={() => setEdt({ ...edt, semaineActuelle: s })}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: "pointer",
              border: `1.5px solid ${modeSemaine === s ? PRIMARY : LINE}`,
              background: modeSemaine === s ? PRIMARY : CARD,
              color: modeSemaine === s ? "#fff" : "var(--muted-soft)",
            }}
          >
            {s === "AUTO" ? `Auto (${semaineAuto || "A"})` : `Semaine ${s}`}
          </button>
        ))}
      </div>

      {creneaux.length === 0 ? (
        <div style={{ background: `linear-gradient(135deg, ${PRIMARY_SOFT}, ${ACCENT_SOFT})`, border: `1px solid ${LINE}`, borderRadius: 16, padding: 24, color: "var(--muted)", fontSize: 13.5, textAlign: "center", minHeight: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Calendar size={28} color={PRIMARY} />
          <div style={{ color: INK, fontWeight: 700, fontSize: 15 }}>Aucun créneau renseigné</div>
          <div>Configure ton emploi du temps depuis l'onglet Outils.</div>
        </div>
      ) : (
        <div style={{ overflowX: "auto", border: `1px solid ${LINE}`, borderRadius: 16, background: CARD, padding: 6 }}>
          <table style={{ borderCollapse: "separate", borderSpacing: "4px", fontSize: 11.5, minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, background: CARD, padding: "6px 8px" }}></th>
                {JOURS.map((j, i) => {
                  const estAujourdhui = weekOffset === 0 && j.key === jourAujourdhui;
                  return (
                    <th key={j.key} style={{
                      padding: "9px 6px", fontWeight: 700, whiteSpace: "nowrap", borderRadius: 10,
                      color: estAujourdhui ? "#fff" : "var(--muted)",
                      background: estAujourdhui ? PRIMARY : "transparent",
                    }}>
                      {j.label.slice(0, 3)} {datesSemaine[i].getDate()}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {heuresUniques.map((h) => (
                <tr key={h}>
                  <td style={{ position: "sticky", left: 0, background: CARD, padding: "6px 8px", whiteSpace: "nowrap", fontWeight: 700, color: "var(--muted-soft)", fontSize: 11 }}>
                    {h}
                  </td>
                  {JOURS.map((j, i) => {
                    const c = creneaux.find((x) => x.jour === j.key && x.heureDebut === h);
                    const estAujourdhui = weekOffset === 0 && j.key === jourAujourdhui;
                    const couleur = c?.classeId ? couleurClasse(c.classeId) : { bg: "var(--faint)", bd: LINE, tx: "var(--muted-soft)" };
                    const activiteEffective = c?.classeId ? activiteEffectivePourCreneau(classes.find((x) => x.id === c.classeId), c, isoSemaine[i]) : "";
                    return (
                      <td key={j.key} style={{ padding: 0, verticalAlign: "top", minWidth: 80, borderRadius: 10, background: !c && estAujourdhui ? PRIMARY_SOFT : "transparent" }}>
                        {c ? (
                          <div style={{
                            background: couleur.bg, border: `1.5px solid ${couleur.bd}`, borderRadius: 10,
                            padding: "6px 6px", textAlign: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                          }}>
                            <div style={{ fontWeight: 700, color: couleur.tx, fontSize: 11 }}>{c.classeId ? nomClasse(c.classeId) : (c.titre || "")}</div>
                            <div style={{ color: couleur.tx, opacity: 0.75, fontSize: 9.5 }}>{c.heureFin ? `–${c.heureFin}` : ""}</div>
                            {c.classeId && activiteEffective && <div style={{ color: couleur.tx, fontWeight: 600, fontSize: 9.5, marginTop: 1 }}>{activiteEffective}</div>}
                            {c.semaine && <div style={{ color: couleur.tx, opacity: 0.6, fontSize: 8.5, fontWeight: 700, marginTop: 1 }}>SEM. {c.semaine}</div>}
                          </div>
                        ) : (
                          <div style={{ textAlign: "center", color: "var(--faint)", padding: "6px 0" }}>·</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function QuickTile({ Icon, label, onClick, tone }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: tone ? "none" : `1px solid ${LINE}`,
        background: tone ? `var(--tile-${tone})` : CARD,
        color: tone ? "#fff" : INK,
        borderRadius: 14, padding: "18px 14px", textAlign: "left", cursor: "pointer",
        display: "flex", flexDirection: "column", gap: 22, minHeight: 88,
        boxShadow: tone ? "0 4px 14px rgba(0,0,0,0.16)" : "none",
      }}
    >
      <Icon size={22} />
      <span style={{ fontWeight: 700, fontSize: 14.5 }}>{label}</span>
    </button>
  );
}

// ---------- Écran : Gestion de classe (regroupe Classe/Groupe, Appel, Trombi) ----------
function GestionClasseScreen({ sousOnglet, setSousOnglet, classes, setClasses, updateClasse, updateEleve, onOpenClass, onOpenEleve, onAnnotate, onVoirFicheCycle, biblio, setBiblio }) {
  const sousOnglets = [
    { key: "appel", label: "Appel" },
    { key: "classes", label: "Classe/Groupe" },
    { key: "trombi", label: "Trombi" },
  ];
  return (
    <div>
      <div style={{ display: "flex", gap: 6, padding: "12px 16px 0" }}>
        {sousOnglets.map((s) => (
          <button
            key={s.key}
            onClick={() => setSousOnglet(s.key)}
            style={{
              flex: 1, padding: "8px 6px", borderRadius: 9, border: `1px solid ${sousOnglet === s.key ? PRIMARY : LINE}`,
              background: sousOnglet === s.key ? PRIMARY_SOFT : CARD, color: sousOnglet === s.key ? PRIMARY : "var(--muted-soft)",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      {sousOnglet === "classes" && <ClassesScreen classes={classes} setClasses={setClasses} onOpenClass={onOpenClass} />}
      {sousOnglet === "appel" && <AppelScreen classes={classes} updateClasse={updateClasse} onOpenEleve={onOpenEleve} onAnnotate={onAnnotate} onVoirFicheCycle={onVoirFicheCycle} biblio={biblio} setBiblio={setBiblio} />}
      {sousOnglet === "trombi" && <TrombiScreen classes={classes} updateEleve={updateEleve} updateClasse={updateClasse} onOpenEleve={onOpenEleve} />}
    </div>
  );
}

// ---------- Écran : Liens externes (autres applis de C. Guilhem) ----------
function LiensExternesScreen() {
  const liens = [
    { label: "Suivi AS", description: "Fiches élèves de l'Association Sportive", url: "https://suivi-as.onrender.com" },
    { label: "Muscu Pro", description: "Suivi musculation par séance", url: "https://muscu-pro-app.vercel.app" },
    { label: "VMA Pro", description: "Calcul VMA, allures et charge", url: "https://vma-pro.vercel.app" },
    { label: "Fractionné GPS Pro", description: "Guidage fractionné par GPS et %VMA", url: "https://fractionne-gps-pro.vercel.app" },
  ];
  return (
    <div style={{ padding: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12 }}>
        Mes autres applications
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {liens.map((l) => (
          <a
            key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
              background: "var(--tile-liens)", color: "#fff", borderRadius: 14, padding: "16px 16px",
              textDecoration: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.16)",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{l.label}</div>
              <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>{l.description}</div>
            </div>
            <ExternalLink size={20} />
          </a>
        ))}
      </div>
    </div>
  );
}

// ---------- Écran : Liens perso (ajoutés librement par l'utilisateur) ----------
const CATEGORIES_LIENS = [
  { value: "site", label: "Site internet", Icon: Globe },
  { value: "email", label: "Boîte mail", Icon: Mail },
  { value: "drive", label: "Drive / stockage", Icon: HardDrive },
  { value: "autre", label: "Autre", Icon: Link2 },
];

function LiensPersoScreen({ liensPerso, setLiensPerso }) {
  const [formOuvert, setFormOuvert] = useState(false);

  const ajouterLien = ({ label, url, categorie }) => {
    let urlFinale = url.trim();
    if (categorie === "email") {
      if (!/^mailto:/i.test(urlFinale)) urlFinale = `mailto:${urlFinale}`;
    } else if (!/^https?:\/\//i.test(urlFinale)) {
      urlFinale = `https://${urlFinale}`;
    }
    setLiensPerso([...(liensPerso || []), { id: uid(), label, url: urlFinale, categorie: categorie || "autre" }]);
    setFormOuvert(false);
  };

  const supprimerLien = (id) => {
    if (!confirm("Supprimer ce lien ?")) return;
    setLiensPerso((liensPerso || []).filter((l) => l.id !== id));
  };

  return (
    <div style={{ padding: "6px 18px 18px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 12 }}>
        Mes liens perso
      </div>
      {(!liensPerso || liensPerso.length === 0) && (
        <div style={{ fontSize: 13, color: "var(--muted-soft)", marginBottom: 14 }}>Aucun lien ajouté pour l'instant.</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {(liensPerso || []).map((l) => {
          const cat = CATEGORIES_LIENS.find((c) => c.value === l.categorie) || CATEGORIES_LIENS[3];
          const Icon = cat.Icon;
          return (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "12px 14px" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: PRIMARY_SOFT, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={17} />
              </div>
              <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: "none", color: INK, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{l.label}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url}</div>
              </a>
              <button onClick={() => supprimerLien(l.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", flexShrink: 0 }}>
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
      <button onClick={() => setFormOuvert(true)} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: `1.5px dashed ${PRIMARY}`, background: "none", color: PRIMARY, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Plus size={17} /> Ajouter un lien
      </button>
      {formOuvert && (
        <FormModal
          title="Nouveau lien"
          fields={[
            { key: "label", label: "Nom du lien", placeholder: "ex : Ma boîte mail", required: true },
            { key: "categorie", label: "Type de lien", type: "select", default: "site", options: CATEGORIES_LIENS.map((c) => ({ value: c.value, label: c.label })) },
            { key: "url", label: "Adresse (site, e-mail...)", placeholder: "ex : https://... ou nom@mail.com", required: true },
          ]}
          onClose={() => setFormOuvert(false)}
          onSubmit={ajouterLien}
          submitLabel="Ajouter le lien"
        />
      )}
    </div>
  );
}

// ---------- Écran : Liste des classes ----------
function ClassesScreen({ classes, setClasses, onOpenClass }) {
  const [formOuvert, setFormOuvert] = useState(false);
  const creerClasse = ({ nom }) => {
    setClasses([...classes, { id: uid(), nom, eleves: [], cycles: [{ id: uid(), activite: "Nouveau cycle", dateDebut: todayISO(), seances: [] }], profPrincipal: "", profPrincipalPhoto: null, cpe: "", delegues: [], chronos: [], blocNotes: [], type: "classe", sousClasses: [] }]);
    setFormOuvert(false);
  };
  const removeClasse = (id) => {
    if (!confirm("Supprimer cette classe et toutes ses données ?")) return;
    setClasses(classes.filter((c) => c.id !== id));
  };
  return (
    <div style={{ padding: 16 }}>
      {classes.map((c) => (
        <div
          key={c.id}
          style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => onOpenClass(c.id)}
        >
          <div style={{ width: 40, height: 40, borderRadius: 10, background: PRIMARY_SOFT, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: INK, display: "flex", alignItems: "center", gap: 6 }}>
              {c.nom}
              {c.type === "groupe" && <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, background: ACCENT_SOFT, padding: "2px 7px", borderRadius: 6 }}>Groupe classe</span>}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--muted-soft)" }}>{c.eleves.length} élèves · cycle en cours : {c.cycles[c.cycles.length - 1]?.activite}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); removeClasse(c.id); }} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button onClick={() => setFormOuvert(true)} style={{ width: "100%", marginTop: 6, padding: "12px 0", borderRadius: 12, border: `1.5px dashed ${PRIMARY}`, background: "none", color: PRIMARY, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <Plus size={17} /> Nouvelle classe
      </button>
      {formOuvert && (
        <FormModal
          title="Nouvelle classe"
          fields={[{ key: "nom", label: "Nom de la classe", placeholder: "ex : Terminale 3", required: true }]}
          onClose={() => setFormOuvert(false)}
          onSubmit={creerClasse}
          submitLabel="Créer la classe"
        />
      )}
    </div>
  );
}

// ---------- Écran : Détail classe (liste imprimable + gestion élèves) ----------
// ---------- Fenêtre : encadrement de la classe (PP, CPE, délégués) ----------
function ClasseInfoModal({ classe, onClose, onSave }) {
  const [pp, setPp] = useState(classe.profPrincipal || "");
  const [cpe, setCpe] = useState(classe.cpe || "");
  const [delegues, setDelegues] = useState(classe.delegues || []);

  const toggleDelegue = (id) => {
    setDelegues((d) => d.includes(id) ? d.filter((x) => x !== id) : [...d, id]);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Encadrement — {classe.nom}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>

        <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 4 }}>Professeur principal</div>
        <input value={pp} onChange={(e) => setPp(e.target.value)} placeholder="Nom du professeur principal" style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, marginBottom: 12, background: CARD, color: INK }} />

        <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 4 }}>CPE</div>
        <input value={cpe} onChange={(e) => setCpe(e.target.value)} placeholder="Nom du/de la CPE" style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, marginBottom: 16, background: CARD, color: INK }} />

        <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 6 }}>Délégués de classe</div>
        <div style={{ marginBottom: 18 }}>
          {classe.eleves.map((e) => (
            <label key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 4px", cursor: "pointer" }}>
              <input type="checkbox" checked={delegues.includes(e.id)} onChange={() => toggleDelegue(e.id)} />
              <span style={{ fontSize: 13.5, color: INK }}>{e.prenom} {e.nom}</span>
            </label>
          ))}
          {classe.eleves.length === 0 && <div style={{ fontSize: 12.5, color: "var(--muted-soft)" }}>Ajoute d'abord des élèves à cette classe.</div>}
        </div>

        <button
          onClick={() => { onSave({ profPrincipal: pp, cpe, delegues }); onClose(); }}
          style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function ClasseDetail({ classe, updateClasse, onOpenEleve, onAnnotate, onOpenChrono, onOpenBlocNote, evaluations, onOpenEvaluation }) {
  const [printMode, setPrintMode] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [formEleveOuvert, setFormEleveOuvert] = useState(false);
  const [eleveEnEdition, setEleveEnEdition] = useState(null);
  const [formSousClasseOuvert, setFormSousClasseOuvert] = useState(false);
  const [renommageOuvert, setRenommageOuvert] = useState(false);

  const renommerClasse = ({ nom }) => {
    updateClasse({ ...classe, nom });
    setRenommageOuvert(false);
  };

  const creerEleve = ({ nom, prenom, sousClasseId }) => {
    updateClasse({ ...classe, eleves: [...classe.eleves, { id: uid(), nom, prenom: prenom || "", photo: null, notes: "", annotations: [], telephoneEleve: "", telephoneParents: "", sousClasseId: sousClasseId || null, dispenses: [] }] });
    setFormEleveOuvert(false);
  };
  const modifierEleve = ({ nom, prenom, sousClasseId }) => {
    updateClasse({ ...classe, eleves: classe.eleves.map((e) => e.id === eleveEnEdition.id ? { ...e, nom, prenom: prenom || "", sousClasseId: sousClasseId || null } : e) });
    setEleveEnEdition(null);
  };
  const removeEleve = (id) => updateClasse({ ...classe, eleves: classe.eleves.filter((e) => e.id !== id) });

  const [editionNomGroupe, setEditionNomGroupe] = useState(false);
  const [nomGroupeTmp, setNomGroupeTmp] = useState(classe.nom);

  const ouvrirEditionGroupe = () => { setNomGroupeTmp(classe.nom); setEditionNomGroupe(true); };
  const validerNomGroupe = () => {
    const nom = nomGroupeTmp.trim();
    if (!nom) return;
    updateClasse({ ...classe, type: "groupe", nom });
    setEditionNomGroupe(false);
  };
  const desactiverGroupe = () => updateClasse({ ...classe, type: "classe" });
  const creerSousClasse = ({ nom }) => {
    if (classe.sousClasses.length >= 5) return;
    updateClasse({ ...classe, sousClasses: [...classe.sousClasses, { id: uid(), nom }] });
    setFormSousClasseOuvert(false);
  };
  const supprimerSousClasse = (id) => {
    updateClasse({
      ...classe,
      sousClasses: classe.sousClasses.filter((s) => s.id !== id),
      eleves: classe.eleves.map((e) => e.sousClasseId === id ? { ...e, sousClasseId: null } : e),
    });
  };

  const importerTelephones = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const feuille = wb.Sheets[wb.SheetNames[0]];
        const lignes = XLSX.utils.sheet_to_json(feuille, { defval: "" });
        let maj = 0;
        const eleves = classe.eleves.map((e) => {
          const ligne = lignes.find((l) => {
            const cles = Object.keys(l);
            const getVal = (motifs) => {
              const cle = cles.find((c) => motifs.some((m) => normaliser(c).includes(m)));
              return cle ? l[cle] : "";
            };
            const nomL = normaliser(getVal(["nom"]));
            const prenomL = normaliser(getVal(["prenom", "prénom"]));
            return nomL === normaliser(e.nom) && prenomL === normaliser(e.prenom);
          });
          if (!ligne) return e;
          const cles = Object.keys(ligne);
          const getVal = (motifs) => {
            const cle = cles.find((c) => motifs.some((m) => normaliser(c).includes(m)));
            return cle ? String(ligne[cle] || "") : "";
          };
          const telE = getVal(["telephone eleve", "tel eleve", "telephoneeleve", "portable eleve"]);
          const telP = getVal(["telephone parent", "tel parent", "telephoneparent"]);
          if (!telE && !telP) return e;
          maj++;
          return { ...e, telephoneEleve: telE || e.telephoneEleve, telephoneParents: telP || e.telephoneParents };
        });
        updateClasse({ ...classe, eleves });
        setImportMsg(`${maj} élève(s) mis à jour.`);
      } catch (err) {
        setImportMsg("Impossible de lire ce fichier.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const trie = [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom));
  const cycleActuel = classe.cycles[classe.cycles.length - 1]?.activite;
  const nomsDelegues = (classe.delegues || []).map((id) => classe.eleves.find((e) => e.id === id)).filter(Boolean).map((e) => `${e.prenom} ${e.nom}`);

  if (printMode) {
    return (
      <div style={{ padding: 24, background: "#fff" }}>
        <style>{`@media print { .no-print { display:none !important; } body { background:#fff; } }`}</style>
        <div className="no-print" style={{ marginBottom: 16, display: "flex", gap: 10 }}>
          <button onClick={() => setPrintMode(false)} style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${LINE}`, background: "#fff", cursor: "pointer" }}>Retour</button>
          <button onClick={() => window.print()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: PRIMARY, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Printer size={16} /> Imprimer
          </button>
        </div>
        <h2 style={{ fontFamily: "'Oswald', sans-serif" }}>Classe {classe.nom}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "2px solid #000", padding: 6 }}>N°</th>
              <th style={{ textAlign: "left", borderBottom: "2px solid #000", padding: 6 }}>Nom</th>
              <th style={{ textAlign: "left", borderBottom: "2px solid #000", padding: 6 }}>Prénom</th>
            </tr>
          </thead>
          <tbody>
            {trie.map((e, i) => (
              <tr key={e.id}>
                <td style={{ padding: 6, borderBottom: "1px solid #ccc" }}>{i + 1}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #ccc" }}>{e.nom}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #ccc" }}>{e.prenom}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 18, color: INK, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {classe.nom}
        </div>
        <button onClick={() => setRenommageOuvert(true)} title="Renommer la classe" style={{ border: `1px solid ${LINE}`, background: CARD, borderRadius: 8, padding: "6px 8px", cursor: "pointer", display: "flex", color: PRIMARY, flexShrink: 0 }}>
          <Pencil size={14} />
        </button>
      </div>

      <div style={{ background: PRIMARY_SOFT, border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, marginBottom: 12, position: "relative" }}>
        <button onClick={() => setInfoOpen(true)} title="Modifier l'encadrement" style={{ position: "absolute", top: 10, right: 10, border: "none", background: "none", color: PRIMARY, cursor: "pointer" }}>
          <Pencil size={15} />
        </button>
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12.5, color: INK, marginBottom: 3 }}>
          <GraduationCap size={14} color={PRIMARY} /> Prof. principal : <b>{classe.profPrincipal || "non renseigné"}</b>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12.5, color: INK, marginBottom: 3 }}>
          <GraduationCap size={14} color={PRIMARY} /> CPE : <b>{classe.cpe || "non renseigné"}</b>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12.5, color: INK }}>
          <Star size={14} color={PRIMARY} /> Délégués : <b>{nomsDelegues.length ? nomsDelegues.join(", ") : "non renseigné"}</b>
        </div>
      </div>

      <div style={{ background: classe.type === "groupe" ? ACCENT_SOFT : "none", border: classe.type === "groupe" ? `1px solid ${ACCENT}` : `1px dashed ${LINE}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: (classe.type === "groupe" || editionNomGroupe) ? 10 : 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: classe.type === "groupe" ? ACCENT : "var(--muted-soft)", display: "flex", alignItems: "center", gap: 6 }}>
            {classe.type === "groupe" ? "Groupe classe" : "Classe simple"}
            {classe.type === "groupe" && !editionNomGroupe && (
              <button onClick={ouvrirEditionGroupe} title="Renommer le groupe classe" style={{ border: "none", background: "none", color: ACCENT, cursor: "pointer", display: "flex" }}>
                <Pencil size={12} />
              </button>
            )}
          </div>
          {classe.type === "groupe" ? (
            !editionNomGroupe && <button onClick={desactiverGroupe} style={{ fontSize: 11.5, border: "none", background: "none", color: "var(--muted-soft)", cursor: "pointer" }}>Repasser en classe simple</button>
          ) : (
            !editionNomGroupe && <button onClick={ouvrirEditionGroupe} style={{ fontSize: 11.5, border: "none", background: "none", color: PRIMARY, fontWeight: 700, cursor: "pointer" }}>Transformer en groupe classe</button>
          )}
        </div>
        {editionNomGroupe && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 5 }}>Nom du groupe classe (ex : Terminales mercredi 10h-12h)</div>
            <input
              autoFocus
              value={nomGroupeTmp}
              onChange={(e) => setNomGroupeTmp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && validerNomGroupe()}
              style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, marginBottom: 8, background: CARD, color: INK }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setEditionNomGroupe(false)} style={{ flex: 1, padding: "8px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 12.5, cursor: "pointer" }}>Annuler</button>
              <button onClick={validerNomGroupe} style={{ flex: 2, padding: "8px 0", borderRadius: 9, border: "none", background: ACCENT, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Valider</button>
            </div>
          </div>
        )}
        {classe.type === "groupe" && (
          <div>
            <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 6 }}>Classes d'origine du groupe (max 5) :</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              {classe.sousClasses.map((s) => (
                <span key={s.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, background: CARD, border: `1px solid ${LINE}`, borderRadius: 8, padding: "4px 8px" }}>
                  {s.nom}
                  <button onClick={() => supprimerSousClasse(s.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", display: "flex" }}><X size={12} /></button>
                </span>
              ))}
            </div>
            {classe.sousClasses.length < 5 && (
              <button onClick={() => setFormSousClasseOuvert(true)} style={{ fontSize: 12, border: `1px dashed ${ACCENT}`, background: "none", color: ACCENT, borderRadius: 8, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={12} /> Ajouter une classe d'origine
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={() => setPrintMode(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, fontSize: 13.5, color: INK }}>
          <Printer size={15} /> Liste imprimable
        </button>
        <button onClick={() => setFormEleveOuvert(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 600, fontSize: 13.5 }}>
          <Plus size={15} /> Ajouter un élève
        </button>
      </div>

      <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "9px 0", borderRadius: 10, border: `1.5px dashed ${LINE}`, color: "var(--muted-soft)", fontSize: 12.5, cursor: "pointer", marginBottom: importMsg ? 6 : 14 }}>
        <input type="file" accept=".csv,.xlsx,.xls,.ods" onChange={(e) => e.target.files[0] && importerTelephones(e.target.files[0])} style={{ display: "none" }} />
        <Upload size={14} /> Importer les téléphones (Excel / CSV / ODS)
      </label>
      {importMsg && <div style={{ fontSize: 11.5, color: PRIMARY, marginBottom: 14, textAlign: "center" }}>{importMsg}</div>}

      {(classe.chronos || []).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4 }}>Fiches chronomètre</div>
            <button
              onClick={() => { if (confirm("Supprimer toutes les fiches chronomètre de cette classe ?")) updateClasse({ ...classe, chronos: [] }); }}
              style={{ fontSize: 11, border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}
            >
              Tout supprimer
            </button>
          </div>
          {classe.chronos.map((f) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 6, background: CARD }}>
              <div onClick={() => onOpenChrono(f.id)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer" }}>
                <Flag size={15} color={PRIMARY} />
                <div style={{ fontSize: 13, color: INK }}>
                  {f.titre && <b>{f.titre} · </b>}
                  {fmtDateHeure(f.date)} · {f.distance} m · {f.temps.length} temps
                </div>
              </div>
              <button
                onClick={() => { if (confirm("Supprimer cette fiche chronomètre ?")) updateClasse({ ...classe, chronos: classe.chronos.filter((x) => x.id !== f.id) }); }}
                style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {(classe.blocNotes || []).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4 }}>Bloc-notes</div>
            <button
              onClick={() => { if (confirm("Supprimer tous les bloc-notes de cette classe ?")) updateClasse({ ...classe, blocNotes: [] }); }}
              style={{ fontSize: 11, border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}
            >
              Tout supprimer
            </button>
          </div>
          {classe.blocNotes.map((n) => (
            <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 6, background: CARD }}>
              <div onClick={() => onOpenBlocNote(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer", minWidth: 0 }}>
                <FileText size={15} color={PRIMARY} />
                <div style={{ fontSize: 13, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {n.titre && <b>{n.titre} · </b>}
                  {fmtDateHeure(n.date)}{(n.medias || []).length > 0 ? ` · ${n.medias.length} média(s)` : ""}
                </div>
              </div>
              <button
                onClick={() => { if (confirm("Supprimer ce bloc-note ?")) updateClasse({ ...classe, blocNotes: classe.blocNotes.filter((x) => x.id !== n.id) }); }}
                style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", flexShrink: 0 }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {(evaluations || []).filter((ev) => ev.classeId === classe.id).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Évaluations</div>
          {evaluations.filter((ev) => ev.classeId === classe.id).map((ev) => (
            <div key={ev.id} onClick={() => onOpenEvaluation(ev.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 6, background: CARD, cursor: "pointer" }}>
              <Table size={15} color={PRIMARY} />
              <div style={{ fontSize: 13, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <b>{ev.titre}</b> · modifiée le {new Date(ev.dateModif).toLocaleDateString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      )}

      {trie.map((e) => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 6px", borderBottom: `1px solid ${LINE}` }}>
          <div onClick={() => onOpenEleve(e.id)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, cursor: "pointer" }}>
            <Avatar eleve={e} size={34} />
            <div style={{ fontSize: 14.5, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {e.nom} <span style={{ color: "var(--muted)" }}>{e.prenom}</span>
              {classe.type === "groupe" && e.sousClasseId && (
                <span style={{ fontSize: 10.5, color: ACCENT, marginLeft: 6 }}>· {classe.sousClasses.find((s) => s.id === e.sousClasseId)?.nom}</span>
              )}
            </div>
          </div>
          <button onClick={() => setEleveEnEdition(e)} title="Modifier" style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer", padding: 4, flexShrink: 0 }}>
            <Pencil size={16} />
          </button>
          <button onClick={() => onAnnotate(e.id, cycleActuel)} title="Annotation rapide" style={{ border: "none", background: "none", color: "var(--gold)", cursor: "pointer", padding: 4, flexShrink: 0 }}>
            <StickyNote size={16} />
          </button>
          <button onClick={() => removeEleve(e.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", padding: 4, flexShrink: 0 }}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {infoOpen && (
        <ClasseInfoModal
          classe={classe}
          onClose={() => setInfoOpen(false)}
          onSave={(patch) => updateClasse({ ...classe, ...patch })}
        />
      )}
      {formEleveOuvert && (
        <FormModal
          title="Ajouter un élève"
          fields={[
            { key: "nom", label: "Nom", placeholder: "Nom de famille", required: true },
            { key: "prenom", label: "Prénom", placeholder: "Prénom" },
            ...(classe.type === "groupe" && classe.sousClasses.length > 0
              ? [{ key: "sousClasseId", label: "Classe d'origine", type: "select", options: classe.sousClasses.map((s) => ({ value: s.id, label: s.nom })) }]
              : []),
          ]}
          onClose={() => setFormEleveOuvert(false)}
          onSubmit={creerEleve}
          submitLabel="Ajouter l'élève"
        />
      )}
      {eleveEnEdition && (
        <FormModal
          title={`Modifier ${eleveEnEdition.prenom} ${eleveEnEdition.nom}`}
          fields={[
            { key: "nom", label: "Nom", placeholder: "Nom de famille", required: true, default: eleveEnEdition.nom },
            { key: "prenom", label: "Prénom", placeholder: "Prénom", default: eleveEnEdition.prenom },
            ...(classe.type === "groupe" && classe.sousClasses.length > 0
              ? [{ key: "sousClasseId", label: "Classe d'origine", type: "select", options: classe.sousClasses.map((s) => ({ value: s.id, label: s.nom })), default: eleveEnEdition.sousClasseId || "" }]
              : []),
          ]}
          onClose={() => setEleveEnEdition(null)}
          onSubmit={modifierEleve}
          submitLabel="Enregistrer les modifications"
        />
      )}
      {formSousClasseOuvert && (
        <FormModal
          title="Ajouter une classe d'origine"
          fields={[{ key: "nom", label: "Nom de la classe", placeholder: "ex : T-STAV1", required: true }]}
          onClose={() => setFormSousClasseOuvert(false)}
          onSubmit={creerSousClasse}
          submitLabel="Ajouter"
        />
      )}
      {renommageOuvert && (
        <FormModal
          title="Renommer la classe"
          fields={[{ key: "nom", label: "Nom de la classe", default: classe.nom, required: true }]}
          onClose={() => setRenommageOuvert(false)}
          onSubmit={renommerClasse}
          submitLabel="Enregistrer"
        />
      )}
    </div>
  );
}

// ---------- Écran : Trombinoscope ----------
function TrombiScreen({ classes, updateEleve, updateClasse, onOpenEleve }) {
  const [classeId, setClasseId] = useState(classes[0]?.id);
  const classe = classes.find((c) => c.id === classeId);

  const onPhoto = (eleveId, file) => {
    const reader = new FileReader();
    reader.onload = () => updateEleve(classeId, eleveId, { photo: reader.result });
    reader.readAsDataURL(file);
  };

  const onPPPhoto = (file) => {
    const reader = new FileReader();
    reader.onload = () => updateClasse({ ...classe, profPrincipalPhoto: reader.result });
    reader.readAsDataURL(file);
  };

  const renderEleveTile = (e) => (
    <div key={e.id} style={{ textAlign: "center" }}>
      <div style={{ position: "relative" }}>
        <div
          onClick={() => onOpenEleve(classeId, e.id)}
          style={{ width: "100%", aspectRatio: "1", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}
          title="Ouvrir la fiche élève"
        >
          {e.photo ? (
            <img src={e.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", background: PRIMARY_SOFT, color: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 20 }}>
              {initials(e.prenom, e.nom)}
            </div>
          )}
        </div>
        <label
          onClick={(ev) => ev.stopPropagation()}
          title="Changer la photo"
          style={{ position: "absolute", bottom: 4, right: 4, background: CARD, borderRadius: 8, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.2)", cursor: "pointer", display: "flex" }}
        >
          <input type="file" accept="image/*" capture="environment" onChange={(ev) => ev.target.files[0] && onPhoto(e.id, ev.target.files[0])} style={{ display: "none" }} />
          <Camera size={13} color={PRIMARY} />
        </label>
      </div>
      <div onClick={() => onOpenEleve(classeId, e.id)} style={{ fontSize: 11.5, marginTop: 5, fontWeight: 600, color: INK, cursor: "pointer", textDecoration: (classe.delegues || []).includes(e.id) ? "underline" : "none" }}>{e.prenom}</div>
      <div style={{ fontSize: 10.5, color: "var(--muted-soft)" }}>{e.nom}</div>
    </div>
  );

  const estGroupe = classe?.type === "groupe" && (classe.sousClasses || []).length > 0;
  const sansSousClasse = estGroupe ? classe.eleves.filter((e) => !e.sousClasseId || !classe.sousClasses.find((s) => s.id === e.sousClasseId)) : [];

  return (
    <div style={{ padding: 16 }}>
      <select value={classeId} onChange={(e) => setClasseId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, marginBottom: 14, fontSize: 14 }}>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
      </select>

      {classe?.profPrincipal && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10, marginBottom: estGroupe ? 18 : 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: "100%", aspectRatio: "1", borderRadius: 12, overflow: "hidden", border: `2px solid ${PRIMARY}` }}>
                {classe.profPrincipalPhoto ? (
                  <img src={classe.profPrincipalPhoto} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: PRIMARY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GraduationCap size={26} />
                  </div>
                )}
              </div>
              <label
                title="Changer la photo"
                style={{ position: "absolute", bottom: 4, right: 4, background: CARD, borderRadius: 8, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.2)", cursor: "pointer", display: "flex" }}
              >
                <input type="file" accept="image/*" capture="environment" onChange={(ev) => ev.target.files[0] && onPPPhoto(ev.target.files[0])} style={{ display: "none" }} />
                <Camera size={13} color={PRIMARY} />
              </label>
            </div>
            <div style={{ fontSize: 11.5, marginTop: 5, fontWeight: 700, color: PRIMARY }}>Prof. principal</div>
            <div style={{ fontSize: 10.5, color: "var(--muted-soft)" }}>{classe.profPrincipal}</div>
          </div>
        </div>
      )}

      {estGroupe ? (
        <>
          {classe.sousClasses.map((s) => {
            const membres = classe.eleves.filter((e) => e.sousClasseId === s.id);
            if (membres.length === 0) return null;
            return (
              <div key={s.id} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>{s.nom}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                  {membres.map(renderEleveTile)}
                </div>
              </div>
            );
          })}
          {sansSousClasse.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Classe d'origine non renseignée</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                {sansSousClasse.map(renderEleveTile)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
          {classe?.eleves.map(renderEleveTile)}
        </div>
      )}
    </div>
  );
}

// ---------- Écran : Appel ----------
function AppelScreen({ classes, updateClasse, onOpenEleve, onAnnotate, onVoirFicheCycle, biblio, setBiblio }) {
  const [classeId, setClasseId] = useState(classes[0]?.id);
  const classe = classes.find((c) => c.id === classeId);
  const cycle = classe?.cycles[classe.cycles.length - 1];
  const [date, setDate] = useState(todayISO());
  const [statuts, setStatuts] = useState({});
  const [saved, setSaved] = useState(false);
  const [detailsOuverts, setDetailsOuverts] = useState(false);
  const [dispenseCible, setDispenseCible] = useState(null); // élève pour lequel on configure une dispense

  const seanceExistante = useMemo(() => cycle?.seances.find((s) => s.date === date), [cycle, date]);

  React.useEffect(() => {
    setStatuts(seanceExistante ? { ...seanceExistante.appels } : {});
    setSaved(false);
  }, [date, classeId]);

  const comptesST = useMemo(() => {
    const comptes = {};
    cycle?.seances.forEach((s) => {
      if (s.id === seanceExistante?.id) return;
      Object.entries(s.appels).forEach(([eid, st]) => {
        if (st === "sans_tenue") comptes[eid] = (comptes[eid] || 0) + 1;
      });
    });
    Object.entries(statuts).forEach(([eid, st]) => {
      if (st === "sans_tenue") comptes[eid] = (comptes[eid] || 0) + 1;
    });
    return comptes;
  }, [cycle, statuts, seanceExistante]);

  const setStatut = (eleveId, statut) => {
    setStatuts((prev) => ({ ...prev, [eleveId]: prev[eleveId] === statut ? undefined : statut }));
    setSaved(false);
  };

  const onClicStatut = (eleve, key) => {
    if (key === "dispense" && statuts[eleve.id] !== "dispense") {
      setDispenseCible(eleve);
      return;
    }
    setStatut(eleve.id, key);
  };

  const validerDispenseJourSeul = () => {
    setStatut(dispenseCible.id, "dispense");
    setDispenseCible(null);
  };

  const confirmerDispenseExistante = () => {
    setStatut(dispenseCible.id, "dispense");
    setDispenseCible(null);
  };

  const ajouterPhotoADispenseExistante = ({ dispenseId, photo }) => {
    const eleve = dispenseCible;
    const idPhoto = uid();
    updateClasse({
      ...classe,
      eleves: classe.eleves.map((e) => e.id !== eleve.id ? e : {
        ...e,
        dispenses: (e.dispenses || []).map((d) => d.id !== dispenseId ? d : { ...d, photos: [...d.photos, { id: idPhoto, data: photo.data, dateAjout: nowISO() }] }),
      }),
    });
    const doc = {
      id: idPhoto,
      nom: photo.nom || `Dispense ${eleve.prenom} ${eleve.nom}`,
      type: "image",
      extension: "JPG",
      data: photo.data,
      dateAjout: nowISO(),
      dispenseRef: { classeId: classe.id, eleveId: eleve.id, dispenseId },
    };
    setBiblio((b) => ajouterDocDansDossierAuto(b, ["Dispenses EPS", classe.nom], doc));
    setStatut(eleve.id, "dispense");
    setDispenseCible(null);
  };

  const redefinirPeriodeExistante = ({ dispenseId, dateDebut, dateFin }) => {
    const eleve = dispenseCible;
    const eleveMaj = {
      ...eleve,
      dispenses: (eleve.dispenses || []).map((d) => d.id !== dispenseId ? d : { ...d, dateDebut, dateFin }),
    };
    let classeMaj = { ...classe, eleves: classe.eleves.map((e) => e.id === eleve.id ? eleveMaj : e) };
    classeMaj = convertirAbsencesEnDispense(classeMaj, eleve.id, dateDebut, dateFin);
    updateClasse(classeMaj);
    setStatut(eleve.id, "dispense");
    setDispenseCible(null);
  };

  const validerDispensePeriode = ({ dateDebut, dateFin, photo }) => {
    const eleve = dispenseCible;
    const dispenseId = uid();
    const idPhoto = photo ? uid() : null;
    const eleveMaj = {
      ...eleve,
      dispenses: [...(eleve.dispenses || []), { id: dispenseId, dateDebut, dateFin, photos: photo ? [{ id: idPhoto, data: photo.data, dateAjout: nowISO() }] : [] }],
    };
    let classeMaj = { ...classe, eleves: classe.eleves.map((e) => e.id === eleve.id ? eleveMaj : e) };
    classeMaj = convertirAbsencesEnDispense(classeMaj, eleve.id, dateDebut, dateFin);
    updateClasse(classeMaj);
    setStatut(eleve.id, "dispense");
    if (photo) {
      const doc = {
        id: idPhoto,
        nom: photo.nom || `Dispense ${eleve.prenom} ${eleve.nom}`,
        type: "image",
        extension: "JPG",
        data: photo.data,
        dateAjout: nowISO(),
        dispenseRef: { classeId: classe.id, eleveId: eleve.id, dispenseId },
      };
      setBiblio((b) => ajouterDocDansDossierAuto(b, ["Dispenses EPS", classe.nom], doc));
    }
    setDispenseCible(null);
  };

  const enregistrer = () => {
    const dernierCycle = classe.cycles[classe.cycles.length - 1];
    const existeDeja = dernierCycle.seances.some((s) => s.date === date);
    const nouvellesSeances = existeDeja
      ? dernierCycle.seances.map((s) => s.date === date ? { ...s, appels: statuts } : s)
      : [...dernierCycle.seances, { id: uid(), date, appels: statuts }];
    const cycles = classe.cycles.map((c, i) => i === classe.cycles.length - 1 ? { ...c, seances: nouvellesSeances } : c);
    updateClasse({ ...classe, cycles });
    setSaved(true);
  };

  const [formCycleOuvert, setFormCycleOuvert] = useState(false);
  const creerCycle = ({ activite }) => {
    updateClasse({ ...classe, cycles: [...classe.cycles, { id: uid(), activite, dateDebut: todayISO(), seances: [] }] });
    setFormCycleOuvert(false);
  };

  if (!classe) return null;

  const renderLigneEleve = (e) => {
    const compteST = comptesST[e.id] || 0;
    const perteFinale = compteST >= 2;
    const dispenseObj = dispenseDuJour(e, date);
    const dispense = !!dispenseObj;
    const dispenseAvecPhoto = dispense && dispenseObj.photos.length > 0;
    const dispBg = dispense ? (dispenseAvecPhoto ? "var(--st-dispense-bg)" : "var(--st-absent-bg)") : "transparent";
    const dispColor = dispense ? (dispenseAvecPhoto ? "var(--st-dispense-c)" : "var(--st-absent-c)") : INK;
    return (
      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 6px", borderBottom: `1px solid ${LINE}`, background: dispBg, borderRadius: dispense ? 8 : 0 }}>
        <div onClick={() => onOpenEleve(classeId, e.id)} style={{ cursor: "pointer", position: "relative", flexShrink: 0 }}>
          <Avatar eleve={e} size={30} />
          {!dispense && compteST > 0 && (
            <div title={`${compteST} oubli(s) de tenue${perteFinale ? " · -1 pt" : ""}`} style={{
              position: "absolute", bottom: -3, right: -3, minWidth: 15, height: 15, borderRadius: 8, padding: "0 3px",
              background: perteFinale ? "var(--st-absent-c)" : "var(--st-tenue-c)", color: "#fff", fontSize: 9, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${CARD}`,
            }}>
              {compteST}
            </div>
          )}
        </div>
        <div
          onClick={() => onOpenEleve(classeId, e.id)}
          title={dispense && !dispenseAvecPhoto ? "Dispensé — justificatif photo manquant" : undefined}
          style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: dispColor, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: (classe.delegues || []).includes(e.id) ? "underline" : "none" }}
        >
          {e.prenom} {e.nom}
        </div>
        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
          {Object.entries(STATUTS).map(([key, s]) => {
            const active = statuts[e.id] === key;
            return (
              <button
                key={key}
                onClick={() => onClicStatut(e, key)}
                title={s.label}
                style={{
                  width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${active ? s.color : LINE}`,
                  background: active ? s.color : CARD, color: active ? CARD : s.color,
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
                }}
              >
                <s.Icon size={16} />
              </button>
            );
          })}
          <button
            onClick={() => onAnnotate(classeId, e.id, cycle?.activite)}
            title="Annotation rapide"
            style={{ width: 34, height: 34, borderRadius: 9, border: `1.5px solid ${LINE}`, background: CARD, color: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <StickyNote size={15} />
          </button>
        </div>
      </div>
    );
  };

  const estGroupe = classe.type === "groupe" && (classe.sousClasses || []).length > 0;
  const sansSousClasse = estGroupe ? classe.eleves.filter((e) => !e.sousClasseId || !classe.sousClasses.find((s) => s.id === e.sousClasseId)) : [];

  return (
    <div style={{ padding: "10px 12px", paddingBottom: 90 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <select value={classeId} onChange={(e) => { setClasseId(e.target.value); setStatuts({}); }} style={{ flex: 1.3, padding: 8, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13, background: CARD, color: INK }}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 12.5, background: CARD, color: INK }} />
        <button onClick={() => setDetailsOuverts((o) => !o)} title="Détails du cycle" style={{ border: `1px solid ${LINE}`, background: CARD, borderRadius: 9, padding: "7px 9px", cursor: "pointer", display: "flex" }}>
          <Table2 size={15} color={PRIMARY} />
        </button>
      </div>

      {seanceExistante && (
        <div style={{ fontSize: 10.5, color: ACCENT, fontWeight: 600, marginBottom: 4 }}>
          Appel déjà enregistré à cette date — les modifications le mettront à jour.
        </div>
      )}

      {detailsOuverts && (
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "var(--muted-soft)" }}>Cycle : <b style={{ color: INK }}>{cycle?.activite}</b></div>
            <button onClick={() => setFormCycleOuvert(true)} style={{ border: `1px solid ${LINE}`, background: CARD, borderRadius: 8, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: PRIMARY, fontWeight: 600 }}>
              <RefreshCw size={12} /> Nouveau cycle
            </button>
          </div>
          <button onClick={() => onVoirFicheCycle(classeId)} style={{ width: "100%", marginBottom: (classe.profPrincipal || classe.cpe || (classe.delegues || []).length > 0) ? 8 : 0, padding: "8px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: "none", color: PRIMARY, fontWeight: 600, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Table2 size={13} /> Voir la fiche générale du cycle
          </button>
          {(classe.profPrincipal || classe.cpe || (classe.delegues || []).length > 0) && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", fontSize: 10.5, color: "var(--muted-soft)" }}>
              {classe.profPrincipal && <span>PP : <b style={{ color: INK }}>{classe.profPrincipal}</b></span>}
              {classe.cpe && <span>· CPE : <b style={{ color: INK }}>{classe.cpe}</b></span>}
              {(classe.delegues || []).length > 0 && (
                <span>· Délégués : <b style={{ color: INK }}>{classe.delegues.map((id) => classe.eleves.find((e) => e.id === id)).filter(Boolean).map((e) => `${e.prenom} ${e.nom}`).join(", ")}</b></span>
              )}
            </div>
          )}
        </div>
      )}

      {estGroupe ? (
        <>
          {classe.sousClasses.map((s) => {
            const membres = classe.eleves.filter((e) => e.sousClasseId === s.id);
            if (membres.length === 0) return null;
            return (
              <div key={s.id}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0 2px" }}>{s.nom}</div>
                {membres.map((e) => renderLigneEleve(e))}
              </div>
            );
          })}
          {sansSousClasse.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, margin: "6px 0 2px" }}>Classe d'origine non renseignée</div>
              {sansSousClasse.map((e) => renderLigneEleve(e))}
            </div>
          )}
        </>
      ) : (
        classe.eleves.map((e) => renderLigneEleve(e))
      )}

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 58, padding: "10px 16px", background: "linear-gradient(transparent, var(--paper) 30%)" }}>
        <button onClick={enregistrer} style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: saved ? "var(--st-present-c)" : PRIMARY, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: "pointer" }}>
          {saved ? "Fiche enregistrée ✓" : (seanceExistante ? "Mettre à jour l'appel" : "Enregistrer l'appel")}
        </button>
      </div>
      {formCycleOuvert && (
        <FormModal
          title="Nouveau cycle"
          fields={[{ key: "activite", label: "Nom de l'activité", placeholder: "ex : Badminton", required: true }]}
          onClose={() => setFormCycleOuvert(false)}
          onSubmit={creerCycle}
          submitLabel="Créer le cycle"
        />
      )}
      {dispenseCible && (
        <DispenseChoiceModal
          eleve={dispenseCible}
          dateAppel={date}
          dispenseExistante={dispenseDuJour(dispenseCible, date)}
          onClose={() => setDispenseCible(null)}
          onJourSeul={validerDispenseJourSeul}
          onValiderPeriode={validerDispensePeriode}
          onConfirmerExistante={confirmerDispenseExistante}
          onAjouterPhotoExistante={ajouterPhotoADispenseExistante}
          onRedefinirPeriode={redefinirPeriodeExistante}
        />
      )}
    </div>
  );
}

// ---------- Écran : Fiche élève ----------
function FicheEleve({ classe, eleve, updateEleve, updateClasse, onAnnotate, biblio, setBiblio }) {
  const [notes, setNotes] = useState(eleve.notes || "");
  const [telE, setTelE] = useState(eleve.telephoneEleve || "");
  const [telP, setTelP] = useState(eleve.telephoneParents || "");
  const estDelegue = (classe.delegues || []).includes(eleve.id);
  const [formDispenseOuvert, setFormDispenseOuvert] = useState(false);
  const [dispenseEnEdition, setDispenseEnEdition] = useState(null);
  const [photoEnEditionDispense, setPhotoEnEditionDispense] = useState(null); // { dispenseId }
  const [impressionDispenses, setImpressionDispenses] = useState(null); // array de dispenses à imprimer

  const historique = useMemo(() => {
    const lignes = [];
    classe.cycles.forEach((cy) => {
      cy.seances.forEach((s) => {
        if (s.appels[eleve.id]) lignes.push({ date: s.date, cycle: cy.activite, statut: s.appels[eleve.id] });
      });
    });
    return lignes.sort((a, b) => b.date.localeCompare(a.date));
  }, [classe, eleve.id]);

  const annotations = useMemo(() => [...(eleve.annotations || [])].sort((a, b) => b.date.localeCompare(a.date)), [eleve.annotations]);
  const cycleActuel = classe.cycles[classe.cycles.length - 1]?.activite;

  const compteParCycle = useMemo(() => {
    const map = {};
    classe.cycles.forEach((cy) => {
      let n = 0;
      cy.seances.forEach((s) => { if (s.appels[eleve.id] === "sans_tenue") n++; });
      map[cy.activite] = n;
    });
    return map;
  }, [classe, eleve.id]);

  const saveNotes = () => updateEleve({ ...eleve, notes });
  const saveTelE = () => updateEleve({ ...eleve, telephoneEleve: telE });
  const saveTelP = () => updateEleve({ ...eleve, telephoneParents: telP });

  const dispenses = useMemo(() => [...(eleve.dispenses || [])].sort((a, b) => b.dateDebut.localeCompare(a.dateDebut)), [eleve.dispenses]);

  const creerDispense = ({ dateDebut, dateFin }) => {
    const df = dateFin || dateDebut;
    const eleveMaj = { ...eleve, dispenses: [...(eleve.dispenses || []), { id: uid(), dateDebut, dateFin: df, photos: [] }] };
    let classeMaj = { ...classe, eleves: classe.eleves.map((e) => e.id === eleve.id ? eleveMaj : e) };
    classeMaj = convertirAbsencesEnDispense(classeMaj, eleve.id, dateDebut, df);
    updateClasse(classeMaj);
    setFormDispenseOuvert(false);
  };
  const modifierDispense = ({ dateDebut, dateFin }) => {
    const df = dateFin || dateDebut;
    const eleveMaj = {
      ...eleve,
      dispenses: (eleve.dispenses || []).map((d) => d.id === dispenseEnEdition.id ? { ...d, dateDebut, dateFin: df } : d),
    };
    let classeMaj = { ...classe, eleves: classe.eleves.map((e) => e.id === eleve.id ? eleveMaj : e) };
    classeMaj = convertirAbsencesEnDispense(classeMaj, eleve.id, dateDebut, df);
    updateClasse(classeMaj);
    setDispenseEnEdition(null);
  };
  const supprimerDispense = (id) => {
    if (!confirm("Supprimer cette période de dispense ?")) return;
    updateEleve({ ...eleve, dispenses: (eleve.dispenses || []).filter((d) => d.id !== id) });
  };
  const declencherPhotoDispense = (dispenseId, file) => {
    const reader = new FileReader();
    reader.onload = () => setPhotoEnEditionDispense({ dispenseId, data: reader.result });
    reader.readAsDataURL(file);
  };
  const confirmerPhotoDispense = (dataUrl, nom) => {
    const { dispenseId } = photoEnEditionDispense;
    const idPartage = uid();
    const photo = { id: idPartage, data: dataUrl, dateAjout: nowISO() };
    updateEleve({
      ...eleve,
      dispenses: (eleve.dispenses || []).map((d) => d.id === dispenseId ? { ...d, photos: [...d.photos, photo] } : d),
    });
    const doc = {
      id: idPartage,
      nom: nom || `Dispense ${eleve.prenom} ${eleve.nom}`,
      type: "image",
      extension: "JPG",
      data: dataUrl,
      dateAjout: nowISO(),
      dispenseRef: { classeId: classe.id, eleveId: eleve.id, dispenseId },
    };
    setBiblio((b) => ajouterDocDansDossierAuto(b, ["Dispenses EPS", classe.nom], doc));
    setPhotoEnEditionDispense(null);
  };
  const [confirmSuppression, setConfirmSuppression] = useState(null); // { dispenseId, photoId }
  const demanderSuppressionPhoto = (dispenseId, photoId) => setConfirmSuppression({ dispenseId, photoId });
  const supprimerPhotoSeule = () => {
    const { dispenseId, photoId } = confirmSuppression;
    updateEleve({
      ...eleve,
      dispenses: (eleve.dispenses || []).map((d) => d.id === dispenseId ? { ...d, photos: d.photos.filter((p) => p.id !== photoId) } : d),
    });
    setConfirmSuppression(null);
  };
  const supprimerPhotoEtDocument = () => {
    const { dispenseId, photoId } = confirmSuppression;
    updateEleve({
      ...eleve,
      dispenses: (eleve.dispenses || []).map((d) => d.id === dispenseId ? { ...d, photos: d.photos.filter((p) => p.id !== photoId) } : d),
    });
    setBiblio((b) => retirerDocParId(b, photoId));
    setConfirmSuppression(null);
  };

  if (impressionDispenses) {
    return (
      <DispensePrintView
        items={impressionDispenses.map((d) => ({ eleveNom: `${eleve.prenom} ${eleve.nom}`, classeNom: classe.nom, dispense: d }))}
        onBack={() => setImpressionDispenses(null)}
      />
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Avatar eleve={eleve} size={56} />
        <div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 19, color: INK }}>{eleve.prenom} {eleve.nom}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted-soft)" }}>{classe.nom}</div>
        </div>
      </div>

      {(estDelegue || classe.profPrincipal || classe.cpe) && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {estDelegue && (
            <span style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, background: PRIMARY_SOFT, padding: "4px 9px", borderRadius: 7, display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={11} /> Délégué de classe
            </span>
          )}
          {classe.profPrincipal && <span style={{ fontSize: 11, color: "var(--muted-soft)", background: CARD, border: `1px solid ${LINE}`, padding: "4px 9px", borderRadius: 7 }}>PP : {classe.profPrincipal}</span>}
          {classe.cpe && <span style={{ fontSize: 11, color: "var(--muted-soft)", background: CARD, border: `1px solid ${LINE}`, padding: "4px 9px", borderRadius: 7 }}>CPE : {classe.cpe}</span>}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Dispenses
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {dispenses.length > 0 && (
            <button onClick={() => setImpressionDispenses(dispenses)} style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700 }}>
              <Printer size={13} /> Tout imprimer
            </button>
          )}
          <button onClick={() => setFormDispenseOuvert(true)} style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700 }}>
            <Plus size={13} /> Ajouter une période
          </button>
        </div>
      </div>
      {dispenses.length === 0 && <div style={{ fontSize: 13, color: "var(--muted-soft)", marginBottom: 20 }}>Aucune dispense enregistrée.</div>}
      {dispenses.map((d) => {
        const enCours = todayISO() >= d.dateDebut && todayISO() <= d.dateFin;
        return (
          <div key={d.id} style={{ border: `1px solid ${enCours ? "var(--st-dispense-bd)" : LINE}`, background: enCours ? "var(--st-dispense-bg)" : CARD, borderRadius: 12, padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--st-dispense-c)" }}>
                Du {new Date(d.dateDebut).toLocaleDateString("fr-FR")} au {new Date(d.dateFin).toLocaleDateString("fr-FR")}
                {enCours && <span style={{ marginLeft: 6, fontSize: 10.5, fontWeight: 700 }}>· en cours</span>}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setDispenseEnEdition(d)} title="Modifier les dates" style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer" }}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => setImpressionDispenses([d])} title="Imprimer cette dispense" style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer" }}>
                  <Printer size={14} />
                </button>
                <button onClick={() => supprimerDispense(d.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            {d.photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 6, marginBottom: 8 }}>
                {d.photos.map((p) => (
                  <div key={p.id} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "1" }}>
                    <img src={p.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button onClick={() => demanderSuppressionPhoto(d.id, p.id)} style={{ position: "absolute", top: 3, right: 3, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: 5, padding: 3, cursor: "pointer", display: "flex" }}>
                      <X size={11} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: PRIMARY, fontWeight: 600, cursor: "pointer" }}>
              <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files[0] && declencherPhotoDispense(d.id, e.target.files[0])} style={{ display: "none" }} />
              <Camera size={13} /> Ajouter une photo
            </label>
          </div>
        );
      })}

      <div style={{ marginTop: 6 }} />

      {classe.type === "groupe" && classe.sousClasses.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Classe d'origine (au sein du groupe)</div>
          <select
            value={eleve.sousClasseId || ""}
            onChange={(e) => updateEleve({ ...eleve, sousClasseId: e.target.value || null })}
            style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: CARD, color: INK }}
          >
            <option value="">—</option>
            {classe.sousClasses.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> Tél. élève</div>
          <input value={telE} onChange={(e) => setTelE(e.target.value)} onBlur={saveTelE} placeholder="06 xx xx xx xx" style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13, background: CARD, color: INK }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} /> Tél. parents</div>
          <input value={telP} onChange={(e) => setTelP(e.target.value)} onBlur={saveTelP} placeholder="06 xx xx xx xx" style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13, background: CARD, color: INK }} />
        </div>
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Oublis de tenue par cycle
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {Object.entries(compteParCycle).map(([act, n]) => (
          <div key={act} style={{ padding: "6px 10px", borderRadius: 9, background: n >= 2 ? "var(--st-absent-bg)" : CARD, border: `1px solid ${n >= 2 ? "var(--st-absent-bd)" : LINE}`, fontSize: 12 }}>
            {act} : <b>{n}</b>{n >= 2 ? " (-1 pt)" : ""}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.5 }}>
          Annotations rapides
        </div>
        <button onClick={() => onAnnotate(eleve.id, cycleActuel)} style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, fontWeight: 700 }}>
          <StickyNote size={13} /> Ajouter
        </button>
      </div>
      {annotations.length === 0 && <div style={{ fontSize: 13, color: "var(--muted-soft)", marginBottom: 20 }}>Aucune annotation pour le moment.</div>}
      {annotations.map((a) => (
        <div key={a.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0, background: a.type === "positif" ? "var(--st-present-bg)" : "var(--st-absent-bg)", color: a.type === "positif" ? "var(--st-present-c)" : "var(--st-absent-c)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {a.type === "positif" ? <ThumbsUp size={13} /> : <ThumbsDown size={13} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: INK }}>{a.texte}</div>
            <div style={{ fontSize: 11, color: "var(--muted-soft)", marginTop: 2 }}>{fmtDateHeure(a.date)}{a.activite ? ` · ${a.activite}` : ""}</div>
          </div>
        </div>
      ))}

      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 20 }}>
        Notes & observations
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={saveNotes}
        rows={5}
        placeholder="Observations, résultats, appréciations…"
        style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 13.5, fontFamily: "inherit", resize: "vertical", marginBottom: 22 }}
      />

      <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        Historique d'appel
      </div>
      {historique.length === 0 && <div style={{ fontSize: 13, color: "var(--muted-soft)" }}>Aucune séance enregistrée pour le moment.</div>}
      {historique.map((h, i) => {
        const s = STATUTS[h.statut];
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${LINE}` }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: s.bg, color: s.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <s.Icon size={13} />
            </div>
            <div style={{ flex: 1, fontSize: 13 }}>{new Date(h.date).toLocaleDateString("fr-FR")}</div>
            <div style={{ fontSize: 12, color: "var(--muted-soft)" }}>{h.cycle}</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: s.color }}>{s.label}</div>
          </div>
        );
      })}
      {formDispenseOuvert && (
        <FormModal
          title="Nouvelle période de dispense"
          fields={[
            { key: "dateDebut", label: "Du", type: "date", required: true },
            { key: "dateFin", label: "Au", type: "date", required: true },
          ]}
          onClose={() => setFormDispenseOuvert(false)}
          onSubmit={creerDispense}
          submitLabel="Ajouter la période"
        />
      )}
      {dispenseEnEdition && (
        <FormModal
          title="Modifier la période de dispense"
          fields={[
            { key: "dateDebut", label: "Du", type: "date", required: true, default: dispenseEnEdition.dateDebut },
            { key: "dateFin", label: "Au", type: "date", required: true, default: dispenseEnEdition.dateFin },
          ]}
          onClose={() => setDispenseEnEdition(null)}
          onSubmit={modifierDispense}
          submitLabel="Enregistrer"
        />
      )}
      {photoEnEditionDispense && (
        <PhotoEditModal dataUrl={photoEnEditionDispense.data} onCancel={() => setPhotoEnEditionDispense(null)} onConfirm={confirmerPhotoDispense} />
      )}
      {confirmSuppression && (
        <LinkedDeleteModal
          message="Cette photo a aussi été enregistrée dans Documents (Dispenses EPS). Que veux-tu supprimer ?"
          labelOnly="Seulement ici, sur la fiche"
          labelBoth="Ici et dans Documents"
          onCancel={() => setConfirmSuppression(null)}
          onOnly={supprimerPhotoSeule}
          onBoth={supprimerPhotoEtDocument}
        />
      )}
    </div>
  );
}

// ---------- Écran : Outils (liste) ----------
function OutilsScreen({ onOpenOutil, onOpenEvaluations, onOpenEdt, onOpenAssistantRentree, onOpenChangerPin }) {
  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
        <QuickTile Icon={Timer} label="Minuteur" onClick={() => onOpenOutil("minuteur")} tone="minuteur" />
        <QuickTile Icon={Flag} label="Chronomètre" onClick={() => onOpenOutil("chrono")} tone="chrono" />
        <QuickTile Icon={FileText} label="Bloc-note" onClick={() => onOpenOutil("blocnote")} tone="blocnote" />
        <QuickTile Icon={Table} label="Éditeur de tableau" onClick={onOpenEvaluations} tone="documents" />
        <QuickTile Icon={Calendar} label="Emploi du temps" onClick={onOpenEdt} tone="classes" />
        <QuickTile Icon={GraduationCap} label="Assistant de rentrée" onClick={onOpenAssistantRentree} tone="appel" />
        <QuickTile Icon={Lock} label="Code d'accès" onClick={onOpenChangerPin} tone="trombi" />
      </div>
    </div>
  );
}

// ---------- Outil : Minuteur (repris de VMA Pro) ----------
function beep(freq = 880, duration = 150, volume = 0.2) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (e) {}
}

function beepDoubleEffort() { beep(1046, 130, 0.4); setTimeout(() => beep(1046, 180, 0.4), 160); }
function beepDoubleRecup() { beep(1568, 130, 0.4); setTimeout(() => beep(1568, 180, 0.4), 160); }

function gong() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [220, 330, 440].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const vol = 0.28 / (i + 1);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
      osc.stop(ctx.currentTime + 1.8);
    });
  } catch (e) {}
}

function pad2(n) { return String(n).padStart(2, "0"); }

const PRESETS = {
  simple: { label: "Simple", effortMin: 1, effortSec: 0, recupMin: 0, recupSec: 30, repetitions: 8 },
  tabata: { label: "Tabata", effortMin: 0, effortSec: 20, recupMin: 0, recupSec: 10, repetitions: 8 },
  emom: { label: "EMOM", effortMin: 1, effortSec: 0, recupMin: 0, recupSec: 0, repetitions: 10 },
  vma4x3: { label: "Test VMA 4×3'", effortMin: 3, effortSec: 0, recupMin: 3, recupSec: 30, repetitions: 4 },
  vaussenat: { label: "Vaussenat", effortMin: 3, effortSec: 0, recupMin: 1, recupSec: 0, repetitions: 12 },
};

function MinuteurScreen() {
  const [modeActif, setModeActif] = useState("simple");
  const [effortMin, setEffortMin] = useState(1);
  const [effortSec, setEffortSec] = useState(0);
  const [recupMin, setRecupMin] = useState(0);
  const [recupSec, setRecupSec] = useState(30);
  const [repetitions, setRepetitions] = useState(8);

  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("effort"); // effort | recup
  const [repActuelle, setRepActuelle] = useState(1);
  const [restant, setRestant] = useState(effortMin * 60 + effortSec);

  const dureeEffort = effortMin * 60 + effortSec;
  const dureeRecup = recupMin * 60 + recupSec;

  const appliquerPreset = (key) => {
    const p = PRESETS[key];
    setModeActif(key);
    setEffortMin(p.effortMin); setEffortSec(p.effortSec);
    setRecupMin(p.recupMin); setRecupSec(p.recupSec);
    setRepetitions(p.repetitions);
    setRunning(false);
    setPhase("effort");
    setRepActuelle(1);
    setRestant(p.effortMin * 60 + p.effortSec);
  };

  React.useEffect(() => {
    if (!running) return;
    if (restant <= 0) {
      if (phase === "effort") {
        if (repActuelle >= repetitions) {
          gong();
          setRunning(false);
          return;
        }
        beepDoubleRecup();
        setPhase("recup");
        setRestant(dureeRecup);
      } else {
        beepDoubleEffort();
        setPhase("effort");
        setRepActuelle((r) => r + 1);
        setRestant(dureeEffort);
      }
      return;
    }
    const t = setTimeout(() => setRestant((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, restant, phase]);

  const start = () => {
    if (!running) { setRestant(phase === "effort" ? dureeEffort || 1 : dureeRecup); phase === "effort" ? beepDoubleEffort() : beepDoubleRecup(); }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setPhase("effort");
    setRepActuelle(1);
    setRestant(dureeEffort);
  };

  const champ = (label, value, setValue, max) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4, textAlign: "center" }}>{label}</div>
      <input
        type="number" min={0} max={max} value={value} disabled={running}
        onChange={(e) => { setModeActif(null); setValue(Math.max(0, Math.min(max, Number(e.target.value) || 0))); }}
        style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${LINE}`, textAlign: "center", fontSize: 14, background: CARD, color: INK }}
      />
    </div>
  );

  const champRepetitions = (label, value, setValue, max) => (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4, textAlign: "center" }}>{label}</div>
      <input
        type="number" min={1} max={max} value={value} disabled={running}
        onChange={(e) => {
          const v = Math.max(1, Math.min(max, Number(e.target.value) || 1));
          setValue(v);
          setRepActuelle((r) => Math.min(r, v));
        }}
        style={{ width: "100%", padding: 8, borderRadius: 8, border: `1px solid ${LINE}`, textAlign: "center", fontSize: 14, background: CARD, color: INK }}
      />
    </div>
  );

  const pctPhase = phase === "effort"
    ? (dureeEffort ? 1 - restant / dureeEffort : 0)
    : (dureeRecup ? 1 - restant / dureeRecup : 0);

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => appliquerPreset(key)}
            disabled={running}
            style={{
              padding: "7px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: running ? "default" : "pointer",
              border: `1.5px solid ${modeActif === key ? PRIMARY : LINE}`,
              background: modeActif === key ? PRIMARY : CARD,
              color: modeActif === key ? "#fff" : INK,
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {champ("Effort min", effortMin, setEffortMin, 59)}
        {champ("Effort sec", effortSec, setEffortSec, 59)}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {champ("Récup min", recupMin, setRecupMin, 59)}
        {champ("Récup sec", recupSec, setRecupSec, 59)}
      </div>
      <div style={{ marginBottom: 20 }}>
        {champRepetitions("Répétitions", repetitions, setRepetitions, 99)}
      </div>

      <div style={{
        background: phase === "effort" ? "var(--st-tenue-bg)" : "var(--st-dispense-bg)",
        border: `1px solid ${phase === "effort" ? "var(--st-tenue-bd)" : "var(--st-dispense-bd)"}`,
        borderRadius: 18, padding: "26px 16px", textAlign: "center", marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: phase === "effort" ? "var(--st-tenue-c)" : "var(--st-dispense-c)", marginBottom: 6 }}>
          {phase === "effort" ? "Effort" : "Récupération"} · {repActuelle}/{repetitions}
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 56, color: INK, lineHeight: 1 }}>
          {pad2(Math.floor(restant / 60))}:{pad2(restant % 60)}
        </div>
        <div style={{ height: 6, borderRadius: 4, background: CARD, marginTop: 14, overflow: "hidden" }}>
          <div style={{ width: `${Math.max(0, Math.min(100, pctPhase * 100))}%`, height: "100%", background: phase === "effort" ? "var(--st-tenue-c)" : "var(--st-dispense-c)", transition: "width 1s linear" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={reset} style={{ width: 52, height: 52, borderRadius: 14, border: `1px solid ${LINE}`, background: CARD, color: INK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RotateCcw size={20} />
        </button>
        <button
          onClick={running ? pause : start}
          style={{ flex: 1, height: 52, borderRadius: 14, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {running ? <Pause size={20} /> : <Play size={20} />} {running ? "Pause" : "Démarrer"}
        </button>
      </div>
    </div>
  );
}

// ---------- Outil : Chronomètre multi-temps avec classement et vitesse ----------
function fmtChrono(ms) {
  const totalCs = Math.floor(ms / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60);
  return `${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}

function ChronoScreen({ classes, updateClasse }) {
  const [distance, setDistance] = useState(50);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [temps, setTemps] = useState([]); // [{id, ms, noms}]
  const [demandeSauvegarde, setDemandeSauvegarde] = useState(false);
  const [classeChoisie, setClasseChoisie] = useState(classes[0]?.id || "");
  const [titreChoisi, setTitreChoisi] = useState("");
  const [choixOuvert, setChoixOuvert] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const startRef = React.useRef(0);
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    if (!running) return;
    const tick = () => {
      setElapsed(performance.now() - startRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  const start = () => {
    beep(880, 120);
    startRef.current = performance.now() - elapsed;
    setRunning(true);
    setDemandeSauvegarde(false);
    setChoixOuvert(false);
    setConfirmation("");
  };
  const stop = () => {
    setRunning(false);
    beep(520, 150);
    if (temps.length > 0) setDemandeSauvegarde(true);
  };
  const reset = () => {
    setRunning(false);
    setElapsed(0);
    setTemps([]);
    setDemandeSauvegarde(false);
    setChoixOuvert(false);
    setConfirmation("");
  };

  const prendreTemps = () => {
    beep(1046, 80);
    setTemps((t) => [...t, { id: uid(), ms: performance.now() - startRef.current, noms: "" }]);
  };

  const renommerTemps = (id, noms) => setTemps((t) => t.map((x) => x.id === id ? { ...x, noms } : x));

  const vitesse = (ms) => {
    if (!distance || ms <= 0) return null;
    const sec = ms / 1000;
    return (Number(distance) / sec) * 3.6;
  };

  const confirmerSauvegarde = () => {
    const classe = classes.find((c) => c.id === classeChoisie);
    if (!classe) return;
    const fiche = { id: uid(), date: nowISO(), distance: Number(distance), temps, titre: titreChoisi.trim() };
    updateClasse({ ...classe, chronos: [fiche, ...(classe.chronos || [])] });
    setDemandeSauvegarde(false);
    setChoixOuvert(false);
    setTitreChoisi("");
    setConfirmation(`Classement enregistré dans « ${classe.nom} ».`);
  };

  return (
    <div style={{ padding: 18, paddingBottom: 40 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Distance de course (m)</div>
        <input
          type="number" min={0} value={distance} disabled={running || temps.length > 0}
          onChange={(e) => setDistance(Math.max(0, Number(e.target.value) || 0))}
          style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 15, textAlign: "center", background: CARD, color: INK }}
        />
      </div>

      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 18, padding: "24px 16px", textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 44, color: INK, letterSpacing: 1 }}>
          {fmtChrono(elapsed)}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button onClick={reset} style={{ width: 52, height: 52, borderRadius: 14, border: `1px solid ${LINE}`, background: CARD, color: INK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <RotateCcw size={20} />
        </button>
        <button
          onClick={running ? stop : start}
          style={{ flex: 1, height: 52, borderRadius: 14, border: "none", background: running ? "var(--st-absent-c)" : PRIMARY, color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          {running ? <Pause size={20} /> : <Play size={20} />} {running ? "Arrêter" : "Départ"}
        </button>
        <button
          onClick={prendreTemps}
          disabled={!running}
          style={{ flex: 1, height: 52, borderRadius: 14, border: "none", background: running ? ACCENT : LINE, color: "#fff", fontWeight: 700, fontSize: 16, cursor: running ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Flag size={20} /> Temps
        </button>
      </div>

      {demandeSauvegarde && !choixOuvert && (
        <div style={{ background: PRIMARY_SOFT, border: `1px solid ${PRIMARY}`, borderRadius: 12, padding: 12, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ fontSize: 13, color: INK, fontWeight: 600 }}>Enregistrer cette course ?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setDemandeSauvegarde(false)} style={{ padding: "7px 12px", borderRadius: 8, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 12.5, cursor: "pointer" }}>Non</button>
            <button onClick={() => setChoixOuvert(true)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: PRIMARY, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Oui →</button>
          </div>
        </div>
      )}

      {choixOuvert && (
        <div style={{ background: PRIMARY_SOFT, border: `1px solid ${PRIMARY}`, borderRadius: 12, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: INK, fontWeight: 600, marginBottom: 6 }}>Titre de la course (optionnel)</div>
          <input
            value={titreChoisi}
            onChange={(e) => setTitreChoisi(e.target.value)}
            placeholder="ex : Test 50m — rentrée"
            style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, marginBottom: 10, background: CARD, color: INK }}
          />
          <div style={{ fontSize: 12, color: INK, fontWeight: 600, marginBottom: 8 }}>Dans quelle classe / groupe classe ?</div>
          <select value={classeChoisie} onChange={(e) => setClasseChoisie(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, marginBottom: 10, background: CARD, color: INK }}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setChoixOuvert(false)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 12.5, cursor: "pointer" }}>Annuler</button>
            <button onClick={confirmerSauvegarde} style={{ flex: 2, padding: "9px 0", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Enregistrer le classement</button>
          </div>
        </div>
      )}

      {confirmation && <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 600, marginBottom: 14, textAlign: "center" }}>{confirmation}</div>}

      {temps.length > 0 && (
        <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "34px 1fr 0.8fr 0.8fr 26px", padding: "8px 8px", background: PRIMARY_SOFT, fontSize: 10.5, fontWeight: 700, color: PRIMARY, textTransform: "uppercase" }}>
            <div>Rg</div><div>Coureur(s) · temps</div><div>Écart</div><div>Vitesse</div><div />
          </div>
          {temps.map((t, i) => {
            const prev = i > 0 ? temps[i - 1].ms : 0;
            const ecart = t.ms - prev;
            const v = vitesse(t.ms);
            return (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "34px 1fr 0.8fr 0.8fr 26px", padding: "8px 8px", borderTop: `1px solid ${LINE}`, fontSize: 12.5, alignItems: "center" }}>
                <div style={{ fontWeight: 700, color: PRIMARY }}>{pad2(i + 1)}</div>
                <div>
                  <div style={{ fontWeight: 600, color: INK }}>{fmtChrono(t.ms)}</div>
                  {!running && (
                    <input
                      value={t.noms}
                      onChange={(e) => renommerTemps(t.id, e.target.value)}
                      placeholder="Nom(s) du/des coureur(s)"
                      style={{ width: "100%", marginTop: 3, padding: "5px 7px", borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 11.5, background: CARD, color: INK }}
                    />
                  )}
                </div>
                <div style={{ color: "var(--muted-soft)" }}>{i === 0 ? "—" : `+${fmtChrono(ecart)}`}</div>
                <div style={{ fontWeight: 600 }}>{v ? `${v.toFixed(1)} km/h` : "—"}</div>
                <button onClick={() => setTemps(temps.filter((x) => x.id !== t.id))} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!running && temps.length > 0 && !demandeSauvegarde && !choixOuvert && (
        <button onClick={() => setChoixOuvert(true)} style={{ width: "100%", marginTop: 12, padding: "10px 0", borderRadius: 10, border: `1px solid ${PRIMARY}`, background: "none", color: PRIMARY, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Enregistrer ce classement dans une classe
        </button>
      )}
    </div>
  );
}

// ---------- Écran : Fiche chronomètre sauvegardée (consultation + impression) ----------
function ChronoFicheScreen({ classe, fiche, updateClasse, onDeleted }) {
  const [printMode, setPrintMode] = useState(false);
  const vitesse = (ms) => {
    if (!fiche.distance || ms <= 0) return null;
    return (fiche.distance / (ms / 1000)) * 3.6;
  };

  const majFiche = (patch) => {
    updateClasse({ ...classe, chronos: classe.chronos.map((f) => f.id === fiche.id ? { ...f, ...patch } : f) });
  };
  const renommerTemps = (id, noms) => majFiche({ temps: fiche.temps.map((t) => t.id === id ? { ...t, noms } : t) });
  const supprimerTemps = (id) => majFiche({ temps: fiche.temps.filter((t) => t.id !== id) });
  const supprimerFiche = () => {
    if (!confirm("Supprimer définitivement cette fiche chronomètre ?")) return;
    updateClasse({ ...classe, chronos: classe.chronos.filter((f) => f.id !== fiche.id) });
    onDeleted();
  };

  if (printMode) {
    return (
      <div style={{ padding: 24, background: "#fff" }}>
        <style>{`@media print { .no-print { display:none !important; } body { background:#fff; } }`}</style>
        <div className="no-print" style={{ marginBottom: 16, display: "flex", gap: 10 }}>
          <button onClick={() => setPrintMode(false)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #DEDACE", background: "#fff", cursor: "pointer" }}>Retour</button>
          <button onClick={() => window.print()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#0E8F6B", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <Printer size={16} /> Imprimer
          </button>
        </div>
        <h2 style={{ fontFamily: "'Oswald', sans-serif" }}>{fiche.titre ? fiche.titre : `${classe.nom} — Chronométrage`}</h2>
        <div style={{ marginBottom: 10, color: "#444" }}>{fiche.titre && `${classe.nom} · `}{fmtDateHeure(fiche.date)} · Distance : {fiche.distance} m</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "2px solid #000", padding: 6 }}>Rang</th>
              <th style={{ textAlign: "left", borderBottom: "2px solid #000", padding: 6 }}>Coureur(s)</th>
              <th style={{ textAlign: "left", borderBottom: "2px solid #000", padding: 6 }}>Temps</th>
              <th style={{ textAlign: "left", borderBottom: "2px solid #000", padding: 6 }}>Vitesse</th>
            </tr>
          </thead>
          <tbody>
            {fiche.temps.map((t, i) => (
              <tr key={t.id}>
                <td style={{ padding: 6, borderBottom: "1px solid #ccc" }}>{pad2(i + 1)}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #ccc" }}>{t.noms || "—"}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #ccc" }}>{fmtChrono(t.ms)}</td>
                <td style={{ padding: 6, borderBottom: "1px solid #ccc" }}>{vitesse(t.ms) ? `${vitesse(t.ms).toFixed(1)} km/h` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setPrintMode(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 13.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Printer size={15} /> Imprimer
        </button>
        <button onClick={supprimerFiche} style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: "var(--st-absent-c)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trash2 size={15} />
        </button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Titre</div>
        <input
          value={fiche.titre || ""}
          onChange={(e) => majFiche({ titre: e.target.value })}
          placeholder="Sans titre"
          style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 14, fontWeight: 600, background: CARD, color: INK }}
        />
      </div>
      <div style={{ fontSize: 12.5, color: "var(--muted-soft)", marginBottom: 14 }}>
        {fmtDateHeure(fiche.date)} · Distance : {fiche.distance} m · {fiche.temps.length} temps
      </div>
      <div style={{ border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 0.7fr 26px", padding: "8px", background: PRIMARY_SOFT, fontSize: 10.5, fontWeight: 700, color: PRIMARY, textTransform: "uppercase" }}>
          <div>Rg</div><div>Coureur(s) · temps</div><div>Vitesse</div><div />
        </div>
        {fiche.temps.map((t, i) => (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: "30px 1fr 0.7fr 26px", padding: "8px", borderTop: `1px solid ${LINE}`, fontSize: 12.5, alignItems: "center" }}>
            <div style={{ fontWeight: 700, color: PRIMARY }}>{pad2(i + 1)}</div>
            <div>
              <div style={{ fontWeight: 600, color: INK }}>{fmtChrono(t.ms)}</div>
              <input
                value={t.noms || ""}
                onChange={(e) => renommerTemps(t.id, e.target.value)}
                placeholder="Nom(s) du/des coureur(s)"
                style={{ width: "100%", marginTop: 3, padding: "5px 7px", borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 11.5, background: CARD, color: INK }}
              />
            </div>
            <div style={{ fontWeight: 600 }}>{vitesse(t.ms) ? `${vitesse(t.ms).toFixed(1)} km/h` : "—"}</div>
            <button onClick={() => supprimerTemps(t.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Outil : Bloc-note (texte + photo/vidéo, sauvegardé dans une classe) ----------
function BlocNoteScreen({ classes, updateClasse }) {
  const [texte, setTexte] = useState("");
  const [medias, setMedias] = useState([]); // [{id, type, data}]
  const [choixOuvert, setChoixOuvert] = useState(false);
  const [titreChoisi, setTitreChoisi] = useState("");
  const [classeChoisie, setClasseChoisie] = useState(classes[0]?.id || "");
  const [confirmation, setConfirmation] = useState("");

  const ajouterMedias = (files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setMedias((m) => [...m, { id: uid(), type: file.type.startsWith("video") ? "video" : "image", data: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
  };
  const supprimerMedia = (id) => setMedias((m) => m.filter((x) => x.id !== id));

  const reinitialiser = () => {
    setTexte("");
    setMedias([]);
    setTitreChoisi("");
    setChoixOuvert(false);
    setConfirmation("");
  };

  const confirmerSauvegarde = () => {
    const classe = classes.find((c) => c.id === classeChoisie);
    if (!classe) return;
    const note = { id: uid(), date: nowISO(), titre: titreChoisi.trim(), texte, medias };
    updateClasse({ ...classe, blocNotes: [note, ...(classe.blocNotes || [])] });
    setConfirmation(`Note enregistrée dans « ${classe.nom} ».`);
    setTexte("");
    setMedias([]);
    setTitreChoisi("");
    setChoixOuvert(false);
  };

  const peutEnregistrer = texte.trim() || medias.length > 0;

  return (
    <div style={{ padding: 18, paddingBottom: 40 }}>
      <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Annotation</div>
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        rows={6}
        placeholder="Observations, consignes, bilan de séance…"
        style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 14, background: CARD, color: INK }}
      />

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 0", borderRadius: 10, border: `1.5px dashed ${LINE}`, color: PRIMARY, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files.length && ajouterMedias(e.target.files)} style={{ display: "none" }} />
          <Camera size={15} /> Prendre une photo
        </label>
        <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 0", borderRadius: 10, border: `1.5px dashed ${LINE}`, color: PRIMARY, fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
          <input type="file" accept="image/*,video/*" multiple onChange={(e) => e.target.files.length && ajouterMedias(e.target.files)} style={{ display: "none" }} />
          <Paperclip size={15} /> Bibliothèque
        </label>
      </div>

      {medias.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 8, marginBottom: 16 }}>
          {medias.map((m) => (
            <div key={m.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: CARD, border: `1px solid ${LINE}` }}>
              {m.type === "video" ? (
                <video src={m.data} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted />
              ) : (
                <img src={m.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              {m.type === "video" && (
                <div style={{ position: "absolute", top: 4, left: 4, background: "rgba(0,0,0,0.55)", borderRadius: 6, padding: 3, display: "flex" }}>
                  <Video size={11} color="#fff" />
                </div>
              )}
              <button onClick={() => supprimerMedia(m.id)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex" }}>
                <X size={12} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}

      {confirmation && <div style={{ fontSize: 12, color: PRIMARY, fontWeight: 600, marginBottom: 14, textAlign: "center" }}>{confirmation}</div>}

      {!choixOuvert ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={reinitialiser} style={{ width: 52, height: 48, borderRadius: 12, border: `1px solid ${LINE}`, background: CARD, color: INK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RotateCcw size={18} />
          </button>
          <button
            onClick={() => setChoixOuvert(true)}
            disabled={!peutEnregistrer}
            style={{ flex: 1, height: 48, borderRadius: 12, border: "none", background: peutEnregistrer ? PRIMARY : LINE, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: peutEnregistrer ? "pointer" : "default" }}
          >
            Enregistrer cette note
          </button>
        </div>
      ) : (
        <div style={{ background: PRIMARY_SOFT, border: `1px solid ${PRIMARY}`, borderRadius: 12, padding: 12 }}>
          <div style={{ fontSize: 12, color: INK, fontWeight: 600, marginBottom: 6 }}>Titre de la note (optionnel)</div>
          <input
            value={titreChoisi}
            onChange={(e) => setTitreChoisi(e.target.value)}
            placeholder="ex : Bilan séance badminton"
            style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, marginBottom: 10, background: CARD, color: INK }}
          />
          <div style={{ fontSize: 12, color: INK, fontWeight: 600, marginBottom: 8 }}>Dans quelle classe / groupe classe ?</div>
          <select value={classeChoisie} onChange={(e) => setClasseChoisie(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, marginBottom: 10, background: CARD, color: INK }}>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setChoixOuvert(false)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 12.5, cursor: "pointer" }}>Annuler</button>
            <button onClick={confirmerSauvegarde} style={{ flex: 2, padding: "9px 0", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Enregistrer la note</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Écran : Bloc-note sauvegardé (consultation + édition) ----------
function BlocNoteFicheScreen({ classe, note, updateClasse, onDeleted }) {
  const [texte, setTexte] = useState(note.texte || "");
  const [titre, setTitre] = useState(note.titre || "");

  const majNote = (patch) => {
    updateClasse({ ...classe, blocNotes: classe.blocNotes.map((n) => n.id === note.id ? { ...n, ...patch } : n) });
  };
  const supprimerMedia = (id) => majNote({ medias: note.medias.filter((m) => m.id !== id) });
  const supprimerNote = () => {
    if (!confirm("Supprimer définitivement cette note ?")) return;
    updateClasse({ ...classe, blocNotes: classe.blocNotes.filter((n) => n.id !== note.id) });
    onDeleted();
  };

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Titre</div>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            onBlur={() => majNote({ titre })}
            placeholder="Sans titre"
            style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 14, fontWeight: 600, background: CARD, color: INK }}
          />
        </div>
        <button onClick={supprimerNote} style={{ marginTop: 20, padding: "0 14px", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: "var(--st-absent-c)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trash2 size={15} />
        </button>
      </div>
      <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 14 }}>{fmtDateHeure(note.date)}</div>

      <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Annotation</div>
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        onBlur={() => majNote({ texte })}
        rows={6}
        style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, fontFamily: "inherit", resize: "vertical", marginBottom: 16, background: CARD, color: INK }}
      />

      {(note.medias || []).length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
          {note.medias.map((m) => (
            <div key={m.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: CARD, border: `1px solid ${LINE}` }}>
              {m.type === "video" ? (
                <video src={m.data} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <img src={m.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <button onClick={() => supprimerMedia(m.id)} style={{ position: "absolute", top: 4, right: 4, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: 6, padding: 4, cursor: "pointer", display: "flex" }}>
                <X size={12} color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Documents (placeholder) ----------
function extensionDe(nom) {
  const m = /\.([a-zA-Z0-9]+)$/.exec(nom || "");
  return m ? m[1].toUpperCase() : "";
}

function typeDocument(file) {
  if (file.type.startsWith("image")) return "image";
  if (file.type.startsWith("video")) return "video";
  return "fichier";
}

// Convertit une data URL (base64) en Blob, pour une ouverture fiable sur mobile
// (les navigateurs mobiles gèrent souvent mal l'ouverture directe de longues data: URL).
function dataUrlVersBlob(dataUrl) {
  const [entete, base64] = dataUrl.split(",");
  const mime = /data:(.*?);base64/.exec(entete)?.[1] || "application/octet-stream";
  const bin = atob(base64);
  const octets = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) octets[i] = bin.charCodeAt(i);
  return new Blob([octets], { type: mime });
}

// Ouvre un document dans un nouvel onglet via une URL blob (plus fiable que data: sur mobile),
// ou déclenche un téléchargement si le navigateur ne sait pas l'afficher.
function ouvrirDocumentDansOnglet(doc) {
  try {
    const blob = dataUrlVersBlob(doc.data);
    const url = URL.createObjectURL(blob);
    const fenetre = window.open(url, "_blank");
    if (!fenetre) {
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.nom;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    const a = document.createElement("a");
    a.href = doc.data;
    a.download = doc.nom;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}

// Types de fichiers qu'on peut prévisualiser avec XLSX (SheetJS)
const EXTENSIONS_TABLEUR = ["XLS", "XLSX", "CSV", "ODS"];

function rotateDataUrl(dataUrl, angle) {
  return new Promise((resolve) => {
    if (!angle) { resolve(dataUrl); return; }
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const rad = (angle * Math.PI) / 180;
      const swap = angle % 180 !== 0;
      canvas.width = swap ? img.height : img.width;
      canvas.height = swap ? img.width : img.height;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    img.src = dataUrl;
  });
}

// ---------- Fenêtre : édition rapide d'une photo avant ajout ----------
function PhotoEditModal({ dataUrl, onCancel, onConfirm }) {
  const [angle, setAngle] = useState(0);
  const [preview, setPreview] = useState(dataUrl);
  const [nom, setNom] = useState("Photo");
  const [enCours, setEnCours] = useState(false);

  const appliquerRotation = async (delta) => {
    setEnCours(true);
    const nouvelAngle = (angle + delta + 360) % 360;
    const result = await rotateDataUrl(dataUrl, nouvelAngle);
    setAngle(nouvelAngle);
    setPreview(result);
    setEnCours(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 440, background: CARD, borderRadius: 18, padding: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: INK, marginBottom: 12 }}>Modifier la photo</div>
        <div style={{ borderRadius: 12, overflow: "hidden", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", maxHeight: 320, marginBottom: 12 }}>
          <img src={preview} alt="" style={{ maxWidth: "100%", maxHeight: 320, opacity: enCours ? 0.5 : 1 }} />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 14 }}>
          <button onClick={() => appliquerRotation(-90)} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RotateCcwIcon size={18} />
          </button>
          <button onClick={() => appliquerRotation(90)} style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RotateCw size={18} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Nom du document</div>
        <input value={nom} onChange={(e) => setNom(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, marginBottom: 14, background: CARD, color: INK }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 13, cursor: "pointer" }}>Annuler</button>
          <button onClick={() => onConfirm(preview, nom)} style={{ flex: 2, padding: "10px 0", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Ajouter le document</button>
        </div>
      </div>
    </div>
  );
}

// ---------- Écran : Documents (fichiers + dossiers thématiques) ----------
function getNode(root, path) {
  let node = root;
  for (const seg of path) {
    node = node.dossiers.find((d) => d.id === seg.id);
    if (!node) return null;
  }
  return node;
}

function updateAtPath(node, path, updater) {
  if (path.length === 0) return updater(node);
  const [head, ...rest] = path;
  return {
    ...node,
    dossiers: node.dossiers.map((d) => d.id === head.id ? updateAtPath(d, rest, updater) : d),
  };
}

function ajouterDocDansDossierAuto(biblio, cheminNoms, doc) {
  // cheminNoms ex: ["Dispenses EPS", "2nde 4"] — crée les dossiers manquants au passage
  if (cheminNoms.length === 0) return { ...biblio, documents: [doc, ...biblio.documents] };
  const [nomCourant, ...reste] = cheminNoms;
  let dossiers = [...biblio.dossiers];
  let idx = dossiers.findIndex((d) => d.nom === nomCourant);
  let dossier = idx === -1 ? { id: uid(), nom: nomCourant, documents: [], dossiers: [] } : dossiers[idx];
  const sousBiblio = ajouterDocDansDossierAuto({ documents: dossier.documents, dossiers: dossier.dossiers }, reste, doc);
  dossier = { ...dossier, documents: sousBiblio.documents, dossiers: sousBiblio.dossiers };
  if (idx === -1) dossiers = [...dossiers, dossier];
  else dossiers[idx] = dossier;
  return { ...biblio, dossiers };
}

function retirerDocParId(node, docId) {
  return {
    ...node,
    documents: node.documents.filter((d) => d.id !== docId),
    dossiers: node.dossiers.map((d) => retirerDocParId(d, docId)),
  };
}

// ---------- Fenêtre : choix de suppression liée (photo de dispense ↔ document) ----------
// ---------- Fenêtre : choix rapide dispense (jour seul ou période + photo) depuis l'appel ----------
function DispenseChoiceModal({ eleve, dateAppel, dispenseExistante, onClose, onJourSeul, onValiderPeriode, onConfirmerExistante, onAjouterPhotoExistante, onRedefinirPeriode }) {
  // mode: null (accueil), "nouvelle-periode", "photo-existante", "redefinir-periode"
  const [mode, setMode] = useState(null);
  const [dateDebut, setDateDebut] = useState(dispenseExistante ? dispenseExistante.dateDebut : dateAppel);
  const [dateFin, setDateFin] = useState(dispenseExistante ? dispenseExistante.dateFin : dateAppel);
  const [photoEnEdition, setPhotoEnEdition] = useState(null);
  const [photoStage, setPhotoStage] = useState(null); // { data, nom }

  const declencherPhoto = (file) => {
    const reader = new FileReader();
    reader.onload = () => setPhotoEnEdition(reader.result);
    reader.readAsDataURL(file);
  };
  const confirmerPhotoEdition = (dataUrl, nom) => {
    setPhotoStage({ data: dataUrl, nom });
    setPhotoEnEdition(null);
  };

  const boutonStyle = { padding: "13px 0", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 75, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Dispense — {eleve.prenom} {eleve.nom}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>

        {mode === null && dispenseExistante && (
          <div>
            <div style={{ background: "var(--st-dispense-bg)", border: `1px solid var(--st-dispense-bd)`, borderRadius: 10, padding: 10, marginBottom: 14, fontSize: 12.5, color: "var(--st-dispense-c)" }}>
              Période déjà définie : du {new Date(dispenseExistante.dateDebut).toLocaleDateString("fr-FR")} au {new Date(dispenseExistante.dateFin).toLocaleDateString("fr-FR")}
              {" · "}{dispenseExistante.photos.length > 0 ? `${dispenseExistante.photos.length} photo(s)` : "aucune photo pour l'instant"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={onConfirmerExistante} style={{ ...boutonStyle, border: "none", background: "var(--st-dispense-c)", color: "#fff" }}>
                Marquer dispensé (période actuelle)
              </button>
              <button onClick={() => setMode("photo-existante")} style={{ ...boutonStyle, border: `1px solid ${LINE}`, background: CARD, color: INK }}>
                Ajouter une photo justificative
              </button>
              <button onClick={() => setMode("redefinir-periode")} style={{ ...boutonStyle, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 13 }}>
                Redéfinir cette période
              </button>
            </div>
          </div>
        )}

        {mode === null && !dispenseExistante && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={onJourSeul} style={{ ...boutonStyle, border: `1px solid ${LINE}`, background: CARD, color: INK }}>
              Dispensé aujourd'hui seulement
            </button>
            <button onClick={() => setMode("nouvelle-periode")} style={{ ...boutonStyle, border: "none", background: "var(--st-dispense-c)", color: "#fff" }}>
              Sur une période à définir
            </button>
          </div>
        )}

        {mode === "photo-existante" && (
          <div>
            {photoStage ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <img src={photoStage.data} alt="" style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }} />
                <div style={{ flex: 1, fontSize: 12.5, color: INK }}>{photoStage.nom}</div>
                <button onClick={() => setPhotoStage(null)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}><X size={16} /></button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 0", borderRadius: 10, border: `1.5px dashed ${LINE}`, color: PRIMARY, fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files[0] && declencherPhoto(e.target.files[0])} style={{ display: "none" }} />
                <Camera size={14} /> Prendre la photo
              </label>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setMode(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 13, cursor: "pointer" }}>Retour</button>
              <button
                onClick={() => photoStage && onAjouterPhotoExistante({ dispenseId: dispenseExistante.id, photo: photoStage })}
                disabled={!photoStage}
                style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: photoStage ? "var(--st-dispense-c)" : LINE, color: "#fff", fontWeight: 700, fontSize: 13, cursor: photoStage ? "pointer" : "default" }}
              >
                Ajouter cette photo
              </button>
            </div>
          </div>
        )}

        {mode === "redefinir-periode" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Du</div>
                <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: CARD, color: INK }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Au</div>
                <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: CARD, color: INK }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setMode(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 13, cursor: "pointer" }}>Retour</button>
              <button
                onClick={() => onRedefinirPeriode({ dispenseId: dispenseExistante.id, dateDebut, dateFin: dateFin || dateDebut })}
                style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: "var(--st-dispense-c)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Enregistrer les nouvelles dates
              </button>
            </div>
          </div>
        )}

        {mode === "nouvelle-periode" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Du</div>
                <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: CARD, color: INK }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Au</div>
                <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: CARD, color: INK }} />
              </div>
            </div>

            {photoStage ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <img src={photoStage.data} alt="" style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover" }} />
                <div style={{ flex: 1, fontSize: 12.5, color: INK }}>{photoStage.nom}</div>
                <button onClick={() => setPhotoStage(null)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}><X size={16} /></button>
              </div>
            ) : (
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 0", borderRadius: 10, border: `1.5px dashed ${LINE}`, color: PRIMARY, fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 14 }}>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files[0] && declencherPhoto(e.target.files[0])} style={{ display: "none" }} />
                <Camera size={14} /> Ajouter une photo (optionnel)
              </label>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setMode(null)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 13, cursor: "pointer" }}>Retour</button>
              <button
                onClick={() => onValiderPeriode({ dateDebut, dateFin: dateFin || dateDebut, photo: photoStage })}
                style={{ flex: 2, padding: "11px 0", borderRadius: 10, border: "none", background: "var(--st-dispense-c)", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Valider la période
              </button>
            </div>
          </div>
        )}
      </div>
      {photoEnEdition && (
        <PhotoEditModal dataUrl={photoEnEdition} onCancel={() => setPhotoEnEdition(null)} onConfirm={confirmerPhotoEdition} />
      )}
    </div>
  );
}

// ---------- Fenêtre : sélection d'une liste d'éléments (ex : élèves inclus dans une formule) ----------
function SelectionModal({ titre, items, selectionnes, avecPoids, poidsInitiaux, onClose, onValider }) {
  const [selection, setSelection] = useState(() => new Set(selectionnes && selectionnes.length ? selectionnes : items.map((i) => i.id)));
  const [poids, setPoids] = useState(() => ({ ...(poidsInitiaux || {}) }));

  const toggle = (id) => setSelection((s) => {
    const copie = new Set(s);
    if (copie.has(id)) copie.delete(id); else copie.add(id);
    return copie;
  });
  const changerPoids = (id, v) => setPoids((p) => ({ ...p, [id]: v }));
  const toutSelectionner = () => setSelection(new Set(items.map((i) => i.id)));
  const toutDeselectionner = () => setSelection(new Set());

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "75vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{titre}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>
        {avecPoids && (
          <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 10 }}>Ajuste le coefficient de chaque élément coché (1 par défaut).</div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <button onClick={toutSelectionner} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Tout cocher</button>
          <button onClick={toutDeselectionner} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${LINE}`, background: CARD, color: INK, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Tout décocher</button>
        </div>
        {items.map((item) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 2px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer", minWidth: 0 }}>
              <input type="checkbox" checked={selection.has(item.id)} onChange={() => toggle(item.id)} />
              <span style={{ fontSize: 13.5, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
            </label>
            {avecPoids && selection.has(item.id) && (
              <input
                type="number" step="0.5" min="0"
                value={poids[item.id] ?? 1}
                onChange={(e) => changerPoids(item.id, e.target.value)}
                style={{ width: 48, padding: 4, borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 12, textAlign: "center", background: CARD, color: INK, flexShrink: 0 }}
              />
            )}
          </div>
        ))}
        <button
          onClick={() => onValider([...selection], poids)}
          style={{ width: "100%", marginTop: 14, padding: "12px 0", borderRadius: 12, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Valider ({selection.size}/{items.length})
        </button>
      </div>
    </div>
  );
}

function LinkedDeleteModal({ message, onCancel, onOnly, onBoth, labelOnly, labelBoth }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: CARD, borderRadius: 16, padding: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: INK, marginBottom: 8 }}>Supprimer cette photo</div>
        <div style={{ fontSize: 13, color: "var(--muted-soft)", marginBottom: 16 }}>{message}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={onOnly} style={{ padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {labelOnly}
          </button>
          <button onClick={onBoth} style={{ padding: "10px 0", borderRadius: 10, border: "none", background: "var(--st-absent-c)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {labelBoth}
          </button>
          <button onClick={onCancel} style={{ padding: "9px 0", borderRadius: 10, border: "none", background: "none", color: "var(--muted-soft)", fontSize: 12.5, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Vue imprimable : une ou plusieurs dispenses (élève/classe) ----------
function DispensePrintView({ items, onBack }) {
  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <style>{`@media print { .no-print { display:none !important; } body { background:#fff; } .bloc-dispense { page-break-inside: avoid; margin-bottom: 28px; } }`}</style>
      <div className="no-print" style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #DEDACE", background: "#fff", cursor: "pointer" }}>Retour</button>
        <button onClick={() => window.print()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#0E8F6B", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Printer size={16} /> Imprimer ({items.length})
        </button>
      </div>
      {items.map((it, i) => (
        <div key={i} className="bloc-dispense">
          <h2 style={{ fontFamily: "'Oswald', sans-serif", marginBottom: 4 }}>{it.eleveNom}</h2>
          <div style={{ color: "#444", marginBottom: 10 }}>
            {it.classeNom} · Dispense du {new Date(it.dispense.dateDebut).toLocaleDateString("fr-FR")} au {new Date(it.dispense.dateFin).toLocaleDateString("fr-FR")}
          </div>
          {it.dispense.photos.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {it.dispense.photos.map((p) => (
                <img key={p.id} src={p.data} alt="" style={{ width: "100%", borderRadius: 6, border: "1px solid #ddd" }} />
              ))}
            </div>
          ) : (
            <div style={{ color: "#888", fontSize: 13 }}>Aucune photo jointe à cette dispense.</div>
          )}
          <hr style={{ marginTop: 20, border: "none", borderTop: "1px solid #ddd" }} />
        </div>
      ))}
    </div>
  );
}

// ---------- Vue imprimable : sélection libre de documents ----------
function DocumentsPrintView({ documents, onBack }) {
  const imprimables = documents.filter((d) => d.type === "image" || d.extension === "PDF");
  const ignores = documents.filter((d) => !(d.type === "image" || d.extension === "PDF"));
  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <style>{`@media print { .no-print { display:none !important; } body { background:#fff; } .bloc-doc { page-break-inside: avoid; margin-bottom: 24px; } }`}</style>
      <div className="no-print" style={{ marginBottom: 16, display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #DEDACE", background: "#fff", cursor: "pointer" }}>Retour</button>
        <button onClick={() => window.print()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#0E8F6B", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Printer size={16} /> Imprimer ({imprimables.length})
        </button>
      </div>
      {ignores.length > 0 && (
        <div className="no-print" style={{ background: "#FFF6E5", border: "1px solid #F0D48A", borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 13, color: "#7A5C00" }}>
          {ignores.length} fichier(s) non imprimable(s) directement ici (vidéo, Excel, Word…) : {ignores.map((d) => d.nom).join(", ")}. Utilisez le téléchargement pour les ouvrir et les imprimer depuis leur application.
        </div>
      )}
      {imprimables.map((d) => (
        <div key={d.id} className="bloc-doc">
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{d.nom}</div>
          {d.type === "image" ? (
            <img src={d.data} alt="" style={{ maxWidth: "100%", borderRadius: 6, border: "1px solid #ddd" }} />
          ) : (
            <iframe src={d.data} title={d.nom} style={{ width: "100%", height: 500, border: "1px solid #ddd" }} />
          )}
        </div>
      ))}
      {imprimables.length === 0 && <div style={{ color: "#888" }}>Aucun fichier imprimable dans la sélection.</div>}
    </div>
  );
}

// ---------- Fenêtre : choisir un dossier de destination (déplacer un document) ----------
function MoveModal({ biblio, sourcePath, onClose, onMove }) {
  const [destPath, setDestPath] = useState([]);
  const node = getNode(biblio, destPath);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 65, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "80vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Déplacer vers…</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>

        <div style={{ fontSize: 12.5, color: "var(--muted-soft)", marginBottom: 10, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
          <span onClick={() => setDestPath([])} style={{ cursor: "pointer", color: PRIMARY, fontWeight: destPath.length === 0 ? 700 : 500 }}>Racine</span>
          {destPath.map((seg, i) => (
            <span key={seg.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span>/</span>
              <span onClick={() => setDestPath(destPath.slice(0, i + 1))} style={{ cursor: "pointer", color: PRIMARY, fontWeight: i === destPath.length - 1 ? 700 : 500 }}>{seg.nom}</span>
            </span>
          ))}
        </div>

        {node.dossiers.length === 0 && (
          <div style={{ fontSize: 12.5, color: "var(--muted-soft)", marginBottom: 14 }}>Aucun sous-dossier ici.</div>
        )}
        {node.dossiers.map((d) => (
          <div key={d.id} onClick={() => setDestPath([...destPath, { id: d.id, nom: d.nom }])} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 8px", border: `1px solid ${LINE}`, borderRadius: 9, marginBottom: 6, cursor: "pointer" }}>
            <Folder size={16} color={PRIMARY} />
            <span style={{ fontSize: 13.5, color: INK }}>{d.nom}</span>
          </div>
        ))}

        <button
          onClick={() => onMove(destPath)}
          disabled={destPath.length === sourcePath.length && destPath.every((s, i) => s.id === sourcePath[i]?.id)}
          style={{ width: "100%", marginTop: 10, padding: "12px 0", borderRadius: 12, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Déplacer ici
        </button>
      </div>
    </div>
  );
}

// ---------- Fenêtre : visionneuse de document (image / PDF / tableur / autre) ----------
function DocumentViewerModal({ doc, onClose }) {
  const [feuille, setFeuille] = useState(null); // { headers, rows } pour aperçu tableur
  const [erreurTableur, setErreurTableur] = useState(false);
  const [urlPdf, setUrlPdf] = useState(null);

  React.useEffect(() => {
    if (doc.extension === "PDF") {
      const blob = dataUrlVersBlob(doc.data);
      const url = URL.createObjectURL(blob);
      setUrlPdf(url);
      return () => URL.revokeObjectURL(url);
    }
    if (EXTENSIONS_TABLEUR.includes(doc.extension)) {
      try {
        const base64 = doc.data.split(",")[1];
        const wb = XLSX.read(base64, { type: "base64" });
        const feuilleNom = wb.SheetNames[0];
        const json = XLSX.utils.sheet_to_json(wb.Sheets[feuilleNom], { header: 1 });
        setFeuille({ headers: json[0] || [], rows: json.slice(1, 200) });
      } catch (e) {
        setErreurTableur(true);
      }
    }
  }, [doc]);

  const estImage = doc.type === "image";
  const estPdf = doc.extension === "PDF";
  const estTableur = EXTENSIONS_TABLEUR.includes(doc.extension);
  const estVideo = doc.type === "video";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 70, display: "flex", flexDirection: "column" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ margin: "auto", width: "100%", maxWidth: 640, maxHeight: "88vh", background: CARD, borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, marginRight: 8 }}>{doc.nom}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)", flexShrink: 0 }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: 14, background: "#f4f2ec" }}>
          {estImage && (
            <img src={doc.data} alt="" style={{ width: "100%", borderRadius: 8 }} />
          )}
          {estVideo && (
            <video src={doc.data} controls style={{ width: "100%", borderRadius: 8 }} />
          )}
          {estPdf && urlPdf && (
            <iframe src={urlPdf} title={doc.nom} style={{ width: "100%", height: "65vh", border: "none", borderRadius: 8, background: "#fff" }} />
          )}
          {estTableur && feuille && (
            <div style={{ overflow: "auto", background: "#fff", borderRadius: 8, border: `1px solid ${LINE}` }}>
              <table style={{ borderCollapse: "collapse", fontSize: 12, width: "100%" }}>
                <thead>
                  <tr>
                    {feuille.headers.map((h, i) => (
                      <th key={i} style={{ border: `1px solid ${LINE}`, padding: "5px 8px", background: PRIMARY_SOFT, textAlign: "left", whiteSpace: "nowrap" }}>{h ?? ""}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {feuille.rows.map((row, i) => (
                    <tr key={i}>
                      {feuille.headers.map((_, j) => (
                        <td key={j} style={{ border: `1px solid ${LINE}`, padding: "5px 8px", whiteSpace: "nowrap" }}>{row[j] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {estTableur && !feuille && !erreurTableur && (
            <div style={{ color: "var(--muted-soft)", fontSize: 13, textAlign: "center", padding: 30 }}>Chargement de l'aperçu…</div>
          )}
          {(erreurTableur || (!estImage && !estVideo && !estPdf && !estTableur)) && (
            <div style={{ color: "var(--muted-soft)", fontSize: 13, textAlign: "center", padding: 30 }}>
              Aucun aperçu disponible pour ce type de fichier ({doc.extension || "?"}).<br />Utilisez « Ouvrir » ou « Télécharger » ci-dessous.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, padding: 12, borderTop: `1px solid ${LINE}` }}>
          <button onClick={() => ouvrirDocumentDansOnglet(doc)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            <ExternalLink size={16} /> Ouvrir
          </button>
          <a href={doc.data} download={doc.nom} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, color: INK, fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
            <Download size={16} /> Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------- Écran : Documents (fichiers + dossiers thématiques imbriqués) ----------
function DocumentsScreen({ biblio, setBiblio, onSupprimerPhotoDeDispense, onOpenRecapDispenses, onOpenEvaluations, onOpenEvaluation }) {
  const [path, setPath] = useState([]); // [{id, nom}, ...]
  const [formDossierOuvert, setFormDossierOuvert] = useState(false);
  const [dossierEnEdition, setDossierEnEdition] = useState(null);
  const [photoEnEdition, setPhotoEnEdition] = useState(null);
  const [docEnDeplacement, setDocEnDeplacement] = useState(null);
  const [confirmSuppressionDoc, setConfirmSuppressionDoc] = useState(null); // le document lié à une dispense
  const [modeSelection, setModeSelection] = useState(false);
  const [selection, setSelection] = useState({});
  const [impressionDocs, setImpressionDocs] = useState(null);
  const [docEnVisionneuse, setDocEnVisionneuse] = useState(null);

  const node = getNode(biblio, path) || biblio;
  const documents = node.documents;
  const sousDossiers = node.dossiers;

  const setDocuments = (nouveauxDocs) => {
    setBiblio(updateAtPath(biblio, path, (n) => ({ ...n, documents: nouveauxDocs })));
  };

  const ajouterFichiers = (files) => {
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const doc = { id: uid(), nom: file.name, type: typeDocument(file), extension: extensionDe(file.name), data: reader.result, dateAjout: nowISO() };
        setBiblio((b) => updateAtPath(b, path, (n) => ({ ...n, documents: [doc, ...n.documents] })));
      };
      reader.readAsDataURL(file);
    });
  };

  const prendrePhoto = (file) => {
    const reader = new FileReader();
    reader.onload = () => setPhotoEnEdition(reader.result);
    reader.readAsDataURL(file);
  };

  const confirmerPhoto = (dataUrl, nom) => {
    const doc = { id: uid(), nom: nom || "Photo", type: "image", extension: "JPG", data: dataUrl, dateAjout: nowISO() };
    setDocuments([doc, ...documents]);
    setPhotoEnEdition(null);
  };

  const supprimerDocument = (id) => setDocuments(documents.filter((d) => d.id !== id));

  const demanderSuppressionDocument = (doc) => {
    if (doc.dispenseRef) setConfirmSuppressionDoc(doc);
    else supprimerDocument(doc.id);
  };
  const supprimerDocSeul = () => { supprimerDocument(confirmSuppressionDoc.id); setConfirmSuppressionDoc(null); };
  const supprimerDocEtPhoto = () => {
    const doc = confirmSuppressionDoc;
    supprimerDocument(doc.id);
    onSupprimerPhotoDeDispense(doc.dispenseRef.classeId, doc.dispenseRef.eleveId, doc.dispenseRef.dispenseId, doc.id);
    setConfirmSuppressionDoc(null);
  };

  const toggleSelection = (id) => setSelection((s) => ({ ...s, [id]: !s[id] }));
  const nbSelection = Object.values(selection).filter(Boolean).length;
  const quitterModeSelection = () => { setModeSelection(false); setSelection({}); };
  const imprimerSelection = () => {
    setImpressionDocs(documents.filter((d) => selection[d.id]));
  };
  const estDossierDispenses = path.length === 1 && path[0].nom === "Dispenses EPS";

  const creerDossier = ({ nom }) => {
    setBiblio(updateAtPath(biblio, path, (n) => ({ ...n, dossiers: [...n.dossiers, { id: uid(), nom, documents: [], dossiers: [] }] })));
    setFormDossierOuvert(false);
  };
  const renommerDossier = ({ nom }) => {
    setBiblio(updateAtPath(biblio, [...path, { id: dossierEnEdition.id }], (n) => ({ ...n, nom })));
    setDossierEnEdition(null);
  };
  const supprimerDossier = (id) => {
    if (!confirm("Supprimer ce dossier, ses sous-dossiers et tous les documents qu'il contient ?")) return;
    setBiblio(updateAtPath(biblio, path, (n) => ({ ...n, dossiers: n.dossiers.filter((d) => d.id !== id) })));
  };

  const deplacerDocument = (destPath) => {
    const doc = docEnDeplacement;
    setBiblio((b) => {
      const b1 = updateAtPath(b, path, (n) => ({ ...n, documents: n.documents.filter((d) => d.id !== doc.id) }));
      return updateAtPath(b1, destPath, (n) => ({ ...n, documents: [doc, ...n.documents] }));
    });
    setDocEnDeplacement(null);
  };

  const carteDocument = (doc) => (
    <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 6, background: CARD }}>
      {modeSelection && (
        <input type="checkbox" checked={!!selection[doc.id]} onChange={() => toggleSelection(doc.id)} style={{ flexShrink: 0 }} />
      )}
      <div
        onClick={() => (doc.type === "evaluation-ref" ? onOpenEvaluation(doc.evalId) : setDocEnVisionneuse(doc))}
        style={{ width: 38, height: 38, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: PRIMARY_SOFT, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        {doc.type === "image" ? (
          <img src={doc.data} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : doc.type === "video" ? (
          <Video size={17} color={PRIMARY} />
        ) : doc.type === "evaluation-ref" ? (
          <Table size={17} color={PRIMARY} />
        ) : (
          <FileText size={17} color={PRIMARY} />
        )}
      </div>
      <div
        onClick={() => (doc.type === "evaluation-ref" ? onOpenEvaluation(doc.evalId) : setDocEnVisionneuse(doc))}
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
      >
        <div style={{ fontSize: 13, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.nom}</div>
        <div style={{ fontSize: 10.5, color: "var(--muted-soft)" }}>{doc.extension} · {new Date(doc.dateAjout).toLocaleDateString("fr-FR")}</div>
      </div>
      {!modeSelection && (
        <>
          <button onClick={() => setDocEnDeplacement(doc)} title="Déplacer" style={{ border: "none", background: "none", color: PRIMARY, display: "flex", padding: 4, cursor: "pointer" }}>
            <FolderOpen size={16} />
          </button>
          {doc.type !== "evaluation-ref" && (
            <a href={doc.data} download={doc.nom} style={{ color: PRIMARY, display: "flex", padding: 4 }}>
              <Download size={16} />
            </a>
          )}
          <button onClick={() => demanderSuppressionDocument(doc)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", padding: 4 }}>
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );

  if (impressionDocs) {
    return <DocumentsPrintView documents={impressionDocs} onBack={() => setImpressionDocs(null)} />;
  }

  return (
    <div style={{ padding: 16 }}>
      {path.length === 0 && (
        <button onClick={onOpenEvaluations} style={{ width: "100%", marginBottom: 12, padding: "12px 12px", borderRadius: 10, border: "none", background: `var(--tile-blocnote)`, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <Folder size={18} /> Éditeur de tableau
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 500, opacity: 0.9 }}>Tableaux de notation →</span>
        </button>
      )}

      <div style={{ fontSize: 12.5, color: "var(--muted-soft)", marginBottom: 14, display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
        <span onClick={() => setPath([])} style={{ cursor: "pointer", color: path.length === 0 ? INK : PRIMARY, fontWeight: path.length === 0 ? 700 : 500 }}>Documents</span>
        {path.map((seg, i) => (
          <span key={seg.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span>/</span>
            <span onClick={() => setPath(path.slice(0, i + 1))} style={{ cursor: "pointer", color: i === path.length - 1 ? INK : PRIMARY, fontWeight: i === path.length - 1 ? 700 : 500 }}>{seg.nom}</span>
          </span>
        ))}
      </div>

      {estDossierDispenses && (
        <button onClick={onOpenRecapDispenses} style={{ width: "100%", marginBottom: 12, padding: "11px 0", borderRadius: 10, border: "none", background: `var(--tile-chrono)`, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <FileText size={16} /> Récapitulatif de toutes les dispenses
        </button>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {modeSelection ? (
          <>
            <button onClick={quitterModeSelection} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: INK, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
              Annuler la sélection
            </button>
            <button
              onClick={imprimerSelection}
              disabled={nbSelection === 0}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: nbSelection ? PRIMARY : LINE, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: nbSelection ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
            >
              <Printer size={14} /> Imprimer ({nbSelection})
            </button>
          </>
        ) : (
          <button onClick={() => setModeSelection(true)} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Printer size={14} /> Sélectionner des fichiers à imprimer
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ods,.ppt,.pptx,image/*,video/*" onChange={(e) => e.target.files.length && ajouterFichiers(e.target.files)} style={{ display: "none" }} />
          <Upload size={14} /> Ajouter un fichier
        </label>
        <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files[0] && prendrePhoto(e.target.files[0])} style={{ display: "none" }} />
          <Camera size={14} /> Prendre une photo
        </label>
      </div>

      <button onClick={() => setFormDossierOuvert(true)} style={{ width: "100%", marginBottom: 16, padding: "9px 0", borderRadius: 10, border: `1.5px dashed ${PRIMARY}`, background: "none", color: PRIMARY, fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <FolderPlus size={15} /> Nouveau {path.length > 0 ? "sous-" : ""}dossier
      </button>

      {sousDossiers.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>
            {path.length > 0 ? "Sous-dossiers" : "Dossiers"}
          </div>
          {sousDossiers.map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px", border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 6, background: CARD }}>
              <div onClick={() => setPath([...path, { id: d.id, nom: d.nom }])} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, cursor: "pointer", minWidth: 0 }}>
                <Folder size={18} color={PRIMARY} />
                <div style={{ fontSize: 13.5, color: INK, fontWeight: 600 }}>{d.nom}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted-soft)" }}>({d.documents.length}{d.dossiers.length > 0 ? ` · ${d.dossiers.length} sous-dossier(s)` : ""})</div>
              </div>
              <button onClick={() => setDossierEnEdition(d)} style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer", padding: 4 }}>
                <Pencil size={14} />
              </button>
              <button onClick={() => supprimerDossier(d.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>
            Documents {path.length > 0 ? "de ce dossier" : "(sans dossier)"}
          </div>
          {documents.map(carteDocument)}
        </div>
      )}

      {documents.length === 0 && sousDossiers.length === 0 && (
        <div style={{ fontSize: 12.5, color: "var(--muted-soft)", textAlign: "center", padding: "16px 0" }}>
          Aucun document ici pour le moment.
        </div>
      )}

      {formDossierOuvert && (
        <FormModal
          title={path.length > 0 ? "Nouveau sous-dossier" : "Nouveau dossier"}
          fields={[{ key: "nom", label: "Nom du dossier", placeholder: "ex : Programmations, Photos matériel…", required: true }]}
          onClose={() => setFormDossierOuvert(false)}
          onSubmit={creerDossier}
          submitLabel="Créer le dossier"
        />
      )}
      {dossierEnEdition && (
        <FormModal
          title="Renommer le dossier"
          fields={[{ key: "nom", label: "Nom du dossier", default: dossierEnEdition.nom, required: true }]}
          onClose={() => setDossierEnEdition(null)}
          onSubmit={renommerDossier}
          submitLabel="Renommer"
        />
      )}
      {photoEnEdition && (
        <PhotoEditModal dataUrl={photoEnEdition} onCancel={() => setPhotoEnEdition(null)} onConfirm={confirmerPhoto} />
      )}
      {docEnDeplacement && (
        <MoveModal biblio={biblio} sourcePath={path} onClose={() => setDocEnDeplacement(null)} onMove={deplacerDocument} />
      )}
      {docEnVisionneuse && (
        <DocumentViewerModal doc={docEnVisionneuse} onClose={() => setDocEnVisionneuse(null)} />
      )}
      {confirmSuppressionDoc && (
        <LinkedDeleteModal
          message="Ce document est lié à une dispense sur la fiche d'un élève. Que veux-tu supprimer ?"
          labelOnly="Seulement ici, dans Documents"
          labelBoth="Ici et sur la fiche élève"
          onCancel={() => setConfirmSuppressionDoc(null)}
          onOnly={supprimerDocSeul}
          onBoth={supprimerDocEtPhoto}
        />
      )}
    </div>
  );
}

// ---------- Fenêtre : annotation rapide ----------
// ---------- Fenêtre générique de saisie (remplace les prompt() natifs) ----------
function FormModal({ title, fields, onClose, onSubmit, submitLabel = "Valider" }) {
  const [values, setValues] = useState(() => {
    const init = {};
    fields.forEach((f) => { init[f.key] = f.default || ""; });
    return init;
  });

  const setVal = (key, v) => setValues((prev) => ({ ...prev, [key]: v }));
  const pretAEnvoyer = fields.every((f) => !f.required || (values[f.key] || "").toString().trim());

  const submit = () => {
    if (!pretAEnvoyer) return;
    onSubmit(values);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "82vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{title}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>

        {fields.map((f, i) => (
          <div key={f.key} style={{ marginBottom: i === fields.length - 1 ? 16 : 12 }}>
            <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 4 }}>{f.label}{f.required && <span style={{ color: "var(--st-absent-c)" }}> *</span>}</div>
            {f.type === "select" ? (
              <select
                value={values[f.key]}
                onChange={(e) => setVal(f.key, e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, background: CARD, color: INK }}
              >
                <option value="">—</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : f.type === "date" ? (
              <input
                type="date"
                autoFocus={i === 0}
                value={values[f.key]}
                onChange={(e) => setVal(f.key, e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, background: CARD, color: INK }}
              />
            ) : (
              <input
                autoFocus={i === 0}
                value={values[f.key]}
                onChange={(e) => setVal(f.key, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && i === fields.length - 1 && submit()}
                placeholder={f.placeholder || ""}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, background: CARD, color: INK }}
              />
            )}
          </div>
        ))}

        <button
          onClick={submit}
          disabled={!pretAEnvoyer}
          style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: pretAEnvoyer ? PRIMARY : LINE, color: "#fff", fontWeight: 700, fontSize: 14, cursor: pretAEnvoyer ? "pointer" : "default" }}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function AnnotationModal({ eleve, activite, onClose, onSave }) {
  const [texte, setTexte] = useState("");
  const [type, setType] = useState("positif");
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,43,39,0.45)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "85vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Annotation — {eleve.prenom} {eleve.nom}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>
        {activite && (
          <div style={{ fontSize: 12, color: PRIMARY, background: PRIMARY_SOFT, display: "inline-block", padding: "3px 9px", borderRadius: 7, fontWeight: 600, marginBottom: 12 }}>
            Cycle : {activite}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => setType("positif")} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${type === "positif" ? "var(--st-present-c)" : LINE}`, background: type === "positif" ? "var(--st-present-bg)" : CARD, color: "var(--st-present-c)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
            <ThumbsUp size={15} /> Positif
          </button>
          <button onClick={() => setType("negatif")} style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1.5px solid ${type === "negatif" ? "var(--st-absent-c)" : LINE}`, background: type === "negatif" ? "var(--st-absent-bg)" : CARD, color: "var(--st-absent-c)", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
            <ThumbsDown size={15} /> Négatif
          </button>
        </div>
        <textarea
          autoFocus
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={3}
          placeholder="Ex : très bon esprit d'équipe, entraide spontanée…"
          style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 13.5, fontFamily: "inherit", resize: "vertical", marginBottom: 12 }}
        />
        <button
          onClick={() => { if (texte.trim()) { onSave(texte.trim(), type); onClose(); } }}
          style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Enregistrer l'annotation
        </button>
      </div>
    </div>
  );
}

// ---------- Écran : Fiche générale du cycle (classe entière) ----------
// ---------- Écran : récapitulatif de toutes les dispenses (classé par classe/élève) ----------
// ---------- Évaluations : moteur de calcul des colonnes formule ----------
const OPERATIONS = {
  somme: { label: "Somme (+)", symbole: "+" },
  difference: { label: "Différence (−)", symbole: "−" },
  produit: { label: "Produit (×)", symbole: "×" },
  quotient: { label: "Quotient (÷)", symbole: "÷" },
  moyenne: { label: "Moyenne", symbole: "moy." },
  moyenne_ponderee: { label: "Moyenne pondérée (par coefficients)", symbole: "moy. pond." },
  maximum: { label: "Maximum", symbole: "max" },
  minimum: { label: "Minimum", symbole: "min" },
  coefficient: { label: "Coefficient (× constante)", symbole: "coef." },
};

function appliquerOperation(operation, nums, constante, poids) {
  let resultat = 0;
  switch (operation) {
    case "somme": resultat = nums.reduce((a, b) => a + b, 0); break;
    case "difference": resultat = nums.length ? nums.slice(1).reduce((a, b) => a - b, nums[0]) : 0; break;
    case "produit": resultat = nums.reduce((a, b) => a * b, nums.length ? 1 : 0); break;
    case "quotient": resultat = nums.length >= 2 && nums[1] !== 0 ? nums[0] / nums[1] : 0; break;
    case "moyenne": resultat = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; break;
    case "moyenne_ponderee": {
      const p = (poids && poids.length === nums.length) ? poids : nums.map(() => 1);
      const sommePoids = p.reduce((a, b) => a + b, 0);
      resultat = sommePoids ? nums.reduce((acc, v, i) => acc + v * p[i], 0) / sommePoids : 0;
      break;
    }
    case "maximum": resultat = nums.length ? Math.max(...nums) : 0; break;
    case "minimum": resultat = nums.length ? Math.min(...nums) : 0; break;
    case "coefficient": resultat = nums.length ? nums[0] * (Number(constante) || 0) : 0; break;
    default: resultat = 0;
  }
  return Math.round(resultat * 100) / 100;
}

function calculerCellule(colonne, valeursLigne) {
  if (colonne.type !== "formule" || !colonne.formule || colonne.formule.portee === "eleve") return valeursLigne[colonne.id] ?? "";
  const { operation, operandes = [], constante, poids } = colonne.formule;
  const nums = operandes.map((id) => Number(valeursLigne[id]) || 0);
  const tableauPoids = operandes.map((id) => Number(poids?.[id]) || 1);
  return appliquerOperation(operation, nums, constante, tableauPoids);
}

function calculerCelluleParEleve(colonne, colonnes, valeurs, eleveId, nLignes) {
  const colSource = colonnes.find((c) => c.id === colonne.formule.colonneSource);
  if (!colSource) return 0;
  const lignesInclus = colonne.formule.lignesInclus;
  const nums = [];
  const tableauPoids = [];
  for (let l = 0; l < nLignes; l++) {
    if (lignesInclus && !lignesInclus.includes(l)) continue;
    const valeursLigne = (valeurs[eleveId] || {})[l] || {};
    nums.push(Number(calculerCellule(colSource, valeursLigne)) || 0);
    tableauPoids.push(Number(colonne.formule.poidsLignes?.[l]) || 1);
  }
  return appliquerOperation(colonne.formule.operation, nums, colonne.formule.constante, tableauPoids);
}

function valeursColonnePourClasse(colonne, colonnes, eleves, valeurs, nLignes) {
  if (colonne.type === "formule" && colonne.formule?.portee === "eleve") {
    return eleves.map((e) => ({ eleveId: e.id, valeur: Number(calculerCelluleParEleve(colonne, colonnes, valeurs, e.id, nLignes)) || 0 }));
  }
  const paires = [];
  eleves.forEach((e) => {
    for (let l = 0; l < nLignes; l++) {
      const valeursLigne = (valeurs[e.id] || {})[l] || {};
      paires.push({ eleveId: e.id, valeur: Number(calculerCellule(colonne, valeursLigne)) || 0 });
    }
  });
  return paires;
}

function nouvelleEvaluationVide(titre, classe) {
  return {
    id: uid(),
    titre: titre || "Nouveau tableau",
    classeId: classe.id,
    classeNom: classe.nom,
    dateCreation: nowISO(),
    dateModif: nowISO(),
    lignesParEleve: 1,
    colonnes: [
      { id: uid(), titre: "Note", type: "saisie" },
      { id: uid(), titre: "Coefficient", type: "saisie" },
    ],
    valeurs: {},
    lignesLibres: [],
  };
}

// ---------- Écran : liste des évaluations (contenu du dossier "Évaluation") ----------
// ---------- Outil : Emploi du temps ----------
const JOURS = [
  { key: "LU", label: "Lundi" },
  { key: "MA", label: "Mardi" },
  { key: "ME", label: "Mercredi" },
  { key: "JE", label: "Jeudi" },
  { key: "VE", label: "Vendredi" },
  { key: "SA", label: "Samedi" },
];
const JOUR_JS_VERS_CLE = ["DI", "LU", "MA", "ME", "JE", "VE", "SA"]; // getDay() : 0=dimanche

function heureEnMinutes(txt) {
  const m = /(\d{1,2})\s*[h:]?\s*(\d{0,2})/.exec((txt || "").trim());
  if (!m) return 0;
  const h = parseInt(m[1], 10) || 0;
  const min = parseInt(m[2], 10) || 0;
  return h * 60 + min;
}

function calculerSemaineAuto(edt, date) {
  if (!edt.dateDebutAnnee) return null;
  const debut = new Date(edt.dateDebutAnnee + "T00:00:00");
  const cible = new Date(date);
  cible.setHours(0, 0, 0, 0);
  debut.setHours(0, 0, 0, 0);
  const diffJours = Math.floor((cible - debut) / 86400000);
  if (diffJours < 0) return edt.semaineDepart || "A";
  const numSemaine = Math.floor(diffJours / 7);
  const autre = (edt.semaineDepart || "A") === "A" ? "B" : "A";
  return numSemaine % 2 === 0 ? (edt.semaineDepart || "A") : autre;
}

function estDansVacances(edt, date) {
  const iso = date.toISOString().slice(0, 10);
  return (edt.vacances || []).find((v) => iso >= v.dateDebut && iso <= v.dateFin) || null;
}

function estJourFerie(edt, date) {
  const iso = date.toISOString().slice(0, 10);
  return (edt.feries || []).find((f) => f.date === iso) || null;
}

function ajouterJoursISO(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function lundiDeLaSemaine(date) {
  const d = new Date(date);
  const jour = d.getDay(); // 0 = dimanche
  const diff = jour === 0 ? -6 : 1 - jour;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Renvoie l'activité qui s'applique réellement à un créneau donné, à une date donnée :
// priorité à une activité saisie manuellement sur le créneau, sinon on va chercher
// le cycle de la classe qui couvre cette date (et, si plusieurs séances/semaine ont
// des activités différentes, l'activité propre à ce créneau).
function activiteEffectivePourCreneau(classe, creneau, dateISO) {
  if (!creneau) return "";
  if (creneau.activite && creneau.activite.trim()) return creneau.activite.trim();
  if (!classe) return "";
  const cycles = [...(classe.cycles || [])].filter((cy) => cy.dateDebut).sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
  if (cycles.length === 0) return "";
  let match = null;
  for (const cy of cycles) {
    const finOk = !cy.dateFin || dateISO <= cy.dateFin;
    if (cy.dateDebut <= dateISO && finOk) match = cy;
  }
  if (!match) {
    for (const cy of cycles) if (cy.dateDebut <= dateISO) match = cy;
  }
  if (!match) match = cycles[0];
  if (match.activitesParCreneau && match.activitesParCreneau[creneau.id]) return match.activitesParCreneau[creneau.id];
  return match.activite || "";
}

// Détecte les trous (aucun cycle programmé) et les chevauchements entre cycles d'une même classe.
function detecterProblemesCycles(cycles) {
  const tries = [...(cycles || [])].filter((c) => c.dateDebut).sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
  const problemes = [];
  for (let i = 0; i < tries.length - 1; i++) {
    const a = tries[i];
    const b = tries[i + 1];
    if (!a.dateFin) {
      problemes.push(`Le cycle du ${fmtDateCourt(a.dateDebut)} n'a pas de date de fin alors qu'un autre cycle démarre le ${fmtDateCourt(b.dateDebut)} : chevauchement.`);
      continue;
    }
    if (a.dateFin >= b.dateDebut) {
      problemes.push(`Chevauchement entre le cycle du ${fmtDateCourt(a.dateDebut)} au ${fmtDateCourt(a.dateFin)} et celui débutant le ${fmtDateCourt(b.dateDebut)}.`);
    } else {
      const lendemain = ajouterJoursISO(a.dateFin, 1);
      if (lendemain < b.dateDebut) {
        problemes.push(`Trou du ${fmtDateCourt(lendemain)} au ${fmtDateCourt(ajouterJoursISO(b.dateDebut, -1))} : aucune activité programmée.`);
      }
    }
  }
  return problemes;
}

function fmtDateCourt(iso) {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR");
}

// ---------- Écran : Assistant de rentrée ----------
function AssistantRentreeScreen({ etablissement, setEtablissement, edt, setEdt, classes, codeProf, statutSync, onActiverSync, onDesactiverSync }) {
  const [nomEtab, setNomEtab] = useState(etablissement.nom || "");
  const [anneeTxt, setAnneeTxt] = useState(etablissement.anneeScolaire || "");
  const [formVacancesOuvert, setFormVacancesOuvert] = useState(false);
  const [formFerieOuvert, setFormFerieOuvert] = useState(false);
  const [formNouvelleAnneeOuvert, setFormNouvelleAnneeOuvert] = useState(false);
  const [historiqueOuvert, setHistoriqueOuvert] = useState(null);
  const [codeSaisi, setCodeSaisi] = useState(codeProf || "");

  const sauverEtablissement = () => setEtablissement({ nom: nomEtab, anneeScolaire: anneeTxt });

  const ajouterVacances = ({ nom, dateDebut, dateFin }) => {
    setEdt({ ...edt, vacances: [...(edt.vacances || []), { id: uid(), nom, dateDebut, dateFin: dateFin || dateDebut }] });
    setFormVacancesOuvert(false);
  };
  const supprimerVacances = (id) => setEdt({ ...edt, vacances: edt.vacances.filter((v) => v.id !== id) });

  const ajouterFerie = ({ nom, date }) => {
    setEdt({ ...edt, feries: [...(edt.feries || []), { id: uid(), nom, date }] });
    setFormFerieOuvert(false);
  };
  const supprimerFerie = (id) => setEdt({ ...edt, feries: edt.feries.filter((f) => f.id !== id) });

  const nomClasse = (id) => classes.find((c) => c.id === id)?.nom || "?";

  const archiverEtDemarrerNouvelleAnnee = ({ nouvelleAnnee }) => {
    const snapshot = {
      id: uid(),
      anneeScolaire: etablissement.anneeScolaire || "(sans nom)",
      etablissementNom: etablissement.nom || "",
      dateArchivage: nowISO(),
      creneaux: (edt.creneaux || []).map((c) => ({
        jour: c.jour, heureDebut: c.heureDebut, heureFin: c.heureFin,
        libelle: c.classeId ? nomClasse(c.classeId) : (c.titre || ""),
        activite: c.classeId ? c.activite : "",
        semaine: c.semaine || null,
      })),
    };
    setEdt({ ...edt, historiqueAnnees: [snapshot, ...(edt.historiqueAnnees || [])] });
    setEtablissement({ ...etablissement, anneeScolaire: nouvelleAnnee });
    setAnneeTxt(nouvelleAnnee);
    setFormNouvelleAnneeOuvert(false);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 40 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Synchronisation en ligne</div>
      <div style={{ background: codeProf ? PRIMARY_SOFT : CARD, border: `1px solid ${codeProf ? PRIMARY : LINE}`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
        {codeProf ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: statutSync === "syncing" ? "var(--st-tenue-c)" : "var(--st-present-c)" }} />
              <div style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>
                {statutSync === "syncing" ? "Synchronisation…" : "Synchronisé"} — code « {codeProf} »
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 10 }}>
              Tes données se synchronisent automatiquement. Utilise ce même code sur un autre appareil pour les y retrouver.
            </div>
            <button onClick={onDesactiverSync} style={{ width: "100%", padding: "8px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: "var(--st-absent-c)", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
              Désactiver la synchronisation (rester en local uniquement)
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12.5, color: "var(--muted-soft)", marginBottom: 8 }}>
              Choisis un code personnel (garde-le secret) pour synchroniser tes données entre plusieurs appareils, ou pour les récupérer si tu changes de téléphone.
            </div>
            <input
              value={codeSaisi} onChange={(e) => setCodeSaisi(e.target.value)}
              placeholder="ex : cguilhem-brassens" style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13, marginBottom: 8, background: CARD, color: INK }}
            />
            <button
              onClick={() => codeSaisi.trim() && onActiverSync(codeSaisi.trim())}
              disabled={!codeSaisi.trim()}
              style={{ width: "100%", padding: "9px 0", borderRadius: 9, border: "none", background: codeSaisi.trim() ? PRIMARY : LINE, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: codeSaisi.trim() ? "pointer" : "default" }}
            >
              Activer la synchronisation
            </button>
          </div>
        )}
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Établissement</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input
          value={nomEtab} onChange={(e) => setNomEtab(e.target.value)} onBlur={sauverEtablissement}
          placeholder="Nom de l'établissement" style={{ flex: 1.4, padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13, background: CARD, color: INK }}
        />
        <input
          value={anneeTxt} onChange={(e) => setAnneeTxt(e.target.value)} onBlur={sauverEtablissement}
          placeholder="ex : 2026-2027" style={{ flex: 1, padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13, background: CARD, color: INK }}
        />
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Alternance semaine A / B</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1.3 }}>
          <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>1er jour de la rentrée</div>
          <input
            type="date" value={edt.dateDebutAnnee || ""} onChange={(e) => setEdt({ ...edt, dateDebutAnnee: e.target.value })}
            style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13, background: CARD, color: INK }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Semaine de départ</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["A", "B"].map((s) => (
              <button
                key={s}
                onClick={() => setEdt({ ...edt, semaineDepart: s })}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 9, fontWeight: 700, fontSize: 12.5, cursor: "pointer",
                  border: `1.5px solid ${(edt.semaineDepart || "A") === s ? PRIMARY : LINE}`,
                  background: (edt.semaineDepart || "A") === s ? PRIMARY : CARD,
                  color: (edt.semaineDepart || "A") === s ? "#fff" : "var(--muted-soft)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4 }}>Vacances scolaires</div>
        <button onClick={() => setFormVacancesOuvert(true)} style={{ border: "none", background: "none", color: PRIMARY, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Plus size={13} /> Ajouter
        </button>
      </div>
      {(edt.vacances || []).length === 0 && <div style={{ fontSize: 12.5, color: "var(--muted-soft)", marginBottom: 16 }}>Aucune période renseignée.</div>}
      {(edt.vacances || []).map((v) => (
        <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${LINE}`, borderRadius: 9, marginBottom: 6, background: CARD }}>
          <div style={{ flex: 1, fontSize: 12.5, color: INK }}>
            <b>{v.nom}</b> · du {new Date(v.dateDebut).toLocaleDateString("fr-FR")} au {new Date(v.dateFin).toLocaleDateString("fr-FR")}
          </div>
          <button onClick={() => supprimerVacances(v.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}><Trash2 size={14} /></button>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4 }}>Jours fériés</div>
        <button onClick={() => setFormFerieOuvert(true)} style={{ border: "none", background: "none", color: PRIMARY, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <Plus size={13} /> Ajouter
        </button>
      </div>
      {(edt.feries || []).length === 0 && <div style={{ fontSize: 12.5, color: "var(--muted-soft)", marginBottom: 16 }}>Aucun jour férié renseigné.</div>}
      {(edt.feries || []).map((f) => (
        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${LINE}`, borderRadius: 9, marginBottom: 6, background: CARD }}>
          <div style={{ flex: 1, fontSize: 12.5, color: INK }}><b>{f.nom}</b> · {new Date(f.date).toLocaleDateString("fr-FR")}</div>
          <button onClick={() => supprimerFerie(f.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}><Trash2 size={14} /></button>
        </div>
      ))}

      <div style={{ marginTop: 20, padding: 14, borderRadius: 12, border: `1.5px dashed ${ACCENT}`, background: ACCENT_SOFT }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 6 }}>Nouvelle année scolaire</div>
        <div style={{ fontSize: 12, color: "var(--muted-soft)", marginBottom: 10 }}>
          Archive l'emploi du temps actuel (consultable ensuite dans l'historique) et démarre une nouvelle année scolaire — les créneaux actuels restent en place pour que tu n'aies qu'à les ajuster.
        </div>
        <button onClick={() => setFormNouvelleAnneeOuvert(true)} style={{ width: "100%", padding: "10px 0", borderRadius: 9, border: "none", background: ACCENT, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
          Archiver et commencer une nouvelle année
        </button>
      </div>

      {(edt.historiqueAnnees || []).length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Historique des années</div>
          {edt.historiqueAnnees.map((h) => (
            <div key={h.id} onClick={() => setHistoriqueOuvert(historiqueOuvert === h.id ? null : h.id)} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, marginBottom: 6, background: CARD, cursor: "pointer" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: INK }}>{h.anneeScolaire}{h.etablissementNom ? ` — ${h.etablissementNom}` : ""}</div>
              <div style={{ fontSize: 11, color: "var(--muted-soft)" }}>Archivée le {new Date(h.dateArchivage).toLocaleDateString("fr-FR")} · {h.creneaux.length} créneau(x)</div>
              {historiqueOuvert === h.id && (
                <div style={{ marginTop: 8, borderTop: `1px solid ${LINE}`, paddingTop: 8 }}>
                  {JOURS.map((j) => {
                    const cx = h.creneaux.filter((c) => c.jour === j.key).sort((a, b) => heureEnMinutes(a.heureDebut) - heureEnMinutes(b.heureDebut));
                    if (cx.length === 0) return null;
                    return (
                      <div key={j.key} style={{ marginBottom: 6 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: PRIMARY }}>{j.label}</div>
                        {cx.map((c, i) => (
                          <div key={i} style={{ fontSize: 11.5, color: INK }}>{c.heureDebut}–{c.heureFin} · {c.libelle}{c.activite ? ` (${c.activite})` : ""}{c.semaine ? ` [Sem. ${c.semaine}]` : ""}</div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formVacancesOuvert && (
        <FormModal
          title="Ajouter une période de vacances"
          fields={[
            { key: "nom", label: "Nom", placeholder: "ex : Vacances de la Toussaint", required: true },
            { key: "dateDebut", label: "Du", type: "date", required: true },
            { key: "dateFin", label: "Au", type: "date", required: true },
          ]}
          onClose={() => setFormVacancesOuvert(false)}
          onSubmit={ajouterVacances}
          submitLabel="Ajouter"
        />
      )}
      {formFerieOuvert && (
        <FormModal
          title="Ajouter un jour férié"
          fields={[
            { key: "nom", label: "Nom", placeholder: "ex : Toussaint", required: true },
            { key: "date", label: "Date", type: "date", required: true },
          ]}
          onClose={() => setFormFerieOuvert(false)}
          onSubmit={ajouterFerie}
          submitLabel="Ajouter"
        />
      )}
      {formNouvelleAnneeOuvert && (
        <FormModal
          title="Nouvelle année scolaire"
          fields={[{ key: "nouvelleAnnee", label: "Nom de la nouvelle année scolaire", placeholder: "ex : 2027-2028", required: true }]}
          onClose={() => setFormNouvelleAnneeOuvert(false)}
          onSubmit={archiverEtDemarrerNouvelleAnnee}
          submitLabel="Archiver et démarrer"
        />
      )}
    </div>
  );
}

function EmploiDuTempsScreen({ classes, edt, setEdt, onOpenCycles }) {
  const [formOuvert, setFormOuvert] = useState(false);
  const [creneauEnEdition, setCreneauEnEdition] = useState(null);
  const [photoEnEdition, setPhotoEnEdition] = useState(null);

  const creneauxParJour = (jour) => [...edt.creneaux.filter((c) => c.jour === jour)].sort((a, b) => heureEnMinutes(a.heureDebut) - heureEnMinutes(b.heureDebut));

  const nomClasse = (id) => classes.find((c) => c.id === id)?.nom || "?";

  const creerCreneau = ({ jour, heureDebut, heureFin, classeId, activite, titre, semaine }) => {
    setEdt({ ...edt, creneaux: [...edt.creneaux, { id: uid(), jour, heureDebut, heureFin, classeId: classeId || null, activite: activite || "", titre: titre || "", semaine: semaine || null }] });
    setFormOuvert(false);
  };
  const modifierCreneau = ({ jour, heureDebut, heureFin, classeId, activite, titre, semaine }) => {
    setEdt({ ...edt, creneaux: edt.creneaux.map((c) => c.id === creneauEnEdition.id ? { ...c, jour, heureDebut, heureFin, classeId: classeId || null, activite, titre: titre || "", semaine: semaine || null } : c) });
    setCreneauEnEdition(null);
  };
  const supprimerCreneau = (id) => setEdt({ ...edt, creneaux: edt.creneaux.filter((c) => c.id !== id) });

  const declencherPhoto = (file) => {
    const reader = new FileReader();
    reader.onload = () => setPhotoEnEdition(reader.result);
    reader.readAsDataURL(file);
  };
  const confirmerPhoto = (dataUrl) => {
    setEdt({ ...edt, photoReference: dataUrl });
    setPhotoEnEdition(null);
  };

  const importerFichier = (file) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const feuille = wb.Sheets[wb.SheetNames[0]];
        const lignes = XLSX.utils.sheet_to_json(feuille, { defval: "" });
        const nouveaux = [];
        lignes.forEach((ligne) => {
          const cles = Object.keys(ligne);
          const getVal = (motifs) => {
            const cle = cles.find((c) => motifs.some((m) => normaliser(c).includes(m)));
            return cle ? String(ligne[cle] || "").trim() : "";
          };
          const jourTxt = normaliser(getVal(["jour"]));
          const jourCle = JOURS.find((j) => normaliser(j.label) === jourTxt || j.key.toLowerCase() === jourTxt)?.key;
          const heureDebut = getVal(["debut", "début"]);
          const heureFin = getVal(["fin"]);
          const classeTxt = normaliser(getVal(["classe"]));
          const classe = classes.find((c) => normaliser(c.nom) === classeTxt);
          const activite = getVal(["activite", "activité"]);
          if (jourCle && heureDebut && heureFin && classe) {
            nouveaux.push({ id: uid(), jour: jourCle, heureDebut, heureFin, classeId: classe.id, activite: activite || "" });
          }
        });
        setEdt((e) => ({ ...e, creneaux: [...e.creneaux, ...nouveaux] }));
      } catch (err) {}
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 40 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button onClick={() => setFormOuvert(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={14} /> Ajouter un créneau
        </button>
        <label style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          <input type="file" accept=".csv,.xlsx,.xls,.ods" onChange={(e) => e.target.files[0] && importerFichier(e.target.files[0])} style={{ display: "none" }} />
          <Upload size={14} /> Importer
        </label>
      </div>

      <button onClick={onOpenCycles} style={{ width: "100%", marginBottom: 16, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: ACCENT, fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <RefreshCw size={14} /> Création de Cycles
      </button>

      <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "9px 0", borderRadius: 10, border: `1.5px dashed ${LINE}`, color: "var(--muted-soft)", fontSize: 12, cursor: "pointer", marginBottom: 16 }}>
        <input type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files[0] && declencherPhoto(e.target.files[0])} style={{ display: "none" }} />
        <Camera size={13} /> {edt.photoReference ? "Changer la photo de référence" : "Ajouter une photo de référence (papier)"}
      </label>
      {edt.photoReference && (
        <img src={edt.photoReference} alt="Référence emploi du temps" style={{ width: "100%", borderRadius: 10, marginBottom: 16, border: `1px solid ${LINE}` }} />
      )}

      {JOURS.map((j) => {
        const creneaux = creneauxParJour(j.key);
        if (creneaux.length === 0) return null;
        return (
          <div key={j.key} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{j.label}</div>
            {creneaux.map((c) => (
              <div key={c.id} onClick={() => setCreneauEnEdition(c)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 6, background: CARD, cursor: "pointer" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: INK, minWidth: 78 }}>{c.heureDebut}–{c.heureFin}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {c.classeId ? nomClasse(c.classeId) : (c.titre || "")}
                    </div>
                    {c.semaine && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: ACCENT, background: ACCENT_SOFT, padding: "1px 6px", borderRadius: 6, flexShrink: 0 }}>
                        Sem. {c.semaine}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-soft)" }}>
                    {c.classeId ? activiteEffectivePourCreneau(classes.find((x) => x.id === c.classeId), c, todayISO()) : ""}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); supprimerCreneau(c.id); }} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        );
      })}
      {edt.creneaux.length === 0 && (
        <div style={{ fontSize: 12.5, color: "var(--muted-soft)", textAlign: "center", padding: "16px 0" }}>Aucun créneau renseigné pour le moment.</div>
      )}

      {(formOuvert || creneauEnEdition) && (
        <FormModal
          title={creneauEnEdition ? "Modifier le créneau" : "Ajouter un créneau"}
          fields={[
            { key: "jour", label: "Jour", type: "select", options: JOURS.map((j) => ({ value: j.key, label: j.label })), required: true, default: creneauEnEdition?.jour },
            { key: "heureDebut", label: "Heure de début", placeholder: "ex : 08:00", required: true, default: creneauEnEdition?.heureDebut },
            { key: "heureFin", label: "Heure de fin", placeholder: "ex : 09:00", required: true, default: creneauEnEdition?.heureFin },
            { key: "titre", label: "Nom du créneau (utilisé seulement si aucune classe n'est choisie)", placeholder: "ex : Réunion, RDV — sinon laisse vide", default: creneauEnEdition?.titre },
            { key: "classeId", label: "Classe / Groupe classe (optionnel)", type: "select", options: classes.map((c) => ({ value: c.id, label: c.nom })), default: creneauEnEdition?.classeId },
            { key: "activite", label: "Activité", placeholder: "reprend l'activité du cycle en cours si vide", default: creneauEnEdition?.activite },
            { key: "semaine", label: "Alternance (si ce créneau change une semaine sur deux)", type: "select", options: [{ value: "A", label: "Semaine A" }, { value: "B", label: "Semaine B" }], default: creneauEnEdition?.semaine || "" },
          ]}
          onClose={() => { setFormOuvert(false); setCreneauEnEdition(null); }}
          onSubmit={creneauEnEdition ? modifierCreneau : creerCreneau}
          submitLabel={creneauEnEdition ? "Enregistrer" : "Ajouter"}
        />
      )}
      {photoEnEdition && (
        <PhotoEditModal dataUrl={photoEnEdition} onCancel={() => setPhotoEnEdition(null)} onConfirm={confirmerPhoto} />
      )}
    </div>
  );
}

// ---------- Écran : Création de Cycles (activités par classe/groupe classe, dans le temps) ----------
function CyclesScreen({ classes, updateClasse, edt }) {
  const [classeId, setClasseId] = useState(classes[0]?.id || "");
  const [formOuvert, setFormOuvert] = useState(false);
  const [cycleEnEdition, setCycleEnEdition] = useState(null);
  const [dupliquerOuvert, setDupliquerOuvert] = useState(false);

  const classe = classes.find((c) => c.id === classeId);
  const creneauxClasse = [...(edt.creneaux || [])]
    .filter((c) => c.classeId === classeId)
    .sort((a, b) => (JOURS.findIndex((j) => j.key === a.jour) - JOURS.findIndex((j) => j.key === b.jour)) || heureEnMinutes(a.heureDebut) - heureEnMinutes(b.heureDebut));

  const labelCreneau = (c) => `${JOURS.find((j) => j.key === c.jour)?.label || c.jour} ${c.heureDebut}–${c.heureFin}`;

  const cyclesTries = classe ? [...classe.cycles].filter((c) => c.dateDebut).sort((a, b) => a.dateDebut.localeCompare(b.dateDebut)) : [];
  const problemes = classe ? detecterProblemesCycles(classe.cycles) : [];

  const enregistrerCycle = (valeurs) => {
    const { dateDebut, dateFin, activitePrincipale, activitesParCreneau } = valeurs;
    const nouveauCycle = {
      id: cycleEnEdition?.id || uid(),
      dateDebut,
      dateFin: dateFin || null,
      activite: activitePrincipale,
      activitesParCreneau: activitesParCreneau || {},
    };
    const cycles = cycleEnEdition
      ? classe.cycles.map((c) => (c.id === cycleEnEdition.id ? nouveauCycle : c))
      : [...classe.cycles, nouveauCycle];
    updateClasse({ ...classe, cycles });
    setFormOuvert(false);
    setCycleEnEdition(null);
  };

  const supprimerCycle = (id) => {
    if (classe.cycles.length <= 1) return;
    updateClasse({ ...classe, cycles: classe.cycles.filter((c) => c.id !== id) });
  };

  const dupliquerVers = (ciblesIds) => {
    const creneauxSource = creneauxClasse;
    ciblesIds.forEach((cid) => {
      const cible = classes.find((c) => c.id === cid);
      if (!cible) return;
      const creneauxCible = [...(edt.creneaux || [])]
        .filter((c) => c.classeId === cid)
        .sort((a, b) => (JOURS.findIndex((j) => j.key === a.jour) - JOURS.findIndex((j) => j.key === b.jour)) || heureEnMinutes(a.heureDebut) - heureEnMinutes(b.heureDebut));
      const cyclesCopies = classe.cycles.map((cy) => {
        const copie = { id: uid(), dateDebut: cy.dateDebut, dateFin: cy.dateFin || null, activite: cy.activite || "", activitesParCreneau: {} };
        if (cy.activitesParCreneau) {
          creneauxSource.forEach((cs, idx) => {
            const val = cy.activitesParCreneau[cs.id];
            const dest = creneauxCible[idx];
            if (val && dest) copie.activitesParCreneau[dest.id] = val;
          });
        }
        return copie;
      });
      updateClasse({ ...cible, cycles: cyclesCopies });
    });
    setDupliquerOuvert(false);
  };

  if (!classe) {
    return <div style={{ padding: 30, textAlign: "center", color: "var(--muted-soft)" }}>Crée d'abord une classe ou un groupe classe.</div>;
  }

  return (
    <div style={{ padding: 16, paddingBottom: 40 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 4 }}>Classe / Groupe classe</div>
        <select value={classeId} onChange={(e) => setClasseId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, background: CARD, color: INK }}>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
      </div>

      {creneauxClasse.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--muted-soft)", background: "var(--faint)", borderRadius: 10, padding: "9px 12px", marginBottom: 14 }}>
          Cette classe n'a aucun créneau dans l'emploi du temps pour le moment. Les cycles pourront quand même être créés, mais aucune activité ne s'affichera dans l'emploi du temps tant qu'un créneau n'y est pas rattaché.
        </div>
      )}
      {creneauxClasse.length > 1 && (
        <div style={{ fontSize: 12, color: PRIMARY, background: PRIMARY_SOFT, borderRadius: 10, padding: "9px 12px", marginBottom: 14 }}>
          Cette classe a {creneauxClasse.length} séances par semaine ({creneauxClasse.map(labelCreneau).join(", ")}) : chaque cycle te proposera une activité par séance, modifiable indépendamment.
        </div>
      )}

      {problemes.length > 0 && (
        <div style={{ marginBottom: 14, border: `1px solid ${ACCENT}`, background: ACCENT_SOFT, borderRadius: 10, padding: "10px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: ACCENT, marginBottom: 4 }}>À vérifier</div>
          {problemes.map((p, i) => (
            <div key={i} style={{ fontSize: 11.5, color: ACCENT, marginBottom: 2 }}>• {p}</div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => { setCycleEnEdition(null); setFormOuvert(true); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={14} /> Ajouter un cycle
        </button>
        <button onClick={() => setDupliquerOuvert(true)} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Upload size={14} style={{ transform: "rotate(90deg)" }} /> Dupliquer vers…
        </button>
      </div>

      {cyclesTries.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--muted-soft)", textAlign: "center", padding: "16px 0" }}>Aucun cycle programmé pour cette classe.</div>
      ) : (
        cyclesTries.map((cy) => (
          <div key={cy.id} onClick={() => { setCycleEnEdition(cy); setFormOuvert(true); }} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8, background: CARD, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: INK }}>
                Du {fmtDateCourt(cy.dateDebut)} {cy.dateFin ? `au ${fmtDateCourt(cy.dateFin)}` : "— jusqu'à nouvel ordre"}
              </div>
              <button onClick={(e) => { e.stopPropagation(); supprimerCycle(cy.id); }} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}>
                <Trash2 size={15} />
              </button>
            </div>
            {creneauxClasse.length > 1 && cy.activitesParCreneau && Object.keys(cy.activitesParCreneau).length > 0 ? (
              creneauxClasse.map((cr) => (
                <div key={cr.id} style={{ fontSize: 11.5, color: "var(--muted-soft)" }}>{labelCreneau(cr)} : <b style={{ color: INK }}>{cy.activitesParCreneau[cr.id] || cy.activite || "—"}</b></div>
              ))
            ) : (
              <div style={{ fontSize: 12, color: "var(--muted-soft)" }}>{cy.activite || "—"}</div>
            )}
          </div>
        ))
      )}

      {formOuvert && (
        <CycleFormModal
          creneaux={creneauxClasse}
          cycle={cycleEnEdition}
          onClose={() => { setFormOuvert(false); setCycleEnEdition(null); }}
          onSubmit={enregistrerCycle}
        />
      )}
      {dupliquerOuvert && (
        <DupliquerCyclesModal
          classes={classes.filter((c) => c.id !== classeId)}
          onClose={() => setDupliquerOuvert(false)}
          onValider={dupliquerVers}
        />
      )}
    </div>
  );
}

function CycleFormModal({ creneaux, cycle, onClose, onSubmit }) {
  const [dateDebut, setDateDebut] = useState(cycle?.dateDebut || todayISO());
  const [sansFin, setSansFin] = useState(!cycle || !cycle.dateFin);
  const [dateFin, setDateFin] = useState(cycle?.dateFin || "");
  const [activitePrincipale, setActivitePrincipale] = useState(cycle?.activite || "");
  const [activitesParCreneau, setActivitesParCreneau] = useState(cycle?.activitesParCreneau || {});

  const plusieursCreneaux = creneaux.length > 1;
  const labelCreneau = (c) => `${JOURS.find((j) => j.key === c.jour)?.label || c.jour} ${c.heureDebut}–${c.heureFin}`;

  const changerActiviteCreneau = (id, val) => setActivitesParCreneau((prev) => ({ ...prev, [id]: val }));

  const pretAEnvoyer = dateDebut && activitePrincipale.trim();

  const valider = () => {
    if (!pretAEnvoyer) return;
    onSubmit({ dateDebut, dateFin: sansFin ? "" : dateFin, activitePrincipale: activitePrincipale.trim(), activitesParCreneau });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "86vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>{cycle ? "Modifier le cycle" : "Nouveau cycle"}</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 4 }}>Date de début<span style={{ color: "var(--st-absent-c)" }}> *</span></div>
            <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, background: CARD, color: INK }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 4 }}>Date de fin</div>
            <input type="date" disabled={sansFin} value={dateFin} onChange={(e) => setDateFin(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, background: sansFin ? "var(--faint)" : CARD, color: INK }} />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 16, fontSize: 12, color: "var(--muted-soft)", cursor: "pointer" }}>
          <input type="checkbox" checked={sansFin} onChange={(e) => setSansFin(e.target.checked)} />
          Pas de date de fin (jusqu'au prochain cycle ou nouvel ordre)
        </label>

        <div style={{ marginBottom: plusieursCreneaux ? 10 : 16 }}>
          <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 4 }}>
            {plusieursCreneaux ? "Activité par défaut" : "Activité"}<span style={{ color: "var(--st-absent-c)" }}> *</span>
          </div>
          <input value={activitePrincipale} onChange={(e) => setActivitePrincipale(e.target.value)} placeholder="ex : Badminton" style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, fontSize: 14, background: CARD, color: INK }} />
        </div>

        {plusieursCreneaux && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 6 }}>Activité propre à chaque séance (laisser vide pour reprendre l'activité par défaut)</div>
            {creneaux.map((c) => (
              <div key={c.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 3 }}>{labelCreneau(c)}</div>
                <input
                  value={activitesParCreneau[c.id] || ""}
                  onChange={(e) => changerActiviteCreneau(c.id, e.target.value)}
                  placeholder={activitePrincipale || "reprend l'activité par défaut"}
                  style={{ width: "100%", padding: 9, borderRadius: 9, border: `1px solid ${LINE}`, fontSize: 13.5, background: CARD, color: INK }}
                />
              </div>
            ))}
          </div>
        )}

        <button onClick={valider} disabled={!pretAEnvoyer} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: pretAEnvoyer ? PRIMARY : LINE, color: "#fff", fontWeight: 700, fontSize: 14, cursor: pretAEnvoyer ? "pointer" : "default" }}>
          {cycle ? "Enregistrer" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}

function DupliquerCyclesModal({ classes, onClose, onValider }) {
  const [selection, setSelection] = useState([]);
  const toggle = (id) => setSelection((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, maxHeight: "82vh", overflowY: "auto", background: CARD, borderRadius: "18px 18px 0 0", padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: INK }}>Dupliquer les cycles vers…</div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted-soft)" }}><X size={20} /></button>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--muted-soft)", marginBottom: 14 }}>
          Les dates et activités seront copiées telles quelles, puis resteront modifiables indépendamment sur chaque classe choisie. Cela remplace les cycles déjà existants sur ces classes.
        </div>
        {classes.length === 0 ? (
          <div style={{ fontSize: 12.5, color: "var(--muted-soft)", textAlign: "center", padding: "16px 0" }}>Aucune autre classe disponible.</div>
        ) : (
          classes.map((c) => (
            <label key={c.id} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 4px", borderBottom: `1px solid ${LINE}`, cursor: "pointer" }}>
              <input type="checkbox" checked={selection.includes(c.id)} onChange={() => toggle(c.id)} />
              <span style={{ fontSize: 13.5, color: INK }}>{c.nom}</span>
            </label>
          ))
        )}
        <button
          onClick={() => selection.length > 0 && onValider(selection)}
          disabled={selection.length === 0}
          style={{ width: "100%", marginTop: 16, padding: "12px 0", borderRadius: 12, border: "none", background: selection.length > 0 ? PRIMARY : LINE, color: "#fff", fontWeight: 700, fontSize: 14, cursor: selection.length > 0 ? "pointer" : "default" }}
        >
          Dupliquer vers {selection.length || ""} classe(s)
        </button>
      </div>
    </div>
  );
}

function EvaluationListScreen({ classes, evaluations, onOpenEvaluation, onCreerEvaluation, onSupprimerEvaluation }) {
  const [formOuvert, setFormOuvert] = useState(false);

  const creer = ({ titre, classeId }) => {
    const classe = classes.find((c) => c.id === classeId);
    if (!classe) return;
    const ev = nouvelleEvaluationVide(titre, classe);
    onCreerEvaluation(ev);
    setFormOuvert(false);
    onOpenEvaluation(ev.id);
  };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => setFormOuvert(true)} style={{ width: "100%", marginBottom: 16, padding: "11px 0", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <Plus size={16} /> Nouveau tableau
      </button>

      {evaluations.length === 0 && (
        <div style={{ fontSize: 12.5, color: "var(--muted-soft)", textAlign: "center", padding: "16px 0" }}>
          Aucune évaluation créée pour le moment.
        </div>
      )}
      {evaluations.map((ev) => (
        <div key={ev.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 10, marginBottom: 8, background: CARD }}>
          <div onClick={() => onOpenEvaluation(ev.id)} style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, cursor: "pointer" }}>
            <Table size={18} color={PRIMARY} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ev.titre}</div>
              <div style={{ fontSize: 11, color: "var(--muted-soft)" }}>{ev.classeNom} · modifiée le {new Date(ev.dateModif).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>
          <button
            onClick={() => { if (confirm(`Supprimer définitivement « ${ev.titre} » ?`)) onSupprimerEvaluation(ev.id); }}
            style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", padding: 4, flexShrink: 0 }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {formOuvert && (
        <FormModal
          title="Nouveau tableau"
          fields={[
            { key: "titre", label: "Titre du tableau", placeholder: "ex : Éval. finale badminton", required: true },
            { key: "classeId", label: "Classe / Groupe classe", type: "select", options: classes.map((c) => ({ value: c.id, label: c.nom })), required: true },
          ]}
          onClose={() => setFormOuvert(false)}
          onSubmit={creer}
          submitLabel="Créer le tableau"
        />
      )}
    </div>
  );
}

// ---------- Écran : édition d'un tableau d'évaluation ----------
function EvaluationEditor({ evaluation, classes, onUpdate, onDelete, biblio, setBiblio, onBack }) {
  const [config, setConfig] = useState(true);
  const classe = classes.find((c) => c.id === evaluation.classeId);
  const eleves = classe ? [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom)) : [];
  const [confirmationDoc, setConfirmationDoc] = useState("");
  const [selectionElevesCible, setSelectionElevesCible] = useState(null); // { ligneId, colId }

  const maj = (patch) => onUpdate({ ...evaluation, ...patch, dateModif: nowISO() });

  const renommerColonne = (colId, titre) => {
    maj({ colonnes: evaluation.colonnes.map((c) => c.id === colId ? { ...c, titre } : c) });
  };
  const changerTypeColonne = (colId, type) => {
    maj({ colonnes: evaluation.colonnes.map((c) => c.id === colId ? { ...c, type, formule: type === "formule" ? (c.formule || { portee: "ligne", operation: "somme", operandes: [] }) : null } : c) });
  };
  const changerFormule = (colId, patch) => {
    maj({ colonnes: evaluation.colonnes.map((c) => c.id === colId ? { ...c, formule: { ...c.formule, ...patch } } : c) });
  };
  const changerPortee = (colId, portee) => {
    changerFormule(colId, portee === "eleve" ? { portee, colonneSource: "", operation: "moyenne" } : { portee, operandes: [], operation: "somme" });
  };
  const toggleOperande = (colId, refId) => {
    const col = evaluation.colonnes.find((c) => c.id === colId);
    const operandes = col.formule?.operandes || [];
    const nouvelles = operandes.includes(refId) ? operandes.filter((x) => x !== refId) : [...operandes, refId];
    changerFormule(colId, { operandes: nouvelles });
  };
  const ajouterColonne = () => {
    maj({ colonnes: [...evaluation.colonnes, { id: uid(), titre: `Colonne ${evaluation.colonnes.length + 1}`, type: "saisie" }] });
  };
  const supprimerColonne = (colId) => {
    maj({
      colonnes: evaluation.colonnes.filter((c) => c.id !== colId).map((c) => c.formule
        ? { ...c, formule: { ...c.formule, operandes: c.formule.operandes.filter((o) => o !== colId) } }
        : c),
    });
  };
  const changerLignesParEleve = (n) => maj({ lignesParEleve: Math.max(1, Math.min(10, n)) });

  const ajouterLigneLibre = () => {
    maj({ lignesLibres: [...(evaluation.lignesLibres || []), { id: uid(), titre: "Nouvelle ligne", apresEleveId: "FIN", cellules: {} }] });
  };
  const renommerLigneLibre = (ligneId, titre) => {
    maj({ lignesLibres: evaluation.lignesLibres.map((l) => l.id === ligneId ? { ...l, titre } : l) });
  };
  const deplacerLigneLibre = (ligneId, apresEleveId) => {
    maj({ lignesLibres: evaluation.lignesLibres.map((l) => l.id === ligneId ? { ...l, apresEleveId } : l) });
  };
  const supprimerLigneLibre = (ligneId) => {
    maj({ lignesLibres: evaluation.lignesLibres.filter((l) => l.id !== ligneId) });
  };
  const changerCelluleLigneLibre = (ligneId, colId, patch) => {
    maj({
      lignesLibres: evaluation.lignesLibres.map((l) => l.id !== ligneId ? l : {
        ...l,
        cellules: { ...l.cellules, [colId]: { ...(l.cellules[colId] || { operation: "aucune", valeurManuelle: "" }), ...patch } },
      }),
    });
  };

  const blocs = useMemo(() => {
    let liste = eleves.map((e) => ({ type: "eleve", eleve: e }));
    (evaluation.lignesLibres || []).forEach((ligne) => {
      let idx;
      if (!ligne.apresEleveId || ligne.apresEleveId === "DEBUT") idx = 0;
      else if (ligne.apresEleveId === "FIN") idx = liste.length;
      else {
        const pos = liste.findIndex((b) => b.type === "eleve" && b.eleve.id === ligne.apresEleveId);
        idx = pos === -1 ? liste.length : pos + 1;
      }
      liste = [...liste.slice(0, idx), { type: "ligne", ligne }, ...liste.slice(idx)];
    });
    return liste;
  }, [eleves, evaluation.lignesLibres]);

  const setValeur = (eleveId, ligne, colId, valeur) => {
    const valeurs = { ...evaluation.valeurs };
    valeurs[eleveId] = { ...(valeurs[eleveId] || {}) };
    valeurs[eleveId][ligne] = { ...(valeurs[eleveId][ligne] || {}), [colId]: valeur };
    maj({ valeurs });
  };

  const enregistrerDansClasseDocs = () => {
    if (!classe) return;
    const doc = {
      id: evaluation.id,
      nom: evaluation.titre,
      type: "evaluation-ref",
      extension: "EVAL",
      dateAjout: nowISO(),
      evalId: evaluation.id,
    };
    setBiblio((b) => ajouterDocDansDossierAuto(b, [classe.nom], doc));
    setConfirmationDoc(`Ajouté dans Documents → ${classe.nom}.`);
  };

  return (
    <div style={{ padding: 16, paddingBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <button onClick={onBack} style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer", display: "flex" }}><ChevronLeft size={20} /></button>
        <input
          value={evaluation.titre}
          onChange={(e) => maj({ titre: e.target.value })}
          style={{ flex: 1, fontFamily: "'Oswald', sans-serif", fontSize: 18, color: INK, border: "none", background: "none", padding: 0 }}
        />
        <button onClick={() => setConfig((c) => !c)} title="Paramètres" style={{ border: `1px solid ${LINE}`, background: CARD, borderRadius: 9, padding: "7px 9px", cursor: "pointer", display: "flex" }}>
          <Sigma size={15} color={PRIMARY} />
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted-soft)", marginBottom: 12 }}>{classe?.nom || "Classe introuvable"}</div>

      {config && (
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted-soft)" }}>Lignes par élève</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={() => changerLignesParEleve(evaluation.lignesParEleve - 1)}
                disabled={evaluation.lignesParEleve <= 1}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${LINE}`, background: CARD, color: evaluation.lignesParEleve <= 1 ? "var(--faint)" : PRIMARY, fontWeight: 700, fontSize: 16, cursor: evaluation.lignesParEleve <= 1 ? "default" : "pointer" }}
              >
                −
              </button>
              <div style={{ width: 28, textAlign: "center", fontWeight: 700, fontSize: 14, color: INK }}>{evaluation.lignesParEleve}</div>
              <button
                onClick={() => changerLignesParEleve(evaluation.lignesParEleve + 1)}
                disabled={evaluation.lignesParEleve >= 10}
                style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${LINE}`, background: CARD, color: evaluation.lignesParEleve >= 10 ? "var(--faint)" : PRIMARY, fontWeight: 700, fontSize: 16, cursor: evaluation.lignesParEleve >= 10 ? "default" : "pointer" }}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted-soft)", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Colonnes</div>
          {evaluation.colonnes.map((col) => (
            <div key={col.id} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <input
                  value={col.titre}
                  onChange={(e) => renommerColonne(col.id, e.target.value)}
                  style={{ flex: 1, padding: 7, borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12.5, fontWeight: 600, background: CARD, color: INK }}
                />
                <select value={col.type} onChange={(e) => changerTypeColonne(col.id, e.target.value)} style={{ padding: 7, borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12, background: CARD, color: INK }}>
                  <option value="saisie">Saisie manuelle</option>
                  <option value="formule">Formule</option>
                </select>
                <button onClick={() => supprimerColonne(col.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer" }}>
                  <Trash2 size={15} />
                </button>
              </div>
              {col.type === "formule" && (
                <div>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <button
                      onClick={() => changerPortee(col.id, "ligne")}
                      style={{ flex: 1, padding: "6px 4px", borderRadius: 7, border: `1.5px solid ${(col.formule?.portee || "ligne") === "ligne" ? PRIMARY : LINE}`, background: (col.formule?.portee || "ligne") === "ligne" ? PRIMARY_SOFT : CARD, color: (col.formule?.portee || "ligne") === "ligne" ? PRIMARY : "var(--muted-soft)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                    >
                      Entre colonnes (même ligne)
                    </button>
                    <button
                      onClick={() => changerPortee(col.id, "eleve")}
                      style={{ flex: 1, padding: "6px 4px", borderRadius: 7, border: `1.5px solid ${col.formule?.portee === "eleve" ? PRIMARY : LINE}`, background: col.formule?.portee === "eleve" ? PRIMARY_SOFT : CARD, color: col.formule?.portee === "eleve" ? PRIMARY : "var(--muted-soft)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                    >
                      Entre lignes de l'élève
                    </button>
                  </div>

                  <select
                    value={col.formule?.operation || "somme"}
                    onChange={(e) => changerFormule(col.id, { operation: e.target.value })}
                    style={{ width: "100%", padding: 7, borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12, marginBottom: 8, background: CARD, color: INK }}
                  >
                    {Object.entries(OPERATIONS).map(([key, o]) => <option key={key} value={key}>{o.label}</option>)}
                  </select>
                  {col.formule?.operation === "coefficient" && (
                    <input
                      type="number" step="0.1"
                      value={col.formule?.constante ?? ""}
                      onChange={(e) => changerFormule(col.id, { constante: e.target.value })}
                      placeholder="Constante (ex : 0.5)"
                      style={{ width: "100%", padding: 7, borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12, marginBottom: 8, background: CARD, color: INK }}
                    />
                  )}

                  {col.formule?.portee === "eleve" ? (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Colonne source :</div>
                      <select
                        value={col.formule?.colonneSource || ""}
                        onChange={(e) => changerFormule(col.id, { colonneSource: e.target.value })}
                        style={{ width: "100%", padding: 7, borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 12, marginBottom: 8, background: CARD, color: INK }}
                      >
                        <option value="">— choisir —</option>
                        {evaluation.colonnes.filter((c) => c.id !== col.id && !(c.type === "formule" && c.formule?.portee === "eleve")).map((c) => (
                          <option key={c.id} value={c.id}>{c.titre}</option>
                        ))}
                      </select>
                      <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Lignes de l'élève incluses dans le calcul :</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {Array.from({ length: evaluation.lignesParEleve }).map((_, l) => {
                          const inclus = !col.formule?.lignesInclus || col.formule.lignesInclus.includes(l);
                          return (
                            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, border: `1px solid ${LINE}`, borderRadius: 6, padding: "3px 7px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: INK, cursor: "pointer" }}>
                                <input
                                  type="checkbox"
                                  checked={inclus}
                                  onChange={() => {
                                    const actuelles = col.formule?.lignesInclus || Array.from({ length: evaluation.lignesParEleve }, (_, i) => i);
                                    const nouvelles = actuelles.includes(l) ? actuelles.filter((x) => x !== l) : [...actuelles, l];
                                    changerFormule(col.id, { lignesInclus: nouvelles.length === evaluation.lignesParEleve ? null : nouvelles });
                                  }}
                                />
                                Ligne {l + 1}
                              </label>
                              {inclus && col.formule?.operation === "moyenne_ponderee" && (
                                <input
                                  type="number" step="0.5" min="0"
                                  value={col.formule?.poidsLignes?.[l] ?? 1}
                                  onChange={(e) => changerFormule(col.id, { poidsLignes: { ...(col.formule?.poidsLignes || {}), [l]: e.target.value } })}
                                  style={{ width: 38, padding: 2, borderRadius: 4, border: `1px solid ${LINE}`, fontSize: 10.5, textAlign: "center", background: CARD, color: INK }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 11, color: "var(--muted-soft)", marginBottom: 4 }}>Colonnes utilisées :</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {evaluation.colonnes.filter((c) => c.id !== col.id && !(c.type === "formule" && c.formule?.portee === "eleve")).map((c) => {
                          const coche = (col.formule?.operandes || []).includes(c.id);
                          return (
                            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 4, border: `1px solid ${LINE}`, borderRadius: 6, padding: "3px 7px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: INK, cursor: "pointer" }}>
                                <input type="checkbox" checked={coche} onChange={() => toggleOperande(col.id, c.id)} />
                                {c.titre}
                              </label>
                              {coche && col.formule?.operation === "moyenne_ponderee" && (
                                <input
                                  type="number" step="0.5" min="0"
                                  value={col.formule?.poids?.[c.id] ?? 1}
                                  onChange={(e) => changerFormule(col.id, { poids: { ...(col.formule?.poids || {}), [c.id]: e.target.value } })}
                                  style={{ width: 38, padding: 2, borderRadius: 4, border: `1px solid ${LINE}`, fontSize: 10.5, textAlign: "center", background: CARD, color: INK }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <button onClick={ajouterColonne} style={{ width: "100%", padding: "8px 0", borderRadius: 9, border: `1.5px dashed ${PRIMARY}`, background: "none", color: PRIMARY, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Plus size={13} /> Ajouter une colonne
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={enregistrerDansClasseDocs} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
          Enregistrer aussi dans Documents → {classe?.nom}
        </button>
        <button onClick={() => { if (confirm("Supprimer définitivement cette évaluation ?")) { onDelete(evaluation.id); onBack(); } }} style={{ padding: "9px 14px", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: "var(--st-absent-c)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Trash2 size={14} />
        </button>
      </div>
      {confirmationDoc && <div style={{ fontSize: 11.5, color: PRIMARY, marginBottom: 12 }}>{confirmationDoc}</div>}

      {!classe ? (
        <div style={{ fontSize: 13, color: "var(--muted-soft)" }}>La classe associée à cette évaluation n'existe plus.</div>
      ) : (
        <div style={{ overflowX: "auto", border: `1px solid ${LINE}`, borderRadius: 12 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, background: CARD, textAlign: "left", padding: "8px 10px", borderBottom: `1.5px solid ${LINE}`, borderRight: `1px solid ${LINE}` }}>Élève</th>
                {evaluation.colonnes.map((col) => (
                  <th key={col.id} style={{ padding: "8px 8px", borderBottom: `1.5px solid ${LINE}`, whiteSpace: "nowrap", fontWeight: 600, color: "var(--muted)" }}>
                    {col.titre}
                    {col.type === "formule" && col.formule?.portee === "eleve" && <span style={{ color: PRIMARY }} title="Formule entre lignes de l'élève"> Σélève</span>}
                    {col.type === "formule" && col.formule?.portee !== "eleve" && <span style={{ color: PRIMARY }} title="Formule entre colonnes"> ∑</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blocs.map((bloc, iBloc) => {
                if (bloc.type === "eleve") {
                  const e = bloc.eleve;
                  return Array.from({ length: evaluation.lignesParEleve }).map((_, ligne) => (
                    <tr key={`${e.id}-${ligne}`}>
                      {ligne === 0 && (
                        <td rowSpan={evaluation.lignesParEleve} style={{ position: "sticky", left: 0, background: CARD, padding: "7px 10px", borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap", verticalAlign: "top", fontWeight: 600, color: INK }}>
                          {e.prenom} {e.nom}
                        </td>
                      )}
                      {evaluation.colonnes.map((col) => {
                        const parEleve = col.type === "formule" && col.formule?.portee === "eleve";
                        if (parEleve) {
                          if (ligne !== 0) return null;
                          const valeur = col.formule.colonneSource ? calculerCelluleParEleve(col, evaluation.colonnes, evaluation.valeurs, e.id, evaluation.lignesParEleve) : "";
                          return (
                            <td key={col.id} rowSpan={evaluation.lignesParEleve} style={{ padding: "5px 6px", borderBottom: `1px solid ${LINE}`, borderLeft: `1px solid ${LINE}`, textAlign: "center", verticalAlign: "middle", background: PRIMARY_SOFT }}>
                              <span style={{ fontWeight: 700, color: PRIMARY }}>{valeur}</span>
                            </td>
                          );
                        }
                        const valeursLigne = (evaluation.valeurs[e.id] || {})[ligne] || {};
                        const valeur = calculerCellule(col, valeursLigne);
                        return (
                          <td key={col.id} style={{ padding: "5px 6px", borderBottom: `1px solid ${LINE}`, textAlign: "center" }}>
                            {col.type === "saisie" ? (
                              <input
                                value={valeursLigne[col.id] ?? ""}
                                onChange={(ev) => setValeur(e.id, ligne, col.id, ev.target.value)}
                                style={{ width: 56, padding: 5, borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 12, textAlign: "center", background: CARD, color: INK }}
                              />
                            ) : (
                              <span style={{ fontWeight: 700, color: PRIMARY }}>{valeur}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                }

                const ligne = bloc.ligne;
                return (
                  <tr key={ligne.id} style={{ background: ACCENT_SOFT }}>
                    <td style={{ position: "sticky", left: 0, background: ACCENT_SOFT, padding: "7px 10px", borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            value={ligne.titre}
                            onChange={(e) => renommerLigneLibre(ligne.id, e.target.value)}
                            style={{ width: 110, padding: 5, borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 12, fontWeight: 700, color: ACCENT, background: CARD }}
                          />
                          <button onClick={() => supprimerLigneLibre(ligne.id)} style={{ border: "none", background: "none", color: "var(--st-absent-c)", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <select
                          value={ligne.apresEleveId || "FIN"}
                          onChange={(e) => deplacerLigneLibre(ligne.id, e.target.value)}
                          style={{ width: 116, padding: 4, borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 10, background: CARD, color: "var(--muted-soft)" }}
                        >
                          <option value="DEBUT">▸ Au début</option>
                          {eleves.map((e) => <option key={e.id} value={e.id}>▸ Après {e.prenom} {e.nom}</option>)}
                        </select>
                      </div>
                    </td>
                    {evaluation.colonnes.map((col) => {
                      const cell = ligne.cellules[col.id] || { operation: "aucune", valeurManuelle: "" };
                      const elevesPourCellule = cell.elevesInclus ? eleves.filter((e) => cell.elevesInclus.includes(e.id)) : eleves;
                      const paires = valeursColonnePourClasse(col, evaluation.colonnes, elevesPourCellule, evaluation.valeurs, evaluation.lignesParEleve);
                      const nums = paires.map((p) => p.valeur);
                      const tableauPoids = paires.map((p) => Number(cell.poidsEleves?.[p.eleveId]) || 1);
                      const valeur = cell.operation !== "aucune"
                        ? appliquerOperation(cell.operation, nums, cell.constante, tableauPoids)
                        : null;
                      return (
                        <td key={col.id} style={{ padding: "5px 6px", borderBottom: `1px solid ${LINE}` }}>
                          <select
                            value={cell.operation}
                            onChange={(e) => changerCelluleLigneLibre(ligne.id, col.id, { operation: e.target.value })}
                            style={{ width: "100%", padding: 4, borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 10.5, marginBottom: 3, background: CARD, color: INK }}
                          >
                            <option value="aucune">Saisie libre</option>
                            {Object.entries(OPERATIONS).map(([key, o]) => <option key={key} value={key}>{o.label}</option>)}
                          </select>
                          {cell.operation === "aucune" ? (
                            <input
                              value={cell.valeurManuelle}
                              onChange={(e) => changerCelluleLigneLibre(ligne.id, col.id, { valeurManuelle: e.target.value })}
                              style={{ width: 56, padding: 5, borderRadius: 6, border: `1px solid ${LINE}`, fontSize: 12, textAlign: "center", background: CARD, color: INK }}
                            />
                          ) : (
                            <div style={{ textAlign: "center", fontWeight: 700, color: ACCENT }}>
                              {cell.operation === "coefficient" && (
                                <input
                                  type="number" step="0.1"
                                  value={cell.constante ?? ""}
                                  onChange={(e) => changerCelluleLigneLibre(ligne.id, col.id, { constante: e.target.value })}
                                  placeholder="coef."
                                  style={{ width: 50, padding: 3, borderRadius: 5, border: `1px solid ${LINE}`, fontSize: 10.5, textAlign: "center", marginBottom: 3, background: CARD, color: INK }}
                                />
                              )}
                              <div>{valeur}</div>
                              <button
                                onClick={() => setSelectionElevesCible({ ligneId: ligne.id, colId: col.id })}
                                title="Choisir les élèves et leurs coefficients pour ce calcul"
                                style={{ border: "none", background: "none", color: PRIMARY, cursor: "pointer", fontSize: 9.5, textDecoration: "underline", padding: 0, marginTop: 2 }}
                              >
                                {elevesPourCellule.length}/{eleves.length} élèves{cell.operation === "moyenne_ponderee" ? " · coef." : ""}
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {classe && (
        <button onClick={ajouterLigneLibre} style={{ width: "100%", marginTop: 10, padding: "9px 0", borderRadius: 9, border: `1.5px dashed ${ACCENT}`, background: "none", color: ACCENT, fontWeight: 700, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Plus size={13} /> Ajouter une ligne (hors élèves — ex : moyenne totale)
        </button>
      )}

      {selectionElevesCible && (() => {
        const ligne = evaluation.lignesLibres.find((l) => l.id === selectionElevesCible.ligneId);
        const cell = ligne?.cellules[selectionElevesCible.colId];
        return (
          <SelectionModal
            titre="Élèves inclus dans ce calcul"
            items={eleves.map((e) => ({ id: e.id, label: `${e.prenom} ${e.nom}` }))}
            selectionnes={cell?.elevesInclus}
            avecPoids={cell?.operation === "moyenne_ponderee"}
            poidsInitiaux={cell?.poidsEleves}
            onClose={() => setSelectionElevesCible(null)}
            onValider={(ids, poidsChoisis) => {
              changerCelluleLigneLibre(selectionElevesCible.ligneId, selectionElevesCible.colId, {
                elevesInclus: ids.length === eleves.length ? null : ids,
                poidsEleves: poidsChoisis,
              });
              setSelectionElevesCible(null);
            }}
          />
        );
      })()}
    </div>
  );
}

function RecapDispensesScreen({ classes }) {
  const [selection, setSelection] = useState({}); // { "classeId::eleveId::dispenseId": true }
  const [impression, setImpression] = useState(null);

  const structure = useMemo(() => {
    return classes
      .map((c) => ({
        classe: c,
        eleves: c.eleves
          .filter((e) => (e.dispenses || []).length > 0)
          .map((e) => ({ eleve: e, dispenses: [...e.dispenses].sort((a, b) => b.dateDebut.localeCompare(a.dateDebut)) })),
      }))
      .filter((g) => g.eleves.length > 0);
  }, [classes]);

  const cle = (c, e, d) => `${c.id}::${e.id}::${d.id}`;
  const toggle = (k) => setSelection((s) => ({ ...s, [k]: !s[k] }));
  const toutesLesCles = structure.flatMap((g) => g.eleves.flatMap(({ eleve, dispenses }) => dispenses.map((d) => cle(g.classe, eleve, d))));
  const nbSelection = Object.values(selection).filter(Boolean).length;

  const selectionnerCles = (cles, valeur) => setSelection((s) => {
    const copie = { ...s };
    cles.forEach((k) => { copie[k] = valeur; });
    return copie;
  });

  const lancerImpression = () => {
    const items = [];
    structure.forEach((g) => {
      g.eleves.forEach(({ eleve, dispenses }) => {
        dispenses.forEach((d) => {
          if (selection[cle(g.classe, eleve, d)]) {
            items.push({ eleveNom: `${eleve.prenom} ${eleve.nom}`, classeNom: g.classe.nom, dispense: d });
          }
        });
      });
    });
    setImpression(items);
  };

  if (impression) {
    return <DispensePrintView items={impression} onBack={() => setImpression(null)} />;
  }

  if (structure.length === 0) {
    return (
      <div style={{ padding: 30, textAlign: "center", color: "var(--muted-soft)" }}>
        Aucune dispense enregistrée pour le moment.
      </div>
    );
  }

  return (
    <div style={{ padding: 16, paddingBottom: 80 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button onClick={() => selectionnerCles(toutesLesCles, true)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: PRIMARY, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          Tout sélectionner
        </button>
        <button onClick={() => selectionnerCles(toutesLesCles, false)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${LINE}`, background: CARD, color: INK, fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          Tout désélectionner
        </button>
      </div>

      {structure.map((g) => {
        const clesClasse = g.eleves.flatMap(({ eleve, dispenses }) => dispenses.map((d) => cle(g.classe, eleve, d)));
        return (
          <div key={g.classe.id} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, color: INK }}>{g.classe.nom}</div>
              <button onClick={() => selectionnerCles(clesClasse, !clesClasse.every((k) => selection[k]))} style={{ border: "none", background: "none", color: PRIMARY, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                Sélectionner la classe
              </button>
            </div>
            {g.eleves.map(({ eleve, dispenses }) => {
              const clesEleve = dispenses.map((d) => cle(g.classe, eleve, d));
              return (
                <div key={eleve.id} style={{ border: `1px solid ${LINE}`, borderRadius: 10, padding: 10, marginBottom: 8, background: CARD }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{eleve.prenom} {eleve.nom}</div>
                    <button onClick={() => selectionnerCles(clesEleve, !clesEleve.every((k) => selection[k]))} style={{ border: "none", background: "none", color: PRIMARY, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      Sélectionner
                    </button>
                  </div>
                  {dispenses.map((d) => (
                    <label key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12.5, color: "var(--muted-soft)", cursor: "pointer" }}>
                      <input type="checkbox" checked={!!selection[cle(g.classe, eleve, d)]} onChange={() => toggle(cle(g.classe, eleve, d))} />
                      Du {new Date(d.dateDebut).toLocaleDateString("fr-FR")} au {new Date(d.dateFin).toLocaleDateString("fr-FR")} ({d.photos.length} photo{d.photos.length > 1 ? "s" : ""})
                    </label>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 58, padding: "10px 16px", background: "linear-gradient(transparent, var(--paper) 30%)" }}>
        <button
          onClick={lancerImpression}
          disabled={nbSelection === 0}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: nbSelection ? PRIMARY : LINE, color: "#fff", fontWeight: 700, fontSize: 14.5, cursor: nbSelection ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        >
          <Printer size={17} /> Imprimer la sélection ({nbSelection})
        </button>
      </div>
    </div>
  );
}

function ClasseCycleSheet({ classe }) {
  const [cycleId, setCycleId] = useState(classe.cycles[classe.cycles.length - 1]?.id);
  const cycle = classe.cycles.find((c) => c.id === cycleId) || classe.cycles[classe.cycles.length - 1];
  const dates = [...cycle.seances].sort((a, b) => a.date.localeCompare(b.date));
  const eleves = [...classe.eleves].sort((a, b) => a.nom.localeCompare(b.nom));

  return (
    <div style={{ padding: 16 }}>
      <select value={cycleId} onChange={(e) => setCycleId(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 10, border: `1px solid ${LINE}`, marginBottom: 14, fontSize: 14 }}>
        {classe.cycles.map((c) => <option key={c.id} value={c.id}>{c.activite} (depuis le {new Date(c.dateDebut).toLocaleDateString("fr-FR")})</option>)}
      </select>

      {dates.length === 0 ? (
        <div style={{ fontSize: 13.5, color: "var(--muted-soft)", textAlign: "center", padding: "20px 0" }}>Aucune séance enregistrée pour ce cycle.</div>
      ) : (
        <div style={{ overflowX: "auto", border: `1px solid ${LINE}`, borderRadius: 12 }}>
          <table style={{ borderCollapse: "collapse", fontSize: 12.5, minWidth: "100%" }}>
            <thead>
              <tr>
                <th style={{ position: "sticky", left: 0, background: CARD, textAlign: "left", padding: "8px 10px", borderBottom: `1.5px solid ${LINE}`, borderRight: `1px solid ${LINE}` }}>Élève</th>
                {dates.map((s) => (
                  <th key={s.id} style={{ padding: "8px 8px", borderBottom: `1.5px solid ${LINE}`, whiteSpace: "nowrap", fontWeight: 600, color: "var(--muted)" }}>
                    {new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eleves.map((e) => (
                <tr key={e.id}>
                  <td style={{ position: "sticky", left: 0, background: CARD, padding: "7px 10px", borderRight: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, whiteSpace: "nowrap" }}>
                    {e.prenom} {e.nom}
                  </td>
                  {dates.map((s) => {
                    const st = s.appels[e.id];
                    const info = st ? STATUTS[st] : null;
                    const dispenseObj = dispenseDuJour(e, s.date);
                    const dispense = !!dispenseObj;
                    const dispenseAvecPhoto = dispense && dispenseObj.photos.length > 0;
                    const dispBg = dispense ? (dispenseAvecPhoto ? "var(--st-dispense-bg)" : "var(--st-absent-bg)") : "transparent";
                    const dispColor = dispenseAvecPhoto ? "var(--st-dispense-c)" : "var(--st-absent-c)";
                    return (
                      <td key={s.id} style={{ padding: "6px 8px", borderBottom: `1px solid ${LINE}`, textAlign: "center", background: dispBg }} title={dispense ? (dispenseAvecPhoto ? "Élève dispensé — justificatif photo fourni" : "Élève dispensé — justificatif photo manquant") : undefined}>
                        {info ? (
                          <span style={{ display: "inline-block", minWidth: 22, padding: "2px 6px", borderRadius: 6, background: info.bg, color: info.color, fontWeight: 700, fontSize: 11 }}>
                            {info.short}
                          </span>
                        ) : (
                          <span style={{ color: dispense ? dispColor : "var(--faint)" }}>{dispense ? "disp." : "—"}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--muted-soft)", display: "flex", flexWrap: "wrap", gap: 12 }}>
        <span>Cette fiche se met à jour et se conserve automatiquement à chaque appel enregistré.</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--st-dispense-bg)", border: `1px solid var(--st-dispense-bd)`, display: "inline-block" }} /> dispense avec photo
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--st-absent-bg)", border: `1px solid var(--st-absent-bd)`, display: "inline-block" }} /> dispense sans photo
        </span>
      </div>
    </div>
  );
}

// ---------- Écran : Changer le code d'accès ----------
function ChangerPinScreen({ pinActuel, onChangePin, onBack }) {
  const [etape, setEtape] = useState("verif"); // 'verif' | 'nouveau' | 'confirme'
  const [saisie, setSaisie] = useState("");
  const [nouveauPin, setNouveauPin] = useState("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState(false);

  const digit = (d) => {
    if (saisie.length >= 4) return;
    const next = saisie + d;
    setSaisie(next);
    setErreur("");
    if (next.length === 4) {
      setTimeout(() => {
        if (etape === "verif") {
          if (next === pinActuel) { setEtape("nouveau"); setSaisie(""); }
          else { setErreur("Code actuel incorrect."); setSaisie(""); }
        } else if (etape === "nouveau") {
          setNouveauPin(next);
          setEtape("confirme");
          setSaisie("");
        } else if (etape === "confirme") {
          if (next === nouveauPin) {
            onChangePin(next);
            setSucces(true);
          } else {
            setErreur("Les deux codes ne correspondent pas. Recommence.");
            setEtape("nouveau");
            setNouveauPin("");
            setSaisie("");
          }
        }
      }, 120);
    }
  };

  const titres = { verif: "Code actuel", nouveau: "Nouveau code", confirme: "Confirme le nouveau code" };

  if (succes) {
    return (
      <div style={{ padding: 30, textAlign: "center" }}>
        <Check size={40} color={PRIMARY} style={{ marginBottom: 12 }} />
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Code d'accès modifié</div>
        <div style={{ color: "var(--muted-soft)", fontSize: 13, marginBottom: 20 }}>Utilise ton nouveau code dès la prochaine ouverture.</div>
        <button onClick={onBack} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginBottom: 20 }}>{titres[etape]}</div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: i < saisie.length ? PRIMARY : "var(--faint)", border: erreur ? "1.5px solid #D1362B" : "none" }} />
        ))}
      </div>
      {erreur && <div style={{ fontSize: 12, color: "var(--st-absent-c)", marginBottom: 14 }}>{erreur}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, maxWidth: 220, margin: "0 auto" }}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].map((d, i) => (
          d === "" ? <div key={i} /> : (
            <button
              key={i}
              onClick={() => d === "⌫" ? setSaisie(saisie.slice(0, -1)) : digit(d)}
              style={{ width: 60, height: 60, borderRadius: "50%", border: `1px solid ${LINE}`, background: CARD, color: INK, fontSize: 18, fontWeight: 600, cursor: "pointer" }}
            >
              {d}
            </button>
          )
        ))}
      </div>
      <button onClick={onBack} style={{ marginTop: 24, padding: "8px 0", border: "none", background: "none", color: "var(--muted-soft)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
        Annuler
      </button>
    </div>
  );
}

// ---------- Écran de verrouillage PIN ----------
function LockScreen({ onUnlock, lockPhoto, onChangePhoto, theme, onToggleTheme, pinAttendu }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const digit = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === pinAttendu) onUnlock();
        else { setError(true); setPin(""); }
      }, 120);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => onChangePhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const glass = { background: "rgba(255,255,255,0.14)", WebkitBackdropFilter: "blur(10px)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.32)" };

  return (
    <div style={{ height: "100vh", position: "relative", overflow: "hidden", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {lockPhoto ? (
        <img src={lockPhoto} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, ${PRIMARY}, ${ACCENT})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,15,12,0.35), rgba(10,15,12,0.62))" }} />

      <button onClick={onToggleTheme} title="Changer de luminosité" style={{ position: "absolute", top: 18, right: 18, ...glass, borderRadius: 9, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
        {theme === "sombre" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 26, letterSpacing: 1, marginBottom: 2, textShadow: "0 1px 8px rgba(0,0,0,0.4)" }}>EPS PRO</div>
        <div style={{ fontSize: 10.5, fontStyle: "italic", opacity: 0.75, marginBottom: 20 }}>by C. Guilhem</div>
        <div style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 26 }}>Code d'accès</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 30 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < pin.length ? "#fff" : "rgba(255,255,255,0.28)", border: error ? "1.5px solid #FF9466" : "none" }} />
          ))}
        </div>
        {error && <div style={{ fontSize: 12, color: "#FFB199", marginBottom: 14, marginTop: -14 }}>Code incorrect</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 64px)", gap: 14 }}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => d === "" ? <div key={i} /> : (
            <button
              key={i}
              onClick={() => d === "⌫" ? setPin(pin.slice(0, -1)) : digit(d)}
              style={{ width: 64, height: 64, borderRadius: "50%", ...glass, color: "#fff", fontSize: 20, cursor: "pointer" }}
            >
              {d}
            </button>
          ))}
        </div>

        <label style={{ ...glass, marginTop: 34, borderRadius: 20, padding: "8px 16px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 12 }}>
          <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} style={{ display: "none" }} />
          <ImagePlus size={14} /> {lockPhoto ? "Changer la photo" : "Ajouter une photo"}
        </label>
      </div>
    </div>
  );
}

// ---------- App racine ----------
export default function EpsPro() {
  const [locked, setLocked] = useState(true);
  const [classes, setClasses] = useState(seedClasses());
  const [tab, setTab] = useState("accueil");
  const [sousOngletGestion, setSousOngletGestion] = useState("appel");
  const [nav, setNav] = useState([]); // pile d'écrans secondaires
  const [annotCible, setAnnotCible] = useState(null); // { classeId, eleveId, activite }
  const [theme, setTheme] = useState("clair");
  const [lockPhoto, setLockPhoto] = useState(null);
  const [pinAcces, setPinAcces] = useState("1234");
  const [biblio, setBiblio] = useState({ documents: [], dossiers: [] });
  const [evaluations, setEvaluations] = useState([]);
  const [edt, setEdt] = useState({
    photoReference: null,
    creneaux: [],
    semaineActuelle: "AUTO",
    dateDebutAnnee: "",
    semaineDepart: "A",
    vacances: [],
    feries: [],
    historiqueAnnees: [],
  });
  const [etablissement, setEtablissement] = useState({ nom: "", anneeScolaire: "" });
  const [liensPerso, setLiensPerso] = useState([]);
  const toggleTheme = () => setTheme((t) => (t === "clair" ? "sombre" : "clair"));

  const [pret, setPret] = useState(false);
  const [codeProf, setCodeProf] = useState("");
  const [statutSync, setStatutSync] = useState("local"); // 'local' | 'synced' | 'syncing'

  React.useEffect(() => {
    let annule = false;
    (async () => {
      const code = (await idbLire("codeProf")) || "";
      const pinLocal = await idbLire("pinAcces");
      if (pinLocal?.valeur) setPinAcces(pinLocal.valeur);
      const cles = ["classes", "biblio", "evaluations", "edt", "etablissement", "lockPhoto", "theme", "liensPerso"];
      const locaux = await Promise.all(cles.map((c) => idbLire(c)));
      const distants = code ? await Promise.all(cles.map((c) => cloudLire(code, c))) : cles.map(() => null);
      if (annule) return;

      const valeurs = {};
      cles.forEach((cle, i) => {
        const local = locaux[i]; // { valeur, maj } | undefined
        const distant = distants[i]; // { valeur, maj } | null
        if (distant && (!local || distant.maj > local.maj)) {
          valeurs[cle] = distant.valeur;
        } else if (local) {
          valeurs[cle] = local.valeur;
        }
      });

      if (valeurs.classes) setClasses(valeurs.classes);
      if (valeurs.biblio) setBiblio(valeurs.biblio);
      if (valeurs.evaluations) setEvaluations(valeurs.evaluations);
      if (valeurs.edt) setEdt(valeurs.edt);
      if (valeurs.etablissement) setEtablissement(valeurs.etablissement);
      if (valeurs.lockPhoto) setLockPhoto(valeurs.lockPhoto);
      if (valeurs.theme) setTheme(valeurs.theme);
      if (valeurs.liensPerso) setLiensPerso(valeurs.liensPerso);
      setCodeProf(code);
      setStatutSync(code ? "synced" : "local");
      setPret(true);
    })();
    return () => { annule = true; };
  }, []);

  const sauvegarder = (cle, valeur) => {
    const maj = Date.now();
    idbEcrire(cle, { valeur, maj });
    if (codeProf) {
      setStatutSync("syncing");
      cloudEcrire(codeProf, cle, valeur, maj).then(() => setStatutSync("synced"));
    }
  };

  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("classes", classes), 400); return () => clearTimeout(t); }, [classes, pret, codeProf]);
  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("biblio", biblio), 400); return () => clearTimeout(t); }, [biblio, pret, codeProf]);
  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("evaluations", evaluations), 400); return () => clearTimeout(t); }, [evaluations, pret, codeProf]);
  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("edt", edt), 400); return () => clearTimeout(t); }, [edt, pret, codeProf]);
  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("etablissement", etablissement), 400); return () => clearTimeout(t); }, [etablissement, pret, codeProf]);
  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("lockPhoto", lockPhoto), 400); return () => clearTimeout(t); }, [lockPhoto, pret, codeProf]);
  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("theme", theme), 400); return () => clearTimeout(t); }, [theme, pret, codeProf]);
  React.useEffect(() => { if (!pret) return; const t = setTimeout(() => sauvegarder("liensPerso", liensPerso), 400); return () => clearTimeout(t); }, [liensPerso, pret, codeProf]);

  const activerSynchronisation = async (code) => {
    idbEcrire("codeProf", code);
    setCodeProf(code);
    setStatutSync("syncing");
    // Au moment d'activer, on pousse immédiatement l'état local actuel vers le cloud
    // pour initialiser la fiche de ce code (ou la mettre à jour).
    const maj = Date.now();
    await Promise.all([
      cloudEcrire(code, "classes", classes, maj),
      cloudEcrire(code, "biblio", biblio, maj),
      cloudEcrire(code, "evaluations", evaluations, maj),
      cloudEcrire(code, "edt", edt, maj),
      cloudEcrire(code, "etablissement", etablissement, maj),
      cloudEcrire(code, "liensPerso", liensPerso, maj),
    ]);
    setStatutSync("synced");
  };
  const desactiverSynchronisation = () => {
    idbEcrire("codeProf", "");
    setCodeProf("");
    setStatutSync("local");
  };

  const changerPin = (nouveauPin) => {
    idbEcrire("pinAcces", { valeur: nouveauPin, maj: Date.now() });
    setPinAcces(nouveauPin);
  };

  const push = (screen, params = {}) => setNav([...nav, { screen, params }]);
  const pop = () => setNav(nav.slice(0, -1));
  const current = nav[nav.length - 1];

  const updateClasse = (updated) => setClasses(classes.map((c) => c.id === updated.id ? updated : c));
  const updateEleveIn = (classeId, eleveId, patch) => {
    setClasses(classes.map((c) => c.id !== classeId ? c : { ...c, eleves: c.eleves.map((e) => e.id === eleveId ? { ...e, ...patch } : e) }));
  };

  const ajouterAnnotation = (texte, type) => {
    if (!annotCible) return;
    const { classeId, eleveId } = annotCible;
    setClasses(classes.map((c) => c.id !== classeId ? c : {
      ...c,
      eleves: c.eleves.map((e) => e.id !== eleveId ? e : {
        ...e,
        annotations: [...(e.annotations || []), { id: uid(), date: nowISO(), texte, type, activite: annotCible.activite || null }],
      }),
    }));
  };

  const supprimerPhotoDeDispense = (classeId, eleveId, dispenseId, photoId) => {
    setClasses((cs) => cs.map((c) => c.id !== classeId ? c : {
      ...c,
      eleves: c.eleves.map((e) => e.id !== eleveId ? e : {
        ...e,
        dispenses: (e.dispenses || []).map((d) => d.id !== dispenseId ? d : { ...d, photos: d.photos.filter((p) => p.id !== photoId) }),
      }),
    }));
  };

  const ajouterEvaluation = (ev) => setEvaluations((evs) => [ev, ...evs]);
  const updateEvaluation = (ev) => setEvaluations((evs) => evs.map((x) => x.id === ev.id ? ev : x));
  const supprimerEvaluation = (id) => {
    setEvaluations((evs) => evs.filter((x) => x.id !== id));
    setBiblio((b) => retirerDocParId(b, id));
  };

  const goto = (t) => { setTab(t); setNav([]); };

  let body;
  let title = "";
  if (current?.screen === "classeDetail") {
    const c = classes.find((x) => x.id === current.params.id);
    title = c.nom;
    body = <ClasseDetail classe={c} updateClasse={updateClasse} onOpenEleve={(eid) => push("fiche", { classeId: c.id, eleveId: eid })} onAnnotate={(eid, activite) => setAnnotCible({ classeId: c.id, eleveId: eid, activite })} onOpenChrono={(chronoId) => push("chronoFiche", { classeId: c.id, chronoId })} onOpenBlocNote={(noteId) => push("blocNoteFiche", { classeId: c.id, noteId })} evaluations={evaluations} onOpenEvaluation={(id) => push("evaluationEditor", { id })} />;
  } else if (current?.screen === "fiche") {
    const c = classes.find((x) => x.id === current.params.classeId);
    const e = c.eleves.find((x) => x.id === current.params.eleveId);
    title = "Fiche élève";
    body = <FicheEleve classe={c} eleve={e} updateEleve={(patch) => updateEleveIn(c.id, e.id, patch)} updateClasse={updateClasse} onAnnotate={(eid, activite) => setAnnotCible({ classeId: c.id, eleveId: eid, activite })} biblio={biblio} setBiblio={setBiblio} />;
  } else if (current?.screen === "ficheCycle") {
    const c = classes.find((x) => x.id === current.params.classeId);
    title = `Fiche générale — ${c.nom}`;
    body = <ClasseCycleSheet classe={c} />;
  } else if (current?.screen === "chronoFiche") {
    const c = classes.find((x) => x.id === current.params.classeId);
    const f = (c.chronos || []).find((x) => x.id === current.params.chronoId);
    title = "Fiche chronomètre";
    body = <ChronoFicheScreen classe={c} fiche={f} updateClasse={updateClasse} onDeleted={pop} />;
  } else if (current?.screen === "blocNoteFiche") {
    const c = classes.find((x) => x.id === current.params.classeId);
    const n = (c.blocNotes || []).find((x) => x.id === current.params.noteId);
    title = "Bloc-note";
    body = <BlocNoteFicheScreen classe={c} note={n} updateClasse={updateClasse} onDeleted={pop} />;
  } else if (current?.screen === "recapDispenses") {
    title = "Récapitulatif des dispenses";
    body = <RecapDispensesScreen classes={classes} />;
  } else if (current?.screen === "evaluations") {
    title = "Éditeur de tableau";
    body = <EvaluationListScreen classes={classes} evaluations={evaluations} onOpenEvaluation={(id) => push("evaluationEditor", { id })} onCreerEvaluation={ajouterEvaluation} onSupprimerEvaluation={supprimerEvaluation} />;
  } else if (current?.screen === "evaluationEditor") {
    const ev = evaluations.find((x) => x.id === current.params.id);
    title = "Éditeur de tableau";
    body = ev ? (
      <EvaluationEditor evaluation={ev} classes={classes} onUpdate={updateEvaluation} onDelete={supprimerEvaluation} biblio={biblio} setBiblio={setBiblio} onBack={pop} />
    ) : (
      <div style={{ padding: 30, textAlign: "center", color: "var(--muted-soft)" }}>Cette évaluation n'existe plus.</div>
    );
  } else if (current?.screen === "edt") {
    title = "Emploi du temps";
    body = <EmploiDuTempsScreen classes={classes} edt={edt} setEdt={setEdt} onOpenCycles={() => push("cycles", {})} />;
  } else if (current?.screen === "cycles") {
    title = "Création de Cycles";
    body = <CyclesScreen classes={classes} updateClasse={updateClasse} edt={edt} />;
  } else if (current?.screen === "assistantRentree") {
    title = "Assistant de rentrée";
    body = <AssistantRentreeScreen etablissement={etablissement} setEtablissement={setEtablissement} edt={edt} setEdt={setEdt} classes={classes} codeProf={codeProf} statutSync={statutSync} onActiverSync={activerSynchronisation} onDesactiverSync={desactiverSynchronisation} />;
  } else if (current?.screen === "changerPin") {
    title = "Code d'accès";
    body = <ChangerPinScreen pinActuel={pinAcces} onChangePin={changerPin} onBack={pop} />;
  } else if (current?.screen === "outil") {
    title = current.params.id === "minuteur" ? "Minuteur" : current.params.id === "chrono" ? "Chronomètre" : "Bloc-note";
    body = current.params.id === "minuteur" ? <MinuteurScreen />
      : current.params.id === "chrono" ? <ChronoScreen classes={classes} updateClasse={updateClasse} />
      : <BlocNoteScreen classes={classes} updateClasse={updateClasse} />;
  } else {
    switch (tab) {
      case "accueil": title = "Accueil"; body = <Accueil classes={classes} edt={edt} setEdt={setEdt} etablissement={etablissement} onOpenEdt={() => push("edt", {})} />; break;
      case "gestion": title = "Gestion de classe"; body = <GestionClasseScreen sousOnglet={sousOngletGestion} setSousOnglet={setSousOngletGestion} classes={classes} setClasses={setClasses} updateClasse={updateClasse} updateEleve={updateEleveIn} onOpenClass={(id) => push("classeDetail", { id })} onOpenEleve={(cid, eid) => push("fiche", { classeId: cid, eleveId: eid })} onAnnotate={(cid, eid, activite) => setAnnotCible({ classeId: cid, eleveId: eid, activite })} onVoirFicheCycle={(cid) => push("ficheCycle", { classeId: cid })} biblio={biblio} setBiblio={setBiblio} />; break;
      case "documents": title = "Documents"; body = <DocumentsScreen biblio={biblio} setBiblio={setBiblio} onSupprimerPhotoDeDispense={supprimerPhotoDeDispense} onOpenRecapDispenses={() => push("recapDispenses", {})} onOpenEvaluations={() => push("evaluations", {})} onOpenEvaluation={(id) => push("evaluationEditor", { id })} />; break;
      case "outils": title = "Outils"; body = <OutilsScreen onOpenOutil={(id) => push("outil", { id })} onOpenEvaluations={() => push("evaluations", {})} onOpenEdt={() => push("edt", {})} onOpenAssistantRentree={() => push("assistantRentree", {})} onOpenChangerPin={() => push("changerPin", {})} />; break;
      case "liens": title = "Liens"; body = (
        <>
          <LiensExternesScreen />
          <div style={{ height: 1, background: LINE, margin: "4px 18px" }} />
          <LiensPersoScreen liensPerso={liensPerso} setLiensPerso={setLiensPerso} />
        </>
      ); break;
      default: body = null;
    }
  }

  const eleveAnnotation = annotCible ? classes.find((c) => c.id === annotCible.classeId)?.eleves.find((e) => e.id === annotCible.eleveId) : null;

  const navItems = [
    { key: "accueil", Icon: Home, label: "Accueil" },
    { key: "gestion", Icon: Users, label: "Classes" },
    { key: "documents", Icon: FolderOpen, label: "Docs" },
    { key: "outils", Icon: Wrench, label: "Outils" },
    { key: "liens", Icon: ExternalLink, label: "Liens" },
  ];

  return (
    <div data-theme={theme} style={{ background: PAPER, minHeight: "100vh", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&display=swap');
        ${THEME_CSS}
        .eps-shell { display: flex; flex-direction: column; }
        .eps-body-wrap { width: 100%; max-width: 440px; margin: 0 auto; position: relative; flex: 1; }
        .eps-bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 440px; display: flex; background: ${CARD}; border-top: 1px solid ${LINE}; padding: 4px 4px 8px; }
        .eps-side-nav { display: none; }
        @media (min-width: 860px) {
          .eps-shell { flex-direction: row; justify-content: center; align-items: flex-start; gap: 0; padding: 24px; }
          .eps-side-nav {
            display: flex; flex-direction: column; gap: 4px; width: 200px; flex-shrink: 0;
            background: ${CARD}; border: 1px solid ${LINE}; border-radius: 16px; padding: 14px 10px; position: sticky; top: 24px;
          }
          .eps-bottom-nav { display: none; }
          .eps-body-wrap { max-width: 720px; margin: 0; border: 1px solid ${LINE}; border-radius: 16px; overflow: hidden; background: ${PAPER}; }
        }
        .eps-side-link { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: none; background: none; cursor: pointer; text-align: left; font-size: 13.5px; font-weight: 600; }
      `}</style>

      {!pret ? (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, background: PRIMARY, color: "#fff" }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, letterSpacing: 1 }}>EPS PRO</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Chargement de tes données…</div>
        </div>
      ) : locked ? (
        <LockScreen onUnlock={() => setLocked(false)} lockPhoto={lockPhoto} onChangePhoto={setLockPhoto} theme={theme} onToggleTheme={toggleTheme} pinAttendu={pinAcces} />
      ) : (
        <div className="eps-shell" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
          <nav className="eps-side-nav">
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, color: PRIMARY, padding: "6px 10px 14px", letterSpacing: 0.3 }}>EPS PRO</div>
            {navItems.map((n) => (
              <button key={n.key} className="eps-side-link" onClick={() => goto(n.key)} style={{ color: tab === n.key && !current ? PRIMARY : "var(--muted)", background: tab === n.key && !current ? PRIMARY_SOFT : "none" }}>
                <n.Icon size={17} /> {n.label}
              </button>
            ))}
          </nav>

          <div className="eps-body-wrap">
            <TopBar title={title} onBack={current ? pop : null} theme={theme} onToggleTheme={toggleTheme} />
            <div style={{ paddingBottom: 70 }}>{body}</div>
            {!current && (
              <div className="eps-bottom-nav">
                {navItems.map((n) => (
                  <NavButton key={n.key} active={tab === n.key} onClick={() => goto(n.key)} Icon={n.Icon} label={n.label} />
                ))}
              </div>
            )}
          </div>

          {annotCible && eleveAnnotation && (
            <AnnotationModal eleve={eleveAnnotation} activite={annotCible.activite} onClose={() => setAnnotCible(null)} onSave={ajouterAnnotation} />
          )}
        </div>
      )}
    </div>
  );
}
