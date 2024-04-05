import React, { CSSProperties } from 'react';

export interface FlightProps {
    from: string;
    to: string;
    duration: number;
    number: string;
    price: number;
    link: string;
};

export function Flight(props: FlightProps) {
    const styles = useStyles()

    return (
        <div style={styles.root} onClick={() => {window.open(props.link)}} >
            <div style={styles.line}>
                <svg xmlns="http://www.w3.org/2000/svg" width="54px" height="5px" viewBox="0 0 54 4" fill="none">
                    <path d="M2 2L54 2" stroke="#1E1E1E" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 8" />
                </svg>
            </div>
            <p style={styles.from} >{props.from}</p>
            <p style={styles.to} >{props.to}</p>
            <p style={styles.number} >{props.number}</p>
            <p style={styles.duration} >{props.duration} min</p>
            <p style={styles.price} >{props.price}$</p>
        </div>
    );
};

function useStyles(): { root: CSSProperties, line: CSSProperties, from: CSSProperties, to: CSSProperties, number: CSSProperties, airline: CSSProperties, duration: CSSProperties, price: CSSProperties } {
    return {
        root: {
            position: 'relative',
            display: 'flex',
            width: '160px',
            height: '80px',
            borderRadius: '5px',
            background: '#2E2E2E',
        },
        line: {
            position: 'absolute',
            top: '5px',
            width: '160px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        from: {
            margin: 0,
            position: 'absolute',
            left: '10px',
            top: '5px',
            display: 'flex',
            width: '35px',
            height: '20px',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
        to: {
            margin: 0,
            position: 'absolute',
            right: '10px',
            top: '5px',
            display: 'flex',
            width: '35px',
            height: '20px',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
        number: {
            margin: 0,
            position: 'absolute',
            bottom: '25px',
            left: '10px',
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
        airline: {
            margin: 0,
            position: 'absolute',
            bottom: '45px',
            left: '10px',
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
        duration: {
            margin: 0,
            position: 'absolute',
            bottom: '5px',
            left: '10px',
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
        price: {
            margin: 0,
            position: 'absolute',
            bottom: '5px',
            right: '10px',
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '20px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
    };
};
