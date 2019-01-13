//TODO 数据表格
lyb.DataSheet = function(id){
	lyb.DataSheet.superClass.constructor.call(this, id);
};
lyb.extend(lyb.DataSheet, lyb.Root,{
	type:'datasheet',
	_init:function(){	
		this._parseColums();
		
		this.borderEl = jQuery('<div class="datasheet-border" style="position: relative;height: 100%;"></div>');
		this.borderEl.appendTo(this.el);
		this.headBorderEl = jQuery('<div class="viewgrid-border rows-head" style="position: relative;"></div>');
		this.headBorderEl.appendTo(this.borderEl);
		
		this.columnSettingsEl = jQuery('<div class="column-settings" style="position: absolute;top: 0;bottom: 0;width: 16px;right: 0;z-index: 1;display: flex;align-items: center;"><i class="icon icon-columns" style="margin: auto;"></i></div>');
		this.columnSettingsEl.appendTo(this.headBorderEl);
		!this.allowSetting && this.columnSettingsEl.hide();
		
		this.viewHeadBorderEl = jQuery('<div class="viewhead-border" style="overflow: hidden;"></div>');
		this.viewHeadBorderEl.appendTo(this.headBorderEl);
		this.viewHeadEl = jQuery('<table class="table table-hover datasheet-head"></table>');
		this.viewHeadEl.appendTo(this.viewHeadBorderEl);
		this.viewBorderEl = jQuery('<div class="viewgrid-border rows-content" style="'+ this.flexBody +'top: 41px;left: 0;right: 0;bottom: 41px;"></div>');
		this.viewBorderEl.appendTo(this.borderEl);
		this.viewEl = jQuery('<table class="table table-hover datasheet-view" style="width: 100%;"></table>');
		this.viewEl.appendTo(this.viewBorderEl);
		this.loadingEl = jQuery('<div style="display: none;"><div class="loading-mask" style="position: absolute;display: flex;align-items: center;justify-content: center;"><div class="loading-loader"></div></div></div>');
		this.loadingEl.appendTo(this.borderEl);
		this.hideHeadEl = jQuery('<thead class="hide-head"></thead>');
		this.hideHeadEl.appendTo(this.viewEl);
		this.viewBodyEl = jQuery('<tbody class="view-body"></tbody>');
		this.viewBodyEl.appendTo(this.viewEl);
		this.footEl = jQuery('<div class="datasheet-foot" style="'+ this.flexBody +'left: 0;right: 0;bottom: 0;"></div>');
		this.footEl.appendTo(this.borderEl);
		this.resizePanelEl = jQuery('<div class="resize-panel" style="display: none;"></div>');
		this.resizePanelEl.appendTo(this.borderEl);
		
		this._setShowHeader(this.showHeader);
		this._setShowPager(this.allowPager);
		
		this.borderEl.append('<div style="clear: both;"></div>');
		
		var pageUUID = lyb.getUUID();
		this.footEl.html('<div id="'+ pageUUID +'" class="lyb-pager"></div>');
		this.pager = new lyb.Pager(pageUUID);
		
		var settingsUUID = lyb.getUUID();
		this.columnSettingsEl.append('<div id="'+ settingsUUID +'" class="lyb-listbox" data-allow-multi="true" data-show-empty="false" style="position: absolute;right: -1px;display: none;"></div>');
		this.columnSettings = new lyb.ListBox(settingsUUID);
		
		this.columns[0] && this._setColumns(this.columns);
		
		lyb.globalEvents.pushEvent([this.update, this, this._uuid], 'resize');
		lyb.globalEvents.pushEvent([this.__hideElement, this, this._uuid], 'click');
	},
	_initField: function() {
		this.value = lyb.getValid(this.value, '');
		this.prefix = lyb.getValid(this.prefix, 'list');
		this.width = this.el[0].style.width || '180px';
		this.height = this.el[0].style.height || '20px';
		this.url = this.url ? window.ctx + this.url : undefined;
		this.allowPager = this.allowPager === false ? false : true;
		this.showIndex = this.showIndex === false ? false : true;
		this.allowMulti = this.allowMulti === false ? false : true;
		this.autoLoad = this.autoLoad === false ? false : true;
		this.flexBody = this.el[0].style.height ? 'position: absolute;' : '';
		this.splitter = {status: false};
		this.parameters = {pageSize: 20, pageNum: 1};
		this.columns = [];
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['value', 'url', 'prefix'],
			bool: ['allowPager', 'autoLoad', 'showIndex', 'allowMulti', 'allowResize', 'allowSetting', 'showHeader'],
			number: []
		}, attributes);
		return lyb.DataSheet.superClass._getAttrs.call(this, attrs);
	},
	_parseColums: function(){
		//TODO 转换表头
	},
	update: function(){
		var borderHeight = this.viewBorderEl.height();
		var height = this.viewEl.height();
		var width = this.viewEl.width();
		if(height > borderHeight){
			this.viewHeadEl.width(width);
		}else{
			this.viewHeadEl.css('width', '100%');
		}
	},
	_reload: function(){
		this._load({pageNum: 1});
	},
	_load:function(url, data){
		url = url || this.url;
		if(jQuery.type(url) == 'object'){
			data = url;
			url = this.url;
		}
		jQuery.extend(this.parameters, {pageNum: 1}, data || {});
		if(!url){
			return;
		}
		if(!this.allowPager){//不允许分页
			delete this.parameters.pageNum;
			delete this.parameters.pageSize;
		}else{//分页load时，重置pageNum
			this.pager.pageNum = this.parameters.pageNum || 1;
		}
		
		if(this.sortField){//排序
			this.parameters.sortField = this.sortField;
			this.parameters.sortType = this.sortType;
		}else{
			delete this.parameters.sortField;
			delete this.parameters.sortType;
		}
		
		this.loadingEl.show();
		lyb.ajax({
			url: url,
			data: this.parameters,
			context: this,
			success: this._success,
			complete: this._complete
		});
	},
	_setParameters: function(params){
		lyb.concat(this.parameters, params || {});
	},
	_complete: function(e){
		this.loadingEl.hide();
	},
	_success:function(result){
		this._fire("preload",{sender: this, source: this, result: result});	
		//TODO 处理数据
		this.dataSource = new lyb.DataSource(result.data || []);
		this._render();
		this._fire("loadsuccess",{sender: this, source: this, result: lyb.clone(result)});	
		if(result.total !== undefined)
			this.pager.setData(result.total);
		this.update();
	},
	_renderHeader:function(){
		var row = '<tr class="head-row">', hideRow = row;
		for(var i = 0,length = this.columns.length; i < length;i++){
			var column = this.columns[i];
			row += column._renderShowHead(this);
			hideRow += column._renderHideHead(this);
			if(row.sort && row.sortType != ''){
				this.sortField = row.field;
				this.sortType = row.sortType;
			}
		}
		row += '</tr>';
		hideRow += '</tr>';
		this.hideHeadEl.html(hideRow);
		this.viewHeadEl.html('<thead>' + row + '</thead>');
		//TODO 初始化完成后执行load数据
		this.autoLoad && this._load();
	},
	_addRows: function(rows){
		var datas = this._getData();
		var start = datas.length;
		for(var i=0,len=rows.length;i<len;i++){
			var row = rows[i];
			row._rowIndex = start + i;
			row._status = row._status || 'add'
		}
		if(!this.dataSource)
			this.dataSource = new lyb.DataSource(rows);
		else
			this.dataSource.addNodes(rows);
		this._render();
		this._fire('addrows');
	},
	_removeRows: function(rows){
		if(this.dataSource)
			this.dataSource.removeNodes(rows);
		this._render();
		this._fire('reomverows');
	},
	_render:function(){
		var html = [];
		var data = this.dataSource ? this.dataSource.getData() : [];
		for(var i = 0;i < data.length;i++){
			var row = data[i];
			row._rowIndex = i;
			html.push('<tr class="view-row'+ (row._disabled ? ' disabled' : '') +'" id="'+ row._uuid +'$row">');
			html.push(this._renderRow(row, i));
			html.push('</tr>');
		}
		this.viewBodyEl.html(html.join(''));
		this.__changeCheckAllStatus();
	},
	_renderRow: function(row){
		var html = '';
		var pageNum = this.pager.pageNum, pageSize = this.pager.pageSize;
		for(var i=0;i<this.columns.length;i++){
			var column = this.columns[i];
			html += column._renderCell(row, this);
		}
		return html;
	},
	_getRowEl: function(row){
		var uuid = row._uuid, rowIndex = row._rowIndex;
		return jQuery('#' + uuid + '\\$row', this.viewBodyEl);
	},
	_updateRow: function(el, row){
		if(!(el instanceof jQuery)){
			row = el;
			el = this._getRowEl(row);
		}
		var old = this._getNodeByUUID(row._uuid);
		lyb.concat(old, row);
		el.html(this._renderRow(old));
	},
	_updateRows: function(rows){
		for(var i=0,len=rows.length;i<len;i++){
			var row = rows[i];
			this._updateRow(row);
		}
	},
	_updateCheckRow: function(el, row){
		if(!(el instanceof jQuery)){
			row = el;
			el = this._getRowEl(row);
		}
		if(row._checked){
			el.addClass('row-selected');
		}else{
			el.removeClass('row-selected');
		}
	},
	__changeCheckAllStatus: function(el, status){
		el = el || jQuery('.selectbox-border', this.viewHeadBorderEl);
		if(status === undefined){
			status = true;
			var rows = this.dataSource.getData();
			for(var i=0,len=rows.length;i<len;i++){
				var row = rows[i];
				if(!row._disabled && !row._checked){
					status = false;
					break;
				}
			}
		}
		if(status){
			el.addClass('row-selected');
		}else{
			el.removeClass('row-selected');
		}
		return !status;
	},
	_resizeColumnWidth: function(){
		if(this.splitter.status){
			this.splitter.status = false;
			this.splitter.showEl.width(this.splitter.width);
			this.splitter.hideEl.width(this.splitter.width);
			
			delete this.splitter.showEl;
			delete this.splitter.hideEl;
			
			this.update();
			
			this.resizePanelEl.css({
				width: 0,
				top: 0,
				left: 0,
				bottom: 0,
				display: 'none'
			});
		}
	},
	_resetSort: function(field){
		var columns = this.columns;
		for(var i=0,len=columns.length;i<len;i++){
			var column = columns[i];
			if(field == column.field){
				continue;
			}else{
				delete column.sortField;
				delete column.sortType;
			}
		}
	},
	_bindEvents:function(){
		this._on(this.viewBodyEl, '.selectbox-border', 'click', this._onCheckboxClick, this);
		this._on(this.viewHeadBorderEl, '.selectbox-border', 'click', this._onCheckAllClick, this);
		this._on(this.viewHeadBorderEl, '.icon-sort', 'click', this._onSortClick, this);
		this._on(this.viewBodyEl, 'tr.view-row', 'click', this._onRowClick, this);
		this._on(this.headBorderEl, '.column-settings', 'click', this._onColumnSettingClick, this);
		this._on(this.headBorderEl, '.column-splitter', 'mousedown', this._onSplitterDown, this);
		this._on(this.el, '.datasheet-border', 'mouseup', this._onSplitterUp, this);
		this._on(this.el, '.datasheet-border', 'mousemove', this._onSplitterMove, this);
		this._on(this.viewBodyEl, ':text,:checkbox,:radio,select', 'change', this._onCellEditorChange, this);
		
		this.pager.bind("pagechange", this._onPagerChange, this);
		this.pager.bind("reload", this._onPagerChange, this);
		this.columnSettings.bind("sure", this._onColumnViewChange, this);
		var that = this;
		this.viewBorderEl.on('scroll', function(e){that._onViewScroll.call(that, e)});
	},
	_onSortClick: function(e){
		var el = e.selector;
		var id = el[0].id;
		var splits = id.split('$');
		var uuid = splits[0], field = splits[1];
		var column = this._getColumnByField(field);
		this.sortField = field;
		this._resetSort(field);
		
		if(column.sortType && column.sortType.toLowerCase() == 'asc'){
			column.sortType = 'desc';
		}else if(column.sortType && column.sortType.toLowerCase() == 'desc'){
			column.sortType = ''
			this.sortField = '';
		}else{
			column.sortType = 'asc';
		}
		this.sortType = column.sortType;
		this._renderHeader();
	},
	_onCellEditorChange: function(e){
		var el = e.selector;
		var type = el[0].type;
		var name = el[0].name;
		var td = el.parentsUntil('td');
		var id = name.split('$')[1];
		var field = name.split('$')[0];
		var row = this._getNodeByUUID(id);
		var value = el.val();
		row[field] = value;
		if(type == 'checkbox'){
			e.checked = el[0].checked;
		}
		e.field = field;
		e.row = row;
		e.value = value;
		this._fire('editorchange', e);
		row._status = row._status || 'edit';
//		this._updateRow(row);
	},
	_onSplitterDown: function(e){
		this.borderEl.addClass('stop-select');
		this._resizeColumnWidth();

		var selector = e.selector;
		var offset = e.selector.offset();
		var event = e.event;
		this.splitter.status = true;
		this.splitter.pageX = offset.left;
		var id = selector[0].id.split('\$')[0];
		this.splitter.showEl = jQuery('#' + id + '\\$show\\$head', this.viewHeadEl);
		this.splitter.hideEl = jQuery('#' + id + '\\$hide\\$head', this.hideHeadEl);
		this.resizePanelEl.css({
			width: this.splitter.showEl.outerWidth(true),
			top: 0,
			left: this.splitter.showEl.offset().left - this.el.offset().left,
			bottom: this.footEl.outerHeight(true),
			display: 'block'
		});
	},
	_onSplitterUp: function(e){
		this.borderEl.removeClass('stop-select');
		this._resizeColumnWidth();
	},
	_onSplitterMove: function(e){
		if(this.splitter.status){
			var event = e.event;
			this.splitter.x = event.x;

			var orginalWidth = this.splitter.showEl.width();
			var width = event.x - this.splitter.pageX + orginalWidth;
			if(width < 50){
				width = 50;
			}
			this.splitter.width = width;
			
			this.resizePanelEl.width(width);
		}
	},
	_onCheckAllClick: function(e){
		var el = e.selector;
		var status = el.hasClass('row-selected');
		var rows = this.getData();
		this.__checkRows(rows, !status);
		this.__changeCheckAllStatus(el, !status);
		e.rows = rows;
		this._fire('checkallrows', e);
	},
	_onColumnViewChange: function(e){
		var value = e.value;
		var array = value.split(',');
		for(var index in this.columns){
			var column = this.columns[index];
			if(column.type)
				continue;
			column._hide = true;
			for(var _index in array){
				var _uuid = array[_index];
				if(_uuid === column._uuid){
					column._hide = false;
					array.splice(_index, 1);
					break;
				}
			}
		}
		this.columnSettings.hide();
		this.columnSettings.text = '';
		this.columnSettings.value = '';
		this._renderHeader();
	},
	_onColumnSettingClick: function(e){
		e.stopPropagation();
		var el = e.selector;
		this.columnSettings.el.css({
			top: el.height()
		});
		
		var data = [];
		for(var index in this.columns){
			var column = this.columns[index];
			if(!column.type)
				data.push({id: column._uuid, value: column.title, _selected: !column._hide, _checked: !column._hide});
		}
		
		this.columnSettings.setData(data);
		this.columnSettings.show();
	},
	__hideElement: function(){
		this.columnSettings.hide();
	},
	_onViewScroll: function(e){
		var el = jQuery(e.currentTarget);
		var left = el.scrollLeft();
		var top = el.scrollTop();
		this.viewHeadEl.css('margin-left', -left);
	},
	_onPagerChange: function(e){
		var pageNum = e.pageNum;
		var pageSize = e.pageSize;
		this._load(this.url, {pageNum: pageNum, pageSize: pageSize});
    },
	_onCheckboxClick: function(e){
		e.stopPropagation();
		var el = e.selector;
		var splits = el.attr('id').split('\$');
		var uuid = splits[0];
		var row = this.dataSource._getNodeByUUID(uuid);
		if(row._disabled)//disabled状态默认阻止
			return ;
		this.__checkRows([row], !row._checked);
		e.row = row;
		this._fire('checkrow', e);
	},
	_onRowClick: function(e){
		e.stopPropagation();
		var el = e.selector;
		var splits = el.attr('id').split('\$');
		var uuid = splits[0];
		var row = this.dataSource._getNodeByUUID(uuid);
		if(row._disabled)//disabled状态默认阻止
			return ;
		this._selectRow(row);
		e.row = row;
		this._fire('clickrow', e);
	},
	_selectRow: function(row){
		row = row || {};
		var rows = this.dataSource ? this.dataSource.getData() : [];
		for(var i=0,len=rows.length;i<len;i++){
			var _row = rows[i];
			if(!_row._disabled){
				if(_row._uuid == row._uuid){
					_row._checked = true;
				}
				else{
					_row._checked = false;
				}
				this._updateCheckRow(_row);
			}
		}
		this.__changeCheckAllStatus();
	},
	__checkRows: function(rows, status){
		for(var i=0,len=rows.length;i<len;i++){
			var row = rows[i];
			if(!row._disabled){
				row._checked = status;
				this._updateCheckRow(row);
			}
		}
		this.__changeCheckAllStatus();
	},
	_checkRows: function(rows, status){
		this._checkRowsByField(rows, '_uuid', status);
	},
	_checkRowsByField: function(rows, field, status){
		status = status === undefined ? true : status;
		field = field || '_uuid';
		if(jQuery.type(rows) == 'object')
			rows = [rows];
		for(var i=0,len=rows.length;i<len;i++){
			var _row = this._getNodeByUUID(rows[i][field], field);
			if(_row && !_row._disabled){
				_row._checked = status;
				this._updateCheckRow(_row);
			}
		}
	},
	_setRowsDisabled: function(rows, status){
		status = status === undefined ? true : status;
		field = field || '_uuid';
		if(jQuery.type(rows) == 'object')
			rows = [rows];
		for(var i=0,len=rows.length;i<len;i++){
			var _row = this._getNodeByUUID(rows[i][field], field);
			if(_row){
				_row._disabled = status;
				this._updateCheckRow(_row);
			}
		}
	},
	_getSelectedRows:function(){
		var result = [];
		var rows = this.dataSource ? this.dataSource.getData() : [];
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			row._checked && result.push(row);
		}
		return result;
	},
	_getSelectedNodes:function(){
		return this._getSelectedRows();
	},
	_getSelectedRow:function(){
		var result = [];
		var rows = this.dataSource ? this.dataSource.getData() : [];
		for(var i=0;i<rows.length;i++){
			var row = rows[i];
			row._checked && result.push(row);
		}
		return result[0];
	},
	_getSelectedNode:function(){
		return this._getSelectedRow();
	},
	_getData:function(clear){
		var result = this.dataSource ? this.dataSource.getData() : [];
		if(clear){
			result = lyb.clone(result);
			for(var i=0;i<result.length;i++){
				var row = result[i];
				for(var key in row){
					if(key.charAt(0) == '_'){
						delete row[key];
					}
				}
			}
		}
		return result;
	},
	_getFormData:function(prefix){
		prefix = prefix || this.prefix;
		var rows = this._getData();
		var result = {};
		for(var i=0,len=rows.length, start=0;i<len;i++){
			var row = rows[i];
			if(!row._status){
				continue;
			}
			for(var key in row){
				if(key.charAt(0) == '_'){
					continue;
				}
				result[prefix + '['+ start +'].' + key] = lyb.getValid(row[key], '');
			}
				
			start++;
		}
		return result;
	},
	_setData: function(data){
		this._success({data: data});
	},
	_setColumns: function(columns){
		this.columns = jQuery.type(columns) == 'array' ? columns :  [];
		if(this.allowMulti)
			this.columns.unshift({type: 'checkbox', width: '30px'});
		if(this.showIndex)
			this.columns.unshift({title: '编号', type: 'index', width: '50px'});
		for(var i=0,len=this.columns.length;i<len;i++){
			this.columns[i] = lyb.concat(new lyb.Column(), this.columns[i]);
			this.columns[i]._columnIndex = i;
		}
		this._renderHeader();
	},
	_setShowHeader: function(status){
		status = status === false ? false : true;
		if(status){
			this.viewBorderEl.css('top', 41);
			this.viewHeadBorderEl['show']();
		}else{
			this.viewBorderEl.css('top', 0);
			this.viewHeadBorderEl['hide']();
		}
	},
	_setShowPager: function(status){
		status = status === false ? false : true;
		if(status){
			this.viewBorderEl.css('bottom', 41);
			this.footEl['show']();
		}else{
			this.viewBorderEl.css('bottom', 0);
			this.footEl['hide']();
		}
	},
	_setUrl: function(url){
		this.url = url;
		this.load();
	},
	_getColumnByField: function(field){
		var columns = this.columns;
		for(var i=0;i<columns.length;i++){
			var column = columns[i];
			if(column.field && column.field == field)
				return column;
		}
	},
	getSelectedRows: function(){
		return this._getSelectedRows();
	},
	getSelectedNodes: function(){
		return this._getSelectedNodes();
	},
	getSelectedRow: function(){
		return this._getSelectedRow();
	},
	getSelectedNode: function(){
		return this._getSelectedNode();
	},
	getData: function(clear){
		return this._getData(clear);
	},
	getFormData: function(prefix){
		return this._getFormData(prefix);
	},
	setData: function(data){
		this._setData(data);
	},
	load:function(url, data){
		this._load(url, data);
	},
	setUrl: function(url){
		this._setUrl(url);
	},
	checkRows: function(rows, status){
		this._checkRows(rows, status);
	},
	reload:function(){
		this._reload();
	},
	renderHeader:function(arr){
		this._renderHeader(arr);
	},
	setColumns: function(columns){
		this._setColumns(columns);
	},
	setShowPager: function(status){
		this._setShowPager(status);
	},
	addRow: function(row){
		this.addRows([row]);
	},
	addRows: function(rows){
		this._addRows(rows);
	},
	removeRow: function(row){
		this.removeRows([row]);
	},
	removeRows: function(rows){
		this._removeRows(rows);
	},
	updateRow: function(row){
		this._updateRow(row);
	},
	updateRows: function(rows){
		this._updateRows(rows);
	},
	setRowDisabled: function(row, status){
		this._setRowsDisabled([row], status);
	},
	setRowsDisabled: function(rows, status){
		this._setRowsDisabled(rows, status);
	}
});
lyb.Register(lyb.DataSheet, 'datasheet');


/*------------------表格普通列对象-----------------------*/
lyb.Column = function(el) {
	this._initField();
    this._getAttrs(el);
    this.show = this.show === false ? false : true;
};
lyb.Column.prototype = {
    _init: function() {
    },
    _initField: function(){
    	this._uuid = lyb.getUUID();
		this._hide = this._hide === true ? true : false;
		if(!this.width){//表格列宽度不存在设置默认值
			this.width = '100px';
		}
	    this.sort = '';
    },
    _renderCell: function(row, grid) {
        var html = '';
        
        if(this._hide){//隐藏列
			return '';
		}
        html += '<td class="view-cell" id="'+ row._uuid +'$cell$'+ row._rowIndex +'">';
		if(this.type == 'checkbox'){
			html += this.__renderSelectBox(row);
		}else if(this.type == 'index'){
			html +=  this.__renderIndex(row, grid);
		} else {
			html +=  this.__renderView(row, grid);
		}
		html += '</td>';
		return html;
    },
    __renderView: function(row, grid){
        var value = row[this.field];
        if(this.editor){
        	
        }else if(this.rerender){
			try{
				value = this.rerender.call(grid, {row: row, value: value, column: this});
				value = lyb.getValid(value, '');
				if(jQuery.type(value) == 'string'){
					//临时解决方案
					if(value.indexOf('$') == -1){
						value = value.replace(/\<input/ig, '<input name="'+ this.field + '$' + row._uuid +'"');
						value = value.replace(/\<select/ig, '<select name="'+ this.field + '$' + row._uuid +'"');
					}
				}
			}catch(e){
				value = '';
				console.error(e);
			}
		}
    	var cell = lyb.getValid(value, ''), title = cell;
		if(cell && /<|>/.test(cell)){
			title = '';
		}
		var align = this.align ? ('text-align:' + this.align) : '';
		return '<div class="text" style="'+ align +'" title="' + title + '" id="'+ row._uuid +'$text$'+ row._rowIndex +'">' + cell + '</div>'
    },
    __renderSelectBox: function(row){
    	return '<div class="text selectbox-border" style="text-align: center;" id="'+ row._uuid +'$'+ this.type +'"><i class="icon icon-check-empty"></i><i class="icon icon-check" style="color: #6ca345;"></i></div>';
    },
    __renderIndex: function(row, grid){
    	var pageNum = grid.pager.pageNum, pageSize = grid.pager.pageSize;
    	var index = row._rowIndex + 1 + (pageNum - 1) * pageSize;
		return '<div class="text" style="text-align: center;">' + index + '</div>';//根据pageIndex和pageSize处理
    },
    _renderShowHead: function(grid) {
    	var row = '';
    	if(this._hide){//隐藏列
    		return row;
    	}
    	var width = this.width ? 'width:' + (/px|\%/ig.test(this.width.toString()) ? this.width : (this.width + 'px')) + ';' : '';
		row += '<td id="'+ this._uuid +'$show$head" title="'+ (this.title || '') +'" class="head-cell" style="position: relative;'+ width +'">';
		if(this.type == 'checkbox'){
			row += '<div class="text selectbox-border" style="text-align:center;"><i class="icon icon-check-empty"></i><i class="icon icon-check" style="color: #6ca345;"></i></div>';
		}else {
			var sort = '<div style="position: absolute;top: 0;bottom: 0;right: 4px;">';
			if(this.sort){
				sort += '<i id="'+ this._uuid +'$'+ this.field;
				if(this.sortType && this.sortType.toString() == 'asc'){
					sort += '" class="icon icon-sort icon-sort-up" style="cursor: pointer;"></i>';
					grid.sortField = this.field;
					grid.sortType = this.sortType;
				}else if(this.sortType && this.sortType.toString() == 'desc'){
					sort += '" class="icon icon-sort icon-sort-down" style="cursor: pointer;"></i>';
					grid.sortField = this.field;
					grid.sortType = this.sortType;
				}else if(!this.sortType || this.sortType.toString() == '')
					sort += '" class="icon icon-sort" style="cursor: pointer;"></i>';
			}
			sort += '</div>';
			row += '<div class="text" style="text-align:center;">' + (this.title || '') + sort + '</div>';
			if(this.type != 'index' && grid.allowResize){
				row += '<div id="'+ this._uuid +'$splitter" class="column-splitter"></div>';
			}
		}
		row += '</td>';
        return row;
    },
    _renderHideHead: function() {
    	var row = '';
    	if(this._hide){//隐藏列
    		return row;
    	}
    	var width = this.width ? 'width:' + (/px|\%/ig.test(this.width.toString()) ? this.width : (this.width + 'px')) + ';' : '';
    	row += '<td id="'+ this._uuid +'$hide$head" class="head-cell" style="border-top: none;border-bottom: none;height: 0;'+ width +'"></td>';
    	return row;
    },
    _getAttrs: function(el) {
    	if(!el){
    		return;
    	}
        this.text = el.text();
        var attrs = {
            str : ["field", "align"],
            number : ["width"],
            json : [],
            bool : ["show", "merge", "allowSort"]
        };
        lyb.concat(this, lyb._parseEvent(el, ["rerender"]));
        lyb.concat(this, lyb._getBasicAttrs(el, attrs));
    }
};