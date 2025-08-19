/*:
 * @target MZ
 * @plugindesc 遊戲啟動時自動打開系統用開關（如飽食度、心情、時間）v1.0
 * @author 炎月月月
 *
 * @help
 * 這個插件會在新遊戲開始時，自動打開你設定的系統開關。
 * 適合用來開啟飽食度系統、心情系統、時間系統等共通事件的觸發開關。
 * 
 * ✔ 不需要額外指令，只要安裝本插件即可。
 *
 * 預設開啟以下開關（你可以在腳本中修改）：
 *  - #2 飽食度系統
 *  - #3 心情系統
 *  - #5 初始設置
 * 
 * 沒有插件指令。
 */

(() => {
  const autoSwitchIds = [2, 3, 5]; // ← 這裡修改你要啟動的開關編號

  const _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function() {
    _DataManager_setupNewGame.call(this);

    autoSwitchIds.forEach(id => {
      $gameSwitches.setValue(id, true);
    });
  };
})();
