import nextConnect from 'next-connect'
import { INSERT_UPDATE_ROLLUPS } from "../../queries/insertUpdateRollups"
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    //console.log("data", data)
    await client.mutate({
        mutation: INSERT_UPDATE_ROLLUPS,
        variables: { nftrollup: { 
            createdat: data.createdat,
            vaultipfs: data.vaultipfs,
            vaultappid: parseInt(data.vaultappid),
            vaultappaddress: data.vaultappaddress,
            vaultipfsmimetype: data.vaultipfsmimetype,
            vaultmintedasset: parseInt(data.vaultmintedasset),
            mintedby: data.mintedby,
            isactive: true, 
            txid: data.txid
        }},
    }).then((senddata) => {
        //console.log("nft vault added", senddata)
        res.json({success: true, message: 'nft vault added'})
    }).catch((err)=>{ 
        console.log("error adding nft vault", err.graphQLErrors)
        res.json({success: false, message: 'error adding nft vault'})
    }) 
}) 

export default handler