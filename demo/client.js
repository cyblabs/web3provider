const ethUtil = require('ethereumjs-util');
const { signing } = require('eth-lightwallet');
const HttpHeaderProvider = require('httpheaderprovider');
const Web3 = require('web3');
let web3 = new Web3();

const config = require('./client_config.json');

const sign = (msg, privateKey) => {
    const signedMsg = ethUtil.ecsign(ethUtil.toBuffer(msg), Buffer.from(privateKey, 'hex'))
    return signing.concatSig(signedMsg);
}

const getRandomBlockNumber = () => {
    return Math.floor(Math.random() * 3000000);
}

let requestID = 1;

const getData = (id) =>
    new Promise(resolve => 
        setTimeout(() => {
            let headers = { "ProviderAuth": config.publicKey+":"+id.toString()+":"+sign(web3.utils.soliditySha3(id), config.privateKey) };
            console.log("HEADERS: ", headers);
            console.log("REQUEST ID: ", id);
            let provider = new HttpHeaderProvider(config.web3Provider, headers);
            web3.setProvider(provider);
            let blockNumber = getRandomBlockNumber();
            web3.eth.getBlock(blockNumber, function (error, result) {
            	if (!error) {
            		console.log('[REQ] BLOCK NUMBER: ', blockNumber); 
                    console.log('[RES] BLOCK HASH: ', result.hash); 
                    console.log('__________________\n'); 
                    requestID+=1;
                    resolve();
                } else { 
                    console.log('[!] Huston we have a promblem: ');
                    resolve();
                }
            })
    }, 1000))

const loop = async (id) => {
    while (requestID != 100) {
        await getData(requestID);
    }
}

loop(requestID).then(() => console.log('[OK] DONE'));