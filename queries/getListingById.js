import { gql } from '@apollo/client'

export default gql`
subscription Listing($listingappid: Int64) {
  queryASAsListings(filter: {listingappid: {eq: $listingappid}}) {
    id
    listingappid
    lastsaleprice
    creator_wallet
    createdat
    asset_id
    name
    isactive
    iscomplete
    image
    mimetype
    twitter
    ticketcost
    payment_asset_id
    payment_creator
    payment_decimal
    payment_unitname
    priority
    seller_wallet
    seller_wallet_nfd
    listingspaidout {
      receiver
    }
  }
}`