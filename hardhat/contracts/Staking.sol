// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ERC20, Ownable {
    using SafeERC20 for IERC20;

    mapping(address => uint256) public stakingBalance;

    event tokenMinted(address receiver, uint256 amountMinted);

    event stakingBalanceUpdate(address account, uint256 value);

    constructor() ERC20("djeToken", "DTK") {
        _mint(msg.sender, 1000000 ether);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit tokenMinted(to, amount);
    }

    function stake(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "not enough token");

        transfer(address(this), amount);

        stakingBalance[msg.sender] += amount;

        emit stakingBalanceUpdate(msg.sender, stakingBalance[msg.sender]);
    }

    function unstake(IERC20 token, uint256 amount) external {
        require(stakingBalance[msg.sender] >= amount, "not enough token");

        token.safeTransfer(msg.sender, amount);

        stakingBalance[msg.sender] -= amount;

        emit stakingBalanceUpdate(msg.sender, stakingBalance[msg.sender]);
    }

    function getStakedBalance(address _address) public view returns (uint256) {
        return stakingBalance[_address];
    }

    receive() external payable {}
}
