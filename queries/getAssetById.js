import { gql } from '@apollo/client'

export default gql`
mutation addASAStats($asa: [AddASAStatsInput!]!) {
    addASAStats(input: $asa, upsert: true) {
        aSAStats {
            asset_id
            total
            clawback
            created
            updated
            creator
            decimals
            has_collection
            algoxnft_id
            algoseas_id
            shufl_id
            arc19_data
            arc3_data
            arc69_data
            mimetype
            collection_id
            collection_name
            collection_description
            estimated_price
            freeze
            manager
            name
            reserve
            url
            unit_name
            isverified
            istoken
            isvault
            vaultappid
            twitter
            discord
            website
            marketplace
        }
    }
  }`