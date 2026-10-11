// Lorem ipsum placeholder text.

export type LoremUnit = "paragraphs" | "sentences" | "words";

const WORDS = (
  "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua " +
  "enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in " +
  "reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt " +
  "culpa qui officia deserunt mollit anim id est laborum"
).split(" ");

const OPENING_WORDS = ["lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipiscing", "elit"];

export const LIMITS: Record<LoremUnit, number> = { paragraphs: 100, sentences: 500, words: 5000 };

export interface LoremOptions {
  unit: LoremUnit;
  count: number;
  startWithLorem: boolean;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function generateLorem({ unit, count, startWithLorem }: LoremOptions, random: () => number = Math.random): string {
  const n = Math.min(Math.max(1, Math.floor(count)), LIMITS[unit]);
  const pick = () => WORDS[Math.floor(random() * WORDS.length)];
  const between = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

  if (unit === "words") {
    const words: string[] = [];
    if (startWithLorem) words.push(...OPENING_WORDS.map((w) => w.replace(",", "")).slice(0, n));
    while (words.length < n) words.push(pick());
    return capitalize(words.join(" "));
  }

  const sentence = (first: boolean): string => {
    if (first && startWithLorem) return `${capitalize(OPENING_WORDS.join(" "))}.`;
    const length = between(6, 14);
    const words = Array.from({ length }, pick);
    if (length >= 9) words[between(3, 5)] += ","; // one comma in longer sentences
    return `${capitalize(words.join(" "))}.`;
  };

  if (unit === "sentences") return Array.from({ length: n }, (_, i) => sentence(i === 0)).join(" ");

  return Array.from({ length: n }, (_, p) => {
    const sentences = between(3, 6);
    return Array.from({ length: sentences }, (_, s) => sentence(p === 0 && s === 0)).join(" ");
  }).join("\n\n");
}
