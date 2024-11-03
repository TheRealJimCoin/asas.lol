import nextConnect from 'next-connect'
import GET_RECENT_COLLECTIONS from "../../queries/getRecentCollections"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.get(async (req, res) => {
    await client.mutate({
        mutation: GET_RECENT_COLLECTIONS
    }).then((senddata) => {
        //console.log("get recent collections data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        //console.log("error getting recent collections data", err)
        res.status(500).json({ error: 'Internal Server Error' })
    }) 
}) 

export default handler