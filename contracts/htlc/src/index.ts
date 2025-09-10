import * as bindings from "@ckb-js-std/bindings";
import { HighLevel, log } from "@ckb-js-std/core";
import { HTLCIdCodec, UnlockProofCodec } from "./type";
import { hashPreimage } from "./util";

function main(): number {
  log.setLevel(log.LogLevel.Debug);
  const script = HighLevel.loadScript();
  const args = script.args.slice(35); // remove the first 35 bytes for js-vm

  log.debug(`args: ${bindings.hex.encode(args)}`);

  const htlcId = HTLCIdCodec.decode(args);
  const from = htlcId.from;
  const to = htlcId.to;
  const hash = htlcId.hash;
  const since = htlcId.since;

  log.debug(`from: ${from}`);
  log.debug(`to: ${to}`);
  log.debug(`hash: ${hash}`);
  log.debug(`since: ${since}`);

  let witness = new ArrayBuffer(0);

  try {
    const args = HighLevel.loadWitnessArgs(0, bindings.SOURCE_GROUP_INPUT).lock;
    if (args) {
      witness = args;
    }
  } catch (error) {
    log.error(`load witness args error`);
  }
  log.debug(`Witness: ${bindings.hex.encode(witness)}`);

  if (witness.byteLength === 0) {
    // refund
    log.debug(`Refund`);

    // validate since
    const sinceRaw = HighLevel.loadInputSince(0, HighLevel.SOURCE_GROUP_INPUT);
    log.debug(`expect since: ${since}, sinceRaw: ${sinceRaw.toString()}`);
    if (BigInt(since) > sinceRaw) {
      return 110;
    }

    // validate from lock hash
    const lockHash = HighLevel.loadCellLockHash(1, HighLevel.SOURCE_INPUT);
    const lockHashInHex = bindings.hex.encode(lockHash).slice(0, 40); // only first 20 bytes
    log.debug(`lockHash: ${lockHashInHex}`);
    if (lockHashInHex !== from) {
      return 111;
    }

    return 0;
  } else {
    // fund
    log.debug(`Fund`);

    const unlockProof = UnlockProofCodec.decode(witness);
    const preimage = unlockProof.preimage;
    log.debug(`preimage: ${preimage}`);

    // validate preimage
    const expectHash = hashPreimage(preimage);
    log.debug(`expectHash: ${expectHash}`);
    if (expectHash !== hash) {
      return 100;
    }

    // validate the to lock-hash
    const lockHash = HighLevel.loadCellLockHash(0, HighLevel.SOURCE_OUTPUT);
    const lockHashInHex = bindings.hex.encode(lockHash).slice(0, 40); // only first 20 bytes
    log.debug(`lockHash: ${lockHashInHex}`);
    if (lockHashInHex !== to) {
      return 101;
    }

    return 0;
  }
}

bindings.exit(main());
