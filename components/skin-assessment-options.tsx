"use client";
import { useState } from "react";
import { skinFindingGroups, skinFindingSelected, toggleSkinFinding } from "@/lib/skin-assessment";
export function SkinAssessmentOptions({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [error, setError] = useState("");
  return (
    <div className="skin-findings">
      <p className="clinical-help">
        Atzīmē izvērtētās pazīmes. Izvēles papildina aprakstu zemāk; atkārtots klikšķis izvēli
        noņem. Ādas tipam izvēlies vienu variantu, pārējās grupās — vairākus. Zonas un izteiktību
        vari pierakstīt pati.
      </p>
      {skinFindingGroups.map((group) => (
        <div className="skin-finding-group" role="group" aria-label={group.title} key={group.id}>
          <strong>{group.title}</strong>
          <div className="skin-finding-options">
            {group.options.map((option) => {
              const selected = skinFindingSelected(value, group, option);
              return (
                <button
                  type="button"
                  key={option}
                  aria-pressed={selected}
                  onClick={() => {
                    const next = toggleSkinFinding(value, group, option);
                    if (next.length > 12000) {
                      setError(
                        "Apraksts ir pārāk garš. Saīsini piezīmes pirms papildu pazīmju pievienošanas.",
                      );
                      return;
                    }
                    setError("");
                    onChange(next);
                  }}
                >
                  <span aria-hidden="true">{selected ? "✓" : "+"}</span>
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="clinical-help">
        Izvēles ir dokumentēšanas palīgs — tās neuzstāda diagnozi un nenosaka procedūras
        piemērotību.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
