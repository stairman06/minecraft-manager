/* eslint-disable no-tabs */
import os from 'os';
import Global from './global';
import LibrariesManager from '../manager/librariesManager';
import VersionsManager from '../manager/versionsManager';
import LauncherManager from '../manager/launcherManager';
import ProfilesManager from '../manager/profilesManager';

const Debug = {
  systemSpecs: () => `
OS: ${os.release()}
Platform: ${os.platform()}
Architecture: ${os.arch()}
CPUs: ${os
    .cpus()
    .map(
      (cpu, index) => `
	CPU${index}: ${cpu.model}`
    )
    .join('')}

Memory:
	Free: ${os.freemem()}
	Total: ${os.totalmem()}`,
  dataDump: () => {
    const allDumpedMCProfiles = LauncherManager.dumpAllProfiles();
    return `
=======
Minecraft Manager Data Dump
${new Date().toISOString()}
file an issue at https://theemeraldtree.net/mcm/issues
=======

System Specifications, as known to Minecraft Manager
${Debug.systemSpecs()}

=======
Begin Minecraft Manager Data Dump
=======

Minecraft Manager Version ${Global.MCM_VERSION} ${Global.MCM_RELEASE_DATE}
Implementing OMAF Version ${Global.OMAF_VERSION}

Directory Locations
---
MCM_PATH: ${Global.MCM_PATH}
TEMP: ${Global.MCM_TEMP}
PROFILES: ${Global.PROFILES_PATH}

Minecraft Manager Profiles
---
Loaded Profiles: ${ProfilesManager.loadedProfiles
      .map(
        profile => `
	Name: ${profile.name}
	ID: ${profile.id}
	omafVersion: ${profile.omafVersion}
	profilePath: ${profile.profilePath}
	subAssetsPath: ${profile.subAssetsPath}
	installed: ${profile.installed}
	progressState: ${JSON.stringify(profile.progressState)}
	error: ${profile.error}
	state: ${profile.state}
	temp: ${JSON.stringify(profile.temp)}
	iconURL: ${profile.iconURL}
	gameDir: ${profile.gameDir}
	fpath: ${profile.fpath},
	safename: ${profile.safename}
	minecraftversion: ${profile.minecraftversion}
	modsPath: ${profile.modsPath}
	versionname: ${profile.versionname}
	iconPath: ${profile.iconPath}

	hosts: ${JSON.stringify(profile.hosts)}
	frameworks: ${JSON.stringify(profile.frameworks)}

	version: ${JSON.stringify(profile.version)}
	---
`
      )
      .join('')}

Minecraft Client Information
---
MC Versions: ${Global.MC_VERSIONS.join(',')}

Minecraft Client Libraries
---
Libraries Path: ${LibrariesManager.getLibrariesPath()}
MCM Libraries Path: ${LibrariesManager.getMCMLibraries()}
All MCM Libraries: ${LibrariesManager.dumpAllLibraries().join(',')}
Extra Libraries: ${Global.checkExtraMinecraftLibraries()}

Minecraft Client Versions
---
Versions Path: ${VersionsManager.getVersionsPath()}
All Versions: ${VersionsManager.dumpAllVersions().join(',')}
Extra Versions: ${Global.checkExtraMinecraftVersions()}

Minecraft Client Profiles
---
Profiles Path: ${LauncherManager.getLauncherProfiles()}
All Profiles: ${Object.keys(allDumpedMCProfiles)
      .map(key => {
        const profile = allDumpedMCProfiles[key];
        return `
	ID: ${key}
	Name: ${profile.name}
	gameDir: ${profile.gameDir},
	lastVersionId: ${profile.lastVersionId}
	type: ${profile.type}
	---`;
      })
      .join('')}
Extra Profiles: ${Global.checkExtraMinecraftProfiles()}

=======
End Minecraft Manager Data Dump
=======`;
  }
};

export default Debug;