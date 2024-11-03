import nextConnect from 'next-connect'
import { INSERT_NEW_AUCTION } from "../../queries/insertNewAuction"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("auction proceeds claimed", data)
    await client.mutate({
        mutation: INSERT_NEW_AUCTION,
        variables: {  auctions: { 
            auctionappid: data.auctionappid,
            isactive: true,
            iscomplete: true,
            auctionspaidout: {amountpaid: data.amountpaid, payment_asset_id: data.payment_asset_id, asset_id: data.asset_id, auction_id: data.auctionappid, createdat: data.createdat, receiver: data.receiver, tokenunit: data.tokenunit, txid: data.txid }
        }},
    }).then((senddata) => {
        //console.log("nft auction proceeds claimed", senddata)
        res.json({success: true, message: 'nft auction proceeds claimed'})
    }).catch((err)=>{ 
        console.log("error creating nft auction", err)
        res.json({success: false, message: 'error claiming nft auction proceeds'})
    }) 
}) 

export default handler