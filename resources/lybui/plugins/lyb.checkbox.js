//TODO 复选按钮控件
lyb.CheckBox = function(id){
	lyb.CheckBox.superClass.constructor.call(this, id);
};
lyb.extend(lyb.CheckBox, lyb.ListBox,{
	type:'checkbox',
	_makeEmptyNode: function(){
		var node = {_uuid: lyb.getUUID(), _empty: true};
		node[this.textField] = '请选择...';
		node[this.valueField] = '';
		node['_hide'] = true;
		return node;
	},
	_getBoxNodeCls: function(node){
		return 'listbox-node inline-node' + (node._empty ? '' : ' box-node') + (node[this.checkedField] ? ' checked' : '');
	},
	_renderNodeCell: function(node){
		var html = '';
		if(!node._empty){
			if(node[this.checkedField]){
				html += '<i class="icon icon-check"></i>';
			}else
				html += '<i class="icon icon-check-empty"></i>';
		}
		html += node[this.textField];
		return html;
	},
	_onChangeItem:function(e){
		lyb.CheckBox.superClass._onChangeItem.call(this, e);
		this._validate();
	},
	_changeSelected: function(array, e){
		var data = this.dataSource.getData();
		for(var i = 0;i < data.length;i++){
			var _node = data[i];
			for(var j=0;j<array.length;j++){
				var node = array[j];
				if(_node._uuid == node._uuid){
					_node[this.checkedField] = !_node[this.checkedField];
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
	validateBox: function(){
		this._validate();
	}
});
lyb.Register(lyb.CheckBox, 'checkbox');