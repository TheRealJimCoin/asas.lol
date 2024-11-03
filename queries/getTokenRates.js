import { gql } from '@apollo/client'

export default gql`
subscription Tokens($first: Int, $offset: Int) {
    queryTokens(first: $first, offset: $offset, filter: {isactive: true, ispayment: true}) {
        name
        asset_id
        image
        unitname
        decimal
        rate
        id
        isactive
        ispayment
        creator_wallet
    }
}`