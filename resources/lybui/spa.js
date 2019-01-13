/**
 * Created by tianxinlong on 2016-08-02-0002. v1.0
 */
;(function(jQuery, JSON) {
	lyb.namespaces = {};
	
	//单页面技术实现
	lyb.SPA = {
		components: {},
		history: [],
		serialize: function(object){
			var array = [];
			for(var key in params){
				array.push(key + '=' + params[key]);
			}
			return array.join('&');
		},
		unloadPage: function(id){
			var component = lyb.SPA.components[id];
			if(component){
				var el = component.el;
				var spaEls = jQuery('.spa-module', el).toArray();
				for(var i=0,len=spaEls.length;i<len;i++){
					var spaEl = spaEls[i];
					var sid = spaEl.id;
					var comp = lyb.SPA.components[sid];
					lyb.SPA.removeModules(comp);
					delete lyb.SPA.components[sid];
				}
			}
		},
		loadPage: function(id, url, params, callback, parent){
			var component = lyb.SPA.components[id];
			lyb.SPA.removeModules(component);
			
			var xhr = new XMLHttpRequest();
			  xhr.timeout = 30000;
			  xhr.responseType = "text";
			  xhr.open('GET', url);
			  xhr.onload = function(e) { 
			    if(this.status == 200||this.status == 304){
			        var result = lyb.SPA.namespaceTemplate(url, this.responseText, params, parent);
					result = lyb.SPA.dealWithResponseText(id, result);
					component.el.html(result);
					lyb.SPA.initSPAModules(id, component.el);
					callback && callback.call(component.el);
			    }
			  };
			  xhr.ontimeout = function(e) {
				  
			  };
			  xhr.onerror = function(e) {
				  
			  };
			  
			  xhr.send();
		},
		_defineNamespace: function(url, parent){
			url = url.replace(ctx, '');
			url = url.replace(/(^\.\.\/)|(\.\w+$)/, '');
			var path = url.split('?')[0].replace(/\.\w+$/i, '');
			var path = path.replace(/\-/g, '_');//替换掉中杠,防止路径不认
			var paths = path.split('/');
			
			var object = lyb.namespaces;
			for(var i=0;i<paths.length;i++){
				var _path = paths[i];
				if(!object[_path]){
					object[_path] = {};
				}
				object = object[_path];
			}
			
			var _package = paths.join('.');
			object.basePath = 'lyb.namespaces.' + _package;
			parent && (object.parent = parent);
			return _package;
		},
		namespaceTemplate: function(url, text, params, parent){
			var namespace = lyb.SPA._defineNamespace(url, parent);
			
			text = lyb.SPA._transformUrlParams(namespace, url, text);
			text = lyb.SPA._replacePageValue(text, params);
			
			var matchers = text.match(/\#\w+\#/ig);
			if(matchers){
				for(var i=0;i<matchers.length;i++){
					var matcher = matchers[i];
					var field = matcher.replace(/\#/g, '');
					text = text.replace(new RegExp(matcher, 'g'), 'lyb.namespaces.' + namespace + '.' + field);
				}
			}
			text = text.replace(/lyb\.define\(/g, 'lyb.define(\'' + namespace + '\', ');
			return text;
		},
		_transformUrlParams: function(namespace, url, text){
			var params = {};
			var parameter = url.split('?')[1];
			if(parameter){
				var kvs = parameter.split('&');
				for(var i=0,len=kvs.length;i<len;i++){
					var kv = kvs[i];
					var map = kv.split('=');
					params[map[0]] = map[1];
				}
				text = this._replacePageValue(text, {param: params});
			}
			return text;
		},
		_replacePageValue: function(text, params){
			if(jQuery.isEmptyObject(params)){
				return text;
			}
			var matchers = text.match(/\$\{\w+\.*\w+\}/ig);
			if(matchers){
				for(var i=0;i<matchers.length;i++){
					var matcher = matchers[i];
					var field = matcher.replace(/\$|\{|\}/g, '');
					
					var _field = field.replace(/\./g, '\\.');//正则表达式使用的
					
					var path = field.split('.');
					var data = params;
					for(var j=0,len=path.length;j<len;j++){
						var key = path[j];
						data = data[key];
						if(data === undefined){
							break;
						}
					}
					if(data !== undefined){
						data = data == 'null' ? '' : data;
						text = text.replace(new RegExp('\\$\\{' + _field + '\\}', 'gm'), data);
					}
				}
			}
			return text;
		},
		dealWithResponseText: function(id, text){
			var matchers = text.match(/lyb\.parse\(.*\)/g);
			if(matchers){
				for(var i=0;i<matchers.length;i++){
					var matcher = matchers[i], replacer = '';
					if(matcher === 'lyb.parse()'){
						replacer = matcher.replace(/\(\)/, '(undefined, \'' + id + '\')');
					}else{
						replacer = matcher.replace(/\)/, ', \'' + id + '\')');
					}
					text = text.replace(/lyb\.parse\(.*\)/, replacer);
				}
				return text;
			}else{
				return text;
			}
		},
		initSPAModules: function(id, scope){
			var _components = {el: scope, modules: []};
			var els = jQuery('div[class*="lyb-"]', scope);
			els.each(function(i, cel){
				var id = cel.id;
				_components['modules'].push(id);
			});
			lyb.SPA.components[id] = _components;
		},
		removeModules: function(component){
			var modules = component.modules;
			for(var i=0,len=modules.length;i<len;i++){
				var key = modules[i];
				if(lyb.components[key]){
					delete lyb.components[key];
				}
			}
			component.modules = [];
		},
		_init: function(ids){
			if(jQuery.type(ids) == 'string'){
				ids = [ids];
			}
			lyb.SPA._parse(ids);
		},
		_parse: function(ids){
			var selector = '#' + ids.join(',#');
			selector = selector.replace(/\$/g, '\\$');
			selector = selector.replace(/\./g, '\\.');
			var jels = jQuery(selector).toArray();
			for(var i=0,len=jels.length;i<len;i++){
				var el = jels[i];
				var jEl = jQuery(el);
				jEl.addClass('spa-module');
				var jid = el.id;
				lyb.SPA.initSPAModules(jid, jEl);
			}
		}
	};
	
	lyb.initSPA = function(ids){
		lyb.SPA._init(ids);
		return {
			go: function(id, url, params, callback, parent){
				if(jQuery.type(params) == 'function'){
					callback = params;
					params = {};
				}
				lyb.SPA.unloadPage(id);
				lyb.SPA.loadPage(id, url, params, callback, parent);
			}
		}
	};
	
	lyb.define = function(namespace, callback){
		var flag = true;//兼容旧写法
		if(namespace && jQuery.type(namespace) == 'function'){
			var _namespace = callback;
			callback = namespace;
			namespace = _namespace;
			flag = false;
		}
		var space;
		if(flag){
			space = eval('lyb.namespaces.' + namespace);
		}else{//兼容旧写法
			space = eval('window.' + namespace);
		}
		callback.call(space, space);
	};
})(jQuery, JSON);