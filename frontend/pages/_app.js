import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { hardhat } from 'wagmi/chains'; // Hardhat local chain
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Web3Modal } from '@web3modal/react';
import { EthereumClient, modalConnectors, walletConnectProvider } from '@web3modal/ethereum';
import { NextUIProvider } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FactoryProvider } from '../context/CampaignFactory';
import { CampaignProvider } from '../context/CampaignContext';
import '../styles/globals.css';

// Hardhat configuration
const chains = [hardhat];
const projectId = '0467d98c96e222de66895005aee2a481';

// Wagmi client setup
const { chains: configuredChains, provider } = configureChains(chains, [
  jsonRpcProvider({ rpc: () => ({ http: 'http://127.0.0.1:8545' }) }),
  walletConnectProvider({ projectId: '0467d98c96e222de66895005aee2a481' }), // Connect to local Hardhat node
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: 'decentralized', chains: configuredChains }),
  provider,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, configuredChains);

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = ethereumClient.watchAccount(() => {
      router.push('/');
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <WagmiConfig client={wagmiClient}>
      <NextUIProvider>
        <FactoryProvider>
          <CampaignProvider>
            <Component {...pageProps} />
          </CampaignProvider>
        </FactoryProvider>
      </NextUIProvider>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </WagmiConfig>
  );
}

export default MyApp;