//TODO 下拉框控件
lyb.FilterBox = function(id) {
	lyb.FilterBox.superClass.constructor.call(this, id);
};
lyb.extend(lyb.FilterBox, lyb.ComboBox, {
	type: 'filterbox',
	_init: function() {
		lyb.FilterBox.superClass._init.call(this);
	},
	_initField: function() {
		this._readonly = this.readonly === true ? true : false;
		lyb.FilterBox.superClass._initField.call(this);
		this.readonly = this._readonly;
		this.allowMatcher = true;
		this.allowMulti = false;  //禁止出现多选
	},
	_renderEditButton: function(type){
		var hide = '';
		if(this.readonly || this.disabled){
			hide = 'display: none;';
		}
		return '<span class="edit-button" style="'+ hide +'"><i class="icon clear"></i><i class="icon icon-search"></i></span>';
	},
	_bindEvents: function() {
		lyb.FilterBox.superClass._bindEvents.call(this);
		this._on(this.el, '.textbox', 'input propertychange', this._onFilterBoxInput, this);
		this._on(this.el, '.textbox', 'click', this._onEditButtonClick, this);
		this._on(this.el, '.textbox')
	},
	_onFilterBoxInput: function(e){
		this._loadListBox(e);
	},
	_loadListBox: function(e){
		if(this.allowMatcher){
			this._keyWordsSearch(e);
			this.listBox._render();
			this.listBox._show(this.el);
		}
	},
	_onKeyUp: function(e) {
		var event = e.event;
		var code = event.keyCode || event.which;
		if(code == 38 || code == 40){
			
		}
		
		var selector = e.selector;
		var value = selector.val();
		e.value = value;
		this._fire('keyup', e);
	},
	_keyWordsSearch: function(e){
		var event = e.event;
		var value = lyb.getValid(event.target.value, '');
		this.value = '';
		this.text = value;
		this.listBox._setKeyWords(value);
		this.listBox.value = ''; //绕过listbox的setValue方法在设置不存在的value时，value不变的问题
		this.listBox.text = value; //绕过listbox的setValue方法在设置不存在的value时，value不变的问题
		this.listBox._setValue('');
	},
	_onListBoxValueChange: function(e) {
		this.listBox._setKeyWords('');
		lyb.FilterBox.superClass._onListBoxValueChange.call(this, e);
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['keyWordsField']
		}, attributes);
		return lyb.FilterBox.superClass._getAttrs.call(this, attrs);
	},
});
lyb.Register(lyb.FilterBox, 'filterbox');