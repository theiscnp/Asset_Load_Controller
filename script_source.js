
class Asset_Load_Controller {

  constructor(init_settings = {}){

    this.settings = {

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
    }

    this.on_event = {

      'error': ( filepath )=>{

        alert('Failed to load required resources. Please refresh this webpage and hope for the best :-)');
      },

      'too_slow': ( filepath )=>{

        alert("Yes, we're still working on loading the webpage for you... If the page doesn't load now within a few seconds, try to refresh the page, or maybe check your internet connection by going to another website. If you're easily able to load other websites, please give us a heads up at support"+window.location.host)
      },

      'timeout': ( filepath )=>{

        alert("Sorry - It seems that something went wrong with the internet connection (from your browser to our server).. Please check your connection (e.g. go to google.com). If you can load other websites with a reasonable load-time, it's probably an issue with our server. Please e-mail us at support@"+window.location.host)
      }
    }
  }


  set_event_handler(event_type, handler_function){

    if(typeof this.on_event[event_type] == 'undefined') return console.error('Asset_Load_Controller funct. set_event_handler: Unknown event_type given: "'+event_type+'". The possible event types are: "'+Object.keys(this.on_event).join('", "')+'"');

    this.on_event[event_type] = handler_function
  }


  load( filepath, attributes = {}, callback_on_success = undefined ){

    if(typeof filepath != 'string') return console.error('Asset_Load_Controller funct. load: expects a (string) filepath as 1st param. Given: "'+filepath+'" ("'+typeof filepath+'")')

    if(typeof this.status_by_path[filepath] != 'undefined') console.warn('Asset_Load_Controller: Filepath already requested..! Path in question: "'+filepath+'". It will now be loaded again..')


    this.status_by_path[filepath] = 0


    var _f_type = filepath.substring(filepath.lastIndexOf('.')+1)
    var elem = undefined

    if(_f_type.substring(0,2) == 'js')
    {
      elem = document.createElement('script')

      elem.type = 'text/javascript'
      elem.charset = this.settings.default_charset

      elem.src = filepath
    }
    else if(_f_type.substring(0,3) == 'css')
    {
      elem = document.createElement( 'link' )

      elem.rel = 'stylesheet'
      elem.type = 'text/css'
      elem.charset = this.settings.default_charset

      elem.href = filepath
    }
    else
      return console.error('Asset_Load_Controller: Couldn\'t recognize extension of filepath: "'+filepath+'".')


    elem.class = 'appended-with-Asset_Load_Controller'


    elem.onload = (function(filepath,callback_on_success){

      clearTimeout(this.too_slow_timeout_handler_by_path[filepath])

      this.status_by_path[filepath] = 1

      if(typeof callback_on_success == 'function') callback_on_success()

    }).bind(this,filepath,callback_on_success)


    elem.onerror = (function(e){

      clearTimeout(this.too_slow_timeout_handler_by_path[filepath])
      clearTimeout(this.timeout_timeout_handler_by_path[filepath])

      this.status_by_path[filepath] = 2

      this.on_event['error'](filepath);

    }).bind(this,filepath)


    if(typeof attributes == 'object' && attributes != null)
    {
      for(var k in attributes) elem[k] = attributes[k]
    }


    document.head.appendChild(elem)


    if(this.settings.consider_too_slow_after_seconds>0)
    {
      this.too_slow_timeout_handler_by_path[filepath] = setTimeout((function(filepath){

        if(this.status_by_path[filepath]==0 && !this.state.has_given_too_slow_warning)
        {
          this.state.has_given_too_slow_warning = true

          this.on_event['too_slow'](filepath);
        }

      }).bind(this,filepath), this.settings.consider_too_slow_after_seconds*1000)
    }

    if(this.settings.timeout_after_seconds>0)
    {
      this.timeout_timeout_handler_by_path[filepath] = setTimeout((function(filepath){

        if(this.status_by_path[filepath]==0 && !this.state.has_given_timeout_error)
        {
          this.state.has_given_timeout_error = true

          this.on_event['timeout'](filepath);
        }

      }).bind(this,filepath), this.settings.timeout_after_seconds*1000)
    }
  
  }

}

/* http://github.com/theiscnp/Asset_Load_Controller */
