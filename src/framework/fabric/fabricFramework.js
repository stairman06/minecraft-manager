import path from 'path';
import fs from 'fs';
import VersionsManager from '../../manager/versionsManager';
import HTTPRequest from '../../host/httprequest';
import DownloadsManager from '../../manager/downloadsManager';
import LibrariesManager from '../../manager/librariesManager';
import ToastManager from '../../manager/toastManager';
import LauncherManager from '../../manager/launcherManager';

const FabricFramework = {
  setupFabric: profile =>
    new Promise(async resolve => {
      const versionMeta = (
        await HTTPRequest.get(
          `https://meta.fabricmc.net/v2/versions/loader/${profile.version.minecraft.version}/${profile.frameworks.fabric.version}`
        )
      ).data;
      VersionsManager.createVersion(profile, 'fabric', versionMeta);

      const libraryPath = path.join(LibrariesManager.getMCMLibraries(), `/mcm-${profile.id}`);

      if (!fs.existsSync(libraryPath)) {
        fs.mkdirSync(libraryPath);
      }

      fs.mkdirSync(path.join(libraryPath, '/fabric-intermediary'));
      fs.mkdirSync(path.join(libraryPath, '/fabric-loader'));

      DownloadsManager.startFileDownload(
        `Fabric Intermediary\n_A_${profile.name}`,
        `https://maven.fabricmc.net/net/fabricmc/intermediary/${profile.version.minecraft.version}/intermediary-${profile.version.minecraft.version}.jar`,
        path.join(libraryPath, `fabric-intermediary/mcm-${profile.id}-fabric-intermediary.jar`)
      );

      DownloadsManager.startFileDownload(
        `Fabric Loader\n_A_${profile.name}`,
        `https://maven.fabricmc.net/net/fabricmc/fabric-loader/${profile.frameworks.fabric.version}/fabric-loader-${profile.frameworks.fabric.version}.jar`,
        path.join(libraryPath, `fabric-loader/mcm-${profile.id}-fabric-loader.jar`)
      );

      resolve();
    }),
  uninstallFabric: profile =>
    new Promise(resolve => {
      LibrariesManager.deleteLibrary(profile).then(() => {
        VersionsManager.deleteVersion(profile).then(() => {
          LauncherManager.setProfileData(profile, 'lastVersionId', profile.version.minecraft.version);
          profile.removeFramework('fabric');
          resolve();
        });
      });
    }),
  getFabricLoaderVersions: mcversion =>
    new Promise((resolve, reject) => {
      HTTPRequest.get(`https://meta.fabricmc.net/v2/versions/loader/${mcversion}`).then(versions => {
        if (versions && versions.data) {
          resolve(versions.data);
        } else {
          reject();
          ToastManager.createToast(
            'Error',
            "We can't reach the Fabric servers. Check your internet connection, and try again."
          );
        }
      });
    })
};

export default FabricFramework;
