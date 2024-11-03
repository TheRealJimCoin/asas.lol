import { gql } from '@apollo/client'

export default gql`
subscription Auctions($first: Int, $offset: Int, $projectfilter: String!) {
    queryASAsAuctions(first: $first, offset: $offset, order: {desc: priority, then: {desc: createdat}}, filter: {collection_id: {anyoftext: $projectfilter}, isactive: true, iscomplete: false}) {
        id
        name
        image
        mimetype
        asset_id
        createdat
        creator_wallet
        auctionappid
        payment_asset_id
        payment_unitname
        payment_creator
        payment_decimal
        lengthofauction
        lastsaleprice
        iscomplete
        isverified
        isverifiedalgoseas
        isverifiedalgogems
        isverifieddart
        isverifiedrand
        ticketcost
        priority
        seller_wallet
        seller_wallet_nfd
        twitter
        marketplace
        website
    }
}`