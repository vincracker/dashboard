import { Table,Avatar,Button,Input } from "web3uikit"
import { contractAddresses, abi } from "../constant"
// dont export from moralis when using react
import { useMoralis, useWeb3Contract, useWeb3ExecuteFunction } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"


export default function ForzenTable() {

  const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
  // These get re-rendered every time due to our connect button!
  const chainId = parseInt(chainIdHex)
  // console.log(`ChainId is ${chainId}`)

  const stormAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
  
  const dispatch = useNotification();

  const [frozenList, setFrozenList] = useState([]);

  const {data, error, fetch, isFetching} = useWeb3ExecuteFunction();

  const [freezeAddress, setFreezeAddress] = useState("");

  const handleFreeze = async (address)=>{
    const freezeOptions = {
      abi: abi,
      contractAddress: stormAddress,
      functionName: "freeze",
      params: {
        account:address
      },
    };
    await fetch({
      onError:(error)=>{
        handleError(error);
      },
      onSuccess:(tx)=>handleSuccess(tx),
      params:freezeOptions
    })
  }

  const handleUnfreeze = async(address)=>{
    const unfreezeOptions = {
      abi: abi,
      contractAddress: stormAddress,
      functionName: "unfreeze",
      params: {
        account:address
      },
    };
    await fetch({
      onError:(error)=>{
        handleError(error);
      },
      onSuccess:(tx)=>handleSuccess(tx),
      params:unfreezeOptions
    })
  }


  const { runContractFunction: getFrozenAddresses } = useWeb3Contract({
    abi: abi,
    contractAddress: stormAddress,
    functionName: "getFrozenList",
    params: {},
  })

  async function updateUIValues() {
    const list = await getFrozenAddresses()
    setFrozenList(list.filter((address)=>address!="0x0000000000000000000000000000000000000000"));
  }

    useEffect(() => {
      if (isWeb3Enabled) {
        updateUIValues();
      }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleErrorNotification = (error) => {
      dispatch({
          type: "error",
          message: error,
          title: "Transaction Failed!",
          position: "topR",
          icon: "bell",
      })
  }


      const handleSuccess = async (tx) => {
          await tx.wait(1)
          updateUIValues()
          handleNewNotification(tx)
      }

      const handleError = async(error) =>{
        // console.log(error)
        if(error.error){
          handleErrorNotification(error.error.message);
        }else{
          handleErrorNotification(error.message);
        }
      }


    return (
        <div>
          <div>
            <Table
              justifyCellItems="center"
              alignCellItems="center"
              columnsConfig="80px 1fr 2fr 80px"
              data={frozenList.map((address)=>{
                return([
                  <Avatar isRounded size={36} theme="image"/>,
                  address,
                  <Button
                  id="test-button-primary"
                  onClick={()=>handleUnfreeze(address)}
                  text="Unfreeze"
                  theme="primary"
                  size="large"
                  type="button"
                />]
                )
              })}
              header={[
                '',
                <span>Frozen Address</span>,
                <span>Interaction</span>,
                ''
              ]}
              isColumnSortable={[
                false,
                true,
                false,
                false
              ]}
              maxPages={3}
              onPageNumberChanged={function noRefCheck(){}}
              onRowClick={function noRefCheck(){}}
              pageSize={5}/>
              </div>

              <div>
          <Input
              label="Freeze Address"
              name="Freeze Input"
              onBlur={function noRefCheck(){}}
              onChange={(e)=> { setFreezeAddress(e.target.value.toString())}}
              hasCopyButton
            />
          </div>
          <br/>
          <div>
          <Button
              color="red"
              id="Freeze Button"
              onClick={()=>{
                if(freezeAddress!=""){
                  handleFreeze(freezeAddress)
                }
              }}
              size="large"
              text="Freeze"
              theme="secondary"
              type="button"
            />
          </div>
        </div>
    )
}