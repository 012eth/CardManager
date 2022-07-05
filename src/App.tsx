import styled from '@emotion/styled';
import { Button, TextField } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import './App.css';
import { ethereum, GetAllBCards, mmProvider, safeTransfer } from './bcard';
import BCardTable from './components/BCardTable';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from './components/Toast';
import { getAddressesSliently, getChainId, SwitchChain } from './metamask';

const STATUS = {
    WAITING: -1,
    READY: 0,
    LOGGED: 1,
};

const POLYGON_CHAIN_ID = 137;
const TITLE = 'BCard Manager';

const App = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
    font-family: 'Montserrat', sans-serif;
`;

const Title = styled.h1`
    color: white;
    margin: 50px 0 0 0;
    text-align: center;
`;

const SendToInput = styled(TextField)`
    width: 30rem;
    max-width: 90%;

    & .MuiInput-root {
        color: white;
    }
    & .MuiInputLabel-root {
        color: #a8a8a8;
    }

    &:hover {
        & .MuiInputLabel-root {
            /* color: #dbdbdb; */
        }
    }

    .Mui-focused {
        color: white !important;
    }

    & .MuiInput-root::before {
        border-bottom: 1px solid #a8a8a8;
    }

    & .MuiInput-root:hover::before {
        border-bottom: 1px solid #dbdbdb !important;
    }
`;

const MainButton = styled(Button)`
    width: 30rem;
    max-width: 90%;

    &:disabled {
        background: #dbdbdb;
    }
`;

const SignedButton = styled(Button)`
    width: 12rem;
    position: absolute;
    top: 5px;
    right: 5px;
`;

const By012 = styled.div`
    color: #74747473;
    text-align: center;
    margin: auto 0;
    font-size: 0.8rem;

    & > a {
        color: #929090bd;

        :active {
            color: #929090bd;
        }
    }
`;

async function signIn() {
    if (mmProvider) {
        return Promise.all([await mmProvider.send('eth_requestAccounts', []), await getChainId()]);
    }

    return [];
}

function isAddress(address: string) {
    return ethers.utils.isAddress(address) || address.endsWith('eth');
}

function getSubScreen(status: number, chainId: number) {
    if (status === STATUS.WAITING) {
        return (
            <App>
                <Title>{TITLE}</Title>
            </App>
        );
    } else if (ethereum && chainId !== POLYGON_CHAIN_ID) {
        return (
            <App>
                <Title>{TITLE}</Title>
                <MainButton variant="contained" onClick={() => SwitchChain()}>
                    Switch to polygon
                </MainButton>
            </App>
        );
    }

    return null;
}

let fetchedOnce = false;
export default function () {
    const [status, setStatus] = useState(STATUS.WAITING);
    const [address, setAddress] = useState('');
    const [sendTo, setSendTo] = useState('');
    const [chainId, setChainId] = useState(1);
    const [myBCards, setMyBCards] = useState<any>([]);
    const [fetching, setFetching] = useState('');
    const [selectedBCard, setSelectedBCard] = useState<number | null>(null);
    const [validAddress, setValidAddress] = useState(false);

    function onSignIn(_addresses: string[], _chainId: number) {
        setAddress(_addresses[0] ?? '');

        if (_addresses.length > 0 && _chainId === POLYGON_CHAIN_ID) {
            setStatus(STATUS.LOGGED);
            setFetching('Fetching BCards');
            GetAllBCards(_addresses[0], setFetching)
                .then(setMyBCards)
                .then(() => setFetching(''));
        } else {
            setMyBCards([]);
            setStatus(STATUS.READY);
            setFetching('Enter address / ENS to search');
        }
    }

    async function transfer() {
        if (selectedBCard !== null) {
            const result = await safeTransfer(selectedBCard, address, sendTo);
            console.log(result);
        }
    }

    function Search() {
        if (isAddress(sendTo) && status === STATUS.READY) {
            setFetching('Fetching BCards');
            GetAllBCards(sendTo, setFetching)
                .then(setMyBCards)
                .then(() => setFetching(''));
        } else {
            setMyBCards([]);
            setFetching('Enter address / ENS to search');
        }
    }

    function onSendToChange(e: any) {
        setSendTo(e.target.value);
        setValidAddress(isAddress(e.target.value));
    }

    useEffect(() => {
        if (!fetchedOnce) {
            fetchedOnce = true;
            setStatus(STATUS.READY);
            setFetching('Enter address / ENS to search');

            Promise.all([getAddressesSliently(), getChainId()]).then(([_addresses, _chainId]) => {
                setChainId(_chainId);
                onSignIn(_addresses, _chainId);
            });
        }

        function accountsChanged(addresses: string[]) {
            onSignIn(addresses, chainId);
        }

        function chainChanged(_chainId: any) {
            setChainId(_chainId);
            if (parseInt(_chainId, 16) === POLYGON_CHAIN_ID) {
                window.location.reload();
            }
        }

        ethereum?.on('accountsChanged', accountsChanged);
        ethereum?.on('chainChanged', chainChanged);

        return () => {
            ethereum?.removeListener('accountsChanged', accountsChanged);
            ethereum?.removeListener('chainChanged', chainChanged);
        };
    }, [address, myBCards, setMyBCards]);

    return (
        getSubScreen(status, chainId) ?? (
            <App>
                <Title>{TITLE}</Title>
                {!ethereum ? (
                    <SignedButton variant="contained" onClick={() => window.open('https://metamask.io/', '_blank')}>
                        Install MetaMask
                    </SignedButton>
                ) : status === STATUS.READY ? (
                    <SignedButton variant="contained" onClick={() => signIn().then(([addresses]) => setAddress(addresses[0]))}>
                        Sign In
                    </SignedButton>
                ) : (
                    <SignedButton variant="contained">{`${address.slice(0, 6)}...${address.slice(-4)}`}</SignedButton>
                )}
                <SendToInput variant="standard" label="Address / ENS" onChange={onSendToChange} value={sendTo} />
                <BCardTable onSelect={setSelectedBCard} fetching={fetching} selected={selectedBCard} data={myBCards} />

                {status === STATUS.READY ? (
                    <MainButton variant="contained" onClick={Search} disabled={!validAddress}>
                        Search!
                    </MainButton>
                ) : (
                    <MainButton variant="contained" onClick={transfer} disabled={selectedBCard === null || !validAddress}>
                        Send!
                    </MainButton>
                )}
                <By012>
                    By the community for the community
                    <br />
                    with ❤️{' '}
                    <a href="https://twitter.com/012Eth" target="_blank">
                        012.eth
                    </a>
                </By012>
                <ToastContainer />
            </App>
        )
    );
}
