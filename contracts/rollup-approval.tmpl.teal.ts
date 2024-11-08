const teal = `#pragma version 8
intcblock 0 1 4
bytecblock 0x6d616e61676572 0x 0x746f6b656e5f6964 0x6e6f7465 0x72657365727665 0x75726c
txn NumAppArgs
intc_0 // 0
==
bnz main_l14
txna ApplicationArgs 0
pushbytes 0xca566102 // "mint(string,account,string,asset)void"
==
bnz main_l13
txna ApplicationArgs 0
pushbytes 0x7549cae4 // "opt_in_asset(asset)void"
==
bnz main_l12
txna ApplicationArgs 0
pushbytes 0x935f5966 // "opt_out_asset(asset,account)void"
==
bnz main_l11
txna ApplicationArgs 0
pushbytes 0xc09dc8ef // "withdraw(asset,uint64,account)void"
==
bnz main_l10
txna ApplicationArgs 0
pushbytes 0xcef011c4 // "grant(account,axfer)void"
==
bnz main_l9
txna ApplicationArgs 0
pushbytes 0x24378d3c // "delete()void"
==
bnz main_l8
err
main_l8:
txn OnCompletion
pushint 5 // DeleteApplication
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
callsub deletecaster_16
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
callsub grantcaster_15
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
callsub withdrawcaster_14
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
callsub optoutassetcaster_13
intc_1 // 1
return
main_l12:
txn OnCompletion
intc_0 // NoOp
==
txn ApplicationID
intc_0 // 0
!=
&&
assert
callsub optinassetcaster_12
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
callsub mintcaster_11
intc_1 // 1
return
main_l14:
txn OnCompletion
intc_0 // NoOp
==
bnz main_l16
err
main_l16:
txn ApplicationID
intc_0 // 0
==
assert
callsub create_4
intc_1 // 1
return

// pay
pay_0:
proto 3 0
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
retsub

// free_app_mbr
freeappmbr_1:
proto 0 0
intc_1 // pay
itxn_field TypeEnum
intc_0 // 0
itxn_field Fee
bytec_0 // "manager"
app_global_get
itxn_field Receiver
bytec_0 // "manager"
app_global_get
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
bytec_0 // "manager"
global CreatorAddress
app_global_put
bytec_3 // "note"
bytec_1 // ""
app_global_put
bytec 4 // "reserve"
global CreatorAddress
app_global_put
bytec_2 // "token_id"
intc_0 // 0
app_global_put
bytec 5 // "url"
bytec_1 // ""
app_global_put
retsub

// mint
mint_5:
proto 4 0
txn Sender
bytec_0 // "manager"
app_global_get
==
// unauthorized
assert
bytec 5 // "url"
app_global_get
bytec_1 // ""
==
assert
bytec_3 // "note"
app_global_get
bytec_1 // ""
==
assert
bytec 4 // "reserve"
app_global_get
global CreatorAddress
==
assert
bytec_2 // "token_id"
app_global_get
intc_0 // 0
==
assert
itxn_begin
frame_dig -1
txnas Assets
callsub optin_2
itxn_submit
bytec 5 // "url"
frame_dig -4
app_global_put
bytec_3 // "note"
frame_dig -2
app_global_put
bytec 4 // "reserve"
frame_dig -3
txnas Accounts
app_global_put
bytec_2 // "token_id"
frame_dig -1
txnas Assets
app_global_put
retsub

// opt_in_asset
optinasset_6:
proto 1 0
itxn_begin
frame_dig -1
txnas Assets
callsub optin_2
itxn_submit
retsub

// opt_out_asset
optoutasset_7:
proto 2 0
bytec_2 // "token_id"
app_global_get
frame_dig -2
txnas Assets
!=
assert
itxn_begin
frame_dig -2
txnas Assets
frame_dig -1
txnas Accounts
callsub optout_3
itxn_submit
retsub

// withdraw
withdraw_8:
proto 3 0
txn Sender
bytec_0 // "manager"
app_global_get
==
// unauthorized
assert
itxn_begin
frame_dig -1
txnas Accounts
frame_dig -2
frame_dig -3
txnas Assets
callsub pay_0
itxn_submit
retsub

// grant
grant_9:
proto 2 0
frame_dig -1
gtxns AssetReceiver
global CurrentApplicationAddress
==
assert
frame_dig -1
gtxns XferAsset
bytec_2 // "token_id"
app_global_get
==
assert
frame_dig -1
gtxns AssetAmount
intc_0 // 0
>
assert
itxn_begin
frame_dig -2
txnas Accounts
frame_dig -1
gtxns AssetAmount
frame_dig -1
gtxns XferAsset
callsub pay_0
itxn_submit
bytec_0 // "manager"
frame_dig -2
txnas Accounts
app_global_put
retsub

// delete
delete_10:
proto 0 0
txn Sender
bytec_0 // "manager"
app_global_get
==
// unauthorized
assert
itxn_begin
callsub freeappmbr_1
itxn_submit
retsub

// mint_caster
mintcaster_11:
proto 0 0
bytec_1 // ""
intc_0 // 0
bytec_1 // ""
intc_0 // 0
txna ApplicationArgs 1
frame_bury 0
txna ApplicationArgs 2
intc_0 // 0
getbyte
frame_bury 1
txna ApplicationArgs 3
frame_bury 2
txna ApplicationArgs 4
intc_0 // 0
getbyte
frame_bury 3
frame_dig 0
frame_dig 1
frame_dig 2
frame_dig 3
callsub mint_5
retsub

// opt_in_asset_caster
optinassetcaster_12:
proto 0 0
intc_0 // 0
txna ApplicationArgs 1
intc_0 // 0
getbyte
frame_bury 0
frame_dig 0
callsub optinasset_6
retsub

// opt_out_asset_caster
optoutassetcaster_13:
proto 0 0
intc_0 // 0
dup
txna ApplicationArgs 1
intc_0 // 0
getbyte
frame_bury 0
txna ApplicationArgs 2
intc_0 // 0
getbyte
frame_bury 1
frame_dig 0
frame_dig 1
callsub optoutasset_7
retsub

// withdraw_caster
withdrawcaster_14:
proto 0 0
intc_0 // 0
dupn 2
txna ApplicationArgs 1
intc_0 // 0
getbyte
frame_bury 0
txna ApplicationArgs 2
btoi
frame_bury 1
txna ApplicationArgs 3
intc_0 // 0
getbyte
frame_bury 2
frame_dig 0
frame_dig 1
frame_dig 2
callsub withdraw_8
retsub

// grant_caster
grantcaster_15:
proto 0 0
intc_0 // 0
dup
txna ApplicationArgs 1
intc_0 // 0
getbyte
frame_bury 0
txn GroupIndex
intc_1 // 1
-
frame_bury 1
frame_dig 1
gtxns TypeEnum
intc_2 // axfer
==
assert
frame_dig 0
frame_dig 1
callsub grant_9
retsub

// delete_caster
deletecaster_16:
proto 0 0
callsub delete_10
retsub`;

export default teal;