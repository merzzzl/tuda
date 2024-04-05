import React, { CSSProperties } from 'react';
import './index.css';

export interface ButtonProps {
    progress?: boolean;
    text: string;
    onClick?: () => void;
};

export function Button(props: ButtonProps) {
    const styles = useStyles()

    return (
        <div style={props.progress ? { ...styles.root, ...styles.rootPreview } : styles.root} onClick={props.onClick} >
            <p style={props.progress ? { ...styles.text, ...styles.textPreview } : styles.text} >{props.text}</p>
        </div>
    );
};

function useStyles(): { rootPreview: CSSProperties, textPreview: CSSProperties, root: CSSProperties, text: CSSProperties } {
    return {
        root: {
            cursor: 'pointer',
            display: 'flex',
            width: '200px',
            height: '40px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: '10px',
            background: '#C68448',
        },
        text: {
            display: 'flex',
            width: '200px',
            height: '40px',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            color: '#FFF',
            textAlign: 'center',
            fontFamily: 'Inter',
            fontSize: '20px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
            textTransform: 'uppercase'
        },
        rootPreview: {
            cursor: 'not-allowed',
            backgroundSize: '200% 100%',
            background: 'linear-gradient(120deg, rgba(46,46,46,0.3) 45%, rgba(62,62,62,0.5) 55%, rgba(62,62,62,0.5) 65%, rgba(46,46,46,0.3) 75%)',
            animation: 'buttonShine 3s linear infinite',
        },
        textPreview: {
            visibility: 'hidden'
        }
    };
};
