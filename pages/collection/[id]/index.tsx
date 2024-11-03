
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
    Stat,
    StatGroup,
    StatLabel,
    StatNumber,
    Skeleton,
    NumberInput, 
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper,
    Icon,
    Input,
    SimpleGrid,
    Tooltip,
    useClipboard,
    useMediaQuery,
    useDisclosure,
    useColorModeValue,
    Modal, ModalOverlay, ModalBody, ModalContent, ModalHeader,
    useBreakpointValue
  } from "@chakra-ui/react"

import { useState, useCallback } from "react"
import client from "../../../lib/apollo"
import Navigation from '../../../components/Navigation'
import GET_COLLECTION_BY_ID from "../../../queries/getCollectionById"
import { useNavigation } from "../../../src/contexts/navigation.context"
import { NFT } from '../../../lib/nft'
//import { getAssetsByCreator } from '../../../lib/algorand'
//import { NFTCard } from '../../../src/NFTCard'
//import { NFTMarketplaceListings } from '../../../src/NFTMarketplaceListings'
//import InfiniteScroll from 'react-infinite-scroll-component'
import favicon from "../../../public/favicon.ico"
import Footer from '../../../components/Footer'
import Loader from '../../../components/Loader'
import { GoVerified } from 'react-icons/go'
import { BiGlobe } from 'react-icons/bi'
import { FaTwitter } from 'react-icons/fa'
import { RiDiscordLine } from 'react-icons/ri'

const PAGE_SIZE=4;

export async function getServerSideProps(context) {

  if (!context.query.id) {
    return {
        notFound: true,
    }
  }

  //let collection_id = context.query.id? context.query.id : ''
  //forcing all slugs no dashes / spaces / special chars etc normalize super easy
  let collection_id = context.query.id ? context.query.id.replace(/-/g, '') : '';
  //console.error("collection_id:", collection_id);
 
  try {
    const { data } = await client.mutate({
      mutation: GET_COLLECTION_BY_ID,
      variables: { collection_id: collection_id },
    })
    if (data?.queryCollections.length === 0) {
      return {
          notFound: true,
      }
    }
    //@ts-ignore
    return {
          props: {
            collection: data?.queryCollections[0]
          }
    }
  } catch (error) {
    console.error("Error:", error); // Log any errors that occur during the query
    throw error; // Rethrow the error to let Next.js handle it
  }
}

export default function Collection(props) {
  const { collection } = props;
  //console.log("collection", props)
  const { defaultWallet, sessionWallet, currency, connected } = useNavigation()
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure()
  const colSpan = useBreakpointValue({ base: 5, md: 1})
  const [ isLargerThan2560 ] = useMediaQuery("(min-width: 2560px)")
  const colorBlackWhite = useColorModeValue('black', 'white')
  const [creatorFullData, setCreatorFullData] = React.useState({ state: undefined, assets: undefined})
  const [creatorData, setCreatorData] = React.useState<any[]>([])
  const [activityData, setActivityData] = React.useState<any[]>([])
  const [floorData, setFloorData] = React.useState({ flippingalgos: null, algoxnft: null, rand: null, shufl: null, exa: null, algogems: null})
  const { onCopy, hasCopied } = useClipboard(collection.creator)
  const [imageSrc, setImageSrc] = useState('/placeholder_502.png')
  let [page, setPage] = React.useState<number>(0)
  const [totalListings, setTotalListings] = React.useState<number>(0)
  const [avgFloorPrice, setAvgFloorPrice] = React.useState<number>(0)
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(true)
  const [isLoadingFloorData, setIsLoadingFloorData] = React.useState<boolean>(true)
  const [isLoadingActivityData, setIsLoadingActivityData] = React.useState<boolean>(true)
  const formatDate = (sourceDate: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: "long", day: 'numeric', year: 'numeric', hour: '2-digit', minute: "2-digit" };
    return new Intl.DateTimeFormat("en-US", options).format(new Date(sourceDate));
  }

  const handleOnError = () => {
      setImageSrc('/placeholder_502.png'); // Set fallback image when error occurs
  };

  React.useEffect(()=>{ 
        
  if(collection.collection_preview !== '' && collection.collection_preview !== null)
      setImageSrc(NFT.resolveStandardUrl(collection.collection_preview))

  }, [collection.collection_preview]) 

  React.useEffect(()=>{ 
        
    const handleGetFloorData = async () => {
      if (!collection.collection_id) return; // If creator is not defined, return
  
      try {
          
        const response = await fetch('/api/getFloorDataByCollectionId', {
            method: 'POST',
            body: JSON.stringify({collection_id: collection.collection_id})
        })
        const getFloorData = await response.json()
        setFloorData(getFloorData?.data.queryCollections[0]?.floor_data)

        let total_listings = 0;
        let total_floor_price = 0;
        let marketplacecount =0
        let lowest_price = Number.POSITIVE_INFINITY;
        for (const key in getFloorData?.data.queryCollections[0].floor_data) {
          if (getFloorData?.data.queryCollections[0].floor_data[key] !== 'FloorData'){
            let listings = JSON.parse(getFloorData?.data.queryCollections[0].floor_data[key]);
            if(listings && listings !== null && listings !== undefined && listings?.length > 0) {
              total_listings += listings?.length;
              // Assuming each listing has a floor price attribute, you can calculate total floor price
              if(key === 'shufl' || key === 'algoxnft') {
                total_floor_price = parseFloat((listings.sort((a: any, b: any) => a.price - b.price)[0]?.price / 1000000).toFixed(0));
              } else if(key === 'exa') {
                total_floor_price = parseFloat((listings.sort((a: any, b: any) => a?.priceAsset?.quantity - b?.priceAsset?.quantity)[0]?.priceAsset?.quantity / 1000000).toFixed(0));
              } else if(key === 'rand' || key === 'algogems')  {
                total_floor_price = listings.sort((a: any, b: any) => a.price - b.price)[0]?.price;
              }
              if (total_floor_price <= lowest_price) {
                lowest_price = total_floor_price;
              }
              marketplacecount+=1
            }
          }
        }
        setTotalListings(total_listings)
        setAvgFloorPrice(lowest_price)
        setIsLoadingFloorData(false);

      } catch (error) {
          console.error("Error fetching getFloorDataByCollectionId:", error);
          setIsLoadingFloorData(true);
      }

      try {
          
        const response = await fetch('/api/getActivityByCollectionId', {
          method: 'POST',
          body: JSON.stringify({collection_id: collection.algoxnft_id})
        })
        const getActivityData = await response.json()
        setActivityData(getActivityData?.marketplaces?.activity)
        setIsLoadingActivityData(false);

      } catch (error) {
          console.error("Error fetching getFloorDataByCollectionId:", error);
          setIsLoadingActivityData(true);
      }
  }

  if(collection.collection_id !== '')
    setIsLoadingFloorData(true);
    setIsLoadingActivityData(true);
    handleGetFloorData()

}, [collection.collection_id]) 

  /* React.useEffect(()=>{ 
        
        const handleGetCreatorAssets = async () => {
          if (!collection.creator) return; // If creator is not defined, return
          
          let creators = [];
          try {
              // Parse creator string to array if it's JSON
              creators = Array.isArray(JSON.parse(collection.creator)) ? JSON.parse(collection.creator) : [collection.creator];
          } catch (error) {
              creators = [collection.creator]
          }
      
          // Fetch assets for each creator
          const fetchAssetsPromises = creators.map(async (creator) => {
              try {
                  const creatorData = await getAssetsByCreator(creator);
                  return creatorData ? creatorData.assets : [];
              } catch (error) {
                  return [];
              }
          });
      
          try {
              // Wait for all asset fetching promises to resolve
              const assetsByCreator = await Promise.all(fetchAssetsPromises);
              
              // Concatenate all assets
              const allAssets = assetsByCreator.reduce((accumulator, currentAssets) => {
                  return accumulator.concat(currentAssets);
              }, []);
              // Update state with all assets
              setCreatorFullData({
                  state: "loaded",
                  assets: allAssets
              });
              const newAssets = allAssets ? allAssets.slice(0, PAGE_SIZE) : []; // Ensure creatorData.assets is an array before slicing
              setCreatorData(newAssets)
          } catch (error) {
              console.error("Error fetching assets for creators:", error);
          }
      }
  
      if(collection.creator !== '')
        handleGetCreatorAssets()

  }, [collection.creator])  */

  const fetchNextPage = async () => {
    // Calculate next page
    page = (page === 0) ? 2 : page + 1;
  
    // Define filter function based on searchFilter type
    let filterFunction;
    if (searchFilter !== "") {
      filterFunction = searchFilter.match(/^[0-9]+$/) !== null ?
        (a) => a.index == searchFilter :
        (a) => a.params.name.toLowerCase().includes(searchFilter.toLowerCase());
    } else {
      filterFunction = () => true; // No filter applied
    }
  
    // Apply filter and slice the assets
    const filteredAssets = creatorFullData?.assets
      ? creatorFullData.assets.filter(filterFunction).slice(0, page * PAGE_SIZE)
      : [];
  
    // Update state with filtered assets
    setCreatorData(filteredAssets);
  
    // Determine if there are more pages
    const hasNext = PAGE_SIZE > filteredAssets.length;
    setHasNextPage(!hasNext);
  
    // Update page state
    setPage(page);
  }

  const [loaded, setLoaded] = React.useState(false)
  const [filtersChanged, setFiltersChanged] = React.useState(true)
  const [searchFilter, setSearchFilter] = React.useState("")
  function updateSearchFilter(val){ setSearchFilter(val.target.value) }

  function filterCollection() { 
    if(searchFilter !== "") {
      if(searchFilter.match(/^[0-9]+$/) != null) {
          // If searchFilter is numeric only
          const newAssets = creatorFullData?.assets ? creatorFullData?.assets?.filter(a => a.index == searchFilter).slice(0, PAGE_SIZE) : [];
          setCreatorData(newAssets)
      } else {
          const newAssets = creatorFullData?.assets ? creatorFullData?.assets?.filter(a => a.params.name.toLowerCase().includes(searchFilter.toLowerCase())).slice(0, PAGE_SIZE) : []; 
          setCreatorData(newAssets)
      }
    } else {
      setCreatorData(creatorFullData?.assets.slice(0, PAGE_SIZE))
    }
    setLoaded(false)
    setFiltersChanged(true)
  } 

  return (
    <>
    <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>ASAs.lol - Collection Details</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <Navigation />
    <Box w="100%" h="100%">
        <Heading textAlign='center' mt={2} pt={2} fontSize='20px'>
            {collection.collection_name}
        </Heading>
        <Container pb={0} pt={0} pl={0} pr={0} centerContent>
          <Box p={5}>
              <Center>
                    <Image boxSize='250px' objectFit='cover' borderRadius='lg' alt='Flipping Algos Explorer' src={imageSrc} onError={handleOnError} />
              </Center>
              <Container centerContent pt={2} pb={0}>
                <Flex>
                    {collection.isverifiedalgoxnft ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on ALGOxNFT'} aria-label='Tooltip'>
                                <Link href={'https://algoxnft.com/collection/'+collection.algoxnft_id}isExternal pl={1}><Icon color={'#f41b8e'} fontSize='xs' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {collection.isverifiedrand ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on Rand Gallery'} aria-label='Tooltip'>
                                <Link href={'https://www.randgallery.com/collection/'+collection.collection_id}isExternal pl={1}><Icon color={'#6479BF'} fontSize='xs' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {collection.isverifiedalgogems ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on AlgoGems'} aria-label='Tooltip'>
                              <Link href={'https://algogems.io/'} isExternal pl={1}><Icon color={'#44a5e4'} fontSize='xs' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {collection.isverifiedshufl ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on Shufl'} aria-label='Tooltip'>
                                <Link href={'https://shufl.app/collections/'+collection.shufl_id} isExternal pl={1}><Icon color={'#f114fc'} fontSize='xs' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {collection.isverifiedalgoseas ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on AlgoSeas'} aria-label='Tooltip'>
                                <Link href={'https://algoseas.io/marketplace/collection/'+collection.collection_name} isExternal pl={1}><Icon color={'#889BC8'} fontSize='xs' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {collection.isverifieddart ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on Dartroom'} aria-label='Tooltip'>
                                <Link href={'https://dartroom.xyz/nfts/asa/'+collection.collection_id} isExternal pl={1}><Icon color={'#919191'} fontSize='xs' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    <Spacer pl={3} pr={3} />
                    <Box>
                        {collection.discord !== null && collection.discord !== '' ? (
                            <Tooltip hasArrow label={'Discord'} aria-label='Tooltip'>
                                <Link href={collection.discord} isExternal p={1}><Icon as={RiDiscordLine} /></Link>
                            </Tooltip>
                        ) :null}
                        {collection.twitter !== null ? (
                            <Tooltip hasArrow label={'Twitter'} aria-label='Tooltip'>
                                <Link href={(collection.twitter.slice(0,1) == "@")? 'https://twitter.com/' + collection.twitter : collection.twitter} isExternal p={1}><Icon as={FaTwitter} /></Link>
                            </Tooltip>
                        ) : null}
                        {collection.website !== null ? (
                            <Tooltip hasArrow label={'Website'} aria-label='Tooltip'>
                                <Link href={collection.website} isExternal pl={1} pt={1} pb={1} pr={0}><Icon as={BiGlobe} /></Link>
                            </Tooltip>
                        ) :null}
                    </Box>
                </Flex>
            </Container>
              <Box w={'100%'} p={2} pb={1}> 
                  {collection.collection_description}
              </Box>
              {hasCopied ? 
                <Box position="absolute" p={2} bg={'gray.400'} borderWidth='1px' borderTopLeftRadius='lg' borderBottomRightRadius='lg'>
                  <Center><Text pl={2} fontSize='xs' color={'white'}>Copied</Text>
                  </Center>
                </Box>
               : null}
              {collection?.creator !== null ? 
              <Box w={'100%'} p={2}> 
                  <Center>
                    <Box ml={2}>
                      {(() => {
                        try {
                          const parsedCreator = JSON.parse(collection.creator);
                          return Array.isArray(parsedCreator) ? (
                            <>
                              {parsedCreator.map((creator, index) => (
                                <Tooltip key={index} hasArrow label={'Creator Wallet'} aria-label='Tooltip'><Button ml={1}>
                                  {creator.substring(0, 5) + '...' + creator.slice(-4)}
                                </Button></Tooltip>
                              ))}
                            </>
                          ) : (
                            <Tooltip hasArrow label={'Creator Wallet'} aria-label='Tooltip'>{parsedCreator.substring(0, 5) + '...' + parsedCreator.slice(-4)}</Tooltip>
                          );
                        } catch (error) {
                          // Handle the case when collection.creator is not JSON
                          return <Tooltip hasArrow label={'Creator Wallet'} aria-label='Tooltip'><Button onClick={onCopy} ml={2}>{collection.creator.substring(0, 5) + '...' + collection.creator.slice(-4)}</Button></Tooltip>;
                        }
                      })()}
                    </Box>
                  </Center>
              </Box>
               : null}
             <Box w={'100%'} mt='1' mb='2'>
             <StatGroup>
                <Stat bg={'gray.900'} color={'white'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontSize='10px' color={'#ffcc00'}>Total Items</StatLabel>
                    <Text fontSize='lg' color={'white'}>{creatorFullData?.assets?.length}</Text>
                </Stat>
               {/*  <Stat bg={'gray.900'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontSize='10px' color={'#ffcc00'}>Highest Sale</StatLabel>
                    <Text fontSize='lg' color={'white'}>{collection?.floor_price?.highestSale}</Text>
                </Stat> */}
               {/*  <Stat bg={'gray.900'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontSize='10px' color={'#ffcc00'}>Volume</StatLabel>
                    <Text fontSize='lg' color={'white'}>0</Text>
                </Stat> */}
                <Stat bg={'gray.900'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <StatLabel fontSize='10px' color={'#ffcc00'}>Floor Price</StatLabel>
                    <HStack>
                    <Text fontSize='lg' color={'white'}>{avgFloorPrice > 0 ? avgFloorPrice.toFixed(0) : '--'}</Text>
                    <Text fontSize='10px' color={'gray.300'}>ALGO</Text>
                    </HStack>
                </Stat>
                <Stat bg={'gray.900'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                <Tooltip hasArrow label={'NFTs Listed across all marketplaces'} aria-label='Tooltip'><StatLabel fontSize='10px' color={'#ffcc00'}>Listings</StatLabel></Tooltip>
                    <Text fontSize='lg' color={'white'}>{avgFloorPrice > 0 ? totalListings : '--'}</Text>
                </Stat>
                <Stat bg={'gray.900'} borderRadius='md' m={1} p={{ base: '1', md: '2'}}>
                    <Tooltip hasArrow label={'NFTs that sold in the last 24-48 hours'} aria-label='Tooltip'><StatLabel fontSize='10px' color={'#ffcc00'}>Recently Sold</StatLabel></Tooltip>
                    <Text fontSize='lg' color={'white'}>{activityData?.length > 0 ? activityData?.length : '--'}</Text>
                </Stat>
                
             </StatGroup>
            </Box>
           {/*  {isLoadingFloorData ? (
              <Center>
                <VStack>
                  <Text fontFamily="Share" fontSize='xl'>Fetching Marketplace Data...</Text>
                  <Loader fontSize='40px' />
                </VStack>
              </Center>
            ) : (
              <NFTMarketplaceListings currency={currency} connected={connected} defaultWallet={defaultWallet} sessionWallet={sessionWallet} isOptIntoAsset={isOptIntoAsset} setOptIntoAsset={setOptIntoAsset} flippingalgos={JSON.parse(floorData.flippingalgos)} algoxnft={JSON.parse(floorData.algoxnft)} shufl={JSON.parse(floorData.shufl)} rand={JSON.parse(floorData.rand)} exa={JSON.parse(floorData.exa)} algogems={JSON.parse(floorData.algogems)} />
            )} */}
            </Box>
        </Container>
        {/* <Box mt={0} p={0}>
          <Box pt={2} pl={6} pr={6}pb={6}>
            <HStack>
                <Input size='md' defaultValue='' placeholder='Search By Asset ID or Collection' width={260} onKeyPress={e=> { if (e.key === 'Enter') { filterCollection() } }} onChange={updateSearchFilter} />
                <Button colorScheme='blue' onClick={filterCollection}>Search</Button>
            </HStack>
          </Box>
          {creatorData?.length === 0 ? 
            <Box pt={2} pl={6} pr={6}pb={6}><Center><Text>No Results Found</Text></Center></Box>
          : null}
          <InfiniteScroll
              dataLength={creatorData?.length || 0}
              next={fetchNextPage}
              hasMore={(creatorData?.length >= PAGE_SIZE)? hasNextPage: false}
              loader={(isLargerThan2560 && creatorData?.length === PAGE_SIZE)? (<Center><Text>Looks like your on a larger screen. Pull down to load more</Text></Center>) : (<Center><Box w='40%' p={2}><Progress size='sm' isIndeterminate /></Box></Center>) }
              // below props only if you need pull down functionality
              refreshFunction={fetchNextPage}
              pullDownToRefresh={(isLargerThan2560 && creatorData?.length === PAGE_SIZE)? true: false}
              pullDownToRefreshThreshold={50}
              pullDownToRefreshContent={
                <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
              }
              releaseToRefreshContent={
                <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
              }
            >
            <Grid
                templateRows="repeat(1, 1fr)"
                templateColumns="repeat(4, 1fr)"
                gap={4}
                px={{ base: 0, md: 4}}
                mt={{ base: 0, md: 1}}
              > 
                {creatorData?.map((asset, index) => (
                    <GridItem colSpan={colSpan} key={`${asset.index}-${index}`}>
                        <NFTCard key={asset?.index} 
                          asset={asset}  
                          defaultWallet={defaultWallet}
                          wallet={sessionWallet} />
                    </GridItem>
                ))}
            </Grid>
          </InfiniteScroll>
        </Box> */}
      </Box>
      <Footer />
    </>
  )
}
