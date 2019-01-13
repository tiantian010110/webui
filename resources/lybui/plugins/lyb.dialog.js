/**
 * Created by Administrator on 2016/8/24 0024.
 */
// dialog 弹窗组件
lyb.Dialog = function(id){
	this.window = jQuery(window);
    lyb.Dialog.superClass.constructor.call(this, id);
    //加载完成，绑定resize方法
    this._onResize();
};
lyb.extend(lyb.Dialog, lyb.Notice,{
    type:'dialog',
    _init:function(){
    	this.modalEl = jQuery('<div class="dialog-modal" style="position: fixed;left: 0;top: 0;width: 100%;height: 100%;opacity: .5;background: #000;"></div>');
		this.modalEl.appendTo(this.el);
		this.borderEl = jQuery('<div class="notice-border dialog-border" style="position: absolute;top: 50%;left: 50%;"></div>');
		this.borderEl.appendTo(this.el);
    },
	_initField: function(){
		lyb.Dialog.superClass._initField.call(this);
        this.showClose = true;
	},
    _onResize: function(){
    	var that = this;
    	this.window.resize(function(){
    		if(!that.fullPage){
    			that._updateHeight(false);
			}
    	});
    },
    _render:function(){
    	lyb.Dialog.superClass._render.call(this);
    	this._updateHeight(true);
    	this._onLoad();
    },
    _renderContent: function(){
    	this._SPAID = lyb.getUUID();
    	var bottom = this.btns.length == 0 ? 0 : 51;
		var html = '<div id="'+ this._SPAID +'" class="notice-content" style="position: absolute;left: 0;right: 0;top: 40px;bottom: '+ bottom +'px;overflow: auto;">';
		if(this.url && !lyb.SPA){
        	if(/\?/g.test(this.url)){
        		this.url += '&_=' + new Date().getTime();
        	}else{
        		this.url += '?_=' + new Date().getTime();
        	}
        	html += '<iframe class="dialog-frame" style="width: 100%;height: 100%;border: none;"></iframe>';
        } else{
        	if(this.content){
        		if(jQuery.type(this.content) == 'string'){
        			html += this.content;
        		}else{
        			var content = '';
        			if(this.content instanceof jQuery)
        				content = this.content[0].outerHTML;
        			else
        				content = this.content.outerHTML;
        			html += content;
        		}
        	}
        }
		html += '</div>';
		return html;
	},
	_renderButtons: function(){
		var html = '';
		if(this.btns.length > 0){
        	var html = [];
            html += '<div class="notice-btns" style="position: absolute;bottom: 0;left: 0;right: 0;">';
            for(var index in this.btns){
            	var btn = this.btns[index];
            	if(jQuery.type(btn) == 'string'){
            		html += '<button type="button" data-btn-type="'+ btn +'" class="button button-'+ btn +'">'+ (btn == 'success' ? '确定' : '取消') +'</button>';
            	}else{
            		html += '<button type="button" data-btn-type="'+ (btn.type || 'success') +'" class="button button-'+ btn.type +' '+ (btn.color || '') +'">'+ (btn.text || '确定') +'</button>';
            	}
            }
            html += '</div>';
        }
		return html;
	},
	__onload: function(){
		if(this.onload){
			this.onload();
		}
	},
    _onLoad: function(){
        if(this.url){
        	if(lyb.SPA){
        		var SPA = lyb.initSPA(this._SPAID), that = this; 
        		SPA.go(this._SPAID, this.url, this.params, function(el){
        			that.__onload(el);
        		});
        		this.closeWindow = this._hide;
        	}else{
        		var that = this;
                this.iframeEl = jQuery('.dialog-frame', this.borderEl).attr('src', this.url);
                this.iframeEl.on('load', function(e) {
    				var body = this.contentWindow.document? this.contentWindow.document.body : this.ownerDocument.body;
                    if (body){
                    	var bodyEl = jQuery(body);
                        try {
    						that.onload.call(this.contentWindow, {
                                parent : window,
                                sender : that
                            });
    					} catch (e) {
    						window.console && window.console.log(e)
    					}
                        if(this.contentWindow)
                        	this.contentWindow.closeWindow = (function(sender) {
                                return function() {
    	                            sender._hide();
    	                            sender = null;
                                };
                            })(that);
                    }
                });
        	}
        }
        if(this.content){
    		this.__onload();
    		this.closeWindow = this._hide;
		}
    	this.el.css('visibility', 'visible');
    },
    _updateHeight: function(status){
    	var height = this.height, width = this.width;
    	win = this.window;
    	if(this.fullPage){
    		width = '100%';
    		height = '100%';
    	}else{
    		var winHeight = win.height(), winWidth = win.width();
    		if(winHeight <= height){
    			height = winHeight - 5;
    		}
    		if(winWidth <= width){
    			width = winWidth - 5;
    		}
    	}
    	this._show(width, height, status);
    }, 
    _show: function(width, height, status){
    	this.borderEl.css({
    		width: width,
    		height: height,
    		'margin-top': - height / 2,
    		'margin-left': - width / 2
    	});
    	if(status == true){
    		this.borderEl.addClass('animate fadeOutDown');
    		this.el.addClass('animate fadeIn');
    		
    		var that = this;
    		window.setTimeout(function(){
    			that.el.css('opacity', 1);
    			that.borderEl.removeClass('animate fadeOutDown');
    			that.el.removeClass('animate fadeIn');
    		}, 400);
    	}
    },
    _hide: function(){
    	var that = this;
    	this.borderEl.addClass('animate fadeOutUp');
    	this.el.addClass('animate fadeOut');
    	window.setTimeout(function(){
    		that.borderEl.removeClass('animate fadeOutUp');
    		that.el.removeClass('animate fadeOut');
    		that.el.css('opacity', 0);
    		
    		if(that.ondestroy){
            	var win = lyb.SPA ? that : that.iframeEl[0].contentWindow;
    			that.ondestroy.call(win);
        	}
    		if(that.iframeEl && that.iframeEl[0]){
    			that.iframeEl[0].src = null;
    		}
    		that._destroy();
    	}, 400);
    	if(lyb.SPA){
    		var spa = lyb.SPA.components[this._SPAID];
    		if(spa){
    			lyb.SPA.removeModules(spa);
    			delete lyb.SPA.components[this._SPAID];
    		}
    	}
    },
    _destroy: function(){
    	this._un(this.el);
		this.el.remove();
		lyb.Dialog.superClass._destroy.call(this);
    },
    _bindEvents:function(){
        this._on(this.el, ".notice-btns>.button,.notice-header>.tools-border>.icon-close", "click", this._onButtonClick, this)
    },
    _onCloseClick:function(e){
        this._hide();
    },
    _onButtonClick:function(e){
    	var el = e.selector;
    	var win = lyb.SPA ? this : this.iframeEl[0].contentWindow;
    	var type = el[0].dataSet ? el[0].dataSet['btnType'] : el.data('btnType');
    	if(type){
        	var splits = type.split('');
        	splits[0] = splits[0].toUpperCase();
        	type = splits.toString();
        	if(win['on' + type])
        		win['on' + type].call(win);
        	if(type == 'Cancel'){
        		win.closeWindow && win.closeWindow();
        	}
    	}else{
    		win.closeWindow && win.closeWindow();
    	}
    	
    },
    _open:function(options){
        options = options || {};
        this.title = options.title || this.title || "对话框";
        this.url = options.url || this.url;
        this.btns = options.btns || [{type: 'success', color: '', text: '保存'}, {type: 'cancel', color: '', text: '取消'}];
        this.fullPage = options.fullPage || false;
        this.width = Number(String(options.width || '800').replace(/px/i, ''));
        this.height = Number(String(options.height || '400').replace(/px/i, ''));
        this.onload = options.onload || function(){};
        this.ondestroy = options.ondestroy || function(){};
        this.onSuccess = options.onSuccess || options.onsuccess || function(){};
        this.onCancel = options.onCancel || options.oncancel || function(){};
        this.content = options.content || this.content || "";
        this.params = options.params || {};
        this._render();
    },
    open: function(options){
    	this._open(options);
    }
});
lyb.Register(lyb.Dialog, 'dialog');

lyb.showDialog = function(options){
	var uuid = lyb.getUUID();
	var dialog = jQuery('<div id="'+ uuid +'" class="lyb-dialog" style="opacity: 0;"></div>');
	jQuery(document.body).append(dialog);
	var dialog = new lyb.Dialog(uuid);
	dialog.open(options);
};
