# Web Components - What's Next?

The technology of web components is convoluted - like other concepts in web specifications it's really a collection of related apis - shadow dom, custom elements, and templates/slots. Without research into what each of those actually are, the best way of conveying what web components are for is with an example.

The [video element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video) or [date input element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date) are examples of elements that utilize what's called the 'shadow dom' - it's a place where a bundle of markup can be staged for embedding in a page. Those particular elements are tailor made by the browser vendors and the styling is sort of off limits to the rest of the dom. Using web components makes it so developers can make their own custom elements that are constructed from a dom tree which was staged in the shadow dom in the same way.

Why is this useful? More than anything, it's a way to organize related code and encapsulate it, reuse it, and share it. [Webcomponents.org](https://www.webcomponents.org/) is a place where tons of pre-made components can be found.

Templates and slots are concepts that further structure how data, and functionality is composed. This blog entry is inside of a custom element which parses markdown - basically the element streams data from an input file, processes it, and outputs it to a slot. 

	<marked-element>
	  <div slot="markdown-html"></div>
	  <script type="text/markdown" src="../guidelines.md"></script>
	</marked-element>

All that sounds nice, but the issue has been standardizing these apis and getting them embedded in browsers. For the last few years, web components has been a thing, but it's use is limited because it requires the use of a shim, or 'polyfill' called ['webcomponents-lite'](https://github.com/webcomponents/webcomponentsjs). Google, who has really been driving a lot of the progress towards native web components, has supported shadow dom v0 for a long time and is moving towards v1 for some time. Firefox has yet to enable shadow dom by default, but that change is [coming](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).

I wanted to highlight the web standard concept of web components before mentioning any of the platforms that have been leveraging the technology, because that's where it gets confusing.

## Polymer

Polymer is a collection of libraries that leverage web components being on the horizon and seeks to help developers realize the advantages of the technology today, and also provide tools that facilitate app-like experiences on the web. Some of what Polymer provides is for further structuring how custom elements are composed and registered.

Google's prerogative goes beyond simply exposing the technology of web components to developers - to me, it seems like it's similar to the technology of [Instant Apps](https://developer.android.com/topic/instant-apps/index.html) for Android - it's basically another effort to improve the mobile experience to the degree of giving a web-app feel like a native app. It's not just in terms of responsiveness or touch compatibility, the idea extends into http2 push style loading and reactive style interactivity.

One component that helps convey what polymer brings to the table is the [app-route](https://www.webcomponents.org/element/PolymerElements/app-route) element. Basically, it makes it so navigating to different 'pages' turns into a bit of an illusion, as your url can change but new content is 'side loaded' so to speak, which can actually be done before navigation occurs. What this does is give you an instantaneous navigation event which makes moving from one part of the site to another less like making new requests to the server and more like interacting with a cohesive app.

## Angular

Angular is also driven by google, and is typical of nodejs projects that are so bleeding edge that massive restructurings seem to be continuous. Angular 1 was massively popular and helped drive the concept of data-binding, and the entire philosophy shifted when Angular 2 was introduced as almost a totally different framework. The current stable version is Angular 5 - which is evidence of the furious development pace of the platform. It's really an institution unto itself, almost a platform that's gone beyond the web and nodejs.

One thing that Angular has been good for is giving websites more 'state', and es5 has never been very good for Angular - developers typically use typescript or es6 in order to leverage the different tools that Angular has for managing state. Components is one of those tools, and like Polymer, Angular has specific syntax for managing them.

My bank's website is created using Angular, and there's even a .NET version of it, which underlines the level of stability that platform has and how the idea of managing state isn't something that web technologies are good at doing on their own.

## Summary

Web components have been on the table for a long time as parts of overarching frameworks like Polymer and Angular, but the w3c spec of what web components are is finally reaching full adoption to some degree across all browsers. As a concept to improve encapsulation of disparate interactive elements on a page and manage the state of an app, it's likely to figure into how websites are made in a bigger way.

For more information about the shadow dom and custom elements, check the new documentation on the [Mozilla Developer Network](https://developer.mozilla.org/en-US/docs/Web/Web_Components).