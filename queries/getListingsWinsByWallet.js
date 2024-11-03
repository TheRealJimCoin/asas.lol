import { gql } from '@apollo/client'

export default gql`
query auctionsWinners($address: String, $first: Int, $offset: Int) {
    queryASAsAuctionsWinners(first: $first, offset: $offset, order: {desc: createdat}, filter: {receiver: {eq: $address}}) {
        id
        txid
        receiver
        createdat
        auctions {
          id
          asset_id
          image
          isactive
          iscomplete
          name
          mimetype
          marketplace
          auctionappid
          lengthofauction
          isverifieddart
          isverifiedalgoseas
          isverifiedalgogems
          isverifiedrand
          isverified
          createdat
          twitter
          ticketcost
          priority
          seller_wallet_nfd
          seller_wallet
          website
        }
      }
    aggregateASAsAuctionsWinners(filter: {receiver: {eq: $address}}) {
        count
    }
}`