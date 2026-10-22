import { Disk } from "flydrive";
import { FSDriver } from "flydrive/drivers/fs";

const fsDriver = new FSDriver({
  location: new URL("../storage", import.meta.url),
  visibility: "public",
});

export const disk = new Disk(fsDriver);
