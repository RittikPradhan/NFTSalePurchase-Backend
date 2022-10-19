
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
        try {
            createListing(client, event);
        }
        catch (e) {
            console.error(e);
        }  
    }
)
.on("connected", (subscriptionId) => {
    console.log({ subscriptionId });
  });


dexContract.events.SellNFT(

    (error, event) => {
        try {
            createListing(client, event);
        }
        catch (e) {
            console.error(e);
        }  
    }
)
.on("connected", (subscriptionId) => {
    console.log({ subscriptionId });
});

async function createListing(client, event) {
    client.connect();
    const eventDetails = {
        txHash : event.transactionHash,
        blockNumber : event.blockNumber.toString(),
        ownerAddress : event.returnValues.owner,
        tokenId : event.returnValues.tokenId,
        eventName : event.event,
        eventDate : new Date(Date.now()).toLocaleString()
    }
    console.log(eventDetails);
    const checkDuplicateTxHash = await client.db("SalePurchase").collection("OwnerHistory").findOne({
        txHash : eventDetails.txHash
    });

    if(checkDuplicateTxHash === null) {
        const result = await client.db("SalePurchase").collection("OwnerHistory").insertOne(eventDetails);
        console.log(`New Listing created with following Id: ${result.insertedId}`);
    }
    else {
        console.log("Hash Already Exists.");
    }
}

