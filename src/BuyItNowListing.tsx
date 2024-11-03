
/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Icon, Center, Container, Table, Tbody, Tr, Th, Td, Thead, Tooltip, Text, Link, Image, HStack, Spacer, Button, useColorModeValue, useBreakpointValue } from '@chakra-ui/react'
import { BUYITNOW } from '../lib/buyitnow'
import { Wallet } from '../lib/algorand-session-wallet'
import { getCurrentApplicatonGlobalState } from '../lib/algorand'
import { showErrorToaster,showNetworkSuccess } from "../src/Toaster"
import { GoVerified } from 'react-icons/go'
import { ExternalLinkIcon } from '@chakra-ui/icons'
import NextLink from 'next/link'

type BuyItNowListingProps = {
    defaultWallet: string;
    nft: any;
    currency: any;
    wallet: Wallet;
};

export function BuyItNowListing(props: BuyItNowListingProps) {
    //console.log("BuyItNowListing",props)
    const { defaultWallet, nft, currency, wallet } = props
    var listingAppId =  nft.listingappid
    const [auctionData, setAuctionData] = React.useState({ state: undefined})
    const [isPurchasingBumpUp, setIsPurchasingBumpUp] = React.useState(false)
    const [isListingStatus, setListingStatus] = React.useState(nft.iscomplete)
    const [isListingPriority, setListingPriority] = React.useState(nft.priority)
    const colorText = useColorModeValue('green.200', '#2AD3FF')
    const colorBg = useColorModeValue('gray.700', 'gray.700')
    const imageWidth = useBreakpointValue({ base: '100px', md: '200px'})
    const [isCancelListing, setIsCancelListing] = React.useState(false)
    const [isClaimComplete, setIsClaimComplete] = React.useState(false)
    const buttonColor = useColorModeValue('green', 'green')
    const [isApplicationFound, setIsApplicationFound] = React.useState(true)
    const [isDeleting, setIsDeleting] = React.useState(false)

    React.useEffect(()=>{ 
        
        const handleGetApplicatonGlobalState = async () => {
            if(listingAppId !== 0) {
                getCurrentApplicatonGlobalState(listingAppId).then((contractData)=> { 
                    if(contractData) {
                        setAuctionData(contractData)
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentApplicatonGlobalState",err)
                    setIsApplicationFound(false)
                }) 
            }
        }
    
        if(listingAppId > 0)
            handleGetApplicatonGlobalState()
    }, [listingAppId]) 

    
    async function deleteListing() {
        setIsDeleting(true)
        await BUYITNOW.deleteListing(wallet, listingAppId).then((txid: any) => {
            //console.log("deleteListing: ",txid)
            if(txid !== undefined) {
              showNetworkSuccess("Listing Delete Successful")
              setIsDeleting(false)
            } 
        }).catch((err)=>{ 
            console.log("error ", err)
            setIsDeleting(false)
        }) 
    }

    async function cancelListing(event) {
        setIsCancelListing(true)
        await BUYITNOW.claimListingNoBid(wallet, 1, nft.asset_id, currency.asset_id, nft.seller_wallet, nft.creator_wallet, listingAppId, nft.payment_creator).then((txid: any) => {
            //console.log("claimProceeds: ",txid)
            if(txid !== undefined) {
                getCurrentApplicatonGlobalState(listingAppId).then((contractData)=> { 
                    if(contractData) {
                        setAuctionData(contractData)
                        //console.log("claimProceeds: ",txid)
                        fetch('/api/updateListing', {
                            method: 'POST',
                            body: JSON.stringify({
                                listingappid: listingAppId,
                                isactive: true,
                                iscomplete: true
                            })
                        })
                        .then((res) => {
                            res.json().then((getStatus) => {
                                if(getStatus.success) {
                                    showNetworkSuccess("Listing Successful Canceled")
                                } else {
                                    showErrorToaster("Error Canceling NFT Listing") 
                                }
                            }).catch((err)=>{ 
                                //console.log("error Making Auction Live Auction", err)
                                showErrorToaster("Error Canceling NFT Listing") 
                            })
                        }) 
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentApplicatonGlobalState",err)
                }) 
            } else {
                setIsCancelListing(false)
                showErrorToaster("Error Canceling NFT Listing") 
            }
        }).catch((err)=>{ 
            console.log("error ", err)
        }) 
        setIsCancelListing(false)
    
    }
   
    async function purchaseBumpUp(event) {
        setIsPurchasingBumpUp(true)
        event.stopPropagation()
        event.preventDefault()
        //console.log("purchaseBumpUp", props)
        if(isListingPriority === 0) {
            await BUYITNOW.purchaseBumpUp(wallet, nft.listingappid, currency).then((txid) => {
                //console.log("verified NFT",txid)
                if(txid && txid !== "" && txid !== undefined && isListingPriority == 0) {
                    var now = new Date().toISOString()
                    fetch('/api/buyBumpUp', {
                        method: 'POST',
                        body: JSON.stringify({
                            listingappid: nft.listingappid,
                            priority: 1
                        })
                    }).then((res) => {
                        //console.log("nft sent to escrow")
                        res.json().then((getStatus) => {
                            //console.log("blaze up purchased", getStatus)
                            if(getStatus.success) {
                                setListingPriority(1)
                                showNetworkSuccess("Successfully Purchased Buy It Now Listing Blaze Up")
                            } else {
                                showErrorToaster("Error Purchasing Buy It Now Listing Blaze Up")
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
                    {isListingPriority === 1 ? (
                        <Box position="absolute" p={{ base: '1', md: '2'}} bg={'gray.400'} borderWidth='1px' borderBottomRightRadius='lg'>
                            <HStack>
                                <Text fontSize='xs'>Blazing</Text>
                            </HStack>
                        </Box>
                    ) : null } 
                    <Center>
                    {nft.mimetype === 'video/mp4' ? (
                    <video className={'reactvidplayer'} autoPlay={false} src={nft && nft.image != '' ? BUYITNOW.resolveUrl(nft.image) : 'placeholder.png'} controls>
                        <source src={nft && nft.image != '' ? BUYITNOW.resolveUrl(nft.image) : 'placeholder.png'} type="video/mp4" />
                    </video>
                    ) : (
                    <NextLink href={'/listing/'+nft.listingappid} passHref>
                        <a>
                        <Image boxSize={imageWidth} alt='ASAs.lol NFT Buy It Now Listing' src={nft && nft.image != '' ? BUYITNOW.resolveUrl(nft.image) : 'placeholder.png'} />
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
                    <Table p={1} variant='striped' colorScheme={'blue'} size='sm'>
                        <Tbody>
                            <Tr>
                                <Td><Text fontSize='10px' fontWeight='bold'>Listing ID</Text></Td>
                                <Td> 
                                <HStack>
                                    <Text fontSize='10px' fontWeight='bold' color={(nft.ticketcost > 0)? colorText : ''}>
                                    {listingAppId}
                                    </Text>
                                </HStack>
                                </Td>
                            </Tr>
                            <Tr>
                                <Td><Text fontSize='10px' fontWeight='bold'>Listing Price</Text></Td>
                                <Td> 
                                <HStack>
                                    <Text fontSize='10px' fontWeight='bold' color={(nft.ticketcost > 0)? colorText : ''}>
                                        {(nft.ticketcost / 1).toFixed(currency.decimal)} {currency.unitname}
                                    </Text>
                                </HStack>
                                </Td>
                            </Tr>
                            {/* {!isListingStatus && isListingPriority === 0 ? (
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
                            ) : null } */}
                            
                           {nft?.listingspaidout?.length > 0  ? (
                            <Tr>
                                <Td><Text fontSize='xs' fontWeight='bold'>Paid</Text></Td>
                                <Td> 
                                    <HStack p={0}>
                                    {nft.listingspaidout.map((listingPaidout) => (
                                        <Box w={'90px'} key={listingPaidout.txid} bg={useColorModeValue('green.400', 'green.300')} p={0} borderWidth='1px' borderRadius='md'>
                                            <Center>
                                            <Link href={'https://allo.info/tx/'+listingPaidout.txid} isExternal>
                                            <Text color={'black'} fontSize='xs'>
                                            {listingPaidout.receiver.substring(0, 5) + '...' + listingPaidout.receiver.slice(-4)}
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
                                {nft.seller_wallet === defaultWallet && !isListingStatus ? (
                                    <Button size='xs' isLoading={isCancelListing} loadingText='Canceling Listing' colorScheme={'red'} onClick={cancelListing}>Cancel Listing </Button>
                                ) : null }
                                </Td>
                            </Tr>
                            )}
                            <Tr>
                                <Td>
                        {auctionData !== undefined ? (
                          <>
                            {isApplicationFound ? (
                            <Button size='xs' mt={1} isLoading={isDeleting} loadingText='Deleting...' colorScheme={buttonColor} onClick={deleteListing}>Delete</Button>
                            ) : null}
                          </>
                         ) : null }</Td>
                            </Tr>
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
            </HStack>
        </Box> 
    )

}