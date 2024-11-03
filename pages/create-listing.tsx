import Head from 'next/head'
import {
  Box,
  Button,
  Heading,
  Container, 
  VStack,
  HStack,
  Center,
  Fade,
  Image,
  Flex,
  useColorModeValue,
  Link,
  Spinner,
  Progress,
  Text
} from '@chakra-ui/react'
import * as React from 'react'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import favicon from "../public/favicon.ico"
import CreateListingForm from "../components/forms/listing-form"
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import { BUYITNOW } from '../lib/buyitnow'
import { useRouter } from 'next/router'
import Footer from '../components/Footer'

export default function CreateListing(props) {
  const { defaultWallet, handleFetchAuctions, sessionWallet, connected, updateWallet, tokenList, currency, loading, walletAssets } = useNavigation()
  const [stepError, setStepError] = React.useState(false)
  const [isSendingNFT, setIsSendingNFT] = React.useState(false)
  const [isStepTwo, setIsStepTwo] = React.useState(false)
  const [isNFTsent, setIsNFTsent] = React.useState(false)
  const [listingAppId, setListingAppId] = React.useState(0)
  const [auctionAssetId, setAuctionAssetId] = React.useState(0)
  const [ticketPrice, setTicketPrice] = React.useState(1)
  const colorText = useColorModeValue('black', 'white')
  const colorYellow = useColorModeValue('yellow', 'yellow')
  const buttonColor = useColorModeValue('yellow', 'yellow')
  
  const [data, setData] = useState<{
    assetId: string;
    name: string;
    image: string;
    mimetype: string;
    ticketcost: string;
    twitter: string;
    marketplace: string;
    website: string;
    creator: string;
    isverified: boolean;
    isverifiedalgoseas: boolean;
    isverifieddart: boolean;
    isverifiedrand: boolean;
    isverifiedalgogems: boolean;
  }>()

  const router = useRouter()

  function redirectPage() { 
    router.push("/mylistings");
  }

  async function createListing(data) {
    //console.log("createListing ", data)
    await BUYITNOW.createListing(sessionWallet, currency.asset_id, currency.unitname).then((txid: any) => {
        //console.log("createListing Application: ",res)
        if(txid !== undefined) {
            //console.log("form setIsStepTwo")
            setListingAppId(txid[0]?.appId)
            setTicketPrice(data.ticketcost)
            var now = new Date().toISOString()
            fetch('/api/createListing', {
                method: 'POST',
                body: JSON.stringify({
                    asset_id: parseInt(data.assetId),
                    payment_asset_id: parseInt(currency.asset_id),
                    payment_unitname: currency.unitname,
                    payment_decimal: currency.decimal,
                    payment_creator: currency.creator,
                    address: defaultWallet,
                    name: data.name,
                    image: data.image,
                    mimetype: (data?.mimetype)? data.mimetype : null,
                    listingappid: txid[0]?.appId,
                    ticketcost: data.ticketcost,
                    createdat: now,
                    creator_wallet: data.creator,
                    seller_wallet: defaultWallet,
                    isverified: (data.isverified)? data.isverified : false,
                    isverifiedalgoseas: (data.isverifiedalgoseas)? data.isverifiedalgoseas : false,
                    isverifieddart: (data.isverifieddart)? data.isverifieddart : false,
                    isverifiedrand: (data.isverifiedrand)? data.isverifiedrand : false,
                    isverifiedalgogems: (data.isverifiedalgogems)? data.isverifiedalgogems : false,
                    twitter: data.twitter,
                    website: data.website,
                    marketplace: data.marketplace
                })
            })
            .then((res) => {
                res.json().then((getStatus) => {
                    //console.log("Auction ", getStatus)
                    if(getStatus.success) {
                      setIsStepTwo(true)
                      showNetworkSuccess("Listing Created Successfully")
                    } else {
                      setStepError(true)
                      showErrorToaster("Error Creating Listing") 
                    }
                }).catch((err)=>{ 
                    //console.log("error creating Auction", err)
                    setStepError(true)
                })
            }) 
        } else {
            setStepError(true)
            showErrorToaster("Error Creating Auction Smart Contract") 
        }
        return txid
    }).catch((err)=>{ 
        setStepError(true)
        //console.log("error ", err)
    }) 
    return undefined
  }

  React.useEffect(()=>{ 
    if(data === undefined || !connected) return 
      //console.log("form data sent", data)
      setAuctionAssetId(parseInt(data.assetId))
      createListing(data)
    
  }, [defaultWallet, connected, setAuctionAssetId, data])

  async function sendNFTtoEscrow(event) {
    event.stopPropagation()
    event.preventDefault()
    setIsSendingNFT(true)
    await BUYITNOW.startListing(sessionWallet, auctionAssetId, currency.asset_id, 1, ticketPrice, listingAppId).then((txid: any) => {
        //console.log("startListing: ",txid)
        fetch('/api/updateListing', {
            method: 'POST',
            body: JSON.stringify({
                listingappid: listingAppId,
                isactive: true
            })
        })
        .then((res) => {
            res.json().then((getStatus) => {
                //console.log("startListing ", getStatus)
                if(getStatus.success) {
                  setIsSendingNFT(false)
                  setIsNFTsent(true)
                  showNetworkSuccess("Listing Now Live Successfully")
                } else {
                  setIsSendingNFT(false)
                  showErrorToaster("Error Making Listing Live") 
                }
            }).catch((err)=>{ 
                console.log("error Making Listing Live", err)
                setIsSendingNFT(false)
            })
        }) 
    }).catch((err)=>{ 
        console.log("error ", err)
        setIsSendingNFT(false)
    })  
  }
  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>ASAs.lol - Create New NFT Buy It Now Listing</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect your Wallet
            </Heading>
           <AlgorandWalletConnector 
                        darkMode={true}
                        //@ts-ignore
                        sessionWallet={sessionWallet}
                        connected={connected} 
                        //@ts-ignore
                        updateWallet={updateWallet}
                        //@ts-ignore
                        handleFetchAuctions={handleFetchAuctions}
                        />
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz/">
                FlippingAlgos
              </Link>
            </Text>
          </VStack>
        </Center>
      </Container>
    </>
    );
  }
  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>ASAs.lol - Create New NFT Buy It Now Listing</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        <Center h="100%">
          <Box padding="2">
              <Fade in={!data} unmountOnExit>
                <Box bgColor={'gray.800'} m={3} p={3} borderWidth='1px' borderRadius='lg'>
                <VStack>
                  <Box p={0}>
                    <Heading textAlign="center">
                        Create Buy It Now Listing
                    </Heading>
                  </Box>
                  <Box p={0}>
                    <CreateListingForm walletAssets={walletAssets} loading={loading} currency={currency} tokenList={tokenList} onRegistered={setData} />
                  </Box>
                </VStack>
                </Box>
              </Fade>
              <Fade in={!!data} unmountOnExit>
                <Box maxWidth={"xl"}>
                    {!isStepTwo && !isNFTsent ? (
                        <>
                          <Box p={2}>
                              <Text color={'white'} fontSize='xs'>Attemping to create a New Buy It Now Listing. This could take upto 10-15 seconds wait for the confirmation popup.</Text>
                          </Box>
                          <Box p={2}>
                            <Progress size='xs' isIndeterminate />
                          </Box>  
                          {stepError ? (
                          <>
                            <Box>
                                <Center>
                                  <Text color={'white'} fontSize='xs'>Looks like we ran into a issue. Double check your listings to confirm and if its not there try creating it again.</Text>
                                  <Button size='sm' colorScheme={colorYellow} onClick={redirectPage}><Text p={2} fontSize='xs'>Check My Listings</Text></Button>
                                </Center>
                            </Box>
                          </>
                          ) : null }
                        </>
                    ) : null }
                    {isStepTwo && !isNFTsent ? (
                        <>
                          <VStack>
                          <Box>
                              <Text p={2} color={'blue'}>Success Inital Buy It Now #{listingAppId} Contract Created</Text>
                          </Box>
                          <Box>
                            <Button colorScheme={buttonColor} onClick={sendNFTtoEscrow}>
                                <Text px={2} zIndex={1}>Start Listing</Text>
                            </Button>
                          </Box>
                          {data?.image && (data?.mimetype === 'video/mp4' || data?.mimetype === 'video/3gpp' || data?.mimetype === 'video/quicktime') ? (
                              <>
                              <video className={'reactvidplayer'} autoPlay={false} src={data && data.image != '' ? BUYITNOW.resolveUrl(data.image) : 'placeholder.png'} controls>
                                  <source src={data && data.image != '' ? BUYITNOW.resolveUrl(data.image) : 'placeholder.png'} type="video/mp4" />
                              </video>
                              </>
                          ) : (
                              <>
                              <Box>
                                <Image width={350} height={350} borderRadius='lg' src={data.image != null ? BUYITNOW.resolveUrl(data.image) : '/placeholder.png' as any} alt='ASAs.lol NFT Auctions' />
                              </Box>
                              </>
                          )}
                          <Box>
                            <Text color={'black'} p={2} size="xs">Preparing to Send NFT {data?.assetId} to the Smart Contract Wallet</Text>
                          </Box>
                          </VStack>
                      </>
                    ) : null }
                    {isStepTwo && isNFTsent ? (
                        <>
                          <VStack>
                          <Box>
                              <Text p={2} color={'blue'}>Success Auction #{listingAppId} Is Live</Text>
                          </Box>
                          {data?.image && (data?.mimetype === 'video/mp4' || data?.mimetype === 'video/3gpp' || data?.mimetype === 'video/quicktime') ? (
                              <>
                              <video className={'reactvidplayer'} autoPlay={false} src={data && data.image != '' ? BUYITNOW.resolveUrl(data.image) : 'placeholder.png'} controls>
                                  <source src={data && data.image != '' ? BUYITNOW.resolveUrl(data.image) : 'placeholder.png'} type="video/mp4" />
                              </video>
                              </>
                          ) : (
                              <>
                              <Box>
                                <Image width={350} height={350} borderRadius='lg' src={data.image != null ? BUYITNOW.resolveUrl(data.image) : '/placeholder.png' as any} alt='ASAs.lol NFT Auctions' />
                              </Box>
                              </>
                          )}
                          <Box>
                              <Center>
                                <Button size='sm' colorScheme={colorYellow} onClick={redirectPage}><Text p={2} fontSize='xs'>View My Listings</Text></Button>
                              </Center>
                          </Box>
                          </VStack>
                      </>
                    ) : null }
                </Box>
              </Fade>
            </Box>
        </Center>
      </Box>
      <Footer />
    </>
  )
}
