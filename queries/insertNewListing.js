import { gql } from '@apollo/client'

const INSERT_NEW_LISTING = gql`
  mutation addASAsListings($listings: [AddASAsListingsInput!]!) {
    addASAsListings(input: $listings, upsert: true) {
      numUids
      aSAsListings {
        isactive
      }
    }
  }
`;

export { INSERT_NEW_LISTING };