//TODO 金钱数值控件
lyb.Decimal = function(id){
	lyb.Decimal.superClass.constructor.call(this, id);
	this.textEl.css('text-align', 'right');
};
lyb.extend(lyb.Decimal, lyb.PopupEdit,{
	type:'decimal',
	_init: function() {
		lyb.Decimal.superClass._init.call(this);
		if(this.format[0] == 'd'){
			this.borderEl.removeClass('editbox-border');
		}else{
			this.errorEl.css('right', 40);
		}
	},
	_renderEditButton: function(type){
		if(this.format[0] == 'p'){
			type = '%';
		}else if(this.format[0] == 'm'){
			type = '&yen;';
		}else{
			return '';
		}
		return '<span class="edit-button"><a class="icon clear" href="javascript: void(0);"></a><a class="icon" href="javascript: void(0);">'+ type +'</a></span>';
	},
	_renderEditor: function(){
		var readonly = this.readonly ? 'readonly="readonly"' : '';
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		var maxValue = this.max ? 'maxLength="' + this.max + '"' : '';
		return '<input type="text" class="textbox" '+ readonly +' '+ disabled +' '+ maxValue +' value="' + this.value + '" style="background: transparent;border:none;"/>';
	},
	_initField: function() {
		this._readonly = this.readonly === true ? true : false;
		lyb.Decimal.superClass._initField.call(this);
		this.readonly = this._readonly;
		this.format = this._convertFormat(this.format);
		this.formatValue = lyb.formatDecimal(this.value, this.format[1], true);
		if(this.format[0] == 'p'){
			this.maxValue = 100;
		}
		this.value = this.formatValue;
		this.filter = [8, 9, 35, 36, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 109,
		   			190, 189, 229 ];
	},
	_convertFormat: function(format){
		format = lyb.getValid(format, 'd2');
		if(jQuery.type(format) == 'array'){
			return format;
		}
		var style = lyb.getValid(format.replace(/\d+/g, ''), 'd');
		var fixed = Number(lyb.getValid(format.replace(/[a-zA-Z]/g, ''), ''));
		return [style, fixed];
	},
	_bindEvents:function(){
		lyb.Decimal.superClass._bindEvents.call(this);
	},
	_onEditButtonClick : function(e) {
	},
	_onKeyDown: function(e) {
		var selector = e.selector;
		var value = selector.val();
		var keycode = e.event.keyCode || e.event.which;
		if(this.filter.indexOf(keycode) != -1){
			if(keycode == 109 || keycode == 189){
				if(/\-/g.test(value)){
					e.preventDefault();
				}
			}else if(keycode == 110 || keycode == 190){
				if(/\./g.test(value)){
					e.preventDefault();
				}
			}
		}else{
			e.preventDefault();
		}
		this._fire('keydown', e);
	},
	_onBoxFocus: function(e) {
		if(!this.readonly && !this.disabled){
			var selector = e.selector;
			var value = selector.val().replace(/,/g, '');
			selector.val(value);
			this._fire('focus', e);
		}
	},
	_onPropertyChange: function(e) {
		var selector = e.selector;
		var value = selector.val().replace(/,/g, '');
		
		if(this.maxValue !== undefined && this.maxValue <= Number(value)){
			selector.val(this.maxValue);
			value = this.maxValue;
		}
		if(this.minValue !== undefined && this.minValue >= Number(value)){
			selector.val(this.minValue);
			value = this.minValue;
		}
		
		this.value = value;
		this.formatValue = lyb.formatDecimal(value, this.format[1], true);
		this._validate(this.value);
		this._togglePlaceHolder(this.value);
		this._writeMessage(value);
		e.value = value;
		this._fire('input', e);
	},
	_onKeyUp: function(e) {
		e.value = this.value;
		this._fire('keyup', e);
	},
	_onBlurChange:function(e){
		var selector = e.selector;
		var value = selector.val().replace(/,/g, '');
		this.value = value;
		this.formatValue = lyb.formatDecimal(value, this.format[1], true);
		this.textEl.val(this.formatValue);
		this._validate(this.value);
		e.value = this.value;
		this._fire('blur', e);
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['format'],
			bool: ['showSymbol'],
			number: ['maxValue', 'minValue']
		}, attributes);
		return lyb.Decimal.superClass._getAttrs.call(this, attrs);
	},
	_setValue:function(value){
		this.formatValue = lyb.formatDecimal(value, this.format[1], true);
		this.value = this.formatValue.replace(/,/g, '');
		this.textEl.val(this.formatValue);
	}
});
lyb.Register(lyb.Decimal, 'decimal');