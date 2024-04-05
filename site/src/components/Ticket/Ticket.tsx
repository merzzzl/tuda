import React, { CSSProperties } from 'react';
import { Tag } from '../Tag';
import { Bage } from '../Bage';
import { Trip } from '../../models/Find';
import { convertToBageProps, convertToFlightProps } from '../../utils/utils';
import { Flight } from '../Flight';

export interface TicketProps {
    onClick?: () => void;
    selected?: boolean;
    tripNum: string;
    tripInfo: Trip;
};

export function Ticket(props: TicketProps) {
    const styles = useStyles()

    return (
        <div style={props.selected ? { ...styles.root, ...styles.selectedRoot } : styles.root} onClick={props.onClick} >
            <Tag code={'#' + props.tripNum} style={styles.tag} />
            <div style={props.selected ? { ...styles.list, ...styles.selectedList } : styles.list} >
                {convertToBageProps(props.tripInfo.roads).map((item, index) => (
                    <Bage key={index} {...item} />
                ))}
            </div>
            <div style={props.selected ? styles.fullList : { ...styles.fullList, ...styles.selectedFullList }} >
                {convertToFlightProps(props.tripInfo.roads).map((item, index) => (
                    <Flight key={index} {...item} />
                ))}
            </div>
            <p style={styles.price} >{props.tripInfo.full_price}$</p>
        </div>
    );
};

function useStyles(): { root: CSSProperties, selectedRoot: CSSProperties, price: CSSProperties, list: CSSProperties, tag: CSSProperties, selectedList: CSSProperties, fullList: CSSProperties, selectedFullList: CSSProperties } {
    return {
        root: {
            cursor: 'pointer',
            position: 'relative',
            width: '200px',
            height: '110px',
            borderRadius: '10px',
            background: '#1E1E1E',
        },
        selectedRoot: {
            height: 'auto',
        },
        tag: {
            height: '100%',
            position: 'absolute',
            left: '0px',
            top: '0px',
        },
        selectedList: {
            display: 'none'
        },
        list: {
            position: 'absolute',
            left: '30px',
            top: '5px',
            display: 'flex',
            width: '160px',
            height: '55px',
            alignItems: 'flex-start',
            alignContent: 'flex-start',
            gap: '5px',
            flexShrink: 0,
            flexWrap: 'wrap',
        },
        selectedFullList: {
            display: 'none'
        },
        fullList: {
            position: 'relative',
            left: '30px',
            marginTop: '10px',
            marginBottom: '50px',
            display: 'flex',
            width: '160px',
            alignItems: 'flex-start',
            alignContent: 'flex-start',
            gap: '5px',
            flexShrink: 0,
            flexWrap: 'wrap',
        },
        price: {
            position: 'absolute',
            left: '30px',
            bottom: '5px',
            margin: '0px',
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '24px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
    };
};
