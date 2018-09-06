# Elements Of A Platformer Using LibKTX And Tiled

For a long time now, I've understood that game development is something of a 'black art' - meaning that its methods and practices are not 'standardized' in any way, and you have to basically be taught from a specialized resource or just figure it out yourself. Game development programming patterns are so specialized that they typically don't translate to other realms of programming.

Questions like 'how should the code be organized', 'how to scroll the screen' and 'how to make things collide with each other' do not have simple answers - each of these topics could fill a library - and more frequently discussion boards.

## LibGDX - Why It's Appealing

LibGDX is a java game engine that targets desktop and mobile. It also targets HTML5, but that's not supported using kotlin so I haven't tried it.

The reason I'm writing on LibGDX isn't because it's the best or the easiest platform - I'd have to say that Construct has that honor - it's because LibGDX is fully featured and mature. 

It has a system for changing game states, displaying menus, manipulating cameras, configuring renderers, and loading tiled maps - each component intended to work with the others in a unified way. It also has a library called 'Ashley', which is an 'entity component system' library, which I won't describe here, but is provided as a way to 'componentize' a project - a programming pattern to help organize more complex projects and keep them from turning into a complicated mess.

I hope to provide a simple explanation here of what the different elements are in simple 2d platformer that can be extended further.

## Note

In addition to using LibGDX, which is java, I'm using kotlin and LibKTX in the code here.

LibKTX is a library that adds some kotlin-centric features to GDX - and since learning of its existence I wanted to put it to use. All of the KTX classes that are being extended are just wrappers around the LibGTX equivalent. That means that everything in here applies to GTX.

## Programming Problems

I wanted to make a side point here about how making a 2d platformer puts you in a position to enjoy a unique kind of 'good programming problems' which might get you hooked on programming. 

I've put a lot of thought and time into solving 'programming problems', and one thing I've become conscious of is that there's good problems and bad ones - good ones are fun to solve - you feel like you've learned something and are ready for the next challenge. Bad programming problems are those that keep you stuck all day making futile attempts to fit a square peg through a round hole. Even if you manage to cram it through there, you might realize later that you would've been better off by _selecting a better problem to solve_. 

If you're experimenting with programming, try to avoid bad programming problems - a good way to encounter those is by choosing a platform that really isn't suited for what you're trying to do with it. LibGDX and java _is_ a good platform for game development. That's not to say that everything is going to come together on its own - but you may realize during the process of figuring things out that you really were enjoying yourself while you did it. 

If you're stuck on a bad programming problem standing between you and your creative goals, take a break by switching to a different problem. Try not to rush or force your solutions - remember that regardless of if you're playing games or making them, that it's _all just for fun anyway_. 

## First Steps - The Bare Minimum

Consider the desktop launcher for a libgdx program - you're importing your game's main class from the 'core' module, here a class called Application and instantiating it as a LwjglApplication. With this kotlin code, an object as opposed to a class produces a static entity, and the @JvmStatic annotation makes it so this function will have the required 'public static void main' signature that any java application has.

	object DesktopLauncher {  
		@JvmStatic  
		fun main(arg: Array<String>) {  
			LwjglApplication(Application(), LwjglApplicationConfiguration())  
		}
	}

If go to the 'core' module and look at that Application class, you'll see that it extends KtxGame. Extending that requires that you override the create method, and our screen - here it's a class called Game, is instantiated - the argument to the screen is an Application - this isn't required, but it enables you to do things like pause the whole application, set different screens, or terminate the game from within the Game screen. 

	class Application : KtxGame<Screen>() {
	    override fun create() {
	        val game = Game(this)
	        addScreen(game)
	        setScreen<Game>()
	    }
	}

When you call setScreen, it's starting your game - you might have some Menu that the game starts with and then switches to the game screen later - in that case, you'd swap out Game for Menu, and then in the Menu class you'd have something that switches the screen within it. This is for a button inside of a Menu class like that.

    onClick {
        application.setScreen<Game>()
    }

Now we can look at the screen itself - it's a class that extends KtxScreen which take the Application class we saw before as an argument. A Screen has to override a function called 'render', which gets called about 60 times a second.

## Renderers - How To Get Stuff On The Screen

The Game class will extend KtxScreen - in doing so it can override the render function. The render function is where you can draw to the screen - in order to do that, you need a Renderer, and there's different types you can use. There's ShapeRenderer, used for making lines, circles, squares and polygons, there's OrthogonalTiledMapRenderer, which is what can render a Tiled Map, and there's what's called SpriteBatch - specifically for drawing textures (images). 

Here we can create a ShapeRenderer as a member to our class, and in the render function draw a circle. We store the width and height of the window and divide them by 2 for the x and y coordinates of the shape so it's in the center. You should be able to run the application at this point.

	class Game(private val application: Application) : KtxScreen {
		val sr = ShapeRenderer()
		val width = Gdx.graphics.width.toFloat()  
		val height = Gdx.graphics.height.toFloat()
	    
	    init {}

	    override fun render(delta: Float) {
	        sr.color = Color.BLUE
	        sr.begin(ShapeType.Filled)
	        // circle(float x, float y, float radius, int segments)
	        sr.circle(width / 2, height / 2, 50f, 50)
	        sr.end()
	    }
	}

Now let's load a texture and display that using a SpriteBatch. Replace the png with your own - make sure that its in the android/assets directory. Note: if your application can't locate the assets folder, make sure you've declared the assets directory in your desktop module's build.gradle file with a line like this sourceSets.main.resources.srcDirs += ['../android/assets']

	class Game(private val application: Application) : KtxScreen {
	    val tex = Texture("adventurer.png")
	    val sb = SpriteBatch()
		val width = Gdx.graphics.width.toFloat()  
		val height = Gdx.graphics.height.toFloat()
	    
	    init {}

	    override fun render(delta: Float) {
	        sb.begin()
	        sb.draw(tex, width/2, height/2)
	        sb.end()
	    }
	}

Now you should see your image in the center of the screen.

You don't have to use a Sprite - but there are advantages to doing so. A sprite is really just a texture that has simplified ways to scale and move itself - here's the code using a sprite the texture is embedded in.

	class Game(private val application: Application) : KtxScreen {
	    val sprite = Sprite(Texture("adventurer.png"))
	    val sb = SpriteBatch()
		val width = Gdx.graphics.width.toFloat()
    	val height = Gdx.graphics.height.toFloat()	    

	    init {
	        sprite.setPosition(width / 2, height / 2)
	        sprite.setSize(100f, 100f)
	    }

	    override fun render(delta: Float) {
	        sb.begin()
	        sprite.draw(sb)
	        sb.end()
	    }
	}

## The Stage Class

You do not have to use a stage in your game screen - but it's a really great tool that you need to know about. That being said, it's not required and you could make a game without one.

You can have a stage as a member of that class - and in the render function, you call the act() and render() functions, which update and draw whatever you've added to the stage.

In order to make this work for you, you'll want to put your Sprite into a class that extends Actor and inside of it, override the act and draw functions. You'll then be able to add your actor to the stage, and those functions get run automatically. This is a great way to add a bunch of things to the stage without bloating your render method - you can just add all of your actors and they all get rendered.

	class MyActor : Actor() {
	    val sprite = Sprite(Texture("adventurer.png"))

	    init {}

	    override fun act(delta: Float) {
	        this.sprite.setPosition(x++, y++)
	    }

	    override fun draw(batch: Batch, parentAlpha: Float) {
	        sprite.draw(batch)
	    }
	}

	class Game(private val application: Application) : KtxScreen {
	    val stage = Stage()
	    val myActor = MyActor()

	    init {
	    	stage.addActor(myActor)
	    }

	    override fun render(delta: Float) {
	        stage.act(delta)
	        stage.draw()
	    }
	}	

## The Stage's 'Scene Graph'

Now that you've seen how the Stage class can be used, it's worth mentioning the '2d scene graph' it's associated with. While it's another topic really and there are better examples elsewhere, you can make some really nice layouts, transitions and transformations for menus, intros, and other things using this tool. If you need to position buttons, and text, you'll be using scenes and actors a lot more. LibKTX in particular allows for you to use a very kotlin-esque shorthand for declaring elements. 

The best resource for learning about this is the documentation on github.

[LibKTX scene2d documentation](https://github.com/libktx/ktx/tree/master/scene2d)

## Tiled Maps

If you have been playing indie games, chances are very high that you've encountered levels that were created using [Tiled](https://www.mapeditor.org/). When you think about it, level design is when creativity is applied - it's where your game world comes together. Having a level design tool that allows for you to drag and drop elements and position things visually is indispensable, and Tiled provides a simple interface for doing that. I'd recommend buying a copy, many game engines in a variety of languages support Tiled. 

Libgdx has top-notch support for Tiled maps, and it's really easy to load a map created in this tool to your game. There's a special class called 'OrthogonalTiledMapRenderer' which you can simply call render() on in your render function, as shown below. In order to get the map to render right, you need to set the view to a camera. The Camera class is a topic unto itself, but let's just instantiate it here to get the map onto the screen and discuss it more later. 

	class Game(private val application: Application) : KtxScreen {
	    val map = TmxMapLoader().load("map01.tmx")
	    val mr = OrthogonalTiledMapRenderer(map)
	    val cam = OrthographicCamera()

	    init {
	    	cam.setToOrtho(false)
	    }

	    override fun render(delta: Float) {
	        mr.setView(cam)
	        mr.render()
	    }
	}

If you want to, you can just use the OrthogonalTiledMapRenderer to do all of your drawing as shown below.

        mr.batch.begin()
        sprite.draw(mr.batch)
        mr.batch.end()

This is practical because there's no need to sync your renderers - you can get in quite a mess if your TiledMapRenderer has a different coordinate system or is scaled differently than ShapeRenderer or SpriteBatch. Chances are, when using multiple renderers you'll find out what I mean.

There's some puzzling things you'll discover if you don't call cam.setToOrtho(false) - the tiled map will be gigantic, and the 0, 0 coordinate will be in the center of the screen. Go ahead and try setting setToOrtho to true, and you'll see everything is upside down because the y coordinate is reversed by that flag. 

## Tiles And Objects 

Before going into the concept of 'units', I want to explain how tiled provides some different types of layers that you'll need to know about - 'tile layers' and 'object layers'. When you create a new tile map using Tiled, it gives you a 'tile layer'. Any tile layers you put on your map will automatically be rendered when you call render() on your OrthogonalTiledMapRenderer. Those tile layers consist of tiles placed on a grid of cells of whatever size you choose - if you have a tilesheet with tiles of 16x16 pixels, that's something you'll want to incorporate into your game. By setting a constant indicating that's what your game unit is, you can initialize your renderer with that value.

	const val scaleFactor = 1/16f

	...
	val mr = OrthogonalTiledMapRenderer(map, scaleFactor)

You'll be able to call getCell(x, y) on your TiledMapTileLayer and find out easily what the contents are - you might have a solid block that the player needs to respond to, you might have a collectable or a power up type of item in that cell, or it might be a hazard or something that damages the player. It's really convenient to be able to place those tiles in the map editor and be able to query for them in your game. In order for that to work, everything you're rendering in your game like sprites and shapes will need to be scaled from pixel coordinates into the cell coordinates. What I've become accustomed to is keeping a scaledRect Rectangle object with each of my game objects, and multiplying its dimensions by the scaleFactor and doing logic on that with the tile map. 

If you wanted to, you could just forgo from using tiled layers completely and just use object layers. Object layers place things in pixel coordinates, so you don't need to scale things down or initialize your map renderer with a scale factor. What you lose is the ability to see layers immediately by just calling render() and being able to query for cells. 

By using only object layers, you have to render everything yourself, which is not such a bad thing. The following examples attempt to use a tiled layer _and_ and object layer together, but keep in mind that the coordinate systems are different and that's why renderers and location coordinates get scaled down. 

## Game Units

You can scale what the camera shows, the size of the tiles, and each renderer. It can get confusing when different renderers you might be using have different coordinate systems. 

Now when calling setToOrtho() on your camera, you can dictate how many tiles will fit in the screen. The example below assumes that the map has 16x16 tiles, and we want the camera's view to contain 35x25 tiles.

	const val scaleFactor = 1/16f

	class Game(private val application: Application) : KtxScreen {
	    val map = TmxMapLoader().load("map01.tmx")
	    val mr = OrthogonalTiledMapRenderer(map, scaleFactor)
	    val cam = OrthographicCamera()
		val sprite = Sprite(Texture("adventurer.png"))
		val width = Gdx.graphics.width.toFloat()
    	val height = Gdx.graphics.height.toFloat()

	    init {
        	sprite.setPosition((width / 2) * scaleFactor, (height / 2) * scaleFactor)
        	sprite.setSize(100f * scaleFactor, 100f * scaleFactor)
	    	cam.setToOrtho(false, 35f, 25f)
	    }

	    override fun render(delta: Float) {
	        mr.setView(cam)
	        mr.render()

	        mr.batch.begin()
        	sprite.draw(mr.batch)
        	mr.batch.end()	        
	    }
	}	


## Tiled Object Layers

When positioning a tile on a 'tiled' layer, it will have a cell coordinate and will fit into the grid, but when using an 'object' layer, coordinates are in pixels. Object layers are intended for positioning shapes, points, and fields that can have meaning in your game. This assumes that there's an object layer called my_objects with a rectangle object called 'player' on it somewhere. Note that in order to 'sync up' with the unitScale we're instantiating our map renderer with, we need to multiply the pixel coordinates we get from the map's object layer by the unitScale. If we were only dealing with 'object' layers and no 'tile' layers, we wouldn't have to do that.

	const val unitScale = 1 / 16f

	// this is one of your class level fields
	val sprite = Sprite(Texture("adventurer.png"))
	val map = TmxMapLoader().load("map01.tmx")
	val mr = OrthogonalTiledMapRenderer(map, scaleFactor)
	val objectLayer = map.layers.get("my_objects")
	val mapObjects = objectLayer.objects
	val player = mapObjects["player"]	

	// this goes in the init block
    sprite.setSize(player.properties["width"] as Float * unitScale, player.properties["height"] as Float * unitScale)
    sprite.setPosition(player.properties["x"] as Float * unitScale, player.properties["y"] as Float * unitScale)
    
    // this goes in the render() method - don't forget to include the camera and mr.render() call as shown before 
    mr.batch.begin()
    sprite.draw(mr.batch)
    mr.batch.end()

The width, height, x and y properties are included for any rectangular shape, but you could add any properties you want - maybe you have rectangles representing enemies and their hit-points are a property on the map object. Now you can handle all of these aspects of these game objects from the tile map, not in the source code.

Some people prefer to only use object layers because they can make more dynamic maps which have curves and angles. Others stick with tiled layers for the collision layer and use an object layer for positioning game objects like spawn points for the player, enemy characters and items. You may create fields that cause the player to lose a life or move to the next level.

When using object layers, you no longer have the luxury of being able to simply call render() on your map renderer and see your layer - that only works for tiled layers. Object layers need to be read in and drawn with a ShapeRenderer. Again, you'll need to make sure that the coordinates for your shape renderer match those of your map renderer. The example below shows how to get the object layer from the map and iterate over various types of shapes and draw them using the matching shape renderer method - it assumes that you have an object layer in your map called 'my_objects' that has some rectagles, circles, polygons and polylines. A polygon is a shape with 3 or more sides that is closed, a polyline is 2 or more points that doesn't have to close.

Note that it's necessary to scale the projectionMatrix of the ShapeRenderer with sr.projectionMatrix = cam.combined.scl(unitScale). Try uncommenting this and you'll see that your tile layer and object layer don't match up right. If you change the x coordinate of the map to make it scroll to follow the player you'll see it's more and more displaced. Keep in mind that if you don't need to check for collisions with tiled layers, you can just remove everything having to do with unit scaling.

Note that you might be inclined to multiply each of the transformedVertices from a polygon or polyline by the unitScale and render them, but when I tried that it caused distortion and made the first coordinate 0, 0. I'm still not sure why that occurs, but to avoid it, scale the shape renderer's projection matrix as shown here. 

	const val unitScale = 1 / 16f

    class Game(val application: Application) : KtxScreen {
        val map = TmxMapLoader().load("map01.tmx")
        val renderer = OrthogonalTiledMapRenderer(map, unitScale)
        val sr = ShapeRenderer()
        val width = Gdx.graphics.width.toFloat()
        val height = Gdx.graphics.height.toFloat()
        val cam = OrthographicCamera(width, height)
        val objectLayer = map.layers.get("my_objects")
        val mapObjects = objectLayer.objects

        init {
            cam.setToOrtho(false, 35f, 25f)
        }

        override fun render(delta: Float) {
            cam.update()
            renderer.setView(cam)
            renderer.render()

            sr.projectionMatrix = cam.combined.scl(unitScale)

            sr.begin(ShapeType.Line)
            sr.setColor(0f, 1f, 1f, 1f)

            mapObjects.forEach {
                when (it) {
                    is RectangleMapObject -> {
                        val rectangle = it.rectangle
                        sr.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
                    }
                    is PolygonMapObject -> {
                        val polygon = it.polygon
                        sr.polygon(polygon.transformedVertices)
                    }
                    is EllipseMapObject -> {
                        val ellipse = it.ellipse
                        sr.ellipse(ellipse.x, ellipse.y, ellipse.width, ellipse.height)
                    }
                    is PolylineMapObject -> {
                        val polyline = it.polyline
                        sr.polyline(polyline.transformedVertices)
                    }
                }
            }
            sr.end()
        }
    }

## Serializing Shapes Into Box2d Bodies 

One thing that's worth mentioning is that libgdx has great support for box2d - if you wanted to, you could turn your mapObjects into dynamic physical bodies in a box2d world and have another layer for static bodies and that could serve as your collision and physics system. It's a fantastic direction to go in, but it's said that real 'arcade' style physics are impossible to emulate using box2d - still, it's a lot of fun and easy to set up at this point. 

## Controls

I will briefly show how to handle inputs from the keyboard. Add the code below to your Game class.

    private val inputProcessor = object : KtxInputAdapter {
        override fun keyDown(keycode: Int): Boolean {
            when (keycode) {
                Keys.UP -> {
                    sprite.setPosition(sprite.x, sprite.y + 5)
                }
                Keys.DOWN -> {
                    sprite.setPosition(sprite.x, sprite.y - 5)
                }
                Keys.LEFT -> {
                    sprite.setPosition(sprite.x - 5, sprite.y)
                }
                Keys.RIGHT -> {
                    sprite.setPosition(sprite.x + 5, sprite.y)
                }
            }
            return false
        }
    }

    override fun show() {
        Gdx.input.inputProcessor = InputMultiplexer(inputProcessor)
    }

Now when running the game, you should see that the sprite's position gets changed when you press the directional keys. In order for this to be closer to what we'd want for a platformer, we'd have the sprite in a class called Player which has a Vector2 called velocity, and we'd add and subtract from the x and y fields in that in the player's 'act' function where we'd add the velocity to the position and do logic on if the position is against a barrier or not. We'd want to implement a jump mechanic as well, and limit it from only being available when the player is touching the ground, otherwise you'd be able to fly. 

## Summary

Here I've presented the elements of a simple platformer game, like the KtxGame class, the Screen class, renderers, textures, sprites, the Stage class, and how to load a tiled map and render it. I showed some options in how to get a batch for drawing things and went into some of the details of how to configure your camera and scale your coordinate system. I showed how to bind keyboard key-presses to in-game events using an inputProcessor.

Other topics I want to get into are collision detection using tiled maps, how to position game objects and other things in a tiled object layer and read them into your game, and how to create an enemy class hierarchy and detect and handle collisions between them and the player.
