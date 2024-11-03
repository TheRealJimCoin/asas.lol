import { gql } from '@apollo/client'

export default gql`
subscription ASAsListings {
    queryASAsListings(order: {desc: createdat}, first: 10, offset: 0) {
        asset_id
        collection_id
        createdat
        id
        creator_wallet
        image
        listingappid
        lastsaleprice
        isverifiedrand
        isverifieddart
        isverifiedalgoseas
        isverifiedalgogems
        isverified
        isfeatured
        iscomplete
        isactive
        twitter
        ticketcost
        seller_wallet_nfd
        seller_wallet
        priority
        payment_unitname
        payment_creator
        payment_decimal
        payment_asset_id
        name
        mimetype
        marketplace
        website
    }
}`