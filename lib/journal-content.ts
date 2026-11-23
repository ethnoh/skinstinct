import type { Article } from "./types";
import { cleanJournalBody } from './journal-cleanup';

export const instagramIntroduction = "https://www.instagram.com/p/DeGuHoeDNfY/";

// Editorial adaptations of the owner's introduction, not additional Instagram posts.
const journalDrafts: Article[] = [
  {
    id: "journal-conversation-2026-11",
    slug: "kopsana-sakas-ar-sarunu",
    title: {
      lv: "Kopšana sākas ar sarunu.",
      en: "Care begins with a conversation.",
      ru: "Забота начинается с разговора.",
    },
    excerpt: {
      lv: "Pirms izvēlēties kopšanu, man ir svarīgi iepazīt Tevi, Tavu ādu un ikdienas paradumus.",
      en: "Before choosing skincare, I want to understand you, your skin and your everyday habits.",
      ru: "Прежде чем выбирать уход, мне важно познакомиться с Тобой, Твоей кожей и повседневными привычками.",
    },
    body: {
      lv: "## Vispirms — iepazīties\nMan svarīga ir personalizēta pieeja. Tāpēc saruna ir daļa no rūpēm: vēlos saprast, kas Tev ir svarīgs, kā Tu jūties savā ādā un kā par to rūpējies ikdienā.\n\n## Vieta Taviem jautājumiem\nVēlos, lai vari pajautāt arī to, kas šķiet pavisam vienkāršs. Par savu pašreizējo kopšanu, par neskaidrībām un par to, ko vēlies labāk izprast. Nav vajadzīga perfekta rutīna, lai sāktu sarunu.\n\n## Kopšana, ko saproti\nMan ir svarīgi, lai Tu saprastu izvēlētās pieejas jēgu. Vēlos, lai pēc tikšanās Tev būtu skaidrāks priekšstats par savām ikdienas rūpēm un vieta arī turpmākiem jautājumiem.\n\nŠis pieraksts turpina manā Instagram iepazīšanās ierakstā aizsākto domu par individuālu un apzinātu pieeju. Fotogrāfija ir no SKINSTINCT fotosesijas.",
      en: "## Getting to know you first\nA personal approach matters to me. Conversation is part of care: I want to understand what matters to you, how you feel about your skin and how you look after it day to day.\n\n## Space for your questions\nI want you to feel comfortable asking even the simplest questions. About your current routine, anything that feels unclear, and what you would like to understand better. Your routine does not have to be perfect to start a conversation.\n\n## Care you understand\nIt matters to me that you understand the reasoning behind the approach we choose. I want our meeting to leave you with a clearer sense of your daily care and room for further questions.\n\nThis journal entry develops the idea of individual, thoughtful care from my Instagram introduction. The photograph is from the SKINSTINCT photoshoot.",
      ru: "## Сначала — знакомство\nМне важен индивидуальный подход. Поэтому разговор — часть заботы: я хочу понять, что важно для Тебя, как Ты чувствуешь себя в своей коже и как ухаживаешь за ней каждый день.\n\n## Место для Твоих вопросов\nХочется, чтобы Ты могла задать даже самый простой вопрос. О привычном уходе, о том, что пока непонятно, и о том, в чём хочется разобраться. Для начала разговора не нужна идеальная рутина.\n\n## Уход, который понятен\nМне важно, чтобы Ты понимала смысл выбранного подхода. Хочется, чтобы после встречи повседневная забота стала понятнее и оставалось место для новых вопросов.\n\nЭта заметка продолжает мысль об индивидуальном и осознанном подходе из моего знакомства в Instagram. Фотография — из фотосессии SKINSTINCT.",
    },
    category: { lv: "MANA PIEEJA", en: "MY APPROACH", ru: "МОЙ ПОДХОД" },
    image: "/images/journal-conversation.webp",
    published: true,
    createdAt: "2026-11-22T10:00:00.000Z",
  },
  {
    id: "journal-everyday-2026-11",
    slug: "rupes-ari-arpus-studijas",
    title: {
      lv: "Rūpes arī ārpus studijas.",
      en: "Care beyond the studio.",
      ru: "Забота и за пределами студии.",
    },
    excerpt: {
      lv: "Vēlos, lai SKINSTINCT būtu arī vieta, kur labāk izprast savu ādu un ikdienas rūpes par sevi.",
      en: "I want SKINSTINCT to be a place to better understand your skin and your everyday care.",
      ru: "Хочу, чтобы SKINSTINCT был местом, где можно лучше понять свою кожу и ежедневную заботу о себе.",
    },
    body: {
      lv: "## Vairāk par vienu tikšanos\nVeidojot SKINSTINCT, domāju arī par to, kas paliek pēc apmeklējuma. Man svarīga ir ilgtermiņa pieeja un Tava izpratne par savu ādu. Tieši tāpēc studijas vēstījums ir “Rūpes, kas paliek.”\n\n## Apzināta attieksme\nĀdas barjeras respektēšana un individuāla pieeja ir vērtības, ar kurām iepazīstināju savā pirmajā Instagram ierakstā. Vēlos tās izskaidrot mierīgi un saprotami, lai kopšanas izvēles kļūtu apzinātākas.\n\n## Mazie ikdienas mirkļi\nŠajā dienasgrāmatā dalos savā profesionālajā skatījumā un studijas dzīves detaļās. Instagram paliek vieta īsākiem mirkļiem un sarunām, bet šeit varu pie domām pakavēties ilgāk.\n\nRaksts veidots, izvēršot manā Instagram iepazīšanās ierakstā aprakstītās vērtības. Attēls ir no SKINSTINCT fotosesijas; tas ilustrē studijas darbu, nevis sola konkrētu procedūras rezultātu.",
      en: "## More than one visit\nAs I shape SKINSTINCT, I also think about what stays with you after a visit. A long-term approach and your understanding of your skin matter to me. That is why the studio's message is “Care that lasts.”\n\n## Thoughtful choices\nRespect for the skin barrier and a personal approach are values I introduced in my first Instagram post. I want to explain them calmly and clearly, so skincare choices feel more considered.\n\n## Everyday moments\nIn this journal I share my professional perspective and details of studio life. Instagram is a place for shorter moments and conversations; here I can spend a little more time with each idea.\n\nThis article expands on the values described in my Instagram introduction. The photograph is from the SKINSTINCT photoshoot and illustrates studio work, rather than promising a specific treatment result.",
      ru: "## Больше, чем одна встреча\nСоздавая SKINSTINCT, я думаю и о том, что остаётся после визита. Мне важны долгосрочный подход и Твоё понимание своей кожи. Поэтому послание студии — «Забота, которая остаётся».\n\n## Осознанное отношение\nУважение к кожному барьеру и индивидуальный подход — ценности, о которых я рассказала в первом посте в Instagram. Хочется объяснять их спокойно и понятно, чтобы решения об уходе становились осознаннее.\n\n## Маленькие ежедневные моменты\nВ этом дневнике я делюсь профессиональным взглядом и деталями жизни студии. Instagram остаётся местом для коротких моментов и общения, а здесь можно остановиться на каждой мысли чуть дольше.\n\nСтатья развивает ценности из моего знакомства в Instagram. Снимок — из фотосессии SKINSTINCT: он показывает работу студии и не обещает определённого результата процедуры.",
    },
    category: { lv: "APZINĀTAS RŪPES", en: "THOUGHTFUL CARE", ru: "ОСОЗНАННАЯ ЗАБОТА" },
    image: "/images/valerija-studio-care-v4.webp",
    published: true,
    createdAt: "2026-11-22T09:00:00.000Z",
  },
];
export const journalArticles: Article[] = journalDrafts.map(article => ({
 ...article,
 body:{lv:cleanJournalBody(article.body.lv),en:cleanJournalBody(article.body.en),ru:cleanJournalBody(article.body.ru)},
}));
