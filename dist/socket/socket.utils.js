"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitSocketEvent = void 0;
const emitSocketEvent = (req, roomId, event, data) => {
    req.app.get("io")
        .in(roomId)
        .emit(event, data);
};
exports.emitSocketEvent = emitSocketEvent;
