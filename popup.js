
$(function(){

var host_admin = chrome.extension.getBackgroundPage().host_admin;
var host_file_wrapper = chrome.extension.getBackgroundPage().host_file_wrapper;
var searchbar = $("#search input");
chrome.windows.getCurrent(function(w){
	chrome.tabs.query({ active: true , windowType: "normal", windowId:w.id }, function(t){
		if (t.length > 0){
			var hosts = host_admin.get_hosts();
			var host = t[0].url.match(/:\/\/(.[^/^:]+)/)[1];
			if(hosts[host]){
				searchbar.val(host).select();
			}
		}
		redraw();
	});
});


var host_ul = $("#list");

var redraw = function(){
	var wanted = searchbar.val();
	wanted = $.trim(wanted);

	host_ul.find("ul").remove();
	if(host_admin.refresh()){
		//TODO build index
	}
	var hosts = host_admin.get_hosts();
	var group_names = host_admin.get_groups();
	var groups = [];

	var found = [];

	if(hosts[wanted]){
		found[wanted] = hosts[wanted];
	}

	wanted = wanted.toLowerCase();
	for (var h in hosts){
		var hitted = false;
		var h = h.toLowerCase();
		if(h.indexOf(wanted) >= 0 && h != wanted){
			hitted = true;
		}else{
			for(var i in hosts[h]){
				var host = hosts[h][i];
				var g = host.group;
				var gn = group_names[g];
				if(gn && gn.toLowerCase().indexOf(wanted) >= 0){
					hitted = true;
					break;
				}else if(host.comment && host.comment.indexOf(wanted)){
					hitted = true;
					break;
				}
			}
		}

		if(hitted){
			found[h] = hosts[h];
		}
	}

	for (var h in found){
		var ul = $("<ul/>");
		ul.addClass('nav nav-list');

		var addheader = (function(){
			var added = false;

			return function(){
				if(!added){
					ul.append($('<li class="nav-header">' + h + '</li>'));
					added = true;
				}
			};
				
		})();


		for(var i in hosts[h]){

			var host = hosts[h][i];

			if(host.comment == 'HIDE '){
				continue;
			}

			var a = $('<a href="javascript:;"><i class="icon-"></i>' + host.addr + '<em class="pull-right">' + host.comment+'</em></a>');
			// var a = $('<a href="javascript:;"><i class="icon-"></i>' + host.addr + '<em class="pull-right">' + host.group +'</em></a>');
			a.click((function(host, hostname ,host_index){
			return function(){
				host_admin.host_toggle(hostname, host_index);
				host_file_wrapper.set(host_admin.mk_host());
				redraw();
			}})(host,h,i));

			var li = $("<li/>").append(a);

			if(host.using){
				li.find('i').addClass('icon-ok')
			}


			addheader();
			ul.append(li);
			
			var g = host.group;
			var gn = group_names[g];
			if(gn){
				if(typeof groups[g] == "undefined"){
					groups[g] = [];
				}
				
				groups[g].push(h);
			}
		}
		
		host_ul.append(ul);
	}

	if ( groups.length > 0){
		
		var ul = $("<ul/>");
		ul.addClass('nav nav-list');
		ul.append($('<li class="nav-header">' + '<i class="icon-folder-open"></i>GROUPS' + '</li>'));

		for(var g in groups){
			var group_name = group_names[g];
			var group_id = g;
			var host_list = groups[g];

			var a = $('<a href="javascript:;"><i class="icon-"></i>' + group_name + '<em class="pull-right">' + '' +'</em></a>');
			a.click((function(host_list, group_id){
			return function(){
				host_admin.group_toggle(host_list, group_id);
				host_file_wrapper.set(host_admin.mk_host());
				redraw();
			}})(host_list, group_id));

			var li = $("<li/>").append(a);

			if(host_admin.group_checked(host_list, group_id)){
				li.find('i').addClass('icon-ok')
			}

			ul.append(li);
		}
		host_ul.append(ul);
	}
};


searchbar.keyup(redraw);

$(document.body).keydown(function(e){
	searchbar.focus();
});

});

