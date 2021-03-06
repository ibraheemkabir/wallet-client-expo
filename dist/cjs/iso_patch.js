"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const eccryptoJS = tslib_1.__importStar(require("eccrypto-js"));
const crypto_js_1 = tslib_1.__importDefault(require("crypto-js"));
const utils_1 = require("@walletconnect/utils");
function toBuffer(wa) {
    return Buffer.from(wa.toString(crypto_js_1.default.enc.Hex), 'hex');
}
function randomBytes(length) {
    return new Promise((resolve, reject) => {
        const random = toBuffer(crypto_js_1.default.lib.WordArray.random(length));
        resolve(random);
    });
}
exports.randomBytes = randomBytes;
function generateKey(length) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const _length = (length || 256) / 8;
        const buffer = yield randomBytes(_length);
        const result = utils_1.convertBufferToArrayBuffer(buffer);
        return result;
    });
}
exports.generateKey = generateKey;
function verifyHmac(payload, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const cipherText = utils_1.convertHexToBuffer(payload.data);
        const iv = utils_1.convertHexToBuffer(payload.iv);
        const hmac = utils_1.convertHexToBuffer(payload.hmac);
        const hmacHex = utils_1.convertBufferToHex(hmac, true);
        const unsigned = utils_1.concatBuffers(cipherText, iv);
        const chmac = yield eccryptoJS.hmacSha256Sign(key, unsigned);
        const chmacHex = utils_1.convertBufferToHex(chmac, true);
        if (utils_1.removeHexPrefix(hmacHex) === utils_1.removeHexPrefix(chmacHex)) {
            return true;
        }
        return false;
    });
}
exports.verifyHmac = verifyHmac;
function encrypt(data, key, providedIv) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const _key = utils_1.convertArrayBufferToBuffer(key);
        const ivArrayBuffer = providedIv || (yield generateKey(128));
        const iv = utils_1.convertArrayBufferToBuffer(ivArrayBuffer);
        const ivHex = utils_1.convertBufferToHex(iv, true);
        const contentString = JSON.stringify(data);
        const content = utils_1.convertUtf8ToBuffer(contentString);
        const cipherText = yield eccryptoJS.aesCbcEncrypt(iv, _key, content);
        const cipherTextHex = utils_1.convertBufferToHex(cipherText, true);
        const unsigned = utils_1.concatBuffers(cipherText, iv);
        const hmac = yield eccryptoJS.hmacSha256Sign(_key, unsigned);
        const hmacHex = utils_1.convertBufferToHex(hmac, true);
        return {
            data: cipherTextHex,
            hmac: hmacHex,
            iv: ivHex,
        };
    });
}
exports.encrypt = encrypt;
function decrypt(payload, key) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const _key = utils_1.convertArrayBufferToBuffer(key);
        if (!_key) {
            throw new Error("Missing key: required for decryption");
        }
        const verified = yield verifyHmac(payload, _key);
        if (!verified) {
            return null;
        }
        const cipherText = utils_1.convertHexToBuffer(payload.data);
        const iv = utils_1.convertHexToBuffer(payload.iv);
        const buffer = yield eccryptoJS.aesCbcDecrypt(iv, _key, cipherText);
        const utf8 = utils_1.convertBufferToUtf8(buffer);
        let data;
        try {
            data = JSON.parse(utf8);
        }
        catch (error) {
            return null;
        }
        return data;
    });
}
exports.decrypt = decrypt;
//# sourceMappingURL=iso_patch.js.map