/**
 * checkPresets.js
 *
 * Validates the generated Storyblok presets against the generated component
 * config: every preset must target a component that exists, every field must be
 * defined by that component's schema and every blok entry must carry a `_uid`
 * and a `component` from the field's whitelist.
 *
 * This is the "regenerated config is clean" check — it runs offline, no
 * Storyblok credentials involved.
 *
 * Usage:
 *   node scripts/checkPresets.js
 */

const fs = require("node:fs");
const path = require("node:path");

const componentsPath = path.join(
  __dirname,
  "..",
  "cms",
  "components.123456.json",
);
const presetsPath = path.join(__dirname, "..", "cms", "presets.123456.json");

const STORYBLOK_PROPERTIES = ["_uid", "component"];

/**
 * Walk a preset node against its component schema, collecting every reference
 * to a component or field that does not exist.
 */
const collectErrors = (node, schema, componentsByName, location, errors) => {
  if (Array.isArray(node)) {
    node.forEach((entry, index) =>
      collectErrors(entry, schema, componentsByName, `${location}/${index}`, errors),
    );
    return;
  }

  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if (STORYBLOK_PROPERTIES.includes(key)) continue;

    const field = schema ? schema[key] : undefined;

    if (field?.type === "bloks") {
      if (!Array.isArray(value)) {
        errors.push(`${location}/${key}: expected an array of bloks`);
        continue;
      }

      const whitelist = field.component_whitelist || [];
      value.forEach((entry, index) => {
        const entryLocation = `${location}/${key}/${index}`;
        if (!entry || typeof entry !== "object") {
          errors.push(`${entryLocation}: expected a blok entry`);
          return;
        }
        if (!entry._uid) errors.push(`${entryLocation}: missing _uid`);
        if (!entry.component) {
          errors.push(`${entryLocation}: missing component`);
          return;
        }
        if (!whitelist.includes(entry.component)) {
          errors.push(
            `${entryLocation}: component "${entry.component}" is not allowed by ${key}`,
          );
        }

        const component = componentsByName.get(entry.component);
        if (!component) {
          errors.push(
            `${entryLocation}: component "${entry.component}" does not exist`,
          );
          return;
        }

        collectErrors(entry, component.schema, componentsByName, entryLocation, errors);
      });
      continue;
    }

    if (field) continue;

    errors.push(`${location}/${key}: field does not exist`);
  }
};

const checkPresets = () => {
  const componentsRaw = JSON.parse(fs.readFileSync(componentsPath, "utf-8"));
  const components = componentsRaw.components || componentsRaw;
  const componentsByName = new Map(components.map((c) => [c.name, c]));

  const presetsRaw = JSON.parse(fs.readFileSync(presetsPath, "utf-8"));
  const presets = presetsRaw.presets || presetsRaw;

  const errors = [];
  for (const preset of presets) {
    const location = `${preset.name} (${preset.preset?.component})`;
    const component = componentsByName.get(preset.preset?.component);
    if (!component) {
      errors.push(
        `${location}: component "${preset.preset?.component}" does not exist`,
      );
      continue;
    }
    collectErrors(preset.preset, component.schema, componentsByName, location, errors);
  }

  if (errors.length > 0) {
    console.error(
      `${errors.length} preset error${errors.length === 1 ? "" : "s"} in ${presetsPath}:\n`,
    );
    console.error(errors.join("\n"));
    process.exit(1);
  }

  console.log(`Checked ${presets.length} presets — all clean`);
};

checkPresets();
