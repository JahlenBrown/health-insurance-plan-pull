// Copies this repo's JSON data into web/public/data/ so the Next.js app is
// self-contained at build time -- no reliance on Vercel's "include files
// outside the root directory" setting for a subdirectory deployment.
import { cpSync, mkdirSync, rmSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const destRoot = join(__dirname, "..", "public", "data");

const copies = [
  { from: join(repoRoot, "data", "web-audits"), to: join(destRoot, "web-audits") },
  { from: join(repoRoot, "data", "plans"), to: join(destRoot, "plans") },
];

rmSync(destRoot, { recursive: true, force: true });
mkdirSync(destRoot, { recursive: true });

for (const { from, to } of copies) {
  if (!existsSync(from)) {
    console.warn(`sync-data: source missing, skipping: ${from}`);
    continue;
  }
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  const files = readdirSync(to).filter((f) => f.endsWith(".json"));
  console.log(`sync-data: copied ${files.length} file(s) into ${to}`);
}
