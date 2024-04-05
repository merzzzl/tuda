import React, { CSSProperties } from 'react';

export interface InputProps {
    style?: CSSProperties;
    placeholder: string;
    forwardRef?: React.RefObject<HTMLInputElement>;
    disabled?: boolean;
    onClick?: () => void;
    onChange?: (value: string) => void;
};

export function Input(props: InputProps) {
    const styles = useStyles()

    return (
        <div style={{...styles.root, ...props.style}}>
            <input ref={props.forwardRef} disabled={props.disabled === true} type="text" placeholder={props.placeholder} style={styles.input} onChange={(e) => { if (props.onChange) { props.onChange(e.target.value) } }} />
            <div style={styles.more} onClick={props.onClick} >
                <p style={styles.text}>...</p>
            </div>
        </div>
    );
};

function useStyles(): { root: CSSProperties, input: CSSProperties, more: CSSProperties, text: CSSProperties } {
    return {
        root: {
            position: 'relative',
            display: 'flex',
            width: '200px',
            height: '35px',
            paddingLeft: 0,
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '10px',
            borderRadius: '10px',
            background: '#1E1E1E',
        },
        more: {
            cursor: 'pointer',
            position: 'absolute',
            right: 0,
            display: 'flex',
            width: '20px',
            height: '35px',
            flexShrink: 0,
            borderRadius: '0px 10px 10px 0px',
            backgroundColor: '#2E2E2E'

        },
        text: {
            margin: 0,
            display: 'flex',
            width: '20px',
            height: '35px',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
        },
        input: {
            position: 'absolute',
            left: '10px',
            background: '#1E1E1E',
            border: 0,
            width: '160px',
            flexShrink: 0,
            color: '#FFF',
            textAlign: 'left',
            fontFamily: 'Inter',
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            textTransform: 'uppercase'
        },
    };
};
