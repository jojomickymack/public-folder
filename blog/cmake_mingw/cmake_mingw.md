# CMake And MinGW On Windows - Now You're Playing With Power

So you want to program in c/c++. That's a reasonable desire, after all - it's the most popular surviving 'father' of modern programming and it's widely used for all kinds of purposes from embedded programming to modern game development. Its syntax is the template for a generation of other programming languages, so it's unlikely you'll have a hard time reading it if you've used java or really any programming language. Why not give it a shot?

## Starting Out - Compile From The Terminal

Unfortunately, if you're a beginner who is trying out c/c++ (I'm going to call c++ cpp for the rest of this article), you've got a long road to hoe - while getting started isn't too overwhelming, especially if you're using linux, as soon as you begin attempting to include libraries outside of the std namespace, you'll start to understand why I'd say that.

The c/cpp compilation process is a two step process - first object files are created from source code. The second step is when the object files are linked to existing libraries - like header file or compiled binaries. The object files have to be linked to the libraries before the executable can be produced.

If you've built simple programs from the terminal, you quickly realize that unless you don't use any libraries and are restricting yourself to command-line style applications, these two steps become far too complex for the terminal - there are too many pieces involved, too many flags and it isn't practical for development to have to do manually. Before you realize this, you may be reconsidering your choice to be a beginner in c/cpp. After all - you wanted to do programming and you can't even get the thing to compile.

## Introducing Make

That's why you need a build tool. For c/cpp, that tool is make. Like most unix tools, make has its roots in the 70s unix culture. Make allows for you to write a recipe for compiling your application and then just run the make file. It sounds easy, and if what you're trying to compile is well made, it can seem that way - if you want to install a library written in c/cpp from source, including SDL2, hopefully all you'll need to do is run the configure script, run 'make', then type 'make install', and you're done.

While you realistically _could_ do everything you need just using make, it's not a cross platform solution, and there's a lot of other issues that have been felt for generations already. To select make as the build tool for a modern project would be unwise and again, for low level/systems programming tasks it seems to be widely used, but for high level/cross platform applications that link to complex resources you need something more modern.

## Introducing CMake

CMake is that tool. What it does is generate make files from a script called CMakeLists.txt. If you should ever look at the type and quantity of files it generates, you'd agree that it isn't something you'd want to mess around with manually and it does a great job of keeping all that stuff contained and abstracted away, allowing for you to just deal with the sourcecode and your compiled binary.

Unfortunately, CMake has notoriously bad documentation and due to the two part c/cpp compilation process, you may find that your object code compiles but the linking fails, leaving you with piles of undefined references which don't give you a lot to work with in diagnosing the issue, which is usually because you didn't set something up right in the compiler. gcc and g++, the gnu c/cpp compilers aren't well known for having great debugging/compilation error reporting features to begin with, so again, you might find yourself why you were compelled to try c/cpp if you should find yourself stuck with either a problem with the CMakeLists.txt files, or finding and linking to libraries - and that's not even related to the contents of your source code - this is just _compiling it_.

Don't lose hope - c/cpp is still worth pursuing and once you get CMake working you'll use the same buildscripts over and over again. It can be downloaded and installed from [here](https://cmake.org/download/). The CMake bin directory will be added to your PATH automatically.

Note: you can install cmake as a package using MSYS2 instead of the way described above.

## Introducing MinGW and MSYS2

Note: while you can install mingw as a standalone and it works nicely, it's actually included when you install MSYS2. My recommendation is to just skip to the section about MSYS2 and go that route - the reason being is that using pacman (the package manager included in MSYS2) makes it much _much_ easier to install libraries than just using mingw alone.

...

The gnu c/cpp compilers I've been referring to, gcc and g++ are command line tools which were brought about in linux-land. If you are compelled to develop on Windows, you are going to have a hard time. That being said, those tools and many other unix tools such as make, can be installed with MinGW, which is not a totally straightforward process.

MinGW32 refers to the older 32 bit version of the platform, but it's a general title for it and is sometimes used to refer to both the 64 bit version as well. If you want to compile for 64 bit, that's actually a totally different compiler than the 32 bit version. Go actually uses only the 32 bit compiler, so if you're interested in using Go with MinGW on Windows, you'll want that. If you don't require 32 bit, just install the 64 bit version - but understand that if you compile a library for one architecture, it won't work for the other.

There was a fork from MinGW32 to add the 64 bit version and you may accidentally download and install the original one, which is at [this site](http://mingw.org/). I'd recommend skipping that and getting mingw64 from [here](http://mingw-w64.org/doku.php). After installing, you'll find that inside of the mingw64 or mingw32 directory you have 'bin', 'include', 'lib', and 'share' directories as well as some others which a linux root directory includes. 

Make sure to add the 'bin' directory to your system PATH. After doing that, you'll have gcc and g++ on the command line, as well as the mingw version of 'make', which can be run with the special 'mingw32-make' command. You'll find it isn't really the same as the real 'make', but it can do a lot.

Important system variables are listed below - both gcc and g++ are in mingw's bin directory.

The location of gcc needs to be the value of a variable called CC.
The location of g++ needs to be the value of a variable called CXX.

Note, there is a tool called 'libtool' that you may run into problems with because it doesn't understand windows backslashes. I've fixed issues I've seen where libtool can't find gcc because it's looking for it with a path like c:somdiranotherdirmingw64bingcc.exe

To work around this, reset the variable with forward slashes.

export CC="C:/somedir/anotherdir/mingw/bin/gcc.exe"

## Introducing MSYS2

MSYS is a terminal emulator which used to come with MinGW, but it doesn't anymore. You may recognize it from 'Git Bash' - it's the same terminal. 

MSYS2 can be downloaded from [here](http://www.msys2.org/), and it includes the package manager 'pacman' which can be used to install tools, like mingw, into the shell environment. If you're using the shell to build things, you probably want to just install MSYS2 and install your build tools from there, and set your CC and CXX system variables to point to the c/cpp compilers inside of msys2's mingw directory.

In order to get a working c/cpp compiler toolchain set up in MSYS2, you'll first need to update the shell.

  pacman -Syu

This will download updated packages for everything, including pacman itself. You'll need to restart the shell and run it again.

pacman is similar to apt-get on ubuntu or yum on redhat. Every pacman command has an obligitory -S flag it seems. To search for packages, use 'pacman -Ss searchterm'. It seems that the 32 bit packages all have 'mingw-w64-i686' a dash, then the name of the package and 64 bit all have 'mingw-w64-x86_64'.

The command for installing gcc for your 64bit mingw instance is below.

  pacman -S mingw-w64-x86_64-gcc

After it downloads some packages, you should have gcc and g++ available on the shell, type 'gcc --version' and 'g++ --version' to verify it. 

You also want the mingw32-make command, install this package to get it.

  pacman -S mingw-w64-x86_64-make

Note, when you search for sdl2 using 'pacman -Ss sdl2', you'll find packages that probably make it so you can skip the sdl2 installation steps, you can just do commands like the one below.

  pacman -S mingw-w64-x86_64-SDL2
  
the full list of sdl2 packages is below

  mingw-w64-x86_64-SDL2  
  mingw-w64-x86_64-smpeg2  
  mingw-w64-x86_64-SDL2_mixer  
  mingw-w64-x86_64-SDL2_image  
  mingw-w64-x86_64-SDL2_gfx  
  mingw-w64-x86_64-SDL2_ttf  
  mingw-w64-x86_64-SDL2_net  

For more detailed info on pacman, check [this link](https://wiki.archlinux.org/index.php/Pacman).

If you install MSYS264, keep in mind that both 32 bit and 64 bit MinGW compilers can be used and there's a separate shell executable to use either one - so if you are trying to build something intended for the 64 bit compiler you'll have to use the correct shell - notices about 'bad archetecture' may be related to that.

Note: after struggling to build some specific libraries from source using mingw standalone, I instead installed the library using pacman and had success. I'd recommend using MSYS2 instead of the standalone mingw compiler.

Again, just like if you were using the standalone mingw, you'll want to set the CC and CXX system variables to the location of cgg and g++ which are in mingw's bin directory.

## Here's The Recipe

Firstly, you won't get anywhere with CMake if it can't find the compilers for c/cpp. It's said that you can set the locations of those binaries in the CMakeLists.txt file itself, but I found that didn't work on Windows. You need to set system variables that CMake will use to find those tools. See previously mentioned notes about the CC and CXX environment variables.

A basic CMakeLists.txt file is below, and it should be in the root directory of your project where the source code is in a folder called 'src'.

    cmake_minimum_required(VERSION 2.8)

    project(project001)

    file(GLOB MYSOURCE
        "src/*.hpp"
        "src/*.cpp"
    )
    
    add_executable(myapp ${MYSOURCE})

    install(TARGETS myapp DESTINATION ${CMAKE_SOURCE_DIR}/bin)

If you're building a c program, remove the 'p's from the file glob.
In a CMakeLists.txt file, you have preexisting variables, CMAKE_SOURCE_DIR, and you can create your own. Variables are invoked with the ${VARIABLE} syntax, and are typically in all caps.

The add_executable declares the name of the executable, which for this one will be myapp.exe, and would normally have a list of files. Since I want to just use all the .hpp and .cpp files in my src directory, I use the file(GLOB) command. MYSOURCE is a variable I can use representing all my sourcecode.

The install line also helps with organization of the project - without that, the executable would be generated in the root of the project, which is kind of lame. If the program used assets or other resources, you'd have to put those in the root as well - it's smart to have all that stuff live in the 'bin' directory.

I recommend creating a 'build' directory in your project and running the cmake command from there - that way, all your generated crap can be sort of hidden away. Create the build directory and run the cmake command from inside it. Use the -G flag to tell CMake what compiler it's supposed to use - visual studio is another common choice on Windows.

	cmake -G "MinGW Makefiles" ../

You should see it find the c/cpp compilers and generate some files inside of the build directory including a Makefile, which is a few hundred lines long. The comparison of how long the CMakeLists.txt file is compared to that gives you a hint why CMake is the preferred build system - and you could easily compile the same application on linux with no changes. 

You should be able to run 'mingw32-make' in order to compile your executable. Unless there's linking errors you should now have the executable in your build directory - one more step left.

The install command in the CMakeLists.txt file generated a special cmake script in your build directory - 'cmake_install.cmake'. Now you can run the command below to have that step executed.

	cmake -P cmake_install.cmake

It will just copy the executable into the bin directory of your project.

## Summary

Obviously, you don't want to cycle through the terminal commands over and over in a development workflow. There's a lot of ways to streamline it, but since I like [Atom](https://atom.io/), I'd recommend installing the [Atom Build](https://atom.io/packages/build) and [cmake-build](https://atom.io/packages/build-cmake) packages, which just does all of the commands automatically.

So unfortunately, I've gone over everything involved in c/cpp setup and compilation, but haven't gone into the c/cpp sourcecode syntax at all! Well, that's one of the obstacles to entry to the c/cpp world - you might consider that if you were using a higher level programming language you'd be able to spend more time actually _programming_, and you'd be right about that.

Despite the challenges getting things compiling and linking on Windows, it's still possible to do development with c/cpp using the classic gcc/g++ tools, and since there's tools like CMake, you'll have a lot of advantages in making your application link cleanly to its dependencies and be able to port it to other OS's without having to rewrite the whole buildscript.
