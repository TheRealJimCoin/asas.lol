import nextConnect from 'next-connect'
import GET_ALL_COLLECTIONS from "../../queries/getAllCollections"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    await client.mutate({
        mutation: GET_ALL_COLLECTIONS,
        variables: { 
            first: data.first, 
            offset: data.offset,
            search: '/(?i)' + data.search + '\s*/', 
            order: data.order !== '' && data.order !== undefined
            ? data.order === 'updated' ? { asc: 'updated' } : { desc: 'created' }
            : { desc: 'priority' } //, then: { desc: 'created' }
        }
    }).then((senddata) => {
        //console.log("get collections data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        //console.log("error getting collections data", err)
        res.status(500).json({ error: 'Internal Server Error' })
    }) 
}) 

export default handler