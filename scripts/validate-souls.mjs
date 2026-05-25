import { readFile } from "node:fs/promises";
import path from "node:path";

const index = JSON.parse(await readFile("souls.json", "utf8"));
const errors = [];
const ids = new Set();
for (const item of index.souls ?? []) {
  if (ids.has(item.id)) errors.push(`duplicate soul id ${item.id}`);
  ids.add(item.id);
  const meta = JSON.parse(await readFile(item.metadata_path, "utf8"));
  const soul = await readFile(item.soul_path, "utf8");
  for (const field of ["id", "name", "summary", "tags", "genres", "tone", "craft", "content_boundaries", "recommended_uses", "version", "updated_at"]) {
    if (meta[field] === undefined) errors.push(`${item.id}: missing ${field}`);
  }
  for (const field of ["narrative_stance", "pov_strategy", "prose_rhythm", "scene_construction", "dialogue_habits", "emotional_palette", "imagery_system", "pacing_rules", "character_interiority_rules", "revision_checklist", "taboos", "examples"]) {
    if (meta.craft?.[field] === undefined) errors.push(`${item.id}: missing craft.${field}`);
  }
  if (!soul.includes("## Fiction Craft")) errors.push(`${item.id}: SOUL.md must include Fiction Craft section`);
  if (meta.version !== item.version) errors.push(`${item.id}: index version ${item.version} != metadata version ${meta.version}`);
  if (path.basename(path.dirname(item.soul_path)) !== item.id) errors.push(`${item.id}: soul_path folder mismatch`);
}
if (!ids.has("lantern")) errors.push("lantern soul is required");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("omg souls ok");
