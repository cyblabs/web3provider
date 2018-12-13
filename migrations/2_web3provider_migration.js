var Web3Provider = artifacts.require("./Web3Provider.sol");

module.exports = function(deployer) {
  deployer.deploy(Web3Provider);
};
