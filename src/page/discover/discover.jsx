import React, { useState, useEffect, useContext, useReducer } from 'react';
import Page from '../page';
import DiscoverList from '../../component/discoverlist/discoverlist';
import ProfilesManager from '../../manager/profilesManager';
import Hosts from '../../host/Hosts';
import NavContext from '../../navContext';
import SearchBox from '../../component/searchbox/searchbox';

export default function DiscoverPage() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const { header } = useContext(NavContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [listState, setListState] = useState('browseAssets');
  const [progressState, setProgressState] = useState({});

  useEffect(() => {
    ProfilesManager.registerReloadListener(updateProgressStates);
    updateProgressStates();

    header.setOnBackClick(backClick);
    header.setTitle('discover');
    header.setShowBackButton(false);
    header.setBackLink(undefined);
    header.setShowChildren(true);
  }, []);

  useEffect(() => {
    header.setShowBackButton(listState !== 'browseAssets');
    header.setShowChildren(listState === 'browseAssets');
  }, [listState]);

  useEffect(() => {
    header.setChildren(
      <SearchBox
        value={searchValue}
        onChange={searchChange}
        onKeyPress={searchChange}
        placeholder="search"
      />
    );
  }, [searchValue]);

  const searchChange = e => {
    let term = e.target.value;
    setSearchValue(term);
    if (e.key === 'Enter') {
      setSearchTerm(term);
    }
  };

  function backClick() {
    setListState('browseAssets');
  }

  const updateProgressStates = () => {
    setProgressState(ProfilesManager.progressState);
    forceUpdate();
  };

  const installClick = async e => {
    e.stopPropagation();
    let cachedID = e.currentTarget.parentElement.parentElement.dataset.cachedid;
    let modpack = Hosts.cache.assets[cachedID];
    ProfilesManager.progressState[modpack.id] = {
      progress: 'installing',
      version: `temp-${new Date().getTime()}`,
    };
    updateProgressStates();
    await Hosts.installModpack('curse', modpack);
    ProfilesManager.getProfiles().then(() => {
      updateProgressStates();
    });
  };

  const versionInstall = async (version, mp) => {
    ProfilesManager.progressState[mp.id] = {
      progress: 'installing',
      version: version.displayName,
    };
    updateProgressStates();
    await Hosts.installModpackVersion('curse', mp, version.hosts.curse.fileID);
    ProfilesManager.getProfiles().then(() => {
      updateProgressStates();
    });
  };

  return (
    <Page>
      {/* <Header 
                showBackButton={listState !== 'browseAssets'} 
                backClick={backClick} 
                title='discover'
                showChildren={listState === 'browseAssets'}
            >
                <SearchBox 
                    value={searchValue} 
                    onChange={searchChange} 
                    onKeyPress={earchChange} 
                    placeholder='search' 
                />
            </Header> */}

      <DiscoverList
        host="curse"
        mcVerFilter="All"
        versionInstall={versionInstall}
        progressState={progressState}
        stateChange={setListState}
        state={listState}
        type="profile"
        installClick={installClick}
        searchTerm={searchTerm}
      />
    </Page>
  );
}
