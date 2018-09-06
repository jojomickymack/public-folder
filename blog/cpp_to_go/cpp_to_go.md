# From cpp To go - Colorsort

I was looking for a project that involved sorting lists using famous algorithms that could combined with some of the platforms I'm interested in. While working on this I learned a lot of new things, from what compilers are easiest to use on windows, as well as some of the syntax basics for some languages that I'm still pretty unfamiliar with. I wanted to do a little write up describing what some of the highlights were.

## Makefile Woes And The Quest For Gcc On Windows

My background in cpp (c++ will be referred to as cpp in this article for philosophical reasons - I can't be bothered with the shift key and the '+' is further than the 'p' on my keyboard) is actually kind of longstanding, I first used c/cpp in highschool. Admittedly, it didn't go anywhere for me as there were no good programming courses offered in college and I have other interests. Granted, I do work in IT and and being stubborn I believe there's value in 'going there'.

Unfortunately, cpp isn't friendly, especially on windows. I am philosophically opposed to using 'visual studio' as well, so for years I've been 'coming to terms' with the tools and tricks of the open source tools for building programs in the same way I would in linux.

Without going into a dissertation of each time I ever reconciled a hard problem, I'll just say that MSYS2 is the answer to a lot of problems that someone seeking to build on windows using gcc will face. Running make files and dealing with idiosyncrasies of windows and linux and be swiftly avoided by just knowing what packages to install using pacman in MSYS.

This really stemmed from realizing that though I could build [gfx](http://www.ferzkopp.net/wordpress/2016/01/02/sdl_gfx-sdl2_gfx/), and could link to it using cpp, I had an irreconcilable problem doing so using go on widows (of course in linux it was done effortlessly).

All of the commands I needed to get up and running with a toolchain using pacman in MSYS2 are listed below.

This will update the MSYS shell and pacman itself.

	pacman -Syu 

you need to close the window after first running it and then execute the command a second time.

	pacman -Syu 

now it's time to start installing your tools

	pacman -S mingw-w64-x86_64-gcc
	pacman -S mingw-w64-x86_64-make

now you've got gcc - let's install sdl2 and all of it's child packages

	pacman -S mingw-w64-x86_64-SDL2
	pacman -S mingw-w64-x86_64-smpeg2
	pacman -S mingw-w64-x86_64-SDL2_mixer
	pacman -S mingw-w64-x86_64-SDL2_image
	pacman -S mingw-w64-x86_64-SDL2_gfx
	pacman -S mingw-w64-x86_64-SDL2_ttf
	pacman -S mingw-w64-x86_64-SDL2_net

you can install cmake just as easily, might as well have it
	
	pacman -S mingw-w64-x86_64-cmake

now set env variables for CC and CXX pointing to gcc.exe and g++.exe and reboot your computer so they're loaded. Also, add the mingw64/bin directory to your system's path.

extra points - you can install llvm and clang in MSYS2 as well. For those that don't know, clang is a toolchain 'frontend' which will give you vastly more helpful debugging info - to use it you'll set CC and CXX to point respectively to clang.exe and clang++.exe. This isn't recommended here since I've seen clang cause compilation issues with go-sdl2, so you should use it if you're developing with cpp, not go.

side note: you may as well install pkg-config and portaudio - while it has nothing to do with this project, portaudio is required by [this](https://github.com/fogleman/nes).

You're done.

## Cpp Project - Links And Thoughts

When I set this up, the goal was to get it to just 'sort something', so I didn't mind the code repetition and had some distinct thoughts on how to improve it.

I used structs for both my custom 'ColorType', which is just some ints representing the r, g, b, a, color values. There _is_ a Color type included in SDL - it would make sense that I just make a list of those instead of my own color type.

I also used a struct for my 'Button' type. While how I did it was practical for the sake of simplicity and getting the thing finished/stable, I realized that this was a crossroads for me accepting that I had a lot to learn.

Basically, I implemented almost the same exact method 4 times, and coded 4 instances of the same thing one after another - it's begging to be refactored and for my methods to employ some sort of 'reflection' so a single method is implemented to sort on different fields - also, I just hardcoded those methodcalls in the button listener - what would be better is some sort of function pointer where the method is part of the button instance.

In addition, these 'buttons' are just rectangles that become filled rectangles when you click within their bounds - quick and dirty, sure, but there are ui libraries that would make this more of a 'normal' app. I imagined how cool it would be to have a draggable slider to adjust how many stripes where shown - coding that would take a lot of lines and would have pretty flaky performance I'm guessing - a great opportunity to pull in some kind of ui library.

Furthermore, since the whole thing is composed of rectangles, why not make it so the stripes themselves are buttons - perhaps they could have some kind of callback when you clicked on them. It's begging for some kind of overarching button type that I was worried about implementing poorly, so I just left it as-is for now.

Rewriting it in go is a step towards that more dynamic version - there's a lot of compelling reasons to do that if you want to explore reflection, functional patterns and reducing code repetition without blowing your leg off.

Source on github

[https://github.com/jojomickymack/colorsort001](https://github.com/jojomickymack/colorsort001)

## The Case For Go

I had some successes using go about half a year ago - it was after I got my dell venue 11 tablet and mini-hdmi port for it - after reading ['The Go Programming Language'](https://www.gopl.io/), I knew I had a future project in store. I was using 'kubuntu neon' at the time on my main notebook, and there was a novelty in plugging a tablet into an external monitor and using it as a workstation.

Another note on the book - it's authored in part by Brian Kernighan, one of the authors of the original 'The C Programming Language' along with Dennis Richie. He is an icon of programming literature, and his style has a timelessness and authority that only a originator of technology could have. The book on Go holds up as having an important place in the linage of the his works.

Go's parallels with c don't end there - it was designed in part by Ken Thompson. Put simply - it's mindfully architected and the patterns that you can fall into with go are progressive and intelligent. Those patterns are inclined to be more functional, favoring composition, and are not necessarily object oriented/inheritance based. I can sense that it has some connections to lua in that sense. Go doesn't have a class keyword, for example.

As far as it's connection to the c compiler and having some equal footing with cpp, it exploits a translation layer called 'cgo' that allows for easy porting of c libraries to go and the ability to hook into gcc and libs that are installed on your compiler - like sdl. Check out the excellent [go-sdl2](https://github.com/veandco/go-sdl2) and you'll be as impressed as I am. Go doesn't have a native windowing system, and though there's a native 'image' library, it's very low level and kind of a pain. This sdl2 library makes it feel like it does natively support those things. Using another library, [go-gl](https://github.com/go-gl/gl), you can do direct opengl calls in your sdl window. 

It's a very exciting cross platform application development platform, as well as a lot of other things. Go is a capable nodejs replacement as well, and using [gopherjs](https://github.com/gopherjs/gopherjs) you can even have completely isomorphic webapps made in go.

## Go Project - Links And Thoughts

About 6 or seven months ago I was able to easily bang out some [fractal zooming apps](https://github.com/jojomickymack/mandelb001) and physics experiments. I should tune those up and get them up on github, so this isn't the first go-sdl2 project I've done.

I attempted to port the cpp app over to go, warts and all. The key difference was how my structs were instantiated, and instead of having a class representing the ColorContainer, I just added a constructor and some functions on a struct called ColorList.

One of the main things I like about the go implementation is the initialization of sdl, the window, and the renderer - the pattern of consuming an error if it's returned into a conditional, and then deferring the cleanup function is a real advantage - in cpp you have to remember to call those destructor functions and in go, you can use the defer keyword and when the app closes it calls all of the deferred functions. Go has a lot of intelligent and clean looking patterns like that.

Interestingly, some of the themes that I'd thought about with the cpp version of the project seemed a little clearer to me when porting this to go. One theme of functional programming is that you don't want to have side-effects and operate on a construct in memory - instead of doing a destructive sort on a list, you should create a new list and return that. With go, that's a lot easier to achieve. I suppose I made a copy of the list and then mutated that - which is sort of not what you're supposed to do - but I wonder if there's a better way to implement an insert sort when you're committed to building a whole new list. I wonder if there's a performance advantage/disadvantage to doing it like that? I will experiment with that.

I am planning on doing some of the things I thought about previously as suitable improvements to the ui elements and having an overarching 'button' type with function callbacks, and now that I've ported the project to go, I think it'll be a lot easier to reason about without getting into the weeds and danger zones of cpp.

One thing I wanted to highlight is that I skipped implementing this in the cpp version, but in a side project getting sdl and gfx to run on android I realized it was a necessity. Without constraint, sdl will attempt to run he game loop as many times as it possibly can (and frequently impossibly can't). The app would run at full blast -- probably at over 100 fps, then lock up my android device. Once I added [this](https://www.libsdl.org/release/SDL-1.2.15/docs/html/guidetimeexamples.html) to achieve a constant framerate, the crashing never happened anymore.

I noticed the processor racing as I ran this app and realized it was for the same reason. For these types of apps (anything employing a game loop), you'll want to do something to control the framerate. It was easy to adapt the example to go - you'll find that in the project.

One thing that I wanted to add as well, is that when doing sort algorithms in cpp, you often have to resort to interating over collections using for loops, and using a temp container in order to swap two values. Cpp does have ranges, but it's one of the newer features - for go, you can swap elements without the temp variable, and ranges are better supported. Another interesting aspect of go is that there's no 'while loop', there's only the 'for' keyword which does all kinds of loops.

Seems to me like cpp's great, but if you're looking for a modern continuation of what c did for the world of programming, you might agree that go is like the new version of c that the previous generation never got.

Source on github

[https://github.com/jojomickymack/go_colorsort](https://github.com/jojomickymack/go_colorsort)

Revised version with the reflection/sort interface enhancements alluded to in the article. Also added a 'reverse' button, and in doing so, forced myself into having 2 different button types - one that usees the sort.Sort() interface, and one that calls a function. Maybe there's a different optimization I could do to take care of that.

[https://github.com/jojomickymack/go_colorsort2](https://github.com/jojomickymack/go_colorsort2)