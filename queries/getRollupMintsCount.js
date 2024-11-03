import { gql } from '@apollo/client'

export default gql`
subscription aggregateNFTRollups {
    aggregateNFTRollups {
        count
    }
}`