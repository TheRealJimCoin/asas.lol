import nextConnect from 'next-connect'
import GET_AUCTIONS_BY_WALLET from "../../queries/getAuctionsByWallet"
import client from "../../lib/apollo"
import { getCookie } from 'cookies-next'
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    let address = getCookie('cw', { req, res })

    await client.mutate({
        mutation: GET_AUCTIONS_BY_WALLET,
        variables: { address: address }
    }).then((senddata) => {
        //console.log("get auctions data by wallet", senddata)
        res.status(200).json(senddata);
    }).catch((err)=>{ 
        console.log("error getting auctions data by wallet", err)
    }) 
    //res.json(data)
}) 

export default handler