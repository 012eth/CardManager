import abi from './ERC1155_ABI.json';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

export const ethereum: any | undefined = (window as any).ethereum;
export const POLYGON_CHAIN_ID = 137;
export const BCard = '0xE1d30a7C5d6f27257B5eFAaD019272946441Ad88';
export const mmProvider = ethereum ? new ethers.providers.Web3Provider(ethereum) : null;
export const rpcProvider = new ethers.providers.JsonRpcProvider('https://matic-mainnet.chainstacklabs.com');
export const contract = new ethers.Contract(BCard, abi, rpcProvider);
const MAX = 500;
let maxCardId = -1;

const mainnetRpcs = [
    'https://cloudflare-eth.com',
    'https://eth-mainnet.nodereal.io/v1/1659dfb40aa24bbb8153a677b98064d7',
    'https://rpc.ankr.com/eth',
    'https://rpc.flashbots.net',
];

async function getMaxTokenId(setStatus: (status: string) => void) {
    try {
        setStatus('Getting tokens...');
        const event = contract.filters.TransferSingle(null, ethers.constants.AddressZero);
        const latest = await rpcProvider.getBlockNumber();
        let events: any = [];

        for (let i = 0; i < 10; i++) {
            setStatus(`Getting tokens... (${i + 1} / 10)`);
            events = await contract.queryFilter(event, latest - i * 10_000 - 10_000, latest - i * 10_000);

            if (events.length > 0) {
                setStatus(`Getting tokens... (10 / 10)`);
                break;
            }
        }

        if (events.length === 0) {
            return MAX;
        }

        return Math.max(...events.map(({ args }: any) => +args.id.toString()));
    } catch (e) {
        console.error(e);
        setStatus(`Failed getting tokens... returning ${MAX}`);
        return MAX;
    }
}

export async function resolveENS(name: string) {
    console.log('Resolving ENS...');
    for (const RPC of mainnetRpcs) {
        const provider = new ethers.providers.JsonRpcProvider(RPC);
        try {
            return await provider.resolveName(name);
        } catch (e) {
            console.log(e);
        }
    }

    return null;
}

async function getBalances(max: number, address: string, setStatus: (status: string) => void) {
    setStatus(`Getting cards for ${address.slice(0, 6)}...`);
    const result = await Promise.all(
        Array.from({ length: max }, (_, i) => i).map(i => contract.balanceOf(address, i).then((b: any) => [i, +b.toString()]))
    );

    return result.filter(([, b]: any) => b > 0) as [tokenId: number, amount: number];
}

async function getName(tokenId: string) {
    console.log(`Getting name of ${tokenId}...`);
    const uri = await contract?.uri(tokenId);

    const data = await fetch(`https://gateway.ipfs.io/ipfs/${uri.slice(7)}`).then(res => res.json());
    return data.name;
}

export async function GetAllBCards(address: string, setStatus: (status: string) => void) {
    try {
        if (rpcProvider && contract) {
            maxCardId = maxCardId === -1 ? await getMaxTokenId(setStatus) : maxCardId;
            const resolvedAddress = address.endsWith('.eth') ? (await resolveENS(address)) ?? address : address;
            const balances = await getBalances(maxCardId, resolvedAddress, setStatus);
            const mapped = balances.map(([id, balance]: any) => [id, balance, getName(id)]);
            // balances.map(([id, balance]: any) => getName(id, setStatus).then(name => [id, balance, name.split(' ').slice(-1)[0]]))

            return mapped.sort(([, balanceA]: any, [, balanceB]: any) => balanceB - balanceA);
        }
    } catch (e) {
        console.log(e);
    }

    return [];
}

export async function safeTransfer(bCardId: number, from: string, to: string | null) {
    if (mmProvider) {
        const signer = mmProvider.getSigner();
        const bcardWithSigner = contract.connect(signer);
        let addressTo = to;

        if (to?.endsWith('.eth')) {
            addressTo = await resolveENS(to);
        }

        if (addressTo !== null) {
            try {
                const tx = await bcardWithSigner?.safeTransferFrom(from, addressTo, bCardId, 1, []);
                await tx.wait();
                return true;
            } catch (e) {
                console.log(e);
                toast.error(`Failed transfer to ${to}`);
            }
        } else {
            toast.error(`Faild to resolve ${to}`);
        }
    }

    toast.error(`Something went wrong with metamask`);
    return false;
}
