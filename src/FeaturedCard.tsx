/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Icon, Container, Tooltip, Text, Link, Image, Button, Spacer, Flex, HStack, keyframes, Collapse, VStack, Center, useDisclosure, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useColorModeValue } from '@chakra-ui/react'
import { AUCTION } from '../lib/auction'
import { Wallet } from '../lib/algorand-session-wallet'
import { useEffect, useState } from "react"
import Timer from '../components/Timer'
import { GoVerified } from 'react-icons/go'
import { BiGlobe } from 'react-icons/bi'
import { FaTwitter } from 'react-icons/fa'
import { RiShoppingBasketLine } from 'react-icons/ri'
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { getCurrentApplicatonGlobalState } from '../lib/algorand'
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import NextLink from 'next/link'
import { platform_settings as ps } from '../lib/platform-conf'

type AuctionCardProps = {
    defaultWallet: string;
    auction: AUCTION;
    wallet: Wallet;
    currency: any;
};

export function FeaturedCard(props: AuctionCardProps) {
    console.log("FeaturedCard",props)
    const { defaultWallet, wallet, auction, currency } = props;
    var auctionAppId =  auction.auctionappid
    const [auctionCreatedAt, setAuctionCreatedAt] = React.useState<Date>(undefined)
    const priorityColor = useColorModeValue('yellow.400', 'blue.400')
    const boxBgColor = useColorModeValue('black', 'green.400')
    const colorText = useColorModeValue('#a2ff44', '#a2ff44')
    const colorBlackWhite = useColorModeValue('black', 'white')
    const [qtyValue, setQtyValue] = React.useState(0)
    const [auctionData, setAuctionData] = React.useState({ state: undefined})
    const [highestBid, setHighestBid] = React.useState<any>((((auctionData.state?.highest_bid / 1) / currency.rate).toFixed(0) != "NaN")? ((auctionData.state?.highest_bid / 1) / currency.rate).toFixed(0) : 1)
   
    React.useEffect(()=>{ 
        
        const handleGetApplicatonGlobalState = async () => {
            if(auctionAppId !== 0) {
                getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
                    if(contractData) {
                        //console.log("contractData: ", contractData)
                        setAuctionData(contractData)
                        let minBid = (contractData.state?.highest_bid / 1) + 1
                        //let minBid = (contractData.state?.highest_bid / 1000000) + (1 / 1000000) //this is here to up min bid by 0.0001
                        const roundedMinBid = Number(minBid.toFixed(auction.payment_decimal))
                        let auctionDate = new Date(contractData.state?.auction_end * 1000)
                        setQtyValue(roundedMinBid)
                        setHighestBid(roundedMinBid)
                        setAuctionCreatedAt(auctionDate)
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentApplicatonGlobalState",err)
                }) 
            }
        }
    
        if(auctionAppId > 0)
            handleGetApplicatonGlobalState()
    }, [auctionAppId]) 

    return (
        <Box maxWidth={'400px'}  _hover={{borderColor: boxBgColor}} bg={(auction.iscomplete)? useColorModeValue('gray.500', 'black') : useColorModeValue('#dcdde1', 'black')} margin={2} borderWidth='2px'>
            <Container pb={0} pt={2} pl={2} pr={2}>
                {auction.priority === 1 ? (
                    <Box position="absolute" p={2} bg={'gray.400'} borderWidth='1px' borderTopLeftRadius='lg' borderBottomRightRadius='lg'>
                        <HStack>
                            <Text fontSize='xs'>Blazing</Text>
                        </HStack>
                    </Box>
                ) : null }
               <Center>
                {auction.mimetype === 'video/mp4' || auction.mimetype === 'video/3gpp' || auction.mimetype === 'video/quicktime' ? (
                    <>
                    <video className={'reactvidplayer'} autoPlay={false} src={auction && auction.image != '' && auction.image != null ? AUCTION.resolveUrl(auction.image) : 'placeholder.png'} controls>
                        <source src={auction && auction.image != '' && auction.image != null ? AUCTION.resolveUrl(auction.image) : 'placeholder.png'} type="video/mp4" />
                    </video>
                    </>
                ) : (
                    <>
                    <NextLink href={(auction.auctionappid)? '/auction/'+auction.auctionappid : '/listing/'+auction?.listingappid } passHref>
                        <a>
                        <Image boxSize='350px' objectFit='cover' sx={(auction.iscomplete)? { opacity: 0.3 } : { opacity: 1} } borderRadius='lg' alt='ASAs.lol NFT Auctions' src={auction && auction.image != '' && auction.image != null ? AUCTION.resolveUrl(auction.image) : 'placeholder.png'} />
                        </a>
                    </NextLink>
                    </>
                )}
                </Center>
                {auction.lastsaleprice && auction.lastsaleprice !== "0" && auction.lastsaleprice !== null ? (
                <Center>
                    <Box position="absolute" mt={-5} p={1} bg={priorityColor} borderWidth='1px' borderRadius='lg'>
                        <Text fontSize='sm'>{auction.lastsaleprice}</Text>
                    </Box>
                </Center>
                ) : null }
                {auction.auctionappid && !auction.iscomplete && auctionData !== undefined ? (
                     <>
                    {auctionData.state?.highest_bidder !== "Z3YJM6Q=" ? (
                        <Box m={2} p={2} bg={'#2AD3FF'} borderRadius='lg' borderWidth='2px'>
                            <Center>
                            <Text fontSize='sm' color={'black'}>Highest Bidder: {(auctionData.state?.highest_bidder != null)? auctionData.state?.highest_bidder.substring(0, 5) + '...' + auctionData.state?.highest_bidder.slice(-4): ""}</Text>
                            </Center>
                        </Box>
                    ) : (
                        <Box m={2} p={2} bg={'#949494'} borderRadius='lg' borderWidth='2px'>
                            <Center>
                            <Text fontSize='xs' color={'gray.700'}>No bids yet!</Text>
                            </Center>
                        </Box>
                    ) }
                    </>
                ) : null }
            </Container>
            <Container p={2}>
                <Flex mb={1}>
                    <Box>
                        <NextLink href={'/auction/'+auction.auctionappid} passHref>
                            <a className={'auction-name-link'}>
                                <Text fontSize='11px'>{auction.name} | {auction.asset_id}</Text>
                            </a>
                        </NextLink>
                    </Box>
                    {auction.isverified ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on ALGOxNFT'} aria-label='Tooltip'>
                                <Link href={'https://algoxnft.com/asset/'+auction.asset_id}isExternal pl={1}><Icon color={'#f41b8e'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {auction.isverifiedrand ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on Rand Gallery'} aria-label='Tooltip'>
                                <Link href={'https://www.randgallery.com/algo-collection/?address='+auction.asset_id}isExternal pl={1}><Icon color={'#6479BF'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {auction.isverifiedalgogems ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on AlgoGems'} aria-label='Tooltip'>
                                <Link href={'https://www.algogems.io/nft/'+auction.asset_id}isExternal pl={1}><Icon color={'#44a5e4'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {auction.isverifiedalgoseas ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on AlgoSeas'} aria-label='Tooltip'>
                                <Link href={'https://algoseas.io/marketplace/asset/'+auction.asset_id}isExternal pl={1}><Icon color={'#889BC8'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {auction.isverifieddart ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on Dartroom'} aria-label='Tooltip'>
                                <Link href={'https://dartroom.xyz/nfts/asa/'+auction.asset_id} isExternal pl={1}><Icon color={'#919191'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    <Spacer />
                    <Box>
                        {auction.marketplace !== "" && auction.marketplace !== null ? (
                            <Tooltip hasArrow label={'Marketplace'} aria-label='Tooltip'>
                                <Link href={auction.marketplace} isExternal p={1}><Icon as={RiShoppingBasketLine} /></Link>
                            </Tooltip>
                        ) :null}
                        {auction.twitter !== "" && auction.twitter !== null ? (
                            <Tooltip hasArrow label={'Twitter'} aria-label='Tooltip'>
                                <Link href={(auction.twitter.slice(0,1) == "@")? 'https://twitter.com/' + auction.twitter : auction.twitter} isExternal p={1}><Icon as={FaTwitter} /></Link>
                            </Tooltip>
                        ) : null}
                        {auction.website !== "" && auction.website !== null ? (
                            <Tooltip hasArrow label={'Project Website'} aria-label='Tooltip'>
                                <Link href={auction.website} isExternal pl={1} pt={1} pb={1} pr={0}><Icon as={BiGlobe} /></Link>
                            </Tooltip>
                        ) :null}
                    </Box>
                </Flex>
                <Flex>
                    <Box>
                        <Text fontSize='sm'>Owner</Text>
                        <Text fontSize='11px'>
                            {(auction.seller_wallet_nfd != null)? auction.seller_wallet_nfd : (auction.seller_wallet != null)? auction.seller_wallet.substring(0, 5) + '...' + auction.seller_wallet.slice(-4): "auction.algo"}
                        </Text> 
                    </Box>
                    <Spacer />
                    <Box> 
                        <Text fontSize='sm' align='right'>{(auction.auctionappid) ? 'Current Bid' : 'Price'}</Text>
                        <Text fontSize='15px' fontWeight='bold' color={(auction.ticketcost > 0)? colorText : ''}>
                        {auction.auctionappid ? (
                            <>{(auctionData.state?.highest_bid / Math.pow(10, auction.payment_decimal)).toFixed(auction.payment_decimal)} {auction.payment_unitname}</>
                        ) : (
                            <>{(auction.ticketcost / 1).toFixed(auction.payment_decimal)} {auction.payment_unitname}</>
                        )}
                        </Text>
                    </Box>
                </Flex>
                <Center pt={2}>
                    {auctionData.state?.auction_end !== undefined ? (
                    <Timer createdat={auctionData.state?.auction_end} lengthofgame={auction.lengthofauction} />
                    ) : null }
                </Center>
            </Container>
        </Box> 
    )
}