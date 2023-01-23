import { artifacts, ethers } from "hardhat";


async function main() {
  const Staking = await ethers.getContractFactory("Staking");
  const staking = await Staking.deploy();
  await staking.deployed();
  saveFrontendFiles(staking, "Staking");
}

// fonction gérant l'écriture des fichiers artifact et address
function saveFrontendFiles(contract: any, contractName: string) {
  const fs = require("fs");
  const path = require("path")
  // on génère un dossier au nom du contrat
  const contractsDir: string = path.join(__dirname, "..", "..", "client", "src", "contracts", `${contractName}`)

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // on écrit le fichier contenant l'adresse de déploiement
  fs.writeFileSync(
    path.join(contractsDir, `${contractName}-address.json`),
    JSON.stringify({ [contractName]: contract.address }, undefined, 2)
  );

  // idem avec l'artifacts
  const artifact = artifacts.readArtifactSync(contractName)
  fs.writeFileSync(
    path.join(contractsDir, `${contractName}.json`),
    JSON.stringify(artifact, null, 2)
  );

  // retour console
  console.log(`${contractName} contract deployed to address: ${contract.address}`);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
