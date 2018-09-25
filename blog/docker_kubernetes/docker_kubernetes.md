# Docker And Kubernetes With Gitlab

Gitlab doesn't require kubernetes or docker - but it does gently encourage the use of them as components to your build by reminding you that they exist with specialized settings and links to support documentation. Like the 'set up ci/cd' button that you'll see if you don't yet have a '.gitlab-ci.yml' file, there's another one for integrating with a kubernetes cluster. For someone just experimenting, it's definitely not required, but is quite interesting if you decide to take the plunge and set it up.

It's another component to the 'modern dev-ops' landscape that gitlab encouraging - which can be kind of mind bending!

## What Is Kubernetes And Why Is It Needed?

Kubernetes is an open source 'container orchestration' tool that was cultivated by google. Using containers - which docker can be used to create - it provides an api for controlling scenarios where you have distributed containers on multiple computers in a cluster. It's a system administration tool, but it's also useful for automating deployments in a 'rolling release' style. 

As you learn more about it, it becomes clear why it's being promoted as the backbone for the dev-ops side of gitlab. Using kubernetes makes it easy to dynamically increase your server's capabilities by invoking more instances of your app running in containers. The strategy is called 'horizontal scaling' and typically requires a team of specialists.

Using an orchestration tool like kubernetes makes it so deployment and environment management is a lot simpler.

There is a turn-key solution that gitlab and google are offering where you can get a free trial of 'google cloud platform' - which includes 'kubernetes engine'. This is probably a really easy way to see everything working, but I kind of like the idea of running everything on my own machine.

One of the fundamental ideas behind developing with containers is that your development environment and any stage of deployment is predictable because containers work the same no matter where they are - there's just less to have to think about. 

## Introduction to Docker

Docker is exciting for a lot of reasons, and one of the reasons it's huge right now is because it can give you a lot of new ideas, but allows you to use a lot of what you know already to leverage it.

The concept that someone who hasn't used docker before will come to understand is 'containers'. You might be trying to figure out how a container is different from a full on vm - functionally a container is a linux environment with the intricacies of the operating system abstracted away. Your app basically boils down to source-code, a configured storage mounting point, and its dependencies. It's like getting a brand new instance of the image every time it's instantiated, and a script, called a 'dockerfile' which essentially tells docker how to get your dependencies and bootstrap your app.

Docker gives you some interesting capabilities when containers work together that with a vm, you'd probably end up reconciling by just having various apps run on the same system. By isolating different applications in different containers though, you're potentially limiting their environment from including anything unnecessary, which saves resources, and you're decoupling all of the different parts.

The theme is comparable to the microsystem design strategy which favors managing things in smaller parts and steer away from monolithic applications that do everything.

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

## Docker On Linux

Installing docker on ubuntu is dirt simple, you just type 'sudo apt-get install docker.io' and you're ready to go. There's some stuff you should do to make it so you don't have to run docker as sudo.

    sudo groupadd docker
    sudo usermod -aG docker $USER
    
After running those commands and rebooting, you can run 'docker info' and see some meaningful output.

## Using Docker As Your Gitlab Executor

If you're using gitlab.com and create a new project and include a '.gitlab-ci.yml' file and run a pipeline, it will be run by a gitlab runner in the cloud somewhere using the docker executor to pull the default image and do whatever your yml file says to. Setting up a gitlab runner to _not_ use docker is therefore harder to do if you're on gitlab.com.

If you actually install gitlab community edition on your own linux system however, the opposite is true. You must download and install a gitlab-runner on the host machine and set it to automatically start on bootup. If you install docker on the same machine, you can select the docker executor and now the default build experience is essentially the same as it is on gitlab.com.

## Moving On To Kubernetes

On the same machine you're hosting gitlab and docker on, you can now install kubernetes. There's a variety of ways to set it up - some are definitely more 'cloud-centric' in that they're supposed to be for 'real' dev-ops, not just experimenting. They aren't free.

Basically there's two components involved in a basic kubernetes setup - the kubectl tool, which is the administrative api, and the actual kubernetes instance, which the kubectl tool connects to via an http socket. If you want to have kubernetes running on your physical machine for development or tinkering with, 'minikube' is a good solution. 

The installation instructions I followed on [kubernetes.io](https://kubernetes.io/docs/tasks/tools/install-minikube/) are pretty easy to follow, just make sure to have installed virtualbox on your linux box beforehand.

With both of those components installed, you should be able to type 'minikube start' and get the 'ok' signal, then when typing 'kubectl version', you should see meaningful data for both the 'client version' and 'server version'. 

Note - kubectl likes to run on port 8080, which gitlab is occupying. If you run 'kubectl version' and get a webpage back (dumped to the console in place of the server version info), you must change the /etc/gitlab/gitlab.rb configuration. Find the commented out line where the port that 'workhorse' is running on is defined, uncomment it and change 8080 to 8081. Do the same for 'unicorn'.
    
    gitlab_workhorse['auth_backend'] = "http://localhost:8081"
    ...
    unicorn['port'] = 8081
    
Run 'sudo gitlabctl reconfigure' and 'gitlabctl restart' to get the settings registered and now when checking the kubectl version the server's port should be clear.

With both 'kubectl' and 'minikube' installed, type 'kubectl get nodes' and you should see 'minikube ready'. Type 'minikube status' and you'll see that kubectl is connected to it.

For an overview of what's going on in your cluster, use the command below.

    kubectl get pods --all-namespaces

If you started minikube only minutes ago, you'll see that some 'pods' still have a status of 'ContainerCreating', including minikube's dashboard.

Once the dashboard is available you can type 'minikube dashboard' and it will show you a control panel in the default browser.

## Kubenetes Concepts

If you type 'kubectl cluster-info', you'll be shown the ip and port that your cluster's control api is running on - basically, this is the piece that issues commands to 'minikube'. Note that address, it's required when connecting to gitlab later.

Now run 'minikube dashboard' - it will open up a control center in your default browser at the same ip address but a different port. Look over all of the different tables and charts here - if you've never used kubernetes it's sure to be pretty confusing, but it makes a good introduction to what makes up a kubernetes instance.

This part of the write-up is a work in progress. It will go over what these components are.

- cluster
- namespaces
- nodes
- volumes
- roles
- deployments
- jobs
- replica sets

## Connecting Your Kubernetes Instance To Gitlab

We are going to use 'kubectl' to create a special namespace for gitlab and give it the permissions necessary to install software to the cluster, including a gitlab-runner.

Create a json file like the one below.

    {
        "kind": "Namespace",
        "apiVersion": "v1",
        "metadata": {
            "name": "gitlab-managed-apps",
            "labels": {
                "name": "gitlab"
            }
        }
    }

Now, this is kind of a hack, but after connecting to gitlab, in its current state, there will be a permissions error when you attempt to install software. This has been raised in some [gitlab forums](https://gitlab.com/gitlab-org/gitlab-ce/issues/46969), and that's where I found the command below which is a workaround for the issue.

    kubectl create clusterrolebinding --user system:serviceaccount:gitlab-managed-apps:default default-gitlab-sa-admin --clusterrole cluster-admin

In any project that doesn't have ci set up already, you'll see a button that says 'add a kubernetes cluster' which you can click on, or just click on the 'operations' menu and select 'kubernetes'. There's a green button inviting you to 'add a kubernetes cluster'.

There are two options here, the first one being to 'create a cluster on GKE'. That stands for Google Kubernetes Engine, and it's one of the many services on Google Cloud. Since kubernetes is on our machine where gitlab is hosted, we want the other option, 'add existing cluster'.

Now from the minikube dashboard, select the 'gitlab-managed-apps' namespace and select 'secrets' from the menu on the left. You will need to copy the 'ca-cert' and 'token' from the dashboard into your gitlab kubernetes connection config. 

The gitlab kubernetes connection also requires namespace, which is gitlab-managed-apps, and the api url, which is what is displayed when you run 'kubectl cluster-info'.

## Install Helm And Install Gitlab Runner

In the kubernetes settings, we need to now use our connection to allow for gitlab to install software into our cluster. ['Helm'](https://helm.sh) is a package manager for Kubernetes.

If you are actually connected to your cluster, and appropriate permissions are allowed using it, you should be able to successfully install 'helm'. Next, install 'gitlab-runner'. After having done that successfully, if you go to the 'ci/cd' settings and click on 'runners', you should see a new runner with the tags 'kubernetes' and 'cluster' on it.

If you go back to the minikube dashboard now and click on the 'gitlab-managed-apps' namespace, the events displayed there show the successful installation of helm and the gitlab runner, also note that if you select 'config maps' from the menu, there are configurations listed there for each of these.

In gitlab, to go the 'ci/cd' settings and verify that the new runner has been added there.

You can also type 'kubectl get pods --all-namespaces' again and you should see that under the 'gitlab-managed-apps' namespace, 'tiller' and 'gitlab-runner' are now online.

## Running A Pipeline On Kubernetes

Note: If you screw something up and need to start fresh, type 'minikuke delete' and 'minikube start' and you'll have a clean slate.

If you've managed to get that far, you can now create a hello world '.gitlab-ci.yml' file like the one below and it will run in a pipeline in your kubernetes cluster. Note that it's using the 'alpine' docker image, which is just really minimal and is less than 10mb.

    image: alpine

    cluster test:
        stage: test
        script: 
            - echo "this should be running on kubernetes"

When you click on the 'ci/cd' menu, you should see that the job was run and that kubernetes was used.

    Using Kubernetes namespace: gitlab-managed-apps
    Using Kubernetes executor with image alpine ...
    
## Summary

Modern dev-ops is partly about selecting the right tooling to minimize the work that goes into setting up different environments and automating deployment. It's true that in the past, a company would expect to take on specialists to achieve what kubernetes is doing automatically, and by using containers it enhances how much confidence you can have in how an app will function in various environments.

The dev-ops features gitlabs are kind of catering towards tools like kubernetes and docker, and by working with them on a small scale you make the transition to being scaled up a lot smoother. 