//TODO 文本框控件
lyb.ListBox = function(id) {
	lyb.ListBox.superClass.constructor.call(this, id);
	//TODO 处理完成后
	this.autoLoad && this._load();
};
lyb.extend(lyb.ListBox, lyb.Root, {
	type: 'listbox',
	_init: function() {
		this.borderEl = jQuery('<div class="listbox-border" onselectstart="return false;" style="-moz-user-select:none;"></div>');
		this.borderEl.appendTo(this.el);
		this.listBoxEl = jQuery('<div class="listbox"></div>');
		this.listBoxEl.appendTo(this.borderEl);
		
		this.errorEl = jQuery('<span class="errorText" style="position: absolute;top: 0;right: 6px;color: red;z-index: 0;"></span>');
		this.errorEl.appendTo(this.el);
		
		this.validate = new lyb.Validate();
		
		this._renderButton();
	},
	_initField: function() {
		this.valueField = lyb.getValid(this.valueField, 'id');
		this.textField = lyb.getValid(this.textField, 'value');
		this.keyWordsField = lyb.getValid(this.keyWordsField, 'keyWords');
		this.showEmpty = this.showEmpty === false ? false : true;
		this.checkedField = lyb.getValid(this.checkedField, '_checked');
		this.autoLoad = this.autoLoad === false ? false : true;
		this.allowMatcher = this.allowMatcher === true ? true : false;
		this.disabled = this.disabled === true ? true : false;
		this.readonly = this.readonly === true ? true : false;
		this.value = lyb.getValid(this.value, '');
		this.url = lyb.getValid(this.url, '');
		this.data = lyb.getValid(this.source, []);
		this.parameters = {};
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['url', 'valueField', 'textField', 'keyWordsField', 'checkedField'],
			bool: ['autoLoad', 'showEmpty', 'allowMatcher', 'allowMulti', 'required', 'disabled', 'readonly'],
			json: ['source']
		}, attributes);
		return lyb.ListBox.superClass._getAttrs.call(this, attrs);
	},
	_setParameters: function(param){
		this.parameters = param || {};
	},
	_load: function(){
		if(this.url){
			var params = this.parameters;
			if(this[this.keyWordsField] && this[this.keyWordsField] != '')
				params[this.keyWordsField] = this[this.keyWordsField];
			lyb.ajax({
				url: ctx + this.url,
				data: params,
				context: this,
				success: this._success
			});
		}else{
			this._success({data: this.data})
		}
	},
	_success: function(result){
		this.data = result.data || [];
		this.dataSource = new lyb.DataSource(this.data);
		if(this.showEmpty){
			var empty = this._makeEmptyNode();
			empty && this.dataSource.getData().unshift(empty);
		}
		if(this.value != ''){
			var _result = this._valueCovertToNode(this.value);
			if(_result[0]){
				this._changeSelected(_result);
			}
		}
		this._fire('loadsuccess', {text: this.text, value: this.value, sender: this, source: this, result: result});
		this._render();
	},
	_makeEmptyNode: function(){
		var node = {_uuid: lyb.getUUID(), _empty: true};
		node[this.textField] = '请选择...';
		node[this.valueField] = '';
		return node;
	},
	_renderButton: function(){
		if(this.allowMulti){
			this.borderEl.append('<div class="buttons"><div class="check-all-border"><i class="icon icon-check-empty"></i>全选</div><a class="button-sure">确定</a></div>');
		}
	},
	_render:function(){
		var array = [], data = this.dataSource.getData();
		var checkStatus = true;
		for(var i = 0;i < data.length;i++){
			var node = data[i];
			if(node[this.textField] != '' && this[this.keyWordsField] && node[this.textField].indexOf(this[this.keyWordsField]) ==-1){
				continue;
			}
			array.push('<div id="listbox$'+ node._uuid +'" class="' + this._getBoxNodeCls(node));
			if(node[this.checkedField]){
				array.push(' selected');
			}
			if(node._empty){
				array.push(' empty');
			}
			var checkhtml = '';
			if(!node._empty && this.allowMulti){
				if(node[this.checkedField]){
					checkhtml = '<i class="icon icon-check"></i>';
				}else{
					checkhtml = '<i class="icon icon-check-empty"></i>';
				}
			}
			array.push('" style="position: relative;'+ (node._hide ? 'display: none;' : '') +'">');
			array.push(checkhtml + this._renderNodeCell(node) +'</div>');
			
			if(!node[this.checkedField] && !node._empty){
				checkStatus = false;
			}
		}
		this.listBoxEl.html(array.toString()); 
		
		var all = jQuery('.check-all-border', this.el);
		if(checkStatus){
			all['addClass']('checked').html('<i class="icon icon-check"></i>全选');
		}else{
			all['removeClass']('checked').html('<i class="icon icon-check-empty"></i>全选');
		}
	},
	_getBoxNodeCls: function(node){
		var cls = 'listbox-node';
		if(this.allowMulti && !node._empty){
			cls  = 'multi ' + cls;
		}
		if(node._disabled){
			cls += ' disabled';
		}
		return cls;
	},
	_renderNodeCell: function(node){
		if(this.allowMatcher && this[this.keyWordsField] != '')
			return node[this.textField].toString().replace(new RegExp(this[this.keyWordsField], 'g'), '<font class="matcher">' + this[this.keyWordsField] + '</font>');
		else
			return node[this.textField];
	},
	_destroy: function(){
		this._un(this.el);
		this._un(this.borderEl);
		lyb.ListBox.superClass._destroy.call(this);
	},
	_bindEvents:function(){
		this._on(this.el, '.listbox-node', 'click', this._onChangeItem, this);
		this._on(this.el, '.listbox-border', 'click', this._onListBorderClick, this);
		this._on(this.el, '.button-sure', 'click', this._onSureButtonClick, this);
		this._on(this.el, '.check-all-border', 'click', this._onCheckAllClick, this);
	},
	_onCheckAllClick:function(e){
		e.stopPropagation();
		if(!this.readonly && !this.disabled){
			var el = e.selector;
			var status = true;
			if(el.hasClass('checked')){
				status = false;
				el.removeClass('checked');
			}else{
				el.addClass('checked');
			}
			var data = this.dataSource.getData();
			for(var index in data){
				!data[index]._empty && (data[index][this.checkedField] = status);
			}
			this._render();
			e.value = this.value = this._getValue();
			e.text = this.text = this._getText();
			e.nodes = data;
			this._fire('change', e);
		}
	},
	_onSureButtonClick:function(e){
		e.stopPropagation();
		this.hide();
		e.value = this.value = this._getValue();
		e.text = this.text = this._getText();
		this._fire('sure', e);
	},
	_onListBorderClick:function(e){
		e.stopPropagation();
	},
	_onChangeItem:function(e){
		if(this.disabled || this.readonly){
			return;
		}
		var _value = this.value;
		var selector = e.selector;
		var uuid = selector[0].id.split("$")[1];
		var node = this._getNodeByUUID(uuid);
		if(node._disabled){
			return;
		}
		var value = node[this.valueField];
		this._changeSelected([node]);
		e.value = this.value;
		e.text = this.text;
		e.nodes = this._getSelectedNodes();
		if(this.value != _value){
			this._fire('change', e);
		}
		this._fire('click', e);
	},
	_getSelectedNodes: function(){
		var data = this.dataSource.getData();
		var nodes = [];
		for(var i = 0;i < data.length;i++){
			var node = data[i];
			if(!node._empty && node[this.checkedField]){
				nodes.push(node);
			}
		}
		return nodes;
	},
	_getSelectedRows: function(){
		return this.__getSelectedNodes();
	},
	_changeSelected: function(array, status){
		var data = this.dataSource.getData();
		for(var i = 0;i < data.length;i++){
			var _node = data[i];
			for(var j=0;j<array.length;j++){
				var node = array[j];
				if(node._empty && !_node._empty){
					_node[this.checkedField] = false;
					continue;
				}
				if(!this.allowMulti){
					_node[this.checkedField] = false;
				}
				if(_node._uuid == node._uuid){
					_node[this.checkedField] = status !== undefined ? status : !_node[this.checkedField];
				}
				if(_node._empty && _node[this.checkedField]){
					delete _node[this.checkedField];
				}
			}
		}
		this.value = this._getValue();
		this.text = this._getText();
		this._render();
	},
	_getData:function(){
		return this.dataSource.getData();
	},
	_valueCovertToNode: function(value){
		if(!value && value !== '' && value !== 0 || !this.dataSource){
			return [];
		}
		value = value.toString().replace(/[\s+,|,\s+]/g, ',');
		var result = [];
		var array = value.toString().split(','), data = this.dataSource.getData();
		for(var i = 0;i < data.length;i++){
			var node = data[i];
			_value = node[this.valueField];
			var type = jQuery.type(_value) || 'string';
			for(var j=0;j<array.length;j++){
				var value = array[j];
				if(type == 'number'){
					var value = value === '' ? '' : Number(value);
					if(!isNaN(value) && value === _value){
						result.push(lyb.clone(node));
					}
				}else{
					var value = String(value);
					if(value === _value){
						result.push(lyb.clone(node));
					}
				}
			}
		}
		return result;
	},
	_setData: function(data){
		this.data = data;
		this._success({data: this.data});
	},
	_getValue:function(field){  
		field = lyb.getValid(field, this.valueField);
		var result = [], data = this.dataSource.getData();
		for(var i = 0;i < data.length;i++){
			var node = data[i];
			if(node[this.checkedField]){
				result.push(node[field]);
			}
		}
		return result.join();
	},
	_getText: function(){
		return this._getValue(this.textField);
	},
	_setValue: function(value) {
		value = value.toString().replace(/^,|,$/g, '');
		var _value = this.value;
		this.value = value;
		var result = this._valueCovertToNode(value);
		if(result[0]){
			this._changeSelected(this._getSelectedNodes(), false);
			this._changeSelected(result, true);
			
			var e = {};
			e.value = this.value;
			e.text = this.text;
			e.nodes = this._getSelectedNodes();
			if(this.value != _value){
				this._fire('change', e);
			}
		}
	},
	_show: function(el) {
		if(el && el[0]){
			var win = jQuery(document.body);
			var height = win.height();
			var btnsHeight = this.allowMulti ? 27 : 0;
			var offset = el.offset();
			var thatElHeight = this.el.outerHeight(true);
			var elHeight = el.height();
			
			if(height - elHeight - offset.top >= thatElHeight){
				this.el.slideDown('fast', function(){jQuery(window).resize();});
			}else if(offset.top >= thatElHeight || height - elHeight < offset.top){
				this._noslide = true;
				this.el.css('top', 2 - thatElHeight);
				this.el.show();
			}
		}else{
			this.el.slideDown('fast', function(){jQuery(window).resize();});
		}
	},
	_hide: function() {
		if(this._noslide)
			this.el.hide();
		else
			this.el.slideUp('fast');
		this.el.css('height', 'auto');
		this.listBoxEl.css('height', 'auto');
	},
	_setKeyWords: function(keyWords){
		this[this.keyWordsField] = keyWords;
	},
	_setBoxStatus: function(type, status){
		this[type] = status;
		if(status){
			this.borderEl.addClass(type);
		}else{
			this.borderEl.removeClass(type);
		}
	},
	_setReadonly: function(status){
		this._setBoxStatus('readonly', status);
	},
	_setDisabled: function(status){
		this._setBoxStatus('disabled', status);
	},
	_setUrl: function(url){
		this.url = url;
	},
	setUrl: function(url){
		this._setUrl(url);
	},
	setKeyWords: function(keyWords){
		this._setKeyWords(keyWords);
	},
	show: function(){
		this._show();
	},
	hide: function(){
		this._hide();
	},
	getText: function(){
		return this._getText();
	},
	setValue: function(value) {
		this._setValue(value);
	},
	setData: function(data){
		this._setData(data);
	},
	reload: function(){
		this._load();
	},
	getValue: function(){
		return this._getValue();
	},
	destroy: function(){
		this._destroy();
	},
	setReadonly: function(status){
		this._setReadonly(status);
	},
	setDisabled: function(status){
		this._setDisabled(status);
	}
});
lyb.Register(lyb.ListBox, 'listbox');