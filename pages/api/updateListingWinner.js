import nextConnect from 'next-connect'
import { INSERT_NEW_LISTING } from "../../queries/insertNewListing"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("buy it now listing claimed", data)
    await client.mutate({
        mutation: INSERT_NEW_LISTING,
        variables: {  listings: { 
            listingappid: data.listingappid,
            isactive: true,
            iscomplete: true,
            listingspaidout: {amountpaid: data.amountpaid, asset_id: data.asset_id, listing_id: data.listingappid, createdat: data.createdat, receiver: data.receiver, tokenunit: data.tokenunit, txid: data.txid },
            listingswinners: {asset_id: data.asset_id, listing_id: data.listingappid, createdat: data.createdat, receiver: data.receiver, txid: data.txid }
        }},
    }).then((senddata) => {
        //console.log("nft buy it now listing claimed", senddata)
        res.json({success: true, message: 'nft buy it now listing claimed'})
    }).catch((err)=>{ 
        console.log("error creating nft buy it now listing", err)
        res.json({success: false, message: 'error claiming nft buy it now listing'})
    }) 
}) 

export default handler