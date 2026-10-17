// Runs before `next build`: invalid frontmatter must fail the build with file + field names.
import path from "node:path";
import { ContentError, loadAllContent } from "../src/lib/content/load";

const contentDir = path.resolve(import.meta.dirname, "../../../content");

try {
  const { experiences, projects } = await loadAllContent(contentDir);
  console.log(`content ok: profile, ${experiences.length} experience, ${projects.length} projects`);
} catch (error) {
  if (!(error instanceof ContentError)) throw error;
  console.error(error.message);
  process.exit(1);
}
