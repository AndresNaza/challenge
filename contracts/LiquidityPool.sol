// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPool is Ownable{

    uint totalStake;
    uint totalRewards;
    uint lastRewardDate;
    
    struct participantStakes{
        uint stake;
        uint rewardToParticipant;
        uint entryDate;
    }

    mapping (address => participantStakes) participant;

    enum PoolOperations {Deposit, Reward, Withdraw}

    event PoolEvent(address _opAddress, uint _opAmount, uint _opType);

    event TeamHelper(address _helperAddress);

    constructor(){
        totalStake = 0;
        totalRewards = 0;
        lastRewardDate = 0;
    }

    // Mapping and functions to manage ETH Pool Team Helper's addresses
    mapping (address => bool) teamMember;

    function addTeamHelper(address _address) public onlyOwner{
        teamMember[_address] = true;
        emit TeamHelper(_address);
    }

    function removeTeamHelper(address _address) public onlyOwner{
        teamMember[_address] = false;
    }

    modifier onlyOwnerOrHelper() {
        require(msg.sender == owner() || teamMember[msg.sender] == true, "Caller is not the owner nor part of the pool team.");
        _;
    }

    // Deposit stake
    // Increases the stake of sender address by sent amount 
    // If address is new to the pool, asociates that first transaction block's timestamp
    // with and entry date
    function depositStake() public payable{
        participant[msg.sender].stake += msg.value;
        if (participant[msg.sender].entryDate == 0 ){
            participant[msg.sender].entryDate = block.timestamp;
        }
        totalStake += msg.value;
        emit PoolEvent(msg.sender, msg.value, uint(PoolOperations.Deposit));
    }

    // Deposit rewards by the owner or team members.    
    function distributeReward() public payable onlyOwnerOrHelper {
        require(totalStake > 0, "Cannot distribute to staking pool with 0 stake");
        totalRewards += msg.value;
        lastRewardDate = block.timestamp;
        emit PoolEvent(msg.sender, msg.value, uint(PoolOperations.Reward));
    }

    // Withdraw function. 
    function withdrawStakeAndReward() public payable{
        require(participant[msg.sender].stake > 0, "Stake not found for the given address");
        
        uint withdrawRewardAmount = 0;
        
        if (participant[msg.sender].entryDate <= lastRewardDate && participant[msg.sender].entryDate > 0){
            // Multiply for 100 to work with integer numbers 
            uint rewardsPerToken = totalRewards * 100 /totalStake;
            withdrawRewardAmount = participant[msg.sender].stake * rewardsPerToken / 100;
        } 
        
        uint withdrawStakeAmount = participant[msg.sender].stake;
        
        uint totalWithdraw = withdrawStakeAmount + withdrawRewardAmount;
        payable(msg.sender).transfer(totalWithdraw);
        participant[msg.sender].stake -= withdrawStakeAmount;
        participant[msg.sender].entryDate == 0;
        totalRewards -= withdrawRewardAmount;
        totalStake -= withdrawStakeAmount;
        emit PoolEvent(msg.sender, msg.value, uint(PoolOperations.Withdraw));
    }

    // Getter functions

    // Participant's stake
    function getParticipantStake(address _address) public view returns (uint){
        return participant[_address].stake;
    }
    
    // Contract's total stake
    function getTotalStake() public view returns (uint){
        return totalStake;
    }

    // Contract's total rewards
    function getTotalRewards() public view returns (uint){
        return totalRewards;
    }
    
    // Participant's estimated rewards
    function getParticipantEstimatedReward(address _address) public view returns (uint){        
        uint withdrawRewardAmount = 0;

        if (participant[_address].entryDate <= lastRewardDate && participant[_address].entryDate > 0){
            uint rewardsPerToken = totalRewards * 100 /totalStake;
            withdrawRewardAmount = participant[_address].stake * rewardsPerToken / 100;
        } 

        return withdrawRewardAmount;
    }
}