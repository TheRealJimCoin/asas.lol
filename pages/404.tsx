/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import Head from 'next/head'
import {
    Box,
    Button,
    Center,
    Heading,
    Container,
    Text,
    VStack,
    Stack,
    HStack,
    Image,
    Flex,
    Skeleton,
    Spinner,
    useDisclosure,
    useMediaQuery,
    useColorModeValue,
    useBreakpointValue
  } from "@chakra-ui/react"
import Navigation from '../components/Navigation'
import favicon from "../public/favicon.ico"
import Link from 'next/link'
import Footer from '../components/Footer'

const Error404 = (props) => {
  //console.log("props1", props)
  const bgColorMode = useColorModeValue('blue.500', 'blue.400')
  const colorHeaderText = useColorModeValue('#2AD3FF', '#2AD3FF')
  
  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>404 - ASAs.lol</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
            <Center h="100%">
            <VStack spacing={20}>
                <Heading pt={10} color={colorHeaderText} size="xl">Not what you came for?</Heading>
                <Box as='button' color={'black'} bg={bgColorMode} borderWidth='1px' borderRadius='lg' m={1} pt={1} pb={1} pl={3} pr={3}>
                        <Link href={'/'} passHref><Text fontSize='md'>Home Page</Text></Link>
                </Box>
            </VStack>
            </Center>
      </Box>
      <Footer />
    </>
  )
}

export default Error404