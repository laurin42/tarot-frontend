export interface ITarotCard {
  id: string;
  name: string;
  image: any;
}

export interface ISelectedAndShownCard extends ITarotCard {
  name: string;
  showFront?: boolean;
  isSelected?: boolean;
  currentIndex?: number;
  explanation?: string;
  image: any;
  onNextCard: () => void;
}

// Statisches Mapping für Kartennamen zu vorgeladenen Bildern
const cardImageMapping: Record<string, any> = {
  "Der Narr": require("../assets/images/tarot_cards/The_fool.jpg"),
  "Der Magier": require("../assets/images/tarot_cards/The_magician.jpg"),
  "Die Kaiserin": require("../assets/images/tarot_cards/The_empress.jpg"),
  "Die Hohepriesterin": require("../assets/images/tarot_cards/High_priestess.jpg"),
  "König der Kelche": require("../assets/images/tarot_cards/King_of_cups.jpg"),
  "Ritter der Kelche": require("../assets/images/tarot_cards/Knight_of_cups.jpg"),
  "Ritter der Münzen": require("../assets/images/tarot_cards/Knight_of_pentacles.jpg"),
  "Page der Kelche": require("../assets/images/tarot_cards/Page_of_cups.jpg"),
  "Page der Münzen": require("../assets/images/tarot_cards/Page_of_pentacles.jpg"),
  "Königin der Kelche": require("../assets/images/tarot_cards/Queen_of_cups.jpg"),
  "Zwei Kelche": require("../assets/images/tarot_cards/Two_Cups.jpg"),
  "Drei Kelche": require("../assets/images/tarot_cards/Three_Cups.jpg"),
  "Vier Kelche": require("../assets/images/tarot_cards/Four_Cups.jpg"),
  "Fünf Kelche": require("../assets/images/tarot_cards/Five_Cups.jpg"),
  "Sechs Kelche": require("../assets/images/tarot_cards/Six_Cups.jpg"),
  "Sieben Kelche": require("../assets/images/tarot_cards/Seven_Cups.jpg"),
  "Acht Kelche": require("../assets/images/tarot_cards/Eight_Cups.jpg"),
  "Neun Kelche": require("../assets/images/tarot_cards/Nine_Cups.jpg"),
  "Zehn Kelche": require("../assets/images/tarot_cards/Ten_Cups.jpg"),
  "Zwei Münzen": require("../assets/images/tarot_cards/Two_pents.jpg"),
  "Drei Münzen": require("../assets/images/tarot_cards/Three_pents.jpg"),
  "Vier Münzen": require("../assets/images/tarot_cards/Four_pents.jpg"),
  "Fünf Münzen": require("../assets/images/tarot_cards/Five_pents.jpg"),
  "Sechs Münzen": require("../assets/images/tarot_cards/Six_pents.jpg"),
  "Sieben Münzen": require("../assets/images/tarot_cards/Seven_pents.jpg"),
  "Acht Münzen": require("../assets/images/tarot_cards/Eight_pents.jpg"),
  "Neun Münzen": require("../assets/images/tarot_cards/Nine_pents.jpg"),
  "Zehn Münzen": require("../assets/images/tarot_cards/Ten_pents.jpg"),
  "Ass Münzen": require("../assets/images/tarot_cards/Ace_of_Pentacles.jpg"),
  "Ass Kelche": require("../assets/images/tarot_cards/Ace_of_cups.jpg"),
};

/**
 * Funktion zum statischen Laden von Tarotkarten auf Basis des Namens
 * Diese Funktion verwendet vordefinierte Bildreferenzen 
 */
export function getCardImageByName(cardName: string): any {
  // Direkter Zugriff auf das vordefinierte Mapping
  if (cardImageMapping[cardName]) {
    return cardImageMapping[cardName];
  }
  
  // Fallback zum Kartenrücken, wenn keine Karte gefunden wurde
  console.warn(`Keine Bildabbildung für Karte "${cardName}" gefunden`);
  return CARD_BACK_IMAGE;
}

/**
 * Kartenrücken-Bild, kann einfach in der gesamten App verwendet werden
 */
export const CARD_BACK_IMAGE = require("../assets/images/tarot_cards/Card_back.png");

export const tarotCards: ITarotCard[] = [
  {
    id: "0",
    name:  "Der Narr",
    image: require("../assets/images/tarot_cards/The_fool.jpg"),
  },
  {
    id: "1",
    name:  "Der Magier",
    image: require("../assets/images/tarot_cards/The_magician.jpg"),
  },
  {
    id: "2",
    name: "Die Kaiserin",
    image: require("../assets/images/tarot_cards/The_empress.jpg"),
  },
  {
    id: "3",
    name: "Die Hohepriesterin",
    image: require("../assets/images/tarot_cards/High_priestess.jpg"),
  },
  {
    id: "4",
    name: "König der Kelche",
    image: require("../assets/images/tarot_cards/King_of_cups.jpg"),
  },
  {
    id: "5",
    name: "Ritter der Kelche",
    image: require("../assets/images/tarot_cards/Knight_of_cups.jpg"),
  },
  {
    id: "6",
    name: "Ritter der Münzen",
    image: require("../assets/images/tarot_cards/Knight_of_pentacles.jpg"),
  },
  {
    id: "7",
    name: "Page der Kelche",
    image: require("../assets/images/tarot_cards/Page_of_cups.jpg"),
  },
  {
    id: "8",
    name: "Page der Münzen",
    image: require("../assets/images/tarot_cards/Page_of_pentacles.jpg"),
  },
  {
    id: "9",
    name: "Königin der Kelche",
    image: require("../assets/images/tarot_cards/Queen_of_cups.jpg"),
  },
  {
    id: "10",
    name: "Zwei Kelche",
    image: require("../assets/images/tarot_cards/Two_Cups.jpg"),
  },
  {
    id: "11",
    name: "Drei Kelche",
    image: require("../assets/images/tarot_cards/Three_Cups.jpg"),
  },
  {
    id: "12",
    name: "Vier Kelche",
    image: require("../assets/images/tarot_cards/Four_Cups.jpg"),
  },
  {
    id: "13",
    name: "Fünf Kelche",
    image: require("../assets/images/tarot_cards/Five_Cups.jpg"),
  },
  {
    id: "14",
    name: "Sechs Kelche",
    image: require("../assets/images/tarot_cards/Six_Cups.jpg"),
  },
  {
    id: "15",
    name: "Sieben Kelche",
    image: require("../assets/images/tarot_cards/Seven_Cups.jpg"),
  },
  {
    id: "16",
    name: "Acht Kelche",
    image: require("../assets/images/tarot_cards/Eight_Cups.jpg"),
  },
  {
    id: "17",
    name: "Neun Kelche",
    image: require("../assets/images/tarot_cards/Nine_Cups.jpg"),
  },
  {
    id: "18",
    name: "Zehn Kelche",
    image: require("../assets/images/tarot_cards/Ten_Cups.jpg"),
  },
  {
    id: "19",
    name: "Drei Münzen",
    image: require("../assets/images/tarot_cards/Three_pents.jpg"),
  },
  {
    id: "20",
    name: "Vier Münzen",
    image: require("../assets/images/tarot_cards/Four_pents.jpg"),
  },
  {
    id: "21",
    name: "Fünf Münzen",
    image: require("../assets/images/tarot_cards/Five_pents.jpg"),
  },
  {
    id: "22",
    name: "Sechs Münzen",
    image: require("../assets/images/tarot_cards/Six_pents.jpg"),
  },
  {
    id: "23",
    name: "Sieben Münzen",
    image: require("../assets/images/tarot_cards/Seven_pents.jpg"),
  },
  {
    id: "24",
    name: "Acht Münzen",
    image: require("../assets/images/tarot_cards/Eight_pents.jpg"),
  },
  {
    id: "25",
    name: "Neun Münzen",
    image: require("../assets/images/tarot_cards/Nine_pents.jpg"),
  },
  {
    id: "26",
    name: "Zehn Münzen",
    image: require("../assets/images/tarot_cards/Ten_pents.jpg"),
  },
  {
    id: "27",
    name: "Ass Münzen",
    image: require("../assets/images/tarot_cards/Ace_of_Pentacles.jpg"),
  },
  {
    id: "28",
    name: "Ass Kelche",
    image: require("../assets/images/tarot_cards/Ace_of_cups.jpg"),
  },
  {
    id: "29",
    name: "Zwei Münzen",
    image: require("../assets/images/tarot_cards/Two_pents.jpg"),
  },
];
