"use client";
import { useEffect, useState } from "react";
import type { SavedClient, SavedVisit } from "@/lib/clinical-schema";
import { renderClinicalForms } from "@/lib/clinical-forms";
export function ClinicalPrintForms({
  client,
  visits = [],
}: {
  client?: SavedClient;
  visits?: SavedVisit[];
}) {
  useEffect(() => () => {
    document.querySelectorAll('iframe[data-skinstinct-clinical-print]').forEach(frame => frame.remove());
  }, []);
  const [fill, setFill] = useState(false),
    [visit, setVisit] = useState(""),
    [section, setSection] = useState<"all" | "base" | "visit" | "aftercare">("all"),
    [printing, setPrinting] = useState(false),
    [error, setError] = useState("");
  async function printDocument(action: "print" | "download") {
    if (action === "download") {
      const html = renderClinicalForms({
        client: fill ? client?.data : undefined,
        visit: fill ? visits.find((v) => v.id === visit)?.data : undefined,
        section,
      });
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "SKINSTINCT-klienta-dokumenti.html";
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }
    setPrinting(true);
    setError("");
    const frame = document.createElement("iframe");
    frame.dataset.skinstinctClinicalPrint = 'true';
    frame.title = "SKINSTINCT dokumentu druka";
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:800px;height:1000px;border:0";
    frame.srcdoc = renderClinicalForms({
      client: fill ? client?.data : undefined,
      visit: fill ? visits.find((v) => v.id === visit)?.data : undefined,
      section,
    });
    frame.onload = async () => {
      try {
        await frame.contentDocument?.fonts.ready;
        if (frame.contentDocument) {
          frame.contentDocument.title = "SKINSTINCT klienta dokumenti";
        }
        frame.contentWindow?.addEventListener(
          "afterprint",
          () => {
            frame.remove();
            setPrinting(false);
          },
          { once: true },
        );
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
        setPrinting(false);
      } catch {
        setError("Neizdevās atvērt drukāšanu. Mēģini vēlreiz.");
        frame.remove();
        setPrinting(false);
      }
    };
    document.body.append(frame);
  }
  return (
    <div className="clinical-form">
      <h3>Izdrukājamie klienta dokumenti</h3>
      <label>
        Ko drukāt
        <select value={section} onChange={(e) => setSection(e.target.value as typeof section)}>
          <option value="all">Pilns komplekts</option>
          <option value="base">Pamatvienošanās un pirmreizējā anketa</option>
          <option value="visit">Metožu informācija un vizītes piekrišana</option>
          <option value="aftercare">Pēckopšanas lapa klientam</option>
        </select>
      </label>
      <label className="clinical-check">
        <input
          type="checkbox"
          disabled={!client}
          checked={fill}
          onChange={(e) => setFill(e.target.checked)}
        />
        Aizpildīt ar šī klienta saglabātajiem datiem
      </label>
      {fill && (
        <label>
          Procedūra (ja jau izveidots ieraksts)
          <select value={visit} onChange={(e) => setVisit(e.target.value)}>
            <option value="">Atstāt procedūras laukus tukšus</option>
            {visits.map((v) => (
              <option key={v.id} value={v.id}>
                {v.data.date} · {v.data.service}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="clinical-help">
        Pārbaudi, vai izvēlētā veidlapa atbilst konkrētajai procedūrai un savai profesionālajai
        kompetencei. Injekcijas veic tikai pilngadīgajiem.
      </div>
      <div className="clinical-actions">
        <button type="button" className="button" disabled={printing} onClick={() => printDocument("download")}>
          {printing ? "Sagatavo…" : "Lejupielādēt veidni"}
        </button>
        <button type="button" className="button button-outline" disabled={printing} onClick={() => printDocument("print")}>
          {printing ? "Sagatavo…" : "Drukāt"}
        </button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </div>
  );
}
