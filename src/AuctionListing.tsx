
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Icon, Center, Container, Table, Tbody, Tr, Th, Td, Thead, Tooltip, Text, Link, Image, HStack, Spacer, Button, useColorModeValue, useBreakpointValue } from '@chakra-ui/react'
import { AUCTION } from '../lib/auction'
import { Wallet } from '../lib/algorand-session-wallet'
import { getCurrentApplicatonGlobalState } from '../lib/algorand'
import { showErrorToaster,showNetworkSuccess } from "../src/Toaster"
import Timer from '../components/Timer'
import { GoVerified } from 'react-icons/go'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'

type AuctionListingProps = {
    defaultWallet: string;
    nft: any;
    currency: any;
    wallet: Wallet;
};

export function AuctionListing(props: AuctionListingProps) {
    //console.log("AuctionListing",props)
    const { defaultWallet, nft, currency, wallet } = props
    var auctionAppId =  nft.auctionappid
    var currentDateISO = new Date().toISOString()
    const [auctionData, setAuctionData] = React.useState({ state: undefined})
    const [auctionCreatedAt, setAuctionCreatedAt] = React.useState<Date>(undefined)
    //console.log("auctionCreatedAt",auctionCreatedAt.toISOString())
    //console.log("auctionCreatedAt",currentDateISO)
    const [isPurchasingBumpUp, setIsPurchasingBumpUp] = React.useState(false)
    const [isListingStatus, setListingStatus] = React.useState(nft.iscomplete)
    const [isListingPriority, setListingPriority] = React.useState(nft.priority)
    const colorText = useColorModeValue('blue.200', '#2AD3FF')
    const colorBg = useColorModeValue('gray.700', 'gray.700')
    const imageWidth = useBreakpointValue({ base: '100px', md: '200px'})
    const [isClaimingBid, setIsClaimingBid] = React.useState(false)
    const [isClaimingProceeds, setIsClaimingProceeds] = React.useState(false)
    const [isClaimComplete, setIsClaimComplete] = React.useState(false)
    const buttonColor = useColorModeValue('blue', 'blue')

    React.useEffect(()=>{ 
        
        const handleGetApplicatonGlobalState = async () => {
            if(auctionAppId !== 0) {
                getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
                    if(contractData) {
                        setAuctionData(contractData)
                        let auctionDate = new Date(contractData.state?.auction_end * 1000)
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

    async function claimProceeds(event) {
        setIsClaimingProceeds(true)
        await AUCTION.claimBid(wallet, auctionAppId, currency.asset_id, nft.creator_wallet).then((txid: any) => {
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
                                asset_id: nft.asset_id,
                                amountpaid: (contractData.state?.highest_bid / 1).toFixed(currency.decimal),
                                payment_asset_id: nft.payment_asset_id,
                                tokenunit: nft.payment_unitname,
                                auctionappid: auctionAppId,
                                receiver: defaultWallet,
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
                                //console.log("error Making Auction Live Auction", err)
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

    async function claimAuction(event) {
        setIsClaimingBid(true)
        await AUCTION.claimAuction(wallet, nft.asset_id, defaultWallet, nft.creator_wallet, auctionAppId).then((txid: any) => {
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
                                asset_id: nft.asset_id,
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
   
    async function purchaseBumpUp(event) {
        setIsPurchasingBumpUp(true)
        event.stopPropagation()
        event.preventDefault()
        //console.log("purchaseBumpUp", props)
        if(isListingPriority === 0) {
            await AUCTION.purchaseBumpUp(wallet, nft.auctionappid, currency).then((txid) => {
                //console.log("verified NFT",txid)
                if(txid && txid !== "" && txid !== undefined && isListingPriority == 0) {
                    var now = new Date().toISOString()
                    fetch('/api/buyBumpUp', {
                        method: 'POST',
                        body: JSON.stringify({
                            auctionappid: nft.auctionappid,
                            priority: 1
                        })
                    }).then((res) => {
                        //console.log("nft sent to escrow")
                        res.json().then((getStatus) => {
                            //console.log("blaze up purchased", getStatus)
                            if(getStatus.success) {
                                setListingPriority(1)
                                showNetworkSuccess("Successfully Purchased Auction Listing Blaze Up")
                            } else {
                                showErrorToaster("Error Purchasing Auction Listing Blaze Up")
                            }
                        })
                        setIsPurchasingBumpUp(false)
                    })
                } else {
                    setIsPurchasingBumpUp(false)
                }
            }).catch((err)=>{ 
                //console.log("error purchasing blaze up", err)
                setIsPurchasingBumpUp(false)
            })
        } else {
            setIsPurchasingBumpUp(false)
        }
    }

    return (
        <Box w={'100%'} bg={colorBg} borderWidth='1px' borderRadius='lg'>
            <HStack spacing='4px'>
                <Container maxWidth={imageWidth} m={0} p={0}>
                    {/* {isListingPriority === 333 ? (
                        <Box position="absolute" p={{ base: '1', md: '2'}} bg={useColorModeValue('yellow.400', 'blue.400')} borderWidth='1px' borderBottomRightRadius='lg'>
                            <HStack>
                                <Text fontSize='xs'>Featured</Text>
                            </HStack>
                        </Box>
                    ) : null }*/}
                    {isListingPriority === 1 ? (
                        <Box position="absolute" p={{ base: '1', md: '2'}} bg={'gray.400'} borderWidth='1px' borderBottomRightRadius='lg'>
                            <HStack>
                                <Text fontSize='xs'>Blazing</Text>
                            </HStack>
                        </Box>
                    ) : null } 
                    <Center>
                    {nft.mimetype === 'video/mp4' ? (
                    <video className={'reactvidplayer'} autoPlay={false} src={nft && nft.image != '' ? AUCTION.resolveUrl(nft.image) : '/placeholder.png'} controls>
                        <source src={nft && nft.image != '' ? AUCTION.resolveUrl(nft.image) : '/placeholder.png'} type="video/mp4" />
                    </video>
                    ) : (
                    <NextLink href={'/auction/'+nft.auctionappid} passHref>
                        <a>
                        <Image boxSize={imageWidth} alt='ASAs.lol NFT Auctions' src={nft && nft.image != '' ? AUCTION.resolveUrl(nft.image) : '/placeholder.png'} />
                        </a>
                    </NextLink> 
                    )}</Center>
                </Container>
                <Box w={'100%'}>
                    <HStack pr={1}>
                        <Text fontSize='10px'>{(nft.name.length <= 102)? nft.name : nft.name.substr(0, 102) + '...'}</Text>
                        <Spacer />
                        <Link href={'https://explorer.flippingalgos.xyz/asset/'+nft.asset_id} isExternal>
                            <Text fontWeight='bold' fontSize='10px'>{nft.asset_id} <ExternalLinkIcon mx='2px' /> </Text>
                        </Link>
                    </HStack>
                    <Box pt={2} pb={2}>
                    {auctionData.state?.auction_end !== undefined ? (
                        <Timer createdat={auctionData.state?.auction_end} lengthofgame={nft.lengthofauction} />
                    ) : null }
                    </Box>
                    <Table p={1} variant='striped' colorScheme={'blue'} size='sm'>
                        <Tbody>
                            <Tr>
                                <Td><Text fontSize='10px' fontWeight='bold'>Auction ID</Text></Td>
                                <Td> 
                                <HStack>
                                    <Text fontSize='10px' fontWeight='bold' color={(nft.ticketcost > 0)? colorText : ''}>
                                    {auctionAppId}
                                    </Text>
                                </HStack>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td><Text fontSize='10px' fontWeight='bold'>Starting Bid</Text></Td>
                                <Td> 
                                <HStack>
                                    <Text fontSize='10px' fontWeight='bold' color={(nft.ticketcost > 0)? colorText : ''}>
                                        {(nft.ticketcost / 1)} {nft.payment_unitname}
                                    </Text>
                                </HStack>
                                </Td>
                            </Tr>
                            {auctionData !== undefined ? (
                                <>
                                <Tr>
                                    <Td><Text fontSize='10px' fontWeight='bold'>Highest Bidder</Text></Td>
                                    <Td>
                                    {auctionData.state?.highest_bidder !== "Z3YJM6Q=" ? (
                                        <Box w={'90px'} bg={useColorModeValue('#07fec9', '#07fec9')} p={0} borderWidth='1px' borderRadius='md'>
                                            <Center>
                                            <Link href={'https://allo.info/address/'+auctionData.state?.highest_bidder} isExternal>
                                            <Text color={'black'} fontSize='10px'>
                                            {(auctionData.state?.highest_bidder != null)? auctionData.state?.highest_bidder.substring(0, 5) + '...' + auctionData.state?.highest_bidder.slice(-4): ""}
                                            </Text>
                                            </Link>
                                            </Center>
                                        </Box>
                                    ) : (
                                        <Text fontSize='10px'>No Bids Yet!</Text>
                                    )}
                                    </Td>
                                </Tr>
                                </>
                            ) : ( <Text>No Winners Found</Text> ) }
                            {!isListingStatus && isListingPriority === 0 && auctionCreatedAt !== undefined && auctionCreatedAt.toISOString() > currentDateISO ? (
                            <Tr>
                                <Td colSpan={2}>
                                    <HStack>
                                        <Box>
                                            <Tooltip hasArrow label={'One-Time Ability to "Blaze Up" or promote your listing to the top of the page.'} aria-label='Tooltip'>
                                                <Button p={1} size='xs' isLoading={isPurchasingBumpUp} loadingText='Bumping Up Auction' colorScheme={useColorModeValue('yellow', 'messenger')} onClick={purchaseBumpUp}>Blaze Up ( 4.20 Algo )</Button>
                                            </Tooltip>
                                        </Box>
                                    </HStack>
                                </Td>
                            </Tr>
                            ) : null }
                            
                            {auctionCreatedAt !== undefined && auctionCreatedAt.toISOString() < currentDateISO ? (
                            <>
                            <Tr>
                                <Td colSpan={2}> 
                                    <Box>
                                        <HStack>
                                        {!isClaimComplete && auctionData.state?.highest_bidder === defaultWallet ? (
                                            <Button size='xs' isLoading={isClaimingBid} loadingText='Claiming NFT' colorScheme={buttonColor} onClick={claimAuction}>Claim</Button>
                                        ) : null }
                                        </HStack>
                                    </Box>
                                </Td>
                            </Tr>
                           {nft.auctionspaidout.length > 0  ? (
                            <Tr>
                                <Td><Text fontSize='xs' fontWeight='bold'>Paid</Text></Td>
                                <Td> 
                                    <HStack p={0}>
                                    {nft.auctionspaidout.map((auctionPaidout) => (
                                        <Box w={'90px'} key={auctionPaidout.txid} bg={useColorModeValue('green.400', 'green.300')} p={0} borderWidth='1px' borderRadius='md'>
                                            <Center>
                                            <Link href={'https://allo.info/tx/'+auctionPaidout.txid} isExternal>
                                            <Text color={'black'} fontSize='xs'>
                                            {auctionPaidout.receiver.substring(0, 5) + '...' + auctionPaidout.receiver.slice(-4)}
                                            </Text>
                                            </Link>
                                            </Center>
                                        </Box>
                                    ))}
                                    </HStack>
                                </Td>
                            </Tr>
                            ) : (
                            <Tr>
                                <Td colSpan={2}> 
                                {nft.seller_wallet === defaultWallet ? (
                                    <Button size='xs' isLoading={isClaimingProceeds} loadingText='Claiming Proceeds' colorScheme={buttonColor} onClick={claimProceeds}>Claim Proceeds</Button>
                                ) : null }
                                </Td>
                            </Tr>
                            )}
                            </>
                            ) : null}   
                        </Tbody>
                    </Table>
                </Box>
            </HStack>
            <HStack spacing='20px'>
                <Box>
                    {nft.isverified ? (
                        <Tooltip hasArrow label={'Verified Project on ALGOxNFT'} aria-label='Tooltip'>
                            <Link href={'https://algoxnft.com/asset/'+nft.asset_id}isExternal pl={1}><Icon color={'#f41b8e'} fontSize='s' as={GoVerified} /></Link>
                        </Tooltip>
                    ) : null}
                    {nft.isverifiedrand ? (
                        <Tooltip hasArrow label={'Verified Project on Rand Gallery'} aria-label='Tooltip'>
                            <Link href={'https://www.randgallery.com/algo-collection/?address='+nft.asset_id}isExternal pl={1}><Icon color={'#6479BF'} fontSize='s' as={GoVerified} /></Link>
                        </Tooltip>
                    ) : null}
                    {nft.isverifiedalgoseas ? (
                        <Tooltip hasArrow label={'Verified Project on AlgoSeas'} aria-label='Tooltip'>
                            <Link href={'https://algoseas.io/marketplace/asset/'+nft.asset_id}isExternal pl={1}><Icon color={'#44a5e4'} fontSize='s' as={GoVerified} /></Link>
                        </Tooltip>
                    ) : null}
                    {nft.isverifieddart ? (
                        <Tooltip hasArrow label={'Verified Project on Dartroom'} aria-label='Tooltip'>
                            <Link href={'https://dartroom.xyz/nfts/asa/'+nft.asset_id}isExternal pl={1}><Icon color={'#919191'} fontSize='s' as={GoVerified} /></Link>
                        </Tooltip>
                    ) : null}
                </Box>
                <Box>
                    <Text fontSize='xs'>Est. Payout</Text>
                </Box>
                <Box>
                    <Text fontSize='xs' fontWeight='bold' color={(nft.ticketcost > 0)? colorText : ''}>
                    {(auctionData.state?.highest_bid / 1)} {nft.payment_unitname}
                    </Text>
                </Box>
            </HStack>
        </Box> 
    )

}