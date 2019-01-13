//TODO 表单控件
lyb.Form = function(id) {
	lyb.Form.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Form, lyb.Root, {
	type : 'form',
	_init : function() {
		this.el.css('position', 'relative');
		this.loadingEl = jQuery('<div style="display: none;"><div class="loading-mask" style="position: absolute;display: flex;align-items: center;justify-content: center;"><div class="loading-loader"></div></div></div>');
		this.loadingEl.appendTo(this.el);
	},
	_initField : function() {
		this.url = lyb.getValid(this.url, '');
		this.isLoading = false;
	},
	_getAttrs : function(attributes) {
		var attrs = lyb.concat({
			str : [],
			bool : [],
			number : [],
			css : []
		}, attributes);
		return lyb.Form.superClass._getAttrs.call(this, attrs);
	},
	_load : function(options) {
		if(this.isLoading){
			lyb.info('请求处理中, 请勿重复操作...');
			return;
		}
		this.isLoading = true;
		this.loadingEl.show();
		lyb.ajax({
			url : ctx + (options.url || this.url),
			data : options.parameters || {},
			context : this,
			success : this._success,
			complete: this._complete
		});
	},
	_complete: function(e){
		this.isLoading = false;
		this.loadingEl.hide();
	},
	_success : function(result) {
		var that = this;
		// TODO 处理数据
		result.data = result.data || {};
		if(jQuery.type(result.data) == 'array'){//兼容数组处理
			result.data = result.data[0] || {};
		}
		this.orignalData = lyb.clone(result.data);
		var e = {data: result.data, sender: this, source: this, success: result.success};
		var historyAction = this.currentAction;
		if(result.success){
			if(this.currentAction == 'create') {
				this.currentAction = 'save';
			}else if(this.currentAction == 'query') {
				this._setData(result.data);
				this.currentAction = 'update';
			}else if(this.currentAction == 'save' || this.currentAction == 'update') {
				this.currentAction = 'update';
				lyb.success(result.msg, function(){
					e.type = 'success';
					that.callback && that.callback(e);
				});
			}
		}else {
			lyb.error(result.msg, function(){
				e.type = 'error';
				that.callback && that.callback(e);
			});
		}
		this._fire(historyAction + 'success', e);
	},
	_findChildren : function() {
		var children = [];
		var els = jQuery('*[class^=lyb-]', this.el).toArray();
		for ( var index in els) {
			var el = els[index];
			var id = el.id;
			var component = lyb.get(id);
			component && children.push(component);
		}
		return children;
	},
	_setData : function(data) {
		data = data || {};
		var children = this._findChildren();
		for ( var index in children) {
			var component = children[index];
			if(component && component._setValue && component.name){
				var value = lyb.getValid(data[component.name], '');
				if(jQuery.type(value) == 'string' && value.indexOf(',') != -1 && component.type != 'listbox' && component.type != 'radiobox' && component.type != 'checkbox'){
					var array = value.split(',');
					var _value = array[0];
					component._setValue(_value);
					array.shift();
					data[component.name] = array.join(',');
				}else {
					component._setValue(value);
				}
			}
		}
	},
	_getData : function() {
		var children = this._findChildren();
		var formData = {};
		for ( var index in children) {
			var child = children[index];
			if(child.name && !child.disabled && child.type !== 'upload'){
				var value = formData[child.name];
				if(value && value !== ''){
					formData[child.name] += ',' + child.getValue();
				}else
					formData[child.name] = child.getValue();
			}else if (child.type === 'upload'){
				var files = child._getFiles();
				var len=files.length;
				if(len == 1){
					formData[child.name] = files[0];
				}else
					for(var i=0;i<len;i++){
						var file = files[i];
						formData[child.name + '[' + i + ']'] = file;
					}
			}

		}
		return formData;
	},
	_validate : function() {
		var children = this._findChildren();
		var result = true;
		for ( var index in children) {
			var comp = children[index];
			if (comp._validate) {
				var _result = comp._validate();
				result = result && _result;
			}
		}
		return result;
	},
	_bindEvents : function() {

	},
	_create : function(url, parameters, callback) {
		if(jQuery.type(parameters) == 'function'){
			this.callback = parameters;
			parameters = {};
		}
		this._query(url, parameters, 'create');
	},
	_update : function(url, parameters, callback) {
		if(jQuery.type(parameters) == 'function'){
			this.callback = parameters;
			parameters = {};
		}
		this._save(url, parameters, 'update');
	},
	_save : function(url, parameters, currentAction, callback) {
		if(jQuery.type(parameters) == 'function'){
			this.callback = parameters;
			parameters = {};
		}
		var result = this._validate();
		if (!result) {
			return false;
		}
		var formData = jQuery.extend(this._getData(), parameters);
		this.currentAction = 'save';
		this._load({
			url : url,
			parameters : formData
		});
		return true;
	},
	_query: function(url, parameters, currentAction, callback){
		if(jQuery.type(parameters) == 'function'){
			this.callback = parameters;
			parameters = {};
		}
		this.currentAction = 'query';
		this._load({
			url : url,
			parameters : parameters
		});
	},
	_submit: function(url, parameters, callback){
		if(jQuery.type(parameters) == 'function'){
			this.callback = parameters;
			parameters = {};
		}
		this.currentAction = this.currentAction || 'update';
		this[ '_' + this.currentAction](url, parameters);
	},
	_reset:function(){
		var children = this._findChildren();
		for ( var index in children) {
			var component = children[index];
			if(component && component._setValue)
				component._setValue('');
		}
	},
	getData : function() {
		return this._getData();
	},
	save : function(url, parameters, callback) {
		this._save(url, parameters, callback);
	},
	create : function(url, parameters, callback) {
		this._create(url, parameters, callback);
	},
	validate : function(){
		return this._validate();
	},
	update : function(url, parameters, callback) {
		this._update(url, parameters, callback);
	},
	query : function(url, parameters, callback) {
		this._query(url, parameters, callback);
	},
	reset : function(){
		this._reset();
	},
	submit: function(url, parameters, callback) {
		this._submit(url, parameters, callback);
	},
	getAllEditors: function(){
		return this._findChildren();
	},
	setData: function(data){
		this._setData(data);
	}
});
lyb.Register(lyb.Form, 'form');