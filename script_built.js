function _typeof(obj){"@babel/helpers - typeof";if(typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"){_typeof=function _typeof(obj){return typeof obj}}else{_typeof=function _typeof(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj}}return _typeof(obj)}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}function _defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if("value"in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}function _createClass(Constructor,protoProps,staticProps){if(protoProps)_defineProperties(Constructor.prototype,protoProps);if(staticProps)_defineProperties(Constructor,staticProps);return Constructor}var Asset_Load_Controller=function(){function Asset_Load_Controller(){var _this=this;var init_settings=arguments.length>0&&arguments[0]!==undefined?arguments[0]:{};var load_now=arguments.length>1&&arguments[1]!==undefined?arguments[1]:null;var cb=arguments.length>2&&arguments[2]!==undefined?arguments[2]:null;_classCallCheck(this,Asset_Load_Controller);this.settings={base_url:"/",default_charset:"UTF-8",consider_too_slow_after_seconds:5,timeout_after_seconds:15,let_user_decide_to_wait_up_to_seconds:30,default_common_attributes:{charset:"UTF-8"}};for(var k in init_settings){if(typeof this.settings[k]=="undefined")console.warn("Asset_Load_Controller: Unknown setting given: \""+k+"\" with value: \""+init_settings[k]+"\"");this.settings[k]=init_settings[k]}this.on_event={"error":function error(filepath){console.error("Failed to load asset \""+filepath+"\": Got actual error. We can not know the cause of the error; it could be a temporary network error at the user, but it might also be the server or that the file is actually missing or the path is wrong.");if(!_this.has_given_error){_this.has_given_error=true;alert("Failed to load required resources."+"Please refresh this webpage and hope for the best :-)")}},"too_slow":function too_slow(filepath){console.error("Issue loading asset \""+filepath+"\": reached \"too_slow\" limit after "+_this.settings.consider_too_slow_after_seconds+" seconds.");if(!_this.has_given_too_slow_warning){_this.has_given_too_slow_warning=true;alert("Yes, we're still working on loading the webpage for you... If the page doesn't load now within a few seconds, try to refresh the page, or maybe check your internet connection by going to another website. If you're easily able to load other websites, please give us a heads up at support"+window.location.host)}},"timeout":function timeout(filepath){console.error("Failed to load asset \""+filepath+"\": Timed out after "+_this.settings.timeout_after_seconds+" seconds.");if(!_this.has_given_timeout_error){_this.has_given_timeout_error=true;alert("Sorry - It seems that something went wrong in the internet connection. Please check your connection (e.g. go to google.com). If you can load other websites within a reasonable load-time, it's probably an issue with our server, and we'd appreciate a head-up at support@"+window.location.host)}}};this.status_by_path={};this.too_slow_timeout_handler_by_path={};this.timeout_timeout_handler_by_path={};if(load_now!=null){this.load(load_now,typeof cb=="string"?function(){return eval(cb)}:cb)}}_createClass(Asset_Load_Controller,[{key:"set_event_handler",value:function set_event_handler(event_type,handler_function){if(typeof this.on_event[event_type]=="undefined")return console.error("Asset_Load_Controller funct. set_event_handler: Unknown event_type given: \""+event_type+"\". The possible event types are: \""+Object.keys(this.on_event).join("\", \"")+"\"");this.on_event[event_type]=handler_function}},{key:"load",value:function load(asset_or_array_of_assets){var _this2=this;var attributes_or_callback=arguments.length>1&&arguments[1]!==undefined?arguments[1]:undefined;var callback=arguments.length>2&&arguments[2]!==undefined?arguments[2]:undefined;var assets_to_load=[];var assets_done_loading=[];var on_done_loading_asset=function on_done_loading_asset(fp){if(typeof fp=="string"){assets_done_loading.push(fp)}if(assets_to_load.length==assets_done_loading.length){assets_to_load=[];if(typeof callback=="function"){callback()}}};if(_typeof(asset_or_array_of_assets)=="object"&&typeof asset_or_array_of_assets[0]!="undefined"){assets_to_load=asset_or_array_of_assets}else if(typeof asset_or_array_of_assets=="string"||_typeof(asset_or_array_of_assets)=="object"&&(typeof asset_or_array_of_assets[0]=="string"||typeof asset_or_array_of_assets["file"]=="string"||typeof asset_or_array_of_assets["path"]=="string"||typeof asset_or_array_of_assets["filepath"]=="string")){assets_to_load=[asset_or_array_of_assets]}else{console.error("Unexpected, malformed or empty 1st param \"asset_or_array_of_assets\" given to Asset_Load_Controller funct. load. (json encoded): "+JSON.stringify(asset_or_array_of_assets))}var common_attributes=Object.assign({},this.settings.default_common_attributes);if(_typeof(attributes_or_callback)=="object"&&attributes_or_callback!=null){for(var a in attributes_or_callback){if(["cb","callback","done"].indexOf(a)>=0||typeof attributes_or_callback[a]=="function"){callback=attributes_or_callback[a]}else if(_typeof(attributes_or_callback[a])=="object"){for(var a2 in attributes_or_callback[a]){common_attributes[a2]=attributes_or_callback[a][a2]}}else if(!isNaN(parseInt(a))){common_attributes[attributes_or_callback[a]]=true}else{common_attributes[a]=attributes_or_callback[a]}}}else if(typeof attributes_or_callback=="function"){callback=attributes_or_callback}var doc_frag=document.createDocumentFragment();var invalid_asset_keys=[];var _loop=function _loop(atlk){var asset=assets_to_load[atlk];var filepath=typeof asset=="string"?asset:null;var attributes=[];var asset_callback=void 0;if(_typeof(asset)=="object"){if(asset==null){invalid_asset_keys.push(atlk);return"continue"}for(var ak in asset){var prop=asset[ak];if(typeof prop=="string"&&prop.indexOf(".")>1&&(ak==0||["file","path","filepath","src"].indexOf(ak)>=0||!filepath)){filepath=prop}else if(["cb","callback","done"].indexOf(ak)>=0||typeof prop=="function"){asset_callback=prop}else if(_typeof(prop)=="object"){for(var prop_object_key in prop){common_attributes[prop_object_key]=prop[prop_object_key]}}else if(!isNaN(parseInt(ak))){attributes[prop]=true}else{attributes[ak]=prop}}}if(typeof filepath!="string"||!filepath){console.error("Malformed or missing asset object: Please specify the filepath as first item, 'file', 'path' or 'filepath'. Given asset: "+JSON.stringify(asset));invalid_asset_keys.push(atlk);return"continue"}var file_url=filepath;if(filepath.substring(0,5)!="http:"&&filepath.substring(0,6)!="https:"&&filepath.substring(0,2)!="//"){var bu=_this2.settings.base_url;bu=bu.substring(bu.length-1)=="/"?bu.substring(0,bu.length-1):bu;file_url=bu+"/"+(filepath.substring(0,1)=="/"?filepath.substring(1):filepath)}if(typeof _this2.status_by_path[filepath]!="undefined"){console.warn("Asset_Load_Controller: Filepath already/earlier requested..! Path in question: \""+filepath+"\". It will now be loaded again...")}_this2.status_by_path[filepath]=0;var file_ext=filepath.substring(filepath.lastIndexOf(".")+1);if(file_ext.indexOf("?")>=0)file_ext=file_ext.substring(0,file_ext.indexOf("?"));var elem=undefined;if(file_ext=="js"){elem=document.createElement("script");elem.type="text/javascript";elem.charset=_this2.settings.default_charset;elem.async=false;elem.src=file_url}else if(file_ext=="css"){elem=document.createElement("link");elem.rel="stylesheet";elem.type="text/css";elem.charset=_this2.settings.default_charset;elem.href=file_url}else{console.error("Asset_Load_Controller: Extension not supported: \""+file_ext+"\" of filepath \""+filepath+"\".");invalid_asset_keys.push(atlk);return"continue"}for(var k in common_attributes){elem[k]=common_attributes[k]}if(_typeof(attributes)=="object"&&attributes!=null){for(var _k in attributes){elem[_k]=attributes[_k]}}elem["class"]=(typeof elem["class"]=="string"?elem["class"]+" ":"")+"appended-with-Asset_Load_Controller";elem.onload=function(filepath,callback,asset_callback){clearTimeout(this.too_slow_timeout_handler_by_path[filepath]);clearTimeout(this.timeout_timeout_handler_by_path[filepath]);this.status_by_path[filepath]=1;if(typeof asset_callback=="function")asset_callback();on_done_loading_asset(filepath)}.bind(_this2,filepath,callback,asset_callback);elem.onerror=function(){clearTimeout(this.too_slow_timeout_handler_by_path[filepath]);clearTimeout(this.timeout_timeout_handler_by_path[filepath]);this.status_by_path[filepath]=2;this.on_event["error"](filepath)}.bind(_this2,filepath);doc_frag.appendChild(elem);if(_this2.settings.consider_too_slow_after_seconds>0){_this2.too_slow_timeout_handler_by_path[filepath]=setTimeout(function(filepath){if(this.status_by_path[filepath]==0){this.on_event["too_slow"](filepath)}}.bind(_this2,filepath),_this2.settings.consider_too_slow_after_seconds*1000)}if(_this2.settings.timeout_after_seconds>0){_this2.timeout_timeout_handler_by_path[filepath]=setTimeout(function(filepath){if(this.status_by_path[filepath]==0){this.on_event["timeout"](filepath)}}.bind(_this2,filepath),_this2.settings.timeout_after_seconds*1000)}};for(var atlk in assets_to_load){var _ret=_loop(atlk);if(_ret==="continue")continue}for(var _atlk in invalid_asset_keys){assets_to_load.splice(_atlk,1)}if(_typeof(document.currentScript)=="object"&&document.currentScript!=null){document.currentScript.parentNode.insertBefore(doc_frag,document.currentScript.nextSibling)}else{document.head.appendChild(doc_frag)}on_done_loading_asset()}}]);return Asset_Load_Controller}();
