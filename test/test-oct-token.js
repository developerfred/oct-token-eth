const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OctToken", function () {
  it("Testing scenario for contract 'OctToken'", async function () {
    const OctToken = await ethers.getContractFactory("OctToken");
    const oct = await OctToken.deploy();
    await oct.deployed();

    expect(await oct.totalSupply()).to.equal(100000000);

    const [owner, account1, account2] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    const address1 = await account1.getAddress();
    const address2 = await account2.getAddress();

    console.log('Address of owner: %s', ownerAddress);
    expect(await oct.balanceOf(ownerAddress)).to.equal(100000000);

    console.log('Transfer 20000000 from %s to %s', ownerAddress, address1);
    var tx = await oct.transfer(address1, 20000000);
    await tx.wait();
    expect(await oct.balanceOf(address1)).to.equal(20000000);

    console.log('Transfer 30000000 from %s to %s', ownerAddress, address2);
    tx = await oct.transfer(address2, 30000000);
    await tx.wait();
    expect(await oct.balanceOf(address2)).to.equal(30000000);

    console.log('Transfer 5000000 from %s to %s while transfer is locked, should fail.', address1, address2);
    await oct.connect(account1).transfer(address2, 5000000).catch((error) => {
      console.log('Successfully catched error: %s', error);
    });

    console.log('Unlock transfer.')
    tx = await oct.connect(owner).unlockTransfer();
    await tx.wait();

    console.log('Transfer 5000000 from %s to %s while transfer is unlocked, should success.', address1, address2);
    tx = await oct.connect(account1).transfer(address2, 5000000);
    await tx.wait();
    expect(await oct.balanceOf(address1)).to.equal(15000000);
    expect(await oct.balanceOf(address2)).to.equal(35000000);

    console.log('Transfer 10000000 from %s to %s while transfer is unlocked, should success.', address2, address1);
    tx = await oct.connect(account2).transfer(address1, 10000000);
    await tx.wait();
    expect(await oct.balanceOf(address1)).to.equal(25000000);
    expect(await oct.balanceOf(address2)).to.equal(25000000);
  });
});
