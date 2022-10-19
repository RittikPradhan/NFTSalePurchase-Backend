
const Web3 = require("web3");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const ALCHEMY_PROVIDER = `${process.env.url}`;
const web3 = new Web3(new Web3.providers.WebsocketProvider(ALCHEMY_PROVIDER));

const Address = "0x4838c7eB52eDf90489DEB5e86ECfc16bF4797E9D";
const ABI = require("../build/ABI.json");

const dexContract = new web3.eth.Contract(ABI, Address);

const uri = "mongodb+srv://0xrittikpradhan:s3ni79lQcElpJS4v@cluster0.fuglox2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

//

dexContract.events.BuyNFT(

    (error, event) => {
        console.log(event);
    }
)
.on("connected", (subscriptionId) => {
    console.log({ subscriptionId });
  });


dexContract.events.SellNFT(

    (error, event) => {
        console.log(event);
    }
)
.on("connected", (subscriptionId) => {
    console.log({ subscriptionId });
});

