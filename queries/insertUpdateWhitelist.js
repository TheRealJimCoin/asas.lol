import { gql } from '@apollo/client'

const INSERT_UPDATE_WHITELIST = gql`
  mutation addWhitelist($whitelist: [AddWhitelistInput!]!) {
    addWhitelist(input: $whitelist) {
      numUids
    }
  }
`;

export { INSERT_UPDATE_WHITELIST };