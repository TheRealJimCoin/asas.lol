import nextConnect from 'next-connect'
import GET_TOKEN_RATES from "../../queries/getTokenRates"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    await client.mutate({
        mutation: GET_TOKEN_RATES,
        variables: { 
            first: data.first, 
            offset: data.offset
        }
    }).then((senddata) => {
        //console.log("get live tokens data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        console.log("error getting live tokens data", err)
    }) 
    //res.json(data)
}) 

export default handler