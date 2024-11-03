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
            listingappid: data.listingappid,
            isactive: data.isactive,
            iscomplete: (data.iscomplete)? data.iscomplete : false
        }},
    }).then((senddata) => {
        //console.log("nft listing updated", senddata)
        res.json({success: true, message: 'nft listing updated'})
    }).catch((err)=>{ 
        console.log("error updating nft listing", err)
        res.json({success: false, message: 'error updating nft listing'})
    }) 
}) 

export default handler