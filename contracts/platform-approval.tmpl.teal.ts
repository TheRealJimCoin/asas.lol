const teal = `#pragma version 8
intcblock 0 1 4
bytecblock 0x686967686573745f626964646572 0x7061796d656e745f617361 0x617361 0x61756374696f6e5f656e64 0x686967686573745f626964 0x 0x6173615f616d74
txn NumAppArgs
intc_0 // 0
==
bnz main_l16
txna ApplicationArgs 0
pushbytes 0x82498b4a // "opt_into_asset(asset,asset)void"
==
bnz main_l15
txna ApplicationArgs 0
pushbytes 0xf0aa7023 // "start_auction(uint64,uint64,axfer)void"
==
bnz main_l14
txna ApplicationArgs 0
pushbytes 0x73a2535e // "claim_asset_no_bid(asset,asset,account,account,account)void"
==
bnz main_l13
txna ApplicationArgs 0
pushbytes 0x24378d3c // "delete()void"
==
bnz main_l12
txna ApplicationArgs 0
pushbytes 0x2cbe339c // "bid(axfer,asset,account)void"
==
bnz main_l11
txna ApplicationArgs 0
pushbytes 0x6e629e02 // "claim_bid(asset,account)void"
==
bnz main_l10
txna ApplicationArgs 0
pushbytes 0x14712534 // "claim_asset(asset,account,account)void"
==
bnz main_l9
err
main_l9:
txn OnCompletion
intc_0 // NoOp
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
txna ApplicationArgs 1
intc_0 // 0
getbyte
store 15
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 16
txna ApplicationArgs 3
intc_0 // 0
getbyte
store 17
load 15
load 16
load 17
callsub claimasset_8
intc_1 // 1
return
main_l10:
txn OnCompletion
intc_0 // NoOp
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
txna ApplicationArgs 1
intc_0 // 0
getbyte
store 13
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 14
load 13
load 14
callsub claimbid_7
intc_1 // 1
return
main_l11:
txn OnCompletion
intc_0 // NoOp
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
txna ApplicationArgs 1
intc_0 // 0
getbyte
store 11
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 12
txn GroupIndex
intc_1 // 1
-
store 10
load 10
gtxns TypeEnum
intc_2 // axfer
==
assert
load 10
load 11
load 12
callsub bid_6
intc_1 // 1
return
main_l12:
txn OnCompletion
pushint 5 // DeleteApplication
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
callsub delete_4
intc_1 // 1
return
main_l13:
txn OnCompletion
intc_0 // NoOp
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
txna ApplicationArgs 1
intc_0 // 0
getbyte
store 5
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 6
txna ApplicationArgs 3
intc_0 // 0
getbyte
store 7
txna ApplicationArgs 4
intc_0 // 0
getbyte
store 8
txna ApplicationArgs 5
intc_0 // 0
getbyte
store 9
load 5
load 6
load 7
load 8
load 9
callsub claimassetnobid_3
intc_1 // 1
return
main_l14:
txn OnCompletion
intc_0 // NoOp
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
txna ApplicationArgs 1
btoi
store 2
txna ApplicationArgs 2
btoi
store 3
txn GroupIndex
intc_1 // 1
-
store 4
load 4
gtxns TypeEnum
intc_2 // axfer
==
assert
load 2
load 3
load 4
callsub startauction_2
intc_1 // 1
return
main_l15:
txn OnCompletion
intc_0 // NoOp
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
txna ApplicationArgs 1
intc_0 // 0
getbyte
store 0
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 1
load 0
load 1
callsub optintoasset_1
intc_1 // 1
return
main_l16:
txn OnCompletion
intc_0 // NoOp
==
bnz main_l18
err
main_l18:
txn ApplicationID
intc_0 // 0
==
assert
callsub create_0
intc_1 // 1
return

// create
create_0:
proto 0 0
bytec_2 // "asa"
intc_0 // 0
app_global_put
bytec 6 // "asa_amt"
intc_0 // 0
app_global_put
bytec_3 // "auction_end"
intc_0 // 0
app_global_put
bytec 4 // "highest_bid"
intc_0 // 0
app_global_put
bytec_0 // "highest_bidder"
bytec 5 // ""
app_global_put
bytec_1 // "payment_asa"
intc_0 // 0
app_global_put
retsub

// opt_into_asset
optintoasset_1:
proto 2 0
txn Sender
global CreatorAddress
==
// unauthorized
assert
bytec_2 // "asa"
app_global_get
intc_0 // 0
==
assert
bytec_1 // "payment_asa"
app_global_get
intc_0 // 0
==
assert
bytec_2 // "asa"
frame_dig -2
txnas Assets
app_global_put
bytec_1 // "payment_asa"
frame_dig -1
txnas Assets
app_global_put
itxn_begin
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
global CurrentApplicationAddress
itxn_field AssetReceiver
frame_dig -2
txnas Assets
itxn_field XferAsset
intc_0 // 0
itxn_field AssetAmount
itxn_next
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
global CurrentApplicationAddress
itxn_field AssetReceiver
frame_dig -1
txnas Assets
itxn_field XferAsset
intc_0 // 0
itxn_field AssetAmount
itxn_submit
retsub

// start_auction
startauction_2:
proto 3 0
txn Sender
global CreatorAddress
==
// unauthorized
assert
bytec_3 // "auction_end"
app_global_get
intc_0 // 0
==
assert
frame_dig -1
gtxns AssetReceiver
global CurrentApplicationAddress
==
assert
frame_dig -1
gtxns XferAsset
bytec_2 // "asa"
app_global_get
==
assert
bytec 6 // "asa_amt"
frame_dig -1
gtxns AssetAmount
app_global_put
bytec_3 // "auction_end"
global LatestTimestamp
frame_dig -2
+
app_global_put
bytec 4 // "highest_bid"
frame_dig -3
app_global_put
retsub

// claim_asset_no_bid
claimassetnobid_3:
proto 5 0
global LatestTimestamp
bytec_3 // "auction_end"
app_global_get
>=
assert
bytec_0 // "highest_bidder"
app_global_get
bytec 5 // ""
==
assert
frame_dig -3
txnas Accounts
global CreatorAddress
==
assert
bytec_2 // "asa"
app_global_get
frame_dig -5
txnas Assets
==
assert
bytec_1 // "payment_asa"
app_global_get
frame_dig -4
txnas Assets
==
assert
itxn_begin
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
bytec_2 // "asa"
app_global_get
itxn_field XferAsset
bytec 6 // "asa_amt"
app_global_get
itxn_field AssetAmount
frame_dig -3
txnas Accounts
itxn_field AssetReceiver
frame_dig -2
txnas Accounts
itxn_field AssetCloseTo
itxn_next
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
bytec_1 // "payment_asa"
app_global_get
itxn_field XferAsset
intc_0 // 0
itxn_field AssetAmount
frame_dig -3
txnas Accounts
itxn_field AssetReceiver
frame_dig -1
txnas Accounts
itxn_field AssetCloseTo
itxn_submit
retsub

// delete
delete_4:
proto 0 0
itxn_begin
intc_1 // pay
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
global CreatorAddress
itxn_field Receiver
global CreatorAddress
itxn_field CloseRemainderTo
intc_0 // 0
itxn_field Amount
itxn_submit
retsub

// pay
pay_5:
proto 3 0
itxn_begin
intc_2 // axfer
itxn_field TypeEnum
frame_dig -3
itxn_field AssetReceiver
frame_dig -2
itxn_field AssetAmount
frame_dig -1
itxn_field XferAsset
intc_0 // 0
itxn_field Fee
itxn_submit
retsub

// bid
bid_6:
proto 3 0
global LatestTimestamp
bytec_3 // "auction_end"
app_global_get
<
assert
frame_dig -3
gtxns AssetAmount
bytec 4 // "highest_bid"
app_global_get
>
assert
frame_dig -3
gtxns AssetReceiver
global CurrentApplicationAddress
==
assert
frame_dig -3
gtxns XferAsset
bytec_1 // "payment_asa"
app_global_get
==
assert
bytec_0 // "highest_bidder"
app_global_get
bytec 5 // ""
!=
bz bid_6_l2
bytec_0 // "highest_bidder"
app_global_get
bytec 4 // "highest_bid"
app_global_get
bytec_1 // "payment_asa"
app_global_get
callsub pay_5
bid_6_l2:
bytec 4 // "highest_bid"
frame_dig -3
gtxns AssetAmount
app_global_put
bytec_0 // "highest_bidder"
frame_dig -3
gtxns Sender
app_global_put
retsub

// claim_bid
claimbid_7:
proto 2 0
global LatestTimestamp
bytec_3 // "auction_end"
app_global_get
>=
assert
bytec_0 // "highest_bidder"
app_global_get
bytec 5 // ""
!=
assert
itxn_begin
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
bytec_1 // "payment_asa"
app_global_get
itxn_field XferAsset
bytec 4 // "highest_bid"
app_global_get
itxn_field AssetAmount
global CreatorAddress
itxn_field AssetReceiver
global CreatorAddress
itxn_field AssetCloseTo
itxn_submit
retsub

// claim_asset
claimasset_8:
proto 3 0
global LatestTimestamp
bytec_3 // "auction_end"
app_global_get
>=
assert
bytec_0 // "highest_bidder"
app_global_get
bytec 5 // ""
!=
assert
itxn_begin
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
bytec_2 // "asa"
app_global_get
itxn_field XferAsset
bytec 6 // "asa_amt"
app_global_get
itxn_field AssetAmount
bytec_0 // "highest_bidder"
app_global_get
itxn_field AssetReceiver
frame_dig -1
txnas Accounts
itxn_field AssetCloseTo
itxn_submit
retsub`;

export default teal;