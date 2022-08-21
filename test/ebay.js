const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Ebay Contract", () => {
  // Sample auction
  const AUCTION = {
    name: "auction1",
    description: "Selling item1",
    min: 10,
    duration: 86400000 + 1,
  };

  // Contract object
  let EbayContract;

  //  User accounts
  let seller, buyer1, buyer2, random;

  beforeEach(async () => {
    // Get mock user accounts
    [seller, buyer1, buyer2, buyer3, buyer4, random] = await ethers.getSigners();
    // Get the contract
    let Ebay = await ethers.getContractFactory("Ebay");
    // Deploy the contract
    EbayContract = await Ebay.deploy();
  });

  describe("Auction", () => {
    it("Should create an auction", async () => {
      let auctions;

      // create auction
      const auctionTx = await EbayContract.createAuction(
        AUCTION.name,
        AUCTION.description,
        AUCTION.min,
        AUCTION.duration
      );

      const timeStamp = (await ethers.provider.getBlock(auctionTx.blockNumber))
        .timestamp;

      // get the auction
      auctions = await EbayContract.getAuctions();

      // Validate if auction is stored correctly
      expect(auctions.length).to.be.equal(1);
      expect(auctions[0].name).to.be.equal(AUCTION.name);
      expect(auctions[0].description).to.be.equal(AUCTION.description);
      expect(auctions[0].seller).to.be.equal(seller.address);
      expect(auctions[0].minimumOfferPrice).to.be.equal(AUCTION.min);
      expect(auctions[0].auctionEnd).to.be.equal(timeStamp + AUCTION.duration);

      // get auction for the seller
      auctions = await EbayContract.getUserAuctions(seller.address);
      expect(auctions.length).to.be.equal(1);
      expect(auctions[0].name).to.be.equal(AUCTION.name);
      expect(auctions[0].description).to.be.equal(AUCTION.description);
      expect(auctions[0].seller).to.be.equal(seller.address);
      expect(auctions[0].minimumOfferPrice).to.be.equal(AUCTION.min);
      expect(auctions[0].auctionEnd).to.be.equal(timeStamp + AUCTION.duration);
    });

    /*it("Should NOT create an auction if duration is NOT between 1-10 days", async () => {
      //  Duration less than 1 day
      await expect(
        EbayContract.createAuction(
          AUCTION.name,
          AUCTION.description,
          AUCTION.min,
          1
        )
      ).to.be.revertedWith("Duration should be between 1 to 10 days");*/

      /*//   Duration more than 10 days
      await expect(
        EbayContract.createAuction(
          AUCTION.name,
          AUCTION.description,
          AUCTION.min,
          AUCTION.duration * 10
        )
      ).to.be.revertedWith("Duration should be between 1 to 10 days");
    });*/
  });

  describe("Offer", () => {
    let auction;

    beforeEach(async () => {
      // Create a new auction
      await EbayContract.createAuction(
        AUCTION.name,
        AUCTION.description,
        AUCTION.min,
        AUCTION.duration
      );
    });

    it("Should create offer", async () => {
      await EbayContract.connect(buyer1).createOffer(1, { value: AUCTION.min });

      const userOffers = await EbayContract.getUserOffers(buyer1.address); // No es posible acceder al mapping directamente porque es private
      await expect(userOffers.length).to.be.equal(1);
      await expect(userOffers[0].id).to.be.equal(1);
      await expect(userOffers[0].auctionId).to.be.equal(1);
      await expect(userOffers[0].buyer).to.be.equal(buyer1.address);
      await expect(userOffers[0].offerPrice).to.be.equal(AUCTION.min);
    });

    it("Should NOT create offer if auction does not exist", async () => {
      await expect(
        EbayContract.connect(buyer1).createOffer(2, {
          value: AUCTION.min,
        })
      ).to.be.revertedWith("Auction does not exist");
    });

    it("Should NOT create offer if auction has expired", async () => {
      //  Increase time to 10 seconds after duration
      await network.provider.send("evm_increaseTime", [AUCTION.duration + 10]);
      await network.provider.send("evm_mine");

      await expect(
        EbayContract.connect(buyer1).createOffer(1, {
          value: AUCTION.min,
        })
      ).to.be.revertedWith("Auction expired");
    });

    /*it("Should NOT create offer if price too low", async () => {
      //  Price less than min
      await expect(
        EbayContract.connect(buyer4).createOffer(1, {
          value: AUCTION.min - 1,
        })
      ).to.be.revertedWith(
        "Price should be greater than minimum offer price and the best offer"
      );

      // New Offer
      const bestOffer = AUCTION.min + 10;
      await EbayContract.connect(buyer1).createOffer(1, {
        value: bestOffer,
      });
      // Price less than best offer
      await expect(
        EbayContract.connect(buyer1).createOffer(1, {
          value: bestOffer - 1,
        })
      ).to.be.revertedWith(
        "Price should be greater than minimum offer price and the best offer"
      );
    });*/
  });

  describe("Trade", () => {
    beforeEach(async () => {
      // Create a new auction
      await EbayContract.createAuction(
        AUCTION.name,
        AUCTION.description,
        AUCTION.min,
        AUCTION.duration
      );
    });
    it("Should trade", async () => {
      const bestPrice = AUCTION.min + 10;

      // PUI: In order to check if the buyer1 (who didnt won the auction) has received his money back
      const balanceBeforeOfferBuyer1 = await ethers.provider.getBalance(buyer1.address);
      const balanceBeforeOfferBuyer2 = await ethers.provider.getBalance(buyer2.address);

      await EbayContract.connect(buyer1).createOffer(1, {
        value: AUCTION.min,
      });
      await EbayContract.connect(buyer2).createOffer(1, {
        value: bestPrice,
      });

      const balanceBefore = await ethers.provider.getBalance(seller.address);

      //  Increase time to 10 seconds after duration
      await network.provider.send("evm_increaseTime", [AUCTION.duration + 10]);
      await network.provider.send("evm_mine");

      //dont want to deduct gas fee from buyer account for easy balance comparison
      //so I send tx from a random address
      await EbayContract.connect(random).trade(1);
      const balanceAfter = await ethers.provider.getBalance(seller.address);
      await expect(balanceAfter.sub(balanceBefore).toNumber()).equal(bestPrice);

      // PUI: Check if buyer1 has received his money back TO-DO
      const balanceAfterOfferBuyer1 = await ethers.provider.getBalance(buyer1.address);
      const balanceAfterOfferBuyer2 = await ethers.provider.getBalance(buyer2.address);
      console.log("Buyer's 1 balance after offer:", ethers.utils.formatEther(balanceAfterOfferBuyer1.toString()));
      console.log("Buyer's 2 balance after offer:", ethers.utils.formatEther(balanceAfterOfferBuyer2.toString()));

      //await expect(balanceBeforeOfferBuyer1).to.equal(balanceAfterOfferBuyer1);
      //await expect(balanceBeforeOfferBuyer2).to.equal(balanceAfterOfferBuyer2);
    });

    it("should NOT trade if auction does not exist", async () => {
      await expect(EbayContract.trade(2)).to.be.revertedWith(
        "Auction does not exist"
      );
    });
  });

  describe("Cancel", () => {
    beforeEach(async () => {
      EbayContract.createAuction(
        AUCTION.name,
        AUCTION.description,
        AUCTION.min,
        AUCTION.duration
      );
    });

    it("Should cancel", async () => {
      await EbayContract.connect(buyer1).createOffer(1, {
        value: AUCTION.min
      });

      const balanceBeforeCancelBuyer1 = await ethers.provider.getBalance(buyer1.address);

      await EbayContract.cancelAuction(1);
      const auctions = await EbayContract.getAuctions();
      const userAuctions = await EbayContract.getUserAuctions(seller.address);
      const userOffers = await EbayContract.getUserOffers(buyer1.address);

      await expect(auctions[0].id).to.equal(0);
      await expect(userAuctions[0].id).to.equal(0);
      await expect(userOffers[0].id).to.equal(0);

      const balanceAfterCancelBuyer1 = await ethers.provider.getBalance(buyer1.address);
      //await expect(balanceBeforeCancelBuyer1).to.equal(balanceAfterCancelBuyer1);
    });

    /*if("Should not cancel if auction has expired", async () => {
      //  Increase time to 10 seconds after duration
      await network.provider.send("evm_increaseTime", [AUCTION.duration + 10]);
      await network.provider.send("evm_mine");

      await expect(EbayContract.cancelAuction(1)).to.be.revertedWith(
        "The auction has expired"
      );
    });*/

  });

  describe("Outbid", () => {
    beforeEach(async () => {
      EbayContract.createAuction(
        AUCTION.name,
        AUCTION.description,
        AUCTION.min,
        AUCTION.duration
      );
    });

    if("Should outbid", async () => {
      await EbayContract.connect(buyer1).createOffer(1, {
        value: AUCTION.min
      });
      await EbayContract.connect(buyer1).createOffer(1, {
        value: 10
      });

      const auctions = await EbayContract.getAuctions();
      await expect(auctions[0].minimumOfferPrice).to.equal(21);
    });
  });

});
