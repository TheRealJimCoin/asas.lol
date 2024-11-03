import { gql } from '@apollo/client'

export default gql`
subscription Auction($auctionappid: Int64) {
  queryASAsAuctions(filter: {auctionappid: {eq: $auctionappid}}) {
    id
    auctionappid
    creator_wallet
    createdat
    asset_id
    name
    isactive
    iscomplete
    image
    lastsaleprice
    mimetype
    twitter
    lengthofauction
    payment_asset_id
    payment_unitname
    payment_creator
    payment_decimal
    ticketcost
    priority
    seller_wallet
    seller_wallet_nfd
    auctionswinners {
      receiver
      txid
      id
      createdat
      auction_id
      asset_id
    }
    auctionspaidout {
      receiver
      id
      createdat
      auction_id
      asset_id
      amountpaid
      tokenunit
      txid
    }
  }
}`