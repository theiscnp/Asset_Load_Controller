# Asset_Load_Controller #

[https://github.com/theiscnp/Asset_Load_Controller](https://github.com/theiscnp/Asset_Load_Controller)

Simple JS feature to control the inclusion/loading of the JS and CSS assets to a webpage,
 - and thereby being able to handle (in some clever manner), log, and then rule out such issues when debugging JS errors like `ReferenceError: My_Entire_App is not defined`.

Scenarios we'd like to handle:
- any kind of error resulting in the file not being loaded correctly
- too/very/suspiciously slow requests
- timed-out requests

In these scenarios it would be nice to be able to, for example:
- involve the user in the current issue he's experiencing, like
- notify him that we haven't forgotten him if we're loading many resources and he has a slow connection
- and if we deem the latency has reached some limit, infom the user about the issue and ask him if he'd like to
- refresh the page and try again
- or give us a head-up to our support@email.com

The default event handlers takes good care of these scenarios.
But of cause it is easy to apply own handler functions for each scenario.




## Getting started ##

This feature, should not be included, but the source code itself shall be placed in the head of the html document, so we don't end up having the same problem we're trying to solve using this.

__Copy the built script from 'script_built.js' and insert it within a `<script>` tag in your document head.__


 - 'script_built.js' is built using `npm install && npm run build`


__And then init and load your files like this:__
```js

var asset_load_controller_ins = new Asset_Load_Controller({
	consider_too_slow_after_seconds: 0, // disabled
	timeout_after_seconds: 15, // we have some huge js libraries to load
})

asset_load_controller_ins.load('my/js/script_built.js')

asset_load_controller_ins.load('my/css/stylesheet.css')

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

Funct. 'load' will immediately initiate loading of the given
- 1st param: "filepath"

(It just appends the ordinary `<script src="..">` tag into the head).

You may add attributes to this appended element using:
- 2nd param: "attributes"

Possibly with a callback event to be executed upon successful loading of this specific asset:
- 3rd param: "callback_on_success"


__E.g.:__
```js

var Asset_Load_Controller_ins = new Asset_Load_Controller()

Asset_Load_Controller_ins.load('template/js/my_missing_js_functions.js')

Asset_Load_Controller_ins.load('template/js/app.js', {'defer': true}, ()=>{ (new App())->Init(); })
```



### set_event_handler ###

Overwrite the default event handler for one of the scenarios: "error", "too_slow" or "timeout".

__E.g.:__
```js

Asset_Load_Controller_ins.set_event_handler('error', (failed_file)=>{

	my_general_system_error_handler("Failed to load file: "+failed_file);
})

```



## Sources ##

- [https://www.w3.org/TR/2011/WD-html5-author-20110705/the-script-element.html](https://www.w3.org/TR/2011/WD-html5-author-20110705/the-script-element.html)


