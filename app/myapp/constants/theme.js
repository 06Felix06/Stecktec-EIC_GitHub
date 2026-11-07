import { DefaultTheme } from '@react-navigation/native';

export const COLORS = {
    primary: '#d00000',
    //primary: '#ff8000',
    background0: '#141414',
    background: '#191919',
    red: '#d00000',
    green: '#00a86b',
    blue: '#2196F3',
    grey: '#808080',
    background2: '#232323',
    background3: '#373737',
    text: 'white',
    inactive: 'gray',
    border: '#191919',
};

export const DarkTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
        ...DefaultTheme.colors,
        primary: COLORS.primary,
        background: '#121212',
        card: '#1E1E1E',
        text: 'white',
        border: '#383838',
    },
};