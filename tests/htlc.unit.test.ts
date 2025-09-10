import { hexFrom } from "@ckb-ccc/core";
import {
  HTLCId,
  HTLCIdCodec,
  UnlockProof,
  UnlockProofCodec,
} from "./core/type";
import { hashPreimage } from "./core/util";

describe("htlc data structure", () => {
  test("HTLCId encode and decode", async () => {
    const htlcId: HTLCId = {
      from: "0x1234567890123456789012345678901234567890",
      to: "0x1234567890123456789012345678901234567890",
      hash: "0x1234567890123456789012345678901234567890",
      since: 1234567890n,
    };

    const encodedArgs = HTLCIdCodec.encode(htlcId);
    const encodedArgsInHex = hexFrom(encodedArgs);
    expect(encodedArgsInHex).toEqual(
      "0x5800000014000000280000003c00000050000000123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890d202964900000000",
    );
    const decodedArgs = HTLCIdCodec.decode(encodedArgs);
    expect(decodedArgs).toEqual(htlcId);
  });

  test("UnlockProof encode and decode", async () => {
    const unlockProof: UnlockProof = {
      preimage:
        "0x1234567890123456789012345678901234567890123456789012345678901234",
    };

    const encodedUnlockProof = UnlockProofCodec.encode(unlockProof);
    const encodedUnlockProofInHex = hexFrom(encodedUnlockProof);
    expect(encodedUnlockProofInHex).toEqual(
      "0x28000000080000001234567890123456789012345678901234567890123456789012345678901234",
    );
    const decodedUnlockProof = UnlockProofCodec.decode(encodedUnlockProof);
    expect(decodedUnlockProof).toEqual(unlockProof);
  });

  test("hash preimage", async () => {
    const preimage =
      "0x1234567890123456789012345678901234567890123456789012345678901234";
    const hash = hashPreimage(preimage);
    expect(hash).toBe("0x711a1f01ff6b8712af57df1acac90e3c093dbeeb");
  });
});
