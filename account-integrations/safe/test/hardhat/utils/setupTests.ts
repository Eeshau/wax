import { ethers } from "hardhat";
import { HDNodeWallet, getBytes } from "ethers";
import { AddressZero } from "@ethersproject/constants";
import { calculateProxyAddress } from "./calculateProxyAddress";
import { getUserOpHash } from "@account-abstraction/utils";
import { UserOperationStruct } from "@account-abstraction/contracts";

import { SafeProxyFactory } from "../../../typechain-types/lib/safe-contracts/contracts/proxies/SafeProxyFactory";
import { Safe } from "../../../typechain-types/lib/safe-contracts/contracts/Safe";
import { EntryPoint } from "../../../typechain-types/lib/account-abstraction/contracts/core/EntryPoint";
import {
  SafeProxyFactory__factory,
  Safe__factory,
} from "../../../typechain-types";
import SafeSingletonFactory from "./SafeSingletonFactory";
import receiptOf from "./receiptOf";
import makeDevFaster from "./makeDevFaster";

export async function setupTests() {
  const { BUNDLER_URL, NODE_URL, MNEMONIC } = process.env;

  if (!BUNDLER_URL) {
    throw new Error(
      "missing bundler env var BUNDLER_URL. Make sure you have copied or created a .env file",
    );
  }
  if (!NODE_URL) {
    throw new Error(
      "missing bundler env var NODE_URL. Make sure you have copied or created a .env file",
    );
  }
  if (!MNEMONIC) {
    throw new Error(
      "missing bundler env var MNEMONIC. Make sure you have copied or created a .env file",
    );
  }

  const bundlerProvider = new ethers.JsonRpcProvider(BUNDLER_URL);
  const provider = new ethers.JsonRpcProvider(NODE_URL);
  await makeDevFaster(provider);

  const admin = ethers.Wallet.fromPhrase(MNEMONIC).connect(provider);
  const owner = ethers.Wallet.createRandom(provider);

  await receiptOf(
    await admin.sendTransaction({
      to: owner.address,
      value: ethers.parseEther("1"),
    }),
  );

  const entryPoints = (await bundlerProvider.send(
    "eth_supportedEntryPoints",
    [],
  )) as string[];

  if (entryPoints.length === 0) {
    throw new Error("No entry points found");
  }

  const ssf = await SafeSingletonFactory.init(admin);

  const safeProxyFactory = await ssf.connectOrDeploy(
    SafeProxyFactory__factory,
    [],
  );
  const safeSingleton = await ssf.connectOrDeploy(Safe__factory, []);

  return {
    bundlerProvider,
    provider,
    admin,
    owner,
    entryPoints,
    safeProxyFactory,
    safeSingleton,
  };
}

async function deploySafeAndECDSAPlugin(
  wallet: HDNodeWallet,
  entryPoint: EntryPoint,
  safe: Safe,
  safeProxyFactory: SafeProxyFactory,
) {
  const ENTRYPOINT_ADDRESS = await entryPoint.getAddress();

  const safeECDSAPluginFactory = (
    await ethers.getContractFactory("SafeECDSAPlugin")
  ).connect(wallet);

  const safeEcdsaPluginContract = await safeECDSAPluginFactory.deploy(
    ENTRYPOINT_ADDRESS,
    { gasLimit: 10_000_000 },
  );

  const safeECDSAPluginAddress = await safeEcdsaPluginContract.getAddress();
  const singletonAddress = await safe.getAddress();
  const factoryAddress = await safeProxyFactory.getAddress();

  const moduleInitializer =
    safeEcdsaPluginContract.interface.encodeFunctionData("enableMyself", [
      wallet.address,
    ]);

  const encodedInitializer = safe.interface.encodeFunctionData("setup", [
    [wallet.address],
    1,
    safeECDSAPluginAddress,
    moduleInitializer,
    safeECDSAPluginAddress,
    AddressZero,
    0,
    AddressZero,
  ]);
  const counterfactualAddress = await calculateProxyAddress(
    safeProxyFactory,
    singletonAddress,
    encodedInitializer,
    73,
  );

  // The initCode contains 20 bytes of the factory address and the rest is the calldata to be forwarded
  const initCode = ethers.concat([
    factoryAddress,
    safeProxyFactory.interface.encodeFunctionData("createProxyWithNonce", [
      singletonAddress,
      encodedInitializer,
      73,
    ]),
  ]);

  // Native tokens for the pre-fund 💸
  await wallet.sendTransaction({
    to: counterfactualAddress,
    value: ethers.parseEther("100"),
  });

  await sendTx(
    wallet,
    entryPoint,
    counterfactualAddress,
    "0x0",
    initCode,
    "0x",
  );

  return { safeEcdsaPluginContract, counterfactualAddress };
}

export async function sendTx(
  signer: HDNodeWallet,
  entryPoint: EntryPoint,
  sender: string,
  nonce: string,
  initCode?: string,
  callData?: string,
) {
  const provider = ethers.provider;
  const { maxFeePerGas, maxPriorityFeePerGas } = await getFeeData();
  const entryPointAddress = await entryPoint.getAddress();

  const unsignedUserOperation = {
    sender,
    nonce,
    initCode: initCode ?? "0x",
    callData: callData ?? "0x",
    verificationGasLimit: 1e6,
    callGasLimit: 1e6,
    preVerificationGas: 1e6,
    maxFeePerGas,
    maxPriorityFeePerGas,
    paymasterAndData: "0x",
    signature: "",
  } satisfies UserOperationStruct;

  const resolvedUserOp = await ethers.resolveProperties(unsignedUserOperation);
  const userOpHash = getUserOpHash(
    resolvedUserOp,
    entryPointAddress,
    Number((await provider.getNetwork()).chainId),
  );

  const userOpSignature = await signer.signMessage(getBytes(userOpHash));

  const userOperation = {
    ...unsignedUserOperation,
    signature: userOpSignature,
  };

  try {
    const _rcpt = await entryPoint.handleOps(
      [userOperation],
      entryPointAddress,
    );
  } catch (e) {
    console.log("EntryPoint handleOps error=", e);
  }
}

async function getFeeData() {
  const feeData = await ethers.provider.getFeeData();
  if (!feeData.maxFeePerGas || !feeData.maxPriorityFeePerGas) {
    throw new Error(
      "maxFeePerGas or maxPriorityFeePerGas is null or undefined",
    );
  }

  const maxFeePerGas = "0x" + feeData.maxFeePerGas.toString();
  const maxPriorityFeePerGas = "0x" + feeData.maxPriorityFeePerGas.toString();

  return { maxFeePerGas, maxPriorityFeePerGas };
}
