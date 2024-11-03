import { gql } from '@apollo/client'

export default gql`
subscription NFTRollups($first: Int, $offset: Int) {
    queryNFTRollups(first: $first, offset: $offset) {
        vaultmintedasset
        vaultipfs
        vaultappid
        vaultappaddress
        txid
        mintedby_nfd
        mintedby
        isactive
        id
        createdat
    }
}`