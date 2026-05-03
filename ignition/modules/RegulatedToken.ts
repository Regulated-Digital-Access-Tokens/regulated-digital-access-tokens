import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RegulatedTokenModule = buildModule("RegulatedTokenModule", (m) => {
  const token = m.contract("RegulatedToken");

  return { token };
});

export default RegulatedTokenModule;