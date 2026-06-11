import React, { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import detectEthereumProvider from '@metamask/detect-provider'
import toast from 'react-hot-toast'
import contractABI from '../utils/contractABI.json'

const Web3Context = createContext()

export const useWeb3 = () => useContext(Web3Context)

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const connectWallet = async () => {
    try {
      const provider = await detectEthereumProvider()
      
      if (!provider) {
        toast.error('Please install MetaMask!')
        window.open('https://metamask.io/download/', '_blank')
        return false
      }

      const ethersProvider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await ethersProvider.send('eth_requestAccounts', [])
      const signer = await ethersProvider.getSigner()
      const network = await ethersProvider.getNetwork()
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer)
      
      // Check if user is admin
      let isAdminUser = false
      try {
        isAdminUser = await contract.admins(accounts[0])
      } catch (error) {
        console.log('Admin check failed:', error)
      }
      
      setAccount(accounts[0])
      setProvider(ethersProvider)
      setSigner(signer)
      setContract(contract)
      setChainId(Number(network.chainId))
      setIsConnected(true)
      setIsAdmin(isAdminUser)
      
      toast.success(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
      return true
    } catch (error) {
      console.error('Connection error:', error)
      toast.error('Failed to connect wallet')
      return false
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setContract(null)
    setIsConnected(false)
    setIsAdmin(false)
    toast.success('Wallet disconnected')
  }

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }] // Sepolia chain ID
      })
    } catch (error) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0xaa36a7',
            chainName: 'Sepolia Test Network',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io']
          }]
        })
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(false)
      const provider = await detectEthereumProvider()
      if (provider) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          await connectWallet()
        }
      }
    }
    init()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          connectWallet()
        } else {
          disconnectWallet()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [])

  return (
    <Web3Context.Provider value={{
      account,
      provider,
      signer,
      contract,
      chainId,
      isConnected,
      isAdmin,
      loading,
      connectWallet,
      disconnectWallet,
      switchToSepolia
    }}>
      {children}
    </Web3Context.Provider>
  )
}