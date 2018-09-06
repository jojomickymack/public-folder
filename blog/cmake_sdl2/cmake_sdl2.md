# SDL2 - Building And Linking

SDL is a library written in c that really changed how cross-platform applications are made. Understanding what it does is simplified when you learn what SDL stands for - Simple DirectMedia Layer - I'm not sure why they didn't just go with SML - but the idea that it's a simple layer that allows for media do be bound to a system's hardware is fitting. There's a lot of low level code that would be needed to manipulate a system's graphics, sound, and input hardware - SDL does the hard part of allowing for all that to be connected to, and since it's written in low level c, it compiles everywhere and since it's been around for about 20 years means that it's really stable.

Beyond the technical things that it does, it really did transform the software world. Firstly - it's liberally licensed under zlib - you can use it for whatever you want. SDL is the earliest catalyst of cross platform and indie game development culture - really being bread from the tools created by Ryan Gordon to port commercial games to linux in the mid 2000s under Loki games, it's debatable if Linux would be a game platform without it.

SDL serves as the binding layer for both Love2d and pico-8, and is even the binding layer for many android emulators.

More recently, SDL can be bound to using Go, which extends Go's capabilities significantly. SDL has child libraries for more extensive image, sound, font, and geometry capabilities, which are all linked to in a consistent way.

I've set up SDL on a lot of computers and wanted to share how one can get set up discovering what SDL can do for you without having to spend a lot of time and energy getting up and running.

## Building From Source/Getting Prebuild Binaries

When you go to [download](https://www.libsdl.org/download-2.0.php) SDL, you're presented with runtime libraries, sourcecode, or prebuild resources. The runtime libraries are dlls that you would distribute your application with, the sourcecode is for building on your own, and the prebuilt ones are provided so you can just drop in the resources for your compiler to link to without building from source. 

It's typical that on linux you'd just go with the sourcecode, since building is easier. You might actually be able to install SDL with less fuss by using your package manager, but the version you end up with may not be the latest. I've frequently been stuck with some kind of linker issue that was solved by just rebuilding the libraries and it's good to know how to do that.

The pattern is simple - navigate to the root directory of the tarball, run ./configure and monitor the output to see if any important libraries are missing - typically you can install them using your package manager on the spot. If you've never done that before it can be tedious - but generally speaking, if you're missing library xxx, you can find the library is in a package called libxxx-dev. Knowing that can get you a long way. If you can't find the library (and are using apt-get), try 'apt-cache search libname' and see if you find a likely candidate for the missing package in the list. Check online if you still can't find it, it's likely someone's asked about it before.

After running ./configure, you can run 'make', which will actually build the libraries. If it all goes well, you can run 'sudo make install' which will put the resources into your compiler's 'bin', 'include', 'lib', and 'share' directories. Hopefully it's as simple as that.

On Windows, it's never simple. I am not a Visual Studio person, I prefer MinGW. MinGW and MSYS provide some tools that try to act like 'make', such as 'mingw32-make', but there's a lot of unique problems you might face which you can't really reconcile - when it's provided, it's smart to get the pre-built resources. SDL provides those for MinGW, thankfully.

What you get when you download the pre-built MinGW package is a 32 bit and a 64 bit folder with what the compiler needs inside - 32bit is marked with i686 and 64 bit has x86_64. Don't mix up the 32bit compiler with 64bit - note if you're interested in using the Go package, only 32bit works currently.

Inside the folder, you get a 'bin', 'include', 'lib' and 'share' folder, just like in linux. You can just copy the whole set directly into the MinGW root directory - you'll have all your dlls inside the 'bin' directory, all your headers inside of a directory called 'SDL2' in the 'include' directory, and all your .a and .la inside of the 'lib' directory. If you ever see includes directives that are missing the 2, that means they're old. SDL 1.2 was extremely popular in its day, and it's headers would reside in SDL. SDL2's headers are always in 'includes/SDL2'.

Note on the .a and .la files - these are the equivalent of .dll files on windows or .so, but these are special for MinGW. If you attempt to open these, you'll find that .a files are binaries and can't be viewed, but .la is text - totally readable. You'll find with the prebuild libs for SDL, there's a dummy 'libdir' property with 'foo_64' listed as the compiler's root. You should change that to reflect your actual compiler's location. On Windows, I use the syntax '/c/mydirectory/mysubdirectory' instead of 'C:\mydirectory\mysubdirectory' - it's likely you'll have problems with the backslashes, and even though you can escape them by having double backslashes, it's best to just get in the habit of always using forward slashy syntax.

You'll be able to repeat this process for libraries like [sdl2_image](https://www.libsdl.org/projects/SDL_image), [sdl2_mixer](https://www.libsdl.org/projects/SDL_mixer), [sdl2_tff](https://www.libsdl.org/projects/SDL_ttf) - they all have prebuild resources for MinGW. If you're on linux, the './configure', 'make', 'sudo make install' process will work to build from source.

Final note on SDL libraries - there's also [SDL2_gfx](http://www.ferzkopp.net/wordpress/2016/01/02/sdl_gfx-sdl2_gfx/), which is outside the main SDL site, provides no pre-built stuff, and is a pain to build. It is for drawing primitive shapes and doing geometry. If you seek to build this, you'll need to install SDL into the MSYS2 MingGW installation and make sure the 'sdl2-config' file is in the 'bin' directory with the correct path to the compiler's root in it. You should be able to statically build sdl2_gfx with the './configure' and 'make' commands, then copy the generated .a and .la files into your compiler's 'lib' and put the .h files into the 'includes/SDL2' folder. It's debatable if you need this libary anyway, but it's not imporssible to build and link to.

## Let's Link

Though it's not required and some people just use 'make', I strongly recommend taking the time to get sorted out with CMake so it can help you build when linking against complex libraries. I wrote a simple 'getting started' article explaining how to use create a minimal CMakeLists.txt file and compile a project, this use of SDL2 adds two additional elements: telling cmake where the headers are (the 'include' directory) and what libraries are getting linked against (the 'lib' directory). 

I also want to introduce you to the idea of using cmake 'modules'. These are files that have names like this - 'FindSomeLib.cmake'. Basically - people write these complicated scripts to find your libraries so your main CMakeLists.txt file doesn't get all cluttered with conditional logic for OS specific build steps. If you want to compile using the same buildscripts and sourcecode, you'd be doing yourself a great service by just incorporating the module, and for most popular libraries there should be one available.

The 'Find module' for SDL actually ships with CMake - but not for the child libraries. Sometimes there are multiple 'Find modules' available and one will work while another one won't, it's smart to keep them in sight. I don't know why, but modules seem to always be put in a directory in your project called 'cmake/modules'. You will need to declare that location in your build script. The full example is below.

This assumes you've downloaded the 'Find module' files - I found a good set [here](https://github.com/electrified/sdl2-cmake-scripts), [and here](https://github.com/tcbrindle/sdl2-cmake-scripts).

    cmake_minimum_required(VERSION 3.7)

    project(myapp)

    set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake/modules/")

    find_package(SDL2 REQUIRED)
    find_package(SDL2_image REQUIRED)
    find_package(SDL2_mixer REQUIRED)
    find_package(SDL2_ttf REQUIRED)

    include_directories(${SDL2_INCLUDE_DIR}
        ${SDL2_IMAGE_INCLUDE_DIR}
        ${SDL2_MIXER_INCLUDE_DIR}
        ${SDL2_TTF_INCLUDE_DIR}
    )

    file(GLOB MYSOURCE
        "src/*.hpp"
        "src/*.cpp"
    )

    add_executable(myapp ${MYSOURCE})

    target_link_libraries(myapp ${SDL2MAIN_LIBRARIES}
        ${SDL2_LIBRARIES}
        ${SDL2_IMAGE_LIBRARIES}
        ${SDL2_MIXER_LIBRARIES}
        ${SDL2_TTF_LIBRARIES}
    )

    install(TARGETS myapp DESTINATION ${CMAKE_SOURCE_DIR}/bin)

If you actually look in the 'Find module' scripts, you'll see that the are setting the variables you see used here. Even outside of SDL2, I've seen the same pattern used - basically, when you say 'find_package(PackageName REQUIRED)', it knows to look in the 'CMAKE_MODULE_PATH' for a file called 'FindPackageName.cmake'. It's typical for you to then expect to have access to variables called 'PACKAGENAME_INCLUDE_DIR' and 'PACKAGENAME_LIBRARIES'.

The include dir is where your header files are - including these directories is necessary for you to be able to use them in your sourcecode's '#include' statements - i.e. I can use

	#include <SDL2/sdl.h>

And hence use sdl classes and methods in my program.

The 'target_link_libraries' part is something you'll need to consider especially - if you were compiling on the command line, the first step is to generate your object files, and the second step is to link the object files to existing libraries on the system to generate your executable. That's done with the -l flag which is followed by the names of the libraries you intend for the compiler to find. Knowing the right flag, and which order the flags are supposed to be in is a tedious process. You can actually set linker flags in a CMakeLists.txt file, but it's kind of what we're trying to avoid, since sometimes the flags are have subtle differences cross platform and is annoying and error prone.

The 'target_link_libraries' command comes after the 'add_executable', and defines all the linking flags that the compiler will need to find what it's supposed to. If there's something missing from that part of your build script, you won't know if until after your object code is generated - you'll get a bunch of errors saying that there's 'undefined references' to these classes and methods you're trying to use in your libraries.

## Summary

Provided you've got your dependencies installed in your compiler, you've got the 'Find module' scripts you need, and are following this pattern in your CMakeLists.txt file, you'll be able to link to SDL2 and whatever other libraries you want.

c/cpp is really difficult to get into, because to get all but the simplest 'hello world' command-line application up and running, you've got to have an understanding of a whole lot of other stuff which isn't really even related to the syntax and design of your sourcecode.

Hopefully, by following these steps and sticking to the pattern, you can get right into the programming and skip debugging some of the painful building problems people get themselves into when getting started with this platform. For a good beginner's tutorial on the actual syntax of SDL2, check [this](https://github.com/SonarSystems/SDL-2-Tutorials) out.

SDL2 _did_ change the world, and it continues to be a fantastic resource for anyone hoping to build cross platform apps in c/cpp or a lot of other languages that leverage it as a platform.