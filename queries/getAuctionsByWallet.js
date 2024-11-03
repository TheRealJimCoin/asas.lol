import { gql } from '@apollo/client'

export default gql`
subscription Auctions($address: String) {
    queryWallet(filter: {has: asasauctions, address: {eq:$address}}) {
        address
        asasauctions(filter: {iscomplete: true}, order: {desc: createdat}) {
            asset_id
            name
            isactive
            creator_wallet
            iscomplete
            auctionappid
        }
    }
}`