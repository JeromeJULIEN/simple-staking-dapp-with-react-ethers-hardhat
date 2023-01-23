import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  // paths: {
  //   artifacts: "../client/contracts"
  // },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      // accounts => fourni par hardhat
      chainId: 31337
    }
  },
  gasReporter: {
    enabled: true
  }
};

export default config;
