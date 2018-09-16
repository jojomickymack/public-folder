# Gitlab Ci

To the layman, github and gitlab are difficult to tell apart. I've been using github for years and when first logging into my company's gitlab instance I could only describe it as being "just like github" to my coworkers. Ok, if it's just like github, than what's the point?

After a lot of trial and error finding out for myself what sets gitlab apart from github, I wanted to document what I learned. In this article, I'm going over the '.gitlab-ci.yml' file, gitlab runners, pages, and the docker image registry.  

## "Auto Dev-Ops"

The point of gitlab is 'auto dev-ops' - ok, what's that supposed to mean? Well, let's start with the auto part - you can put a little script in the root directory of your repo (the file is called 'gitlab-ci.yml') and it will execute every time there's any push to any branch of your repo. You can define stages of a build, run shell commands, tests, whatever you want, as a routine to build your app somewhere.

Certain directives can plug into features of the gitlab interface, giving you a report on the build and deploy changes to production under certain conditions.

'Dev-ops' is a little bit of a confusing term because it describes a culture - similar to 'agile', it consists of some traits and methodologies, but the actual workflow tends to be defined by the team involved. I take it to mean 'the part of development that isn't the actual development'. Provisioning an environment and installing/configuring various supporting tools, monitoring what is going on in the environment, keeping it secure and detecting/resolving problems.

That's a lot of people's job description - but with the emphasis on automation and some of the new technologies that exist now, the work to take advantage of modern dev ops practices is easier. Gitlab brings those technologies together in a way that enables small projects and prototypes to be built from the ground up with cutting edge dev-ops practices.

## The '.gitlab-ci.yml' File

If you create a gitlab project, if you don't have a '.gitlab-ci.yml' file already, there will be a button you can click on that says 'set up CI/CD'. What they're referring to is 'continuous integration/continuous delivery'.

The 'integration' and 'delivery' parts refer to different 'pipeline' steps. Your repo probably contains one component of an application - for example if you're building a website that connects to a database, you may be doing development with the database disconnected. When you deploy it, you might want to test how it behaves with a test database connected. That's what an 'integration' step is. 'Delivery' refers to the production deployment. Clicking on the button doesn't imply that you have to have any of these stages set up, the terms are just conventions.

Git, the command line tool, is a big part of the idea of 'continuous' concept - before git, versioning was handled in a completely different way - basically, all of the new features would be put on a list, and when they were all ready, there would be a new build and they'd call it a certain version number. If some features were still being worked on, it would hold up the entire release. That's referred to as 'waterfall' methodology, whereas 'agile' implies that there are more frequent, smaller releases, that way nothing gets held up. Git is the perfect tool for managing that kind of versioning.

The idea is that small changes can constantly be coming in and getting pushed through the pipeline and delivered to production.

## The Most Basic CI Script

In any case, when you click that 'set up CI/CD' button, you'll be given a blank 'gitlab-ci.yml' file. There is a dropdown you can use to select from a bunch of example yml files with various type of build scripts, but what it boils down to is that you name a stage and list commands. Make sure to use spaces instead of tabs - gitlab doesn't like tabs.

    my job:
        script:
             - echo "this is my script"
             
If you save that, then click on the 'ci/cd' tab and select 'pipelines', you'll see that it's tried to run your script. If you are using gitlab.com, it will pull a docker image and execute your script there - but there's a lot of ways you can configure where this echo command will actually be run. Any environment, as long as there is a 'gitlab runner' installed there registered to your project could check out your repo and run the script. I'll talk about some of those options later.

## Pipelines, Stages, And Jobs

From the 'pipelines' view, it displays a list of all the recently run pipelines, and if you click on the status it shows a diagram of all the 'jobs' in the pipeline - ours only had one, called 'my_job'. If you click on the status of 'my_job', you get to see the terminal output of the command, starting with 'running with gitlab-runner...'.

Let's add another job, one that runs a command that screws up.

    my job 1:
        script:
             - echo "this is my script"
             
    my job 2:
        script:
             - I don't like shots, they're owie 
             
If you've got your repo cloned, you should just change the file in a text editor on your local machine. Save the change, add it and commit it, then push. Since we're just screwing around, you should probably have master checked out and push directly to master. Whenever any branch gets pushed it'll run the pipeline again.

Now you see the pipeline failed, and within that two jobs listed - the first one paseed and last one failed. This illustrates the most basic example of how the output of these jobs can be displayed to you.

Now let's try 3 jobs, each with a different stage. Any value for a 'stage' directive that isn't 'build', 'test', or 'deploy' is invalid.

        my job 1:
            stage: build
            script:
                 - echo "this is my script"

        my job 2:
            stage: test
            script:
                 - I don't like shots, they're owie

        my job 3:
            stage: deploy
            script:
                 - echo "back to being good"

Now in your pipeline view you get to see 3 stages - there's one job in each stage and the test stage failed - the deploy stage wasn't even run. If any stage fails, it'll skip the rest.

So you can see now the basics of what the yml file is for. In reality, the shell commands run in the build stage would be for installing dependencies and maybe compiling your javascript and less files if you're building a website, running a test suite or executing a shell script that clones other repos and configures the environment.

This is typical of what you see in other repos on gitlab.com - it's pre-configured to use docker to pull images that you've registered to your project, or any other docker images available on docker hub. You might want to use docker, or maybe just download a gitlab runner to your local machine and register it to your project. I'll go over what those are next.

## Gitlab Runners

You can minimize the environment set up and dependency management if you just set up one environment and install a gitlab runner there. Gitlab runners are just executables that you download to your system which will become active processes when one gets triggered by your project. You could have a pool of runners on the same system, or you could have ones distributed in various environments - they can be configured in different ways that you can control from the gitlab account.

The first step is to download a gitlab runner binary to your system [from here](https://docs.gitlab.com/runner/install/).

You basically put it somewhere it can remain (not your downloads folder) and change the name to 'gitlab-runner.exe' (if you're on windows) and use the terminal to navigate to wherever it is and run

    ./gitlab-runner install
    ./gitlab-runner register
    
You'll be prompted with some questions - it asks for the gitlab domain (gitlab.yourdomain.com if you've installed gitlab yourself), and a token code from your project. It tells you what these are supposed to be if you click on 'settings' -> 'CI/CD' -> 'runners' in your project and look under 'set up a specific runner'. The token for your project is also shown under 'general pipeline' under 'runner token'.

Put nothing in for tags and enter 'shell' for the executor setting. Whatever you put in here gets saved to the 'config.toml' and running the register command again will overwrite it.

Enter the command below and your running will then standby waiting for jobs.

    ./gitlab-runner run

You may wonder what 'tags' are, and what it's talking about when it asks for you to choose an 'executor'.

## Tags

Warning - tags in git have a certain meaning - every commit in a repo's history has a 'tag', a guid representing a version. This use of the term 'tag' has nothing to do with that.

If you were running a lot of projects and had different runners on different systems for them, you might want to designate types of projects and specify runners that only run their pipelines. That's what tags are for. Certain jobs can be given tags - if it's not given as a list of strings as shown below, there will be an error parsing the yml file.

        my job 1:
            tags: ['ruby', 'test']

Once runners are registered to your project, they're shown in the settings under 'CI/CD' -> 'runners', and their tags are shown in blue.

If a runner has a tag that doesn't match what's in your job's 'tags array', you'll be given a message that says that the job is stuck because there aren't any runners available that can run your pipeline.

## Executors

Many people set up virtual environments where they set up their runners - the executor is associated with the type of environment. Docker and kubernetes are popular choices, so there are special executors specifically for those. If you're installing on a physical windows or linux machine, choosing 'shell' will work.

## Having Your Runner Run Your Pipeline

Now that you've registered your runner, when accessing 'settings'->'CI/CD'->'runners', it'll be shown under 'runners activated for this project'. Let's change our job and push another change to the repo to activate it.

        my job 1:
            stage: build
            script:
                 - echo %computername%
                 
Click on 'disable shared runners' in the 'runners' settings to make it so only your runner is eligible to run your pipeline. 

When running the pipeline now, you should see your own computer's name shown in the terminal output. That variable only works in windows, try hostname on linux.

## Pages

Github has a feature where if you create a repo that's named 'username.github.io' and it contains static html content, you'll be able to navigate to 'https://username.github.io' on the internet and your content is hosted there. It's a great way to have a little website that is associated with your open-source projects on github.

Gitlab has a similar thing where each of your projects can have it's own 'pages', and if you click on 'settings' -> 'pages', if you've created a '.gitlab-ci.yml' file, you'll see that it's already set up a domain for you at 'https://username.gitlab.io/projectname'. It's a little different from how the github hosting works, because it's set up to serve static html out of a directory which you can have in a folder called 'public' in your project.

If you commit the public folder with some html in it, you'll see that at the domain shown in the 'pages' settings, but what many of the [pages examples](https://gitlab.com/pages) are set up to do is use a static html site generation tool like 'jekyll' or 'lektor' to be built _into a public direcotry_ using the '.gitlab-ci.yml' script. In other words, you're not building the site on your local machine and committing all the static html, you are generating it in the build process in gitlab and the public directory is generated at that stage.

It's pretty fun to create projects and try out some of these static site generators and build them in gitlab by copying parts of the '.gitlab-ci.yml' files.

Here is a good example for a website with a static site generator called 'middleman', which is a ruby gem. In this project is a Gemfile that includes the 'middleman' gem and some other dependencies. Nodejs has to be installed, which is why the apt-get commands are in the build script.

Basically, the default docker container that gets pulled if you don't specifiy one already has ruby - that's actually because the '.gitlab-ci.yml' file is some kind of ruby dsl to begin with. The 'artifacts' directive shown here means that some data is getting uploaded to gitlab.

    pages:
        stage: build
        script:
            - apt-get update -yqqq
            - apt-get install -y nodejs
            - bundle install --path vendor
            - bundle exec middleman build
        artifacts:
            paths:
                - public

That's all that's necessary to assemble all of the generated html into the 'public' directory and upload it to gitlab so it can be hosted there. This process will be repeated every time anything is pushed.

Since this was an experiment and I didn't care about branching, I only planned on pushing to master for this - typically there would be a line that says 'only: master' to only upload the html if the pipeline is being run on the master branch.

## Docker Registry

In the example above, consider if you had more configuration than you wanted to do in a build script. What if you needed something besides ruby installed, and you didn't want to install it using apt-get every time the pipeline was run.

I set up a different pages website that required the 'go' programming language and a special command line app called [hugo](https://gohugo.io). Rather than get all that installed in my script, I put in a directive to pull a docker image that had all of that already. It goes at the very top of the '.gitlab-ci.yml' file.

    image: registry.gitlab.com/pages/hugo:latest
    
That's the docker image that's registered to the ['pages' example for a hugo website](https://gitlab.com/pages/hugo/container_registry). Any gitlab project can have a special docker containers associated with it like that, or you could just pull any of the docker images available in the [docker hub](https://hub.docker.com/explore/).

## Artifacts

The 'artifacts' directive was used in the '.gitlab-ci.yml' files that build 'pages' in gitlab - you can actually upload whatever files you want to gitlab inside of a pipeline.

    text file:
        script:
            - mkdir reports
            - echo 'hello this is my text' >> reports/output.txt
        artifacts:
            paths:
                - reports/output.txt

There's a variety of reasons someone might want to do that - maybe there's an log where errors might be recorded somewhere that could be uploaded to gitlab immediately after a failure. Any artifacts will be downloadable from the 'pipeline' and 'jobs' views.

## Testing

One specific use case for artifacts that I found are test results. Typically, if you run test suites using the '.gitlab-ci.yml' file, and a test fails, you're going to want to look at the terminal output to view the assertion that failed and what it was comparing, but gitlab has some other nice features for junit xml formatted test results.

If I run a suite of tests using rspec, I can upload them to gitlab every time the pipeline gets run like so.

    test1:
        script:
            - bundle install
            - rspec spec/spec001.rb
            - rspec spec/spec001.rb --format RspecJunitFormatter --out reports/rspec.xml
        artifacts:
            when: always
            reports:
                junit: reports/rspec.xml
                
You might expect that this will make it so you get to see what tests were in the spec in the 'pipeline' or 'jobs' views, but that's not the case - you're supposed to look at the terminal output if tests fail in a pipeline. Many times, the pipeline will be running when a branch is pushed, that's not really cause for alarm, you can fix them later.

Where it _does_ show the individual tests that failed from the 'rspec.xml' file is if there is a merge request to master. This is when the tests start to mean more.

When a merge request is submitted, the pipeline is run on the master branch _and_ on the branch that's to be merged and they are _compared_. If the branch to be merged has failing tests, the passing and failing tests in the spec are shown and when you click on them, exactly what was being asserted is shown.

It's a really nice way to prominently show what needs to be fixed before a branch can be merged into the master branch.

## Summary

So that's what I learned about Gitlab as I was tooling around with it. The platform is a great place to learn a simple way be introduced to all of the tenants of modern 'dev-ops' culture and allow yourself to be indoctrinated into it.

Gitlab must have had to strive to keep things simple, and the way the pipelines, the gitlab runners, and the docker registry all fits together is really appealing.

Most other development pipelines resemble the things I've gone over here, but they tend to be _really_ complicated. If gitlab has achieved one thing here, it's bringing dev-ops to a new audience that will be able to take it for granted without a lot of work. That's really admirable!