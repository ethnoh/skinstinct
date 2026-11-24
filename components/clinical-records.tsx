"use client";
import { useEffect, useRef, useState } from "react";
import { ClinicalPrintForms } from "./clinical-print-forms";
import { api } from "@/lib/client";
import {
  healthQuestions,
  emptyClientCard,
  emptyClinicalVisit,
  type ClientCard,
  type ClinicalVisit,
  type SavedClient,
  type SavedVisit,
  type ClinicalDocument,
} from "@/lib/clinical-schema";

type ClientListItem = {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  archived: boolean;
  updatedAt: string;
};
type History = {
  revisions: {
    id: string;
    entity_type: string;
    entity_id: string;
    version: number;
    created_at: string;
  }[];
  audit: { action: string; created_at: string }[];
};
type Detail = {
  client: SavedClient;
  visits: SavedVisit[];
  documents: ClinicalDocument[];
  history: History;
};
const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Riga",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const stamp = (value: string) =>
  new Intl.DateTimeFormat("lv-LV", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Riga",
  }).format(new Date(value));
const money = (value: number) =>
  new Intl.NumberFormat("lv-LV", { style: "currency", currency: "EUR" }).format(value);
const errors: Record<string, string> = {
  CLINICAL_LOCKED: "Kartotēka ir aizslēgta. Atver to vēlreiz ar administratora paroli.",
  AUTH_REQUIRED: "Pieslēdzies administrācijai vēlreiz.",
  CLINICAL_CONFLICT:
    "Šis ieraksts jau ir mainīts citā logā. Pārlasi karti pirms izmaiņu saglabāšanas.",
  CLINICAL_NOT_CONFIGURED: "Privātā glabātuve vēl nav sagatavota.",
  INVALID_PASSWORD: "Nepareiza parole.",
  INVALID_DATA: "Pārbaudi obligātos laukus, datumus, e-pastu un skaitļus.",
  INVALID_PDF: "Pievieno PDF failu līdz 10 MB.",
  TOO_LARGE: "Fails ir pārāk liels. Maksimums ir 10 MB.",
  TOO_MANY_REQUESTS: "Pārāk daudz mēģinājumu. Mēģini vēlāk.",
  CORRECTION_REASON_REQUIRED: "Norādi vizītes papildinājuma vai labojuma iemeslu.",
};
function errorText(e: unknown) {
  return (
    errors[e instanceof Error ? e.message : ""] ||
    "Neizdevās izpildīt darbību. Mēģini vēlreiz; ievadītais saturs nav saglabāts."
  );
}
function TextField({
  label,
  value,
  onChange,
  large = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  large?: boolean;
  type?: string;
}) {
  return (
    <label>
      {label}
      {large ? (
        <textarea
          rows={3}
          maxLength={12000}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          maxLength={type === "email" ? 250 : 250}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
function CardFields({ data, change }: { data: ClientCard; change: (value: ClientCard) => void }) {
  const set = (key: keyof ClientCard, value: unknown) => change({ ...data, [key]: value });
  return (
    <>
      <fieldset>
        <legend>Klienta pamatinformācija</legend>
        <div className="clinical-fields">
          <TextField label="Vārds, uzvārds *" value={data.name} onChange={(v) => set("name", v)} />
          <TextField
            label="Dzimšanas datums"
            type="date"
            value={data.birthDate}
            onChange={(v) => set("birthDate", v)}
          />
          <TextField label="Tālrunis" value={data.phone} onChange={(v) => set("phone", v)} />
          <TextField
            label="E-pasts"
            type="email"
            value={data.email}
            onChange={(v) => set("email", v)}
          />
        </div>
        <TextField
          label="Vecāks / likumiskais pārstāvis, saziņa un pārstāvības informācija (ja attiecināms)"
          value={data.guardian}
          large
          onChange={(v) => set("guardian", v)}
        />
        <TextField
          label="Klienta sūdzības, vēlmes un mērķi"
          value={data.concerns}
          large
          onChange={(v) => set("concerns", v)}
        />
      </fieldset>
      <fieldset>
        <legend>Veselības anamnēze</legend>
        <p className="clinical-help">
          Atbildi fiksē pēc sarunas. “Nav noskaidrots” nav tas pats, kas “Nē”. Šī anketa neaizstāj
          konkrētās procedūras un ierīces kontrindikāciju izvērtēšanu.
        </p>
        {healthQuestions.map(([key, label, hint]) => (
          <div className="clinical-question" key={key}>
            <label>
              {label}
              <select
                aria-label={label}
                value={data.health[key].answer}
                onChange={(e) =>
                  set("health", {
                    ...data.health,
                    [key]: { ...data.health[key], answer: e.target.value },
                  })
                }
              >
                <option value="unknown">Nav noskaidrots</option>
                <option value="no">Nē</option>
                <option value="yes">Jā</option>
                <option value="na">Neattiecas</option>
              </select>
            </label>
            <TextField
              label={hint}
              value={data.health[key].details}
              large
              onChange={(v) =>
                set("health", { ...data.health, [key]: { ...data.health[key], details: v } })
              }
            />
          </div>
        ))}
      </fieldset>
      <fieldset>
        <legend>Mājas kopšana</legend>
        <TextField
          label="Rīta kopšana: līdzekļi, lietošanas biežums, SPF"
          value={data.homeMorning}
          large
          onChange={(v) => set("homeMorning", v)}
        />
        <TextField
          label="Vakara kopšana: līdzekļi un aktīvās vielas"
          value={data.homeEvening}
          large
          onChange={(v) => set("homeEvening", v)}
        />
        <TextField
          label="Papildu līdzekļi, pīlingi, maskas, reakcijas un ieradumi"
          value={data.homeOther}
          large
          onChange={(v) => set("homeOther", v)}
        />
      </fieldset>
      <fieldset>
        <legend>Ādas izvērtējums</legend>
        <TextField
          label="Ādas stāvoklis, jutīgums, novērojumi, procedūru zonas"
          value={data.skinAssessment}
          large
          onChange={(v) => set("skinAssessment", v)}
        />
        <label>
          Fototips (ja izvērtēts)
          <select value={data.phototype} onChange={(e) => set("phototype", e.target.value)}>
            <option value="">Nav norādīts</option>
            {["I", "II", "III", "IV", "V", "VI"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>Informēšana un dokumentēšana</legend>
        <div className="clinical-fields">
          <TextField
            label="Datums, kad klients informēts par datu apstrādi"
            type="date"
            value={data.privacyNoticeDate}
            onChange={(v) => set("privacyNoticeDate", v)}
          />
        </div>
        <TextField
          label="Datu apstrādes pamats un saistītā dokumenta atsauce"
          value={data.processingBasis}
          large
          onChange={(v) => set("processingBasis", v)}
        />
        <TextField
          label="Informētā piekrišana, pārstāvja piekrišana, datums un dokumenta atsauce"
          value={data.consentNotes}
          large
          onChange={(v) => set("consentNotes", v)}
        />
        <p className="clinical-help">
          Ieraksts kartē pats par sevi nav klienta paraksts. Saglabā vajadzīgo piekrišanas dokumentu
          PDF sadaļā.
        </p>
        {data.notes && (
          <details>
            <summary>Iepriekš saglabātās piezīmes</summary>
            <TextField
              label="Saglabātās piezīmes"
              value={data.notes}
              large
              onChange={(v) => set("notes", v)}
            />
            <p className="clinical-help">
              Jaunu procedūru pievieno atsevišķajā sadaļā zem anamnēzes.
            </p>
          </details>
        )}
        <label className="clinical-check">
          <input
            type="checkbox"
            checked={data.archived}
            onChange={(e) => set("archived", e.target.checked)}
          />
          Arhivēta karte (vēsture saglabājas)
        </label>
      </fieldset>
    </>
  );
}
function VisitFields({
  data,
  change,
  editing,
}: {
  data: ClinicalVisit;
  change: (value: ClinicalVisit) => void;
  editing: boolean;
}) {
  const set = (key: keyof ClinicalVisit, value: unknown) => change({ ...data, [key]: value });
  return (
    <>
      <div className="clinical-fields">
        <TextField
          label="Vizītes datums *"
          type="date"
          value={data.date}
          onChange={(v) => set("date", v)}
        />
        <TextField label="Procedūra *" value={data.service} onChange={(v) => set("service", v)} />
        <TextField label="Zona" value={data.area} onChange={(v) => set("area", v)} />
        <label>
          Ilgums, min
          <input
            type="number"
            min={0}
            max={600}
            value={data.duration}
            onChange={(e) => set("duration", Number(e.target.value))}
          />
        </label>
      </div>
      <label className="clinical-check">
        <input
          type="checkbox"
          checked={data.healthReviewed}
          onChange={(e) => set("healthReviewed", e.target.checked)}
        />
        Pirms šīs procedūras pārrunātas izmaiņas veselībā un izvērtēta piemērotība
      </label>
      {(
        [
          [
            "healthChanges",
            "Izmaiņas veselībā, medikamentos, sauļošanās un iepriekšējās procedūrās",
          ],
          ["assessment", "Ādas stāvoklis pirms procedūras un novērojumi"],
          ["consentNotes", "Pārrunātais plāns, riski, informētā piekrišana un dokumenta atsauce"],
          ["protocol", "Veiktais protokols: soļi, zonas un norise"],
          [
            "products",
            "Līdzekļi / preparāti: nosaukums, daudzums, partija, derīguma termiņš (ja attiecināms)",
          ],
          ["deviceSettings", "Ierīce, uzgaļi un izmantotie parametri"],
          ["reaction", "Ādas reakcija, panesamība, sarežģījumi un veiktā rīcība"],
          ["aftercare", "Ieteikumi pēc procedūras un mājas kopšana"],
          ["nextPlan", "Turpmākais plāns un nākamā izvērtēšana"],
        ] as const
      ).map(([key, label]) => (
        <TextField key={key} label={label} value={data[key]} large onChange={(v) => set(key, v)} />
      ))}
      <fieldset>
        <legend>Faktiskā cena</legend>
        <label>
          Samaksāts / piemērotā cena, EUR (tukšs = nav norādīts)
          <input
            type="number"
            min={0}
            max={100000}
            step="0.01"
            value={data.price ?? ""}
            onChange={(e) => set("price", e.target.value === "" ? null : Number(e.target.value))}
          />
        </label>
        <TextField
          label="Atlaide, cenas pamatojums vai norēķinu piezīme"
          value={data.discountNotes}
          large
          onChange={(v) => set("discountNotes", v)}
        />
      </fieldset>
      <fieldset>
        <legend>Diagnostikas rādītāji</legend>
        <p className="clinical-help">
          Ievadi aparāta vērtību, mērvienību, zonu un ierīci. Salīdzinājumā atšķirīgas mērvienības
          vai ierīces tiek nodalītas.
        </p>
        {data.metrics.map((metric, index) => (
          <div className="clinical-metric" key={index}>
            {(["name", "value", "unit", "area", "device", "conditions"] as const).map((key) => (
              <label key={key}>
                {
                  {
                    name: "Rādītājs *",
                    value: "Vērtība *",
                    unit: "Mērvienība / skala",
                    area: "Mērījuma zona",
                    device: "Ierīce / modelis",
                    conditions: "Apstākļi / piezīme",
                  }[key]
                }
                <input
                  type={key === "value" ? "number" : "text"}
                  step={key === "value" ? "any" : undefined}
                  required={key === "value" || key === "name"}
                  value={key === "value" && !Number.isFinite(metric.value) ? "" : metric[key]}
                  onChange={(e) =>
                    set(
                      "metrics",
                      data.metrics.map((m, i) =>
                        i === index
                          ? {
                              ...m,
                              [key]:
                                key === "value"
                                  ? e.target.value === ""
                                    ? Number.NaN
                                    : Number(e.target.value)
                                  : e.target.value,
                            }
                          : m,
                      ),
                    )
                  }
                />
              </label>
            ))}
            <button
              type="button"
              className="button button-outline button-small"
              onClick={() =>
                set(
                  "metrics",
                  data.metrics.filter((_, i) => i !== index),
                )
              }
            >
              Noņemt rādītāju
            </button>
          </div>
        ))}
        <button
          type="button"
          className="button button-outline button-small"
          disabled={data.metrics.length >= 60}
          onClick={() =>
            set("metrics", [
              ...data.metrics,
              { name: "", value: Number.NaN, unit: "", area: "", device: "", conditions: "" },
            ])
          }
        >
          Pievienot rādītāju
        </button>
      </fieldset>
      {editing && (
        <TextField
          label="Papildinājuma vai labojuma iemesls *"
          value={data.correctionReason}
          onChange={(v) => set("correctionReason", v)}
        />
      )}
    </>
  );
}
function Comparison({ visits }: { visits: SavedVisit[] }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const displayed = visits.filter((v) => chosen.includes(v.id));
  const keys = [
    ...new Set(
      displayed.flatMap((v) =>
        v.data.metrics.map((m) =>
          JSON.stringify([
            m.name.trim().toLocaleLowerCase(),
            m.unit.trim().toLocaleLowerCase(),
            m.area.trim().toLocaleLowerCase(),
            m.device.trim().toLocaleLowerCase(),
          ]),
        ),
      ),
    ),
  ];
  return (
    <div>
      <h3>Diagnostikas salīdzinājums</h3>
      <p>
        Izvēlies līdz četrām vizītēm. Vērtības netiek automātiski interpretētas kā diagnoze vai
        izmaiņu cēlonis.
      </p>
      <div className="clinical-visit-choices">
        {visits
          .filter((v) => v.data.metrics.length)
          .map((v) => (
            <label className="clinical-check" key={v.id}>
              <input
                type="checkbox"
                checked={chosen.includes(v.id)}
                disabled={!chosen.includes(v.id) && chosen.length >= 4}
                onChange={(e) =>
                  setChosen(
                    e.target.checked ? [...chosen, v.id] : chosen.filter((id) => id !== v.id),
                  )
                }
              />
              {v.data.date} · {v.data.service}
            </label>
          ))}
      </div>
      {keys.length ? (
        <div className="clinical-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Rādītājs · mērvienība · zona · ierīce</th>
                {displayed.map((v) => (
                  <th key={v.id}>
                    {v.data.date}
                    <br />
                    {v.data.service}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key}>
                  <th>
                    {(JSON.parse(key) as string[]).map((v) => v || "nav norādīts").join(" · ")}
                  </th>
                  {displayed.map((v) => (
                    <td key={v.id}>
                      {v.data.metrics
                        .filter(
                          (m) =>
                            JSON.stringify([
                              m.name.trim().toLocaleLowerCase(),
                              m.unit.trim().toLocaleLowerCase(),
                              m.area.trim().toLocaleLowerCase(),
                              m.device.trim().toLocaleLowerCase(),
                            ]) === key,
                        )
                        .map((m, i) => (
                          <div key={i}>
                            {m.value}
                            {m.conditions && <small> · {m.conditions}</small>}
                          </div>
                        ))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="clinical-help">
          Pievieno rādītājus vizīšu ierakstos un izvēlies vizītes salīdzināšanai.
        </p>
      )}
    </div>
  );
}
const fieldLabels: Record<string, string> = {
  anamnesisSnapshot: "Anamnēze procedūras ieraksta izveides brīdī",
  name: "Vārds, uzvārds",
  birthDate: "Dzimšanas datums",
  phone: "Tālrunis",
  email: "E-pasts",
  guardian: "Pārstāvis",
  concerns: "Vēlmes",
  health: "Veselības anamnēze",
  homeMorning: "Rīta kopšana",
  homeEvening: "Vakara kopšana",
  homeOther: "Papildu kopšana",
  skinAssessment: "Ādas izvērtējums",
  phototype: "Fototips",
  privacyNoticeDate: "Informēšanas datums",
  processingBasis: "Apstrādes pamats",
  consentNotes: "Piekrišanas piezīmes",
  reviewDate: "Pārskatīšanas datums",
  notes: "Piezīmes",
  archived: "Arhivēta",
  date: "Datums",
  service: "Procedūra",
  area: "Zona",
  duration: "Ilgums",
  healthReviewed: "Veselība pārskatīta",
  healthChanges: "Izmaiņas veselībā",
  assessment: "Novērojumi",
  protocol: "Protokols",
  products: "Līdzekļi",
  deviceSettings: "Ierīces parametri",
  reaction: "Reakcija",
  aftercare: "Pēcaprūpe",
  nextPlan: "Plāns",
  price: "Cena",
  discountNotes: "Cenas piezīmes",
  metrics: "Rādītāji",
  correctionReason: "Labojuma iemesls",
  answer: "Atbilde",
  details: "Papildinājums",
  value: "Vērtība",
  unit: "Mērvienība",
  device: "Ierīce",
  conditions: "Apstākļi",
  ...Object.fromEntries(healthQuestions.map(([key, label]) => [key, label])),
};
function Snapshot({ value }: { value: unknown }) {
  if (value === null || value === "") return <span>Nav norādīts</span>;
  if (typeof value === "boolean") return <span>{value ? "Jā" : "Nē"}</span>;
  if (Array.isArray(value))
    return (
      <div>
        {value.map((v, i) => (
          <Snapshot value={v} key={i} />
        ))}
      </div>
    );
  if (typeof value === "object")
    return (
      <dl className="clinical-snapshot">
        {Object.entries(value as Record<string, unknown>).map(([key, v]) => (
          <div key={key}>
            <dt>{fieldLabels[key] || key}</dt>
            <dd>
              <Snapshot value={v} />
            </dd>
          </div>
        ))}
      </dl>
    );
  return (
    <span>
      {(
        { yes: "Jā", no: "Nē", unknown: "Nav noskaidrots", na: "Neattiecas" } as Record<
          string,
          string
        >
      )[String(value)] || String(value)}
    </span>
  );
}
function Workspace({
  expired,
  onDirtyChange,
}: {
  expired: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [clients, setClients] = useState<ClientListItem[]>([]),
    [filter, setFilter] = useState(""),
    [showArchived, setShowArchived] = useState(false),
    [detail, setDetail] = useState<Detail | null>(null),
    [draft, setDraft] = useState<ClientCard | null>(null),
    [mode, setMode] = useState<"card" | "visits" | "documents" | "compare" | "history" | "forms">(
      "card",
    );
  const [visit, setVisit] = useState<ClinicalVisit | null>(null),
    [visitId, setVisitId] = useState<string | null>(null),
    [visitVersion, setVisitVersion] = useState(0),
    [pending, setPending] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false),
    [documentVisit, setDocumentVisit] = useState(""),
    [snapshot, setSnapshot] = useState<unknown>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const canLeave = () =>
    !dirty || window.confirm("Ir nesaglabātas izmaiņas. Vai turpināt un tās atmest?");
  function handleError(e: unknown) {
    if (e instanceof Error && ["CLINICAL_LOCKED", "AUTH_REQUIRED"].includes(e.message)) {
      expired();
      return;
    }
    setError(errorText(e));
  }
  async function refresh() {
    const result = await api<{ clients: ClientListItem[] }>("/api/clinical/clients");
    if (alive.current) setClients(result.clients);
  }
  useEffect(() => {
    refresh().catch(handleError);
  }, []); // No health records are stored in browser storage.
  async function open(id: string, ask = true) {
    if (ask && !canLeave()) return;
    setPending(true);
    setError("");
    try {
      const d = await api<Detail>("/api/clinical/clients/" + id);
      if (!alive.current) return;
      setDetail(d);
      setDraft(d.client.data);
      setVisit(null);
      setMode("card");
      setDirty(false);
      setSnapshot(null);
    } catch (e) {
      handleError(e);
    } finally {
      setPending(false);
    }
  }
  async function saveCard() {
    if (!draft) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const result = await api<{ client: SavedClient }>("/api/clinical/clients", {
        id: detail?.client.id || null,
        version: detail?.client.version || 0,
        data: draft,
      });
      if (!alive.current) return;
      await open(result.client.id, false);
      await refresh();
      setMessage("Klienta karte saglabāta.");
      setDirty(false);
      return result.client;
    } catch (e) {
      handleError(e);
    } finally {
      setPending(false);
    }
  }
  async function saveVisit() {
    if (!visit || !detail) return;
    setPending(true);
    setError("");
    setMessage("");
    try {
      await api("/api/clinical/clients/" + detail.client.id + "/visits", {
        id: visitId,
        version: visitVersion,
        data: visit,
      });
      const d = await api<Detail>("/api/clinical/clients/" + detail.client.id);
      if (!alive.current) return;
      setDetail(d);
      setVisit(null);
      setDirty(false);
      setMessage("Procedūras ieraksts saglabāts.");
    } catch (e) {
      handleError(e);
    } finally {
      setPending(false);
    }
  }
  async function beginVisit() {
    if (visit && !canLeave()) return;
    if (!visit && mode === "card" && (!detail || dirty)) {
      if (!(await saveCard())) return;
    } else if (!visit && !canLeave()) return;
    setVisit(emptyClinicalVisit(today()));
    setVisitId(null);
    setVisitVersion(0);
    setDirty(false);
    setMessage("");
    setError("");
    requestAnimationFrame(() =>
      document
        .querySelector(".clinical-today-procedure")
        ?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }
  function editVisit(record: SavedVisit) {
    if (!canLeave()) return;
    setDraft(detail?.client.data || draft);
    setMode("visits");
    setVisit({ ...record.data, correctionReason: "" });
    setVisitId(record.id);
    setVisitVersion(record.version);
    setDirty(false);
    setMessage("");
  }
  function visitEditor() {
    if (!visit || !detail) return null;
    return (
      <form
        className="clinical-form"
        onSubmit={(e) => {
          e.preventDefault();
          saveVisit();
        }}
      >
        <h4>{visitId ? "Papildināt procedūras ierakstu" : "Jauna procedūra"}</h4>
        <fieldset disabled={pending}>
          <VisitFields
            data={visit}
            change={(v) => {
              setVisit(v);
              setDirty(true);
            }}
            editing={!!visitId}
          />
        </fieldset>
        <div className="clinical-actions">
          <button
            className="button"
            disabled={
              pending ||
              visit.service.trim().length < 2 ||
              (!!visitId && !visit.correctionReason.trim())
            }
          >
            {pending ? "Saglabā…" : "Saglabāt procedūru"}
          </button>
          <button
            type="button"
            className="button button-outline"
            disabled={pending}
            onClick={() => {
              if (canLeave()) {
                setVisit(null);
                setDirty(false);
              }
            }}
          >
            Aizvērt
          </button>
        </div>
      </form>
    );
  }
  function procedureHistory() {
    if (!detail) return null;
    return (
      <div className="clinical-visits">
        {detail.visits.length === 0 ? (
          <p>Procedūru ierakstu vēl nav. Pievieno pirmo procedūru šai klienta kartei.</p>
        ) : (
          detail.visits.map((record) => (
            <details key={record.id}>
              <summary>
                {record.data.date} · {record.data.service} ·{" "}
                {record.data.price === null ? "Cena nav norādīta" : money(record.data.price)}
              </summary>
              <p>
                {record.data.area}
                {record.data.duration ? ` · ${record.data.duration} min` : ""} · versija{" "}
                {record.version}
              </p>
              {!record.data.healthReviewed && (
                <p className="clinical-help">Veselības izmaiņu pārrunāšana nav atzīmēta.</p>
              )}
              <Snapshot value={record.data} />
              <button
                type="button"
                className="button button-outline button-small"
                disabled={pending}
                onClick={() => editVisit(record)}
              >
                Papildināt / labot ierakstu
              </button>
            </details>
          ))
        )}
      </div>
    );
  }
  async function upload(file: File) {
    if (!detail) return;
    setPending(true);
    setError("");
    try {
      if (file.size > 10_000_000) throw Error("TOO_LARGE");
      const url =
        "/api/clinical/clients/" +
        detail.client.id +
        "/documents?name=" +
        encodeURIComponent(file.name) +
        (documentVisit ? "&visit=" + encodeURIComponent(documentVisit) : "");
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: file,
      });
      if (!r.ok) throw Error((await r.json()).error);
      const d = await api<Detail>("/api/clinical/clients/" + detail.client.id);
      if (alive.current) {
        setDetail(d);
        setMessage("PDF saglabāts privātajā kartē.");
      }
    } catch (e) {
      handleError(e);
    } finally {
      setPending(false);
    }
  }
  async function exportData(backup = false) {
    if (!backup && !detail) return;
    setPending(true);
    try {
      let blob: Blob;
      let filename: string;
      if (backup) {
        const r = await fetch("/api/clinical/backup", { cache: "no-store" });
        if (!r.ok) throw Error((await r.json()).error);
        blob = await r.blob();
        filename = "skinstinct-klientu-kartes-sifrets.json";
      } else {
        blob = new Blob(
          [
            JSON.stringify(
              { client: detail!.client, visits: detail!.visits, documents: detail!.documents },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        );
        filename = "skinstinct-klienta-karte.json";
      }
      const url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(
        backup
          ? "Šifrētā rezerves kopija lejupielādēta. Atslēgu glabā atsevišķi."
          : "Karte eksportēta. PDF faili lejupielādējami atsevišķi; eksports satur privātus datus.",
      );
    } catch (e) {
      handleError(e);
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="clinical-workspace">
      <aside className="clinical-sidebar">
        <button
          className="button"
          disabled={pending}
          onClick={() => {
            if (!canLeave()) return;
            setDetail(null);
            setDraft(emptyClientCard());
            setMode("card");
            setVisit(null);
            setDirty(false);
            setError("");
            setMessage("");
          }}
        >
          Jauna klienta karte
        </button>
        <TextField label="Meklēt pēc vārda vai tālruņa" value={filter} onChange={setFilter} />
        <label className="clinical-check">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          Rādīt arī arhivētās
        </label>
        <div className="clinical-client-list">
          {clients
            .filter(
              (c) =>
                (showArchived || !c.archived) &&
                `${c.name} ${c.phone}`.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
            )
            .map((c) => (
              <button
                disabled={pending}
                className={detail?.client.id === c.id ? "active" : ""}
                key={c.id}
                onClick={() => open(c.id)}
              >
                <strong>{c.name}</strong>
                <small>
                  {c.birthDate || "Dzimšanas datums nav norādīts"}
                  {c.archived ? " · Arhivēta" : ""}
                </small>
              </button>
            ))}
        </div>
        <button
          className="button button-outline button-small"
          disabled={pending}
          onClick={() => exportData(true)}
        >
          Lejupielādēt šifrētu rezerves kopiju
        </button>
      </aside>
      <div className="clinical-main">
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="clinical-success">
            {message}
          </p>
        )}
        {!draft ? (
          <div className="clinical-empty">
            <h3>Tava privātā klientu kartotēka</h3>
            <p>
              Izveido pirmreizējo karti vai izvēlies esošu klientu. Anamnēze, procedūras un PDF
              paliek šajā privātajā sadaļā.
            </p>
            <ClinicalPrintForms />
          </div>
        ) : (
          <>
            <div className="clinical-card-heading">
              <div>
                <h3>{detail ? detail.client.data.name : "Jauna klienta karte"}</h3>
                {detail && (
                  <small>
                    Pēdējās izmaiņas: {stamp(detail.client.updatedAt)} · versija{" "}
                    {detail.client.version}
                  </small>
                )}
              </div>
              {detail && (
                <button
                  type="button"
                  className="button button-outline button-small"
                  disabled={pending}
                  onClick={() => exportData()}
                >
                  Eksportēt šo karti
                </button>
              )}
            </div>
            <nav className="clinical-tabs" aria-label="Klienta kartes sadaļas">
              {(
                [
                  ["card", "Anamnēze"],
                  ["visits", "Procedūras"],
                  ["documents", "PDF faili"],
                  ["compare", "Salīdzinājums"],
                  ["history", "Izmaiņu vēsture"],
                  ["forms", "Drukāt dokumentus"],
                ] as const
              ).map(([key, label]) => (
                <button
                  disabled={pending || (!detail && key !== "card")}
                  aria-pressed={mode === key}
                  key={key}
                  onClick={() => {
                    if (!canLeave()) return;
                    setMode(key);
                    setDraft(detail?.client.data || draft);
                    setVisit(null);
                    setDirty(false);
                    setSnapshot(null);
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>
            {mode === "card" && (
              <>
                <div className="clinical-card-anamnesis">
                  <form
                    className="clinical-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveCard();
                    }}
                  >
                    <fieldset disabled={pending || !!visit}>
                      <CardFields
                        data={draft}
                        change={(v) => {
                          setDraft(v);
                          setDirty(true);
                        }}
                      />
                    </fieldset>
                    <button
                      className="button"
                      disabled={pending || !!visit || draft.name.trim().length < 2}
                    >
                      {pending ? "Saglabā…" : "Saglabāt anamnēzes karti"}
                      {dirty ? " *" : ""}
                    </button>
                  </form>
                </div>
                <section className="clinical-today-procedure">
                  <h3>Šodien veiktā procedūra</h3>
                  <p className="clinical-help">
                    Katrai vizītei pievieno jaunu ierakstu. Tas saglabāsies šajā pašā klienta kartē
                    kopā ar anamnēzi un agrākajām procedūrām.
                  </p>
                  <button type="button" className="button" disabled={pending} onClick={beginVisit}>
                    {!detail || (dirty && !visit)
                      ? "Saglabāt anamnēzi un pievienot procedūru"
                      : "Pievienot šodienas procedūru"}
                  </button>
                  {visitEditor()}
                  <h4>Veikto procedūru vēsture {detail ? `(${detail.visits.length})` : ""}</h4>
                  {procedureHistory()}
                </section>
              </>
            )}
            {mode === "visits" && detail && (
              <>
                <h3>Veikto procedūru vēsture</h3>
                <button type="button" className="button" disabled={pending} onClick={beginVisit}>
                  Pievienot procedūru
                </button>
                {visit ? visitEditor() : procedureHistory()}
              </>
            )}
            {mode === "documents" && detail && (
              <div className="clinical-form">
                <h4>Diagnostikas un citi PDF dokumenti</h4>
                <label>
                  Saistīt ar procedūru
                  <select value={documentVisit} onChange={(e) => setDocumentVisit(e.target.value)}>
                    <option value="">Klienta karte kopumā</option>
                    {detail.visits.map((v) => (
                      <option value={v.id} key={v.id}>
                        {v.data.date} · {v.data.service}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Pievienot PDF (līdz 10 MB)
                  <input
                    disabled={pending}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) upload(e.target.files[0]);
                      e.target.value = "";
                    }}
                  />
                </label>
                <p className="clinical-help">
                  PDF netiek publicēts un netiek atvērts mājaslapas skatītājā. Tas lejupielādējams
                  tikai pēc autorizācijas.
                </p>
                <ul className="clinical-documents">
                  {detail.documents.map((d) => (
                    <li key={d.id}>
                      <a href={"/api/clinical/clients/" + detail.client.id + "/documents/" + d.id}>
                        {d.name}
                      </a>
                      <small>
                        {stamp(d.date)} · {(d.size / 1000).toFixed(0)} KB
                        {d.visitId
                          ? " · " +
                            (detail.visits.find((v) => v.id === d.visitId)?.data.service ||
                              "Procedūra")
                          : ""}
                      </small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {mode === "compare" && detail && <Comparison visits={detail.visits} />}
            {mode === "forms" && detail && (
              <ClinicalPrintForms client={detail.client} visits={detail.visits} />
            )}
            {mode === "history" && detail && (
              <div>
                <h4>Iepriekšējās versijas</h4>
                <p>
                  Labojumi nepārraksta iepriekš saglabāto versiju. Pie katras procedūras
                  papildinājuma norādi tā iemeslu.
                </p>
                {detail.history.revisions.map((r) => (
                  <div className="clinical-history-row" key={r.id}>
                    <span>
                      {r.entity_type === "client" ? "Anamnēze" : "Procedūra"} · versija {r.version}{" "}
                      · {stamp(r.created_at)}
                    </span>
                    <button
                      className="button button-outline button-small"
                      onClick={async () => {
                        try {
                          const result = await api<{ data: unknown }>(
                            "/api/clinical/clients/" + detail.client.id + "/revisions/" + r.id,
                          );
                          if (alive.current) setSnapshot(result.data);
                        } catch (e) {
                          handleError(e);
                        }
                      }}
                    >
                      Skatīt
                    </button>
                  </div>
                ))}
                {snapshot !== null && (
                  <details open>
                    <summary>Saglabātā iepriekšējā versija</summary>
                    <Snapshot value={snapshot} />
                  </details>
                )}
                <h4>Darbību žurnāls</h4>
                {detail.history.audit.map((a, i) => (
                  <p key={i}>
                    {stamp(a.created_at)} ·{" "}
                    {(
                      {
                        "client.create": "Izveidota karte",
                        "client.update": "Labota karte",
                        "client.read": "Atvērta karte",
                        "visit.create": "Pievienota procedūra",
                        "visit.update": "Papildināta procedūra",
                        "document.upload": "Pievienots PDF",
                        "document.download": "Lejupielādēts PDF",
                        "revision.read": "Skatīta iepriekšējā versija",
                      } as Record<string, string>
                    )[a.action] || "Darbība ar karti"}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
export function ClinicalRecords({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [expiresAt, setExpiresAt] = useState<number | null>(null),
    [configured, setConfigured] = useState<boolean | null>(null),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false),
    [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let alive = true;
    api<{ configured: boolean; unlocked: boolean; expiresAt: number | null }>(
      "/api/clinical/status",
    )
      .then((s) => {
        if (alive) {
          setConfigured(s.configured);
          setExpiresAt(s.unlocked ? s.expiresAt : null);
        }
      })
      .catch((e) => {
        if (alive) setError(errorText(e));
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setSeconds(remaining);
      if (!remaining) {
        setExpiresAt(null);
        setError("Kartotēka automātiski aizslēgta. Lai turpinātu, ievadi paroli vēlreiz.");
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);
  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    try {
      const s = await api<{ expiresAt: number }>("/api/clinical/unlock", { password });
      setPassword("");
      setExpiresAt(s.expiresAt);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setPending(false);
    }
  }
  async function lock() {
    if (!window.confirm("Aizslēgt kartotēku? Nesaglabātās izmaiņas tiks atmestas.")) return;
    setExpiresAt(null);
    try {
      await api("/api/clinical/lock", {});
    } catch (e) {
      setError(errorText(e));
    }
  }
  return (
    <section className="clinical-section">
      <div className="clinical-title">
        <div>
          <span className="eyebrow">PRIVĀTI / TIKAI ADMINISTRATOREI</span>
          <h2>Klientu kartes</h2>
        </div>
        {expiresAt && (
          <div>
            <small>
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} līdz aizslēgšanai
            </small>
            <button className="button button-outline button-small" onClick={lock}>
              Aizslēgt kartotēku
            </button>
          </div>
        )}
      </div>
      {expiresAt && seconds < 120 && (
        <p role="alert" className="clinical-help">
          Kartotēka drīz aizslēgsies. Saglabā izmaiņas.
        </p>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!expiresAt ? (
        <div className="clinical-unlock">
          <p>
            Anamnēzes, procedūras un diagnostikas dokumenti ir privāti. Lai atvērtu kartotēku uz 30
            minūtēm, atkārtoti ievadi administratora paroli.
          </p>
          {configured === false ? (
            <p>Privātā glabātuve vēl nav sagatavota. Šeit pagaidām neievadi klientu datus.</p>
          ) : (
            <form className="form" onSubmit={unlock}>
              <label>
                Administratora parole
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  maxLength={200}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button className="button" disabled={pending || configured === null}>
                {pending ? "Atver…" : "Atvērt klientu kartes"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <Workspace
          key={expiresAt}
          expired={() => setExpiresAt(null)}
          onDirtyChange={onDirtyChange}
        />
      )}
    </section>
  );
}
