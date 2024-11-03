/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { Box, Icon, Container, Select, Tooltip, Input, Text, Link, Image, Button, Spacer, Flex, HStack, keyframes, Collapse, VStack, Center, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useColorModeValue } from '@chakra-ui/react'
import { ROLLUP } from '../lib/rollup'
import { Wallet } from '../lib/algorand-session-wallet'
import { NFT } from '../lib/nft'
import { getCurrentApplicatonGlobalState, getCurrentVaultBalance } from '../lib/algorand'
import { showErrorToaster, showNetworkSuccess } from "../src/Toaster"
import NextLink from 'next/link'
import { useEffect, useState } from "react"

type RollupCardProps = {
    defaultWallet: string;
    nft: ROLLUP;
    wallet: Wallet;
    verifiedASAData: any;
};

export function RollupCard(props: RollupCardProps) {
    //console.log("RollupCard",props)
    const { defaultWallet, wallet, nft, verifiedASAData } = props;
    var vaultAppId =  nft.vaultappid
    var vaultMintedAsset = nft.vaultmintedasset
    const [ASAOptinValue, setASAOptinValue] = React.useState(0)
    const boxBgColor = useColorModeValue('#2AD3FF', '#2AD3FF')
    const buttonColor = useColorModeValue('green', 'green')
    const [isDepositing, setIsDepositing] = React.useState(false)
    const [isWithdrawl, setIsWithdrawl] = React.useState(false)
    const [isOptingIn, setIsOptingIn] = React.useState(false)
    const [isOptingOut, setIsOptingOut] = React.useState(false)
    const [depositAsset, setDepositAsset] = React.useState<number>(0);
    const [depositAmount, setDepositAmount] = React.useState<number | undefined>(undefined);
    const [withdrawlAsset, setWithdrawlAsset] = React.useState<number>(0);
    const [withdrawlAmount, setWithdrawlAmount] = React.useState<number | undefined>(undefined);
    const [isOpenDeposit, setIsOpenDeposit] = useState(false);
    const [isOpenWithdrawal, setIsOpenWithdrawal] = useState(false);
    const [vaultData, setVaultData] = React.useState({ state: undefined, assets: undefined})
    const [tokenImageError, setTokenImageError] = useState({});

    const handleOnTokenImageError = (assetId) => {
        setTokenImageError(prevState => ({
            ...prevState,
            [assetId]: true // Set error status for the specific asset
        }));
    };

    const handleDepositToggle = () => {
        setIsOpenDeposit(!isOpenDeposit);
    };

    const handleWithdrawalToggle = () => {
        setIsOpenWithdrawal(!isOpenWithdrawal);
    };
    
    async function handleUpdateManager(event) {
        await ROLLUP.updateManager(wallet, vaultMintedAsset, defaultWallet, 1, vaultAppId).then((txid: any) => {
            //console.log("handleUpdateManager: ",txid)
            if(txid !== undefined) {
                getCurrentVaultBalance(vaultAppId, vaultMintedAsset).then((vaultData)=> { 
                    if(vaultData) {
                        setVaultData(vaultData)
                        /* 
                        var now = new Date().toISOString()
                        fetch('/api/optVaultIn', {
                            method: 'POST',
                            body: JSON.stringify({
                                asset_id: nft.vaultmintedasset,
                                tokenunit: 'FEATHERS',
                                vaultappid: vaultAppId,
                                receiver: nft.mintedby,
                                txid: txid,
                                createdat: now
                            })
                        })
                        .then((res) => {
                            res.json().then((getStatus) => {
                                if(getStatus.success) {
                                    showNetworkSuccess("optVaultIn Successful")
                                } else {
                                    showErrorToaster("Error optVaultIn") 
                                }
                            }).catch((err)=>{ 
                                //console.log("Error optVaultIn", err)
                                showErrorToaster("Error optVaultIn") 
                            })
                        })  */
                    }
                }).catch((err)=>{ 
                    console.log("error getCurrentVaultBalance",err)
                }) 
            } else {
                setIsOptingIn(false)
                showErrorToaster("Error Upodating Vault Manager") 
            }
        }).catch((err)=>{ 
            console.log("error ", err)
        }) 
    }

    async function optVaultIn(event) {
        setIsOptingIn(true)
        if(ASAOptinValue <= 0 || ASAOptinValue === null || ASAOptinValue === undefined) {
            showErrorToaster("Error Please Enter a Asset ID") 
        } else {
            await ROLLUP.optIn(wallet, ASAOptinValue, vaultAppId).then((txid: any) => {
                //console.log("optVaultIn: ",txid)
                if(txid !== undefined) {
                    getCurrentVaultBalance(vaultAppId, vaultMintedAsset).then((vaultData)=> { 
                        if(vaultData) {
                            setVaultData(vaultData)
                            /* 
                            var now = new Date().toISOString()
                            fetch('/api/optVaultIn', {
                                method: 'POST',
                                body: JSON.stringify({
                                    asset_id: nft.vaultmintedasset,
                                    tokenunit: 'FEATHERS',
                                    vaultappid: vaultAppId,
                                    receiver: nft.mintedby,
                                    txid: txid,
                                    createdat: now
                                })
                            })
                            .then((res) => {
                                res.json().then((getStatus) => {
                                    if(getStatus.success) {
                                        showNetworkSuccess("optVaultIn Successful")
                                    } else {
                                        showErrorToaster("Error optVaultIn") 
                                    }
                                }).catch((err)=>{ 
                                    //console.log("Error optVaultIn", err)
                                    showErrorToaster("Error optVaultIn") 
                                })
                            })  */
                        }
                    }).catch((err)=>{ 
                        console.log("error getCurrentVaultBalance",err)
                    }) 
                } else {
                    setIsOptingIn(false)
                    showErrorToaster("Error Opting Vault Into Asset") 
                }
            }).catch((err)=>{ 
                console.log("error ", err)
            }) 
        }
        setIsOptingIn(false)
    }

    async function optVaultOut(event) {
        setIsOptingOut(true)
        if(ASAOptinValue <= 0 || ASAOptinValue === null || ASAOptinValue === undefined) {
            showErrorToaster("Error Please Enter a Asset ID") 
        } else {
            await ROLLUP.optOut(wallet, ASAOptinValue, vaultAppId, nft.mintedby).then((txid: any) => {
                //console.log("optVaultOut: ",txid)
                if(txid !== undefined) {
                    //getCurrentApplicatonGlobalState(vaultAppId).then((contractData)=> { 
                        //if(contractData) {
                    getCurrentVaultBalance(vaultAppId, vaultMintedAsset).then((vaultData)=> { 
                        if(vaultData) {
                            setVaultData(vaultData)
                            /* 
                            var now = new Date().toISOString()
                            fetch('/api/optVaultOut', {
                                method: 'POST',
                                body: JSON.stringify({
                                    asset_id: nft.vaultmintedasset,
                                    tokenunit: 'FEATHERS',
                                    vaultappid: vaultAppId,
                                    receiver: nft.mintedby,
                                    txid: txid,
                                    createdat: now
                                })
                            })
                            .then((res) => {
                                res.json().then((getStatus) => {
                                    if(getStatus.success) {
                                        showNetworkSuccess("optVaultOut Successful")
                                    } else {
                                        showErrorToaster("Error optVaultOut") 
                                    }
                                }).catch((err)=>{ 
                                    //console.log("Error optVaultOut", err)
                                    showErrorToaster("Error optVaultOut") 
                                })
                            })  */
                        }
                    }).catch((err)=>{ 
                        console.log("error getCurrentVaultBalance",err)
                    }) 
                } else {
                    setIsOptingOut(false)
                    showErrorToaster("Error Opting Vault Out of Asset") 
                }
            }).catch((err)=>{ 
                console.log("error ", err)
            }) 
        }
        setIsOptingOut(false)
    }

    async function depositFunds(event) {
        setIsDepositing(true)
        if(depositAsset === null || depositAsset === undefined) {
            showErrorToaster("Error Please Enter a Asset ID") 
        } else {
            await ROLLUP.depositFunds(wallet, vaultAppId, depositAsset, depositAmount).then((txid: any) => {
                //console.log("depositFunds: ",txid)
                if(txid !== undefined) {
                    getCurrentVaultBalance(vaultAppId, vaultMintedAsset).then((vaultData)=> { 
                        if(vaultData) {
                            setVaultData(vaultData)
                            /* var now = new Date().toISOString()
                            fetch('/api/depositFunds', {
                                method: 'POST',
                                body: JSON.stringify({
                                    asset_id: nft.vaultmintedasset,
                                    vaultappid: vaultAppId,
                                    receiver: defaultWallet,
                                    txid: txid,
                                    createdat: now
                                })
                            })
                            .then((res) => {
                                res.json().then((getStatus) => {
                                    if(getStatus.success) {
                                        showNetworkSuccess("Funds Successfully Deposited to NFT Vault")
                                    } else {
                                        showErrorToaster("Error Depositing Funds to NFT Vault") 
                                    }
                                }).catch((err)=>{ 
                                    console.log("error Depositing Funds to NFT Vault", err)
                                })
                            })  */
                        }
                    }).catch((err)=>{ 
                        console.log("error getCurrentVaultBalance",err)
                    })  
                } else {
                    setIsDepositing(false)
                    showErrorToaster("Error Depositing Funds to NFT Vault") 
                }
            }).catch((err)=>{ 
                console.log("error ", err)
            }) 
        }
        setIsDepositing(false)
    }
    
    async function withdrawlFunds(event) {
        setIsWithdrawl(true)
        if(withdrawlAsset === null || withdrawlAsset === undefined) {
            showErrorToaster("Error Please Enter a Asset ID") 
        } else {
            await ROLLUP.withdrawlFunds(wallet, vaultAppId, withdrawlAsset, withdrawlAmount).then((txid: any) => {
                //console.log("withdrawlFunds: ",txid)
                if(txid !== undefined) {
                    showNetworkSuccess("Funds Withdrawl Successfully from NFT Vault")
                   
                    getCurrentVaultBalance(vaultAppId, vaultMintedAsset).then((vaultData)=> { 
                        if(vaultData) {
                            setVaultData(vaultData)
                             /* 
                            var now = new Date().toISOString()
                            fetch('/api/withdrawlFunds', {
                                method: 'POST',
                                body: JSON.stringify({
                                    asset_id: nft.vaultmintedasset,
                                    vaultappid: vaultAppId,
                                    receiver: defaultWallet,
                                    txid: txid,
                                    createdat: now
                                })
                            })
                            .then((res) => {
                                res.json().then((getStatus) => {
                                    if(getStatus.success) {
                                        showNetworkSuccess("Funds Successfully Deposited to NFT Vault")
                                    } else {
                                        showErrorToaster("Error Depositing Funds to NFT Vault") 
                                    }
                                }).catch((err)=>{ 
                                    console.log("error Depositing Funds to NFT Vault", err)
                                })
                            }) 
                            */
                        }
                    }).catch((err)=>{ 
                        console.log("error getCurrentVaultBalance",err)
                    })  
                } else {
                    setIsWithdrawl(false)
                    showErrorToaster("Error on Withdrawl Funds from NFT Vault") 
                }
            }).catch((err)=>{ 
                console.log("error ", err)
            }) 
        }
        setIsWithdrawl(false)
    }

    React.useEffect(()=>{ 
        
    const handleGetVaultBalance = async () => {
        if(vaultAppId !== 0) {
            getCurrentVaultBalance(vaultAppId, vaultMintedAsset).then((vaultData)=> { 
                if(vaultData) {
                    setVaultData(vaultData)
                }
            }).catch((err)=>{ 
                console.log("error getCurrentVaultBalance",err)
            }) 
        }
    }
        
    if(vaultAppId > 0) {
        handleGetVaultBalance()
    } else {
        console.log("vault balance", nft)
    }
}, [vaultAppId, vaultMintedAsset]) 

    return (
        <Box maxWidth={'400px'}  _hover={{borderColor: boxBgColor}} bg={useColorModeValue('#dcdde1', 'gray.700')} margin={2} borderWidth='2px'>
            <Container pb={0} pt={2} pl={2} pr={2}>
               <Center>
                {nft.mimetype === 'video/mp4' || nft.mimetype === 'video/3gpp' || nft.mimetype === 'video/quicktime' ? (
                    <>
                    <video className={'reactvidplayer'} autoPlay={false} src={nft && nft.vaultipfs != '' && nft.vaultipfs != null ? ROLLUP.resolveUrl(nft.vaultipfs) : '/placeholder.png'} controls>
                        <source src={nft && nft.vaultipfs != '' && nft.vaultipfs != null ? ROLLUP.resolveUrl(nft.vaultipfs) : '/placeholder.png'} type="video/mp4" />
                    </video>
                    </>
                ) : (
                    <>
                     <Image boxSize='350px' objectFit='cover' borderRadius='lg' alt='ASAs.lol NFT Vault' src={nft && nft.vaultipfs != '' && nft.vaultipfs != null ? ROLLUP.resolveUrl(nft.vaultipfs) : '/placeholder.png'} />
                    </>
                )}
                </Center>
            </Container>
            <Container>
                <>
                 {vaultData?.assets?.length > 0 ? (
                  <Box pt={1} pb={1}>
                    <Text fontSize='xs' color={'#2AD3FF'}>Vault Balance</Text>
                    {vaultData?.assets.map((asset) => {
                        //const dynamicTokenImageSrc = `https://asa-list.tinyman.org/assets/${asset['asset-id']}/icon.png`;
                        const matchingToken = verifiedASAData[asset['asset-id']];
                        const dynamicTokenImageSrc = matchingToken ? matchingToken.logo.png : `https://asa-list.tinyman.org/assets/${asset['asset-id']}/icon.png`;
                        return (
                            <HStack key={asset['asset-id']}>
                                <Box pt={1} pb={1}>
                                {asset?.url && asset?.url !== undefined && !asset.url.includes('www.') && !asset.url.includes('.com') && !asset.url.includes('.farm') && !asset.url.includes('.org') && !asset.url.includes('.network') && !asset.url.includes('algo.xyz') ? (
                                    <Image borderRadius='lg' boxSize={'30px'} alt='ASAs.lol' src={asset?.url && asset?.url !== undefined ? NFT.resolveUrl(asset?.url, asset?.reserve, 35) : 'placeholder.png'} />
                                ) : (
                                    <Image boxSize='30px' objectFit='cover' borderRadius='lg' alt={asset.unitname} src={tokenImageError[asset['asset-id']] ? (asset['asset-id'] === 1194470385 || asset['asset-id'] === 1056720965) ? '/currencies/'+asset['asset-id']+'.png' : '/tokenplaceholder.png' : dynamicTokenImageSrc} onError={() => handleOnTokenImageError(asset['asset-id'])} />
                                )}
                                </Box>
                                <Tooltip hasArrow label={asset?.name} aria-label='Tooltip'>
                                    <Link href={(asset?.url && asset?.url !== undefined) ? 'https://explorer.flippingalgos.xyz/asset/'+asset['asset-id'] : 'https://vestige.fi/asset/'+asset['asset-id']} isExternal>
                                        <Text fontFamily='arial' fontSize='xs'>{asset.unitname}</Text>
                                    </Link>
                                </Tooltip>
                                <Text fontFamily='arial' fontWeight='bold' fontSize='10px'>{asset.amount}</Text>
                            </HStack>
                        );
                    })}
                  </Box>  
                  ) : (
                  <Box pt={2} pb={2}>
                    <Text fontSize='xs' color={'#2AD3FF'}>Vault Balance</Text>
                    <Text fontSize='xs'>Empty</Text>
                  </Box>
                  )} 
                </>
            </Container>
            <Container p={2}>
                {vaultData.state?.manager !== defaultWallet ? (
                    <Center pb={2}>
                        <Flex>
                            <VStack>
                            <Text fontFamily='arial' fontSize='11px'>Asset # {nft.vaultmintedasset}</Text>
                            <Button mb={2} size='sm' isLoading={isDepositing} loadingText='Claiming Ownership...' colorScheme={buttonColor} onClick={handleUpdateManager}>Claim Ownership</Button>
                            </VStack>
                        </Flex>
                    </Center>
                ) : (
                <>
                  <Flex mb={2}>
                    <Box>
                        <Tooltip hasArrow label={'Max 3 Assets Per Smart NFT'} aria-label='Tooltip'>
                            <Button size='sm' isDisabled={(vaultData?.assets?.length >= 3)? true : false} isLoading={isOptingIn} loadingText='Opting In' colorScheme={'yellow'} onClick={optVaultIn}>Opt In</Button>
                        </Tooltip>
                    </Box>
                    <Spacer/>
                    <Center w={'100px'}>
                        <NumberInput isDisabled={(isOptingIn || isOptingOut)} size='sm' borderColor={'yellow.500'} onChange={(value) => setASAOptinValue(parseInt(value))} defaultValue={(ASAOptinValue > 0)? ASAOptinValue : null} >
                        <NumberInputField size={12} padding={0} textAlign="center" />
                        </NumberInput>
                    </Center> 
                    <Spacer/>
                    <Box>
                        <Button size='sm' isDisabled={(vaultData?.assets?.length == 0)? true : false} isLoading={isOptingOut} loadingText='Opting Out' colorScheme={'yellow'} onClick={optVaultOut}>Opt Out</Button>
                    </Box>
                </Flex>
                <Flex mt={1} mb={1}>
                    <Box>
                        <Link href={'https://app.dappflow.org/explorer/application/' + nft.vaultappid} isExternal>
                            <Text fontFamily='arial' fontSize='11px'>Vault # {nft.vaultappid}</Text>
                        </Link>
                    </Box>
                    <Spacer/>
                    <Box>
                        <Link href={'https://explorer.flippingalgos.xyz/asset/' + nft.vaultmintedasset} isExternal>
                            <Text fontFamily='arial' fontSize='11px'>Asset # {nft.vaultmintedasset}</Text>
                        </Link>
                    </Box>
                </Flex>
                <Flex mb={1}>
                    <Box>
                        <Text color={'#2AD3FF'}>Vault Address</Text>
                        <Link href={'https://allo.info/account/' + nft.vaultappaddress} isExternal>
                            <Text fontFamily='arial' fontSize='10px'>{nft.vaultappaddress.substring(0, 5) + '...' + nft.vaultappaddress.slice(-4)}</Text>
                        </Link>
                    </Box>
                    <Spacer />
                    <Box>
                        <Text color={'#2AD3FF'}>Minted By</Text>
                        <Text fontFamily='arial' fontSize='11px'>
                            {(nft?.mintedby_nfd != null)? nft.mintedby_nfd : (nft.mintedby != null)? nft.mintedby.substring(0, 5) + '...' + nft.mintedby.slice(-4): ""}
                        </Text> 
                    </Box>
                </Flex>
                <Flex mt={2}>
                    <Box>
                        <Button mb={2} size='sm' isLoading={isDepositing} loadingText='Sending Asset...' colorScheme={buttonColor} onClick={handleDepositToggle}>Deposit</Button>
                        <Collapse in={isOpenDeposit} animateOpacity>
                            <Box bg={'gray.700'} p={1} borderWidth='1px' borderRadius='lg'>
                                <VStack align={'left'} spacing={{ base: 2, md: 4}}>
                                {vaultData?.assets?.length > 0 ? (
                                    <>
                                    <Text color={'gray.100'} fontSize='sm'>Asset</Text>
                                    <Select size='xs' onBlur={(event) => setDepositAsset(parseInt(event.target.value))} onChange={(event) => setDepositAsset(parseInt(event.target.value))} value={depositAsset}>
                                        <option key={0} value={'0'}>Select Token...</option>
                                        {vaultData?.assets.map((asset) => (
                                            <option key={asset["asset-id"]} value={asset["asset-id"]}>{asset.name}</option>
                                        ))}
                                    </Select>
                                    <Text color={'gray.100'} fontSize='sm'>Amount</Text>
                                    <Input type='text' onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDepositAmount(parseInt(event.target.value))} size='xs' value={depositAmount} w='145px' />
                                    <Button size='sm' isDisabled={(depositAsset === 0)? true : false} isLoading={isDepositing} loadingText='Sending Asset...' colorScheme={'green'} onClick={depositFunds}>Send</Button>
                                    </>
                                ) : (
                                    <Box pt={2} pb={2}>
                                        <Text fontSize='xs'>Must Opt into a Asset</Text>
                                    </Box>
                                )} 
                                </VStack>
                            </Box>
                        </Collapse>
                    </Box>
                    <Spacer />
                    <Box textAlign={'right'}>
                        <Button mb={2} size='sm' isLoading={isOptingOut} loadingText='Withdrawl Asset...' colorScheme={'red'} onClick={handleWithdrawalToggle}>Withdrawl</Button>
                        <Collapse in={isOpenWithdrawal} animateOpacity>
                            <Box bg={'gray.700'} p={1} borderWidth='1px' borderRadius='lg'>
                                <VStack align={'left'} spacing={{ base: 2, md: 4}}>
                                    <>
                                    {vaultData?.assets?.length > 0 ? (
                                        <>
                                        <Text color={'gray.100'} fontSize='sm'>Asset</Text>
                                        <Select size='xs' onBlur={(event) => setWithdrawlAsset(parseInt(event.target.value))} onChange={(event) => setWithdrawlAsset(parseInt(event.target.value))} value={withdrawlAsset}>
                                            <option key={0} value={'0'}>Select Token...</option>
                                            {vaultData?.assets.map((asset) => (
                                                <option key={asset["asset-id"]} value={asset["asset-id"]}>{asset.name}</option>
                                            ))}
                                        </Select>
                                        <Text color={'gray.100'} fontSize='sm'>Amount</Text>
                                        <Input type='text' onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWithdrawlAmount(parseInt(event.target.value))} size='xs' value={withdrawlAmount} w='145px' />
                                        <Button size='sm' isDisabled={(withdrawlAsset === 0)? true : false} isLoading={isWithdrawl} loadingText='Withdrawl Asset...' colorScheme={'red'} onClick={withdrawlFunds}>Claim</Button>
                                        </>
                                    ) : (
                                        <Center>
                                            <Box pt={2} pb={2}>
                                                <Text fontSize='xs'>Vault Empty</Text>
                                            </Box>
                                        </Center>
                                    )} 
                                    </>
                                </VStack>
                            </Box>
                        </Collapse>
                   </Box>
                </Flex>
                </>
                ) }
            </Container>
        </Box> 
    )
}