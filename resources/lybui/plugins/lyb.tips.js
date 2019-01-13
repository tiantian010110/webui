/**
 * Created by Administrator on 2016/8/24 0024.
 */
// Tips 通知组件
lyb.Tips = function(id) {
	lyb.Tips.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Tips, lyb.Notice, {
	type: 'tips',
	_init: function(){
		this.borderEl = jQuery('<div class="notice-border tips-border '+ this.level +'" style="position: relative;margin: auto;margin-top: 10px;box-shadow: 0 2px 4px 0 rgba(0,0,0,.12),0 0 6px 0 rgba(0,0,0,.04);"></div>');
		this.borderEl.appendTo(this.el);
		
		this._render();
		this._show();
		this._setTimeout();
	},
	_initField: function(){
		lyb.Tips.superClass._initField.call(this);
		this.showClose = false;
		this.showHead = false;
		this.showFoot = false;
		this.showIcon = true;
	},
	_renderContent: function(){
		var html = '<span class="notice-icon"><i class=" icon icon-'+ this.icons[this.level] +'"></i></span>';
		html += '<div class="notice-message" style="position: absolute;top: 0;left: 50px;right: 0;bottom: 0;display: flex;align-items: center;">';
		html += '<p>'+ this.text +'</p>';
		html += '</div>';
		return html;
	},
	_setTimeout: function(){
		var that = this;
		window.setTimeout(function(){
			that._hide();
		}, 1500);
	},
    _bindEvents:function(){
    	lyb.Tips.superClass._bindEvents.call(this);
    },
    _destroy: function(){
    	this._fire('destroy', {level: this.level});
		lyb.Tips.superClass._destroy.call(this);
    },
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['text', 'title'],
			bool: ['showClose', 'showHead', 'showFoot', 'showIcon'],
			number: []
		}, attributes);
		return lyb.Tips.superClass._getAttrs.call(this, attrs);
	}
});
lyb.Register(lyb.Tips, 'tips');

lyb.showTip = function(text, level, callback){
	var uuid = lyb.getUUID(), cb;
	if(jQuery.type(level) === 'function'){
		cb = level;
		level = undefined;
	}
	if(callback && jQuery.type(callback) !== 'function'){
		level = callback;
		if(cb){
			callback = cb;
		}
	}
	level = lyb.getValid(level, 'info'); 	
	var tipEl = jQuery('<div id="'+ uuid +'" class="lyb-tips" data-level="'+ level +'" data-text="'+ text +'"></div>');
	jQuery(document.body).append(tipEl);
	var tip = new lyb.Tips(uuid);
	if(callback){
		tip.bind('destroy', callback);
	}
};
lyb.success = function(text, callback){
	lyb.showTip(text, 'success', callback);
};
lyb.error = function(text, callback){
	lyb.showTip(text, 'error', callback);
};
lyb.warning = function(text, callback){
	lyb.showTip(text, 'warning', callback);
};
lyb.info = function(text, callback){
	lyb.showTip(text, 'info', callback);
};