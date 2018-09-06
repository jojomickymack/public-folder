# Chromebooks - Mainstream Gentoo Linux

When Chromebooks were introduced, the marketplace was clamoring for devices in the 'ultrabook' category. The term 'ultrabook' stemmed from 'netbooks', a now decidedly dead form factor that was typified by the Asus 'eee pc' and Acer 'aspire one'. These typically had 11 inch screens and Intel Atom processors - as Windows XP was replaced with Windows 7 the workload was decidedly too demanding for these types of devices, and netbooks popularity waned.

'Ultrabooks', typically having 14 inch screens, more powerful Intel i-series processors and weighing 2 or 3 pounds, are notoriously expensive. Chromebooks, having the same form factor but at a much lower price-point, bet against the mainstream requirement that a laptop run windows, and won. [Chromium-os](https://www.chromium.org/chromium-os), is open-source software, which is derived from Gentoo linux. The success of chromebooks signifies a sort of renaissance for linux as a platform for personal computing, and though most users will never even see the terminal, it's running a linux kernel and by using some tools like [Crouton](https://github.com/dnschneid/crouton) or [Chromebrew](https://github.com/skycocker/chromebrew), you can essentially expose the linux underpinning of the system and use it to run all sorts of linux software.

If the user desires, they can unlock the bootloader (sometimes requiring removing a specific screw from the motherboard) and install ubuntu or other distros as their primary os, but with the tools previously listed, there's scarcely any need. Chromeos itself is full blooded Gentoo after all.

## How To Enable Developer Mode

Firstly, stock Chromeos is incredibly spartan. Essentially you have a 1 mb bootloader which only boots Chromeos, from a large, read-only partition where exec is not granted. While you can access the 'crosh' terminal in a Chrome tab by hitting ctrl+alt+t, you can't actually do anything with it before enabling developer mode. Doing so will remount your system, and all data will be cleared. After enabling developer mode you'll be greeted with a warning and an annoying beep (which you can skip by hitting ctrl+d) that will tell you to hit space to remount back into non-developer mode. If you should hit space you'll again have your hard drive wiped.

This sucks, but has been a reality since chromebooks were introduced. Fortunately it's worth it to be able to use Crouton and other linux tools.

Consult [this guide](https://www.howtogeek.com/210817/how-to-enable-developer-mode-on-your-chromebook/) for instructions on enabling developer mode - typically you just have to hold esc+refresh while booting to get to 'recovery mode' (recovery is part of what's written on that bootloader), then hit ctrl+d. Os verification will be off once the process completes.

When the computer reboots you'll see the warning screen mentioned previously, hit ctrl+d. Now back in Chrome-os, you'll be able to initiate chrosh in a chrome tab by hitting ctrl+alt+t again, and now when you type 'shell', you're in the operating system. You are a sudoer now, though this user, which is called 'chronos', doesn't have a password set.

To do this, you need to enter a different shell. Hit ctrl+alt+ right arrow (this is one of the function keys with a right arrow on it, not the directional key). The whole screen goes black and the developer console should appear. There's some helpful information about some of the things that can be done here, including how to set the sudo password for the chronos user.

	chromeos-setdevpasswd

I always set the password to 'chronos'. Hit ctrl+alt+left arrow to get back to Chrome-os. Now that you've done that, you can start getting set up with crouton.

## What Is Crouton?

Crouton is a command line tool that allows for you to install and run little linux vms in Chrome-os. These vms essentially act as a layer on top of Chrome-os's kernel and many core libraries - some caution should be advised while installing packages and replacing certain items - these vms or 'jailed linux instances' - ch-roots as they're called, often don't know the context of their own existence and can overwrite or otherwise screw up core chrome-os files. That's why it's nice that a fresh Chrome-os installation is just a 'powerwash' away (powerwash is a system reset you can initiate in the Chrome settings).

## Installing A Chroot

The first thing you need to do is install this [chrome extension](https://chrome.google.com/webstore/detail/crouton-integration/gcpneefbbnfalgjniomfjknbcgkbijom). This will enable your chroots to have an x11 instance in a full screen or windowed instance, or even in a Chrome tab. Once installed, a chroot will look for this extension.

Now download the crouton [shell script](https://goo.gl/fd3zc). I always put it in a directory called 'crouton'. Using crosh, navigate to the Downloads folder. Type cd ~ to get the the chronos home directory, and cd into Downloads. Change the permissions on the crouton script so it's executable with this command: chmod +x crouton - now execute it like this sudo sh ./crouton - you'll be prompted for the password you set previously. Executing the script without any commands shows the help dialog.

Crouton's command line flags are kind of confusing, here are some notes.
-r = releases
-t = targets
-a = architecture
-n = name
type sudo sh ./crouton -r list or -t list to see the various releases and targets. Releases are different linux distros and different versions of them - targets are components, many of which are defaults and don't need to be specified.
sudo sh ./crouton -r xenial -t lxde,xiwi
will install ubuntu 16.04 (xenial xerus) with the lxde desktop environment and the xiwi plugin. Xiwi is not required but is highly recommended - it's what allows you x11 instance to exist in a Chrome window or tab as described before. More info on xiwi is in the wiki [here](https://github.com/dnschneid/crouton/wiki/crouton-in-a-Chromium-OS-window-(xiwi)). Not specifying a name with the -n flag will create a chroot with the name of the desktop environment - lxde in this case. Only if you had multiple lxdes would you be compelled to name them, note - if you forget the name, you will need to find the chroot in the /usr/local/chroots directory.

After doing the command to install crouton will start downloading packages, which is likely to take some time. It will conclude by asking for a user name and password. Instructions for starting the chroot will be provided at the end of the installation, but basically, by typing

	sudo startlxde

you can bring up your chroot in a full screen window. Hit the 'resize' function key (where the f4 key would normally be) to change it to windowed mode, 

To simply get to a headless shell type the command below.

	sudo enter-chroot lxde

To launch an app from your chroot in an x11 window, use the command below, where lxterminal is the app you want to run (like firefox for instance).

	sudo startxiwi -b lxterminal

There's plenty of other crouton flags and functions I won't go into, these are just the ones I'm constantly having to re-look up, consult the github wiki.

## How To Install Packages In Crosh

I've gone down this road and had good results for things (programming languages) like go, python, ruby, c++, but it should be said that you will not be able to do anything on the native Gentoo shell, crosh, that you can't do more easily using a chroot installed by crouton. There are 2 reasons

1. If you do some programming and want to execute a script or a binary, you're going to have to remount the disk as rw and exec. It's a pain to have to do that every time you boot the machine and with crouton you'll never have to do that.
2. Chrome-os has a graphics and windowing system called 'Freon', which is simple to take advantage of if you wish to use a Chrome tab or window, but is impossible if you somehow want it to use it for an x11 stream. If you wish to use something like GLFW for windowing, Love2d, or even Electron or NWJS, it will simply fail to connect x11 to Freon. Using a chroot, you'll be able to do all of those things trivially.

Still, you might be compelled to wonder - can I write and compile go, python, or ruby webapps using Chrome-os resources only? The answer is yes, but you still have to enable developer mode and you'll have to remount your home directory every time you want to execute something.

The way to do it is with [Chromebrew](http://skycocker.github.io/chromebrew/). Just download [this](https://raw.github.com/skycocker/chromebrew/master/install.sh) and execute it. The result will be a command line tool called 'crew' that will allow for you to install binaries listed [here](https://github.com/skycocker/chromebrew/tree/master/packages).

Inevitably, if you are attempting to execute a script you wrote, maybe using the Chrome-app [Text](https://chrome.google.com/webstore/detail/text/mmfbcljfglbokpmkimbfghdkjmjhdgbg), you'll need to remount the user account so you can execute it.

	mount -i -o remount,rw,exec /home/chronos/user

Note: that command will be necessary to enable you to run a script to mount an sdcard so the Android vm can access it, described below.

## Mounting An SD-Card So Android Can Access It

Within the last year, Google rolled out their plan to include a fully featured Android vm into the stable channel of Chrome-os for newer many of the newer Chromebooks. This enables a lot of exciting features, such as adb being available in chrosh and being to listen on network ports for remote debugging. This is for Android developers running adb on another machine to upload apps directory over the network to be run on the Chromebook's Android vm. It works beautifully and hopefully will usher in an age of Android development targeting the desktop instead of touch only devices. Registering slave devices such as keyboards, mice and gamepads in Chrome-os is trivial and significantly more common than on mobile Android.

Still, there's some things left to be desired. For me, the hard-drive space available on most Chromebooks being in the 16-32 gb range makes use of external storage options an absolute requirement. Chromebooks now seem to have phased out the full-size sd-card which now leaves only the USB3.0 ports for extending storage. Unfortunately, while Chrome-os can detect these and mount them automatically, the drives are invisible to apps running in the Android vm. Fortunately, there's a workaround.

I may have read this on a blog or on reddit some time ago. I ended up devising my own shell script to take care of the problem and it works for me. This assumes that you have created a folder in the chronos user's Download directory called 'disk' and that the volume name for your external drive is called 'MY_DISK'.
	
	#!/bin/bash

	mount -i -o remount,rw,exec /home/chronos/user

	mount --bind /media/removable/MY_DISK /run/arc/sdcard/default/emulated/0/Download/disk && 
	mount --bind /media/removable/MY_DISK /run/arc/sdcard/read/emulated/0/Download/disk && 
	mount --bind /media/removable/MY_DISK /run/arc/sdcard/write/emulated/0/Download/disk

Hopefully that script can enable others to use their favorite Android apps for playing from a music library stored on an sd-card.

A related note is that if you had folders that you did not want for Android to scan for media, you would only need to add an empty file in the root of that directory called .nomedia

For triggering a rescan for media files, I recommend the excellent [Pulsar](https://play.google.com/store/apps/details?id=com.rhmsoft.pulsar.pro). It has 'rescan for media' in the settings menu.

## Conclusion

When Chromebooks were introduced to the marketplace, Google was betting against Microsoft. Now that some years have passed, it's clear that they won that bet. Once considered a platform only really functional when connected to the internet, tools like Crouton and Chromebrew are enabling a fuller linux experience. For those that wish to run Ubuntu as the primary os, distributions such as the XFCE derived [GalliumOS](https://galliumos.org/) and others make it pretty simple to do.