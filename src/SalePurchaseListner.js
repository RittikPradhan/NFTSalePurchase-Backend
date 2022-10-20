
const Web3 = require("web3");
const express = require("express");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const ALCHEMY_PROVIDER = `${process.env.url}`;
const web3 = new Web3(new Web3.providers.WebsocketProvider(ALCHEMY_PROVIDER));

const Address = "0xDfB98072A198c86209436733A7d7AEaF4e4bBa53";
const ABI = require("../build/ABI.json");

const dexContract = new web3.eth.Contract(ABI, Address);

const uri = "mongodb+srv://0xrittikpradhan:s3ni79lQcElpJS4v@cluster0.fuglox2.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const port = process.env.PORT || 3000;
const app = express();

//API to get BuySell History 

app.get("/getBuySellHistory/:address", async (req, res) => {
    if(req.params.address) {
        const address = req.params.address;
        const data = await getAddressHistory(client, address);
        return res.send(data);
    }
});

async function getAddressHistory(client, address) {
    const arr = [];
    const cursor = await client.db("SalePurchase").collection("OwnerHistory").find({ownerAddress : address});

    if(await cursor.hasNext()) {
        cursor.forEach(element => {
            arr.push({"eventName" : element.eventName, 
                "user " : element.ownerAddress, 
                "txHash" : element.txHash, 
                "tokenId" : element.tokenId,
                "blockNumber" : element.blockNumber, 
                "eventTimestamp" : element.eventTimestamp});
        });
    }
    return arr;
}

//EventListner

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
        eventTimestamp : + new Date()/1000 //seconds
    }
    // console.log(eventDetails);
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

app.listen(port, () => {
    console.log("Server is live on : " + port);
});

