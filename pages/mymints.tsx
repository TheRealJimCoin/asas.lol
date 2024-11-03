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
import GET_ROLLUP_MINTS from "../queries/getRollupMints"
import GET_ROLLUP_MINTS_COUNT from "../queries/getRollupMintsCount"
import GET_ROLLUP_MINTS_FILTER from "../queries/getRollupMintsFilter"
import { RollupCard } from '../src/RollupCard'
import favicon from "../public/favicon.ico"
import Footer from '../components/Footer'

const PAGE_SIZE=8;

export async function getServerSideProps(context) {

    //let currentwallet = (context.req.cookies['cw'] !== undefined)? context.req.cookies['cw'] : ''
    let page = context.query.page? parseInt(context.query.page) : 1
    let asset_id = context.query.asset? parseInt(context.query.asset) : 0
    let offset = (page===1)? 0 : PAGE_SIZE * (page -1)
    
    const [rollUpsResponse, rollUpsCountResponse] = await Promise.all([
      client.mutate({
        mutation: (asset_id > 0)? GET_ROLLUP_MINTS_FILTER : GET_ROLLUP_MINTS,
        variables: { first: PAGE_SIZE, offset: offset, asset_id: asset_id },
      }),
      client.mutate({
        mutation: (asset_id > 0)? GET_ROLLUP_MINTS_FILTER : GET_ROLLUP_MINTS_COUNT,
        variables: { asset_id: asset_id },
      }),
    ]);
  
    const { data: rollUpsData } = rollUpsResponse;
    const { data: rollUpsCountData } = rollUpsCountResponse;
  
    page = page == 0 ? 1 : page - 1;
    //const pageTotal = 1;
    const pageTotal = (rollUpsCountData?.aggregateNFTRollups?.count)? rollUpsCountData?.aggregateNFTRollups?.count / PAGE_SIZE : 0;
    return {
      props: {
        //@ts-ignore
        mymints: (rollUpsData.queryNFTRollups)? rollUpsData.queryNFTRollups : [],
        curPage: page,
        maxPage: Math.ceil(pageTotal)
      }
    }
}
const Mymints = (props) => {

  const { mymints, curPage, maxPage } = props;
  //console.log("mymints", mymints)
  const router = useRouter()
  const tag = undefined
  const filters = new URLSearchParams('')//router.query
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const [loading, setLoading] = React.useState(false)
  const [loaded, setLoaded] = React.useState(false)
  const [tokenFilter, setTokenFilter] = React.useState("")
  const [filtersChanged, setFiltersChanged] = React.useState(true)
  const { defaultWallet, sessionWallet, walletAssets } = useNavigation()
  const bgColorMode = useColorModeValue('gray.400', 'gray.200')
  //console.log("walletAssets", walletAssets)
  //filter out anything minted prior to launch of the app / makes it faster for searching
  const remainingAssets = walletAssets.filter(asset => asset.asset_id >= 1693863177)
  const [verifiedASAData, setVerifiedASAData] = React.useState({})
  //console.log("remainingAssets", remainingAssets)
  React.useEffect(()=>{
    
      const fetchVerifiedASAData = async () => {
          try {
              const responseVerifiedASA = await fetch("https://asa-list.tinyman.org/assets.json");
              const data = await responseVerifiedASA.json();
              setVerifiedASAData(data);
          } catch (error) {
              console.error("Error fetching verified ASA data:", error);
          }
      };
      if(loaded) return 
      if(mymints || filtersChanged)
          setLoaded(true)
          fetchVerifiedASAData()
          setFiltersChanged(false)
          setLoading(true) 
      return ()=>{}
  }, [loaded, mymints, filtersChanged])

  function updateTokenFilter(val){ setTokenFilter(val.target.value.toUpperCase()) }

  // Only allow filtering by price if no tag is chosen
  function filterAuctions() { 
      if(tokenFilter === "") {
        router.push("/mymints") 
      } else {
        router.push("/mymints/?asset="+tokenFilter) 
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
      <title>asas.lol - a NFT Marketplace solely using ASAs on Algorand - My Mints</title>
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
                    {/* {mymints.length > 0 ? (
                        <Box>{historyFilter}</Box>
                    ) : null} */}
                    <Spacer />
                    <Box p={2}>
                        <Box h={'10'} as='button' color={'black'} bg={bgColorMode} borderWidth='1px' borderRadius='md' m={0} pl={2} pr={2}>
                            <Link href={'/create-vault'} passHref><Text fontSize='s'>Create NFT Vault</Text></Link>
                        </Box>
                    </Box>
                </Flex>
                <Box pl={{ base: 0, md: 4}} pr={{ base: 0, md: 4}}>
                {mymints.length > 0 ? (
                <Grid
                    templateRows="repeat(1, 1fr)"
                    templateColumns="repeat(4, 1fr)"
                    gap={4}
                    px={{ base: 0, md: 4}}
                    mt={{ base: 0, md: 4}}
                > 
                    {mymints.map((nftvault) => (
                        <GridItem colSpan={colSpan} key={nftvault.id}>
                            <RollupCard key={nftvault.id} 
                                        nft={nftvault}  
                                        defaultWallet={defaultWallet}
                                        wallet={sessionWallet}
                                        verifiedASAData={verifiedASAData} />
                        </GridItem>
                    ))}
                </Grid>
                ) : (
                <Container p={2} centerContent><Text>No NFTs Found</Text></Container>
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

export default Mymints