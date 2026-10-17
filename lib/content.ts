import type { Article, Service, SiteSettings } from "./types";

export const initialCopy: SiteSettings["copy"] = {
  rhythmEyebrow: { lv: "RŪPES TAVĀ RITMĀ", en: "CARE AT YOUR PACE", ru: "ЗАБОТА В ТВОЁМ РИТМЕ" },
  rhythmTitle: {
    lv: "Laiks, kas veltīts Tev.",
    en: "Time, dedicated to you.",
    ru: "Время, посвящённое Тебе.",
  },
  rhythmIntro: {
    lv: "Bez steigas. Izvēlies pirmo iepazīšanos vai sev piemērotu kopšanu un ieplāno mirkli sev.",
    en: "No rush. Choose an introductory visit or your individual care, and set aside a moment for yourself.",
    ru: "Без спешки. Выбери первую встречу или подходящий уход и запланируй время для себя.",
  },
  rhythmServices: { lv: "kopšanas virzieni", en: "skincare services", ru: "направления ухода" },
  rhythmDuration: { lv: "Tavai vizītei", en: "for your visit", ru: "для Твоего визита" },
  rhythmChartTitle: {
    lv: "Tavas vizītes ritms",
    en: "The rhythm of your visit",
    ru: "Ритм Твоего визита",
  },
  rhythmChartNote: {
    lv: "Plānotais pakalpojumu ilgums. Detaļas pārrunāsim, apstiprinot vizīti.",
    en: "Planned service duration. We'll discuss the details when confirming your visit.",
    ru: "Плановая длительность услуг. Детали обсудим при подтверждении визита.",
  },
  servicesTitle: { lv: "Mazi rituāli.", en: "Small rituals.", ru: "Маленькие ритуалы." },
  servicesAccent: {
    lv: "Lielas rūpes par Tevi.",
    en: "Thoughtful care for you.",
    ru: "Большая забота о Тебе.",
  },
  servicesIntro: {
    lv: "Ādai vajag to, kas der tieši Tev. Sāksim ar iepazīšanos un kopā izvēlēsimies kopšanu.",
    en: "Your skin deserves care that suits you. Let's get to know each other and choose your skincare together.",
    ru: "Коже нужен уход, который подходит именно Тебе. Начнём со знакомства и вместе выберем его.",
  },
  value1Title: { lv: "Tava āda ir unikāla", en: "Your skin is unique", ru: "Твоя кожа уникальна" },
  value1Text: {
    lv: "Sākam ar Tavas ādas vajadzību izpratni.",
    en: "We start by understanding what it needs.",
    ru: "Начинаем с понимания её потребностей.",
  },
  value2Title: {
    lv: "Saudzīgi pret dabisko",
    en: "Gentle by nature",
    ru: "Бережно к естественному",
  },
  value2Text: {
    lv: "Ar cieņu pret ādas aizsargbarjeru.",
    en: "Respecting your skin's protective barrier.",
    ru: "С вниманием к защитному барьеру кожи.",
  },
  value3Title: { lv: "Rūpes ilgtermiņā", en: "Care that lasts", ru: "Забота надолго" },
  value3Text: {
    lv: "Palīdzu izprast ikdienas ādas kopšanu.",
    en: "Helping you understand everyday skincare.",
    ru: "Помогаю разобраться в ежедневном уходе.",
  },
  quote: {
    lv: "Justies labi savā ādā.\nAr izpratni, mieru un rūpēm.",
    en: "Feel at home in your skin.\nWith understanding, calm and care.",
    ru: "Чувствовать себя хорошо в своей коже.\nС пониманием, спокойствием и заботой.",
  },
  processTitle: {
    lv: "Tava pirmā tikšanās\nar SKINSTINCT.",
    en: "Your first meeting\nwith SKINSTINCT.",
    ru: "Твоя первая встреча\nсо SKINSTINCT.",
  },
  process1Title: { lv: "Izvēlies savu laiku", en: "Choose your time", ru: "Выбери своё время" },
  process1Text: {
    lv: "Ieskaties kalendārā un atrodi ērtu dienu mūsu sarunai.",
    en: "Take a look at the calendar and find a convenient day for our conversation.",
    ru: "Загляни в календарь и найди удобный день для встречи.",
  },
  process2Title: {
    lv: "Iepazīsim Tavu ādu",
    en: "Let's get to know your skin",
    ru: "Познакомимся с Твоей кожей",
  },
  process2Text: {
    lv: "Pārrunāsim Tavus paradumus, vajadzības un gaidas.",
    en: "We'll talk about your routine, needs and expectations.",
    ru: "Поговорим о Твоих привычках, потребностях и ожиданиях.",
  },
  process3Title: {
    lv: "Paņem rūpes līdzi",
    en: "Take care home with you",
    ru: "Забери заботу с собой",
  },
  process3Text: {
    lv: "Dodies mājās ar izpratni, kā turpināt ādas kopšanu ikdienā.",
    en: "Leave with an understanding of how to care for your skin every day.",
    ru: "Уйди с пониманием, как продолжить уход дома.",
  },
  bookingTitle: { lv: "Lai rūpes\nsākas ", en: "Let care\nbegin ", ru: "Пусть забота\nначнётся " },
  bookingAccent: { lv: "šeit.", en: "here.", ru: "здесь." },
  bookingIntro: {
    lv: "Izvēlies pakalpojumu, ērtu dienu un atstāj kontaktu. Pārējo pārrunāsim personīgi.",
    en: "Choose a service, a convenient day and leave your contact details. We'll discuss the rest personally.",
    ru: "Выбери услугу, удобный день и оставь контакт. Всё остальное мы обсудим лично.",
  },
  faqTitle: {
    lv: "Varbūt Tu\nvēlies pajautāt.",
    en: "You might\nbe wondering.",
    ru: "Возможно,\nТы хочешь спросить.",
  },
  faq3Question: {
    lv: "Kā apskatīt vai atcelt pierakstu?",
    en: "How can I view or cancel an appointment?",
    ru: "Как посмотреть или отменить запись?",
  },
  faq4Question: {
    lv: "Kur atrodas studija?",
    en: "Where is the studio?",
    ru: "Где находится студия?",
  },
  faq1Question: {
    lv: "Ko izvēlēties pirmajai vizītei?",
    en: "What should I choose for my first visit?",
    ru: "Что выбрать для первого визита?",
  },
  faq1Answer: {
    lv: "Sāc ar iepazīšanās vizīti. Pārrunāsim Tavu ikdienas kopšanu, vēlmes un kopā izvēlēsimies turpmākos soļus.",
    en: "Start with an introductory visit. We'll discuss your daily skincare, your wishes and choose the next steps together.",
    ru: "Начни со знакомства с Твоей кожей. Мы обсудим Твой уход, пожелания и подберём дальнейшие шаги лично.",
  },
  faq2Question: {
    lv: "Kā tiek apstiprināts pieraksts?",
    en: "How is my appointment confirmed?",
    ru: "Как подтверждается запись?",
  },
  faq2Answer: {
    lv: "Pēc pieteikuma izvēlētais laiks tiek rezervēts sistēmā. Es sazināšos pa norādīto tālruni vai e-pastu, lai apstiprinātu tikšanos un precizētu detaļas.",
    en: "Your chosen time is reserved in the system after your request. I'll contact you by phone or email to confirm the appointment and discuss the details.",
    ru: "После заявки выбранный час резервируется в системе. Я свяжусь с Тобой по указанному телефону или почте, чтобы подтвердить встречу и уточнить детали.",
  },
  journalTitle: {
    lv: "Nedaudz tuvāk\nsavai ",
    en: "A little closer\nto your ",
    ru: "Чуть ближе\nк своей ",
  },
  journalAccent: { lv: "ādai.", en: "skin.", ru: "коже." },
  contactTitle: {
    lv: "Tava āda.\nTavi jautājumi.\nEs esmu ",
    en: "Your skin.\nYour questions.\nI'm ",
    ru: "Твоя кожа.\nТвои вопросы.\nЯ ",
  },
  contactAccent: { lv: "tepat.", en: "right here.", ru: "рядом." },
  contactIntro: {
    lv: "Neesi pārliecināta, kurš pakalpojums būs piemērots? Atstāj ziņu, un es palīdzēšu orientēties.",
    en: "Not sure which service is right for you? Leave me a message and I'll help you find your way.",
    ru: "Не уверена, какая услуга подойдёт? Оставь сообщение, и я помогу сориентироваться.",
  },
  contactFormTitle: { lv: "Atstāj pāris vārdus", en: "Leave a few words", ru: "Оставь пару слов" },
  footerDescription: {
    lv: "Saudzīgi pret ādu. Ar uzmanību Tev.",
    en: "Gentle on your skin. Attentive to you.",
    ru: "Бережно к коже. С вниманием к Тебе.",
  },
};

export const initialSettings: SiteSettings = {
  logoImage: "/images/skinstinct-logo.webp",
  copy: initialCopy,
  heroEyebrow: {
    lv: "KOSMETOLOĢIJAS STUDIJA JĒKABPILĪ",
    en: "SKINCARE STUDIO IN JĒKABPILS",
    ru: "СТУДИЯ КОСМЕТОЛОГИИ В ЕКАБПИЛСЕ",
  },
  heroTitle: { lv: "Tava āda.", en: "Your skin.", ru: "Твоя кожа." },
  heroAccent: { lv: "Tava harmonija.", en: "Your harmony.", ru: "Твоя гармония." },
  heroDescription: {
    lv: "Apzināta ādas kopšana, kas sākas ar ieklausīšanos. Individuāla pieeja, saudzīgs pieskāriens un rūpes, kas paliek.",
    en: "Thoughtful skincare starts with listening. An individual approach, a gentle touch and care that stays with you.",
    ru: "Осознанный уход за кожей начинается с внимания к Тебе. Индивидуальный подход, бережное прикосновение и забота, которая остаётся.",
  },
  heroImage: "/images/hero.webp",
  aboutImage: "/images/valerija-v2.webp",
  aboutTitle: {
    lv: "Iepazīsimies,\nes esmu Valērija.",
    en: "Let's meet,\nI'm Valērija.",
    ru: "Познакомимся,\nя Валерия.",
  },
  aboutBody: {
    lv: "Esmu Valērija Razujeva, sertificēta skaistumkopšanas speciāliste kosmetoloģijā un reģistrēta ārstniecības persona.\n\nSKINSTINCT veidoju kā mierpilnu vietu, kur labāk iepazīt savu ādu. Mana pieeja balstās korneoterapijā, ādas diagnostikā un saudzīgā attieksmē pret ādas dabisko aizsargbarjeru.\n\nEs vēlos, lai pēc mūsu tikšanās Tev paliek ne tikai patīkama sajūta, bet arī skaidrība, kā rūpēties par ādu ikdienā.",
    en: "I'm Valērija Razujeva, a certified beauty specialist in cosmetology and a registered healthcare practitioner.\n\nI'm creating SKINSTINCT as a calm space to get to know your skin better. My approach is based on corneotherapy, skin diagnostics and respect for the skin's natural protective barrier.\n\nI want you to leave our meeting with a pleasant feeling and a clear understanding of how to care for your skin every day.",
    ru: "Я Валерия Разуева, сертифицированный специалист по косметологии и зарегистрированный медицинский работник.\n\nЯ создаю SKINSTINCT как спокойное пространство, где можно лучше узнать свою кожу. В основе моего подхода корнеотерапия, диагностика и бережное отношение к естественному защитному барьеру кожи.\n\nМне хочется, чтобы после нашей встречи у Тебя осталось не только приятное ощущение, но и понимание, как заботиться о коже каждый день.",
  },
  specialistName: "Valērija Razujeva",
  specialistTitle: {
    lv: "Skaistumkopšanas speciāliste kosmetoloģijā",
    en: "Certified beauty specialist in cosmetology",
    ru: "Специалист по косметологии",
  },
  registration: "65120058811",
  city: "Jēkabpils",
  address: "",
  phone: "",
  email: "",
  instagram: "https://www.instagram.com/vr_skinstinct/",
  legalName: "SKINSTINCT",
  legalRegistration: "",
  legalAddress: "",
  privacyEmail: "",
  seoDescription: {
    lv: "SKINSTINCT kosmetoloģijas studija Jēkabpilī. Valērija Razujeva: korneoterapija, ādas diagnostika un individuāla ādas kopšana. Piesaki vizīti tiešsaistē.",
    en: "SKINSTINCT skincare studio in Jēkabpils. Valērija Razujeva: corneotherapy, skin diagnostics and individual skincare. Book your visit online.",
    ru: "SKINSTINCT, студия косметологии в Екабпилсе. Валерия Разуева: корнеотерапия, диагностика и индивидуальный уход за кожей. Онлайн запись.",
  },
  bookingEnabled: true,
  bookingNotice: {
    lv: "Studija top. Izvēlies vēlamo vizītes laiku, un es sazināšos, lai apstiprinātu tikšanos un precizētu adresi. Cenu saskaņosim pirms vizītes.",
    en: "The studio is preparing to open. Choose your preferred appointment time and I'll contact you to confirm your visit and the address. We'll agree on the price before your visit.",
    ru: "Студия готовится к открытию. Выбери желаемое время, и я свяжусь с Тобой, чтобы подтвердить встречу и уточнить адрес. Стоимость согласуем до визита.",
  },
  bufferMinutes: 15,
  cancellationHours: 24,
  schedule: Array.from({ length: 7 }, (_, day) => ({
    enabled: day > 0 && day < 6,
    start: "10:00",
    end: "18:00",
  })),
};

export const initialServices: Service[] = [
  {
    id: "consultation",
    title: {
      lv: "Iepazīšanās ar Tavu ādu",
      en: "Getting to know your skin",
      ru: "Знакомство с Твоей кожей",
    },
    category: { lv: "PIRMĀ VIZĪTE", en: "FIRST VISIT", ru: "ПЕРВЫЙ ВИЗИТ" },
    description: {
      lv: "Saruna par Tavas ādas vajadzībām, ikdienas paradumiem un kopšanas mērķiem. Pirmais solis pretī pārdomātai ādas kopšanai.",
      en: "A conversation about your skin's needs, daily habits and skincare goals. Your first step towards a thoughtful skincare routine.",
      ru: "Поговорим о потребностях Твоей кожи, привычках и целях ухода. Первый шаг к понятной системе заботы о себе.",
    },
    duration: 60,
    price: null,
    active: true,
    image: "/images/treatment.webp",
  },
  {
    id: "diagnostics",
    title: { lv: "Ādas diagnostika", en: "Skin diagnostics", ru: "Диагностика кожи" },
    category: { lv: "IZPRATNE", en: "UNDERSTANDING", ru: "ПОНИМАНИЕ" },
    description: {
      lv: "Iepazīstam Tavas ādas stāvokli un individuālās vajadzības, lai kopšanas izvēles būtu pamatotas un saprotamas.",
      en: "We explore your skin's condition and individual needs to make informed, clear skincare choices.",
      ru: "Изучаем состояние и индивидуальные потребности кожи, чтобы выбор ухода был обоснованным и понятным.",
    },
    duration: 60,
    price: null,
    active: true,
    image: "/images/hero.webp",
  },
  {
    id: "corneotherapy",
    title: { lv: "Korneoterapija", en: "Corneotherapy", ru: "Корнеотерапия" },
    category: { lv: "LĪDZSVARS", en: "BALANCE", ru: "БАЛАНС" },
    description: {
      lv: "Saudzīga pieeja, kuras uzmanības centrā ir ādas aizsargbarjera. Individuāli izvēlēta kopšana Tavas ādas komfortam.",
      en: "A gentle approach centred on the skin's protective barrier. Individually selected care for your skin's comfort.",
      ru: "Бережный подход с вниманием к защитному барьеру кожи. Индивидуально подобранный уход для её комфорта.",
    },
    duration: 90,
    price: null,
    active: true,
    image: "/images/ritual.webp",
  },
];

export const initialArticles: Article[] = [
  {
    id: "intro",
    slug: "iepazisti-skinstinct",
    title: {
      lv: "Rūpes, kas paliek. Iepazīsti SKINSTINCT.",
      en: "Care that lasts. Meet SKINSTINCT.",
      ru: "Забота, которая остаётся. Знакомься со SKINSTINCT.",
    },
    excerpt: {
      lv: "Par studijas sākumu, vērtībām un manu pieeju apzinātai ādas kopšanai.",
      en: "The beginning of the studio, its values and my approach to thoughtful skincare.",
      ru: "О начале студии, ценностях и моём подходе к осознанному уходу за кожей.",
    },
    body: {
      lv: "## Vieta, kur ieklausīties\nSKINSTINCT sākas ar vienkāršu domu: katra āda ir individuāla un ir pelnījusi uzmanīgu attieksmi. Esmu Valērija Razujeva, un šobrīd veidoju savu kosmetoloģijas studiju Jēkabpilī.\n\n## Vispirms izpratne\nPirms kopšanas izvēles es vēlos iepazīt Tavu ādu un ikdienas paradumus. Mana profesionālā interese ir korneoterapija un ādas diagnostika.\n\n## Ilgtermiņa attiecības ar savu ādu\nVēlos dalīties zināšanās, kas palīdz orientēties ādas kopšanā arī ārpus studijas. Šeit pamazām stāstīšu par studijas jaunumiem un savu pieeju.\n\nPriecāšos iepazīties. Seko studijas attīstībai Instagram vai atstāj ziņu kontaktformā.",
      en: "## A place to be heard\nSKINSTINCT begins with a simple thought: every skin is individual and deserves attention. I'm Valērija Razujeva, and I'm currently creating my skincare studio in Jēkabpils.\n\n## Understanding comes first\nBefore choosing skincare, I want to get to know your skin and everyday habits. My professional interests are corneotherapy and skin diagnostics.\n\n## A lasting relationship with your skin\nI want to share knowledge that helps you navigate skincare beyond the studio. Here, I'll gradually share studio news and my approach.\n\nI'd love to meet you. Follow the studio's progress on Instagram or leave a message through the contact form.",
      ru: "## Место, где Тебя услышат\nSKINSTINCT начинается с простой мысли: каждая кожа индивидуальна и заслуживает внимательного отношения. Я Валерия Разуева, и сейчас я создаю свою студию косметологии в Екабпилсе.\n\n## Сначала понимание\nПрежде чем выбирать уход, я хочу познакомиться с Твоей кожей и повседневными привычками. Мои профессиональные интересы: корнеотерапия и диагностика кожи.\n\n## Отношения со своей кожей надолго\nМне хочется делиться знаниями, которые помогают ориентироваться в уходе и за пределами студии. Здесь я постепенно буду рассказывать о новостях и своём подходе.\n\nБуду рада знакомству. Следи за развитием студии в Instagram или оставь сообщение через форму на сайте.",
    },
    category: { lv: "STUDIJAS DIENASGRĀMATA", en: "STUDIO JOURNAL", ru: "ДНЕВНИК СТУДИИ" },
    image: "/images/valerija-v2.webp",
    published: true,
    createdAt: "2026-10-17T09:00:00.000Z",
  },
];
