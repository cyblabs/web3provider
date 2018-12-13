const express = require('express')
const Web3 = require('web3');
let app = express()

web3 = new Web3(new Web3.providers.HttpProvider('http://earth.cybernode.ai:34545'));

let requestID = 1;

let abi = [{"constant":true,"inputs":[],"name":"clientAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x2c2ab5ea"},{"constant":true,"inputs":[],"name":"REQUEST_PRICE","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x72ae780a"},{"constant":true,"inputs":[],"name":"web3provider","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x81e014d9"},{"constant":true,"inputs":[],"name":"chargedService","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xa840f37e"},{"constant":true,"inputs":[],"name":"charged","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xcf3bd87b"},{"constant":true,"inputs":[],"name":"timelock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xd33219b4"},{"constant":true,"inputs":[],"name":"clientDeposit","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xf07ff641"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"constant":false,"inputs":[],"name":"subscribeForProvider","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x8f344881"},{"constant":false,"inputs":[{"name":"_amountRequests","type":"uint256"},{"name":"_sig","type":"bytes"}],"name":"chargeService","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xc258d465"},{"constant":false,"inputs":[],"name":"withdrawDeposit","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0x117df088"}];

let address = "0xD1A6EDf462875cD94a996885f71DB41FFceF3Dba";
let web3ProviderContract = new web3.eth.Contract(abi, address);
let clientAddress;
web3ProviderContract.methods.clientAddress().call(function(error, result) {
    console.log("Client Address: ", result);
    clientAddress = result;
});

app.use('/auth', (req, res) => {
    let signatureHeader = req.get('ProviderAuth');
    if (!signatureHeader) return res.status(403).send('Bad/missing ProviderAuth header.')

    let address = signatureHeader.split(':')[0];
    let id = signatureHeader.split(':')[1];
    let sign = signatureHeader.split(':')[2];
    if (!id || !sign || !address) return res.status(403).send('Invalid ProviderAuth header format.')
    if (clientAddress != address) return res.status(403).send('You are not our client.')
    if (id < requestID) return res.status(403).send('Wrong request ID');

    console.log("Header: ", signatureHeader);
    console.log("Address: ", address);
    console.log("ID: ", id);
    console.log("Sign: ", sign);

    if (web3.eth.accounts.recover(web3.utils.soliditySha3(id), sign, true) == address) {
        requestID++;
        console.log("OFF-CHAIN PAYMENT PROOF VERIFIED. ACCESS GRANTED");
        console.log("__________________\n");
        return res.status(200).send('Authorized')
    } else {
        return res.status(403).send("Failed")
    }
})

app.listen(8080, () => {
    console.log('Listening on port ' + 8080)
})