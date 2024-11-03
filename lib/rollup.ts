import { Wallet } from '../lib/algorand-session-wallet'
import algosdk, {AtomicTransactionComposer, makePaymentTxnWithSuggestedParamsFromObject, makeAssetTransferTxnWithSuggestedParamsFromObject, OnApplicationComplete, assignGroupID, Transaction } from 'algosdk'
import { sendWait, sendWaitApp, getSuggested } from './algorand'
import { get_asa_create_txn, get_asa_optin_txn, get_asa_xfer_txn, get_pay_txn, get_asa_destroy_txn} from './transactions'
import { get_template_vars, platform_settings as ps } from './platform-conf'
import { showErrorToaster } from '../src/Toaster'
import { getAlgodClient } from '../lib/algorand'
import approvalTeal from '../contracts/rollup-approval.tmpl.teal';
import clearTeal from '../contracts/rollup-clear.tmpl.teal';
import * as u8a from 'uint8arrays';

const rollupAppMethods: algosdk.ABIMethod[] = [
    new algosdk.ABIMethod({ name: "opt_in_asset", desc: "", args: [{ type: "asset", name: "asset", desc: "" }], returns: { type: "void", desc: "opt into asset" } }),
    new algosdk.ABIMethod({ name: "opt_out_asset", desc: "", args: [{ type: "asset", name: "asset", desc: "" }, { type: "account", name: "asset_receiver", desc: "" }], returns: { type: "void", desc: "opt out asset" } }),
    new algosdk.ABIMethod({ name: "mint", desc: "", args: [{ type: "string", name: "url", desc: "" }, { type: "account", name: "reserve", desc: "" }, { type: "string", name: "note", desc: "" }, { type: "asset", name: "asset", desc: "" }], returns: { type: "void", desc: "mint smart nft" } }),
    new algosdk.ABIMethod({ name: "delete", desc: "", args: [], returns: { type: "void", desc: "delete app" } }),
    new algosdk.ABIMethod({ name: "grant", desc: "", args: [{ type: "account", name: "manager", desc: "" }, { type: "axfer", name: "axfer", desc: "" }], returns: { type: "void", desc: "update manager" } }),
    new algosdk.ABIMethod({ name: "withdraw", desc: "", args: [{ type: "asset", name: "asset", desc: "" }, { type: "uint64", name: "asset_amount", desc: "" }, { type: "account", name: "asset_receiver", desc: "" }], returns: { type: "void", desc: "withdraws assets" } })
]
  
export class ROLLUP {
    createdat: string // date listing was created
    vaultmintedasset: number // ASA idx in algorand that we are listing
    vaultappaddress: string //creator wallet
    vaultappid: number //length of listing
    name: string  // listing Name
    vaultipfs: string  // listing Image
    mimetype: string  // listing Image Type
    lastsaleprice: string //length of listing
    isactive: boolean //if listing is active or not
    mintedby: string
    mintedby_nfd: string
    twitter: string  // Project Twitter
    marketplace: string  // Marketplace
    website: string // Website

    constructor(
        createdat?: string, 
        vaultmintedasset?: number, 
        vaultappaddress?: string,
        vaultappid?: number,
        name?: string, 
        vaultipfs?: string, 
        mimetype?: string, 
        lastsaleprice?: string, 
        isactive?: boolean, 
        mintedby?: string,
        mintedby_nfd?: string,
        twitter?: string, 
        marketplace?: string, 
        website?: string) 
    {
        this.createdat = createdat
        this.vaultmintedasset = vaultmintedasset
        this.vaultappaddress = vaultappaddress
        this.vaultappid = vaultappid
        this.name = name
        this.vaultipfs = vaultipfs
        this.mimetype = mimetype
        this.lastsaleprice = lastsaleprice
        this.isactive = isactive
        this.mintedby = mintedby
        this.mintedby_nfd = mintedby_nfd
        this.twitter = twitter
        this.marketplace = marketplace
        this.website = website
    }

    static async createNFTSC(wallet: Wallet, cost: any) {
        
        const client = getAlgodClient()
        const approvalProgramresult = await client.compile(approvalTeal).do()
        const clearProgramresult = await client.compile(clearTeal).do()
        const approvalProgram = u8a.fromString(approvalProgramresult.result, 'base64')
        const clearProgram = u8a.fromString(clearProgramresult.result, 'base64')
        var string1 = "NFT Roll Up One-time Fee"
        var uint81 = Uint8Array.from(string1.split("").map(x => x.charCodeAt(0)))
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        const onComplete = algosdk.OnApplicationComplete.NoOpOC;
        const numLocalInts = 0
        const numLocalByteSlices = 0
        const numGlobalInts = 7
        const numGlobalByteSlices = 7
        const purchase_amt_txn = algosdk.makeApplicationCreateTxnFromObject({
          from: buyer,
          suggestedParams,
          onComplete,
          approvalProgram,
          clearProgram,
          numLocalInts,
          numLocalByteSlices,
          numGlobalInts,
          numGlobalByteSlices,
        });
        
        const purchase_amt_txn1 = new Transaction(get_asa_xfer_txn(suggestedParams, buyer, ps.application.buyback_addr, 1091143717, 0, uint81))
        //const purchase_amt_txn2 = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.owner_addr, totalCost, uint8))
        const grouped = [
            purchase_amt_txn, purchase_amt_txn1
        ]

        assignGroupID(grouped)

        const [s_purchase_amt_txn, s_purchase_amt_txn1, /*asa_xfer*/, /*price_xfer*/, /*asa_cfg*/ , /* tag_txns */, /*algo_close*/] = await wallet.signTxn(grouped)
        
        const combined = [
            s_purchase_amt_txn, s_purchase_amt_txn1
        ]
        const data = await sendWaitApp(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data
    }

    static async mintSmartNFT(wallet: Wallet, vaulturl: string, vaultnote: string, mintedAssetId: number, vaultAppId: number) {
        const sender = await wallet.getDefaultAccount()
        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
        const algodClient = getAlgodClient()
        const suggestedParams = await algodClient.getTransactionParams().do()
        // const suggestedParams = await getSuggested(10)
        //'Starting VAULT Deployment...'

        const atc = new AtomicTransactionComposer()

        // Funding app with MBR (.1 for account, .1 for ASA)
        const payment = makePaymentTxnWithSuggestedParamsFromObject({
            suggestedParams,
            amount: 500000,
            from: sender,
            to: algosdk.getApplicationAddress(vaultAppId)
        })
        atc.addTransaction({ txn: payment, signer })

        // Call to Deploy NFT Vault
        atc.addMethodCall(
            {
            appID: vaultAppId,
            method: algosdk.getMethodByName(rollupAppMethods, 'mint'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 10000, flatFee: true },
            methodArgs: [vaulturl, sender, vaultnote, mintedAssetId] //amountInput.valueAsNumber
            }
        )

        // Opt app into ASA
       /*  atc.addMethodCall({
            appID: vaultAppId,
            method: algosdk.getMethodByName(rollupAppMethods, 'opt_in_asset'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 10000, flatFee: true },
            methodArgs: [paymentasa]
        }) */


        //await atc.execute(algodClient, 3)
        //const txns = atc.buildGroup().map((tws)=>{ return tws.txn})
        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
        });
        // for ledger compatibility (max 2 app args), remove index references which are not strictly needed
        //txns[1].appArgs = txns[1].appArgs?.slice(0, -2)
        //console.log("combined", txns)
        /*
        assignGroupID(txns)
        const data = await atc.execute(algodClient, 3).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data
        */
        assignGroupID(txns) 
        
        const [s_purchase_amt_txn, s_purchase_amt_txn1] = await wallet.signTxn(txns)
        
        const combined = [
            s_purchase_amt_txn, s_purchase_amt_txn1
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data 
    }

    static async optIn(wallet: Wallet, optInAssetId: number, vaultAppId: number) {
        const sender = await wallet.getDefaultAccount()
        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
        const algodClient = getAlgodClient()
        const suggestedParams = await algodClient.getTransactionParams().do()
        // const suggestedParams = await getSuggested(10)
        const atc = new AtomicTransactionComposer()

        // Funding app with MBR (.1 for account, .1 for ASA)
        
        const payment = makePaymentTxnWithSuggestedParamsFromObject({
            suggestedParams,
            amount: 0,
            from: sender,
            to: algosdk.getApplicationAddress(vaultAppId)
        })
        atc.addTransaction({ txn: payment, signer })
        

        // Opt app into ASA
        atc.addMethodCall(
            {
            appID: vaultAppId,
            method: algosdk.getMethodByName(rollupAppMethods, 'opt_in_asset'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 10000, flatFee: true },
            methodArgs: [optInAssetId] //amountInput.valueAsNumber
            }
        )

        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
        });

        assignGroupID(txns) 
        
        const [s_purchase_amt_txn, s_purchase_amt_txn1] = await wallet.signTxn(txns)
        
        const combined = [
            s_purchase_amt_txn, s_purchase_amt_txn1
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data 
    }

    
    static async optOut(wallet: Wallet, optInAssetId: number, vaultAppId: number, manager: string) {
        const sender = await wallet.getDefaultAccount()
        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
        const algodClient = getAlgodClient()
        const suggestedParams = await algodClient.getTransactionParams().do()
        // const suggestedParams = await getSuggested(10)
        const atc = new AtomicTransactionComposer()

        // Opt app into ASA
        atc.addMethodCall(
            {
            appID: vaultAppId,
            method: algosdk.getMethodByName(rollupAppMethods, 'opt_out_asset'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 10000, flatFee: true },
            methodArgs: [optInAssetId, manager] //amountInput.valueAsNumber
            }
        )

        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
        });

        assignGroupID(txns) 
        
        const [s_purchase_amt_txn] = await wallet.signTxn(txns)
        
        const combined = [
            s_purchase_amt_txn
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data 
    }
    
    static async depositFunds(wallet: Wallet, vaultappid: any, depositasset: any, depositamount: any) {
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        var string = "Depositing Funds to your NFT Vault from https://asas.lol/create-vault/"
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        //JUST SENDING A 4.20 ALGO TRANSACTION to BUY BACK WALLET
        const algodClient = getAlgodClient()
        const assetInfo = await algodClient.getAssetByID(parseInt(depositasset)).do()
        //console.log("decimals", assetInfo.params.decimals)
        //const totalCost = (depositamount * 1000000) * 1
        const totalCost = (depositamount * Math.pow(10, assetInfo.params.decimals)) * 1
        //const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.buyback_addr, totalCost, uint8))
        const purchase_amt_txn = new Transaction(get_asa_xfer_txn(suggestedParams, buyer, algosdk.getApplicationAddress(vaultappid), parseInt(depositasset), parseInt(totalCost.toFixed()), uint8))
        const grouped = [
            purchase_amt_txn 
        ]

        assignGroupID(grouped)

        const [s_purchase_amt_txn] = await wallet.signTxn(grouped)

        const combined = [
            s_purchase_amt_txn
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data
    }

    static async withdrawlFunds(wallet: Wallet, vaultAppId: number, withdrawlAsset: number, withdrawlAmount: number) {
        const sender = await wallet.getDefaultAccount()
        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
        const algodClient = getAlgodClient()
        const suggestedParams = await algodClient.getTransactionParams().do()
        const assetInfo = await algodClient.getAssetByID(withdrawlAsset).do()
        const microsAmount = (withdrawlAmount * Math.pow(10, assetInfo.params.decimals)) * 1
        // const suggestedParams = await getSuggested(10)
        const atc = new AtomicTransactionComposer()

        // withdrawlFunds
        atc.addMethodCall(
            {
            appID: vaultAppId,
            method: algosdk.getMethodByName(rollupAppMethods, 'withdraw'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 10000, flatFee: true },
            methodArgs: [withdrawlAsset, microsAmount, sender] 
            }
        )

        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
        });

        assignGroupID(txns) 
        
        const [s_purchase_amt_txn] = await wallet.signTxn(txns)
        
        const combined = [
            s_purchase_amt_txn
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data 
    }
    
    static async updateManager(wallet: Wallet, asa: number, manager: string, asaQty: number, AppId: number) {
        const sender = await wallet.getDefaultAccount()
        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
        const algodClient = getAlgodClient()
        const suggestedParams = await algodClient.getTransactionParams().do()
        const atc = new AtomicTransactionComposer()

        const axfer = makeAssetTransferTxnWithSuggestedParamsFromObject({
            suggestedParams,
            from: sender,
            amount: asaQty,
            to: algosdk.getApplicationAddress(AppId),
            assetIndex: asa
        })

        // update Manager
        atc.addMethodCall(
            {
            appID: AppId,
            method: algosdk.getMethodByName(rollupAppMethods, 'grant'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 20000, flatFee: true },
            appForeignAssets: [asa],
            methodArgs: [manager, { txn: axfer, signer }]
            }
        )

        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
          });
        assignGroupID(txns) 
        
        const [s_purchase_amt_txn, s_purchase_amt_txn1] = await wallet.signTxn(txns)
        
        const combined = [
            s_purchase_amt_txn, s_purchase_amt_txn1
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data 
    }
    

    imgSrc(): string {
        if (this.vaultipfs !== undefined && this.vaultipfs != "")
            return ROLLUP.resolveUrl(this.vaultipfs)

        return "https://via.placeholder.com/500"
    }

    static getVars(overwrite: any): any {
        return get_template_vars(overwrite)
    }
    
    explorerSrc(): string {
        const net = ps.algod.network == "mainnet" ? "" : ps.algod.network + "."
        return "https://" + net + ps.explorer + "/asset/" + this.vaultmintedasset
    }

    static resolveUrl(url: string): string {
        const [protocol, uri] = url.split("://")
        switch(protocol){
            case "ipfs":
                return ps.ipfs.ipfsGateway + uri
            case "algorand":
                //TODO: create url to request note field?
                showErrorToaster("No url resolver for algorand protocol string yet")
                return 
            case "http":
                return url
            case "https":
                return (uri.includes("ipfs.algonode.xyz/ipfs"))? url.replace("#i", "") + '?optimizer=image&width=350&quality=70' : url
                //return url
        }

        //showErrorToaster("Unknown protocol: " + protocol) 
        return  ""
    }
    
}
