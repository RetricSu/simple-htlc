import {
  bigintFromBytes,
  bigintToBytes,
  BytesLike,
  mol,
  NumLike,
} from "@ckb-js-std/core";
import * as bindings from "@ckb-js-std/bindings";

export type Hex = `0x${string}`;

export const Bytes20Codec: mol.Codec<string, Hex> = mol.Codec.from({
  byteLength: 20,
  encode: (hex: string) => bindings.hex.decode(hex),
  decode: (bytes: BytesLike) => bindings.hex.encode(bytes) as Hex,
});

export const Bytes32Codec: mol.Codec<string, Hex> = mol.Codec.from({
  byteLength: 32,
  encode: (hex: string) => bindings.hex.decode(hex),
  decode: (bytes: BytesLike) => bindings.hex.encode(bytes) as Hex,
});

export const SinceCodec: mol.Codec<Hex, bigint> = mol.Codec.from({
  encode: (hex: Hex) => bindings.hex.decode(hex),
  decode: (bytes: BytesLike) => bigintFromBytes(bytes),
});

export interface HTLCIdLike {
  from: string;
  to: string;
  hash: string;
  since: Hex;
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
  since: SinceCodec,
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
