import path from 'path';
import fs from 'fs';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import Global from '../util/global';
import ProfilesManager from './profilesManager';
import LogManager from './logManager';
import DownloadsManager from './downloadsManager';

const LibrariesManager = {
  getLibrariesPath() {
    return path.join(Global.getMCPath(), '/libraries/');
  },
  getMCMLibraries() {
    return path.join(this.getLibrariesPath(), '/minecraftmanager/profiles/');
  },
  createLibraryPath(profile) {
    this.checkExist();
    const p = path.join(this.getMCMLibraries(), `/mcm-${profile.id}`);
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p);
    }

    return p;
  },
  checkExist() {
    const mcmpath = path.join(this.getLibrariesPath(), '/minecraftmanager');
    if (!fs.existsSync(mcmpath)) {
      fs.mkdirSync(mcmpath);
    }
    if (!fs.existsSync(this.getMCMLibraries())) {
      fs.mkdirSync(this.getMCMLibraries());
    }
  },
  renameLibrary(profile, newID) {
    if (profile.frameworks.forge || profile.frameworks.fabric) {
      // old library method check
      const profileLibrary = path.join(
        this.getMCMLibraries(),
        `/mcm-${profile.id}`,
      );
      if (
        fs.existsSync(
          path.join(profileLibrary, `/profiles-mcm-${profile.id}.jar`),
        )
      ) {
        fs.renameSync(
          path.join(profileLibrary, `/profiles-mcm-${profile.id}.jar`),
          path.join(profileLibrary, `/profiles-mcm-${newID}.jar`),
        );
      } else if (profile.frameworks.fabric) {
        fs.renameSync(
          path.join(
            profileLibrary,
            `/fabric-intermediary/mcm-${profile.id}-fabric-intermediary.jar`,
          ),
          path.join(
            profileLibrary,
            `/fabric-intermediary/mcm-${newID}-fabric-intermediary.jar`,
          ),
        );
        fs.renameSync(
          path.join(
            profileLibrary,
            `/fabric-loader/mcm-${profile.id}-fabric-loader.jar`,
          ),
          path.join(
            profileLibrary,
            `/fabric-loader/mcm-${newID}-fabric-loader.jar`,
          ),
        );
      } else if (profile.frameworks.forge) {
        fs.renameSync(
          path.join(profileLibrary, `/forge/mcm-${profile.id}-forge.jar`),
          path.join(profileLibrary, `/forge/mcm-${newID}-forge.jar`),
        );
      }

      fs.renameSync(
        profileLibrary,
        path.join(this.getMCMLibraries(), `/mcm-${newID}`),
      );
    }
  },
  deleteLibrary(profile) {
    return new Promise((resolve) => {
      const libraryPath = path.join(
        this.getMCMLibraries(),
        `/mcm-${profile.id}`,
      );
      if (fs.existsSync(libraryPath)) {
        rimraf(libraryPath, () => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  },
  cleanLibraries() {
    LogManager.log(
      'info',
      '[LibrariesManager] [CleanLibraries] Starting clean libraries...',
    );
    fs.readdirSync(this.getMCMLibraries()).forEach((file) => {
      if (file.substring(0, 4) === 'mcm-') {
        if (
          !ProfilesManager.loadedProfiles.find(
            (prof) => file === `mcm-${prof.id}`,
          )
        ) {
          rimraf.sync(path.join(this.getMCMLibraries(), file));
          LogManager.log(
            'info',
            `[LibrariesManager] [CleanLibraries] Removed library ${file}`,
          );
        }
      }
    });
  },
  // sometimes there are missing libraries
  checkMissingLibraries() {
    const akkaactorpath = path.join(
      this.getLibrariesPath(),
      '/com/typesafe/akka/akka-actor_2.11/2.3.3/akka-actor_2.11-2.3.3.jar',
    );
    mkdirp.sync(path.dirname(akkaactorpath));
    if (!fs.existsSync(akkaactorpath)) {
      DownloadsManager.startFileDownload(
        'Missing essential library akka-actor',
        'https://repo1.maven.org/maven2/com/typesafe/akka/akka-actor_2.11/2.3.3/akka-actor_2.11-2.3.3.jar',
        akkaactorpath,
      );
    }
  },
};

export default LibrariesManager;
