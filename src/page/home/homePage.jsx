import React, { useState, useContext, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, TextInput, Detail } from '@theemeraldtree/emeraldui';
import styled from 'styled-components';
import transition from 'styled-transition-group';
import SearchBox from '../../component/searchbox/searchbox';
import ProfileGrid from './components/profilegrid';
import ProfilesManager from '../../manager/profilesManager';
import Global from '../../util/global';
import ImportOverlay from '../../component/importoverlay/importoverlay';
import NavContext from '../../navContext';
import MCVersionSelector from '../../component/mcVersionSelector/mcVersionSelector';
import useKeyPress from '../../util/useKeyPress';

const CreateOverlay = transition.div`
  position: absolute;
  top: 100px;
  right: 20px;
  width: 300px;
  height: 209px;
  background: #2d2d2d;
  box-shadow: 0px 0px 6px 3px rgba(0, 0, 0, 0.35);
  padding: 5px;
  input {
    width: 290px;
  }

  h1 {
    margin: 0;
    font-size: 13pt;
  }

  &:enter {
    top: 90px;
    opacity: 0;
  }

  &:enter-active {
    opacity: 1;
    top: 100px;
    transition: 150ms ease-in;
  }

  &:exit {
    top: 100px;
    opacity: 1;
  }

  &:exit-active {
    opacity: 0;
    top: 90px;
    transition: 150ms ease-in;
  }

  &::before {
    content: " ";
    position: absolute;
    top: -30px;
    right: 0;
    border-width: 15px;
    border-style: solid;
    border-color: transparent transparent #2d2d2d transparent;
  }
`;

const CreateControls = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  button {
    margin: 2px;
  }
`;

const Rounded = styled.div`
  border-radius: 5px;
  display: flex;
  overflow: hidden;
  button {
    padding: 2px 10px;
  }
`;

export default withRouter(({ history }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const [mcVersion, setMCCVersion] = useState(Global.MC_VERSIONS[0]);
  const [showImport, setShowImport] = useState(false);
  const createRef = useRef(null);
  const nameRef = useRef(null);
  const escapePress = useKeyPress('Escape');

  const { header } = useContext(NavContext);

  useEffect(() => {
    header.setShowBackButton(false);
    header.setTitle('INSTANCES');
    header.setShowChildren(true);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (createRef.current && !createRef.current.contains(e.target)) {
        setShowCreate(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [createRef]);

  useEffect(() => {
    if (escapePress && showCreate) setShowCreate(false);
  }, [escapePress]);

  const createClick = () => {
    setShowCreate(true);

    // Wait for popup to fully display
    setTimeout(() => {
      if (nameRef.current) {
        nameRef.current.focus();
      }
    }, 150);
  };

  useEffect(() => {
    header.setChildren(
      <Rounded>
        <SearchBox
          value={searchTerm}
          type="text"
          onChange={e => setSearchTerm(e.target.value.toLowerCase())}
          placeholder="Search instances..."
        />
        <Button onClick={() => createClick()} color="green">
          +
        </Button>
      </Rounded>
    );
  }, [searchTerm]);

  const createNameChange = e => {
    const input = e.target.value;
    const names = ProfilesManager.loadedProfiles.map(prof => prof.id);
    if (input.trim() !== '' && !names.includes(Global.createID(input))) {
      setNameEntered(true);
    } else {
      setNameEntered(false);
    }
    setCreateName(input);
  };

  const create = e => {
    e.preventDefault();
    ProfilesManager.createProfile(createName, mcVersion).then(() => {
      history.push(`/profile/${Global.createID(createName)}`);
    });
  };

  return (
    <>
      <ProfileGrid searchTerm={searchTerm} />
      <ImportOverlay in={showImport} cancelClick={() => setShowImport(false)} />

      <CreateOverlay unmountOnExit timeout={500} in={showCreate} ref={createRef}>
        <form onSubmit={create}>
          <h1>CREATE A NEW INSTANCE</h1>
          <Detail>instance name</Detail>
          <TextInput ref={nameRef} onChange={createNameChange} />
          <Detail>minecraft version</Detail>
          <MCVersionSelector value={mcVersion} onChange={ver => setMCCVersion(ver)} />

          <CreateControls>
            <Button type="button" onClick={() => setShowCreate(false)} color="red">
              cancel
            </Button>
            <Button type="submit" disabled={!nameEntered} color="green">
              create
            </Button>
          </CreateControls>
        </form>
      </CreateOverlay>
    </>
  );
});
