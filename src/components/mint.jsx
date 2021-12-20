import {useState, useEffect} from 'react'
import { ethers, BigNumber } from 'ethers'
import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { Link, ImmutableXClient, ImmutableMethodResults, MintableERC721TokenType, ERC721TokenType, isHexPrefixed, ETHTokenType  } from '@imtbl/imx-sdk';
import { getContract } from '../util/interact';
import { contractAddress, starkContractAddress, registrationContractAddress, apiAddress, chainId, deployerAddress } from '../constants/address';
let CryptoJS = require("crypto-js");

export const Mint = (props) => {
  const {imx_link, imx_client, loading, setMintLoading, setStatus, walletAddress, tokenPrice, addrWhiteList} = props
  const [mintCount, setMintCount] = useState('');
  const [isWhiteListed, setIsWhiteListed] = useState(false)

  const offset = (new Date().getTimezoneOffset() - 300 ) * 60 * 1000
  const pubsaleTime = new Date("December 16, 2021 23:59:00").getTime() - offset
  const presaleTime = new Date("December 16, 2021 14:00:00").getTime() - offset

  useEffect(() => {
      let curTime = new Date().getTime()
      if(curTime>=presaleTime && curTime<pubsaleTime && Array.isArray(addrWhiteList) && walletAddress != null) {
        addrWhiteList.includes(walletAddress.toString().toLowerCase()) ? setIsWhiteListed(true) : setIsWhiteListed(false)
      }
   });

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

    let total_list, available_list, mint_list, occupied_list = []
    let linked_wallet, provider
    let curTime = new Date().getTime()
   
    if (!walletAddress) {
      setStatus('Please connect your Wallet')
      return
    }
    // Check mint is available
    if(curTime < presaleTime) {
      setStatus('Please wait for the private sale time')
      return
    }
    // Check user is whitelisted for pre-sale
    if(curTime>= presaleTime && curTime < pubsaleTime) {
      if(curTime>=presaleTime && curTime<pubsaleTime && Array.isArray(addrWhiteList) && walletAddress != null) {
        if(!addrWhiteList.includes(walletAddress.toString().toLowerCase())) {
          setStatus('Please wait for the public sale time')
          return
        } else {
          setIsWhiteListed(true)
        }
      }
    }

    setMintLoading(true)

    // Connect to Immutable-X to register user
    try {
      linked_wallet = await imx_link.setup({});
    } catch(err) {
      console.log(err)
      setMintLoading(false)
      setStatus("Wallet connection failed")
      return
    }

    // Check minted token number
    let assets = []
    let assetsRequest = await imx_client.getAssets({ user: linked_wallet.address, collection: contractAddress })
    assets = assets.concat(assetsRequest.result);
    if((assets.length + mintCount) > 3 ) {
      setMintLoading(false)
      setStatus("Exceeded max token purchase per wallet")
      return
    }
    assetsRequest = await imx_client.getAssets({ collection: contractAddress })
    assets = assets.concat(assetsRequest.result);
    if((assets.length + mintCount) > 2000 ) {
      setMintLoading(false)
      setStatus("Purchase would exceed max supply of tokens")
      return
    }

    // Get wallet balance 
    let imx_balance_wei = await imx_client.getBalances({ user: linked_wallet.address });
    let imx_balance_eth = ethers.utils.formatEther(imx_balance_wei.imx);
    if (chainId == '0x3') {
      provider = ethers.getDefaultProvider('ropsten')
    } else if( chainId == '0x1') {
      provider = ethers.getDefaultProvider('mainnet')
    }
    let eth_balance_wei = await provider.getBalance(linked_wallet.address);
    let eth_balance_eth = ethers.utils.formatEther(eth_balance_wei);

    // Deposit ETH from wallet to Immutable-X.
    if(imx_balance_eth < (tokenPrice*mintCount/100000)) {
      let deposit_balance = (tokenPrice*mintCount/100000) - imx_balance_eth
      try {
        await imx_link.transfer([{
          amount: deposit_balance.toString(),
          type: ETHTokenType.ETH,
          toAddress: linked_wallet.address.toString(),
        }])
      } catch(err) {
        console.log(err)
        setMintLoading(false)
        setStatus("Transaction failed because you have insufficient funds in the wallet")
        return
      }
    }

    // Pay IMX token for mint NFT on immutable-x
    try {
      await imx_link.transfer([{
        amount: (tokenPrice*mintCount/100000).toString(),
        type: ETHTokenType.ETH,
        toAddress: deployerAddress,
      }])
    } catch(err) {
      console.log(err)
      setMintLoading(false)
      setStatus("Transaction failed because you have insufficient funds on Immutable-X")
      return
    }

    // Get Minter to mint NFT on Immutable-X
    let alchemy_provider
    if (chainId == '0x3') {
      alchemy_provider = new AlchemyProvider('ropsten', '');
    } else if( chainId == '0x1') {
      alchemy_provider = new AlchemyProvider('mainnet', '');
    }

    const minter = await ImmutableXClient.build({
      publicApiUrl: apiAddress,
      starkContractAddress: starkContractAddress,
      registrationContractAddress: registrationContractAddress,
      signer: new Wallet(CryptoJS.AES.decrypt(process.env.REACT_APP_MINTER_KEY, 'metaops@secretkey123').toString(CryptoJS.enc.Utf8)).connect(alchemy_provider),
    });

    // Get already minted Token List 
    try {
      let assetCursor;
      do {
        let assets = [];
        let assetsRequest = await imx_client.getAssets({ collection: contractAddress, cursor: assetCursor })
        assets = assets.concat(assetsRequest.result);
        assets.map( asset => occupied_list.push(parseInt(asset.token_id)) )
        assetCursor = assetsRequest.cursor;
      } while (assetCursor);
    } catch (err) {
        setStatus("Immutable-X interaction failed.")
        setMintLoading(false)
        return
    }

    // Get available mint id 
    total_list = Array.from(Array(2001).keys())
    total_list.shift()
    available_list = total_list.filter(id => !occupied_list.includes(id))
    let shuffled = available_list.sort(function(){return .5 - Math.random()});
    mint_list = shuffled.slice(0, mintCount);

    // Mint NFT token on Immutable-X
    const tokens = mint_list.map(i => ({
      id: i.toString(),
      blueprint: 'https://gateway.pinata.cloud/ipfs/QmTxCsWuHc6fqc6mPbc2AFEXeYhwBREUD9fcYrKmgEi2me',
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

      {
        isWhiteListed ?
        <p> *YOUR WALLET IS <span style={{color:'#D43C3A'}}> WHITELISTED! </span> </p> 
        :
        ''
      }

    </div>
  );
};
