(() => {
    'use strict';

    ////////////////////////////////////////////////////////////////////////////
    // Fetch parameters
    ////////////////////////////////////////////////////////////////////////////
    const script = document.currentScript;
    let name = script.src.split('/');
    name = name[name.length-1].replace('.js','');

    const params = PluginManager.parameters(name);

    function usePixelPerfectMode() {
        return params.enableIngameOptions == "false" || ConfigManager.TDDP_pixelPerfectMode == true;
    }

    ////////////////////////////////////////////////////////////////////////////
    // Bitmap extensions - Force Nearest Scaling
    ////////////////////////////////////////////////////////////////////////////
    const _Bitmap_prototype_initialize = Bitmap.prototype.initialize;
    Bitmap.prototype.initialize = function(width, height) {
        _Bitmap_prototype_initialize.call(this, width, height);
        this.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;  // 強制使用鄰近縮放模式
        this._smooth = !usePixelPerfectMode();
    }

    ////////////////////////////////////////////////////////////////////////////
    // Graphics extensions - Ensure Nearest Scaling for Canvas
    ////////////////////////////////////////////////////////////////////////////
    const _Graphics__createCanvas = Graphics._createCanvas;
    Graphics._createCanvas = function() {
        _Graphics__createCanvas.call(this);
        this.TDDP_updateCanvasImageRenderingMode();
    }

    const _Graphics__updateCanvas = Graphics._updateCanvas;
    Graphics._updateCanvas = function() {
        _Graphics__updateCanvas.call(this);
        this.TDDP_updateCanvasImageRenderingMode();
    };

    Graphics.TDDP_updateCanvasImageRenderingMode = function() {
        this._canvas.style.imageRendering = usePixelPerfectMode() ? 'pixelated' : '';
    }

    ////////////////////////////////////////////////////////////////////////////
    // Apply Nearest Scaling to All Textures
    ////////////////////////////////////////////////////////////////////////////
    const _Sprite_initialize = Sprite.prototype.initialize;
    Sprite.prototype.initialize = function(bitmap) {
        _Sprite_initialize.call(this, bitmap);
        if (this.bitmap) {
            this.bitmap.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;  // 對所有精靈應用鄰近縮放
        }
    };

    if (params.enableIngameOptions == "true") {
        //////////////////////////////////////////////////////////////////////////
        // Window_Options extensions - only if ingame options enabled in plugin params
        //////////////////////////////////////////////////////////////////////////
        const _Window_Options_prototype_addGeneralOptions = Window_Options.prototype.addGeneralOptions;
        Window_Options.prototype.addGeneralOptions = function() {
            _Window_Options_prototype_addGeneralOptions.call(this);

            let label = params.en; // default is english
            if ($gameSystem.isJapanese()) {
                label = params.ja;
            }
            else if ($gameSystem.isChinese()) {
                label = params.zh;
            }
            else if ($gameSystem.isKorean()) {
                label = params.ko;
            }
            else if ($gameSystem.isRussian()) {
                label = params.ru;
            }

            this.addCommand(label, "TDDP_pixelPerfectMode");
        };

        const _Window_Options_prototype_setConfigValue = Window_Options.prototype.setConfigValue;
        Window_Options.prototype.setConfigValue = function(symbol, volume) {
            _Window_Options_prototype_setConfigValue.call(this, symbol, volume);
            
            if (symbol == 'TDDP_pixelPerfectMode') Graphics.TDDP_updateCanvasImageRenderingMode();
        };

        //////////////////////////////////////////////////////////////////////////
        // ConfigManager extensions - only if ingame options enabled in plugin params
        //////////////////////////////////////////////////////////////////////////
        const _ConfigManager_makeData = ConfigManager.makeData;
        ConfigManager.makeData = function() {
            const config = _ConfigManager_makeData.call(this);
            config.TDDP_pixelPerfectMode = this.TDDP_pixelPerfectMode;
            return config
        }
        
        const _ConfigManager_applyData = ConfigManager.applyData;
        ConfigManager.applyData = function(config) {
            _ConfigManager_applyData.call(this, config);
            this.TDDP_pixelPerfectMode = this.readFlag(config, "TDDP_pixelPerfectMode", true);
        }
    }
})();