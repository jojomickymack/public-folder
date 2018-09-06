# Love2d: King Of Game Frameworks

It's debatable that love2d isn't the best game development framework ever created. The existence of love under its extremely open licensing made it a catalyst of game jam culture and the proliferation of cross platform and indie game development. I encourage anyone who's remotely curious about having a game development project to check it out, since the barrier to entry is significantly lower and your prospects of success are significantly higher than they would be for comparible frameworks (outside of Construct or Stencyl, which don't involve coding).

## What Is Lua?

The Lua programming language was created in 1993 in Rio de Janeiro as an in-house c extension library for the Brazilian oil company Tecgraf. It was preceded by Sol, a prototype for Lua, which stands for 'Simple Object Language'. In Portuguese, 'sol' is the word for 'sun', and 'lua' is the word for 'moon' - the main features for these efforts were to be extremely small, be simple and easy to build on any platform, and basically serve as a wrapper for c bindings. That's why Lua is popular for embedded systems with limited resources. For the same reasons, Lua is also popular for game development.

Lua borrows more from Scheme than Self; meaning that it is more list based than object oriented. The single data form in Lua is the table which makes the prototype pattern very simple to implement through a construct called the metatable. If you can understand the block below, you can implement an  [inheritance hierarchy](https://www.lua.org/pil/16.2.html).

    function MyObject:new (o)
      o = o or {}
      setmetatable(o, self)
      self.__index = self
      return o
    end 

## What Is Love2d?

Love2d was initially released in 2008, and fits directly in with the spirit of Lua - it's trivial to install, distribute, is cross platform, running easily on anywhere that c can run, and extends powerful libraries for interfacing transparently with graphics, hardware, and the filesystem.

Love2d provides 3 key callback functions - function love.load(), which is run once, and love.update(dt) and love.draw() which are called 60 times a second approximately and serve as the game loop.

[The core love library](https://love2d.org/wiki/Main_Page) has grown to incorporate resources for loading assets, physics, cuing events and multi-threading, but it's up to the developer to figure out how to manage their entities and game states. Libraries are available for all sorts of functionality, from hot reloading a running application, networking, lighting effects, and collision detection to using shaders, meshes, and textures.

## Where Can Love2d Run?

A .love file is extremely easy to create from lua sourcecode, it's just a zip file of sourcecode which has a main.lua which is renamed to have a .love extension.

To create a standalone game, you can simply include the love2d distribution in [this way](https://love2d.org/wiki/Game_Distribution#Creating_a_Windows_Executable). Games created using love2d can be found on steam and other mainstream game marketplaces.

The only thing you can't really do with Love2d is embed your game in a webpage and expect to run it cleanly on mobile, though [love.js](https://github.com/TannerRogalsky/love.js) is improving significantly. Basically, it compiles your game to javascript using [emscripten](https://kripken.github.io/emscripten-site/), which works surprisingly well but can get bogged down when too much is going on. 

[Love For Android](https://play.google.com/store/apps/details?id=org.love2d.android) is a more viable option for targeting Android, and typically is bundled with a game similarly to how you'd package a game for any other system. Love2d includes native support for touch events and libraries exist for scaling the window appropriately for mobile screen widths.

## What Are Some Good Resources For Learning More About Love2d?

[Sheepolution](http://www.sheepolution.com/learn) provides some beginner friendly tutorials and there's about a billion games created with love2d [on itch.io](https://itch.io/games/tag-love2d). Gamesfromscratch has some great [youtube tutorials](https://www.youtube.com/playlist?list=PLS9MbmO_ssyBAc9wBC85_WG9aT88KGxH8) to get you started.

While there's lots of game development frameworks like Gamemaker, Construct, and Unity that provide a more visual game development experience, Love2d is probably the easiest framework for providing you with basic support for all the things you need to do and gives you the responsibility of implementing the pipeline, which is the fun part of game development. All this, and you get to do it in Lua.

Lua and Love2d are a real godsend to non-specialists who wish to learn to create games, and it's a unique statement of intent that as tools, they're provided for free for whatever use you can think of for them.
