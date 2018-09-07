# Building Php On A Chromebook

I like setting up new websites for fun - sometimes I run into problems that I end up looking back on as being the 'right kinds of problems'. Something that I can't get to work but is just fun to screw around with and is challenging in the right ways and when it's all resolved I sense that I picked up some new knowledge. I've had a lot of these types of problems that result in me having to powerwash (reset) my chromebook - fortunately I haven't had to do that in a while.

There's no problems quite like those associated with compiling c code on linux in order to make a certain shared library installed - it involves obscure, undocumented command line flags, lengthy build times as thousands of lines of code are turned into object files, and then you find out that the build failed because some header file wasn't found.

Nonetheless, I did manage to compile php and some needed extensions and install them on chromeos and get my new website set up with cakephp. It was so difficult to do I realized it would make a good blog article incase others run into the same issues.

## Chromebrew - It's Back!

Chromebrew is a ruby based package management system that you can install various programming languages and libraries into chromeos. I described how to use it in a past article on chromebooks - since that time I've realized that it's the most important tool for chromebooks full stop. 

Since I was so curious about the inclusion of an android runtime on chromeos, I switched to the beta channel and ran into a compatibility issue with chromebrew that resulted in my having to powerwash the device and switch back to the alpha channel. I kind of put the chromebook away for awhile because of this problem, and since then it's been resolved.

Without getting sidetracked, I should say that chromeos has suffered from a lack of text editors for some time. Suddenly there's a plethora - my favorites being [Caret](https://chrome.google.com/webstore/detail/caret/fljalecfjciodhpcledpamjachpmelml) and [CodePad](https://chrome.google.com/webstore/detail/code-pad-text-editor/adaepfiocmagdimjecpifghcgfjlfmkh?hl=en-GB).

Using chromebrew, you can install gcc 7.3.0 and use all the new language features. You can install python, nwjs and ... kotlin? You can install jdk8, gradle, and the list goes on. Php 7.2 is available, but if you're hoping to run a LAMP stack on your chromebook you'll have some work to do. Something that's always seemed pretty weird to me is how php gets installed as a module to apache - basically it's like a special php interpreter only for parsing web content - totally different from php-cli.

Typically on linux, installing apache and php using a package manager just takes care of the integration for you - it's kind of tricky getting php set up as a module otherwise.

Here's what I added to httpd.conf on windows after installing apache and php separately.

	PHPIniDir "C:/work/php/php-7.2.9"
	AddHandler application/x-httpd-php .php
	LoadModule php7_module "C:/php/php-7.2.9/php7apache2_4.dll"

You can see in the load module line that there's actually a binary that was provided in my [windows-php download](https://windows.php.net/download/) that installs php to apache - there's no such file available for my chromebook.

While I could probably figure it out if I really wanted to, I'm kind of not that crazy about apache to begin with - it's kind of archaic - it's configuration files are nasty, and I like trying new things.

I realized after reading some of the issues on github for chromebrew that nginx is what most people are using.

## What Is Nginx?

Nginx is a newer server that you would compare with apache that pretty much does the same thing but has configuration files that look cleaner and more like a normal programming language. It's easy to connect nginx to a ruby or python app. I wouldn't say that nginx is _exciting_, but since I've had success with it in the past and it didn't make me want to kill myself I will continue using it.

It's integration with php was also really easy to handle and didn't require any special shared library. I kind of liked how this setup kept nginx on this side of the room and php on the other - instead of strangely mashed together like apache with the php module is. 

## What Is Php-fpm?

The chromebrew php distribution is for php-fpm. FPM stands for 'Fastcgi Process Manager'. Ok... so what's fastcgi? CGI stands for 'Common Gateway Interface'. It's how a server can communicate with php - any deeper understanding of that would probably give you a headache and it has pretty much no baring on getting things set up - the point is, you need to have these in place for your website to work.

Php-fpm is just a running process running on a specific port - adding these to your 'nginx.conf' file is how the connection is defined. Php won't run on your server is these lines aren't there.

	location / {
		try_files $uri $uri/ /index.php$args;
	}
	
	location ~ \.php$ {
		fastcgi_pass [127.0.0.1:9000](http://127.0.0.1:9000);
	}

The location of your app is defined by the 'root' field. It can be anywhere in the filesystem.

	root /home/chronos/user/Downloads/projects/php/caketest001/webroot;

You'll also need to add index.php as one of the default filetypes in the config file.

	index index.php index.html index.htm;

What I noticed when setting the same thing up on an actual server is that on some systems, installing nginx will have some default extra configuration files in some 'sites_enabled' directories. That's just a convention - I just removed reverences to other config files and put the exact same stuff in as shown above with one exception.

On an ubuntu server I put the location of the php socket file in where I'd put the http port previously.

	location ~\.php$ {
		include snippets/fastcgi-php.conf;
		fastcgi_pass    unix:/run/php/php7.2-fpm.sock;
	}

Whenever you need to reload the config file, do the command below.

	sudo nginx -s reload

Note: The user you put in your nginx.conf needs to match the user that owns the webapp and there's also a place where the username needs to entered in /etc/php/7.2/php-fpm/pool.d/www.conf. If you are getting permissions related errors when trying to access your website, that might be the cause. Obviously when troubleshooting you should start first with the nginx error logs.

## Php Problems

At this point, you should be able to check your server and see some sort of response in the browser. <?php phpinfo(); ?> is a nice way to see if php is online. You'll want to install composer as well, which is available in linux package managers, it's available in chromebrew, and it can be downloaded as a .phar file and placed in your system path.

Composer is a php package manager - all you have to do is type 'composer install' such and such and it will check the requirements and download it into your project, even caching things you've downloaded previously. You can install cakephp into a directory by doing a command like the one below. It will install everything cakephp needs to run into a directory called cms.

	create-project cakephp/app cms

If you should point your webserver at that, you'll find that you're missing the mbstring and intl php extensions.

If your php installation had these extensions compiled with it when it was built, all you've got to do is go into your php.ini file and find the commented out line for that extension and remove the ';' (semicolon) which makes the extension commented out. More often than not, the shared object file isn't provided and you need to install it yourself.

If you're using ubuntu or centos, you'll have no problem finding these php extensions and you php.ini will be updated automatically to enable it. If you're using _chromebrew_ however, you have to use pear or pecl to install them. Normally, this works fine, with pecl you just type 'pecl install mbstring' and it just downloads a package from the pecl repository and then runs 'phpize', a tool for compiling c code for php extensions and puts the shared object file where it belongs and enables the extension. Unfortunately, pecl isn't keeping up with the right versions of 'intl', for php 7. The reason is because the intl source code is included in the php source distribution - all you have to do is run 'phpize' in the source code directory and it should compile it just fine.

You can actually just build the entire php language with various extensions by having gcc installed and knowing what the compile flags are supposed to be. The one I ran for this job is below.

	/configure LIBS="-liconv" --enable-intl --prefix /home/chronos/user/Downloads/php-7.2.8-build

The first flag of LIBS was to get around a problem where a header file couldn't be found and I found the solution on stack overflow - amazingly, that solved the problem. --enable-intl is typical for adding an extension - you just need to know the exact spelling of whatever extension you're trying to build. --prefix defines what location your 'make install' command is supposed to put the shared object files into. Here, I made a special directory next to where my source code is - if you don't do this, running 'make install' will deposit the built files into all kinds of system locations you might not want for them to go. If you want to manually handle these files, you must compile with this flag.

What I realized afterword, is that you don't actually have to build php with the extension flag, you can just go into the extensions directory, find the one you want, and then just build the extension and put the shared object file into your installed php's extension directory and uncomment the line to include it in php.ini.

What my problem was at this point was coping with a missing dependency - libicu. The php extension intl is used for 'internationalization' - it provides unicode support for exotic languages and stuff like that. 'libicu' is some low level c library that it uses. My problem was that the version that I had was not the one php was looking for and the build failed every time.

What I ended up doing is going into the [chromebrew repository](https://dl.bintray.com/chromebrew/chromebrew/) where all the pre-compiled binaries for various processor types are kept and getting the version I needed. I was then able to just copy the library into my lib directory, retry the build and have it succeed.

In doing so, it's just really interesting to see how chromebrew is set up - basically the maintainers just run ./configure and make with all the popular libraries people are interested in, then upload the built files to bintray so we can just pull them down and use them on our chromebooks. It's just like how the big repos for ubuntu or redhat works, just on a smaller scale.

## And That's How The Website Was Set Up

So now that cakephp had its requirements, I was able to set up my website really quickly. What I wanted to do was just retire the 'ratpack' application I'd had running on my server and hosting my blog for several months and replace it with a cakephp app. It's not that 'ratpack' wasn't working well - it worked great actually, I just wanted to try something different and play around with php instead of java for a little bit.

This website's content is supported by sinatra app running in the background - it has a little sqlite database with all my content and a simple rest api. You can't hit it from the frontend - and it's really not necessary, especially since cakephp has it's own sqlite database and can easily be used to set up rest apis exactly like what sinatra is providing.

Sinatra is just cool - I'll probably do a write-up on if I manage to learn more about it - setting up a little api like that is incredibly simple.

In any case, I needed to set up my routes so they were derived by a get request to my sinatra app. I ended up doing a http request like this and iterating over the response, creating a route for each content item.

    $json = json_decode(file_get_contents('http://localhost:9292/contents'));

    foreach ($json as $obj) {
        $routes->connect('/' . $obj->url, ['controller' => 'Pages', 'action' => 'display', $obj->content_type, 'title' => $obj->title])
    }

It's pretty hard to decipher this unless you've read the cakephp documentation, but I get a bunch of objects from my api encoded in a json response, and there's a url, a content_type, and a title inside of each object. The Pages controller is the one that comes with cakephp out of the box - there's no need to create any other controllers for a simple blog like this.

The interesting piece is the last part of the array I send to the connect function - there is no 'title' field on the request object you get inside of your views - I could've named it anything - it gets created when you do that so I can retrieve my 'title' when I'm rendering my page. Which page template gets used is actually selected by the 'content_type' - that's just how the 'Pages' controller works in the default application.

Anyway, I get the property I set in the routes file from the template and build my page using the title to pull other properties, like where my markdown content is (the actual words that appear in the article) as well as some other things. Now I used curl here, I probably shouldn't have because cakephp has a http tool that would've been nicer.

	$myTitle = $this->request->params['title'];
	$postBody = array('title' => $myTitle);
	$postBody['title'];
	
	$req = curl_init();

	curl_setopt($req, CURLOPT_URL,'http://localhost:9292/contents');
	curl_setopt($req, CURLOPT_POST, 1);
	curl_setopt($req, CURLOPT_POSTFIELDS, $postBody);

	curl_setopt($req, CURLOPT_RETURNTRANSFER, true);

	$resp = curl_exec($req);

	curl_close($req);

	$json = json_decode($resp);
	// print_r($json);
    ?>
    </pre>

    <?=	$this->Html->image($json->title_img_path, ['alt' => 'image']); ?>
    <?=	$this->Markdown->toHtml(file_get_contents(substr($json->markdown_path, 1))); ?>

Curl is kind of annoying because I have to set off of these options, but the point is, I post the 'title' to my api and it gives me back the location on the file system of the image file and my markdown file to render the article.

In order to use the Markdown helper, I installed [this](https://github.com/cwbit/cakephp-markdown). Usage instructions are pretty clear in the readme, basically you add a snippet into your src/View/AppView.php file and you can then call that function in your templates.

## Summary

So that's what I did to get my new website set up! I'm pretty happy to be using cakephp because it was really easy to migrate all my content over to it by emulating the same thing I did in my java application using groovy. The idea of dynamically generated routes and templates that hold different contents and have different urls was very simple to implement, and I ended up leaving half of the styling from the default application.

If anyone else is considering using nginx and cakephp to set up a website like this, hopefully some of the notes in here can help you out. If you for some reason are trying to install cakephp on a _chromebook_, I'm confident that somebody will figure out how to make it easier so people don't have to go rooting around in their bintray repository to find the old version of libicu they need or php will just start building against the newer version.

In any case, that was my little website adventure. I hope it was fun to read about!
