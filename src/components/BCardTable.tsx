import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

const TableContainer = styled.div`
    background: white;
    width: 30rem;
    max-width: 90%;
    min-height: 140px;
    max-height: 20rem;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 10px 10px 4px 4px;
`;

const Header = styled.div`
    background: #f3f3f3;
    width: 100%;
    height: 3rem;
    display: flex;
    min-height: 3rem;
    box-shadow: 0px 1px 5px 0px #00000047;
    z-index: 2;
`;

const TableBody = styled.div`
    width: 100%;
    overflow-y: auto;
`;

const Row = styled.div<{ selected: boolean }>`
    width: 100%;
    height: 3rem;
    display: flex;
    box-shadow: 0px 0px 1px 0px #b8b8b8;

    background: ${({ selected }) => (selected ? 'rgba(25, 118, 210, 0.08)' : 'white')};
    cursor: pointer;

    &:hover {
        background-color: ${({ selected }) => (selected ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)')};
    }
`;

const Column = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    padding-inline-start: 15px;
`;

const FetchingBCards = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 10rem;
`;

let resolved: string[] = [];
export default function ({ data, fetching, onSelect, selected }: any) {
    const [dataNameResponses, setResponse] = useState(data.map(() => 'Resolving id'));

    useEffect(() => {
        resolved = data.map(() => 'Resolving id');
        setResponse(resolved);
        (async function () {
            for (let i = 0; i < data.length; i++) {
                const res = await data[i][2];
                resolved.splice(i, 1, res.split(' ')[2]);
                resolved = [...resolved];
                setResponse(resolved);
            }
        })();
    }, [data]);

    return (
        <TableContainer>
            <Header>
                <Column>ID</Column>
                <Column>Name</Column>
                <Column>Amount</Column>
            </Header>
            <TableBody>
                {fetching !== '' ? (
                    <FetchingBCards>{fetching}</FetchingBCards>
                ) : (
                    data.map(([id, amount]: any, i: number) => (
                        <Row selected={selected === id} onClick={() => onSelect(id)} key={id}>
                            <Column>{id}</Column>
                            <Column>{dataNameResponses[i]}</Column>
                            <Column>{amount}</Column>
                        </Row>
                    ))
                )}
            </TableBody>
        </TableContainer>
    );
}
