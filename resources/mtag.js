$(document).ready(function(){
	mtag.init();
});

mtag = {
	addboxstring : '<div class="addbox">Add an item:&nbsp;&nbsp;&nbsp;<input type="text" class="addtext" value=""/> <input type="button" class="additem" value="&nbsp;&nbsp;+&nbsp;&nbsp;"/></div>',
	init : function() {
		$(".mtag").each(function(){
			mtag.build(this);
		});
		mtag.eventsetup();
	},
	build : function(elem) {
		var thisid = "box_" + $(elem).attr("id");
		listtype = ($(elem).hasClass("list")) ? "bulletlist" : "taglist"; 
		$(elem).change(function(){ mtag.addboxes(this,"box_" + this.id,true) }).hide();
		$(elem).before('<div class="supertagbox ' + listtype + '" id="' + thisid + '"></div>');
		mtag.addboxes(elem,thisid);
	},
	addboxes : function(elem,thisid,indi) {
		$("#" + thisid).empty();
		thislist = $(elem).val().split(";");
		for (i=0;i<thislist.length;i++) {
			if ($.trim(thislist[i]) != "") {
				$("#" + thisid).append(mtag.structure(thislist[i]));
			}
		}
		$("#" + thisid).append('<div class="clearfloat"></div>');
		$("#" + thisid).append(mtag.addboxstring);
		mtag.addrels($("#" + thisid));
		if (indi) {
			mtag.eventsetup();
		}
	},
	addrels : function(elem) {
		var childnum = $(elem).children(".supertag").length;
		for (i=0;i<childnum;i++) {
			$(elem).children(".supertag:eq(" + i + ")").attr("rel",i);
		}
	},
	structure : function(val) {
		val = val.replace("<","&lt;");
		return '<div class="supertag"><span class="supertagval">' + $.trim(val) + '</span><span class="supertagbutton edit" title="Edit this entry."></span><span class="supertagbutton remove" title="Remove this entry."></span></div>';
	},
	eventsetup : function() {
		$(".supertagbutton").unbind("click").click(function(){
			if ($(this).parent().hasClass("editing")) {
				if ($(this).hasClass("edit")) {
					mtag.finishedit($(this).parent(),"finish");
				} else if ($(this).hasClass("remove")) {
					mtag.finishedit($(this).parent(),"cancel");
				}
			} else {
				if ($(this).hasClass("edit")) {
					mtag.startedit($(this).parent());
				} else if ($(this).hasClass("remove")) {
					mtag.startremove($(this).parent());
				}
			}
		});
		$(".additem").unbind("click").click(function(){ mtag.additem($(this).parent().parent()); });
		$(".addtext").unbind("keydown").bind("keydown",function(e){
			if (e.keyCode == 13) {
				$(this).next().click();
				return false;
			}
		}); 
	},
	startedit : function(elem) {
		if ($("#editingbox").length > 0) {
			mtag.finishedit($("#editingbox").parent().parent(),"cancel");
		}
		curwidth = parseInt($(elem).css("width")) - 55;
		$(elem).addClass("editing");
		mtag.renamebuttons(elem,"toedit");
		gettext = $(elem).children(".supertagval").html();
		$(elem).children(".supertagval").attr("rel",gettext);
		inclass = $(elem).parent().hasClass("bulletlist");
		if (gettext.length > 128 || inclass) {
			$(elem).children(".supertagval").html('<span id="editingbox"><textarea id="newval" style="width:' + (curwidth+5) + 'px">' + gettext + '</textarea></span>');
		} else {
			$(elem).children(".supertagval").html('<span id="editingbox"><input id="newval" type="text" value="' + gettext + '" style="width:' + curwidth + 'px"/></span>');
		}
		$("#newval").unbind("keydown").bind('keydown',function(e){
			if (e.keyCode == 13) {
				$(this).parent().parent().next().click();
				return false;
			}
		});
		$("#editingbox").children("input").focus();
	},
	finishedit : function(elem,action) {
		$(elem).removeClass("editing").removeAttr("style");
		mtag.renamebuttons(elem,"unedit");
		newtext = (action == "finish") ? $("#editingbox").children("#newval").val() : $(elem).children(".supertagval").attr("rel");
		mtag.boxio($(elem).attr("rel"),"#"+$(elem).parent().attr("id").substr(4),newtext);
		$(elem).children(".supertagval").html(newtext);
		$("#editingbox").remove();
	},
	startremove : function(elem) {
		$(elem).hide(400,function(){ mtag.killnode(this,$(this).parent()); });
	},
	killnode : function(elem,parent) {
		thisindex = $(elem).attr("rel"); 
		$(elem).remove();
		mtag.boxio(thisindex,"#"+$(parent).attr("id").substr(4),"");
		mtag.addrels($(parent));
	},
	boxio : function(thisindex,getid,newstring,mode) {
		rawval = $(getid).val();
		if (rawval.charAt(rawval.length-1) != ";") {
			rawval = rawval + ";";
		}
		curval = rawval.split(";");
		if (thisindex != "add") {
			curval.splice(thisindex,1,newstring);
		} else {
			curval.splice(curval.length-1,1,newstring);
		}
		newstring = "";
		for (i=0;i<curval.length;i++) {
			if ($.trim(curval[i]) != "") {
				newstring += $.trim(curval[i]) + ";";
			}
		}
		$(getid).val(newstring);
	},
	additem : function(elem) {
		addrel = parseInt($(elem).children(".supertag").length);
		addtext = $(elem).find(".addtext").val().split(";");
		addtextstring = "";
		for (i=0;i<addtext.length;i++) {
			if ($.trim(addtext[i]) != "") {
				$(elem).children(".clearfloat").before(mtag.structure(addtext[i]));
				addtextstring+=addtext[i]+";";
			}
		}
		mtag.boxio("add","#"+$(elem).attr("id").substr(4),addtextstring.substr(0,addtextstring.length-1));
		$(elem).find(".addtext").val("");
		mtag.eventsetup();
		mtag.addrels(elem);
	},
	renamebuttons : function(elem,direc) {
		if (direc == "toedit") {
			editbutton = "Confirm this change.";
			removebutton = "Canced this change.";
		} else {
			editbutton = "Edit this entry.";
			removebutton = "Remove this entry.";
		}
		$(elem).children(".supertagbutton.edit").attr("title",editbutton);
		$(elem).children(".supertagbutton.remove").attr("title",removebutton);
	}
}