# Asset_Load_Controller #

JS component to control and manage issues in the inclusion/loading of the JS and CSS assets on a webpage.

Features abilities in JS to:
- system encouraging to structure, take control and design the user experience of the page load
- bind handler function to deal with situations in the loading of assets: "error", "too_slow", "timeout".
- bind custom callback event handlers to be executed upon the complete loading of assets

to handle or even solve problems like:
- any kind of error causing a js or css file not to be loaded
- too/very/suspiciously slow loading
- actual "timeout"
- rule out the chance that the user somehow failed to load some js file, when getting client-side errors like `ReferenceError: My_Entire_App is not defined` (like if a Firefox user presses esc during page-load).

For example, we might want to customize to:
- Take control of the loading proccess; when & how, what should be loaded. We might even want a splash-screen.
- Actually solve some random/network with a simple location.refresh.
- .. And there by letting the browser handle the issue, in case of the client actually turned offline.
- Engage with the user in problematic scenarios; for example we could ask the user to check his internet connection after x seconds.
- Refresh the page while avoiding the browser cache
- Register/log actual errors


## Index ##

- [__How to use__](#howtouse)
- [__Notice__](#notice)
- [__Settings__](#settings)
- - [__default_charset (string)__](#default_charsetstring)
- - [__consider_too_slow_after_seconds (int)__](#consider_too_slow_after_secondsint)
- - [__timeout_after_settings (int)__](#timeout_after_settings)
- - [__let_user_decide_to_wait_up_to_seconds (int)__](#let_user_decide_to_wait_up_to_seconds)
- [__Methods__](#methods)
- - [__load__](#load)
- - [__set_event_handler__](#set_event_handler)
- [__Events__](#events)
- - [__"too_slow" (event)__](#tooslow)
- - [__"timeout" (event)__](#timeout)
- - [__"error" (event)__](#error)
- [__Advanced__](#advanced)
- [__Browser Support__](#browsersupport)
- [__Sources__](#sources)



## How to use ##

This feature may be implemented by just including the js file
but now we're at it, __we might just as well go all the way__:
Place the source code itself in the head of your html document
so we don't end up having the same problems we're trying to solve using this.
Just __Copy the compiled script from 'script_built.js' and insert it within a `<script>` tag in your document head.__

 - Feel free to `npm install` and compile your customized 'script_built.js' with `npm run build` using [Babel](https://babeljs.io/) & [ESLint](https://eslint.org/).


__Init and load your files like this:__
```JS

var ASL = new Asset_Load_Controller({
	consider_too_slow_after_seconds: 0, // disabled
	timeout_after_seconds: 10, // we have some huge js libraries to load
})

ASL.load('my/js/script_built.js')

ASL.load('my/css/stylesheet.css')

```


These asset requests will per default be proccessed in the order you ASL.load() them, unless you configure it to be async or deferred.


__Ad-hoc inclusion in JS app__  ` `

The `load` method could also be used to load assets on-demand in larger JS applications.

// To-do: Solution to easily keep track of included assets to not include twice.



__To fully implement this component though__,
you should index and systemize required assets in, for example, a PHP system og in JS
to be passed as array to the load function as js array list of required filepaths
as strings or objects.

Initialize with settings and pass your list of assets to the 'load' function as in this example:

```JS

var ASL = new Asset_Load_Controller({
  consider_too_slow_after_seconds: 0, // disable
  timeout_after_seconds: 10,
  base_url: '/assets/'
})


var incl_assets = [ // could've been passed here from php using json_encode
  
  'plugins/bootstrap/bootstrap.css',

  'template/css/app.css',

  'plugins/jquery/jquery.js',
  'plugins/bootstrap/bootstrap.js',

  'template/js/template.js',
]


ASL.load( incl_assets )
```






## Notice ##

Loading assets like this, they are per default not async, but they will be async to the initial page load regardless of the "async" and "defer" properties - the rest of the document will continue to load without waiting for our assets to finish loading.

__Which is also why you must be acquainted with `window.addEventListener('load', () =>`__
to bind our events for when the page is done loading
as the usual `$(document).ready`" doesn't cover assets requested "on the fly" like this.
It's also possible to bind your event handler to the load completion using the callback ability of the load handler. 

You may see this as an oppertunity to customize the loading proccess and design the loading scene of the webpage :-)



## Settings ##


### default_charset (string) ###

Default 'charset'-attribute to be used.

Default value: 'UTF-8'


### consider_too_slow_after_seconds (int) ###

Number of seconds to wait before deeming the load to be too/suspiciously slow
and execute the event handler for scenario called "too_slow".

Default value: 5

Disabled if set to 0.


### timeout_after_seconds (int) ###

Number of seconds to wait before giving up and return error.

Default value: 30



### let_user_decide_to_wait_up_to_seconds (int) ###

In case we asked the user if he would like to refresh and try again or he'd rather try waiting
and the user choses the latter,
we'll only allow him to wait for this number of seconds (in total).

Default value: 60



### default_common_attributes (object) ###

Default attributes of all asset loads.
Overridden by attributes passed to [`load` (method)](#loadmethod) 2nd param
and individually overridable in asset object in (if) list passed to 1st param.



## Methods ##


### load (method) ###

Funct. 'load' immediately initiates loading of the given filepath or array of assets in

1. param: "asset_or_array_of_assets"


(It just appends an ordinary `<script src="..">` tag into the head).

You may add attributes as you would on the `<script>` and `<link>` element using:
	
2. param: "attributes_or_callback"

Possibly with a callback event to be executed upon successful loading of the specified asset(s):

3. param: "callback"

(Can also be passed as the 2nd param place if no attributes wanted)


__Example__

```JS

var Asset_Load_Controller_ins = new Asset_Load_Controller()

Asset_Load_Controller_ins.load('template/js/my_missing_js_functions.js')

Asset_Load_Controller_ins.load('template/js/app.js', {'defer': true}, ()=>{ (new App())->Init(); })
```



### set_event_handler (load) ###

Override the default event handler for one of the scenarios: "error", "too_slow" or "timeout".
The event handler function will be executed for each file triggering the event
 - The respective filepath will be passed as 1st argument to your function.

__Example:__
```JS

Asset_Load_Controller_ins.set_event_handler('error', (failed_file)=>{

	my_general_system_error_handler("Failed to load file: "+failed_file);
})
```




## Events ##


### "too_slow" ###

Executed if the load of an asset has neither succeeded nor failed after waiting for "consider_too_slow_after_seconds".
May be used to log
or maybe to notify the user that we haven't forgotten him.. :-)


### "timeout" ###

Executed if  the load of an asset has neither succeeded nor failed after waiting for 'timeout_after_seconds'.
This can be used to, for example:
- log the error,
- inform the user (e.g. ask him about the quality of his internet connection),
- or refresh the page to try again automatically or by the choice of the user.


### "error" ###

Executed if a request fails to load.

This can be used to, for example:
- log the error,
- inform the user (e.g. ask him about the quality of his internet connection),
- or refresh the page to try again automatically or by the choice of the user.





## Advanced ##

Each asset may have its own property: "charset", "defer", "async" (or other attribute) and a callback function.


__See following examples__


```JS

var incl_assets = [
	'script_A.js',
	['script_B.js'],
	['script_C.js', 'defer'],
	['script_D.js', 'defer', 'async'],
	['script_D.js', 'defer', 'async', {charset: 'ISO-8859-1'}],
	['script_E.js', 'async', ()=>alert('Done loading script_E.js')],
	{file: 'script_F.js', async: true, callback: ()=>alert('Done loading script_E.js')},
	{path: 'script_G.js', async: true, done: ()=>alert('Done loading script_E.js')}
	[script_H.js', ()=>alert('Done loading script_E.js')]
]

```


__And you may specify settings for the entire load batch:__

```JS

// With a callback event (for when all done):

ASL.load(incl_assets, ()=>{ $('body').show() })


// Special charset + with a callback event:

ASL.load(incl_assets, {charset: 'ISO-8859-1'}, ()=>{ $('body').show() })


// Deferred + different charset + callback event:

ASL.load(incl_assets, ['defer', {charset: 'ISO-8859-1'}], ()=>{ $('body').show() })

```





## Browser Support ##

As specified in package.json when compiled.



## Sources ##

- [https://www.w3.org/TR/2011/WD-html5-author-20110705/the-script-element.html](https://www.w3.org/TR/2011/WD-html5-author-20110705/the-script-element.html) (`<script>`-element)
- [https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script) (`<script>`-element)
- [https://www.w3.org/TR/2011/WD-html5-author-20110809/the-link-element.html](https://www.w3.org/TR/2011/WD-html5-author-20110809/the-link-element.html) (`<link>`-element)
- [https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event) (`window.onload` event)
- [https://eslint.org/docs/rules/](https://eslint.org/docs/rules/)

