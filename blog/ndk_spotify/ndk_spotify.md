# Android: NDK, Spotify Api and Exchanging Data Between cpp and java

There's a specific field of study in computer science called 'DSA' - Data Structures and Algorithms - [Tutorialspoint](https://www.tutorialspoint.com/data_structures_algorithms/index.htm) does a good job of highlighting the audience for this type of stuff - students and programming professionals. It's true that a lot of programming professionals aren't interested in this stuff - it's about sorting data and creating special 'containers' for it - topics that could be glossed over if you're ok with using standard datatypes and sorting techniques which are already part of your chosen programming language.

It needs to be said that DSA was largely established when those 'built-in' solutions weren't available and everyone was working with low level languages like c - still, it's interesting stuff and makes for good interview questions to figure out if someone took computer science courses or is just a 'hacker'.

I learned a long time ago that you get a lot more mileage out of these types of things when you take it beyond the hypothetical and try to combine it with something else that interests you - for me, that's music, Android, and rest apis!

## What's A Bubblesort?

A bubblesort is a way of ordering items in a list by iterating through a list and evaluating if the current item needs to be swapped with the next item or not based on some sort or 'predicate', or condition which makes so it's either in the right or wrong order. 'Bubble' is in the name because if something gets swapped over and over it moves from the bottom of the list to the top in steps. The 'steps' involved is the reason it's one of the slowest sorting algorithms.

	vector<int> bubbleSort(vector<int> v) {
	    int size = v.size();

	    int i, temp;
	    bool swapped;

	    do {
	        swapped = false;
	        for (i = 0; i < (size - 1); i++) {
	            if (v[i] > v[i + 1]) {
	                swapped = true;
	                temp = v[i];
	                v[i] = v[i + 1];
	                v[i + 1] = temp;
	            }
	        }
	    } while (swapped == true);
		return v;
	}

This one will just go over and over the list until there's no more swapping left to to. 

One thing I should mention at this point is that is in c, maps are unordered lists and vectors are ordered. That means that your map can't be accessed by index, and that the order of what's inside won't be in the order that they were put in. This alludes to the use case of such a structure - it's for pulling items out by their keys - like a database.

Vectors _do_ keep track of the order the elements are in - and since we're putting lists in order, we need to use vectors and not maps.

## Let's Get Some Data

I'm not as satisfied with putting lists of numbers in order as I am when I'm making something that actually does something meaningful - so I decided that I'd do my sorting on real data coming from rest apis available on the internet and build an app for Android that I could share with others easily. I made a POC using [tastedive](https://tastedive.com/read/api), which is a really cool website, rest api aside.

You can pull some good data out of the api with pretty much no work! Register your own app and put the key in the request if you want to play with it.

https://tastedive.com/api/similar?q=juan+atkins&k=yourapikey

There were some tricks to getting this to work for my android app - firstly, I had to make a class that makes the http request, which in itself is pretty verbose.

	URL url = new URL("https://tastedive.com/api/similar?q=" + searchTerm + "?k=" + apiKey);  
	HttpURLConnection conn = (HttpURLConnection) url.openConnection();  
	try {  
		InputStream is = new BufferedInputStream(conn.getInputStream());  
		int ch;  
		StringBuilder sb = new StringBuilder();  
		while ((ch = is.read()) != -1) {  
			sb.append((char) ch);  
		}  
		this.response = sb.toString();  
	} finally {  
		conn.disconnect();  
	}

My initial problem was that when executing the http request, java tried to process the response before the http response had actually come back. I had to start using threads and a special thread.join() method to make sure the app waited until the thread had ended before moving onto the next step. My http request method is in a class which implements 'Runnable', and the method above is in a method which overrides 'run'.

Doing the request from the MainActivity now looks like this.

	MyRequestClass request = new MyRequestClass();  
	Thread requestThread = new Thread(request);  
	request.setSearchTerm("juan+atkins");  
	requestThread.start();  
	try { requestThread.join(); } catch (InterruptedException e) { e.printStackTrace(); }  
	String responseJson = request.getResponse();

Now what I wanted to do was parse the json using cpp - which lead me to a really great discovery!

[json support - nlohmann/json](https://github.com/nlohmann/json)

This library is absolutely amazing - all you have to do is include a single header file and then you can parse json, create json, and intuitively access nested nodes with a syntax that looks like this.

	json myJson = json::parse(myString);
	string albumName = myJson["artists"]["items"][0]["album"]["name"]

Of course there were some obstacles at that point - firstly - I wanted to put the header file in an 'include' directory as I'm accustomed to. In order to do that, you need to add this to your CMakeLists.txt file. There's no requirement for where this actually is, I decided to put it in the root of the 'app' module, since there's a 'libs' directory there as well, it seems fitting. 

	target_include_directories(super-lib PRIVATE  
                       include ) 
super-lib is the name of my library - yours is probably different. Now after putting json.hpp into my include folder, I can use it in my super-lib.cpp file like so.

	#include <json.hpp>  

	using json = nlohmann::json;

Obstacle #2 at this point was being able to send my java string, which contains the json response from the rest api, into my super-lib.cpp function so it can be parsed and interpreted. This was the first in a series of realizations of how the 'java world' and 'cpp world' have completely different types, and in order to share data, you need to play by the rules of JNI - or your app will crash suddenly and horribly.

The solution to sending my java string into the native lib was adding a function like this.

	string ConvertJString(JNIEnv* env, jstring str) {  
	  const jsize len = env->GetStringUTFLength(str);  
	  const char* strChars = env->GetStringUTFChars(str, (jboolean*)0);  
	  std::string result(strChars, len);  
	  
	  env->ReleaseStringUTFChars(str, strChars);  
	  return result;  
	}
Basically, the characters are read in and re-encoded to a c type string which I can now use. The solution was found [here](https://stackoverflow.com/questions/11558899/passing-a-string-to-c-code-in-android-ndk). If I didn't find that I'd probably have been stuck!

Now, really just for testing the json library and making sure I could move onto more complex things, I re-encoded the string, parsed the json, and just dumped it back into a java string and back in my application I dumped the string into a textview.

Below is my simple json parsing/ dumping native function. Calling json.dump(2) makes it pretty print the json with an indentation of 2.

	extern "C"  
	  
	jstring Java_central_com_MainActivity_parseDumpJsonJNI(JNIEnv *env, jobject /* this */, jstring myJsonJstring) {  
	  string cstring = ConvertJString(env, myJsonJstring);  
	  json cjson = json::parse(cstring);  
	  string output = cjson.dump(2);  
	  return env->NewStringUTF(output.c_str());  
	}

I now had a list of recommended artists based on whatever search term I submitted! Still - I don't have any way of sorting the data - it was then that I turned to the Spotify rest api and the while sticking to the same patterns above, the app became much more complex.

## Time For Spotify

Since this blog is already getting pretty long, and what followed was a waaay more complicated version of what I'd already figured out, I'll just summarize.

Spotify certainly gives you access to a much, _much_ larger datastore - you can pretty much find all artists and albums, get listings of all the tracks on whichever album you want. I basically followed the same pattern of threads executing http requests to spotify endpoints with one important difference - authentication.

Spotify uses oauth - a token system that insures that you've checked in to an authentication endpoint and exchanged your clientId and clientSecret keys for a token - and then every subsequent request to the spotify endpoints has that token in a header titled 'Authorization'.

If you would like to run the sourcecode I've posted here, you'll have to register for a spotify app and put those credentials into the MainApplication.

You'll really need to go over to [developer.spotify](https://developer.spotify.com/web-api/) to learn more about it.

For my app, I created a function that hit the token endpoint with my client creds, and a cpp function that parsed the json and returned the token key. I then used the token key in the constructor for each of my http request classes. Instantiating those now looked like this.

	SpotifySearchArtist ssaRequest = new SpotifySearchArtist(token);

In order to access artist or album information, you actually need to retrieve the ids which are used internally from a previous request, and include it in your requests to the /artists or /albums endpoints - I did that with cpp just as I'd done with the token.

	int artistCount = static_cast<int>(cjson.count("artists"));  
	if (artistCount > 0) if (cjson["artists"]["items"].size() > 0) output = cjson["artists"]["items"][0]["id"];

## Ok, What About That Bubblesort?

I ended up building the spotify rest api support more than I needed to just to get something to sort - it was really a lot of fun!

I decided that I would need to grab specific information from the /artists/artistId/related-artists endpoint - artist names and popularity. I created a vector of pairs for that.

	vector<pair<string, int>> myArtistsVector = {};

I iterated over the artists in the json response and pushed them into my vector.

	string name = cjson[i]["name"];  
	int popularity = static_cast<int>(cjson[i]["popularity"]);  
	pair<string, int> myPair = {name, popularity};  
	myArtistsVector.push_back(myPair);

Great - now I can sort my vector by the popularity!

	int size = static_cast<int>(myArtistsVec.size());    
	int i;  
	pair<string, int> temp = {};  
	bool swapped;  
	
	do {  
		swapped = false;  
		for (i = 0; i < (size - 1); i++) {  
			if (myArtistsVec[i].second > myArtistsVec[i + 1].second) {  
				swapped = true;  
				temp = myArtistsVec[i];  
				myArtistsVec[i] = myArtistsVec[i + 1];  
				myArtistsVec[i + 1] = temp;
			} 
		}
	} while (swapped == true);  
	return myArtistsVec;

To switch the sorting order of the vector, all that needs to be done is reversing the > in the conditional to do the swap. The finished app uses a conditional to flip it.

There's one other challenge that I had, and that was getting this data back into the java world so I could put it on the screen. Accomplishing this revealed something _really_ crazy - you can reach through the JNI layer from cpp and java classes and methods are exposed to you. In fact - you _have_ to do this if you want to return something as simple as an Integer type back to java from your native code.

	jobject cIntReturnJavaInteger(JNIEnv* env, int cInt) {  
		jclass integerClass = env->FindClass("java/lang/Integer");  
		if (integerClass == NULL) return NULL;  
		jint number = cInt;  
		jmethodID methodID = env->GetMethodID(integerClass, "<init>", "(I)V");  
		jobject integer = env->NewObject(integerClass, methodID, number);  
		return integer;  
	}

Now I don't really understand all of this - especially that line where you get the java method id of the Integer's constructor... but I found some examples of this working on [this website](http://adndevblog.typepad.com/cloud_and_mobile/2013/08/android-ndk-passing-complex-data-to-jni.html) which helped me get my head wrapped around it.

## In Conclusion

I had a lot of fun messing around with Spotify's rest api and overcoming the type conversion challenges that someone has to reconcile when using android's ndk in this way - but I have to say, nlohmann's json library, all this great data spotify provides access to _for free_, and the android platform in general are really exciting and fun to play with!

## Source / Working App

I've uploaded the finished app sourcecode on github. Note - you will need to register your own spotify app and put the creds in the MainActivity.java file. If you boot the app and see a white screen, it's probably because the clientId and clientSecret are wrong.

[github repo](https://github.com/jojomickymack/spotbubsort003)

The finished apk (signed for distribution) at the link below.

[spotbubsort003.apk](http://reverie.fun/fs/spotbubsort003.apk)
