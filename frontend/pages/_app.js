import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Web3Modal } from '@web3modal/react';
import { EthereumClient, modalConnectors } from '@web3modal/ethereum';
import { NextUIProvider } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FactoryProvider } from '../context/CampaignFactory';
import { CampaignProvider } from '../context/CampaignContext';
import '../styles/globals.css';

const projectId = '0467d98c96e222de66895005aee2a481';

// ── Ganache chain config ───────────────────────────────────────────────────
 const NGROK_URL = "http://127.0.0.1:7545";

const ganache = {
  id: 1337,
  name: "Ganache",
  network: "ganache",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [NGROK_URL] },
    public:  { http: [NGROK_URL] },
  },
};

const chains = [ganache];

const { chains: configuredChains, provider } = configureChains(chains, [
  jsonRpcProvider({ rpc: () => ({ http: NGROK_URL }) }),
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "fundchain", chains: configuredChains }),
  provider,
});

const ethereumClient = new EthereumClient(wagmiClient, configuredChains);

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = ethereumClient.watchAccount(() => {
      if (router.pathname !== '/') {
        router.push('/');
      }
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