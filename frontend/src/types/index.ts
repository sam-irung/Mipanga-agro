export type NiveauRisque = "Faible" | "Moyen" | "Élevé";
export type StatutParcelle = "En cours" | "Terminée" | "En retard";
export type StatutEtape = "Réalisée" | "À venir" | "En retard";
export type NiveauRecommandation = "Alerte" | "Attention" | "Information";
export type StatutRecommandation = "Non lue" | "Lue" | "Appliquée";
export type SourceRecommandation = "Météo" | "Calendrier" | "Règle agronomique";

export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone: string;
  email?: string;
  province: string;
  territoire: string;
  latitude: number;
  longitude: number;
  dateInscription: string;
}

export interface EtapeCalendrier {
  id: number;
  jour: string;
  nom: string;
  datePrevue: string;
  dateRealisee?: string;
  statut: StatutEtape;
}

export interface ActionHistorique {
  id: number;
  date: string;
  action: string;
}

export interface DetailScore {
  label: string;
  points: number;
  max: number;
}

export interface Parcelle {
  id: number;
  nom: string;
  culture: string;
  variete?: string;
  superficie: number;
  dateSemis: string;
  statut: StatutParcelle;
  scoreRisque: number;
  niveauRisque: NiveauRisque;
  latitude: number;
  longitude: number;
  etapes: EtapeCalendrier[];
  historique: ActionHistorique[];
  detailsScore: DetailScore[];
}

export interface MeteoJour {
  date: string;
  pluie: number;
  temperature: number;
  humidite: number;
  vent: number;
  condition: string;
}

export interface Recommandation {
  id: number;
  date: string;
  niveau: NiveauRecommandation;
  message: string;
  source: SourceRecommandation;
  statut: StatutRecommandation;
  parcelleId?: number;
}

export const PROVINCES_RDC: { nom: string; territoires: string[] }[] = [
  { nom: "Haut-Katanga", territoires: ["Lubumbashi", "Likasi", "Kipushi", "Mitwaba", "Pweto", "Sakania"] },
  { nom: "Lualaba", territoires: ["Kolwezi", "Likasi", "Dilolo", "Kapanga", "Sandoa"] },
  { nom: "Haut-Lomami", territoires: ["Kamina", "Bukama", "Kabongo", "Malemba-Nkulu"] },
  { nom: "Tanganyika", territoires: ["Kalemie", "Kabalo", "Manono", "Moba", "Nyunzu"] },
  { nom: "Lomami", territoires: ["Kabinda", "Kamiji", "Lilu", "Ngandajika"] },
  { nom: "Sankuru", territoires: ["Lusambo", "Katako-Kombe", "Lodja", "Lubefu", "Punda"] },
  { nom: "Maniema", territoires: ["Kindu", "Kasongo", "Kabambare", "Kibombo", "Pangi"] },
  { nom: "Sud-Kivu", territoires: ["Bukavu", "Uvira", "Kamituga", "Shabunda", "Walungu"] },
  { nom: "Nord-Kivu", territoires: ["Goma", "Beni", "Butembo", "Rutshuru", "Walikale", "Masisi"] },
  { nom: "Ituri", territoires: ["Bunia", "Aru", "Mahagi", "Mambasa", "Djugu"] },
  { nom: "Haut-Uélé", territoires: ["Isiro", "Dungu", "Niangara", "Wamba", "Rungu"] },
  { nom: "Bas-Uélé", territoires: ["Buta", "Aketi", "Bondo", "Poko", "Ango"] },
  { nom: "Mongala", territoires: ["Lisala", "Bongongo", "Bumba", "Likoma"] },
  { nom: "Tshopo", territoires: ["Kisangani", "Bafwasende", "Banalia", "Basoko", "Isangi"] },
  { nom: "Maï-Ndombe", territoires: ["Inongo", "Kiri", "Kutu", "Oshwe", "Bolobo"] },
  { nom: "Kwilu", territoires: ["Bandundu", "Bulungu", "Idiofa", "Gungu", "Masi-Manimba"] },
  { nom: "Kwango", territoires: ["Kenge", "Kahemba", "Feshi", "Kasongo-Lunda", "Popokabaka"] },
  { nom: "Kasaï-Central", territoires: ["Kananga", "Dimbelenge", "Kazumba", "Luiza", "Miaba"] },
  { nom: "Kasaï-Oriental", territoires: ["Mbuji-Mayi", "Kabeya-Kamwanga", "Katanda", "Lupatapata"] },
  { nom: "Kasaï", territoires: ["Tshikapa", "Ilebo", "Decesse", "Kamonia", "Luamba"] },
  { nom: "Tshuapa", territoires: ["Boende", "Bokungu", "Djolu", "Ekomba", "Monkoto"] },
  { nom: "Équateur", territoires: ["Mbandaka", "Bikoro", "Basankusu", "Bolomba", "Ingende"] },
  { nom: "Kinshasa", territoires: ["Kinshasa", "Lemba", "Matete", "Ngaba", "Bandalungwa"] },
  { nom: "Kongo-Central", territoires: ["Matadi", "Boma", "Moanda", "Muanda", "Songololo"] },
  { nom: "Nord-Ubangi", territoires: ["Gbadolite", "Gemena", "Kungu", "Libenge", "Bosobolo"] },
  { nom: "Sud-Ubangi", territoires: ["Zongo", "Gemena", "Kungu", "Libenge", "Bosobolo"] },
];

export const CULTURES = ["Maïs", "Manioc", "Haricot", "Arachide"] as const;
