import { schemaTypes } from "../sanity/schemaTypes/index.ts";

/**
 * ORPHANED FIELD GROUPS
 *
 * `sanity schema validate` does not catch these. It reported zero errors while
 * the Studio was crashing on load with:
 *
 *   Field group 'body' is not defined in schema for type 'undefined'
 *
 * The rule: field groups exist only on the type that DECLARES them. A field
 * nested inside an inline object or an array member belongs to an anonymous
 * type with no groups at all, and naming one there is fatal — but only at
 * runtime, in the browser, after the editor has already opened Studio.
 *
 * It has happened twice, both times for the same reason: a helper whose
 * `group` parameter has a default, called with `group: undefined` to opt out.
 * A default parameter value fires on `undefined`, so opting out silently opted
 * in. The helpers now take `null` for "no group" — and this check exists so
 * the next variation is caught by a script rather than by a crash.
 */

type Node = {
  name?: string;
  group?: unknown;
  fields?: Node[];
  of?: Node[];
  groups?: unknown[];
};

const problems: string[] = [];

/**
 * `hasGroups` is true only for the type that declares them. It is deliberately
 * NOT inherited downward: that is the whole point — a nested object does not
 * get its parent's groups.
 */
function walk(node: Node, path: string, hasGroups: boolean) {
  for (const field of node.fields ?? []) {
    if (field.group && !hasGroups) {
      problems.push(
        `${path}.${field.name ?? "?"} declares group "${String(field.group)}" ` +
          `but its containing type has no groups`,
      );
    }
    walk(field, `${path}.${field.name ?? "?"}`, false);
  }

  for (const member of node.of ?? []) {
    walk(member, `${path}[]`, false);
  }
}

for (const type of schemaTypes as unknown as Array<Node & { name: string }>) {
  walk(type, type.name, Array.isArray(type.groups) && type.groups.length > 0);
}

if (problems.length === 0) {
  console.log(
    `✓ field groups — checked ${schemaTypes.length} types, no orphaned groups`,
  );
  process.exit(0);
}

console.error(`✖ ${problems.length} orphaned field group(s):\n`);
for (const p of problems) console.error(`   ${p}`);
console.error(
  "\nA field inside an inline object or array member must not name a group.\n" +
    "Pass `group: null` to the helper, not `group: undefined`.",
);
process.exit(1);
