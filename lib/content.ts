import type { Article, Service, SiteSettings } from "./types";

export const initialCopy: SiteSettings["copy"] = {
  servicesTitle: { lv: "Mazi rituāli.", ru: "Маленькие ритуалы." },
  servicesAccent: { lv: "Lielas rūpes par tevi.", ru: "Большая забота о тебе." },
  servicesIntro: {
    lv: "Ādai vajag to, kas der tieši tev. Sāksim ar iepazīšanos un kopā izvēlēsimies kopšanu.",
    ru: "Коже нужен уход, который подходит именно тебе. Начнём со знакомства и вместе выберем его.",
  },
  value1Title: { lv: "Tava āda ir unikāla", ru: "Твоя кожа уникальна" },
  value1Text: {
    lv: "Sākam ar tavas ādas vajadzību izpratni.",
    ru: "Начинаем с понимания её потребностей.",
  },
  value2Title: { lv: "Saudzīgi pret dabisko", ru: "Бережно к естественному" },
  value2Text: {
    lv: "Ar cieņu pret ādas aizsargbarjeru.",
    ru: "С вниманием к защитному барьеру кожи.",
  },
  value3Title: { lv: "Rūpes ilgtermiņā", ru: "Забота надолго" },
  value3Text: {
    lv: "Palīdzu izprast ikdienas ādas kopšanu.",
    ru: "Помогаю разобраться в ежедневном уходе.",
  },
  quote: {
    lv: "Justies labi savā ādā.\nAr izpratni, mieru un rūpēm.",
    ru: "Чувствовать себя хорошо в своей коже.\nС пониманием, спокойствием и заботой.",
  },
  processTitle: {
    lv: "Tava pirmā tikšanās\nar SKINSTINCT.",
    ru: "Твоя первая встреча\nсо SKINSTINCT.",
  },
  process1Title: { lv: "Izvēlies savu laiku", ru: "Выбери своё время" },
  process1Text: {
    lv: "Ieskaties kalendārā un atrodi ērtu dienu mūsu sarunai.",
    ru: "Загляни в календарь и найди удобный день для встречи.",
  },
  process2Title: { lv: "Iepazīsim tavu ādu", ru: "Познакомимся с твоей кожей" },
  process2Text: {
    lv: "Pārrunāsim tavus paradumus, vajadzības un gaidas.",
    ru: "Поговорим о твоих привычках, потребностях и ожиданиях.",
  },
  process3Title: { lv: "Paņem rūpes līdzi", ru: "Забери заботу с собой" },
  process3Text: {
    lv: "Dodies mājās ar izpratni, kā turpināt ādas kopšanu ikdienā.",
    ru: "Уйди с пониманием, как продолжить уход дома.",
  },
  bookingTitle: { lv: "Lai rūpes\nsākas ", ru: "Пусть забота\nначнётся " },
  bookingAccent: { lv: "šeit.", ru: "здесь." },
  bookingIntro: {
    lv: "Izvēlies pakalpojumu, ērtu dienu un atstāj kontaktu. Pārējo pārrunāsim personīgi.",
    ru: "Выбери услугу, удобный день и оставь контакт. Всё остальное мы обсудим лично.",
  },
  faqTitle: { lv: "Varbūt tu\nvēlies pajautāt.", ru: "Возможно,\nты хочешь спросить." },
  faq1Question: { lv: "Ko izvēlēties pirmajai vizītei?", ru: "Что выбрать для первого визита?" },
  faq1Answer: {
    lv: "Sāc ar iepazīšanās vizīti. Pārrunāsim tavu ikdienas kopšanu, vēlmes un kopā izvēlēsimies turpmākos soļus.",
    ru: "Начни со знакомства с твоей кожей. Мы обсудим твой уход, пожелания и подберём дальнейшие шаги лично.",
  },
  faq2Question: { lv: "Kā tiek apstiprināts pieraksts?", ru: "Как подтверждается запись?" },
  faq2Answer: {
    lv: "Pēc pieteikuma izvēlētais laiks tiek rezervēts sistēmā. Es sazināšos pa norādīto tālruni vai e-pastu, lai apstiprinātu tikšanos un precizētu detaļas.",
    ru: "После заявки выбранный час резервируется в системе. Я свяжусь с тобой по указанному телефону или почте, чтобы подтвердить встречу и уточнить детали.",
  },
  journalTitle: { lv: "Nedaudz tuvāk\nsavai ", ru: "Чуть ближе\nк своей " },
  journalAccent: { lv: "ādai.", ru: "коже." },
  contactTitle: { lv: "Tava āda.\nTavi jautājumi.\nEs esmu ", ru: "Твоя кожа.\nТвои вопросы.\nЯ " },
  contactAccent: { lv: "tepat.", ru: "рядом." },
  contactIntro: {
    lv: "Neesi pārliecināta, kurš pakalpojums būs piemērots? Atstāj ziņu, un es palīdzēšu orientēties.",
    ru: "Не уверена, какая услуга подойдёт? Оставь сообщение, и я помогу сориентироваться.",
  },
  contactFormTitle: { lv: "Atstāj pāris vārdus", ru: "Оставь пару слов" },
  footerDescription: {
    lv: "Saudzīgi pret ādu. Ar uzmanību tev.",
    ru: "Бережно к коже. С вниманием к тебе.",
  },
};

export const initialSettings: SiteSettings = {
  logoImage: "/images/skinstinct-logo.webp",
  copy: initialCopy,
  heroEyebrow: { lv: "KOSMETOLOĢIJAS STUDIJA JĒKABPILĪ", ru: "СТУДИЯ КОСМЕТОЛОГИИ В ЕКАБПИЛСЕ" },
  heroTitle: { lv: "Tava āda.", ru: "Твоя кожа." },
  heroAccent: { lv: "Tava harmonija.", ru: "Твоя гармония." },
  heroDescription: {
    lv: "Apzināta ādas kopšana, kas sākas ar ieklausīšanos. Individuāla pieeja, saudzīgs pieskāriens un rūpes, kas paliek.",
    ru: "Осознанный уход за кожей начинается с внимания к тебе. Индивидуальный подход, бережное прикосновение и забота, которая остаётся.",
  },
  heroImage: "/images/hero.webp",
  aboutImage: "/images/valerija-v2.webp",
  aboutTitle: { lv: "Iepazīsimies,\nes esmu Valērija.", ru: "Познакомимся,\nя Валерия." },
  aboutBody: {
    lv: "Esmu Valērija Razujeva, sertificēta skaistumkopšanas speciāliste kosmetoloģijā un reģistrēta ārstniecības persona.\n\nSKINSTINCT veidoju kā mierpilnu vietu, kur labāk iepazīt savu ādu. Mana pieeja balstās korneoterapijā, ādas diagnostikā un saudzīgā attieksmē pret ādas dabisko aizsargbarjeru.\n\nEs vēlos, lai pēc mūsu tikšanās tev paliek ne tikai patīkama sajūta, bet arī skaidrība, kā rūpēties par ādu ikdienā.",
    ru: "Я Валерия Разуева, сертифицированный специалист по косметологии и зарегистрированный медицинский работник.\n\nЯ создаю SKINSTINCT как спокойное пространство, где можно лучше узнать свою кожу. В основе моего подхода корнеотерапия, диагностика и бережное отношение к естественному защитному барьеру кожи.\n\nМне хочется, чтобы после нашей встречи у тебя осталось не только приятное ощущение, но и понимание, как заботиться о коже каждый день.",
  },
  specialistName: "Valērija Razujeva",
  specialistTitle: {
    lv: "Skaistumkopšanas speciāliste kosmetoloģijā",
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
    ru: "SKINSTINCT, студия косметологии в Екабпилсе. Валерия Разуева: корнеотерапия, диагностика и индивидуальный уход за кожей. Онлайн запись.",
  },
  bookingEnabled: true,
  bookingNotice: {
    lv: "Studija top. Izvēlies vēlamo vizītes laiku, un es sazināšos, lai apstiprinātu tikšanos un precizētu adresi. Cenu saskaņosim pirms vizītes.",
    ru: "Студия готовится к открытию. Выбери желаемое время, и я свяжусь с тобой, чтобы подтвердить встречу и уточнить адрес. Стоимость согласуем до визита.",
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
    title: { lv: "Iepazīšanās ar tavu ādu", ru: "Знакомство с твоей кожей" },
    category: { lv: "PIRMĀ VIZĪTE", ru: "ПЕРВЫЙ ВИЗИТ" },
    description: {
      lv: "Saruna par tavas ādas vajadzībām, ikdienas paradumiem un kopšanas mērķiem. Pirmais solis pretī pārdomātai ādas kopšanai.",
      ru: "Поговорим о потребностях твоей кожи, привычках и целях ухода. Первый шаг к понятной системе заботы о себе.",
    },
    duration: 60,
    price: null,
    active: true,
    image: "/images/treatment.webp",
  },
  {
    id: "diagnostics",
    title: { lv: "Ādas diagnostika", ru: "Диагностика кожи" },
    category: { lv: "IZPRATNE", ru: "ПОНИМАНИЕ" },
    description: {
      lv: "Iepazīstam tavas ādas stāvokli un individuālās vajadzības, lai kopšanas izvēles būtu pamatotas un saprotamas.",
      ru: "Изучаем состояние и индивидуальные потребности кожи, чтобы выбор ухода был обоснованным и понятным.",
    },
    duration: 60,
    price: null,
    active: true,
    image: "/images/hero.webp",
  },
  {
    id: "corneotherapy",
    title: { lv: "Korneoterapija", ru: "Корнеотерапия" },
    category: { lv: "LĪDZSVARS", ru: "БАЛАНС" },
    description: {
      lv: "Saudzīga pieeja, kuras uzmanības centrā ir ādas aizsargbarjera. Individuāli izvēlēta kopšana tavas ādas komfortam.",
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
      ru: "Забота, которая остаётся. Знакомься со SKINSTINCT.",
    },
    excerpt: {
      lv: "Par studijas sākumu, vērtībām un manu pieeju apzinātai ādas kopšanai.",
      ru: "О начале студии, ценностях и моём подходе к осознанному уходу за кожей.",
    },
    body: {
      lv: "## Vieta, kur ieklausīties\nSKINSTINCT sākas ar vienkāršu domu: katra āda ir individuāla un ir pelnījusi uzmanīgu attieksmi. Esmu Valērija Razujeva, un šobrīd veidoju savu kosmetoloģijas studiju Jēkabpilī.\n\n## Vispirms izpratne\nPirms kopšanas izvēles es vēlos iepazīt tavu ādu un ikdienas paradumus. Mana profesionālā interese ir korneoterapija un ādas diagnostika.\n\n## Ilgtermiņa attiecības ar savu ādu\nVēlos dalīties zināšanās, kas palīdz orientēties ādas kopšanā arī ārpus studijas. Šeit pamazām stāstīšu par studijas jaunumiem un savu pieeju.\n\nPriecāšos iepazīties. Seko studijas attīstībai Instagram vai atstāj ziņu kontaktformā.",
      ru: "## Место, где тебя услышат\nSKINSTINCT начинается с простой мысли: каждая кожа индивидуальна и заслуживает внимательного отношения. Я Валерия Разуева, и сейчас я создаю свою студию косметологии в Екабпилсе.\n\n## Сначала понимание\nПрежде чем выбирать уход, я хочу познакомиться с твоей кожей и повседневными привычками. Мои профессиональные интересы: корнеотерапия и диагностика кожи.\n\n## Отношения со своей кожей надолго\nМне хочется делиться знаниями, которые помогают ориентироваться в уходе и за пределами студии. Здесь я постепенно буду рассказывать о новостях и своём подходе.\n\nБуду рада знакомству. Следи за развитием студии в Instagram или оставь сообщение через форму на сайте.",
    },
    category: { lv: "STUDIJAS DIENASGRĀMATA", ru: "ДНЕВНИК СТУДИИ" },
    image: "/images/valerija-v2.webp",
    published: true,
    createdAt: "2026-10-17T09:00:00.000Z",
  },
];
