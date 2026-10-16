import Link from "next/link";
import type { Lang, SiteSettings } from "@/lib/types";
import { basePath } from "@/lib/client";
import { tr } from "@/lib/i18n";

export function Privacy({ lang, settings: s }: { lang: Lang; settings: SiteSettings }) {
  const ru = lang === "ru";
  const sections = ru
    ? [
        [
          "Кто обрабатывает данные",
          `${s.legalName || "SKINSTINCT"}, ${s.city}, Латвия.${s.legalRegistration ? ` Регистрационный номер: ${s.legalRegistration}.` : ""}${s.legalAddress ? ` Юридический адрес: ${s.legalAddress}.` : ""} По вопросам данных можно обратиться ${s.privacyEmail || s.email ? `по почте ${s.privacyEmail || s.email}` : "в официальный Instagram @vr_skinstinct"}. Медицинский специалист: ${s.specialistName}, регистрационный номер ${s.registration}.`,
        ],
        [
          "Какие данные и зачем",
          "При записи или обращении мы сохраняем имя, телефон и/или электронную почту, выбранную услугу, дату и время, статус записи и текст сообщения, если ты его добавишь. Эти данные нужны, чтобы обработать запрос, организовать визит и связаться с тобой. Не отправляй через сайт медицинские документы и сведения о здоровье.",
        ],
        [
          "Основание обработки",
          "Обрабатываем данные для действий по твоему запросу до оказания услуги и организации записи (статья 6(1)(b) GDPR). Необходимые средства защиты сайта и ограничения частоты запросов применяются на основе законного интереса к безопасности (статья 6(1)(f)). Отдельного согласия на рекламу мы не запрашиваем и не используем эти формы для рекламных рассылок.",
        ],
        [
          "Срок хранения",
          "Данные записи хранятся до 12 месяцев после даты визита. Обращения через контактную форму хранятся до 6 месяцев. После этого они автоматически удаляются при очередной обработке запроса сайтом. Администраторские сеансы действуют 12 часов. Для защиты от злоупотреблений временный хеш сетевого адреса хранится до 30 минут. Данные, требуемые по закону для оказания услуг или учёта, при необходимости оформляются отдельно от этого сайта.",
        ],
        [
          "Кому доступны данные",
          "К записям и сообщениям имеет доступ уполномоченный администратор SKINSTINCT. Технический хостинг предоставляет Railway. Изображения и шрифты размещены на самом сайте. Google Calendar, автоматическая отправка почты и SMS пока не подключены. Мы не передаём данные рекламным платформам. При добавлении других обработчиков эта политика будет обновлена.",
        ],
        [
          "Хостинг и передача данных",
          "Сайт использует инфраструктуру Railway. Техническая обработка и поддержка хостинга могут затрагивать поставщиков вне ЕЭЗ и регулируются договорными условиями провайдера и применимыми механизмами защиты данных. При переходе по внешним ссылкам на Instagram или B41 действуют политики соответствующих сайтов.",
        ],
        [
          "Твои права",
          "Ты можешь запросить доступ, исправление, удаление, ограничение обработки или перенос своих данных, а также возразить против обработки на основании законного интереса. Напиши нам по контакту, указанному выше. Для защиты твоей приватности мы можем попросить подтвердить, что запись принадлежит тебе. Можно подать жалобу в Datu valsts inspekcija (dvi.gov.lv). Автоматических решений, имеющих юридические последствия, и профилирования на сайте нет.",
        ],
        [
          "Cookies и локальное хранилище",
          "Cookie sk_client обеспечивает доступ к твоим записям в этом браузере и действует до 12 месяцев. Cookie sk_admin используется только для входа администратора и действует 12 часов. Оба защищены HttpOnly и SameSite, а при HTTPS также Secure. Выбор в уведомлении о cookies хранится локально в браузере 12 месяцев. Выбор светлой или тёмной темы хранится в браузере до её изменения или очистки данных. Аналитические и рекламные cookies не используются. Удаление cookies уберёт доступ к записям в этом браузере; восстановить отдельную запись можно по её коду и своему контакту.",
        ],
        [
          "Изменения и связь",
          "Актуальная версия политики опубликована на этой странице. Если изменятся способы обработки, интеграции или контакты, информация будет обновлена. Для вопросов о записи или данных воспользуйся официальным Instagram студии или указанным выше контактом.",
        ],
      ]
    : lang === "en"
      ? [
          [
            "Who processes your data",
            `${s.legalName || "SKINSTINCT"}, ${s.city}, Latvia.${s.legalRegistration ? ` Registration number: ${s.legalRegistration}.` : ""}${s.legalAddress ? ` Registered address: ${s.legalAddress}.` : ""} For data enquiries, contact ${s.privacyEmail || s.email ? `us at ${s.privacyEmail || s.email}` : "the official Instagram account @vr_skinstinct"}. Specialist: ${s.specialistName}, healthcare practitioner registration number ${s.registration}.`,
          ],
          [
            "What we collect and why",
            "When you request an appointment or send a message, we store your name, phone and/or email, chosen service, date and time, appointment status and any message you add. We need this information to handle your request, arrange your visit and contact you. Do not send medical documents or sensitive health information through this website.",
          ],
          [
            "Legal basis",
            "We process data to take steps at your request before providing a service and to arrange appointments (GDPR Article 6(1)(b)). Website security and request rate limits rely on our legitimate interest in keeping the website secure (Article 6(1)(f)). These forms are not used for advertising messages.",
          ],
          [
            "How long we keep data",
            "Appointment data is kept for up to 12 months after the appointment date. Contact form messages are kept for up to 6 months. Expired data is automatically deleted when the website next handles a request. Administrator sessions last 12 hours. A temporary hash of the network address is kept for up to 30 minutes to prevent abuse. Data legally required for providing services or accounting is handled separately from this website where necessary.",
          ],
          [
            "Who can access data",
            "An authorised SKINSTINCT administrator can access appointments and messages. Railway provides technical hosting. Images and fonts are hosted on this website. Google Calendar, automatic email and SMS delivery are not connected yet. We do not share data with advertising platforms. This policy will be updated if other processors are added.",
          ],
          [
            "Hosting and data transfers",
            "This website uses Railway infrastructure. Technical processing and hosting support may involve suppliers outside the EEA and are subject to the provider's contractual terms and applicable data protection safeguards. External links to Instagram or B41 are covered by those websites' own policies.",
          ],
          [
            "Your rights",
            "You can request access, correction, deletion, restriction or portability of your data, and object to processing based on legitimate interests. Use the contact above. To protect your privacy, we may ask you to verify that an appointment belongs to you. You can lodge a complaint with Latvia's Data State Inspectorate (dvi.gov.lv). This website does not use profiling or automated decisions with legal effects.",
          ],
          [
            "Cookies and local storage",
            "The sk_client cookie provides access to your appointments in this browser for up to 12 months. The sk_admin cookie is only used for administrator sign-in and lasts 12 hours. Both use HttpOnly and SameSite protection, plus Secure over HTTPS. Your cookie notice choice is stored locally for 12 months. Your light or dark theme preference is stored locally until you change it or clear browser data. We do not use analytics or advertising cookies. Deleting cookies removes access to appointments in this browser; you can recover an individual appointment with its code and your contact details.",
          ],
          [
            "Updates and contact",
            "The current policy is published on this page. We will update it when processing, integrations or contacts change. For questions about appointments or personal data, use the studio's official Instagram or the contact above.",
          ],
        ]
      : [
          [
            "Kas apstrādā datus",
            `${s.legalName || "SKINSTINCT"}, ${s.city}, Latvija.${s.legalRegistration ? ` Reģistrācijas numurs: ${s.legalRegistration}.` : ""}${s.legalAddress ? ` Juridiskā adrese: ${s.legalAddress}.` : ""} Par datiem sazinies ${s.privacyEmail || s.email ? `pa e-pastu ${s.privacyEmail || s.email}` : "oficiālajā Instagram profilā @vr_skinstinct"}. Speciāliste: ${s.specialistName}, ārstniecības personas reģistrācijas numurs ${s.registration}.`,
          ],
          [
            "Kādus datus un kāpēc",
            "Piesakoties vizītei vai nosūtot ziņu, saglabājam vārdu, tālruni un/vai e-pastu, izvēlēto pakalpojumu, datumu, laiku, pieraksta statusu un ziņas tekstu, ja to pievieno. Dati nepieciešami, lai apstrādātu tavu pieprasījumu, organizētu vizīti un sazinātos ar tevi. Nesūti medicīniskos dokumentus vai sensitīvas ziņas par veselību.",
          ],
          [
            "Apstrādes pamats",
            "Datus apstrādājam, lai pēc tava pieprasījuma veiktu darbības pirms pakalpojuma sniegšanas un organizētu pierakstu (VDAR 6. panta 1. punkta b) apakšpunkts). Vietnes drošībai un pieprasījumu biežuma ierobežošanai izmantojam leģitīmo interesi par drošu vietnes darbību (6. panta 1. punkta f) apakšpunkts). Šīs formas netiek izmantotas reklāmas sūtījumiem.",
          ],
          [
            "Glabāšanas ilgums",
            "Pieraksta dati tiek glabāti līdz 12 mēnešiem pēc vizītes datuma. Kontaktformas ziņas glabājam līdz 6 mēnešiem. Pēc šī termiņa tie automātiski tiek dzēsti nākamajā vietnes pieprasījuma apstrādē. Administratora sesijas ilgst 12 stundas. Ļaunprātīgas lietošanas novēršanai tīkla adreses īslaicīgs hešs tiek glabāts līdz 30 minūtēm. Pakalpojuma sniegšanai vai uzskaitei juridiski nepieciešamie dati vajadzības gadījumā tiek noformēti atsevišķi no šīs vietnes.",
          ],
          [
            "Kam dati pieejami",
            "Pierakstiem un ziņām piekļūst pilnvarots SKINSTINCT administrators. Tehnisko mitināšanu nodrošina Railway. Attēli un fonti atrodas šajā vietnē. Google Calendar, automātiska e-pastu un SMS sūtīšana šobrīd nav pieslēgti. Datus nenododam reklāmas platformām. Pievienojot citus apstrādātājus, politiku atjaunināsim.",
          ],
          [
            "Mitināšana un datu nosūtīšana",
            "Vietne izmanto Railway infrastruktūru. Tehniskā apstrāde un mitināšanas atbalsts var iesaistīt piegādātājus ārpus EEZ, un uz to attiecas pakalpojumu sniedzēja līguma noteikumi un piemērojamie datu aizsardzības mehānismi. Atverot ārējās saites uz Instagram vai B41, piemērojamas attiecīgo vietņu politikas.",
          ],
          [
            "Tavas tiesības",
            "Vari pieprasīt piekļuvi saviem datiem, to labošanu, dzēšanu, apstrādes ierobežošanu vai pārnesamību un iebilst pret apstrādi, kas balstīta leģitīmajās interesēs. Raksti, izmantojot iepriekš norādīto kontaktu. Privātuma aizsardzībai varam lūgt apliecināt pieraksta piederību. Vari iesniegt sūdzību Datu valsts inspekcijā (dvi.gov.lv). Vietnē nav profilēšanas vai automatizētu lēmumu ar juridiskām sekām.",
          ],
          [
            "Sīkdatnes un lokālā glabāšana",
            "Sīkdatne sk_client nodrošina piekļuvi taviem pierakstiem šajā pārlūkā un ir derīga līdz 12 mēnešiem. Sīkdatne sk_admin paredzēta tikai administratora ieejai un ilgst 12 stundas. Abas ir aizsargātas ar HttpOnly un SameSite, un HTTPS savienojumā arī Secure. Sīkdatņu paziņojuma izvēle tiek glabāta pārlūkā 12 mēnešus. Gaišās vai tumšās tēmas izvēle tiek glabāta pārlūkā, līdz to maini vai dzēs pārlūka datus. Analītikas un reklāmas sīkdatnes neizmantojam. Dzēšot sīkdatnes, pazūd piekļuve pierakstiem šajā pārlūkā; atsevišķu pierakstu var atrast ar kodu un savu kontaktu.",
          ],
          [
            "Izmaiņas un saziņa",
            "Aktuālā politikas versija atrodas šajā lapā. Mainoties apstrādei, integrācijām vai kontaktiem, informāciju atjaunināsim. Jautājumos par pierakstu vai datiem izmanto studijas oficiālo Instagram vai iepriekš norādīto kontaktu.",
          ],
        ];
  return (
    <main className="container inner-page legal-page" id="main-content">
      <span className="eyebrow">SKINSTINCT / {tr(lang, "TAVI DATI", "ТВОИ ДАННЫЕ")}</span>
      <h1>{tr(lang, "Privātuma politika", "Политика конфиденциальности")}</h1>
      <p className="legal-date">{tr(lang, "Atjaunināta", "Обновлено")}: 17.10.2026</p>
      {sections.map(([title, body], i) => (
        <section key={title}>
          <h2>
            {i + 1}. {title}
          </h2>
          <p>{body}</p>
        </section>
      ))}
      <p>
        <a href={s.instagram} target="_blank" rel="noopener noreferrer">
          Instagram @vr_skinstinct
        </a>{" "}
        ·{" "}
        <a href="https://www.dvi.gov.lv" target="_blank" rel="noopener noreferrer">
          Datu valsts inspekcija
        </a>
      </p>
      <Link href={basePath(lang) || "/"}>
        {tr(lang, "Atgriezties vietnē", "Вернуться на сайт")}
      </Link>
    </main>
  );
}
