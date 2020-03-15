import styled from 'styled-components';

const TextInput = styled.input.attrs({
  type: 'text'
})`
  background-color: #404040;
  border: 0;
  outline: none;
  color: white;
  height: 40px;
  font-size: 17pt;
  padding-left: 10px;
  &::placeholder {
    color: white;
  }
  &:hover:not(:disabled),
  &:focus {
    filter: brightness(0.85);
  }
  &:disabled {
    cursor: not-allowed;
    filter: brightness(0.75);
  }
`;

export default TextInput;
