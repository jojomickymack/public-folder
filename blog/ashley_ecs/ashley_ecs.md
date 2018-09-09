## Ashley - A LibGDX Entity Component System

Lots of beginners start talking about implementing a component system before they know how to render and move a simple sprite. I've noticed this - some have a tendency to attempt the _hardest possible thing_ and ask for help in the forums. It goes like this.

> I've decided to implement my won game engine, with collision detection, camera, and component systems all built from scratch. This is my first game - my question is, why can't I see my character on the screen?

The truth is, to get your game running, you don't need to worry about this stuff at first. You can do a crap input system, fake collisions, and skip the ECS - there's only two components anyway.

There's nothing wrong with that, it's how stuff gets up and running - but if you consider an rpg with hundreds of npc characters walking around - or a space shooter with 50 different kinds of enemies and upgrades - any tool to help you mitigate all of the properties that these things share is going to become very appealing.

The fact is, ECS is the most important and probably the only cohesive game specific programming pattern. Luckily, it's not even that complicated - it's just all the jargon and its tendency to produce lots of files that will detour you at first - but if you read this little guide you'll be better off. 

## Game Patterns

Programmers know what it's like to find a new programming pattern - a new approach to a problem that didn't make sense to you until you have the same problems that the pattern was created to cope with. A good example is MVC - the view, model controller pattern is a strategy for grouping code into these 3 sections. If all of the code related to displaying a bunch of data is in one file, you can imagine that would make it easy to re-skin the app by just adding a different view.

Like most advanced patterns, you're probably not going to resort to them until you've started to find out what kinds of problems you can have when you don't use them. For games, that's the monolithic file that touches every part of the game and can't be modified without redoing the whole thing essentially.

You know - it's a game after all - coding it shouldn't be a disciplined act - you should be able to kind of hack it out as you see fit - the problem is, you know when you're doing it wrong and you know when you're brushing up on a strategic issue.

The theme behind resorting to an ECS architecture is "favoring composition over inheritance", which is something that the gang of four talked about in the famous 'design patterns' book. For simple games, a user certainly wouldn't be able to discern the difference, but other types of games that have a lot going on, it can really be advantageous to use the ECS approach to manage the state of the game.  

## The Manager Class With A Singleton Instance

Let me describe the inheritance based architecture so the difference is more clear. 

What I like to do, which is working out pretty well, is to sort out the things that need to be managed - like input, the tilemap, the text, and group the code into a 'SomethingManager' class, and then have a shared instance of it I keep in a MyGameObj that there's only one of and is essentially the companion object throughout the life-cycle of the game. If part of the game needs the map, it can do it through the MapManager instance though that central object.

This is ok, but it leads to my having a class for everything that has a sprite, a position, and various other properties. It works pretty well if I have two types of enemies that inherit from an abstract BaseEnemy class. If I have _more than two_, it gets a little ugly. Say there's a special enemy type that can heal itself as time goes by. The inheritance solution is to make a copy of one of the other enemies and add the functionality for recalculating it's health all of the time. What if there's a new type of enemy that can pick up a weapon? The same approach results in a lot of classes that resemble each other.

Where it gets _really_ messy is when all these objects are accessing the map, the player, etc - are each of these objects supposed to borrow tiles from the tilemap and do collision logic on them so they can better control their own positions? There's a lot of repeated code as collections of game entities are iterated over and change each other's state and the state of the game.

If I want to add something to the game, something that other entities are going to react to, I'm going to have to change a lot of their code. Should reacting to things be handled by conditional logic in each object's class? What if the player gets a new state that makes attacks bounce off of him? That's going to lead to changing logic in all of the enemies to check for that state. 

This is an ok strategy, but it's limited in how many things I can add without disrupting everything else. It might occur to you that it would be favorable to encapsulate each _behavior_ and attach it to special instances of a game object - that's what ECS is.

How about this example - your game has a lot of weapons lying around that your player can pick up and use. There's a bazooka, a flamethrower, and a grenade launcher - the inheritance approach would to do conditionals in your Player class to collide with the pickup and change a property of the Player and then do logic on whether or not to render such and such a weapon inside the player's render function - wouldn't it be better to make components representing each weapon, and handle what it means to have the different weapons in a WeaponSystem class?

It's a different way to organize where properties and logic goes, and enables easier extension of what's in the game because it's a matter of adding and removing components from different entities.

## Iterating Over Collections

This might seem obvious - games animate constantly and things are getting updated and drawn over and over and over. It's all about iterating over collections of things. A simple ECS can be to just line up everything that needs to be rendered, have them all implement a Renderable interface with a render method and iterate over a collection of them and call render on each of them. That's exactly what LibGDX's stage and actor classes do - you extend the Actor class, call stage.addActor(myActor), and then in your game's render function you call stage.draw().

LibGDX also has a plugin called 'Ashley', which is a framework for ECS - how is that different from the stage and actor relationship?

Let's go over what ECS stands for:

Component - a component is like a feature - some good examples would be a position component, a texture component, and a user controlled component. Each of these would have a couple properties - position would have a vector property, the texture would have a spritesheet. No logic - just properties.

Entity - an entity is an instance object that you attach components to - for your player entity, you'd have all three of the components including the user controlled one - the enemy entities would have positions and textures but no user controlled component.

Systems - you typically have a system for each of the components - this is where the logic lives. To extend system basically means that you have an 'added to engine' function where it can have access to certain types of entities. It also has an 'update' function where it basically iterates over its collections of entities and does the game logic on them. Good examples of systems are a render system, a camera follow system, a collision system.

Engine - there's only one engine in your game state - basically the engine is something that has all of the systems and entities added to it. In your game's render loop, all you have to do is call engine.update(delta). What the engine provides are ways to access collections of entities - it's kind of like a sorting machine.

Families - if a bunch of entities belong in a group, you can make it so they're in a family - basically the point is so you can allow the engine to give you a family of entities instead of your having to do a bunch of conditionals to get the set you need.

## Ok, What Does This Provide? I've Got Twice As Many Files

Now with all of your classes having 'Entity', 'Component', or 'System' in the name, and a bunch of small 'bags of properties' in your components, you might feel like you've raised the contrived quotient and haven't achieved anything real. The real advantage is when you need to add another feature - say some of the enemies in your game can turn red and have double damage when they're in that state. Add a 'SuperStengthComponent' with 'doubleStrength' set to true, instantiate the new enemies and add the component to them. Say there's some pick up that makes it so the player gets double strength too - well, just add that component to the player entity when they collide with the item.

What if there's a part of the game where the player is disguised as an enemy and walks through a high security area? Just transfer the 'user controlled' and 'camera follow' components to enemy entity.

You'll be able to add functionality and mix and match them, and basically manage the state of your game by adding and removing entities and their components.

Using an ECS seems like a bigger infrastructure investment when compared it to the 'FeatureManager' and 'classes that inherit from each other' approach, but when a game gets to a certain size, it's really helpful.

## Summary

I didn't show any code here because ECS is really just an idea, and the Ashley system that is associated with LibGDX is just a tool for implementing it.

I added a working example of a platformer using a tiled map to my github account.

(https://github.com/jojomickymack/libgdx_ashley001)[https://github.com/jojomickymack/libgdx_ashley001]





