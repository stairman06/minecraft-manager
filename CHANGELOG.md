# Changelog

Changelogs for development versions are located in the work branch

## 2.6.0

#### Released 2020-08-02

### Features

- Completely new and redesigned UI layout
- Experimental "support" for legacy Forge (it's very buggy)
- New edit version page
- Redesigned editing mods, worlds, resource packs, and datapacks

### Changes

- "Profiles" have been renamed to "Instances"
- Improved CurseForge search
- Analytics have been removed
- Import no longer requires you to specify type, it's now inferred

### Fixes

- Forge fixes
- Curse fixes

## 2.5.1

#### Released 2020-06-25

### Fixes

- Fixed a bug where Forge on 1.13+ would fail to launch; you will need to reinstall Forge

## 2.5.0

#### Released 2020-06-24

### Features

- Built-in Java Management
- Redesigned Settings page
- An error message will now occur if app initialization fails
- Improved asset editing, allowing you to drag-and-drop mods, resourcepacks, and worlds
- New welcome page
- Twitch ZIP format import
- You can now manually add Mojang accounts from within the launcher
- Mojang account access tokens will automatically be refreshed
- Minecraft crash reports will be shown if the game crashes
- Custom Java arguments and a custom Java install can now be used
- Profiles can now override certain global settings
- New post-update changelog

### Changes

- Launcher Integration is now optional
- Internal changes to modloaders with new patch files
- A profile's respective assets will now update if changes to the folder are made
- Improved asset importing
- Reduced app bundle size
- Each game instance is now run in a seperate bin folder
- Downloading of Minecraft game assets is now significantly faster
- Internal changes to Version JSON files
- Improved failed to launch error handling
- Imrproved startup time by using v8-compile-cache

### Fixes

- "Select file" dialogs will work now
- Network errors won't fail silently
- Welcome page won't faily silently
- Profile deletion won't fail silently
- Memory leaks with asynchronous network requests have been fixed
- "Too long" errors when launching a profile should no longer occur
- Forge 1.13+ should work better now
- You will now be warned if you don't have an account
- Non-directories in the profiles folder will no longer throw errors

## 2.4.7

#### Released 2020-05-25

### Fixes

- Linux now starts up correctly

## 2.4.6

#### Released 2020-05-25

### Fixes

- Critical problem in the Welcome page

## 2.4.5

#### Released 2020-05-24

### Fixes

- Profiles displayed on the profiles screen had an extra "a" at the end

## 2.4.4

#### Released 2020-05-23

### Features

- Massive performance improvements

### Fixes

- Search in Discover is no longer slow

## 2.4.3

#### Released 2020-05-18

### Features

- New, experimental privacy-respecting analytics
- New hover effect on buttons and cards

### Changed

- Small UI improvements

## 2.4.2

#### Released 2020-05-11

### Changed

- The application is now installed per user instead of per system

### Fixed

- Crash loading mods list
- Update throwing error
- Fixed bugs in Welcome page
- Missing mods from Curse cancelling install

### Removed

- Removed .mcjprofile file association

## 2.4.1

#### Released 2020-05-09

### Features

- New sidebar design in Edit Pages and Settings
- Improved UI consistency
- Better usage via keyboard
- Improved Error Handling

## 2.4.0

#### Released 2020-04-13

### Features

- Added a cool loading spinner
- Launch directly (bypass the Minecraft Launcher)
- Better error handling
- Minecraft Options, OptiFine Options, and Servers list are automatically copied on Profile creation
- Downloads Viewer is now transparent

### Removed

- Removed "in-game defaults" (e.g. autojump, tutorial) as those are now inferred from your Latest release Options

## 2.3.8

#### Released 2020-04-10

### Security

- Fixed "kind-of" security vulnerability (CVE-2019-20149)

### Features

- Detailed logging is now saved to disk

### Fixes

- Fixed inconsistencies in capitalization

## 2.3.7

#### Released 2020-04-08

### Fixes

- Fixed Dependencies not downloading correctly
- Fixed Fabric not showing install complete
- Fixed Snapshots running in seperate folders
- Fixed "Open Profile Folder" button

### Features

- Allow syncing of Minecraft Options, OptiFine Options, and Servers
- Allow copying of Options and Servers

### Changed

- Reorganized Edit Advanced page

## 2.3.6

#### Released 2020-03-23

### Fixes

- Fixed Downloads not appearing in the viewer
- Fixed a small Toast bug

## 2.3.5

#### Released 2020-03-22

### Features

- Dropdowns for Minecraft Versions now include search and type selection
- Sort and Filter when adding assets from CurseForge
- Improve modloader installation
  - Allow installing of custom versions
- Add Full License Disclaimer to About Page
- Show Downloads info in Asset Cards
- The option to disable News checks on start up
- MultiMC Importing (experimental)
- Release date is now shown on versions
- Added the option to run the Snapshot profile in the same game directory as Latest release

### Changed

- Adjusted spacing between Profiles
- "Framework is installing" persists between edit page changes
- Downloads are now logged in the main process console
- Improve CurseForge HTML rendering
- Improve About page
- Improve Update dialog

### Fixes

- Fixed Notice Toasts staying on the screen for a long time
- Fix clicking away from dropdowns
- Fixed Minecraft Version selection bugs
- Fix all Toasts dissappearing when one was dismissed

## 2.3.4

#### Released 2020-03-17

Version for testing GitHub Actions and Releases. No new features or bug fixes.

## 2.3.3

#### Released 2020-03-17

Version for testing GitHub Actions and Releases. No new features or bug fixes.

## 2.3.2

#### Released 2020-03-17

Version for testing GitHub Actions and Releases. No new features or bug fixes.

## 2.3.1

#### Released 2020-03-16

Minecraft Manager 2.3.1 includes Worlds, Datapacks, UI Improvements, and more.

### New Features

- Improved Auto-Import of Resource Packs ands mods
- Support for Datapack Management
- Support for Worlds
  - Both Worlds and Datapacks are automatically imported.
- New Default Profiles
  - Latest Version and Latest Snapshot are available
  - Latest Snapshot is turned off by default, but can be enabled with a new settings
- Improved Crash UI
- Add "Data Dump"
- "Copy to..." and "Move to..." with assets
- New Profile Default: Show Multiplayer Content Warning Screen
- Automatically infer amount of dedicated RAM on install
- UI Tweaks
  - Asset Cards increase in size on hover
  - You can now select UI Elements with the keyboard

### Bug Fixes

- Linux support is improved
- Fix "HTTPS Required" error for certain Minecraft libraries.

#### [View older changelogs here](https://theemeraldtree.net/mcm/changelogs/)
