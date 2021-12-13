import { ethers } from 'ethers'
import { contractAddress } from '../constants/address'
import axios from "axios"
import { chainId } from '../constants/address'
require("dotenv").config()

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const chain = await window.ethereum.request({ method: 'eth_chainId' })
      if (parseInt(chain, 16) == chainId) {
        const addressArray = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        if (addressArray.length > 0) {
          return {
            address: addressArray[0],
            status: "You can mint new pack now.",
          }
        } else {
          return {
            address: "",
            status: "Connect your wallet account to the site.",
          }
        }
      } else {
        window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId:chainId }],
        })
        return {
          address: "",
          status: "Connect your wallet account to the site.",
        }
      }
      
    } catch (err) {
      return {
        address: "",
        status: err.message,
      }
    }
  } else {
    return {
      address: "",
      status: "You must install Metamask, a virtual Ethereum wallet, in your browser.",
    }
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      })
      const chain = await window.ethereum.request({
        method: "eth_chainId",
      })
      if (addressArray.length > 0 && chain === chainId) {
        return {
          address: addressArray[0],
          status: "You can mint new pack now.",
        }
      } else {
        return {
          address: "",
          status: "Connect to Metamask and choose the correct chain using the top right button.",
        }
      }
    } catch (err) {
      return {
        address: "",
        status: err.message,
      }
    }
  } else {
    return {
      address: "",
      status: "You must install Metamask, a virtual Ethereum wallet, in your browser.",
    }
  }
}

export const getContract = (walletAddress) => {
  const contractABI = require("../constants/contract.json")
  let contract

  try {
      if(walletAddress === null || walletAddress === '' || walletAddress === undefined) {
          if(parseInt(chainId) == 3) 
              contract = new ethers.Contract(contractAddress, contractABI, ethers.getDefaultProvider('ropsten'))
          if(parseInt(chainId) == 1) 
              contract = new ethers.Contract(contractAddress, contractABI, ethers.getDefaultProvider('mainnet'))
      } else {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          contract = new ethers.Contract(contractAddress, contractABI, signer)
      }
  } catch (error) {
      contract = null
  }
  return contract
}