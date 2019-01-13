//TODO input控件
lyb.BigText = function(id) {
	lyb.BigText.superClass.constructor.call(this, id);
};
lyb.extend(lyb.BigText, lyb.TextBox, {
	type : 'password',
	_renderEditor: function(){
		var readonly = this.readonly ? 'readonly="readonly"' : '';
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		return '<input type="password" class="textbox" '+ readonly +' '+ disabled +' value="' + this.value + '" style="background: transparent;border:none;"/>';
	}
});
lyb.Register(lyb.BigText, 'password');