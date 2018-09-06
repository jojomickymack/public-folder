# LibGTX and Kotlin

When surveying the platforms for game development, there's surprisingly few choices that target java. It's revealing that over the entire course of java's existence, it's never really been closely associated with games. There certainly have been attempts to use it, but its performance is usually its undoing and such attempts tend to be experimental as people quickly realize that the jre doesn't do what games need to very well. It's also hard to imagine distributing a game in the form of a jar file, and the 'applet' form which is pretty much extinct in modern times, paled in comparison to the flash platform, which ran circles around java in terms of performance in game-like scenarios. Flash was also designed to make handling media resources and events easy - something that requires a lot of infrastructure when done in java from scratch.

Android being the main mobile platform pretty much forced the world to reconsider java as platform for games - android uses a special optimized jre called 'art', or android runtime, and apps are distributed as apk files, which are the android equivalent of jar files.

As for game development platforms that target android, there's still surprisingly few choices. Unity, Gamemaker Studio and Cocos2d both all compile for android by leveraging the ndk, and Corona allows you to write Lua to target Android by executing it on an efficient lua vm. There are a lot of HTML5 platforms that leverage the ability to leverage an app consisting of a 'webview' (like a mini browser in your apk), and running javascript on it. 

All of these have very mysterious and closed off compilation processes. If you want to be in full control of that process, and you don't want any translation layer between your source code and 'art', you need to use a pure java platform. It's also appealing getting to use Android Studio as your IDE, which is a completely free, cutting edge development platform. There's still fewer game engines that target that platform.

## Introduction to LibGDX

Mario Zechner is the original creator of LibGDX, and he's written a fantastic book that has 3 editions now,  ['Beginning Android Games'](https://www.apress.com/us/book/9781484204733). It's basically a manual on how to create a game framework on android, and while it's lower level that what most people wanting to just play with game development would want, it's revealing in what LibGDX is doing.

LibGDX is the only platform that I've seen that targets desktop, android and IOS by leveraging 'robovm'. It also targets HTML5, which I haven't tried. The experience of running and debugging your game in a desktop window for the majority of development, then distributing and testing for these other targets is really nice. Each platform is represented by a different gradle module in your project which has a unique launcher class that runs the sourcecode your 'core' module, which is where you do all of your coding.

LibGDX has some very interesting 'plugins' for physics engines like box2d and bullet, it has native support for tiled maps, and it even does 3d rendering, which I haven't tried. Ultimately, for android, it's using [lwjgl](https://www.lwjgl.org/), which on its own is really hard to use, but with LibGDX it has a very clean interface, allowing for you to execute opengl directives and shaders on android's opengles.

## What Is Kotlin?

Kotlin is a young language that was created by Jetbrains, the makers of the IDE intellij, which Android Studio is a version of. It targets the jre, and was basically created as a way to offer new language features to platforms that are restricted to old versions of java. Android, as many people know, is built on java 1.6, and since google and oracle have been at war in court for many years, it's highly doubtful that will ever change. Jetbrains IDE depends on the jre as well, and knows what the problem areas are in terms of performance but also in developer experience. Their business is literally based on working with the compiler to deliver helpful error messages and interesting refactoring tips in the IDE.

Kotlin introduces a lot of language features people were using groovy and scala for, like functional programming concepts, clean lambda syntax, and a simplified collections interface, and adds the concept of non-nullable types and immutable variables. The idea is simple, unless you declare a variable as being mutable (changable) or nullable (having the ability to be set to null), it can't ever be changed or set to null. The mutable concept is designated by using 'val', which means the variable can't be changed, or 'var', which means it can, allows for functional paradigms emphasizing 'side-effect free' functions. Nullable types are designated by question marks. By striving for less side effects and non-nullability, your code becomes better as it becomes far less likely or even impossible that your application will crash from an npe, or 'null-pointer exception' which is incredibly common on the platform.

It's said that kotlin looks like what java would have if it could've kept evolving, which many cite that java can't do anymore because it needs to support so much legacy code. Since google and gradle have already embraced it and declared that it's an 'officially supported language', something that was never said about groovy, which has been around for a lot longer, says a lot about where the language is going. It's clearly a smart choice to learn about kotlin if you're invested in java/android.

## Things To Keep In Mind

While libgdx and kotlin are clearly a good mix and making games sounds like a lot of fun, there's a couple things I wanted to note here as potential obstacles you might be surprised by.

## Getting Your gradle.build Files Tuned Up

Gradle is a tool for building java projects, which makes it so you can write scripts that compile and run your application. While it's way better then what people used before, there are some special challenges. Gradle is a DSL - or 'domain specific language' with a special syntax and keywords. It's actually using groovy (unless you're experimenting with the new kotlin buildscripts - not quite mainstream yet), and there's pretty much no support for autocompletion, and the documentation online is pretty sparse. Not only that, depending on the version you're using, documentation on the internet may or may not apply at all. 

There's an example template I pushed to github that has a buildscript for gradle 4.6, I'd recommend just starting with that. These are the notes from how I set up my template.

You can easily add the kotlin libraries to a gradle project by adding 'org.jetbrains.kotlin:kotlin-gradle-plugin' and 'org.jetbrains.kotlin:kotlin-stdlib' as dependencies. Android Studio will offer to help you with this, but can cause some confusion if the versions don't match up - for example, if you update your kotlin plugin, but hard-coded the version for the standard lib somewhere, you'll get mysterious compilation errors. The solution is to just use a variable for kotlin version. In fact, you probably want a specific place where these types of variables are defined at the top of your base project level build.gradle file. Inside any of your modules you can now invoke the variable in a double-quoted string to avoid accidentally including multiple versions of a dependency.

	buildscript {
	    ext {
	        appName = 'my-app'
	        kotlinVersion = '1.2.41'
	        gdxVersion = '1.9.7'
	    }

	    ...

	implementation "org.jetbrains.kotlin:kotlin-stdlib:$kotlinVersion"

That leads me to my second tip - do not use a gradle wrapper (the gradlew.bat that can be used to bootstrap whatever version of gradle is needed) - instead, download and install the gradle binary package you need and use the project's gradle settings to use that. The gradle version can change the syntax of the build script, as well as enable use of later versions of other dependencies, like 'com.android.tools.build', and the 'buildToolsVersion' used in your android module. Often, people will downgrade their entire project in order to maintain use of old versions of these, including the basic project generated by the libgdx tool. It's best to just start off with more or less the current versions of these important components. 

Android Studio 3 requires at least gradle 4.4 or higher, and you'll find when trying to open old projects that it's not always easy to just use the gradle wrapper because the ide will try to force you to upgrade the project and the build script will break. Not only that, but whichever gradle version you're using will download complete sets of dependencies into your .gradle directory in your user account. It can take a long time and you'll probably never need these again. It's probably smarter to take your working template and just replace the source code in the core module and the android/assets directory from the example. You should expect to do some fixing and refactoring here and there, but you don't want to spend a lot of time fixing build scripts.

One thing you'll have to do with newer versions of gradle is change all dependencies declarations to use the 'implementation' keyword instead of 'compile'. Once you have a good build script with current versions of all dependencies, you'll end up barely ever having to look at it again.

If you should use the ktx-template I've linked below, upon opening the project you'll get an error immediately that says that there was a build error because of 'configure on demand'. I don't know what that feature is, but I've taken it for granted that it's necessary to turn it off and refresh your gradle project. Go to settings->build, execution, and deployment->compiler, and uncheck 'configure on demand'. Save your settings, then refresh gradle by going to view->tool windows->gradle, and clicking on the 'refresh' icon in the gradle window.

One thing to be aware of is that scope is resolved differently between the IDE and gradle tasks. That means if you run the 'DesktopLauncher' class by right clicking on it in the 'project view' in Android Studio, you'll get 'error: could not find or load main class [packagename].DesktopLauncher', while if you open the gradle view and execute the gradle task application->run, it will find everything it needs and run the application. The solution is to just use the gradle task, it will be bound to the run configuration after doing it like that for the first time.

## Refactoring Java Projects To Kotlin

If you've gotten the build scripts all squared away, you're on your way to actually looking at kotlin code. If you should create a kotlin file in your project, then paste in some java code, Android Studio will ask if you want it converted to kotlin - this works really well, but there's additional refactoring you'll need to do when porting an example project into kotlin. Thankfully, the ide usually is quick to recommend things like replacing getters and setters with property access syntax, converting vars to vals where possible, but there's some additional things I've taken for granted when porting to kotlin, or just porting some older example code to work with the latest versions of libgtx.

'non null variable must be initialized or set to late-init' - this warning will prevent compilation because in java, it's normal to declare member variables at the top of a class, then initialize it in the constructor, or for libgdx, in the create or initialize method. 

When using kotlin, you'd either have to make it a nullable type and set it to null (which you shouldn't do), or just set the variable's value then and there. For example, java code Player player; would need to be initialized as val player = Player(). Your third option would be to declare your variable with it's type, like val player: Player, and actually initialize it in an init {} block.

The later two options can sometimes be difficult to achive, as values needed in initialization aren't available at declaration time. You'll probably end up moving a lot of the code from the 'create' or 'initialize' method into your classes' init block. 

This can become especially challenging when the project uses the assetManager() and textureAtlas() classes. An asset manager allows for you to consolodate all of your various assets, load and request them through the assetManager instance - a textureAtlas is a way to store all of you textures in a single image by compiling it using a tool called 'texture packer'. These are great ways to optimize the loading and processing of resources, but if you have properties that depend on instances of those classes to be fully loaded, you will have to rethink how your project is organized.

Kotlin does not have the 'static' keyword, and once you've ported a few projects to kotlin you'll start to understand how trying to create singletons, initializing variables as null, and using static methods and classes makes for a poor application. Kotlin provides you with the ability to create a sort of equivalent by using 'companion objects', or even declaring a class as an object instead, making it behave like everything is static, but it works to kotlin's advantage to keep that at a minimum and only expose what you need to. Game development introduces a lot of unique challenges in terms of state - where objects need to interact with eachother's state to a great extent, game object states and the state of the game itself need to be organized somehow.

It's a common trait in java projects for the solution to include making everything public or resorting to lots of static utility classes - that's really not the direction you want to go, and kotlin enforces that. It's true that code running on android has some worse consequences for static components than normal programming - the reason being because your application's life cycle isn't necessarily the same as the life cycle of your objects. Static, public, and nullable objects and properties make for very different bytecode than that of idiomatic kotlin.

What I'm trying to say is that kotlin isn't necessarily trying to make things easier for you, the developer, it's trying to make your product better. The way it does that is by coorcing you to adopt better patterns.

I've run into some additional 'gotchas' having to do with animations - I come to expect even with non-kotlin projects that there's an 'unchecked call to Animation(float, T..) as a member of raw type'. The solution to that is changing 'Animation' to 'Animation<TextureRegion>' - the error was complaining about the type used in this generic not being explicit. It's a badly worded error, and can cause some confusion. In addition to that, calls to animation.getKeyFrame() need to be cast to (TextureRegion) animation.getKeyFrame(). I've had to add these two things to dozens of older projects to get them working, it's good to be aware of.

## Summary

I'll continue writing on LibGDX and kotlin, since I'm using it a lot now. With kotlin's seamless support for java libraries like LibGTX, and the many useful capabilities of the library, there's a lot of interesting things to learn about and document.

A while back, I created a template project that includes desktop and android targets, and leverages a library called LibKTX, which is really just some helper classes that bind to LibGDX to give you some syntax features and write more idiomatic kotlin game code.

I've been using this template as a starting point for all of my experiments

[https://github.com/jojomickymack/ktxtemplate001](https://github.com/jojomickymack/ktxtemplate001)

I also ported over the libgdx example of a mario clone, which demonstrates how to use the tiled map loader and implement collision detection with a tile layer.

[https://github.com/jojomickymack/ktxkoalaworld](https://github.com/jojomickymack/ktxkoalaworld)

I plan on going more into depth on how to expand on these in future articles.
