import { Hex } from "./type";
import { HasherCkb, hexFrom, Since, SinceLike } from "@ckb-ccc/core";

export function hashPreimage(preimage: Hex) {
  const hasher = new HasherCkb();
  hasher.update(preimage);
  return hasher.digest().slice(0, 42); // only get first 20 bytes
}
