//=============================================================================
// ����plus
// ������£�2016/04/24
// http://home.gamer.com.tw/homeindex.php?owner=qootm2
//=============================================================================
/*:
 * @plugindesc ׌�x���Θ��ܸ��������Ƅ�
 * @author Q��S.T.
 *
 * @help 
�֏ͻ����еĹ���
 
���������ɂ����ԣ���ȡ�û���Ŀǰ��X��Y����(ԭ����횰����������)��
TouchInput.nowX
TouchInput.nowY
 
 
*/
  
 
(function() {
// ----------------------------------------------
// �� TouchInput �������
// ----------------------------------------------
var _TouchInput_clear = TouchInput.clear;
TouchInput.clear = function() {
    _TouchInput_clear.call(this);
    this.nowX = 0;
    this.nowY = 0;
}
 
// ----------------------------------------------
// �� �����Ƅ�
// ----------------------------------------------
var _TouchInput_onMouseMove = TouchInput._onMouseMove;
TouchInput._onMouseMove = function(event) {
    _TouchInput_onMouseMove.call(this, event);
    this.nowX = Graphics.pageToCanvasX(event.pageX);
    this.nowY = Graphics.pageToCanvasY(event.pageY);
};
 
// ----------------------------------------------
// �� ���ڸ����|�أ�����
// ----------------------------------------------
var _Window_Selectable_prototype_processTouch = Window_Selectable.prototype.processTouch;
Window_Selectable.prototype.processTouch = function() {
    // ���»���
    if (this.isOpenAndActive()) {
        var lastIndex = this.index();
        var x = this.canvasToLocalX(TouchInput.nowX);
        var y = this.canvasToLocalY(TouchInput.nowY);
        var hitIndex = this.hitTest(x, y);
        if (hitIndex >= 0 && this.isCursorMovable()) {
            this.select(hitIndex);
            // �����Θ��Ƅ���Ч
            if (this.index() !== lastIndex) {
                SoundManager.playCursor();
            }
        }
    }
    _Window_Selectable_prototype_processTouch.call(this);
};
 
})();