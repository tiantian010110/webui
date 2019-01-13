//TODO 模糊多选控件
lyb.BlockBox = function(id) {
	lyb.BlockBox.superClass.constructor.call(this, id);
};
lyb.extend(lyb.BlockBox, lyb.FilterBox, {
	type: 'blockbox',
	_init: function() {
		lyb.BlockBox.superClass._init.call(this);
		this.borderEl.css({'height': 'auto', 'min-height': 28});
		this.textEl.hide();
		this.textBoxListEl = jQuery('<ul class="textboxlist"></ul>').appendTo(this.borderEl);
		this._renderFilterBox();
	},
	_initField: function() {
		this._readonly = this.readonly === true ? true : false;
		lyb.FilterBox.superClass._initField.call(this);//因为allowMulti在本组件中使用，所以借用FilterBox
		this.keyWordsField = lyb.getValid(this.keyWordsField, 'keyWords');
		this.readonly = this._readonly;
		this.allowMatcher = true;
		this.parameters = {};
	},
	//将选中的listbox合并到this.nodes，参数nodes的length=1
	_concatNodes: function(nodes){
		if(this.allowMulti)
			for(var index=0,len=nodes.length;index<len;index++){
				var node = nodes[index];
				var status = true;
				for(var _index=0,_len=this.nodes.length;_index<_len;_index++){
					var _node = this.nodes[_index];
					if(_node[this.valueField] == node[this.valueField]){
						status = false;
						break;
					}
				}
				if(status && !node._empty){
					this.nodes.push(node);
				}
			}
		else
			this.nodes = nodes;
	},
	_renderFilterBox: function(){
		var readonly = this.readonly ? 'readonly="readonly"' : '';
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		this.textBoxListEl.html('<li class="textboxlist-text-item"><input type="text" class="filter-text" '+ disabled +' '+ readonly +' style="background: transparent;border:none;"/></li>');
		this.filterboxEl = jQuery('.filter-text', this.textBoxListEl);
	},
	_renderTextBoxList: function(){
		this.textBoxListEl.children('.textboxlist-item').remove();
		var html = [];
		var nodes = this.nodes;
		for(var i = 0;i < nodes.length;i++){
			var node = nodes[i];
			html.push('<li class="textboxlist-item"><span class="textboxlist-text">'+ node[this.textField] +'<span id="'+ node._uuid +'$close" class="textboxlist-close"></span></span></li>');
		}
		this.textBoxListEl.prepend(html.toString());
	},
	_bindEvents: function() {
		lyb.PopupEdit.superClass._bindEvents.call(this);
		lyb.globalEvents.pushEvent([this.__hideElement, this, this._uuid], 'click');
		this._on(this.el, '.textbox-border', 'click', this._onFilterTextFocus, this);
		this._on(this.el, '.textboxlist-close', 'click', this._onCloseClick, this);
		this._on(this.el, '.filter-text', 'input propertychange', this._onFilterTextChange, this);
		this._on(this.el, '.filter-text', 'keyup', this._onFilterTextBackSpace, this);
	},
	_onFilterTextBackSpace: function(e) {
		e.stopPropagation();
		var keycode = e.event.keyCode || e.event.which;
		if(keycode == 8){
			this.nodes.pop();
			this._doRenderBox();
			e.nodes = this.nodes;
			e.row = {};
			this._fire('change', e);
		}
	},
	_onClearClick: function(e) {
		e.stopPropagation();
		this._clear();
		this._fire('clear', e);
	},
	_clear: function(){
		this.nodes = [];
		this._doRenderBox();
	},
	_doRenderBox: function(){
		this._renderTextBoxList();
		this.value = this._getValue();
		this._validate();
		this._togglePlaceHolder();
		this._writeMessage();
	},
	_onCloseClick: function(e) {
		var selector = e.selector;
		var id = selector[0].id;
		var uuid = id.split('$')[0];
		var nodes = this.nodes;
		for(var i=0,len=nodes.length;i<len;i++){
			var node = nodes[i];
			if(node._uuid == uuid){
				this.nodes.splice(i, 1);
				this._doRenderBox();
				e.nodes = this.nodes;
				e.row = {};
				this._fire('change', e);
				break;
			}
		}
	},
	__hideElement: function(){
		this.listBox._hide();
		var show = this.listBox.el.css('display');
		if(show == 'block'){
			this.filterboxEl.val('');
			this._keyWordsSearch({event: {target: {value: this.textEl.val()}}});
		}
	},
	_onFilterTextChange: function(e) {
		this._keyWordsSearch(e);
		var show = this.listBox.el.css('display');
		if(show == 'none'){
			this.listBox._show();
		}
	},
	_onFilterTextFocus: function(e) {
		e.stopPropagation();
		jQuery('.filter-text', this.textBoxListEl).focus();
	},
	_keyWordsSearch: function(e){
		var event = e.event;
		var value = lyb.getValid(event.target.value, '');
		this.listBox._setKeyWords(value);
		this.listBox.value = ''; //绕过listbox的setValue方法在设置不存在的value时，value不变的问题
		this.listBox.text = value; //绕过listbox的setValue方法在设置不存在的value时，value不变的问题
		this.listBox._render(value);
		//如果filterbox有值或已经选择了某条数据，placeHolder隐藏
		this._togglePlaceHolder();
	},
	_onListBoxValueChange: function(e) {
		this._concatNodes(e.nodes);
		//render textboxlist
		this._renderTextBoxList();
		if(!this.allowMulti){
			this.listBox._hide();
		}
		this.filterboxEl.val('');
		this._togglePlaceHolder();
		this._writeMessage();
		e.nodes = this.nodes;
		this._fire('change', e);
	},
	_afterListBoxLoad: function(){
		lyb.BlockBox.superClass._afterListBoxLoad.call(this);
		//render textboxlist
		this._renderTextBoxList();
		//如果filterbox有值或已经选择了某条数据，placeHolder隐藏
		var text = this.filterboxEl.val();
		this._togglePlaceHolder();
	},
	//如果filterbox有值或已经选择了某条数据，placeHolder隐藏
	_togglePlaceHolder: function(){
		var value = this.filterboxEl ? lyb.getValid(this.filterboxEl.val(), '') : '';
		if(this.nodes.length != 0 || value !== ''){
			this.placeHolderEl.html('');
		}else{
			this.placeHolderEl.html(this.placeHolder);
		}
	},
	_setParameters: function(param){
		this.listBox._setParameters(param || {});
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['columns', 'matcherFields'],
			bool: [],
			json: []
		}, attributes);
		return lyb.BlockBox.superClass._getAttrs.call(this, attrs);
	},
	setParameters: function(params){
		this._setParameters(params);
	},
	clear: function(){
		this._clear();
	}
});
lyb.Register(lyb.BlockBox, 'blockbox');