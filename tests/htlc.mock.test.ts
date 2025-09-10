import {
  hexFrom,
  Transaction,
  hashTypeToBytes,
  WitnessArgs,
  Since,
} from "@ckb-ccc/core";
import { readFileSync } from "fs";
import {
  Resource,
  Verifier,
  DEFAULT_SCRIPT_ALWAYS_SUCCESS,
  DEFAULT_SCRIPT_CKB_JS_VM,
} from "ckb-testtool";
import { HTLCIdCodec, UnlockProof, UnlockProofCodec } from "./core/type";

describe("htlc contract", () => {
  test("Fund Valid", async () => {
    const resource = Resource.default();
    const tx = Transaction.default();

    const mainScript = resource.deployCell(
      hexFrom(readFileSync(DEFAULT_SCRIPT_CKB_JS_VM)),
      tx,
      false,
    );
    const alwaysSuccessScript = resource.deployCell(
      hexFrom(readFileSync(DEFAULT_SCRIPT_ALWAYS_SUCCESS)),
      tx,
      false,
    );
    const contractScript = resource.deployCell(
      hexFrom(readFileSync("dist/htlc.bc")),
      tx,
      false,
    );

    const toLock = alwaysSuccessScript;
    const toLockHash = toLock.hash().slice(0, 42); // only get first 20 bytes

    const htlcId = {
      from: "0x1234567890123456789012345678901234567890",
      to: toLockHash,
      hash: "0x711a1f01ff6b8712af57df1acac90e3c093dbeeb",
      since: 1234567890n,
    };
    const unlockProof: UnlockProof = {
      preimage:
        "0x1234567890123456789012345678901234567890123456789012345678901234",
    };

    const args = HTLCIdCodec.encode(htlcId);
    mainScript.args = hexFrom(
      "0x0000" +
        contractScript.codeHash.slice(2) +
        hexFrom(hashTypeToBytes(contractScript.hashType)).slice(2) +
        hexFrom(args).slice(2),
    );
    const witnessArgs = new WitnessArgs(
      hexFrom(UnlockProofCodec.encode(unlockProof)),
    );

    // 1 input cell
    const inputCell = resource.mockCell(mainScript);
    tx.inputs.push(Resource.createCellInput(inputCell));

    // 2 output cells
    tx.outputs.push(Resource.createCellOutput(toLock));
    tx.outputsData.push(hexFrom("0xFE000000000000000000000000000000"));
    tx.outputs.push(Resource.createCellOutput(toLock));
    tx.outputsData.push(hexFrom("0x01000000000000000000000000000000"));

    // witness
    tx.witnesses.push(hexFrom(witnessArgs.toBytes()));

    const verifier = Verifier.from(resource, tx);
    // if you are using the native ckb-debugger, you can delete the following line.
    verifier.setWasmDebuggerEnabled(true);
    await verifier.verifySuccess(true);
  });

  test("Refund Valid: No Witness", async () => {
    const resource = Resource.default();
    const tx = Transaction.default();

    const mainScript = resource.deployCell(
      hexFrom(readFileSync(DEFAULT_SCRIPT_CKB_JS_VM)),
      tx,
      false,
    );
    const alwaysSuccessScript = resource.deployCell(
      hexFrom(readFileSync(DEFAULT_SCRIPT_ALWAYS_SUCCESS)),
      tx,
      false,
    );
    const contractScript = resource.deployCell(
      hexFrom(readFileSync("dist/htlc.bc")),
      tx,
      false,
    );

    const fromLock = alwaysSuccessScript;
    const fromLockHash = fromLock.hash().slice(0, 42); // only get first 20 bytes

    const since = Since.from(0).toNum();
    const htlcId = {
      from: fromLockHash,
      to: "0x1234567890123456789012345678901234567890",
      hash: "0x711a1f01ff6b8712af57df1acac90e3c093dbeeb",
      since,
    };
    const args = HTLCIdCodec.encode(htlcId);

    mainScript.args = hexFrom(
      "0x0000" +
        contractScript.codeHash.slice(2) +
        hexFrom(hashTypeToBytes(contractScript.hashType)).slice(2) +
        hexFrom(args).slice(2),
    );

    // 2 input cell
    const inputCell = resource.mockCell(mainScript);
    tx.inputs.push(Resource.createCellInput(inputCell));
    const inputCell2 = resource.mockCell(fromLock);
    tx.inputs.push(Resource.createCellInput(inputCell2));

    // 2 output cells
    tx.outputs.push(Resource.createCellOutput(fromLock));
    tx.outputsData.push(hexFrom("0xFE000000000000000000000000000000"));
    tx.outputs.push(Resource.createCellOutput(fromLock));
    tx.outputsData.push(hexFrom("0x01000000000000000000000000000000"));

    const verifier = Verifier.from(resource, tx);
    // if you are using the native ckb-debugger, you can delete the following line.
    verifier.setWasmDebuggerEnabled(true);
    await verifier.verifySuccess(true);
  });
});
