const teal = `#pragma version 8
intcblock 0 1 4
bytecblock 0x617361 0x7061796d656e745f617361 0x6173615f616d74 0x73616c655f7374617274 0x73616c655f7072696365
txn NumAppArgs
intc_0 // 0
==
bnz main_l12
txna ApplicationArgs 0
pushbytes 0x82498b4a // "opt_into_asset(asset,asset)void"
==
bnz main_l11
txna ApplicationArgs 0
pushbytes 0x7d39cca9 // "start_sale(uint64,axfer)void"
==
bnz main_l10
txna ApplicationArgs 0
pushbytes 0x23a973b6 // "claim_asset(uint64,asset,asset,account,account,account)void"
==
bnz main_l9
txna ApplicationArgs 0
pushbytes 0x24378d3c // "delete()void"
==
bnz main_l8
txna ApplicationArgs 0
pushbytes 0x0154b325 // "buy(axfer,uint64,asset,asset,account,account,account)void"
==
bnz main_l7
err
main_l7:
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
store 11
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 12
txna ApplicationArgs 3
intc_0 // 0
getbyte
store 13
txna ApplicationArgs 4
intc_0 // 0
getbyte
store 14
txna ApplicationArgs 5
intc_0 // 0
getbyte
store 15
txna ApplicationArgs 6
intc_0 // 0
getbyte
store 16
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
load 13
load 14
load 15
load 16
callsub buy_9
intc_1 // 1
return
main_l8:
txn OnCompletion
pushint 5 // DeleteApplication
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
callsub delete_8
intc_1 // 1
return
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
btoi
store 4
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 5
txna ApplicationArgs 3
intc_0 // 0
getbyte
store 6
txna ApplicationArgs 4
intc_0 // 0
getbyte
store 7
txna ApplicationArgs 5
intc_0 // 0
getbyte
store 8
txna ApplicationArgs 6
intc_0 // 0
getbyte
store 9
load 4
load 5
load 6
load 7
load 8
load 9
callsub claimasset_7
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
btoi
store 2
txn GroupIndex
intc_1 // 1
-
store 3
load 3
gtxns TypeEnum
intc_2 // axfer
==
assert
load 2
load 3
callsub startsale_6
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
store 0
txna ApplicationArgs 2
intc_0 // 0
getbyte
store 1
load 0
load 1
callsub optintoasset_5
intc_1 // 1
return
main_l12:
txn OnCompletion
intc_0 // NoOp
==
bnz main_l14
err
main_l14:
txn ApplicationID
intc_0 // 0
==
assert
callsub create_4
intc_1 // 1
return

// pay_with_close_remainder_to
paywithcloseremainderto_0:
proto 4 0
intc_2 // axfer
itxn_field TypeEnum
frame_dig -4
itxn_field AssetReceiver
frame_dig -3
itxn_field AssetAmount
frame_dig -2
itxn_field XferAsset
intc_0 // 0
itxn_field Fee
frame_dig -1
itxn_field AssetCloseTo
retsub

// free_app_mbr
freeappmbr_1:
proto 0 0
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
retsub

// opt_in
optin_2:
proto 1 0
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
global CurrentApplicationAddress
itxn_field AssetReceiver
frame_dig -1
itxn_field XferAsset
intc_0 // 0
itxn_field AssetAmount
retsub

// opt_out
optout_3:
proto 2 0
intc_2 // axfer
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
frame_dig -2
itxn_field XferAsset
intc_0 // 0
itxn_field AssetAmount
global CreatorAddress
itxn_field AssetReceiver
frame_dig -1
itxn_field AssetCloseTo
retsub

// create
create_4:
proto 0 0
bytec_0 // "asa"
intc_0 // 0
app_global_put
bytec_2 // "asa_amt"
intc_0 // 0
app_global_put
bytec_1 // "payment_asa"
intc_0 // 0
app_global_put
bytec 4 // "sale_price"
intc_0 // 0
app_global_put
bytec_3 // "sale_start"
intc_0 // 0
app_global_put
retsub

// opt_into_asset
optintoasset_5:
proto 2 0
txn Sender
global CreatorAddress
==
// unauthorized
assert
bytec_3 // "sale_start"
app_global_get
intc_0 // 0
==
assert
bytec_0 // "asa"
app_global_get
intc_0 // 0
==
assert
bytec_1 // "payment_asa"
app_global_get
intc_0 // 0
==
assert
bytec_0 // "asa"
frame_dig -2
txnas Assets
app_global_put
bytec_1 // "payment_asa"
frame_dig -1
txnas Assets
app_global_put
itxn_begin
frame_dig -2
txnas Assets
callsub optin_2
itxn_next
frame_dig -1
txnas Assets
callsub optin_2
itxn_submit
retsub

// start_sale
startsale_6:
proto 2 0
txn Sender
global CreatorAddress
==
// unauthorized
assert
bytec_0 // "asa"
app_global_get
intc_0 // 0
!=
assert
bytec_1 // "payment_asa"
app_global_get
intc_0 // 0
!=
assert
bytec_3 // "sale_start"
app_global_get
intc_0 // 0
==
assert
bytec 4 // "sale_price"
app_global_get
intc_0 // 0
==
assert
bytec_2 // "asa_amt"
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
bytec_0 // "asa"
app_global_get
==
assert
frame_dig -2
intc_0 // 0
>
assert
bytec_3 // "sale_start"
global LatestTimestamp
app_global_put
bytec 4 // "sale_price"
frame_dig -2
app_global_put
bytec_2 // "asa_amt"
frame_dig -1
gtxns AssetAmount
app_global_put
retsub

// claim_asset
claimasset_7:
proto 6 0
bytec_3 // "sale_start"
app_global_get
intc_0 // 0
!=
assert
bytec_2 // "asa_amt"
app_global_get
intc_0 // 0
!=
assert
bytec_3 // "sale_start"
app_global_get
intc_0 // 0
!=
assert
bytec 4 // "sale_price"
app_global_get
intc_0 // 0
!=
assert
bytec_2 // "asa_amt"
app_global_get
frame_dig -6
==
assert
bytec_0 // "asa"
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
frame_dig -3
txnas Accounts
global CreatorAddress
==
assert
bytec_0 // "asa"
intc_0 // 0
app_global_put
bytec_2 // "asa_amt"
intc_0 // 0
app_global_put
bytec_1 // "payment_asa"
intc_0 // 0
app_global_put
bytec 4 // "sale_price"
intc_0 // 0
app_global_put
bytec_3 // "sale_start"
intc_0 // 0
app_global_put
itxn_begin
frame_dig -3
txnas Accounts
frame_dig -6
frame_dig -5
txnas Assets
frame_dig -2
txnas Accounts
callsub paywithcloseremainderto_0
itxn_next
frame_dig -4
txnas Assets
frame_dig -1
txnas Accounts
callsub optout_3
itxn_next
callsub freeappmbr_1
itxn_submit
retsub

// delete
delete_8:
proto 0 0
itxn_begin
callsub freeappmbr_1
itxn_submit
retsub

// buy
buy_9:
proto 7 0
frame_dig -3
txnas Accounts
global CreatorAddress
==
assert
bytec_0 // "asa"
app_global_get
frame_dig -5
txnas Assets
==
assert
bytec_2 // "asa_amt"
app_global_get
frame_dig -6
==
assert
bytec_1 // "payment_asa"
app_global_get
frame_dig -4
txnas Assets
==
assert
bytec_1 // "payment_asa"
app_global_get
frame_dig -7
gtxns XferAsset
==
assert
bytec 4 // "sale_price"
app_global_get
frame_dig -7
gtxns AssetAmount
<=
assert
frame_dig -7
gtxns AssetReceiver
frame_dig -3
txnas Accounts
==
assert
bytec_0 // "asa"
intc_0 // 0
app_global_put
bytec_2 // "asa_amt"
intc_0 // 0
app_global_put
bytec_1 // "payment_asa"
intc_0 // 0
app_global_put
bytec 4 // "sale_price"
intc_0 // 0
app_global_put
bytec_3 // "sale_start"
intc_0 // 0
app_global_put
itxn_begin
frame_dig -7
gtxns Sender
frame_dig -6
frame_dig -5
txnas Assets
frame_dig -2
txnas Accounts
callsub paywithcloseremainderto_0
itxn_next
frame_dig -4
txnas Assets
frame_dig -1
txnas Accounts
callsub optout_3
itxn_next
callsub freeappmbr_1
itxn_submit
retsub`;

export default teal;