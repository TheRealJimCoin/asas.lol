import Head from 'next/head'
import {
  Box,
  Button,
  Heading,
  Container, 
  VStack,
  HStack,
  Center,
  Fade,
  Image,
  Flex,
  useColorModeValue,
  Link,
  Spinner,
  Progress,
  Text
} from '@chakra-ui/react'
import * as React from 'react'
import { useState } from 'react'
import Navigation from '../components/Navigation'
import { useNavigation } from "../src/contexts/navigation.context"
import { AlgorandWalletConnector } from '../src/AlgorandWalletConnector'
import favicon from "../public/favicon.ico"
import CreateRollUpForm from "../components/forms/rollup-form"
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import { ROLLUP } from '../lib/rollup'
import { NFT } from '../lib/nft'
import {platform_settings as ps} from '../lib/platform-conf'
import { useRouter } from 'next/router'
import axios from "axios"
import NextLink from 'next/link'
import Footer from '../components/Footer'

export default function CreateRollup(props) {
  const { defaultWallet, handleFetchAuctions, sessionWallet, connected, updateWallet } = useNavigation()
  const [stepError, setStepError] = React.useState(false)
  const [isSendingNFT, setIsSendingNFT] = React.useState(false)
  const [isStepTwo, setIsStepTwo] = React.useState(false)
  const [isNFTsent, setIsNFTsent] = React.useState(false)
  const [isNFTVaultReady, setIsNFTVaultReady] = React.useState(false)
  const [nftAppId, setNFTAppId] = React.useState(0)
  const [nftIPFScid, setNFTIPFScid] = React.useState('')
  const [nftIPFSmimetype, setNFTIPFSmimetype] = React.useState('')
  const [nftAppAddress, setNFTAppAddress] = React.useState('')
  const [mintedAssetId, setMintedAssetId] = React.useState(0)
  const colorText = useColorModeValue('black', 'black')
  const colorBlue = useColorModeValue('blue', 'blue')
  
  const [data, setData] = useState<{
    metatraits: any;
    description: string;
    name: string;
    image: string;
    mimetype: string;
    creator: string;
  }>()

  const router = useRouter()

  function redirectPage() { 
    router.push("/myvaults");
  }

  async function createNFTRollUp(data) {
    //console.log("createNFTRollUp ", data)
    const response = await axios.post("https://api.nft.storage/upload", data.file_?.['0'], {
        headers: {
            Authorization: "Bearer " + ps.ipfs.token,
        },
    });
    let ipfs_cid = response.data.value.cid;
    let image_mime_type = data.file_?.['0'].type;
    // Combine metatraits with other properties
    const traits = {};
    data.metatraits.forEach(trait => {
      traits[trait.name] = trait.value;
    });
    //let ipfs_cid = "bafkreifi6oqu3xg6mebim3mmydx7gjwremjcrxkz4qbfjybka7gb44xyza";
    let ipfs_data = {
        name: data.name,
        standard: "arc3",
        image: ipfs_cid ? "ipfs://" + String(ipfs_cid) : "",
        image_mime_type: image_mime_type,
        description: data.description,
        properties: {
            traits: {
              ...traits, // Combine metatraits with other traits
              mintedby: defaultWallet,
              mintedon: "asas.lol",
              vaultappid: nftAppId
            },
            vaultappid: nftAppId,
            filters: {}
        },
        extra: {},
    };
    await NFT.createARC19AssetMintArray(sessionWallet, data.name, ipfs_data).then((txid: any) => {
        if(Array.isArray(txid) && txid?.length > 0) {
          //console.log("minted",txid)
          setIsStepTwo(true)
          setMintedAssetId(txid[0]?.assetId)
          setNFTIPFScid("ipfs://" + String(ipfs_cid))
          setNFTIPFSmimetype(image_mime_type)
        } else {
          setStepError(true)
        }
    }).catch((err)=>{ 
        console.log("error minting", err)
    })
    return undefined
  }

  React.useEffect(()=>{ 
    if(data === undefined || !connected) return 
      //console.log("form data sent", data)
      createNFTRollUp(data)
    
  }, [defaultWallet, connected, data])

  async function deployNFTSC(event) {
    event.stopPropagation()
    event.preventDefault()
    await ROLLUP.createNFTSC(sessionWallet, 0).then((txid: any) => {
        //console.log("create NFT SC Application: ",txid)
        if(txid !== undefined) {
            setNFTAppId(txid[0]?.appId)
            setNFTAppAddress(txid[0]?.appAddr)
            setIsNFTVaultReady(true)
        } else {
            setStepError(true)
            showErrorToaster("Error Creating NFT Vault Smart Contract") 
        }
        return txid
    }).catch((err)=>{ 
        setStepError(true)
        //console.log("error ", err)
    }) 
  }

  async function mintSmartNFT(event) {
    event.stopPropagation()
    event.preventDefault()
    setIsSendingNFT(true)
    //console.log("nftAppId: ",nftAppId)
    //console.log("nftAppAddress: ",nftAppAddress)
    //console.log("mintedAssetId: ",mintedAssetId)
    await ROLLUP.mintSmartNFT(sessionWallet, nftIPFScid, 'generate nft vault note', mintedAssetId, nftAppId).then((txid: any) => {
        //console.log("updateMintedNFT: ",txid)
        var now = new Date().toISOString()
        fetch('/api/addToRollups', {
            method: 'POST',
            body: JSON.stringify({
                createdat: now,
                vaultappid: nftAppId,
                vaultappaddress: nftAppAddress,
                vaultmintedasset: mintedAssetId,
                vaultipfs: nftIPFScid,
                vaultipfsmimetype: '',
                mintedby: defaultWallet,
                txid: txid
            })
        })
        .then((res) => {
            res.json().then((getStatus) => {
                //console.log("mintSmartNFT ", getStatus)
                if(getStatus.success) {
                  setIsSendingNFT(false)
                  setIsNFTsent(true)
                  showNetworkSuccess("NFT Vault Now Live")
                } else {
                  setIsSendingNFT(false)
                  showErrorToaster("Error Making NFT Vault Live") 
                }
            }).catch((err)=>{ 
                console.log("error Making NFT Vault Live", err)
                setIsSendingNFT(false)
            })
        }) 
    }).catch((err)=>{ 
        console.log("error ", err)
        setIsSendingNFT(false)
    })  
  }

  if (!connected) {
    return (
      <>
      <Head>
        <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
        <title>ASAs.lol - Create a NFT Vault</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Container maxWidth="100%" h="90vh" centerContent>
        <Center h="100%">
          <VStack spacing={8}>
            <Heading color={colorText} as="h3" size="xl">
              Connect your Wallet
            </Heading>
           <AlgorandWalletConnector 
                        darkMode={true}
                        //@ts-ignore
                        sessionWallet={sessionWallet}
                        connected={connected} 
                        //@ts-ignore
                        updateWallet={updateWallet}
                        //@ts-ignore
                        handleFetchAuctions={handleFetchAuctions}
                        />
            <Text as="cite" color={colorText}>
              Powered by{" "}
              <Link href="https://www.flippingalgos.xyz/">
                FlippingAlgos
              </Link>
            </Text>
          </VStack>
        </Center>
      </Container>
    </>
    );
  }
  return (
    <>
      <Head>
      <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
      <title>ASAs.lol - Create a NFT Vault</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navigation />
      <Box w="100%" h="100%">
        <Center h="100%">
          <Box padding="2">
              <Fade in={!data} unmountOnExit>
                <Box bgColor={'gray.800'} m={3} p={4} borderWidth='1px' borderRadius='lg'>
                <VStack>
                  <Box p={0}>
                    <Heading textAlign="center">
                        Create a NFT Vault
                    </Heading>
                 </Box>
                 {!isNFTVaultReady ? (
                    <>
                    <Text p={2} fontFamily='arial'>
                    The first step will intialize the smart contract vault which will be applied to the minted NFT in this process.
                    </Text>
                    <Box>
                      <Button colorScheme={colorBlue} onClick={deployNFTSC}>
                          <Text px={2} zIndex={1}>Initialize Vault</Text>
                      </Button>
                    </Box>
                    <Text p={2} fontFamily='arial' fontSize='9px'>
                    *** there is a 0.5A fee used for the deployment of the nft smart contract vault. Max 3 ASAs held in vault at anytime.
                    </Text>
                    </>
                  ) : (
                    <>
                    <Text fontFamily='arial'>
                    The second step will mint the NFT that will be applied to the smart contract vault initialized in the previous step.
                    </Text>
                    <Box p={0}>
                        <CreateRollUpForm onRegistered={setData} />
                    </Box>  
                    </>
                  )}
                </VStack>
                </Box>
                <Center>
                    <Text p={2} fontSize='md' color={'black'} fontFamily={'arial'}>already minted one? </Text>
                    <Text p={2} fontSize='md' fontFamily={'arial'}><NextLink href={'/myvaults'} as={'/myvaults'} passHref>Check My NFT Vaults</NextLink></Text>
                </Center>
              </Fade>
              <Fade in={!!data} unmountOnExit>
                <Box maxWidth={"xl"}>
                    {!isStepTwo && !isNFTsent ? (
                        <>
                          <Box p={2}>
                              <Text fontSize='xs' color={'black'} fontWeight={'bold'}>Attemping to Mint Your NFT. This could take upto 10-15 seconds wait for the confirmation popup.</Text>
                          </Box>
                          <Box p={2}>
                            <Progress size='xs' isIndeterminate />
                          </Box>  
                          {stepError ? (
                          <>
                            <Box>
                                <Center>
                                  <Text fontSize='xs' color={'black'} >Looks like we ran into a issue. Double check your wallet to confirm and if its not there try creating it again.</Text>
                                  <Button size='sm' colorScheme={colorBlue} onClick={redirectPage}><Text p={2} fontSize='xs'>Check My NFT Vaults</Text></Button>
                                </Center>
                            </Box>
                          </>
                          ) : null }
                        </>
                    ) : null }
                    {isStepTwo && !isNFTsent ? (
                      <VStack>
                        <Box>
                            <Text p={2} color={'blue'}>NFT Rollup #{mintedAssetId} Successfully Minted</Text>
                        </Box>
                        <Box>
                          <Button colorScheme={colorBlue} onClick={mintSmartNFT}>
                              <Text px={2} zIndex={1}>Apply Vault to NFT</Text>
                          </Button>
                        </Box>
                        {data?.image && (nftIPFSmimetype === 'video/mp4' || nftIPFSmimetype === 'video/3gpp' || nftIPFSmimetype === 'video/quicktime') ? (
                          <video className={'reactvidplayer'} autoPlay={false} src={nftIPFScid != '' ? ROLLUP.resolveUrl(nftIPFScid) : '/placeholder.png'} controls>
                              <source src={nftIPFScid != '' ? ROLLUP.resolveUrl(nftIPFScid) : '/placeholder.png'} type="video/mp4" />
                          </video>
                        ) : (
                          <Box>
                            <Image width={350} height={350} borderRadius='lg' src={nftIPFScid != '' ? ROLLUP.resolveUrl(nftIPFScid) : '/placeholder.png' as any} alt='ASAs.lol NFT Vault' />
                          </Box>
                        )}
                        <Box>
                          <Text p={2} color={'black'} size="xs">Preparing to Bind NFT {mintedAssetId} to the Smart Contract Vault #{nftAppId}</Text>
                        </Box>
                      </VStack>
                    ) : null }
                    {isStepTwo && isNFTsent ? (
                      <VStack>
                        <Box>
                          <Text p={2} color={'blue'}>Success NFT #{mintedAssetId} Is Live and Ready for use with Vault# {nftAppId}</Text>
                        </Box>
                        {data?.image && (nftIPFSmimetype === 'video/mp4' || nftIPFSmimetype === 'video/3gpp' || nftIPFSmimetype === 'video/quicktime') ? (
                          <video className={'reactvidplayer'} autoPlay={false} src={nftIPFScid != '' ? ROLLUP.resolveUrl(nftIPFScid) : '/placeholder.png'} controls>
                              <source src={nftIPFScid != '' ? ROLLUP.resolveUrl(nftIPFScid) : '/placeholder.png'} type="video/mp4" />
                          </video>
                        ) : (
                          <Box>
                            <Image width={350} height={350} borderRadius='lg' src={nftIPFScid != '' ? ROLLUP.resolveUrl(nftIPFScid) : '/placeholder.png' as any} alt='ASAs.lol NFT Vault' />
                          </Box>
                        )}
                        <Box>
                          <Center>
                            <Button size='sm' colorScheme={colorBlue} onClick={redirectPage}><Text p={2} fontSize='xs'>Manage Vault</Text></Button>
                          </Center>
                        </Box>
                      </VStack>
                    ) : null }
                </Box>
              </Fade>
            </Box>
        </Center>
      </Box>
      <Footer />
    </>
  )
}
