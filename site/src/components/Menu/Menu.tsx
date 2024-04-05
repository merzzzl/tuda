import React, { CSSProperties, useState } from 'react';
import { Input } from '../Input';
import { Button } from '../Button';
import { Ticket, TicketProps } from '../Ticket';
import { fetchPlaces } from '../../api/autocomplete';
import { hopsToNum } from '../../utils/utils';
import { Trigger } from '../Trigger';

export interface MenuProps {
    onClickSearch?: () => void;
    searchProgress?: boolean;
    cities?: string[];
    refs?: {
        passportRef?: React.RefObject<HTMLInputElement>;
        startIATARef?: React.RefObject<HTMLInputElement>;
        endIATARef?: React.RefObject<HTMLInputElement>;
        maxStepsRef?: React.RefObject<HTMLInputElement>;
    };
    ticketProps?: TicketProps[];
    style?: CSSProperties;
    selectedTicket?: string;
    isInvifityMode?: (ok: boolean) => void;
};

export function Menu(props: MenuProps) {
    const styles = useStyles()

    const [infinityState, setInfinityState] = useState<boolean>(false);

    return (
        <div style={props.style}>
            <div style={styles.inputs}>
                <Trigger disabled={props.searchProgress} text='infinity' onCheck={(ok) => { setInfinityState(ok); if (props.isInvifityMode) props.isInvifityMode(ok) }} />
                <Input disabled={props.searchProgress} placeholder='russia' forwardRef={props.refs?.passportRef} onClick={() => { autocomplete("country", props.refs?.passportRef) }} onChange={() => { clearAttribute(props.refs?.passportRef) }} />
                <Input disabled={props.searchProgress} placeholder='tbilisi' forwardRef={props.refs?.startIATARef} onClick={() => { autocomplete("city", props.refs?.startIATARef, props.cities) }} onChange={() => { clearAttribute(props.refs?.startIATARef) }} />
                <Input style={infinityState ? { display: 'none' } : {}} disabled={props.searchProgress} placeholder='cape town' forwardRef={props.refs?.endIATARef} onClick={() => { autocomplete("city", props.refs?.endIATARef, props.cities) }} onChange={() => { clearAttribute(props.refs?.endIATARef) }} />
                <Input style={infinityState ? { display: 'none' } : {}} disabled={props.searchProgress} placeholder='3 hops' forwardRef={props.refs?.maxStepsRef} onClick={() => { normalizeHops(props.refs?.maxStepsRef) }} />
                <Button text='search' onClick={() => { onClickSearchBefore(props, infinityState) }} progress={props.searchProgress} />
            </div>
            <div style={styles.br} />
            <div style={styles.outputs}>
                {(props.ticketProps || []).map(item => {
                    return (
                        <Ticket key={item.tripNum} {...item} selected={item.tripNum === props.selectedTicket} />
                    )
                })}
            </div>
        </div>
    );
};

function clearAttribute(ref?: React.RefObject<HTMLInputElement>) {
    if (!ref?.current) {
        return
    }

    ref.current.removeAttribute("iata-code")
}

function onClickSearchBefore(props: MenuProps, isInfinity: boolean) {
    let promises = []

    if (props.refs?.passportRef?.current !== undefined && !props.refs?.passportRef?.current?.hasAttribute("iata-code")) {
        promises.push(autocomplete("country", props.refs?.passportRef))
    }

    if (props.refs?.startIATARef?.current !== undefined && !props.refs?.startIATARef?.current?.hasAttribute("iata-code")) {
        promises.push(autocomplete("city,airport", props.refs?.startIATARef, props.cities))
    }

    if (!isInfinity) {
        if (props.refs?.endIATARef?.current !== undefined && !props.refs?.endIATARef?.current?.hasAttribute("iata-code")) {
            promises.push(autocomplete("city,airport", props.refs?.endIATARef, props.cities))
        }

        if (props.refs?.maxStepsRef?.current !== undefined) {
            normalizeHops(props.refs?.maxStepsRef)
        }
    }

    Promise.all(promises).then(() => {
        if (props.onClickSearch) {
            props.onClickSearch()
        }
    })

    return
}

function normalizeHops(ref?: React.RefObject<HTMLInputElement>) {
    if (!ref?.current) {
        return
    }

    const num = hopsToNum(ref.current.value)
    if (num === undefined) {
        return
    }

    ref.current.value = num + " hops"
}

async function autocomplete(type: string, ref?: React.RefObject<HTMLInputElement>, include?: string[]) {
    if (!ref?.current) {
        return
    }

    const val = ref.current.value
    if (val === undefined) {
        return
    }

    const places = await fetchPlaces(type, val)
    if (places.length === 0) {
        return
    }

    if (include !== undefined) {
        const place = places.find(p => include.includes(p.code));
        if (place === undefined) {
            return
        }

        ref.current.value = place.name
        ref.current.setAttribute("iata-code", place.code)

        return
    }

    ref.current.value = places[0].name
    ref.current.setAttribute("iata-code", places[0].code)

    return
}

function useStyles(): { inputs: CSSProperties, outputs: CSSProperties, br: CSSProperties } {
    return {
        inputs: {
            top: 0,
            display: 'flex',
            width: '270px',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px'
        },
        outputs: {
            marginTop: '20px',
            display: 'grid',
            flexDirection: 'column',
            overflow: 'auto',
            flexGrow: 1,
            width: '270px',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '15px',
        },
        br: {
            marginTop: '20px',
            width: '270px',
            height: '5px',
            flexShrink: 0,
            borderRadius: '5px',
            backgroundColor: '#1E1E1E'
        }
    };
};
