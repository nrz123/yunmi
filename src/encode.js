export default function encode(s){
    return s?window.btoa(encodeURIComponent(s)):''
}