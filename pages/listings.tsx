import Head from 'next/head'
import {
  Box,
  Button,
  Heading,
  Input,
  Flex,
  Container, 
  VStack,
  Center,
  Grid, 
  GridItem,
  HStack,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper,
  Skeleton,
  Progress,
  Spinner,
  Text
} from '@chakra-ui/react';
import Link from 'next/link'
import * as React from 'react'
import Navigation from '../components/Navigation'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import InfiniteScroll from 'react-infinite-scroll-component'
import { BuyItNowCard } from '../src/BuyItNowCard'
import { useRouter } from 'next/router'
import {platform_settings as ps} from '../lib/platform-conf'
import Footer from '../components/Footer'

export default function Listings(props) {
  //console.log("Auctions",props)
  const [ isLargerThan2560 ] = useMediaQuery("(min-width: 2560px)")
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const bgColorMode = useColorModeValue('gray.400', 'gray.400')
  const { listings, loading, defaultWallet, fetchNextListingPage, hasNextListingPage, handleFetchAuctions, sessionWallet, tokenList, algoBalance, currency, setCurrency, connected, hasTokenNextPage, fetchTokenNextPage, updateWallet } = useNavigation()
  const [isOptIntoAsset, setOptIntoAsset] = React.useState([])
  const colorText = useColorModeValue('white', 'white')
  //console.log("auctions", auctions)

  const router = useRouter()

  function redirectPage() { 
    router.push("/create-listing");
  }

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>NFT Marketplace solely using ASAs on Algorand - NFT Buy It Now Listings</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        {!loading ? (
              <>
              <Box mt='2'>
                <Center>
                  <VStack><Text fontSize='xl'>Loading...</Text><Spinner size='xl'/></VStack>
                </Center>
              </Box>
              </>
            ) : (
              <>
              {defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2 || defaultWallet === ps.application.admin_addr3 ? (
              <Flex ml={{ base: 0, md: 6}} mr={{ base: 0, md: 6}} direction={'row'}>
                  <HStack>
                  <Box as='button' color={'black'} borderWidth='0px' borderRadius='md' m={0} p={2}>
                    <Button size='sm' colorScheme={'blue'} onClick={redirectPage}>Create Listing</Button>
                  </Box>
                  </HStack>
              </Flex>
              ) : null} 
              <Box pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                  <InfiniteScroll
                    dataLength={listings.length}
                    next={fetchNextListingPage}
                    hasMore={(listings.length >= 8)? hasNextListingPage: false}
                    loader={(isLargerThan2560 && listings.length === 8)? (<Center><Text>Looks like your on a larger screen. Pull down to load more</Text></Center>) : (<Center><Box w='40%' p={2}><Progress size='sm' isIndeterminate /></Box></Center>) }
                    // below props only if you need pull down functionality
                    refreshFunction={fetchNextListingPage}
                    pullDownToRefresh={(isLargerThan2560 && listings.length === 8)? true: false}
                    pullDownToRefreshThreshold={50}
                    pullDownToRefreshContent={
                      <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                    }
                    releaseToRefreshContent={
                      <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                    }
                  >
                      {listings.length > 0 ? (
                        <Grid
                          templateRows="repeat(1, 1fr)"
                          templateColumns="repeat(4, 1fr)"
                          gap={4}
                          px={{ base: 0, md: 4}}
                          mt={{ base: 0, md: 4}}
                      > 
                          {listings.map((listing) => (
                              <GridItem colSpan={colSpan} key={listing.id}>
                                    <BuyItNowCard key={listing.id} 
                                                listing={listing}  
                                                defaultWallet={defaultWallet}
                                                wallet={sessionWallet} 
                                                updateWallet={updateWallet}
                                                isOptIntoAsset={isOptIntoAsset} 
                                                setOptIntoAsset={setOptIntoAsset}
                                                currency={currency}
                                                setCurrency={setCurrency}
                                                connected={connected}
                                                tokenList={tokenList}
                                                algoBalance={algoBalance}
                                                hasTokenNextPage={hasTokenNextPage}
                                                fetchTokenNextPage={fetchTokenNextPage}
                                                handleFetchAuctions={handleFetchAuctions} />
                              </GridItem>
                          ))}
                      </Grid>
                    ) : (
                      <Container p={2} centerContent>
                          <Text color={'white'}>No Listings Found</Text>
                      </Container>
                    )} 
                  </InfiniteScroll>
              </Box>
             {/*  <Center>
                <Box as='button' color={'black'} bg={bgColorMode} borderWidth='1px' borderRadius='lg' m={4} p={3}>
                      <Link href={'/listing-history'} passHref><Text>View NFT Listings History</Text></Link>
                </Box>
              </Center> */}
              </>
            )}
      </Box>
      <Footer />
    </>
  )
}
