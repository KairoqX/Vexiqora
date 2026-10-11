// Example inputs for the "Load sample" buttons.
import { encodeBase64 } from "./base64";

const jwtPart = (value: unknown) => encodeBase64(JSON.stringify(value), true);

export const samples = {
  json: '{"name":"Vexiqora","free":true,"tools":["json","diff","base64"],"author":{"name":"Ada","active":true},"scores":[98.5,87,null]}',
  jsonRecords: '[{"id":1,"name":"Ada","city":"London"},{"id":2,"name":"Grace, Hopper","city":"New York"},{"id":3,"name":"Linus","city":null}]',
  csv: 'id,name,city\n1,Ada,London\n2,"Grace, Hopper",New York\n3,Linus,Helsinki',
  diffOriginal: "apple\nbanana\ncherry\ndate\nelderberry",
  diffChanged: "apple\nblueberry\ncherry\ndate\nelderberry\nfig",
  base64Text: "Hello, Vexiqora! 👋 こんにちは",
  counterText: "Vexiqora runs in your browser. Nothing you paste is uploaded.\n\nPaste your own text here to see how many words, sentences and paragraphs it has.",
  url: "https://example.com/search?q=cats & dogs&lang=日本語",
  html: '<a href="https://example.com?a=1&b=2">Tom & Jerry’s "page"</a>',
  // A made-up token for demonstration. Its signature is a placeholder, not a real signature.
  jwt: `${jwtPart({ alg: "HS256", typ: "JWT" })}.${jwtPart({ sub: "1234567890", name: "Jane Doe", iat: 1700000000, exp: 1700003600 })}.c2lnbmF0dXJlLW5vdC12ZXJpZmllZA`,
  regexPattern: "(?<user>[\\w.]+)@(?<domain>[\\w.]+\\.\\w+)",
  regexText: "Contact ada@example.com or grace.hopper@navy.mil.\nNot an address: nobody@",
  markdown:
    "# Hello, Markdown\n\nWrite **bold**, *italic* and `code`, or add a [link](https://example.com).\n\n- First item\n- Second item\n\n> A quote\n\n```\nconst answer = 42;\n```\n\nRaw HTML such as <b>this</b> is shown as text.",
  caseText: "the quick brown fox\nuserProfileId",
};
