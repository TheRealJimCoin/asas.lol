import { gql } from '@apollo/client'

export default gql`
subscription Collections($first: Int, $offset: Int, $search: String, $order: CollectionsOrder) {
    queryCollections(first: $first, offset: $offset, filter: {collection_name: {regexp: $search}}, order: $order) {
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
        id
    }
}`