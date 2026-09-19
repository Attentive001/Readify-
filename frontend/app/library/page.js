"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BookCard from "../../components/BookCard";
import { useLanguage } from "../../context/LanguageContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const COPY = {
  en: {
    eyebrow: "Your reading space",
    title: "My Library",
    subtitle:
      "Build a library around what you want to learn and read.",
    setupTitle: "Let's build your personal library",
    setupText:
      "Answer a few quick questions and Readify will find books from the catalog that match your interests.",
    step: "Step",
    of: "of",
    goalQuestion: "What is your main reading goal?",
    categoryQuestion: "Which categories do you enjoy?",
    paceQuestion: "How do you prefer to read?",
    continue: "Continue",
    back: "Back",
    create: "Create my library",
    selected: "selected",
    chooseAtLeast: "Choose at least one.",
    goalDevelopment: "Personal development",
    goalCareer: "Career & business",
    goalLearning: "Learning & education",
    goalEnjoyment: "Entertainment & literature",
    goalTechnology: "Technology & science",
    paceDaily: "A little every day",
    paceWeekly: "A few books each month",
    paceDeep: "Long focused reading sessions",
    selfDevelopment: "Self-Development",
    business: "Business",
    technology: "Technology",
    science: "Science",
    history: "History",
    literature: "Literature",
    philosophy: "Philosophy",
    education: "Education",
    personalized: "Picked for you",
    personalizedText:
      "Books selected from the Readify catalog using your interests.",
    savedBooksTitle: "Saved books",
    book: "book",
    books: "books",
    readingProgress: "Reading progress",
    continueReading: "Continue reading",
    readNow: "Read now",
    removeLibrary: "Remove from library",
    keepGoing: "Keep going",
    continueWhereLeft: "Continue where you left off.",
    loadingLibrary: "Loading your library...",
    loadingProgress: "Loading reading progress...",
    libraryEmpty: "Your library is empty",
    emptyText:
      "Add a book you like, or personalize your library to discover recommendations.",
    exploreBooks: "Explore books",
    personalize: "Personalize my library",
    reset: "Change preferences",
    add: "Add to library",
    added: "Added",
    noMatches: "No close matches yet",
    noMatchesText:
      "Try changing your interests. Readify will keep using books from the database only.",
    signIn: "Please sign in to use your personal library.",
    error: "Something went wrong.",
    saved: "Saved",
    notStarted: "Not started",
  },

  rw: {
    eyebrow: "Umwanya wawe wo gusoma",
    title: "Isomero ryanjye",
    subtitle:
      "Kora isomero rishingiye ku byo ushaka kwiga no gusoma.",
    setupTitle: "Reka dukore isomero ryawe bwite",
    setupText:
      "Subiza utubazo duke, Readify igushakire ibitabo biri muri catalog bihuye n'ibyo ukunda.",
    step: "Intambwe",
    of: "kuri",
    goalQuestion: "Intego yawe nyamukuru yo gusoma ni iyihe?",
    categoryQuestion: "Ni ibihe byiciro ukunda?",
    paceQuestion: "Ukunda gusoma ute?",
    continue: "Komeza",
    back: "Subira inyuma",
    create: "Kora isomero ryanjye",
    selected: "byatoranyijwe",
    chooseAtLeast: "Hitamo nibura kimwe.",
    goalDevelopment: "Kwiteza imbere",
    goalCareer: "Umwuga n'ubucuruzi",
    goalLearning: "Kwiga n'uburezi",
    goalEnjoyment: "Imyidagaduro n'ubuvanganzo",
    goalTechnology: "Ikoranabuhanga na siyansi",
    paceDaily: "Gake buri munsi",
    paceWeekly: "Ibitabo bike buri kwezi",
    paceDeep: "Gusoma igihe kirekire n'ubwitonzi",
    selfDevelopment: "Kwiteza imbere",
    business: "Ubucuruzi",
    technology: "Ikoranabuhanga",
    science: "Siyansi",
    history: "Amateka",
    literature: "Ubuvanganzo",
    philosophy: "Filozofiya",
    education: "Uburezi",
    personalized: "Ibitabo bigukwiye",
    personalizedText:
      "Ibitabo byatoranyijwe muri catalog ya Readify hashingiwe ku byo ukunda.",
    savedBooksTitle: "Ibitabo wabitse",
    book: "igitabo",
    books: "ibitabo",
    readingProgress: "Aho ugeze usoma",
    continueReading: "Komeza gusoma",
    readNow: "Soma ubu",
    removeLibrary: "Kuramo mu isomero",
    keepGoing: "Komeza",
    continueWhereLeft: "Komeza aho wari ugeze.",
    loadingLibrary: "Turimo gufungura isomero ryawe...",
    loadingProgress: "Turimo kureba aho ugeze usoma...",
    libraryEmpty: "Isomero ryawe ririmo ubusa",
    emptyText:
      "Ongeramo igitabo ukunda cyangwa wihitiremo ibyo ukunda kugira ngo tubone ibitabo bikubereye.",
    exploreBooks: "Shakisha ibitabo",
    personalize: "Tunganya isomero ryanjye",
    reset: "Hindura ibyo nahisemo",
    add: "Ongeramo mu isomero",
    added: "Byongeweho",
    noMatches: "Nta bitabo bihuye neza birabonetse",
    noMatchesText:
      "Hindura ibyo ukunda. Readify ikoresha ibitabo biri muri database gusa.",
    signIn: "Injira kugira ngo ukoreshe isomero ryawe bwite.",
    error: "Hari ikibazo cyabaye.",
    saved: "Byabitswe",
    notStarted: "Ntabwo watangiye",
  },

  fr: {
    eyebrow: "Votre espace de lecture",
    title: "Ma bibliothèque",
    subtitle:
      "Créez une bibliothèque selon ce que vous voulez apprendre et lire.",
    setupTitle: "Créons votre bibliothèque personnelle",
    setupText:
      "Répondez à quelques questions et Readify trouvera des livres du catalogue adaptés à vos intérêts.",
    step: "Étape",
    of: "sur",
    goalQuestion: "Quel est votre objectif principal de lecture ?",
    categoryQuestion: "Quelles catégories aimez-vous ?",
    paceQuestion: "Comment préférez-vous lire ?",
    continue: "Continuer",
    back: "Retour",
    create: "Créer ma bibliothèque",
    selected: "sélectionné(s)",
    chooseAtLeast: "Choisissez au moins une option.",
    goalDevelopment: "Développement personnel",
    goalCareer: "Carrière et affaires",
    goalLearning: "Apprentissage et éducation",
    goalEnjoyment: "Divertissement et littérature",
    goalTechnology: "Technologie et sciences",
    paceDaily: "Un peu chaque jour",
    paceWeekly: "Quelques livres par mois",
    paceDeep: "Longues sessions de lecture",
    selfDevelopment: "Développement personnel",
    business: "Affaires",
    technology: "Technologie",
    science: "Sciences",
    history: "Histoire",
    literature: "Littérature",
    philosophy: "Philosophie",
    education: "Éducation",
    personalized: "Sélection pour vous",
    personalizedText:
      "Livres du catalogue Readify sélectionnés selon vos intérêts.",
    savedBooksTitle: "Livres enregistrés",
    book: "livre",
    books: "livres",
    readingProgress: "Progression",
    continueReading: "Continuer la lecture",
    readNow: "Lire maintenant",
    removeLibrary: "Retirer de la bibliothèque",
    keepGoing: "Continuez",
    continueWhereLeft: "Reprenez là où vous vous êtes arrêté.",
    loadingLibrary: "Chargement de votre bibliothèque...",
    loadingProgress: "Chargement de la progression...",
    libraryEmpty: "Votre bibliothèque est vide",
    emptyText:
      "Ajoutez un livre ou personnalisez votre bibliothèque pour découvrir des recommandations.",
    exploreBooks: "Explorer les livres",
    personalize: "Personnaliser ma bibliothèque",
    reset: "Modifier mes préférences",
    add: "Ajouter",
    added: "Ajouté",
    noMatches: "Aucun résultat proche",
    noMatchesText:
      "Essayez de modifier vos intérêts. Readify utilise uniquement les livres de la base de données.",
    signIn:
      "Connectez-vous pour utiliser votre bibliothèque personnelle.",
    error: "Une erreur est survenue.",
    saved: "Enregistré",
    notStarted: "Pas commencé",
  },

  es: {
    eyebrow: "Tu espacio de lectura",
    title: "Mi biblioteca",
    subtitle:
      "Crea una biblioteca según lo que quieres aprender y leer.",
    setupTitle: "Creemos tu biblioteca personal",
    setupText:
      "Responde unas preguntas y Readify encontrará libros del catálogo según tus intereses.",
    step: "Paso",
    of: "de",
    goalQuestion: "¿Cuál es tu principal objetivo de lectura?",
    categoryQuestion: "¿Qué categorías te gustan?",
    paceQuestion: "¿Cómo prefieres leer?",
    continue: "Continuar",
    back: "Atrás",
    create: "Crear mi biblioteca",
    selected: "seleccionadas",
    chooseAtLeast: "Elige al menos una.",
    goalDevelopment: "Desarrollo personal",
    goalCareer: "Carrera y negocios",
    goalLearning: "Aprendizaje y educación",
    goalEnjoyment: "Entretenimiento y literatura",
    goalTechnology: "Tecnología y ciencia",
    paceDaily: "Un poco cada día",
    paceWeekly: "Algunos libros al mes",
    paceDeep: "Sesiones largas de lectura",
    selfDevelopment: "Desarrollo personal",
    business: "Negocios",
    technology: "Tecnología",
    science: "Ciencia",
    history: "Historia",
    literature: "Literatura",
    philosophy: "Filosofía",
    education: "Educación",
    personalized: "Elegidos para ti",
    personalizedText:
      "Libros del catálogo de Readify seleccionados según tus intereses.",
    savedBooksTitle: "Libros guardados",
    book: "libro",
    books: "libros",
    readingProgress: "Progreso de lectura",
    continueReading: "Continuar leyendo",
    readNow: "Leer ahora",
    removeLibrary: "Quitar de la biblioteca",
    keepGoing: "Sigue adelante",
    continueWhereLeft: "Continúa donde lo dejaste.",
    loadingLibrary: "Cargando tu biblioteca...",
    loadingProgress: "Cargando progreso...",
    libraryEmpty: "Tu biblioteca está vacía",
    emptyText:
      "Añade un libro o personaliza tu biblioteca para descubrir recomendaciones.",
    exploreBooks: "Explorar libros",
    personalize: "Personalizar mi biblioteca",
    reset: "Cambiar preferencias",
    add: "Añadir",
    added: "Añadido",
    noMatches: "No hay coincidencias cercanas",
    noMatchesText:
      "Prueba a cambiar tus intereses. Readify usa solo libros de la base de datos.",
    signIn:
      "Inicia sesión para usar tu biblioteca personal.",
    error: "Algo salió mal.",
    saved: "Guardado",
    notStarted: "No iniciado",
  },

  de: {
    eyebrow: "Dein Lesebereich",
    title: "Meine Bibliothek",
    subtitle:
      "Erstelle eine Bibliothek passend zu dem, was du lernen und lesen möchtest.",
    setupTitle: "Erstellen wir deine persönliche Bibliothek",
    setupText:
      "Beantworte einige kurze Fragen und Readify findet passende Bücher aus dem Katalog.",
    step: "Schritt",
    of: "von",
    goalQuestion: "Was ist dein wichtigstes Leseziel?",
    categoryQuestion: "Welche Kategorien magst du?",
    paceQuestion: "Wie liest du am liebsten?",
    continue: "Weiter",
    back: "Zurück",
    create: "Meine Bibliothek erstellen",
    selected: "ausgewählt",
    chooseAtLeast: "Wähle mindestens eine Option.",
    goalDevelopment: "Persönliche Entwicklung",
    goalCareer: "Karriere & Business",
    goalLearning: "Lernen & Bildung",
    goalEnjoyment: "Unterhaltung & Literatur",
    goalTechnology: "Technologie & Wissenschaft",
    paceDaily: "Ein wenig jeden Tag",
    paceWeekly: "Einige Bücher pro Monat",
    paceDeep: "Lange, konzentrierte Lesesitzungen",
    selfDevelopment: "Persönliche Entwicklung",
    business: "Business",
    technology: "Technologie",
    science: "Wissenschaft",
    history: "Geschichte",
    literature: "Literatur",
    philosophy: "Philosophie",
    education: "Bildung",
    personalized: "Für dich ausgewählt",
    personalizedText:
      "Bücher aus dem Readify-Katalog passend zu deinen Interessen.",
    savedBooksTitle: "Gespeicherte Bücher",
    book: "Buch",
    books: "Bücher",
    readingProgress: "Lesefortschritt",
    continueReading: "Weiterlesen",
    readNow: "Jetzt lesen",
    removeLibrary: "Aus Bibliothek entfernen",
    keepGoing: "Weiter so",
    continueWhereLeft:
      "Setze dort fort, wo du aufgehört hast.",
    loadingLibrary: "Bibliothek wird geladen...",
    loadingProgress: "Lesefortschritt wird geladen...",
    libraryEmpty: "Deine Bibliothek ist leer",
    emptyText:
      "Füge ein Buch hinzu oder personalisiere deine Bibliothek.",
    exploreBooks: "Bücher entdecken",
    personalize: "Bibliothek personalisieren",
    reset: "Einstellungen ändern",
    add: "Hinzufügen",
    added: "Hinzugefügt",
    noMatches: "Keine passenden Bücher gefunden",
    noMatchesText:
      "Ändere deine Interessen. Readify verwendet nur Bücher aus der Datenbank.",
    signIn:
      "Bitte anmelden, um deine persönliche Bibliothek zu verwenden.",
    error: "Etwas ist schiefgelaufen.",
    saved: "Gespeichert",
    notStarted: "Nicht begonnen",
  },

  zh: {
    eyebrow: "你的阅读空间",
    title: "我的图书馆",
    subtitle: "根据你想学习和阅读的内容创建专属书库。",
    setupTitle: "创建你的个人图书馆",
    setupText:
      "回答几个简单问题，Readify 会从目录中找到符合你兴趣的书籍。",
    step: "步骤",
    of: "共",
    goalQuestion: "你的主要阅读目标是什么？",
    categoryQuestion: "你喜欢哪些分类？",
    paceQuestion: "你喜欢怎样阅读？",
    continue: "继续",
    back: "返回",
    create: "创建我的图书馆",
    selected: "已选择",
    chooseAtLeast: "至少选择一个。",
    goalDevelopment: "个人成长",
    goalCareer: "职业与商业",
    goalLearning: "学习与教育",
    goalEnjoyment: "娱乐与文学",
    goalTechnology: "科技与科学",
    paceDaily: "每天读一点",
    paceWeekly: "每月读几本",
    paceDeep: "长时间专注阅读",
    selfDevelopment: "个人成长",
    business: "商业",
    technology: "科技",
    science: "科学",
    history: "历史",
    literature: "文学",
    philosophy: "哲学",
    education: "教育",
    personalized: "为你推荐",
    personalizedText:
      "根据你的兴趣从 Readify 目录中选择的书籍。",
    savedBooksTitle: "已保存的书籍",
    book: "本书",
    books: "本书",
    readingProgress: "阅读进度",
    continueReading: "继续阅读",
    readNow: "立即阅读",
    removeLibrary: "从图书馆移除",
    keepGoing: "继续阅读",
    continueWhereLeft: "从上次的位置继续。",
    loadingLibrary: "正在加载你的图书馆...",
    loadingProgress: "正在加载阅读进度...",
    libraryEmpty: "你的图书馆是空的",
    emptyText:
      "添加一本书或个性化你的图书馆来发现推荐。",
    exploreBooks: "探索书籍",
    personalize: "个性化我的图书馆",
    reset: "修改偏好",
    add: "添加到图书馆",
    added: "已添加",
    noMatches: "暂时没有接近的结果",
    noMatchesText:
      "尝试修改兴趣。Readify 只使用数据库中的书籍。",
    signIn: "请登录以使用你的个人图书馆。",
    error: "发生错误。",
    saved: "已保存",
    notStarted: "未开始",
  },

  ja: {
    eyebrow: "あなたの読書スペース",
    title: "マイライブラリ",
    subtitle:
      "学びたいこと、読みたいことに合わせて本棚を作りましょう。",
    setupTitle: "あなた専用のライブラリを作りましょう",
    setupText:
      "いくつかの質問に答えると、Readify が興味に合う本を探します。",
    step: "ステップ",
    of: "/",
    goalQuestion: "主な読書の目的は？",
    categoryQuestion: "好きなカテゴリーは？",
    paceQuestion: "どのように読みたいですか？",
    continue: "続ける",
    back: "戻る",
    create: "ライブラリを作成",
    selected: "選択",
    chooseAtLeast: "1つ以上選択してください。",
    goalDevelopment: "自己成長",
    goalCareer: "キャリア・ビジネス",
    goalLearning: "学習・教育",
    goalEnjoyment: "エンターテインメント・文学",
    goalTechnology: "テクノロジー・科学",
    paceDaily: "毎日少しずつ",
    paceWeekly: "毎月数冊",
    paceDeep: "長時間集中して読む",
    selfDevelopment: "自己成長",
    business: "ビジネス",
    technology: "テクノロジー",
    science: "科学",
    history: "歴史",
    literature: "文学",
    philosophy: "哲学",
    education: "教育",
    personalized: "あなたへのおすすめ",
    personalizedText:
      "興味に合わせて Readify のカタログから選んだ本です。",
    savedBooksTitle: "保存した本",
    book: "冊",
    books: "冊",
    readingProgress: "読書進捗",
    continueReading: "続きを読む",
    readNow: "今読む",
    removeLibrary: "ライブラリから削除",
    keepGoing: "続けましょう",
    continueWhereLeft: "前回の続きから読めます。",
    loadingLibrary: "ライブラリを読み込み中...",
    loadingProgress: "進捗を読み込み中...",
    libraryEmpty: "ライブラリは空です",
    emptyText:
      "本を追加するか、ライブラリをパーソナライズしておすすめを見つけましょう。",
    exploreBooks: "本を探す",
    personalize: "ライブラリをパーソナライズ",
    reset: "設定を変更",
    add: "ライブラリに追加",
    added: "追加済み",
    noMatches: "近い本が見つかりません",
    noMatchesText:
      "興味を変更してみてください。Readify はデータベースの本だけを使用します。",
    signIn: "個人ライブラリを使うにはログインしてください。",
    error: "問題が発生しました。",
    saved: "保存済み",
    notStarted: "未開始",
  },

  ar: {
    eyebrow: "مساحة القراءة الخاصة بك",
    title: "مكتبتي",
    subtitle: "أنشئ مكتبة تناسب ما تريد تعلمه وقراءته.",
    setupTitle: "لننشئ مكتبتك الشخصية",
    setupText:
      "أجب عن بعض الأسئلة السريعة وسيجد Readify كتبًا مناسبة لاهتماماتك.",
    step: "الخطوة",
    of: "من",
    goalQuestion: "ما هدفك الرئيسي من القراءة؟",
    categoryQuestion: "ما الفئات التي تحبها؟",
    paceQuestion: "كيف تفضل القراءة؟",
    continue: "متابعة",
    back: "رجوع",
    create: "إنشاء مكتبتي",
    selected: "محدد",
    chooseAtLeast: "اختر خيارًا واحدًا على الأقل.",
    goalDevelopment: "التطوير الشخصي",
    goalCareer: "المهنة والأعمال",
    goalLearning: "التعلم والتعليم",
    goalEnjoyment: "الترفيه والأدب",
    goalTechnology: "التكنولوجيا والعلوم",
    paceDaily: "قليلًا كل يوم",
    paceWeekly: "عدة كتب كل شهر",
    paceDeep: "جلسات قراءة طويلة ومركزة",
    selfDevelopment: "التطوير الشخصي",
    business: "الأعمال",
    technology: "التكنولوجيا",
    science: "العلوم",
    history: "التاريخ",
    literature: "الأدب",
    philosophy: "الفلسفة",
    education: "التعليم",
    personalized: "مختارات لك",
    personalizedText:
      "كتب من كتالوج Readify تم اختيارها بناءً على اهتماماتك.",
    savedBooksTitle: "الكتب المحفوظة",
    book: "كتاب",
    books: "كتب",
    readingProgress: "تقدم القراءة",
    continueReading: "متابعة القراءة",
    readNow: "اقرأ الآن",
    removeLibrary: "إزالة من المكتبة",
    keepGoing: "استمر",
    continueWhereLeft: "تابع من حيث توقفت.",
    loadingLibrary: "جارٍ تحميل مكتبتك...",
    loadingProgress: "جارٍ تحميل التقدم...",
    libraryEmpty: "مكتبتك فارغة",
    emptyText:
      "أضف كتابًا أو خصص مكتبتك لاكتشاف توصيات.",
    exploreBooks: "استكشف الكتب",
    personalize: "تخصيص مكتبتي",
    reset: "تغيير التفضيلات",
    add: "إضافة إلى المكتبة",
    added: "تمت الإضافة",
    noMatches: "لا توجد مطابقات قريبة",
    noMatchesText:
      "حاول تغيير اهتماماتك. يستخدم Readify الكتب الموجودة في قاعدة البيانات فقط.",
    signIn:
      "سجل الدخول لاستخدام مكتبتك الشخصية.",
    error: "حدث خطأ.",
    saved: "تم الحفظ",
    notStarted: "لم يبدأ",
  },
};

const GOALS = [
  {
    id: "development",
    key: "goalDevelopment",
    categories: ["self-development", "personal-development"],
  },
  {
    id: "career",
    key: "goalCareer",
    categories: ["business"],
  },
  {
    id: "learning",
    key: "goalLearning",
    categories: ["education", "science", "history"],
  },
  {
    id: "enjoyment",
    key: "goalEnjoyment",
    categories: ["literature", "philosophy", "history"],
  },
  {
    id: "technology",
    key: "goalTechnology",
    categories: ["technology", "science"],
  },
];

const CATEGORIES = [
  ["self-development", "selfDevelopment"],
  ["business", "business"],
  ["technology", "technology"],
  ["science", "science"],
  ["history", "history"],
  ["literature", "literature"],
  ["philosophy", "philosophy"],
  ["education", "education"],
];

const PACES = [
  ["daily", "paceDaily"],
  ["weekly", "paceWeekly"],
  ["deep", "paceDeep"],
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[_\s]+/g, "-");
}

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("readify_token") ||
    localStorage.getItem("token")
  );
}

export default function LibraryPage() {
  const { language } = useLanguage();

  const t = (key) =>
    COPY[language]?.[key] || COPY.en[key] || key;

  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [progress, setProgress] = useState({});

  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] =
    useState(true);
  const [recommendationLoading, setRecommendationLoading] =
    useState(false);

  const [error, setError] = useState("");

  const [preferences, setPreferences] =
    useState(null);

  const [setupOpen, setSetupOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [goal, setGoal] = useState("");
  const [selectedCategories, setSelectedCategories] =
    useState([]);
  const [pace, setPace] = useState("");

  function loadPreferences() {
    try {
      const saved = localStorage.getItem(
        "readify_library_preferences"
      );

      if (saved) {
        const parsed = JSON.parse(saved);

        setPreferences(parsed);
        setGoal(parsed.goal || "");
        setSelectedCategories(
          Array.isArray(parsed.categories)
            ? parsed.categories
            : []
        );
        setPace(parsed.pace || "");
      } else {
        setSetupOpen(true);
      }
    } catch {
      setSetupOpen(true);
    }
  }

  async function loadLibrary() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(t("signIn"));
        return;
      }

      const response = await fetch(
        `${API_URL}/library`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || t("error")
        );
      }

      setBooks(
        Array.isArray(data.books)
          ? data.books
          : []
      );
    } catch (err) {
      setError(err.message || t("error"));
    } finally {
      setLoading(false);
    }
  }

  async function loadAllBooks() {
    try {
      setRecommendationLoading(true);

      const response = await fetch(
        `${API_URL}/books?page=1&pageSize=100`,
        {
          cache: "no-store",
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || t("error")
        );
      }

      const rows = Array.isArray(data.books)
        ? data.books
        : Array.isArray(data.results)
          ? data.results
          : [];

      setAllBooks(rows);
    } catch (err) {
      console.error(
        "Recommendation catalog error:",
        err
      );

      setAllBooks([]);
    } finally {
      setRecommendationLoading(false);
    }
  }

  async function loadProgress(savedBooks) {
    try {
      setProgressLoading(true);

      const token = getToken();

      if (!token || !savedBooks.length) {
        setProgress({});
        return;
      }

      const results = await Promise.all(
        savedBooks.map(async (book) => {
          try {
            const response = await fetch(
              `${API_URL}/books/${book.id}/progress`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              return {
                id: book.id,
                progress: null,
              };
            }

            const data = await response
              .json()
              .catch(() => ({}));

            return {
              id: book.id,
              progress:
                data.progress || null,
            };
          } catch {
            return {
              id: book.id,
              progress: null,
            };
          }
        })
      );

      const progressMap = {};

      results.forEach((item) => {
        progressMap[item.id] =
          item.progress;
      });

      setProgress(progressMap);
    } finally {
      setProgressLoading(false);
    }
  }

  async function addToLibrary(bookId) {
    try {
      const token = getToken();

      if (!token) {
        setError(t("signIn"));
        return;
      }

      const response = await fetch(
        `${API_URL}/library/${bookId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || t("error")
        );
      }

      const addedBook =
        data.book ||
        allBooks.find(
          (book) =>
            String(book.id) ===
            String(bookId)
        );

      if (addedBook) {
        setBooks((current) => {
          if (
            current.some(
              (book) =>
                String(book.id) ===
                String(bookId)
            )
          ) {
            return current;
          }

          return [...current, addedBook];
        });
      }
    } catch (err) {
      setError(err.message || t("error"));
    }
  }

  async function removeFromLibrary(bookId) {
    try {
      const token = getToken();

      if (!token) {
        setError(t("signIn"));
        return;
      }

      const response = await fetch(
        `${API_URL}/library/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error || t("error")
        );
      }

      setBooks((current) =>
        current.filter(
          (book) =>
            String(book.id) !==
            String(bookId)
        )
      );

      setProgress((current) => {
        const updated = {
          ...current,
        };

        delete updated[bookId];

        return updated;
      });
    } catch (err) {
      setError(err.message || t("error"));
    }
  }

  function savePreferences() {
    if (
      !goal ||
      !selectedCategories.length ||
      !pace
    ) {
      setError(t("chooseAtLeast"));
      return;
    }

    const value = {
      goal,
      categories: selectedCategories,
      pace,
      createdAt:
        new Date().toISOString(),
    };

    localStorage.setItem(
      "readify_library_preferences",
      JSON.stringify(value)
    );

    setPreferences(value);
    setSetupOpen(false);
    setStep(1);
    setError("");
  }

  function resetPreferences() {
    setPreferences(null);
    setGoal("");
    setSelectedCategories([]);
    setPace("");
    setStep(1);
    setSetupOpen(true);

    localStorage.removeItem(
      "readify_library_preferences"
    );
  }

  function toggleCategory(id) {
    setSelectedCategories((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  }

  useEffect(() => {
    loadPreferences();
    loadLibrary();
    loadAllBooks();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadProgress(books);
    }
  }, [loading, books]);

  const recommendedBooks = useMemo(() => {
    if (
      !preferences ||
      !allBooks.length
    ) {
      return [];
    }

    const savedIds = new Set(
      books.map((book) =>
        String(book.id)
      )
    );

    const goalData = GOALS.find(
      (item) =>
        item.id === preferences.goal
    );

    const goalCategories = new Set(
      (goalData?.categories || []).map(
        normalize
      )
    );

    return allBooks
      .filter(
        (book) =>
          !savedIds.has(
            String(book.id)
          )
      )
      .map((book) => {
        const categories =
          Array.isArray(book.categories)
            ? book.categories
            : [];

        const categoryNames =
          categories.flatMap((item) => [
            normalize(item?.name),
            normalize(item?.slug),
          ]);

        let score = 0;

        categoryNames.forEach(
          (category) => {
            if (
              preferences.categories.includes(
                category
              )
            ) {
              score += 8;
            }

            if (
              goalCategories.has(category)
            ) {
              score += 4;
            }
          }
        );

        const text = [
          book.title,
          book.description,
          book.author_name,
          ...categoryNames,
        ]
          .join(" ")
          .toLowerCase();

        if (
          preferences.goal ===
            "technology" &&
          /technology|software|computer|programming|science|engineering/.test(
            text
          )
        ) {
          score += 3;
        }

        if (
          preferences.goal ===
            "career" &&
          /business|career|leadership|management|finance|entrepreneur/.test(
            text
          )
        ) {
          score += 3;
        }

        if (
          preferences.goal ===
            "development" &&
          /habit|mindset|success|personal|development|productivity|self/.test(
            text
          )
        ) {
          score += 3;
        }

        if (
          preferences.goal ===
            "learning" &&
          /education|learning|science|history|knowledge|study/.test(
            text
          )
        ) {
          score += 3;
        }

        if (
          preferences.goal ===
            "enjoyment" &&
          /fiction|literature|novel|story|poetry|philosophy/.test(
            text
          )
        ) {
          score += 3;
        }

        if (book.is_featured) {
          score += 1;
        }

        if (book.is_popular) {
          score += 1;
        }

        return {
          book,
          score,
        };
      })
      .filter(
        (item) => item.score > 0
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )
      .slice(0, 8)
      .map((item) => item.book);
  }, [
    preferences,
    allBooks,
    books,
  ]);

  const continueBook =
    books.find(
      (book) =>
        Number(
          progress[book.id]?.percent
        ) > 0
    ) || books[0];

  const continueProgress =
    continueBook
      ? progress[continueBook.id]
      : null;

  const continuePercent = Math.round(
    Number(
      continueProgress?.percent || 0
    )
  );

  return (
    <main className="mx-auto max-w-7xl px-5 py-12 lg:px-8">

      {/* PERSONALIZATION MODAL */}

      {setupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-parchment shadow-2xl">

            <div className="bg-ink px-7 py-8 text-parchment">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
                    Readify
                  </p>

                  <h2 className="mt-2 font-display text-3xl font-bold">
                    {t("setupTitle")}
                  </h2>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs">
                  {t("step")} {step}{" "}
                  {t("of")} 3
                </span>

              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-parchment/65">
                {t("setupText")}
              </p>

            </div>

            <div className="p-7">

              {/* STEP 1 */}

              {step === 1 && (
                <>
                  <h3 className="font-display text-2xl font-bold">
                    {t("goalQuestion")}
                  </h3>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    {GOALS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setGoal(item.id)
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          goal === item.id
                            ? "border-ink bg-ink text-parchment"
                            : "border-ink/10 bg-white/60 hover:bg-white"
                        }`}
                      >

                        <span className="text-lg">
                          {item.id ===
                          "development"
                            ? "🌱"
                            : item.id ===
                                "career"
                              ? "💼"
                              : item.id ===
                                  "learning"
                                ? "🎓"
                                : item.id ===
                                    "enjoyment"
                                  ? "📖"
                                  : "💡"}
                        </span>

                        <p className="mt-2 text-sm font-bold">
                          {t(item.key)}
                        </p>

                      </button>
                    ))}

                  </div>
                </>
              )}

              {/* STEP 2 */}

              {step === 2 && (
                <>
                  <h3 className="font-display text-2xl font-bold">
                    {t("categoryQuestion")}
                  </h3>

                  <p className="mt-2 text-sm text-ink/55">
                    {selectedCategories.length}{" "}
                    {t("selected")}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

                    {CATEGORIES.map(
                      ([id, key]) => {
                        const active =
                          selectedCategories.includes(
                            id
                          );

                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() =>
                              toggleCategory(
                                id
                              )
                            }
                            className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                              active
                                ? "border-ink bg-ink text-parchment"
                                : "border-ink/10 bg-white/60 hover:bg-white"
                            }`}
                          >
                            {t(key)}
                          </button>
                        );
                      }
                    )}

                  </div>
                </>
              )}

              {/* STEP 3 */}

              {step === 3 && (
                <>
                  <h3 className="font-display text-2xl font-bold">
                    {t("paceQuestion")}
                  </h3>

                  <div className="mt-5 space-y-3">

                    {PACES.map(
                      ([id, key]) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() =>
                            setPace(id)
                          }
                          className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${
                            pace === id
                              ? "border-ink bg-ink text-parchment"
                              : "border-ink/10 bg-white/60 hover:bg-white"
                          }`}
                        >

                          <span className="text-sm font-semibold">
                            {t(key)}
                          </span>

                          <span
                            className={`h-5 w-5 rounded-full border ${
                              pace === id
                                ? "border-amber-300 bg-amber-300"
                                : "border-ink/20"
                            }`}
                          />

                        </button>
                      )
                    )}

                  </div>
                </>
              )}

              {error && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-7 flex items-center justify-between gap-3">

                <button
                  type="button"
                  onClick={() => {
                    if (step === 1) {
                      setSetupOpen(false);
                      setError("");
                    } else {
                      setStep(
                        (current) =>
                          current - 1
                      );
                    }
                  }}
                  className="rounded-full border border-ink/15 px-5 py-3 text-sm font-bold"
                >
                  {t("back")}
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        step === 1 &&
                        !goal
                      ) {
                        setError(
                          t(
                            "chooseAtLeast"
                          )
                        );
                        return;
                      }

                      if (
                        step === 2 &&
                        !selectedCategories.length
                      ) {
                        setError(
                          t(
                            "chooseAtLeast"
                          )
                        );
                        return;
                      }

                      setError("");

                      setStep(
                        (current) =>
                          current + 1
                      );
                    }}
                    className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-parchment"
                  >
                    {t("continue")} →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      savePreferences
                    }
                    className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-parchment"
                  >
                    {t("create")}
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>
      )}

      {/* PAGE HEADER */}

      <div className="max-w-3xl">

        <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
          {t("eyebrow")}
        </p>

        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">
          {t("title")}
        </h1>

        <p className="mt-3 text-ink/60">
          {t("subtitle")}
        </p>

      </div>

      {error && !setupOpen && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* MAIN LOADING */}

      {loading ? (
        <div className="mt-10 rounded-3xl border border-ink/10 bg-white/50 p-10 text-center">
          <p className="text-sm text-ink/60">
            {t("loadingLibrary")}
          </p>
        </div>
      ) : (
        <>

          {/* RECOMMENDATIONS */}

          {preferences &&
            recommendedBooks.length > 0 && (
              <section className="mt-10">

                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-4">

                  <div>
                    <h2 className="font-display text-2xl font-bold">
                      {t("personalized")}
                    </h2>

                    <p className="mt-1 text-sm text-ink/55">
                      {t(
                        "personalizedText"
                      )}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      resetPreferences
                    }
                    className="rounded-full border border-ink/15 px-4 py-2 text-xs font-bold"
                  >
                    {t("reset")}
                  </button>

                </div>

                {recommendationLoading ? (
                  <div className="mt-7 rounded-3xl border border-ink/10 bg-white/50 p-8 text-center text-sm text-ink/60">
                    {t(
                      "loadingLibrary"
                    )}
                  </div>
                ) : (
                  <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">

                    {recommendedBooks.map(
                      (book) => {
                        const alreadyAdded =
                          books.some(
                            (item) =>
                              String(
                                item.id
                              ) ===
                              String(
                                book.id
                              )
                          );

                        return (
                          <div
                            key={
                              book.id
                            }
                          >

                            <BookCard
                              book={book}
                            />

                            <button
                              type="button"
                              disabled={
                                alreadyAdded
                              }
                              onClick={() =>
                                addToLibrary(
                                  book.id
                                )
                              }
                              className={`mt-3 w-full rounded-full px-4 py-2.5 text-xs font-bold transition ${
                                alreadyAdded
                                  ? "bg-ink/10 text-ink/45"
                                  : "bg-ink text-parchment hover:opacity-90"
                              }`}
                            >
                              {alreadyAdded
                                ? t(
                                    "added"
                                  )
                                : t(
                                    "add"
                                  )}
                            </button>

                          </div>
                        );
                      }
                    )}

                  </div>
                )}

              </section>
            )}

          {/* NO RECOMMENDATIONS */}

          {preferences &&
            !recommendationLoading &&
            recommendedBooks.length === 0 &&
            allBooks.length > 0 && (
              <div className="mt-10 rounded-3xl border border-ink/10 bg-white/50 p-8">

                <h2 className="font-display text-2xl font-bold">
                  {t("noMatches")}
                </h2>

                <p className="mt-2 text-sm text-ink/60">
                  {t(
                    "noMatchesText"
                  )}
                </p>

                <button
                  type="button"
                  onClick={
                    resetPreferences
                  }
                  className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-bold text-parchment"
                >
                  {t("reset")}
                </button>

              </div>
            )}

          {/* EMPTY LIBRARY */}

          {books.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-ink/10 bg-white/50 p-10 text-center">

              <h2 className="font-display text-2xl font-bold">
                {t("libraryEmpty")}
              </h2>

              <p className="mt-2 text-sm text-ink/60">
                {t("emptyText")}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">

                <Link
                  href="/search"
                  className="rounded-full bg-ink px-6 py-3 text-sm font-bold text-parchment"
                >
                  {t("exploreBooks")}
                </Link>

                {!preferences && (
                  <button
                    type="button"
                    onClick={() =>
                      setSetupOpen(
                        true
                      )
                    }
                    className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold"
                  >
                    {t(
                      "personalize"
                    )}
                  </button>
                )}

              </div>

            </div>
          ) : (

            /* SAVED BOOKS + PROGRESS */

            <section className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">

              <div>

                <div className="flex items-center justify-between border-b border-ink/10 pb-4">

                  <h2 className="font-display text-2xl font-bold">
                    {t(
                      "savedBooksTitle"
                    )}
                  </h2>

                  <span className="text-sm text-ink/50">
                    {books.length}{" "}
                    {books.length === 1
                      ? t("book")
                      : t("books")}
                  </span>

                </div>

                <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-3">

                  {books.map((book) => {

                    const bookProgress =
                      progress[
                        book.id
                      ];

                    const percent =
                      Math.round(
                        Number(
                          bookProgress?.percent ||
                            0
                        )
                      );

                    return (
                      <div
                        key={book.id}
                      >

                        <BookCard
                          book={book}
                        />

                        {/* PROGRESS */}

                        <div className="mt-3">

                          <div className="flex items-center justify-between text-xs text-ink/50">

                            <span>
                              {t(
                                "readingProgress"
                              )}
                            </span>

                            <span className="font-semibold text-ink/70">
                              {percent}%
                            </span>

                          </div>

                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/10">

                            <div
                              className="h-full rounded-full bg-amber-300 transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    percent
                                  )
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                        {/* READ */}

                        <Link
                          href={`/reader/${book.id}`}
                          className="mt-3 block w-full rounded-full bg-ink px-4 py-2.5 text-center text-xs font-bold text-parchment transition hover:opacity-90"
                        >
                          {percent > 0
                            ? `${t(
                                "continueReading"
                              )} →`
                            : t(
                                "readNow"
                              )}
                        </Link>

                        {/* REMOVE */}

                        <button
                          type="button"
                          onClick={() =>
                            removeFromLibrary(
                              book.id
                            )
                          }
                          className="mt-2 w-full rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          {t(
                            "removeLibrary"
                          )}
                        </button>

                      </div>
                    );
                  })}

                </div>

              </div>

              {/* CONTINUE READING */}

              <aside className="h-fit rounded-3xl bg-ink p-7 text-parchment">

                <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">
                  {t(
                    "readingProgress"
                  )}
                </p>

                <h2 className="mt-3 font-display text-2xl font-bold">
                  {t(
                    "keepGoing"
                  )}
                </h2>

                {progressLoading ? (

                  <p className="mt-4 text-sm text-parchment/60">
                    {t(
                      "loadingProgress"
                    )}
                  </p>

                ) : continueBook ? (

                  <>
                    <p className="mt-3 text-sm text-parchment/60">
                      {t(
                        "continueWhereLeft"
                      )}
                    </p>

                    <div className="mt-6">

                      <p className="text-sm font-semibold">
                        {
                          continueBook.title
                        }
                      </p>

                      <p className="mt-1 text-xs text-parchment/50">
                        {continueBook.author_name ||
                          "Unknown author"}
                      </p>

                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">

                      <div
                        className="h-full rounded-full bg-amber-300 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              continuePercent
                            )
                          )}%`,
                        }}
                      />

                    </div>

                    <div className="mt-2 flex justify-between text-xs text-parchment/55">

                      <span>
                        {continuePercent}%
                      </span>

                      <span>
                        {continueProgress?.location
                          ? t("saved")
                          : t(
                              "notStarted"
                            )}
                      </span>

                    </div>

                    <Link
                      href={`/reader/${continueBook.id}`}
                      className="mt-6 block rounded-full bg-parchment px-5 py-3 text-center text-sm font-bold text-ink transition hover:opacity-90"
                    >
                      {continuePercent > 0
                        ? `${t(
                            "continueReading"
                          )} →`
                        : t("readNow")}
                    </Link>
                  </>

                ) : (

                  <p className="mt-4 text-sm text-parchment/60">
                    {t(
                      "emptyText"
                    )}
                  </p>

                )}

                <button
                  type="button"
                  onClick={() =>
                    setSetupOpen(true)
                  }
                  className="mt-5 w-full rounded-full border border-parchment/20 px-5 py-3 text-center text-xs font-bold text-parchment hover:bg-white/10"
                >
                  {preferences
                    ? t("reset")
                    : t(
                        "personalize"
                      )}
                </button>

              </aside>

            </section>
          )}

        </>
      )}

    </main>
  );
}