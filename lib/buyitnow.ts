import { Wallet } from '../lib/algorand-session-wallet'
import algosdk, {AtomicTransactionComposer, makePaymentTxnWithSuggestedParamsFromObject, makeAssetTransferTxnWithSuggestedParamsFromObject, OnApplicationComplete, assignGroupID, Transaction } from 'algosdk'
import { sendWait, sendWaitApp, getSuggested } from './algorand'
import { get_asa_create_txn, get_asa_optin_txn, get_asa_xfer_txn, get_pay_txn, get_asa_destroy_txn} from './transactions'
import { get_template_vars, platform_settings as ps } from './platform-conf'
import { showErrorToaster } from '../src/Toaster'
import { getAlgodClient } from '../lib/algorand'
import approvalTeal from '../contracts/buyitnow-approval.tmpl.teal';
import clearTeal from '../contracts/buyitnow-clear.tmpl.teal';
import * as u8a from 'uint8arrays';

const buyitnowAppMethods: algosdk.ABIMethod[] = [
    new algosdk.ABIMethod({ name: "opt_into_asset", desc: "", args: [{ type: "asset", name: "asset", desc: "" }, { type: "asset", name: "payment_asset", desc: "" }], returns: { type: "void", desc: "opt into assets" } }),
    new algosdk.ABIMethod({ name: "start_sale", desc: "", args: [{ type: "uint64", name: "price", desc: "" }, { type: "axfer", name: "axfer", desc: "" }], returns: { type: "void", desc: "start listing" } }),
    new algosdk.ABIMethod({ name: "buy", desc: "", args: [{ type: "axfer", name: "payment", desc: "" }, { type: "uint64", name: "asset_amount", desc: "" }, { type: "asset", name: "asset", desc: "" }, { type: "asset", name: "payment_asset", desc: "" }, { type: "account", name: "app_creator", desc: "" }, { type: "account", name: "asset_creator", desc: "" }, { type: "account", name: "payment_asset_creator", desc: "" }], returns: { type: "void", desc: "buy it now" } }),
    new algosdk.ABIMethod({ name: "delete", desc: "", args: [], returns: { type: "void", desc: "delete application for buy it now listing" } }),
    new algosdk.ABIMethod({ name: "claim_asset", desc: "", args: [{ type: "uint64", name: "asset_amount", desc: "" }, { type: "asset", name: "asset", desc: "" }, { type: "asset", name: "payment_asset", desc: "" }, { type: "account", name: "app_creator", desc: "" }, { type: "account", name: "asset_creator", desc: "" }, { type: "account", name: "payment_asset_creator", desc: "" }], returns: { type: "void", desc: "send asa back to initiator of listing in case of no purchase" } })
]
  
export class BUYITNOW {
    createdat: string // date listing was created
    asset_id: number // ASA idx in algorand that we are listing
    amount: number // ASA idx in algorand
    creator_wallet: string //creator wallet
    name: string  // listing Name
    image: string  // listing Image
    mimetype: string  // listing Image Type
    url: string      // URL of metadata json
    listingappid: number //length of listing
    payment_asset_id: number // asset id for the payment token used for auction
    payment_unitname: string
    payment_decimal: number // payment_decimal for asset id
    payment_creator: string
    lastsaleprice: string //length of listing
    ticketcost: number // cost per ticket to enter listing
    isactive: boolean //if listing is active or not
    iscomplete: boolean //if listing is over or not
    isverified: boolean //nft verifcation on api for algoxnft
    isverifiedalgoseas: boolean //nft verifcation on api
    isverifiedalgogems: boolean //nft verifcation on api
    isverifieddart: boolean //nft verifcation on api
    isverifiedrand: boolean //nft verifcation on api
    priority: number //featured / priority / normal
    listingswinners: any
    seller_wallet: string
    seller_wallet_nfd: string
    twitter: string  // Project Twitter
    marketplace: string  // Marketplace
    website: string // Website

    constructor(
        listingswinners?: any,
        createdat?: string, 
        asset_id?: number, 
        amount?: number,
        creator_wallet?: string,
        name?: string, 
        image?: string, 
        mimetype?: string, 
        listingappid?: number,
        payment_asset_id?: number,
        payment_unitname?: string,
        payment_decimal?: number,
        payment_creator?: string,
        lastsaleprice?: string, 
        ticketcost?: number,
        isactive?: boolean, 
        iscomplete?: boolean, 
        isverified?: boolean,
        isverifiedalgoseas?: boolean,
        isverifiedalgogems?: boolean,
        isverifieddart?: boolean,
        isverifiedrand?: boolean,
        priority?: number,
        seller_wallet?: string,
        seller_wallet_nfd?: string,
        twitter?: string, 
        marketplace?: string, 
        website?: string) 
    {
        this.listingswinners = listingswinners
        this.createdat = createdat
        this.asset_id = asset_id
        this.amount = amount
        this.creator_wallet = creator_wallet
        this.name = name
        this.image = image
        this.mimetype = mimetype
        this.listingappid = listingappid
        this.payment_asset_id = payment_asset_id
        this.payment_unitname = payment_unitname
        this.payment_decimal = payment_decimal
        this.payment_creator = payment_creator
        this.lastsaleprice = lastsaleprice
        this.ticketcost = ticketcost
        this.isactive = isactive
        this.iscomplete = iscomplete
        this.isverified = isverified
        this.isverifiedalgoseas = isverifiedalgoseas
        this.isverifiedalgogems = isverifiedalgogems
        this.isverifieddart = isverifieddart
        this.isverifiedrand = isverifiedrand
        this.priority = priority
        this.seller_wallet = seller_wallet
        this.seller_wallet_nfd = seller_wallet_nfd
        this.twitter = twitter
        this.marketplace = marketplace
        this.website = website
    }

    static async createListing(wallet: Wallet, payment_asset_id: any, payment_asset_unitname: any) {
        
        const client = getAlgodClient()
        const approvalProgramresult = await client.compile(approvalTeal).do()
        const clearProgramresult = await client.compile(clearTeal).do()
        const approvalProgram = u8a.fromString(approvalProgramresult.result, 'base64')
        const clearProgram = u8a.fromString(clearProgramresult.result, 'base64')
        var string = payment_asset_unitname + " application owner payment fee"
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        var string1 = payment_asset_unitname + " Buy It Now Listing Burn Fee"
        var uint81 = Uint8Array.from(string1.split("").map(x => x.charCodeAt(0)))
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        const onComplete = algosdk.OnApplicationComplete.NoOpOC;
        const numLocalInts = 0
        const numLocalByteSlices = 0
        const numGlobalInts = 5
        const numGlobalByteSlices = 1
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
        
        const purchase_amt_txn1 = new Transaction(get_asa_xfer_txn(suggestedParams, buyer, ps.application.buyback_addr, payment_asset_id, 0, uint81))
        //const purchase_amt_txn2 = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.owner_addr, totalCost, uint8))
        const grouped = [
            purchase_amt_txn, purchase_amt_txn1
        ]

        assignGroupID(grouped)

        const [s_purchase_amt_txn, s_purchase_amt_txn1] = await wallet.signTxn(grouped)
        
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
    static async startListing(wallet: Wallet, asa: number, paymentasa: number, asaQty: number, ticketPrice: number, auctionAppId: number) {
        // suggestedParams = await getSuggested(10)
        //const amountInput = ticketPrice * 1000000
        const amountInput = ticketPrice * 1
        //const amountInput = BigInt(Math.floor(ticketPrice * 10 ** 4)); // convert to integer with 6 decimal places
        const sender = await wallet.getDefaultAccount()
        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
        const algodClient = getAlgodClient()
        const suggestedParams = await algodClient.getTransactionParams().do()
        //'Starting auction...'

        const atc = new AtomicTransactionComposer()

        // Funding app with MBR (.1 for account, .1 for ASA)
        const payment = makePaymentTxnWithSuggestedParamsFromObject({
            suggestedParams,
            amount: 300000,
            from: sender,
            to: algosdk.getApplicationAddress(auctionAppId)
        })
        atc.addTransaction({ txn: payment, signer })

        // Opt app into ASA
        atc.addMethodCall({
            appID: auctionAppId,
            method: algosdk.getMethodByName(buyitnowAppMethods, 'opt_into_asset'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 10000, flatFee: true },
            methodArgs: [asa, paymentasa]
        })

        const axfer = makeAssetTransferTxnWithSuggestedParamsFromObject({
            suggestedParams,
            from: sender,
            amount: asaQty, //asaAmountInput.valueAsNumber
            to: algosdk.getApplicationAddress(auctionAppId),
            assetIndex: asa
        })

        // Call to Start Listing
        atc.addMethodCall(
            {
            appID: auctionAppId,
            method: algosdk.getMethodByName(buyitnowAppMethods, 'start_sale'),
            sender,
            signer,
            suggestedParams,
            methodArgs: [amountInput, { txn: axfer, signer }] //amountInput.valueAsNumber
            }
        )

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
        
        const [s_purchase_amt_txn, s_purchase_amt_txn1, s_purchase_amt_txn2, s_purchase_amt_txn3] = await wallet.signTxn(txns)
        
        const combined = [
            s_purchase_amt_txn, s_purchase_amt_txn1, s_purchase_amt_txn2, s_purchase_amt_txn3
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data 
    }

    
    static async deleteListing(wallet: Wallet, listingAppId: number) {
        const sender = await wallet.getDefaultAccount();
        const suggestedParams = await getSuggested(10);
        // Set the fee to 10,000 microALGOs (0.01 ALGO)
        suggestedParams.fee = 10000;
        suggestedParams.flatFee = true;
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
    
        const atc = new AtomicTransactionComposer()
        
        // Create delete application transaction
        
        //const appDeleteTxn = new Transaction(get_app_destroy_txn(suggestedParams, sender, auctionAppId));

        /*  
        const appDeleteTxn = algosdk.makeApplicationDeleteTxnFromObject({
            from: sender,
            suggestedParams,
            appIndex: auctionAppId,
        });
        const enc = new TextEncoder();
        const note = enc.encode("Opted Into Asset");
        let txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
          from: sender,
          to: sender,
          amount: 0,
          assetIndex: asa,
          suggestedParams: suggestedParams,
          note: note,
        }); */

        //atc.addTransaction({ txn: appDeleteTxn, signer })

        atc.addMethodCall(
            {
            appID: listingAppId,
            method: algosdk.getMethodByName(buyitnowAppMethods, 'delete'),
            sender,
            signer,
            suggestedParams,
            methodArgs: [], //amountInput.valueAsNumber //payment
            onComplete: algosdk.OnApplicationComplete.DeleteApplicationOC
            }
        )

        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
          });
        //txns.push(asa_opt_txn)
        assignGroupID(txns) 
    
        // Sign the transaction
        const signedTxn = await wallet.signTxn(txns);
    
        // Send the transaction and wait for confirmation
        const data = await sendWait(signedTxn).then((txid) => {
            return txid;
        }).catch((err) => { 
            console.log("error", err);
        });
    
        return data;
    }

    static async purchase(wallet: Wallet, qtyAmount: any, listingAsset: number, paymentAmount: number, appCreator: string, assetCreator: string, paymentAsset: any, listingAppId: number, paymentAssetCreator: string) {
        //'Sending bid...'
        const algodClient = getAlgodClient()
        const sender = await wallet.getDefaultAccount()
        const suggestedParams = await algodClient.getTransactionParams().do()
        //var paymentAssetCreator = "CQS6LSLCYDURBY23UJUM7OVVBZYDCI5C5D6FUWHFQC6R56PCE47I5GR4JM"

        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)

        const atc = new AtomicTransactionComposer()
        
        const axfer = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            suggestedParams,
            from: sender,
            amount: paymentAmount,
            to: appCreator,
            assetIndex: paymentAsset
        })
        
        // opt winner into asa
        var string2 = "Opted Into Asset"
        var uint82 = Uint8Array.from(string2.split("").map(x => x.charCodeAt(0)))
        const asa_opt_txn = new Transaction(get_asa_optin_txn(suggestedParams, sender, listingAsset, uint82))
        /*  
        const enc = new TextEncoder();
        const note = enc.encode("Opted Into Asset");
        let txn = makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: sender,
        to: sender,
        amount: 0,
        assetIndex: asa,
        suggestedParams: suggestedParams,
        note: note,
        }); */
  
        atc.addTransaction({ txn: asa_opt_txn, signer })

        atc.addMethodCall(
            {
            appID: listingAppId,
            method: algosdk.getMethodByName(buyitnowAppMethods, 'buy'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 20000, flatFee: true },
            methodArgs: [{ txn: axfer, signer }, qtyAmount, listingAsset, paymentAsset, appCreator, assetCreator, paymentAssetCreator] //amountInput.valueAsNumber //payment
            }
        )
        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
          });
        assignGroupID(txns) 
        
        const [s_purchase_amt_txn, s_purchase_amt_txn1, s_purchase_amt_txn2] = await wallet.signTxn(txns)
        const combined = [
            s_purchase_amt_txn, s_purchase_amt_txn1, s_purchase_amt_txn2
        ]
        const data = await sendWait(combined).then((txid) => {
            return txid
        }).catch((err)=>{ 
            console.log("error", err)
        })
        return data 
    }
    
    static async claimListingNoBid(wallet: Wallet, qtyAmount: any, listingAsset: number, paymentAsset: number, appCreator: string, assetCreator: string, listingAppId: number, paymentAssetCreator: string) {
        //'claimListingNoBid...'
        const algodClient = getAlgodClient()
        const sender = await wallet.getDefaultAccount()
        const suggestedParams = await algodClient.getTransactionParams().do()
        // Empty signer, just a placeholder
        const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
        const atc = new AtomicTransactionComposer()
        //var paymentAssetCreator = "CQS6LSLCYDURBY23UJUM7OVVBZYDCI5C5D6FUWHFQC6R56PCE47I5GR4JM"
        // opt winner into asa
        var string2 = "Opted Into Asset"
        var uint82 = Uint8Array.from(string2.split("").map(x => x.charCodeAt(0)))
        const asa_opt_txn = new Transaction(get_asa_optin_txn(suggestedParams, sender, listingAsset, uint82))

        atc.addTransaction({ txn: asa_opt_txn, signer })

        // Claim NFT
        atc.addMethodCall({
            appID: listingAppId,
            method: algosdk.getMethodByName(buyitnowAppMethods, 'claim_asset'),
            sender,
            signer,
            suggestedParams: { ...suggestedParams, fee: 20000, flatFee: true },
            methodArgs: [qtyAmount, listingAsset, paymentAsset, appCreator, assetCreator, paymentAssetCreator]
        })

        const txns = atc.buildGroup().map(({ txn }) => {
            txn.group = undefined;
            return txn;
          });
        //txns.push(asa_opt_txn)
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

    
    static async purchaseBumpUp(wallet: Wallet, auctionid: any, currency: any) {
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        var cost = 4.2
        var string = "auction listing blaze up purchase for https://asas.lol/auction/"+ auctionid
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        //JUST SENDING A 4.20 ALGO TRANSACTION to BUY BACK WALLET
        const totalCost = (cost * 1000000) * 1
        const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.buyback_addr, totalCost, uint8))
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
        /* if(currency.asset_id === 0) {
                const totalCost = (cost * 1000000) * 1
                const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.owner_addr, totalCost, uint8))
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
        } else {
                const rateCost = cost / currency.rate
                const totalCost = (rateCost * Math.pow(10, currency.decimal)) * 1
                const purchase_amt_txn = new Transaction(get_asa_xfer_txn(suggestedParams, buyer, ps.application.owner_addr, currency.asset_id, parseInt(totalCost.toFixed()), uint8))
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
        } */
    }

    imgSrc(): string {
        if (this.image !== undefined && this.image != "")
            return BUYITNOW.resolveUrl(this.image)

        return "https://via.placeholder.com/500"
    }

    static getVars(overwrite: any): any {
        return get_template_vars(overwrite)
    }
    
    explorerSrc(): string {
        const net = ps.algod.network == "mainnet" ? "" : ps.algod.network + "."
        return "https://" + net + ps.explorer + "/asset/" + this.asset_id
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

        showErrorToaster("Unknown protocol: " + protocol) 
        return  ""
    }
    
}