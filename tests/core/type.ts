import { BytesLike, mol, NumLike, hexFrom, bytesFrom } from "@ckb-ccc/core";

export type Hex = `0x${string}`;

export const Bytes20Codec: mol.Codec<string, Hex> = mol.Codec.from({
  byteLength: 20,
  encode: (hex: string) => {
    if (hex.startsWith("0x")) {
      return bytesFrom(hex.slice(2), "hex");
    }
    return bytesFrom(hex, "hex");
  },
  decode: (bytes: BytesLike) => hexFrom(bytes),
});

export const Bytes32Codec: mol.Codec<string, Hex> = mol.Codec.from({
  byteLength: 32,
  encode: (hex: string) => {
    if (hex.startsWith("0x")) {
      return bytesFrom(hex.slice(2), "hex");
    }
    return bytesFrom(hex, "hex");
  },
  decode: (bytes: BytesLike) => hexFrom(bytes),
});

export interface HTLCIdLike {
  from: string;
  to: string;
  hash: string;
  since: NumLike;
}

export interface HTLCId {
  from: Hex; // 20 bytes
  to: Hex; // 20 bytes
  hash: Hex; // 20 bytes
  since: bigint; // 8 bytes
}

export const HTLCIdCodec: mol.Codec<HTLCIdLike, HTLCId> = mol.table({
  from: Bytes20Codec,
  to: Bytes20Codec,
  hash: Bytes20Codec,
  since: mol.Uint64,
});

export interface UnlockProofLike {
  preimage: string;
}

export interface UnlockProof {
  preimage: Hex; // 32 bytes
}

export const UnlockProofCodec: mol.Codec<UnlockProofLike, UnlockProof> =
  mol.table({
    preimage: Bytes32Codec,
  });
