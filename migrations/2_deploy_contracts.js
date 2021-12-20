var LiquidityPool = artifacts.require("./LiquidityPool.sol");

module.exports = function(deployer) {
  deployer.deploy(LiquidityPool);
};
