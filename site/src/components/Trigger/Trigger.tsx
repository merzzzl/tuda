import React, { CSSProperties, useState } from 'react';

export interface TriggerProps {
    text: string;
    disabled?: boolean;
    onCheck?: (state: boolean) => void;
};

export function Trigger(props: TriggerProps) {
    const styles = useStyles()

    const [state, setState] = useState<boolean>(false);

    return (
        <div style={styles.root}>
            <div key={"is-"+state} style={styles.indcRoot} onClick={() => {if (props.disabled) return; setState(!state); props.onCheck?.(!state)}}>
                <div style={state ? styles.indcOn : {...styles.indcOn, ...styles.indcOff}} />
            </div>
            <p style={props.disabled === true ? {...styles.text, ...styles.textDisabled} : styles.text} >{props.text}</p>
        </div>
    );
};

function useStyles(): { indcOff: CSSProperties, indcOn: CSSProperties, textDisabled: CSSProperties, indcRoot: CSSProperties, root: CSSProperties, text: CSSProperties } {
    return {
        root: {
            position: 'relative',
            width: '200px',
            height: '30px',
        },
        indcRoot: {
            position: 'absolute',
            left: '0px',
            width: '60px',
            height: '25px',
            flexShrink: 0,
            borderRadius: '50px',
            background: '#1E1E1E'
        },
        text: {
            position: 'absolute',
            margin: 0,
            left: '70px',
            width: '200px',
            height: '25px',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#FFF',
            fontFamily: 'Inter',
            fontSize: '16px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            textTransform: 'uppercase'
        },
        indcOn: {
            position: 'absolute',
            top: '3px',
            left: '38px',
            width: '19px',
            height: '19px',
            flexShrink: 0,
            borderRadius: '50px',
            background: '#FFF'
        },
        indcOff: {
            left: '3px',
            background: '#2E2E2E',
        },
        textDisabled: {
            color: '#3E3E3E',
        }
    };
};
