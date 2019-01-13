/**
 * Created by Administrator on 2016/8/24 0024.
 */
// Notice 通知组件
lyb.Notice = function(id) {
	lyb.Notice.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Notice, lyb.Root, {
	type: 'notice',
	_init: function(){
		this.modalEl = jQuery('<div class="notice-modal" style="position: fixed;left: 0;top: 0;width: 100%;height: 100%;opacity: .5;background: #000;"></div>');
		this.modalEl.appendTo(this.el);
		this.borderEl = jQuery('<div class="notice-border" style="position: relative;margin: auto;"></div>');
		this.borderEl.appendTo(this.el);
		
		this._render();
		this._show();
	},
	_initField: function(){
		this.icons = {// 0:info, 1:warning, 2:success, 3:error
				info: 'info',
				warning: 'warning',
				success: 'ok',
				error: 'remove',
				confirm: 'question'
		};
		this.text = lyb.getValid(this.text, '');
		this.title = lyb.getValid(this.title, '消息：');
		this.level = lyb.getValid(this.level, 'info');
		this.showClose = this.showClose === false ? false : true;
		this.showHead = this.allowHead === false ? false : true;
		this.showFoot = this.showFoot === false ? false : true;
		this.showIcon = this.showIcon === true ? true : false;
	},
	_render: function(){
		var html  = [];
		if(this.showHead){
			html.push(this._renderHeader());
		}
		html.push(this._renderContent());
		if(this.showFoot){
			html.push(this._renderButtons());
		}
		this.borderEl.html(html.toString());
	},
	_renderHeader: function(){
		var html = '<div class="notice-header">';
		html += '<span class="notice-title">'+ this.title +'</span>';
		if(this.showClose){
			html += '<span class="tools-border"><i data-btn-type="cancel" class="icon icon-remove icon-close"></i></span>';
		}
		html += '</div>';
		return html;
	},
	_renderContent: function(){
		var html = '<div class="notice-content" style="position: relative;display: flex;align-items: center;">';
		if(this.icons[this.level])
			html += '<i class="notice-icon icon icon-'+ this.icons[this.level] +'-sign" style="border-radius: 50%;"></i>';
		html += '<div class="notice-message" style="margin-left: 20px;">';
		html += '<p>'+ this.text +'</p>';
		html += '</div>';
		if(this.type == 'prompt'){
			html += '<div class="notice-input">';
			html += '<div class="input">';
			html += '<input type="text" autocomplete="off" class="message-textbox" />';
			html += '</div>';
			html += '</div>';
		}
		html += '</div>';
		return html;
	},
	_setBox: function(position){
		switch(position){
		case 'center':
			break;
		case 'rightBottom':
			break;
		case 'rightTop':
			break;
		case 'top':
			break;
		case 'bottom':
			break;
		}
	},
	_renderButtons: function(){
		var html = '<div class="notice-btns">';
		if(this.level == 'confirm')
			html += '<button type="button" class="button button-cancel">取消</button>';
		html += '<button type="button" class="button button-success">确定</button>';
		html += '</div>';
		return html;
	},
    _show: function(){
    	var that = this;
    	this.borderEl.addClass('animate fadeOutDown');
    	this.el.addClass('animate fadeIn');
    	window.setTimeout(function(){
    		that.borderEl.removeClass('animate fadeOutDown');
    		that.el.removeClass('animate fadeIn');
    	}, 400);
    },
    _hide: function(){
    	var that = this;
    	this.borderEl.addClass('animate fadeOutUp');
    	this.el.addClass('animate fadeOut');
    	window.setTimeout(function(){
    		that.borderEl.removeClass('animate fadeOutUp');
    		that.el.removeClass('animate fadeOut');
    		that._destroy();
    	}, 400);
    },
    _destroy: function(){
    	this._un(this.el);
		this.el.remove();
		lyb.Notice.superClass._destroy.call(this);
    },
    _bindEvents:function(){
        this._on(this.el, ".button-success", "click", this._onSuccessClick, this);
        this._on(this.el, ".icon-close,.button-cancel", "click", this._onCancelClick, this);
    },
    _onSuccessClick:function(e){
    	this._fire('success', {type: 'success', level: this.level});
    	this._hide();
    },
    _onCancelClick:function(e){
    	this._fire('cancel', {type: 'cancel', level: this.level});
    	this._hide();
    },
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['text', 'title', 'level'],
			bool: ['showClose', 'showHead', 'showFoot', 'showIcon'],
			number: []
		}, attributes);
		return lyb.Notice.superClass._getAttrs.call(this, attrs);
	}
});
lyb.Register(lyb.Notice, 'notice');

//消息弹窗
lyb.alert = function(text, level, callback){
	text = lyb.getValid(text, '');
	var success = callback, cancel = arguments[3], cb;
	if(level && jQuery.type(level) === 'function'){
		cb = level;
	}
	if(success && jQuery.type(success) !== 'function'){
		level = success;
		if(cb){
			success = cb;
		}
	};
	var uuid = lyb.getUUID();
	var noticeEl = jQuery('<div id="'+ uuid +'" class="lyb-notice" data-level="'+ level +'" data-text="'+ text +'"></div>');
	jQuery(document.body).append(noticeEl);
	var notice = new lyb.Notice(uuid);
	
	if(success){
		notice.bind('success', success);
	}
	if(cancel){
		notice.bind('cancel', cancel);
	}
};
//确认弹窗
lyb.confirm = function(text, success, cancel){
	lyb.alert.call(this, text, 'confirm', success, cancel);
};