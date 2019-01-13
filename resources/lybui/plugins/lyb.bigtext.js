//TODO input控件
lyb.BigText = function(id) {
	lyb.BigText.superClass.constructor.call(this, id);
};
lyb.extend(lyb.BigText, lyb.TextBox, {
	type : 'bigtext',
	_renderEditor : function() {
		var readonly = this.readonly ? 'readonly="readonly"' : '';
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		var maxValue = this.max ? 'maxLength="' + this.max + '"' : '';
		return '<textarea class="textbox" '+ readonly +' '+ disabled +' style="background: transparent;border:none;resize: none;">' + this.value + '</textarea>';
	}
});
lyb.Register(lyb.BigText, 'bigtext');