# Linked List In Ruby

A good programming interview question is if you should use a list or an array for a given problem. If you've studied algorithms and data structures, it's driven into your head pretty hard that there's certain things that each construct are good and bad at.

Array elements typically have a fixed size - a certain 'measuring stick' that allows for you to traverse to a specific index easily. Memory addresses for array elements are expected to be adjacent to the previous and next one. That means if you know the index, you can immediately read it using the index. You can't easily add a new element to the end of the array because that requires resizing the entire thing. What arrays are _bad_ at though, is inserting a new element or removing one from the middle of it - you can replace an item at a given index, but if you're trying to add an item between two other ones, you've got to resize the whole thing and move all of the elements after the new one up one index.

Linked lists are more flexible for that insert/remove scenario because it's composed of nodes that have a reference to the next element stored in it. When adding/removing elements, only that reference to what the next element is supposed to be in the previous element needs to be changed. What linked lists are _bad_ at is reading when you know the index. Basically, you'll have to iterate over the entire thing to figure out if it's the 5th or 6th element. You'll do a lot more searching around when attempting to read data out of a linked list like this, whether to find the desired element or jumping around in memory, as linked list memory addresses can be completely out of order.

The fixed size that arrays typically have (?) compared with how easy it is to add another item into a linked list is the reason arrays are a called 'linear' data structure and linked lists are 'dynamic'. You might say to yourself that arrays certainly can be expanded, but that's really because of optimizations in modern programming platforms.

There's a lot of things like that with data structures and algorithms, but the fundamental points are still true. Often, the choice of the better approach to solve a problem is a question of math. Sometimes the advantage is trivial, especially given the incredible resources we can take for granted now.  

## Common Exercise - Create A Linked List

You might feel weird about re-implementing a data structure that already exists in the language you're working in, but as an exercise it helps drive the point home.

A node construct that contains the value and a reference to the next element are core to the linked list - the rest of the implementation if to find the end of the list so a new element can be appended, finding a node in order to append after it and trading 'next' references with it, or deletion, which is finding the node before the element to be deleted and overwriting it with the one that was next.

The implementation is short enough to just paste in here, one thing I wanted to be able to do was add in a nested array, or even another nested linked list. That's easy, it's just printing it out that's kind of messy, as with Ruby you can override the to_s method which gets called by print.

This can easily be converted to a doubly linked list by including a 'previous' field in the node.

	class Node
        attr_accessor :next
        attr_reader   :value

        def initialize(value)
            @value = value
            @next  = nil
        end

        def to_s
            if @value.is_a? Numeric then @value.to_s
            elsif @value.kind_of?(Array) then
                arrayStr = '['
                for e in @value
                    arrayStr += "#{e}, "
                end
                arrayStr += ']'
                return arrayStr
            elsif @value.kind_of?(LinkedList) then @value.to_s
            else @value end
        end
    end

    class LinkedList
        def initialize
            @head = nil
        end

        def append(value)
            if !@head then @head = Node.new(value)
            else find_end.next = Node.new(value) end
        end

        def find_end
            node = @head

            loop do
                if !node.next then return node
                else node = node.next end
            end
        end

        def append_after(target, value)
            node = find(target)

            if !node then return false
            elsif !node.next then self.append(value)
            else
                temp = node.next
                node.next = Node.new(value)
                node.next.next = temp
            end
        end

        def find(value)
            node = @head

            loop do
                if !node.next then return node
                elsif node.value == value then return node
                else node = node.next end
            end
        end

        def find_before(value)
            node = @head

            loop do
                if !node.next then return false
                elsif node.next.value == value then return node
                else node = node.next end
            end
        end

        def delete(value)
            if @head.value == value
                @head = @head.next
                return
            end

            node = find_before(value)
            node.next = node.next.next
        end

        def to_s
            node = @head

            print "[#{node},"
            while (node = node.next) do print "#{node}, " end
            print "]"
        end
    end

    list = LinkedList.new()

    list.append('france')
    list.append(22)
    list.append('england')
    list.delete('england')

    list2 = [44, 77, 'orange']
    list.append(list2)

    list.append(32)
    list.append('yellow')
    list.append('green')
    list.append(53)

    list3 = LinkedList.new()
    list3.append('washington')
    list3.append('antarctica')
    list.append(list3)

    list.append('cookies')
    list.append(14)
    list.append_after('cookies', 'chocolate')
    list.append('sandwich')
    list.append('hopscotch')

    list.delete(22)

    puts list

The output is
[france,[44, 77, orange, ], 32, yellow, green, 53, [washington,antarctica, ], cookies, chocolate, 14, sandwich, hopscotch, ]

Though it certainly would be bizarre if you decided to use your own implementation of a basic data structure like this instead of the one built into your programming language, it still is kind of cool to code up your own special list class. Maybe if you were making a list of something special that was supposed to do something custom when elements were accessed, you'd end up doing it in your own special linked list class. Maybe that's a little far fetched, but still, it's interesting.

