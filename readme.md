# Asset_Load_Controller #

Simple JS component to control and manage issues in the inclusion/loading of the JS and CSS assets on any webpage.
Primarily to fill the gap there is, in case  error handling by the browser in the case of failure to include the css og js that

features abilities in JS to:
- bind customized event handlers to the loading of assets: "error", "too_slow", "timeout".
- bind custom "callback" event handlers to be executed upon the complete loading of assets

to handle or even solve problems like:
- any kind of error causing a js or css file not to be loaded
- too/very/suspiciously slow requests (slow/bad connection?)
- actual "timeout" for asset request (if not handle by the browser)
- rule out the chance that the user somehow failed to load some js file, when getting client error like `ReferenceError: My_Entire_App is not defined` (like if a Firefox user presses esc during loading).

For example, we might want to customize to:
- Take control of the loading proccess; when & how, what should be loaded (we might even want a splash-screen)
- Actually solve some random/network with a single location.refresh.
- Let the browser handle the issue, in the case or client actually turned offline.
- Involve the user in specific scenarios, for example if we need the user to check his internet connection.
- Refresh the page while avoiding the browser cache
- Register/log actual errors



## How to use ##

This feature, should not be included, but the source code itself shall be placed in the head of the html document, so we don't end up having the same problem we're trying to solve using this.

__Copy the built script from 'script_built.js' and insert it within a `<script>` tag in your document head.__


 - 'script_built.js' is built using `npm install && npm run build`


__And then init and load your files like this:__
```JS

var asset_load_controller_ins = new Asset_Load_Controller({
	consider_too_slow_after_seconds: 0, // disabled
	timeout_after_seconds: 10, // we have some huge js libraries to load
})

asset_load_controller_ins.load('my/js/script_built.js')

asset_load_controller_ins.load('my/css/stylesheet.css')

```


__To fully implement this component though__, we're going to have to index/"datafy" all our `<script>` and `<link>`, js and css inclusion, into instead being a js array/object, or php array passed to js, of the files there is to be included on the current page.

Pass an array of assets to the 'load' function as in this example:

```JS

var asset_load_controller_ins = new Asset_Load_Controller({
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


asset_load_controller_ins.load(incl_assets, ()=>{

	$('body').show()
})
```

__Notice__ that though the file fill begin loading immediately, it will be async with the initial page load, regardless of the "async" and "defer" properties - so the rest of the document will continue to get loaded without waiting for our assets to finish loading. Explains the `$('body').show()` in the that example..

You may see this as an oppertunity to customize the loading proccess and design the loading scene of the webpage!

__Which is also why you must be acquainted with:__ `window.addEventListener('load', () =>`
to bind our events for when the page is done loading
as the usual `$(document).ready`" doesn't cover assets requested "on the fly" like this.






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



### let_user_decide_to_wait_up_to_seconds ###

In case we asked the user if he would like to refresh and try again or he'd rather try waiting
and the user choses the latter,
we'll only allow him to wait for this number of seconds (in total).

Default value: 60




## Methods ##


### load ###

Funct. 'load' will immediately initiate loading of the given filepath or array of assets in

1. param: "asset_or_array_of_assets"


(It just appends the ordinary `<script src="..">` tag into the head).

You may add attributes to this appended element (or if none, the callback event) using:
	
2. param: "attributes_or_callback"


Possibly with a callback event to be executed upon successful loading of the specified asset(s):

3. param: "callback"


__E.g.:__

```JS

var Asset_Load_Controller_ins = new Asset_Load_Controller()

Asset_Load_Controller_ins.load('template/js/my_missing_js_functions.js')

Asset_Load_Controller_ins.load('template/js/app.js', {'defer': true}, ()=>{ (new App())->Init(); })
```



### set_event_handler ###

Overwrite the default event handler for one of the scenarios: "error", "too_slow" or "timeout".

__E.g.:__
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

asset_load_controller_ins.load(incl_assets, ()=>{ $('body').show() })


// Special charset + with a callback event:

asset_load_controller_ins.load(incl_assets, {charset: 'ISO-8859-1'}, ()=>{ $('body').show() })


// Deferred + different charset + callback event:

asset_load_controller_ins.load(incl_assets, ['defer', {charset: 'ISO-8859-1'}], ()=>{ $('body').show() })

```





## Browser Support ##

As specified in Babel compiler settings in package.json.

- Use of localStorage though (e.g. for if we want to remember that we've tried to reload the page)
isn't supported until IE 8. See [https://caniuse.com/#search=localstorage](https://caniuse.com/#search=localstorage).



## Sources ##

- [https://www.w3.org/TR/2011/WD-html5-author-20110705/the-script-element.html](https://www.w3.org/TR/2011/WD-html5-author-20110705/the-script-element.html)
- [https://www.w3.org/TR/2011/WD-html5-author-20110809/the-link-element.html](https://www.w3.org/TR/2011/WD-html5-author-20110809/the-link-element.html)
- [https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event]https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event()

