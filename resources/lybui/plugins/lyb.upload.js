//TODO 文本框控件
lyb.Upload = function(id) {
	lyb.Upload.superClass.constructor.call(this, id);
};
lyb.extend(lyb.Upload, lyb.PopupEdit, {
	type: 'upload',
	_init: function() {
		lyb.Upload.superClass._init.call(this);
		this._render();
	},
	_initField: function() {
		this._uploadStatus = false;
		this.files = [];
		lyb.Upload.superClass._initField.call(this);
		this.maxSize = 6;
		this.updateStatus = true;
	},
	_render: function(){
		this._renderUploadEl();
		this.progressEl = jQuery('<div class="progressbar" style="position: relative;bottom: 2px;height: 2px;width: 100%;"></div>')
		if(this.allowMulti){
			this.borderEl.css('height', 'auto');
			this._renderMultiGrid();
			this.textEl.hide();
			this.progressEl.hide();
		}else{
			
		}
		this.progressEl.appendTo(this.borderEl);
	},
	_renderMultiGrid: function(){
		var uuid = lyb.getUUID();
		jQuery('<div id="'+ uuid +'" data-allow-pager="false" data-auto-load="false" class="lyb-datasheet"></div>').appendTo(this.borderEl);
//		lyb.parse(uuid);
//		this.uploadGrid = lyb.get(uuid);
		this.uploadGrid = new lyb.DataSheet(uuid);
		var columns = [ {
			title : '名称',
			column : 'name'
		}, {
			title : '大小',
			column : 'size'
		}, {
			title : '进度',
			column : 'progress',
			rerender: function(e){
				var percent = e.percent || 0;
				var html = '<div class="progressbar" style="height: 12px;border: solid 1px #ccc;position: relative;border-radius: 6px;overflow: hidden;top: 50%;margin-top: -6px;">';
				html += '<div class="progress-color" style="width: '+ percent +'%;height: 100%;background: #a1daf5;"></div>';
				html += '<div style="width: 100%;height: 100%;position: absolute;top: 0;line-height: 12px;font-size: 12px;">'+ percent +'%</div>';
				html += '</div>';
				return html;
			}
		} ];
		this.uploadGrid.setColumns(columns);
	},
	_renderProgressbar: function(percent){
		percent = Number(percent || 0) || 0;
		return '<div class="progress-color" style="width: '+ percent +'%;height: 100%;background: #a1daf5;"></div>';
	},
	_renderUploadEl: function(){
		if(this.fileEl && this.fileEl[0]){
			this.fileEl.remove();
		}
		this.files = [];
		
		var multi = '', accept = '';
		if(this.allowMulti){
			multi = 'multiple="multiple"';
		}
		if(this.accept){
			accept = 'accept="'+ this.accept +'"';
		}
		this.fileEl = jQuery('<input type="file" '+ multi +' '+ accept +' class="uploader" style="display: none;"/>').appendTo(this.borderEl);
	},
	_renderEditButton: function(type){
		var html = '<span class="edit-button">';
		if(!this.allowMulti)
			html += '<a class="icon clear" href="javascript: void(0);"></a>';
		html += '<i class="icon icon-paper-clip" href="javascript: void(0);"></i></span>';
		return html;
	},
	_renderEditor: function(){
		var disabled = this.disabled ? 'disabled="disabled"' : '';
		return '<input type="text" class="textbox" readonly="readonly" '+ disabled +' value="' + this.value + '" style="background: transparent;border:none;"/>';
	},
	_upload: function(){
		var that = this;
		var files = this.files;
		for(var i=files.length - 1;i >= 0;i--){
			var _file = files[i];
			(function(file){
				var formData = new FormData(); 
				formData.append("file", file._file);
				var xhr = new XMLHttpRequest();
				xhr.upload.addEventListener("progress", function(event){that._onProgress.call(that, event, file)}, false);
				xhr.addEventListener("loadstart", function(event){that._onStart.call(that, event, file)}, false);
				xhr.addEventListener("load", function(event){that._onComplete.call(that, event, file)}, false);
				xhr.addEventListener("error", function(event){that._onFailed.call(that, event, file)}, false);
				xhr.open("POST", that.url, true);//修改成自己的接口
				xhr.setRequestHeader("Cache-Control", "no-cache"); 
				xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"); 
				xhr.send(formData);
				formData = null;
				xhr = null;
			})(_file);
		}
	},
	_onStart: function(event, file){
		this._uploadStatus = true;
		this._fire('uploadstart', event, file);
	},
	_onFailed: function(event, file){
		this._uploadStatus = false;
		this._fire('uploaderror', event, file);
	},
	_onComplete: function(event, file){
		this._fire('uploadcomplete', event, file);
	},
	_onProgress: function(event, file){
		var percent = 0;
		if (event.lengthComputable) {
			percent = Math.ceil((event.loaded / event.total) * 100);
		} else {
			console.log("Can't determine the size of the file.");
		}
		if(this.allowMulti){
			var selector = '#' + file._uuid + '\\$text\\$' + file._rowIndex + '\\$3';
			jQuery(selector, this.uploadGrid.el).html(this.uploadGrid._getColumnByField('progress').rerender({percent: percent}));
		} else {
			this.progressEl.html(this._renderProgressbar(percent));
		}
	},
	_addFile: function(file){
		for(var index=0,length=this.files.length;index<length;index++){
			var _file = this.files[index];
			if(_file.name === file.name && _file.size === file.size && _file.type === file.type)
				return;
		}
		this.files.push(file);
	},
	_renderFileInfo: function(files, sliceSize){
		if(files && files[0]){
			if(this.allowMulti){
				for (var i = 0; i < sliceSize; i++) {
					var file = files[i];
					var size = 0;
					if (file.size > 1024 * 1024)
						size = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
					else
						size = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
					this._addFile({
						_uuid: lyb.getUUID(),
						_file: file,
						name: file.name,
						size: size,
						type: file.type,
						progress: 0
					});
				}
			}
			else{
				var file = files[0];
				var size = 0;
			    if (file.size > 1024 * 1024)
			    	size = (Math.round(file.size * 100 / (1024 * 1024)) / 100).toString() + 'MB';
			    else
			    	size = (Math.round(file.size * 100 / 1024) / 100).toString() + 'KB';
				this.files = [{
					_uuid: lyb.getUUID(),
					_file: file,
					name: file.name,
					size: file.size,
					type: file.type,
					progress: 0
				}];
			}
			if(this.allowMulti){
				for (var i = 0; i < this.files.length; i++) {
					var file = this.files[i];
					file._rowIndex = i;
					//render list
					this.uploadGrid.setData(this.files);
				}
			}else{
				var file = files[0];
				this.setValue(file.name);
			}
		}
	},
	_bindEvents:function(){
		lyb.Upload.superClass._bindEvents.call(this);
		this._on(this.el, '.uploader', 'change', this._onUploadElChange, this);
	},
	_onClearClick: function(e) {
		e.stopPropagation();
		this.value = '';
		this._renderUploadEl();
		this._setValue('');
		if(this._setText) {
			this.text = '';
			this._setText('');
		}
		this._validate(this.files.length || '');
		this._fire('clear', e);
	},
	_onUploadElChange: function(e){
		this.progressEl.html(this._renderProgressbar(0));
		var el = e.selector;
		var files = el[0].files || [];
		var size = this.files.length;
		var _size = files.length;
		if(size + _size > this.maxSize){
			this._renderFileInfo(files, this.maxSize - size);
			alert('最多同时上传' + this.maxSize + '个文件!');
		}else{
			this._renderFileInfo(files, files.length);
		}
	},
	_onEditButtonClick : function(e) {
		var size = this.files.length;
		if(size > this.maxSize){
			alert('最多同时上传' + size + '个文件!');
		}else{
			if(!this._uploadStatus)
				this.fileEl.trigger('click');
		}
		this._fire('buttonclick', e);
	},
	_onValueChange:function(e){
		var selector = e.selector;
		var value = selector.val();
		this._validate(value);
		this.value = value;
		e.value = value;
		this._fire('change', e);
	},
	_destroy: function(){
		lyb.Upload.superClass._destroy.call(this);
	},
	_getValue:function(){                                                                                                    
		return this.value;
	},
	_setValue: function(value) {
		this.value = value;
		this.textEl.val(this.value);
		this._togglePlaceHolder(value);
		this._writeMessage(value);
	},
	_getFiles: function(){
		if(lyb.HTML5)
			return this.fileEl[0].files;
		else
			return [];
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['accept', 'url'],
			json: [],
			bool: ['allowMulti'],
			number: []
		}, attributes);
		return lyb.Upload.superClass._getAttrs.call(this, attrs);
	},
	getFiles: function(){
		return this._getFiles();
	}
});
lyb.Register(lyb.Upload, 'upload');