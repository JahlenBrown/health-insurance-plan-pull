// Copies this repo's JSON data into web/public/data/ so the app has a
// self-contained copy. public/data/ is committed to git (see
// "Why the synced data is committed" in web/README.md) because a remote
// Vercel build only uploads the web/ subdirectory -- ../data/ doesn't
// exist there, so this script is a no-op on Vercel and the *committed*
// copy is what actually ships.
//
// IMPORTANT: never delete a destination whose source is missing. An
// earlier version of this script did `rm -rf public/data` unconditionally
// before copying, which silently wiped the committed data on every
// Vercel build (../data/ doesn't exist there, so nothing replaced what
// got deleted) -- the site deployed with empty data and no error either
// time, until someone actually looked. Only touch a destination when its
// source is confirmed present.
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

mkdirSync(destRoot, { recursive: true });

for (const { from, to } of copies) {
  if (!existsSync(from)) {
    console.warn(
      `sync-data: source missing (${from}) -- leaving ${to} untouched, not deleting it`
    );
    continue;
  }
  rmSync(to, { recursive: true, force: true });
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
  const files = readdirSync(to).filter((f) => f.endsWith(".json"));
  console.log(`sync-data: copied ${files.length} file(s) into ${to}`);
}
