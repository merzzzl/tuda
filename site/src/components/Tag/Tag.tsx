import React, { CSSProperties } from 'react';

export interface TagProps {
    style?: CSSProperties;
    code: string;
};

export function Tag(props: TagProps) {
    const styles = useStyles()

    return (
        <div style={{ ...styles.root, ...props.style }}>
            <p style={styles.code} >{props.code}</p>
        </div>
    );
};

function useStyles(): { root: CSSProperties, code: CSSProperties } {
    return {
        root: {
            display: 'flex',
            width: '20px',
            height: '110px',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px 0px 0px 10px',
            background: '#2E2E2E',
        },
        code: {
            display: 'flex',
            width: '110px',
            height: '20px',
            transform: 'rotate(-90deg)',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '12px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
    };
};
