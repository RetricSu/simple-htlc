import { Hex } from "./type";
import { HasherCkb, log } from "@ckb-js-std/core";
import * as bindings from "@ckb-js-std/bindings";

export function hashPreimage(preimage: Hex) {
  const hasher = new HasherCkb();
  hasher.update(bindings.hex.decode(preimage));
  const digest = hasher.digest();
  log.debug(`...hash slice: ${bindings.hex.encode(digest)}`);
  return bindings.hex.encode(digest).slice(0, 40); // only get first 20 bytes, note here hex.encode does not includes `0x` prefix;
}
