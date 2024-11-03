import nextConnect from 'next-connect'
import GET_RECENT_AUCTIONS from "../../queries/getRecentAuctions"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.get(async (req, res) => {
    await client.mutate({
        mutation: GET_RECENT_AUCTIONS
    }).then((senddata) => {
        //console.log("get recent auctions data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        //console.log("error getting recent auctions data", err)
        res.status(500).json({ error: 'Internal Server Error' })
    }) 
}) 

export default handler