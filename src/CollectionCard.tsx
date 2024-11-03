/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, 
    Icon, 
    Container, 
    Tooltip, 
    Text, 
    Link, 
    Image, 
    Button, 
    Spacer, 
    Flex, 
    HStack, 
    keyframes, 
    Collapse, 
    VStack, 
    Center, 
    useDisclosure, 
    NumberInput, 
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper, 
    useMediaQuery,
    useColorModeValue } from '@chakra-ui/react'
import { NFT } from '../lib/nft'
import { Wallet } from '../lib/algorand-session-wallet'
import { useEffect, useState } from "react"
import { GoVerified } from 'react-icons/go'
import { BiGlobe } from 'react-icons/bi'
import { FaTwitter } from 'react-icons/fa'
import { RiDiscordLine } from 'react-icons/ri'
import NextLink from 'next/link'
import { motion, transform } from 'framer-motion'
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'

type CollectionCardProps = {
    defaultWallet: string;
    collection: any;
    wallet: Wallet;
};

export function CollectionCard(props: CollectionCardProps) {
    //console.log("CollectionCard",props)
    const { wallet, defaultWallet, collection } = props;
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)")
    const boxBgColor = useColorModeValue('#2d3748', '#d3de04')
    const priorityColor = useColorModeValue('yellow.400', 'blue.400')
    const animationKeyframes = keyframes`
    0% { transform: rotateY(0deg)}
    25% { transform: rotateY(10deg)}
    50% { transform: rotateY(0deg)}
    75% { transform: rotateY(10deg)}
    100% { transform: rotateY(0deg)}
    `
    const animation = `${animationKeyframes} 10s ease-in-out infinite`
    const { isOpen, onToggle } = useDisclosure()
    const [imageSrc, setImageSrc] = useState(collection && collection.collection_preview !== null ? NFT.resolveStandardUrl(collection.collection_preview) : '/placeholder.png');

    const handleOnError = () => {
        setImageSrc('/placeholder_502.png'); // Set fallback image when error occurs
    };

    return (
        <Box maxWidth={'400px'} as={(collection.priority === 333)? motion.div : null} animation={(collection.priority === 333)? animation : null} borderColor={(collection.priority === 333)? priorityColor : null}  _hover={{borderColor: boxBgColor}} bg={(collection.iscomplete)? useColorModeValue('gray.500', 'black') : useColorModeValue('#dcdde1', '#3f4550')} margin={2} borderWidth='2px' borderRadius='lg'>
            <Container pb={0} pt={2} pl={2} pr={2}>
                {collection.priority === 333 ? (
                    <Box position="absolute" p={2} bg={priorityColor} borderWidth='1px' borderTopLeftRadius='lg' borderBottomRightRadius='lg'>
                        <HStack>
                            <Text fontSize='xs'>Featured</Text>
                        </HStack>
                    </Box>
                ) : null } 
                <Center>
                {collection.mimetype === 'video/mp4' || collection.mimetype === 'video/3gpp' || collection.mimetype === 'video/quicktime' ? (
                    <>
                    <video className={'reactvidplayer'} autoPlay={false} src={collection && collection.collection_preview != null ? NFT.resolveStandardUrl(collection.collection_preview) : '/placeholder.png'} controls>
                        <source src={collection && collection.collection_preview != null ? NFT.resolveStandardUrl(collection.collection_preview) : '/placeholder.png'} type={collection.mimetype} />
                    </video>
                    </>
                ) : (
                    <>
                    <NextLink href={'/collection/'+collection.collection_id} passHref>
                        <a>
                        <Image boxSize='270px' objectFit='cover' borderRadius='lg' alt='Flipping Algos Explorer' src={imageSrc} onError={handleOnError} />
                        </a>
                    </NextLink>
                    </>
                )}
                </Center>
                {collection.lastsaleprice && collection.lastsaleprice !== "0" && collection.lastsaleprice !== null? (
                <Center>
                    <Box position="absolute" mt={-5} p={1} bg={priorityColor} borderWidth='1px' borderRadius='lg'>
                        <Text fontSize='xs' fontWeight='bold'>{collection.lastsaleprice}</Text>
                    </Box>
                </Center>
                ) : null }
                {collection.dex_price && collection.dex_price !== "0" && collection.dex_price !== null? (
                <Center>
                    <Box position="absolute" mt={-5} p={1} bg={priorityColor} borderWidth='1px' borderRadius='lg'>
                        <Text fontSize='xs' fontWeight='bold'>{collection.dex_price}</Text>
                    </Box>
                </Center>
                ) : null }
            </Container>
            <Container p={2}>
                <Flex>
                    <Box>
                        <NextLink href={'/collection/'+collection.collection_id} passHref>
                            <a className={'collection-name-link'}>
                            {collection.collection_name?.length > 28 ? (
                                <Tooltip hasArrow label={collection.collection_name} aria-label='Tooltip'>
                                    <Text fontSize='xs'>{collection.collection_name.substr(0, 28) + '...'}</Text>
                                </Tooltip>
                             ) : (
                                <Text fontSize='xs'>{collection.collection_name}</Text>
                             )}
                            </a>
                        </NextLink>
                    </Box>
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
                                <Link href={'https://shufl.app/collections/'+collection.shufl_id}isExternal pl={1}><Icon color={'#f114fc'} fontSize='xs' as={GoVerified} /></Link>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {collection.isverifiedalgoseas ? (
                        <Box p={0}>
                            <Tooltip hasArrow label={'Verified Project on AlgoSeas'} aria-label='Tooltip'>
                                <Link href={'https://algoseas.io/marketplace/collection/'+collection.collection_name}isExternal pl={1}><Icon color={'#889BC8'} fontSize='xs' as={GoVerified} /></Link>
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
                    <Spacer />
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
        </Box> 
    )
}