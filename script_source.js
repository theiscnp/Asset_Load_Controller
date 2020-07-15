
class Asset_Load_Controller {

	constructor( init_settings = {}, load_now = null, cb = null ){

		// Pass your overriding settings when initialized
		// e.g.: window.ALC = new Asset_Load_Controller({ base_url: '/assets' })

		this.settings = {

			base_url: '/',
			default_charset: 'UTF-8',
			consider_too_slow_after_seconds: 5,
			timeout_after_seconds: 15,
			let_user_decide_to_wait_up_to_seconds: 30,
			default_common_attributes: {
				charset: 'UTF-8'
			}
		}


		for(let k in init_settings)
		{
			if(typeof this.settings[k] == 'undefined') console.warn('Asset_Load_Controller: Unknown setting given: "'+k+'" with value: "'+init_settings[k]+'"');

			this.settings[k] = init_settings[k]
		}


		// Use method 'set_event_handler' to override default event handlers
		// e.g.: ALC.set_event_handler('error', ()=> alert( 'Sorry about the inconvenience of this too long load duration..!' ) )

		this.on_event = {

			error: ( filepath )=>{ // when a file has failed to load

				console.error('Failed to load asset "'+filepath+'": Got actual error. We can not know the cause of the error; it could be a temporary network error at the user, but it might also be the server or that the file is actually missing or the path is wrong.');

				if(!this.has_given_error)
				{
					this.has_given_error = true
				
					alert(
						'Failed to load required resources.'
						+ 'Please refresh this webpage and hope for the best :-)'
					);
					
					// Using js universal funct. 'alert' though we could check ASL.status_by_path for the modal comp....
				}
			},

			too_slow: ( filepath )=>{ // when a file has failed to load for x seconds
				
				console.error('Issue loading asset "'+filepath+'": reached "too_slow" limit after '+this.settings.consider_too_slow_after_seconds+' seconds.');

				if(!this.has_given_too_slow_warning)
				{
					this.has_given_too_slow_warning = true
					
					alert("Yes, we're still working on loading the webpage for you... If the page doesn't load now within a few seconds, try to refresh the page, or maybe check your internet connection by going to another website. If you're easily able to load other websites, please give us a heads up at support"+window.location.host)
				}
			},

			timeout: ( filepath )=>{ // when a file-load reaches this.settings.timeout_after_seconds 

				console.error('Failed to load asset "'+filepath+'": Timed out after '+this.settings.timeout_after_seconds+' seconds.');

				if(!this.has_given_timeout_error)
				{
					this.has_given_timeout_error = true

					alert("Sorry - It seems that something went wrong in the internet connection. Please check your connection (e.g. go to google.com). If you can load other websites within a reasonable load-time, it's probably an issue with our server, and we'd appreciate a head-up at support@"+window.location.host)
				}
			}
		}



		this.status_by_path = {} // filepaths as keys, values of int 0 / 1 / 2 (loading / done / error)
		
		this.too_slow_timeout_handler_by_path = {}
		this.timeout_timeout_handler_by_path = {}


		if ( load_now != null )
		{
			this.load ( load_now,  typeof(cb)=='string' ? ()=>eval(cb) : cb );
		}
	}


	set_event_handler(event_type, handler_function){

		if(typeof this.on_event[event_type] == 'undefined') return console.error('Asset_Load_Controller funct. set_event_handler: Unknown event_type given: "'+event_type+'". The possible event types are: "'+Object.keys(this.on_event).join('", "')+'"');

		this.on_event[event_type] = handler_function
	}


	load( asset_or_array_of_assets, attributes_or_callback = undefined, callback = undefined ){

		let assets_to_load = []

		let assets_done_loading = []

		let on_done_loading_asset = (fp)=>{

			if(typeof fp == 'string')
			{
				assets_done_loading.push(fp)
			}

			if(assets_to_load.length == assets_done_loading.length)
			{
				assets_to_load = []

				if(typeof callback == 'function')
				{
					callback()
				}
			}
		}

		if(typeof asset_or_array_of_assets == 'object' && typeof asset_or_array_of_assets[0] != 'undefined')
		{
			assets_to_load = asset_or_array_of_assets
		}
		else if(typeof asset_or_array_of_assets == 'string'
			|| (
				typeof asset_or_array_of_assets == 'object'
				&& (
					typeof asset_or_array_of_assets[0] == 'string'
					|| typeof asset_or_array_of_assets['file'] == 'string'
					|| typeof asset_or_array_of_assets['path'] == 'string'
					|| typeof asset_or_array_of_assets['filepath'] == 'string'
				)
			)
		)
		{
			assets_to_load = [asset_or_array_of_assets]
		}
		else
		{
			console.error('Unexpected, malformed or empty 1st param "asset_or_array_of_assets" given to Asset_Load_Controller funct. load. (json encoded): '+JSON.stringify(asset_or_array_of_assets));
		}



		let common_attributes = Object.assign({}, this.settings.default_common_attributes)


		if(typeof attributes_or_callback == 'object' && attributes_or_callback != null)
		{
			for(let a in attributes_or_callback)
			{

				if(['cb','callback','done'].indexOf(a)>=0 || typeof attributes_or_callback[a] == 'function')
				{
					callback = attributes_or_callback[a]
				}
				else if(typeof attributes_or_callback[a] == 'object')
				{
					for(let a2 in attributes_or_callback[a])
						common_attributes[a2] = attributes_or_callback[a][a2]
				}
				else if(!isNaN(parseInt(a)))
				{
					common_attributes[attributes_or_callback[a]] = true
				}
				else
				{
					common_attributes[a] = attributes_or_callback[a]
				}
			}
		}
		else if(typeof attributes_or_callback == 'function')
		{
			callback = attributes_or_callback
		}



		let doc_frag = document.createDocumentFragment() // a virtual dom

		
		let invalid_asset_keys = []


		for(let atlk in assets_to_load)
		{
			let asset = assets_to_load[atlk]
			let filepath = typeof asset == 'string' ? asset : null
			let attributes = []
			let asset_callback

			if(typeof asset == 'object') // Parse asset object in a creative way made possible by the coincidence that the possible parameters is of different types (typeof)
			{
				if(asset == null)
				{
					invalid_asset_keys.push(atlk)
					continue
				}

				for(let ak in asset)
				{
					let prop = asset[ak]

					if ( typeof prop == 'string'
					    && prop.indexOf('.') > 1
					     && (
					         ak==0
					         || ['file','path','filepath','src'].indexOf(ak) >= 0
					         || ! filepath
					     )
					)
					{
						filepath = prop
					}
					else if(['cb','callback','done'].indexOf(ak)>=0 || typeof prop == 'function')
					{
						asset_callback = prop
					}
					else if(typeof prop == 'object')
					{
						for(let prop_object_key in prop)
						{
							common_attributes[prop_object_key] = prop[prop_object_key]
						}
					}
					else if(!isNaN(parseInt(ak)))
					{
						attributes[prop] = true
					}
					else
					{
						attributes[ak] = prop
					}
				}
			}


			if(typeof filepath != 'string' || !filepath)
			{
				console.error("Malformed or missing asset object: Please specify the filepath as first item, 'file', 'path' or 'filepath'. Given asset: "+JSON.stringify(asset));
				invalid_asset_keys.push(atlk)
				continue
			}


			let file_url = filepath

			// prepend this.settings.base_url if not canonical
			if(filepath.substring(0,5) != 'http:' && filepath.substring(0,6) != 'https:' && filepath.substring(0,2) != '//')
			{
				let bu = this.settings.base_url

				bu = bu.substring(bu.length-1)=='/' ? bu.substring(0,bu.length-1) : bu

				file_url = bu+'/'+(filepath.substring(0,1)=='/' ? filepath.substring(1) : filepath)
			}


			if(typeof this.status_by_path[filepath] != 'undefined')
			{
				console.warn('Asset_Load_Controller: Filepath already/earlier requested..! Path in question: "'+filepath+'". It will now be loaded again...')
			}



			this.status_by_path[filepath] = 0



			let file_ext = filepath.substring(filepath.lastIndexOf('.')+1)

			if(file_ext.indexOf('?')>=0) file_ext = file_ext.substring(0, file_ext.indexOf('?'))



			let elem = undefined


			if(file_ext == 'js')
			{
				elem = document.createElement('script')

				elem.type = 'text/javascript'
				elem.charset = this.settings.default_charset
				elem.async = false

				elem.src = file_url

				
			}
			else if(file_ext == 'css')
			{
				elem = document.createElement('link')

				elem.rel = 'stylesheet'
				elem.type = 'text/css'
				elem.charset = this.settings.default_charset

				elem.href = file_url
			}
			else
			{
				console.error('Asset_Load_Controller: Extension not supported: "'+file_ext+'" of filepath "'+filepath+'".')
				invalid_asset_keys.push(atlk)
				continue
			}



			// Apply common_attributes and then individual attributes if any 

			for(let k in common_attributes) elem[k] = common_attributes[k]

			if(typeof attributes == 'object' && attributes != null)
			{
				for(let k in attributes) elem[k] = attributes[k]
			}


			elem.class = (typeof elem.class == 'string' ? elem.class+' ':'') + 'appended-with-Asset_Load_Controller'


			elem.onload = (function(filepath,callback,asset_callback){

				clearTimeout(this.too_slow_timeout_handler_by_path[filepath])
				clearTimeout(this.timeout_timeout_handler_by_path[filepath])

				this.status_by_path[filepath] = 1

				if(typeof asset_callback == 'function') asset_callback()

				on_done_loading_asset(filepath)

			}).bind(this,filepath,callback,asset_callback)


			elem.onerror = (function(){

				clearTimeout(this.too_slow_timeout_handler_by_path[filepath])
				clearTimeout(this.timeout_timeout_handler_by_path[filepath])

				this.status_by_path[filepath] = 2

				this.on_event['error'](filepath);

			}).bind(this,filepath)


			doc_frag.appendChild(elem)


			if(this.settings.consider_too_slow_after_seconds>0)
			{
				this.too_slow_timeout_handler_by_path[filepath] = setTimeout((function(filepath){

					if(this.status_by_path[filepath]==0)
					{
						this.on_event['too_slow'](filepath);
					}

				}).bind(this,filepath), this.settings.consider_too_slow_after_seconds*1000)
			}

			if(this.settings.timeout_after_seconds>0)
			{
				this.timeout_timeout_handler_by_path[filepath] = setTimeout((function(filepath){

					if(this.status_by_path[filepath]==0)
					{
						this.on_event['timeout'](filepath);
					}

				}).bind(this,filepath), this.settings.timeout_after_seconds*1000)
			}
		}


		for(let atlk in invalid_asset_keys) assets_to_load.splice(atlk,1)


		if(typeof document.currentScript == 'object' && document.currentScript != null)
		{
			document.currentScript.parentNode.insertBefore(doc_frag, document.currentScript.nextSibling);
		}
		else
		{
			document.head.appendChild(doc_frag)
		}

		on_done_loading_asset()
	}

}
