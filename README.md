# Smart Contract Challenge

## A) Challenge

### 1) Setup a project and create a contract

#### Summary

ETHPool provides a service where people can deposit ETH and they will receive weekly rewards. Users must be able to take out their deposits along with their portion of rewards at any time. New rewards are deposited manually into the pool by the ETHPool team each week using a contract function.

#### Requirements & Assumptions

- Only the team can deposit rewards: 

***To achieve this requirement, some functions are limited to certain accounts. There's one "owner" of the contract (corresponding to the address that made the deployment), that's the only one to add or delete ETHPool team member's addresses. Therefore, I've made use of the Ownable contract provided by Open Zeppelin (guaranteeing in this way the use of a well known and audited contract), and by creating a function to interact with a mapping state variable )addresses => bolean), that takes the value true when a team's account is whitelisted to deposit rewards. This last functions can only be called by the Owner of the contract.***

- Deposited rewards go to the pool of users, not to individual users:

***The first time I've read the challenge, I've thought on this point before actually reading it. Creating a loop to iterate over the users would be extremely inefficient and tons of gas will be spend, making the project unscalable. Therefore, I've took and approach similar to the one described on the paper ["Scalable Reward Distribution on the Ethereum Blockchain"](http://batog.info/papers/scalable-reward-distribution.pdf) by Batog B., Boca L., & Johnson N.***

***Basically, any time the owner's address or one of the team member whitelisted address makes a reward deposit, that amount is added to a variable that add the total amount of rewards in the pool. When a user ask for a withdrawal, a "reward per token" gets calculated as the totalRewards * 100 / totalStake (multiplying the totalRewards for a 100 is done in order to avoid operating with floating numbers, as Solidity can only store integers). After that, the "reward per token" gets multiplied by the user's stake and divided by 100, to adjust the multiplication made on the previous step.***

- Users should be able to withdraw their deposits along with their share of rewards considering the time when they deposited: 

***On this subject, and important assumption is made. Users can deposit any time they want and that deposit will add to their stake on the pool. However, they are only enabled to withdraw their entire stake along with their rewards in a unique operation, making partial withdrawal outside of the scope of the project.***

***Also, when a full withdraw operation gets called, the contract checks if that account has been part of the pool before the last rewards was deposited. If that's the case, it will calculate their share at the time of the operation and proceed with the transfer of withdrawal + stake. However, if an address ask for the withdrawal, and that address current stake was deposited after the last reward deposit, the transaction will proceed, but the pool will only transfer the full stake amount, as no rewards will be associated with that account.***

***To achieve this last point, I use a state variable that gets updated with the block timestamp of the last reward deposit. Also, every account participating in the stake get's an associated entry date on their struct, that corresponds to the block timestamp of the first deposit they've made. Whenever an account ask for a withdraw, the contract will check if the account's entry date if lower than the reward deposit date and proceed accordingly. Also, after a user gets a full withdraw, that associated account entry date gets cleared, so if the user wants to participate again in the future, he'll be able to do so with a new entry date associated.***

Example:

> Let say we have user **A** and **B** and team **T**.
>
> **A** deposits 100, and **B** deposits 300 for a total of 400 in the pool. Now **A** has 25% of the pool and **B** has 75%. When **T** deposits 200 rewards, **A** should be able to withdraw 150 and **B** 450.
>
> What if the following happens? **A** deposits then **T** deposits then **B** deposits then **A** withdraws and finally **B** withdraws.
> **A** should get their deposit + all the rewards.
> **B** should only get their deposit because rewards were sent to the pool before they participated.

#### Goal

Design and code a contract for ETHPool, take all the assumptions you need to move forward.

You can use any development tools you prefer: Hardhat, Truffle, Brownie, Solidity, Vyper.

Useful resources:

- Solidity Docs: https://docs.soliditylang.org/en/v0.8.4
- Educational Resource: https://github.com/austintgriffith/scaffold-eth
- Project Starter: https://github.com/abarmat/solidity-starter

### 2) Deploy your contract

Deploy the contract to any Ethereum testnet of your preference. Keep record of the deployed address.

Bonus:

- Verify the contract in Etherscan


***The contract has been deployed on Ropsten network, with the address 0xcbD8d68661aB55d545B1bd9a43C1AEB86e0E11a0. You can check it on Etherscan by clicking [here](https://ropsten.etherscan.io/address/0xcbD8d68661aB55d545B1bd9a43C1AEB86e0E11a0).***

### 3) Interact with the contract

Create a script (or a Hardhat task) to query the total amount of ETH held in the contract.

_You can use any library you prefer: Ethers.js, Web3.js, Web3.py, eth-brownie_

***I've made a simple react front end to interact with the contract and uploaded it into Github Pages. You can access it by clicking in [here](). Feel free to ask me to whitelist and address as a team member to gain access for making reward deposits ;)***

