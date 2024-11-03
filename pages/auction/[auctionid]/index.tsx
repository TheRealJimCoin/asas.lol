
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

import client from "../../../lib/apollo"
import Navigation from '../../../components/Navigation'
import GET_AUCTION_BY_ID from "../../../queries/getAuctionById"
import { useNavigation } from "../../../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../../../src/AlgorandWalletConnector'
import { getCurrentApplicatonGlobalState } from '../../../lib/algorand'
import Timer from '../../../components/Timer'
import { AUCTION } from '../../../lib/auction'
import favicon from "../../../public/favicon.ico"
import { showErrorToaster, showNetworkSuccess } from "../../../src/Toaster"
import Footer from '../../../components/Footer'
import NextLink from 'next/link'

export async function getServerSideProps(context) {

  if (!context.query.auctionid) {
    return {
        notFound: true,
    }
  }

  let auctionappid = context.query.auctionid? context.query.auctionid : 1
 
  const { data } = await client.mutate({
    mutation: GET_AUCTION_BY_ID,
    variables: { auctionappid: parseInt(auctionappid) },
  })
  if (data?.queryASAsAuctions.length === 0) {
    return {
        notFound: true,
    }
  }
  //@ts-ignore
  return {
        props: {
            auction: data?.queryASAsAuctions[0]
        }
   }
}

export default function Auction(props) {
  const { auction } = props;
  //console.log("Auction", auction)
  const auctionAppId =  auction.auctionappid
  const { defaultWallet, sessionWallet, tokenList, updateWallet, loading, connected } = useNavigation()
  const [qtyValue, setQtyValue] = React.useState(0)
  const [isPlacingBid, setIsPlacingBid] = React.useState(false)
  const [isClaimingBid, setIsClaimingBid] = React.useState(false)
  const [isClaimingProceeds, setIsClaimingProceeds] = React.useState(false)
  const [isClaimComplete, setIsClaimComplete] = React.useState(false)
  const [auctionData, setAuctionData] = React.useState({ state: undefined})
  const [auctionCreatedAt, setAuctionCreatedAt] = React.useState<Date>(undefined)
  const [highestBid, setHighestBid] = React.useState<any>(0)
  const walletLink = (auction?.seller_wallet_nfd !== null)? 'https://app.nf.domains/name/' + auction.seller_wallet_nfd : 'https://allo.info/address/' + auction.seller_wallet
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure()
  const colorText = useColorModeValue('#a2ff44', '#a2ff44')
  const buttonText3 = useColorModeValue('orange.500','cyan.500')
  const buttonText4 = useColorModeValue('orange.100','cyan.100')
  const buttonColor = useColorModeValue('blue', 'blue')
  const colorBlackWhite = useColorModeValue('black', 'black')
  const colorFeatured = useColorModeValue('gray.500', 'gray.600')
  const iconColor1 = useColorModeValue('orange','cyan')
  const bgCardOn = useColorModeValue('linear(60deg, whiteAlpha.300 3%, gray.500 50%, whiteAlpha.300 97%)','linear(60deg, whiteAlpha.300 3%, black 50%, whiteAlpha.300 97%)')
  var currentDateISO = new Date().toISOString()
  var lotteryCreatedAt = new Date(auction.createdat)
  var lotteryEndedAt = new Date(auction.createdat)
  // Calculate the number of milliseconds in a day
  var millisecondsInDay = 24 * 60 * 60 * 1000;
  // Calculate the number of milliseconds to add based on the fractional part of lengthOfLottery
  var millisecondsToAdd = auction.lengthofauction * millisecondsInDay;
  // Adjust the time portion of the lotteryCreatedAt date object
  lotteryEndedAt.setTime(lotteryEndedAt.getTime() + millisecondsToAdd);
  const formatDate = (sourceDate: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
  }

  async function bidAuction(event) {
    setIsPlacingBid(true)
    //const totalCost = (qtyValue * 1000000) * 1
    await AUCTION.bidAuction(sessionWallet, qtyValue, auction.payment_asset_id, auction.payment_decimal, auctionAppId).then((txid: any) => {
        getCurrentApplicatonGlobalState(auctionAppId).then((contractData)=> { 
            if(contractData) {
                setAuctionData(contractData)
                let minBid = (contractData.state?.highest_bid / 1)
                //let minBid = (contractData.state?.highest_bid / 1000000) + (1 / 1000000) //this is here to up min bid by 0.0001
                const roundedMinBid = Number(minBid.toFixed(auction.payment_decimal))
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

async function claimAuction(event) {
    setIsClaimingBid(true)
    await AUCTION.claimAuction(sessionWallet, auction.asset_id, defaultWallet, auction.creator_wallet, auctionAppId).then((txid: any) => {
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
                    //console.log("contractData: ", contractData)
                    setAuctionData(contractData)
                    let minBid = (contractData.state?.highest_bid / 1) + 1
                    //let minBid = (contractData.state?.highest_bid / 1000000) + (1 / 1000000) //this is here to up min bid by 0.0001
                    const roundedMinBid = Number(minBid.toFixed(6)) / Math.pow(10, auction.payment_decimal)
                    //console.log("contractData: ", contractData.state?.auction_end)
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

    if(auctionAppId > 0 && (auction?.auctionspaidout?.length < 1 || auction?.auctionswinners?.length < 1)) {
        handleGetApplicatonGlobalState()
    } else {
        setHighestBid(auction?.auctionspaidout[0]?.amountpaid)
        setAuctionCreatedAt(auction?.createdat)
    }
}, [auctionAppId, auction?.createdat, auction?.iscomplete, auction?.auctionspaidout, auction?.auctionswinners]) 

  return (
    <>
    <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>asas.lol - a NFT Marketplace solely using ASAs on Algorand - NFT Auction</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Navigation />
    <Box w="100%" h="100%">
            <Heading textAlign='center' mt={4} pt={3} fontSize='20px'>
                Auction #{auction.auctionappid}
            </Heading>
            <Container pb={0} pt={0} pl={0} pr={0} centerContent>
            <Box p={2}>
            <Flex pt={1} p={3} bg={'gray.700'} borderRadius='lg'>
                <Box p={1}>
                    <Container p={0} centerContent>
                    <Box w='90%' maxW='300px' borderWidth='1.5px' borderColor={'black'} borderRadius='16.5px'>
                        {auction.priority === 1 ? (
                            <Box position="absolute" p={2} bg={'gray.400'} borderWidth='1px' borderTopLeftRadius='lg' borderBottomRightRadius='lg'>
                                <HStack>
                                    <Text fontSize='xs'>Blazing</Text>
                                </HStack>
                            </Box>
                        ) : null }
                        <Center>
                        {auction.mimetype === 'video/mp4' || auction.mimetype === 'video/3gpp' || auction.mimetype === 'video/quicktime' ? (
                        <video className={'reactvidplayer'} autoPlay={false} src={auction && auction.image != '' && auction.image != null ? AUCTION.resolveUrl(auction.image) : 'placeholder.png'} controls>
                            <source src={auction && auction.image != '' && auction.image != null ? AUCTION.resolveUrl(auction.image) : 'placeholder.png'} type="video/mp4" />
                        </video>
                        ) : (
                        <Image boxSize='350px' objectFit='cover' sx={(auction.iscomplete)? { opacity: 0.3 } : { opacity: 1} } borderTopLeftRadius={'lg'} borderTopRightRadius='lg' borderBottomLeftRadius={(auction.lastsaleprice !== "0" && auction.lastsaleprice !== null)? '' : 'lg'} borderBottomRightRadius={(auction.lastsaleprice !== "0" && auction.lastsaleprice !== null)? '' : 'lg'}  alt='asas.lol Auctions' src={auction && auction.image != '' && auction.image != null ? AUCTION.resolveUrl(auction.image) : 'placeholder.png'} />
                        )}
                        </Center>
                        {auction.lastsaleprice !== "0" && auction.lastsaleprice !== null ? (
                        <Container p={0} bg={colorFeatured} borderBottomLeftRadius='md' borderBottomRightRadius='md' centerContent>
                            <Text fontSize='xs' fontWeight='bold'>{auction.lastsaleprice}</Text>
                        </Container>
                        ) : null }
                    </Box>
                    <Box py={0.5} px={2} bgGradient={bgCardOn} borderColor={'black'} borderTopWidth='0px' borderBottomWidth='1px' borderLeftWidth='1px' borderRightWidth='1px' borderBottomRadius='xl' borderTopRadius='sm'>
                        <HStack>
                            <Link href={'https://explorer.flippingalgos.xyz/asset/'+auction.asset_id}>
                                <Text color={'white'} fontSize='14px'>{(auction.name === undefined)? auction.name + '...' : auction.name}</Text>
                            </Link>
                        </HStack>
                    </Box>
                    </Container>
                </Box>
                <Spacer />
                <Box> 
                    <Flex mt={1} mr={2}>
                    <Box>
                        <Text fontSize='xs'>Owner</Text>
                        <Text fontSize='10px'>
                            {(auction.seller_wallet_nfd != null)? auction.seller_wallet_nfd : (auction.seller_wallet != null)? auction.seller_wallet.substring(0, 5) + '...' + auction.seller_wallet.slice(-4): "auction.algo"}
                        </Text> 
                    </Box>
                    <Spacer />
                    <Box>
                        <Text fontSize='xs' align='left'>{!auction.iscomplete ? 'Current Bid' : 'Winning Bid' }</Text>
                        <Text fontSize='15px' fontWeight='bold' color={(auction.ticketcost > 0)? colorText : ''}>
                            {(highestBid / 1)} {auction.payment_unitname}
                        </Text>
                    </Box>
                    </Flex>
                    <Center>
                        <VStack mt={6} w='100%' maxW='600px' spacing={4} alignItems='center' justifyContent='center'>
                        <VStack fontSize='10px'>
                            <Text>Start Date:</Text>
                            <Text>{formatDate(auction.createdat)}</Text>
                        </VStack>
                        <HStack fontSize='10px'>
                        {!auction.iscomplete && auctionData !== undefined ? (
                                <>
                            {auctionData.state?.highest_bidder !== "Z3YJM6Q=" ? (
                                <Box m={2} p={2} borderColor={'#2AD3FF'} borderRadius='lg' borderWidth='2px'>
                                    <VStack>
                                    <Text fontSize='sm' color={'gray.100'}>Highest Bidder:</Text> 
                                    <Text fontSize='sm' color={'#2AD3FF'}>{(auctionData.state?.highest_bidder != null)? auctionData.state?.highest_bidder.substring(0, 5) + '...' + auctionData.state?.highest_bidder.slice(-4): ""}</Text>
                                    </VStack>
                                </Box>
                            ) : (
                                <Box m={2} p={2} bg={'#949494'} borderRadius='lg' borderWidth='2px'>
                                    <Center>
                                    <Text fontSize='sm' color={'gray.700'}>No bids yet!</Text>
                                    </Center>
                                </Box>
                            ) }
                            </>
                        ) : null }
                        </HStack>
                    <Center p={0}>
                        {auctionData.state?.auction_end !== undefined ? (
                        <Timer createdat={auctionData.state?.auction_end} lengthofgame={auction.lengthofauction} />
                        ) : null }
                    </Center>
                    {connected ? (
                    <Box w='stretch'>
                        <HStack w='stretch'>
                            <Box w='100%' alignItems='center'>
                            {(tokenList[0]) ? (
                                <>
                                {(tokenList[0]).balance === 0 ? null : (
                                <Center>
                                    {lotteryCreatedAt.toISOString() > currentDateISO ? (
                                    <VStack>
                                        <NumberInput precision={auction.payment_decimal} step={1} size='sm' borderColor={colorBlackWhite} onChange={(valueAsString, valueAsNumber) => setQtyValue(valueAsNumber)} value={qtyValue} defaultValue={qtyValue} min={highestBid} w='130px'>
                                        <NumberInputField />
                                        <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                        </NumberInputStepper>
                                        </NumberInput>
                                        <Tooltip py={1} px={2} borderWidth='1px' borderRadius='lg' arrowShadowColor={iconColor1} borderColor={buttonText3} bgColor='black' textColor={buttonText4} fontSize='10px' textAlign='center' hasArrow label={'Enter Bid!'} aria-label='Tooltip'>
                                            <Box p={0}><Button size='sm' colorScheme={buttonColor} isLoading={isPlacingBid} loadingText='Placing Bid' onClick={bidAuction}>{'Bid w/ ' + auction.payment_unitname}</Button></Box>
                                        </Tooltip>
                                        <Modal scrollBehavior={'outside'} size='xs' isCentered isOpen={isOpen} onClose={onClose}>
                                        <ModalOverlay backdropFilter='blur(10px)'/>
                                        <ModalContent m='auto' alignItems='center' bgColor='black' borderWidth='1.5px' borderColor={buttonText3} borderRadius='lg'>
                                            <ModalHeader textAlign='center' fontSize='14px' fontWeight='bold'>Enter {auction.name}?</ModalHeader>
                                            <ModalBody>
                                            <VStack m={1} fontSize='12px' alignItems='center' justifyContent='center' spacing='24px'>
                                                <HStack pb={3}>
                                                    <Button isLoading={null} onClick={onClose} ><Text>X</Text></Button>
                                                    <Button isLoading={null} onClick={bidAuction}><Text>Confirm</Text></Button>
                                                </HStack>
                                            </VStack>
                                            </ModalBody>
                                        </ModalContent>
                                        </Modal>
                                    </VStack>
                                    ) : (
                                    <VStack>
                                    <Text fontSize='xs' color={'#2AD3FF'}>Winner</Text>
                                    <Box w='220px' mt={2} mb={2} p={2} borderColor={'#2AD3FF'} borderRadius='lg' borderWidth='2px'>
                                        <VStack align={'center'} spacing={{ base: 2, md: 4}}>
                                            {auction?.auctionswinners?.length > 0 ? (
                                            <Link href={'https://allo.info/address/'+auction?.auctionswinners[0]?.receiver} isExternal>
                                                <Text fontSize='xs' color={'#2AD3FF'}>{auction?.auctionswinners[0]?.receiver.substring(0, 5) + '...' + auction?.auctionswinners[0]?.receiver.slice(-4)}</Text>
                                            </Link>
                                            ) : (
                                            <>
                                            {auctionData.state?.highest_bidder == defaultWallet ? (
                                                <Button size='sm' isLoading={isClaimingBid} loadingText='Claiming NFT' colorScheme={buttonColor} onClick={claimAuction}>Claim NFT</Button>
                                            ) : (
                                                <>
                                                {auction.iscomplete && auction?.auctionswinners?.length <= 0 && auction?.auctionspaidout?.length <= 0  ? (
                                                    <Text color={'gray.700'} fontSize='sm'>No Bids and No Winners</Text>
                                                ) : (
                                                <VStack>
                                                    <Text color={'white'} fontSize='sm'>Claim NFT Pending</Text>
                                                    <Text fontSize='xs' color={'#2AD3FF'}>{auctionData.state?.highest_bidder.substring(0, 5) + '...' + auctionData.state?.highest_bidder.slice(-4)}</Text>
                                                </VStack>
                                                )}
                                                </>
                                            )}
                                            </>
                                            ) }
                                        </VStack>
                                    </Box>
                                    </VStack>
                                    )}
                                </Center>
                                )}
                                </>
                            ) : null}
                            </Box>
                        </HStack>
                    </Box>
                    ) : (
                    <Box p={2} w='stretch' alignItems='center' justifyContent='center'>
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
