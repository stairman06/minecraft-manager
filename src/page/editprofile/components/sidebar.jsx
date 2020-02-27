import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
const BG = styled.div`
    height: 100%;
    position: absolute;
    background-color: #2b2b2b;
    width: 160px;
`

const Item = styled(NavLink)`
    margin-top: 10px;
    width: 100%;
    display: block;
    height: 25px;
    text-align: center;
    color: white;
    text-decoration: none;
    font-size: 15pt;
    font-weight: 100;
    &:hover {
        filter: brightness(0.75);
    }
    &.active, &.active:hover {
        filter: brightness(1.0);
        font-weight: 900;
    }
    margin-bottom: 15px;
    transition: font-weight 150ms;
`
const Sidebar = ({ id }) => (
    <BG>
        <Item to={`/edit/general/${id}`} activeClassName='active'>general</Item>
        <Item to={`/edit/versions/${id}`}  activeClassName='active'>versions</Item>
        <Item to={`/edit/mods/${id}`}  activeClassName='active'>mods</Item>
        <Item to={`/edit/resourcepacks/${id}`}  activeClassName='active'>resource packs</Item>
        <Item to={`/edit/advanced/${id}`}  activeClassName='active'>advanced</Item>
    </BG>
)

export default Sidebar;