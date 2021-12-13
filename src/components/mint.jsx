import {useState, useEffect} from 'react'
import { ethers, BigNumber } from 'ethers'
import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Link, ImmutableXClient, ImmutableMethodResults, MintableERC721TokenType, ERC721TokenType } from '@imtbl/imx-sdk';
import { getContract } from '../util/interact';
import { contractAddress, minterPrivateKey, starkContractAddress, registrationContractAddress, apiAddress } from '../constants/address';


export const Mint = (props) => {

  const {imx_link, imx_client, loading, setMintLoading, setStatus, walletAddress, tokenPrice} = props
  const [mintCount, setMintCount] = useState('');

  function onChangeCountInput(e) {

    if (!e.target.validity.patternMismatch) {
      if(e.target.value == "") {
        setMintCount(0)
        return
      }
      let inputVal = parseInt(e.target.value)
      if (inputVal > 3 || inputVal < 0) {
        e.preventDefault()
        return
      }
      setMintCount(inputVal)
    }
  }
  
  async function onMint() {
    let occupied_list, total_list, available_list, mint_list
    let linked_wallet
    if (!walletAddress) {
        setStatus('Please connect your Wallet')
        return
    }
    const contract = getContract(walletAddress)

    // connect to Immutable X Platform
    try {
      linked_wallet = await imx_link.setup({});
    } catch(err) {
      console.log(err)
      setStatus("Wallet connection failed")
      return
    }

    const provider = new AlchemyProvider('ropsten', '');
    const minter = await ImmutableXClient.build({
      publicApiUrl: apiAddress,
      starkContractAddress: starkContractAddress,
      registrationContractAddress: registrationContractAddress,
      signer: new Wallet(minterPrivateKey).connect(provider),
    });

    // Get already Occupied Token List from contract
    try {
      let ol = await contract.occupiedList()
      occupied_list = ol.map( bn => BigNumber.from(bn).toNumber() );
    } catch (err) {
      let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
      let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
      let status = "Transaction failed because you have insufficient funds or sales not started"
      errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
      setMintLoading(false)
    }

    // Get available mint id 
    total_list = Array.from(Array(2001).keys())
    total_list.shift()
    available_list = total_list.filter(id => !occupied_list.includes(id))
    let shuffled = available_list.sort(function(){return .5 - Math.random()});
    mint_list = shuffled.slice(0, mintCount);

    // start minting
    setMintLoading(true)
    try {
      let tx = await contract.buy(mint_list, { value: BigNumber.from(1e9).mul(BigNumber.from(1e4)).mul(tokenPrice).mul(mintCount), from: linked_wallet.address })
      let res = await tx.wait()
      if (res.transactionHash) {
        // mint token on Immutable X Platform
        const tokens = mint_list.map(i => ({
          id: i.toString(),
          blueprint: 'https://gateway.pinata.cloud/ipfs/QmXdA5Aef18rYkpWd3ngcpyqzkiEguHSntMxvbbzNcfx77',
        }))

        const payload = [
          {
            contractAddress: contractAddress, // NOTE: a mintable token contract is not the same as regular erc token contract
            users: [
              {
                etherKey: linked_wallet.address.toLowerCase(),
                tokens,
              },
            ],
          },
        ];
      
        try { 
          const result = await minter.mintV2(payload); 
          setStatus(`You minted ${mintCount} MOBP Successfully`)
          setMintLoading(false)
        } catch(err) {
          console.log(err)
          setStatus("Mint on Immutable X failed")
          setMintLoading(false)
        }
      }
      setMintLoading(false)
    } catch (err) {
      console.log(err)
        let errorContainer =  (err.error && err.error.message)  ? err.error.message : ''
        let errorBody = errorContainer.substr(errorContainer.indexOf(":")+1)
        let status = "Transaction failed because you have insufficient funds or sales not started"
        errorContainer.indexOf("execution reverted") === -1 ? setStatus(status) : setStatus(errorBody)
        setMintLoading(false)
    }

  }


  return (
    <div id="mint">
      <p className="mint-price"> BETA PASS PRICE: 0.05 ETH </p>
      <div>
        <input type='text' className="mint-amount" placeholder="ENTER AMOUNT"  value={mintCount || ''} pattern="^[0-9]*$" onChange={onChangeCountInput} />
      </div>
      {
        props.loading ?
        <button className="btn btn-lg mint-button">
          Minting
        </button>
        :
        <button className="btn btn-lg mint-button" onClick={onMint}>
          MINT BETA PASS
        </button>
      }

      <p> *YOUR WALLET IS <span style={{color:'#D43C3A'}}> WHITELISTED! </span> </p>

    </div>
  );
};
