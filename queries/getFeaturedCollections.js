import { gql } from '@apollo/client'

export default gql`
subscription Collections {
    queryCollections(order: {desc: created}, filter: {priority: {eq: 333}}) {
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
        priority
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