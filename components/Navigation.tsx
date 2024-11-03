import Link from 'next/link'
import * as React from 'react'
import {
    Box,
    Flex,
    Image,
    HStack,
    IconButton,
    Button,
    Center,
    Menu,
    MenuItem,
    MenuButton,
    MenuList,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    useMediaQuery,
    useColorMode,
    Text,
    Stack,
  } from '@chakra-ui/react';
  import { useEffect, useState } from "react"
  import { HamburgerIcon, CloseIcon, MoonIcon, SunIcon, InfoIcon } from '@chakra-ui/icons'
  import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
  import { RequestPopup } from '../src/RequestPopup'
  import { platform_settings as ps } from '../lib/platform-conf'
  import { useNavigation } from "../src/contexts/navigation.context"
  import TokenDropdown from "./TokenDropdown"
  import CollectionsDropdown from "./CollectionsDropdown"
  import Logo from "../src/img/logo.svg"

  //const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));
  export default function Navigation() {
      
  const { defaultWallet, sessionWallet, connected, tokenList, algoBalance, currency, setCurrency, updateWallet, hasTokenNextPage, fetchTokenNextPage, popupProps } = useNavigation()
  const [ isLargerThan768 ] = useMediaQuery("(min-width: 768px)")
  const { colorMode, toggleColorMode } = useColorMode();
  //@ts-ignore
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if (colorMode === "light") {
        toggleColorMode();
    }
  }, [colorMode,toggleColorMode]);
    return (
      <>
        <Box w={'100%'} bg={'#121212'} px={{ base: 1, md: 4}}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon color="#2AD3FF" /> : <HamburgerIcon color="#2AD3FF" />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={{ base: 4, md: 8}} alignItems={'center'}>
            <Box w={(isLargerThan768)? '85px' : '68px'}><Link href="/" as="/"><a><Logo className="logo"  alt="asas.lol" /></a></Link></Box>
            <HStack
              as={'nav'}
              spacing={4}
              width={'100%'}
              display={{ base: 'none', md: 'flex' }}>
              <Text color="#2AD3FF" fontSize='sm' fontWeight={'600'}><Link href="/" as="/">Home</Link></Text>
              <Text color="#2AD3FF" fontSize='sm' fontWeight={'600'}><Link href="/marketplace" as="/marketplace">Marketplace</Link></Text>
              <Text color="#2AD3FF" fontSize='sm' fontWeight={'600'}><Link href="/activity" as="/activity">Activity</Link></Text>
            </HStack>
          </HStack>
          <Center flex="1" maxW="375px" alignItems={'center'}>
              <CollectionsDropdown />
          </Center> 
          <Flex alignItems={'left'}>
            <Stack direction={'row'} spacing={{ base: 2, md: 7}}>
              <Box>
                {connected && tokenList.filter(t => t.ispayment == true) && isLargerThan768? (
                  <TokenDropdown hasTokenNextPage={hasTokenNextPage} fetchTokenNextPage={fetchTokenNextPage} text={(currency.unitname !== undefined)? currency.unitname : 'ALGO'} onChange={(value) => setCurrency(value)} options={tokenList.filter(t => t.ispayment ===true)} algoBalance={algoBalance} />
                ) : null}
              </Box>
             {/*  <Button p={1} onClick={toggleColorMode}>
                  {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button> */}
              {isLargerThan768 ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}>
                    {isLargerThan768 ? ( <Button color="#2AD3FF">{(connected)? 'Connected' : 'Connect'}</Button> ) : ( <InfoIcon boxSize={6}/> )}
                  </MenuButton>
                  <MenuList bg={'#555'}>
                    <AlgorandWalletConnector 
                          darkMode={true}
                          //@ts-ignore
                          sessionWallet={sessionWallet}
                          connected={connected} 
                          //@ts-ignore
                          updateWallet={updateWallet}
                          />
                    <MenuDivider />
                    <Link href={'/marketplace'} as={'/marketplace'} passHref><MenuItem fontFamily="'Inter Variable', sans-serif">Marketplace</MenuItem></Link>
                    {connected && (defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2 || defaultWallet === ps.application.admin_addr3) ? (<Link href={'/create-auction'} as={'/create-auction'} passHref><MenuItem fontFamily="'Inter Variable', sans-serif">Create Auctions</MenuItem></Link>) : null}
                    {connected && (defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2 || defaultWallet === ps.application.admin_addr3) ? (<Link href={'/create-listing'} as={'/create-listing'} passHref><MenuItem fontFamily="'Inter Variable', sans-serif">Create Listings</MenuItem></Link>) : null}
                    {connected && (defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2 || defaultWallet === ps.application.admin_addr3) ? (<Link href={'/mylistings'} as={'/mylistings'} passHref><MenuItem fontFamily="'Inter Variable', sans-serif">My Listings</MenuItem></Link>) : null}
                    {connected &&  (<Link href={'/mint'} as={'/mint'} passHref><MenuItem fontFamily="'Inter Variable', sans-serif">Mint an NFT</MenuItem></Link>) }
                    {connected ? (<Link href={'/myvaults'} as={'/myvaults'} passHref><MenuItem fontFamily="'Inter Variable', sans-serif">My Vaults</MenuItem></Link>) : null}
                   <Link href={'/activity'} as={'/activity'} passHref><MenuItem fontFamily="'Inter Variable', sans-serif">Activity</MenuItem></Link>
                  </MenuList>
                </Menu>
              ) : null}
            </Stack>
            </Flex>
        </Flex>
    
        {isOpen ? (
          <Box pl={1} pr={1} pb={2} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={{ base: 2, md: 4}}>
              <AlgorandWalletConnector 
                    darkMode={true}
                    //@ts-ignore
                    sessionWallet={sessionWallet}
                    connected={connected} 
                    //@ts-ignore
                    updateWallet={updateWallet}
                    />
              <Box>
                {connected && tokenList.filter(t => t.ispayment == true) && !isLargerThan768? (
                  <TokenDropdown hasTokenNextPage={hasTokenNextPage} fetchTokenNextPage={fetchTokenNextPage} text={(currency.unitname !== undefined)? currency.unitname : 'ALGO'} onChange={(value) => setCurrency(value)} options={tokenList.filter(t => t.ispayment ===true)} algoBalance={algoBalance} />
                ) : null}
              </Box>
              <Link href="/" as="/" passHref><Text color="#2AD3FF" fontSize='sm'>Home</Text></Link>
              <Link href={'/marketplace'} as={'/marketplace'} passHref><Text color="#2AD3FF" fontSize='sm'>Marketplace</Text></Link>
              <Link href={'/activity'} as={'/activity'} passHref><Text color="#2AD3FF" fontSize='sm'>Activity</Text></Link>
              {connected && (defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2 || defaultWallet === ps.application.admin_addr3) ? (<Link href="/create-auction" as="/create-auction" passHref><Text color="#2AD3FF" fontSize='sm'>Create Auction</Text></Link>) : null}
              {connected && (defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2 || defaultWallet === ps.application.admin_addr3) ? (<Link href="/create-listing" as="/create-listing" passHref><Text color="#2AD3FF" fontSize='sm'>Create Listing</Text></Link>) : null}
              {connected && (defaultWallet === ps.application.admin_addr || defaultWallet === ps.application.admin_addr2 || defaultWallet === ps.application.admin_addr3) ? (<Link href="/mylistings" as="/mylistings" passHref><Text color="#2AD3FF" fontSize='sm'>My Listings</Text></Link>) : null}
             </Stack>
          </Box>
        ) : null}
      </Box>
      {
        //@ts-ignore
      }
      <RequestPopup 
      //@ts-ignore 
      {...popupProps}/>
      </>
    )
}
