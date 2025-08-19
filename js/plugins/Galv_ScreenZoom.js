//-----------------------------------------------------------------------------
//  Galv's Screen Zoom
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_ScreenZoom.js
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_ScreenZoom = true;

var Galv = Galv || {};              // Galv's main object
Galv.ZOOM = Galv.ZOOM || {};          // Galv's stuff


//-----------------------------------------------------------------------------
/*:
 * @plugindesc v1.3 放大游戏像素
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param 放大倍数
 * @desc 默认2倍
 * @default 2
 *
 * @param 禁用缩放的开关
 * @desc 请填写开关的ID，默认1号开关。开启时恢复原本大小，关闭时放大。
 * @default 1
 *
 * @help 
 *  
 *   Galv's Screen Zoom (CHK 改)
 * ----------------------------------------------------------------------------
 * 【救命！】 
 * 1.即插即用，仅限放大城镇，不包含战斗
 * 2.新增点地移动的优化
 * 3.修复原插件用老存档时会报错的BUG
 * 4.修复屏幕放大时[图片]的坐标、缩放会异常的BUG
 * 
 * 【更新日志】
 * 2023-4-13 - 1.3版本 - 魔改并删除无用的功能，改为永久缩放屏幕(CHK)
 * 2020-09-14 - 1.2版本 - 增加插件设置，禁用战斗缩放(原作者)
 * 2017-03-10 - 1.1版本 - 修正了战斗缩放的错误，增加了战斗规模(原作者)
 * 2017-02-10 - 1.0版本 - 发布(原作者)
 * -----------------------------------------------------------------------------
 * 使用条款可在以下网站找到(原作者)：
 * galvs-scripts.com
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.ZOOM.battleZoomEnabled = false;	
Galv.ZOOM.battleScale = 1;
Galv.ZOOM.FDBS = Number(PluginManager.parameters('GALV_ScreenZoom')["放大倍数"]);
Galv.ZOOM.SFKG = Number(PluginManager.parameters('GALV_ScreenZoom')["禁用缩放的开关"]);

Galv.ZOOM.setTo = function(x,y) {
	if ($gameScreen._zoomScale == 1) {
		$gameScreen._zoomX = x;
		$gameScreen._zoomY = y;
	}
};

Galv.ZOOM.move = function(x,y,scale,duration) {
	$gameScreen.startZoom(x,y,scale,duration);
};

Galv.ZOOM.center = function(scale,duration) {
	var x = Graphics.boxWidth / 2;
	var y = Graphics.boxHeight / 2;
	$gameScreen.startZoom(x,y,scale,duration);
};

Galv.ZOOM.target = function(id,scale,duration) {
	if (id <= 0) {
		var target = $gamePlayer;
	} else {
		var target = $gameMap.event(id);
	}
	var x = target.screenX();
	var y = target.screenY() - 12 - scale;
	$gameScreen.startZoom(x,y,scale,duration);
};

Galv.ZOOM.restore = function(duration) {
	var x = Graphics.boxWidth / 2;
	var y = Graphics.boxHeight / 2;
	$gameScreen.startZoom(x,y,1,duration);
};

Galv.ZOOM.saveZoomData = function() {
	if (!$gameSystem._savedZoom) return;
	$gameSystem._savedZoom.x = Number($gameScreen._zoomX);
	$gameSystem._savedZoom.xTarget = Number($gameScreen._zoomXTarget);
	$gameSystem._savedZoom.y = Number($gameScreen._zoomY);
	$gameSystem._savedZoom.yTarget = Number($gameScreen._zoomYTarget);
	$gameSystem._savedZoom.scale = Number($gameScreen._zoomScale);
	$gameSystem._savedZoom.scaleTarget = Number($gameScreen._zoomScaleTarget);
	$gameSystem._savedZoom.duration = Number($gameScreen._zoomDuration);
};


//-----------------------------------------------------------------------------
//  GAME SYSTEM
//-----------------------------------------------------------------------------

Galv.ZOOM.Game_System_initialize = Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	Galv.ZOOM.Game_System_initialize.call(this);
	var cx = Graphics.boxWidth / 2;
	var cy = Graphics.boxHeight / 2
	this._savedZoom = {
		x: cx,
		y: cy,
		xTarget: cx,
		yTarget: cy,
		scale: 1,
		scaleTarget: 1,
		duration: 0
	}
};


//-----------------------------------------------------------------------------
//  GAME SCREEN
//-----------------------------------------------------------------------------

Galv.ZOOM.Game_Screen_startZoom = Game_Screen.prototype.startZoom;
Game_Screen.prototype.startZoom = function(x, y, scale, duration) {
	
	if (!Galv.ZOOM.battleZoomEnabled && $gameParty.inBattle()) {
		return Galv.ZOOM.Game_Screen_startZoom.call(this,x, y, scale, duration)
	}
	
	Galv.ZOOM.setTo(x,y);

	var cx = Graphics.boxWidth / 2;
	if (x < 0) {
		x = this._zoomX;
	} else if (x != cx) {
		var pox = Graphics.boxWidth / (scale * 2 - 2);
		var difX = cx - x;
		if (difX != 0) difX = (difX / cx) * pox;
		x = x - difX;
	}

	var cy = Graphics.boxHeight / 2;	
	if (y < 0) {
		y = this._zoomY;
	} else if (y != cy) {
		var poy = Graphics.boxHeight / (scale * 2 - 2);
		var difY = cy - y;
		if (difY != 0) difY = (difY / cy) * poy;
		y = y - difY;
	}

	this._zoomXTarget = Math.min(Graphics.boxWidth,Math.max(x,0));
	this._zoomYTarget = Math.min(Graphics.boxHeight,Math.max(y,0));

    this._zoomScaleTarget = scale < 0 ? this._zoomScale : scale;
    //this._zoomDuration = duration || 60;
	this._zoomDuration = duration;
	this._BeiShu = scale;
};

Galv.ZOOM.Game_Screen_updateZoom = Game_Screen.prototype.updateZoom;
Game_Screen.prototype.updateZoom = function() {
	if (!Galv.ZOOM.battleZoomEnabled && $gameParty.inBattle()) {
		return Galv.ZOOM.Game_Screen_updateZoom.call(this);
	}
	//如果允许双倍缩放屏幕 CHK
	if (!$gameParty.inBattle()) {
	    if (!$gameSwitches.value(Galv.ZOOM.SFKG)) {
		  if (this._BeiShu==1) this._wt = SceneManager._scene.fadeSpeed()+1;
		  if (this._wt && this._wt>0) this._wt --;
		  var s = this._wt?5:0;
	      $gameScreen.startZoom($gamePlayer.screenX(),$gamePlayer.screenY()-14,Galv.ZOOM.FDBS,s);
	    } else {
		  if (this._BeiShu==Galv.ZOOM.FDBS) this._wt = SceneManager._scene.fadeSpeed()*Galv.ZOOM.FDBS;
		  if (this._wt && this._wt>0) this._wt --;
		  var s = this._wt?5:0;
	      $gameScreen.startZoom($gamePlayer.screenX(),$gamePlayer.screenY()-13,1,s);	
	    }
	};//
    if (this._zoomDuration >= 0) {
        var d = this._zoomDuration || 1;
        var t = this._zoomScaleTarget;
        this._zoomScale = (this._zoomScale * (d - 1) + t) / d;
		this._zoomX = (this._zoomX * (d - 1) + this._zoomXTarget) / d;
		this._zoomY = (this._zoomY * (d - 1) + this._zoomYTarget) / d;	
        if (this._zoomDuration > 0) this._zoomDuration--;
    }
};

// Overwrite
Game_Screen.prototype.clearZoom = function() {
	if (!$gameSystem._savedZoom) return;
	this._zoomX = Number($gameSystem._savedZoom.x);
	this._zoomXTarget = Number($gameSystem._savedZoom.xTarget);
	this._zoomY = Number($gameSystem._savedZoom.y);
	this._zoomYTarget = Number($gameSystem._savedZoom.yTarget);
	this._zoomScale = Number($gameSystem._savedZoom.scale);
	this._zoomScaleTarget = Number($gameSystem._savedZoom.scaleTarget);
	this._zoomDuration = Number($gameSystem._savedZoom.duration);
};


Galv.ZOOM.Game_Screen_onBattleStart = Game_Screen.prototype.onBattleStart;
Game_Screen.prototype.onBattleStart = function() {
	Galv.ZOOM.saveZoomData();
	Galv.ZOOM.dontSave = true;
	Galv.ZOOM.Game_Screen_onBattleStart.call(this);
};

Game_Screen.prototype.resetBattleZoom = function() {
    if (Galv.ZOOM.battleZoomEnabled)  {
	this._zoomX = Graphics.width / 2;
	this._zoomXTarget = Graphics.width / 2;
	this._zoomY = -7200;
	this._zoomYTarget = -7200;
	this._zoomScale = Galv.ZOOM.battleScale;
	this._zoomScaleTarget = Galv.ZOOM.battleScale;
	this._zoomDuration = 0;
	Galv.ZOOM.move(Graphics.width/2,Graphics.height/2,1,45);
	} else {
	this._zoomX = Graphics.boxWidth / 2;
	this._zoomXTarget = Graphics.boxWidth / 2;
	this._zoomY = Graphics.boxHeight / 2;
	this._zoomYTarget = Graphics.boxHeight / 2
	this._zoomScale = 1;
	this._zoomScaleTarget = 1;
	this._zoomDuration = 0;	
	};
};

var _DJGame_Map_canvasToMapX = Game_Map.prototype.canvasToMapX;
Game_Map.prototype.canvasToMapX = function(x) {
	if ($gameSwitches.value(Galv.ZOOM.SFKG)) return _DJGame_Map_canvasToMapX.call(this,x);
    var tileWidth = this.tileWidth()*Galv.ZOOM.FDBS;
    var originX = this._displayX * tileWidth;
    var mapX = Math.floor((originX + x+$gameScreen.zoomX()*(Galv.ZOOM.FDBS-1)) / tileWidth);
    return this.roundX(mapX);
};
var _DJGame_Map_canvasToMapY = Game_Map.prototype.canvasToMapY;
Game_Map.prototype.canvasToMapY = function(y) {
	if ($gameSwitches.value(Galv.ZOOM.SFKG)) return _DJGame_Map_canvasToMapY.call(this,y);
    var tileHeight = this.tileHeight()*Galv.ZOOM.FDBS;
    var originY = this._displayY * tileHeight;
    var mapY = Math.floor((originY + y+$gameScreen.zoomY()*(Galv.ZOOM.FDBS-1)) / tileHeight);
    return this.roundY(mapY);
};

var _TPSprite_Picture_updatePosition = Sprite_Picture.prototype.updatePosition;
Sprite_Picture.prototype.updatePosition = function() {
	if ($gameSwitches.value(Galv.ZOOM.SFKG)) {
		_TPSprite_Picture_updatePosition.call(this);
	} else {
		var picture = this.picture();
		var bs = Galv.ZOOM.FDBS/(Galv.ZOOM.FDBS-1);
		this.x = ((picture.x()+$gameScreen.zoomX())/bs);
		this.y = ((picture.y()+$gameScreen.zoomY())/bs);
	}
};
var _TPSprite_Picture_updateScale = Sprite_Picture.prototype.updateScale;
Sprite_Picture.prototype.updateScale = function() {
	if ($gameSwitches.value(Galv.ZOOM.SFKG)) {
		_TPSprite_Picture_updateScale.call(this);
	} else {
		var picture = this.picture();
		this.scale.x = picture.scaleX()/Galv.ZOOM.FDBS / 100;
		this.scale.y = picture.scaleY()/Galv.ZOOM.FDBS / 100;
	}
};

//-----------------------------------------------------------------------------
//  SCENE MAP
//-----------------------------------------------------------------------------

Galv.ZOOM.Scene_Map_start = Scene_Map.prototype.start;
Scene_Map.prototype.start = function() {
	$gameScreen.clearZoom();
	Galv.ZOOM.Scene_Map_start.call(this);
};

Galv.ZOOM.Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
	if (!Galv.ZOOM.dontSave) Galv.ZOOM.saveZoomData();
	Galv.ZOOM.Scene_Map_terminate.call(this);
};


//-----------------------------------------------------------------------------
//  SCENE BATTLE
//-----------------------------------------------------------------------------

Galv.ZOOM.Scene_Battle_start = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function() {
	$gameScreen.resetBattleZoom();
	Galv.ZOOM.Scene_Battle_start.call(this);
};

Galv.ZOOM.Scene_Battle_terminate = Scene_Battle.prototype.terminate;
Scene_Battle.prototype.terminate = function() {
	Galv.ZOOM.dontSave = false;
	Galv.ZOOM.Scene_Battle_terminate.call(this);
};

})();