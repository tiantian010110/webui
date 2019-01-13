/**
 * Created by Administrator on 2016/8/25 0025.
 */
lyb.Accordion = function(id){
    lyb.Accordion.superClass.constructor.call(this, id);
	
	//TODO 初始化完成后执行load数据
	this.autoLoad && this._load();
};
lyb.extend(lyb.Accordion, lyb.Root,{
   type: 'accordion',
    _init: function(){
        this.borderEl = jQuery('<div class="accordion-border"></div>').appendTo(this.el);
        this.activedEl = null;
    },
	_initField: function() {
		this.idField = lyb.getValid(this.idField, 'id');
		this.pidField = lyb.getValid(this.pidField, 'pid');
		this.childrenField = lyb.getValid(this.childrenField, 'children');
		this.textField = lyb.getValid(this.textField, 'text');
		this.url = lyb.getValid(this.url, '');
		this.data = lyb.getValid(this.source, []);
		this.allowMulti = this.allowMulti === false ? false : true;
	},
	_getAttrs: function(attributes) {
		var attrs = lyb.concat({
			str: ['url', 'idField', 'pidField', 'childrenField', 'textField', 'sortField'],
			bool: ['allowMulti'],
			json: ['source']
		}, attributes);
		return lyb.Accordion.superClass._getAttrs.call(this, attrs);
	},
    _load: function(){
    	if(this.url){
    		
    	}else{
    		this._success({data: this.data});
    	}
    },
	_success: function(result){
		this.dataSource = new lyb.DataSource(lyb.getValid(result.data, []), 'tree', this.idField, this.pidField, this.childrenField, this.sortField);
		this.borderEl.html(this._render());
	},
	_render: function(dataSource, resetExpand){
        var html = [];
        dataSource = lyb.getValid(dataSource, this.dataSource.getData());
        
        for(var i = 0;i < dataSource.length; i++){
        	var node = dataSource[i];
        	html.push('<div id="accordion$'+ node._uuid +'" class="accordion">');
            html.push(this._renderNode(node, resetExpand));
            html.push('</div>');
        }
        return html.toString();
    },
    _renderNode: function(node, resetExpand){
    	if(resetExpand){
    		node._expand = false;
    	}
    	var html = [];
    	var children = node[this.childrenField];
    	html.push('<div id="accordion$'+ node._uuid +'$node" class="'+ (this._getNodeCls(node)) +'">');
        html.push(this._renderNodeCell(node));
        html.push('</div>');
        if(!node._leaf){
        	html.push('<div id="accordion$'+ node._uuid +'$children" class="accordion-children" style="'+ (node._expand ? 'display: block;' : '') +'">');
        	html.push(this._render(children, resetExpand));
        	html.push('</div>');
        }
        return html.toString();
    },
    _renderNodeCell: function(node){
    	var cell = [];
    	cell.push('<i class="icon data-icon '+ (node.cls ? node.cls : '') +'"></i>');
    	cell.push('<span class="accordion-text">' + node[this.textField] + '</span>');
    	if(!node._leaf){ 
    		cell.push('<i class="icon  icon-angle-right"></i>');
        }
    	return cell.toString();
    },
    _getNodeCls: function(node){
    	var cls = ['accordion-node'];
    	if(node._leaf){
    		cls.push('accordion-leaf');
    		if(node._actived){
    			cls.push('actived');
    		}
    	}else{
    		if(node._expand){
    			cls.push('expand');
    		}
    	}
    	return cls.toString(' ');
    },
    _setData: function(data){
        data = lyb.getValid(data, []);
        this._success({data: data});
    },
    _activedNode: function(node, el){
    	if(this.topExpandNode && this.topExpandNode._uuid === node._uuid){
    		return ;
    	}
    	this._expandNode(node, el);
    	if(node._leaf){
    		if(this.selectedNode){
    			this.selectedNode.removeClass('selected');
    		}
    		el.addClass('selected');
    		this.selectedNode = el;
    	}
    },
    _expandNode: function(node, el){
    	this._collapseNode(node);
    	if(!node._leaf){
    		var parent = el.parent();
    		parent.addClass('expand');
    		var children = el.next();
    		children.slideDown('fast');
    		node._expand = true;
    	}
    },
    _collapseNode: function(node){
    	var parent = this._getNodeByUUID(node[this.pidField], this.pidField);
    	if(parent && !parent._expand || this.allowMulti){
    			return;
		}
		var collapseNode = this.topExpandNode;
		if(collapseNode){
			var collapseEl = this._getEl(collapseNode);
			if(collapseEl[0]){
				collapseEl.removeClass('expand');
				var collapseChildEl = this._getChildrenEl(collapseNode, collapseEl);
				collapseChildEl.slideUp('fast');
				collapseNode._expand = false;
			}
		}
		this.topExpandNode = node;
    },
    _getEl: function(node, express, context){
    	if(express && express instanceof jQuery){
    		context = express;
    		express = '';
    	}
    	express = lyb.getValid(express, '');
    	return jQuery('#accordion\\$' + node._uuid + express, context || this.el);
    },
    _getNodeEl: function(node, context){
    	return this._getEl(node, '\\$node', context);
    },
    _getChildrenEl: function(node, context){
    	return this._getEl(node, '\\$children', context);
    },
    _rerenderNodeHTML: function(node, el){
    	node._expand = !node._expand;
        var parent = el.parent();
        parent.html(this._renderNode(node));
    }, 
    _bindEvents: function(){
        this._on(this.borderEl, ".accordion-node", "click", this._onNodeClick,this);
    },
    _onNodeClick: function(e){
    	e.stopPropagation();
        var el = e.selector;
        var uuid = el[0].id.split('$')[1];
        var node = this._getNodeByUUID(uuid);
        this._activedNode(node, el);
        e.node = node;
        this._fire("click",e)
    },
    _toggle: function(status){
    	
    	var _status = this.borderEl.hasClass('shrink');
    	status = status !== undefined ? status : !_status;
    	if(status){
    		this._width = this.el.width();
    		this.borderEl.addClass('shrink');
    		this.el.animate({
    			width: 40
    		}, 'fast');
    	}else{
    		var that = this;
    		this.el.animate({
    			width: this._width
    		}, 'fast', function(){
    			that.borderEl.removeClass('shrink');
    		});

    	}
    },
    setData: function(data){
    	this._setData(data);
    },
    toggle: function(status){
    	this._toggle(status);
    },
});
lyb.Register(lyb.Accordion, 'accordion');
