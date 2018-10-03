# Docker And Kubernetes With Gitlab

Gitlab doesn't impose a lot of rules on how or if you take advantage of its features. Basically, if you add a '.gitlab-ci.yml' file to your repo and start using gitlab runners and stages, you might want to find out what else you can plug into gitlab. If you're like me, you'll see that there's integration with kubernetes and you'll want to see what it does.

For me, kubernetes represents some new concepts which were hard to learn, as well as some new approaches to dev-ops that I recognize a lot of value in. 

## What Is Kubernetes And Why Is It Needed?

Kubernetes is an open source 'container orchestration' tool that was cultivated by google. Using docker containers, it provides an api for controlling scenarios where you have distributed containers on multiple computers in a cluster. It's a system administration tool, but it's also useful for automating deployments in a 'rolling release' style. 

As you learn more about it, it becomes clear why it's being promoted as the backbone for the dev-ops side of gitlab. Using kubernetes makes it easy to dynamically increase your server's capabilities by invoking more instances of your app running in containers. The strategy is called 'horizontal scaling' and typically requires a team of specialists.

Using an orchestration tool like kubernetes makes it so deployment and environment management is a lot simpler.

There is a turn-key solution that gitlab and google are offering where you can get a free trial of 'google cloud platform' - which includes 'kubernetes engine'. This is probably a really easy way to see everything working, but I kind of like the idea of running everything on my own machine.

One of the fundamental ideas behind developing with containers is that your development environment and any stage of deployment is predictable because containers work the same no matter where they are - there's just less to have to think about. 

## Introduction to Docker

Docker is exciting for a lot of reasons, and one of the reasons it's huge right now is because it can give you a lot of new ideas, but allows you to use a lot of what you know already to leverage it.

The concept that someone who hasn't used docker before will come to understand is 'containers'. You might be trying to figure out how a container is different from a full on vm - functionally a container is a linux environment with the intricacies of the operating system abstracted away. Your app basically boils down to source-code, a configured storage mounting point, and its dependencies. It's like getting a brand new instance of the image every time it's instantiated, and a script, called a 'dockerfile' which essentially tells docker how to get your dependencies and bootstrap your app.

Docker gives you some interesting ways for containers to interact with each other by attaching 'services'. Isolating applications in containers can result in stripped down environments which are decoupled from one another. You can clearly see how the trend of microservices - small isolated apps that do one thing only - have become more common because of docker's availability. 

The best thing about docker is how smoothly adoption into someone's workflow can be. 

Docker is just like git in a lot of ways - you can sign up for a free account on 'docker hub', create a repository, and then immediately get to work building your application with a simple 'Dockerfile', then push an update to the repo each time you make changes to your sourcecode.

The strategy of coupling docker with your version control system and pulling the docker image into your containers makes forming a pipeline a little smoother. Automating all the activities for reproducing the docker image in different environments is simplified.

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

## The Dockerfile

Below is an example of a 'Dockerfile' which uses 'alpine', a lightweight debian images, installs nodejs, and copies the source code for a nodejs app, including the 'package.json' file which has everything necessary to download dependencies, run tests, and start the app.

    FROM alpine

    EXPOSE 3000
    RUN apk add nodejs nodejs-npm
    WORKDIR /src
    COPY . .

The idea here is that you don't actually build the app before creating the image, you do that in your gitlab build job - sure, that takes some time, but it keeps the image really tiny and it's automated anyway.

I actually changed my thinking about this as I went - you want your container to have an image that's your _complete_ running application. When you are deploying a nodejs application, you need to access the node_modules directory. The dockerfile below builds the node_modules directory in a data directory and adds it to the path. The node_modules directory actually doesn't need to be in the project root directory - it just needs to be in the path.

    FROM alpine
    
    EXPOSE 3000
    
    RUN apk add nodejs nodejs-npm
    COPY package.json /data/
    WORKDIR /data/
    RUN npm install
    ENV PATH /data/node_modules/.bin:$PATH
    
    COPY . /data/app/
    WORKDIR /data/app/
    
    CMD ["npm", "install"]
    CMD ["npm", "run", "start"]

That Dockerfile will build and run a nodejs web application - if you build and push this docker image in your pipeline, you can pull it in a different job and use whatever is in the node_modules folder, like I do with mocha in my example at the end of this article.

## Using Docker As Your Gitlab Executor

If you're using gitlab.com and create a new project and include a '.gitlab-ci.yml' file and run a pipeline, it will be run by a gitlab runner in the cloud somewhere using the docker executor to pull the default image and do whatever your yml file says to. Setting up a gitlab runner to _not_ use docker is therefore harder to do if you're on gitlab.com.

If you actually install gitlab community edition on your own linux system however, the opposite is true. You must download and install a gitlab-runner on the host machine and set it to automatically start on bootup. If you install docker on the same machine, you can select the docker executor and now the default build experience is essentially the same as it is on gitlab.com.

There isn't a standard way of doing this, but after some trial and error, I settled on having a build task using a docker executor specifically for checking out the sourcecode and doing a docker build and pushing it to dockerhub so it's available for the rest of the jobs in the pipeline. That part of the '.gitlab-ci.yml' looks like this. Obviously, I shouldn't have my password in there.

When you register the gitlab runner, choose 'docker' as the executor and change 'priviledged' to 'true' in the 'config.toml' file.

    variables:
        USER: 'myusername'
        REPO: 'reponame'
        PASSWORD: 'mypassword'
        IMAGE: $USER/$REPO
  
    build docker:
        tags: ['docker']
        stage: docker
        services:
            - docker:dind
        script:
            - docker login -u $USER -p $PASSWORD
            - docker build -t "${CI_BUILD_REF_NAME}_${CI_BUILD_REF}" .
            - docker tag "${CI_BUILD_REF_NAME}_${CI_BUILD_REF}" $IMAGE
            - docker push $IMAGE

What's kind of crazy is that you can actually pull a docker image that has docker _inside_ of it, and do the build there. According to the docker forums though, the better practice is to mount your running '/var/run/docker.sock' file as a volume in the container. Interacting with docker in that way causes containers to created _outside_ the container.  

Note: In order to avoid exposing the password, I ended up using the  [official docker credential helper](https://github.com/docker/docker-credential-helpers). In order to use that, I ended up using a gitlab 'shell executor' so it could pick up the docker credentials which aren't available inside the container. There's probably a clever way to expose the credential helper inside of a container so you can use the 'docker executor' instead which I haven't figured out yet.

At this point, you could stop reading and you could run a docker-based pipeline using gitlab and deploy by executing a 'docker pull' using a gitlab-runner on the production server. 

What kubernetes does in addition to this is manage lots of containers.

## Moving On To Kubernetes

On the same machine you're hosting gitlab and docker on, you can now install kubernetes. There's a variety of ways to set it up - some are definitely more 'cloud-centric' in that they're supposed to be for 'real' dev-ops, not just experimenting.

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
    
Note - if you want to execute commands in a namespace, the syntax is 'kubectl --namespace=mynamespace command' where the command is 'get pods', 'get deployments' or whatever.

If you started minikube only minutes ago, you'll see that some 'pods' still have a status of 'ContainerCreating', including minikube's dashboard.

Once the dashboard is available you can type 'minikube dashboard' and it will show you a control panel in the default browser.

## Kubenetes Concepts

If you type 'kubectl cluster-info', you'll be shown the ip and port that your cluster's control api is running on - basically, this is the piece that issues commands to 'minikube'. Note that address, it's required when connecting to gitlab later.

Now run 'minikube dashboard' - it will open up a control center in your default browser at the same ip address but a different port. Look over all of the different tables and charts here - if you've never used kubernetes it's sure to be pretty confusing, but it makes a good introduction to what makes up a kubernetes instance.

Take a look at this [kubectl cheat sheet](https://dzone.com/articles/kubectl-commands-cheat-sheet) for an overview of the commands people use.

- cluster

This is the entire collection of resources, everything listed below is contained inside the cluster.

- pods

A pod is a container with a running application in it. Pods have status - if they are offline, kubernetes will try to restart it. If a pod's image just runs and stops (like if it just runs a command and terminates), kubernetes will keep restarting it. Pods are meant to run continuously, or finish and delete themselves. A pod's lifecycle states can be defined so 'ready' can mean whatever you want.

- namespaces

Namespaces are used to sort related containers - it's practical to have a namespace called 'production' or other environments.

- nodes

Minikube is an example of a node - it's a kubernetes cluster that kubectl can dispatch commands to.

- volumes

Volumes is a mechanism for mounting shared storage that's used by containers. For example, if you wanted to expose the host machine's docker command line tool instance to a container, you could do so with this command in the Dockerfile - 'VOLUME /var/run/docker.sock'.

- roles

It's possible to restrict permissions available to specific namespaces - further below there's an example where the 'gitlab-managaged-apps' namespace's roll is elevated to 'admin'. 

- deployments

In order to add pods to the cluster, there must be a deployment. Deployments can be defined in json or yaml with many different options for how kubernetes should handle it. The pods that a deployment creates are part of the deployment, ie, if you delete a deployment, the pods it created are gone.

## Connecting Your Kubernetes Instance To Gitlab

We are going to use 'kubectl' to create a special namespace for gitlab and give it the permissions necessary to install software to the cluster, including a gitlab-runner.

Create a json file like the one below - if you wish to have a 'staging' and 'production' namespace, just copy the file and change the name fields.

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
    
It's common to give kubernetes instructions by loading json like this - the command you need to load it is 'kubectl create -f gitlab.json'. Remember this command - telling kubernetes to do something described in a json file with the 'kubectl create' or 'kubectl apply' commands is more flexible way of controlling kubernetes.

In any project that doesn't have ci set up already, you'll see a button that says 'add a kubernetes cluster' which you can click on, or just click on the 'operations' menu and select 'kubernetes'. There's a green button inviting you to 'add a kubernetes cluster'.

There are two options here, the first one being to 'create a cluster on GKE'. That stands for Google Kubernetes Engine, and it's one of the many services on Google Cloud. Since kubernetes is on our machine where gitlab is hosted, we want the other option, 'add existing cluster'.

Now from the minikube dashboard, select the 'gitlab-managed-apps' namespace and select 'secrets' from the menu on the left. You will need to copy the 'ca-cert' and 'token' from the dashboard into your gitlab kubernetes connection config. 

The gitlab kubernetes connection also requires namespace, which is gitlab-managed-apps, and the api url, which is what is displayed when you run 'kubectl cluster-info'.

## Optional - Install Helm And Install Gitlab Runner

Note - This is not the only way to use gitlab runners to interact with kubernetes - I decided to just use a 'shell executor' to run 'kubectl' commands _outside_ of the cluster. I'm kind of unsure why you'd want to have builds and tests run inside of a cluster, but that's what happens when you follow the instructions below.

In the kubernetes settings, you can allow for gitlab to install software into our cluster. ['Helm'](https://helm.sh) is a package manager for Kubernetes. You will need to elevate the permissions for the 'gitlab-managed-apps' namespace in order for it to work.

Now, this is kind of a hack - others noted in the [gitlab forums](https://gitlab.com/gitlab-org/gitlab-ce/issues/46969) that you probably shouldn't have to do this - but the command below will allow for you to install.

    kubectl create clusterrolebinding --user system:serviceaccount:gitlab-managed-apps:default default-gitlab-sa-admin --clusterrole cluster-admin

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
    
As you're running this, if you run 'minikube get pods --all-namespaces' again, you'll see helm, gitlab-runner, and a pod representing your build. If you pull up the minikube dashboard, you can select the 'gitlab-managed-apps' namespace, select 'pods', and select your build to see all of the environment variables associated with the job, and view the events and logs associated with it.

## Pulling It All Together - A Complete Pipeline

There is no _one_ way to use gitlab, and the same is true for kubernetes _or docker_ for that matter. I've seen a lot of information describing pipelines that are totally different from what I settled on.

The main thing that needs to happen to deploy an updated image to kubernetes is this.

    kubectl --namespace=production set image deployment/nodejs nodejs=username/reponame:mytag
    
What that does in kubernetes is continues to run the old pod as the new one comes online, and once the new pod's status is 'ready', the old one is terminated. If there were multiple pods in the 'staging' namespace, they'd each get replaced in the same way.

As for doing the initial deployment, there's a different command for that - it's a run command, which creates a deployment and creates the pod. I don't think deployment pipeline should be rolling out the initial deployment - it's pretty easy to do manually, but you could always just have a different script containing the 'kubectl run' commands needed for that scenario. 

Once you've done a deployment, you can export it into json or yaml with a command like the one below. If you want to, you can just run 'kubectl create -f staging.yml' instead of using the command.

    kubectl --namespace=staging get deployment nodejs -o yaml --export > staging.yml

You can't do kubectl commands from inside of the gitlab-runner pod, and it's unclear to me why you'd want for builds and tests to happen inside of your cluster anyway, so I just used a 'shell executor' to execute these commands for staging and production namespaces.

The whole thing works because the first step in the pipeline is for rebuilding the docker image and pushing it to dockerhub. The 'build' and 'test' jobs pull that updated image down and run 'npm install' and 'npm start test' scripts respectively.

Since it's long, I'll add the entire '.gitlab-ci.yml' file further down. Note that deploying to production is a manual job in the example, so it doesn't happen until you click on the play button in gitlab.

## Summary

These are my notes on getting kubernetes set up on the same machine that has gitlab installed - now I can connect any project to the same instance and run all of the builds in it. Not only does this make obtaining a virtual containerized environment trivial, it makes it so I could potentially switch over to using google cloud or any other kubernetes provider and horizontally scale my app's throughput without any changes.

The dev-ops features gitlabs are kind of catering towards tools like kubernetes and docker, and by working with them on a small scale you make the transition to being scaled up a lot smoother.

## .gitlab-ci.yml

The example below shows the use of variables to make it easy to use docker to build a nodejs project. Keep in mind that the 'build docker' job will fail if the docker command isn't authenticated. The operating system running that job has [docker credential helper](https://github.com/docker/docker-credential-helpers) installed, so authentication is automatic.

The project that this build script is for has three [gitlab runners](https://docs.gitlab.com/runner/install) registered - two of them are 'shell executors' - one for running 'docker' commands, and one for running 'kubectl' commands. The third runner is a 'docker executor' - the 'image' field in the job references the same repo that the 'build docker' job pushed to in the first stage.

Note that if the pods are being deployed for the first time, a deployment must be created with the 'kubectl run' command instead of the 'kubectl set' commands which create new pods with the updated docker image before terminating the ones running the old one.

Deployments can also be created from a yaml file which can be exported from kubernetes after doing a test deployment and running the command below.

    kubectl --namespace=production get deployment nodejs -o yaml --export > production.yml

Note the use of the 'tag' command in the 'build docker' job. Without a tag, you will always be using the default tag 'latest'. This is bad practice because you'll never know which version of 'latest' is running. The idea is that you would change the tag name for an important release, then you would more easily be able to observe that it's been replicated.

The last thing I wanted to point out is the use of 'when: manual' for the production deployment job. What that means is when you run the pipeline, it stops and waits for you to click on the 'deploy to production' button in gitlab before proceeding. The empty dependencies array on the following line is a workaround for a bug where manual deployment fails because of unmet dependencies unless you explicitly tell gitlab that there aren't any.

    variables:
        USER: 'dockerusername'
        REPO: 'reponame'
        IMAGE: $USER/$REPO
        TAG: $CI_BUILD_REF_NAME-$CI_BUILD_REF
        IMAGEID: '0.0.1'
        DEPLOYMENT: 'nodejs'
    
    stages:
        - docker
        - deploy to stage
        - test
        - deploy to prod
    
    build docker:
        tags: ['shell']
        stage: docker
        script:
            - docker build .
            - docker tag $IMAGEID $IMAGE:$TAG
            - docker push $IMAGE:$TAG
    
    deploy to stage:
        tags: ['kubectl']
        stage: deploy to stage
        script:
            - echo 'I deploy things to stage'
    # the 'run' command is for first time deployment, the 'set' is for all deployments following that
    #        - kubectl --namespace=staging run $DEPLOYMENT --image=$USER/$REPO:$TAG
    # alternatively, use kubectl create -f with the yml you exported from a deployment previously
    #       - kubectl --namespace=staging create -f staging.yml
            - kubectl --namespace=staging set image deployment/$DEPLOYMENT $DEPLOYMENT=$USER/$REPO:$TAG
        environment:
            name: staging
    
    test:
        tags: ['docker']
        image: $IMAGE:$TAG
        stage: test
        script:
            - npm run test
        environment:
            name: staging
    
    deploy to prod:
        tags: ['kubectl']
        stage: deploy to prod
        when: manual
        dependencies: []
        script:
            - echo 'I deploy things to production'
    # the 'run' command is for first time deployment, the 'set' is for all deployments following that
            - kubectl --namespace=production run $DEPLOYMENT --image=$USER/$REPO:$TAG
    #        - kubectl --namespace=production set image deployment/$DEPLOYMENT $DEPLOYMENT=$USER/$REPO:$TAG
        environment:
            name: production
