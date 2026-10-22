import { join, resolve } from "node:path";
import { disk } from "./flydrive.ts";
import { setTimeout } from "node:timers/promises";
import { randomInt } from "node:crypto";

async function copy(source: string, destination: string) {
  try {
    await disk.copyFromFs(source, destination);
    return true;
  } catch {
    return false;
  }
}

const assetsDir = join(import.meta.dirname, "../assets");

const fakeFiles = Array.from({ length: 20 }, (_, index) => index);

const results = await Promise.all(
  fakeFiles.values().map(async (file) => {
    const succeed = await copy(resolve(join(assetsDir, `subdir/${file}`)), String(file));

    await setTimeout(randomInt(100, 500));

    return succeed;
  }),
);

for (const [index, succeed] of results.entries()) {
  const file = fakeFiles[index];
  console.log(`${succeed ? "[succeed]" : "[failed]"} ${file}`);
}
