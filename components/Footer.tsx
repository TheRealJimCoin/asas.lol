import NextLink from 'next/link'
import * as React from 'react'
import {
    Center,
    Text,
    Link,
    HStack,
  } from '@chakra-ui/react';

  export default function Footer() {
    return (
      <Center p={2}>
        <HStack>
        <Link href={'https://api.flippingalgos.xyz/'}>
            <Text fontSize={'9px'}>API</Text>
        </Link>
        <Text fontSize={'9px'}>/</Text>
        <Link href={'https://raffles.flippingalgos.xyz/'}>
            <Text fontSize={'9px'}>Raffles</Text>
        </Link>
        <Text fontSize={'9px'}>/</Text>
        <Link href={'https://staking.flippingalgos.xyz/'}>
            <Text fontSize={'9px'}>Staking</Text>
        </Link>
        <Text fontSize={'9px'}>/</Text>
        <Link href={'mailto:'}>
            <Text fontSize={'9px'}>Contact</Text>
        </Link>
        <Text fontSize={'9px'}>/</Text>
        <Link href={'/'}>
            <Text fontSize={'9px'}>Privacy Policy</Text>
        </Link>
        <Text fontSize={'9px'}>/</Text>
        <Link href={'/'}>
            <Text fontSize={'9px'}>Terms of Service</Text>
        </Link>
        </HStack>
      </Center>
    )
}
