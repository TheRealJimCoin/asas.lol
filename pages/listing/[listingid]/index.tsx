
import * as React from 'react'
import Head from 'next/head'
import {
    Box,
    Grid,
    GridItem,
    Button,
    Center,
    Container,
    Heading,
    Text,
    VStack,
    Progress,
    Divider,
    HStack,
    Flex,
    Spacer,
    Image,
    keyframes,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Link,
    Skeleton,
    NumberInput, 
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper,
    Icon,
    Tooltip,
    useMediaQuery,
    useDisclosure,
    useColorModeValue,
    Modal, ModalOverlay, ModalBody, ModalContent, ModalHeader,
    useBreakpointValue
  } from "@chakra-ui/react"

import { useState, useCallback } from "react"
import client from "../../../lib/apollo"
import Navigation from '../../../components/Navigation'
import GET_LISTING_BY_ID from "../../../queries/getListingById"
import { useNavigation } from "../../../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../../../src/AlgorandWalletConnector'
import { getCurrentApplicatonGlobalState } from '../../../lib/algorand'
import { BUYITNOW } from '../../../lib/buyitnow'
import favicon from "../../../public/favicon.ico"
import { showErrorToaster, showNetworkSuccess } from "../../../src/Toaster"
import Footer from '../../../components/Footer'

export async function getServerSideProps(context) {

  if (!context.query.listingid) {
    return {
        notFound: true,
    }
  }

  let listingappid = context.query.listingid? context.query.listingid : 1
 
  const { data } = await client.mutate({
    mutation: GET_LISTING_BY_ID,
    variables: { listingappid: parseInt(listingappid) },
  })
  if (data?.queryASAsListings.length === 0) {
    return {
        notFound: true,
    }
  }
  //@ts-ignore
  return {
        props: {
            listing: data?.queryASAsListings[0]
        }
   }
}

export default function Listing(props) {
  const { listing } = props;
  //console.log("Listing", listing)
  //const [qtyValue, setQtyValue] = React.useState(0)
  //const colorBlackWhite = useColorModeValue('black', 'black')
  const listingAppId =  listing.listingappid
  const { defaultWallet, sessionWallet, tokenList, updateWallet, loading, connected } = useNavigation()
  const [isClaimComplete, setIsClaimComplete] = React.useState(false)
  const [auctionData, setAuctionData] = React.useState({ state: undefined})
  const walletLink = (listing?.seller_wallet_nfd !== null)? 'https://app.nf.domains/name/' + listing.seller_wallet_nfd : 'https://allo.info/address/' + listing.seller_wallet
  const [isPurchasing, setIsPurchasing] = React.useState(false)
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure()
  const colorText = useColorModeValue('#a2ff44', '#a2ff44')
  const buttonText3 = useColorModeValue('orange.500','cyan.500')
  const buttonText4 = useColorModeValue('orange.100','cyan.100')
  const buttonColor = useColorModeValue('blue', 'blue')
  const colorFeatured = useColorModeValue('gray.500', 'gray.600')
  const iconColor1 = useColorModeValue('orange','cyan')
  const bgCardOn = useColorModeValue('linear(60deg, whiteAlpha.300 3%, gray.500 50%, whiteAlpha.300 97%)','linear(60deg, whiteAlpha.300 3%, black 50%, whiteAlpha.300 97%)')
  
  async function purchaseNFT(event) {
    setIsPurchasing(true)
    //const totalCost = (qtyValue * 1000000) * 1
    await BUYITNOW.purchase(sessionWallet, 1, listing.asset_id, listing.ticketcost, listing.seller_wallet, listing.creator_wallet, listing.payment_asset_id, listingAppId, listing.payment_creator).then((txid: any) => {
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
                    } else {
                        showErrorToaster("Error Purchasing NFT from Listing") 
                    }
                }).catch((err)=>{ 
                    console.log("error Purchasing NFT from Listing", err)
                })
            }) 
        } else {
            setIsPurchasing(false)
            showErrorToaster("Error Purchasing NFT from Listing") 
        }
    }).catch((err)=>{ 
        console.log("error ", err)
    }) 
    setIsPurchasing(false)
}

  React.useEffect(()=>{ 
        
    const handleGetApplicatonGlobalState = async () => {
        if(listingAppId !== 0) {
            getCurrentApplicatonGlobalState(listingAppId).then((contractData)=> { 
                if(contractData) {
                    setAuctionData(contractData)
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
    <>
    <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>ASAs.lol - a NFT Marketplace solely using ASAs on Algorand - Buy It Now Listing</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Navigation />
    <Box w="100%" h="100%">
            <Heading textAlign='center' mt={4} pt={3} fontSize='20px'>
                Listing #{listing.listingappid}
            </Heading>
            <Container pb={0} pt={0} pl={0} pr={0} centerContent>
            <Box p={2}>
            <Flex pt={1} p={3} bg={'gray.700'} borderRadius='lg'>
                <Box w={'100%'} p={1}>
                    <Container p={0} centerContent>
                    <Box w='90%' maxW='300px' borderWidth='1.5px' borderColor={'black'} borderRadius='16.5px'>
                        {listing.priority === 1 ? (
                            <Box position="absolute" p={2} bg={'gray.400'} borderWidth='1px' borderTopLeftRadius='lg' borderBottomRightRadius='lg'>
                                <HStack>
                                    <Text fontSize='xs'>Blazing</Text>
                                </HStack>
                            </Box>
                        ) : null }
                        <Center>
                        {listing.mimetype === 'video/mp4' || listing.mimetype === 'video/3gpp' || listing.mimetype === 'video/quicktime' ? (
                        <video className={'reactvidplayer'} autoPlay={false} src={listing && listing.image != '' && listing.image != null ? BUYITNOW.resolveUrl(listing.image) : 'placeholder.png'} controls>
                            <source src={listing && listing.image != '' && listing.image != null ? BUYITNOW.resolveUrl(listing.image) : 'placeholder.png'} type="video/mp4" />
                        </video>
                        ) : (
                        <Image boxSize='350px' objectFit='cover' sx={(listing.iscomplete)? { opacity: 0.3 } : { opacity: 1} } borderTopLeftRadius={'lg'} borderTopRightRadius='lg' borderBottomLeftRadius={(listing.lastsaleprice !== "0" && listing.lastsaleprice !== null)? '' : 'lg'} borderBottomRightRadius={(listing.lastsaleprice !== "0" && listing.lastsaleprice !== null)? '' : 'lg'}  alt='asas.lol Buy It Now Listing' src={listing && listing.image != '' && listing.image != null ? BUYITNOW.resolveUrl(listing.image) : 'placeholder.png'} />
                        )}
                        </Center>
                        {listing.lastsaleprice !== "0" && listing.lastsaleprice !== null ? (
                            <Container p={0} bg={colorFeatured} borderBottomLeftRadius='md' borderBottomRightRadius='md' centerContent>
                                <Text fontSize='xs' fontWeight='bold'>{listing.lastsaleprice}</Text>
                            </Container>
                        ) : null }
                    </Box>
                    <Box py={0.5} px={2} bgGradient={bgCardOn} borderColor={'black'} borderTopWidth='0px' borderBottomWidth='1px' borderLeftWidth='1px' borderRightWidth='1px' borderBottomRadius='xl' borderTopRadius='sm'>
                        <HStack>
                            <Link href={'https://explorer.flippingalgos.xyz/asset/'+listing.asset_id}>
                              <Text color={'white'} fontSize='14px'>{(listing.name === undefined)? listing.name + '...' : listing.name}</Text>
                            </Link>
                        </HStack>
                    </Box>
                    </Container>
                </Box>
                <Spacer />
                <Box w={'50%'}> 
                    <Box>
                        <Text fontSize='xs' align='left'>Seller</Text>
                        <Text fontSize='10px'>
                            {(listing.seller_wallet_nfd != null)? listing.seller_wallet_nfd : (listing.seller_wallet != null)? listing.seller_wallet.substring(0, 5) + '...' + listing.seller_wallet.slice(-4): "listings.algo"}
                        </Text> 
                    </Box>
                    <Box mt={2}>
                        <Text fontSize='xs' align='left'>Price</Text>
                        <Text fontSize='15px' fontWeight='bold' color={(listing.ticketcost > 0)? colorText : ''}>
                            {(listing.ticketcost / 1).toFixed(listing.payment_decimal)} {listing.payment_unitname}
                        </Text>
                    </Box>
                    <Center>
                        <VStack mt={6} w='100%' maxW='600px' spacing={4} alignItems='center' justifyContent='center'>
                    {connected ? (
                    <Box w='stretch'>
                        <HStack w='stretch'>
                            <Box w='100%' alignItems='center'>
                            {(listing.iscomplete) ? (
                                <Box m={2} p={2} borderColor={'#2AD3FF'} borderRadius='lg' borderWidth='2px'>
                                    <VStack fontSize='10px'>
                                    <Text fontSize='sm' color={'gray.100'}>Buyer:</Text> 
                                    <Text fontSize='sm' color={'#2AD3FF'}>{(listing?.listingspaidout[0]?.receiver)? listing?.listingspaidout[0]?.receiver.substring(0, 5) + '...' + listing?.listingspaidout[0]?.receiver.slice(-4) : ""}</Text>
                                    </VStack>
                                </Box>
                            ) : (
                                <>
                                {(tokenList[0])?.balance === 0 ? null : (
                                <Center>
                                    <HStack>
                                        {/* <NumberInput precision={listing.payment_decimal} step={1} size='sm' borderColor={colorBlackWhite} onChange={(valueAsString, valueAsNumber) => setQtyValue(valueAsNumber)} value={qtyValue} defaultValue={qtyValue} min={highestBid} w='130px'>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                        </NumberInput> */}
                                        <Tooltip py={1} px={2} borderWidth='1px' borderRadius='lg' arrowShadowColor={iconColor1} borderColor={buttonText3} bgColor='black' textColor={buttonText4} fontSize='10px' textAlign='center' hasArrow label={'Buy It Now Listing!'} aria-label='Tooltip'>
                                            <Box p={0}><Button size='sm' colorScheme={buttonColor} isLoading={isPurchasing} loadingText='Purchasing' onClick={purchaseNFT}>{'Buy It Now w/ ' + listing.payment_unitname}</Button></Box>
                                        </Tooltip>
                                        <Modal scrollBehavior={'outside'} size='xs' isCentered isOpen={isOpen} onClose={onClose}>
                                        <ModalOverlay backdropFilter='blur(10px)'/>
                                        <ModalContent m='auto' alignItems='center' bgColor='black' borderWidth='1.5px' borderColor={buttonText3} borderRadius='lg'>
                                            <ModalHeader textAlign='center' fontSize='14px' fontWeight='bold'>Enter {listing.name}?</ModalHeader>
                                            <ModalBody>
                                            <VStack m={1} fontSize='12px' alignItems='center' justifyContent='center' spacing='24px'>
                                                <HStack pb={3}>
                                                    <Button isLoading={null} onClick={onClose} ><Text>X</Text></Button>
                                                    <Button isLoading={null} onClick={purchaseNFT}><Text>Confirm</Text></Button>
                                                </HStack>
                                            </VStack>
                                            </ModalBody>
                                        </ModalContent>
                                        </Modal>
                                    </HStack>
                                </Center>
                                )}
                                </>
                            )}
                            </Box>
                        </HStack>
                    </Box>
                    ) : (
                    <Box p={1} w='stretch' alignItems='center' justifyContent='center'>
                        <Center>
                            <AlgorandWalletConnector 
                                    darkMode={true}
                                    //@ts-ignore
                                    sessionWallet={sessionWallet}
                                    connected={connected} 
                                    //@ts-ignore
                                    updateWallet={updateWallet}
                                    />
                        </Center>
                    </Box>
                    )}
                    </VStack>
                    </Center>
                </Box>
            </Flex>
        </Box>
        </Container>
      </Box>
      <Footer />
    </>
  )
}
