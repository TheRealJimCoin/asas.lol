import { gql } from '@apollo/client'

export default gql`
subscription Collections($collection_id: String) {
    queryCollections(filter: {collection_id: {eq: $collection_id}}) {
        website
        twitter
        telegram
        mimetype
        isverifiedshufl
        isverifiedrand
        isverifiedalgoxnft
        isverifieddart
        isverifiedalgogems
        isverifiedalgoseas
        instagram
        discord
        created
        collection_preview
        creator
        collection_name
        collection_id
        collection_description
        collection_image
        algoxnft_id
        algoseas_id
        shufl_id
        id
    }
}`