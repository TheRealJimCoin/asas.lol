import nextConnect from 'next-connect'
import { INSERT_NEW_LISTING } from "../../queries/insertNewListing"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("listing data", data)
    await client.mutate({
        mutation: INSERT_NEW_LISTING,
        variables: {  listings: { 
            asset_id: parseInt(data.asset_id),
            payment_asset_id: parseInt(data.payment_asset_id),
            payment_unitname: data.payment_unitname,
            payment_decimal: parseInt(data.payment_decimal),
            payment_creator: data.payment_creator,
            wallet: {address: data.address},
            name: data.name,
            image: data.image,
            mimetype: data.mimetype,
            listingappid: data.listingappid,
            ticketcost: data.ticketcost,
            priority: 0,
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
        //console.log("nft listing created", senddata)
        res.json({success: true, message: 'nft buy it now listing created'})
    }).catch((err)=>{ 
       console.log("error creating nft listing", err)
        console.log("error claiming NFT", err.graphQLErrors)
        res.json({success: false, message: 'error creating nft buy it now listing'})
    }) 
}) 

export default handler