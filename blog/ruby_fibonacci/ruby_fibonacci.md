# Ruby Tail Recursion And Caching

Sometimes optimization in a program is the difference between it taking 0.5 seconds to finish or 0.7 seconds. Often, the trouble you might go through to achieve that optimization isn't worth what you stand to gain, and _sometimes_ you sacrifice simplicity and stability in order to achieve some subordinate goal.

There's two scenarios that I've encountered in ruby that really drive the point home that sometimes, adding an optimization can be the difference in your program _being able to run or not_. Those optimizations are **tail call recursion** and **caching**. I discovered these when playing around with the most popular use cases for recursion, calculating factorials and the fibonacci sequence. Honestly, outside of these two computer science experiments I haven't resorted to recursion a whole lot, and despite how well languages like haskell use the pattern, I tend to think you might be better off _never_ using it unless it's for some sort of exercise.

With low initial inputs the app runs perfectly fine, but the app hangs or crashes when the initial input is greater and thus the call stack gets out of control because of too much recursion. Where the limit lies will vary from machine to machine and how much memory the thread has access to.

## Tail Call Recursion With Factorials

For calculating factorial, you take a number and multiply it by all of the whole numbers smaller than it until you're out of numbers. If you're trying to do this in c/cpp, you'll find the limit to be around 20 because the number becomes too large for commonly used datatypes. In c/cpp, calculating factorials higher than 20 is actually a very involved and may drive you insane. [Check this explanation](https://discuss.codechef.com/questions/7349/computing-factorials-of-a-huge-number-in-cc-a-tutorial) for more detail.

In ruby though, you can just go ahead and try to do it and it works. You can calculate the factorial for 5000 instantaneously without even having to consider the resolution of available data types. Just by doing this in ruby, you've avoided possibly going insane - that's a pretty good deal!

Still, you will encounter a new limit when trying to calculate the factorial of 11000 for example. 10000 works fine on my machine without tail call optimization.

	enter the number you want factorial for : 11000
    src/main.rb:8:in `fact': stack level too deep (SystemStackError)
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
             ... 10908 levels...
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:8:in `fact'
            from src/main.rb:14:in `<main>'
    rake aborted!

You can increase the limit substantially by just enabling tail call optimization, which can be seen in the complete code below. Now I don't know why, but this won't work unless you _require the factorial function_ in a separate file.

	#src/fact.rb

    def fact(n, acc=1)
        return acc if n <= 1
        fact(n-1, n*acc)
    end

Note the RubyVM instructions at the top, this is enabling the optimization.

	#src/main.rb
	RubyVM::InstructionSequence.compile_option = {
        tailcall_optimization: true,
        trace_instruction: false
    }

    require './src/fact.rb'

    print "enter the number you want factorial for : "
    myNum = Integer(gets.chomp)

    print fact(myNum)


This makes it so you can easily calculate factorial 11000 and _way_ beyond - prepare to have your terminal _completely filled_ with digits! Also worth noting is that tail call recursion can only be done when the recursive function call is the _last line of the function_. What's happening here is that the 'frame' that is used for constructing the function is being reused with different arguments for each call instead of adding an additional frame on the stack - it's actually _really cool_. Javascript es6 has some tail call optimization features that may enable some similar abilities.

## Fibonacci With Caching

Caching/memoization is an really simple optimization for anything that may be doing some sort of expensive calculation or operation to get a value over and over where the value will never be different. You might as well do the expensive operation to get the value once, then store it so for identical requests or function calls you can just return the same value from before. This is sometimes called 'hashtable', and in ruby you can just use a simple map.

You'll see some significant slowdown when attempting to return fibonacci over 30. The fact is, the computer is recalculating the same things it's already calculated at exponentially greater frequency when the initial argument gets higher.

In the code below, you can see that there's a map called cache that is getting checked to see if there's a key matching the value we are looking for a calculation for. Only if it's not there in the map do we do the recursive operation - then when we get it back, we put it in the map. By printing the map at the end, you can see it's become a lookup table which minimizes how often the recursive function is called. When testing with or without the cache, you'll find caching literally is the difference between the program rapidly returning a value or stalling out and crashing.
		
	class Fibonacci

	    attr_reader :cache

	    def initialize
	        @cache = Hash.new
	    end

	    def fib(n)
	        if (n < 2) then return 1 end
	        if (@cache.key? n) then
	            return @cache[n]
	        else
	            myfib = fib(n - 2) + fib(n - 1)
	            @cache[n] = myfib
	            return myfib
	        end
	    end
	end

	print "enter the number you want fibonacci for : "
	myNum = Integer(gets.chomp)
	puts

	myFib = Fibonacci.new

	puts "the solution is"
	puts myFib.fib(myNum)
	puts

	puts "the contents of cache is"
	puts myFib.cache

## Summary

It's common to be in a position to decide if optimizing or refactoring something is worth it in context, but for these two scenarios, it's indisputable.

Not only that, but adding the optimization is trivial and barely changes the original program. It's for that reason that these make good examples of an intelligent optimization.

But what if that optimization required that the whole program essentially be rewritten? What if your use case didn't even include needing to calculate those higher factorials/fibonaccis? What if you were using c/cpp and tangling with the resolution of the datatype not being able to hold the values required was something that made the implementation significantly more convoluted and less stable?

Context always applies to decisions like those, but in terms of computer science, it's indisputable that _some_ optimizations solve _some_ problems _absolutely_. Hopefully these examples show that.
