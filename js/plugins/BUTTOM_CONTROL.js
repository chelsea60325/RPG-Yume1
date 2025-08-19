/*:
 * @target MZ
 * @plugindesc 在選單中新增 "開關 0001" 按鈕，並顯示開關狀態（開啟/關閉）
 * @author 你的名字
 *
 * @help 這個插件會在選單內新增一個控制開關 0001 的按鈕，並顯示開關狀態。
 */

(() => {
    // 修改選單命令，新增控制開關 0001 的選項
    const _Window_MenuCommand_addMainCommands = Window_MenuCommand.prototype.addMainCommands;
    Window_MenuCommand.prototype.addMainCommands = function() {
        _Window_MenuCommand_addMainCommands.call(this);
        this.addCommand(this.switchStatus(), "switchControl", true);
    };

    // 根據開關狀態顯示不同文字
    Window_MenuCommand.prototype.switchStatus = function() {
        const switchId = 1; // 0001 開關
        const isActive = $gameSwitches.value(switchId);
        return `畫面： ${isActive ? "小" : "大"}`;
    };

    // 修改選單選項的處理器，切換開關狀態
    const _Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        _Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("switchControl", this.toggleSwitch0001.bind(this));
    };

    // 切換開關 0001 並更新選單顯示的文字
    Scene_Menu.prototype.toggleSwitch0001 = function() {
        const switchId = 1; // 0001 開關
        const newState = !$gameSwitches.value(switchId);
        $gameSwitches.setValue(switchId, newState);
        
        if (newState) {
            SoundManager.playOk();
        } else {
            SoundManager.playCancel();
        }

        // 更新選單中的文字顯示
        this._commandWindow.refresh();
        this._commandWindow.activate();
    };
})();
