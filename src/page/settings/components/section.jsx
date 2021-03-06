import styled from 'styled-components';

const Section = styled.div`
  max-width: 680px;
  background-color: #2b2b2b;
  margin: 10px;
  padding: 10px;
  h2 {
    font-size: 14pt;
  }
  h3 {
    font-size: 11pt;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  & > div {
    margin-top: 5px;
  }
`;

export default Section;
