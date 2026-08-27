import type {
  EtapeCalendrier,
  NiveauRisque,
  NiveauRecommandation,
  Recommandation,
  StatutRecommandation,
} from "@/types";

export function formatDate(dateStr: string): string {
  const [j, m, a] = dateStr.split("/");
  if (!j || !m || !a) return dateStr;
  const date = new Date(Number(a), Number(m) - 1, Number(j));
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateCourt(dateStr: string): string {
  const [j, m, a] = dateStr.split("/");
  if (!j || !m || !a) return dateStr;
  const date = new Date(Number(a), Number(m) - 1, Number(j));
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export function joursEntre(debut: string, fin: string): number {
  const [j1, m1, a1] = debut.split("/").map(Number);
  const [j2, m2, a2] = fin.split("/").map(Number);
  const d1 = new Date(a1, m1 - 1, j1);
  const d2 = new Date(a2, m2 - 1, j2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export function niveauFromScore(score: number): NiveauRisque {
  if (score >= 70) return "Faible";
  if (score >= 50) return "Moyen";
  return "Élevé";
}

export function couleurNiveauRisque(niveau: NiveauRisque): string {
  switch (niveau) {
    case "Faible":
      return "bg-success text-success-foreground";
    case "Moyen":
      return "bg-warning text-warning-foreground";
    case "Élevé":
      return "bg-destructive text-destructive-foreground";
  }
}

export function emojiNiveauRisque(niveau: NiveauRisque): string {
  switch (niveau) {
    case "Faible":
      return "🟢";
    case "Moyen":
      return "🟡";
    case "Élevé":
      return "🔴";
  }
}

export function couleurNiveauReco(
  niveau: NiveauRecommandation
): string {
  switch (niveau) {
    case "Alerte":
      return "bg-destructive text-destructive-foreground";
    case "Attention":
      return "bg-warning text-warning-foreground";
    case "Information":
      return "bg-info text-info-foreground";
  }
}

export function emojiNiveauReco(niveau: NiveauRecommandation): string {
  switch (niveau) {
    case "Alerte":
      return "🔴";
    case "Attention":
      return "🟡";
    case "Information":
      return "🟢";
  }
}

export function prochainesEtapes(
  etapes: EtapeCalendrier[]
): EtapeCalendrier[] {
  return etapes
    .filter((e) => e.statut !== "Réalisée")
    .sort((a, b) => {
      const [ja, ma, aa] = a.datePrevue.split("/").map(Number);
      const [jb, mb, ab] = b.datePrevue.split("/").map(Number);
      return (
        new Date(aa, ma - 1, ja).getTime() -
        new Date(ab, mb - 1, jb).getTime()
      );
    });
}

export function derniereEtapeRealisee(
  etapes: EtapeCalendrier[]
): EtapeCalendrier | undefined {
  return [...etapes]
    .filter((e) => e.statut === "Réalisée")
    .sort((a, b) => {
      const da = a.dateRealisee || a.datePrevue;
      const db = b.dateRealisee || b.datePrevue;
      const [ja, ma, aa] = da.split("/").map(Number);
      const [jb, mb, ab] = db.split("/").map(Number);
      return (
        new Date(ab, mb - 1, jb).getTime() -
        new Date(aa, ma - 1, ja).getTime()
      );
    })[0];
}

export function progressEtapes(etapes: EtapeCalendrier[]): {
  realisees: number;
  total: number;
  pourcentage: number;
} {
  const total = etapes.length;
  const realisees = etapes.filter((e) => e.statut === "Réalisée").length;
  const pourcentage = total > 0 ? Math.round((realisees / total) * 100) : 0;
  return { realisees, total, pourcentage };
}

export function ageParcelle(dateSemis: string): string {
  const [j, m, a] = dateSemis.split("/").map(Number);
  const semis = new Date(a, m - 1, j);
  const maintenant = new Date(2024, 8, 15);
  const jours = Math.round(
    (maintenant.getTime() - semis.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (jours < 30) return `${jours} jours`;
  const mois = Math.floor(jours / 30);
  const reste = jours % 30;
  return reste > 0 ? `${mois} mois et ${reste} jours` : `${mois} mois`;
}

export function nombreJoursRestants(datePrevue: string): number {
  const [j, m, a] = datePrevue.split("/").map(Number);
  const date = new Date(a, m - 1, j);
  const maintenant = new Date(2024, 8, 15);
  return Math.round((date.getTime() - maintenant.getTime()) / (1000 * 60 * 60 * 24));
}

export function filtrerRecommandations(
  recos: Recommandation[],
  filtre: "Toutes" | "À lire" | "Appliquées"
): Recommandation[] {
  if (filtre === "À lire")
    return recos.filter((r) => r.statut === "Non lue");
  if (filtre === "Appliquées")
    return recos.filter((r) => r.statut === "Appliquée");
  return recos;
}

export function statutRecoLabel(statut: StatutRecommandation): string {
  switch (statut) {
    case "Non lue":
      return "Non lue";
    case "Lue":
      return "Lue";
    case "Appliquée":
      return "Appliquée";
  }
}

export function initiales(prenom?: string, nom?: string): string {
  // Vérifier que les valeurs existent
  if (!prenom || !nom) return "?";
  if (prenom.length === 0 || nom.length === 0) return "?";
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
}

export function communePw(arr: number[]): number {
  if (arr.length === 0) return 0;
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  return max - min;
}
