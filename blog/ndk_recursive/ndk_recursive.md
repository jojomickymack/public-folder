# Android: NDK, Recursion, Layouts

I just finished a cool experiment and wanted to document some aspects of it, since it touches a lot of things I've been interested in for a long time.
Basically, I was asked to make a program that uses recursion that outputs triangles made of asterisks to the terminal, like this.
<pre>
*
**
***
****
*****
</pre>

It needs to be said that recursion isn't the only solution for a problem like this, and recursion is typically brought up as a programming exercise - also some programming languages are better at this than others - lisps and functional programming languages like Haskell are examples of that.

Using recursion can make code more elegant, but there are some dangers in that each recursive call increases the depth - another layer on the execution stack - which gets unwound after a termination condition is met. Unfortunately, the limit to that depth can be unpredictable, and if it's exceeded your program will crash.

That being said, some languages are optimized for recursion in a special way - there's a thing called 'tail call optimization', which when used correctly, will reuse the 'frame' (the recursive function call), to avoid adding another layer of execution depth.

Still, you often don't gain anything by using recursion in the first place. If you were to figure out a way to do the same thing using loops, you wouldn't be increasing execution depth at all, and looping is typically extremely efficient. Generally, in my opinion, if you're not calculating factorials, doing a Fibonacci exercise, or drawing fractals, you probably don't have to use recursion.

## Let's Get Android Involved

I've been looking for an excuse to experiment with the Android Native Development kit for some time - I have a book about it but haven't looked at it yet. The first time I installed it was for an experiment using Cocos2d, which compiles games written in c++ to an Android apk. Since than, Android Studio 3 has come out, which will install the latest NDK at the click of a button and has some example templates.

I derived my project from the 'HelloFromJni' example in the [NDK examples](https://developer.android.com/ndk/samples/sample_hellojni.html)

NDK is made possible by something called the JNI - Java Native Interface. It's an object that can be used by c++ code that has information about the context of the application it's connected to. In a project using these things you get a CMakeLists file in your app directory, and a cpp source folder next to your java one.

The android manifest is unchanged, the root build.gradle file is unchanged, the only difference is this in your app directory's build.gradle.

        externalNativeBuild {
            cmake {
                cppFlags "-std=c++14"
            }
        }

You're all ready to start passing data between your application and cpp file. There's a method signature for the jni method in the activity that uses it.

    /**
     * A native method that is implemented by the 'native-lib' native library,
     * which is packaged with this application.
     * @param myNum
     * @param increasing
     */
    public native String stringFromJNI(int myNum, boolean increasing);

You can add additional arguments to the method call, be sure to add them to the method definition in your cpp file as well.

	Java_central_com_MainActivity_stringFromJNI(JNIEnv *env, jobject /* this */, int myNum, bool myBool) { ...

Note that the JNIEnv and jobject parameters are implicit - they're sort of magically added at the call site. Back in my activity, I can call the method like this.

	stringFromJNI(myNum, increasing);

The only difference between what I've shown here and the original HelloJNI example is the additional arguments.

## 'Hello Recursion'

To start with a specified number as the max number of stars, I made a function that checks if it's met one of two nested termination conditions, the outermost checks if the inner one is still less than the max limit, and the inner one, which does each row of stars gets incremented higher each time it's met. The whole file is below.

    #include <jni.h>
    #include <string>
    #include <sstream>

    using namespace std;

    stringstream ss;
    string output;
    int maxStars;
    int counter;
    int stopper;

    void printStars() {
        ss << "*";
        counter++;
        do {
            if (counter < stopper) {
                printStars();
            } else {
                ss << "\n";
                stopper++;
                counter = 0;
            }
        } while (stopper < maxStars);
    }

    extern "C"
    JNIEXPORT jstring

    JNICALL

    Java_central_com_MainActivity_stringFromJNI(JNIEnv *env, jobject /* this */, int myNum) {
	    // the contents of the sstream is preserved between executions
	    ss.str("");
        maxStars = myNum;
        counter = 0;
        stopper = 0;
        printStars();
        output = ss.str();
        return env->NewStringUTF(output.c_str());
    }

I ended up adding some additional functionality, like the boolean increasing variable, which use to either make a triangle pointing up or down.

The other features of the app are all related to interactive elements, like a editText field where you can enter the maxStars value, a switch where you can change which way the arrow points.

One thing you'll be familiar with if you're working with Android is that you can create and handle ui elements programmatically, or you can set them up using layouts and hook into them using the resources object.

	Switch mySwitch1 = findViewById(R.id.my_switch1);

You can attach handlers to them with code like the following - each type of ui widget has a different object that's used as an argument for attaching a listener, but the syntax is the same.

    mySwitch1.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
        public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
            increasing = isChecked;
        }
    });

Working with android layouts is a really mixed bag - you can tell that dragging and dropping widgets can save a lot of time, but ultimately you still have to do a lot of manual editing of the layout.xml file. It's tedious, but is definitely the smart way to do it when compared to positioning the elements in your Activity.java file. One thing that I kept having to add were constraints. An example is getting the switch to be under the textView, and to the left of the 'run' button. I had to do this for all of the elements, it's actually enforced by the editor. This is in my activity_main.xml file.

	app:layout_constraintRight_toLeftOf="@+id/my_button"  
	app:layout_constraintTop_toBottomOf="@+id/my_scroll"

## Source Code/APK

I've uploaded the finished app sourcecode on github.

[github repo](https://github.com/jojomickymack/c_thing005)

The finished apk (signed for distribution) at the link below.

[c_thing005.apk](http://reverie.fun/fs/c_thing005.apk)

Note - the app crashes when running higher numbers of iterations. I'm doubtful that it's the recursion stack that's causing that, it's more likely it's because the entire stringstream is getting passed back to java and getting appended to a text buffer.

update - by commenting out the parts of the app that interact with text (in the recursive function as well) the iteration limit was raised to somewhere between 1400 and 1500 iterations.

A/libc: Fatal signal 11 (SIGSEGV), code 2, fault addr 0xbe119ff8 in tid 19492 (central.com)

update - I was curious what the performance would be like using java instead of cpp, and tolerance for recursion was _way worse_. With appending text the app would crash at about 250 iterations, and with the text handling commented out it would crash between 500 and 550 iterations. I suppose this test actually highlights a scenario where you'd _want_ to use the native library over java! Keep in mind that all the tests I did were on mobile devices with limited resources.
