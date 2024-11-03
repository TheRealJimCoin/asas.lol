import Head from 'next/head'
import {
  Box,
  Heading,
  Container, 
  HStack,
  Stack,
  Link,
  VStack,
  Image,
  Flex,
  Spacer,
  Center,
  Grid, 
  GridItem,
  useMediaQuery,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Spinner,
  Icon,
  Text
} from '@chakra-ui/react';
import * as React from 'react'
import Navigation from '../components/Navigation'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import { BuyItNowCard } from '../src/BuyItNowCard'
import { AuctionCard } from '../src/AuctionCard'
import NextLink from 'next/link'
import { BsFire } from 'react-icons/bs'
import Footer from '../components/Footer'


export default function Marketplace(props) {
  //console.log("pools-verifiedWallets",props)
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const { auctions, listings, handleFetchAuctions, defaultWallet, sessionWallet, tokenList, algoBalance, currency, setCurrency, connected, hasTokenNextPage, fetchTokenNextPage, updateWallet } = useNavigation()
  const [loading, setLoading] = React.useState(true)
  const bgColorMode = useColorModeValue('gray.400', 'gray.200')
  const bgColorMode2 = useColorModeValue('blue.500', 'blue.400')
  const [isOptIntoAsset, setOptIntoAsset] = React.useState([])

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>asas.lol - a NFT Marketplace solely using ASAs on Algorand</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
          <Flex mb={0} direction={['column', 'row']}>
                <Box flex='3' p={2}>
                <VStack>
                <Center>
                <Box w={'100%'} pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                <Flex m={2}>
                  <Stack direction={['column', 'row']}>
                  <Box w='350px' mt={2} mb={2} p={2} bg={'gray.900'} borderColor={'#2AD3FF'} borderRadius='lg' borderWidth='2px'>
                    <Heading fontWeight={'normal'} color="#2AD3FF" size='lg'><Icon color={'#919191'} fontSize='s' as={BsFire} /> Buy It Now</Heading>
                  </Box>
                  <Box p={3}>
                  <Text fontSize='s'><NextLink href={'/listings'} passHref>Browse All Listings</NextLink></Text>
                  </Box>
                  </Stack>
                </Flex>
                {listings?.length > 0 ? (
                      <Grid
                        templateRows="repeat(1, 1fr)"
                        templateColumns="repeat(4, 1fr)"
                        gap={4}
                        px={{ base: 0, md: 4}}
                        mt={{ base: 0, md: 4}}
                      > 
                        {listings.slice(0, 4).map((listing) => (
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
                </Box>
                </Center>
                </VStack>
                </Box>
        </Flex>
        <Flex mb={0} direction={['column', 'row']}>
                <Box flex='3' p={2}>
                <VStack>
                <Center>
                <Box w={'100%'} pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                <Flex m={2}>
                  <Stack direction={['column', 'row']}>
                  <Box w='350px' mt={2} mb={2} p={2} bg={'gray.900'} borderColor={'#2AD3FF'} borderRadius='lg' borderWidth='2px'>
                    <Heading fontWeight={'normal'} color="#2AD3FF" size='lg'><Icon color={'#919191'} fontSize='s' as={BsFire} /> Auctions</Heading>
                  </Box>
                  <Box p={3}>
                  <Text fontSize='s'><NextLink href={'/auctions'} passHref>Browse All Auctions</NextLink></Text>
                  </Box>
                  </Stack>
                </Flex>
                {auctions?.length > 0 ? (
                      <Grid
                        templateRows="repeat(1, 1fr)"
                        templateColumns="repeat(4, 1fr)"
                        gap={4}
                        px={{ base: 0, md: 4}}
                        mt={{ base: 0, md: 4}}
                      > 
                        {auctions.slice(0, 4).map((auction) => (
                            <GridItem colSpan={colSpan} key={auction.id}>
                                  <AuctionCard key={auction.id} 
                                              auction={auction}  
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
                        <Text color={'white'}>No Auctions Found. Create one Today!</Text>
                        <Box as='button' color={'white'} bg={bgColorMode2} borderWidth='1px' borderRadius='lg' m={1} pt={1} pb={1} pl={3} pr={3}>
                              <NextLink href={'/create-auction'} passHref><Text fontSize='md'>Create Auction</Text></NextLink>
                        </Box>
                    </Container>
                  )} 
                </Box>
                </Center>
                </VStack>
                </Box>
        </Flex>
    </Box>
    <Footer />
    </>
  )
}
