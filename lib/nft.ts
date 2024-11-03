import { Wallet } from '../lib/algorand-session-wallet'
import { getMetaFromIpfs, getArc69MetaFromIpfs, getMimeTypeFromIpfs, getTokenMetaFromHash, getArc19MetaFromHash, getArc69MetaFromHash } from './ipfs'
import algosdk, { decodeAddress, 
    encodeAddress, 
    algosToMicroalgos, 
    computeGroupID, 
    AtomicTransactionComposer,
    makeAssetConfigTxnWithSuggestedParamsFromObject,
    makeAssetCreateTxnWithSuggestedParamsFromObject, 
    makeAssetTransferTxnWithSuggestedParamsFromObject,
    makePaymentTxnWithSuggestedParamsFromObject, 
    assignGroupID, 
    Transaction } from 'algosdk'
import { sendWait, sendWaitMint, getSuggested, getAlgodClient } from './algorand'
import { get_asa_create_txn, get_pay_txn, get_asa_optin_txn, get_asa_destroy_txn} from './transactions'
import { platform_settings as ps } from './platform-conf'
import { showErrorToaster } from '../src/Toaster'
import { Metadata } from './metadata'
import { sha256 } from 'js-sha256'
import { CID } from 'multiformats/cid'
import * as mfsha2 from 'multiformats/hashes/sha2'
import * as digest from 'multiformats/hashes/digest'
import { CIDVersion } from 'multiformats/types/src/cid'
import { StringDecoder } from 'string_decoder'
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import axios from "axios";

export const ARC3_NAME_SUFFIX = "@arc3"
export const ARC3_URL_SUFFIX = "#arc3"
export const ARC19_NAME_SUFFIX = "@arc3"
export const ARC19_URL_SUFFIX = "#arc3"
export const ARC69_NAME_SUFFIX = "@arc69"
export const ARC69_URL_SUFFIX = "#arc69"
export const METADATA_FILE = "metadata.json"
export const JSON_TYPE = "application/json"

function codeToCodec(code) {
    switch (code.toString(16)) {
      case "55":
        return "raw";
      case "70":
        return "dag-pb";
      default:
        throw new Error("Unknown codec");
    }
  }
  
  export async function pinJSONToIPFS(client, json) {
    try {
      const cid = await client.put(
        [new Blob([json])],
        { wrapWithDirectory: false },
        { contentType: "application/json" }
      );
      return cid;
    } catch (error) {
      throw new Error("IPFS pinning failed");
    }
  }
  
  export async function pinImageToIPFS(token, image) {
    try {
      const client = new Web3Storage({ token: token });
      const cid = await client.put(
        [new Blob([image])],
        { wrapWithDirectory: false },
        { contentType: image.type }
      );
      return cid;
    } catch (error) {
      throw new Error("IPFS pinning failed");
    }
  }

  export async function pinJSONToNFTStorage(token, json) {
    try {
      const response = await axios.post("https://api.nft.storage/upload", json, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return response.data.value.cid;
    } catch (error) {
      throw new Error("IPFS pinning failed");
    }
  }
  
  export async function pinImageToNFTStorage(token, image) {
    try {
      const response = await axios.post("https://api.nft.storage/upload", image, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      return response.data.value.cid;
    } catch (error) {
      throw new Error("IPFS pinning failed");
    }
  }
  
export function createReserveAddressFromIpfsCid(ipfsCid) {
    const decoded = CID.parse(ipfsCid);
    const version = decoded.version;
    const codec = codeToCodec(decoded.code);
  
    if (version === 0) {
      throw new Error("CID version 0 does not support directories");
    }
  
    const assetURL = `template-ipfs://{ipfscid:${version}:${codec}:reserve:sha2-256}`;
  
    const reserveAddress = encodeAddress(
      Uint8Array.from(Buffer.from(decoded.multihash.digest))
    );
  
    return { assetURL, reserveAddress };
}

export function resolveProtocol(url: string, reserveAddr: string): string {
  if (url.endsWith(ARC3_URL_SUFFIX))
    url = url.slice(0, url.length - ARC3_URL_SUFFIX.length)
  if (url.endsWith(ARC69_URL_SUFFIX))
    url = url.slice(0, url.length - ARC69_URL_SUFFIX.length)
    const chunks = url.split("://")
    // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be
    if (chunks[0] === 'template-https' && chunks[1].includes('{ipfscid:')) {
        // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
        chunks[0] = 'ipfs'
        const cidComponents = chunks[1].split(':')
        if (cidComponents.length !== 5) {
            // give up
            //console.log('unknown ipfscid format')
            return url
        }
        const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents

        // const cidVersionInt = parseInt(cidVersion) as CIDVersion
        if (cidHash.split('}')[0] !== 'sha2-256') {
            //console.log('unsupported hash:', cidHash)
            return url
        }
        if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
            //console.log('unsupported codec:', cidCodec)
            return url
        }
        if (asaField !== 'reserve') {
            //console.log('unsupported asa field:', asaField)
            return url
        }
        let cidCodecCode
        if (cidCodec === 'raw') {
            cidCodecCode = 0x55
        } else if (cidCodec === 'dag-pb') {
            cidCodecCode = 0x70
        }

        // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
        //console.log("reserveAddr", reserveAddr)
        const addr = decodeAddress(reserveAddr)
        const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey)

        const cid = CID.create(parseInt(cidVersion) as CIDVersion, cidCodecCode, mhdigest)
        //console.log('switching to id:', cid.toString())
        chunks[1] = cid.toString()
        //console.log('redirecting to ipfs:', chunks[1])
    }
    if (chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
        // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
        chunks[0] = 'ipfs'
        const cidComponents = chunks[1].split(':')
        if (cidComponents.length !== 5) {
            // give up
            console.log('unknown ipfscid format')
            return url
        }
        const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents

        // const cidVersionInt = parseInt(cidVersion) as CIDVersion
        if (cidHash.split('}')[0] !== 'sha2-256') {
            console.log('unsupported hash:', cidHash)
            return url
        }
        if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
            console.log('unsupported codec:', cidCodec)
            return url
        }
        if (asaField !== 'reserve') {
            console.log('unsupported asa field:', asaField)
            return url
        }
        let cidCodecCode
        if (cidCodec === 'raw') {
            cidCodecCode = 0x55
        } else if (cidCodec === 'dag-pb') {
            cidCodecCode = 0x70
        }

        // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
        const addr = decodeAddress(reserveAddr)
        const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey)

        const cid = CID.create(parseInt(cidVersion) as CIDVersion, cidCodecCode, mhdigest)
        //console.log('switching to id:', cid.toString())
        chunks[1] = cid.toString() + '/' + chunks[1].split('/').slice(1).join('/')
        //console.log('redirecting to ipfs:', chunks[1])
    }
  // No protocol specified, give up
  if (chunks.length < 2) return url

  // Switch on the protocol
  switch (chunks[0]) {
    case "ipfs": // Its ipfs, use the configured gateway
      return ps.ipfs.ipfsGateway + chunks[1]
    case "https": // Its already http, just return it
      return url
    default:
      return null
    // TODO: Future options may include arweave or algorand
  }
}

export class Token {
    id: number
    name: string
    unitName: string
    url: string
    metadataHash: string
    total: number
    decimals: number
    creator: string
    manager: string
    reserve: string
    clawback: string
    freeze: string
    defaultFrozen: boolean

    constructor (t: any) {
        this.id = t.id || 0
        this.name = t.name || ''
        this.unitName = t.unitName || ''
        this.url = t.url || ''
        this.metadataHash = t.metadataHash || ''
        this.total = t.total || 0
        this.decimals = t.decimals || 0
        this.creator = t.creator || ''
        this.manager = t.manager || ''
        this.reserve = t.reserve || ''
        this.clawback = t.clawback || ''
        this.freeze = t.freeze || ''
        this.defaultFrozen = t.defaultFrozen || false
    }

    static fromParams (t: any): Token {
        const p = t.params
        return new Token({
            id: t.index,
            name: p.name || '',
            unitName: p['unit-name'] || '',
            url: p.url || '',
            metadataHash: p['metadata-hash'] || '',
            total: p.total || 0,
            decimals: p.decimals || 0,
            creator: p.creator || '',
            manager: p.manager || '',
            reserve: p.reserve || '',
            clawback: p.clawback || '',
            freeze: p.freeze || '',
            defaultFrozen: p['default-frozen'] || false,
        }) as Token

    }

    valid (): boolean {
        return this.id > 0 && this.total > 0 && this.url !== ''
    }

}

export class NFT {
    metadata: any
    transactions: Transactions
    asset_id: number // ASA idx in algorand
    collection_id: string // ASA collection_id in dApp
    amount: number // ASA idx in algorand
    name: string  // Name of NFT
    unitName: string  // UnitName of NFT
    manager: string  // Current manager of the token representing this NFT
    reserve: string  // Current manager of the token representing this NFT
    decimals: number  // Current manager of the token representing this NFT
    verified: boolean // IF the nft for this wallet was verified or not
    amountpaid: any // Total paid rewards per nft / per token
    stakedamount: any // Total amt staked
    tokenBalance: any
    id: any
    alltokenrewards: any // Total paid rewards per nft / per token
    vaultmintedasset: any
    vaultappid: any
    vaultappaddress: any
    vaultipfs: any
    mimetype: any
    mintedby: any

    constructor(metadata: any, 
        transactions: any,
        asset_id?: number, 
        collection_id?: string, 
        amount?: number,
        name?: string,
        unitName?: string,
        manager?: string,
        reserve?: string,
        decimals?: number, 
        verified?: boolean,  
        amountpaid?: any,
        stakedamount?: any,
        tokenBalance?: any,
        id?: any, 
        alltokenrewards?: any, 
        vaultmintedasset?: any, 
        vaultappid?: any, 
        vaultappaddress?: any, 
        vaultipfs?: any, 
        mimetype?: any,
        mintedby?: any) 
    {
        this.metadata = metadata
        this.transactions = transactions
        this.asset_id = asset_id
        this.collection_id = collection_id
        this.amount = amount
        this.name = name
        this.unitName = unitName
        this.manager = manager
        this.reserve = reserve
        this.decimals = decimals
        this.verified = verified
        this.amountpaid = amountpaid
        this.stakedamount = stakedamount
        this.tokenBalance = tokenBalance
        this.id = id
        this.alltokenrewards = alltokenrewards
        this.vaultmintedasset = vaultmintedasset
        this.vaultappid = vaultappid
        this.vaultappaddress = vaultappaddress
        this.vaultipfs = vaultipfs
        this.mimetype = mimetype
        this.mintedby = mintedby
    }

    static async createARC19AssetMintArray(wallet: Wallet, name: any, ipfs_data: any) {
        //console.log("ipfs_data", ipfs_data)
        const mintwallet = await wallet.getDefaultAccount()
        const algodClient = getAlgodClient();
        const params = await algodClient.getTransactionParams().do();
        try {
            const jsonString = JSON.stringify(ipfs_data);
            let cid = await pinJSONToNFTStorage(ps.ipfs.token, jsonString);
            const { assetURL, reserveAddress } = createReserveAddressFromIpfsCid(cid);
            //console.log("reserveAddress", reserveAddress)
            //console.log("assetURL", assetURL)
            const atc = new AtomicTransactionComposer()
            const signer = algosdk.makeBasicAccountTransactionSigner({} as algosdk.Account)
            let asset_create_tx = makeAssetCreateTxnWithSuggestedParamsFromObject({
                from: mintwallet,
                manager: mintwallet,
                assetName: name,
                unitName: "VAULT",
                total:
                parseInt('1') *
                10 ** parseInt('0'),
                decimals: parseInt('0'),
                reserve: reserveAddress,
                freeze: undefined,
                assetURL: assetURL,
                suggestedParams: params,
                clawback: undefined,
                defaultFrozen: false,
            });
            atc.addTransaction({ txn: asset_create_tx, signer })
        
            let fee_tx = makePaymentTxnWithSuggestedParamsFromObject({
                from: mintwallet,
                to: ps.application.buyback_addr,
                amount: algosToMicroalgos(0),
                suggestedParams: params,
                note: new TextEncoder().encode(
                "via ASAs.lol | " + Math.random().toString(36).substring(2)
                ),
            });
            atc.addTransaction({ txn: fee_tx, signer })
            
            const txns = atc.buildGroup().map(({ txn }) => {
                txn.group = undefined;
                return txn;
            });

            
            assignGroupID(txns) 
            const [s_purchase_amt_txn, s_purchase_amt_txn1] = await wallet.signTxn(txns)
            const combined = [
                s_purchase_amt_txn, s_purchase_amt_txn1
            ]
            const data = await sendWaitMint(combined).then((txid) => {
                return txid
            }).catch((err)=>{ 
                console.log("error", err)
            })
            return data;

        } catch (error) {
            console.log(error);
        }
        return [];
    }

    async verifyToken(wallet: Wallet) {
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        var string = `LP Rewards Staking 0.00 Verification Transaction on `
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        //JUST SENDING A 0.00 DOLLAR TRANSACTION
        const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.buyback_addr, 0, uint8))
        const grouped = [purchase_amt_txn]
        assignGroupID(grouped)
        const [s_purchase_amt_txn] = await wallet.signTxn(grouped)
        const combined = [s_purchase_amt_txn]

        return await sendWait(combined) !== undefined   
    }

    async verifyTokenWAlgo(wallet: Wallet) {
        const suggestedParams = await getSuggested(10)
        const buyer = await wallet.getDefaultAccount()
        var string = `LP Rewards Staking One Time 4.20A Verification Transaction on `
        var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
        //JUST SENDING A 0.00 DOLLAR TRANSACTION
        const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.buyback_addr, 4200000, uint8))
        const grouped = [purchase_amt_txn]
        assignGroupID(grouped)
        const [s_purchase_amt_txn] = await wallet.signTxn(grouped)
        const combined = [s_purchase_amt_txn]

        return await sendWait(combined) !== undefined   
    }

    async verifyTokenold(wallet: Wallet, assetIsOptedIn: any) {
        
        if(assetIsOptedIn.length === 0) {

            const suggestedParams = await getSuggested(10)
            const buyer = await wallet.getDefaultAccount()
            var string = `successfull verification for staking on https://asas.lol/`
            var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
            //JUST SENDING A 0.00 DOLLAR TRANSACTION
            const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.admin_addr, 0, uint8))
    
            const grouped = [
                /* asa_opt_txn, asa_opt_txn1, */ purchase_amt_txn
            ]
    
            assignGroupID(grouped)
    
            const [/*s_asa_opt_txn,*/  s_purchase_amt_txn, /*asa_xfer*/, /*price_xfer*/, /*asa_cfg*/ , /* tag_txns */, /*algo_close*/] = await wallet.signTxn(grouped)
    
            const combined = [
                /*s_asa_opt_txn, */ s_purchase_amt_txn
            ]
    
            //return await sendWait(combined) !== undefined   
            const data = await sendWait(combined).then((txid) => {
                return txid
            }).catch((err)=>{ 
                console.log("error", err)
            })
            return data

        } else {
            
            const remainingAssets = assetIsOptedIn.filter(asset => asset.optin === true)
            //console.log("remainingAssets", remainingAssets)
            var string2 = "Opted Into Asset"
            var uint82 = Uint8Array.from(string2.split("").map(x => x.charCodeAt(0)))
            const suggestedParams = await getSuggested(10)
            const buyer = await wallet.getDefaultAccount()
            var string = `successfull verification for staking on https://asas.lol/`
            var uint8 = Uint8Array.from(string.split("").map(x => x.charCodeAt(0)))
            const asa_opt_txn = new Transaction(get_asa_optin_txn(suggestedParams, buyer, (remainingAssets[0]?.asset_id === 1056720965)? 1056720965 : (remainingAssets[0]?.asset_id === 612770026)? 612770026 : 1056720965, uint82))
            //JUST SENDING A 0.00 DOLLAR TRANSACTION
            const purchase_amt_txn = new Transaction(get_pay_txn(suggestedParams, buyer, ps.application.admin_addr, 0, uint8))
    
            const grouped = [
                asa_opt_txn, purchase_amt_txn
            ]
    
            assignGroupID(grouped)
    
            const [s_asa_opt_txn, s_purchase_amt_txn, /*asa_xfer*/, /*price_xfer*/, /*asa_cfg*/ , /* tag_txns */, /*algo_close*/] = await wallet.signTxn(grouped)
    
            const combined = [
                s_asa_opt_txn, s_purchase_amt_txn
            ]
    
            //return await sendWait(combined) !== undefined   
            const data = await sendWait(combined).then((txid) => {
                return txid
            }).catch((err)=>{ 
                console.log("error", err)
            })
            return data
        }
    }

    imgSrc(): string {
        if (this.metadata.media_url !== undefined && this.metadata.media_url != "")
            return NFT.resolveUrl(this.metadata.media_url, this.metadata.reserve, 350)

        return "https://via.placeholder.com/500"
    }

    explorerSrc(): string {
        const net = ps.algod.network == "mainnet" ? "" : ps.algod.network + "."
        return "https://" + net + ps.explorer + "/asset/" + this.asset_id
    }

    static resolveStandardUrl(url: string): string {
        const [protocol, uri] = url.split("://")
        //console.log("uri: ", uri)
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
                return (uri.includes("ipfs.algonode.xyz/ipfs"))? url.replace("ipfs.algonode.xyz/ipfs", "yieldly.mypinata.cloud/ipfs").replace("#i", "") + '?img-width=350&img-height=350&quality=70' : url
        }
        //showErrorToaster("Unknown protocol: " + protocol) 
        return  ""
    }

    static resolveUrl(url: string, reserveAddr: string, width: number): string {
        const [protocol, uri] = url.split("://")
        const chunks = url.split("://")
        // Check if prefix is template-ipfs and if {ipfscid:..} is where CID would normally be
        if (chunks[0] === 'template-https' && chunks[1].includes('{ipfscid:')) {
            // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
            chunks[0] = 'ipfs'
            const cidComponents = chunks[1].split(':')
            if (cidComponents.length !== 5) {
                // give up
                console.log('unknown ipfscid format')
                return url
            }
            const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents

            // const cidVersionInt = parseInt(cidVersion) as CIDVersion
            if (cidHash.split('}')[0] !== 'sha2-256') {
                console.log('unsupported hash:', cidHash)
                return url
            }
            if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
                console.log('unsupported codec:', cidCodec)
                return url
            }
            if (asaField !== 'reserve') {
                console.log('unsupported asa field:', asaField)
                return url
            }
            let cidCodecCode
            if (cidCodec === 'raw') {
                cidCodecCode = 0x55
            } else if (cidCodec === 'dag-pb') {
                cidCodecCode = 0x70
            }

            // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
            //console.log("reserveAddr", reserveAddr)
            const addr = decodeAddress(reserveAddr)
            const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey)

            const cid = CID.create(parseInt(cidVersion) as CIDVersion, cidCodecCode, mhdigest)
            //console.log('switching to id:', cid.toString())
            chunks[1] = cid.toString()
            //console.log('redirecting to ipfs:', chunks[1])
        }
        if (chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
            // Look for something like: template:ipfs://{ipfscid:1:raw:reserve:sha2-256} and parse into components
            chunks[0] = 'ipfs'
            const cidComponents = chunks[1].split(':')
            if (cidComponents.length !== 5) {
                // give up
                console.log('unknown ipfscid format')
                return url
            }
            const [, cidVersion, cidCodec, asaField, cidHash] = cidComponents

            // const cidVersionInt = parseInt(cidVersion) as CIDVersion
            if (cidHash.split('}')[0] !== 'sha2-256') {
                console.log('unsupported hash:', cidHash)
                return url
            }
            if (cidCodec !== 'raw' && cidCodec !== 'dag-pb') {
                console.log('unsupported codec:', cidCodec)
                return url
            }
            if (asaField !== 'reserve') {
                console.log('unsupported asa field:', asaField)
                return url
            }
            let cidCodecCode
            if (cidCodec === 'raw') {
                cidCodecCode = 0x55
            } else if (cidCodec === 'dag-pb') {
                cidCodecCode = 0x70
            }

            // get 32 bytes Uint8Array reserve address - treating it as 32-byte sha2-256 hash
            //console.log("reserveAddr", reserveAddr)
            const addr = decodeAddress(reserveAddr)
            const mhdigest = digest.create(mfsha2.sha256.code, addr.publicKey)

            const cid = CID.create(parseInt(cidVersion) as CIDVersion, cidCodecCode, mhdigest)
            //console.log('switching to id:', cid.toString())
            chunks[1] = cid.toString() + '/' + chunks[1].split('/').slice(1).join('/')
            //console.log('redirecting to ipfs:', chunks[1])
        }
    // No protocol specified, give up
    if (chunks.length < 2) return url
        switch(chunks[0]){
            case "ipfs":
                return (chunks[1].includes("#i"))? ps.ipfs.ipfsGateway + chunks[1].replace("#i", "") + '?optimizer=image&width='+width+'&quality=70' : ps.ipfs.ipfsGateway + chunks[1] //ps.ipfs.ipfsGateway + chunks[1]
            case "algorand":
                //TODO: create url to request note field?
                showErrorToaster("No url resolver for algorand protocol string yet")
                return 
            case "http":
                return url
            case "https":
                return (uri.includes("ipfs.algonode.xyz/ipfs"))? url.replace("#i", "") + '?optimizer=image&width='+width+'&quality=70' : url
                //return url
        }

        showErrorToaster("Unknown protocol: " + protocol) 
        return  ""
    }

    static async fromToken(token: any): Promise<NFT> {
        if (token === undefined) return undefined;
        //let checkUrlExt = token.params.url.split(/[#?]/)[0].split('.').pop().trim()
        //if (checkUrlExt!=='json') return undefined;
        //console.log("tokentoken",token)
        const chunks = token.params.url.split("://")
        let isArc19 = false
        if (chunks[0] === 'template-https' && chunks[1].includes('{ipfscid:') || chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
            isArc19 = true
        }
        const url = resolveProtocol(token.params.url, token.params.reserve)
        //console.log("resolveProtocol",url)
        // TODO: provide getters for other storage options
        // arweave? note field?

        const urlMimeType = await getMimeTypeFromIpfs(url)
        //console.log("urlMimeType",urlMimeType)

        // eslint-disable-next-line default-case
        switch (urlMimeType) {
            case JSON_TYPE:
            if (token.params.url.endsWith(ARC69_URL_SUFFIX)) {
                return new NFT(await getArc69MetaFromIpfs(url), 
                token.transactions, 
                token.index, 
                token.collection_id,
                token.amount, 
                token.params.name,
                token.params['unit-name'],
                token.params.creator,
                token.params.reserve, 
                token.alltokenrewards)
            } else if(token.params.url.endsWith(ARC3_URL_SUFFIX)) {
                return new NFT(await getMetaFromIpfs(url), 
                token.transactions, 
                token.index, 
                token.collection_id,
                token.amount, 
                token.params.name,
                token.params['unit-name'],
                token.params.creator, 
                token.params.reserve, 
                token.alltokenrewards)
                //return new NFT(await getNFTFromMetadata(token.params.url), token.index, token['params']['manager'])
            } else {
                console.log("fromTokenfromToken-urlMimeType",token)
            }
        }

        if (token.params.url.endsWith(ARC69_URL_SUFFIX)) {
            //return new NFT(ARC69Metadata.fromToken(token), token, urlMimeType)
            return new NFT(await getArc69MetaFromIpfs(url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.name,
            token.params['unit-name'],
            token.params.creator, 
            token.params.reserve, 
            token.alltokenrewards)
        } else if(token.params.url.endsWith(ARC3_URL_SUFFIX)) {
            return new NFT(await getMetaFromIpfs(url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.name,
            token.params['unit-name'],
            token.params.creator, 
            token.params.reserve, 
            token.alltokenrewards)
        } else if(isArc19) {
            console.log("fromTokenfromToken-isArc19",token)
            return new NFT(await getArc19MetaFromHash(token.note, token.params.url), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.name,
            token.params['unit-name'],
            token.params.creator, 
            token.params.reserve, 
            token.alltokenrewards)
        } else {
            console.log("fromTokenfromToken",token)
            return new NFT(await getArc69MetaFromHash(token.note, token.params['unit-name'], token.params.url, token.params.name), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.name,
            token.params['unit-name'],
            token.params.creator, 
            token.params.reserve, 
            token.alltokenrewards)
        }
    }

    static async fromVaultInfo(token: any): Promise<NFT> {
        if (token === undefined || (token.params['unit-name'] !== 'THCSCNFT' && token.params['unit-name'] !== 'VAULT')) return undefined;
        const chunks = token.params.url.split("://")
        let isArc19 = false
        if (chunks[0] === 'template-https' && chunks[1].includes('{ipfscid:') || chunks[0] === 'template-ipfs' && chunks[1].startsWith('{ipfscid:')) {
            isArc19 = true
        }
        const url = resolveProtocol(token.params.url, token.params.reserve)
        //console.log("resolveProtocol",url)

        if(isArc19) {
            const metadata = await getMetaFromIpfs(url)
            //console.log("fromTokenfromToken-metadata",metadata)
            const vaultappid = (metadata?.properties?.traits['vaultappid'])? metadata?.properties?.traits['vaultappid'] : Number(metadata?.properties?.vaultappid)
            return new NFT(metadata, 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.name,
            token.params['unit-name'],
            token.params.creator, 
            token.params.reserve, 
            token.params.decimals,
            token.alltokenrewards,
            0,
            0,
            0,
            token.index, 
            token.alltokenrewards,
            token.index, 
            vaultappid,
            algosdk.getApplicationAddress(parseInt(vaultappid)),
            metadata?.image,
            metadata?.image_mime_type,
            token.params.creator)
        } else {
            //console.log("fromTokenfromToken",token)
            return new NFT(await getArc69MetaFromHash(token?.note, token.params['unit-name'], token.params.url, token.params?.name), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.name,
            token.params['unit-name'],
            token.params.creator, 
            token.params.reserve, 
            token.params.decimals,
            token.alltokenrewards,
            0,
            0,
            0,
            token.index, 
            token.alltokenrewards,
            token.index, 
            undefined,
            undefined,
            undefined,
            undefined,
            token.params.creator)
        }
    }

    static async fromTokenAndLP(token: any, tokenBalance: any): Promise<NFT> {
        //console.log("fromTokenAndLP",token)
        //console.log("fromTokenAndLP",tokenBalance)
        if (token === undefined) return undefined;
            //console.log("fromTokenAndLP2",await getTokenMetaFromHash(token.params['unit-name'], token.params.name))
            
        try {
            return new NFT(await getTokenMetaFromHash(token.params['unit-name'], token.params.name), 
            token.transactions, 
            token.index, 
            token.collection_id,
            token.amount, 
            token.params.name,
            token.params['unit-name'],
            token.params.creator, 
            token.params?.reserve, 
            token.params.decimals, 
            token.validatedStaking, 
            token.amountpaid,
            token.stakedamount,
            tokenBalance,
            token.id, 
            token.alltokenrewards)
        } catch(error) {
            console.log("fromTokenAndLP error", error)
        }
    }

    static emptyNFT(): NFT {
        return new NFT(emptyMetadata(), emptyTransactionsdata())
    }
}


export type Transactions = {
    id: string
    amountpaid: number
    asset_id: number
    tokenname: string
    tokenunit: string
    txid: string
    createdat: string
}

export function emptyTransactionsdata(): Transactions {
    return {
        id: "",
        amountpaid: 0,
        asset_id: 0,
        tokenname: "",
        tokenunit: "",
        txid: "",
        createdat: "",
    };
}

export type NFTMetadata = {
    name: string
    description: string
    image: string
    mime_type: string
    unitName: string
    reserve: string
    properties: {
        file: {
            name: string
            type: string
            size: number
        }
        artist: string
        trait_type: string
    }
}

export type ARC19Metadata = {
    description: string
    image: string
    image_mimetype: string
    image_integrity: string
    external_url: string
    properties: {
        zTT: string
        zTT1: string
        zTT2: string
        zTT3: StringDecoder
        Type: string
        Golden_Tucan: string
        Size: string
        $BPM_yield_per_week: string
        Tracking_Number: string
    }
}

export type ARC69Metadata = {
    standard: string
    description: string
    image: string
    total: number
    name: string
    unitName: string
    reserve: string
    royalty: number
    image_integrity: string
    image_mimetype: string
    properties: {
        file: {
            name: string
            type: string
            size: number
        }
        artist: string
        trait_type: string
    }
}

export function mdhash(md: NFTMetadata): Uint8Array {
    const hash = sha256.create();
    hash.update(JSON.stringify(md));
    return new Uint8Array(hash.digest())
}

export function emptyMetadata(): NFTMetadata {
    return {
        name: "",
        description: "",
        image: "",
        mime_type: "",
        unitName: "",
        reserve: "",
        properties: {
            file: {
                name: "",
                type: "",
                size: 0,
            },
            artist: "",
            trait_type: "",
        }
    };
}
export function emptyARC69Metadata(): ARC69Metadata {
    return {
        standard: "",
        description: "",
        image: "",
        total: 0,
        name:  "",
        unitName:  "",
        reserve: "",
        royalty: 0,
        image_integrity:  "",
        image_mimetype:  "",
        properties: {
            file: {
                name: "",
                type: "",
                size: 0,
            },
            artist: "",
            trait_type: "",
        }
    };
}