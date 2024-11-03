import { Transaction } from "algosdk";
import { PermissionCallback, SignedTxn, Wallet } from "./wallet";
import type AVMWebProviderSDK from "@agoralabs-sh/avm-web-provider";
declare class KibisisConnectWallet implements Wallet {
    accounts: string[];
    defaultAccount: number;
    network: string;
    permissionCallback?: PermissionCallback;
    kibisisConnect: AVMWebProviderSDK;
    constructor();
    static displayName(): string;
    displayName(): string;
    static img(inverted: boolean): string;
    img(inverted: boolean): string;
    connect(): Promise<boolean>;
    requestSessionReload(): Promise<void>;
    isConnected(): Promise<boolean>;
    disconnect(): void;
    getDefaultAccount(): Promise<string>;
    signTxn(txns: Transaction[]): Promise<SignedTxn[]>;
    signBytes(b: Uint8Array, permissionCallback?: PermissionCallback): Promise<Uint8Array>;
    signTeal(teal: Uint8Array, permissionCallback?: PermissionCallback): Promise<Uint8Array>;
}
export default KibisisConnectWallet;