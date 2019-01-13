//TODO 表格下拉框控件
lyb.GridBox = function(id) {
	lyb.GridBox.superClass.constructor.call(this, id);
};
lyb.extend(lyb.GridBox, lyb.ListBox, {
	type: 'gridbox',
	_init: function() {
		this.borderEl = jQuery('<div class="gridbox-border" onselectstart="return false;" style="-moz-user-select:none;"></div>');
		this.borderEl.appendTo(this.el);
		var gridID = lyb.getUUID();
		this.listBoxEl = jQuery('<div id="'+ gridID +'" class="lyb-datasheet" data-auto-load="false" data-allow-pager="false" data-allow-multi="false" style="min-width: 510px;height: 300px;"></div>'); 
		this.listBoxEl.appendTo(this.borderEl);
		this.gridBox = new lyb.DataSheet(gridID, this.el);
		this._filterCheckColumn();
		if(this.url)
			this.gridBox.url = this.url;
		this.gridBox.setColumns(this.columns);
	},
	_initField: function() {
		lyb.GridBox.superClass._initField.call(this);
		this.columns = lyb.getValid(this.columns, []);
		this.keyWordsField = lyb.getValid(this.keyWordsField, 'keyWords');
		this.matcherFields = lyb.getValid(this.matcherFields, []);
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['url', 'keyWordsField'],
			bool: [],
			json: ['columns', 'matcherFields']
		}, attributes);
		return lyb.GridBox.superClass._getAttrs.call(this, attrs);
	},
	_load: function(){
	},
	_setUrl: function(url){
		this.gridBox._setUrl(url);
	},
	_setParameters: function(param){
		this.gridBox._setParameters(param || {});
	},
	_render: function(keyWords){
		if(jQuery.type(keyWords) == 'string')
			this.gridBox.parameters[this.keyWordsField] = keyWords;
		else
			lyb.concat(this.gridBox.parameters, keyWords);
		this.gridBox._load();
	},
	_destroy: function(){
		this.gridBox._destroy();
		lyb.GridBox.superClass._destroy.call(this);
	},
	_filterCheckColumn: function(){
		var that = this;
		for(var index=0,len=this.columns.length;index<len;index++){
			var column = this.columns[index];
			var field = column['field'];
			if(this.matcherFields.indexOf(field) !== -1){
				column.rerender = (function(){
					return function(e){
						var value = e.value;
						if(that.keyWords)
							return value.replace(new RegExp(that.keyWords, 'g'), '<font class="matcher">' + that.keyWords + '</font>');
						return value;
					};
				})();
			}
			if(column.type == 'checkbox'){
				this.columns.splice(index, 1);
				index--;
				len = --len;
			}
		}
	},
	_bindEvents:function(){
		this._on(this.el, '.gridbox-border', 'click', this._onListBorderClick, this);
		this.gridBox.bind('clickrow', this._fireChange, this);
		this.gridBox.bind('checkrow', this._fireChange, this);
		this.gridBox.bind('checkallrows', this._onCheckAllClick, this);
		this.gridBox.bind('loadsuccess', this._onLoadSuccess, this);
	},
	_onLoadSuccess: function(e){
		e.sender = this;
		var result = this._valueCovertToNode(this.value);
		this.gridBox._checkRows(result, true);
		e.nodes = e.source._getSelectedRows();
		e.value = this._getValue();
		e.text = this.text;
		if(e.text == ''){
			e.text = this.keyWords;
		}
		this._fire('loadsuccess', e);
	},
	_fireChange: function(e){
		e.stopPropagation();
		e.sender = this;
		e.nodes = e.source._getSelectedRows();
		e.value = this._getValue();
		e.text = this._getText();
		this._fire('change', e);
	},
	_onCheckAllClick:function(e){
		e.stopPropagation();
		e.sender = this;
		e.nodes = e.rows;
		e.value = this._getValue();
		e.text = this._getText();
		this._fire('change', e);
	},
	_onListBorderClick:function(e){
		e.stopPropagation();
	},
	_changeSelected: function(array){
//		this.gridBox._checkRowsByField(array, this.valueField);
	},
	_getSelectedNodes: function(){
		var data = this.gridBox._getData();
		var nodes = [];
		for(var i = 0;i < data.length;i++){
			var node = data[i];
			if(!node._empty && node._checked){
				nodes.push(node);
			}
		}
		return nodes;
	},
	_setData: function(data){
		this.gridBox._setData(this.data);
	},
	_valueCovertToNode: function(value){
		if(!value && value !== '' && value !== 0 || !this.gridBox.dataSource){
			return [];
		}
		value = value.toString().replace(/[\s+,|,\s+]/g, ',');
		var result = [];
		var array = value.toString().split(',');
		for(var j=0;j<array.length;j++){
			var value = array[j];
			var node = this.gridBox._getNodeByUUID(value, this.valueField);
			if(node)
				result.push(node);
		}
		return result;
	},
	_getValue:function(field){  
		field = lyb.getValid(field, this.valueField);
		var result = [], data = this.gridBox._getSelectedRows();
		for(var i = 0;i < data.length;i++){
			var node = data[i];
			if(node._checked){
				result.push(node[field]);
			}
		}
		return result.join();
	},
	_show: function(el) {
		var that = this;
		lyb.GridBox.superClass._show.call(this);
	},
	_hide: function() {
		if(this._noslide)
			this.el.hide();
		else
			this.el.slideUp('fast');
		this.el.css('height', 'auto');
	}
});
lyb.Register(lyb.GridBox, 'gridbox');