/* eslint-disable no-console */

import { NFT, ARC19Metadata, ARC69Metadata } from './nft'
import {Metadata} from './metadata'
import { Base64 } from "js-base64";

//export async function getArc69MetaFromIpfs(url: string): Promise<NFT> {
export const getArc69MetaFromIpfs = async (url) => {
  
  const req = new Request(url)
  const resp = await fetch(req)
  const body = await resp.blob()
  const arc69MetaData = JSON.parse(await body.text()) as ARC69Metadata
  return arc69MetaData
}

export const getTokenMetaFromHash = async (unitname, name) => {
  //console.log("getTokenMetaFromHash", name)
  const Arc69MetaFromHash = JSON.parse('{"image": "","unitName": "","name": ""}') as ARC69Metadata
  Arc69MetaFromHash.image = "/placeholder.png"
  Arc69MetaFromHash.unitName = unitname
  Arc69MetaFromHash.name = name
  return Arc69MetaFromHash
}

export const getArc19MetaFromHash = async (metahash, url) => {
  if(metahash !== null && metahash !== undefined) {
    //console.log("metahash", metahash)
    //console.log("unitname", unitname)
    //console.log("url", url)
    //console.log("name", name)
    const Arc19MetaFromHash = JSON.parse(Base64.decode(metahash)) as ARC19Metadata
    //Arc19MetaFromHash.name = name
    //console.log("Arc19MetaFromHash1", Arc19MetaFromHash)
    return Arc19MetaFromHash
  } else {
    const Arc19MetaFromHash = JSON.parse('{}') as ARC19Metadata
    //Arc19MetaFromHash.name = name
    return Arc19MetaFromHash
  }
}
export const getArc69MetaFromHash = async (metahash, unitname, url, name) => {
  if(metahash !== null && metahash !== undefined) {
    //console.log("metahash", metahash)
    //console.log("unitname", unitname)
    //console.log("url", url)
    //console.log("name", name)
    const Arc69MetaFromHash = JSON.parse(Base64.decode(metahash)) as ARC69Metadata
    Arc69MetaFromHash.image = url
    Arc69MetaFromHash.unitName = unitname
    Arc69MetaFromHash.name = name
    //console.log("Arc69MetaFromHash1", Arc69MetaFromHash)
    return Arc69MetaFromHash
  } else {
    const Arc69MetaFromHash = JSON.parse('{"image": "","unitName": "","name": ""}') as ARC69Metadata
    Arc69MetaFromHash.image = url
    Arc69MetaFromHash.unitName = unitname
    Arc69MetaFromHash.name = name
    return Arc69MetaFromHash
  }
}
export async function getMimeTypeFromIpfs(url: string): Promise<string> {
  const req = new Request(url, { method:"HEAD" })
  const resp = await fetch(req)
  return resp.headers.get("Content-Type")
}/* 
export const getMimeTypeFromIpfs = async (url) => {
  const req = new Request(url, { method: "HEAD" })
  const resp = await fetch(req)
  return resp.headers.get("Content-Type")
}
export const getMetaFromIpfs = async (url) => {
  const req = new Request(url)
  const resp = await fetch(req)
  const body = await resp.blob()
  const bodyText = await body.text()
  //console.log("bodyText",bodyText)
  const NFTMetadata = JSON.parse(await body.text()) as NFTMetadata
  return NFTMetadata
  //return new NFTMetadata(JSON.parse(await body.text()))
} */
export async function getMetaFromIpfs(url: string): Promise<Metadata> {
  const req = new Request(url)
  const resp = await fetch(req)
  const body = await resp.blob()
  const text = await body.text()
  const parsed = JSON.parse(text)
  return new Metadata({"_raw":text, ...parsed}) 
}