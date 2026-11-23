const productionNotes = [
 'Raksts veidots, izvēršot manā Instagram iepazīšanās ierakstā aprakstītās vērtības. Attēls ir no SKINSTINCT fotosesijas; tas ilustrē studijas darbu, nevis sola konkrētu procedūras rezultātu.',
 'This article expands on the values described in my Instagram introduction. The photograph is from the SKINSTINCT photoshoot and illustrates studio work, rather than promising a specific treatment result.',
 'Статья развивает ценности из моего знакомства в Instagram. Снимок — из фотосессии SKINSTINCT: он показывает работу студии и не обещает определённого результата процедуры.',
 'Šis pieraksts turpina manā Instagram iepazīšanās ierakstā aizsākto domu par individuālu un apzinātu pieeju. Fotogrāfija ir no SKINSTINCT fotosesijas.',
 'This journal entry develops the idea of individual, thoughtful care from my Instagram introduction. The photograph is from the SKINSTINCT photoshoot.',
 'Эта заметка продолжает мысль об индивидуальном и осознанном подходе из моего знакомства в Instagram. Фотография — из фотосессии SKINSTINCT.',
];

export function cleanJournalBody(body:string) {
 let result=body;
 for(const note of productionNotes) result=result.replaceAll(note,'');
 return result.replace(/\n{3,}/g,'\n\n').trim();
}
