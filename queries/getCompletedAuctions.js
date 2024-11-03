import { gql } from '@apollo/client'

export default gql`
query Auctions($first: Int, $offset: Int) {
    queryASAsAuctions(filter: {iscomplete: true}, first: $first, offset: $offset, order: {desc: createdat}) {
        id
        name
        image
        auctionappid
        asset_id
        createdat
        creator_wallet
        lengthofauction
        iscomplete
        mimetype
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
        auctionswinners {
          id
          auction_id
          receiver
          txid
          createdat
          asset_id
        }
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
    aggregateASAsAuctions(filter: {iscomplete: true}) {
      count
    }
}`