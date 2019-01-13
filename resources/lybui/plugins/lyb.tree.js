/**
 * Created by Administrator on 2016/8/25 0025.
 */
lyb.Tree = function(id){
    lyb.Tree.superClass.constructor.call(this, id);
	
	//TODO 初始化完成后执行load数据
	this.autoLoad && this._load();
};
lyb.extend(lyb.Tree, lyb.Accordion,{
   type: 'tree',
    _init: function(){
        this.borderEl = jQuery('<div class="tree-border"></div>').appendTo(this.el);
    },
	_initField: function() {
		this.idField = lyb.getValid(this.idField, 'id');
		this.pidField = lyb.getValid(this.pidField, 'pid');
		this.childrenField = lyb.getValid(this.childrenField, 'children');
		this.textField = lyb.getValid(this.textField, 'text');
		this.checkedField = lyb.getValid(this.checkedField, '_uuid');
		this.url = lyb.getValid(this.url, '');
		this.data = lyb.getValid(this.source, []);
		this.allowMulti = this.allowMulti === false ? false : true;
		this.activedNode = null;
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['url', 'idField', 'pidField', 'childrenField', 'textField', 'sortField', 'checkedField'],
			bool: ['allowMulti'],
			json: ['source']
		}, attributes);
		return lyb.Tree.superClass._getAttrs.call(this, attrs);
	},
    _load: function(){
    	if(this.url){
    		lyb.ajax({
    			url: this.url,
    			type: 'post',
    			context: this,
    			success: this._success
    		})
    	}else{
    		this._success({data: this.data});
    	}
    },
	_success: function(result){
		this.dataSource = new lyb.DataSource(lyb.getValid(result.data, []), 'tree', this.idField, this.pidField, this.childrenField, this.sortField);
		this.borderEl.html(this._render());
	},
	_render: function(dataSource){
        var html = [];
        dataSource = lyb.getValid(dataSource, this.dataSource.getData());
        
        for(var i = 0;i < dataSource.length; i++){
        	var node = dataSource[i];
        	html.push('<div id="'+ node._uuid +'" class="node-border">');
            html.push(this._renderNode(node));
            html.push('</div>');
        }
        return html.toString();
    },
    _renderNode: function(node, resetExpand){
    	var html = [];
    	var children = node[this.childrenField];
    	html.push('<div id="'+ node._uuid +'$node" class="'+ (this._getNodeCls(node)) +'">');
        html.push(this._renderNodeCell(node));
        html.push('</div>');
        if(!node._leaf){
        	html.push('<div id="'+ node._uuid +'$children" class="tree-children" style="'+ (node._open ? 'display: block;' : '') +'">');
        	html.push(this._render(children));
        	html.push('</div>');
        }
        return html.toString();
    },
    _renderExpand: function(node){
    	if(!node._leaf){
    		if(node._open)
    			return '<i id="'+ node._uuid +'$toggle" class="toggle-icon icon icon-caret-down"></i>';
    		else
    			return '<i id="'+ node._uuid +'$toggle" class="toggle-icon icon icon-caret-right"></i>';
    	}
    	return '<i class="empty-icon"></i>';
    },
    _renderCheckBox: function(node){
    	if(this.allowMulti){
    		if(node._checkStatus == 'full'){
    			return '<i id="'+ node._uuid +'$checkbox" class="checkbox-icon icon icon-check"></i>';
    		}else if(node._checkStatus == 'empty')
				return '<i id="'+ node._uuid +'$checkbox" class="checkbox-icon icon icon-check-empty"></i>';
			else
				return '<i id="'+ node._uuid +'$checkbox" class="checkbox-icon icon icon-sign-blank"></i>';
    	}
    },
    _renderText: function(node){
    	var html = '<span id="'+ node._uuid +'$text" class="tree-text">';
    	if(node._leaf)
    		html += '<i id="'+ node._uuid +'$folder" class="icon icon-file-alt'+ (node.cls ? node.cls : '') +'"></i>';
    	else{
    		if(node._open)
    			html += '<i id="'+ node._uuid +'$folder" class="icon icon-folder-open-alt '+ (node.cls ? node.cls : '') +'"></i>';
    		else
    			html += '<i id="'+ node._uuid +'$folder" class="icon icon-folder-close-alt '+ (node.cls ? node.cls : '') +'"></i>';
    	}
    	html += node[this.textField] + '</span>';
    	return html;
    },
    _renderNodeCell: function(node){
    	var cell = [];
    	cell.push(this._renderExpand(node));
    	cell.push(this._renderCheckBox(node));
    	cell.push(this._renderText(node));
    	return cell.toString();
    },
    _getNodeCls: function(node){
    	var cls = ['tree-node'];
    	if(node._leaf){
    		cls.push('tree-leaf');
    		if(node._actived){
    			cls.push('actived');
    		}
    	}else{
    		if(node['_open']){
    			cls.push('expand');
    		}
    	}
    	return cls.toString(' ');
    },
    _setData: function(data){
        data = lyb.getValid(data, []);
        this._success({data: data});
    },
    _setCheckedStatus: function(node, status){
    	var that = this;
    	node._checked = status || !node._checked;
    	if(node._checked){
    		node._checkStatus = 'full';
    	}else{
    		node._checkStatus = 'empty';
    	}
    	
    	function recursionChildren(array) {
			for (var i = 0, len = array.length; i < len; i++) {
				var _node = array[i];
				var child = _node[that.childrenField];
				_node._checked = node._checked;
				if(_node._checked)
					_node._checkStatus = 'full';
				else
					_node._checkStatus = 'empty';
				recursionChildren(child);
			}
		}
    	recursionChildren(node[this.childrenField]);
    	
    	function recursionParent(parent) {
    		var array = [];
        	if(parent){
        		array = parent[that.childrenField];
        		var count = 0;
        		for (var i = 0, len = array.length; i < len; i++) {
        			var _node = array[i];
        			if(_node._checkStatus == 'full'){
        				count++;
        			}else if(_node._checkStatus == 'half'){
        				count += 0.5;
        			}
        		}
        		if(count == 0){
        			parent._checked = false;
        			parent._checkStatus = 'empty';
        		}else if(count == len){
        			parent._checked = true;
        			parent._checkStatus = 'full';
        		}else{
        			parent._checked = false;
        			parent._checkStatus = 'half';
        		}
        		var _path = parent._coordinate.join().split(',');
        		_path.pop();
        		recursionParent(that.dataSource._getNodeByPath(_path));
        	}
		}
		var path = node._coordinate.join().split(',');
		path.pop();
		recursionParent(this.dataSource._getNodeByPath(path));
    },
    _activedNode: function(node, el){
		if(this.selectedNodeEl){
			this.selectedNodeEl.removeClass('selected');
		}
		el.addClass('selected');
		this.selectedNodeEl = el;
		this.activedNode = node;
    },
    _toggleNode: function(node, el){
    	var _node = this._collapseNode(node);
    	var uuid = el[0].id.split('$')[0];
    	if(!node._leaf && (!_node || node._uuid != _node._uuid)){
    		var parent = el.parent();
    		parent.parent().addClass('expand');
    		var children = parent.next();
    		children.slideDown('fast');
    		node['_open'] = true;
			var icon = this._getEl(node, '\\$toggle', node.el);
			icon.removeClass('icon-caret-right').addClass('icon-caret-down');
			icon = this._getEl(node, '\\$folder', node.el);
			icon.removeClass('icon-folder-close-alt').addClass('icon-folder-open-alt');
    	}
    },
    _collapseNode: function(node){
    	var coordinate = node['_coordinate'].join().split(',');
    	coordinate.pop();
    	var parent = this.dataSource._getNodeByPath(coordinate);
    	
    	var children = this.dataSource.getData();
    	if(parent){
    		children = parent[this.childrenField];
    	}

    	for(var i=0,len=children.length;i<len;i++){
    		var child = children[i];
    		if(child['_open']){
    			var collapseEl = this._getEl(child);
    			if(collapseEl[0]){
    				collapseEl.removeClass('expand');
    				var collapseChildEl = this._getChildrenEl(child, collapseEl);
    				collapseChildEl.slideUp('fast');
    				child['_open'] = false;
    				var icon = this._getEl(child, '\\$toggle', child.el);
    				icon.removeClass('icon-caret-down').addClass('icon-caret-right');
    				icon = this._getEl(child, '\\$folder', child.el);
    				icon.removeClass('icon-folder-open-alt').addClass('icon-folder-close-alt');
    				return child;
    			}
    		}
    	}
    },
    _getEl: function(node, express, context){
    	if(express && express instanceof jQuery){
    		context = express;
    		express = '';
    	}
    	express = lyb.getValid(express, '');
    	return jQuery('#' + node._uuid + express, context || this.el);
    },
    _getNodeEl: function(node, context){
    	return this._getEl(node, '\\$node', context);
    },
    _getChildrenEl: function(node, context){
    	return this._getEl(node, '\\$children', context);
    },
    _bindEvents: function(){
        this._on(this.borderEl, ".tree-text", "click", this._onNodeClick,this);
        this._on(this.borderEl, ".checkbox-icon", "click", this._onCheckBoxClick,this);
        this._on(this.borderEl, ".toggle-icon", "click", this._onToggleNode,this);
    },
    _onToggleNode: function(e){
    	e.stopPropagation();
        var el = e.selector;
        var uuid = el[0].id.split('$')[0];
        var node = this._getNodeByUUID(uuid);
        this._toggleNode(node, el);
        e.node = node;
        this._fire("click",e)
    },
    _onCheckBoxClick: function(e){
    	e.stopPropagation();
    	var el = e.selector;
    	var uuid = el[0].id.split('$')[0];
    	var node = this._getNodeByUUID(uuid);
    	this._setCheckedStatus(node);
    	this.borderEl.html(this._render());
    	e.node = node;
    	this._fire("check",e)
    },
    _onNodeClick: function(e){
    	e.stopPropagation();
    	var el = e.selector;
    	var uuid = el[0].id.split('$')[0];
    	var node = this._getNodeByUUID(uuid);
    	this._activedNode(node, el);
    	e.node = node;
    	this._fire("click",e)
    },
    setData: function(data){
    	this._setData(data);
    },
    toggle: function(status){
    	this._toggle(status);
    },
    _getSelectedNode: function(){
    	return this.activedNode;
    },
    _getSelectedNodes: function(status){//status：true代表半选状态也返回
    	var result = [], that = this;
    	function recursion(array) {
			for (var i = 0, len = array.length; i < len; i++) {
				var node = array[i];
				if(status){
					if(node._checkStatus == 'full' || node._checkStatus == 'half'){
						result.push(lyb.clone(node));
					}
				}else{
					if(node._checkStatus == 'full'){
						result.push(lyb.clone(node));
					}
				}
				var child = node[that.childrenField];
				recursion(child);
			}
		}
    	recursion(this.dataSource.getData());
    	return result;
    },
    _checkNodes: function(nodes, status){
    	for(var index in nodes){
    		var node = nodes[index];
    		node = this._getNodeByUUID(node[this.checkedField], this.checkedField);
    		this._setCheckedStatus(node, status);
    	}
    	this.borderEl.html(this._render());
    },
    getSelectedNode: function(){
    	return this._getSelectedNode();
    }, 
    getSelectedNodes: function(status){
    	return this._getSelectedNodes(status);
    },
    checkNodes: function(nodes, status){
    	this._checkNodes(nodes, status);
    },
    checkNode: function(node, status){
    	this._checkNodes([node], status);
    }
});
lyb.Register(lyb.Tree, 'tree');
