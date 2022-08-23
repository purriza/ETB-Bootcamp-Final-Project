const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Hairdressing Contract", () => {
  // Sample Products
  const PRODUCT1 = {
    name: "product1",
    description: "Hairdressing product1",
    price: 10,
    durability: 5,
  };
  const PRODUCT2 = {
    name: "product2",
    description: "Hairdressing product2",
    price: 15,
    durability: 3,
  };
  // Sample Service
  const SERVICE = {
    name: "service1",
    description: "Hairdressing service1",
    price: 20,
    duration: 300, // 5 minutes
    products: [{value: 1, label: "Product 1"}, {value: 2, label: "Product 2"}]
  };
  // Sample Booking
  const BOOKING = {
    serviceId: 1
  };

  // Contract object
  let HairdressingContract;

  //  User accounts
  let admin, client1, client2, client3;

  beforeEach(async () => {
    // Get mock user accounts
    [admin, client1, client2, client3] = await ethers.getSigners();
    // Get the contract
    let Hairdressing = await ethers.getContractFactory("Hairdressing");
    // Deploy the contract
    HairdressingContract = await Hairdressing.deploy();
  });

  describe("Product", () => {
    it("Should create a product", async () => {
      // Create a product
      const productTx = await HairdressingContract.createProduct(
        PRODUCT1.name,
        PRODUCT1.description,
        PRODUCT1.price,
        PRODUCT1.durability
      );

      const timeStamp = (await ethers.provider.getBlock(productTx.blockNumber))
        .timestamp;

      // Get the products
      const products = await HairdressingContract.getProducts();

      // Validate if product is stored correctly
      expect(products.length).to.be.equal(1);
      expect(products[0].name).to.be.equal(PRODUCT1.name);
      expect(products[0].description).to.be.equal(PRODUCT1.description);
      expect(products[0].price).to.be.equal(PRODUCT1.price);
      expect(products[0].durability).to.be.equal(PRODUCT1.durability);
      //expect(products[0].auctionEnd).to.be.equal(timeStamp + AUCTION.duration);
    });

    it("Should NOT create a product if not admin", async () => {
      await expect(
        HairdressingContract.connect(client1).createProduct(
          PRODUCT1.name,
          PRODUCT1.description,
          PRODUCT1.price,
          PRODUCT1.durability
        )
      ).to.be.revertedWith("Only admin");
    });
  });

  describe("Service", () => {
    it("Should create a service", async () => {
      // Create a service
      await HairdressingContract.createService(
        SERVICE.name,
        SERVICE.description,
        SERVICE.price,
        SERVICE.duration,
        SERVICE.products
      );

      const services = await HairdressingContract.getServices();

      expect(services.length).to.be.equal(1);
      expect(services[0].name).to.be.equal(SERVICE.name);
      expect(services[0].description).to.be.equal(SERVICE.description);
      expect(services[0].price).to.be.equal(SERVICE.price);
      expect(services[0].duration).to.be.equal(SERVICE.duration);
      //expect(services[0].productsId.length).to.be.equal(2);
      expect(services[0].productIds[0]).to.be.equal(SERVICE.products[0].value);
      expect(services[0].productNames[0]).to.be.equal(SERVICE.products[0].label);
      expect(services[0].productIds[1]).to.be.equal(SERVICE.products[1].value);
      expect(services[0].productNames[1]).to.be.equal(SERVICE.products[1].label);
    });

    it("Should NOT create a service if not admin", async () => {
      await expect(
        HairdressingContract.connect(client1).createService(
          SERVICE.name,
          SERVICE.description,
          SERVICE.price,
          SERVICE.duration,
          SERVICE.products
        )
      ).to.be.revertedWith("Only admin");
    });

    it("Should NOT create a service if duration not between 5 minutes and 2 hours", async () => {
      await expect(
        HairdressingContract.createService(
          SERVICE.name,
          SERVICE.description,
          SERVICE.price,
          240, // 4 minutes 
          SERVICE.products
        )
      ).to.be.revertedWith("Duration should be between 5 minutes and 2 hours");
    })
  })

  describe("Booking", () => {
    beforeEach(async () => {
      await HairdressingContract.createService(
        SERVICE.name,
        SERVICE.description,
        SERVICE.price,
        SERVICE.duration,
        SERVICE.products
      );
    });

    it("Should create booking", async () => {
      const serviceTx = await HairdressingContract.createService(
        SERVICE.name,
        SERVICE.description,
        SERVICE.price,
        SERVICE.duration,
        SERVICE.products
      );

      const timeStamp = (await ethers.provider.getBlock(serviceTx.blockNumber))
        .timestamp;

      await HairdressingContract.connect(client1).createBooking(
          timeStamp,
          1
      );

      const bookings = await HairdressingContract.getBookings();

      await expect(bookings.length).to.be.equal(1);
      await expect(bookings[0].serviceId).to.be.equal(1);
      await expect(bookings[0].date).to.be.equal(timeStamp);
      await expect(bookings[0].client).to.be.equal(client1.address);

      const clientBookings = await HairdressingContract.getUserBookings(client1.address);

      await expect(clientBookings.length).to.be.equal(1);
      await expect(clientBookings[0].serviceId).to.be.equal(1);
      await expect(clientBookings[0].date).to.be.equal(timeStamp);
      await expect(clientBookings[0].client).to.be.equal(client1.address);
    });

    it("Should NOT create booking if service does not exist", async () => {
      await expect(
        HairdressingContract.connect(client1).createBooking(
          1638352800,
          2
        )
      ).to.be.revertedWith("Service does not exist");
    });

  });

  /*describe("Trade", () => {
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
  });*/

});
