/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Icon, Tooltip, Text, Link, Image, Flex, useColorModeValue } from '@chakra-ui/react'
import { AUCTION } from '../lib/auction'
import NextLink from 'next/link'
import { RiAuctionFill } from 'react-icons/ri'
import { BiPurchaseTag } from 'react-icons/bi'

type StatisticsCardProps = {
    sale: any;
    listings: any;
};

export function StatisticsCard(props: StatisticsCardProps) {
  console.log("StatisticsCard",props)
  const { sale, listings } = props;
    
    const formatDate = (sourceDate: Date) => {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
        return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
    }

    return (
        <Box maxWidth={{ base: '400px', md: '800px'}}  bg={useColorModeValue('#dcdde1', '#3f4550')} margin={0} borderWidth='2px' borderRadius='lg'>
            <Flex width='100%' alignItems='center' gap={{ base: '1', md: '4'}}>
                <Box pl={{ base: '0', md: '2'}} pr={{ base: '0', md: '2'}} minWidth={{ base: '56px', md: '66px'}}>
                {listings?.mimetype === 'video/mp4' || listings?.mimetype === 'video/3gpp' || listings?.mimetype === 'video/quicktime' ? (
                <>
                <video className={'reactstatsvidplayer'} autoPlay={false} src={listings && listings.image != '' ? AUCTION.resolveUrl(listings.image) : 'placeholder.png'} controls>
                    <source src={sale.auctions && sale.auctions.image != '' ? AUCTION.resolveUrl(sale.auctions.image) : 'placeholder.png'} type={sale.auctions.mimetype} />
                </video>
                </>
                ) : (
                <>
                <NextLink href={(listings?.auctionappid)? '/auction/'+ listings.auctionappid : '/listing/'+ listings.listingappid} passHref>
                    <a>
                    <Image boxSize='50px' objectFit='cover' borderRadius='lg' alt='ASAs.lol NFT Auctions' src={listings && listings.image != '' ? AUCTION.resolveUrl(listings.image) : 'placeholder.png'} />
                    </a>
                </NextLink>
                </>
                )}
                </Box>
                <Box pl={{ base: '1', md: '2'}} minWidth={{ base: '80px', md: '170px'}}>
                    <Text fontSize={'xs'}> {formatDate(sale.createdat)}</Text>
                </Box>
                <Box minWidth={{ base: '60px', md: '200px'}}>
                    <Tooltip hasArrow label={(listings?.lengthofauction)? 'NFT Auction' : 'NFT Listing'} aria-label='Tooltip'>
                        <Link href={'https://explorer.flippingalgos.xyz/asset/'+listings.asset_id} isExternal>
                        <Text fontSize={'xs'}>{(listings?.lengthofauction)? (<Icon color={'#2AD3FF'} fontSize='s' as={RiAuctionFill} />) :  (<Icon color={'#2AD3FF'} fontSize='s' as={BiPurchaseTag} />)} {listings.name}</Text>
                        </Link>
                    </Tooltip>
                </Box>
                <Box minWidth={{ base: '50px', md: '80px'}}>
                    <Link href={'https://allo.info/tx/'+sale.txid} isExternal>
                    <Text fontSize={'xs'}>{sale.amountpaid / Math.pow(10, sale.payment_decimal)} {sale.tokenunit}</Text>
                    </Link>
                </Box>
                <Box minWidth={{ base: '50px', md: '100px'}} pl={2} pr={2}>
                    <Link href={'https://www.asastats.com/'+sale.receiver} isExternal>
                    <Text fontSize='xs'>{sale.receiver.substring(0, 5) + '...' + sale.receiver.slice(-4)}</Text>
                    </Link>
                </Box>
                <Box minWidth={{ base: '50px', md: '100px'}} pl={2} pr={2}>
                    <Link href={'https://www.asastats.com/'+listings.seller_wallet} isExternal>
                    <Text fontSize='xs'>{(listings.seller_wallet_nfd !== null) ? listings.seller_wallet_nfd :  listings.seller_wallet.substring(0, 5) + '...' + listings.seller_wallet.slice(-4)}</Text>
                    </Link>
                </Box>
            </Flex>
        </Box> 
    )
}