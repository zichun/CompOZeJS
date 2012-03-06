function Log(level,logger,prefix){var _currentLevel=Log.WARN;var _logger=Log.writeLogger;var _prefix=false;this.setPrefix=function(pre){if(pre!='undefined'){_prefix=pre;}
else{_prefix=false;}}
this.setLogger=function(logger){if(logger!='undefined'){_logger=logger;}}
this.setLevel=function(level){if(level!='undefined'&&typeof level=='number'){_currentLevel=level;}else if(level!='undefined'){if(level=='debug'){_currentLevel=Log.DEBUG;}
else if(level=='info'){_currentLevel=Log.INFO;}
else if(level=='error'){_currentLevel=Log.ERROR;}
else if(level=='fatal'){_currentLevel=Log.FATAL;}
else if(level=='warn'){_currentLevel=Log.WARN;}
else{_currentLevel=Log.NONE;}}}
this.getPrefix=function(){return _prefix;}
this.getLogger=function(){return _logger;}
this.getLevel=function(){return _currentLevel;}
if(level!='undefined'){this.setLevel(level);}
if(logger!='undefined'){this.setLogger(logger);}
if(prefix!='undefined'){this.setPrefix(prefix);}}
Log.prototype.debug=function(s){if(this.getLevel()<=Log.DEBUG){this._log(s,"DEBUG",this);}}
Log.prototype.info=function(s){if(this.getLevel()<=Log.INFO){this._log(s,"INFO",this);}}
Log.prototype.warn=function(s){if(this.getLevel()<=Log.WARN){this._log(s,"WARN",this);}}
Log.prototype.error=function(s){if(this.getLevel()<=Log.ERROR){this._log(s,"ERROR",this);}}
Log.prototype.fatal=function(s){if(this.getLevel()<=Log.FATAL){this._log(s,"FATAL",this);}}
Log.prototype._log=function(msg,level,obj){if(this.getPrefix()){this.getLogger()(this.getPrefix()+" - "+msg,level,obj);}else{this.getLogger()(msg,level,obj);}}
Log.DEBUG=1;Log.INFO=2;Log.WARN=3;Log.ERROR=4;Log.FATAL=5;Log.NONE=6;Log.alertLogger=function(msg,level){alert(level+" - "+msg);}
Log.writeLogger=function(msg,level){document.writeln(level+"&nbsp;-&nbsp;"+msg+"<br/>");}
Log.consoleLogger=function(msg,level,obj){if(window.console){window.console.log(level+" - "+msg);}else{Log.popupLogger(msg,level,obj);}}
Log.popupLogger=function(msg,level,obj){if(obj.popupBlocker){return;}
if(!obj._window||!obj._window.document){obj._window=window.open("",'logger_popup_window','width=420,height=320,scrollbars=1,status=0,toolbars=0,resizable=1');if(!obj._window){obj.popupBlocker=true;alert("You have a popup window manager blocking the log4js log popup display.\n\nThis must be disabled to properly see logged events.");return;}
if(!obj._window.document.getElementById('loggerTable')){obj._window.document.writeln("<table width='100%' id='loggerTable'><tr><th align='left'>Time</th><th width='100%' colspan='2' align='left'>Message</th></tr></table>");obj._window.document.close();}}
var tbl=obj._window.document.getElementById("loggerTable");var row=tbl.insertRow(-1);var cell_1=row.insertCell(-1);var cell_2=row.insertCell(-1);var cell_3=row.insertCell(-1);var d=new Date();var h=d.getHours();if(h<10){h="0"+h;}
var m=d.getMinutes();if(m<10){m="0"+m;}
var s=d.getSeconds();if(s<10){s="0"+s;}
var date=(d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear()+"&nbsp;-&nbsp;"+h+":"+m+":"+s;cell_1.style.fontSize="8pt";cell_1.style.fontWeight="bold";cell_1.style.paddingRight="6px";cell_2.style.fontSize="8pt";cell_3.style.fontSize="8pt";cell_3.style.whiteSpace="nowrap";cell_3.style.width="100%";if(tbl.rows.length%2==0){cell_1.style.backgroundColor="#eeeeee";cell_2.style.backgroundColor="#eeeeee";cell_3.style.backgroundColor="#eeeeee";}
cell_1.innerHTML=date
cell_2.innerHTML=level;cell_3.innerHTML=msg;}
Log.dumpObject=function(obj,indent){if(!indent){indent="";}
if(indent.length>20){return;}
var s="{\n";for(var p in obj){s+=indent+p+":";var type=typeof(obj[p]);type=type.toLowerCase();if(type=='object'){s+=Log.dumpObject(obj[p],indent+"----");}else{s+=obj[p];}
s+="\n";}
s+=indent+"}";return s;}