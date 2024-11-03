import nextConnect from 'next-connect'
import GET_LIVE_AUCTIONS from "../../queries/getLiveAuctions"
import client from "../../lib/apollo"
import GET_LIVE_AUCTIONS_FILTER_PROJECT from "../../queries/getLiveAuctionsFilterProject"
import { getCookie } from 'cookies-next'
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //let address = getCookie('cw', { req, res })
    //mutation: GET_LIVE_AUCTIONS,
    //variables: { first: data.first, offset: data.offset }
    await client.mutate({
        mutation: (data?.projectfilter !=='')? GET_LIVE_AUCTIONS : GET_LIVE_AUCTIONS,
        variables: { first: data.first, offset: data.offset  } // data.first data.offset 
    }).then((senddata) => {
        //console.log("get live auction data", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        //console.log("get live auction data", err)
        //console.log("error auction", err.graphQLErrors)
        console.log("error getting live auction data", err)
    }) 
}) 

export default handler