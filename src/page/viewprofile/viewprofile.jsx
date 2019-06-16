import React, { Component } from 'react';
import Page from '../page';
import { withRouter } from 'react-router-dom';
import Header from '../../component/header/header';
import ProfilesManager from '../../manager/profilesManager';
import styled from 'styled-components';
import Button from '../../component/button/button';
import SanitizedHTML from '../../component/sanitizedhtml/sanitizedhtml'
import LauncherManager from '../../manager/launcherManager';
import Confirmation from '../../component/confirmation/confirmation';
import ShareOverlay from '../../component/shareoverlay/shareoverlay';
const Image = styled.img`
    min-width: 150px;
    height: 150px;
`

const Title = styled.p`
    font-size: 26pt;
    color: white;
    font-weight: bolder;
    display: inline-block;
    margin: 0;
`

const Blurb = styled.p`
    font-size: 18pt;
    color: white;
    margin: 0;
`

const ProfileHeader = styled.div`
    margin: 10px;
    display: flex;
    align-items: center;
    min-height: 150px;
`

const PHSide = styled.div`
    margin-left: 20px;
    display: inline-block;
    position: relative;
`

const MiddlePanel = styled.div`
    display: flex;
    align-items: center;
    padding-left: 10px;
    flex: 0 1 auto;
    min-height: 230px;
`

const CustomButton = styled(Button)`
    width: 170px;
    text-align: center;
`
const ButtonGroup = styled.div`
    width: 200px;
    div:not(:first-child) {
        margin-top: 5px;
    }
`

const Specs = styled.div`
    background-color: #717171;
    flex: 0 1 auto;
    width: 100%;
    height: 230px;
    margin: 12px;
    p {
        color: white;
        margin: 5px 5px 5px 5px;
    }
`

const Description = styled.div`
    overflow: scroll;
    background-color: #717171;
    margin: 10px;
`
class ViewProfilePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: {
                name: 'Loading'
            },
            showDelete: false,
            showShareOverlay: false
        }
    }

    static getDerivedStateFromProps(props) {
        return {
            profile: ProfilesManager.getProfileFromID(props.match.params.id)
        }
    }

    editprofile = () => {
        this.props.history.push(`/edit/general/${this.state.profile.id}`)
    }

    launchProfile = () => {
        LauncherManager.openLauncher();
    }

    deleteClick = () => {
        this.setState({
            showDelete: true
        })
    }
    cancelDelete = () => {
        this.setState({
            showDelete: false
        })
    }

    confirmDelete = () => {
        ProfilesManager.deleteProfile(this.state.profile).then(() => {
            this.props.history.push(`/`);
        })    
    }

    showShare = () => {
        this.setState({
            showShareOverlay: true
        })
    }

    hideShare = () => {
        this.setState({
            showShareOverlay: false
        })
    }

    render() {
        let { profile, showDelete } = this.state;
        return (
            <Page>
                {showDelete && <Confirmation cancelDelete={this.cancelDelete} confirmDelete={this.confirmDelete} />}
                <Header title='profile' backlink='/' />
                <ProfileHeader>
                    <Image src={`${profile.iconpath}#${new Date().getTime()}`} />
                    <PHSide>
                        <Title>{profile.name}</Title>
                        <Blurb>{profile.blurb}</Blurb>
                    </PHSide>
                </ProfileHeader>
                
                <MiddlePanel>
                    <ButtonGroup>
                        <CustomButton onClick={this.launchProfile} color='green'>launch</CustomButton>
                        <CustomButton onClick={this.editprofile} color='yellow'>edit</CustomButton>
                        <CustomButton color='purple'>update</CustomButton>
                        <CustomButton onClick={this.showShare} color='blue'>share</CustomButton>
                        <CustomButton onClick={this.deleteClick} color='red'>delete</CustomButton>
                    </ButtonGroup>
                    <Specs>
                        <p>internal id: {profile.id}</p>
                    </Specs>
                </MiddlePanel>
                <Description>
                    <SanitizedHTML html={profile.description} />
                </Description>
                {this.state.showShareOverlay && <ShareOverlay cancelClick={this.hideShare} profile={profile} />}
            </Page>
        )
    }
}

export default withRouter(ViewProfilePage)