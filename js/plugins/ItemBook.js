//=============================================================================
// ItemBook.js
//=============================================================================

/*:
 * @plugindesc Displays detailed statuses of items.
 * @author Yoji Ojima
 *
 * @param Unknown Data
 * @desc The index name for an unknown item.
 * @default
 *
 * @param Price Text
 * @desc The text for "Price".
 * @default Price
 *
 * @param Equip Text
 * @desc The text for "Equip".
 * @default Equip
 *
 * @param Type Text
 * @desc The text for "Type".
 * @default Type
 *
 * @help
 *
 * Plugin Command:
 *   ItemBook open            # Open the item book screen
 *   ItemBook add weapon 3    # Add weapon #3 to the item book
 *   ItemBook add armor 4     # Add armor #4 to the item book
 *   ItemBook remove armor 5  # Remove armor #5 from the item book
 *   ItemBook remove item 6   # Remove item #6 from the item book
 *   ItemBook complete        # Complete the item book
 *   ItemBook clear           # Clear the item book
 *
 * Item (Weapon, Armor) Note:
 *   <book:no>                # This item does not appear in the item book
 */

/*:ja
 * @plugindesc アイテム図鑑です。アイテムの詳細なステータスを表示します。
 * @author Yoji Ojima
 *
 * @param Unknown Data
 * @desc 未確認のアイテムの索引名です。
 * @default ？？？？？？
 *
 * @param Price Text
 * @desc 「価格」の文字列です。
 * @default 価格
 *
 * @param Equip Text
 * @desc 「装備」の文字列です。
 * @default 装備
 *
 * @param Type Text
 * @desc 「タイプ」の文字列です。
 * @default タイプ
 *
 * @help
 *
 * プラグインコマンド:
 *   ItemBook open            # 図鑑画面を開く
 *   ItemBook add weapon 3    # 武器３番を図鑑に追加
 *   ItemBook add armor 4     # 防具４番を図鑑に追加
 *   ItemBook remove armor 5  # 防具５番を図鑑から削除
 *   ItemBook remove item 6   # アイテム６番を図鑑から削除
 *   ItemBook complete        # 図鑑を完成させる
 *   ItemBook clear           # 図鑑をクリアする
 *
 * アイテム（武器、防具）のメモ:
 *   <book:no>                # 図鑑に載せない場合
 */

(function() {

    var parameters = PluginManager.parameters('ItemBook');
    var unknownData = String(parameters['Unknown Data'] || '？？？');
    var priceText = String(parameters['Price Text'] || 'Price');
    var equipText = String(parameters['Equip Text'] || 'Equip');
    var typeText = String(parameters['Type Text'] || 'Type');

    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ItemBook') {
            switch (args[0]) {
            case 'open':
                SceneManager.push(Scene_ItemBook);
                break;
            case 'add':
                $gameSystem.addToItemBook(args[1], Number(args[2]));
                break;
            case 'remove':
                $gameSystem.removeFromItemBook(args[1], Number(args[2]));
                break;
            case 'complete':
                $gameSystem.completeItemBook();
                break;
            case 'clear':
                $gameSystem.clearItemBook();
                break;
            }
        }
    };

    Game_System.prototype.addToItemBook = function(type, dataId) {
        if (!this._ItemBookFlags) {
            this.clearItemBook();
        }
        var typeIndex = this.itemBookTypeToIndex(type);
        if (typeIndex >= 0) {
            this._ItemBookFlags[typeIndex][dataId] = true;
        }
    };

    Game_System.prototype.removeFromItemBook = function(type, dataId) {
        if (this._ItemBookFlags) {
            var typeIndex = this.itemBookTypeToIndex(type);
            if (typeIndex >= 0) {
                this._ItemBookFlags[typeIndex][dataId] = false;
            }
        }
    };

    Game_System.prototype.itemBookTypeToIndex = function(type) {
        switch (type) {
        case 'item':
            return 0;
        case 'weapon':
            return 1;
        case 'armor':
            return 2;
        default:
            return -1;
        }
    };

    Game_System.prototype.completeItemBook = function() {
        var i;
        this.clearItemBook();
        for (i = 1; i < $dataWeapons.length; i++) {
            this._ItemBookFlags[1][i] = true;
        }
    };

    Game_System.prototype.clearItemBook = function() {
        this._ItemBookFlags = [[], [], []];
    };

    Game_System.prototype.isInItemBook = function(item) {
        if (this._ItemBookFlags && item) {
            var typeIndex = -1;
            if (DataManager.isItem(item)) {
                typeIndex = 0;
            } else if (DataManager.isWeapon(item)) {
                typeIndex = 1;
            } else if (DataManager.isArmor(item)) {
                typeIndex = 2;
            }
            if (typeIndex >= 0) {
                return !!this._ItemBookFlags[typeIndex][item.id];
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    var _Game_Party_gainItem = Game_Party.prototype.gainItem;
    Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
        _Game_Party_gainItem.call(this, item, amount, includeEquip);
        if (item && amount > 0) {
            var type;
            if (DataManager.isItem(item)) {
                type = 'item';
            } else if (DataManager.isWeapon(item)) {
                type = 'weapon';
            } else if (DataManager.isArmor(item)) {
                type = 'armor';
            }
            $gameSystem.addToItemBook(type, item.id);
        }
    };

    function Scene_ItemBook() {
        this.initialize.apply(this, arguments);
    }

    Scene_ItemBook.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_ItemBook.prototype.constructor = Scene_ItemBook;

    Scene_ItemBook.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_ItemBook.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._indexWindow = new Window_ItemBookIndex(36, 24);
        this._indexWindow.setHandler('cancel', this.popScene.bind(this));
        var wx = 36+this._indexWindow.width;
        var ww = 744-this._indexWindow.width;
        var wh = 576;
        this._statusWindow = new Window_ItemBookStatus(wx, 24, ww, wh);
        this.addWindow(this._indexWindow);
        this.addWindow(this._statusWindow);
        this._indexWindow.setStatusWindow(this._statusWindow);
	this._statusWindow.opacity=0;
	this._indexWindow.opacity=0;
    };

    function Window_ItemBookIndex() {
        this.initialize.apply(this, arguments);
    }

    Window_ItemBookIndex.prototype = Object.create(Window_Selectable.prototype);
    Window_ItemBookIndex.prototype.constructor = Window_ItemBookIndex;

    Window_ItemBookIndex.lastTopRow = 0;
    Window_ItemBookIndex.lastIndex  = 0;

    Window_ItemBookIndex.prototype.initialize = function(x, y) {
        var width = 160; //Graphics.boxWidth;
        var height = 576;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
	//this.opacity = 0;
        this.refresh();
        this.setTopRow(Window_ItemBookIndex.lastTopRow);
        this.select(Window_ItemBookIndex.lastIndex);
        this.activate();
    };

    Window_ItemBookIndex.prototype.maxCols = function() {
        return 1;
    };

    Window_ItemBookIndex.prototype.maxItems = function() {
        return this._list ? this._list.length : 0;
    };

    Window_ItemBookIndex.prototype.setStatusWindow = function(statusWindow) {
        this._statusWindow = statusWindow;
        this.updateStatus();
    };

    Window_ItemBookIndex.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateStatus();
    };

    Window_ItemBookIndex.prototype.updateStatus = function() {
        if (this._statusWindow) {
            var item = this._list[this.index()];
            this._statusWindow.setItem(item);
        }
    };

    Window_ItemBookIndex.prototype.refresh = function() {
        var i, item;
        this._list = [];
        for (i = 1; i < $dataWeapons.length; i++) {
            item = $dataWeapons[i];
            if (item.name && $gameSystem.isInItemBook(item)){
                this._list.push(item);
            }
        }
        for (i = 1; i < $dataArmors.length; i++) {
            item = $dataArmors[i];
            if (item.name && $gameSystem.isInItemBook(item)) {
                this._list.push(item);
            }
        }
        this.createContents();
        this.drawAllItems();
    };

    Window_ItemBookIndex.prototype.drawItem = function(index) {
        var item = this._list[index];
        var rect = this.itemRect(index);
        var width = rect.width - this.textPadding();
        //if ($gameSystem.isInItemBook(item)) {
	    this.drawIcon(item.iconIndex, rect.x, rect.y+2);
	    this.drawText("照片"+item.id, rect.x + 34, rect.y, rect.width);
            //this.drawItemName(item, rect.x, rect.y, width);
        //} else {
           // var iw = Window_Base._iconWidth + 4;
           // this.drawText(unknownData, rect.x + iw, rect.y, width - iw);
       // }
    };

    Window_ItemBookIndex.prototype.processCancel = function() {
        Window_Selectable.prototype.processCancel.call(this);
        Window_ItemBookIndex.lastTopRow = this.topRow();
        Window_ItemBookIndex.lastIndex = this.index();
    };

    function Window_ItemBookStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_ItemBookStatus.prototype = Object.create(Window_Base.prototype);
    Window_ItemBookStatus.prototype.constructor = Window_ItemBookStatus;

    Window_ItemBookStatus.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };

    Window_ItemBookStatus.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_ItemBookStatus.prototype.refresh = function() {
        var item = this._item;
        var x = 0;
        var y = 0;
        var lineHeight = this.lineHeight();

        this.contents.clear();

        if (!item || !$gameSystem.isInItemBook(item)) {
            return;
        }

        this.drawItemName(item, x, y);

        x = this.textPadding();
        y = lineHeight + this.textPadding();

        this.changeTextColor(this.textColor(6));
        this.drawText('拍摄地点', x, y, 120);
        this.resetTextColor();
        this.drawText(item.description, x + 120, y, 240, 'right');
        y += lineHeight;
	y += this.textPadding();
        x = this.textPadding();
        this.drawTextEx(item.note, x, y);
	if (item.price != 0){
		y = 160;
	        this.changeTextColor(this.textColor(6));
		this.drawText('图像', x, y, 120);
		y =200;
		x =30;
		var bitmap = ImageManager.loadPicture("photo" + item.id, 0);
		bitmap.addLoadListener(function() {this.contents.blt(bitmap, 0,0,480,360,x,y);}.bind(this))
	}
 	//this.drawText('拍摄地点', x, y, 120);

    };
//===================菜单修改===========
Scene_Menu.prototype.createCommandWindow = function() {
    this._commandWindow = new Window_MenuCommand(0, 0);
    this._commandWindow.x = 288;	//位置x
    this._commandWindow.y = 196;	//位置y
    this._commandWindow.setHandler('item',      this.commandItem.bind(this));
    this._commandWindow.setHandler('skill',     this.commandPhoto.bind(this));
    this._commandWindow.setHandler('equip',     this.commandDictionary.bind(this));
    this._commandWindow.setHandler('status',    this.commandPersonal.bind(this));
    this._commandWindow.setHandler('formation', this.commandFormation.bind(this));
    this._commandWindow.setHandler('options',   this.commandOptions.bind(this));
    this._commandWindow.setHandler('save',      this.commandSave.bind(this));
    this._commandWindow.setHandler('gameEnd',   this.commandGameEnd.bind(this));
    this._commandWindow.setHandler('cancel',    this.popScene.bind(this));
    this.addWindow(this._commandWindow);
    };

Scene_Menu.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    };

Scene_Menu.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this.createCommandWindow();
    };

Scene_Menu.prototype.start = function() {
        Scene_MenuBase.prototype.start.call(this);
    };

Scene_Menu.prototype.commandPhoto = function() {
  	SceneManager.push(Scene_ItemBook);
};

Scene_Menu.prototype.commandDictionary = function() {
    SceneManager.push(Scene_History);
};
//以下是Scene_item部分
  Scene_Item.prototype.create = function() {
    Scene_ItemBase.prototype.create.call(this);
    this.createHelpWindow();
    this._helpWindow.x=36;
    this._helpWindow.y=24;
    this._helpWindow.width=744;
    this._helpWindow.opacity=0;
    this.createItemWindow();
    this.createActorWindow();
  };


  Scene_Item.prototype.createItemWindow = function() {
    var wy = this._helpWindow.height;
    var wh = 576 - wy;
    this._itemWindow = new Window_ItemList(36, 24+wy, 744, wh);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
    this._itemWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._itemWindow);
    this._itemWindow.setCategory('keyItem');
    this.onCategoryOk();
    this._itemWindow.opacity=0;
  };

//历史部分

function Scene_History() {
        this.initialize.apply(this, arguments);
    }

    Scene_History.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_History.prototype.constructor = Scene_History;

    Scene_History.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_History.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this._indexWindow = new Window_HistoryIndex(36, 44);
        this._indexWindow.setHandler('cancel', this.popScene.bind(this));
        this._statusWindow = new Window_HistoryStatus(36, 44+80, 744, 576-80);
        this.addWindow(this._indexWindow);
        this.addWindow(this._statusWindow);
        this._indexWindow.setStatusWindow(this._statusWindow);
    };

    function Window_HistoryIndex() {
        this.initialize.apply(this, arguments);
    }

    Window_HistoryIndex.prototype = Object.create(Window_Selectable.prototype);
    Window_HistoryIndex.prototype.constructor = Window_HistoryIndex;

    Window_HistoryIndex.lastTopRow = 0;
    Window_HistoryIndex.lastIndex  = 0;

    Window_HistoryIndex.prototype.initialize = function(x, y) {
        var width = 744; //Graphics.boxWidth;
        var height = 80;
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
	this.opacity = 0;
        this.refresh();
        this.setTopRow(Window_HistoryIndex.lastTopRow);
        this.select(Window_HistoryIndex.lastIndex);
        this.activate();
    };

    Window_HistoryIndex.prototype.maxCols = function() {
        return 1;
    };

    Window_HistoryIndex.prototype.maxItems = function() {
        return this._list ? this._list.length : 0;
    };

    Window_HistoryIndex.prototype.setStatusWindow = function(statusWindow) {
        this._statusWindow = statusWindow;
        this.updateStatus();
    };

    Window_HistoryIndex.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateStatus();
    };

    Window_HistoryIndex.prototype.updateStatus = function() {
        if (this._statusWindow) {
            var item = this._list[this.index()];
            this._statusWindow.setItem(item);
        }
    };

//设定数量
    Window_HistoryIndex.prototype.refresh = function() {
        var i, skill;
        this._list = [];
        for (i = 1; i < $dataSkills.length; i++) {
            skill = $dataSkills[i];
            if (skill.name && $gameActors.actor(1).isLearnedSkill(skill.id)) {
                this._list.push(skill);
            }
        }
        this.createContents();
        this.drawAllItems();
    };
//标出物品
    Window_HistoryIndex.prototype.drawItem = function(index) {
        var skill = this._list[index];
        var rect = this.itemRect(index);
        var width = rect.width - this.textPadding();
        this.drawItemName(skill, rect.x, rect.y, width);
    };

    Window_HistoryIndex.prototype.processCancel = function() {
        Window_Selectable.prototype.processCancel.call(this);
        Window_HistoryIndex.lastTopRow = this.topRow();
        Window_HistoryIndex.lastIndex = this.index();
    };

    function Window_HistoryStatus() {
        this.initialize.apply(this, arguments);
    }

    Window_HistoryStatus.prototype = Object.create(Window_Base.prototype);
    Window_HistoryStatus.prototype.constructor = Window_HistoryStatus;

    Window_HistoryStatus.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
	this.opacity=0;
    };

    Window_HistoryStatus.prototype.setItem = function(item) {
        if (this._item !== item) {
            this._item = item;
            this.refresh();
        }
    };

    Window_HistoryStatus.prototype.refresh = function() {
        var item = this._item;
        var x = 0;
        var y = 0;
        var lineHeight = this.lineHeight();
        x = this.textPadding();
        y = this.textPadding();
        this.contents.clear();
        this.changeTextColor(this.textColor(6));
        this.drawText('记录', x, y, 120);
        this.resetTextColor();
	y += lineHeight;
        x = this.textPadding();
        this.drawText(item.description, x, y, 240);
	y += lineHeight;
        this.drawTextEx(item.note, x, y);
	
    };
//测试能否使用图片菜单背景。
Scene_Item.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = Bitmap.load("img/system/item.png");
    this.addChild(this._backgroundSprite);
};

Scene_ItemBook.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = Bitmap.load("img/system/photo.png");
    this.addChild(this._backgroundSprite);
};
Scene_History.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = Bitmap.load("img/system/history.png");
    this.addChild(this._backgroundSprite);
};
Scene_Save.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = Bitmap.load("img/system/saveload.png");
    this.addChild(this._backgroundSprite);
};
Scene_Load.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = Bitmap.load("img/system/saveload.png");
    this.addChild(this._backgroundSprite);
};
})();
