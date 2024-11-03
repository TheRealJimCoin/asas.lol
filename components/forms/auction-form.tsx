import React from "react"
import { Box, Icon, Center, Flex, Grid, Slider, SliderMark, SliderThumb, SliderTrack, SliderFilledTrack, Text, Spinner, VisuallyHidden, Checkbox, useColorModeValue, Skeleton, HStack, VStack, FormErrorMessage, Link, Tooltip, Image, FormLabel, FormControl, Input, Button } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { AUCTION } from '../../lib/auction'
import { GoVerified } from 'react-icons/go'

interface IRegistration {
  assetId: string;
  name: string;
  image: string;
  mimetype: string;
  lengthofauction: string;
  ticketcost: string;
  twitter: string;
  marketplace: string;
  website: string;
  creator: string;
  isverified: boolean;
  isverifiedalgoseas: boolean;
  isverifieddart: boolean;
  isverifiedrand: boolean;
  isverifiedalgogems: boolean;
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

  const [input, setInput] = useState('')
  const [assetName, setAssetName] = useState('')
  const [assetImage, setAssetImage] = useState('')
  const [assetCreator, setAssetCreator] = useState('')
  const [assetMimeType, setAssetMimeType] = useState('')
  const createButtonColor = useColorModeValue('blue', 'blue')
  const [assetSearchMessage, setAssetSearchMessage] = useState('')
  const [isAPIverification, setIsAPIverification] = React.useState(true)
  const [isVericationRunning, setIsVericationRunning] = React.useState(false)
  const [isDisallowedNFT, setIsDisallowedNFT] = React.useState(false)
  const [isValidALGOxNFT, setIsValidALGOxNFT] = React.useState(false)
  const [isValidAlgoseas, setIsValidAlgoseas] = React.useState(false)
  const [isValidDartroom, setIsValidDartroom] = React.useState(false)
  const [isValidRandGallery, setIsValidRandGallery] = React.useState(false)
  const [isValidAlgogems, setIsValidAlgogems] = React.useState(false)
  const [isValidFlippingAlgos, setIsValidFlippingAlgos] = React.useState(false)
  const [sliderValue, setSliderValue] = React.useState(1)
  const [showTooltip, setShowTooltip] = React.useState(false)
  const assetId = register('assetId', { required: true })
  const lengthofauction = register('lengthofauction', { required: true })

  const handleSliderChange = async (e) => {
    //console.log("handleSliderChange", e)
    setSliderValue(e)
    setValue('lengthofauction', e)
  }

  const handleInputChange = async (e) => {
    setInput(e.target.value)
    setAssetName('')
    setAssetImage('')
    setAssetCreator('')
    setAssetMimeType('')
    setIsValidFlippingAlgos(false)
    setIsValidALGOxNFT(false)
    setIsValidAlgoseas(false)
    setIsValidDartroom(false)
    setIsValidRandGallery(false)
    setIsValidAlgogems(false)
    setIsDisallowedNFT(false)
    setIsAPIverification(true)
    if(e.target.value.length >= 8 && !isNaN(Number(e.target.value))) {
        assetId.onChange(e); // method from hook form register
        const tokenMatch = (walletAssets !== undefined) ? walletAssets.find((r)=>{ return r.asset_id == e.target.value }) : undefined
        //console.log("tokenMatch", tokenMatch)
        if(tokenMatch !== undefined){
            setIsVericationRunning(true)
            const response = await fetch("https://api.flippingalgos.xyz/api/asa/"+tokenMatch.asset_id+"/verify")
            const tokenData = await response.json()
            if(tokenData?.success) {
                setIsVericationRunning(false)
                setAssetName(tokenData.name)
                setValue('name', tokenData.name)
                setAssetImage(tokenData.image)
                setValue('image', tokenData.image)
                setAssetCreator(tokenData.creator)
                setValue('creator', tokenData.creator)
                setIsValidALGOxNFT(tokenData.algoxnft)
                setValue('isverified', tokenData.algoxnft)
                setIsValidAlgoseas(tokenData.algoseas)
                setValue('isverifiedalgoseas', tokenData.algoseas)
                setIsValidDartroom(tokenData.dartroom)
                setValue('isverifieddart', tokenData.dartroom)
                setIsValidRandGallery(tokenData.randgallery)
                setValue('isverifiedrand', tokenData.randgallery)
                setIsValidAlgogems(tokenData.algogems)
                setValue('isverifiedalgogems', tokenData.algogems)
                setIsValidFlippingAlgos(tokenData.flippingalgos)
                if(tokenData.mimetype !== '') {
                    //console.log("mimetype ", tokenData.mimetype)
                    setAssetMimeType(tokenData.mimetype)
                }
                setIsAPIverification(false)
                if(!tokenData.algoxnft && !tokenData.algoseas && !tokenData.dartroom && !tokenData.randgallery && !tokenData.algogems && !tokenData.flippingalgos) {
                    setIsDisallowedNFT(true)
                    setIsAPIverification(true)
                    setAssetSearchMessage(e.target.value + " is not a verified collection on ALGOxNFT, Algoseas, Dartroom, RandGallery or Algogems")
                    const assetId = register('assetId', { required: "Sorry that Asset ID is not a verified collection on ALGOxNFT, Algoseas, Dartroom, RandGallery or Algogems" })
                    assetId.onChange(e); // method from hook form register
                }
            } else {
                setIsVericationRunning(false)
                setIsDisallowedNFT(true)
                setIsAPIverification(true)
                setAssetSearchMessage("we ran into a error verifying the asset id. refresh and try again")
                const assetId = register('assetId', { required: "Sorry that Asset ID is not successfully verified. Please try again" })
                assetId.onChange(e); // method from hook form register
            }
        } else {
            setIsVericationRunning(false)
            setIsDisallowedNFT(true)
            setIsAPIverification(true)
            setAssetSearchMessage("Asset ID " + e.target.value + " is not found in your wallet")
            const assetId = register('assetId', { required: "Sorry that Asset ID is not found in your wallet. Try refreshing" })
            assetId.onChange(e); // method from hook form register
        } 
    } else {
        setIsVericationRunning(false)
        setIsDisallowedNFT(true)
        setIsAPIverification(true)
        setAssetSearchMessage("Asset ID " + e.target.value + " is Invalid")
        const assetId = register('assetId', { required: "Invalid Asset ID" })
        assetId.onChange(e); // method from hook form register
    }
  }

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
                <FormControl isRequired isInvalid={errors.assetId}>
                    <FormLabel fontSize='xs' htmlFor="assetId">
                    Asset ID
                    {/* the form label from chakra ui is tied to the input via the htmlFor attribute */}
                    </FormLabel>
                    {/* you should use the save value for the id and the property name */}
                    <Input
                    id="assetId"
                    {...assetId }
                    size="sm"
                    value={input}
                    onChange={(e) => {
                    handleInputChange(e);
                    }}
                    placeholder="847772131"
                    />
                    <FormErrorMessage>{errors.assetId && errors.assetId.message}</FormErrorMessage>
                </FormControl>
                
                {isDisallowedNFT ? (
                    <>
                    <Center p={2}>
                        <FormLabel fontSize='xs'>
                        {assetSearchMessage}
                        </FormLabel>
                    </Center>
                    </>
                ) : (
                    <>
                    {isVericationRunning? (
                        <Center p={2}>
                            <VStack><Text fontSize='xs'>Attempting to Verifiy NFT...</Text><Spinner size='md'/></VStack>
                        </Center>
                    ) : null}
                    {assetName != '' && assetImage != '' && assetImage != null  && assetCreator != '' ? (
                        <>
                        {assetMimeType === 'video/mp4' || assetMimeType === 'video/3gpp' || assetMimeType === 'video/quicktime' ? (
                            <>
                            <Center p={2}>
                            <video className={'reactvidplayercreate'} autoPlay={false} src={assetImage != '' ? AUCTION.resolveUrl(assetImage) : 'placeholder.png'} controls>
                                <source src={assetImage != '' ? AUCTION.resolveUrl(assetImage) : 'placeholder.png'} type="video/mp4" />
                            </video>
                            </Center>
                            </>
                        ) : (
                            <>
                            <Center p={2}>
                                <Image boxSize='150px' objectFit='cover' borderRadius='lg' alt='ASAs.lol NFT Auctions' src={assetImage != '' ? AUCTION.resolveUrl(assetImage) : 'placeholder.png'} />
                            </Center>
                            </>
                        )}
                        <FormControl isReadOnly>
                            <FormLabel fontSize='xs' htmlFor="name">
                                <Center>
                                <HStack>
                                {isValidALGOxNFT ? (
                                    <Box p={0}>
                                        <Tooltip hasArrow label={'Verified Project on ALGOxNFT'} aria-label='Tooltip'>
                                            <Link href={'https://algoxnft.com/asset/'+input}isExternal pl={1}><Icon color={'#f41b8e'} fontSize='s' as={GoVerified} /></Link>
                                        </Tooltip>
                                    </Box>
                                ) : ''}
                                {isValidAlgoseas ? (
                                    <Box p={0}>
                                        <Tooltip hasArrow label={'Verified Project on AlgoSeas'} aria-label='Tooltip'>
                                            <Link href={'https://algoseas.io/marketplace/asset/'+input}isExternal pl={1}><Icon color={'#44a5e4'} fontSize='s' as={GoVerified} /></Link>
                                        </Tooltip>
                                    </Box>
                                ) : ''}
                                {isValidDartroom ? (
                                    <Box p={0}>
                                        <Tooltip hasArrow label={'Verified Project on Dartroom'} aria-label='Tooltip'>
                                            <Link href={'https://dartroom.xyz/nfts/asa/'+ input}isExternal pl={1}><Icon color={'#919191'} fontSize='s' as={GoVerified} /></Link>
                                        </Tooltip>
                                    </Box>
                                ) : ''}
                                {isValidRandGallery ? (
                                    <Box p={0}>
                                        <Tooltip hasArrow label={'Verified Project on Rand Gallery'} aria-label='Tooltip'>
                                            <Link href={'https://www.randgallery.com/algo-collection/?address='+ input} isExternal pl={1}><Icon color={'#6479BF'} fontSize='s' as={GoVerified} /></Link>
                                        </Tooltip>
                                    </Box>
                                ) : ''}
                                {isValidAlgogems ? (
                                    <Box p={0}>
                                        <Tooltip hasArrow label={'Verified Project on AlgoGems.io'} aria-label='Tooltip'>
                                            <Link href={'https://www.algogems.io/nft/'+ input} isExternal pl={1}><Icon color={'#44a5e4'} fontSize='s' as={GoVerified} /></Link>
                                        </Tooltip>
                                    </Box>
                                ) : ''}
                                </HStack>
                                </Center>
                            </FormLabel>
                            <Input
                                id="name"
                                size="sm"
                                value={assetName}
                                {...register("name")}
                            ></Input>
                        </FormControl>
                        <VisuallyHidden>
                        <FormControl isReadOnly>
                            <FormLabel fontSize='xs' htmlFor="image">
                                Image
                            </FormLabel>
                            <Input
                                id="image"
                                size="sm"
                                value={assetImage}
                                {...register("image")}
                            ></Input>
                        </FormControl>
                        <FormControl isReadOnly>
                            <FormLabel fontSize='xs' htmlFor="creator">
                                Creator Wallet
                            </FormLabel>
                            <Input
                                id="creator"
                                size="sm"
                                value={assetCreator}
                                {...register("creator")}
                            ></Input>
                        </FormControl>
                        {assetMimeType !=="" ? (
                        <FormControl isReadOnly>
                            <FormLabel fontSize='xs' htmlFor="mimetype">
                                MimeType
                            </FormLabel>
                            <Input
                                id="mimetype"
                                size="sm"
                                value={assetMimeType}
                                {...register("mimetype")}
                            ></Input>
                        </FormControl>
                        ) : null}
                        {isValidALGOxNFT ? (
                        <FormControl isReadOnly>
                            <Checkbox id="isverified" isChecked={isValidALGOxNFT} {...register("isverified")}>
                                isverified
                            </Checkbox>
                        </FormControl>
                        ) : null}
                        {isValidAlgoseas ? (
                        <FormControl isReadOnly>
                            <Checkbox id="isverifiedalgoseas" isChecked={isValidAlgoseas} {...register("isverifiedalgoseas")}>
                                isverifiedalgoseas
                            </Checkbox>
                        </FormControl>
                        ) : null}
                        {isValidDartroom ? (
                        <FormControl isReadOnly>
                            <Checkbox id="isverifieddart" isChecked={isValidDartroom} {...register("isverifieddart")}>
                                isverifieddart
                            </Checkbox>
                        </FormControl>
                        ) : null}
                        {isValidRandGallery ? (
                        <FormControl isReadOnly>
                            <Checkbox id="isverifiedrand" isChecked={isValidRandGallery} {...register("isverifiedrand")}>
                                isverifiedrand
                            </Checkbox>
                        </FormControl>
                        ) : null}
                        {isValidAlgogems ? (
                        <FormControl isReadOnly>
                            <Checkbox id="isverifiedalgogems" isChecked={isValidAlgogems} {...register("isverifiedalgogems")}>
                                isverifiedalgogems
                            </Checkbox>
                        </FormControl>
                        ) : null}
                        </VisuallyHidden>
                        </>
                    ) : null}
                    </>
                ) }
            </Box>
            <Box p={2}>
                    <FormControl isRequired isInvalid={errors.lengthofauction}>
                        <FormLabel fontSize='xs' htmlFor="lengthofauction">
                        Length Of Auction
                        </FormLabel>
                        <Input
                        id="lengthofauction"
                        size="sm"
                        placeholder="3"
                        value={sliderValue}
                        {...register("lengthofauction", {
                            required: "Please enter the length of the auction?",
                            min: {
                                value: 1, //0.1 could change type from Int to Float on dgraph and do less then 24hr listings didnt work thou lol sc was messed
                                message: "Auction Length Must be Atleast 1"
                            },
                        })}
                        ></Input>
                        <Slider
                            id='slider'
                            defaultValue={1}
                            min={1}
                            max={30}
                            colorScheme='blue'
                            onChange={(e) => handleSliderChange(e)}
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            mb={4}
                            >
                            <SliderMark value={1} mt='1' ml='-2.5' fontSize='xs'>
                              1
                            </SliderMark>
                            <SliderMark value={15} mt='1' ml='-2.5' fontSize='xs'>
                               15
                            </SliderMark>
                            <SliderMark value={30} mt='1' ml='-2.5' fontSize='xs'>
                               30
                            </SliderMark>
                            <SliderTrack>
                                <SliderFilledTrack />
                            </SliderTrack>
                            <Tooltip
                                hasArrow
                                bg='blue.500'
                                color='white'
                                placement='top'
                                isOpen={showTooltip}
                                label={`${sliderValue} Days`}
                            >
                                <SliderThumb />
                            </Tooltip>
                            </Slider>
                        <FormErrorMessage>{errors.lengthofauction && errors.lengthofauction.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isRequired isInvalid={errors.ticketcost}>
                        <FormLabel fontSize='xs' htmlFor="ticketcost">
                        Start Price - 1 <>{currency.unitname}</>
                        </FormLabel>
                        <Input
                        id="ticketcost"
                        size="sm"
                        isDisabled={(currency.unitname == 'ALGO')? true : false}
                        placeholder="0"
                        {...register("ticketcost", {
                            required: "Please enter the starting price of the auction?",
                            min: {
                                value: 1,
                                message: "Starting price of the auction must be atleast 1"
                            },
                        })}
                        ></Input>
                        <FormErrorMessage>{errors.ticketcost && errors.ticketcost.message}</FormErrorMessage>
                    </FormControl>
                   {/*  <FormControl isInvalid={errors.marketplace}>
                        <FormLabel fontSize='xs' htmlFor="marketplace">
                            Marketplace
                        </FormLabel>
                        <Input
                        id="marketplace"
                        size="sm"
                        placeholder="https://algogems.io/gallery/flippingalgos"
                        type="marketplace"
                        {...register("marketplace")}
                        ></Input>
                        <FormErrorMessage>{errors.marketplace && errors.marketplace.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={errors.website}>
                        <FormLabel fontSize='xs' htmlFor="website">
                            Website
                        </FormLabel>
                        <Input
                        id="website"
                        size="sm"
                        placeholder="https://algogems.io/gallery/flippingalgos"
                        type="website"
                        {...register("website")}
                        ></Input>
                        <FormErrorMessage>{errors.website && errors.website.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl isInvalid={errors.twitter}>
                        <FormLabel fontSize='xs' htmlFor="twitter">
                        Twitter URL
                        </FormLabel>
                        <Input
                        id="twitter"
                        size="sm"
                        placeholder="https://twitter.com/FlippingAlgos"
                        {...register("twitter")}
                        ></Input>
                        <FormErrorMessage>{errors.twitter && errors.twitter.message}</FormErrorMessage>
                    </FormControl> */}
                </Box>
            </Flex>
            <Center>
            <Button isDisabled={isAPIverification} mt={10} colorScheme={createButtonColor} isLoading={isSubmitting} type="submit">
                Create
            </Button>
            </Center>
            </form>
          </>
        )}
    </Center>
  </>
  );
}