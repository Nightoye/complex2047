//=============================================================================

// AndrewX - Wall Passage

// AndrewX_WallPassage.js

//=============================================================================

var AndrewX = AndrewX || {};

AndrewX.WP = AndrewX.WP || {};

//=============================================================================

/*:

 * @plugindesc v0.01 Enable characters to walk behind walls. 

 * Also enable tiles in set A to be star passage.

 * @author AndrewX

 *

 * @param Star Tag

 * @desc Tiles with this Terrain Tag will be set to star passage(shown above characters).

 * @default 99

 *

 * @param Wall Top Tag

 * @desc Tiles with this Terrain Tag will be calculated as wall top side.

 * @default 7

 *

 * @param Wall Front Tag

 * @desc Tiles with this Terrain Tag will be calculated as wall front side.

 * @default 6

 * 

 * @param Default Wall Height

 * @desc If wall front side cannot be sampled, this will be the default wall height.

 * @default 2

 *

 * @param Default Wall Thickness

 * @desc If wall top side cannot be sampled, this will be the default wall thickness.

 * @default 1

 * 

 * @help

 * ============================================================================

 * Introduction and Instructions

 * ============================================================================

 *

 * It's a pity multi-layered mapping is canceled since RMVX, and characters are

 * no longer able to walk behind walls, which makes maps a bit of weird. With

 * this plugin, you can set two terrain tags as wall top and wall front, and

 * passage behind walls are calculated automatically. It is best if you use

 * this feature on autotiles in set A.

 *

 * You can also set a terrain tag as Star Tag, which makes tiles to be star

 * passage (even they are in set A).

 *

 * If you do not need any one of these functions, just set the tag parameter to

 * a number greater than 7.

 *

 * Note: 

 * Any tiles with tags above will be shown above characters. So you might

 * want to use this plugin together with Neon Black's Large Sprite Fix.

 * Check it out here: 

 * [url]http://forums.rpgmakerweb.com/index.php?/topic/50274-neon-blacks-large-sprite-fix/[/url]

 *

 * If you want to show any tiles in set B to E above walls, set it with star

 * passage.

 *

 * 4-direction passage does not work on tiles with above tags.

 *

 *

 * ============================================================================

 * Changelog

 * ============================================================================

 *

 * Version 0.01:

 * - Finished prototype

 *

 * ============================================================================

 * Term of Use

 * ============================================================================

 *

 * Free for use in non-commercial or commercial RMMV projects

 * Please credit AndrewX

 * 

 */

//=============================================================================

 

//=============================================================================

// Parameter Variables

//=============================================================================

 

var parameters = PluginManager.parameters('AndrewX_WallPassage');

var starTag = Number(parameters['Star Tag']);

var topTag = Number(parameters['Wall Top Tag']);

var frontTag = Number(parameters['Wall Front Tag']);

var defWallHeight = Number(parameters['Default Wall Height']);

var defWallThickness = Number(parameters['Default Wall Thickness']);

 

//=============================================================================

// Modified higher tile check

//=============================================================================

 

AndrewX.WP._isHigherTile = Tilemap.prototype._isHigherTile;

Tilemap.prototype._isHigherTile = function(tileId) {

        if ((this.flags[tileId] & 0xF000) === topTag << 12 ||

                (this.flags[tileId] & 0xF000) === frontTag << 12 ||

                (this.flags[tileId] & 0xF000) === starTag << 12) {

                return true;

        } else {

                return AndrewX.WP._isHigherTile.call(this, tileId);

        }

};

 

//=============================================================================

// Private flag check

//=============================================================================

 

Game_Map.prototype._hasFlag = function(x, y, f) {

        var flags = this.tilesetFlags();

        var tiles = this.allTiles(x, y);

        if (tiles[0] === 0 && tiles[1] === 0 && tiles[2] === 0 && tiles[3] === 0) {

                return false;

        }

        for (var i = 0; i < tiles.length; i++) {

                if ((flags[tiles[i]] & 0xF000) === (f << 12)) {

                        return true;

                }

        }

        return false;

};

 

//=============================================================================

// Modified passage check

//=============================================================================

 

AndrewX.WP.checkPassage = Game_Map.prototype.checkPassage;

Game_Map.prototype.checkPassage = function(x, y, bit) {

        var flags = this.tilesetFlags();

        var tiles = this.allTiles(x, y);

        var mapHeight = $dataMap.height;

        var upperTop = 0;

        var upperFront = 0;

        var lowerTop = 0;

        var lowerFront = 0;

        for (var i = 0; i < tiles.length; i++) {

                var flag = flags[tiles[i]];

                if (this._hasFlag(x, y, starTag)) {

                        return true;

                } else if (this._hasFlag(x, y, topTag)) {

                        var j = 1;

                        while (y - j >= 0 && this._hasFlag(x, y - j, topTag)) {

                                upperTop++;

                                j++;

                        }

                        j = 1;

                        while (y + j < mapHeight && this._hasFlag(x, y + j, topTag)) {

                                lowerTop++;

                                j++;

                        }

                        while (y + j < mapHeight && this._hasFlag(x, y + j, frontTag)) {

                                lowerFront++;

                                j++;

                        }

                        if (lowerFront === 0) {

                                if (upperTop + 1 <= defWallHeight) {

                                        return true;

                                } else {

                                        return false;

                                }

                        } else if (upperTop + 1 <= lowerFront) {

                                return true;

                        } else {

                                return false;

                        }

                } else if (this._hasFlag(x, y, frontTag)) {

                        var j = 1;

                        while (y + j < mapHeight && this._hasFlag(x, y + j, frontTag)) {

                                lowerFront++;

                                j++;

                        }

                        j = 1;

                        while (y - j >= 0 && this._hasFlag(x, y - j, frontTag)) {

                                upperFront++;

                                j++;

                        }

                        while (y - j >= 0 && this._hasFlag(x, y - j, topTag)) {

                                upperTop++;

                                j++;

                        }

                        if (upperTop === 0) {

                                if (lowerFront + 1 <= defWallThickness) {

                                        return false;

                                } else {

                                        return true;

                                }

                        } else if (lowerFront + 1 <= upperTop) {

                                return false;

                        } else {

                                return true;

                        }

                }

        }

        return AndrewX.WP.checkPassage.call(this, x, y, bit);

};

