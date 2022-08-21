# Hairdresser App

## Run Locally

### 1. Start Frontend

cd frontend
npm install
npm start


### 2. Start a [local node]

For this project Hardhat has been used in order to compile the solidity files, run tests and run a local blockchain node.

npm install
npx hardhat node


### 3. Open a new terminal and deploy the smart contract in the `localhost` network

npx hardhat run --network localhost scripts/deploy.js
