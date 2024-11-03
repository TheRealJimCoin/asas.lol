/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import Head from 'next/head'
import {
    Box,
    Button,
    Grid,
    GridItem,
    Center,
    Container,
    Text,
    Stack,
    VStack,
    Flex,
    Spacer,
    HStack,
    Input,
    FormLabel,
    Skeleton,
    Spinner,
    useMediaQuery,
    useColorModeValue,
    useBreakpointValue
  } from "@chakra-ui/react"
import Link from 'next/link'
import { ArrowLeftIcon, ArrowRightIcon } from '@chakra-ui/icons'
import Router, { useRouter } from "next/router" 
import Navigation from '../components/Navigation'
import ReactPaginate from "react-paginate"
import client from "../lib/apollo"
import { useNavigation } from "../src/contexts/navigation.context"
import GET_COMPLETED_AUCTIONS from "../queries/getCompletedAuctions"
import GET_COMPLETED_AUCTIONS_FILTER from "../queries/getCompletedAuctionsFilter"
import { AuctionCard } from '../src/AuctionCard'
import favicon from "../public/favicon.ico"
import Footer from "../components/Footer"

const PAGE_SIZE=8;
export async function getServerSideProps(context) {

  let currentwallet = (context.req.cookies['cw'] !== undefined)? context.req.cookies['cw'] : ''
  let page = context.query.page? parseInt(context.query.page) : 1
  let asset_id = context.query.asset? parseInt(context.query.asset) : 0
  let offset = (page===1)? 0 : PAGE_SIZE * (page -1)

  const { data } = await client.query({
    query: (asset_id > 0)? GET_COMPLETED_AUCTIONS_FILTER : GET_COMPLETED_AUCTIONS,
    variables: { first: PAGE_SIZE, offset: offset, asset_id: asset_id, address: currentwallet },
  });

  //subscribed = false
  page = page == 0 ? 1 : page - 1;
  const pageTotal = (data?.aggregateASAsAuctions)? data?.aggregateASAsAuctions.count / PAGE_SIZE : 0;

  //@ts-ignore
  return {
        props: {
            auctions: data?.queryASAsAuctions,
            curPage: page,
            maxPage: Math.ceil(pageTotal)
        }
   }
}
const AuctionHistory = (props) => {

  const { auctions, curPage, maxPage } = props;
  //console.log("auctions", auctions)
  const router = useRouter()
  const tag = undefined
  const filters = new URLSearchParams('')//router.query
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const [loading, setLoading] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [tokenFilter, setTokenFilter] = React.useState("")
  const [filtersChanged, setFiltersChanged] = React.useState(true)
  const { defaultWallet, sessionWallet, handleFetchAuctions, connected, updateWallet, currency, tokenList, algoBalance, hasTokenNextPage, fetchTokenNextPage, setCurrency } = useNavigation()
  const [isOptIntoAsset, setOptIntoAsset] = React.useState([])
  const bgColorMode = useColorModeValue('gray.400', 'gray.200')


  React.useEffect(()=>{
      if(loaded) return 
      if(auctions || filtersChanged)
          setLoaded(true)
          setFiltersChanged(false)
          setLoading(true) 
      return ()=>{}
  }, [loaded, auctions, filtersChanged])

  function updateTokenFilter(val){ setTokenFilter(val.target.value.toUpperCase()) }

  // Only allow filtering by price if no tag is chosen
  function filterAuctions() { 
      if(tokenFilter === "") {
        router.push("/auction-history") 
      } else {
        router.push("/auction-history/?asset="+tokenFilter) 
      }
      setLoaded(false)
      setFiltersChanged(true)
  } 
  
  // Triggers fetch for new page
  const handlePagination = page => {
    const path = router.pathname
    const query = router.query
    query.page = page.selected + 1
    router.push({
      pathname: path,
      query: query,
    })
  }

  const historyFilter = tag===undefined?(
      <Container p={2} maxW='container.xl'>
          <Center>
              <HStack>
                  <FormLabel>Filter By Asset ID</FormLabel>
                  <Input size='s' defaultValue='' maxW={150} onChange={updateTokenFilter} />
                  <Button colorScheme='gray' onClick={filterAuctions}>Filter</Button>
              </HStack>
          </Center>
      </Container>
  ):<Container></Container>

  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>Auction History</title>
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
                <Flex ml={{ base: 0, md: 6}} mr={{ base: 0, md: 6}}>
                    <Box>
                        {historyFilter}
                    </Box>
                    <Spacer />
                    <Box p={2}>
                        <Box h={'12'} as='button' color={'black'} bg={bgColorMode} borderWidth='1px' borderRadius='md' m={0} pl={2} pr={2}>
                            <Link href={'/'} passHref><Text fontSize='s'>View Live Auctions</Text></Link>
                        </Box>
                    </Box>
                </Flex>
                <Box pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                    {auctions.length > 0 ? (
                        <Grid
                            templateRows="repeat(1, 1fr)"
                            templateColumns="repeat(4, 1fr)"
                            gap={4}
                            px={{ base: 0, md: 4}}
                            mt={{ base: 0, md: 4}}
                        > 
                            {auctions.map((auction) => (
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
                            <Text color={'white'}>No Auctions Found</Text>
                        </Container>
                    )}
                </Box>
                <Container centerContent={true} p={3} h={{ base: 35}}>
                    <ReactPaginate
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        previousLabel={(maxPage === 0)? '' : <ArrowLeftIcon />}
                        nextLabel={(maxPage === 0)? '' : <ArrowRightIcon />}
                        breakLabel={"..."}
                        initialPage={curPage}
                        pageCount={maxPage}
                        onPageChange={handlePagination}
                        containerClassName={"paginate-wrap"}
                        pageClassName={"paginate-li"}
                        pageLinkClassName={"paginate-a"}
                        activeClassName={"paginate-active"}
                        nextLinkClassName={"paginate-next-a"}
                        previousLinkClassName={"paginate-prev-a"}
                        breakLinkClassName={"paginate-break-a"}
                    />
                </Container>
             </>
          )}
      </Box>
      <Footer />
    </>
  )
}

export default AuctionHistory