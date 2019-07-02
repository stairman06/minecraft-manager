import Profile from "../../type/profile";
import Global from "../../util/global";
import Mod from "../../type/mod";
import HTTPRequest from "../httprequest";
import DownloadsManager from "../../manager/downloadsManager";
import fs from 'fs';
import path from 'path';
import ProfilesManager from "../../manager/profilesManager";
import ForgeManager from "../../manager/forgeManager";
import rimraf from 'rimraf';
const admzip = require('adm-zip');
let Curse = {
    cached: {
        popular: {

        },
        assets: {

        }
    },
    concurrentDownloads: [],
    readCurseAssetList(list) {
        let finalList = [];
        for(let asset of list) {
            let type;
            switch(asset.categorySection.gameCategoryId) {
                case 4471:
                    type = 'profile';
                    break;
                case 6:
                    type = 'mod';
                    break;
                case 12:
                    type = 'resourcepack';
                    break;
                case 17:
                    type = 'world';
                    break;
            }

            let obj;


            const omaf = this.createObjectFromInfo(asset);

            if(type === 'profile') {
                obj = new Profile(omaf);
            }else if(type === 'mod') {
                obj = new Mod(omaf);
            }

            if(asset.attachments && asset.attachments.length) {
                let attach;
                for(let attachment of asset.attachments) {
                    if(attachment.isDefault) {
                        attach = attachment;
                    }
                }
                omaf.iconpath = attach.url;
                obj.iconpath = attach.url;
                omaf.iconURL = attach.url;
                obj.iconURL = attach.url;

            }

            this.cached.assets[omaf.cachedID] = omaf;

            finalList.push(obj);
        }

        console.log(finalList);
        return finalList;
    },

    createObjectFromInfo(asset) {
        let authorsList = [];
        for(let author of asset.authors) {
            authorsList.push({
                name: author.name
            })
        }

        const obj =  {
            name: asset.name,
            id: Global.createID(asset.name),
            blurb: asset.summary,
            url: asset.websiteUrl,
            authors: authorsList,
            cachedID: `curse-cached-${Global.createID(asset.name)}`,
            type: this.getTypeFromID(asset.categorySection.gameCategoryId),
            hosts: {
                curse: {
                    id: asset.id,
                    slug: asset.slug,
                    downloadCount: asset.downloadCount,
                    latestFileID: asset.defaultFileId,
                    dateCreated: asset.dateCreated,
                    dateReleased: asset.dateReleased,
                    dateModified: asset.dateModified,

                    localValues: {
                        gameVerLatestFiles: asset.gameVersionLatestFiles
                    }
                }
            }
        }

        if(asset.attachments && asset.attachments.length) {
            let attach;
            for(let attachment of asset.attachments) {
                if(attachment.isDefault) {
                    attach = attachment;
                }
            }

            obj.iconURL = attach.url;
        }

        return obj;

    },

    getCurseTypeID(type) {
        if(type === 'profile' || type === 'modpack') {
            return 4471;
        }else if(type === 'mod') {
            return 6;
        }
    },

    getTypeFromID(id) {
        if(id === 4471) {
            return 'profile';
        }else if(id === 6) {
            return 'mod';
        }
    },

    async getFullAsset(asset, type) {
        const info = await this.getInfo(asset);
        
        console.log('THE INFO IS');
        console.log(info);
        let obj;
        if(type === 'mod') {
            obj = new Mod(this.createObjectFromInfo(info));
        }else if(type === 'unknown') {
            return this.createObjectFromInfo(info);
        }

        return obj;
    },

    async getInfo(asset) {
        if(!this.cached.assets[asset.cachedID]) {
            return JSON.parse(await HTTPRequest.get(`https://addons-ecs.forgesvc.net/api/v2/addon/${asset.hosts.curse.id}`));
        }
    },

    async addDescription(asset) {
        if(!this.cached.assets[asset.cachedID].description) {
            asset.description = await this.getDescription(asset);
            this.cached.assets[asset.cachedID] = asset;
            return asset;
        }else{
            return this.cached.assets[asset.cachedID];
        }
    },

    async getDescription(asset) {
        if(!this.cached.assets[asset.cachedID].description) {
            return await HTTPRequest.get(`https://addons-ecs.forgesvc.net/api/v2/addon/${asset.hosts.curse.id}/description`, {
                addonID: asset.hosts.curse.id
            });
        }else{
            return this.cached.assets[asset.cachedID].description;
        }
    },

    async search(term, type) {
        const result = await HTTPRequest.get(`https://addons-ecs.forgesvc.net/api/v2/addon/search`, {
            searchFilter: term,
            gameId: 432,
            sectionId: Curse.getCurseTypeID(type),
            categoryId: 0,
            sort: 0,
            pageSize: 20,
            index: 0
        })

        console.log(result);

        return this.readCurseAssetList(JSON.parse(result));
    },

    async cacheCommon() {
        this.getPopularAssets('profile');
        this.getPopularAssets('mod');
    },

    async getPopularAssets(type) {
        let res;
        if(!this.cached.popular[type]) {
            res = await this.search('', type);
            this.cached.popular[type] = res;
        }else{
            res = this.cached.popular[type];
        }
        return res;
    },

    async addFileInfo(asset, fileID) {
        const info = await this.getFileInfo(asset, fileID);

        console.log(info);
        asset.version = info.displayName;
        asset.versionTimestamp = new Date(info.fileDate).getTime();
        asset.hosts.curse.fileID = fileID;
        asset.hosts.curse.fileName = info.fileName;
        asset.downloadTemp = info.downloadUrl;
        this.cached.assets[asset.cachedID] = asset;

        const dependFinal = [];
        if(info.dependencies) {
            for(let dependency of info.dependencies) {
                if(dependency.type === 3) {
                    dependFinal.push({
                        hosts: {
                            curse: {
                                id: dependency.addonId
                            }
                        }
                    })
                }
            }
        }

        asset.dependencies = dependFinal;
        return asset;
    },

    async getFileInfo(asset, fileID) {
        return JSON.parse(await HTTPRequest.get(`https://addons-ecs.forgesvc.net/api/v2/addon/${asset.hosts.curse.id}/file/${fileID}`));
    },

    async getDependencies(asset) {
        if(!this.cached.assets[asset.cachedID].dependencies) {
            let newAsset = await this.addFileInfo(asset, asset.hosts.curse.latestFileID);
            console.log(newAsset);
            let final = [];
            for(let depend of newAsset.dependencies) {
                final.push(await this.getFullAsset(depend, 'unknown'));
            }
            this.cached.assets[asset.cachedID].dependencies = final;
            return final;
        }else{
            return this.cached.assets[asset.cachedID].dependencies;
        }
    },

    async installDependencies(profile, asset) {
        if(asset.dependencies) {
            for(let depend of asset.dependencies) {
                if(depend.hosts.curse.fileID) {
                    this.installModVersion(profile, depend, depend.hosts.curse.fileID);
                }else{
                    console.log(depend);
                    this.installModToProfile(profile, depend);
                }
            }
        }
    },

    async getLatestVersionForMCVersion(asset, mcversion) {
        console.log(asset);
        if(asset.hosts.curse.localValues && asset.hosts.curse.localValues.gameVerLatestFiles) { 
            for(let ver of asset.hosts.curse.localValues.gameVerLatestFiles) {
                console.log(ver);
                if(ver.gameVersion === mcversion) {
                    return ver;
                }
            }
        }else{
            const fullAsset = await this.getFullAsset(asset, 'mod');
            const res = await this.getLatestVersionForMCVersion(fullAsset, mcversion);
            return res;
        }

        return undefined;
    },
    
    async installModToProfile(profile, mod) {
        return new Promise(async (resolve, reject) => {

            if(!mod.name) {
                mod = await this.getFullAsset(mod, 'mod');
            }

            const ver = await this.getLatestVersionForMCVersion(mod, profile.minecraftversion);
            if(!ver) {
                reject('no-version-available')
            }else{
                const newMod = await this.addFileInfo(mod, ver.projectFileId);
                await this.installModVersionToProfile(profile, newMod, true);
                resolve();
            }
        })
    },

    async installModVersionToProfile(profile, mod, dependencies) {
        return new Promise(async (resolve) => {
            if(!fs.existsSync(path.join(profile.gameDir, `/mods/${mod.jar}`))) {
                if(!mod.name) {
                    let newm = await this.getFullAsset(mod, 'mod');
                    newm.hosts.curse.fileID = mod.hosts.curse.fileID;
                    mod = newm;
                }
                DownloadsManager.createProgressiveDownload(`Info for ${mod.name}`).then(async (download) => {
                    if(dependencies) {
                        this.installDependencies(profile, mod);
                    }
                    DownloadsManager.removeDownload(download.name);

                    if(!mod.downloadTemp) {
                        mod = await this.addFileInfo(mod, mod.hosts.curse.fileID);
                    }

                    DownloadsManager.startModDownload(profile, mod, mod.downloadTemp, false).then(async () => {
                        mod.jar = `${mod.id}.jar`;
                        if(!profile.getModFromID(mod.id)) {
                            profile.addMod(new Mod(mod));
                        }
                        resolve(mod);
                    })
                })
            }
        })
    },

    async downloadModList(profile, list, callback, onUpdate, concurrent) {
        if(concurrent !== 0 && concurrent !== undefined) {
            for(let i = 0; i < concurrent - 1; i++) {
                this.downloadModList(profile, list, callback, onUpdate);
            }
        }

        if(list.length === 0) {
            console.log('done installing!');
            callback();
        }else{
            const item = Object.assign({}, list[0]);
            if(this.concurrentDownloads.includes(item.cachedID)) {
                const list2 = list.slice();
                list2.shift();
                console.log(list2);
                this.downloadModList(profile, list2, callback, onUpdate);
            }else{
                this.concurrentDownloads.push(item.cachedID);
                console.log(item);
                console.log('starting installing!');
                await this.installModVersionToProfile(profile, item, false);
                console.log('done installing!');
                this.cached.assets[item.cachedID] = item;
                onUpdate();
                console.log('before list shift');
                list.shift();
                console.log(`after list shift`)
                console.log(list);
                this.downloadModList(profile, list, callback, onUpdate);
            }
        }
    },

    async installModpack(mp) {
        return new Promise(async (resolve) => {
            if(!fs.existsSync(Global.MCM_TEMP)) {
                fs.mkdirSync(Global.MCM_TEMP);
            }

            let cachedAsset = this.cached.assets[mp.cachedID];

            if(cachedAsset !== mp) {
                this.cached.assets[mp.cachedID] = mp;
            }

            if(!cachedAsset.description) {
                let newModpack = await this.addDescription(cachedAsset);
                this.cached.assets[mp.cachedID] = newModpack;
            }

            if(!cachedAsset.hosts.curse.fileID) {
                const newModpack = await this.addFileInfo(cachedAsset, mp.hosts.curse.latestFileID);
                this.cached.assets[mp.cachedID] = newModpack;
            }

            const modpack = cachedAsset;
            const infoDownload = path.join(Global.MCM_TEMP, `${modpack.id}-install.zip`)
            DownloadsManager.startFileDownload(`Info for ${modpack.name}`, modpack.downloadTemp, infoDownload).then(async () => {
                const zip = new admzip(infoDownload);

                const extractPath = path.join(Global.MCM_TEMP, `${modpack.id}-install/`);
                zip.extractAllTo(extractPath, false);
                fs.unlinkSync(infoDownload);

                const manifest = JSON.parse(fs.readFileSync(path.join(extractPath, `manifest.json`)));
                ProfilesManager.createProfile(modpack.name, manifest.minecraft.version).then((profile) => {
                    profile.hosts = modpack.hosts;
                    profile.blurb = modpack.blurb;
                    profile.description = modpack.description;
                    profile.version = modpack.version;
                    profile.versionTimestamp = modpack.versionTimestamp;
                    profile.hosts.curse.fullyInstalled = false;
                    profile.setProfileVersion(modpack.version);
                    profile.changeMCVersion(manifest.minecraft.version);
                    profile.setForgeInstalled(true);
                    profile.setForgeVersion(`${manifest.minecraft.version}-${manifest.minecraft.modLoaders[0].id.substring(6)}`);

                    profile.save();
                    profile.setCurrentState('installing');

                    ProfilesManager.updateProfile(profile);

                    const list = manifest.files.map(file => {
                        const mod = new Mod({
                            hosts: {
                                curse: {
                                    id: file.projectID,
                                    fileID: file.fileID
                                }
                            },
                            cachedID: `mod-install-${file.projectID}`
                        });
                        return mod;
                    });
                    
                    DownloadsManager.createProgressiveDownload(`Curse mods from ${profile.name}`).then(download => {
                        let numberDownloaded = 0;
                        const concurrent = manifest.files.length >= 5 ? 5 : 0;
                        this.downloadModList(profile, list, () => {
                            if(numberDownloaded === manifest.files.length) {
                                DownloadsManager.removeDownload(download.name);
                                const overridesFolder = path.join(extractPath, `/overrides`);
                                if(fs.existsSync(overridesFolder)) {
                                    fs.readdirSync(overridesFolder).forEach(file => {
                                        if(file === 'mods') {
                                            fs.readdirSync(path.join(overridesFolder, file)).forEach(f => {
                                                Global.copyDirSync(path.join(overridesFolder, file, f), path.join(profile.gameDir, file, f));
                                            })
                                        }else{
                                            Global.copyDirSync(path.join(overridesFolder, file), path.join(profile.gameDir, file));
                                        }
                                    })
                                }

                                ForgeManager.setupForge(profile).then(() => {
                                    DownloadsManager.startFileDownload(`Icon for ${profile.name}`, modpack.iconURL, path.join(profile.folderpath, '/icon.png')).then(() => {
                                        rimraf.sync(extractPath);
                                        profile.hosts.curse.fullyInstalled = true;
                                        profile.save();
                                        profile.addIconToLauncher();
                                        ProfilesManager.profilesBeingInstalled.splice(ProfilesManager.profilesBeingInstalled.indexOf(modpack.id), 1);
                                        resolve();
                                    })
                                })
                            }
                        }, () => {
                            numberDownloaded++;
                            DownloadsManager.setDownloadProgress(download.name, Math.ceil((numberDownloaded/manifest.files.length) * 100));
                        }, concurrent)
                    })
                })
            })
        })
    }
}

export default Curse;