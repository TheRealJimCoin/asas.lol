import nextConnect from 'next-connect'
import { INSERT_NEW_AUCTION } from "../../queries/insertNewAuction"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("auction winner claimed", data)
    await client.mutate({
        mutation: INSERT_NEW_AUCTION,
        variables: {  auctions: { 
            auctionappid: data.auctionappid,
            isactive: true,
            iscomplete: true,
            auctionswinners: {asset_id: data.asset_id, auction_id: data.auctionappid, createdat: data.createdat, receiver: data.receiver, txid: data.txid }
        }},
    }).then((senddata) => {
        //console.log("nft auction winner claimed", senddata)
        res.json({success: true, message: 'nft auction winner claimed'})
    }).catch((err)=>{ 
        console.log("error creating nft auction", err)
        res.json({success: false, message: 'error claiming nft auction winner'})
    }) 
}) 

export default handler