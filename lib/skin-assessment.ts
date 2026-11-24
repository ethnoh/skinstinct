export type SkinFindingGroup = {
  id: string;
  title: string;
  prefix: string;
  single?: boolean;
  options: readonly string[];
};
export const skinFindingGroups: readonly SkinFindingGroup[] = [
  {
    id: "type",
    title: "Ādas tips",
    prefix: "Ādas tips",
    single: true,
    options: ["Normāla āda", "Sausa āda", "Taukaina āda", "Kombinēta āda"],
  },
  {
    id: "hydration",
    title: "Mitrums, barjera un elastība",
    prefix: "Stāvoklis",
    options: [
      "Dehidratācija",
      "Kseroze (sausums)",
      "Ādas barjeras traucējumu pazīmes",
      "Pazemināts turgors",
      "Samazināta elastība",
    ],
  },
  {
    id: "sensitivity",
    title: "Jutība un asinsvadu pazīmes",
    prefix: "Jutība / asinsvadi",
    options: [
      "Paaugstināts jutīgums",
      "Paaugstināta reaktivitāte",
      "Dedzināšanas sajūta",
      "Velkoša sajūta",
      "Nieze (prurīts)",
      "Eritēma (apsārtums)",
      "Teleangiektāzijas",
    ],
  },
  {
    id: "surface",
    title: "Ādas virsma un poras",
    prefix: "Virsma / poras",
    options: [
      "Deskvamācija (lobīšanās)",
      "Hiperkeratozes pazīmes",
      "Raupja tekstūra",
      "Paplašinātas poras",
      "Atvērtie komedoni",
      "Slēgtie komedoni",
      "Milia",
    ],
  },
  {
    id: "lesions",
    title: "Iekaisuma un bojājumu pazīmes",
    prefix: "Novērojamās pazīmes",
    options: ["Papulas", "Pustulas", "Noduli (mezgliņi)", "Ekskoriācijas (kasījumi)", "Kreveles"],
  },
  {
    id: "pigment",
    title: "Pigmentācija un pēciekaisuma izmaiņas",
    prefix: "Pigmentācija",
    options: [
      "PIH — pēciekaisuma hiperpigmentācija",
      "PIE — pēciekaisuma eritēma",
      "Hiperpigmentācija",
      "Hipopigmentācija",
      "Nevienmērīgs ādas tonis",
      "Pigmentācijas plankumi",
    ],
  },
  {
    id: "scars",
    title: "Rētas un novecošanās pazīmes",
    prefix: "Rētas / novecošanās",
    options: [
      "Atrofiskas rētas",
      "Hipertrofiskas rētas",
      "Smalkas līnijas",
      "Izteiktas grumbas",
      "Fotonovecošanās pazīmes",
    ],
  },
];
export function skinFindingSelected(text: string, group: SkinFindingGroup, option: string) {
  return text.split("\n").some((line) => line.trim() === `${group.prefix}: ${option}`);
}
export function toggleSkinFinding(text: string, group: SkinFindingGroup, option: string) {
  if (!group.options.includes(option)) return text;
  const marker = `${group.prefix}: ${option}`,
    lines = text.split("\n");
  if (skinFindingSelected(text, group, option))
    return lines.filter((line) => line.trim() !== marker).join("\n");
  const previous = group.single
    ? new Set(group.options.map((value) => `${group.prefix}: ${value}`))
    : new Set<string>();
  const retained = lines.filter((line) => !previous.has(line.trim())).join("\n");
  return retained + (retained && !retained.endsWith("\n") ? "\n" : "") + marker;
}
