import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  Stack,
  HStack,
  VStack,
  Image,
  Center,
  Grid, 
  GridItem,
  Button,
  Fade,
  Flex,
  Spacer,
  Modal, 
  ModalOverlay, 
  ModalBody, 
  ModalContent, 
  ModalHeader,
  useDisclosure,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Spinner,
  Text
} from '@chakra-ui/react'
import * as React from 'react'
import Link from 'next/link'
import { useState, useEffect } from "react"
import Navigation from '../components/Navigation'
import { getVaultNFTs } from '../lib/algorand'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import { RollupCard } from '../src/RollupCard'
import { showErrorToaster, showNetworkSuccess } from '../src/Toaster'
import Footer from '../components/Footer'

export default function MyVaults(props) {
  //console.log("MyVaults",props)
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const { defaultWallet, sessionWallet, connected, walletAssets } = useNavigation()
  const [listings, setListings] = React.useState([])
  const [listingsCount, setListingsCount] = React.useState(undefined)
  const [loadingListings, setLoadingListings] = React.useState(false)
  const colorText = useColorModeValue('black', 'black')
  const bgColorMode = useColorModeValue('gray.400', 'gray.200')
  const [verifiedASAData, setVerifiedASAData] = useState({})

React.useEffect(() => {
  if(!walletAssets) return 

    let cancel = false;
    getVaultNFTs(walletAssets).then((data)=> { 
        //console.log("data", data)
        if (cancel) return;
          if(data)
            setListings(data['nfts']) 
            setListingsCount(data['nfts'].length)
            setLoadingListings(true)
            //setAlgoBalance(data.algoBalance)
    }) 

  return () => { 
    cancel = true;
  }
 }, [walletAssets])

 
React.useEffect(() => {
  
      const fetchVerifiedASAData = async () => {
          try {
              const responseVerifiedASA = await fetch("https://asa-list.tinyman.org/assets.json");
              const data = await responseVerifiedASA.json();
              setVerifiedASAData(data);
          } catch (error) {
              console.error("Error fetching verified ASA data:", error);
          }
      };
      fetchVerifiedASAData()
  
   }, [])

if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>NFT Vaults</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%">
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect your Wallet
            </Heading>
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz">
                FlippingAlgos
              </Link>
            </Text>
          </VStack>
        </Center>
      </Box>
    </>
    );
  }
  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>NFT Vaults</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        {loadingListings && listingsCount > 0 ? (
            <>
            <Flex ml={{ base: 0, md: 6}} mr={{ base: 0, md: 6}}>
                <Spacer />
                <Box p={2}>
                    <Box h={'10'} as='button' color={'black'} bg={bgColorMode} borderWidth='1px' borderRadius='md' m={0} pl={2} pr={2}>
                        <Link href={'/create-vault'} passHref><Text fontSize='s'>Create NFT Vault</Text></Link>
                    </Box>
                </Box>
            </Flex>
            {listings.length > 0 ? (
                <Box pl={{ base: 0, md: 1}} pr={{ base: 0, md: 1}}>
                    <Grid
                        templateRows="repeat(1, 1fr)"
                        templateColumns="repeat(4, 1fr)"
                        gap={4}
                        px={{ base: 0, md: 2}}
                        mt={{ base: 0, md: 2}}
                    > 
                    {listings.map((listing) => (
                        <GridItem colSpan={colSpan} key={listing.asset_id}>
                                <RollupCard key={listing.id} 
                                nft={listing}  
                                defaultWallet={defaultWallet}
                                wallet={sessionWallet}
                                verifiedASAData={verifiedASAData} />
                        </GridItem>
                    ))}
                    </Grid>
                </Box>
              ) : (
                <Container p={2} centerContent>
                    <Center>
                      <Text fontSize='md' fontFamily={'arial'} color={colorText}>0 NFT Vaults Found.</Text>
                      <Text p={2} fontSize='md' color={'black'} fontFamily={'arial'}>Try Minting one <Link href={'/create-vault'} as={'/create-vault'} passHref>Here</Link></Text>
                    </Center>
                </Container> 
              )}
            </>
          ) : (
            <Box pl='6' pr='6' pt='2'>
              <VStack width={'100%'}>
                <Text fontSize='xl' color={colorText}>Searching Wallet {defaultWallet.substr(0, 5) + '...' + defaultWallet.slice(-4)} For NFT Vaults...</Text>
                <Spinner size='xl'/>
              </VStack>
            </Box>
          )} 
      </Box>
      <Footer />
    </>
  )
}
