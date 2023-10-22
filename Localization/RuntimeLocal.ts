import RuntimeLocal from './RuntimeLocal.json'

export function GetLog(value: string) {
    return "\x1b[1;32m" + "[Runtime Information] " + "\x1b[1;37m" + value;
}

