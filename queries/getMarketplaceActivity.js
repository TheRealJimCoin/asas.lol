import { gql } from '@apollo/client'

export default gql`
query Activity {
    aggregateASAsAuctionsPaidOut {
      amountpaidSum
    }
    aggregateASAsAuctions {
      count
    }
    liveauctions: aggregateASAsAuctions(filter: {isactive: true, iscomplete: false}) {
      count
    }
    aggregateASAsListingsPaidOut {
      amountpaidSum
    }
    aggregateASAsListings {
      count
    }
    livelistings: aggregateASAsListings(filter: {isactive: true, iscomplete: false}) {
      count
    }
    toplistingsales: queryASAsListingsPaidOut(order: {desc: amountpaid}, first: 10, offset: 0) {
        txid
        tokenunit
        receiver
        listing_id
        id
        createdat
        asset_id
        amountpaid
        payment_decimal
        listings {
          name
          seller_wallet
          seller_wallet_nfd
          image
          createdat
          asset_id
          mimetype
          listingappid
        }
      }
    topsales: queryASAsAuctionsPaidOut(order: {desc: amountpaid}, first: 10, offset: 0) {
        txid
        tokenunit
        receiver
        auction_id
        id
        createdat
        asset_id
        amountpaid
        payment_decimal
        auctions {
          name
          seller_wallet
          seller_wallet_nfd
          image
          createdat
          asset_id
          mimetype
          lengthofauction
          auctionappid
        }
      }
      recentsales: queryASAsAuctionsPaidOut(filter: {amountpaid: {ge: 0}}, order: {desc: createdat}, first: 10, offset: 0) {
        txid
        tokenunit
        receiver
        auction_id
        id
        createdat
        asset_id
        amountpaid
        payment_decimal
        auctions {
          name
          seller_wallet
          seller_wallet_nfd
          image
          createdat
          asset_id
          mimetype
          lengthofauction
          auctionappid
        }
      }
      recentlistingsales: queryASAsListingsPaidOut(filter: {amountpaid: {ge: 0}}, order: {desc: createdat}, first: 10, offset: 0) {
        txid
        tokenunit
        receiver
        listing_id
        id
        createdat
        asset_id
        amountpaid
        payment_decimal
        listings {
          name
          seller_wallet
          seller_wallet_nfd
          image
          createdat
          asset_id
          mimetype
          listingappid
        }
      }
}`