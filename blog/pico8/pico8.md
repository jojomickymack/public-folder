# Pico-8 - Fantasy Console

[Pico-8](https://www.lexaloffle.com/pico-8.php) is the creation of 'zep', a genius whose fascination with classic low power computers let to the invention of a number of 'toy computer' platforms. It turns out that Pico-8 was the product of several iterations of interesting experiments which ultimately led to something called [Voxatron](https://www.lexaloffle.com/voxatron.php), a miraculous platform for generating 3d voxel based game experiences _targeting html_. That Voxatron and Pico-8 are complete platforms can't be overstated - included is a system of developing, distributing, loading and modifying 'carts', which are stored in an online repository connected to the system.

While Voxatron is clearly the more sophisticated and technically impressive of the two platforms, Pico-8 has clearly struck a chord with retro/indie gaming culture. It dictates the pixelated aesthetic, chiptune sounds, and spartan, minimalist gameplay - that because Pico-8 gives you only a 128x128px window and only 32k of memory for your cart. That includes all sourcecode, spritesheets, maps, and music, all in a single file.

## What Is The Pico-8 Platform?

Pico-8 comes in a binary distribution form, which can be purchased and installed on your desktop, and can also be embedded in a webpage with a preloaded cart. When Pico 8 boots up, you're presented with a shell environment and a blinking cursor. You'll quickly orient yourself by typing 'help' and seeing the available commands. The 'splore' command brings you to the online interface where you can access different repositories of games provided by the community. Selecting a cart will load and play it. One could just go this far with the platform and be completely satiated with Pico-8 games, but once a cart is loaded you can do so much more with it.

Hit escape with a cart loaded and select 'exit to splore', then hit escape again - you're now back in the shell. Hit escape _again_ and you'll be brought to the editor. This gives you a text editor with the game's source code loaded. There are 5 sections of the editor mode including a spritesheet editor, a map editor, a sound editor, and a sequencer. Now you're free to screw around with the cart content, changing it into something completely different, or copy whatever interests you so you can use it in your own creation.

Also with a cart loaded, hitting escape to get back to the shell allows you to create directories and save/load games saved on disk. Type 'save filename' to create a filename.p8 file - open this up in your text editor and you can freely modify the source code and what you'll find is that after the source code comes the _image, map, and sound/music data_. The entire contents of the game are stored in the p8 file.

Also interesting is that you can type 'save filename.p8.png', which will give you a image file with a _picture of the game cartridge_, and you can distribute the game this way.

Important to note is that when you're using the Pico-8 shell, you're actually navigating your actual file system. The location you're in is actually the directory below in Windows

	%USERPROFILE%\AppData\Roaming\pico-8\carts

That directory has a lot of other important stuff, but you can modify where the carts directory is. Open up the pico-8\config.txt file and change the root_path to a project directory that's easier to navigate to.

## What Is In A .p8 File Anyway?

If you want to create a Pico-8 game from scratch, you'll want to become acquainted with what the file consists of. When loading a .p8 file, Pico-8 checks to make sure that the first line is 'pico-8 cartridge'. If it finds it, various tags in the file represent data that is loaded into the editor tabs.

	__lua__
	__gfx__
	__label__
	__gff__
	__map__
	__sfx__
	__music__

The lua section is the full source code for the game, the gfx is the tilesheet, label is the png image of a cartridge mentioned earlier, map applies the tilesheet to a tilemap, sfx is noises, and music is the sequencer data, which uses the noises in the same way the tilemap uses the tilesheet. I left out the gff section - it's for tile 'flags' - basically for adding some special property to a sprite, like that it is solid/background for example, a flag can be set and accessed in the source code.

Typically, when making a game from scratch, someone would have these components separated and then compiled together into a single .p8 file so it can be loaded by Pico-8. It's extremely common to compile a directory full of lua source code into a single file, otherwise editing can be unnecessarily painful when using only pico-8's 128x128 editor, which only supports capital letters.

You'll also probably want to modify your sprite sheet externally, since tools like [Aseprite](https://www.aseprite.org/) give you immeasurably more control over your assets than the Pico-8 sprite sheet tool. Sprite sheets can be imported/exported from a loaded cart by typing 'export filename.png'/'import filename.png', so modifying it externally is simple. Spritesheets are assumed to have an 8x8 tilesize.

You can just as easily use the export command to generate a binary form of your game, or an html page with a pico-8 instance and your cart pre-loaded. The webpage version of pico-8 works by leveraging [Emscripten](https://kripken.github.io/emscripten-site/), just like love.js and other projects. It's basically able to compile c to javascript, and due to the simplicity of Pico-8, this distribution format is extremely stable.

## First Pico-8 Game

Save what's below in a .p8 file, start Pico-8, navigate to where it is, load it, and type run, you'll see 'hello world' appear on the screen.

	pico-8 cartridge

	__lua__

	function _draw()
	  cls()
	  print('hello world', 0, 0, 7)
	end

The line below 'pico-8 cartridge' is reserved for the version number, which you'd see there if you save the game after loading. function _draw() is called 60 times a second, cls() is the funtion to clear the screen, and the arguments for print() are the string to be printed, the x and y coordinates, and the color. 7 happens to be the color white. You can see the colors in order in the tilesheet tab.

Only slightly more complex, using the rnd(x) function will product a random number between 0 and x. Given that the screen is 128x128 and that there's 16 colors, you would see 'hello world' flashing around the screen with rainbow colors with this one. Now that cls() isn't getting called to clear the screen the text will persist on the screen.

	pico-8 cartridge

	__lua__

	function _load()
	  x, y = 0, 0 
	end

	function _update()
	  x, y = rnd(128), rnd(128)
	end

	function _draw()
	  print('hello world', x, y, rnd(16))
	end

Similar to how love2d works, a Pico-8 program will have a function _load(), which is run once, and a function _update() and function _draw(), which are called over and over as the game runs.

Now hit escape and click on the tilesheet editor. Make sure to have selected box 000, which is the top left square in the tilesheet, and then replace the print call with the line below.

	spr(0, x, y, 1, 1)

You should see your sprite drawn in random positions all over the screen.

## Interested In Learning More?

The best way to learn about the Pico-8 api is by reading the [manual](https://www.lexaloffle.com/pico-8.php?page=manual) and by reading some of the readily available source code to games.

For api documentation, take a look at the [online cheatsheet](https://neko250.github.io/pico8-api/). There's also a [condensed cheatsheat](https://ztiromoritz.github.io/pico-8-spick/index_en.html).

If you're interested in a more 'readable' introduction to Pico-8 syntax, you should buy the [Pico-8 Fanzines](https://sectordub.itch.io/pico-8-fanzine-1).

Anyone doing more than simple tweaking will need to edit their game outside of Pico-8, mainly because of the text editor's limitations. I can't recommend [P8Coder](https://github.com/movAX13h/P8Coder) highly enough for simplifying the component extraction and integration process. There is also [Power-8](https://rombus.itch.io/power-8), which simply concatenates .p8 files together with a folder full of lua source code into a single .p8 file which Pico-8 can load. 

Games created using Pico-8 are always surprising in that they tend to exceed your expectations as to what's possible with such heavy constraints. The platform's success makes a heavy statement about how the ability to distribute, create, and modify games exceeds the need for modern hardware specs and technical features.
