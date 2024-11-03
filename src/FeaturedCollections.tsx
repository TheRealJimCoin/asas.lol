/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Center, Icon, Tooltip, Text, Link, Image, HStack, Flex, Container, useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet'
import { CollectionCard } from './CollectionCard'
import { Carousel, LeftButton, RightButton } from "chakra-ui-carousel"
import { Provider } from 'chakra-ui-carousel'
import Loader from '../components/Loader'

type FeaturedCollectionsProps = {
    featuredCollections: any;
    defaultWallet: string;
    wallet: Wallet;
    label: string;
};

export function FeaturedCollections(props: FeaturedCollectionsProps) {
    //console.log("FeaturedCollections",props)
    const { featuredCollections, defaultWallet, wallet, label } = props;

    return (
        <Provider>
            {featuredCollections?.length > 0 ? (
            <Container p={1} centerContent maxWidth={'133ch'} width={'100%'}>
                <Text fontFamily='Share' fontSize='md' >
                {label}
                </Text>
                <Carousel gap={1}>
                    {featuredCollections.map((collection) => (
                    <Box key={collection.collection_id} p={0} w={'375px'}>
                        <CollectionCard key={collection.collection_id} 
                                    collection={collection}  
                                    defaultWallet={defaultWallet}
                                    wallet={wallet} />
                    </Box>
                    ))}
                </Carousel>
                <HStack>
                    <LeftButton p={0} />
                    <RightButton p={0}  />
                </HStack>
            </Container>
            ) : (
            <Container p={2} centerContent maxWidth={'100ch'}>
                <Text fontFamily='Share' fontSize='md' >
                    {label}
                </Text>
                <Text>Loading...</Text>
                <Loader fontSize={'80px'} />
            </Container>
            )} 
        </Provider>
    )
}