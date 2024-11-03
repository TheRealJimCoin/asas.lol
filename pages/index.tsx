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
import { FeaturedCollections } from '../src/FeaturedCollections'
import { FeaturedNfts } from '../src/FeaturedNfts'
import { useNavigation } from "../src/contexts/navigation.context"
import favicon from "../public/favicon.ico"
import Loader from '../components/Loader'
import Footer from '../components/Footer'
import NextLink from 'next/link'


export default function HomePage(props) {
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
  const colSpan = useBreakpointValue({ base: 2, md: 1})
  const { currency, defaultWallet, sessionWallet, connected } = useNavigation()
  const bgColorMode = useColorModeValue('gray.400', 'gray.200')
  const [featuredCollections, setFeaturedCollections] = React.useState({ data: undefined})
  const [recentListings, setRecentListings] = React.useState({ data: undefined})
  const [recentAuctions, setRecentAuctions] = React.useState({ data: undefined})
  const [loading, setLoading] = React.useState(false)
  React.useEffect(() => {
  
        const fetchFeaturedCollections = async () => {
          try {
              const response = await fetch("/api/getFeaturedCollections");
              const data = await response.json();
              setFeaturedCollections(data);
          } catch (error) {
              console.error("Error fetching data:", error);
          }
      };
      const fetchRecentAuctions = async () => {
          try {
              const response = await fetch("/api/getRecentAuctions");
              const data = await response.json();
              setRecentAuctions(data);
          } catch (error) {
              console.error("Error fetching data:", error);
          }
      };
      const fetchRecentListings = async () => {
          try {
              const response = await fetch("/api/getRecentListings");
              const data = await response.json();
              setRecentListings(data);
          } catch (error) {
              console.error("Error fetching data:", error);
          }
      };
      fetchFeaturedCollections()
      fetchRecentAuctions()
      fetchRecentListings()
      setLoading(true)

  }, [])

  return (
    <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>NFT Marketplace solely using ASAs on Algorand</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        <Flex mb={0} direction={['column', 'row']}>
          <Box flex='3' p={2}>
            <Center mt={8}>
              <Text>asas.lol a NFT Marketplace solely using ASAs on Algorand</Text>
            </Center>
          </Box>
        </Flex>
        {!loading ? (
          <Box mt='2'>
            <Center>
              <VStack>
                <Text fontFamily="Share" fontSize='xl'>Loading...</Text>
                <Loader fontSize='80px' />
              </VStack>
            </Center>
          </Box>
        ) : (
          <Box pl={{ base: 0, md: 2}} pr={{ base: 0, md: 2}}>
              <FeaturedNfts label={'Recent Listings'} currency={currency} FeaturedNfts={recentListings?.data?.queryASAsListings} defaultWallet={defaultWallet} wallet={sessionWallet} />
              <FeaturedNfts label={'Recent Auctions'} currency={currency} FeaturedNfts={recentAuctions?.data?.queryASAsAuctions} defaultWallet={defaultWallet} wallet={sessionWallet} />
              <FeaturedCollections label={'Featured Collections'} featuredCollections={featuredCollections?.data?.queryCollections} defaultWallet={defaultWallet} wallet={sessionWallet} />
          </Box>
        )}
    </Box>
    <Footer />
    </>
  )
}
