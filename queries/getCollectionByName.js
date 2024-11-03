import { gql } from '@apollo/client'

export default gql`
query MyQuery($name: String!) {
    collectionsByName(name: $name) {
        collection_name
        collection_description
        collection_id
        collection_image
        collection_preview
        discord
        priority
        created
        instagram
        website
        twitter
        mimetype
        telegram
        isverifiedalgoxnft
        isverifiedshufl
        isverifiedrand
        isverifiedalgoseas
        isverifiedalgogems
        isverifieddart
    }
}`