import React from 'react';
import styled from 'styled-components';
import WindowBar from '../component/windowbar/windowbar';
import Navbar from '../component/navbar/navbar';

const BG = styled.div`
    background-color: #444444;
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-flow: column;
`

const Content = styled.div`
    flex: 1 1 auto;
    display: flex;
    position: relative;
    height: 100%;
    overflow-x: hidden;
`

const ContentSide = styled.div`
    display: flex;
    flex: 1 1 auto;
    flex-flow: column;
    overflow-x: hidden;
`

const Page = ({children, noNavbar}) => (
    <BG>
        <WindowBar />
        <Content>
            {!noNavbar && <Navbar />}
            <ContentSide>
                {children}
            </ContentSide>
        </Content>
    </BG>
)

export default Page;