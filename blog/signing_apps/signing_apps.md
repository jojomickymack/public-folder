## Signing An Android App For Distribution

If you are distributing an app (not just running it via ADB / usb debugging), you need to 'sign' the app, otherwise the device will fail to install it with an error message about the apk being corrupt.

This is a pain, but there's a JDK command line tool that can generate the keystore file that Android Studio needs to generate a 'signed apk' that you can run on whatever device you want (provided that device has 'install apps from unknown sources' enabled). 

Keytool is located in the JDK bin directory. Note that 'alias_name' is used here as the alias parameter - you will need to remember that because you'll be prompted for it.

	keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

Upon running that command, you'll be prompted for a bunch of information about who you are - you can just not enter anything for those types of questions, but the important one is 'password'. Make sure you write the password down, along with the alias name used in the command - you'll need them later.

A .keystore file will be generated - it's smart to keep this somewhere for general use - you can use the same one over and over with all kinds of android apps. Note - even debugging apps have some sort of signing, it's just taken care of automatically for you when compiling and debugging apps using Android Studio.

Now back in Android Studio, instead of running your app, select 'build' -> 'generate signed apk'. You'll be asked for the password and alias name you used when creating the keystore file.

You're also asked what 'signature version' you want to use - I've chosen 'v2 (full apk signature)' and it seems to work fine.

After generating the apk, you can pretty much transfer it to whatever device you want and install it using 'package installer'.

Hopefully that explanation saves people some trouble, I remember having issues with it.