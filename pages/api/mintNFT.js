import nextConnect from 'next-connect'
import client from "../../lib/apollo"
const handler = nextConnect()

handler.post(async (req, res) => {
    let data = req.body
    data = JSON.parse(data)
    res.json({success: true, message: 'nft minted'})
}) 

export default handler