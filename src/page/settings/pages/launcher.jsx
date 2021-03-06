import React, { useState } from 'react';
import { InputHolder, Detail, Button, withTheme } from '@theemeraldtree/emeraldui';
import styled, { css } from 'styled-components';
import PropTypes from 'prop-types';
import os from 'os';
import ToggleSwitch from '../../../component/toggleSwitch/toggleSwitch';
import SettingsManager from '../../../manager/settingsManager';
import SettingSeperator from '../../../component/settingSeparator/settingSeparator';
import Gap from '../components/gap';
import QuestionButton from '../../../component/questionButton/questionButton';
import AlertManager from '../../../manager/alertManager';
import PathInput from '../components/pathInput';
import EmptyOffset from '../components/emptyOffset';
import Global from '../../../util/global';
import MCLauncherIntegrationHandler from '../../../minecraft/mcLauncherIntegrationHandler';

const { dialog } = require('electron').remote;

const IntegrationSettings = styled.div`
  transition: 150ms;
  ${props => !props.enabled && css`
    opacity: 0.5;
  `}
`;

function Launcher({ theme }) {
  const [integrationEnabled, setIntegrationEnabled] = useState(SettingsManager.currentSettings.launcherIntegration);
  const [mcHome, setMCHome] = useState(SettingsManager.MC_HOME);
  const [mcExe, setMCExe] = useState(SettingsManager.currentSettings.mcExe);

  const toggleEnabled = () => {
    const newValue = !integrationEnabled;
    if (!mcHome || !mcExe) {
      if (newValue) {
        AlertManager.messageBox('Launcher integration', 'Please set your Minecraft Home Directory and Minecraft Executable path now.<br /><br />If you do not set these, Launcher Integration will be automatically turned off.');
      } else {
        setIntegrationEnabled(false);
      }
    } else if ((!integrationEnabled && mcHome && mcExe) || integrationEnabled) {
      SettingsManager.currentSettings.launcherIntegration = newValue;
      SettingsManager.save();
      if (newValue) {
        MCLauncherIntegrationHandler.integrate(true);
      } else {
        MCLauncherIntegrationHandler.removeIntegration();
      }
    }
    setIntegrationEnabled(newValue);
  };

  const showInfo = () => {
    AlertManager.messageBox('Launcher integration', 'Launcher Integration allows Minecraft Manager to integrate with the regular Minecraft launcher. It will sync your instances and accounts with the vanilla Minecraft launcher.');
  };

  const checkDone = (exe, home) => {
    if (exe && home) {
      setIntegrationEnabled(true);
      SettingsManager.currentSettings.launcherIntegration = true;
      SettingsManager.save();
      MCLauncherIntegrationHandler.integrate(true);
    }
  };

  const chooseMCHome = () => {
    const p = dialog.showOpenDialogSync({
      title: 'Choose your Minecraft Home Directory',
      defaultPath: Global.getDefaultMinecraftPath(),
      buttonLabel: 'Select Directory',
      properties: ['openDirectory', 'showHiddenFiles']
    });

    if (p && p[0]) {
      SettingsManager.setHomeDirectory(p[0]);
      setMCHome(p[0]);

      checkDone(mcExe, p[0]);
    }
  };

  const chooseMCExe = () => {
    let properties;
    if (os.platform() === 'win32') {
      properties = ['openFile', 'showHiddenFiles'];
    } else if (os.platform() === 'darwin') {
      properties = ['openDirectory', 'showHiddenFiles', 'treatPackageAsDirectory'];
    }
    const p = dialog.showOpenDialogSync({
      title: 'Choose your Minecraft Executable',
      defaultPath: Global.getDefaultMCExePath(),
      buttonLabel: 'Select File',
      properties
    });

    if (p && p[0]) {
      SettingsManager.setMCExe(p[0]);
      setMCExe(p[0]);

      checkDone(p[0], mcHome);
    }
  };

  const questionHomeDirectory = () => {
    AlertManager.messageBox('Minecraft Home Directory', `
    Your Minecraft Home directory is where the regular Minecraft Launcher stores info about the game.
    <br /><br />
    It's sometimes referred to as the <b>.minecraft folder</b>.`);
  };

  const questionMCExe = () => {
    AlertManager.messageBox('Minecraft Executable', `
    The Minecraft Executable is the regular Minecraft Launcher.
    <br /><br />
    On Windows, it's typically located at<br /><b>C:\\Program Files (x86)\\Minecraft\\MinecraftLauncher.exe</b>
    `);
  };
  return (
    <>
      <Gap />
      <InputHolder>
        <ToggleSwitch onClick={toggleEnabled} value={integrationEnabled} />
        <Detail>Enable Launcher Integration</Detail>
        <QuestionButton onClick={showInfo} />
      </InputHolder>
      <SettingSeperator />
      <IntegrationSettings enabled={integrationEnabled}>
        <EmptyOffset>
          <div>
            <Detail>Minecraft Home Directory<QuestionButton onClick={questionHomeDirectory} /></Detail>
            <InputHolder text style={{ marginTop: '10px' }}>
              <PathInput readOnly theme={theme} value={mcHome} />
              <Button disabled={!integrationEnabled} onClick={chooseMCHome} color="green">Browse</Button>
            </InputHolder>
          </div>
          <SettingSeperator />
          <div>
            <Detail>Minecraft Executable Path<QuestionButton onClick={questionMCExe} /></Detail>
            <InputHolder text style={{ marginTop: '10px' }}>
              <PathInput readOnly theme={theme} value={mcExe} />
              <Button disabled={!integrationEnabled} onClick={chooseMCExe} color="green">Browse</Button>
            </InputHolder>
          </div>
        </EmptyOffset>

      </IntegrationSettings>
    </>
  );
}

Launcher.propTypes = {
  theme: PropTypes.object
};

export default withTheme(Launcher);
