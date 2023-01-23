import React, { useState } from 'react';
import logo from './logoEth.png';
import {ethers} from 'ethers';
import StakingArtifact from './contracts/Staking/Staking.json';
import contractAddress from './contracts/Staking/Staking-address.json'
import './App.css';
import LoadingIndicator from './composants/loader/LoadingIndicator'

function App() {
  // création d'une interface TS pour gérer le typage du state local
  interface State {
    valueToStake : string;
    valueToUnstake : string
  }

  //! :::: LOCAL STATE ::::
  const [loading, setLoading] = useState(false)
  const [address,setAddress] = useState("");
  const [balance,setBalance] = useState("0")
  const [stakedBalance,setStakedBalance] = useState("0")
  const [contract,setContract] = useState<ethers.Contract>() // typage de type ethers.Contract
  const [state,setState] = useState<State>({ //on utilise le type de l'interface
    valueToStake : "",
    valueToUnstake : ""
  })

  const handleChange = (event:any) =>{
    setState(prevState => ({...prevState, [event.target.name]:event.target.value}))
  }

  //! :::: FUNCTIONS ::::
  const requestAccount = async() => {
    // creation du provider web3
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", [])
    // création d'une abtrastion de compte 'signer' : https://docs.ethers.org/v5/api/signer/
    const signer = provider.getSigner()
    const connectedAddress : string = await signer.getAddress();
    setAddress(connectedAddress)
    // instanciation du contrat avec le compte actif
    const stakingContract = new ethers.Contract(contractAddress.Staking,StakingArtifact.abi,signer)
    setContract(stakingContract);
    getBalance(stakingContract,connectedAddress)
    getStakedBalance(stakingContract,connectedAddress)
    
    // ecoute de l'event accoundChanged
    window.ethereum.on('accountsChanged',()=>{
      setAddress("")})
  }
    
  const getBalance =async(contract : ethers.Contract, address: string) => {
    const data = await contract.balanceOf(address)
    const convertedData = ethers.utils.formatEther(data);
    setBalance(convertedData);
  }
  
  const disconnect  = () => {
    setAddress("")
  }
  
  const stake =async() => {
    if(contract){
      const valueInWei = ethers.utils.parseEther(state.valueToStake)
      await contract.stake(valueInWei).then(()=> {
        setLoading(true);
        // on lance la deuxième fonction uniquement à la réception de l'evènement déclenché par la première
        contract.on("stakingBalanceUpdate",async()=>{
          await getStakedBalance(contract,address);
          await getBalance(contract,address);
          setState(prevState => ({...prevState, valueToStake:""}))
          setLoading(false)
        })
      });      
    } else { alert("issue with the contract")}
  }



  const unStake =async() => {
    if (contract){
      const valueInWei = ethers.utils.parseEther(state.valueToUnstake)
      await contract.unstake(contractAddress.Staking,valueInWei).then(()=>{
        // on lance la deuxième fonction uniquement à la réception de l'evènement déclenché par la première
        setLoading(true)
        contract.on("stakingBalanceUpdate",async()=>{
          await getStakedBalance(contract,address);
          await getBalance(contract,address);
          setState(prevState => ({...prevState, valueToUnstake:""}))
          setLoading(false)
        })
      })
    } else {alert("issue with the contract")}

  }

  const getStakedBalance= async(contract : ethers.Contract, address: string) => {
    const data = await contract.getStakedBalance(address)
    const convertedData = ethers.utils.formatEther(data)
    setStakedBalance(convertedData)
  }



  return (
    <div className="App">
      <header className="App-header">
        {(address !== "" )? 
        <>
          <p>hello {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
        :
        <button onClick={requestAccount}>Connect</button>
        }
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          staking app using react, typscript and ethers
        </p>
        {(address !== "")?
        <div className='buttons'>
          <div >
              <input type="text" value={state.valueToStake} name="valueToStake" onChange={handleChange} placeholder="value to stake"/>
              <button onClick={stake}>stake ETH</button>
          </div>
          <div >
              <input type="text" value={state.valueToUnstake} name="valueToUnstake" onChange={handleChange} placeholder="value to unstake"/>
              <button onClick={unStake}>unStake ETH</button>
          </div>
          {loading && <LoadingIndicator size={32} color="#000000" />}
          <p>actual staking amount : {stakedBalance} ETH</p>
          <p>actual balance : {balance} ETH</p>
        </div>
        :
        <p>Connect your wallet to start using thr Dapp </p>
        }
        
      </header>
    </div>
  );
}

export default App;
