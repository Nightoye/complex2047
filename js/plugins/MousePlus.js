//=============================================================================
// 滑鼠plus
// 最後更新：2016/04/24
// http://home.gamer.com.tw/homeindex.php?owner=qootm2
//=============================================================================
/*:
 * @plugindesc 讓選單游標能跟著滑鼠移動
 * @author Q－S.T.
 *
 * @help 
恢復滑鼠應有的功能
 
另外新增兩個屬性，可取得滑鼠目前的X、Y座標(原本必須按著滑鼠才有)：
TouchInput.nowX
TouchInput.nowY
 
 
*/
  
 
(function() {
// ----------------------------------------------
// ● TouchInput 數據清除
// ----------------------------------------------
var _TouchInput_clear = TouchInput.clear;
TouchInput.clear = function() {
    _TouchInput_clear.call(this);
    this.nowX = 0;
    this.nowY = 0;
}
 
// ----------------------------------------------
// ● 滑鼠移動
// ----------------------------------------------
var _TouchInput_onMouseMove = TouchInput._onMouseMove;
TouchInput._onMouseMove = function(event) {
    _TouchInput_onMouseMove.call(this, event);
    this.nowX = Graphics.pageToCanvasX(event.pageX);
    this.nowY = Graphics.pageToCanvasY(event.pageY);
};
 
// ----------------------------------------------
// ● 定期更新觸控／滑鼠
// ----------------------------------------------
var _Window_Selectable_prototype_processTouch = Window_Selectable.prototype.processTouch;
Window_Selectable.prototype.processTouch = function() {
    // 更新滑鼠
    if (this.isOpenAndActive()) {
        var lastIndex = this.index();
        var x = this.canvasToLocalX(TouchInput.nowX);
        var y = this.canvasToLocalY(TouchInput.nowY);
        var hitIndex = this.hitTest(x, y);
        if (hitIndex >= 0 && this.isCursorMovable()) {
            this.select(hitIndex);
            // 播放游標移動音效
            if (this.index() !== lastIndex) {
                SoundManager.playCursor();
            }
        }
    }
    _Window_Selectable_prototype_processTouch.call(this);
};
 
})();