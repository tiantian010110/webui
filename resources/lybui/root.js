/**
 * Created by tianxinlong on 2016-08-02-0002. v1.0
 */
;
(function(jQuery, JSON) {
	window.lyb = {
		version : 1.0,
		HTML5 : !!window['applicationCache'],

		_index : 0,
		getUUID : function(prefix) {
			prefix = prefix || 'lyb';
			var id = prefix + '-' + this._index++;
			return id;
		},
		getValid: function(){
			var array = Array.prototype.slice.call(arguments);
			for(var index in array){
				var o = array[index];
				if(o !== undefined && o !== null || (jQuery.type(o) == "number" && !isNaN(o))){
					return o;
				}
			}
		},
		extend : function(subFun, superFun, prototype) {
			var superClass = function() {
			};
			superClass.prototype = superFun.prototype;

			superClass.constructor = superFun.constructor;
			superClass.prototype.constructor = superFun;
			subFun.prototype = new superClass();
			subFun.prototype.constructor = subFun;
			if (prototype) {
				for ( var key in prototype) {
					subFun.prototype[key] = prototype[key];
				}
			}
			subFun.superClass = superFun.prototype;
			// 如果父类superclass.prototype.constructor没有被自定义，则自定义
			if (superFun.prototype.constructor == Object.prototype.constructor) {
				superFun.prototype.constructor = superFun;
			}
		},
		isDate : function(value) {
			return !!(value && value.getTime);
		},
		isArray : function(value) {
			return !!(value && !!value.push);
		},
		isNull : function(value) {
			return value === null || value === undefined;
		},

		isNumber : function(value) {
			return !isNaN(value) && typeof value == 'number';
		},
		formatDate : function(format, time, returnDate) {
			if (time == undefined || time == '') {
				return "";
			}
			if (jQuery.type(time) == 'string') {
				if (/^\w+.+\d{4}$/i.test(time)) {
					time = new Date(time);
				}
			}
			if (jQuery.type(time) == 'string') {
				time = time.replace(/T/i, " "); // 针对date类型查询时间带T
				time = time.replace(/\.\d+/i, ""); // 针对IE 对应数据库datetime
				time = time.replace(/-/g, "/");
				var _T = time.split(" ");
				var _d = _T[0], _t = _T[1];
				if (/:/.test(_d)) {
					_d = undefined;
					_t = _T[0];
				}
				var __D = new Date();
				if (_t && _d) {
					var _ds = _d.split("/"), _ts = _t.split(":");
					time = new Date(Number(_ds[0] || __D.getFullYear()), Number(_ds[1] ? _ds[1] - 1 : __D.getMonth()),
							Number(_ds[2] || __D.getDate()), Number(_ts[0] || __D.getHours()), Number(_ts[1]
									|| __D.getMinutes()), Number(_ts[2] || __D.getSeconds()));
				} else if (_d) {
					var _ds = _d.split("/");
					time = new Date(Number(_ds[0] || __D.getFullYear()), Number(_ds[1] ? _ds[1] - 1 : __D.getMonth()),
							Number(_ds[2] || __D.getDate()), 0, 0, 0);
				} else if (_t) {
					var _ts = _t.split(":");
					time = new Date(__D.getFullYear(), __D.getMonth(), __D.getDate(), Number(_ts[0] || __D.getHours()),
							Number(_ts[1] || __D.getMinutes()), Number(_ts[2] || __D.getSeconds()));
				}

				if (returnDate) {
					return time;
				}
			}
			var Week = [ '日', '一', '二', '三', '四', '五', '六' ];
			format = format.replace(/YYYY/i, time.getFullYear());
			format = format.replace(/YY/i, (time.getYear() % 100) > 9 ? (time.getYear() % 100).toString() : '0'
					+ (time.getYear() % 100));
			format = format.replace(/MM/i, (time.getMonth() + 1) > 9 ? (time.getMonth() + 1).toString() : '0'
					+ (time.getMonth() + 1));
			format = format.replace(/W/g, Week[time.getDay()]);
			format = format.replace(/DD/i, time.getDate() > 9 ? time.getDate().toString() : '0' + time.getDate());
			format = format.replace(/HH/i, time.getHours() > 9 ? time.getHours().toString() : '0' + time.getHours());
			format = format.replace(/MI/i, time.getMinutes() > 9 ? time.getMinutes().toString() : '0'
					+ time.getMinutes());
			format = format.replace(/SS/i, time.getSeconds() > 9 ? time.getSeconds().toString() : '0'
					+ time.getSeconds());
			if (returnDate) {
				return this.formatDate('yyyy/mm/dd', format, true);
			}
			return format;
		},
		formatDecimal : function(number, formatFixed, backEmpty, spliter) {
			spliter = lyb.getValid(spliter, ',');
			if(backEmpty && number === ''){
				return '';
			}
			
			if (formatFixed === undefined || formatFixed === null) {
				formatFixed = 2;
			}
			if (jQuery.type(formatFixed) == 'string')
				formatFixed = Number(formatFixed.replace(/[a-zA-Z]/g, ''));
			// 格式化方法
			function _splitByGroup(str) {
				if(str == 0){
					return 0;
				}
				var len = str.length, array = [], start = 0, end = len % 3, step = Math.ceil(len / 3);

				for (var i = 0; i <= step; i++) {
					var subStr = str.substring(start, end);
					if (subStr != '')
						array.push(subStr);
					start = end;
					end = start + 3;
				}
				return array.join(spliter) || "0";
			}

			number = String(number) || "";
			var clearRegExp = /\D*/ig, empty = '';
			var minus = /\-/.test(number) ? -1 : 1;
			var numbers = number.split('.'), number0 = numbers[0].replace(clearRegExp, empty), number1 = (numbers[1] || "")
					.replace(clearRegExp, empty);

			number0 = _splitByGroup(number0);
			number1 = (Number(number1) * Math.pow(0.1, number1.length)).toFixed(formatFixed)
					* Math.pow(10, formatFixed);
			number1 = parseInt(number1);

			if (number1 == 0) {
				number1 = new Array(formatFixed + 1).join("0");
			}

			if (formatFixed == 0) {
				number = number0;
			} else {
				number = number0 + "." + number1;
			}
			return number;
		},
		/**
		 * 把数组转换成树形结构数据
		 * 
		 * @param resource：源数据
		 * @param idField：主键字段
		 * @param parentidField：父id字段
		 */
		_makeLevelData : function(resource, idField, parentidField, childrenField, sortField) {
			idField = idField || 'id';
			parentidField = parentidField || 'pid';
			childrenField = childrenField || 'children';
			var list = this.clone(resource);
			var me = this;
			var maps = {}, result = [];
			// 描述：将传入的json数据按{parentid:data}形式整理
			for (var i = 0, len = list.length; i < len; i++) {
				var node = list[i];
				node["_uuid"] = node["_uuid"] || this.getUUID(); // 追加UUID
				node["_leaf"] = true; // 默认全是叶子节点
				resource[i]["_uuid"] = node["_uuid"]; // 原始数据追加UUID
				node['_checked'] = node['_checked'] || false;
				node['_checkStatus'] = 'empty';
				node[childrenField] = [];

				// 初始化children数组
				var parentid = node[parentidField];
				parentid = parentid == null ? '' : parentid;
				if (!maps[parentid]) { // parentid不存在就初始化
					maps[parentid] = [];
				}
				maps[parentid].push(node);
			}
			// 从maps中拿出第一个数组
			result = maps[''] || maps['null'];

			function recursion(children_list) {
				for (var i = 0, len = children_list.length; i < len; i++) {
					var node = children_list[i];
					var child = maps[node[idField]];
					child = child ? child : [];
					if (child[0]) {
						node['_leaf'] = false;
					}
					node[childrenField] = child;
					recursion(child);
					sortField && node[childrenField].sort(function(a, b){
						if(a[sortField] && b[sortField]){
							return a[sortField] > b[sortField];
						}
					});
				}
			}
			if (result == undefined) {
				return list;
			}
			// 描述：将整理好的maps循环递归调用recursion方法
			recursion(result);
			//排序
			sortField && result.sort(function(a, b){
				if(a[sortField] && b[sortField]){
					return a[sortField] > b[sortField];
				}
			});
			lyb.setCoordinate(result, idField, childrenField);
			return result;
		},
		setCoordinate: function(list, idField, childrenField){
			idField = idField || 'id';
			childrenField = childrenField || 'children';
			
			function recursion(children_list, path) {
				for (var i = 0, len = children_list.length; i < len; i++) {
					var node = children_list[i];
					if(path){
						node['_coordinate'] = path.split(',');
						node['_coordinate'].push(i);
					}else{
						node['_coordinate'] = [i];
					}
					var child = node[childrenField];
					child && recursion(child, node['_coordinate'].join());
				}
			}
			
			recursion(list);
		},
		getMD5Data: function(data, paramString){
			if(paramString){
				var _params = paramString.split('&');
				for(var i=0,len=_params.length;i<len;i++){
					var kv = _params[i].split('=');
					data[kv[0]] = kv[1];
				}
			}
			
			if(jQuery.isEmptyObject(data)){
				return {};
			}
			
			var array = [];
			for(var key in data){
				array.push(key);
			}
			array = array.sort();
			for(var i=0,len=array.length;i<len;i++){
				var key = array[i];
				array[i] += '=' + data[key];
			}
			var params = array.join('&');
			var md5 = lyb.MD5(params);
			data.md5 = md5;
			return data;
		},
		ajax : function(options) {
			var _default = {
				dataType : 'json',
				type: 'post',
				cache: false,
				timeout : 120000,
				error : function(e) {
					console && console.log(e);
				}
			};
			
			var _success = options.success;
			_default = jQuery.extend(true, _default, options);
			_default.success = function(result) {
				var code = result.code;
				if (code == 401 || code == 402) {
					top.location.href = ctx + 'login.html?code=' + code;
					return ;
				}else if(code == 403){
					result.msg = '您无权执行该操作!';
					result.success = false;
					resutl.data = null;
					result.total = 0;
				}
				_success && _success.call(this, result);
			};
			
			_default.data = lyb.getMD5Data(_default.data || {}, _default.url.split('?')[1]);

			//如果支持h5则使用formdata发送数据
			if(_default.type == 'post' && window.FormData){
				var fd = new FormData();
				var data = _default.data || {};
				for(var key in data){
					fd.append(key, data[key]);
				}
				_default.processData = false;// 告诉jQuery不要去处理发送的数据
				_default.contentType = false;// 告诉jQuery不要去设置Content-Type请求头
				_default.data = fd;
			}
			
			jQuery.ajax(_default);
		},

		/*------------克隆数据---------------*/
		clone : function(object) {
			return eval("(" + JSON.stringify(object) + ")");
		},
		_getBasicAttrs : function(el, attrs) {
			attrs = attrs || {};
			var num = this._parseNumber(el, attrs.number || []);
			var str = this._parseString(el, attrs.str || []);
			var bool = this._parseBool(el, attrs.bool || []);
			var json = this._parseJSON(el, attrs.json || []);

			var o = jQuery.extend(true, {}, str, bool, num, json);
			return o;
		},
		_parseString : function(el, attrs) {
			return this._parseProperty(el, attrs, "string");
		},
		_parseBool : function(el, attrs) {
			return this._parseProperty(el, attrs, "boolean");
		},
		_parseNumber : function(el, attrs) {
			return this._parseProperty(el, attrs, "number");
		},
		_parseJSON : function(el, attrs) {
			return this._parseProperty(el, attrs, "json");
		},
		_parseProperty : function(el, attrs, type) {
			var config = {};
			var dateSet = el[0].dataset;
			for (var i = 0, l = attrs.length; i < l; i++) {
				var property = attrs[i];
				var value = dateSet && dateSet[property] ? dateSet[property] : el.attr(property);
				if (value) {
					switch (type) {
					case 'string':
						config[property] = value;
						break;
					case 'boolean':
						config[property] = (value !== "false" || value === property) ? true : false;
						break;
					case 'json':
						config[property] = eval("(" + value + ")");
						break;
					case 'number':
						config[property] = Number(value.replace(/px/i, ""));
						break;
					}
					[ 'id', 'name', 'value', 'class', 'style' ].indexOf(property) == -1 && el.removeAttr(property);
				}
			}
			return config;
		},
		// TODO register 注册中心
		registers : {},
		Register : function(bean, uiType) {
			if (!this.registers[uiType]) {
				this.registers[uiType] = bean;
				bean.prototype.type = uiType;
			} else {
				console.log(uiType + ' 只能注册一次!');
			}
		},

		// TODO 通过id属性提取注册的组件
		get : function(id) {
			if (this.components[id]) {
				return this.components[id];
			} else if (this.bindings[id]) {
				return this.bindings[id];
			}
		},
		// TODO 通过name属性提取注册的组件
		getByName : function(name) {
			var rs = lyb.components;
			for ( var index in rs) {
				var comp = rs[index];
				if (comp.name == name) {
					return comp;
				}
			}
		},
		// TODO Deposit 组件寄存器
		components : {},
		bindings : {},
		Deposit : function(id, comp) {
			var storage = this.components;
			if (this.Binding && comp instanceof this.Binding) {
				storage = this.bindings;
			}
			if (!storage[id]) {
				storage[id] = comp;
			} else {
				alert('id 只能注册一次!');
			}
		},
		// 对象的合并方法，支持array/object无限参数合并到第一个对象
		concat : function() {
			var concat = function(source, target) {
				for ( var key in target) {
					var value = target[key];
					if (jQuery.type(value) == "array") {
						var sourceValue = source[key] = source[key] || [];
						concat(sourceValue, value);
					} else if (jQuery.type(value) == "object") {
						var sourceValue = source[key] = source[key] || {};
						concat(sourceValue, value);
					} else {
						if (jQuery.type(source) == "array") {
							source.push(value);
						} else {
							source[key] = value;
						}
					}
				}
				return source;
			};

			try {
				if (arguments.length === 0) {
					throw "没有足够的参数!";
				}
				if (arguments.length === 1) {
					throw "没有足够的参数,请输入两个或以上参数!";
				}
				var subObject = arguments[0];
				if (!subObject) {
					throw "没有目标对象!";
				}
				for (var i = 1; i < arguments.length; i++) {
					concat(subObject, arguments[i]);
				}
				return subObject;
			} catch (ex) {
				alert(ex);
				console.error(ex);
			}
		},
		/*------------------组建销毁--------------------*/
		Destroy : function(id) {
			if (this.components[id]) {
				delete this.components[id];
			} else if (this.bindings[id]) {
				delete this.bindings[id];
			}
		},
		VTypes : {
			"required" : function(v, args) {
				if (lyb.isNull(v) || v === "")
					return true;
				return false;
			},
			"email" : function(v) {
				if (this.required(v))
					return true;
				if (v.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)
					return true;
				else
					return false;
			},
			"url" : function(v) {
				if (this.required(v))
					return true;

				function IsURL(str_url) {
					str_url = str_url.toLowerCase().split("?")[0];
					var strRegex = "^((https|http|ftp|rtsp|mms)?:\/\/)"
							+ "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?"
							+ "(([0-9]{1,3}\.){3}[0-9]{1,3}" + "|" + "([0-9a-z_!~*'()-]+\.)*"
							+ "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." + "[a-z]{2,6})" + "(:[0-9]{1,5})?" + "((/?)|"
							+ "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
					var re = new RegExp(strRegex);

					if (re.test(str_url)) {
						return (true);
					} else {
						return (false);
					}
				}

				return IsURL(v);
			},
			"int" : function(v) {
				if (this.required(v))
					return true;

				function isInteger(s) {
					if (s < 0) {
						s = -s;
					}
					var n = String(s);
					return n.length > 0 && !(/[^0-9]/).test(n);
				}

				return isInteger(v);
			},
			"float" : function(v) {
				if (this.required(v))
					return true;

				function isFloat(s) {
					if (s < 0) {
						s = -s;
					}
					var n = String(s);
					if (n.split(".").length > 2)
						return false;
					return n.length > 0 && !(/[^0-9.]/).test(n);
				}

				return isFloat(v);
			},
			"date" : function(v) {
				if (this.required(v))
					return true;
				return /^(?:19|20)[0-9][0-9]-(?:(?:0[1-9])|(?:1[0-2]))-(?:(?:[0-2][1-9])|(?:[1-3][0-1])) (?:(?:[0-2][0-3])|(?:[0-1][0-9])):[0-5][0-9]:[0-5][0-9]$/
						.test(v);
			}
		},
		parse: function(id) {
			function __parse(el) {
				var _id = el.id;
				if (_id != undefined && _id != '') {
					if (lyb.get(_id) || el.dataset['parseDown'] == true || jQuery(el).data('parseDown') == true) {
						return false;
					}
				}
				var allCls = el.className || "";
				var clses = allCls.split(' ');
				for (var i = 0, length = clses.length; i < length; i++) {
					var cls = clses[i];
					var uiCls = cls.replace('lyb-', '');
					if (/lyb-/.test(cls) && lyb.registers[uiCls]) {
						var bean = lyb.registers[uiCls];
						if (_id == '' || _id == undefined) {
							_id = lyb.getUUID();
							el.id = _id;
						}
						try{
							var instance = new bean(jQuery(el));
							lyb.Deposit(_id, instance);
						}catch(e){
							console.error(e);
						}
						break;
					}
				}
			}
			var parent = arguments[arguments.length - 1];
			if(parent && arguments.length > 1){
				if (jQuery.type(parent) == 'string'){
					parent = jQuery('#' + parent.replace(/\$/, '\\$'));
				}else{
					parent = jQuery(parent);
				}
			}else{
				parent = jQuery(document.body);
			}
			if (id) {
				var jQel = id;
				if (jQuery.type(jQel) == 'string'){
					jQel = jQuery('#' + id, parent);
				}
				if (jQel[0]) {
					__parse(jQel[0]);
				}
			} else {
				var els = jQuery('div[class*="lyb-"]', parent);
				els.each(function(index, el) {
					__parse(el);
				});
				els = null;
			}
		}
	};

	// TODO Event
	lyb.Event = function(e, options) {
		this.event = e.originalEvent || e;
		this.jQueryEvent = e;
		this.target = jQuery(e.target);
		this.selector = jQuery(e.currentTarget);
		e.data = e.data || {};
		this._appendOptions(e.data || {}, options || {});
	};

	lyb.Event.prototype = {
		_execute : function() {
			if (this.handler)
				this.handler.call(this.sender, this);
		},
		_appendOptions : function(options) {
			var options = Array.prototype.slice.call(arguments);
			for(var index in options){
				var option = options[index];
				if(!option)
					continue;
				for ( var key in option) {
					this[key] = option[key];
				}
			}
		},
		preventDefault : function() {
			this.jQueryEvent.preventDefault();
		},
		stopPropagation : function() {
			this.jQueryEvent.stopPropagation();
		}
	};

	// TODO dataSource 数据源对象，用于处理各种数据
	lyb.DataSource = function(data, type) {
		this._uuid = lyb.getUUID();
		this.type = type || 'normal';
		this.childrenField = 'children';
		this._init(data, arguments[2], arguments[3], arguments[4], arguments[5]);
	};
	lyb.DataSource.prototype = {
		_init : function(data) {
			data = data || [];
			this.dataType = jQuery.type(data);
			this.data = lyb.clone(data);
			if (this.dataType == 'array') {
				if (this.type == 'tree') {
					this.idField = arguments[1];
					this.pidField = arguments[2];
					this.childrenField = arguments[3];
					this.sortField = arguments[4];
					this.data = lyb._makeLevelData(this.data, this.idField, this.pidField, this.childrenField, this.sortField);
				}
				this._evalNode();
			} else if (this.dataType == 'object') {
				this.data._uuid = this.data._uuid || lyb.getUUID();
			}
		},
		_evalNode : function(nodes) {
			function recursion(array, uuid) {
				for (var i = 0, len = array.length; i < len; i++) {
					var node = array[i];
					node._uuid = node._uuid || lyb.getUUID();
					if (uuid) {
						node._parent = uuid;
					}
					if (node[this.childrenField] && node[this.childrenField].length > 0) {
						recursion(node[this.childrenField], node._uuid);
					}
				}
			}
			recursion(nodes || this.data);
			return nodes;
		},
		// 通过uuid获取node
		_getNodeByUUID : function(uuid) {
			function recursion(array) {
				var find = undefined;
				for (var i = 0, len = array.length; i < len; i++) {
					var node = array[i];
					if (uuid === node["_uuid"]) {
						find = node;
					} else if (node[this.childrenField] && node[this.childrenField].length > 0) {
						find = recursion(node[this.childrenField]);
					}
					if (find) {
						break;
					}
				}
				return find;
			}
			return recursion(this.data);
		},
		// 通过path获取node
		_getNodeByPath : function(path) {
			if(path){
				var array = this.data, node;
				for(var i=0,len=path.length;i<len;i++){
					var index = path[i];
					node = array[index];
					array = node[this.childrenField] || [];
				}
				return node;
			}
		},
		addNode: function(node){
			this.addNodes([node]);
		},
		addNodes: function(nodes){
			nodes = this._evalNode(nodes || []);
			for(var i=0,len=nodes.length;i<len;i++){
				var node = nodes[i];
				if(this.type == 'tree'){
					var parent = this._getNodeByUUID(node[this.pidField]);
					if(parent){
						parent[this.childrenField].push(node);
					}
				}else{
					this.data.push(node);
				}
			}
		},
		removeNode: function(node){
			this.removeNodes([node]);
		},
		removeNodes: function(nodes){
			if (this.type == 'tree') {
				for (var i = 0, len = nodes.length; i < len; i++) {
					var node = nodes[i];
					var parent = this._getNodeByUUID(node[this.pidField]);
					if (parent) {
						parent[this.childrenField].push(node);
						for(var j=0,length=parent.length;j<length;j++){
							var row = parent[j];
							if(row._uuid == node._uuid){
								parent.splice(j, 1);
								break;
							}
						}
					}
				}
			}else{
				var rows = this.data;
				for(var i=0,len=nodes.length;i<len;i++){
					var node = nodes[i];
					for(var j=0,length=rows.length;j<length;j++){
						var row = rows[j];
						if(node._uuid == row._uuid){
							rows.splice(j, 1);
							break;
						}
					}
				}
			}
		},
		getData : function() {
			return this.data;
		}
	};

	// TODO date 对象
	lyb.Date = function(date, format) {
		this._format = format.toLowerCase();
		this.monthDay = [ 31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
		this._time = {
			second : 1000,
			minute : 1000 * 60,
			hour : 1000 * 60 * 60,
			day : 1000 * 60 * 60 * 24,
			week : 1000 * 60 * 60 * 24 * 7
		};
		this._init(date);
	};
	lyb.Date.prototype = {
		_init : function(date) {
			if (date instanceof Date) {
				this.date = date;
			} else {
				this.date = lyb.formatDate(date, this._format, true);
			}
		},
		_getskipDays : function(month, year, step) { // month从0开始索引
			step = step || 0;
			var count = 0;
			for (var i = 1; i <= Math.abs(step); i++) {
				var index = step / Math.abs(step);
				if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
					count += this.monthDay[month] || 29;
				} else {
					count += this.monthDay[month] || 28;
				}
				if (month + index > 11) {
					year++;
					month = month + index - 11;
				} else if (month + index < 0) {
					year--
					month = -(month + index);
				} else {
					month += index;
				}
			}
			return count * step / Math.abs(step);
		},
		format : function(date, format) {
			format = (format || this._format).toLowerCase();
			format = format.replace('yyyy', date.getFullYear());
			format = format.replace('mm', date.getMonth() + 1 >= 10 ? (date.getMonth() + 1)
					: ("0" + (date.getMonth() + 1)));
			format = format.replace('dd', date.getDate() >= 10 ? date.getDate() : ("0" + date.getDate()));
			format = format.replace('hh', date.getHours() >= 10 ? date.getHours() : ("0" + date.getHours()));
			format = format.replace('mi', date.getMinutes() >= 10 ? date.getMinutes() : ("0" + date.getMinutes()));
			format = format.replace('ss', date.getSeconds() >= 10 ? date.getSeconds() : ("0" + date.getSeconds()));
			format = format.replace('w', date.getDay());
			return format;
		},
		toDate : function() {
			return this.date;
		},
		toString : function(format) {
			return this.format(this.date, format || this._format);
		},
		getFullYear : function() {
			return this.date.getFullYear();
		},
		getMonth : function() {
			return this.date.getMonth();
		},
		getDay : function() {
			return this.date.getDate();
		},
		getWeek : function() {
			return this.date.getDay();
		},
		getHours : function() {
			return this.date.getHours();
		},
		getMinutes : function() {
			return this.date.getMinutes();
		},
		getSeconds : function() {
			return this.date.getSeconds();
		},
		getFromat : function() {
			return this.format;
		},
		getTime : function() {
			return this.date.getTime();
		},
		add : function(number, type) {
			var time = 0, year = this.date.getFullYear(), month = this.date.getMonth();
			if (type == 'year') {
				number *= 12;
				if ((year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)) {
					time += 366 * this._time.day;
				} else {
					time += 365 * this._time.day;
				}
			} else if (type == 'month') {
				time += this._getskipDays(month, year, number) * this._time.day;
			} else {
				time += this._time[type];
			}
			this.date = new Date(this.date.getTime() + time);
		}
	};
	//TODO 操作cookie
	lyb.cookie = {
		// 获取指定名称的cookie值：getCookie(name)
		get : function(cookie_name) {
			var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
			if (results)
				return (unescape(results[2]));
			else
				return null;
		},
		// 删除指定名称的cookie：deleteCookie(name)
		remove : function(name) {
			var date = new Date();
			date.setTime(date.getTime() - 10000);
			document.cookie = name + "=v; expire=" + date.toGMTString();
		},
		set : function(name, value, expireHours) {
			var cookieString = name + "=" + escape(value);
			// 判断是否设置过期时间
			if (expireHours > 0) {
				var date = new Date();
				date.setTime(date.getTime() + expireHours * 3600 * 1000);
				cookieString = cookieString + "; expire=" + date.toGMTString();
			}
			document.cookie = cookieString;
		}
	}
	/*-----------------------validate-------------------------*/
	/**
	 * @author 田鑫龙
	 */
	// 验证
	lyb.Validate = function() {
		this.numberErrorText = "无效的数字!";
		this.emailErrorText = "无效的邮件地址!";
		this.urlErrorText = "无效的网址!";
		this.mobileErrorText = "无效的手机号!";
		this.phoneErrorText = "无效的座机号!";
	};

	lyb.Validate.prototype = {
		_isEmail : function() {
			if (this._isNull() || this._isEmpty())
				return true;
			return !/^([a-zA-Z0-9_])+([a-zA-Z0-9_\.\-])*\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(this.value);
		},
		_isUrl : function(v, args) {
			if (this._isNull() || this._isEmpty())
				return true;
			var value = this.value.toLowerCase().split("?")[0];
			var strRegex = "^((https|http|ftp|rtsp|mms)?:\/\/)"
					+ "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" + "(([0-9]{1,3}\.){3}[0-9]{1,3}" + "|"
					+ "([0-9a-z_!~*'()-]+\.)*" + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." + "[a-z]{2,6})"
					+ "(:[0-9]{1,5})?" + "((/?)|" + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
			var re = new RegExp(strRegex);
			return !re.test(value);
		},
		_isNull : function() {
			return this.value === null || this.value === undefined;
		},
		_isEmpty : function() {
			return String(this.value).replace(/(^\s*)|(\s*$)/g, "") === '';
		},
		_isNumber : function() {
			return !/^(\-|\+)?\d+(\.\d+)?$/.test(this.value);
		},
		_isInt : function() {
			return !/^(\-|\+)?\d+$/.test(this.value);
		},
		_isFloat : function() {
			return !/^(\-|\+)?\d+\.\d+$/.test(this.value);
		},
		_isLess : function(value) {
			var result = Number(this.value) < Number(value);
			if (!result) {
				this.lessErrorText = "当前数值不应大于" + Number(value) + ", 请重新输入!";
			}
			return !result;
		},
		_isGreat : function(value) {
			var result = Number(this.value) > Number(value);
			if (!result) {
				this.lessErrorText = "当前数值不应小于" + Number(value) + ", 请重新输入!";
			}
			return !result;
		},
		_isMobile : function() {
			return !/^1\d{10}$/.test(this.value);
		},
		_isPhone : function() {
			return !/^(0[0-9]{2,3}\-)?([2-9][0-9]{6,7})+(\-[0-9]{1,4})?$/.test(this.value);
		},
		_isLength : function(info) { // TODO
			var infos = info.split("-");
			var max = Number(infos[1] || infos[0]);
			var min = Number(infos[0] == max ? 0 : infos[0]);
			if (this.value.length <= max && this.value.length >= min) {
				return false;
			} else {
				this.lengthErrorText = "文本长度必须在" + min + "到" + max + "之间!";
				return true;
			}
		},
		_isRange : function(info) { // TODO
			var infos = info.split("-");
			var max = Number(infos[1] || infos[0]);
			var min = Number(infos[0] == max ? 0 : infos[0]);
			if (Number(this.value) <= max && Number(this.value) >= min) {
				return false;
			} else {
				this.rangeErrorText = "数值大小必须在" + min + "到" + max + "之间!";
				return true;
			}
		},
		_isIdentify : function() {
			/*
			 * 根据〖中华人民共和国国家标准 GB 11643-1999〗中有关公民身份号码的规定，公民身份号码是特征组合码，由十七位数字本体码和一位数字校验码组成。排列顺序从左至右依次为：六位数字地址码，八位数字出生日期码，三位数字顺序码和一位数字校验码。
			 * 地址码表示编码对象常住户口所在县(市、旗、区)的行政区划代码。 出生日期码表示编码对象出生的年、月、日，其中年份用四位数字表示，年、月、日之间不用分隔符。 顺序码表示同一地址码所标识的区域范围内，对同年、月、日出生的人员编定的顺序号。顺序码的奇数分给男性，偶数分给女性。
			 * 校验码是根据前面十七位数字码，按照ISO 7064:1983.MOD 11-2校验码计算出来的检验码。
			 * 
			 * 出生日期计算方法。 15位的身份证编码首先把出生年扩展为4位，简单的就是增加一个19或18,这样就包含了所有1800-1999年出生的人; 2000年后出生的肯定都是18位的了没有这个烦恼，至于1800年前出生的,那啥那时应该还没身份证号这个东东，⊙﹏⊙b汗... 下面是正则表达式:
			 * 出生日期1800-2099 (18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01]) 身份证正则表达式
			 * /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i 15位校验规则 6位地址编码+6位出生日期+3位顺序号 18位校验规则 6位地址编码+8位出生日期+3位顺序号+1位校验位
			 * 
			 * 校验位规则 公式:∑(ai×Wi)(mod 11)……………………………………(1) 公式(1)中： i----表示号码字符从由至左包括校验码在内的位置序号； ai----表示第i位置上的号码字符值； Wi----示第i位置上的加权因子，其数值依据公式Wi=2^(n-1）(mod
			 * 11)计算得出。 i 18 17 16 15 14 13 12 11 10 9 8 7 6 5 4 3 2 1 Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1
			 * 
			 */
			// 身份证号合法性验证
			// 支持15位和18位身份证号
			// 支持地址编码、出生日期、校验位验证
			var code = this.value;
			var city = {
				11 : "北京",
				12 : "天津",
				13 : "河北",
				14 : "山西",
				15 : "内蒙古",
				21 : "辽宁",
				22 : "吉林",
				23 : "黑龙江 ",
				31 : "上海",
				32 : "江苏",
				33 : "浙江",
				34 : "安徽",
				35 : "福建",
				36 : "江西",
				37 : "山东",
				41 : "河南",
				42 : "湖北 ",
				43 : "湖南",
				44 : "广东",
				45 : "广西",
				46 : "海南",
				50 : "重庆",
				51 : "四川",
				52 : "贵州",
				53 : "云南",
				54 : "西藏 ",
				61 : "陕西",
				62 : "甘肃",
				63 : "青海",
				64 : "宁夏",
				65 : "新疆",
				71 : "台湾",
				81 : "香港",
				82 : "澳门",
				91 : "国外 "
			};
			var tip = "";

			if (!code
					|| !/^[1-9][0-9]{5}(19[0-9]{2}|20[0-9]{2})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[0-9]{3}[0-9xX]$/i
							.test(code)) {
				this.identifyErrorText = "身份证号格式错误";
				return true;
			} else if (!city[code.substr(0, 2)]) {
				this.identifyErrorText = "地址编码错误";
				return true;
			} else {
				// 18位身份证需要验证最后一位校验位
				if (code.length == 18) {
					code = code.split('');
					// ∑(ai×Wi)(mod 11)
					// 加权因子
					var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
					// 校验位
					var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
					var sum = 0;
					var ai = 0;
					var wi = 0;
					for (var i = 0; i < 17; i++) {
						ai = code[i];
						wi = factor[i];
						sum += ai * wi;
					}
					var last = parity[sum % 11];
					if (String(last).toLowerCase() != code[17].toLowerCase()) {
						this.identifyErrorText = "校验位错误";
						return true;
					}
				}
			}
		},
		getVFunction : function(vType) { // TODO
			if (vType != undefined || vType != '') {
				var _char = vType.charAt(0);
				_char = _char.toUpperCase();
				vType = vType.replace(/^\w/i, _char);
			}
			return '_is' + vType;
		},
		setVType : function(vType) {
			if (vType != undefined) {
				var vTypes = vType.split(",");
				for (var i = 0, len = vTypes.length; i < len; i++) {
					var vType = vTypes[i];
					var vTypeArray = vType.split(":");
					if (vTypeArray.length > 1) {
						vTypes[i] = {
							type : vTypeArray[0],
							value : vTypeArray[1]
						};
					} else {
						vTypes[i] = {
							type : vTypeArray[0]
						};
					}
				}
				this.vType = vTypes;
			}
		},
		setValue : function(value) {
			this.value = value == undefined ? '' : value;
		},
		setErrorText : function(text) {
			this.errorText = text;
		},
		setRequired : function(required) {
			this.required = required;
		},
		execute : function() {
			if (this.required) {
				if (this._isEmpty()) {
					return "不能为空!";
				}
			}
			if (this.vType != undefined && this.vType != '')
				for (var i = 0, len = this.vType.length; i < len; i++) {
					var item = this.vType[i];
					if (this.value != undefined && this.value != '') {
						if (this[this.getVFunction(item.type)](this.value))
							return this.errorText || this[item.type + 'ErrorText'];
					}
				}
			return "";
		}
	};

	// TODO 初始函数，所有方法都自该方法
	lyb.Root = function(id) {
		this._uuid = lyb.getUUID();
		this.events = {};
		if (jQuery.type(id) === 'string') {
			this.id = id;
			this.el = jQuery('#' + this.id);
		} else {
			this.el = id;
			this.id = id[0].id;
			if(this.id === ''){
				this.id = lyb.getUUID();
				this.el[0].id = this.id;
			}
		}
		this._getAttrs();
		this._initField();
		this._init();
		this._bindEvents();
		
		if(this.el[0].dataset){
			this.el[0].dataset['parseDown'] = true;
		}else{
			this.el.data('parseDown', true);
		}
	};
	lyb.Root.prototype = {
		_init : function() {
		},
		_initField : function() {
		},
		_triggerHandler : function(e) {
			var event = new lyb.Event(e);
			event._execute();
		},
		// 注册jquery的代理事件
		_on : function(el, selector, eventType, fn, sender) {
			var ev = {
				sender : sender || this,
				source : sender || this,
				handler : fn,
				eventType : eventType
			};
			el.on(eventType, selector, ev, this._triggerHandler);
		},
		// 注销jquery的代理事件,目前只用在destroy
		_un : function(el) {
			if (el) {
				el.off();
			}
		},
		_bindEvents : function() {

		},
		// 绑定事件，通过程序触发
		_bind : function(type, fn, scope) {
			scope = scope || this;
			type = type.toLowerCase();
			if (/^on/.test(type) == false)
				type = "on" + type;
			this.events[type] = this.events[type] || [];
			this.events[type].push([ fn, scope ]);
		},
		// 触发通过bind方法或属性自定义方法绑定的数据
		_fire : function(type, ev) {
			if (!/^on/.test(type)) {
				type = "on" + type;
			}
			var events = this.events[type] || [];
			for (var i = 0, length = events.length; i < length; i++) {
				var event = events[i];
				event[0].call(event[1], ev);
			}
		},
		_evalEvents : function(fns) {
			for ( var type in fns) {
				this._bind(type, fns[type], this);
			}
		},
		_destroy : function() {
			lyb.Destroy(this.id);
		},
		_getAttrs : function(attrs) {
			attrs = lyb.concat({
				str : [ "id", "name", "value" ],
				json : [],
				bool : [],
				number : []
			}, attrs || {});
			var str = lyb._parseString(this.el, attrs.str || []);
			var bool = lyb._parseBool(this.el, attrs.bool || []);
			var json = lyb._parseJSON(this.el, attrs.json || []);
			var num = lyb._parseNumber(this.el, attrs.number || []);

			var o = lyb.concat({}, str, bool, num, json);
			lyb.concat(this, o);
			return o;
		},
		// 通过uuid获取node
		_getNodeByUUID : function(uuid, field) {
			field = field || '_uuid';
			function recursion(array) {
				var find = undefined;
				for (var i = 0, len = array.length; i < len; i++) {
					var node = array[i];
					var _uuid = node[field];
					var type = jQuery.type(_uuid) || 'string';
					if(type == 'number'){
						uuid = uuid === '' ? '' : Number(uuid);
					}else{
						uuid = String(uuid);
					}
					if (uuid === node[field]) {
						find = node;
					} else if (node.children && node.children.length > 0) {
						find = recursion(node.children);
					}
					if (find) {
						break;
					}
				}
				return find;
			}
			return recursion(this.dataSource ? this.dataSource.getData() : this.data ? this.data : []);
		},
		// API
		bind : function(type, fn, scope) {
			this._bind(type, fn, scope);
		},
		destroy : function() {
			this._destroy();
		},
		getNodeByUUID: function(uuid, field){
			return this._getNodeByUUID(uuid, field);
		}
	};
	
	//动态加载模块功能
	lyb.defineModules = function(modules){
		lyb.LoadModules.modules = modules || {};
	};
	lyb.LoadModules = function(){
		this.loadStatus = true;
		this.cache = {js: [], css: []};
	};
	lyb.LoadModules.modules = {};
	lyb.LoadModules.prototype = {
		init: function(resources, callback){
			if(jQuery.type(resources) === 'string'){
				resources = [resources]
			}
			this.loadResources(resources, callback);
		},
		ajax: function(url, index, callback){
			if(this.jsArray[index] === 'ok'){
				callback && callback.call(this, index, 'ok');
				return;
			}
			jQuery.ajax({
				url: url, 
				type: 'get',
				cache: true,
				context: this,
				dataType: 'text',
				success: function(responseText){
					callback && callback.call(this, index, responseText);
				}
			});
		},
		writeJsCache: function(array){
			for(var i=0,len=array.length;i<len;i++){
				var url = array[i];
				var index = this.cache.js.indexOf(url);
				if(index == -1){
					this.cache.js.push(url);
				}else{
					this.jsArray[i] = 'ok';
				}
			}
		},
		writeCssCache: function(array){
			for(var i=0,len=array.length;i<len;i++){
				var url = array[i];
				var index = this.cache.css.indexOf(url);
				if(index == -1){
					this.cache.js.push(url);
				}else{
					this.cssArray[i] = 'ok';
				}
			}
		},
		loadResources: function(resources, callback){
			this.loadStatus = false;
			
			for(var index in resources){
				var resource = lyb.LoadModules.modules[resources[index]];
				var css = resource.css, js = resource.js;
				//初始化长度
				var cssLen = css.length, jsLen = js.length;
				//初始化存储
				this.cssArray = new Array(cssLen), this.jsArray = new Array(jsLen);
				//初始化计数器
				var cssCount = 0, jsCount = 0;
				
				//写缓存
				this.writeJsCache(js);
				this.writeCssCache(css);
				
				
				for(var i=0;i<cssLen;i++){
					var url = css[i];
					if(this.cssArray[i] === 'ok'){
						continue;
					}
					this.loadCss(url);
				}
				for(var i=0;i<jsLen;i++){
					var url = js[i];
					this.ajax(url, i, function(index, text){
						this.jsArray[index] = text;
						this.loadJS(callback);
						index = null;
					});
				}
			}
		},
		execCallback: function(callback){
			if(callback && !this.loadStatus){
				this.loadStatus = true;
				callback();
			}
		},
		loadJS: function(callback){
			var status = true;
			for(var i=0,len=this.jsArray.length;i<len;i++){
				var js = this.jsArray[i];
				if(js && js !== 'ok'){
					var exec = js;
					this.jsArray[i] = 'ok';
					window.eval.call(window, exec);
				}else if(!js){
					status = status && false;
					break;
				}else if(js === 'ok'){
					status = status && true;
					continue;
				}
			}
			if(status)
				this.execCallback(callback);
		},
		loadCss: function(url){
			var link = document.createElement('link');
			link.href = url;
			link.setAttribute('rel','stylesheet');
			link.setAttribute('media','all');
			link.setAttribute('type','text/css');
			document.head.appendChild(link);
		}
	};
	//实例化模块，单例模式
	var _loadModules = new lyb.LoadModules();
	lyb.loadModules = function(resources, callback){
		return _loadModules.init(resources, callback);
	};
	

	// 本地存储
	lyb.storage = {
		setLocalStorage : function(key, value) {
			if (jQuery.type(value) == 'object' || jQuery.type(value) == 'array') {
				value = JSON.stringify(value);
			}
			if (lyb.HTML5)
				localStorage.setItem(key, value);
			else
				lyb.storage[key] = value;
		},
		getLocalStorage : function(key) {
			var value = '';
			if (lyb.HTML5)
				value = localStorage.getItem(key);
			else
				value = lyb.storage[key];
		},
		setSessionStorage : function(key, value) {
			if (jQuery.type(value) == 'object' || jQuery.type(value) == 'array') {
				value = JSON.stringify(value);
			}
			if (lyb.HTML5)
				sessionStorage.setItem(key, value);
			else
				lyb.storage[key] = value;
		},
		getSessionStorage : function(key) {
			var value = '';
			if (lyb.HTML5)
				value = sessionStorage.getItem(key);
			else
				value = lyb.storage[key];
		}
	};
	//全局事件
	lyb.globalEvents = {
		click: [],
		resize: [],
		pushEvent: function(event, type){
			this[type].push(event);
		},
		removeEvent: function(type, UUID){
			var array = this[type];
			for(var index in array){
				var event = array[index];
				var UUID = event[2];
				if(UUID === UUID){
					array.splice(index, 1);
					break;
				}
			}
		},
		execute: function(){
			var self = this;
			jQuery(document).on('click', function(e){
				for(var index in self.click){
					var event = self.click[index];
					event[0].call(event[1], new lyb.Event(e, {eventType: 'click', source: event[1], sender: event[1]}));
				}
			});
			jQuery(window).on('resize', function(e){
				for(var index in self.resize){
					var event = self.resize[index];
					event[0].call(event[1], new lyb.Event(e, {eventType: 'resize', source: event[1], sender: event[1]}));
				}
			});
		}
	};
	lyb.globalEvents.execute();
	
	
	// 重写基本数据类型的方法
	Array.prototype.toString = function(split) {
		split = split || '';
		return this.join(split);
	};
})(jQuery, JSON);