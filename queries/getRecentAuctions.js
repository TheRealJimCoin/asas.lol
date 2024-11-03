import { gql } from '@apollo/client'

export default gql`
subscription ASAsAuctions {
    queryASAsAuctions(order: {desc: createdat}, first: 10, offset: 0) {
        id
        isactive
        name
        createdat
        payment_asset_id
        payment_creator
        payment_decimal
        payment_unitname
        auctionappid
        asset_id
        collection_id
        creator_wallet
        image
        iscomplete
        mimetype
        marketplace
        lengthofauction
        lastsaleprice
        isverifiedrand
        isverifiedalgoseas
        isverifieddart
        isverified
        isfeatured
        isverifiedalgogems
        priority
        seller_wallet
        seller_wallet_nfd
        ticketcost
        twitter
        website
    }
}`