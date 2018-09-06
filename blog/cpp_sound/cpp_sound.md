# Cpp Sound Synthesis - STK

The first real application I ever made was using c on an Apple II - it was a command line app that made the computer beep in interesting patterns - I called it 'virtual hamster'. It was a final project for my programming class and put almost no effort into it - but I got an A anyway and it got a lot of attention at the science fair.

The other students had created some good command line apps as I remember, but I felt like I had cheated somehow by tapping into the system's hardware to do something 'cute' that resonated with people (children) in a way that a command line app that solved math problems never could. "There's actually a hamster inside the computer" I remember saying, pointing to the speaker grill.

Fast forward a lifetime, sound is immeasurably more sophisticated than the tweeter speaker - perhaps you'd use an arduino to make a virtual hamster nowadays - but we can still play with audio using cpp.

## What Audio Libraries Are There?

For cpp, which is kind of crippled when it comes to interfacing with hardware without some kind of library to provide the connection, we don't have a lot of choices. Fewer still are libraries which I could get working.

## Fmod

This is a commercial sound synthesis platform that comes in two parts - the api for coding against, and the 'studio' which is a qt based visual editing suite where you can mess with effects and multitracking.

Unfortunately, on windows you're going to either use visual studio, or be restricted to the c api, no cpp for you. Furthermore, examples of how to use the api are sparse, and are all in cpp, so in order to get anywhere with this I realized I'd have to get used to porting example code to c. Besides that, the cmake support is a real crapshoot.

This is not a new platform, and that the people behind it haven't corrected these glaring shortcomings for linux/cmake people is insulting.

## JUCE

This isn't a library to link to, it's a creative coding application where you can do graphics experiments and sound. It's an application, not a library to enable cpp to connect to sound hardware. It's not what I was looking for.

## Nsound

This looked promising, but appears to barely be maintained and I couldn't get it to build. Requires python 2.7 and a pile of python math libraries. Requires visual studio. For me it's a non-starter.

## Pindrop

Very intriguing - a google library for sound synthesis based on sdl? It appears to be a work in process and I couldn't get it to build, but I'd like to come back to this and maybe try to get it set up on linux. It targets android and has great documentation - it looks really cool.

## STK - The Synthesis Toolkit

This is the one I ended up having success with - it's been around since the 90s, it's easy to build and link against (none of the others had the lib and header files for dropping into my compile like I've done with other libraries), and the examples are very interesting and easy to run.

Stk seems to be the product of a collective of academic programs, which is evident in its pedigree as a tool of 'sound design' and the math behind it. There's papers that go into this, but the reason it seems like a good tool to use is because it was the first one I got to work that really is a way to turn code into sound.

There are two main 'modes' that stk uses, which is 'realtime' and 'non-realtime'. 'Non-realtime' will output a wav file or something like that, and realtime will produce your noise while the executable runs. One annoyance I found was that when using the 'realtime' classes, there's one called 'Mutex.h' which contains some macros that can't be found. It will produce an error which claims that 'MUTEX is not a type', making you think that your compiler has an issue with mutex threading, which is a feature of c++ 11. That's actually a red herring though - the name of the macro could've been anything, it's still undefined. I commented out references to this in the header file invoking it and 'realtime' works fine. Unfortunately, I noted a report of this very same error from _back in 2009_. That sucks that they didn't just fix it years ago, it's a barrier to new users.

'Non-realtime' is also appealing because you're not actually binding to sound hardware per se - you're building an audio file in a standard audio format. With 'realtime' you've got to consider the device you're connecting to. On windows, you can use the 'direct sound api', which is part of direct x, or you can use alsa. Since direct sound is part of any windows distribution and alsa needs to be installed separately, I had to rebuild my 'libstk.a' file once again using the './configure –with-ds' flag. I did this using MSYS2. 

It wasn't until I did that that I was able to actually hear something when using the 'realtime' mode, which makes complete sense and is mentioned in the documentation.

Stk makes it easy to invoke different instruments and comes with a collection of raw sound samples that can be loaded and modified programmatically. Raw can be imported and exported from audacity, so with all of these filters, effects, and ways to interact with the waveforms, I'm sure I'll have some cool projects with bizarre sounds coming out of them, thanks for stk.

## Summary

You'd be better off looking for sound synthesis libraries elsewhere than with cpp, but if you're compelled to manipulate sound in code and you want to use cpp, there's stk and not much else.

With cpp, there's a lot of libraries that just won't work because they're too old and poorly maintained. It seems to me that people are less likely to look for something creative to do with a language like cpp in the first place - it's just a less 'groovy' type of programming language apparently.

Still, one only has to build and run the 'voice' demo (which was made _in 1996_) to see that there's a lot of power under the hood here and you could potentially create some very weird noises using this library.