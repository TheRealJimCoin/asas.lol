import React from "react"
import { Box, Icon, Center, Flex, Grid, Slider, SliderMark, SliderThumb, SliderTrack, SliderFilledTrack, Text, Spinner, VisuallyHidden, Checkbox, useColorModeValue, Skeleton, HStack, VStack, FormErrorMessage, Link, Tooltip, Image, FormLabel, FormControl, Input, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AUCTION } from '../../lib/auction'
import { GoVerified } from 'react-icons/go'

interface IRegistration {
    assetName: string;
    unitName: string;
    description: string;
    quantity: number;
    decimals?: number; // Defaults to 0 since NFTs should be non-fungible
    note?: string; // Optional note for the transaction
}

interface IFormProps {
  onRegistered: (data: IRegistration) => void;
  walletAssets: any;
  loading: any;
  tokenList: any;
  currency: any;
}

export default function Form({ onRegistered, tokenList, currency, walletAssets, loading }: IFormProps) {
  const {
    handleSubmit, // handels the form submit event
    register, // ties the inputs to react-form
    setValue,
    formState: { errors, isSubmitting }, // gets errors and "loading" state
  } = useForm()
  const [assetCreator, setAssetCreator] = useState('')
  const [assetName, setAssetName] = useState('')
  const [unitName, setUnitName] = useState('')
  const [ipfs, setIPFS] = useState('')
  const [reserveAddress, setReserveAddress] = useState('')
  const [assetImage, setAssetImage] = useState('')
  const [assetMimeType, setAssetMimeType] = useState('')
  const createButtonColor = useColorModeValue('blue', 'blue')

 


  return (
    <>
    <Center>
    {!loading ? (
          <>
          <Box mt='2'>
            <Center>
              <VStack><Text fontSize='xl'>Loading Wallet Information...</Text><Spinner size='xl'/></VStack>
            </Center>
          </Box>
          </>
        ) : (
          <>
          <form onSubmit={handleSubmit(onRegistered)} noValidate>
            {/* noValidate will stop the browser validation, so we can write our own designs and logic */}
            <Flex>
             <Box p={2}>
                <FormControl isRequired isInvalid={errors.assetName}>
                    <FormLabel fontSize='xs' htmlFor="assetName">
                    Asset Name
                    </FormLabel>
                    <Input
                    id="assetName"
                    size="sm"
                    {...assetName}
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    placeholder="Coolest NFT"
                    />
                    <FormErrorMessage>{errors.assetName && errors.assetName.message}</FormErrorMessage>
                </FormControl>
            </Box>
            <Box p={2}>
                   <FormControl isRequired isInvalid={errors.unitName}>
                        <FormLabel fontSize='xs' htmlFor="unitName">
                        Unit Name
                        </FormLabel>
                        <Input
                        id="unitName"
                        size="sm"
                        {...unitName}
                        placeholder="cool-1"
                        {...register("unitName", {
                            required: "Please enter the Unit Name for the NFT?",
                            })
                        }
                        ></Input>
                        <FormErrorMessage>{errors.unitName && errors.unitName.message}</FormErrorMessage>
                    </FormControl>
                  
                </Box>
            </Flex>
            <Center>
            <Button mt={10} colorScheme={createButtonColor} isLoading={isSubmitting} type="submit">
                Mint NFT
            </Button>
            </Center>
            </form>
          </>
        )}
    </Center>
  </>
  );
}