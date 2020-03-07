import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import LogManager from '../../manager/logManager';
import DownloadsManager from '../../manager/downloadsManager';
import Global from '../../util/global';
import VersionsManager from '../../manager/versionsManager';
import HTTPRequest from '../../host/httprequest';
import LibrariesManager from '../../manager/librariesManager';

const { exec } = require('child_process');
/*
    ==========
      WARNING
    ==========

    This file is a real mess because it is a real pain to install Forge for 1.13+
    Proceed with caution!

    HUGE credit to
    https://github.com/Stonebound/ForgeTheSane
    and the original, forked repo
    https://github.com/robotbrain/ForgeTheSane
*/

const ForgeComplex = {
  installState: {},
  log(msg) {
    LogManager.log('info', `[ForgeComplex] ${msg}`);
  },
  calculateMavenPath(mvn) {
    this.log(`Calculating maven path for ${mvn}`);
    const split = mvn.split(':');
    let EXTENSION = '.jar';
    let isSpecial = false;
    if (mvn.indexOf('@') !== -1) {
      const splitAt = mvn.split('@');
      EXTENSION = `.${splitAt[splitAt.length - 1]}`;
    }
    if (split[3]) {
      isSpecial = true;
      if (mvn.indexOf('@') !== -1) {
        split[3] = split[3].split('@')[0];
      }
    }
    if (isSpecial) {
      return `${split[0].replace(/\./g, '/')}/${split[1]}/${split[2]}/${
        split[1]
      }-${split[2]}-${split[3]}${EXTENSION}`;
    }
    return `${split[0].replace(/\./g, '/')}/${split[1]}/${split[2]}/${
      split[1]
    }-${split[2]}${EXTENSION}`;
  },
  setupForge(profile, callback) {
    this.log('Downloading installer jar');

    const workFolder = path.join(
      Global.MCM_TEMP,
      `/forge-install-${profile.id}-${new Date().getTime()}`,
    );
    if (!fs.existsSync(Global.MCM_TEMP)) {
      fs.mkdirSync(Global.MCM_TEMP);
    }

    fs.mkdirSync(workFolder);

    DownloadsManager.startFileDownload(
      `Forge Installer Jar\n_A_${profile.name}`,
      `https://files.minecraftforge.net/maven/net/minecraftforge/forge/${profile.frameworks.forge.version}/forge-${profile.frameworks.forge.version}-installer.jar`,
      path.join(workFolder, 'installer.jar'),
    ).then(() => {
      this.log('Installer Jar download finished');
      this.log('Extracting installer jar');

      const TEMP_PATH = path.join(workFolder);
      const JAR_PATH = path.join(TEMP_PATH, '/jar');
      const DATA_PATH = path.join(TEMP_PATH, '/data');

      this.installState[profile.id] = {
        TEMP_PATH,
        JAR_PATH,
        DATA_PATH,
        totalLibraryCount: 0,
        totalDataCount: 0,
        processorNumber: 0,
        callback,

        LIBRARIES: {},
        DATA: {},
      };

      const { LIBRARIES } = this.installState[profile.id];

      const zip = new AdmZip(path.join(workFolder, 'installer.jar'));
      zip.extractAllTo(JAR_PATH);

      this.log('Reading install_profile.json');
      const INSTALL_PROFILE = JSON.parse(
        fs.readFileSync(path.join(JAR_PATH, '/install_profile.json')),
      );

      this.installState[profile.id].INSTALL_PROFILE = INSTALL_PROFILE;
      this.log('Starting read of libraries and downloading them');
      for (const library of INSTALL_PROFILE.libraries) {
        this.log(`Reading library ${library.name}`);
        const mvnPath = path.join(DATA_PATH, library.downloads.artifact.path);
        this.log(
          `Starting download of library ${library.name} from ${library.downloads.artifact.url}`,
        );

        mkdirp(
          path.dirname(path.join(DATA_PATH, library.downloads.artifact.path)),
          () => {
            if (library.downloads.artifact.url) {
              DownloadsManager.startFileDownload(
                `Forge Library ${library.name}\n_A_${profile.name}`,
                library.downloads.artifact.url,
                mvnPath,
              ).then(() => {
                LIBRARIES[library.name] = mvnPath;
                this.installState[profile.id].totalLibraryCount++;
                this.checkLibraryDone(profile);
              });
            } else {
              this.log(
                `Library ${library.name} is a local file. Finding it...`,
              );

              LIBRARIES[library.name] = mvnPath;
              fs.copyFileSync(
                path.join(JAR_PATH, 'maven', library.downloads.artifact.path),
                path.join(DATA_PATH, library.downloads.artifact.path),
              );
              this.installState[profile.id].totalLibraryCount++;
              this.checkLibraryDone(profile);
            }
          },
        );
      }
    });
  },
  checkLibraryDone(profile) {
    const {
      totalLibraryCount,
      INSTALL_PROFILE,
      DATA,
      TEMP_PATH,
    } = this.installState[profile.id];
    if (totalLibraryCount >= INSTALL_PROFILE.libraries.length) {
      this.log('Libraries are done downloading');
      this.log('Parsing data');
      for (const datum_name of Object.keys(INSTALL_PROFILE.data)) {
        this.log(`Reading datum ${datum_name}`);
        const datum = INSTALL_PROFILE.data[datum_name];
        const p = datum.client;
        if (p.substring(0, 1) === '[') {
          let mvnPath = p.split('[')[1];
          mvnPath = mvnPath.substring(0, mvnPath.length - 1);
          mvnPath = this.calculateMavenPath(mvnPath);
          this.log(`Maven path for datum ${datum_name} is ${mvnPath}`);
          DATA[datum_name] = path.join(`${TEMP_PATH}/data/${mvnPath}`);
          this.installState[profile.id].totalDataCount++;
          this.checkDataDone(profile);
        } else if (p.substring(0, 1) === '/') {
          const outPath = path.join(`${TEMP_PATH}/data${p}`);
          mkdirp(path.dirname(outPath), () => {
            this.log(`Copying local datafile from TEMP/jar${p} to ${outPath}`);
            fs.copyFileSync(path.join(`${TEMP_PATH}/jar${p}`), outPath);
            DATA[datum_name] = outPath;
            this.installState[profile.id].totalDataCount++;
            this.checkDataDone(profile);
          });
        } else {
          this.installState[profile.id].totalDataCount++;
          this.checkDataDone(profile);
        }
      }
    }
  },
  checkDataDone(profile) {
    const {
      INSTALL_PROFILE,
      DATA,
      TEMP_PATH,
      totalDataCount,
    } = this.installState[profile.id];
    if (totalDataCount >= Object.keys(INSTALL_PROFILE.data).length) {
      this.log('Data is done being parsed');
      this.log('Downloading Minecraft JAR');

      HTTPRequest.httpGet(
        'https://launchermeta.mojang.com/mc/game/version_manifest.json',
      ).then((versions) => {
        versions = JSON.parse(versions);
        const verURL = versions.versions.find(
          (ver) => ver.id === profile.version.minecraft.version,
        ).url;
        HTTPRequest.httpGet(verURL).then((verData) => {
          verData = JSON.parse(verData);
          DownloadsManager.startFileDownload(
            `Minecraft ${profile.version.minecraft.version} Client JAR\n_A_${profile.name}`,
            verData.downloads.client.url,
            path.join(TEMP_PATH, '/client.jar'),
          ).then(() => {
            this.log('Running processors');
            DATA.MINECRAFT_JAR = path.join(TEMP_PATH, '/client.jar');

            this.executeNextProcessor(profile);
          });
        });
      });
    }
  },
  executeNextProcessor(profile) {
    const getMainClass = (jar) => {
      const z = AdmZip(jar);
      const meta = z.readAsText('META-INF/MANIFEST.MF');
      for (const line of meta.split('\n')) {
        if (line.indexOf('Main-Class:') !== -1) {
          return line
            .split(':')[1]
            .replace(/\r?\n|\r/g, '')
            .trim();
        }
      }
    };

    const {
      INSTALL_PROFILE,
      LIBRARIES,
      DATA,
      processorNumber,
      TEMP_PATH,
      callback,
    } = this.installState[profile.id];
    if (processorNumber < INSTALL_PROFILE.processors.length) {
      const processor = INSTALL_PROFILE.processors[processorNumber];
      ('');
      const jar = LIBRARIES[processor.jar];
      const classpath = processor.classpath.map((library) => LIBRARIES[library]);
      const args = processor.args.map((arg) => {
        if (arg.substring(0, 1) === '[') {
          return `"${LIBRARIES[arg.substring(1, arg.length - 1)]}"`;
        } if (arg.substring(0, 1) === '{') {
          return `"${DATA[arg.substring(1, arg.length - 1)]}"`;
        }
        return arg;
      });

      const commandArguments = `-cp "${jar};${classpath.join(
        ';',
      )}" "${getMainClass(jar)}" ${args.join(' ')}`;
      this.log(`Java path is: ${Global.getJavaPath()}`);
      this.log(`Running: java ${commandArguments}`);

      DownloadsManager.createProgressiveDownload(
        `Running ${path.basename(jar)}\n_A_${profile.name}`,
      ).then((download) => {
        DownloadsManager.setDownloadProgress(download.name, 100);
        exec(
          `"${Global.getJavaPath()}" ${commandArguments}`,
          {
            cwd: TEMP_PATH,
            maxBuffer: 2048 * 500,
          },
          (err, stdout, stderr) => {
            if (err || stderr) {
              LogManager.log('error', err);
            }
            DownloadsManager.removeDownload(download.name);
            this.log(`Finished running processor ${jar}`);
            this.installState[profile.id].processorNumber++;
            this.executeNextProcessor(profile);
          },
        );
      });
    } else {
      this.log('Finished processors');

      this.log('Creating version...');
      VersionsManager.createVersion(profile, 'forgeComplex', {
        version: JSON.parse(
          fs.readFileSync(path.join(TEMP_PATH, '/jar/version.json')),
        ),
      });

      this.log('Creating library...');
      const libraryPath = LibrariesManager.createLibraryPath(profile);
      fs.mkdirSync(path.join(libraryPath, '/forge'));

      this.log('Copying Forge jar...');
      fs.copyFileSync(
        path.join(
          TEMP_PATH,
          `/jar/maven/net/minecraftforge/forge/${profile.frameworks.forge.version}/forge-${profile.frameworks.forge.version}.jar`,
        ),
        path.join(libraryPath, `/forge/mcm-${profile.id}-forge.jar`),
      );

      this.log('Copying Forge Client and Universal...');

      const mcfpath = path.join(
        LibrariesManager.getLibrariesPath(),
        '/net/minecraftforge',
      );

      mkdirp(mcfpath, () => {
        Global.copyDirSync(
          path.join(TEMP_PATH, '/data/net/minecraftforge'),
          mcfpath,
        );

        this.log('Copying Minecraft Client Jars...');

        const clientpath = path.join(
          LibrariesManager.getLibrariesPath(),
          '/net/minecraft/client',
        );
        mkdirp(clientpath, () => {
          Global.copyDirSync(
            path.join(TEMP_PATH, '/data/net/minecraft/client'),
            path.join(
              LibrariesManager.getLibrariesPath(),
              '/net/minecraft/client',
            ),
          );

          rimraf.sync(TEMP_PATH);
          this.log('Done installing Forge!');
          callback();
        });
      });
    }
  },
};

export default ForgeComplex;
