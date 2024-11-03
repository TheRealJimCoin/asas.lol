import nextConnect from 'next-connect'
import GET_RECENT_LISTINGS from "../../queries/getRecentListings"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.get(async (req, res) => {
    await client.mutate({
        mutation: GET_RECENT_LISTINGS
    }).then((senddata) => {
        //console.log("get recent buy it now listings data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        //console.log("error getting recent buy it now listings data", err)
        res.status(500).json({ error: 'Internal Server Error' })
    }) 
}) 

export default handler