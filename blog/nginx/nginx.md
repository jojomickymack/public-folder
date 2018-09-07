# Nginx - Millions Served

This will be a short entry - maybe it'll grow as I add more notes pertaining to nginx.

I've tried in vein to articulate to others what the difference between apache and nginx is - to the end user - there shouldn't be any difference at all besides the self identifying 'server' header.

But for people who set up servers, there's a huge difference, and it's not just semantics. If you were to reduce a nginx.conf file to its bare minimum, it would be as follows - this conf file is perfectly capable of serving static html.

    worker_processes        1;

    events {
        worker_connections  1024;
    }

    http {
        include             mime.types;
        default_type        application/octet-stream;
        sendfile            on;
        keepalive_timeout   65;

        server {
            listen          80;
            server_name     localhost;

            root            C:/projects/webstuff/webthing001;
            index           index.html index.htm;

            try_files       $uri $uri/  /$uri.html;
        }
    }

Just that minimalism alone makes a powerful statement about what nginx provides. 

One convention that you'll sometimes see is that the config file includes other config files, like 'sites_enabled' etc. Including these is not required, you can handle everything in the single file if you prefer it that way.

## Enabing Php

You have to add 'index.php' to the index field with the other extensions.

	index  index.php index.html index.htm;

Location routes can be used to segregate chunks of your website to different applications easily. The '/' is the top level route, and in order for php to work, index.php needs to be listed in the top level try_files field.

	location / {
	    try_files $uri $uri/ /index.php$args;
	}
	
You have to include a block for 'location ~ \.php$' as well, that's described below.

## Getting Nginx And Php Working On Windows

Here's where you can download [nginx for windows](https://nginx.org/en/docs/windows.html). The windows php download mentioned earlier includes a 'php-cgi.exe' binary, which can be run with an argument to set the port it will listen on as shown below.

	php-cgi.exe -b 127.0.0.1:9191

The challenging part is setting up nginx and php-cgi as a windows service. For apache, this is simple - the httpd.exe binary is already set up to work with the windows service requirements, so installing it is simple with the command below.

	httpd.exe -k install -n "apache"

You'll then be able to start and stop it with commands like these (net and sc are native windows command line tools for managing services).

	net start apache
	sc config apache start=disabled
	sc delete apache

If you try to install nginx.exe with the -k flag, it won't work. Fortunately the solution for getting nginx and php-cgi is made really simple with this tool, the [non sucking service manager](https://nssm.cc). Basically, you download this and put the binary in your system path, and you can set up a new service with just a 'nssm install nginx', and a window will pop up where you set the location of the nginx executable. For php, it's exactly the same but you put the command line argument '-b 127.0.0.1:9191' in the arguments field.

After doing that, you can manage the services as normal with the net and sc tools as shown previously.

You'll just need to add the index type for index.php and add the php locatation setting in your nginx.conf as noted before. I got this snippit directly from the [nginx instructions](https://www.nginx.com/resources/wiki/start/topics/examples/phpfastcgionwindows/).

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9191;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }

You can reload the nginx config using 'net stop' and 'net start' - that's pretty much all there is to it.

If you're trying to set nginx and php up on linux the fastcgi_pass may be a little different, you might need to point it at the actual .sock file in the /tmp directory. I went over that in the 'building php on a chromebook' article.

## Routing Requests To Other Applications

It's really simple to proxy requests to applications listening on other ports. Basically, you define an 'upstream' variable. If there was a ruby app listening on port 3000, you'd want to have this in your config. You can have as many of these as you want.

    upstream ruby_app {
        server 127.0.0.1:3000;
    }

    upstream python_app {
        server 127.0.0.1:4000;
    }

And to pass the requests off to these ports, you could delegate specific routes to them. Any request to 'your_website.com/ruby' would be passed to port 3000, as well as requests to 'ruby/somepage' and so on.

	location /ruby {
	    proxy_pass http://ruby_app;
	}

	location /python {
	    proxy_pass http://python_app;
	}

Obviously your ruby and python apps need to be set up to have /ruby or /python in all the route strings.

This isn't the only way to pass off requests to other applications, but it certainly is the easiest to set up.

## Summary

Maybe at some point I'll research what the performance benefits of nginx are, but I've already decided it's a tool I like just based on how nice the config files are and how easy it's been to find the answers to my questions about getting it set up. Hopefully seeing some of these snippets might inspire you to give nginx a shot if you haven't already - most people agree that it's a little easier to cope with than apache.
