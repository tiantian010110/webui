/**
 * @author 田鑫龙 v1.0
 * 
 */
(function(){
	var scripts = document.getElementsByTagName("script");
	var src = bootSrc = '';
	for(var index in scripts){
		var script = scripts[index];
		if(script.src.indexOf('resources/lyb') != -1){
			src = bootSrc = script.src;
			break;
		}
	}
	if(src == ''){
		return;
	}
	
	src = src.replace(/\/\w+\.js/, "/");
	window.ctx = script.src.replace(/resources\/lybui\/\w+\.js/, "");
	bootSrc = src.replace(/lybui\//, "");
	
	document.write('<link href="'+ src +'css/font-awesome.min.css" rel="stylesheet" type="text/css">');
	document.write('<link href="'+ src +'css/root.css" rel="stylesheet" type="text/css">');
	document.write('<script type="text/javascript" src="' + src + 'jquery.min.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'root.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'third/md5/md5.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.loading.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.textbox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.password.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.hidebox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.bigtext.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.popupedit.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.datepicker.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.datebox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.calendar.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.tabs.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.accordion.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.tree.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.pager.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.form.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.datasheet.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.decimal.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.listbox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.gridbox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.combobox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.filterbox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.blockbox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.checkbox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.radiobox.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.upload.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.notice.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.tips.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.dialog.js"></script>');
	document.write('<script type="text/javascript" src="' + src + 'plugins/lyb.modal.js"></script>');
	
	//模块配置
	document.write('<script type="text/javascript" src="' + src + 'module.config.js"></script>');
})();