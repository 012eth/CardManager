import { ethereum, POLYGON_CHAIN_ID } from './bcard';

export async function SwitchChain() {
    try {
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${POLYGON_CHAIN_ID.toString(16)}` }],
        });
    } catch (e) {
        await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
                {
                    chainId: `0x${POLYGON_CHAIN_ID.toString(16)}`,
                    chainName: 'Polygon Mainnet',
                    rpcUrls: ['https://polygon-rpc.com/'],
                    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                    blockExplorerUrls: ['https://polygonscan.com/'],
                },
            ],
        });
    }
}

export async function getAddressesSliently() {
    return ethereum?.request({ method: 'eth_accounts' }) ?? [];
}

export async function getChainId() {
    return parseInt((await ethereum?.request({ method: 'eth_chainId' })) ?? '-1');
}
