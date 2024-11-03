import nextConnect from 'next-connect'
import GET_FEATURED_COLLECTIONS from "../../queries/getFeaturedCollections"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.get(async (req, res) => {
    await client.mutate({
        mutation: GET_FEATURED_COLLECTIONS
    }).then((senddata) => {
        //console.log("get featured collections data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        //console.log("error getting featured collections data", err)
        res.status(500).json({ error: 'Internal Server Error' })
    }) 
}) 

export default handler