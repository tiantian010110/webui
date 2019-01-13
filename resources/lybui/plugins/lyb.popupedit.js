//TODO 下拉框控件
lyb.PopupEdit = function(id) {
	lyb.PopupEdit.superClass.constructor.call(this, id);
};
lyb.extend(lyb.PopupEdit, lyb.TextBox, {
	type : 'popupedit',
	_init: function() {
		lyb.PopupEdit.superClass._init.call(this);
		this.borderEl.addClass('editbox-border');
	},
	_renderEditor: function(){
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		return '<input type="text" class="textbox" readonly="readonly" '+ disabled +' value="' + this.value + '" style="background: transparent;border:none;"/>';
	},
	_renderEditButton: function(type){
		var hide = '';
		if(this.readonly || this.disabled){
			hide = 'display: none;';
		}
		return '<span class="edit-button" style="'+ hide +'"><a class="icon clear" href="javascript: void(0);"></a><a class="icon icon-files-empty" href="javascript: void(0);"></a></span>';
	},
	_initField : function() {
		lyb.PopupEdit.superClass._initField.call(this);
		this.valueField = lyb.getValid(this.valueField, 'id');
		this.textField = lyb.getValid(this.textField, 'value');
		this.value = lyb.getValid(this.value, '');
		this.text = lyb.getValid(this.text, '');
		this.allowPopup = !this.readonly && !this.disabled ? true : false; 
	},
	_getAttrs : function(attributes) {
		var attrs = lyb.concat({
			str : [ 'valueField', 'textField' ],
			bool : [],
			json : []
		}, attributes);
		return lyb.PopupEdit.superClass._getAttrs.call(this, attrs);
	},
	_bindEvents : function() {
		lyb.PopupEdit.superClass._bindEvents.call(this);
		this._on(this.el, '.edit-button', 'click', this._onEditButtonClick, this);
	},
	_onEditButtonClick : function(e) {
		e.value = this.value;
		e.text = this.text;
		e.sender = this;
		this._fire('buttonclick', e);
	},
	_onBlurChange:function(e){
		e.value = this.value;
		e.text = this.text;
		this._fire('blur', e);
	},
	_onValueChange : function(e) {
		e.value = this.value;
		e.text = this.text;
		e.sender = this;
		this._fire('change', e);
	},
	_setText : function(text) {
		this.text = text;
	},
	setText : function(text) {
		this._setText(text);
	}
});
lyb.Register(lyb.PopupEdit, 'popupedit');
