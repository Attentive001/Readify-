"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const CATEGORY_OPTIONS = [
  { value: "self-development", label: { en: "Self-Development", rw: "Kwiteza imbere", fr: "Développement personnel" } },
  { value: "business", label: { en: "Business", rw: "Ubucuruzi", fr: "Business" } },
  { value: "technology", label: { en: "Technology", rw: "Ikoranabuhanga", fr: "Technologie" } },
  { value: "science", label: { en: "Science", rw: "Ubumenyi", fr: "Sciences" } },
  { value: "history", label: { en: "History", rw: "Amateka", fr: "Histoire" } },
  { value: "literature", label: { en: "Literature", rw: "Ubuvanganzo", fr: "Littérature" } },
  { value: "philosophy", label: { en: "Philosophy", rw: "Filozofiya", fr: "Philosophie" } },
  { value: "education", label: { en: "Education", rw: "Uburezi", fr: "Éducation" } },
];

const GOALS = [
  { value: "personal-growth", emoji: "🌱", en: "Personal growth", rw: "Kwiteza imbere", fr: "Développement personnel" },
  { value: "career", emoji: "🚀", en: "Career & skills", rw: "Umwuga n'ubumenyi", fr: "Carrière et compétences" },
  { value: "knowledge", emoji: "🧠", en: "Learn new things", rw: "Kwiga ibintu bishya", fr: "Apprendre de nouvelles choses" },
  { value: "entertainment", emoji: "✨", en: "Read for enjoyment", rw: "Gusoma mu kwishimisha", fr: "Lire pour le plaisir" },
];

const PACES = [
  { value: "daily", emoji: "📖", en: "A little every day", rw: "Gake buri munsi", fr: "Un peu chaque jour" },
  { value: "weekly", emoji: "📚", en: "A few books each month", rw: "Ibitabo bike buri kwezi", fr: "Quelques livres par mois" },
  { value: "focused", emoji: "🎯", en: "Deep reading", rw: "Gusoma wibanze", fr: "Lecture approfondie" },
];

export default function LibrarySetup({ onComplete }) {
  const { language } = useLanguage();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState("");
  const [categories, setCategories] = useState([]);
  const [pace, setPace] = useState("");

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const copy = useMemo(() => ({
    title: { en: "Build your reading library", rw: "Tegura isomero ryawe", fr: "Créez votre bibliothèque" },
    subtitle: { en: "Tell Readify what you enjoy. We’ll use your answers to personalize what you discover.", rw: "Bwira Readify ibyo ukunda. Tuzakoresha ibisubizo byawe mu kukwereka ibitabo bijyanye n'ibyo ukunda.", fr: "Dites-nous ce que vous aimez. Readify personnalisera les livres que vous découvrirez." },
    step: { en: "Step", rw: "Intambwe", fr: "Étape" },
    goalTitle: { en: "What do you want to get from reading?", rw: "Ni iki ushaka kungukira mu gusoma?", fr: "Que voulez-vous tirer de la lecture ?" },
    categoryTitle: { en: "Which categories interest you?", rw: "Ni ibihe byiciro ukunda?", fr: "Quelles catégories vous intéressent ?" },
    categoryHint: { en: "Choose at least 2", rw: "Hitamo nibura 2", fr: "Choisissez au moins 2" },
    paceTitle: { en: "How do you like to read?", rw: "Ukunda gusoma ute?", fr: "Comment aimez-vous lire ?" },
    back: { en: "Back", rw: "Subira inyuma", fr: "Retour" },
    next: { en: "Continue", rw: "Komeza", fr: "Continuer" },
    finish: { en: "Create my library", rw: "Kora isomero ryanjye", fr: "Créer ma bibliothèque" },
  }), []);

  const text = (key) => copy[key]?.[language] || copy[key]?.en || key;
  const optionText = (item) => item[language] || item.en;

  function toggleCategory(value) {
    setCategories((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function next() {
    if (step === 1 && !goal) return;
    if (step === 2 && categories.length < 2) return;
    if (step < totalSteps) setStep(step + 1);
    else onComplete({ goal, categories, pace });
  }

  const canContinue = (step === 1 && !!goal) || (step === 2 && categories.length >= 2) || (step === 3 && !!pace);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-white p-6 shadow-sm sm:p-10">
      <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full bg-ink px-4 py-1.5 text-xs font-bold text-parchment">{text("step")} {step} / {totalSteps}</span>
          <span className="text-xs text-ink/45">{Math.round(progress)}%</span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-amber-300 transition-all" style={{ width: `${progress}%` }} /></div>

        <div className="mt-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Readify</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{text("title")}</h1>
          <p className="mt-3 text-sm leading-6 text-ink/60">{text("subtitle")}</p>
        </div>

        {step === 1 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {GOALS.map((item) => (
              <button key={item.value} type="button" onClick={() => setGoal(item.value)} className={`rounded-2xl border p-5 text-left transition ${goal === item.value ? "border-ink bg-ink text-parchment shadow-md" : "border-ink/10 bg-white hover:-translate-y-0.5 hover:shadow-sm"}`}>
                <span className="text-2xl">{item.emoji}</span><p className="mt-3 font-semibold">{optionText(item)}</p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="mt-8">
            <p className="mb-4 text-sm font-semibold text-ink/60">{text("categoryHint")}</p>
            <div className="flex flex-wrap gap-3">
              {CATEGORY_OPTIONS.map((item) => {
                const selected = categories.includes(item.value);
                return <button key={item.value} type="button" onClick={() => toggleCategory(item.value)} className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${selected ? "border-ink bg-ink text-parchment" : "border-ink/15 bg-white hover:bg-ink/5"}`}>{optionText(item)} {selected ? "✓" : ""}</button>;
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {PACES.map((item) => (
              <button key={item.value} type="button" onClick={() => setPace(item.value)} className={`rounded-2xl border p-5 text-left transition ${pace === item.value ? "border-ink bg-ink text-parchment shadow-md" : "border-ink/10 bg-white hover:-translate-y-0.5 hover:shadow-sm"}`}>
                <span className="text-2xl">{item.emoji}</span><p className="mt-3 font-semibold">{optionText(item)}</p>
              </button>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-between gap-3">
          <button type="button" disabled={step === 1} onClick={() => setStep((current) => current - 1)} className="rounded-full border border-ink/15 px-5 py-3 text-sm font-semibold disabled:invisible">{text("back")}</button>
          <button type="button" disabled={!canContinue} onClick={next} className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-parchment transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">{step === totalSteps ? text("finish") : text("next")} {step < totalSteps ? "→" : "✓"}</button>
        </div>
      </div>
    </section>
  );
}
