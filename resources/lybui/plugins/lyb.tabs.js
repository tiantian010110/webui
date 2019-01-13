/**
 * Created by Administrator on 2016/8/23 0023.
 */
//tabs页签组件
lyb.Tabs = function(id){
    this.data = [];
    lyb.Tabs.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Tabs,lyb.Root, {
    type:'tabs',
    _init:function(){
    	this._initTabs();
        this.borderEl = jQuery('<div class="tabs-border"></div>').appendTo(this.el);
        this.panesBorderEl = jQuery('<div class="panes-border"></div>').appendTo(this.borderEl);
        this.tabsEl = jQuery('<div class="tabs"></div>').appendTo(this.panesBorderEl);
        this.contentsEl = jQuery('<div class="contents"></div>').appendTo(this.borderEl);
        this._render();
    },
    _initField: function(){
    	lyb.Tabs.superClass._initField.call(this);
    	this.singlePage = this.singlePage === false ? false : true;
    	this.titleField = lyb.getValid(this.titleField, 'title');
    },
    _render: function(){
    	var tabs = this.data;
        for(var i=0,len=this.data.length;i<len;i++){
            var tab = this.data[i];
            this._renderTab(tab);
            if(!this.singlePage){
            	this._renderContent(tab);
            }
        }
        var tab = this.selected || this.data[0];
        if(this.singlePage){//单页面需要操作
        	this._renderContent(tab);
        	for(var i=0,len=this.data.length;i<len;i++){
        		var _tab = this.data[i];
        		_tab.contentEl = tab.contentEl;
        		_tab.spa = tab.spa;
        		_tab.frame = tab.spa;
        		if(_tab.selected){
        			tab = _tab;
        		}
        	}
        }
        this._changeActived(tab);
    },
    _renderTab: function(tab){
    	var html = "";
        var zIndex = '', activeCls = '';
        if (tab.selected) {
            activeCls = ' tab-selected';
        }
        html += '<div id="' + tab._uuid + '$tab" class="panes-tab' + activeCls + '" style="position: relative;display: inline-block;text-align: center;cursor: pointer;white-space: nowrap;">';
        if (tab.icon) {
            html += '<img alt="" src="' + tab.icon + '" class="tab-icon" style="width: 14px;height: 14px;"/>';
        }
        html += '<span class="tab-text '+ (tab.enabled ? '' : 'disabled') +'">' + tab[this.titleField] + '</span>';
        if (this.allowClose && tab.allowClose && tab.enabled && !tab.locked) {
            html += '<span id="' + tab._uuid + '$close" class="tab-close" style="width: 14px;height: 14px;display: inline-block;vertical-align: middle;margin-left: 6px;"></span>';
        }
        html += '</div>';
        var el = jQuery(html);
        this.tabsEl.append(el);
        tab.tabEl = el;
    },
    _renderContent: function(tab){
    	var id = this.singlePage ? this._uuid : tab._uuid;
        var html = '<div id="' + id + '$panel" class="contents-panel" style="'+ (tab.selected ? '' : 'display: none;') +'"></div>';
        var el = jQuery(html);
        this.contentsEl.append(el);
        tab.contentEl = el;
        this._renderContentHTML(tab);
    },
    _renderContentHTML: function(tab){
    	var that = this;
    	if(tab.html && tab.html != '' && tab.selected){
    		tab.contentEl.html(tab.html);
        	this._fire('tabloaded', {tab: tab});
        }else if (tab.url) {
            var src = tab.url;
            if (tab.url.indexOf("?") != -1) {
                src += "&_random=" + new Date().getTime();
            } else {
                src += "?_random=" + new Date().getTime();
            }
            if(lyb.SPA){
            	var id = (this.singlePage ? this._uuid : tab._uuid) + '$panel';
            	tab.spa = lyb.initSPA(id); 
//        		this.__SPALoadPage(tab);
        	}else{
        		tab.contentsEl.html('<iframe style="border: none;width: 100%;height: 100%;"></iframe>');
        		tab.iframe = tab.contentEl.children("iframe");
        		this.__onFrameLoad(tab);
        	}
        }else{
        	this._fire('tabloaded', {tab: tab});
        }
    },
    __SPALoadPage: function(tab){
    	var that = this;
    	var id = (this.singlePage ? this._uuid : tab._uuid) + '$panel';
    	tab.spa.go(id, tab.url, (function(_tab) {
			return function(el) {
				that._fire('tabloaded', {tab: _tab});
				_tab = null;
			}
		})(tab));
    },
    __onFrameLoad: function(tab){
    	var that = this, frame = tab.iframe;
        if(frame && frame[0]){
            var iframe = frame[0];
            iframe.src = this.url;
            if (iframe.attachEvent) {
                iframe.attachEvent("onload", function(e) {
                    e.sender = that;
                    that._fire('tabloaded', {tab: tab});
                });
            } else {
                iframe.onload = function(e) {
                    e.sender = that;
                    that._fire('tabloaded', {tab: tab});
                };
            }  
        }
    },
    _changeActived: function(tab){
    	if(this.selected){
    		this.selected.tabEl.removeClass('selected');
    		this.selected.contentEl.removeClass('selected');
    		this.selected.contentEl.hide();
    	}
    	tab.tabEl.addClass('selected');
    	if(this.singlePage){
    		this.__SPALoadPage(tab);
    		tab.contentEl.show();
    	}else{
    		tab.contentEl.addClass('selected');
    		tab.contentEl.show();
    	}
    	this.selected = tab;
    },
    _addTab:function(tab){
        
    },
    _initTabs: function(){
        var tabEls = this.el.children().toArray();
        for (var i = 0; i < tabEls.length; i++) {
			var el = jQuery(tabEls[i]);
			var tab = new lyb.Tab(el);
			this.data.push(tab);
		}
        this.el.empty();
    },
    _bindEvents: function(){
        this._on(this.tabsEl,".panes-tab", "click",this._onTabClick,this);

    },
    _onTabClick:function(e){
        var selector = e.selector;
        var id = selector[0].id.split('$')[0];
        var tab = this._getNodeByUUID(id);
        this._changeActived(tab);
        this._fire('click',e);
    },
	_getAttrs : function(attributes) {
		var attrs = lyb.concat({
			str : ['titleField'],
			bool : ['allowClose', 'singlePage'],
			json : [],
			number: []
		}, attributes || {});
		return lyb.Tabs.superClass._getAttrs.call(this, attrs);
	},
	_go: function(url, params){
		var that = this;
		if(lyb.SPA){
			var tab = this.selected;
			var id = (this.singlePage ? this._uuid : tab._uuid) + '$panel';
			tab.spa.go(id, tab.url, params, (function(_tab) {
				return function(el) {
					that._fire('tabloaded', {tab: _tab});
					_tab = null;
				}
			})(tab));
		}
	},
	go: function(url, params){
		this._go(url, params);
	}
});
lyb.Register(lyb.Tabs, 'tabs');

//Tab对象
lyb.Tab = function(tab) {
  this._uuid = lyb.getUUID(), 
  this.visible = true, 
  this.enabled = true, 
  this.selected = false, 
  this.locked = false,

  this._init(tab);
};

lyb.Tab.prototype = {
  _init : function(tab) {
      if ( tab instanceof jQuery) {
          this._getAttrs(tab);
          this.el = tab;
      } else if (jQuery.type(tab) === 'object') {
          lyb.concat(this, tab);
      }
      this.html = this.html || (this.el ? this.el.html().replace(/(^\s*)|(\s*$)/g, "") : undefined);
  },
  _destroy: function(){
  	lyb.Destroy(this._uuid);
  },
  _getAttrs : function(el) {
      if (!el) {
          return;
      }
      this.text = el.text();
      var attrs = {
          str : ["name", "title", "url"],
          bool : ["selected", "enabled", "locked", "allowClose"]
      };
      lyb.concat(this, lyb._getBasicAttrs(el, attrs));
  }
};