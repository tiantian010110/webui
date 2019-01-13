
//TODO 单选按钮控件
lyb.RadioBox = function(id) {
	lyb.RadioBox.superClass.constructor.call(this, id);
};
lyb.extend(lyb.RadioBox, lyb.CheckBox,{
	type:'radiobox',
	_renderNodeCell: function(node){
		var html = '';
		if(!node._empty){
			if(node[this.checkedField]){
				html += '<i class="icon icon-circle"></i>';
			}else
				html += '<i class="icon icon-circle-blank"></i>';
		}
		html += node[this.textField];
		return html;
	},
	_changeSelected: function(array, e){
		var ctrlKey = e ? e.ctrlKey : false;
		var data = this.dataSource.getData();
		for(var i = 0;i < data.length;i++){
			var _node = data[i];
			for(var j=0;j<array.length;j++){
				var node = array[j];
				_node[this.checkedField] = false;
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
	}
});
lyb.Register(lyb.RadioBox, 'radiobox');



