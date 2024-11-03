import { gql } from '@apollo/client'

export default gql`
query Tokens($first: Int, $offset: Int) {
    queryWhitelist(filter: {collection_id: {eq: "base"}}, first: $first, offset: $offset, order: {asc: asset_id}) {
        asset_id
        description
        id
        image
        name
        unitname
        qty
        verified
        reserve
        website
    }
    queryTokens(filter: {isactive: true}) {
        id
        name
        baseamount
        maxamount
        asset_id
        apy
        unitname
        website
        frequency
        isactive
        creator_wallet
    }
    aggregateWhitelist(filter: {collection_id: {eq: "base"}}) {
      count
    }
}`