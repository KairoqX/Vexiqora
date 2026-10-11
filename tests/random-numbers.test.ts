import { test } from "node:test";
import assert from "node:assert/strict";
import { generateRandomNumbers, MAX_COUNT, type RandomNumberOptions } from "../src/lib/randomNumbers";
import { samples } from "../src/lib/samples";
import { decodeJwt } from "../src/lib/jwt";
import { jsonToCsv, csvToJson } from "../src/lib/csv";
import { parseJson } from "../src/lib/json";
import { runRegex } from "../src/lib/regex";
import { decodeUrl, encodeUrl } from "../src/lib/textCodec";

const base: RandomNumberOptions = { min: 1, max: 10, count: 5, kind: "integer", decimals: 2, unique: false, sort: "none" };
const ok = (o: Partial<RandomNumberOptions>) => {
  const r = generateRandomNumbers({ ...base, ...o });
  assert.ok(r.ok, !r.ok ? r.error : "");
  return r.values;
};

test("random numbers: integers stay inside the bounds and bounds are inclusive", () => {
  const seen = new Set(ok({ min: 1, max: 3, count: 600 }).map(Number));
  assert.deepEqual([...seen].sort(), [1, 2, 3]);
  assert.deepEqual(ok({ min: 7, max: 7, count: 3 }), ["7", "7", "7"]);
  for (const v of ok({ min: -5, max: 5, count: 200 }).map(Number)) assert.ok(v >= -5 && v <= 5 && Number.isInteger(v));
});

test("random numbers: unique values never repeat, including the full range and huge ranges", () => {
  const all = ok({ min: 1, max: 10, count: 10, unique: true }).map(Number);
  assert.deepEqual([...all].sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const big = ok({ min: 0, max: 2 ** 40, count: 500, unique: true });
  assert.equal(new Set(big).size, 500);
  const medium = ok({ min: 0, max: 99_999, count: 1000, unique: true });
  assert.equal(new Set(medium).size, 1000);
});

test("random numbers: sorting", () => {
  const asc = ok({ min: 1, max: 1000, count: 50, sort: "asc" }).map(Number);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  const desc = ok({ min: 1, max: 1000, count: 50, sort: "desc" }).map(Number);
  assert.deepEqual(desc, [...desc].sort((a, b) => b - a));
});

test("random numbers: decimals respect places and bounds", () => {
  for (const v of ok({ min: 0, max: 1, count: 100, kind: "decimal", decimals: 3 })) {
    assert.match(v, /^\d\.\d{3}$/);
    assert.ok(Number(v) >= 0 && Number(v) <= 1);
  }
  const whole = ok({ min: 5, max: 6, count: 20, kind: "decimal", decimals: 0 });
  assert.ok(whole.every((v) => v === "5" || v === "6"));
  const uniq = ok({ min: 0, max: 1, count: 50, kind: "decimal", decimals: 2, unique: true });
  assert.equal(new Set(uniq).size, 50);
  const neg = ok({ min: -1, max: -0.5, count: 30, kind: "decimal", decimals: 2, sort: "asc" }).map(Number);
  assert.ok(neg.every((v) => v >= -1 && v <= -0.5));
  assert.deepEqual(neg, [...neg].sort((a, b) => a - b));
});

test("random numbers: clear errors for bad settings", () => {
  const bad = (o: Partial<RandomNumberOptions>, pattern: RegExp) => {
    const r = generateRandomNumbers({ ...base, ...o });
    assert.ok(!r.ok && pattern.test(r.error), JSON.stringify(o) + " -> " + (r.ok ? "ok" : r.error));
  };
  bad({ min: NaN }, /Enter a number/);
  bad({ max: Infinity }, /Enter a number/);
  bad({ min: 5, max: 1 }, /minimum can’t be larger/);
  bad({ count: 0 }, /from 1 to/);
  bad({ count: MAX_COUNT + 1 }, /from 1 to/);
  bad({ count: 2.5 }, /whole number of results/);
  bad({ min: 0.5, max: 3 }, /whole numbers/);
  bad({ min: 1, max: 3, count: 5, unique: true }, /only 3 exist/);
  bad({ kind: "decimal", decimals: 11 }, /0 to 10/);
  bad({ kind: "decimal", min: 0, max: 0.01, count: 50, decimals: 2, unique: true }, /Only about 2/);
  bad({ min: -(2 ** 53), max: 2 ** 53 }, /whole numbers/);
});

// ---------- the "Load sample" inputs must actually work in their tools ----------
test("samples: every sample is accepted by its tool", () => {
  assert.ok(parseJson(samples.json).ok);
  const csv = jsonToCsv(samples.jsonRecords);
  assert.ok(csv.ok);
  assert.ok(csvToJson(samples.csv, { delimiter: ",", header: true, inferTypes: true }).ok);
  const jwt = decodeJwt(samples.jwt);
  assert.ok(jwt.ok && JSON.parse(jwt.payloadJson).name === "Jane Doe");
  const rx = runRegex(samples.regexPattern, "g", samples.regexText);
  assert.ok(rx.ok && rx.matches.length === 2 && rx.matches[0].named.user === "ada");
  const enc = encodeUrl(samples.url, "component");
  assert.ok(enc.ok);
  const dec = decodeUrl(enc.output, false);
  assert.ok(dec.ok && dec.output === samples.url);
});
