export const objectTypeGroups = [
  {
    label: "Habiter",
    options: [
      { value: "appartement", label: "Appartement" },
      { value: "maison", label: "Maison" },
      { value: "terrain", label: "Terrain" },
      { value: "locaux", label: "Locaux de service" },
    ],
  },
  {
    label: "Commerce",
    options: [
      { value: "agriculture", label: "Agriculture" },
      { value: "commerce", label: "Commerce / Industrie" },
      { value: "gastronomie", label: "Gastronomie" },
    ],
  },
  {
    label: "Place de parc",
    options: [{ value: "parc", label: "Place de parc" }],
  },
] as const;

export const subtypesByType: Record<string, string[]> = {
  appartement: [
    "App. dernier étage",
    "Appartement",
    "Appartement en terrasse",
    "Appartement indépendant",
    "Attique",
    "Chambre",
    "Duplex/maisonette",
    "Galetas",
    "Loft",
    "Logement meublé",
    "Studio",
  ],
  maison: [
    "Villa individuelle",
    "Maison mitoyenne",
    "Maison d'angle",
    "Maison de maître",
    "Chalet",
    "Rustico",
    "Villa jumelle",
    "Ferme",
  ],
  terrain: ["Terrain à bâtir", "Terrain agricole", "Autre terrain"],
  locaux: ["Bureau", "Atelier", "Dépôt", "Surface commerciale"],
  agriculture: ["Exploitation agricole"],
  commerce: ["Commerce", "Industrie"],
  gastronomie: ["Restaurant", "Hôtel", "Bar / Café"],
  parc: ["Place de parc extérieure", "Place de parc couverte", "Garage individuel"],
};

export const allFeatures = [
  "Accessible en fauteuil roulant",
  "Convient aux enfants",
  "Animaux de compagnie autorisés",
  "Fumer est autorisé",
  "Balcon / Terrasse",
  "Rez-de-chaussée surélevé",
  "Garage",
  "Place de parc",
  "Ascenseur",
  "Piscine",
  "Cheminée",
  "Machine à laver privée",
  "Lave-vaisselle",
  "Vue",
  "Quartier calme",
  "Construction Minergie",
  "Certifié Minergie",
  "Ancienne construction",
  "Partie d'un logement en colocation",
  "Nouvelle construction",
  "TV câblée",
  "Logement meublé",
];

export const roomOptions = [
  "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5",
  "6", "6.5", "7", "7.5", "8", "9", "10", "11", "12",
];

export const cantons = [
  "GE", "VD", "VS", "FR", "NE", "JU", "BE", "ZH", "ZG", "TI", "BS", "BL",
  "AG", "SO", "LU", "SZ", "UR", "OW", "NW", "GL", "SH", "AR", "AI", "SG",
  "GR", "TG",
];
