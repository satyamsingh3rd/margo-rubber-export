import { mapAndValidate, enquiryPayloadSchema, FIELD_MAP, SOURCES } from "../src/lib/enquiry/sources.ts";

const meta = { page: "/products/o-rings", referrer: "https://google.com", elapsedMs: 9000 };

/** Builds a payload the same way the endpoint will: through the schema, so the
 *  fixtures cannot drift from what is actually accepted. */
const payload = (source: string, fields: Record<string, string>) =>
  enquiryPayloadSchema.parse({ source, fields, meta });
let pass = 0, fail = 0;
const check = (label: string, cond: boolean, extra = "") => {
  console.log(`${cond ? "  ok  " : "  FAIL"} ${label}${extra ? "  " + extra : ""}`);
  if (cond) pass++; else fail++;
};

// 1. Every source has a map, and every map targets real columns.
check("all sources have a field map", SOURCES.every(s => FIELD_MAP[s] && Object.keys(FIELD_MAP[s]).length > 0));

// 2. A realistic products submission.
const r1 = mapAndValidate(payload("products", { name: "A. Chen", company: "Vulcan Seals", email: "A.Chen@Vulcan.COM ",
            phone: "+61 2 9000 0000", product: "O-Rings", quantity: "5,000/mo",
            message: "FKM, 90 Shore A, need AS568-214." }));
check("products maps", r1.ok);
if (r1.ok) {
  check("email trimmed + lowercased", r1.data.email === "a.chen@vulcan.com", r1.data.email);
  check("quantity mapped", r1.data.quantity === "5,000/mo");
  check("page carried", r1.data.page === "/products/o-rings");
}

// 3. why-margo: `material` -> product, `notes` stays in raw only.
const r2 = mapAndValidate(payload("why-margo", { name: "R Patel", company: "Kirloskar", country: "India", email: "r@k.in",
            material: "EPDM", application: "Pump housing seal", notes: "Urgent" }));
check("why-margo maps material -> product", r2.ok && r2.data.product === "EPDM");
check("unmapped field kept in raw", r2.ok && r2.data.raw.notes === "Urgent");
check("unmapped field not a column", r2.ok && !Object.hasOwn(r2.data, "notes"));

// 4. export: incoterm deliberately raw-only.
const r3 = mapAndValidate(payload("export", { company: "Jebel Trading", email: "buy@jt.ae", country: "UAE",
            incoterm: "CIF", requirements: "Gaskets, 2000 pcs" }));
check("export keeps incoterm in raw", r3.ok && r3.data.raw.incoterm === "CIF");
check("export message mapped", r3.ok && r3.data.message === "Gaskets, 2000 pcs");

// 5. Bad email -> error against the FORM's field name.
const r4 = mapAndValidate(payload("industries", { name: "X", email: "not-an-email" }));
check("invalid email rejected", !r4.ok);
check("error keyed by form field", !r4.ok && "email" in r4.errors, !r4.ok ? JSON.stringify(r4.errors) : "");

// 6. Missing email entirely.
check("missing email rejected", !mapAndValidate(payload("contact", { company: "Z" })).ok);

// 7. Empty strings must not satisfy a required field.
check("empty email rejected", !mapAndValidate(payload("contact", { email: "   " })).ok);

// 8. Honeypot: schema rejects a filled one.
check("honeypot filled -> payload invalid",
  !enquiryPayloadSchema.safeParse({ source: "contact", fields: { email: "a@b.com" }, meta, company_website: "bot" }).success);
check("honeypot empty -> payload valid",
  enquiryPayloadSchema.safeParse({ source: "contact", fields: { email: "a@b.com" }, meta, company_website: "" }).success);

// 9. Unknown source rejected.
check("unknown source rejected",
  !enquiryPayloadSchema.safeParse({ source: "nope", fields: { email: "a@b.com" }, meta }).success);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
