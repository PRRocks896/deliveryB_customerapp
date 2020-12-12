export function checktype (text) {
    if(isNaN(parseFloat(text))) {
        return parseFloat('0').toFixed(2);
    } else {
        return parseFloat(text).toFixed(2);
    }
}