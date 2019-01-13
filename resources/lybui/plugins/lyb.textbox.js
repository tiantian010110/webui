//TODO 文本框控件
lyb.TextBox = function(id) {
	lyb.TextBox.superClass.constructor.call(this, id);
};
lyb.extend(lyb.TextBox, lyb.Root, {
	type: 'textbox',
	_init: function() {
		this.el.css({
			position: 'relative',
			width: this.width,
			height: this.height
		});
		
		var cls = this.readonly ? 'readonly' : this.disabled ? 'disabled' : '';
		
		this.errorEl = jQuery('<span class="errorText" style="position: absolute;top: 0;right: 6px;color: red;"></span>');
		this.errorEl.appendTo(this.el);
		
		this.placeHolderEl = jQuery('<span class="place-holder" style="position: absolute;"></span>');
		this.placeHolderEl.appendTo(this.el); 
		
		this.borderEl = jQuery('<div class="textbox-border '+ cls +'"></div>');
		this.borderEl.appendTo(this.el);
		
		this.textEl = jQuery(this._renderEditor());
		this.textEl.appendTo(this.borderEl);

		this.buttonEl = jQuery(this._renderEditButton());
		this.buttonEl.appendTo(this.borderEl);
		
		this.msgEl = jQuery('<span class="place-holder message" style="position: absolute;display: none;"></span>');
		this.msgEl.appendTo(this.el); 
		
		this.validate = new lyb.Validate();
		
		this._togglePlaceHolder();
		this._writeMessage();
	},
	_renderEditButton: function(type){
		var hide = '';
		if(this.readonly || this.disabled){
			hide = 'display: none;';
		}
		return '<span class="hide-button" style="'+ hide +'"><a class="icon clear" href="javascript: void(0);"></a></span>';
	},
	_renderEditor: function(){
		var readonly = this.readonly ? 'readonly="readonly"' : '';
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		var maxValue = this.max ? 'maxLength="' + this.max + '"' : '';
		return '<input type="text" class="textbox" '+ readonly +' '+ disabled +' '+ maxValue +' value="' + this.value + '" style="background: transparent;border:none;"/>';
	},
	_initField: function() {
		this.value = lyb.getValid(this.value, '');
		this.readonly = this.readonly === true ? true : false;
		this.disabled = this.disabled === true ? true : false;
		this.allowCount = this.allowCount === true ? true : false;
		this.placeHolder = lyb.getValid(this.placeHolder, '');
	},
	_bindEvents:function(){
		this._on(this.el, '.clear', 'click', this._onClearClick, this);
		this._on(this.el, '.textbox', 'change', this._onValueChange, this);
		this._on(this.el, '.textbox', 'focus', this._onBoxFocus, this);
		this._on(this.el, '.textbox', 'blur', this._onBlurChange, this);
		this._on(this.el, '.textbox', 'keyup', this._onKeyUp, this);
		this._on(this.el, '.textbox', 'keydown', this._onKeyDown, this);
		this._on(this.el, '.textbox', 'input propertychange', this._onPropertyChange, this);
	},
	_onClearClick: function(e) {
		e.stopPropagation();
		this.value = '';
		this._setValue('');
		if(this._setText) {
			this.text = '';
			this._setText('');
		}
		this._validate();
		this._fire('clear', e);
	},
	_onBoxFocus: function(e) {
		this._fire('focus', e);
	},
	_onPropertyChange: function(e) {
		var selector = e.selector;
		var value = selector.val();
		this.value = value;
		this._togglePlaceHolder(value);
		this._writeMessage(value);
		e.value = value;
		this._fire('input', e);
	},
	_onKeyUp: function(e) {
		var selector = e.selector;
		var value = selector.val();
		this.value = value;
		this._togglePlaceHolder(value);
		this._validate(value);
		e.value = value;
		this._fire('keyup', e);
	},
	_writeMessage: function(value){
		value = String(lyb.getValid(value, ''));
		var length = value.length;
		var html = [];
//		if(this.allowCount){
//			html.push('当前已经输入' + length + '个字符');
//		}
//		if(this.max){
//			var lest = this.max - length;
//			lest = lest === 0 ? ('<span style="color: red">' + lest + '</span>') : lest;
//			html.push('还可以输入' + lest + '个字符');
//		}
		if(this.max){
			var lest = this.max - length;
			lest = lest === 0 ? ('<span style="color: red">' + lest + '</span>') : lest;
			html.push(lest + '/' + this.max);
		}
		
		if(html.length > 0)
			this.msgEl.html(html.join()).show();
		else
			this.msgEl.html('').hide();
	},
	_onValueChange:function(e){
		var selector = e.selector;
		var value = selector.val();
		this._validate(value);
		this.value = value;
		e.value = value;
		this._fire('change', e);
	},
	_onBlurChange:function(e){
		var selector = e.selector;
		var value = selector.val();
		this._validate(value);
		this.value = value;
		e.value = value;
		this._fire('blur', e);
	},
	_togglePlaceHolder: function(value){
		value = lyb.getValid(value, this.value);
		if(value != ''){
			this.placeHolderEl.html('');
		}else{
			this.placeHolderEl.html(this.placeHolder);
		}
	},
	_validate: function(value){
		this.validate.setValue(lyb.getValid(value, this.value));
		this.validate.setVType(this.validType);
		this.validate.setRequired(this.required);
		var result = this.validate.execute();
		this.errorEl.html(result);
		if(result != ''){
			this.errorEl.show();
			return false;
		}else{
			this.errorEl.hide();
			return true;
		}
	},
	_destroy: function(){
		this._un(this.el);
		this._un(this.borderEl);
		lyb.globalEvents.removeEvent('click', this._uuid);
		lyb.globalEvents.removeEvent('resize', this._uuid);
		this.el.remove();
		lyb.TextBox.superClass._destroy.call(this);
	},
	_getValue:function(){                                                                                                    
		return this.value;
	},
	_setValue: function(value) {
		this.value = value;
		this.textEl.val(this.value);
		this._togglePlaceHolder(value);
		this._writeMessage(value);
	},
	_show: function(){
		this.el.show();
	},
	_hide: function(){
		this.el.hide();
	},
	_setRequired: function(required){
		this.required = required;
		this.validate.setRequired(required);
	},
	_setBoxStatus: function(type, status){
		this[type] = status;
		if(status){
			this.borderEl.addClass(type);
			this.textEl.attr(type, status);
		}else{
			this.borderEl.removeClass(type);
			this.textEl.attr(type, status);
		}
	},
	_setReadonly: function(status){
		this._setBoxStatus('readonly', status);
	},
	_setDisabled: function(status){
		this._setBoxStatus('disabled', status);
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['name', 'validType', 'placeHolder'],
			json: [],
			bool: ['required', 'readonly', 'disabled', 'allowCount'],
			number: ['max']
		}, attributes);
		return lyb.TextBox.superClass._getAttrs.call(this, attrs);
	},
	setValue: function(value){
		this._setValue(value);
	},
	getValue: function(){
		return this._getValue();
	},
	show: function(){
		this._show();
	},
	hide: function(){
		this._hide();
	},
	setRequired: function(required){
		this._setRequired(required);
	},
	destroy: function(){
		this._destroy();
	},
	validateBox: function(){
		this._validate();
	},
	setReadonly: function(status){
		this._setReadonly(status);
	},
	setDisabled: function(status){
		this._setDisabled(status);
	}
});
lyb.Register(lyb.TextBox, 'textbox');