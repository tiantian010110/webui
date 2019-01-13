//TODO 下拉框控件
lyb.ComboBox = function(id) {
	this.nodes = [];
	lyb.ComboBox.superClass.constructor.call(this, id);
	this._renderListBox();//自身渲染完成后才渲染listbox
};
lyb.extend(lyb.ComboBox, lyb.PopupEdit, {
	type: 'combobox',
	_init: function() {
		lyb.ComboBox.superClass._init.call(this);
		this.errorEl.css('right', 40);
	},
	_renderEditor: function(){
		var readonly = !this.allowMatcher || this.readonly ? 'readonly="readonly"' : '';
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		return '<input type="text" class="textbox" '+ readonly +' '+ disabled +' value="' + this.value + '" style="background: transparent;border:none;"/>';
	},
	_renderEditButton: function(type){
		var hide = '';
		if(this.readonly || this.disabled){
			hide = 'display: none;';
		}
		return '<span class="edit-button" style="'+ hide +'"><i class="icon clear"></i><i class="icon icon-sort"></i></span>';
	},
	_renderListBox: function() {
		var _uuid = lyb.getUUID();
		var html = ['<div id="' + _uuid + '"'];
		if(this.columns){
			html.push(' class="lyb-gridbox" data-columns="'+ this.columns +'"');
		}else{
			html.push(' class="lyb-listbox" ');
			if(this.showEmpty){
				html.push('data-show-empty="'+ this.showEmpty +'" ');
			}
		}
		html.push('data-auto-load="false" ');
		if(this.textField) {
			html.push('data-text-field="' + this.textField + '" ');
		}
		if(this.allowMatcher) {
			html.push('data-allow-matcher="' + this.allowMatcher + '" data-key-words-field="' + this.keyWordsField + '" ');
		}
		if(this.valueField) {
			html.push('data-value-field="' + this.valueField + '" ');
		}
		if(this.allowMulti) {
			html.push('data-allow-multi="' + this.allowMulti + '" ');
		}
		if(this.matcherFields) {
			html.push('data-matcher-fields="' + this.matcherFields + '" ');
		}
		if(this.url && this.url != '') {
			html.push('data-url="' + this.url + '" ');
		} else if(this.source && this.source != '') {
			html.push('data-source="' + this.source + '" ');
		}
		html.push('style="display: none;position: absolute;z-index: 10;left: 0;right: 0;"></div>');
		this.listboxEl = jQuery(html.join(''));
		this.listboxEl.appendTo(this.el);
		if(this.columns){
			this.listBox = new lyb.GridBox(_uuid, this.el);
		}else{
			this.listBox = new lyb.ListBox(_uuid, this.el);
		}
		
		this.listBox.bind('change', this._onListBoxValueChange, this);
		this.listBox.bind('loadsuccess', this._onListBoxLoadSuccess, this);
		this.listBox._load();
	},
	_destroy: function(){
		this.listBox._destroy();
		lyb.ComboBox.superClass._destroy.call(this);
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['url', 'valueField', 'textField', 'showEmpty', 'source'],
			bool: ['allowMulti'],
			json: []
		}, attributes);
		return lyb.ComboBox.superClass._getAttrs.call(this, attrs);
	},
	_bindEvents: function() {
		lyb.ComboBox.superClass._bindEvents.call(this);
		this._on(this.el, '.textbox-border', 'click', this._onEditButtonClick, this);
		lyb.globalEvents.pushEvent([this.__hideElement, this, this._uuid], 'click');
	},
	__hideElement: function(){
		this.listBox._hide();
	},
	_onEditButtonClick: function(e) {
		if(!this.allowPopup) {
			this.listBox._hide();
			return;
		}
		
		if(this.listboxEl.css('display') == 'block') {
			e.stopPropagation();
			return;
		}
		var that = this;
		//用异步的方式解决document.body的click事件
		window.setTimeout(function() {
			that._loadListBox(e);
		}, 0);
	},
	_loadListBox: function(e){
		this.listBox._show(this.el);
	},
	_onListBoxValueChange: function(e) {
		this._concatNodes(e.nodes);
		this.value = e.value;
		this.text = e.text;
		this.textEl.val(this.text);
		this._validate();
		this._togglePlaceHolder();
		
		if(!this.allowMulti){
			this.listBox._hide();
		}
		
		e.nodes = this.nodes;
		this._fire('change', e);
	},
	//下拉框load成功
	_onListBoxLoadSuccess: function(e) {
		var nodes = [], textArray = [];
		var valueArray = this.value.toString().split(',');
		for(var i=0,len=valueArray.length;i<len;i++){
			var value = valueArray[i];
			var node = e.sender._getNodeByUUID(value, this.valueField);
			if(node && !node._empty){
				textArray.push(node[this.textField]);
				this.nodes.push(node);
			}else{
				valueArray.splice(i, 1);
			}
		}
		e.sender._changeSelected([]);
		e.sender._changeSelected(this.nodes);
		this.text = textArray.join();
		this._afterListBoxLoad();
		this._togglePlaceHolder();
		this._writeMessage();
		this._fire('loadsuccess', e);
	},
	//load成功以后执行其他动作
	_afterListBoxLoad: function(){
		this._setText(this.text);
		this._togglePlaceHolder();
	},
	//合并listbox返回的节点到当前nodes
	_concatNodes: function(nodes){
		this.nodes = nodes;
	},
	_setText: function(text){
		this.text = text;
		this.textEl.val(this.text);
	},
	_setUrl: function(url) {
		this.url = url;
		this.listBox._setUrl(url);
	},
	_setData: function(array) {
		this.listBox._setData(array);
	},
	_getData: function() {
		return this.listBox._getData();
	},
	_setValue: function(value) {
		this.value = value;
		this.listBox._setValue(value);
		this._togglePlaceHolder(value);
		this._writeMessage(value);
	},
	_getValue:function(field){  
		field = lyb.getValid(field, this.valueField);
		var result = [], data = this.nodes;
		for(var i = 0;i < data.length;i++){
			var node = data[i];
			result.push(node[field]);
		}
		return result.join();
	},
	_getText: function(){
		return this._getValue(this.textField);
	},
	getText: function(){
		return this._getText();
	},
	setData: function(array) {
		this._setData(array);
	},
	getData: function() {
		return this._getData();
	},
	destroy: function(){
		this._destroy();
	},
	setUrl: function(url){
		this._setUrl(url);
	}
});
lyb.Register(lyb.ComboBox, 'combobox');