import nextConnect from 'next-connect'
import { INSERT_NEW_AUCTION } from "../../queries/insertNewAuction"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("auction data", data)
    await client.mutate({
        mutation: INSERT_NEW_AUCTION,
        variables: {  auctions: { 
            auctionappid: data.auctionappid,
            isactive: data.isactive,
            iscomplete: (data.iscomplete)? data.iscomplete : false
        }},
    }).then((senddata) => {
        //console.log("nft auction created", senddata)
        res.json({success: true, message: 'nft auction created'})
    }).catch((err)=>{ 
        console.log("error creating nft auction", err)
        res.json({success: false, message: 'error creating nft auction'})
    }) 
}) 

export default handler