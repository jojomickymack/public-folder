# NWjs, Cordova, and Chrome Web Apps

How would you like to be able to write an application and have it work on your website, as a standalone desktop app, _and_ on your mobile device? You might think that you'd have to have a degree in computer science and a lot of time on your hands to take on such a project. It turns out, you can hit all of these targets with the same codebase, and you can do it with nodejs. In doing so, you can expect to have the entire npm package management system at your disposal, and use the latest features of es6. You don't need any special development platform, just a text editor and a terminal.

I'd like to show you how to make an NWjs desktop app, a mobile app using cordova, and even a chrome web store app using the same codebase.

## The Use Case For Web Technology In Application Development

Historically, if a company was preparing an application that would run on all of these targets, they'd pretty much have to have a separate development team focusing on each one with specialists for each platform's respective programming platform so they can use whatever the supported method is on that platform to carve out the same features.

The result would inevitably be a bunch of similar apps that reflected the strengths and weaknesses of the platforms themselves and a the company would be burdened with having to keep these specialists around _and_ set up a brand new team to develop for whatever new platform was introduced.

For the last several years now, all the major tech companies have come to understand that by providing a way to ship an application with a distributable 'web view' context, and have it basically serve as a container for a little mini website application, they can avoid all this and just have one team composed of specialists in web development, which are a lot easier to come by than other kinds of programmers.

Most tech companies realize that you don't need to have a CS degree to be good with html, css, and javascript, in fact it might harm you. You might annoy your co-workers because you're refactoring their work - making a big deal about indentation and variable names, talking about programming patterns and how they did things in the 60s.

## Super Basic Webpage

We'll start out with a static web page that loads a script.

    <!doctype html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
            <link rel="stylesheet" type="text/css" href="css/style.css">
            <title>Cool Game</title>
        </head>
        <body>
            <script type="text/javascript" src="script.js"></script>
        </body>
    </html>

The meta tag for scaling and width data will help a little bit with maintaining a consistent presentation on various screen sizes. Create a file in the same directory called 'script.js' and add this - it's just a demo snippit, but it's a function I like for debugging.
	
	function log(text, tag = 'p') {
		let elem = document.createElement(tag);
		elem.appendChild(document.createTextNode(text));
		document.body.appendChild(elem);
	}

    log('my web app', 'h1');

Let's also add that css file - create a folder called css and put 'style.css' in it. Here's some basic styling for just seeing that it's working.

	html {
	    background-image:-webkit-linear-gradient(top, #ff1a72 0%, #e4e4e4 50%);
	    width: 100%;
	    height: 100%;
	    margin: 0px;
	    padding: 0px;
	}

	body {
	    margin: 0px;
	}
    
Now if you open 'index.html' in a browser you should see your gradient and your javascript message. Let's put the whole collection into a directory called 'www' and put the 'www' directory into our project directory - it's important to have this 'inner' folder, which is going to have the web app code that stays the same from project to project, and the outer project folder will be different for each platform we set up.

Let's set up our node server and add some other dependencies using npm.

## Node

You need to have nodejs installed - open up a terminal and navigate to your project directory (the one with 'www' inside of it). Type 'npm init' and accept all the defaults - this creates your 'project.json' file where your dependencies are listed. We're going to add a dependency to give us a node server - this makes it a lot easier to load our app moving forward.

We'll use a library called 'http-server' - install it locally by using the command below 'npm install -s http-server'. Go ahead and open your 'package.json' and replace the 'script' field with this.

	"scripts": {
		"start": "node node_modules/http-server/bin/http-server www"
	}

You can now run a static file server by typing 'npm start' in your root directory - as you can see, it will serve whatever is in the 'www' directory.

Let's go into the 'www' and add some node dependencies there too. 'cd' into the www directory and again type 'npm init' to generate your project directory. Let's install 'jquery' with this command - 'npm install -s jquery'. After having done that, there's a node_modules directory inside of your 'www' folder.

It's worth noting now that if we're using 'git' to track and commit out changes, we don't want to the 'node_modules' directory to be included in our repo - only the 'package.json' file. To take care of that, create a '.gitignore' file in your project root and add 'node_modules' to it.

Let's include 'jquery' in our index.html by adding the line below.

	<script type="text/javascript" src="node_modules/jquery/dist/jquery.min.js"></script>

Now in our script, we can use jquery instead of the vanilla js methods.

    function log(text, tag = 'p') {
        $('body').append($(`<${tag}>`).html(text));
    }

    log('my jquery thing', 'h1');

Note the backticks around the <${variable}> - that's es6 syntax that allows for variable interpolation - not to be confused with the single quotes around the word 'body'.

## Let's Add Some Phaser

Phaser is a really great html5 game engine I've been looking for chances to play with. While I don't want to get too in depth with it here, it's a good for this demo because it takes us further from the 'webpage' paradigm. The new Phaser 3 syntax utilizes es6 classes really well - but note that it's still changing heavily because it's so new.

Let's remove jquery and add phaser 3 in the www folder. 'npm uninstall jquery' and 'npm install phaser'. Change the line where jquery was included in your 'index.html' so phaser is included instead.

	<script type="text/javascript" src="node_modules/phaser/dist/phaser.js"></script>

Remove the js that you had earlier and replace it with this code. It's a simple phaser 3 scene. The assets are available [here](http://www.reverie.fun/blog_data/web_apps/assets.7z) and they belong in your 'www' directory in a folder called 'assets'.

    let config = {
        type: Phaser.AUTO,
        parent: 'spinning',
        width: window.innerWidth,
        height: window.innerHeight,    
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    let game = new Phaser.Game(config);
    let background;
    let monkey;
    let direction = 1;

    function preload() {
        this.load.image('jungle', 'assets/jungle.png');
        this.load.image('monkey', 'assets/zombie_monkey.png');
        this.load.audio('drums', 'assets/drums.ogg');
        this.load.audio('noise', 'assets/monkey_noise.ogg');    
    }

    function create() {
        background = this.add.image(0, 0, 'jungle').setOrigin(0).setDisplaySize(game.config.width, game.config.height);
        monkey = this.add.image(game.config.width / 2, game.config.height - game.config.height / 3, 'monkey');

        path = new Phaser.Curves.Path();

        path.add(new Phaser.Curves.Ellipse(400, 300, 100));

        var tween = this.tweens.add({
            targets: monkey,
            y: `-= ${game.config.height / 2}`,
            duration: 200,
            ease: 'Power1',
            yoyo: true,
            repeat: -1
        });

        let noise = this.sound.add('noise', { loop: true });
        let drums = this.sound.add('drums', { loop: true });
        noise.play();
        drums.play();
    }

    function update() {
        if (monkey.rotation > 1 || monkey.rotation < -1) direction *= -1;
        monkey.rotation += (Phaser.Math.RND.between(3, 10) * 0.01) * direction;
    }

Basically, at the top of the file you see the config object, which is passed to the game instance called 'game'. In the config, the 3 callback functions defined further down, 'preload', 'create', and 'update' are included in the scene. I'd say the contents of 'preload' and 'create' are pretty self explanatory as they load the various assets and add them to the scene, and of course in the update function the monkey's rotation is reversed when it gets above or below a certain number.

I really like phaser 3's tweening api - you can see that the tween is added to the scene and 'monkey' is given as the target with various other properties of the tween. To learn more about the various other preset tweens, check out the [phaser 3 examples](https://labs.phaser.io/index.html?dir=tweens).

If the assets are in the right place (and the latest version of phaser hasn't depreciated these function calls already) you should see a leaping rabid monkey in the jungle, [just like this one](http://www.reverie.fun/games/rabid-monkey).

You could put this 'www' on the internet at this point if you wanted, it would work perfectly fine. Let's try one of the other platforms highlighted in the title, starting with NWjs.

## NWjs - Putting Your App On The Desktop

NWjs is a platform created by google a number of years ago which stands for node-webkit. If you don't know this already, webkit is the browser engine used by chrome which was first created as part of the KDE browser in the 90s, and then incorporated into Safari. The basic idea behind NWjs is that you can have a browser window instance that your app lives in which has access to any npm library.

It was basically invented by Roger Wang, who went on to also invent Electron, which is another platform for creating desktop apps that leverage web technologies. Atom code editor, the official ide of github, is probably the most well known app created with Electron.

To contrast and compare NWjs and Electron is an interesting thing - Electron is certainly incredibly powerful, but it's also potentially really complicated. I've never seen a published game that runs in Electron - but I've seen a lot that run in NWjs - it's a little more straightforward.

The drawback for shipping your application with NWjs is that you pretty much need to include the NWjs runtime with your app, which will mean that your distributable is likely to be over 100 or 150 mb. Using compression can help a little bit, not much though.

Basically you need to go to [the website](https://nwjs.io/) and download the sdk. There's also a somewhat lighter 'normal' build flavor, which is pretty much the same size but doesn't include the developer tools. This is what you see when hitting 'f12' in chrome - not too big of a deal to include that in your app.

You can include the directory with the 'nw.exe' binary in your path in order to use the command line tools - you can also just install it globally using npm - what we're going to do though is actually create a distributable package using our rabid monkey project.

Create a directory specifically for this new platform and copy your 'www' directory into it. Let's go ahead and in our outer directory, run 'npm init' and take all of the defaults except for the 'main' field - you can put 'www/index.html' there - that's how nwjs will start your app.

At this point, if you've included wherever the nwjs sdk is in your system path, you can just run 'nw .' in that directory, and your app will start up - you should see the rabid monkey in a window - this is that simplicity I mentioned ealier that people like about nwjs.

Now, open up the 'package.json' and add the lines below - what we're doing here is making it so it can be used as an 'app manifest'.

	"window": {
		"fullscreen": false,
		"width": 960,
		"height": 640,
		"icon": "icon_128.png",
		"id": "monkeyapp001",
		"title": "monkeyapp001",
		"resizable": true,
		"toolbar": false
	}

It's probably a good time to get your icon image set up, it goes in your project folder as well.	
	
Now your project folder has everything it needs to be packaged for distribution. If you wanted to, you just just copy everything in the nwjs distribution into the project folder and distribute it like that. The problem is that it's like 200mb. The other thing is that our sourcecode and assets are all exposed, which isn't bad, it's just most people don't distribute their apps like that.

Let's take just the 'package.json' and our 'www' directory and use 7zip to compress it into a '.zip' archive. Take the zip file and rename it to 'package.nw'. Now put your 'package.nw' into yet another folder, and copy the whole nwjs distributable into that. When you run 'nw.exe' it looks for the 'package.nw' and decompresses it, looks for the 'package.json' and runs your app from there.

You can go a step further and merge the 'nw.exe' file with your 'package.nw' with a binary copy command. The command looks like this and you need to execute it from dos.

	copy /b nw.exe + package.nw mygame.exe

After having done that, you can delete 'nw.exe' and 'package.nw' from your game folder, and running 'mygame.exe' will run your app.

You'll see now that your icon is shown in the taskbar when your app is running.

So... your app is like 180mb. Like I said before, there's not much you can do about that, but there are some compression techniques people use to compress some of the larger files such as 'nw.dll', which is over 100mb itself. The one I've found to work best is called 'upx', and it's [available here](https://github.com/upx/upx/releases). All you have to do is expose the directory the 'upx.exe' binary is to your path and run commands like this.

	upx nw.dll

That will trim it down from 101mb to about 40mb. People like to compress some of the other files, which ends up bringing the size to around 100mb, which isn't too bad.

Unfortunately, I haven't been able to include anything about all of the cool things that nwjs can do - if you wanted to have toolbars, system tray functionality, dialog boxes or things like that, you'd be able to access those platform native widgets through the 'nw' object that's exposed to your scripts.

I'd love to play around with nwjs some more in a future article. But I'll move onto the other platforms.

## Chrome Web Store App

It isn't surprising that we could take the same 'www' directory we just used in a chromium instance and turn it into a Chrome app - which is a chromium instance as well.

This example is just a modified version of the [hello world example](https://github.com/GoogleChrome/chrome-app-samples/tree/master/samples/hello-world). Basically, you have your 'www' directory inside a folder which includes your icons, a 'manifest.json' file, which is what chrome looks for when installing the app, and a 'main.js' file, which is listed in the 'scripts' field.

    {
      "manifest_version": 2,
      "name": "Cool Game",
      "version": "1.0",
      "minimum_chrome_version": "23",
      "icons": {
        "16": "icon_16.png",
        "128": "icon_128.png"
      },
      "app": {
        "background": {
          "scripts": ["main.js"]
        }
      }
    }

The 'main.js' bootstraps your app - it basically just goes into the 'www' directory and tells chrome to load 'index.html'.

    chrome.app.runtime.onLaunched.addListener(function() {
      // Center window on screen.
      var screenWidth = screen.availWidth;
      var screenHeight = screen.availHeight;
      var width = 960;
      var height = 620;

      chrome.app.window.create('www/index.html', {
        id: "MyId",
        outerBounds: {
          width: width,
          height: height,
          left: Math.round((screenWidth-width)/2),
          top: Math.round((screenHeight-height)/2)
        }
      });
    });

That's it - in order to install the thing, you've got to open up chrome, click on the settings menu, and select 'more tools' and 'extensions'.

In order to get this to run on your machine, enable 'developer mode', it's a switch in the upper right corner. It will reveal some buttons, one of them is 'load unpacked'. Navigate to where your project folder is with the manifest in it and open it. It should immediately show a new 'app' in your list with your icon. Now that it's there, you can go to your apps at 'chrome://apps/' and you'll see your icon there as well. Clicking on it there will start the app, and you can also right click on it and select 'create shortcuts' add an icon to the desktop.

So that version of the app is only 20mb and will run seemlessly on a chromebook - unfortunately, apps like that are being phased out - you can't even search for apps in the chrome webstore anymore unless you're on a chromebook. The main reason for this is that you could just as easily put your app on the internet and have it work pretty much the same way and there's little reason to download the whole app to your device _unless_ you're using a mobile app.

That's where cordova comes in.

## Setting Up Cordova

Cordova is basically the open source version of 'phonegap', which was created by Adobe. It's still kind of mysterious to me what the actual difference between 'phonegap' and 'cordova' is, but the point of it is to easily do builds of a web application for mobile. In addition to providing this web view which is running your application, it's also able to provide access to the device's hardware, like the camera, gps, and accelerometer.

I'm going to make the quick, since most of the work in getting cordova to compile for android is in setting up the android sdk. In order to install cordova itself, you just use npm.

	npm install -g cordova

This time, instead of creating a project folder and putting the 'www' folder into it, you need to create the project with the cordova command line tool. Type 'cordova create myproject001' with whatever project name you want. 'cd' into the project directory and type 'npm install'.

You'll notice that there's a 'www' folder already in there - go ahead and delete it and replace it with a copy of the 'www' that was used for all the other projects.

Cordova is all about 'platforms' - let's add thee browser platform with the command below.

	cordova platform add browser

Now you can run your app with the command below.

	cordova run browser

It'll open a new tab and you'll see your app. You might think to yourself that this is pretty much as good as the node app we set up at the beginning of this, but it isn't - you have to actually stop and restart the server every time you make a change. There is a cordova plugin which is supposed to auto-refresh, but it's really old and didn't work for me.

What we want to do now is add the android platform. This can be kind of involved and it's really best explained [in the official documentation](https://cordova.apache.org/docs/en/latest/guide/platforms/android/). You need to install the jdk, the android sdk, and set some environment variables so cordova knows where to find them - it's pretty complicated.

Provided that's done, you can do 'cordova platform add android' and it'll get it set up. Next, do 'cordova build android'. What it's going to do is create an android studio project which you could open if you wanted to - you could run the build from there, but cordova is also capable of using 'adb' to connect to a debug device and install and run the app. For that, just type 'cordova run android'. Don't forget to plug in your android device and have debugging mode enabled.

You should now see that rabid monkey jumping around on your android screen!

## Summary

This is really just scratching the surface of what these platforms have to offer - but between all of the platforms that a webpage, a chrome app, a desktop app made with NWjs (which supports mac and linux as build targets), and cordova (which supports the microsoft's UWP, IOS, and even Blackberry), you're hitting an insane number of potential distribution targets with a single codebase.

Hopefully people who read this are excited as I am about being able to freely skip all that platform specific implementation stuff and focus on building more apps instead.
