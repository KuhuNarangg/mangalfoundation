"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = __importDefault(require("./src/lib/mongodb"));
var Category_1 = __importDefault(require("./src/models/Category"));
var Package_1 = __importDefault(require("./src/models/Package"));
var categories_1 = require("./src/data/categories");
function sync() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, CATEGORIES_1, cat, dbCat, _a, _b, pkg, dbPkg, envCat;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log("Connecting to database...");
                    return [4 /*yield*/, (0, mongodb_1.default)()];
                case 1:
                    _c.sent();
                    console.log("Connected.");
                    console.log("Processing categories...");
                    _i = 0, CATEGORIES_1 = categories_1.CATEGORIES;
                    _c.label = 2;
                case 2:
                    if (!(_i < CATEGORIES_1.length)) return [3 /*break*/, 15];
                    cat = CATEGORIES_1[_i];
                    console.log("Upserting category: ".concat(cat.title));
                    return [4 /*yield*/, Category_1.default.findOne({ title: cat.title })];
                case 3:
                    dbCat = _c.sent();
                    if (!!dbCat) return [3 /*break*/, 5];
                    dbCat = new Category_1.default({
                        title: cat.title,
                        slug: cat.slug,
                        description: cat.description,
                        image: cat.image,
                        isActive: true,
                    });
                    return [4 /*yield*/, dbCat.save()];
                case 4:
                    _c.sent();
                    console.log("  -> Created ".concat(cat.title));
                    return [3 /*break*/, 7];
                case 5:
                    dbCat.description = cat.description;
                    dbCat.image = cat.image;
                    dbCat.isActive = true;
                    return [4 /*yield*/, dbCat.save()];
                case 6:
                    _c.sent();
                    console.log("  -> Updated ".concat(cat.title));
                    _c.label = 7;
                case 7:
                    _a = 0, _b = cat.packages;
                    _c.label = 8;
                case 8:
                    if (!(_a < _b.length)) return [3 /*break*/, 14];
                    pkg = _b[_a];
                    return [4 /*yield*/, Package_1.default.findOne({ title: pkg.title, categoryId: dbCat._id })];
                case 9:
                    dbPkg = _c.sent();
                    if (!!dbPkg) return [3 /*break*/, 11];
                    dbPkg = new Package_1.default({
                        title: pkg.title,
                        description: pkg.description,
                        amount: pkg.amount,
                        categoryId: dbCat._id,
                        isActive: true,
                    });
                    return [4 /*yield*/, dbPkg.save()];
                case 10:
                    _c.sent();
                    console.log("    -> Created Package ".concat(pkg.title));
                    return [3 /*break*/, 13];
                case 11:
                    dbPkg.description = pkg.description;
                    dbPkg.amount = pkg.amount;
                    dbPkg.isActive = true;
                    return [4 /*yield*/, dbPkg.save()];
                case 12:
                    _c.sent();
                    console.log("    -> Updated Package ".concat(pkg.title));
                    _c.label = 13;
                case 13:
                    _a++;
                    return [3 /*break*/, 8];
                case 14:
                    _i++;
                    return [3 /*break*/, 2];
                case 15:
                    console.log("Deactivating Environment category...");
                    return [4 /*yield*/, Category_1.default.findOne({ title: "Environment" })];
                case 16:
                    envCat = _c.sent();
                    if (!envCat) return [3 /*break*/, 18];
                    envCat.isActive = false;
                    return [4 /*yield*/, envCat.save()];
                case 17:
                    _c.sent();
                    console.log("  -> Environment category deactivated.");
                    _c.label = 18;
                case 18:
                    console.log("Sync complete.");
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
sync().catch(console.error);
