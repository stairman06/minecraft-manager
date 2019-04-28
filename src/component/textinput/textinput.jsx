import styled from 'styled-components';
const TextInput = styled.input`
    background-color: #717171;
    border: 0;
    outline: none;
    color: white;
    height: 40px;
    font-size: 17pt;
    padding-left: 10px;
    &::placeholder {
        color: white;
    }
`

export default TextInput;