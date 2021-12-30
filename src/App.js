import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import myEpicNFT from "./utils/myEpicNFT.json";

// Constants
const TWITTER_HANDLE = "smoothlikebuddy";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
    "https://testnets.opensea.io/collection/squarenft-iy1q3coxs5";
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0xB7f3b4320545F21362d02a27BC41dbe8492aD179";

const App = () => {
    const [connectedWallet, setConnectedWallet] = useState("");

    // Check to see if we're logged into MetaMask
    const checkIfWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("You need to connect your wallet");
            return;
        } else {
            console.log("Wallet connected: ", ethereum);
        }

        const accounts = await ethereum.request({ method: "eth_accounts" });

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Account found: ", account);
            setConnectedWallet(account);
            setupEventListener();
        } else {
            console.log("No account found");
        }
    };

    const connectToWallet = async () => {
        try {
            const { ethereum } = window;

            if (!ethereum) {
                alert("Get MetaMask");
                return;
            } else {
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts",
                });

                console.log("Account connected: ", accounts[0]);
                setConnectedWallet(accounts[0]);
                setupEventListener();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const setupEventListener = () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const providers = new ethers.providers.Web3Provider(ethereum);
                const signer = providers.getSigner();
                const connectedContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    myEpicNFT.abi,
                    signer
                );

                connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
                    console.log(from, tokenId.toNumber());
                    alert(
                        `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
                    );
                });

                console.log("Setup event listener!");
            } else {
                console.log("Ethereum does not exist");
            }
        } catch (error) {
            console.log(error);
        }
    };

    const askContractToMintNFT = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                // ethers is a library that helps our frontend talk to our contract.
                // A "Provider" is what we use to actually talk to Ethereum nodes. Remember how we were using Alchemy to deploy? Well in this case we use nodes that Metamask provides in the background to send/receive data from our deployed contract.
                const providers = new ethers.providers.Web3Provider(ethereum);
                const signer = providers.getSigner();

                // this line is what actually creates the connection to our contract. It needs: the contract's address, something called an abi file, and a signer. These are the three things we always need to communicate with contracts on the blockchain.
                const connectedContract = new ethers.Contract(
                    CONTRACT_ADDRESS,
                    myEpicNFT.abi,
                    signer
                );

                console.log("Going to pop wallet now to pay gas...");
                let nftTxn = await connectedContract.makeAnEpicNFT();

                console.log("Mining now...");
                await nftTxn.wait();

                console.log(
                    `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
                );
            } else {
                console.log("Ethereum does not exist");
            }
        } catch (error) {
            console.log(error);
        }
    };
    // Render Methods
    const renderNotConnectedContainer = () => (
        <button
            onClick={connectToWallet}
            className="cta-button connect-wallet-button"
        >
            Connect to Wallet
        </button>
    );

    useEffect(() => {
        checkIfWalletIsConnected();
    });

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <p className="header gradient-text">My NFT Collection</p>
                    <p className="sub-text">
                        Each unique. Each beautiful. Discover your NFT today.
                    </p>
                    {connectedWallet === "" ? (
                        renderNotConnectedContainer()
                    ) : (
                        <button
                            onClick={askContractToMintNFT}
                            class="cta-button connect-wallet-button"
                        >
                            Mint NFT
                        </button>
                    )}
                    <button
                        onClick={() => window.open(OPENSEA_LINK)}
                        className="cta-button connect-wallet-button"
                    >
                        View On OpenSea
                    </button>
                </div>
                <div className="footer-container">
                    <img
                        alt="Twitter Logo"
                        className="twitter-logo"
                        src={twitterLogo}
                    />
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`built on @${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    );
};

export default App;
