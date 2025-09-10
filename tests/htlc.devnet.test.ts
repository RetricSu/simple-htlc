import { hexFrom, ccc, hashTypeToBytes, WitnessArgs } from "@ckb-ccc/core";
import scripts from "../deployment/scripts.json";
import systemScripts from "../deployment/system-scripts.json";
import { buildClient, buildSigner } from "./core/helper";
import { HTLCIdCodec } from "./core/type";

describe("htlc contract", () => {
  let client: ccc.Client;
  let signer: ccc.SignerCkbPrivateKey;

  beforeAll(() => {
    // Create global devnet client and signer for all tests in this describe block
    client = buildClient("devnet");
    signer = buildSigner(client);
  });

  test("should Refund successfully", async () => {
    const ckbJsVmScript = systemScripts.devnet["ckb_js_vm"];
    const contractScript = scripts.devnet["htlc.bc"];

    const singerAddressObj = await signer.getRecommendedAddressObj();
    const singerLock = singerAddressObj.script;
    const fromLockHash = singerLock.hash().slice(0, 42); // only get first 20 bytes

    const since = (1n << 63n) | 2n; // 2 blocks, relative
    const htlcId = {
      from: fromLockHash,
      to: "0x1234567890123456789012345678901234567890",
      hash: "0x711a1f01ff6b8712af57df1acac90e3c093dbeeb",
      since,
    };
    const args = HTLCIdCodec.encode(htlcId);

    const mainScript = {
      codeHash: ckbJsVmScript.script.codeHash,
      hashType: ckbJsVmScript.script.hashType,
      args: hexFrom(
        "0x0000" +
          contractScript.codeHash.slice(2) +
          hexFrom(hashTypeToBytes(contractScript.hashType)).slice(2) +
          hexFrom(args).slice(2),
      ),
    };

    const tx = ccc.Transaction.from({
      outputs: [
        {
          lock: mainScript,
        },
      ],
      cellDeps: [
        ...ckbJsVmScript.script.cellDeps.map((c) => c.cellDep),
        ...contractScript.cellDeps.map((c) => c.cellDep),
      ],
    });

    await tx.completeInputsByCapacity(signer);
    await tx.completeFeeBy(signer, 1000);
    const txHash = await signer.sendTransaction(tx);
    console.log(`Transaction sent: ${txHash}`);

    // second tx to refund the htlc cell
    // wait 2 block to pass the since requirement
    await client.waitTransaction(txHash, 2);

    // construct the tx2
    const witnessArgs = new WitnessArgs(hexFrom("0x"));
    const tx2 = ccc.Transaction.from({
      inputs: [
        {
          previousOutput: {
            txHash: txHash,
            index: 0,
          },
          since,
        },
      ],
      outputs: [
        {
          capacity: tx.outputs[0].capacity,
          lock: singerLock,
        },
      ],
      cellDeps: [
        ...ckbJsVmScript.script.cellDeps.map((c) => c.cellDep),
        ...contractScript.cellDeps.map((c) => c.cellDep),
      ],
      witnesses: [hexFrom(witnessArgs.toBytes())],
    });
    await tx2.completeInputsByCapacity(signer);
    await tx2.completeFeeBy(signer, 1000);
    const txHash2 = await signer.sendTransaction(tx2);
    console.log(`Transaction sent: ${txHash2}`);
  }, 100000);
});
