import { gql } from '@apollo/client'

const INSERT_UPDATE_ROLLUPS = gql`
  mutation addNFTRollups($nftrollup: [AddNFTRollupsInput!]!) {
    addNFTRollups(input: $nftrollup) {
      numUids
    }
  }
`;

export { INSERT_UPDATE_ROLLUPS };