# Docker: A Contained Environment

To anyone that doesn't understand what docker is - it's a way to use vms in a way that allows for rapid and trivial deployment where environments can be 'checked-out' with a command line api and an instance of your app can exist inside of it and the actual hardware supporting it becomes totally irreverent.

For developers, all of their dependencies can magically appear out of nowhere, and for sys-admins, docker allows for more intuitive distribution of systems for concurrent strategies. The reason docker is popular is not just because it makes things easy - it's because it enables different ways of thinking about an environment.

## How Is This Different From A VM

It's hard not to compare docker and vagrant - they each are command-line tools, and they each have ties to virtual-box (virtual-box is the legacy solution for virtualization on windows before hyper-v was adopted).

With vagrant, you squire virtual machine images from a repository, and install whatever you want and share this base image with others so everyone's machine is a copy. You could install docker inside of a vagrant instance if you wanted to.

Docker is different _conceptually_. Docker will have a vm running at all times, but what's shared are also called images - but the whole operating system is not in the image - just the pieces that make it unique. The image is combined with docker's vm, and when it's brought up using the command-line tool, the instance of it is called a 'container'. Multiple containers can be used at the same time or shared in an environment, but the idea is that an application can live in its own container.

Any system with docker installed can replicate the same conditions for an app very easily, and a different image can be exchanged without having to bootstrap things again. It's like having multiple disc drives that run vms instead of doing a cold boot.

## Docker On Windows

My first problem with understanding what docker was because the [docker community installer](https://store.docker.com/editions/community/docker-ce-desktop-windows) requires that 'hyper-v' be enabled, which I tried to enable on my production machine at work and then couldn't boot. It has something to do with our system administration, I ended up having to do some tricky shit to get my system back to normal.

At home, I couldn't install it because I've got windows 'home edition', which doesn't include hyper-v.

That doesn't actually mean you can't have docker though, it just means you have to use the [legacy solution](https://docs.docker.com/toolbox/toolbox_install_windows), which relies on virtual-box.

My issues didn't stop there, docker comes with a setup script that doesn't seem to work with modern git-bash. The script is supposed to set some environment variables which it won't work without.

If you have a similar issue where docker 'can't connect', you need to set these variables on your system.

    DOCKER_CERT_PATH=%USERPROFILE%\.docker\machine\machines\default
    DOCKER_HOST=tcp://192.168.99.100:2376
    DOCKER_MACHINE_NAME=default
    DOCKER_TLS_VERIFY=1

You should then be able to run 'docker info' and see some meaningful data - that's if your virtualbox image is running.

Docker toolbox comes with an interesting bootstrapping tool called 'kitematic', where you can select and create docker images visually.