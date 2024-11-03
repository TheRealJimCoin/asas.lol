import { gql } from '@apollo/client'

const INSERT_NEW_AUCTION = gql`
  mutation addASAsAuctions($auctions: [AddASAsAuctionsInput!]!) {
    addASAsAuctions(input: $auctions, upsert: true) {
      numUids
      aSAsAuctions {
        isactive
      }
    }
  }
`;

export { INSERT_NEW_AUCTION };