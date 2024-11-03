import React from "react"
import useSWR from "swr"
import { Flex, Select, Button } from '@chakra-ui/react'
import { setCookies } from 'cookies-next'
import { NotAllowedIcon } from '@chakra-ui/icons'

type NFDProps = {
    sessionWallet: any
    handleChangeAccount: any
    disconnectWallet: any
    defaultAddress: any
    accountlist: any
    defaultValue: any
}

const fetcher = (url: string) => fetch(url).then((res) => (res.status === 404)? [] : res.json())

export default function NFD(props: NFDProps) {

  const { data, error } = useSWR(
    "https://api.nf.domains/nfd/lookup?address=" + props.accountlist.join('&address='),
    fetcher
  )
  //console.log("NFDprops: ", props)
  function getNFD(addressToSearch) {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const nfdWallet = data[addressToSearch];
    return nfdWallet ? nfdWallet?.name : addressToSearch.substring(0, 5) + '...' + addressToSearch.slice(-4);
  }

  if (error) return props.defaultAddress
  if (!data) return <option>Loading...</option>
  if (document && data) {
    //var cwnfd = document.getElementById("nfd") //not type script compatible
    var cwnfd = (document.getElementById("nfd")) as HTMLSelectElement;
    if(cwnfd?.selectedOptions[0]?.innerText.includes('.algo')) {
      setCookies('cw_nfd', cwnfd?.selectedOptions[0]?.innerText)
    } else {
      setCookies('cw_nfd', null)
    } 
  }
  
  const onSelectChange = async (e) => {
    var cwnfd = e.target.selectedOptions[0]?.innerText
    //console.log("onSelectChange", cwnfd)
    if(cwnfd.includes('.algo')) {
      setCookies('cw_nfd', cwnfd)
    } else {
      setCookies('cw_nfd', null)
    }
    props.handleChangeAccount(e)
  }

  return (
    <>
    <Flex w={'100%'}>
     <Select 
        ml={1} 
        mr={1} 
        id={'nfd'}
        onChange={(e) => onSelectChange(e)} 
        defaultValue={props.sessionWallet.accountIndex()} >
        {props.accountlist.map((addr, idx) => (
        <option value={idx} key={idx}>{getNFD(addr)}</option>
      ))}
    </Select>
    <Button mr={1} onClick={props.disconnectWallet}><NotAllowedIcon/></Button>
  </Flex>
  </>
  )
}
