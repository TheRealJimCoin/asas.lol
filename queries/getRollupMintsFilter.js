import { gql } from '@apollo/client'

export default gql`
subscription NFTRollups($first: Int, $offset: Int, $asset_id: Int64) {
    queryNFTRollups(filter: {vaultmintedasset: {eq: $asset_id}}, first: $first, offset: $offset) {
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