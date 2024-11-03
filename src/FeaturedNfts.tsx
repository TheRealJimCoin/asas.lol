/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Center, Icon, Tooltip, Text, Link, Image, HStack, Flex, Container, useColorModeValue } from '@chakra-ui/react'
import { Wallet } from '../lib/algorand-session-wallet'
import { FeaturedCard } from './FeaturedCard'
import { Carousel, LeftButton, RightButton } from "chakra-ui-carousel"
import { Provider } from 'chakra-ui-carousel'
import Loader from '../components/Loader'

type FeaturedNftsProps = {
    FeaturedNfts: any;
    defaultWallet: string;
    wallet: Wallet;
    label: string;
    currency: any;
};

export function FeaturedNfts(props: FeaturedNftsProps) {
    //console.log("FeaturedNfts",props)
    const { FeaturedNfts, defaultWallet, wallet, currency, label } = props;

    return (
        <Provider>
            {FeaturedNfts?.length > 0 ? (
            <Container p={1} centerContent maxWidth={'133ch'} width={'100%'}>
                <Text fontFamily='Share' fontSize='md' >
                {label}
                </Text>
                <Carousel gap={1}>
                    {FeaturedNfts.map((nft) => (
                    <Box key={nft.collection_id} p={0} w={'375px'}>
                        <FeaturedCard key={nft.id} 
                                    auction={nft}  
                                    defaultWallet={defaultWallet}
                                    wallet={wallet} 
                                    currency={currency} />
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