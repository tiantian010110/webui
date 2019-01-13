//TODO 文本框控件
lyb.HideBox = function(id) {
	lyb.HideBox.superClass.constructor.call(this, id);

};
lyb.extend(lyb.HideBox, lyb.TextBox, {
	type: 'hidebox',
	_init: function(){
		lyb.HideBox.superClass._init.call(this);
		this.el.hide();
	},
	_renderEditor: function(){
		return '<input type="hidden" class="textbox" value="' + this.value + '" style="background: transparent;border:none;"/>';
	},
	_bindEvents:function(){
	}
});
lyb.Register(lyb.HideBox, 'hidebox');