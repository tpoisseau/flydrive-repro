import { join, resolve } from "node:path";
import { createReadStream } from "node:fs";
import type { Readable } from "node:stream";
import { setTimeout } from "node:timers/promises";
import { finished } from "node:stream/promises";

const assetsDir = join(import.meta.dirname, "../assets");

/**
 * stream error listen as soon as possible.
 * The error is caught
 */
try {
  const { promise, reject } = Promise.withResolvers();
  const stream = createReadStream(resolve(join(assetsDir, "subdir/bar.foo")));
  stream.once("error", reject);

  await promise;
} catch (error) {
  console.log("create stream error");
  console.error(error);
}

await setTimeout(0);

/**
 * Deported async catchup - like flydrive
 */
try {
  function catchStreamError(stream: Readable) {
    return new Promise((resolve, reject) => {
      stream.once("error", reject);
      finished(stream).then(resolve).catch(reject);
    });
  }
  async function asyncWrapper(stream: Readable) {
    // but force race condition hard to reproduce with a timeout 0
    await setTimeout(0);

    return await catchStreamError(stream);
  }
  const stream = createReadStream(resolve(join(assetsDir, "subdir/bar.foo")));

  await asyncWrapper(stream);
} catch (error) {
  console.log("create stream error");
  console.error(error);
}

await setTimeout(0);

/**
 * Stream created on missing file, Node throw uncaught error.
 * The catch clause is not executed.
 */
try {
  createReadStream(resolve(join(assetsDir, "subdir/bar.foo")));
} catch (error) {
  console.log("create stream error");
  console.error(error);
}
