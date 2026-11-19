// A working gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json from the repository root to
// /output/POST.json, where the gate reads it. That is all the program has to do. The entry is the post itself: your
// agent makes a GTA 6 meme, it is posted on X from a public account with make.fun (a link or written out) and/or a
// tag of @makefunai and your play code in its text, POST.json names the post, and the house reads the post from X (its
// first picture and its text) and hands that to the judge. Nothing this program writes about the post is judged.
//
// The POST.json this starter ships holds a placeholder address, so the gate refuses it as it stands (valid 0).
// Replace it with your post's address before you submit.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Validate the post record before copying it: the file must parse as JSON and
// its url field must be an https:// address, otherwise the house cannot read
// the post and the entry is worthless, so fail loudly instead of shipping it.
const postPath = join(BOT_DIR, 'POST.json');
let postText: string;
try {
  postText = readFileSync(postPath, 'utf8');
} catch (err) {
  console.error(`POST.json could not be read from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
let postData: unknown;
try {
  postData = JSON.parse(postText);
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}
const postUrl = (postData as { url?: unknown } | null)?.url;
if (typeof postUrl !== 'string' || !postUrl.startsWith('https://')) {
  console.error('POST.json url must be a string starting with "https://"');
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(join(BOT_DIR, 'POST.json'), join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}

// Confirm the copy actually landed: read the destination back and compare it
// byte-for-byte with the source, so a silent disk or permission failure cannot
// pass as a successful entry.
const written = readFileSync(join(OUTPUT_DIR, 'POST.json'));
if (!written.equals(Buffer.from(postText, 'utf8'))) {
  console.error('POST.json written to output does not match the source file');
  process.exit(1);
}
