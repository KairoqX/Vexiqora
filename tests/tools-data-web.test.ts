import { test } from "node:test";
import assert from "node:assert/strict";
import { parseJson, sizeInBytes, minifyJson } from "../src/lib/json";
import { kindOf, preview, childrenOf, formatPrimitive, MAX_CHILDREN } from "../src/lib/jsonTree";
import { jsonToCsv, csvToJson, parseCsv } from "../src/lib/csv";
import { encodeUrl, decodeUrl, encodeHtmlEntities, decodeHtmlEntities } from "../src/lib/textCodec";
import { generateUuids, uuidV4, uuidV7, MAX_UUIDS } from "../src/lib/uuid";
import { secureRandomInt, secureRandomRange, secureRandomFloat, shuffleInPlace } from "../src/lib/random";
import { parseTimestamp, parseDateString, describeDate, formatRelative } from "../src/lib/timestamp";
import { httpStatuses, filterStatuses, classOf } from "../src/lib/httpStatus";
import { decodeJwt } from "../src/lib/jwt";
import { encodeBase64 } from "../src/lib/base64";
import { toggleInList, pushRecent } from "../src/lib/storage";

// ---------- JSON helpers and tree ----------
test("json: parseJson and sizeInBytes", () => {
  assert.deepEqual(parseJson('{"a":[1,2]}'), { ok: true, value: { a: [1, 2] } });
  assert.equal(parseJson("{").ok, false);
  assert.equal(sizeInBytes("é"), 2);
  assert.equal(sizeInBytes("👋"), 4);
  const min = minifyJson('{\n "a" : 1\n}');
  assert.ok(min.ok && sizeInBytes(min.output ?? "") < sizeInBytes('{\n "a" : 1\n}'));
});

test("tree: kinds, previews and truncation of huge nodes", () => {
  assert.equal(kindOf(null), "null");
  assert.equal(kindOf([]), "array");
  assert.equal(kindOf({}), "object");
  assert.equal(kindOf("x"), "string");
  assert.equal(kindOf(1), "number");
  assert.equal(kindOf(false), "boolean");
  assert.equal(preview([1]), "[1 item]");
  assert.equal(preview({ a: 1, b: 2 }), "{2 keys}");
  assert.equal(formatPrimitive("hi"), '"hi"');
  assert.equal(formatPrimitive(null), "null");
  const big = childrenOf(Array.from({ length: MAX_CHILDREN + 100 }, (_, i) => i));
  assert.equal(big.children.length, MAX_CHILDREN);
  assert.equal(big.hidden, 100);
  assert.deepEqual(childrenOf({ a: 1 }).children, [{ key: "a", value: 1 }]);
  assert.deepEqual(childrenOf("x"), { children: [], hidden: 0 });
});

// ---------- CSV ----------
test("csv: JSON to CSV with union of columns, quoting and nested values", () => {
  const r = jsonToCsv('[{"name":"Ann","age":30},{"name":"Bob, Jr.","city":"Lyon"}]');
  assert.ok(r.ok);
  assert.equal(r.output, 'name,age,city\nAnn,30,\n"Bob, Jr.",,Lyon');
  const q = jsonToCsv('[{"q":"say \\"hi\\""}]');
  assert.ok(q.ok && q.output === 'q\n"say ""hi"""');
  const nested = jsonToCsv('[{"a":{"b":1}}]');
  assert.ok(nested.ok && nested.output === 'a\n"{""b"":1}"');
  const arrays = jsonToCsv('[[1,2],[3,"x,y"]]');
  assert.ok(arrays.ok && arrays.output === '1,2\n3,"x,y"');
  const single = jsonToCsv('{"a":1,"b":true}');
  assert.ok(single.ok && single.output === "a,b\n1,true");
  const semi = jsonToCsv('[{"a":"x;y"}]', ";");
  assert.ok(semi.ok && semi.output === 'a\n"x;y"');
});

test("csv: JSON to CSV errors", () => {
  assert.equal(jsonToCsv("[]").ok, false);
  const bad = jsonToCsv("[1,2]");
  assert.ok(!bad.ok && /Item 1/.test(bad.error));
  assert.equal(jsonToCsv("{oops").ok, false);
});

test("csv: CSV to JSON with types, quotes and line breaks inside quotes", () => {
  const opts = { delimiter: "," as const, header: true, inferTypes: true };
  const r = csvToJson('name,age,ok\nAnn,30,true\n"Bob, Jr.",25,false', opts);
  assert.ok(r.ok);
  assert.deepEqual(JSON.parse(r.output), [
    { name: "Ann", age: 30, ok: true },
    { name: "Bob, Jr.", age: 25, ok: false },
  ]);
  const multi = csvToJson('a,b\n"x, y","line1\nline2"', opts);
  assert.ok(multi.ok);
  assert.deepEqual(JSON.parse(multi.output), [{ a: "x, y", b: "line1\nline2" }]);
});

test("csv: CSV edge cases", () => {
  const opts = { delimiter: "," as const, header: true, inferTypes: false };
  // CRLF, trailing blank lines, BOM
  const crlf = csvToJson("\uFEFFa,b\r\n1,2\r\n\r\n", opts);
  assert.ok(crlf.ok);
  assert.deepEqual(JSON.parse(crlf.output), [{ a: "1", b: "2" }]);
  // other delimiters
  const semi = csvToJson("a;b\n1;2", { ...opts, delimiter: ";" });
  assert.ok(semi.ok && JSON.stringify(JSON.parse(semi.output)) === '[{"a":"1","b":"2"}]');
  const tab = csvToJson("a\tb\n1\t2", { ...opts, delimiter: "\t" });
  assert.ok(tab.ok && JSON.stringify(JSON.parse(tab.output)) === '[{"a":"1","b":"2"}]');
  // duplicate and empty headers, short and long rows
  const odd = csvToJson("a,a,\n1,2,3\n4\n5,6,7,8", opts);
  assert.ok(odd.ok);
  assert.deepEqual(JSON.parse(odd.output), [
    { a: "1", a_2: "2", column_3: "3" },
    { a: "4", a_2: "", column_3: "" },
    { a: "5", a_2: "6", column_3: "7", column_4: "8" },
  ]);
  // no header row
  const plain = csvToJson("1,2\n3,4", { ...opts, header: false, inferTypes: true });
  assert.ok(plain.ok && JSON.stringify(JSON.parse(plain.output)) === "[[1,2],[3,4]]");
  // errors
  assert.equal(csvToJson("   ", opts).ok, false);
  const open = csvToJson('a,b\n1,"oops', opts);
  assert.ok(!open.ok && /line 2/.test(open.error));
  // a literal quote inside an unquoted field is kept
  const lit = parseCsv('5" pipe,x', ",");
  assert.ok(lit.ok && lit.rows[0][0] === '5" pipe');
});

test("csv: type inference keeps leading zeros and huge integers as text", () => {
  const r = csvToJson("a,b,c,d,e\n007,1e3,12345678901234567890,-4.5,", { delimiter: ",", header: true, inferTypes: true });
  assert.ok(r.ok);
  assert.deepEqual(JSON.parse(r.output), [{ a: "007", b: 1000, c: "12345678901234567890", d: -4.5, e: "" }]);
});

test("csv: round trip", () => {
  const original = [{ id: 1, name: 'He said "hi", twice', ok: true }];
  const csv = jsonToCsv(JSON.stringify(original));
  assert.ok(csv.ok);
  const back = csvToJson(csv.output, { delimiter: ",", header: true, inferTypes: true });
  assert.ok(back.ok);
  assert.deepEqual(JSON.parse(back.output), original);
});

// ---------- URL and HTML entities ----------
test("url: encode and decode", () => {
  const e1 = encodeUrl("a b&c=d/é", "component");
  assert.ok(e1.ok && e1.output === "a%20b%26c%3Dd%2F%C3%A9");
  const e2 = encodeUrl("a b&c=d/é", "full");
  assert.ok(e2.ok && e2.output === "a%20b&c=d/%C3%A9");
  const d1 = decodeUrl("a%20b%2Bc+d", true);
  assert.ok(d1.ok && d1.output === "a b+c d");
  const d2 = decodeUrl("a%20b%2Bc+d", false);
  assert.ok(d2.ok && d2.output === "a b+c+d");
  assert.equal(decodeUrl("%E0%A4%A", false).ok, false);
  assert.equal(decodeUrl("100%", false).ok, false);
  assert.equal(encodeUrl("\uD800", "component").ok, false);
});

test("url: round trip with non-English text and emoji", () => {
  for (const text of ["日本語 text?x=1&y=2", "👋 hello", "100% sure + more"]) {
    const enc = encodeUrl(text, "component");
    assert.ok(enc.ok);
    const dec = decodeUrl(enc.output, false);
    assert.ok(dec.ok && dec.output === text);
  }
});

test("html entities: encode", () => {
  assert.equal(
    encodeHtmlEntities(`<a href="x">Tom & 'Jerry'</a>`),
    "&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;",
  );
  assert.equal(encodeHtmlEntities("é😀", true), "&#233;&#128512;");
  assert.equal(encodeHtmlEntities("é😀", false), "é😀");
});

test("html entities: decode names, numbers, invalid and unknown entities", () => {
  assert.equal(
    decodeHtmlEntities("&lt;b&gt; &amp;amp; &#65;&#x42; &copy; &unknown; &#0; &#xD800; &#x1F600; &#99999999;"),
    "<b> &amp; AB © &unknown; \uFFFD \uFFFD 😀 \uFFFD",
  );
  assert.equal(decodeHtmlEntities("no entities & here;"), "no entities & here;");
});

test("html entities: encode then decode returns the original", () => {
  const text = `<script>alert("x")</script> & 'q' é 😀`;
  assert.equal(decodeHtmlEntities(encodeHtmlEntities(text, true)), text);
});

// ---------- UUID ----------
test("uuid: v4 and v7 formats", () => {
  assert.match(uuidV4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(uuidV7(), /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  const ts = 1700000000000;
  assert.equal(uuidV7(ts).replace(/-/g, "").slice(0, 12), ts.toString(16).padStart(12, "0"));
  assert.ok(uuidV7(1700000000000) < uuidV7(1700000000001)); // sorts by time
});

test("uuid: options, uniqueness and count limits", () => {
  const ids = generateUuids({ version: "v4", count: 1000, uppercase: false, hyphens: true });
  assert.equal(new Set(ids).size, 1000);
  const [upper] = generateUuids({ version: "v4", count: 1, uppercase: true, hyphens: false });
  assert.match(upper, /^[0-9A-F]{32}$/);
  assert.equal(generateUuids({ version: "v7", count: 0, uppercase: false, hyphens: true }).length, 1);
  assert.equal(generateUuids({ version: "v7", count: 5000, uppercase: false, hyphens: true }).length, MAX_UUIDS);
});

// ---------- secure random ----------
test("random: secureRandomInt stays in range and is roughly uniform", () => {
  const buckets = new Array(6).fill(0);
  for (let i = 0; i < 6000; i++) {
    const v = secureRandomInt(6);
    assert.ok(Number.isInteger(v) && v >= 0 && v < 6);
    buckets[v]++;
  }
  for (const count of buckets) assert.ok(count > 800 && count < 1200, `bucket count ${count}`);
  assert.equal(secureRandomInt(1), 0);
  assert.throws(() => secureRandomInt(0), RangeError);
  assert.throws(() => secureRandomInt(1.5), RangeError);
  assert.throws(() => secureRandomInt(2 ** 32 + 1), RangeError);
});

test("random: secureRandomRange covers bounds, negatives, wide ranges and errors", () => {
  assert.equal(secureRandomRange(5, 5), 5);
  const seen = new Set<number>();
  for (let i = 0; i < 400; i++) seen.add(secureRandomRange(-2, 2));
  assert.deepEqual([...seen].sort((a, b) => a - b), [-2, -1, 0, 1, 2]);
  for (let i = 0; i < 50; i++) {
    const wide = secureRandomRange(0, 2 ** 40);
    assert.ok(wide >= 0 && wide <= 2 ** 40);
    const widest = secureRandomRange(0, Number.MAX_SAFE_INTEGER);
    assert.ok(Number.isSafeInteger(widest) && widest >= 0);
  }
  assert.throws(() => secureRandomRange(3, 2), RangeError);
  assert.throws(() => secureRandomRange(0.5, 2), RangeError);
  assert.throws(() => secureRandomRange(-Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER), RangeError);
});

test("random: float range and shuffle keep their promises", () => {
  for (let i = 0; i < 200; i++) {
    const f = secureRandomFloat();
    assert.ok(f >= 0 && f < 1);
  }
  const items = [1, 2, 3, 4, 5, 6, 7, 8];
  assert.deepEqual([...shuffleInPlace([...items])].sort((a, b) => a - b), items);
});

// ---------- timestamps ----------
test("timestamp: seconds, milliseconds, auto-detection, negatives and fractions", () => {
  const sec = parseTimestamp("1700000000", "auto");
  assert.ok(sec.ok && sec.unit === "seconds" && sec.date.toISOString() === "2023-11-14T22:13:20.000Z");
  const ms = parseTimestamp("1700000000000", "auto");
  assert.ok(ms.ok && ms.unit === "milliseconds" && ms.date.toISOString() === "2023-11-14T22:13:20.000Z");
  const forced = parseTimestamp("1700000000", "milliseconds");
  assert.ok(forced.ok && forced.date.toISOString() === "1970-01-20T16:13:20.000Z");
  const neg = parseTimestamp("-1", "auto");
  assert.ok(neg.ok && neg.date.toISOString() === "1969-12-31T23:59:59.000Z");
  const frac = parseTimestamp("1700000000.5", "seconds");
  assert.ok(frac.ok && frac.date.getTime() === 1700000000500);
});

test("timestamp: invalid input", () => {
  for (const bad of ["", "abc", "1e5", "12.3.4", "99999999999999999999"]) assert.equal(parseTimestamp(bad, "auto").ok, false, bad);
});

test("timestamp: date strings in UTC, with offsets, and invalid dates", () => {
  const a = parseDateString("2023-11-14 22:13:20", "utc");
  assert.ok(a.ok && a.date.toISOString() === "2023-11-14T22:13:20.000Z");
  const b = parseDateString("2023-11-14T22:13:20+05:30", "utc");
  assert.ok(b.ok && b.date.toISOString() === "2023-11-14T16:43:20.000Z");
  const c = parseDateString("2023-11-14", "utc");
  assert.ok(c.ok && c.date.toISOString() === "2023-11-14T00:00:00.000Z");
  const d = parseDateString("2023-11-14T22:13:20.5Z", "local");
  assert.ok(d.ok && d.date.toISOString() === "2023-11-14T22:13:20.500Z");
  for (const bad of ["", "tomorrow", "2023-02-31", "2023-13-01", "2023-11-14 25:00", "14/11/2023"]) {
    assert.equal(parseDateString(bad, "utc").ok, false, bad);
    assert.equal(parseDateString(bad, "local").ok, false, bad);
  }
  assert.ok(parseDateString("2024-02-29", "utc").ok); // leap day
  assert.equal(parseDateString("2023-02-29", "utc").ok, false);
});

test("timestamp: local interpretation uses the machine's time zone", () => {
  const r = parseDateString("2023-11-14 22:13:20", "local");
  assert.ok(r.ok);
  assert.equal(r.date.getFullYear(), 2023);
  assert.equal(r.date.getHours(), 22);
  assert.equal(r.date.getMinutes(), 13);
});

test("timestamp: describing a date in several formats and time zones", () => {
  const date = new Date("2023-11-14T22:13:20.000Z");
  const now = new Date("2023-11-14T22:13:20.000Z");
  const rows = describeDate(date, now, "UTC");
  const get = (label: string) => rows.find((r) => r.label === label)?.value ?? "";
  assert.equal(get("ISO 8601 (UTC)"), "2023-11-14T22:13:20.000Z");
  assert.equal(get("Unix seconds"), "1700000000");
  assert.equal(get("Unix milliseconds"), "1700000000000");
  assert.match(get("Your time zone"), /November 14, 2023/);
  assert.match(get("UTC"), /14 Nov 2023 22:13:20 GMT/);
  assert.equal(get("Relative to now"), "now");
  assert.match(describeDate(date, now, "Asia/Kolkata").find((r) => r.label === "Your time zone")?.value ?? "", /November 15, 2023/);
});

test("timestamp: relative wording", () => {
  const now = new Date("2023-11-14T22:13:20.000Z");
  assert.equal(formatRelative(new Date(now.getTime() - 3 * 3600 * 1000), now), "3 hours ago");
  assert.equal(formatRelative(new Date(now.getTime() + 2 * 86400 * 1000), now), "in 2 days");
  assert.equal(formatRelative(new Date(now.getTime() - 40 * 1000), now), "40 seconds ago");
});

// ---------- HTTP status codes ----------
test("http status: data is complete and consistent", () => {
  const codes = httpStatuses.map((s) => s.code);
  assert.equal(new Set(codes).size, codes.length, "codes are unique");
  assert.deepEqual([...codes].sort((a, b) => a - b), codes, "codes are in order");
  for (const s of httpStatuses) {
    assert.ok(s.code >= 100 && s.code <= 599);
    assert.ok(s.name.length > 0 && s.description.length > 10);
  }
  for (const code of [200, 201, 204, 301, 302, 304, 400, 401, 403, 404, 418, 429, 500, 502, 503, 504]) {
    assert.ok(codes.includes(code), `missing ${code}`);
  }
  assert.equal(httpStatuses.find((s) => s.code === 404)?.name, "Not Found");
  assert.equal(classOf(404), "4xx");
});

test("http status: filtering by class and by search", () => {
  assert.ok(filterStatuses(httpStatuses, "", "5xx").every((s) => s.code >= 500));
  assert.deepEqual(filterStatuses(httpStatuses, "teapot", "all").map((s) => s.code), [418]);
  assert.ok(filterStatuses(httpStatuses, "429", "all").some((s) => s.code === 429));
  assert.equal(filterStatuses(httpStatuses, "zzzz", "all").length, 0);
  assert.equal(filterStatuses(httpStatuses, "", "all").length, httpStatuses.length);
  assert.equal(filterStatuses(httpStatuses, "redirect", "2xx").length, 0);
});

// ---------- JWT ----------
const enc = (value: unknown) => encodeBase64(JSON.stringify(value), true);
const makeToken = (header: unknown, payload: unknown, signature = "c2ln") => `${enc(header)}.${enc(payload)}.${signature}`;
const NOW = new Date("2023-11-14T22:13:20.000Z");

test("jwt: decodes header, payload and claims, including UTF-8", () => {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { sub: "123", name: "Zoë 👋", iat: 1700000000, exp: 1700003600 };
  const r = decodeJwt(makeToken(header, payload), NOW);
  assert.ok(r.ok);
  assert.equal(r.headerJson, JSON.stringify(header, null, 2));
  assert.equal(r.payloadJson, JSON.stringify(payload, null, 2));
  assert.equal(r.signature, "c2ln");
  assert.equal(r.warnings.length, 0);
  const exp = r.claims.find((c) => c.label.startsWith("Expires"));
  assert.match(exp?.value ?? "", /2023-11-14T23:13:20.000Z.*not expired yet/);
  assert.match(r.claims.find((c) => c.label.startsWith("Issued"))?.value ?? "", /in the past/);
});

test("jwt: reports expired and not-yet-valid tokens", () => {
  const expired = decodeJwt(makeToken({ alg: "HS256" }, { exp: 1600000000 }), NOW);
  assert.ok(expired.ok && /expired$/.test(expired.claims[0].value));
  const early = decodeJwt(makeToken({ alg: "HS256" }, { nbf: 1800000000 }), NOW);
  assert.ok(early.ok && /not valid yet/.test(early.claims[0].value));
});

test("jwt: accepts a Bearer prefix and wrapped lines", () => {
  const token = makeToken({ alg: "HS256" }, { a: 1 });
  assert.ok(decodeJwt(`Bearer ${token}`, NOW).ok);
  assert.ok(decodeJwt(`${token.slice(0, 10)}\n${token.slice(10)}`, NOW).ok);
});

test("jwt: warns about unsigned tokens and bad claims", () => {
  const none = decodeJwt(makeToken({ alg: "none" }, { a: 1 }, ""), NOW);
  assert.ok(none.ok && none.warnings.some((w) => /none/.test(w)));
  const unsigned = decodeJwt(makeToken({ alg: "HS256" }, { a: 1 }, ""), NOW);
  assert.ok(unsigned.ok && unsigned.warnings.some((w) => /unsigned/.test(w)));
  const bad = decodeJwt(makeToken({ alg: "HS256" }, { exp: "soon" }), NOW);
  assert.ok(bad.ok && bad.warnings.some((w) => /exp/.test(w)) && bad.claims.length === 0);
});

test("jwt: clear errors for malformed tokens", () => {
  const cases: [string, RegExp][] = [
    ["", /Paste a JWT/],
    ["abc", /three parts.*has 1/],
    ["a.b", /three parts.*has 2/],
    ["a.b.c.d.e", /JWE/],
    ["!!!.e30.sig", /header section isn’t valid Base64URL/],
    [`${enc("not an object")}.e30.sig`, /header section must be a JSON object/],
    [`${encodeBase64("not json", true)}.e30.sig`, /header section decoded, but it isn’t valid JSON/],
    [`${enc({ alg: "x" })}.${enc([1])}.sig`, /payload section must be a JSON object/],
    [`${enc({ alg: "x" })}..sig`, /payload section is empty/],
  ];
  for (const [input, pattern] of cases) {
    const r = decodeJwt(input, NOW);
    assert.ok(!r.ok && pattern.test(r.error), `${input} -> ${!r.ok ? r.error : "ok"}`);
  }
});

// ---------- favorites and recents ----------
test("storage helpers: toggle and recent list", () => {
  assert.deepEqual(toggleInList(["a"], "b"), ["a", "b"]);
  assert.deepEqual(toggleInList(["a", "b"], "a"), ["b"]);
  assert.deepEqual(pushRecent(["a", "b", "c"], "b"), ["b", "a", "c"]);
  assert.deepEqual(pushRecent(["a", "b"], "z", 2), ["z", "a"]);
  assert.deepEqual(pushRecent([], "x"), ["x"]);
});
