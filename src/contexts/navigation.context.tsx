import React, { useContext, useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { SessionWallet, PermissionResult, SignedTxn, Wallet } from '../../lib/algorand-session-wallet'
import { getWalletAssetData } from '../../lib/algorand'
import { platform_settings as ps } from '../../lib/platform-conf'
import { RequestPopupProps, RequestPopup, PopupPermission, DefaultPopupProps } from '../RequestPopup'

export interface FraktionContextType {
  defaultWallet: string;
  sessionWallet: Wallet;
  updateWallet: Function;
  dripAssets: any;
  tokenList: any;
  algoBalance: any;
  walletAssets: any;
  handleFetchAuctions: Function;
  auctions: any;
  listings: any;
  currency: any;
  setCurrency: any;
  fetchNextPage: any;
  fetchNextListingPage: any;
  hasNextPage: boolean;
  hasNextListingPage: boolean;
  fetchTokenNextPage: any;
  hasTokenNextPage: boolean;
  connected: Promise<boolean>;
  loading: boolean;
  popupProps: typeof DefaultPopupProps;
}

const PAGE_SIZE=8;
const TOKEN_PAGE_SIZE=6;

export const NavigtionContext = React.createContext<FraktionContextType>({
  //@ts-ignore
  sessionWallet: () => {},
  //@ts-ignore
  updateWallet: () => {},
  //@ts-ignore
  dripAssets: () => {},
  //@ts-ignore
  tokenList: () => {},
  //@ts-ignore
  algoBalance: () => {},
  //@ts-ignore
  walletAssets: () => {},
  //@ts-ignore
  handleFetchAuctions: () => {},
  //@ts-ignore
  auctions: () => {},
  //@ts-ignore
  listings: () => {},
  //@ts-ignore
  currency: () => {},
  //@ts-ignore
  setCurrency: () => {},
  //@ts-ignore
  fetchNextPage: () => {},
  //@ts-ignore
  fetchNextListingPage: () => {},
  //@ts-ignore
  fetchTokenNextPage: () => {},
  //@ts-ignore
  hasNextPage: true,
  //@ts-ignore
  hasNextListingPage: true,
  //@ts-ignore
  hasTokenNextPage: true,
  //@ts-ignore
  connected: async (): Promise<boolean> => { return false; },
  //@ts-ignore
  loading: false,
});

export const NavigtionProvider = ({
  children = null,
}: {
  children: JSX.Element | null;
}): JSX.Element => {
  
  const timeout = async(ms: number) => new Promise(res => setTimeout(res, ms));
  const popupCallback = {
    async request(pr: PermissionResult): Promise<SignedTxn[]> {
      let result = PopupPermission.Undecided;
      setPopupProps({isOpen:true, handleOption: (res: PopupPermission)=>{ result = res} })		
      
      async function wait(): Promise<SignedTxn[]> {
        while(result === PopupPermission.Undecided) await timeout(50);

        if(result == PopupPermission.Proceed) return pr.approved()
        return pr.declined()
      }

      //get signed
      const txns = await wait()

      //close popup
      setPopupProps(DefaultPopupProps)

      //return signed
      return txns
    }
  }
  const sw = new SessionWallet(ps.algod.network, popupCallback)
  const [sessionWallet, setSessionWallet] =  useState<any>(sw)
  const [loading, setLoading] = React.useState(true)
  //@ts-ignore
  const [popupProps, setPopupProps] = useState<any>(DefaultPopupProps)
  const [isOptIntoAsset, setOptIntoAsset] = React.useState([])
  const [walletAssets, setWalletAssets] = React.useState([])
  const [tokenList, setTokenList] = React.useState([])
  const [dripAssets, setDripAssets] = React.useState([])
  const [algoBalance, setAlgoBalance] = React.useState()
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(true)
  const [hasNextListingPage, setHasNextListingPage] = React.useState<boolean>(true)
  const [hasTokenNextPage, setHasTokenNextPage] = React.useState<boolean>(true)
  const [auctions, setAuctions] = React.useState([])
  const [listings, setListings] = React.useState([])
  const [currency, setCurrency] = React.useState({creator:"", asset_id:0, decimal:0, unitname:"ALGO", rate:"1"})
  let [page, setPage] = useState<number>(0)
  let [pageToken, setTokenPage] = useState<number>(0)
  const [connected, setConnected] = useState<Promise<boolean>>(sw.connected())
  const updateWallet = async (sw: SessionWallet) => {
    setSessionWallet(sw)
    setConnected(sw.connected())
    
    const defaultAccount = await sw.getDefaultAccount()
    setDefaultWallet(defaultAccount)
  };
  const [defaultWallet, setDefaultWallet] = React.useState('')

  const fetchNextPage = async () => {
    let nextpage = page + 1
    let offset = (nextpage===1)? 0 : PAGE_SIZE * (page)

    const auctionsResponse = await fetch('/api/getAuctions', {
        method: 'POST',
        body: JSON.stringify({first: PAGE_SIZE, offset: offset})
    })
    const auctionsData = await auctionsResponse.json()
    page = page == 0 ? 1 : page + 1

    if(PAGE_SIZE > auctionsData.data.queryASAsAuctions.length){
      setHasNextPage(false)
    }
    setPage(page)
    setAuctions([...auctions, ...auctionsData.data.queryASAsAuctions])
  }
  
  const fetchNextListingPage = async () => {
    let nextpage = page + 1
    let offset = (nextpage===1)? 0 : PAGE_SIZE * (page)

    const listingsResponse = await fetch('/api/getListings', {
        method: 'POST',
        body: JSON.stringify({first: PAGE_SIZE, offset: offset})
    })
    const listingsData = await listingsResponse.json()
    page = page == 0 ? 1 : page + 1

    if(PAGE_SIZE > listingsData.data.queryASAsListings.length){
      setHasNextListingPage(false)
    }
    setPage(page)
    setListings([...listings, ...listingsData.data.queryASAsListings])
  }

  const fetchTokenNextPage = async () => {
    //console.log("fetchTokenNextPage()")
    let nextpage = pageToken + 1
    let offset = (nextpage===1)? 0 : TOKEN_PAGE_SIZE * (pageToken)

    const tokensResponse = await fetch('/api/getTokens', {
        method: 'POST',
        body: JSON.stringify({first: TOKEN_PAGE_SIZE, offset: offset})
    })
    const tokensData = await tokensResponse.json()
    pageToken = pageToken == 0 ? 1 : pageToken + 1

    if(TOKEN_PAGE_SIZE > tokensData.data.queryTokens.length){
      setHasTokenNextPage(false)
    }
    setTokenPage(pageToken)
    const getDefaultAccount = await sessionWallet.getDefaultAccount()
    await getWalletAssetData(getDefaultAccount, tokensData.data.queryTokens).then((assetData)=> { 
        //console.log("assetData", assetData)
        if(assetData) {
          setWalletAssets(assetData.walletassets)
          setOptIntoAsset(assetData.assets)
          setTokenList([...tokenList, ...assetData.tokenBal])
          setAlgoBalance(assetData.algoBalance)
        }
    }).catch((err)=>{ 
        console.log("error getWalletAssetData",err)
    }) 
  }

  const handleFetchAuctions = async () => {
   
    const auctionsResponse = await fetch('/api/getAuctions', {
        method: 'POST',
        body: JSON.stringify({first: PAGE_SIZE, offset: 0})
    })
    
    const auctionData = await auctionsResponse.json()
    
    const listingsResponse = await fetch('/api/getListings', {
      method: 'POST',
      body: JSON.stringify({first: PAGE_SIZE, offset: 0})
    })
  
    const listingsData = await listingsResponse.json()
    setPage(1)
    setTokenPage(1)
    setHasNextPage(true)
    setHasNextListingPage(true)
    setHasTokenNextPage(true)
    setAuctions(auctionData.data.queryASAsAuctions)
    setListings(listingsData.data.queryASAsListings)
    if(connected) {
      const tokensResponse = await fetch("/api/getTokens", {
        method: 'POST',
        body: JSON.stringify({first: TOKEN_PAGE_SIZE, offset: 0})
      })
      const tokensData = await tokensResponse.json()
      const getDefaultAccount = await sessionWallet.getDefaultAccount()
      await getWalletAssetData(getDefaultAccount, tokensData.data.queryTokens).then((assetData)=> { 
          if(assetData) {
            setWalletAssets(assetData.walletassets)
            setOptIntoAsset(assetData.assets)
            setTokenList(assetData.tokenBal)
            setDripAssets(assetData.dripAssets)
            setAlgoBalance(assetData.algoBalance)
          }
      }).catch((err)=>{ 
          console.log("error getWalletAssetData",err)
      }) 
    } 
    setLoading(true)
  }

  useEffect(()=>{ 
      const handleFetchTokens = async () => {
        const defaultAccount = await sessionWallet.getDefaultAccount()
        setDefaultWallet(defaultAccount)
      }
      if(!sessionWallet.getDefaultAccount()) return 
        handleFetchTokens()
  }, [sessionWallet])

  useEffect(()=> {
    handleFetchAuctions()
    if(!connected) return
      updateWallet(sw);
  },[connected])
  //@ts-ignore

  return (
    <NavigtionContext.Provider
      value={{
        defaultWallet,
        sessionWallet,
        updateWallet,
        dripAssets,
        tokenList,
        algoBalance,
        walletAssets,
        handleFetchAuctions,
        auctions,
        listings,
        currency,
        setCurrency,
        fetchNextPage,
        fetchNextListingPage,
        fetchTokenNextPage,
        hasNextPage,
        hasNextListingPage,
        //@ts-ignore
        hasTokenNextPage,
        //@ts-ignore
        connected,
        //@ts-ignore
        loading,
        popupProps
      }}
    >
      {children}
    </NavigtionContext.Provider>
  );
};

export const useNavigation = () => {
  const {
    defaultWallet,
    sessionWallet,
    updateWallet,
    dripAssets,
    tokenList,
    algoBalance,
    walletAssets,
    handleFetchAuctions,
    auctions,
    listings,
    currency,
    setCurrency,
    fetchNextPage,
    fetchNextListingPage,
    fetchTokenNextPage,
    hasNextPage,
    hasNextListingPage,
    hasTokenNextPage,
    connected,
    loading,
    popupProps
  } = useContext(NavigtionContext);
  return {
    defaultWallet,
    sessionWallet,
    updateWallet,
    dripAssets,
    tokenList,
    algoBalance,
    walletAssets,
    handleFetchAuctions,
    auctions,
    listings,
    currency,
    setCurrency,
    fetchNextPage,
    fetchNextListingPage,
    fetchTokenNextPage,
    hasNextPage,
    hasNextListingPage,
    hasTokenNextPage,
    connected,
    loading,
    popupProps
  };
};
