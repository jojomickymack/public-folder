# Go: Sort Interface And Reflection

This is a little experiment I did to play around with some more evolved techniques for sorting and reflecting on objects, and since I figured something out I wanted to put it on the internet as an example.

Basically, I have a custom type, 'ColorList', which is a struct containing a list of colors and a field 'chosen' which is supposed to represent the name of the field ('red', 'green', or 'blue') I want to sort based on.

By adding the Len(), Swap(i, j int), and Less(i, j int) functions to my 'ColorList' object, I've fulfilled the contract of the 'sort' interface, which is part of the go standard library.

The 'Less' function is where I use my 'chosen' field - using reflection I can access whichever field the 'chosen' string is set to - if 'chosen' is set to red, the sort will be based on the 'red' field in each of the color objects in the ColorList's list.

In the 'main' function I instantiate my ColorList, append some color objects to its list, then set the 'chosen' field and call sort.Sort with the ColorList as an argument. When the list is printed, it's sorted as expected.

These types of sorting interfaces can be found in other languages too, and I admire that it's separating the parts of a sorting algorithm that make it unique. Reflection, while it looks pretty verbose, makes the code more dynamic.

By following this pattern, you can access 'objectField' from 'object' - uint happens to be the type of the value that's getting extracted here.

reflect.ValueOf(object).FieldByName(objectField).Uint()

## Code Example

	package main

	import (
		"fmt"
		"reflect"
		"sort"
	)

	func (cl *ColorList) Len() int {
		return len(cl.list)
	}

	func (cl *ColorList) Swap(i, j int) {
		cl.list[i], cl.list[j] = cl.list[j], cl.list[i]
	}

	func (cl *ColorList) Less(i, j int) bool {
		return reflect.ValueOf(cl.list[i]).FieldByName(cl.chosen).Uint() < reflect.ValueOf(cl.list[j]).FieldByName(cl.chosen).Uint()
	}

	type color struct {
		red   uint8
		green uint8
		blue  uint8
	}

	type ColorList struct {
		chosen string
		list   []color
	}

	func (c *ColorList) print() {
		for _, myc := range c.list {
			fmt.Printf("red %d green %d blue %d\n", myc.red, myc.green, myc.blue)
		}
		println()
	}

	func main() {
		myList := new(ColorList)

		myList.list = append(myList.list, color{9, 1, 3})
		myList.list = append(myList.list, color{2, 4, 0})
		myList.list = append(myList.list, color{1, 6, 5})
		myList.list = append(myList.list, color{7, 2, 4})

		myList.chosen = "red"
		sort.Sort(myList)
		myList.print()

		myList.chosen = "green"
		sort.Sort(myList)
		myList.print()

		myList.chosen = "blue"
		sort.Sort(myList)
		myList.print()
	}

Hopefully, if someone else is trying to do something similar, this example will help out.

## More Complex Implementation

I incorporated the same idea into a more substantial app and pushed it to github.

[https://github.com/jojomickymack/go_colorsort2](https://github.com/jojomickymack/go_colorsort2)