/* eslint-disable no-console */
'use strict'

import * as React from 'react'
import { SessionWallet, allowedWallets } from '../lib/algorand-session-wallet'
import { HStack, VStack, Modal, ModalBody, ModalOverlay, ModalContent, ModalHeader, ModalFooter, Box, Button, Image, Select } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { showInfo, showErrorToaster } from '../src/Toaster'
import { useDisclosure } from "@chakra-ui/react"
import { getCookie, setCookies, removeCookies } from 'cookies-next';
import { useRouter } from 'next/router'
import NFD from '../components/NFD'

type AlgorandWalletConnectorProps = {
    darkMode: boolean
    connected: Promise<boolean>
    sessionWallet: SessionWallet
    updateWallet(sw: SessionWallet)
}

export function AlgorandWalletConnector(props:AlgorandWalletConnectorProps)  {

    const [selectorOpen, setSelectorOpen] = useState(false)
    const cancelRef = useRef()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const router = useRouter();
    const refreshData = () => {
        router.replace(router.asPath);
    }

    useEffect(()=>{ 
        const handleFetchCurrentWallet = async () => {
          const defaultAccount = await props.sessionWallet.getDefaultAccount()
          setCookies('cw', defaultAccount)
        }
        if(props.sessionWallet.connected()) {
            handleFetchCurrentWallet()
            return
        }  
        connectWallet() 
    },[props.sessionWallet])

    async function connectWallet() {
        if(props.sessionWallet.connected() && await props.sessionWallet.wallet.getDefaultAccount() === undefined) {
            disconnectWallet()
        }
        if(props.sessionWallet.connected()) {
            setCookies('cw', await props.sessionWallet.wallet.getDefaultAccount(), { sameSite: true })
            refreshData()
            return
        }

        await props.sessionWallet.connect()
    }

    function disconnectWallet() { 
        props.sessionWallet.disconnect()
        props.updateWallet(new SessionWallet(props.sessionWallet.network, props.sessionWallet.permissionCallback)) 
        removeCookies('cw') 
        removeCookies('cw_nfd') 
        refreshData()
    }

    function handleDisplayWalletSelection() { setSelectorOpen(true) }

    async function handleSelectedWallet(e) {
        const choice = e.currentTarget.id

        if(!(choice in allowedWallets)) {
            if(props.sessionWallet.wallet !== undefined) props.sessionWallet.disconnect()
            return setSelectorOpen(false)
        }

        const sw = new SessionWallet(props.sessionWallet.network, props.sessionWallet.permissionCallback, choice)

        if(!await sw.connect()) {
            sw.disconnect()
            showErrorToaster("Couldn't connect to wallet") 
        }
 
        const interval = setInterval(()=>{
            // If they've already connected, we wont get an on connect, have to check here
            const wc = localStorage.getItem("walletconnect")
            if(wc === null || wc === undefined || wc === "") return;

            const wcObj = JSON.parse(wc)
            const accounts = wcObj.accounts
            if(accounts.length>0){
                clearInterval(interval)
                sw.setAccountList(wcObj.accounts)
                props.updateWallet(new SessionWallet(sw.network, sw.permissionCallback, choice))
            }
        }, 350) 
        
        props.updateWallet(sw)

        setSelectorOpen(false)
    }

    function handleChangeAccount(e) {
        setCookies('cw', props.sessionWallet.wallet.getDefaultAccount(), { sameSite: true })
        var cwnfd = (e.target[parseInt(e.target.value)]?.label)? e.target[parseInt(e.target.value)].label : null
        if(cwnfd.includes('.algo')) {
            setCookies('cw_nfd', cwnfd)
        } else {
            setCookies('cw_nfd', null)
        }
        props.sessionWallet.setAccountIndex(parseInt(e.target.value))
        props.updateWallet(props.sessionWallet)
        refreshData()
    }

    const walletOptions = []
    for(const [k,v] of Object.entries(allowedWallets).splice(0, 6)){
        walletOptions.push((
        <Box key={k}>
            <Button width='100%' id={k} leftIcon={<Image width='45px' height='45px' src={v.img(props.darkMode)} />} size='lg' variant='outline' onClick={handleSelectedWallet}> 
                {v.displayName()}
            </Button>
        </Box>
        ))
    }

    if (!props.connected) return (
        <div>
            <Button variant='outline' color='white' onClick={handleDisplayWalletSelection}>Connect Wallet</Button>
            <Modal isOpen={selectorOpen} onClose={onClose} >
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader fontSize='lg' fontWeight='bold'>
                        Select Wallet
                        </ModalHeader>
                        <ModalBody>
                            <VStack align='stretch'>
                                {walletOptions}
                            </VStack>
                        </ModalBody>
                        <ModalFooter>
                        <Button ref={cancelRef} onClick={handleSelectedWallet}>
                            Cancel
                        </Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            </Modal>
        </div>
    )
    
    const defaultAddress = props.sessionWallet.accountList().map((addr, idx) => {
        return (<option value={idx} key={idx}>{addr.substr(0, 5) + '...' + addr.slice(-4)}</option>)
    })

    return (
        <HStack>
            <NFD handleChangeAccount={handleChangeAccount} 
                sessionWallet={props.sessionWallet} 
                defaultAddress={defaultAddress} 
                defaultValue={props.sessionWallet.accountIndex()} 
                accountlist={props.sessionWallet.accountList()}
                disconnectWallet={disconnectWallet} />
        </HStack>
    )
}