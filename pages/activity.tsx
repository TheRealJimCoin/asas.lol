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
  Flex,
  Tooltip, 
  Spacer, 
  Stat,
  StatGroup,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper
} from '@chakra-ui/react'
import * as React from 'react'
import Navigation from '../components/Navigation'
import { StatisticsCard } from '../src/StatisticsCard'
import client from "../lib/apollo"
import GET_MARKETPLACE_ACTIVITY from "../queries/getMarketplaceActivity"
import favicon from "../public/favicon.ico"
import Footer from '../components/Footer'

export async function getServerSideProps(context) {
  const { data } = await client.mutate({
    mutation: GET_MARKETPLACE_ACTIVITY,
  });
  return {
    props: {
      //@ts-ignore
      totalsales: (data.aggregateASAsListingsPaidOut)? data.aggregateASAsListingsPaidOut.amountpaidSum : 0,
      totalauctions: (data.aggregateASAsAuctions)? data.aggregateASAsAuctions.count : 0,
      totallistings: (data.aggregateASAsListings)? data.aggregateASAsListings.count : 0,
      liveauctions: (data.liveauctions)? data.liveauctions.count : 0,
      livelistings: (data.liveauctions)? data.livelistings.count : 0,
      topsales: (data.topsales)? data.topsales : [],
      toplistingsales: (data.topsales)? data.toplistingsales : [],
      recentsales: (data.recentsales)? data.recentsales : [],
      recentlistingsales: (data.recentlistingsales)? data.recentlistingsales : []
    }
  }
}

export default function Activity(props) {
  const { totalsales, topsales, toplistingsales, recentsales, recentlistingsales, totalauctions, totallistings, liveauctions, livelistings } = props;
  //console.log("topsales",topsales)
  //console.log("recentsales",recentsales)
  const percentChangeTopSales = (topsales[0]?.amountpaid / (topsales[0]?.amountpaid - topsales[1]?.amountpaid)) * 100
  //const percentChangeLowestSales = (lowestsale[1].amountpaid === lowestsale[0].amountpaid) ? 0 : (lowestsale[1].amountpaid / (lowestsale[1].amountpaid - lowestsale[0].amountpaid)) * 100
  //const [topSales, setTopSales] = React.useState((topsales)? topsales : [])
  //const [recentsales, setRecentsales] = React.useState((topsales)? topsales : [])
  const colorText = useColorModeValue('black', 'white')
  const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
  const boxWidth = useBreakpointValue({ base: '100%', md: '40%'})
  const combinedSales = [...recentlistingsales, ...recentsales];
  const combinedTopSales = [...toplistingsales, ...topsales];
  //combinedSales.sort((a, b) => new Date(b.createdat) - new Date(a.createdat));
  combinedSales.sort((a, b) => {
    const dateA = new Date(a.createdat);
    const dateB = new Date(b.createdat);
    return dateB.getTime() - dateA.getTime();
  });

  combinedTopSales.sort((a, b) => b.amountpaid - a.amountpaid);

  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>ASAs.lol - Algorand NFT Marketplace Activity</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" centerContent>
            <Center mt='3'>
                <Heading size='xl' color={'#2AD3FF'}>Marketplace Stats</Heading>
            </Center>
             <Box w={boxWidth} mt='3' mb='3'>
             <StatGroup>
                <Stat bg={'gray.800'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontFamily={"'Inter Variable', sans-serif"}>Live Listings</StatLabel>
                    <StatNumber>{livelistings}</StatNumber>
                    <StatHelpText>{" "}
                    </StatHelpText>
                </Stat>
                <Stat bg={'gray.800'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontFamily={"'Inter Variable', sans-serif"}>Total Listings</StatLabel>
                    <StatNumber>{totallistings}</StatNumber>
                    <StatHelpText>{" "}
                    </StatHelpText>
                </Stat>
                <Stat bg={'gray.800'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontFamily={"'Inter Variable', sans-serif"}>Live Auctions</StatLabel>
                    <StatNumber>{liveauctions}</StatNumber>
                    <StatHelpText>{" "}
                    </StatHelpText>
                </Stat>
                <Stat bg={'gray.800'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontFamily={"'Inter Variable', sans-serif"}>Total Auctions</StatLabel>
                    <StatNumber>{totalauctions}</StatNumber>
                    <StatHelpText>{" "}
                    </StatHelpText>
                </Stat>
                <Stat bg={'gray.800'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontFamily={"'Inter Variable', sans-serif"}>Top Sale</StatLabel>
                    <StatNumber>{(toplistingsales[0]?.amountpaid > 0) ? toplistingsales[0]?.amountpaid : 0} </StatNumber>
                    <StatHelpText>
                    {''}{" "}
                    </StatHelpText>
                </Stat>
                <Stat bg={'gray.800'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontFamily={"'Inter Variable', sans-serif"}>Total Sales</StatLabel>
                    <StatNumber>{(totalsales > 0) ? totalsales : 0} </StatNumber>
                    <StatHelpText>{''}
                    </StatHelpText>
                </Stat>
             </StatGroup>
            </Box>
            <Box mt='3' mb='3'>
             <Heading size='lg' color={'#2AD3FF'}>Top 20 Highest Sales</Heading>
            {topsales?.length > 0 || toplistingsales?.length > 0 ? (
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns="repeat(1, 1fr)"
                    gap={2}
                    px={{ base: 0, md: 4}}
                    mt={{ base: 0, md: 4}}
                    w={'100%'}
                > 
                <GridItem w='100%'>
                    <Box bg={'#2AD3FF'} maxWidth={{ base: '400px', md: '800px'}} margin={0} borderWidth='2px' borderRadius='lg'>
                        <Flex width='100%' alignItems='center' gap={{ base: '1', md: '4'}}>
                            <Box pl={{ base: '0', md: '2'}} pr={{ base: '0', md: '2'}} minWidth={{ base: '56px', md: '66px'}}><Text color={'black'} fontSize={'sm'}>NFT</Text></Box>
                            <Box pl={{ base: '1', md: '2'}} minWidth={{ base: '80px', md: '180px'}}>
                                <Text fontFamily={"'Inter Variable', sans-serif"} fontSize={'sm'} color={'black'}> Date</Text>
                            </Box>
                            <Box minWidth={{ base: '60px', md: '200px'}}>
                                <Text fontFamily={"'Inter Variable', sans-serif"} fontSize={'sm'} color={'black'}>Name</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '80px'}}>
                                <Text fontFamily={"'Inter Variable', sans-serif"} fontSize={'sm'} color={'black'}>Sold</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '100px'}} pl={2} pr={2}>
                                <Text fontFamily={"'Inter Variable', sans-serif"} fontSize={'sm'} color={'black'}>Buyer</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '100px'}} pl={2} pr={2}>
                                <Text fontFamily={"'Inter Variable', sans-serif"} fontSize={'sm'} color={'black'}>Seller</Text>
                            </Box>
                        </Flex>
                    </Box> 
                </GridItem>
                    {combinedTopSales.map((sale) => (
                        <GridItem w='100%' key={sale.id}><StatisticsCard sale={sale} listings={sale.listings || sale.auctions} /></GridItem>
                    ))}
                </Grid> 
            ) : (
                <Container p={2} centerContent>
                    <Text color={'white'}>Nothing Found</Text>
                </Container>
            )}
            </Box>
            <Box mt='3' mb='3'>
             <Heading size='lg' color={'#2AD3FF'}>Most Recent Sales</Heading>
            {recentsales.length > 0 || recentlistingsales.length > 0 ? (
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns="repeat(1, 1fr)"
                    gap={2}
                    px={{ base: 0, md: 4}}
                    mt={{ base: 0, md: 4}}
                    w={'100%'}
                > 
                <GridItem w='100%'>
                    <Box bg={'#2AD3FF'} maxWidth={{ base: '400px', md: '800px'}} margin={0} borderWidth='2px' borderRadius='lg'>
                        <Flex width='100%' alignItems='center' gap={{ base: '1', md: '4'}}>
                            <Box pl={{ base: '0', md: '2'}} pr={{ base: '0', md: '2'}} minWidth={{ base: '56px', md: '66px'}}><Text color={'black'} fontSize={'sm'}>NFT</Text></Box>
                            <Box pl={{ base: '1', md: '2'}} minWidth={{ base: '60px', md: '180px'}}>
                                <Text color={'black'} fontSize={'sm'}> Date</Text>
                            </Box>
                            <Box minWidth={{ base: '60px', md: '200px'}}>
                                <Text color={'black'} fontSize={'sm'}>Name</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '80px'}}>
                                <Text color={'black'} fontSize={'sm'}>Sold</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '100px'}} pr={2}>
                                <Text color={'black'} fontSize={'sm'}>Buyer</Text>
                            </Box>
                            <Box minWidth={{ base: '50px', md: '100px'}} pr={2}>
                                <Text color={'black'} fontSize={'sm'}>Seller</Text>
                            </Box>
                        </Flex>
                    </Box> 
                </GridItem>
                    {combinedSales.map((sale) => (
                        <GridItem w='100%' key={sale.id}><StatisticsCard sale={sale} listings={sale.listings || sale.auctions} /></GridItem>
                    ))}
                </Grid> 
            ) : (
                <Container p={2} centerContent>
                    <Text color={'white'}>Nothing Found</Text>
                </Container>
            )}
            </Box>
      </Container>
      <Footer />
    </>
  )
}
