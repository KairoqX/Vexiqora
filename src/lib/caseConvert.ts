// Text case conversion. Identifier styles (camelCase, snake_case, ...) are applied to each line separately.

export type CaseStyle =
  | "upper" | "lower" | "title" | "sentence"
  | "camel" | "pascal" | "snake" | "kebab" | "constant" | "dot";

export const caseStyles: { value: CaseStyle; label: string; example: string }[] = [
  { value: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
  { value: "lower", label: "lowercase", example: "hello world" },
  { value: "title", label: "Title Case", example: "Hello World" },
  { value: "sentence", label: "Sentence case", example: "Hello world" },
  { value: "camel", label: "camelCase", example: "helloWorld" },
  { value: "pascal", label: "PascalCase", example: "HelloWorld" },
  { value: "snake", label: "snake_case", example: "hello_world" },
  { value: "kebab", label: "kebab-case", example: "hello-world" },
  { value: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
  { value: "dot", label: "dot.case", example: "hello.world" },
];

/** Splits text into words, also at camelCase boundaries and between letters and symbols. */
export function splitWords(text: string): string[] {
  return text
    .replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2") // helloWorld -> hello World
    .replace(/(\p{Lu})(\p{Lu}\p{Ll})/gu, "$1 $2") // XMLHttp -> XML Http
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

function convertLine(line: string, style: CaseStyle): string {
  switch (style) {
    case "upper":
      return line.toUpperCase();
    case "lower":
      return line.toLowerCase();
    case "title":
      return line.toLowerCase().replace(/(^|[\s\-(["“])(\p{L})/gu, (_m, before: string, letter: string) => before + letter.toUpperCase());
    case "sentence":
      return line.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_m, before: string, letter: string) => before + letter.toUpperCase());
    default: {
      const words = splitWords(line);
      switch (style) {
        case "camel":
          return words.map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w))).join("");
        case "pascal":
          return words.map(capitalize).join("");
        case "snake":
          return words.map((w) => w.toLowerCase()).join("_");
        case "kebab":
          return words.map((w) => w.toLowerCase()).join("-");
        case "constant":
          return words.map((w) => w.toUpperCase()).join("_");
        default:
          return words.map((w) => w.toLowerCase()).join(".");
      }
    }
  }
}

export function convertCase(text: string, style: CaseStyle): string {
  return text.split(/\r\n|\r|\n/).map((line) => convertLine(line, style)).join("\n");
}
