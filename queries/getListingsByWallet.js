import { gql } from '@apollo/client'

export default gql`
subscription Wallets($address: String) {
    queryWallet(filter: {address: {eq: $address}}) {
        address
        asasauctions(order: {desc: createdat}, first: 75, offset: 0) {
            id
            name
            image
            asset_id
            createdat
            creator_wallet
            auctionappid
            payment_unitname
            payment_asset_id
            lengthofauction
            iscomplete
            isverified
            isverifiedalgoseas
            isverifiedalgogems
            isverifieddart
            isverifiedrand
            mimetype
            priority
            ticketcost
            twitter
            marketplace
            website
            seller_wallet
            auctionspaidout {
              txid
              tokenunit
              receiver
              createdat
              id
              auction_id
              amountpaid
              asset_id
            }
        }
        asaslistings(order: {desc: createdat}, first: 75, offset: 0) {
            id
            name
            image
            asset_id
            createdat
            creator_wallet
            listingappid
            payment_unitname
            payment_asset_id
            payment_creator
            payment_decimal
            iscomplete
            isverified
            isverifiedalgoseas
            isverifiedalgogems
            isverifieddart
            isverifiedrand
            mimetype
            priority
            ticketcost
            twitter
            marketplace
            website
            seller_wallet
            listingspaidout {
              txid
              tokenunit
              receiver
              createdat
              id
              listing_id
              amountpaid
              asset_id
            }
        }
    }
}`