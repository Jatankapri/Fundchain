import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { hardhat , localhost } from 'wagmi/chains'; 
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Web3Modal } from '@web3modal/react';
import { EthereumClient, modalConnectors } from '@web3modal/ethereum';
import { NextUIProvider } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FactoryProvider } from '../context/CampaignFactory';
import { CampaignProvider } from '../context/CampaignContext';
import '../styles/globals.css';

// Hardhat configuration
const chains = [localhost, hardhat];
const projectId = '0467d98c96e222de66895005aee2a481';

// Wagmi client setup
const { chains: configuredChains, provider } = configureChains(chains, [
  jsonRpcProvider({ rpc: () => ({ http:'  https://34ac-2400-1a00-4ba4-3932-1d3d-dcbb-6f16-7056.ngrok-free.app' }) }),
 // walletConnectProvider({ projectId: '0467d98c96e222de66895005aee2a481' }), // Connect to local Hardhat node
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
      if (router.pathname !== '/') {
        router.push('/');
      }
  }, [router, ethereumClient]);
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
      {/* Web3Modal provides a modal interface for connecting Ethereum wallets */}
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </WagmiConfig>
  );
}

export default MyApp;