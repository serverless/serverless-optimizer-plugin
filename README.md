Serverless Plugin Boilerplate
=============================

This is a starter project to help you build plugins for the Serverless Framework.  You can install this boilerplate Plugin in its current form into your Serverless Projects and it will run.  All that's left for you to do is write your custom logic.  We've filled this with useful comments to help you along your way.  Also, the entire Serverless Framework is comprised of Plugins.  When you write your own Plugin, it's no hack, you're simply extending and customizing the Serverless Framework to suite your needs and build processes :)

**A Serverless Plugin can do the following:**

* Add a Custom Action to the Serverless Framework which can be called via the command line, programatically via a handler, or both.
* Add a Custom Action that overwrites a Core Action in the Serverless Framework.
* Add a Custom Hook that fires *before* or *after* a Core Action or a Custom Action.

One plugin can do all of the above, and include several Hooks and Actions at once.

###Get Started

* Plugins must be written in a Serverless Project, so create one specifically for authoring/testing plugins, or write your plugin in a Project you are working on.

* Make sure you are using Serverless `v0.0.11` or greater and create a new project via `serverless project create`.

* cd into your new project and you will see a `plugins` folder available.  cd into the `plugins` folder and then run:

 ```
 npm install serverless-plugin-boilerplate --save
 ```

* Once installed, open the 's-project.json' in your Project's root folder and add the plugin to the `plugins` property, like this:

```
"plugins": [
	{
		"path": "serverless-plugin-boilerplate"
	}
]
```

* Use the Serverless CLI within your project and run `serverless` to see the help screen.  You should now see an option entitled `custom` with a `run` Action.  This was added by the boilerplate plugin.

* To start working on your own plugin, copy the `serverless-plugin-boilerplate` folder in `yourproject/plugins/node_modules`, create this folder `yourproject/plugins/custom` and paste it in there.  The `custom` folder is the designated place to write your plugins.  Be sure to change the folder name to something other than `serverless-plugin-boilerplate`.

* Next, open the `s-project.json` in your Project's root folder, **remove the original boilerplate plugin** and replace it with the new name of your Plugin located in the `custom` folder, like this:

```
"plugins": [
	{
		"path": "your-custom-plugin"
	}
]
```

* You don't need to specify the `custom` folder, the Serverless Framework checks both the `node_modules` and `custom` folders for your plugin, just make sure you have a unique folder name.

* Now, your custom plugin is installed and ready to worked on!  Read the comments in the `index.js` for further instructions.


If you would like to learn more about plugins, please check out our [Documentation](http://docs.serverless.com).

Good luck! - [Serverless](http://www.serverless.com)


