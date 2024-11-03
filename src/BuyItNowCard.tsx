/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Icon, Container, Tooltip, Text, Link, Image, Button, Spacer, Flex, HStack, keyframes, Collapse, VStack, Center, useDisclosure, useMediaQuery, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useColorModeValue } from '@chakra-ui/react'
import { BUYITNOW } from '../lib/buyitnow'
import { Wallet } from '../lib/algorand-session-wallet'
import { useEffect, useState } from "react"
import { GoVerified } from 'react-icons/go'
import { BiGlobe } from 'react-icons/bi'
import { FaTwitter } from 'react-icons/fa'
import { RiShoppingBasketLine } from 'react-icons/ri'
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import { getCurrentApplicatonGlobalState } from '../lib/algorand'
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import TokenDropdown from "../components/TokenDropdown"
import NextLink from 'next/link'

type BuyItNowCardProps = {
    defaultWallet: string;
    listing: BUYITNOW;
    wallet: Wallet;
    updateWallet: any;
    isOptIntoAsset: any;
    setOptIntoAsset: any;
    currency: any;
    setCurrency: any;
    connected: any;
    tokenList: any;
    algoBalance: any;
    handleFetchAuctions: any;
    hasTokenNextPage: any;
    fetchTokenNextPage: any;
};

export function BuyItNowCard(props: BuyItNowCardProps) {
    //console.log("BuyItNowCard",props)
    const { defaultWallet, wallet, listing, currency, connected, tokenList, algoBalance, setCurrency, hasTokenNextPage, fetchTokenNextPage } = props;
    const listingAppId =  listing.listingappid
    const [auctionCreatedAt, setAuctionCreatedAt] = React.useState<Date>(undefined)
    const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
    const priorityColor = useColorModeValue('yellow.400', 'blue.400')
    const boxBgColor = useColorModeValue('black', 'green.400')
    const colorText = useColorModeValue('#2AD3FF', '#2AD3FF')
    const colorBlue = useColorModeValue('blue.400', 'blue.400')
    const colorBlackWhite = useColorModeValue('black', 'white')
    const buttonColor = useColorModeValue('blue', 'blue')
    const [isPurchasing, setIsPurchasing] = React.useState(false)
    const [purchaseComplete, setPurchaseComplete] = React.useState(false)
    const [isClaimingProceeds, setIsClaimingProceeds] = React.useState(false)
    const [qtyValue, setQtyValue] = React.useState(0)
    const { isOpen, onToggle } = useDisclosure()
    const [auctionData, setAuctionData] = React.useState({ state: undefined})
    
    async function purchaseNFT(event) {
        setIsPurchasing(true)
        //console.log("listing cost: ", qtyValue)
        //console.log("listing cost: ", listingAppId)
        await BUYITNOW.purchase(wallet, 1, listing.asset_id, listing.ticketcost, listing.seller_wallet, listing.creator_wallet, listing.payment_asset_id, listingAppId, listing.payment_creator).then((txid: any) => {
            //console.log("bidAuction: ",txid)
            if(txid !== undefined) {
                var now = new Date().toISOString()
                fetch('/api/updateListingWinner', {
                    method: 'POST',
                    body: JSON.stringify({
                        asset_id: listing.asset_id,
                        amountpaid: listing.ticketcost,
                        tokenunit: '',
                        listingappid: listingAppId,
                        receiver: defaultWallet,
                        txid: txid,
                        createdat: now
                    })
                })
                .then((res) => {
                    res.json().then((getStatus) => {
                        if(getStatus.success) {
                            showNetworkSuccess("NFT Purchase Successful")
                            setPurchaseComplete(true)
                        } else {
                            showErrorToaster("Error Purchasing NFT from Listing") 
                        }
                    }).catch((err)=>{ 
                        console.log("error Purchasing NFT from Listing", err)
                    })
                }) 
            } else {
                setIsClaimingProceeds(false)
                showErrorToaster("Error Purchasing NFT from Listing") 
            }
        }).catch((err)=>{ 
            console.log("error ", err)
        }) 
        setIsPurchasing(false)
    }

    async function claimProceeds(event) {
        setIsClaimingProceeds(true)
        setIsClaimingProceeds(false)
    }

    React.useEffect(()=>{ 
        
        const handleGetApplicatonGlobalState = async () => {
            if(listingAppId !== 0) {
                getCurrentApplicatonGlobalState(listingAppId).then((contractData)=> { 
                    if(contractData) {
                        //console.log("contractData: ", contractData)
                        setAuctionData(contractData)
                        let auctionDate = new Date(contractData.state?.auction_end * 1000)
                        setAuctionCreatedAt(auctionDate)
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentApplicatonGlobalState",err)
                }) 
            }
        }
    
        if(listingAppId > 0)
            handleGetApplicatonGlobalState()
    }, [listingAppId]) 

    return (
        <Box maxWidth={'400px'}  _hover={{borderColor: boxBgColor}} bg={(listing.iscomplete)? useColorModeValue('gray.500', 'gray.700') : useColorModeValue('#dcdde1', 'black')} margin={2} borderWidth='2px'>
            <Container pb={0} pt={2} pl={2} pr={2}>
                {listing.priority === 1 ? (
                    <Box position="absolute" p={2} bg={'gray.400'} borderWidth='1px' borderTopLeftRadius='lg' borderBottomRightRadius='lg'>
                        <HStack>
                            <Text fontSize='xs'>Blazing</Text>
                        </HStack>
                    </Box>
                ) : null }
               <Center>
                {listing.mimetype === 'video/mp4' || listing.mimetype === 'video/3gpp' || listing.mimetype === 'video/quicktime' ? (
                    <>
                    <video className={'reactvidplayer'} autoPlay={false} src={listing && listing.image != '' && listing.image != null ? BUYITNOW.resolveUrl(listing.image) : 'placeholder.png'} controls>
                        <source src={listing && listing.image != '' && listing.image != null ? BUYITNOW.resolveUrl(listing.image) : 'placeholder.png'} type="video/mp4" />
                    </video>
                    </>
                ) : (
                    <>
                    <NextLink href={'/listing/'+listing.listingappid} passHref>
                        <a>
                        <Image boxSize='350px' objectFit='cover' sx={(listing.iscomplete)? { opacity: 0.3 } : { opacity: 1} } borderRadius='lg' alt='ASAs.lol NFT Buy It Now Listing' src={listing && listing.image != '' && listing.image != null ? BUYITNOW.resolveUrl(listing.image) : 'placeholder.png'} />
                        </a>
                    </NextLink>
                    </>
                )}
                </Center>
                {listing.lastsaleprice && listing.lastsaleprice !== "0" && listing.lastsaleprice !== null ? (
                <Center>
                    <Box position="absolute" mt={-5} p={1} bg={priorityColor} borderWidth='1px' borderRadius='lg'>
                        <Text fontSize='sm'>{listing.lastsaleprice}</Text>
                    </Box>
                </Center>
                ) : null }
            </Container>
            <Container p={2}>
                <Flex mb={1}>
                    <Box>
                        <NextLink href={'/listing/'+listing.listingappid} passHref>
                            <a className={'auction-name-link'}>
                                <Text fontSize='11px'>{listing.name} | {listing.asset_id}</Text>
                            </a>
                        </NextLink>
                    </Box>
                    {listing.isverified ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on ALGOxNFT'} aria-label='Tooltip'>
                                <Link href={'https://algoxnft.com/asset/'+listing.asset_id}isExternal pl={1}><Icon color={'#f41b8e'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {listing.isverifiedrand ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on Rand Gallery'} aria-label='Tooltip'>
                                <Link href={'https://www.randgallery.com/algo-collection/?address='+listing.asset_id}isExternal pl={1}><Icon color={'#6479BF'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {listing.isverifiedalgogems ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on AlgoGems'} aria-label='Tooltip'>
                                <Link href={'https://www.algogems.io/nft/'+listing.asset_id}isExternal pl={1}><Icon color={'#44a5e4'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {listing.isverifiedalgoseas ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on AlgoSeas'} aria-label='Tooltip'>
                                <Link href={'https://algoseas.io/marketplace/asset/'+listing.asset_id}isExternal pl={1}><Icon color={'#889BC8'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {listing.isverifieddart ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on Dartroom'} aria-label='Tooltip'>
                                <Link href={'https://dartroom.xyz/nfts/asa/'+listing.asset_id} isExternal pl={1}><Icon color={'#919191'} fontSize='s' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    <Spacer />
                    <Box>
                        {listing.marketplace !== "" && listing.marketplace !== null ? (
                            <Tooltip hasArrow label={'Marketplace'} aria-label='Tooltip'>
                                <Link href={listing.marketplace} isExternal p={1}><Icon as={RiShoppingBasketLine} /></Link>
                            </Tooltip>
                        ) :null}
                        {listing.twitter !== "" && listing.twitter !== null ? (
                            <Tooltip hasArrow label={'Twitter'} aria-label='Tooltip'>
                                <Link href={(listing.twitter.slice(0,1) == "@")? 'https://twitter.com/' + listing.twitter : listing.twitter} isExternal p={1}><Icon as={FaTwitter} /></Link>
                            </Tooltip>
                        ) : null}
                        {listing.website !== "" && listing.website !== null ? (
                            <Tooltip hasArrow label={'Project Website'} aria-label='Tooltip'>
                                <Link href={listing.website} isExternal pl={1} pt={1} pb={1} pr={0}><Icon as={BiGlobe} /></Link>
                            </Tooltip>
                        ) :null}
                    </Box>
                </Flex>
                <Flex>
                    <Box>
                        <Text fontSize='sm'>Owner</Text>
                        <Text fontSize='11px'>
                            {(listing.seller_wallet_nfd != null)? listing.seller_wallet_nfd : (listing.seller_wallet != null)? listing.seller_wallet.substring(0, 5) + '...' + listing.seller_wallet.slice(-4): ""}
                        </Text> 
                    </Box>
                    <Spacer />
                    <Box> 
                        <Text fontSize='sm' align='right'>Price</Text>
                        <Text fontSize='15px' fontWeight='bold' color={(listing.ticketcost > 0)? colorText : ''}>{(listing.ticketcost / 1).toFixed(listing.payment_decimal)} {listing.payment_unitname}</Text>                       
                    </Box>
                </Flex>
            </Container>
            <Container p={2} centerContent>
                {listing.iscomplete ? (
                    <>
                    {auctionCreatedAt !== undefined ? (
                        <HStack p={2}>
                        {listing.seller_wallet === defaultWallet ? (
                            <Button size='sm' isLoading={isClaimingProceeds} loadingText='Claiming Proceeds' colorScheme={buttonColor} onClick={claimProceeds}>Claim Proceeds</Button>
                        ) : null }
                        </HStack>
                    ) : null }   
                    </>
                ) : (
                    <>
                    {props.connected && auctionData !== undefined ? (
                        <>
                        <Box>
                           {/*  {auctionCreatedAt !== undefined ? (
                                <HStack>
                                {listing.seller_wallet === defaultWallet ? (
                                    <Button size='sm' isLoading={isClaimingProceeds} loadingText='Claiming Proceeds' colorScheme={buttonColor} onClick={claimProceeds}>Claim Proceeds</Button>
                                ) : null }
                                </HStack>
                            ) : null } */}
                            {!purchaseComplete ? (
                            <HStack>
                                <Button size='sm' isLoading={isPurchasing} loadingText='Purchasing' colorScheme={buttonColor} onClick={purchaseNFT}>{'Buy It Now w/ ' + listing.payment_unitname}</Button>
                            </HStack> 
                            ) : null }
                        </Box>
                        </>
                    ) : (
                        <>
                        <Box>
                            <AlgorandWalletConnector 
                                darkMode={true}
                                //@ts-ignore
                                sessionWallet={props.wallet}
                                connected={props.connected} 
                                //@ts-ignore
                                updateWallet={props.updateWallet}
                                //@ts-ignore
                                handleFetchAuctions={props.handleFetchAuctions}
                                />
                        </Box>
                        </>
                    )}
                    </>
                )}
            </Container>
        </Box> 
    )
}