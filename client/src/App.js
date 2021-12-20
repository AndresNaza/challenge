import React, { Component } from "react";
import LiquidityPoolContract from "./contracts/LiquidityPool.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, 
            pooladdress: null, poolamountstacked: null, poolamountreward: null, 
            investoraccount: null, investoramountstacked: null, investoramountreward: null,
            depositvalue: null, rewardvalue: null , 
            teamhelper: null};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = LiquidityPoolContract.networks[networkId];
      const instance = new web3.eth.Contract(
        LiquidityPoolContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, 
                      pooladdress: deployedNetwork.address, 
                      depositvalue:0, rewardvalue: 0}, this.updateContractTotals);


    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  
  updateContractTotals = async () => {   
    const { accounts, contract } = this.state;
    const totalstake = await contract.methods.getTotalStake().call();
    const totalrewards = await contract.methods.getTotalRewards().call();
    const investorstake = await contract.methods.getParticipantStake(String(accounts)).call();
    const investorreward = await contract.methods.getParticipantEstimatedReward(String(accounts)).call();
    this.setState({poolamountstacked: totalstake, poolamountreward: totalrewards,
                  investoramountstacked:investorstake, investoramountreward: investorreward});
  };


  listentoPoolEvents =  async() => {
    const { contract } = this.state;
    await contract.events.PoolEvent().on("data", this.updateContractTotals);
  };

  handleDepositValue = (e) => {
    this.setState({depositvalue: e.target.value});
  }

  handleRewardValue = (e) => {
    this.setState({rewardvalue: e.target.value});
  }

  handleTeamAddressValue = (e) => {
    this.setState({teamhelper: e.target.value});
  }

  handleDeposit = async () => {
    const { accounts, contract , depositvalue} = this.state;
    await contract.methods.depositStake().send({from: accounts[0], value: depositvalue});
    const responseParticipant = await contract.methods.getParticipantStake(accounts[0]).call();
    const responseTotal = await contract.methods.getTotalStake().call();
    this.setState({investoramountstacked: responseParticipant, poolamountstacked:responseTotal})
  }

  handleWithdraw = async () => {
    const { accounts, contract } = this.state;
    await contract.methods.withdrawStakeAndReward().send({from: accounts[0]});
    const responseParticipant = await contract.methods.getParticipantStake(accounts[0]).call();
    const responseTotal = await contract.methods.getTotalStake().call();
    const responseRewards = await contract.methods.getTotalRewards().call();
    const investorreward = await contract.methods.getParticipantEstimatedReward(String(accounts)).call();
    this.setState({investoramountstacked: responseParticipant, investoramountreward: investorreward,
                  poolamountstacked:responseTotal, poolamountreward: responseRewards})
  }

  handleReward = async () => {
    const { accounts, contract , rewardvalue} = this.state;
    await contract.methods.distributeReward().send({from: accounts[0], value: rewardvalue});
    const response = await contract.methods.getTotalRewards().call();
    const investorreward = await contract.methods.getParticipantEstimatedReward(String(accounts)).call();
    this.setState({poolamountreward: response, investoramountreward: investorreward})
  }
  
  handleTeamHelpers = async () => {
    const { accounts, contract, teamhelper } = this.state;
    await contract.methods.addTeamHelper(teamhelper).send({from: accounts[0]});
  }
  

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div id="titles">
        <h1>Smart Contract Challenge - Exactly Finance</h1>
        <h2>Interact with ETH Pool Contract</h2>
        </div>

        <hr></hr>
        
        <h3>ETH Pool status</h3>
        <h4>Address of the contract: {this.state.pooladdress}</h4>
        <h4>Total ETH (in wei) stacked in the pool: {this.state.poolamountstacked} </h4>
        <h4>Total rewards (in wei) in the pool: {this.state.poolamountreward} </h4>

        <hr></hr>

        <h3>Investor</h3>
        <h4>Connected with account: {this.state.accounts}</h4>
        <h4>Total ETH (in wei) that the account holds in the pool: {this.state.investoramountstacked} </h4>
        <h4>Total rewards (in wei) that the account is able to claim: {this.state.investoramountreward}</h4>
        <p>
          Choose the amount of ether to send to the contract. 
          <br></br><br></br>
          After the ETHPool team deposits the rewards each week, you'll be able to withdraw your deposit PLUS your rewards. 
          If you need to take your deposits before the rewards are deposited, you'll be able to do so, but with no reward associated.
        </p>

        <h4>Deposit ETH: Type the amount of ETH (in wei) to deposit</h4>
        <span>     
          <input type="number" placeholder="Enter amount of wei you want to deposit" onChange={this.handleDepositValue} ></input>
          <button onClick={this.handleDeposit}>Deposit</button>
        </span>
        <h4>Withdraw ETH: Click to claim your deposit funds and rewards: </h4>
        <span>
          <button onClick={this.handleWithdraw}>Withdraw</button>
        </span>

        <hr></hr>

        <h3>ETH Pool Team</h3>
        <h4>Deposit the rewards for this week (only from accounts enabled by the owner):</h4>
        <span>
          <input type="number" placeholder="Enter reward amount (in wei)" onChange={this.handleRewardValue} ></input>
          <button onClick={this.handleReward}>Deposit rewards</button>
        </span>
        <h4>Whitelist new account for ETH Pool Team (only owner):</h4>
        <span>
          <input type="text" placeholder="Team helper address" onChange={this.handleTeamAddressValue} ></input>
          <button onClick={this.handleTeamHelpers}>Whitelist new address</button>
        </span>
      </div>
    );
  }
}

export default App;
