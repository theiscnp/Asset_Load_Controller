
class Asset_Load_Controller {

  constructor(init_settings = {}){

    this.settings = {

      base_url: '/',
      default_charset: 'UTF-8',
      consider_too_slow_after_seconds: 5,
      timeout_after_seconds: 30,
      let_user_decide_to_wait_up_to_seconds: 60,
    }

    for(var k in init_settings)
    {
      if(typeof this.settings[k] == 'undefined') console.error('Asset_Load_Controller: Unknown setting given: "'+k+'" with value: "'+init_settings[k]+'"');

      this.settings[k] = init_settings[k]
    }


    this.status_by_path = {}
    
    this.too_slow_timeout_handler_by_path = {}
    this.timeout_timeout_handler_by_path = {}

    this.state = {
      has_given_too_slow_warning: false,
      has_given_timeout_error: false,
      has_given_error: false
    }

    this.on_event = {

      'error': ( filepath )=>{

        console.error('Failed to load asset "'+filepath+'": Got actual error. We can not know the cause of the error; it could be a temporary network error at the user, but it might also be the server or that the file is actually missing or the path is wrong.');

        if(!this.state.has_given_error)
        {
          this.state.has_given_error = true
        
          alert('Failed to load required resources. Please refresh this webpage and hope for the best :-)');
        }
      },

      'too_slow': ( filepath )=>{
        
        console.error('Issue loading asset "'+filepath+'": reached "too_slow" limit after '+this.settings.consider_too_slow_after_seconds+' seconds.');

        if(!this.state.has_given_too_slow_warning)
        {
          this.state.has_given_too_slow_warning = true
          
          alert("Yes, we're still working on loading the webpage for you... If the page doesn't load now within a few seconds, try to refresh the page, or maybe check your internet connection by going to another website. If you're easily able to load other websites, please give us a heads up at support"+window.location.host)
        }
      },

      'timeout': ( filepath )=>{

        console.error('Failed to load asset "'+filepath+'": Timed out after '+this.settings.timeout_after_seconds+' seconds.');

        if(!this.state.has_given_timeout_error)
        {
          this.state.has_given_timeout_error = true

          alert("Sorry - It seems that something went wrong with your internet connection to our server. Please check your connection (e.g. go to google.com). If you can load other websites with a reasonable load-time, it's probably an issue with our server, and we'd appreciate a head-up at support@"+window.location.host)
        }
      }
    }
  }


  set_event_handler(event_type, handler_function){

    if(typeof this.on_event[event_type] == 'undefined') return console.error('Asset_Load_Controller funct. set_event_handler: Unknown event_type given: "'+event_type+'". The possible event types are: "'+Object.keys(this.on_event).join('", "')+'"');

    this.on_event[event_type] = handler_function
  }


  load( asset_or_array_of_assets, callback_on_loading_complete = undefined ){

    var assets_to_load = []

    var assets_done_loading = []

    var on_done_loading_asset = (fp)=>{
      assets_done_loading.push(fp)

      if(typeof callback_on_loading_complete == 'function'
          && assets_to_load.length == assets_done_loading.length
      )
        callback_on_loading_complete()
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
      console.error('Unexpected, misformatted or empty 1st param "asset_or_array_of_assets" given to Asset_Load_Controller funct. load. (json encoded): '+JSON.stringify(asset_or_array_of_assets));
    }


    var doc_frag = document.createDocumentFragment()


    for(var atlk in assets_to_load)
    {
      let asset = assets_to_load[atlk], filepath = asset, attributes = []

      if(typeof asset == 'object')
      {
        if(asset == null) return true

        for(var ak in asset)
        {
          if([0,'file','path','filepath'].indexOf(ak)>=0)
          {
            filepath = asset[ak]
          }
          else if(typeof ak == 'number')
          {
            attributes[asset[ak]] = true
          }
          else
          {
            attributes[ak] = asset[ak]
          }
        }
      }

      if(typeof filepath != 'string' && !filepath)
      {
        console.error("Misformatted or missing asset object: Please specify the filepath as first item, 'file', 'path' or 'filepath'.");
        return false
      }


      if(filepath.substr(0,5) != 'http:' && filepath.substr(0,6) != 'https:' && filepath.substr(0,2) != '//')
      {
        let bu = this.settings.base_url
        bu = bu.substring(bu.length-1)=='/' ? bu.substring(0,bu.length-1) : bu

        filepath = bu+'/'+(filepath.substring(0,1)=='/' ? filepath.substring(1) : filepath)
      }


      if(typeof this.status_by_path[filepath] != 'undefined') console.warn('Asset_Load_Controller: Filepath already requested..! Path in question: "'+filepath+'". It will now be loaded again..')

      this.status_by_path[filepath] = 0


      var _f_type = filepath.substring(filepath.lastIndexOf('.')+1)
      var elem = undefined

      if(_f_type.substring(0,2) == 'js')
      {
        elem = document.createElement('script')

        elem.type = 'text/javascript'
        elem.charset = this.settings.default_charset
        elem.async = false

        elem.src = filepath
      }
      else if(_f_type.substring(0,3) == 'css')
      {
        elem = document.createElement('link')

        elem.rel = 'stylesheet'
        elem.type = 'text/css'
        elem.charset = this.settings.default_charset

        elem.href = filepath
      }
      else
        return console.error('Asset_Load_Controller: Couldn\'t recognize extension of filepath: "'+filepath+'".')


      if(typeof attributes == 'object' && attributes != null)
      {
        for(var k in attributes) elem[k] = attributes[k]
      }


      elem.class = (typeof elem.class == 'string' ? elem.class+' ':'') + 'appended-with-Asset_Load_Controller'


      elem.onload = (function(filepath,callback_on_loading_complete){

        clearTimeout(this.too_slow_timeout_handler_by_path[filepath])
        clearTimeout(this.timeout_timeout_handler_by_path[filepath])

        this.status_by_path[filepath] = 1

        on_done_loading_asset(filepath)

      }).bind(this,filepath,callback_on_loading_complete)


      elem.onerror = (function(e){

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

    document.head.appendChild(doc_frag)
  }

}

/* http://github.com/theiscnp/Asset_Load_Controller */
