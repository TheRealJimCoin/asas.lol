import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  VStack,
  Center,
  Grid, 
  GridItem,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Spinner,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Text,
  Icon, 
  Tooltip, 
  Spacer, 
  useDisclosure, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper
} from '@chakra-ui/react'
import Link from 'next/link'
import * as React from 'react'
import Navigation from '../components/Navigation'
import { AuctionListing } from '../src/AuctionListing'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import client from "../lib/apollo"
import GET_LISTINGS_BY_WALLET from "../queries/getListingsByWallet"
import favicon from "../public/favicon.ico"
import { BuyItNowListing } from '../src/BuyItNowListing'
import Footer from '../components/Footer'

export async function getServerSideProps(context) {
  //console.log("CONTEXTQUERY", context.query)
  //const searchaddress = context.query.address? context.query.address : ''
  const searchaddress = (context.req.cookies['cw'] !== undefined)? context.req.cookies['cw'] : ''
  const { data } = await client.mutate({
    mutation: GET_LISTINGS_BY_WALLET,
    variables: { address: searchaddress},
  });
  return {
    props: {
      //@ts-ignore
      WalletRewardHistory: (data.queryWallet[0])? data.queryWallet[0] : []
    }
  }
}

export default function MyListings(props) {
  const { WalletRewardHistory } = props;
  //console.log("historyofWallet",WalletRewardHistory)
  const colSpan = useBreakpointValue({ base: 1, md: 1})
  const { defaultWallet, sessionWallet, connected, currency, updateWallet } = useNavigation()
  //console.log("listings",WalletRewardHistory.listings)
  const colorText = useColorModeValue('black', 'white')
  const colorTabBg = useColorModeValue('gray.400', 'blue.300')
  const colorBlackWhite = useColorModeValue('black', 'black')
  const boxWidth = useBreakpointValue({ base: '100%', md: '40%'})
  

  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>NFT Marketplace solely using ASAs on Algorand - My Listings</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} size="xl">
              Connect your Wallet
            </Heading>
            <AlgorandWalletConnector 
                        darkMode={true}
                        //@ts-ignore
                        sessionWallet={sessionWallet}
                        connected={connected} 
                        //@ts-ignore
                        updateWallet={updateWallet}
                        />
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz">
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
      <title>asas.lol - a NFT Marketplace solely using ASAs on Algorand - Listings</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
          <Box w={boxWidth} mt='2' >
          <Tabs isFitted variant='enclosed' w={'100%'}>
                <TabList pb={2}>
                    <Tab _selected={{ bg: colorTabBg }} bgColor={'gray'} mr={1} color={colorBlackWhite}><Heading size='sm'>Active Listings</Heading></Tab>
                    <Tab _selected={{ bg: colorTabBg }} bgColor={'gray'} mr={1} color={colorBlackWhite}><Heading size='sm'>Active Auctions</Heading></Tab>
                    <Tab _selected={{ bg: colorTabBg }} bgColor={'gray'} mr={1} color={colorBlackWhite}><Heading size='sm'>Completed Listings</Heading></Tab>
                    <Tab _selected={{ bg: colorTabBg }} bgColor={'gray'} color={colorBlackWhite}><Heading size='sm'>Completed Auctions</Heading></Tab>
                </TabList>
                <TabPanels>
                    <TabPanel p={0}>  
                        {WalletRewardHistory.asaslistings.filter(l => l.iscomplete == false).length > 0 ? (
                            <Grid
                                templateRows="repeat(1, 1fr)"
                                templateColumns="repeat(1, 1fr)"
                                gap={2}
                                px={{ base: 0, md: 4}}
                                mt={{ base: 0, md: 4}}
                                w={'100%'}
                            > 
                                {WalletRewardHistory.asaslistings.filter(l => l.iscomplete == false).map((listing) => (
                                    <GridItem w='100%' colSpan={colSpan} key={listing.id}><BuyItNowListing defaultWallet={defaultWallet} nft={listing} currency={currency} wallet={sessionWallet}/></GridItem>
                                ))}
                            </Grid> 
                        ) : (
                            <Container p={2} centerContent>
                                <Text color={'white'}>No Listings Found</Text>
                            </Container>
                        )}
                    </TabPanel>
                    <TabPanel p={0}>  
                        {WalletRewardHistory.asasauctions.filter(a => a.iscomplete == false).length > 0 ? (
                            <Grid
                                templateRows="repeat(1, 1fr)"
                                templateColumns="repeat(1, 1fr)"
                                gap={2}
                                px={{ base: 0, md: 4}}
                                mt={{ base: 0, md: 4}}
                                w={'100%'}
                            > 
                                {WalletRewardHistory.asasauctions.filter(a => a.iscomplete == false).map((auction) => (
                                    <GridItem w='100%' colSpan={colSpan} key={auction.id}><AuctionListing defaultWallet={defaultWallet} nft={auction} currency={currency} wallet={sessionWallet}/></GridItem>
                                ))}
                            </Grid> 
                        ) : (
                            <Container p={2} centerContent>
                                <Text color={'white'}>No Auctions Found</Text>
                            </Container>
                        )}
                    </TabPanel>
                    <TabPanel p={0}>
                        {WalletRewardHistory.asaslistings.filter(l => l.iscomplete == true && l.seller_wallet === defaultWallet).length > 0 ? (
                            <Grid
                                templateRows="repeat(1, 1fr)"
                                templateColumns="repeat(1, 1fr)"
                                gap={2}
                                px={{ base: 0, md: 4}}
                                mt={{ base: 0, md: 4}}
                                w={'100%'}
                            > 
                                {WalletRewardHistory.asaslistings.filter(l => l.iscomplete == true && l.seller_wallet === defaultWallet).map((listing) => (
                                    <GridItem w='100%' colSpan={colSpan} key={listing.id}><BuyItNowListing defaultWallet={defaultWallet} nft={listing} currency={currency} wallet={sessionWallet}/></GridItem>
                                ))}
                            </Grid> 
                        ) : (
                            <Container p={2} centerContent>
                                <Text color={'white'}>No Listings Found</Text>
                            </Container>
                        )}
                    </TabPanel>
                    <TabPanel p={0}>
                        {WalletRewardHistory.asasauctions.filter(auction => auction.iscomplete == true && auction.seller_wallet === defaultWallet).length > 0 ? (
                            <Grid
                                templateRows="repeat(1, 1fr)"
                                templateColumns="repeat(1, 1fr)"
                                gap={2}
                                px={{ base: 0, md: 4}}
                                mt={{ base: 0, md: 4}}
                                w={'100%'}
                            > 
                                {WalletRewardHistory.asasauctions.filter(auction => auction.iscomplete == true && auction.seller_wallet === defaultWallet).map((listing) => (
                                    <GridItem w='100%' colSpan={colSpan} key={listing.id}><AuctionListing defaultWallet={defaultWallet} nft={listing} currency={currency} wallet={sessionWallet}/></GridItem>
                                ))}
                            </Grid> 
                        ) : (
                            <Container p={2} centerContent>
                                <Text color={'white'}>No Auctions Found</Text>
                            </Container>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
            </Box>
      </Container>
      <Footer />
    </>
  )
}
