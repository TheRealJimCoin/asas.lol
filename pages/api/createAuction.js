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
            asset_id: parseInt(data.asset_id),
            payment_asset_id: parseInt(data.payment_asset_id),
            payment_unitname: data.payment_unitname,
            payment_decimal: parseInt(data.payment_decimal),
            payment_creator: data.payment_creator,
            wallet: {address: data.address},
            name: data.name,
            image: data.image,
            mimetype: data.mimetype,
            auctionappid: data.auctionappid,
            ticketcost: data.ticketcost,
            priority: 0,
            lengthofauction: parseInt(data.lengthofauction),
            isactive: false, 
            iscomplete: false,
            createdat: data.createdat,
            creator_wallet: data.creator_wallet,
            seller_wallet: data.seller_wallet,
            isverified: data.isverified,
            isverifiedalgoseas: data.isverifiedalgoseas,
            isverifieddart: data.isverifieddart,
            isverifiedrand: data.isverifiedrand,
            isverifiedalgogems: data.isverifiedalgogems,
            twitter: data.twitter,
            website: data.website,
            marketplace: data.marketplace
        }},
    }).then((senddata) => {
        //console.log("nft auction created", senddata)
        res.json({success: true, message: 'nft auction created'})
    }).catch((err)=>{ 
        //console.log("error creating nft auction", err)
        console.log("error creating nft auction", err)
        console.log("error claiming nft auction", err.graphQLErrors)
        res.json({success: false, message: 'error creating nft auction'})
    }) 
}) 

export default handler