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
import TokenDropdown from "../components/TokenDropdown"
import { platform_settings as ps } from '../lib/platform-conf'

type AuctionCardProps = {
    defaultWallet: string;
    auction: AUCTION;
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

export function AuctionCard(props: AuctionCardProps) {
    console.log("AuctionCard",props)
    const { defaultWallet, wallet, auction, currency, connected, tokenList, algoBalance, setCurrency, hasTokenNextPage, fetchTokenNextPage } = props;
    var auctionAppId =  auction.auctionappid
    var currentDateISO = new Date().toISOString()
    //var auctionCreatedAt = new Date(auction.createdat)
    //auctionCreatedAt.setDate(auctionCreatedAt.getDate() + auction.lengthofauction)
    const [auctionCreatedAt, setAuctionCreatedAt] = React.useState<Date>(undefined)
    //console.log("DATE1",currentDateISO)
    //console.log("DATE2",auctionCreatedAt)
    //console.log("DATE3",auction.lengthofauction)
    const priorityColor = useColorModeValue('yellow.400', 'blue.400')
    const boxBgColor = useColorModeValue('black', 'blue.400')
    const colorText = useColorModeValue('#2AD3FF', '#2AD3FF')
    const colorBlue = useColorModeValue('blue.400', 'blue.400')
    const colorBlackWhite = useColorModeValue('black', 'white')
    const buttonColor = useColorModeValue('blue', 'blue')
    const [isPlacingBid, setIsPlacingBid] = React.useState(false)
    const [isClaimingBid, setIsClaimingBid] = React.useState(false)
    const [isClaimingProceeds, setIsClaimingProceeds] = React.useState(false)
    const [isClaimingNFTBack, setIsClaimingNFTBack] = React.useState(false)
    const [isClaimComplete, setIsClaimComplete] = React.useState(false)
    const [qtyValue, setQtyValue] = React.useState(0)
    const { isOpen, onToggle } = useDisclosure()
    const [auctionData, setAuctionData] = React.useState({ state: undefined})
    const [highestBid, setHighestBid] = React.useState<any>((((auctionData.state?.highest_bid / 1) / currency.rate).toFixed(0) != "NaN")? ((auctionData.state?.highest_bid / 1) / currency.rate).toFixed(0) : 1)
    //console.log("currency: ", currency)
    async function bidAuction(event) {
        setIsPlacingBid(true)
        //const totalCost = (qtyValue * 1000000) * 1
        //console.log("bidAuction cost: ", qtyValue)
        //console.log("bidAuction cost: ", auctionAppId)
        await AUCTION.bidAuction(wallet, qtyValue, auction.payment_asset_id, auction.payment_decimal, auctionAppId).then((txid: any) => {
            //console.log("bidAuction: ",txid)
            getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
                if(contractData) {
                    setAuctionData(contractData)
                    let minBid = (contractData.state?.highest_bid / 1)
                    //let minBid = (contractData.state?.highest_bid / 1000000) + (1 / 1000000) //this is here to up min bid by 0.0001
                   const roundedMinBid = Number(minBid.toFixed(auction.payment_decimal))
                    //((((auctionData.state?.highest_bid / 1000000) / currency.rate).toFixed(0) != "NaN")? ((auctionData.state?.highest_bid / 1000000) / currency.rate).toFixed(0) : 1)
                    setHighestBid(roundedMinBid)
                }
            }).catch((err)=>{ 
                console.log("error getCurrentApplicatonGlobalState",err)
            }) 
        }).catch((err)=>{ 
            console.log("error ", err)
        }) 
        setIsPlacingBid(false)
    }

    async function claimProceeds(event) {
        setIsClaimingProceeds(true)
        await AUCTION.claimBid(wallet, auctionAppId, auction.payment_asset_id, auction.creator_wallet).then((txid: any) => {
            //console.log("claimProceeds: ",txid)
            if(txid !== undefined) {
                getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
                    if(contractData) {
                        setAuctionData(contractData)
                        var now = new Date().toISOString()
                        //console.log("claimProceeds: ",txid)
                        fetch('/api/updateAuctionProceeds', {
                            method: 'POST',
                            body: JSON.stringify({
                                asset_id: auction.asset_id,
                                amountpaid: (contractData.state?.highest_bid / 1).toFixed(auction.payment_decimal),
                                payment_asset_id: auction.payment_asset_id,
                                tokenunit: auction.payment_unitname,
                                auctionappid: auctionAppId,
                                receiver: auction.seller_wallet,
                                txid: txid,
                                createdat: now
                            })
                        })
                        .then((res) => {
                            res.json().then((getStatus) => {
                                if(getStatus.success) {
                                    showNetworkSuccess("Claim Auction Proceeds Successful")
                                } else {
                                    showErrorToaster("Error Claiming NFT Proceeds from Auction") 
                                }
                            }).catch((err)=>{ 
                                //console.log("Error Claiming NFT Proceeds from Auction", err)
                                showErrorToaster("Error Claiming NFT Proceeds from Auction") 
                            })
                        }) 
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentApplicatonGlobalState",err)
                }) 
            } else {
                setIsClaimingProceeds(false)
                showErrorToaster("Error Claiming Proceeds") 
            }
        }).catch((err)=>{ 
            console.log("error ", err)
        }) 
        setIsClaimingProceeds(false)
    }

    async function claimBackNFT(event) {
        setIsClaimingNFTBack(true)
        await AUCTION.claimAuctionNoBid(wallet, auction.asset_id, auction.payment_asset_id, auction.seller_wallet, auction.creator_wallet, auctionAppId, auction.payment_creator).then((txid: any) => {
            //console.log("claimAuctionNoBid: ",txid)
            getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
                if(contractData) {
                    setIsClaimComplete(true)
                    setAuctionData(contractData)
                    //console.log("claimAuctionNoBid: ",txid)
                    fetch('/api/updateAuction', {
                        method: 'POST',
                        body: JSON.stringify({
                            auctionappid: auctionAppId,
                            isactive: true,
                            iscomplete: true
                        })
                    })
                    .then((res) => {
                        res.json().then((getStatus) => {
                            if(getStatus.success) {
                                showNetworkSuccess("NFT Claim Successful")
                            } else {
                                showErrorToaster("Error Claiming Back NFT from Auction") 
                            }
                        }).catch((err)=>{ 
                            console.log("error Claiming Back NFT from Auction", err)
                        })
                    }) 
                }
            }).catch((err)=>{ 
                console.log("error getCurrentApplicatonGlobalState",err)
            }) 
        }).catch((err)=>{ 
            console.log("error ", err)
        }) 
        setIsClaimingNFTBack(false)
    }

    async function claimAuction(event) {
        setIsClaimingBid(true)
        //console.log("claimAuction clicked ")
        await AUCTION.claimAuction(wallet, auction.asset_id, defaultWallet, auction.creator_wallet, auctionAppId).then((txid: any) => {
            //console.log("claimAuction: ",txid)
            if(txid !== undefined) {
                getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
                    if(contractData) {
                        setIsClaimComplete(true)
                        setAuctionData(contractData)
                        var now = new Date().toISOString()
                        //console.log("claimAuction: ",txid)
                        fetch('/api/updateAuctionWinner', {
                            method: 'POST',
                            body: JSON.stringify({
                                asset_id: auction.asset_id,
                                auctionappid: auctionAppId,
                                receiver: defaultWallet,
                                txid: txid,
                                createdat: now
                            })
                        })
                        .then((res) => {
                            res.json().then((getStatus) => {
                                if(getStatus.success) {
                                    showNetworkSuccess("NFT Claim Successful")
                                } else {
                                    showErrorToaster("Error Claiming NFT from Auction") 
                                }
                            }).catch((err)=>{ 
                                console.log("error Claiming NFT from Auction", err)
                            })
                        }) 
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentApplicatonGlobalState",err)
                }) 
            } else {
                setIsClaimingProceeds(false)
                showErrorToaster("Error Claiming NFT from Auction") 
            }
        }).catch((err)=>{ 
            console.log("error ", err)
        }) 
        setIsClaimingBid(false)
    }

    React.useEffect(()=>{ 
        
        const handleGetApplicatonGlobalState = async () => {
            if(auctionAppId !== 0) {
                getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
                    if(contractData) {
                        console.log("contractData: ", contractData)
                        setAuctionData(contractData)
                        let minBid = (contractData.state?.highest_bid / 1) + 1
                        //let minBid = (contractData.state?.highest_bid / 1000000) + (1 / 1000000) //this is here to up min bid by 0.0001
                        //console.log("Math.pow(10, currency.decimal) ", Math.pow(10, auction.payment_decimal))
                        const roundedMinBid = Number(minBid.toFixed(auction.payment_decimal)) / Math.pow(10, auction.payment_decimal)
                        //console.log("contractData: ", contractData.state?.auction_end)
                        let auctionDate = new Date(contractData.state?.auction_end * 1000)
                        //let auctionDate = new Date()
                        //console.log("minBid: ", roundedMinBid)
                        setQtyValue(roundedMinBid)
                        setHighestBid(roundedMinBid)
                        setAuctionCreatedAt(auctionDate)
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentApplicatonGlobalState",err)
                }) 
            }
        }
        
    if(auctionAppId > 0 && (auction?.auctionspaidout === undefined || auction?.auctionspaidout?.length < 1 || auction?.auctionswinners?.length < 1)) {
        handleGetApplicatonGlobalState()
    } else {
        console.log("auction123", auction)
        setHighestBid(auction?.auctionspaidout[0]?.amountpaid)
        let auctionDate = new Date(auction?.createdat)
        setAuctionCreatedAt(auctionDate)
    }
}, [auctionAppId, auction?.iscomplete]) 

    return (
        <Box maxWidth={'400px'}  _hover={{borderColor: boxBgColor}} bg={(auction.iscomplete)? useColorModeValue('gray.500', 'gray.700') : useColorModeValue('#dcdde1', 'black')} margin={2} borderWidth='2px'>
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
                    <NextLink href={'/auction/'+auction.auctionappid} passHref>
                        <a>
                        <Image boxSize='350px' objectFit='cover' sx={(auction.iscomplete)? { opacity: 0.3 } : { opacity: 1} } borderRadius='lg' alt='ASAa.lol NFT Auctions' src={auction && auction.image != '' && auction.image != null ? AUCTION.resolveUrl(auction.image) : 'placeholder.png'} />
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
                {!auction.iscomplete && auctionData !== undefined ? (
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
                                {auctionCreatedAt !== undefined && auctionCreatedAt.toISOString() < currentDateISO ? (
                                <>
                                {auction.seller_wallet === defaultWallet || (defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2)  ? (
                                    <Button size='sm' isLoading={isClaimingNFTBack} loadingText='Claiming...' colorScheme={buttonColor} onClick={claimBackNFT}>Claim Back NFT</Button>
                                ) : null }
                                </>
                                ) : null }
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
                        <Text fontSize='sm' align='right'>{!auction.iscomplete ? 'Current Bid' : 'Winning Bid' }</Text>
                        <Text fontSize='15px' fontWeight='bold' color={(auction.ticketcost > 0)? colorText : ''}>{(highestBid / 1)} {auction.payment_unitname}</Text>
                    </Box>
                </Flex>
                <Center pt={2} pb={0}>
                    {auctionData.state?.auction_end !== undefined ? (
                    <Timer createdat={auctionData.state?.auction_end} lengthofgame={auction.lengthofauction} />
                    ) : null }
                </Center>
            </Container>
            <Container p={2} centerContent>
                {auction.iscomplete ? (
                    <>
                    {auctionCreatedAt !== undefined && auctionCreatedAt.toISOString() < currentDateISO ? (
                        <HStack p={2}>
                        {auction.auctionswinners.length < 1 && !isClaimComplete && auction.auctionswinners[0]?.receiver !== defaultWallet && auctionData.state?.highest_bidder === defaultWallet ? (
                            <Button size='sm' isLoading={isClaimingBid} loadingText='Claiming NFT' colorScheme={buttonColor} onClick={claimAuction}>Claim NFT</Button>
                        ) : null }
                        {auction.auctionspaidout.length < 1 && auction.seller_wallet === defaultWallet ? (
                            <Button size='sm' isLoading={isClaimingProceeds} loadingText='Claiming Proceeds' colorScheme={buttonColor} onClick={claimProceeds}>Claim Proceeds</Button>
                        ) : null }
                        </HStack>
                    ) : null }   
                    <Button colorScheme='yellow' onClick={onToggle}>View Winner</Button>
                    <Box height=".5rem"></Box>
                  {/*<Collapse in={isOpen} animateOpacity>
                        <Box bg={colorBlue} p={1} borderWidth='1px' borderRadius='lg'>
                            <VStack align={'left'} spacing={{ base: 2, md: 4}}>
                            {auctionData !== undefined ? (
                                <>
                                {auctionData.state?.highest_bidder !== "Z3YJM6Q=" ? (
                                    <>
                                    <Link href={'https://allo.info/address/'+auctionData.state?.highest_bidder} isExternal>
                                    <Text fontSize='xs' color={'gray.700'}>{(auctionData.state?.highest_bidder != null)? auctionData.state?.highest_bidder.substring(0, 5) + '...' + auctionData.state?.highest_bidder.slice(-4): ""}</Text>
                                    </Link>
                                    </>
                                ) : (<Text color={'gray.700'} fontSize='sm'>No Winners Found</Text>) }
                                </>
                            ) : null }
                            </VStack>
                       </Box>
                    </Collapse> */}
                       <Collapse in={isOpen} animateOpacity>
                        <Box bg={colorBlue} p={1}  borderWidth='1px' borderRadius='lg'>
                            <VStack align={'left'} spacing={{ base: 2, md: 4}}>
                                {auction.auctionswinners.length > 0 ? (
                                <>
                                {auction.auctionswinners.map((auctionWinner) => (
                                <Box key={auctionWinner.txid} p={0} borderWidth='1px' borderRadius='lg'>
                                    <Link href={'https://allo.info/tx/'+auctionWinner.txid} isExternal>
                                        <Text color={'gray.700'} fontSize='sm'>
                                        {auctionWinner.receiver.substring(0, 5) + '...' + auctionWinner.receiver.slice(-4)}
                                        </Text>
                                    </Link>
                                </Box>
                                ))}
                                </>
                                ) : (<Text color={'gray.700'} fontSize='sm'>No Winners Found</Text>)}
                            </VStack>
                       </Box>
                    </Collapse>
                    </>
                ) : (
                    <>
                    {props.connected && auctionData !== undefined ? (
                        <>
                        <Box>
                            {auctionCreatedAt !== undefined && auctionCreatedAt.toISOString() < currentDateISO ? (
                                <HStack>
                                {!isClaimComplete && auctionData.state?.highest_bidder === defaultWallet ? (
                                    <Button size='sm' isLoading={isClaimingBid} loadingText='Claiming NFT' colorScheme={buttonColor} onClick={claimAuction}>Claim NFT</Button>
                                ) : null }
                                {auction.seller_wallet === defaultWallet ? (
                                    <Button size='sm' isLoading={isClaimingProceeds} loadingText='Claiming Proceeds' colorScheme={buttonColor} onClick={claimProceeds}>Claim Proceeds</Button>
                                ) : null }
                                </HStack>
                            ) : (
                                <>
                                <HStack>
                                    <NumberInput precision={auction.payment_decimal} step={1} size='sm' borderColor={colorBlackWhite} onChange={(valueAsString, valueAsNumber) => setQtyValue(valueAsNumber)} value={qtyValue} defaultValue={qtyValue} min={highestBid} w='130px'>
                                    <NumberInputField />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                    </NumberInputStepper>
                                    </NumberInput>
                                    <Button size='sm' isLoading={isPlacingBid} loadingText='Placing Bid' colorScheme={buttonColor} onClick={bidAuction}>{'Bid w/ ' + auction.payment_unitname}</Button>
                                </HStack>
                                </>
                            )}   
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