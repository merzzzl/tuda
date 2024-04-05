import React, { CSSProperties } from 'react';

export interface BageProps {
    code: string;
};

export function Bage(props: BageProps) {
    const styles = useStyles()

    return (
        <div style={styles.root}>
            <p style={styles.code} >{props.code}</p>
        </div>
    );
};

function useStyles(): { root: CSSProperties, code: CSSProperties } {
    return {
        root: {
            display: 'flex',
            width: '50px',
            height: '25px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '5px',
            background: '#2E2E2E',
        },
        code: {
            display: 'flex',
            width: '50px',
            height: '25px',
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
    };
};
