import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import contractData from "../../utils/contractABI.json";

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const initializeWallet = async (walletAddress) => {
    try {
      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      const network = await providerInstance.getNetwork();

      console.log("Network:", network);
      console.log("Chain ID:", Number(network.chainId));

      console.log("Contract Address:", CONTRACT_ADDRESS);

      const code = await providerInstance.getCode(CONTRACT_ADDRESS);
      console.log("Contract Code:", code);
      console.log("Contract Address:", CONTRACT_ADDRESS);
      console.log("Contract Code:", code);

      if (code === "0x") {
        throw new Error(
          `Contract tidak ditemukan pada alamat ${CONTRACT_ADDRESS}`
        );
      }

      const signerInstance = await providerInstance.getSigner();

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractData.abi,
        signerInstance
      );

      let adminStatus = false;

      try {
        adminStatus = await contractInstance.admins(walletAddress);
        console.log("Admin Status:", adminStatus);
      } catch (err) {
        console.error("Admin check failed:", err);
      }

      console.log("Connected account:", walletAddress);

      setAccount(walletAddress);
      setProvider(providerInstance);
      setSigner(signerInstance);
      setContract(contractInstance);
      setIsConnected(true);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("Initialize Wallet Error:", error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask tidak ditemukan!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        await initializeWallet(accounts[0]);
      }
    } catch (error) {
      console.error("Connect wallet error:", error);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setIsConnected(false);
    setIsAdmin(false);

    console.log("Wallet disconnected");
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        await initializeWallet(accounts[0]);
      }
    } catch (error) {
      console.error("Auto connect error:", error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          await initializeWallet(accounts[0]);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        contract,
        isConnected,
        isAdmin,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;