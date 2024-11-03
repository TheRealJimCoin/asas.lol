import React, { useState } from "react"
import {
  Input,
  Box,
  Text,
  Flex,
  Image,
  Button,
  HStack,
  VStack,
  Spacer,
  Center,
  Popover,
  Progress,
  PopoverTrigger,
  PopoverContent,
  InputGroup,
  useMediaQuery,
  useColorModeValue
} from "@chakra-ui/react"
import InfiniteScroll from 'react-infinite-scroll-component'
import { FaSearch } from "react-icons/fa"
import NextLink from 'next/link'
import Router, { useRouter } from "next/router" 

const COLLECTION_PAGE_SIZE=6;

function CollectionsDropdown() {
  const router = useRouter()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const scrollBarColor = useColorModeValue('rgba(0, 0, 0, 0.15)', 'rgba(255, 255, 255, 0.15)')
  const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
  const [ isLargerThan2560 ] = useMediaQuery("(min-width: 2560px)")
  const [searchFilter, setSearchFilter] = React.useState("")
  const [loading, setLoading] = React.useState(true)
  const [loadedSearch, setLoadedSearch] = React.useState(false)
  const [filtersChanged, setFiltersChanged] = React.useState(true)
  const [collectionList, setCollectionList] = React.useState([])
  const [hasTokenNextPage, setHasTokenNextPage] = React.useState<boolean>(true)
  const [hasCollectionNextPage, setHasCollectionNextPage] = React.useState<boolean>(true)
  let [collectionToken, setCollectionPage] = useState<number>(0)
  
  const fetchCollectionsNextPage = async () => {
    let nextpage = collectionToken + 1
    let offset = (nextpage===1)? 0 : COLLECTION_PAGE_SIZE * (collectionToken)

    const collectionsResponse = await fetch('/api/getCollections', {
        method: 'POST',
        body: JSON.stringify({first: COLLECTION_PAGE_SIZE, offset: offset, search: searchFilter})
    })
    const collectionsData = await collectionsResponse.json()
    collectionToken = collectionToken == 0 ? 1 : collectionToken + 1

    if(COLLECTION_PAGE_SIZE > collectionsData?.data?.queryCollections.length){
      setHasCollectionNextPage(false)
    }
    setCollectionPage(collectionToken)
    setCollectionList([...collectionList, ...collectionsData?.data?.queryCollections])
  }
  
  const handleFetchCollections = async (sortOrder: string = '', searchFilter: string = '') => {
    setLoading(false);
    setCollectionPage(1);
    setHasCollectionNextPage(true);
    const collectionsResponse = await fetch("/api/getCollections", {
      method: "POST",
      body: JSON.stringify({ first: COLLECTION_PAGE_SIZE, offset: 0, search: searchFilter }),
    });
    const collectionsData = await collectionsResponse.json();
    setCollectionList(collectionsData?.data?.queryCollections);
    setLoading(true);
  };

  React.useEffect(()=> {
    handleFetchCollections()
  },[])

  function updateSearchFilter(val){ setSearchFilter(capitalizeFirstLetter(val.target.value)) }

  function selectOption(value) {
    //onChange(value)
    router.push("/collection/"+value?.collection_id);
    setPopoverOpen(false)
  }
  function capitalizeFirstLetter(string) {
    if (string.length === 0) {
        return string; // Return the empty string if input is empty
    }
    return string[0].toUpperCase() + string.substring(1);
  }

  function filterCollection() { 
    if(searchFilter === "") {
      router.push("/collections/") 
    } else {
      if(searchFilter.match(/^[0-9]+$/) != null) {
          // If searchFilter is numeric only
          router.push("/asset/"+searchFilter);
      } else {
          router.push("/collections/"+searchFilter);
      }
    }
    setLoadedSearch(false)
    setFiltersChanged(true)
  } 

  React.useEffect(() => {
    if (searchFilter.length >= 1) {
      handleFetchCollections("", searchFilter);
    } else {
      // Reset collection list when search filter is empty
      setCollectionList([]);
    }
  }, [searchFilter]);

  return (
    <HStack width={"100%"}>
    <Box w={"full"} p={0}>
      <Popover isOpen={popoverOpen} autoFocus={false} matchWidth>
        <PopoverTrigger>
          <InputGroup>
            <Input
              type={"text"}
              minW={175}
              onKeyPress={e=> { if (e.key === 'Enter') { filterCollection() } }} 
              placeholder='Search By Asset ID or Collection'
              autoComplete="off"
              onClick={() => {popoverOpen ? (setPopoverOpen(false)) : (setPopoverOpen(true))}}
              onChange={updateSearchFilter}
              color={"white"}
            />
          </InputGroup>
        </PopoverTrigger>
        <PopoverContent w={"100%"}>
          <Box py={1} px={1} id="scrollableCollectionDiv" overflowY="auto" maxHeight="200px" sx={{
                '&::-webkit-scrollbar': {
                width: '11px',
                borderRadius: '8px',
                backgroundColor: scrollBarColor,
                },
                '&::-webkit-scrollbar-thumb': {
                backgroundColor: scrollBarColor,
                },
          }}>
              <InfiniteScroll
                dataLength={collectionList?.length}
                next={fetchCollectionsNextPage}
                initialScrollY={0}
                hasMore={(collectionList?.length >= 6)? hasCollectionNextPage: false}
                loader={(isLargerThan2560 && collectionList?.length === 6)? (<Center><Text>Looks like your on a larger screen. Pull down to load more</Text></Center>) : (<Center><Box w='40%' p={2}><Progress size='sm' isIndeterminate /></Box></Center>) }
                scrollableTarget="scrollableCollectionDiv"
                // below props only if you need pull down functionality
                refreshFunction={fetchCollectionsNextPage}
                pullDownToRefresh={(isLargerThan2560 && collectionList?.length === 6)? true: false}
                pullDownToRefreshThreshold={50}
                pullDownToRefreshContent={
                  <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                }
                releaseToRefreshContent={
                  <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                }
              >
            {collectionList?.map((value, i) => (
              <Flex
                key={i}
                _hover={{ bgColor: "gray.50", textColor: "black", cursor: "pointer" }}
                my={1}
                borderRadius={"md"}
                bgColor={"#f1f1f1"}
                textColor={"black"}
                onClick={() => selectOption({collection_id:value.collection_id, collection_name:value.collection_name})}
                pl={2}
                pr={2}>
                <Box p='1'>
                  <HStack>
                  <Image boxSize='25px' objectFit='cover' borderRadius='lg' alt={value.collection_name} src={value && value?.collection_preview != null ? value.collection_preview : '/placeholder.png'} />
                  <Text
                    fontStyle={"revert"}
                    fontWeight={"hairline"}
                    _hover={{ fontWeight: "normal" }}
                  >
                    {value.unitname}
                  </Text>
                  </HStack>
                </Box>
                <Spacer />
                <Box p='0'>
                  <VStack alignItems={'end'}>
                    <Text fontSize='10px' color={'gray.300'}>Collection</Text> 
                    <Text fontSize='xs' mt={0}>{value.collection_name}</Text> 
                  </VStack>
                </Box>
              </Flex>
            ))}
            {collectionList?.length == 0 ? (
                <HStack p={1}><Text fontSize='xs'>No Results Found.</Text><NextLink href="/collections" as="/collections"><a><Text fontSize='xs'>Try Browsing Collections</Text></a></NextLink></HStack>
            ) : null} 
            </InfiniteScroll>
          </Box>
        </PopoverContent>
      </Popover>
    </Box>
    <Button p={0} colorScheme='blue' onClick={filterCollection}><FaSearch /></Button>
    </HStack>
  );
}

export default CollectionsDropdown;
