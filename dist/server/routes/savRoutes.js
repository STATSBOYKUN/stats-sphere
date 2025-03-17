"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const savController_1 = require("../controllers/savController");
const router = (0, express_1.Router)();
router.post('/upload', savController_1.uploadSavFile);
router.post('/create', savController_1.createSavFile);
exports.default = router;
//# sourceMappingURL=savRoutes.js.map