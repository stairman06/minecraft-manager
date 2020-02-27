import React, { Component } from 'react';
import styled from 'styled-components';
import Overlay from '../overlay/overlay';
import Button from '../button/button';
import Hosts from '../../host/Hosts';
import AlertBackground from '../alert/alertbackground';
const BG = styled(AlertBackground)`
    width: 100%;
    height: fit-content;
    max-width: 600px;
    max-height: 500px;
    background-color: #222;
    padding: 10px;
    color: white;
    display: flex;
    flex-flow: column;
`

const Title = styled.p`
    margin: 0;
    font-weight: 200;
    font-size: 21pt;
`

const Subtext = styled.p`
    margin: 0;
`

const Breaker = styled.div`
    height: 29px;
`

const ButtonsContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 5px;
    flex-shrink: 0;
    div {
        margin-right: 5px;
    }
`

export default class UpdateOverlay extends Component {

    constructor(props) {
        super(props);
        this.state = {
            displayState: 'main',
            exportProgress: 'Waiting...',
            noConnection: false
        }
    }

    enableFolder = (e) => {
        let { exportFolders } = this.state;
        exportFolders[e.currentTarget.dataset.folder] = !exportFolders[e.currentTarget.dataset.folder];
        this.setState({
            exportFolders: exportFolders
        })
    }
    
    async componentDidMount() {
        let { profile } = this.props;
        if(profile.hosts.curse) {
            const update = await Hosts.checkForAssetUpdates('curse', profile);
            if(update) {
                if(update === 'no-connection')  {
                    this.setState({
                        noConnection: true,
                        updateAvailable: false
                    })
                }else{
                    this.setState({
                        updateAvailable: true,
                        updateVersion: update
                    })
                }
            }else{
                this.setState({
                    noUpdates: true
                })
            }
        }else{
            this.setState({
                noUpdates: true
            })
        }
    }

    updateClick = () => {
        let { profile } = this.props;
        let { updateVersion } = this.state;
        this.setState({
            displayState: 'progress'
        })
        profile.changeHostVersion('curse', updateVersion.hosts.curse.fileID, (progress) => {
            this.setState({
                updateProgress: progress
            })
        }).then(() => {
            this.setState({
                displayState: 'done'
            })
        });
    }

    render() {
        const { noUpdates, updateAvailable, updateVersion, displayState, noConnection } = this.state;
        return (
            <Overlay force in={this.props.in}>
                <BG>
                    {displayState === 'done' && <>
                        <Title>done</Title>
                        <Subtext>the profile update is complete</Subtext>
                        <Button onClick={this.props.cancelClick} color='green'>ok</Button>
                        </>}
                    {displayState === 'main' && <>
                        {displayState !== 'done' && <Title>update your profile</Title>}
                        {!noUpdates && !updateAvailable && !noConnection && <Subtext>checking for updates...</Subtext>}
                        {noUpdates && !noConnection && <Subtext>you have the latest version. no update is available</Subtext>}
                        {noConnection && <Subtext>Unable to connect.</Subtext>}
                        {updateAvailable && <Subtext>a new version is available. 
                            <br />you have: {this.props.profile.version.displayName}
                            <br />latest version: {updateVersion.displayName}
                            <br />would you like to update?
                        </Subtext>}
                        <Breaker />
                        <ButtonsContainer>
                            {updateAvailable && <>
                            <Button onClick={this.props.cancelClick} color='red'>cancel</Button>
                            <Button onClick={this.updateClick} color='green'>update</Button>
                            </>}
                            {(noUpdates || noConnection) && <Button color='green' onClick={this.props.cancelClick}>close</Button>}
                        </ButtonsContainer>
                    </>}
                    {this.state.displayState === 'progress' && <>
                        <Title>Updating...</Title>
                        <Subtext>{this.state.updateProgress}</Subtext>
                    </>}
                </BG>
            </Overlay>
        )
    }
}
