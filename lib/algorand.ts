/* eslint-disable no-console */
import {platform_settings as ps} from './platform-conf'
import algosdk, {LogicSigAccount} from 'algosdk'  
import { NFT } from "./nft";
import { showErrorToaster, showNetworkError, showNetworkSuccess, showNetworkWaiting } from "../src/Toaster";

export const dummy_addr = "b64(YWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWE=)"
export const dummy_id = "b64(AAAAAAAAAHs=)"


type Portfolio = {
    nfts: NFT[]
    tokenBalance: any
    tokenList: any
}

type NFTVault = {
    nfts: NFT[]
}

let client = undefined;
export function getAlgodClient(){
    if(client===undefined){
        const {token, server, port} = ps.algod
        client = new algosdk.Algodv2(token, server, port)
    }
    return client
}

let indexer = undefined;
export function getIndexer() {
    if(indexer===undefined){
        const {token, server, port} = ps.indexer
        indexer = new algosdk.Indexer(token, server, port)
        //indexer = new algosdk.Indexer({ 'X-API-key' : token}, server, port)
    }
    return indexer
}

export async function getLogicFromTransaction(addr: string): Promise<LogicSigAccount> {
    const indexer = getIndexer()
    const txns = await indexer.searchForTransactions()
        .address(addr).do()

    for(let tidx in txns.transactions){
        const txn = txns.transactions[tidx]
        if(txn.sender == addr){
            const program_bytes = new Uint8Array(Buffer.from(txn.signature.logicsig.logic, "base64"));
            return new LogicSigAccount(program_bytes);
        }
    }
    return undefined
}
export async function isOptedIntoApp(address: string): Promise<boolean> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do().then((data) => {
        const optedIn = (data.account['apps-local-state'] !== undefined) ? data.account['apps-local-state'].find((r)=>{ return r.id == ps.application.app_id }) : undefined
        return optedIn !== undefined 
    }).catch((err)=>{ 
        //console.log("error", err)
        return undefined
    })
    return result
}

export async function isOptedIntoStakedAssets(address: string, assets: any): Promise<any> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do()
    const gets = []
    //console.log("address", address)
    //console.log("assets", assets)
    for(let asset in assets){
        const optedIn = result.account['assets'].find((r)=>{ return r['asset-id'] == assets[asset].asset_id })
        if(optedIn !== undefined){
            gets.push({ asset_id: optedIn['asset-id'], optin: false})
        } else {
            gets.push({ asset_id: assets[asset].asset_id, optin: true})
        }
    }
    return getUnique(gets, 'asset_id')
}

export async function isOptedIntoAsset(address: string, idx: number): Promise<boolean> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do().then((data) => {
        const optedIn = (data.account['assets'] !== undefined) ? data.account['assets'].find((r)=>{ return r['asset-id'] == idx }) : undefined
        return optedIn !== undefined 
    }).catch((err)=>{ 
        //console.log("error", err)
        return undefined
    })
    return result 
}

export async function hasNFTKey(address: string): Promise<boolean> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do()
    const hasNFTToken = result.account['assets'].find((r)=>{ return r['asset-id'] == ps.application.nftkey_id })
    return hasNFTToken !== undefined
}

export async function getWalletAssetData(address: string, tokens: any): Promise<any> {
    const indexer  = getIndexer()
    const assets = []
    const tokenBal = []
    const walletAssets = []
    const optOutAssets = []
    const dripAssets = []
    const dripAssetsSrc = [
        {id: 1, tokenunit: 'FEATHERS', asset_id: 1091143717},
      ];
    const result = await indexer.lookupAccountByID(address).do().then((data) => {
        return data
    }).catch((err)=>{ 
        //console.log("error", err)
        return undefined
    })
    for(let drip in dripAssetsSrc){
        const optedIn = (result !== undefined) ? result.account['assets'].find((r)=>{ return r['asset-id'] == dripAssetsSrc[drip].asset_id }) : undefined
        if(optedIn !== undefined){
            dripAssets.push({ id: dripAssetsSrc[drip].id, asset_id: optedIn['asset-id'], optin: false})
        } else {
            dripAssets.push({ id: dripAssetsSrc[drip].id, asset_id: dripAssetsSrc[drip].asset_id,  optin: true})
        }
    }
    let algoBalance = 0
    if(result !== undefined) {
        algoBalance = result.account['amount']
        for(let asset in result.account['assets']){
            assets.push({ asset_id: result.account['assets'][asset]['asset-id'], optin: false})
            if(result.account['assets'][asset]['amount']>0){
                walletAssets.push({ asset_id: result.account['assets'][asset]['asset-id'], amount: result.account['assets'][asset]['amount']})
            } else {
                optOutAssets.push({ asset_id: result.account['assets'][asset]['asset-id'], amount: result.account['assets'][asset]['amount']})
            }
        }
    }
    for(let token in tokens){
        const tokenMatch = (result !== undefined) ? result.account['assets']?.find((r)=>{ return r['asset-id'] == tokens[token].asset_id }) : undefined
        tokenBal.push({ asset_id: tokens[token].asset_id, 
                        balance:(tokenMatch !== undefined)? tokenMatch['amount'] : 0, 
                        name: tokens[token].name, 
                        image: tokens[token].image, 
                        unitname: tokens[token].unitname, 
                        isactive: tokens[token].isactive, 
                        ispayment: tokens[token].ispayment, 
                        decimal: tokens[token].decimal, 
                        creator: tokens[token].creator_wallet,
                        rate: tokens[token].rate //'Loading...' //(data)? data.price.toFixed(3) : 
        })
        //console.log("tokenBal", tokenBal)
    } 
    return { walletassets: walletAssets, dripAssets: dripAssets, optoutassets: optOutAssets, assets: assets, tokenBal: tokenBal, algoBalance: algoBalance }
}


export async function checkWalletAssets(address: string, tokens: any): Promise<any> {
    const indexer  = getIndexer()
    const result = await indexer.lookupAccountByID(address).do().then((data) => {
        return data
    }).catch((err)=>{ 
        console.log("checkWalletAssets", err)
        return undefined
    })
    const gets = []
    const tokenBal = []
    const walletAssets = []
    
    //console.log("checkWalletAssets", result)
    if(result !== undefined) {
        for(let asset in result.account['assets']){
            gets.push({ asset_id: result.account['assets'][asset]['asset-id'], optin: false})
            if(result.account['assets'][asset]['amount']>0){
                walletAssets.push({ asset_id: result.account['assets'][asset]['asset-id'], amount: result.account['assets'][asset]['amount']})
            }
        }
    }

    for(let token in tokens){
       const tokenMatch = (result !== undefined) ? result.account['assets'].find((r)=>{ return r['asset-id'] == tokens[token].asset_id }) : undefined
       
       if(tokenMatch !== undefined){
            tokenBal.push({ asset_id: tokenMatch['asset-id'], 
                            balance: tokenMatch['amount'], 
                            name: tokens[token].name, 
                            unitname: tokens[token].unitname, 
                            id: tokens[token].id, 
                            isactive: tokens[token].isactive, 
                            ispayment: tokens[token].ispayment, 
                            isredeem: tokens[token].isredeem, 
                            decimal: tokens[token].decimal, 
                            creator: tokens[token].creator_wallet,
                            rate: tokens[token].rate
            })
       }
    }
    //return gets
    return { assets: gets, tokenBal: tokenBal, algoBalance: (result !== undefined) ? result.account['amount'] : 0 }
}
export async function getAvailablePools(addr: string, verifiedWallets: any, whitelistAsa: any, tokens: any): Promise<Portfolio> {
    const indexer  = getIndexer()
    const portfolio: Portfolio = {nfts:[], tokenBalance:0, tokenList:[]}
    //console.log("wallet-verifiedWallets",verifiedWallets)
    //console.log("wallet-whitelistAsa",whitelistAsa)
    let acct = undefined
    try{
        const accountInfo = await indexer.lookupAccountByID(addr).do()
        acct  = accountInfo.account
    } catch(error) {
        console.log("walletwallet-error: addy: " + addr, error)
        return portfolio
    }
    const np = []
    //FYI we cannot use multi print nfts on our system
    //clean up json to array with just the asset_id
    let cleanedAssets = whitelistAsa.reduce((pre, cur) => {
        //pre.push(cur['asset_id'])
        pre.push({ asset_id: cur['asset_id'], amount: 1, collection_id: cur['collection_id']})
        return pre
    }, [])
    
    let indexes: any = Array.from(new Set(cleanedAssets))
    //console.log("wallet-allowed_indexes",indexes)

/*     let allowed_nft_array = acct['assets'].reduce((pre, cur) => {
        //indexes.has(cur['asset-id']) && pre.push(cur, indexes)
        //console.log("wallet-cur", cur)
        if(cur['amount'] >= 0) {
            const index2 = indexes.map((item: any) => item?.asset_id).indexOf(cur['asset-id']);
            (index2>=0) && pre.push(indexes[index2])
        }
        return pre
    }, []) */

/*     let allowed_nft_array = acct['assets'].reduce((pre, cur) => {
        const index2 = indexes.map((item: any) => item?.asset_id).indexOf(cur['asset-id']);
        
        let notoptin = true; // Assume not opted in initially
        
        if (cur['amount'] >= 0 && index2 >= 0) {
            notoptin = false; // Set to false if opted in
            pre.push(indexes[index2]);
        }
        
        pre.push({
            "asset_id": cur['asset-id'],
            "amount": cur['amount'],
            "collection_id": cur['collection_id'],
            "notoptin": notoptin
        });
        
        return pre;
    }, []); */

    // Step 2 and 3: Iterate through the whitelist and update allowed_nft_array
    let allowed_nft_array = whitelistAsa.map((pool) => {
        const index2 = indexes.map((item: any) => item?.asset_id).indexOf(pool['asset_id']);
        const walletAsset = acct['assets'].find((asset) => asset['asset-id'] === pool['asset_id']);

        if (walletAsset) {
            return {
                "asset_id": pool['asset_id'],
                "amount": 1,//walletAsset['amount']
                "collection_id": pool['collection_id'],
                "notoptin": false
            };
        } else {
            return {
                "asset_id": pool['asset_id'],
                "amount": 0, // No balance in wallet
                "collection_id": pool['collection_id'],
                "notoptin": true
            };
        }
    })

    console.log("wallet-allowed_nft_array",allowed_nft_array)
    for(let aidx in allowed_nft_array) {
    //for(let aidx in acct['assets']) {
        const ass = allowed_nft_array[aidx]
        //if (ass.amount == 0) continue
        //this was the first NFT we minted 639771578 so we dont care about skimming over any PRIOR ones
        //if (ass['asset-id'] < 639771578) continue
        try {
            //console.log("walletwallet-nft-lookup")
            np.push(tryGetNFT(ass['asset_id'], ass['amount'], ass['collection_id'], verifiedWallets, tokens, acct).then((nft)=>{
                //console.log("walletwallet-nft",nft)
                if (nft !== undefined) portfolio.nfts.push(nft)
                if (nft?.tokenBalance > 0 ) portfolio.tokenBalance = nft.tokenBalance
            }))
        } catch(error) {
            showErrorToaster("couldn't parse nft for asset: "+ ass['asset_id'])
        }
    }
    await Promise.all(np)

    return await portfolio
}

export async function getVaultNFTs(walletAssets: any): Promise<NFTVault> {
    const indexer  = getIndexer()
    const vaults: NFTVault = {nfts:[]}
    let acct = undefined
    const np = []
    const remainingAssets = walletAssets.filter(asset => asset.asset_id >= 1706553331)
    //console.log("data walletAssets", walletAssets)
    console.log("data getVaultNFTs", remainingAssets)
    for(let aidx in remainingAssets) {
            const asa = remainingAssets[aidx]
            try {
                np.push(tryGetNFTVault(asa['asset_id'], asa['amount']).then((nft)=>{
                    console.log("walletwallet-nft",nft)
                    if (nft !== undefined) vaults.nfts.push(nft)
                }))
            } catch(error) {
                showErrorToaster("couldn't parse nft for asset: " + asa['asset_id'])
            }
        }
    await Promise.all(np)
    return vaults
}

export async function tryGetNFTVault(asset_id: number, amount: number): Promise<NFT> {
    try {
        const vault = await getVaultInfo(asset_id, amount)
        return await NFT.fromVaultInfo(vault)
    } catch (error) { 
        //showErrorToaster("Cant find asset_id: " + asset_id)
        console.error("tryGetNFTVault - Cant find asset_id: ", asset_id + ": " + error);
    }
    return undefined 
}

export async function tryGetNFT(asset_id: number, amount: number, collection_id: string, verifiedWallets: any, tokens: any, accountInfo: any): Promise<NFT> {
    try {
        const token = await getToken(asset_id, amount, collection_id, verifiedWallets, tokens, accountInfo)
        //console.log("tryGetNFTadsadadsa", token)
        //console.log("tryGetNFTadsadadsa asset_id", asset_id)
        //console.log("tryGetNFTadsadadsa", token.tokenBal.filter(t => t.asset_id === asset_id)[0]?.balance)
        return await NFT.fromTokenAndLP(token.lookupAssetByID, token.tokenBal.filter(t => t.asset_id === asset_id)[0]?.balance)
        //return await NFT.fromTokenAndLP(await getToken(asset_id, amount, collection_id, verifiedWallets))
    } catch (error) { 
        //showErrorToaster("Cant find asset_id: " + asset_id)
        //console.error("tryGetNFT - Cant find asset_id: ", asset_id + ": " + error);
    }

    return undefined 
}

export async function getVaultInfo(asset_id: number, amount: number): Promise<any> {
    const indexer  = getIndexer()
    const lookupAssetByID = await indexer.lookupAssetByID(asset_id).do()
    return await lookupAssetByID.asset
}
export async function getToken(asset_id: number, amount: number, collection_id: string, verifiedWallets: any, tokens: any, accountInfo: any): Promise<any> {
    
    const indexer  = getIndexer()
    const assets = []
    const tokenBal = []
    const walletAssets = []
    const optOutAssets = []
    const lookupAssetByID = await indexer.lookupAssetByID(asset_id).do()
    //check if its a NFT or token
    //console.log("lookupAssetByID", lookupAssetByID);
    //console.log("accountInfo", accountInfo);
    lookupAssetByID.asset.validatedStaking = false
    lookupAssetByID.asset.transactions = []
    lookupAssetByID.asset.alltokenrewards = []
    lookupAssetByID.asset.note = ''
    lookupAssetByID.asset.amount = amount
    lookupAssetByID.asset.id = ''
    lookupAssetByID.asset.stakedamount = 0
    lookupAssetByID.asset.amountpaid = 0
    lookupAssetByID.asset.collection_id = collection_id

    let algoBalance = 0
    if(accountInfo !== undefined) {
        algoBalance = accountInfo?.amount
        for(let asset in accountInfo?.assets){
            assets.push({ asset_id: accountInfo?.assets[asset]['asset-id'], optin: false})
            if(accountInfo?.assets[asset]['amount']>0){
                walletAssets.push({ asset_id: accountInfo?.assets[asset]['asset-id'], amount: accountInfo?.assets[asset]?.amount})
            } else {
                optOutAssets.push({ asset_id: accountInfo?.assets[asset]['asset-id'], amount: accountInfo?.assets[asset]?.amount})
            }
        }
    }
    for(let token in tokens){
        const tokenMatch = (accountInfo !== undefined) ? accountInfo?.assets?.find((r)=>{ return r['asset-id'] == tokens[token].asset_id }) : undefined
        tokenBal.push({ asset_id: tokens[token].asset_id, 
                        balance:(tokenMatch !== undefined)? tokenMatch['amount'] : 0, 
                        name: tokens[token].name, 
                        unitname: tokens[token].unitname, 
                        isactive: tokens[token].isactive, 
                        decimal: tokens[token].decimal, 
                        creator: tokens[token].creator_wallet,
                        rate: tokens[token].rate //'Loading...' //(data)? data.price.toFixed(3) : 
        })
    }

    if(lookupAssetByID.asset.params.creator === ps.application.owner_addr2 || lookupAssetByID.asset.params.creator == ps.application.owner_addr ||
       lookupAssetByID.asset.params.creator === ps.application.owner_addr3 || lookupAssetByID.asset.params.creator == ps.application.owner_addr4 ) {

        try {
            //const matchAssets = await verifiedWallets[0]?.assets.find((a) => Number(a.asset_id) === asset_id )
            const matchAssets = await (verifiedWallets[0] !== undefined)? verifiedWallets[0].stakedassets.find((a) => Number(a.asset_id) === asset_id ) : undefined
            //console.log("lookupAssetByID-verifiedWallets",  verifiedWallets)
            //console.log("lookupAssetByID-matchAssets",  matchAssets)
            if(matchAssets !== undefined) {
                lookupAssetByID.asset.transactions = matchAssets.assetstransactions
                lookupAssetByID.asset.validatedStaking = matchAssets.verified
                lookupAssetByID.asset.id = matchAssets.id
                lookupAssetByID.asset.stakedamount = matchAssets.amountstaked
                lookupAssetByID.asset.amountpaid = 0
                for(let asset in matchAssets.assetstransactions[0].groupby){
                    lookupAssetByID.asset.alltokenrewards.push({token: matchAssets.assetstransactions[0].groupby[asset].tokenunit, 
                        value: matchAssets.assetstransactions[0].groupby[asset].totalpaid })
                }
            }
        } catch (error) { 
            //console.error("tryverifiedWallets: ", asset_id + ": " + error);
        }
        const txns = await indexer.searchForTransactions().txType("acfg").assetID(asset_id).do()
    
        for(let tidx in txns.transactions){
            const txn = txns.transactions[tidx]
            //if(txn.sender == addr){
                //console.log("transactions", txn)
            //}
            lookupAssetByID.asset.note = txn.note
        }

    } else {
        //return undefined
        lookupAssetByID.asset.transactions = []
        lookupAssetByID.asset.validatedStaking = false
        lookupAssetByID.asset.id = asset_id
        lookupAssetByID.asset.stakedamount = 0
        lookupAssetByID.asset.amountpaid = 0
    }
    return { lookupAssetByID: await lookupAssetByID.asset, walletassets: walletAssets, assets: assets, tokenBal: tokenBal, algoBalance: algoBalance }
    //return await lookupAssetByID.asset

}


export async function getOwner(asset_id: number):Promise<string> {
    const client = getIndexer()
    const balances = await client.lookupAssetBalances(asset_id).currencyGreaterThan(0).do()

    //TODO: wen js-sdk take out
    const holders = []
    for(const idx in balances['balances']){
        const bal = balances['balances'][idx]
        if(bal.amount>0){
            holders.push(bal.address)
        }
    }

    if(holders.length==1){
        return holders[0]
    }
    return ""
}

export async function getCreator(addr: string, asset_id: number): Promise<string> {
    // Find the txn that xfered the asa to this addr, sender is creator
    const indexer = getIndexer()

    const txns = await indexer
        .searchForTransactions()
        .address(addr)
        .currencyGreaterThan(0)
        .assetID(asset_id)
        .do()

    for(let idx in txns.transactions){
        const txn = txns.transactions[idx]
        if(txn.sender != addr){
            return txn.sender
        }
    }
}

export async function getSuggested(rounds){
    const client = getAlgodClient();
    const txParams = await client.getTransactionParams().do();
    return { ...txParams, lastRound: txParams['firstRound'] + rounds }
}

export async function getCurrentVaultBalance(appId: number, mintedAsset: number):Promise<any> {
    const vault = { id:0, state: undefined, assets: [] }
    const client = getAlgodClient();
    const vaultAssets = await getIndexer().lookupAccountByID(algosdk.getApplicationAddress(appId)).do()
        .then(async (data) => {
            const assets = data.account.assets.filter(asset => asset['asset-id'] !== mintedAsset);
            const assetInfos = await Promise.all(assets.map(asset => client.getAssetByID(asset['asset-id']).do()));
            return assets.map((asset, index) => {
                const assetInfo = assetInfos[index] as any;
                console.log("getCurrentVaultBalance", assetInfo)
                const formatedAmount = asset.amount / Math.pow(10, assetInfo?.params?.decimals || 0);
                return { ...asset, amount: formatedAmount, name: assetInfo?.params?.name, reserve: assetInfo?.params?.reserve, url: assetInfo?.params?.url, unitname: assetInfo?.params['unit-name'] };
            });
        })
        .catch((err) => {
            // Handle error
            console.error("Error fetching asset info:", err);
            return [];
        });

    //console.log("getCurrentVaultBalance", vaultAssets)
    let appData = await getIndexer().lookupApplications(appId).do()
    appData = appData.application.params["global-state"]
    vault.id = appData.id
    vault.state = decodeKvPairs(appData)
    vault.assets = vaultAssets
    return vault
}

export async function getCurrentApplicatonGlobalState(appId: number):Promise<any> {
    const app = { id:0, state: undefined }
    let appData = await getIndexer().lookupApplications(appId).do()
    console.log("getCurrentApplicatonGlobalState", appData)
    //TODO: wen js-sdk take out
    appData = appData.application.params["global-state"]
    app.id = ps.application.app_id
    app.state = decodeKvPairs(appData)
    console.log("getCurrentApplicatonGlobalState-app", app)
    return app
}

export function uintToB64(x: number): string {
    return Buffer.from(algosdk.encodeUint64(x)).toString('base64')
}

export function addrToB64(addr: string): string {
    if (addr == "" ){
        return dummy_addr
    }
    try {
        const dec = algosdk.decodeAddress(addr)
        return "b64("+Buffer.from(dec.publicKey).toString('base64')+")"
    }catch(err){
        return dummy_addr
    }
}
export function b64ToAddr(x){
    return algosdk.encodeAddress(new Uint8Array(Buffer.from(x, "base64")));
}

export function decodeKvPairs(kvPairs) {
    const decodedValues = {};
    for(let i=0; i<kvPairs.length; i++) {
        const kvPair = kvPairs[i];
        const key = Buffer.from(kvPair.key, 'base64').toString();
        let value = kvPair['value'];
        if(key === 'highest_bidder') {
            value = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'));
        } else if(key === 'manager' || key === 'reserve') {
            value = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'));
        } else {
            value = value.uint;
        }
        /* if(key === 'lead_bid_acct') {
            value = algosdk.encodeAddress(Buffer.from(value.bytes, 'base64'));
        }
        else if(value.type === 1) {
            value = Buffer.from(value.bytes, 'base64').toString();
        } else if(value.type === 2) {
            value = value.uint;
        } */
        decodedValues[key] = value;
    }
    return decodedValues;
}

export async function sendWait(signed: any[]):Promise<string> {
    const client = getAlgodClient()

    if(ps.dev.debug_txns) download_txns("grouped.txns", signed.map((t)=>{return t.blob}))

    try {
        const {txId} = await client.sendRawTransaction(signed.map((t)=>{return t.blob})).do()
        showNetworkWaiting(txId)

        const result = await waitForConfirmation(client, txId, 3) 
       console.log("sendWait result: ", result)
        if(result) {
            showNetworkSuccess(txId)
            return txId
        }  

    } catch (error) { 
        console.log("sendWait error: ", error)
        if(error.status === 400 && error.message.indexOf("Received status 400: TransactionPool.Remember:") !== -1){
            showErrorToaster("Sorry but your Balance is below the cost" + error)
        }
    }

    return undefined 
}

export async function sendWaitMint(signed: any[]):Promise<Array<Object>> {
    const client = getAlgodClient()

    if(ps.dev.debug_txns) download_txns("grouped.txns", signed.map((t)=>{return t.blob}))

    try {
        const {txId} = await client.sendRawTransaction(signed.map((t)=>{return t.blob})).do()
        showNetworkWaiting(txId)

        const result = await waitForConfirmation(client, txId, 3) 
        //console.log("sendWaitMint result: ", result)
        if(result) {
            const assetId = result["asset-index"]
            showNetworkSuccess(txId)
            //return txId
            return [{assetId: assetId, txId: txId}]
        }  

    } catch (error) { 
        console.log("sendWait error: ", error)
        if(error.status === 400 && error.message.indexOf("Received status 400: TransactionPool.Remember:") !== -1){
            showErrorToaster("Sorry but your Balance is below the cost" + error)
        }
    }

    return undefined 
}

export async function sendWaitApp(signed: any[]):Promise<Array<Object>> {
    const client = getAlgodClient()

    try {
        const {txId} = await client.sendRawTransaction(signed.map((t)=>{return t.blob})).do()
        showNetworkWaiting(txId)

        const result = await waitForConfirmation(client, txId, 3)
        //const sendWallet = algosdk.encodeAddress(new Uint8Array(Buffer.from(result.txn.txn.gh, "base64")))
        if(result) {
            const appId = result["application-index"]
            const appAddr = algosdk.getApplicationAddress(appId)  
            //console.log("sendWait appAddr: ", appAddr)
            showNetworkSuccess(txId)
            return [{appId: appId, appAddr: appAddr, txId: txId}]
        }  

    } catch (error) { 
        if(error.status === 400 && error.message.indexOf("Received status 400: TransactionPool.Remember:") !== -1){
            showErrorToaster("Sorry but your Balance is below the cost" + error)
        }
        console.log("error: ", error)
    }

    return undefined 
}

export async function getTransaction(txid: string) {
    return await waitForConfirmation(getAlgodClient(), txid, 3)
}

export async function waitForConfirmation(algodclient, txId, timeout) {
    if (algodclient == null || txId == null || timeout < 0) {
      throw new Error('Bad arguments.');
    }

    const status = await algodclient.status().do();
    if (typeof status === 'undefined')
      throw new Error('Unable to get node status');

    const startround = status['last-round'] + 1;
    let currentround = startround;
  
    /* eslint-disable no-await-in-loop */
    while (currentround < startround + timeout) {
      const pending = await algodclient
        .pendingTransactionInformation(txId)
        .do();

      if (pending !== undefined) {
        if ( pending['confirmed-round'] !== null && pending['confirmed-round'] > 0) 
          return pending;
  
        if ( pending['pool-error'] != null && pending['pool-error'].length > 0) 
          throw new Error( `Transaction Rejected pool error${pending['pool-error']}`);
      }

      await algodclient.statusAfterBlock(currentround).do();
      currentround += 1;
    }

    /* eslint-enable no-await-in-loop */
    throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
}

export function getUnique(array, key) {
    if (typeof key !== 'function') {
      const property = key;
      key = function(item) { return item[property]; };
    }
    return Array.from(array.reduce(function(map, item) {
      const k = key(item);
      if (!map.has(k)) map.set(k, item);
      return map;
    }, new Map()).values());
}

export function download_txns(name, txns) {
    let b = new Uint8Array(0);
    for(const txn in txns){
        b = concatTypedArrays(b, txns[txn])
    }
    var blob = new Blob([b], {type: "application/octet-stream"});

    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = name;
    link.click();
}

export function concatTypedArrays(a, b) { // a, b TypedArray of same type
    var c = new (a.constructor)(a.length + b.length);
    c.set(a, 0);
    c.set(b, a.length);
    return c;
}