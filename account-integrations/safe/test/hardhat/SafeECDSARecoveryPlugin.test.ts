import { ethers } from "hardhat";
import { expect } from "chai";
import { HDNodeWallet, Provider } from "ethers";
import { setupTests, sendTx } from "./setupTests";

import { executeContractCallWithSigners } from "./utils/execution";

import { EntryPoint } from "../../typechain-types/lib/account-abstraction/contracts/core/EntryPoint";
import { SafeECDSAPlugin } from "../../typechain-types/src/SafeECDSAPlugin.sol/SafeECDSAPlugin";

const MNEMONIC = "test test test test test test test test test test test junk";

describe("SafeECDSARecoveryPlugin", () => {
  let provider: Provider;
  let safeSigner: HDNodeWallet;
  let entryPoint: EntryPoint;
  let safeECDSAPlugin: SafeECDSAPlugin;
  let safeCounterfactualAddress: string;

  before(async () => {
    const {
      safeOwner,
      entryPointContract,
      safeEcdsaPluginContract,
      counterfactualAddress,
    } = await setupTests();

    provider = ethers.provider;
    safeSigner = safeOwner;
    entryPoint = entryPointContract;
    safeECDSAPlugin = safeEcdsaPluginContract;
    safeCounterfactualAddress = counterfactualAddress;
  });

  it("Should enable a recovery plugin on a safe.", async () => {
    const [, , recoverySigner] = await ethers.getSigners();

    const recoveryPlugin = await (
      await ethers.getContractFactory("SafeECDSARecoveryPlugin")
    ).deploy();
    const recoveryPluginAddress = await recoveryPlugin.getAddress();

    // Enable recovery plugin on safe

    const deployedSafe = await ethers.getContractAt(
      "Safe",
      safeCounterfactualAddress,
    );
    const isModuleEnabledBefore = await deployedSafe.isModuleEnabled(
      recoveryPluginAddress,
    );

    await executeContractCallWithSigners(
      deployedSafe,
      deployedSafe,
      "enableModule",
      [recoveryPluginAddress],
      // @ts-expect-error safeSigner doesn't have all properties for some reason
      [safeSigner],
    );

    const isModuleEnabledAfter = await deployedSafe.isModuleEnabled(
      recoveryPluginAddress,
    );

    expect(isModuleEnabledBefore).to.equal(false);
    expect(isModuleEnabledAfter).to.equal(true);
  });

  it("Should use recovery plugin to reset signing key and then send tx with new key.", async () => {
    // Setup recovery plugin

    const [, , , recoverySigner] = await ethers.getSigners();

    const recoveryPlugin = await (
      await ethers.getContractFactory("SafeECDSARecoveryPlugin")
    ).deploy();
    const recoveryPluginAddress = await recoveryPlugin.getAddress();

    const deployedSafe = await ethers.getContractAt(
      "Safe",
      safeCounterfactualAddress,
    );

    // Enable recovery plugin

    await executeContractCallWithSigners(
      deployedSafe,
      deployedSafe,
      "enableModule",
      [recoveryPluginAddress],
      // @ts-expect-error safeSigner doesn't have all properties for some reason
      [safeSigner],
    );

    const isModuleEnabled = await deployedSafe.isModuleEnabled(
      recoveryPluginAddress,
    );
    expect(isModuleEnabled).to.equal(true);

    // Add recovery account

    const ecdsaPluginAddress = await safeECDSAPlugin.getAddress();

    await recoveryPlugin
      .connect(safeSigner)
      .addRecoveryAccount(
        recoverySigner.address,
        safeCounterfactualAddress,
        ecdsaPluginAddress,
      );

    // Reset ecdsa address

    const newEcdsaPluginSigner = ethers.Wallet.createRandom().connect(provider);

    await recoveryPlugin
      .connect(recoverySigner)
      .resetEcdsaAddress(
        await deployedSafe.getAddress(),
        ecdsaPluginAddress,
        safeSigner.address,
        newEcdsaPluginSigner.address,
      );

    // Send tx with new key

    const recipientAddress = ethers.Wallet.createRandom().address;
    const transferAmount = ethers.parseEther("1");
    const userOpCallData = safeECDSAPlugin.interface.encodeFunctionData(
      "execTransaction",
      [recipientAddress, transferAmount, "0x00"],
    );
    const recipientBalanceBefore = await provider.getBalance(recipientAddress);
    await sendTx(
      newEcdsaPluginSigner,
      entryPoint,
      safeCounterfactualAddress,
      "0x1",
      "0x",
      userOpCallData,
    );

    const recipientBalanceAfter = await provider.getBalance(recipientAddress);
    const expectedRecipientBalance = recipientBalanceBefore + transferAmount;
    expect(recipientBalanceAfter).to.equal(expectedRecipientBalance);
  });
});
